import { create } from "zustand";
import { persist } from "zustand/middleware";
import { analyzeDescriptor } from "@/lib/bitcoind/analyze";
import { diagnoseNode, type DiagReport } from "@/lib/bitcoind/diagnose";
import { corsBlocked } from "@/lib/bitcoind/bridge";
import {
  normalizeRpcUrl,
  probeNode,
  validateOnNode,
  type NodeProbe,
  type NodeValidateResult,
} from "@/lib/bitcoind/rpc";

export interface NodeCheck extends NodeValidateResult {
  source: "demo" | "core";
}

interface BitcoindState {
  url: string;
  username: string;
  password: string;
  kind: "core" | "startos";
  demo: boolean;
  open: boolean;
  status: "idle" | "connecting" | "ready" | "error";
  bridge: "off" | "needed" | "on";
  probe: NodeProbe | null;
  trace: DiagReport | null;
  lastCheck: NodeCheck | null;
  error: string | null;
  setOpen: (open: boolean) => void;
  patch: (p: Partial<Pick<BitcoindState, "url" | "username" | "password" | "kind">>) => void;
  connectDemo: () => void;
  connectLive: (network?: "mainnet" | "testnet") => Promise<void>;
  finishBridge: () => Promise<void>;
  disconnect: () => void;
  validate: (descriptor: string, network?: "mainnet" | "testnet") => Promise<void>;
}

const DEMO_PROBE: NodeProbe = {
  subversion: "/Scriptwerk-demo:28.0.0/",
  version: 280000,
  chain: "demo",
  blocks: 0,
};

export const useBitcoind = create<BitcoindState>()(
  persist(
    (set, get) => ({
      url: "127.0.0.1",
      username: "",
      password: "",
      kind: "core",
      demo: false,
      open: false,
      status: "idle",
      bridge: "off",
      probe: null,
      trace: null,
      lastCheck: null,
      error: null,
      setOpen: (open) => set({ open }),
      patch: (p) => set(p),
      connectDemo: () =>
        set({
          demo: true,
          status: "ready",
          probe: DEMO_PROBE,
          error: null,
          trace: null,
          bridge: "off",
        }),
      connectLive: async (network = "mainnet") => {
        const { url, username, password } = get();
        set({ status: "connecting", error: null, demo: false, lastCheck: null, trace: null, bridge: "off" });
        const report = await diagnoseNode({ url, username, password }, network);
        if (report.ok && report.probe) {
          set({ status: "ready", probe: report.probe, demo: false, error: null, trace: report, bridge: "off" });
          return;
        }
        if (corsBlocked(report)) {
          set({
            status: "error",
            probe: null,
            trace: report,
            bridge: "needed",
            error: "node.err.cors",
          });
          return;
        }
        const failed = [...report.steps].reverse().find((s) => s.status === "fail");
        set({
          status: "error",
          probe: null,
          trace: report,
          bridge: "off",
          error: failed ? `${failed.id}: ${failed.detail}` : "node.err.blocked",
        });
      },
      finishBridge: async () => {
        const { url, username, password } = get();
        set({ bridge: "on", error: null });
        try {
          const probe = await probeNode({ url: normalizeRpcUrl(url), username, password });
          set({ status: "ready", probe, demo: false, error: null, bridge: "on" });
        } catch (e) {
          set({
            status: "error",
            error: e instanceof Error ? e.message : "node.err.blocked",
            bridge: "on",
          });
        }
      },
      disconnect: () => {
        void import("@/lib/bitcoind/bridge").then((m) => m.dropBridge());
        set({
          demo: false,
          status: "idle",
          probe: null,
          lastCheck: null,
          error: null,
          trace: null,
          bridge: "off",
        });
      },
      validate: async (descriptor, network = "mainnet") => {
        const { demo, status, url, username, password } = get();
        if (status !== "ready") {
          set({ error: "node.err.notConnected", lastCheck: null });
          return;
        }
        if (demo) {
          const local = analyzeDescriptor(descriptor);
          if (!local.ok || !local.info) {
            set({ error: local.error || "node.err.invalid", lastCheck: null });
            return;
          }
          set({
            error: null,
            lastCheck: { ...local.info, addresses: [], source: "demo" },
          });
          return;
        }
        set({ error: null });
        try {
          const result = await validateOnNode(
            { url: normalizeRpcUrl(url, network), username, password },
            descriptor,
          );
          set({ lastCheck: { ...result, source: "core" }, error: null });
        } catch (e) {
          set({
            lastCheck: null,
            error: e instanceof Error ? e.message : "node.err.invalid",
          });
        }
      },
    }),
    {
      name: "scriptwerk-bitcoind-v2",
      partialize: (s) => ({
        url: s.url,
        username: s.username,
        password: s.password,
        kind: s.kind,
      }),
    },
  ),
);
