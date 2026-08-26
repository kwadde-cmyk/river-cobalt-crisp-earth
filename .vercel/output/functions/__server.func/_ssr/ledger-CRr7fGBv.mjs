import { i as __toESM } from "../_runtime.mjs";
import { a as normalizeHwPath, i as ledgerPolicyReady, n as formatOrigin, o as pathToDerivation, r as hwErrorMessage } from "./routes-CFFPInQH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ledger-CRr7fGBv.js
async function ensureBuffer() {
	const g = globalThis;
	if (g.Buffer) return;
	const { Buffer } = await import("buffer");
	g.Buffer = Buffer;
}
function flipCoinType(path) {
	const p = normalizeHwPath(path);
	if (p.includes("/48'/0'/")) return p.replace("/48'/0'/", "/48'/1'/");
	if (p.includes("/48'/1'/")) return p.replace("/48'/1'/", "/48'/0'/");
	return p;
}
async function openLedgerSession() {
	await ensureBuffer();
	const { default: TransportWebHID } = await import("../_libs/_2.mjs");
	const { AppClient, WalletPolicy } = await import("../_libs/_4.mjs").then((m) => /* @__PURE__ */ __toESM(m.default));
	const transport = await TransportWebHID.create();
	const app = new AppClient(transport);
	let info = null;
	try {
		info = await app.getAppAndVersion();
	} catch {}
	const appName = (info?.name || "").toLowerCase();
	if (appName && !/bitcoin/i.test(appName)) {
		await transport.close().catch(() => void 0);
		throw new Error("hw.err.app");
	}
	const fingerprint = String(await app.getMasterFingerprint()).toLowerCase();
	const label = info?.name ? `Ledger · ${info.name} ${info.version}` : "Ledger";
	async function pubkey(path) {
		const primary = normalizeHwPath(path);
		try {
			return await app.getExtendedPubkey(primary, true);
		} catch (err) {
			const msg = String(err?.message || err);
			if (!/0x6a82/i.test(msg)) throw err;
			const flipped = flipCoinType(primary);
			if (flipped !== primary) return await app.getExtendedPubkey(flipped, true);
			throw err;
		}
	}
	return {
		kind: "ledger",
		demo: false,
		label,
		fingerprint,
		product: info?.name || "Bitcoin",
		async getXpub(path) {
			try {
				const p = normalizeHwPath(path);
				const xpub = await pubkey(p);
				return {
					xpub,
					fingerprint,
					derivation: pathToDerivation(p),
					origin: formatOrigin(fingerprint, p, xpub)
				};
			} catch (err) {
				throw new Error(hwErrorMessage(err));
			}
		},
		async registerPolicy(policy) {
			try {
				const ready = ledgerPolicyReady(policy);
				if (!ready.ok) throw new Error(ready.error);
				const keys = ready.policy.keys.map((k) => k.origin);
				const wp = new WalletPolicy(ready.policy.name, ready.policy.template, keys);
				const [, hmac] = await app.registerWallet(wp);
				return { hmac: Buffer.from(hmac).toString("hex") };
			} catch (err) {
				throw new Error(hwErrorMessage(err));
			}
		},
		async close() {
			try {
				await transport.close();
			} catch {}
		}
	};
}
//#endregion
export { openLedgerSession };
