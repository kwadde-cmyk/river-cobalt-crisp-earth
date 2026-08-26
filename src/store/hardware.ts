import { create } from "zustand";
import type { Bip388Policy } from "@/lib/miniscript/bip388";
import {
  defaultAccountPath,
  detectHid,
  hwErrorMessage,
  openDemoSession,
  type HidSupport,
  type HwKind,
  type HwSession,
  type HwXpub,
} from "@/lib/hw";
import { useStudio } from "@/store/studio";

export type HwStatus = "idle" | "picking" | "connecting" | "pairing" | "ready" | "busy" | "error";

interface HardwareState {
  open: boolean;
  status: HwStatus;
  kind: HwKind | null;
  demo: boolean;
  label: string;
  fingerprint: string;
  product: string;
  pairingCode: string | null;
  error: string | null;
  pendingKeyId: string | null;
  hid: HidSupport;
  lastHmac: string | null;
  session: HwSession | null;
  setOpen: (open: boolean) => void;
  setPendingKey: (id: string | null) => void;
  connect: (kind: HwKind, demo?: boolean) => Promise<void>;
  disconnect: () => Promise<void>;
  fetchXpub: (path?: string, display?: boolean) => Promise<HwXpub>;
  fillKey: (keyId: string, path?: string) => Promise<void>;
  fillEmptyKeys: () => Promise<number>;
  registerPolicy: (policy: Bip388Policy) => Promise<void>;
}

function refreshHid(): HidSupport {
  return detectHid();
}

export const useHardware = create<HardwareState>((set, get) => ({
  open: false,
  status: "idle",
  kind: null,
  demo: false,
  label: "",
  fingerprint: "",
  product: "",
  pairingCode: null,
  error: null,
  pendingKeyId: null,
  hid: "missing",
  lastHmac: null,
  session: null,

  setOpen: (open) => {
    set({ open, hid: refreshHid(), error: open ? get().error : null });
  },
  setPendingKey: (id) => set({ pendingKeyId: id }),

  connect: async (kind, demo = false) => {
    const prev = get().session;
    if (prev) await prev.close().catch(() => undefined);
    set({
      status: demo ? "connecting" : "picking",
      kind,
      demo,
      error: null,
      pairingCode: null,
      session: null,
      hid: refreshHid(),
    });
    try {
      const session = demo
        ? openDemoSession(kind)
        : kind === "ledger"
          ? await (await import("@/lib/hw/ledger")).openLedgerSession()
          : await (
              await import("@/lib/hw/bitbox")
            ).openBitBoxSession(
              (code) => set({ pairingCode: code, status: code ? "pairing" : "connecting" }),
              () => {
                const cur = get();
                if (cur.kind === "bitbox" && !cur.demo) {
                  set({
                    status: "idle",
                    session: null,
                    fingerprint: "",
                    label: "",
                    pairingCode: null,
                  });
                }
              },
            );
      if (demo && kind === "bitbox") {
        set({ status: "pairing", pairingCode: "K7T9", session: null });
        await new Promise((r) => setTimeout(r, 700));
      }
      set({
        status: "ready",
        session,
        kind: session.kind,
        demo: session.demo,
        label: session.label,
        fingerprint: session.fingerprint,
        product: session.product,
        pairingCode: null,
        error: null,
      });
    } catch (err) {
      set({
        status: "error",
        session: null,
        pairingCode: null,
        error: hwErrorMessage(err),
      });
      throw err;
    }
  },

  disconnect: async () => {
    const session = get().session;
    set({
      status: "idle",
      session: null,
      kind: null,
      demo: false,
      label: "",
      fingerprint: "",
      product: "",
      pairingCode: null,
      error: null,
      lastHmac: null,
    });
    if (session) await session.close().catch(() => undefined);
  },

  fetchXpub: async (path, display = true) => {
    const session = get().session;
    if (!session) throw new Error("hw.err.notConnected");
    const network = useStudio.getState().network;
    const p = path || defaultAccountPath(network);
    set({ status: "busy", error: null });
    try {
      const result = await session.getXpub(p, display);
      set({ status: "ready" });
      return result;
    } catch (err) {
      const message = hwErrorMessage(err);
      set({ status: "error", error: message });
      throw err;
    }
  },

  fillKey: async (keyId, path) => {
    const key = useStudio.getState().keys.find((k) => k.id === keyId);
    const network = useStudio.getState().network;
    const derivation = path || (key?.derivation ? `m/${key.derivation.replace(/^m\//, "")}` : defaultAccountPath(network));
    const xpub = await get().fetchXpub(derivation, true);
    const err = useStudio.getState().importKeyText(keyId, xpub.origin);
    if (err) throw new Error(err);
    const session = get().session;
    if (session && key && !key.note.trim()) {
      useStudio.getState().updateKey(keyId, { note: session.kind === "ledger" ? "Ledger" : "BitBox" });
    }
  },

  fillEmptyKeys: async () => {
    const { keys, network } = useStudio.getState();
    const empty = keys.filter((k) => !k.xpub.trim());
    let n = 0;
    for (let i = 0; i < empty.length; i++) {
      const key = empty[i]!;
      const path = key.derivation?.trim()
        ? `m/${key.derivation.replace(/^m\//, "")}`
        : defaultAccountPath(network, i);
      await get().fillKey(key.id, path);
      n++;
    }
    return n;
  },

  registerPolicy: async (policy) => {
    const session = get().session;
    if (!session) throw new Error("hw.err.notConnected");
    set({ status: "busy", error: null });
    try {
      const result = await session.registerPolicy(policy);
      set({ status: "ready", lastHmac: result.hmac ?? "ok" });
    } catch (err) {
      const message = hwErrorMessage(err);
      set({ status: "error", error: message });
      throw err;
    }
  },
}));
