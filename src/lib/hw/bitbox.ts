import type { Bip388Policy } from "@/lib/miniscript/bip388";
import { formatOrigin, hwErrorMessage, normalizeHwPath, pathToDerivation, type HwSession } from "./types.ts";

type BitboxMod = typeof import("bitbox-api");
type Paired = InstanceType<BitboxMod["PairedBitBox"]>;

function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 30);
}

export async function openBitBoxSession(
  onPairing: (code: string | null) => void,
  onClose: () => void,
): Promise<HwSession> {
  const bitbox: BitboxMod = await import("bitbox-api");
  const unpaired = await bitbox.bitbox02ConnectWebHID(onClose);
  const pairing = await unpaired.unlockAndPair();
  const code = pairing.getPairingCode();
  onPairing(code ?? null);
  const device: Paired = await pairing.waitConfirm();
  onPairing(null);

  const fp = (await device.rootFingerprint()).toLowerCase();
  const product = device.product();
  const version = device.version();
  const label = `BitBox02 · ${version}`;

  return {
    kind: "bitbox",
    demo: false,
    label,
    fingerprint: fp,
    product,
    async getXpub(path: string, display = false) {
      try {
        const p = normalizeHwPath(path);
        const xpub = await device.btcXpub("btc", p, "xpub", display);
        return {
          xpub,
          fingerprint: fp,
          derivation: pathToDerivation(p),
          origin: formatOrigin(fp, p, xpub),
        };
      } catch (err) {
        throw new Error(hwErrorMessage(err));
      }
    },
    async registerPolicy(policy: Bip388Policy) {
      try {
        const keys = policy.keys
          .filter((k) => k.xpub)
          .map((k) => ({
            rootFingerprint: k.fingerprint,
            keypath: k.derivation ? `m/${k.derivation.replace(/^m\//, "")}` : undefined,
            xpub: k.xpub,
          }));
        if (!keys.length) throw new Error("hw.err.needKeys");
        await device.btcRegisterScriptConfig(
          "btc",
          { policy: { policy: policy.template, keys } },
          undefined,
          "autoXpubTpub",
          sanitizeName(policy.name) || "Scriptwerk",
        );
        return {};
      } catch (err) {
        throw new Error(hwErrorMessage(err));
      }
    },
    async close() {
      try {
        device.close();
      } catch {
        /* already gone */
      }
    },
  };
}
