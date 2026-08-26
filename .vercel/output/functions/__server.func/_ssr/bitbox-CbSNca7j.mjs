import { a as normalizeHwPath, n as formatOrigin, o as pathToDerivation, r as hwErrorMessage } from "./routes-CFFPInQH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bitbox-CbSNca7j.js
function sanitizeName(name) {
	return name.trim().replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").slice(0, 30);
}
async function openBitBoxSession(onPairing, onClose) {
	const pairing = await (await (await import("../_libs/_3.mjs")).bitbox02ConnectWebHID(onClose)).unlockAndPair();
	onPairing(pairing.getPairingCode() ?? null);
	const device = await pairing.waitConfirm();
	onPairing(null);
	const fp = (await device.rootFingerprint()).toLowerCase();
	const product = device.product();
	return {
		kind: "bitbox",
		demo: false,
		label: `BitBox02 · ${device.version()}`,
		fingerprint: fp,
		product,
		async getXpub(path, display = false) {
			try {
				const p = normalizeHwPath(path);
				const xpub = await device.btcXpub("btc", p, "xpub", display);
				return {
					xpub,
					fingerprint: fp,
					derivation: pathToDerivation(p),
					origin: formatOrigin(fp, p, xpub)
				};
			} catch (err) {
				throw new Error(hwErrorMessage(err));
			}
		},
		async registerPolicy(policy) {
			try {
				const keys = policy.keys.filter((k) => k.xpub).map((k) => ({
					rootFingerprint: k.fingerprint,
					keypath: k.derivation ? `m/${k.derivation.replace(/^m\//, "")}` : void 0,
					xpub: k.xpub
				}));
				if (!keys.length) throw new Error("hw.err.needKeys");
				await device.btcRegisterScriptConfig("btc", { policy: {
					policy: policy.template,
					keys
				} }, void 0, "autoXpubTpub", sanitizeName(policy.name) || "Scriptwerk");
				return {};
			} catch (err) {
				throw new Error(hwErrorMessage(err));
			}
		},
		async close() {
			try {
				device.close();
			} catch {}
		}
	};
}
//#endregion
export { openBitBoxSession };
