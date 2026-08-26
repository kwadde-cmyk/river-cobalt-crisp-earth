import type { Bip388Policy } from "@/lib/miniscript/bip388";
import { ledgerPolicyReady } from "@/lib/miniscript/bip388";
import { formatOrigin, hwErrorMessage, normalizeHwPath, pathToDerivation, type HwSession } from "./types.ts";

async function ensureBuffer() {
  const g = globalThis as unknown as { Buffer?: unknown };
  if (g.Buffer) return;
  const { Buffer } = await import("buffer");
  g.Buffer = Buffer;
}

function flipCoinType(path: string): string {
  const p = normalizeHwPath(path);
  if (p.includes("/48'/0'/")) return p.replace("/48'/0'/", "/48'/1'/");
  if (p.includes("/48'/1'/")) return p.replace("/48'/1'/", "/48'/0'/");
  return p;
}

export async function openLedgerSession(): Promise<HwSession> {
  await ensureBuffer();
  const { default: TransportWebHID } = await import("@ledgerhq/hw-transport-webhid");
  const { AppClient, WalletPolicy } = await import("ledger-bitcoin");
  const transport = await TransportWebHID.create();
  const app = new AppClient(transport);
  let info: { name: string; version: string } | null = null;
  try {
    info = await app.getAppAndVersion();
  } catch {
    /* older app */
  }
  const appName = (info?.name || "").toLowerCase();
  if (appName && !/bitcoin/i.test(appName)) {
    await transport.close().catch(() => undefined);
    throw new Error("hw.err.app");
  }
  const fingerprint = String(await app.getMasterFingerprint()).toLowerCase();
  const label = info?.name ? `Ledger · ${info.name} ${info.version}` : "Ledger";

  async function pubkey(path: string): Promise<string> {
    const primary = normalizeHwPath(path);
    try {
      return await app.getExtendedPubkey(primary, true);
    } catch (err) {
      const msg = String((err as { message?: string })?.message || err);
      if (!/0x6a82/i.test(msg)) throw err;
      const flipped = flipCoinType(primary);
      if (flipped !== primary) {
        return await app.getExtendedPubkey(flipped, true);
      }
      throw err;
    }
  }

  return {
    kind: "ledger",
    demo: false,
    label,
    fingerprint,
    product: info?.name || "Bitcoin",
    async getXpub(path: string) {
      try {
        const p = normalizeHwPath(path);
        const xpub = await pubkey(p);
        return {
          xpub,
          fingerprint,
          derivation: pathToDerivation(p),
          origin: formatOrigin(fingerprint, p, xpub),
        };
      } catch (err) {
        throw new Error(hwErrorMessage(err));
      }
    },
    async registerPolicy(policy: Bip388Policy) {
      try {
        const ready = ledgerPolicyReady(policy);
        if (!ready.ok) throw new Error(ready.error);
        const keys = ready.policy.keys.map((k) => k.origin);
        const wp = new WalletPolicy(ready.policy.name, ready.policy.template, keys);
        const [, hmac] = await app.registerWallet(wp);
        const hex = Buffer.from(hmac).toString("hex");
        return { hmac: hex };
      } catch (err) {
        throw new Error(hwErrorMessage(err));
      }
    },
    async close() {
      try {
        await transport.close();
      } catch {
        /* already gone */
      }
    },
  };
}