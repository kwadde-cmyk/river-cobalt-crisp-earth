import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { _ as Check, c as QrCode, d as Maximize2, f as ImageUp, g as Copy, h as Download, i as Undo2, l as Plus, m as FolderOpen, n as Usb, o as Trash2, p as GitBranch, r as Upload, s as RotateCcw, t as X, u as Minus, v as Camera } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
import { t as require_jsQR } from "../_libs/jsqr.mjs";
import { a as Trigger$1, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CFFPInQH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
var import_jsQR = /* @__PURE__ */ __toESM(require_jsQR());
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function detectHid() {
	if (typeof navigator === "undefined" || !("hid" in navigator) || !navigator.hid) return "missing";
	try {
		if (window.self !== window.top) return "iframe";
	} catch {
		return "iframe";
	}
	return "ok";
}
function defaultAccountPath(network, account = 0) {
	return `m/48'/${network === "testnet" ? "1'" : "0'"}/${account}'/2'`;
}
function normalizeHwPath(path) {
	const p = path.trim().replace(/h/gi, "'");
	if (!p) return "m/48'/0'/0'/2'";
	return p.startsWith("m/") ? p : `m/${p.replace(/^\//, "")}`;
}
function pathToDerivation(path) {
	return normalizeHwPath(path).replace(/^m\//, "");
}
function formatOrigin(fingerprint, path, xpub) {
	return `[${fingerprint.replace(/^#/, "").slice(0, 8).toLowerCase()}/${pathToDerivation(path)}]${xpub}`;
}
function hwErrorMessage(err) {
	if (!err) return "Unbekanntes Gerät-Fehler.";
	if (typeof err === "string") return err;
	const e = err;
	const msg = e.message || "";
	if (/NotFoundError|No device selected/i.test(msg)) return "hw.err.none";
	if (/NotAllowedError|denied|permission/i.test(msg)) return "hw.err.denied";
	if (/iframe|SecurityError/i.test(msg)) return "hw.err.iframe";
	if (/user abort|cancelled|0x6985|denied by the user/i.test(msg)) return "hw.err.abort";
	if (/0x6a82|FILE_NOT_FOUND/i.test(msg) || e.statusCode === 27266) return "hw.err.6a82";
	if (/locked|pin/i.test(msg)) return "hw.err.locked";
	if (/Bitcoin|wrong app|ins not supported|0x6d00/i.test(msg)) return "hw.err.app";
	if (/HID|WebHID|unsupported/i.test(msg)) return "hw.err.hid";
	return msg || "hw.err.generic";
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "n") {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function hole(hint) {
	return {
		id: uid(),
		kind: "hole",
		hint
	};
}
function visit(node, fn) {
	fn(node);
	switch (node.kind) {
		case "thresh":
			node.children.forEach((c) => visit(c, fn));
			break;
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b":
			visit(node.left, fn);
			visit(node.right, fn);
			break;
		case "andor":
			visit(node.x, fn);
			visit(node.y, fn);
			visit(node.z, fn);
			break;
		case "wrap": visit(node.child, fn);
	}
}
function findNode(root, id) {
	let found = null;
	visit(root, (n) => {
		if (n.id === id) found = n;
	});
	return found;
}
function mapNode(root, id, mapper) {
	if (root.id === id) return mapper(root);
	switch (root.kind) {
		case "thresh": return {
			...root,
			children: root.children.map((c) => mapNode(c, id, mapper))
		};
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return {
			...root,
			left: mapNode(root.left, id, mapper),
			right: mapNode(root.right, id, mapper)
		};
		case "andor": return {
			...root,
			x: mapNode(root.x, id, mapper),
			y: mapNode(root.y, id, mapper),
			z: mapNode(root.z, id, mapper)
		};
		case "wrap": return {
			...root,
			child: mapNode(root.child, id, mapper)
		};
		default: return root;
	}
}
function mapKeyStrings(node, fn) {
	switch (node.kind) {
		case "pk":
		case "pkh": return {
			...node,
			key: fn(node.key)
		};
		case "multi": return {
			...node,
			keys: node.keys.map(fn)
		};
		case "thresh": return {
			...node,
			children: node.children.map((c) => mapKeyStrings(c, fn))
		};
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return {
			...node,
			left: mapKeyStrings(node.left, fn),
			right: mapKeyStrings(node.right, fn)
		};
		case "andor": return {
			...node,
			x: mapKeyStrings(node.x, fn),
			y: mapKeyStrings(node.y, fn),
			z: mapKeyStrings(node.z, fn)
		};
		case "wrap": return {
			...node,
			child: mapKeyStrings(node.child, fn)
		};
		default: return node;
	}
}
function collectKeys(root) {
	const set = /* @__PURE__ */ new Set();
	visit(root, (n) => {
		if (n.kind === "pk" || n.kind === "pkh") set.add(n.key);
		if (n.kind === "multi") n.keys.forEach((k) => set.add(k));
	});
	return [...set];
}
function hasHoles(root) {
	let holes = false;
	visit(root, (n) => {
		if (n.kind === "hole") holes = true;
	});
	return holes;
}
function coreOf(node) {
	let cur = node;
	while (cur.kind === "wrap") cur = cur.child;
	return cur;
}
function isLocale(v) {
	return v === "de" || v === "en";
}
var de = {
	"header.import": "Import",
	"header.export": "Export",
	"header.reset": "Neu",
	"header.usb": "USB",
	"header.language": "Sprache",
	"tabs.stages": "Stufen",
	"tabs.ops": "Operatoren",
	"tabs.tree": "Baum",
	"tabs.read": "Lesart",
	"stages.title": "Stufen",
	"stages.blurb": "Pro Stufe: wie viele Keys, welche Schwelle, welcher Timelock. Material in der Mitte.",
	"stages.empty": "Policy kommt aus Import oder Operatoren. Neue Stufen ersetzen den Baum.",
	"stages.addLocked": "Stufe mit Timelock",
	"stages.add": "Stufen anlegen",
	"stages.n": "Stufe {n}",
	"stages.remove": "Stufe entfernen",
	"stages.keys": "Keys",
	"stages.threshold": "Schwelle k",
	"stages.inStage": "In dieser Stufe",
	"stages.timelock": "Timelock",
	"stages.dec": "{label} verringern",
	"stages.inc": "{label} erhöhen",
	"keys.title": "Schlüssel",
	"keys.blurb": "Name, sonst Fingerprint, sonst A B C. Antippen öffnet den Baum.",
	"keys.reuseOn": "Reuse an",
	"keys.reuseOff": "Reuse aus",
	"keys.empty": "Keine Keys. Links Stufen anlegen.",
	"keys.importHint": "xpub oder QR — nochmal antippen für Import.",
	"keys.tapDetails": "Noch einmal antippen für Details und Childkeys.",
	"keys.dialogBlurb": "Zuerst Master, dann Childkeys. Details gelten für die gewählte Ebene.",
	"keys.taken": "Schlüssel {name} übernommen",
	"keys.childTaken": "Childkey übernommen",
	"keys.cleared": "Material entfernt",
	"keys.clear": "Leeren",
	"keys.apply": "Übernehmen",
	"keys.childApply": "Child übernehmen",
	"keys.childRemove": "Child entfernen",
	"keys.childNeedParent": "Zuerst den Master-xpub einlesen.",
	"keys.childHelp": "Gleicher Fingerprint, anderer Account (48'/0'/1'/2') oder Pfad 0/0 unter dem Master.",
	"keys.childPath": "Child-Pfad ab xpub",
	"keys.noMaterial": "Noch kein Material — Tab Master.",
	"keys.details": "Details",
	"keys.children": "Childkeys",
	"keys.master": "Master",
	"keys.detailOf": "Bezieht sich auf",
	"keys.reuseNeed": "Reuse aus: jeder Slot braucht einen eigenen Account desselben Fingerprints. Master ist 48'/0'/0'/2'.",
	"keys.nextAccount": "Nächster Account: {path}",
	"keys.needChild": "{alias}",
	"keys.missing": "fehlt",
	"keys.present": "da",
	"keys.applyReplace": "Ersetzen",
	"keys.draftHint": "Noch nicht gespeichert — Übernehmen sichert.",
	"keys.detailsApply": "Änderungen übernehmen",
	"keys.name": "Name",
	"keys.fp": "Fingerprint",
	"keys.bip32": "BIP32-Pfad",
	"ops.title": "Operatoren",
	"ops.blurb": "Klick setzt den Baustein in den markierten Slot.",
	"ops.wrap": "Wrapper",
	"ops.wrapAria": "Wrapper {code}",
	"ops.key": "Schlüssel",
	"ops.keyOrder": "Keys (Reihenfolge zählt)",
	"ops.threshold": "Schwelle k",
	"ops.branches": "Anzahl Zweige",
	"ops.blocksCsv": "Blöcke (CSV)",
	"ops.heightCltv": "Blockhöhe (CLTV)",
	"ops.cancel": "Abbrechen",
	"ops.insert": "Einsetzen",
	"group.keys": "Schlüssel",
	"group.time": "Zeit",
	"group.and": "UND",
	"group.or": "ODER",
	"group.thresh": "Schwelle",
	"group.wrap": "Wrapper",
	"insp.empty": "Kein Knoten gewählt. Klicke im Baum auf einen Baustein.",
	"insp.hole": "leerer Slot",
	"insp.unwrap": "Wrapper ab",
	"insp.delete": "Entfernen",
	"insp.blocks": "Blöcke",
	"insp.height": "Höhe",
	"insp.keysCsv": "Keys, kommagetrennt",
	"insp.fill": "Wähle links einen Operator, um diesen Slot zu füllen.",
	"read.title": "Wallet-Lesart",
	"read.check": "Prüfung",
	"read.copy": "Kopieren",
	"read.copied": "Kopiert",
	"read.now": "sofort",
	"read.blocksShort": "{n} Bl.",
	"read.noPolicy": "Keine Policy",
	"graph.empty": "Leere Policy",
	"graph.emptyBlurb": "Links Stufen setzen. Keys in der Mitte einlesen — Fingerprint, Name und BIP32-Pfad sitzen auf der Karte.",
	"graph.aria": "Policy-Baum",
	"graph.fit": "Einpassen",
	"graph.zoomIn": "Vergrößern",
	"graph.zoomOut": "Verkleinern",
	"import.title": "Policy einlesen",
	"import.blurb": "QR, Miniscript, wsh-Descriptor, BSMS oder BIP-388 (Ledger/BitBox). Einzelne Keys in der Mitte auf der Karte.",
	"import.policy": "Policy",
	"import.read": "Einlesen",
	"import.loaded": "Policy geladen",
	"import.qrOk": "QR gelesen",
	"import.fail": "Import fehlgeschlagen.",
	"import.noXpubs": "Keine xpubs erkannt. Eine Zeile je Key, optional mit Namen davor.",
	"export.title": "Export",
	"export.blurb": "QR für Nunchuk, Liana, Specter, Ledger und BitBox. Dateien zusätzlich als Text.",
	"export.files": "Dateien",
	"export.ok": "Drei Dateien exportiert",
	"export.none": "Keine Policy zum Export.",
	"export.copy": "Kopieren",
	"export.ledger": "Ledger",
	"export.bitbox": "BitBox",
	"export.policyName": "Wallet-Name",
	"export.ledgerBlurb": "BIP-388 für die Bitcoin-App ab 2.1.0. In Liana, Sparrow oder Nunchuk auf dem Ledger registrieren.",
	"export.bitboxBlurb": "Miniscript-Policy für BitBox02 ab Firmware 9.15. In der BitBoxApp oder in Liana auf dem Gerät registrieren.",
	"export.template": "Descriptor-Template",
	"export.needXpub": "Noch ohne xpub: {names}",
	"export.needFp": "Ohne Fingerprint signiert das Gerät nicht: {names}",
	"export.register": "Dieses JSON auf dem Gerät registrieren — nicht den nackten Descriptor.",
	"export.copyJson": "JSON kopieren",
	"export.copyTemplate": "Template kopieren",
	"export.downloadDevice": "JSON-Datei",
	"export.okDevices": "Dateien inkl. Ledger und BitBox exportiert",
	"hw.title": "USB-Gerät",
	"hw.blurb": "Ledger oder BitBox per USB. xpub holen, Policy auf dem Gerät registrieren.",
	"hw.needChrome": "WebHID braucht Chrome oder Edge auf dem Desktop.",
	"hw.iframe": "Diese Vorschau blockiert USB oft. Demo nutzen, oder die App in einem eigenen Chrome-Tab.",
	"hw.ledgerHint": "Bitcoin-App ab 2.1.0 öffnen. Ledger Live schließen.",
	"hw.bitboxHint": "BitBox02 entsperren. Firmware ab 9.15 für Miniscript.",
	"hw.connectUsb": "USB verbinden",
	"hw.connectDemo": "Demo ohne Gerät",
	"hw.connected": "Gerät verbunden",
	"hw.demoOn": "Demo-Gerät aktiv",
	"hw.demo": "Demo",
	"hw.pairing": "Pairing-Code",
	"hw.pairingBlurb": "Denselben Code auf dem BitBox bestätigen.",
	"hw.waitLedger": "Ledger auswählen. Bitcoin-App muss offen sein.",
	"hw.waitBitbox": "BitBox auswählen, dann entsperren.",
	"hw.fetchKey": "xpub holen",
	"hw.fillEmpty": "Leere Keys füllen",
	"hw.register": "Policy registrieren",
	"hw.disconnect": "Trennen",
	"hw.registered": "Auf dem Gerät bestätigt",
	"hw.registerHint": "Das Gerät zeigt Template und Cosigner. HMAC merkt sich Scriptwerk.",
	"hw.pendingKey": "Ziel-Key {name}",
	"hw.filled": "{n} Keys vom Gerät",
	"hw.fromLedger": "Von Ledger",
	"hw.fromBitbox": "Von BitBox",
	"hw.err.none": "Kein Gerät gewählt.",
	"hw.err.denied": "USB-Zugriff abgelehnt.",
	"hw.err.iframe": "USB in diesem Fenster nicht erlaubt.",
	"hw.err.abort": "Am Gerät abgebrochen.",
	"hw.err.locked": "Gerät ist gesperrt.",
	"hw.err.app": "Bitcoin-App auf dem Ledger öffnen.",
	"hw.err.hid": "WebHID nicht verfügbar.",
	"hw.err.generic": "Gerät hat abgelehnt.",
	"hw.err.notConnected": "Kein Gerät verbunden.",
	"hw.err.needKeys": "Zuerst xpubs auf die Keys legen.",
	"hw.err.6a82": "Ledger 0x6a82: Bitcoin-App 2.1+ öffnen, Ledger Live schließen, Pfad m/48'/0'/0'/2' (Testnet 48'/1'). Policy-Keys vollständig.",
	"hw.err.template": "Ledger braucht ein wsh(…)-Template.",
	"qr.none": "Nichts zum Codieren.",
	"qr.long": "Text ist zu lang für einen QR. Datei exportieren.",
	"qr.building": "QR wird gebaut…",
	"qr.camOrPhoto": "Kamera oder QR-Foto.",
	"qr.camOff": "Kamera aus",
	"qr.cam": "Kamera",
	"qr.image": "Bild",
	"qr.noCode": "Kein QR im Bild erkannt.",
	"qr.badImage": "Bild konnte nicht gelesen werden.",
	"qr.noCam": "Kamera nicht verfügbar. QR-Bild hochladen.",
	"qr.alt": "QR-Code {label}",
	"delay.0": "Sofort",
	"delay.1": "1 Bl.",
	"delay.144": "1 Tag",
	"delay.1008": "1 Woche",
	"delay.4320": "1 Monat",
	"delay.52596": "1 Jahr",
	"delay.60000": "60k",
	"delay.65534": "Max",
	"delay.block": "1 Block",
	"time.now": "Sofort",
	"time.one": "Nach 1 Block · ≈ 10 Min",
	"time.after": "Nach {n} Blöcken · {approx}",
	"time.human": "{n} Blöcke · {approx}",
	"approx.min": "≈ 10 Min",
	"approx.hours": "≈ {n} Std",
	"approx.day": "≈ 1 Tag",
	"approx.days": "≈ {n} Tage",
	"approx.months": "≈ {n} Monate",
	"approx.years": "≈ {n} Jahre",
	"explain.none": "Keine Policy",
	"explain.allNow": "{n} sofortige Spendewege",
	"explain.allNowOne": "1 sofortiger Spendeweg",
	"explain.allLater": "{n} zeitgesperrte Wege",
	"explain.allLaterOne": "1 zeitgesperrter Weg",
	"explain.mix": "{now} sofort, {later} später",
	"explain.empty": "Noch keine Policy. Wähle links einen Operator oder lade ein Beispiel.",
	"explain.incomplete": "… (unvollständig)",
	"explain.hole": "Leerer Slot",
	"explain.hash": "{key} (Hash)",
	"explain.kofn": "{k}-von-{n} {keys}",
	"explain.timelock": "Timelock",
	"explain.afterBlock": "ab Block {n}",
	"explain.thresh": "{k} von {n} Bedingungen",
	"explain.when": "{when}: {body}.",
	"explain.or": ", oder ",
	"sub.pick": "Operator wählen",
	"sub.key": "Schlüssel",
	"sub.both": "beide nötig",
	"sub.either": "einer der Zweige",
	"sub.any": "beliebige Fragmente",
	"sub.block": "Block {n}",
	"sub.slot": "Slot",
	"sub.left": "links",
	"sub.right": "rechts",
	"sub.branchA": "Zweig A",
	"sub.branchB": "Zweig B",
	"sub.branchN": "Zweig {n}",
	"edge.and": "und",
	"edge.or": "oder",
	"edge.else": "sonst",
	"val.noPolicy": "Noch keine Policy. Starte mit einem Operator oder Beispiel.",
	"val.holes": "Leere Slots: Policy ist noch nicht vollständig.",
	"val.olderRange": "older({n}) außerhalb 1–65535.",
	"val.multiK": "multi: k={k} passt nicht zu {n} Keys.",
	"val.multiMax": "multi unterstützt höchstens 20 Keys.",
	"val.multiDup": "multi enthält doppelte Key-Namen ({names}).",
	"val.andV": "and_v: linker Zweig sollte vom Typ V sein (oft v:pk oder v:multi).",
	"val.reuse": "Key-Wiederverwendung: {names}. Nunchuk mag oft Aliase (A1, A2) für denselben xpub.",
	"val.long": "Langes Script – speicherarme Geräte (Ledger Nano S, Specter DIY) können scheitern.",
	"val.manyKeys": "{n} Key-Platzhalter. Ledger Nano S scheitert oft ab etwa 5 Keys in der Policy.",
	"val.depth": "Verschachtelungstiefe {n}. Flachere or_i-Strukturen sind gerätefreundlicher.",
	"err.empty": "Nichts zum Einlesen.",
	"err.policy": "Das ist eine Policy. Oben über Import die ganze Policy laden.",
	"err.noXpub": "Kein xpub oder Origin-Ausdruck erkannt.",
	"err.policyChild": "Das ist eine Policy, kein Child-Key.",
	"err.pathEmpty": "Pfad ist leer.",
	"err.samePath": "Das ist derselbe Pfad wie der Parent.",
	"err.needParent": "Zuerst den Parent-xpub einlesen.",
	"err.mismatch": "Passt nicht zu diesem Key (anderer Fingerprint oder xpub).",
	"err.dupChild": "Dieser Child-Pfad ist schon da.",
	"err.noKey": "Schlüssel nicht gefunden.",
	"err.noChildExpr": "Kein xpub, Origin oder Child-Pfad erkannt.",
	"op.pk.summary": "Signatur eines öffentlichen Schlüssels",
	"op.pk.hint": "Sofort spendbar mit diesem Key. In Native SegWit die übliche Form.",
	"op.pkh.summary": "Signatur zum Hash eines Schlüssels",
	"op.pkh.hint": "Spart Platz im Script, Key kommt erst beim Spenden. Oft in Liana-Exporten.",
	"op.multi.summary": "k-von-n CHECKMULTISIG",
	"op.multi.hint": "Klassisches Multisig. Maximal 20 Keys. Reihenfolge der Keys ist relevant.",
	"op.older.summary": "Relatives Timelock (CSV, Blöcke)",
	"op.older.hint": "Gültig, wenn die Coin-Age ≥ n Blöcke ist. Max 65535. 144 Blöcke ≈ 1 Tag.",
	"op.after.summary": "Absolutes Timelock (CLTV)",
	"op.after.hint": "Gültig ab Blockhöhe n. Für UTXO-Alter eher older verwenden.",
	"op.and_v.summary": "Beide Zweige müssen gelten",
	"op.and_v.hint": "Linkes Kind muss vom Typ V sein (oft v:pk). Standard-UND für Policies.",
	"op.and_b.summary": "BOOLAND der beiden Zweige",
	"op.and_b.hint": "Seltener; für boolesche Kombinationen in thresh.",
	"op.andor.summary": "(X und Y) oder Z",
	"op.andor.hint": "Kompakte Vererbung: z. B. andor(pk(Backup), older(n), multi(2,A,B,C)).",
	"op.or_i.summary": "IF / ELSE – einer der beiden Zweige",
	"op.or_i.hint": "Stabilste ODER-Form in Nunchuk. Witness wählt den Zweig (1 oder 0).",
	"op.or_d.summary": "IFDUP NOTIF – kompakteres ODER",
	"op.or_d.hint": "Gut für A+(B oder C). Linker Zweig muss dissatisfiable sein.",
	"op.or_c.summary": "NOTIF – Verify-ODER",
	"op.or_c.hint": "Rechter Zweig vom Typ V. Kompakter, weniger flexibel.",
	"op.or_b.summary": "BOOLOR der beiden Zweige",
	"op.or_b.hint": "Beide Zweige werden ausgeführt. Für thresh-artige Konstruktionen.",
	"op.thresh.summary": "k von n beliebigen Fragmenten",
	"op.thresh.hint": "Allgemeiner als multi: Zweige können Keys, Zeit oder ganze Policies sein.",
	"wrap.v": "VERIFY – bricht bei Fehlschlag ab (für and_v nötig)",
	"wrap.a": "Altstack – für thresh-Zweige",
	"wrap.c": "CHECKSIG auf einem Key-Fragment",
	"wrap.d": "DUP IF … ENDIF (dissatisfiable)",
	"wrap.n": "0NOTEQUAL",
	"wrap.t": "and_v(X,1) – unit-true",
	"wrap.u": "or_i(X,0)",
	"wrap.l": "or_i(0,X)",
	"wrap.s": "SWAP",
	"wrap.j": "SIZE 0NOTEQUAL IF"
};
var en = {
	"header.import": "Import",
	"header.export": "Export",
	"header.reset": "Reset",
	"header.usb": "USB",
	"header.language": "Language",
	"tabs.stages": "Stages",
	"tabs.ops": "Operators",
	"tabs.tree": "Tree",
	"tabs.read": "Reading",
	"stages.title": "Stages",
	"stages.blurb": "Per stage: how many keys, which threshold, which timelock. Key material in the center.",
	"stages.empty": "Policy comes from import or operators. New stages replace the tree.",
	"stages.addLocked": "Stage with timelock",
	"stages.add": "Create stages",
	"stages.n": "Stage {n}",
	"stages.remove": "Remove stage",
	"stages.keys": "Keys",
	"stages.threshold": "Threshold k",
	"stages.inStage": "In this stage",
	"stages.timelock": "Timelock",
	"stages.dec": "Decrease {label}",
	"stages.inc": "Increase {label}",
	"keys.title": "Keys",
	"keys.blurb": "Name, else fingerprint, else A B C. Tap to open the tree.",
	"keys.reuseOn": "Reuse on",
	"keys.reuseOff": "Reuse off",
	"keys.empty": "No keys. Add stages on the left.",
	"keys.importHint": "xpub or QR — tap again to import.",
	"keys.tapDetails": "Tap again for details and child keys.",
	"keys.dialogBlurb": "Master first, then child keys. Details apply to the selected level.",
	"keys.taken": "Key {name} imported",
	"keys.childTaken": "Child key imported",
	"keys.cleared": "Material cleared",
	"keys.clear": "Clear",
	"keys.apply": "Apply",
	"keys.childApply": "Add child",
	"keys.childRemove": "Remove child",
	"keys.childNeedParent": "Import the master xpub first.",
	"keys.childHelp": "Same fingerprint, other account (48'/0'/1'/2'), or a path like 0/0 under the master.",
	"keys.childPath": "Child path from xpub",
	"keys.noMaterial": "No material yet — Master tab.",
	"keys.details": "Details",
	"keys.children": "Child keys",
	"keys.master": "Master",
	"keys.detailOf": "Applies to",
	"keys.reuseNeed": "Reuse off: each slot needs its own account of the same fingerprint. Master is 48'/0'/0'/2'.",
	"keys.nextAccount": "Next account: {path}",
	"keys.needChild": "{alias}",
	"keys.missing": "missing",
	"keys.present": "set",
	"keys.applyReplace": "Replace",
	"keys.draftHint": "Not saved yet — Apply commits.",
	"keys.detailsApply": "Apply changes",
	"keys.name": "Name",
	"keys.fp": "Fingerprint",
	"keys.bip32": "BIP32 path",
	"ops.title": "Operators",
	"ops.blurb": "Click places the fragment into the selected slot.",
	"ops.wrap": "Wrappers",
	"ops.wrapAria": "Wrapper {code}",
	"ops.key": "Key",
	"ops.keyOrder": "Keys (order matters)",
	"ops.threshold": "Threshold k",
	"ops.branches": "Number of branches",
	"ops.blocksCsv": "Blocks (CSV)",
	"ops.heightCltv": "Block height (CLTV)",
	"ops.cancel": "Cancel",
	"ops.insert": "Insert",
	"group.keys": "Keys",
	"group.time": "Time",
	"group.and": "AND",
	"group.or": "OR",
	"group.thresh": "Threshold",
	"group.wrap": "Wrappers",
	"insp.empty": "No node selected. Click a fragment in the tree.",
	"insp.hole": "empty slot",
	"insp.unwrap": "Unwrap",
	"insp.delete": "Remove",
	"insp.blocks": "Blocks",
	"insp.height": "Height",
	"insp.keysCsv": "Keys, comma-separated",
	"insp.fill": "Pick an operator on the left to fill this slot.",
	"read.title": "Wallet reading",
	"read.check": "Checks",
	"read.copy": "Copy",
	"read.copied": "Copied",
	"read.now": "now",
	"read.blocksShort": "{n} blk",
	"read.noPolicy": "No policy",
	"graph.empty": "Empty policy",
	"graph.emptyBlurb": "Set stages on the left. Import keys in the center — fingerprint, name and BIP32 path sit on the tile.",
	"graph.aria": "Policy tree",
	"graph.fit": "Fit",
	"graph.zoomIn": "Zoom in",
	"graph.zoomOut": "Zoom out",
	"import.title": "Load policy",
	"import.blurb": "QR, miniscript, wsh descriptor, BSMS or BIP-388 (Ledger/BitBox). Individual keys go on the center tiles.",
	"import.policy": "Policy",
	"import.read": "Load",
	"import.loaded": "Policy loaded",
	"import.qrOk": "QR read",
	"import.fail": "Import failed.",
	"import.noXpubs": "No xpubs found. One key per line, optional name in front.",
	"export.title": "Export",
	"export.blurb": "QR for Nunchuk, Liana, Specter, Ledger and BitBox. Files as extra text.",
	"export.files": "Files",
	"export.ok": "Three files exported",
	"export.none": "No policy to export.",
	"export.copy": "Copy",
	"export.ledger": "Ledger",
	"export.bitbox": "BitBox",
	"export.policyName": "Wallet name",
	"export.ledgerBlurb": "BIP-388 for the Bitcoin app 2.1.0+. Register on the Ledger in Liana, Sparrow or Nunchuk.",
	"export.bitboxBlurb": "Miniscript policy for BitBox02 firmware 9.15+. Register in the BitBoxApp or Liana.",
	"export.template": "Descriptor template",
	"export.needXpub": "Still missing xpub: {names}",
	"export.needFp": "Without a fingerprint the device will not sign: {names}",
	"export.register": "Register this JSON on the device — not the bare descriptor.",
	"export.copyJson": "Copy JSON",
	"export.copyTemplate": "Copy template",
	"export.downloadDevice": "JSON file",
	"export.okDevices": "Files including Ledger and BitBox exported",
	"hw.title": "USB device",
	"hw.blurb": "Ledger or BitBox over USB. Pull an xpub, register the policy on the device.",
	"hw.needChrome": "WebHID needs Chrome or Edge on desktop.",
	"hw.iframe": "This preview often blocks USB. Use Demo, or open the app in its own Chrome tab.",
	"hw.ledgerHint": "Open the Bitcoin app 2.1.0+. Close Ledger Live.",
	"hw.bitboxHint": "Unlock the BitBox02. Firmware 9.15+ for miniscript.",
	"hw.connectUsb": "Connect USB",
	"hw.connectDemo": "Demo without a device",
	"hw.connected": "Device connected",
	"hw.demoOn": "Demo device on",
	"hw.demo": "Demo",
	"hw.pairing": "Pairing code",
	"hw.pairingBlurb": "Confirm the same code on the BitBox.",
	"hw.waitLedger": "Pick the Ledger. The Bitcoin app must be open.",
	"hw.waitBitbox": "Pick the BitBox, then unlock it.",
	"hw.fetchKey": "Fetch xpub",
	"hw.fillEmpty": "Fill empty keys",
	"hw.register": "Register policy",
	"hw.disconnect": "Disconnect",
	"hw.registered": "Confirmed on the device",
	"hw.registerHint": "The device shows the template and cosigners. Scriptwerk stores the HMAC.",
	"hw.pendingKey": "Target key {name}",
	"hw.filled": "{n} keys from the device",
	"hw.fromLedger": "From Ledger",
	"hw.fromBitbox": "From BitBox",
	"hw.err.none": "No device selected.",
	"hw.err.denied": "USB access denied.",
	"hw.err.iframe": "USB is not allowed in this window.",
	"hw.err.abort": "Cancelled on the device.",
	"hw.err.locked": "Device is locked.",
	"hw.err.app": "Open the Bitcoin app on the Ledger.",
	"hw.err.hid": "WebHID is not available.",
	"hw.err.generic": "The device refused.",
	"hw.err.notConnected": "No device connected.",
	"hw.err.needKeys": "Put xpubs on the keys first.",
	"hw.err.6a82": "Ledger 0x6a82: open Bitcoin app 2.1+, close Ledger Live, path m/48'/0'/0'/2' (testnet 48'/1'). Fill every policy key.",
	"hw.err.template": "Ledger needs a wsh(…) template.",
	"qr.none": "Nothing to encode.",
	"qr.long": "Text is too long for a QR. Export a file.",
	"qr.building": "Building QR…",
	"qr.camOrPhoto": "Camera or QR photo.",
	"qr.camOff": "Camera off",
	"qr.cam": "Camera",
	"qr.image": "Image",
	"qr.noCode": "No QR found in the image.",
	"qr.badImage": "Could not read the image.",
	"qr.noCam": "Camera unavailable. Upload a QR image.",
	"qr.alt": "QR code {label}",
	"delay.0": "Now",
	"delay.1": "1 blk",
	"delay.144": "1 day",
	"delay.1008": "1 week",
	"delay.4320": "1 month",
	"delay.52596": "1 year",
	"delay.60000": "60k",
	"delay.65534": "Max",
	"delay.block": "1 block",
	"time.now": "Immediately",
	"time.one": "After 1 block · ≈ 10 min",
	"time.after": "After {n} blocks · {approx}",
	"time.human": "{n} blocks · {approx}",
	"approx.min": "≈ 10 min",
	"approx.hours": "≈ {n} h",
	"approx.day": "≈ 1 day",
	"approx.days": "≈ {n} days",
	"approx.months": "≈ {n} months",
	"approx.years": "≈ {n} years",
	"explain.none": "No policy",
	"explain.allNow": "{n} immediate spend paths",
	"explain.allNowOne": "1 immediate spend path",
	"explain.allLater": "{n} time-locked paths",
	"explain.allLaterOne": "1 time-locked path",
	"explain.mix": "{now} now, {later} later",
	"explain.empty": "No policy yet. Pick an operator on the left or load an example.",
	"explain.incomplete": "… (incomplete)",
	"explain.hole": "Empty slot",
	"explain.hash": "{key} (hash)",
	"explain.kofn": "{k}-of-{n} {keys}",
	"explain.timelock": "Timelock",
	"explain.afterBlock": "from block {n}",
	"explain.thresh": "{k} of {n} conditions",
	"explain.when": "{when}: {body}.",
	"explain.or": ", or ",
	"sub.pick": "Pick operator",
	"sub.key": "Key",
	"sub.both": "both required",
	"sub.either": "either branch",
	"sub.any": "any fragments",
	"sub.block": "Block {n}",
	"sub.slot": "Slot",
	"sub.left": "left",
	"sub.right": "right",
	"sub.branchA": "Branch A",
	"sub.branchB": "Branch B",
	"sub.branchN": "Branch {n}",
	"edge.and": "and",
	"edge.or": "or",
	"edge.else": "else",
	"val.noPolicy": "No policy yet. Start with an operator or an example.",
	"val.holes": "Empty slots: the policy is not complete.",
	"val.olderRange": "older({n}) outside 1–65535.",
	"val.multiK": "multi: k={k} does not match {n} keys.",
	"val.multiMax": "multi supports at most 20 keys.",
	"val.multiDup": "multi contains duplicate key names ({names}).",
	"val.andV": "and_v: left branch should be type V (often v:pk or v:multi).",
	"val.reuse": "Key reuse: {names}. Nunchuk often wants aliases (A1, A2) for the same xpub.",
	"val.long": "Long script — low-memory devices (Ledger Nano S, Specter DIY) may fail.",
	"val.manyKeys": "{n} key placeholders. Ledger Nano S often fails around 5 keys in the policy.",
	"val.depth": "Nesting depth {n}. Flatter or_i structures are more device-friendly.",
	"err.empty": "Nothing to import.",
	"err.policy": "That is a policy. Use Import at the top to load the whole policy.",
	"err.noXpub": "No xpub or origin expression found.",
	"err.policyChild": "That is a policy, not a child key.",
	"err.pathEmpty": "Path is empty.",
	"err.samePath": "That is the same path as the parent.",
	"err.needParent": "Import the parent xpub first.",
	"err.mismatch": "Does not match this key (different fingerprint or xpub).",
	"err.dupChild": "This child path is already present.",
	"err.noKey": "Key not found.",
	"err.noChildExpr": "No xpub, origin, or child path found.",
	"op.pk.summary": "Signature of a public key",
	"op.pk.hint": "Immediately spendable with this key. Usual form in native SegWit.",
	"op.pkh.summary": "Signature of a key hash",
	"op.pkh.hint": "Saves script space; the key appears at spend time. Common in Liana exports.",
	"op.multi.summary": "k-of-n CHECKMULTISIG",
	"op.multi.hint": "Classic multisig. At most 20 keys. Key order matters.",
	"op.older.summary": "Relative timelock (CSV, blocks)",
	"op.older.hint": "Valid once coin-age ≥ n blocks. Max 65535. 144 blocks ≈ 1 day.",
	"op.after.summary": "Absolute timelock (CLTV)",
	"op.after.hint": "Valid from block height n. Prefer older for coin age.",
	"op.and_v.summary": "Both branches must hold",
	"op.and_v.hint": "Left child must be type V (often v:pk). Standard AND for policies.",
	"op.and_b.summary": "BOOLAND of both branches",
	"op.and_b.hint": "Rarer; for boolean combinations inside thresh.",
	"op.andor.summary": "(X and Y) or Z",
	"op.andor.hint": "Compact inheritance, e.g. andor(pk(Backup), older(n), multi(2,A,B,C)).",
	"op.or_i.summary": "IF / ELSE — either branch",
	"op.or_i.hint": "Most stable OR in Nunchuk. Witness picks the branch (1 or 0).",
	"op.or_d.summary": "IFDUP NOTIF — denser OR",
	"op.or_d.hint": "Good for A+(B or C). Left branch must be dissatisfiable.",
	"op.or_c.summary": "NOTIF — verify OR",
	"op.or_c.hint": "Right branch type V. Smaller, less flexible.",
	"op.or_b.summary": "BOOLOR of both branches",
	"op.or_b.hint": "Both branches execute. For thresh-like constructions.",
	"op.thresh.summary": "k of n arbitrary fragments",
	"op.thresh.hint": "More general than multi: branches can be keys, time, or whole policies.",
	"wrap.v": "VERIFY — abort on failure (needed for and_v)",
	"wrap.a": "Altstack — for thresh branches",
	"wrap.c": "CHECKSIG on a key fragment",
	"wrap.d": "DUP IF … ENDIF (dissatisfiable)",
	"wrap.n": "0NOTEQUAL",
	"wrap.t": "and_v(X,1) — unit-true",
	"wrap.u": "or_i(X,0)",
	"wrap.l": "or_i(0,X)",
	"wrap.s": "SWAP",
	"wrap.j": "SIZE 0NOTEQUAL IF"
};
function t(locale, key, vars) {
	let s = (locale === "en" ? en : de)[key] ?? de[key] ?? key;
	if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
	return s;
}
function numberLocale(locale) {
	return locale === "en" ? "en-US" : "de-DE";
}
function localizeMessage(locale, message) {
	if (!message) return message;
	if (message.includes(".") && !message.includes(" ")) return t(locale, message);
	return message;
}
function emptyKey(name, network = "mainnet") {
	return {
		id: `k_${name}_${Math.random().toString(36).slice(2, 6)}`,
		name,
		fingerprint: "",
		derivation: network === "testnet" ? "48'/1'/0'/2'" : "48'/0'/0'/2'",
		xpub: "",
		multipath: "<0;1>",
		childPath: "<0;1>/*",
		children: [],
		note: ""
	};
}
function normalizeKeyEntry(k) {
	const multipath = k.multipath || "<0;1>";
	const childPath = k.childPath?.trim() || `${multipath}/*`;
	return {
		...k,
		multipath,
		childPath,
		children: Array.isArray(k.children) ? k.children : [],
		note: k.note ?? ""
	};
}
function nextKeyName(existing) {
	for (const ch of "ABCDEFGHJKLMNPQRSTUVWXYZ") if (!existing.includes(ch)) return ch;
	let i = 1;
	while (existing.includes(`K${i}`)) i++;
	return `K${i}`;
}
function approx(n, locale = "de") {
	if (n <= 1) return t(locale, "approx.min");
	if (n < 144) return t(locale, "approx.hours", { n: Math.round(n * 10 / 60) });
	const days = n / 144;
	if (days < 1.5) return t(locale, "approx.day");
	if (days < 30) return t(locale, "approx.days", { n: Math.round(days) });
	const months = days / 30.44;
	if (months < 18) return t(locale, "approx.months", { n: months < 10 ? months.toFixed(1) : String(Math.round(months)) });
	return t(locale, "approx.years", { n: (days / 365.25).toFixed(1) });
}
function blocksToHuman(n, locale = "de") {
	return t(locale, "time.human", {
		n: n.toLocaleString(numberLocale(locale)),
		approx: approx(n, locale)
	});
}
function blocksWhen(n, locale = "de") {
	if (n <= 0) return t(locale, "time.now");
	if (n === 1) return t(locale, "time.one");
	return t(locale, "time.after", {
		n: n.toLocaleString(numberLocale(locale)),
		approx: approx(n, locale)
	});
}
var XPUB_BODY = /^(xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+/;
var ORIGIN_IN_TEXT = /\[[0-9a-fA-F]{8}(?:\/[^\]]*)?\](?:(?:xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+(?:\/[^\s,)\]"']+)?|(?:m\/)?[0-9hH'/*<>;]+)?/;
var XPUB_IN_TEXT = /(?:xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+(?:\/[^\s,)\]"']+)?/;
function blankParsed(raw, kind = "alias") {
	return {
		kind,
		alias: kind === "alias" ? raw : null,
		fingerprint: "",
		derivation: "",
		xpub: "",
		multipath: "<0;1>",
		childPath: "<0;1>/*",
		raw
	};
}
function parseKeyExpr(raw) {
	const s = raw.trim();
	const origin = s.match(/^\[([0-9a-fA-F]{8})(?:\/([^\]]*))?\](.*)$/);
	if (origin) {
		let derivation = normalizePath(origin[2] || "");
		let rest = (origin[3] || "").trim();
		if (rest && !XPUB_BODY.test(rest) && /^(m\/)?[0-9hH']/.test(rest)) {
			const extra = normalizePath(rest);
			derivation = [derivation, extra].filter(Boolean).join("/");
			rest = "";
		}
		const split = rest ? splitXpubPath(rest) : {
			xpub: "",
			multipath: "<0;1>",
			childPath: "<0;1>/*"
		};
		const xpub = XPUB_BODY.test(split.xpub) ? split.xpub : "";
		return {
			kind: derivation || xpub ? "origin" : "alias",
			alias: null,
			fingerprint: origin[1],
			derivation,
			xpub,
			multipath: split.multipath,
			childPath: xpub ? split.childPath : "<0;1>/*",
			raw: s
		};
	}
	if (XPUB_BODY.test(s)) {
		const rest = splitXpubPath(s);
		return {
			kind: "xpub",
			alias: null,
			fingerprint: "",
			derivation: "",
			xpub: rest.xpub,
			multipath: rest.multipath,
			childPath: rest.childPath,
			raw: s
		};
	}
	return blankParsed(s);
}
function normalizePath(path) {
	return path.replace(/h/g, "'").replace(/^m\//, "");
}
function splitXpubPath(rest) {
	const s = rest.trim();
	const m = s.match(/^(xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+/);
	if (!m) return {
		xpub: s,
		multipath: "<0;1>",
		childPath: "<0;1>/*"
	};
	const xpub = m[0];
	let tail = s.slice(xpub.length).replace(/^\//, "").trim();
	if (!tail) tail = "<0;1>/*";
	return {
		xpub,
		childPath: tail,
		multipath: multipathFromChildPath(tail)
	};
}
function multipathFromChildPath(childPath) {
	const angle = childPath.match(/^<[^>]+>/);
	if (angle) return angle[0];
	return "<0;1>";
}
function looksLikePolicy(text) {
	const t = text.trim();
	if (/^BSMS/i.test(t)) return true;
	return /\b(wsh|sh|tr|pkh|pk|multi|thresh|older|after|and_v|and_b|andor|or_i|or_d|or_c|or_b)\s*\(/i.test(t);
}
function parseKeyList(text) {
	if (looksLikePolicy(text)) return null;
	const lines = text.trim().split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
	if (!lines.length) return null;
	const keys = [];
	const used = [];
	for (const line of lines) {
		const named = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/);
		let name;
		let expr = line;
		if (named) {
			if (parseKeyExpr(named[2]).kind !== "alias") {
				name = named[1];
				expr = named[2];
			}
		}
		const parsed = parseKeyExpr(expr);
		if (parsed.kind === "alias") return null;
		const finalName = name ?? nextKeyName(used);
		used.push(finalName);
		keys.push({
			...emptyKey(finalName),
			fingerprint: parsed.fingerprint,
			derivation: parsed.derivation || emptyKey(finalName).derivation,
			xpub: parsed.xpub,
			multipath: parsed.multipath || "<0;1>",
			childPath: parsed.childPath || "<0;1>/*"
		});
	}
	return keys.length ? keys : null;
}
function extractKeysFromTree(root, existing) {
	const existingByName = new Map(existing.map((k) => [k.name, k]));
	const existingByXpub = new Map(existing.filter((k) => k.xpub).map((k) => [k.xpub, k]));
	const assigned = [];
	const usedNames = /* @__PURE__ */ new Set();
	const xpubToName = /* @__PURE__ */ new Map();
	const remember = (k) => {
		assigned.push(normalizeKeyEntry(k));
		usedNames.add(k.name);
		if (k.xpub) xpubToName.set(k.xpub, k.name);
	};
	return {
		node: mapKeyStrings(root, (raw) => {
			const parsed = parseKeyExpr(raw);
			if (parsed.kind === "alias") {
				const alias = parsed.alias;
				if (!usedNames.has(alias)) {
					const prev = existingByName.get(alias);
					remember(prev ? {
						...prev,
						name: alias
					} : emptyKey(alias));
				}
				return alias;
			}
			if (parsed.xpub && xpubToName.has(parsed.xpub)) return xpubToName.get(parsed.xpub);
			const prevX = parsed.xpub ? existingByXpub.get(parsed.xpub) : void 0;
			if (prevX && !usedNames.has(prevX.name)) {
				remember({
					...prevX,
					fingerprint: parsed.fingerprint || prevX.fingerprint,
					derivation: parsed.derivation || prevX.derivation,
					xpub: parsed.xpub || prevX.xpub,
					multipath: parsed.multipath || prevX.multipath,
					childPath: parsed.childPath || prevX.childPath
				});
				return prevX.name;
			}
			const name = nextKeyName([...usedNames]);
			remember({
				...emptyKey(name),
				fingerprint: parsed.fingerprint,
				derivation: parsed.derivation || emptyKey(name).derivation,
				xpub: parsed.xpub,
				multipath: parsed.multipath || "<0;1>",
				childPath: parsed.childPath || "<0;1>/*"
			});
			return name;
		}),
		keys: assigned
	};
}
function keyIsFilled(k) {
	return Boolean(k.xpub.trim());
}
function formatFingerprint(fp) {
	return fp.replace(/^#/, "").replace(/^0x/i, "").trim().slice(0, 8).toLowerCase();
}
function parseAccountIndex(path) {
	const m = normalizePath(path).match(/^48'\/(\d+)'\/(\d+)'\/(\d+)'?$/);
	if (!m) return null;
	return Number(m[2]);
}
function accountPathFrom(path, account, network = "mainnet") {
	const m = normalizePath(path).match(/^48'\/(\d+)'\/(\d+)'\/(\d+)'?$/);
	return `48'/${m ? m[1] : network === "testnet" ? "1" : "0"}'/${account}'/${m ? m[3] : "2"}'`;
}
function usedAccountIndices(key) {
	const k = normalizeKeyEntry(key);
	const used = /* @__PURE__ */ new Set();
	const master = parseAccountIndex(k.derivation);
	used.add(master ?? 0);
	for (const c of k.children) {
		const n = parseAccountIndex(c.path);
		if (n != null) used.add(n);
	}
	return [...used].sort((a, b) => a - b);
}
function nextUnusedAccount(key, network = "mainnet") {
	const used = new Set(usedAccountIndices(key));
	let account = 0;
	while (used.has(account)) account++;
	return {
		account,
		path: accountPathFrom(key.derivation, account, network)
	};
}
function childForAccount(key, account) {
	return normalizeKeyEntry(key).children.find((c) => parseAccountIndex(c.path) === account);
}
function keyTileLabel(k) {
	const note = k.note.trim();
	if (note) return note;
	const fp = formatFingerprint(k.fingerprint);
	if (fp) return fp;
	return k.name;
}
function formatBip32Path(k) {
	const der = normalizePath(k.derivation || "").trim();
	if (!der) return "";
	return `m/${der}`;
}
function formatScriptPath(k) {
	const child = (k.childPath || "").trim();
	if (child) return child.replace(/^\//, "");
	const multi = (k.multipath || "").trim();
	if (!multi) return "";
	return `${multi}/*`;
}
function firstString$1(rec, keys) {
	for (const key of keys) {
		const v = rec[key];
		if (typeof v === "string" && v.trim()) return v.trim();
	}
	return "";
}
function fromJsonBlob(text) {
	try {
		const parsed = JSON.parse(text);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
		const rec = parsed;
		const xpub = firstString$1(rec, [
			"xpub",
			"tpub",
			"p2wsh",
			"extPubKey",
			"ExtPubKey",
			"pubkey"
		]);
		if (!xpub || !XPUB_IN_TEXT.test(xpub) && !ORIGIN_IN_TEXT.test(xpub)) return extractFirstKeyExpr(JSON.stringify(rec));
		if (ORIGIN_IN_TEXT.test(xpub) || xpub.startsWith("[")) {
			const inner = parseKeyExpr(xpub);
			if (inner.kind !== "alias" && inner.xpub) return inner;
		}
		const fp = firstString$1(rec, [
			"fingerprint",
			"xfp",
			"master_fingerprint",
			"masterFingerprint",
			"rootFingerprint",
			"root_fingerprint",
			"fp"
		]);
		const der = firstString$1(rec, [
			"derivation",
			"deriv",
			"p2wsh_deriv",
			"path",
			"keypath",
			"bip32_path",
			"bip32Path"
		]);
		const out = parseKeyExpr(fp && der ? `[${formatFingerprint(fp)}/${normalizePath(der)}]${xpub}` : xpub);
		if (out.kind === "alias" || !out.xpub) return null;
		if (der && !out.derivation) out.derivation = normalizePath(der);
		if (fp && !out.fingerprint) out.fingerprint = formatFingerprint(fp);
		return out;
	} catch {
		return null;
	}
}
function extractFirstKeyExpr(text) {
	const origin = text.match(ORIGIN_IN_TEXT);
	if (origin?.[0]) {
		const p = parseKeyExpr(origin[0]);
		if (p.kind !== "alias" && (p.xpub || p.fingerprint)) return p;
	}
	const xpub = text.match(XPUB_IN_TEXT);
	if (xpub?.[0]) {
		const p = parseKeyExpr(xpub[0]);
		if (p.kind !== "alias" && p.xpub) {
			const pathLine = text.split(/\r?\n/).map((l) => l.trim()).find((l) => /^(m\/)?\d/.test(l) && !XPUB_IN_TEXT.test(l));
			if (pathLine && !p.derivation) p.derivation = normalizePath(pathLine);
			return p;
		}
	}
	return null;
}
function applyKeyMaterial(entry, text) {
	const raw = text.trim();
	if (!raw) return {
		ok: false,
		error: "err.empty"
	};
	const parsed = fromJsonBlob(raw) ?? (looksLikePolicy(raw) ? null : extractFirstKeyExpr(raw) ?? parseKeyExpr(raw));
	if (parsed && parsed.kind !== "alias" && !parsed.xpub && (parsed.fingerprint || parsed.derivation)) {
		const parent = normalizeKeyEntry(entry);
		return {
			ok: true,
			key: {
				...parent,
				fingerprint: parsed.fingerprint || parent.fingerprint,
				derivation: parsed.derivation || parent.derivation
			}
		};
	}
	if (!parsed?.xpub) {
		if (looksLikePolicy(raw)) return {
			ok: false,
			error: "err.policy"
		};
		return {
			ok: false,
			error: "err.noXpub"
		};
	}
	const parent = normalizeKeyEntry(entry);
	return {
		ok: true,
		key: {
			...parent,
			fingerprint: parsed.fingerprint || parent.fingerprint,
			derivation: parsed.derivation || parent.derivation,
			xpub: parsed.xpub,
			multipath: parsed.multipath || parent.multipath,
			childPath: parsed.childPath || parent.childPath
		}
	};
}
function buildKeyTree(k, aliases = []) {
	const key = normalizeKeyEntry(k);
	const extra = key.children;
	const aliasNodes = aliases.map((a, i) => ({
		label: a.alias,
		hint: a.delay <= 0 ? "Sofort" : `${a.delay.toLocaleString("de-DE")} Bl.`,
		last: i === aliases.length - 1,
		children: []
	}));
	const script = formatScriptPath(key) || "<0;1>/*";
	const absoluteKids = extra.filter((c) => isAbsoluteChildPath(c.path, key.derivation));
	const relativeKids = extra.filter((c) => !isAbsoluteChildPath(c.path, key.derivation));
	if (absoluteKids.length) {
		const account = {
			label: formatBip32Path(key).replace(/^m\//, "") || key.derivation || "0",
			hint: formatFingerprint(key.fingerprint) || void 0,
			last: false,
			children: [{
				label: script,
				last: relativeKids.length === 0,
				children: aliasNodes
			}, ...relativeKids.map((c) => ({
				label: c.path,
				hint: c.note || (c.xpub ? "Child-xpub" : void 0),
				last: false,
				children: []
			}))]
		};
		const siblings = [account, ...absoluteKids.map((c) => ({
			label: c.path.replace(/^m\//, ""),
			hint: c.note || (c.xpub ? "Account" : formatFingerprint(c.fingerprint) || void 0),
			last: false,
			children: []
		}))];
		siblings.forEach((n, i) => {
			n.last = i === siblings.length - 1;
		});
		account.children.forEach((n, i) => {
			n.last = i === account.children.length - 1;
		});
		return {
			label: "m",
			hint: formatFingerprint(key.fingerprint) || void 0,
			last: true,
			children: siblings
		};
	}
	const origin = formatBip32Path(key) || "m";
	const kids = [{
		label: script,
		last: extra.length === 0,
		children: aliasNodes
	}, ...extra.map((c) => ({
		label: c.path,
		hint: c.note || (c.xpub ? "Child-xpub" : void 0),
		last: false,
		children: []
	}))];
	kids.forEach((n, i) => {
		n.last = i === kids.length - 1;
	});
	return {
		label: origin,
		hint: formatFingerprint(key.fingerprint) || void 0,
		last: true,
		children: kids
	};
}
function isAbsoluteChildPath(path, parentDerivation) {
	const p = normalizePath(path);
	const origin = normalizePath(parentDerivation);
	if (!p) return false;
	if (origin && (p === origin || p.startsWith(`${origin}/`))) return false;
	return /'/.test(p) || /^48['h]/.test(p);
}
function isPathOnly(text) {
	const t = text.trim();
	if (!t || t.includes("[") || XPUB_IN_TEXT.test(t) || ORIGIN_IN_TEXT.test(t)) return false;
	return /^(m\/)?[0-9hH'/*<>;]+$/.test(t);
}
function relativizePath(parent, rawPath) {
	let p = normalizePath(rawPath).replace(/^\//, "");
	const origin = normalizePath(parent.derivation || "");
	if (origin && (p === origin || p.startsWith(`${origin}/`))) p = p.slice(origin.length).replace(/^\//, "");
	return p;
}
function parseChildKey(parent, text, opts) {
	const raw = text.trim();
	if (!raw) return {
		ok: false,
		error: "err.empty"
	};
	if (looksLikePolicy(raw)) return {
		ok: false,
		error: "err.policyChild"
	};
	const base = normalizeKeyEntry(parent);
	if (isPathOnly(raw)) {
		const path = relativizePath(base, raw);
		if (!path) return {
			ok: false,
			error: "err.pathEmpty"
		};
		if (normalizePath(path) === normalizePath(base.derivation)) return {
			ok: false,
			error: "err.samePath"
		};
		return {
			ok: true,
			child: {
				id: uid("ck"),
				path,
				xpub: "",
				fingerprint: formatFingerprint(base.fingerprint),
				note: opts?.alias || ""
			}
		};
	}
	const parsed = fromJsonBlob(raw) ?? extractFirstKeyExpr(raw) ?? (parseKeyExpr(raw).kind !== "alias" ? parseKeyExpr(raw) : null);
	if (!parsed || parsed.kind === "alias") return {
		ok: false,
		error: "err.noChildExpr"
	};
	const sameXpub = Boolean(base.xpub && parsed.xpub && parsed.xpub === base.xpub);
	const childFp = formatFingerprint(parsed.fingerprint);
	const parentFp = formatFingerprint(base.fingerprint);
	const sameFp = Boolean(childFp && parentFp && childFp === parentFp) || !childFp && Boolean(parentFp);
	if (childFp && parentFp && childFp !== parentFp) return {
		ok: false,
		error: "err.mismatch"
	};
	const origin = normalizePath(base.derivation);
	const childOrigin = normalizePath(parsed.derivation);
	let path = "";
	if (childOrigin && origin && (childOrigin === origin || childOrigin.startsWith(`${origin}/`))) {
		const extra = childOrigin === origin ? "" : childOrigin.slice(origin.length + 1);
		path = `${extra}${parsed.childPath && parsed.childPath !== "<0;1>/*" && parsed.childPath !== "*" ? extra ? `/${parsed.childPath}` : parsed.childPath : ""}`;
		if (!path && parsed.xpub && !sameXpub) path = childOrigin;
	} else if (childOrigin && origin && childOrigin !== origin) path = childOrigin;
	else if (sameXpub || sameFp) {
		const tail = parsed.childPath && parsed.childPath !== "<0;1>/*" && parsed.childPath !== "*" ? parsed.childPath : "";
		path = tail ? relativizePath(base, tail) : "";
	}
	if (!path && opts?.fallbackPath && (parsed.xpub || sameFp)) path = normalizePath(opts.fallbackPath);
	if (!path) {
		if (!base.xpub && !parentFp) return {
			ok: false,
			error: "err.needParent"
		};
		return {
			ok: false,
			error: "err.noChildExpr"
		};
	}
	if (normalizePath(path) === origin) return {
		ok: false,
		error: "err.samePath"
	};
	return {
		ok: true,
		child: {
			id: uid("ck"),
			path,
			xpub: sameXpub ? "" : parsed.xpub,
			fingerprint: childFp || parentFp,
			note: opts?.alias || ""
		}
	};
}
/** BIP-380 descriptor checksum (BigInt — values exceed 32-bit). */
var INPUT_CHARSET = "0123456789()[],'/*abcdefgh@:$%{}IJKLMNOPQRSTUVWXYZ&+-.;<=>?!^_|~ijklmnopqrstuvwxyzABCDEFGH`#\"\\ ";
var CHECKSUM_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
var GEN = [
	1056006543753n,
	730107360018n,
	118834127661n,
	236344068900n,
	507842021748n
];
function polymod(symbols) {
	let chk = 1n;
	for (const value of symbols) {
		const top = chk >> 35n;
		chk = (chk & 34359738367n) << 5n ^ BigInt(value);
		for (let i = 0; i < 5; i++) if (top >> BigInt(i) & 1n) chk ^= GEN[i];
	}
	return chk;
}
function expand(s) {
	const groups = [];
	const symbols = [];
	for (const ch of s) {
		const v = INPUT_CHARSET.indexOf(ch);
		if (v < 0) return null;
		symbols.push(v & 31);
		groups.push(v >> 5);
		if (groups.length === 3) {
			symbols.push(groups[0] * 9 + groups[1] * 3 + groups[2]);
			groups.length = 0;
		}
	}
	if (groups.length === 1) symbols.push(groups[0]);
	else if (groups.length === 2) symbols.push(groups[0] * 3 + groups[1]);
	return symbols;
}
function descsumCreate(s) {
	const expanded = expand(s);
	if (!expanded) return s;
	const checksum = polymod(expanded.concat([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	])) ^ 1n;
	let out = s + "#";
	for (let i = 0; i < 8; i++) {
		const idx = Number(checksum >> BigInt(5 * (7 - i)) & 31n);
		out += CHECKSUM_CHARSET[idx];
	}
	return out;
}
function compileMiniscript(node, compact = true) {
	const raw = compileNode(node);
	return compact ? raw.replace(/\s+/g, "") : raw;
}
function compileNode(node) {
	switch (node.kind) {
		case "hole": return "/*?*/";
		case "pk": return `pk(${node.key})`;
		case "pkh": return `pkh(${node.key})`;
		case "multi": return `${node.sorted ? "sortedmulti" : "multi"}(${node.k},${node.keys.join(",")})`;
		case "thresh": return `thresh(${node.k},${node.children.map(compileNode).join(",")})`;
		case "older": return `older(${node.n})`;
		case "after": return `after(${node.n})`;
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return `${node.kind}(${compileNode(node.left)},${compileNode(node.right)})`;
		case "andor": return `andor(${compileNode(node.x)},${compileNode(node.y)},${compileNode(node.z)})`;
		case "wrap": return `${node.wrap}:${compileNode(node.child)}`;
	}
}
function expandAliasKeys(node, keys, reuse = true) {
	const byName = new Map(keys.map((k) => [k.name, k]));
	const out = [...keys];
	for (const n of collectKeys(node)) {
		if (byName.has(n)) continue;
		const m = n.match(/^([A-Za-z_][A-Za-z_]*?)(\d+)$/);
		const src = m ? byName.get(m[1]) : void 0;
		if (!src) continue;
		const idx = m ? Number(m[2]) : 0;
		const child = Number.isFinite(idx) ? childForAccount(src, idx) : void 0;
		const expected = accountPathFrom(src.derivation, idx);
		let clone;
		if (!reuse && child?.xpub) clone = {
			...src,
			id: `${src.id}_${n}`,
			name: n,
			xpub: child.xpub,
			derivation: child.path.replace(/^m\//, "") || expected,
			fingerprint: child.fingerprint || src.fingerprint,
			children: []
		};
		else if (!reuse) clone = {
			...src,
			id: `${src.id}_${n}`,
			name: n,
			xpub: "",
			derivation: expected,
			children: []
		};
		else clone = {
			...src,
			id: `${src.id}_${n}`,
			name: n
		};
		out.push(clone);
		byName.set(n, clone);
	}
	return out;
}
function substituteKeys(ms, keys) {
	let out = ms;
	const sorted = [...keys].sort((a, b) => b.name.length - a.name.length);
	for (const k of sorted) {
		if (!k.xpub.trim()) continue;
		out = replaceKeyToken(out, k.name, formatKeyExpr(k));
	}
	return out;
}
function replaceKeyToken(src, name, expr) {
	const re = new RegExp(`(?<![A-Za-z0-9_])${escapeRe$1(name)}(?![A-Za-z0-9_])`, "g");
	return src.replace(re, expr);
}
function escapeRe$1(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function formatKeyExpr(k) {
	const xpub = k.xpub.trim();
	if (!xpub) return k.name;
	if (xpub.includes("[") || xpub.includes("/")) return xpub;
	const path = (k.derivation || "48'/0'/0'/2'").replace(/^m\//, "");
	return `[${(k.fingerprint || "00000000").replace(/^#/, "").slice(0, 8)}/${path}]${xpub}/${(k.childPath || `${k.multipath || "<0;1>"}/*`).replace(/^\//, "")}`;
}
function compileDescriptor(node, keys, reuse = true) {
	if (hasHoles(node)) return {
		ok: false,
		miniscript: compileMiniscript(node),
		descriptor: "",
		error: "Es fehlen noch Bausteine (leere Slots)."
	};
	const miniscript = compileMiniscript(node);
	return {
		ok: true,
		miniscript,
		descriptor: descsumCreate(`wsh(${substituteKeys(miniscript, expandAliasKeys(node, keys, reuse))})`)
	};
}
function compileBsms(descriptor, firstAddress) {
	const lines = [
		"BSMS 1.0",
		descriptor,
		"/0/*,/1/*"
	];
	if (firstAddress) lines.push(firstAddress);
	return lines.join("\n");
}
var WRAP_SET = /* @__PURE__ */ new Set([
	"v",
	"a",
	"c",
	"d",
	"j",
	"n",
	"t",
	"u",
	"l",
	"s"
]);
var FRAGMENTS = /* @__PURE__ */ new Set([
	"pk",
	"pkh",
	"multi",
	"sortedmulti",
	"thresh",
	"older",
	"after",
	"and_v",
	"and_b",
	"andor",
	"or_i",
	"or_d",
	"or_c",
	"or_b"
]);
function parseAny(input) {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("Leere Eingabe.");
	const src = (extractFromBsms(trimmed) ?? trimmed).replace(/\s+/g, "");
	const hash = src.lastIndexOf("#");
	let body = src;
	let checksum;
	if (hash > 0 && /^[a-z0-9]{8}$/i.test(src.slice(hash + 1))) {
		checksum = src.slice(hash + 1);
		body = src.slice(0, hash);
	}
	let wrapper = "none";
	let inner = body;
	if (inner.startsWith("wsh(") && inner.endsWith(")")) {
		wrapper = "wsh";
		inner = inner.slice(4, -1);
	} else if (inner.startsWith("sh(wsh(") && inner.endsWith("))")) {
		wrapper = "sh_wsh";
		inner = inner.slice(7, -2);
	} else if (inner.startsWith("tr(")) throw new Error("Taproot-Descriptor (tr) wird in dieser Version noch nicht gelesen.");
	return {
		node: parseExpression(inner, 0).node,
		wrapper,
		checksum,
		rawInner: inner
	};
}
function extractFromBsms(s) {
	const t = s.trim();
	if (!t.toUpperCase().startsWith("BSMS")) return null;
	const desc = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).find((l) => l.startsWith("wsh(") || l.startsWith("sh(") || l.startsWith("tr("));
	if (desc) return desc;
	const compact = t.replace(/\s+/g, "");
	const idx = compact.search(/wsh\(|sh\(|tr\(/);
	if (idx >= 0) return compact.slice(idx);
	throw new Error("BSMS ohne Descriptor-Zeile.");
}
function parseExpression(s, start) {
	const c = {
		s,
		i: start
	};
	skip(c);
	const wrappers = [];
	while (true) {
		skip(c);
		const ident = peekIdent(c);
		if (ident && WRAP_SET.has(ident) && c.s[c.i + ident.length] === ":") {
			wrappers.push(ident);
			c.i += ident.length + 1;
			continue;
		}
		break;
	}
	skip(c);
	const name = readIdent(c);
	if (!name) throw new Error(`Unerwartetes Zeichen an Position ${c.i}.`);
	if (c.s[c.i] !== "(") throw new Error(`Erwartet '(' nach ${name}.`);
	if (!FRAGMENTS.has(name)) throw new Error(`Unbekanntes Fragment "${name}".`);
	let node = buildFromArgs(name, readArgs(c));
	for (let w = wrappers.length - 1; w >= 0; w--) node = {
		id: uid(),
		kind: "wrap",
		wrap: wrappers[w],
		child: node
	};
	return {
		node,
		i: c.i
	};
}
function buildFromArgs(name, args) {
	switch (name) {
		case "pk":
		case "pkh":
			if (args.length !== 1) throw new Error(`${name} braucht genau einen Key.`);
			return {
				id: uid(),
				kind: name,
				key: args[0]
			};
		case "older":
		case "after": {
			if (args.length !== 1) throw new Error(`${name} braucht eine Zahl.`);
			const n = Number(args[0]);
			if (!Number.isFinite(n) || n < 1) throw new Error(`${name}(${args[0]}) ist ungültig.`);
			return {
				id: uid(),
				kind: name,
				n: Math.floor(n)
			};
		}
		case "multi":
		case "sortedmulti": {
			if (args.length < 2) throw new Error("multi braucht k und mindestens einen Key.");
			const k = Number(args[0]);
			const keys = args.slice(1);
			if (!Number.isInteger(k) || k < 1 || k > keys.length) throw new Error(`multi: k=${args[0]} passt nicht zu ${keys.length} Keys.`);
			return {
				id: uid(),
				kind: "multi",
				k,
				keys,
				sorted: name === "sortedmulti"
			};
		}
		case "thresh": {
			if (args.length < 2) throw new Error("thresh braucht k und Zweige.");
			const k = Number(args[0]);
			const children = args.slice(1).map((a) => parseExpression(a, 0).node);
			if (!Number.isInteger(k) || k < 1 || k > children.length) throw new Error(`thresh: k=${args[0]} passt nicht.`);
			return {
				id: uid(),
				kind: "thresh",
				k,
				children
			};
		}
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b":
			if (args.length !== 2) throw new Error(`${name} braucht genau zwei Argumente.`);
			return {
				id: uid(),
				kind: name,
				left: parseExpression(args[0], 0).node,
				right: parseExpression(args[1], 0).node
			};
		case "andor":
			if (args.length !== 3) throw new Error("andor braucht drei Argumente (X, Y, Z).");
			return {
				id: uid(),
				kind: "andor",
				x: parseExpression(args[0], 0).node,
				y: parseExpression(args[1], 0).node,
				z: parseExpression(args[2], 0).node
			};
		default: return hole();
	}
}
function skip(c) {
	while (c.i < c.s.length && /\s/.test(c.s[c.i])) c.i++;
}
function peekIdent(c) {
	const m = c.s.slice(c.i).match(/^[A-Za-z_][A-Za-z0-9_]*/);
	return m ? m[0] : null;
}
function readIdent(c) {
	const m = peekIdent(c);
	if (!m) return "";
	c.i += m.length;
	return m;
}
function readArgs(c) {
	if (c.s[c.i] !== "(") throw new Error("Erwartet '('.");
	c.i++;
	const args = [];
	let depth = 1;
	let start = c.i;
	let inBrackets = 0;
	while (c.i < c.s.length) {
		const ch = c.s[c.i];
		if (ch === "[") inBrackets++;
		if (ch === "]") inBrackets = Math.max(0, inBrackets - 1);
		if (ch === "(" && inBrackets === 0) depth++;
		else if (ch === ")" && inBrackets === 0) {
			depth--;
			if (depth === 0) {
				const piece = c.s.slice(start, c.i).trim();
				if (piece) args.push(piece);
				c.i++;
				return args;
			}
		} else if (ch === "," && depth === 1 && inBrackets === 0) {
			args.push(c.s.slice(start, c.i).trim());
			start = c.i + 1;
		}
		c.i++;
	}
	throw new Error("Klammern nicht geschlossen.");
}
var PLACEHOLDER_RE = /@(\d+)(?:\/\*\*|\/<[^>]+>\/\*|\/\*)?/g;
var XPUB_RE = /(?:xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+/;
function formatKeyOrigin(k) {
	const xpub = k.xpub.trim();
	if (!xpub) return "";
	if (xpub.startsWith("[")) {
		const parsed = parseKeyExpr(xpub);
		if (parsed.xpub) {
			const fp = formatFingerprint(parsed.fingerprint || k.fingerprint);
			const path = (parsed.derivation || k.derivation || "").replace(/^m\//, "");
			if (fp && path) return `[${fp}/${path}]${parsed.xpub}`;
			return parsed.xpub;
		}
	}
	const path = (k.derivation || "").replace(/^m\//, "").trim();
	const fp = formatFingerprint(k.fingerprint);
	if (fp && path) return `[${fp}/${path}]${xpub}`;
	if (fp) return `[${fp}]${xpub}`;
	return xpub;
}
function baseName(token) {
	const m = token.match(/^([A-Za-z_][A-Za-z_]*)(\d+)$/);
	return m ? m[1] : token;
}
function canonicalKey(token, keys, byName, reuse) {
	if (!reuse) return byName.get(token) || emptyKey(token);
	const direct = byName.get(token);
	if (direct?.xpub) {
		const same = keys.find((k) => k.xpub && k.xpub === direct.xpub);
		if (same) return same;
	}
	const parent = byName.get(baseName(token));
	if (parent) return parent;
	if (direct) return direct;
	return emptyKey(baseName(token));
}
function compileBip388(node, keys, name = "Scriptwerk", reuse = true) {
	const policyName = name.trim().slice(0, 64) || "Scriptwerk";
	if (hasHoles(node)) return {
		ok: false,
		policy: {
			name: policyName,
			template: "",
			keys: []
		},
		error: "Es fehlen noch Bausteine (leere Slots).",
		warnings: []
	};
	const normalized = keys.map(normalizeKeyEntry);
	const expanded = expandAliasKeys(node, normalized, reuse);
	const byName = new Map(expanded.map((k) => [k.name, k]));
	const tokens = collectKeys(node);
	const unique = [];
	const tokenIndex = /* @__PURE__ */ new Map();
	const seen = /* @__PURE__ */ new Map();
	for (const token of tokens) {
		const canon = canonicalKey(token, normalized, byName, reuse);
		const id = canon.xpub.trim() || `name:${canon.name}`;
		if (!seen.has(id)) {
			seen.set(id, unique.length);
			unique.push(canon);
		}
		tokenIndex.set(token, seen.get(id));
	}
	let inner = compileMiniscript(node);
	const sortedTokens = [...tokenIndex.keys()].sort((a, b) => b.length - a.length);
	for (const token of sortedTokens) {
		const i = tokenIndex.get(token);
		const re = new RegExp(`(?<![A-Za-z0-9_@])${escapeRe(token)}(?![A-Za-z0-9_])`, "g");
		inner = inner.replace(re, `@${i}/**`);
	}
	const policyKeys = unique.map((k, index) => ({
		index,
		name: k.name,
		fingerprint: formatFingerprint(k.fingerprint),
		derivation: (k.derivation || "").replace(/^m\//, ""),
		xpub: k.xpub.trim(),
		origin: formatKeyOrigin(k)
	}));
	const warnings = [];
	const missingXpub = policyKeys.filter((k) => !k.xpub).map((k) => k.name);
	if (missingXpub.length) warnings.push(`missingXpub:${missingXpub.join(",")}`);
	const missingFp = policyKeys.filter((k) => k.xpub && !k.fingerprint).map((k) => k.name);
	if (missingFp.length) warnings.push(`missingFp:${missingFp.join(",")}`);
	return {
		ok: true,
		policy: {
			name: policyName,
			template: `wsh(${inner})`,
			keys: policyKeys
		},
		warnings
	};
}
function escapeRe(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function walletPolicyToDescriptor(policy) {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
	return policy.template.replace(PLACEHOLDER_RE, (_whole, idx) => {
		const i = Number(idx);
		const k = policy.keys[i];
		if (k?.origin) return `${k.origin}/<0;1>/*`;
		if (k?.xpub) {
			const origin = formatKeyOrigin({
				...emptyKey(k.name || alphabet[i] || `K${i + 1}`),
				fingerprint: k.fingerprint,
				derivation: k.derivation,
				xpub: k.xpub
			});
			return origin ? `${origin}/<0;1>/*` : k.xpub;
		}
		return k?.name || alphabet[i] || `K${i + 1}`;
	});
}
function formatLedgerJson(policy) {
	const keyOrigins = policy.keys.map((k) => k.origin).filter(Boolean);
	return `${JSON.stringify({
		name: policy.name,
		format: "bip388",
		device: "ledger",
		template: policy.template,
		descriptor_template: policy.template,
		keys: keyOrigins,
		keyOrigins
	}, null, 2)}\n`;
}
function toLedgerPolicy(policy) {
	const name = policy.name.trim().replace(/[^\x20-\x7e]/g, "").slice(0, 16) || "Scriptwerk";
	const keys = policy.keys.map((k, index) => {
		const fingerprint = formatFingerprint(k.fingerprint);
		const derivation = (k.derivation || "").replace(/h/gi, "'").replace(/^m\//, "");
		const xpub = k.xpub.trim().replace(/\/<[^>]+>\/\*$/, "").replace(/\/\*$/, "");
		const origin = fingerprint && derivation && xpub ? `[${fingerprint}/${derivation}]${xpub}` : formatKeyOrigin({
			...emptyKey(k.name || `K${index}`),
			fingerprint,
			derivation,
			xpub
		});
		return {
			...k,
			fingerprint,
			derivation,
			xpub,
			origin
		};
	});
	return {
		name,
		template: policy.template.replace(/\bmulti\(/g, "sortedmulti("),
		keys
	};
}
function ledgerPolicyReady(policy) {
	const prepared = toLedgerPolicy(policy);
	if (prepared.keys.filter((k) => !k.origin || !k.xpub).length) return {
		ok: false,
		error: "hw.err.needKeys"
	};
	if (!prepared.template.startsWith("wsh(")) return {
		ok: false,
		error: "hw.err.template"
	};
	return {
		ok: true,
		policy: prepared
	};
}
function formatBitboxJson(policy) {
	const keys = policy.keys.filter((k) => k.xpub).map((k) => ({
		rootFingerprint: k.fingerprint,
		keypath: k.derivation ? `m/${k.derivation.replace(/^m\//, "")}` : "",
		xpub: k.xpub
	}));
	return `${JSON.stringify({
		name: policy.name,
		format: "bip388",
		device: "bitbox02",
		policy: policy.template,
		keys,
		scriptConfig: { policy: {
			policy: policy.template,
			keys
		} }
	}, null, 2)}\n`;
}
function formatPolicyText(policy) {
	return [
		`BIP388 ${policy.name}`,
		policy.template,
		...policy.keys.map((k) => k.origin ? `@${k.index} ${k.origin}` : `@${k.index} ${k.name}`)
	].join("\n");
}
function asRecord(v) {
	if (!v || typeof v !== "object" || Array.isArray(v)) return null;
	return v;
}
function firstString(rec, names) {
	for (const name of names) {
		const v = rec[name];
		if (typeof v === "string" && v.trim()) return v.trim();
	}
	return "";
}
function decodeFingerprint(raw) {
	if (typeof raw === "string") {
		const s = raw.replace(/^0x/i, "").replace(/^#/, "").trim();
		if (/^[0-9a-fA-F]{8}$/.test(s)) return s.toLowerCase();
		if (/^[A-Za-z0-9+/]+=*$/.test(s) && s.length >= 8) try {
			const bytes = Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
			if (bytes.length >= 4) return [...bytes.slice(0, 4)].map((b) => b.toString(16).padStart(2, "0")).join("");
		} catch {}
		return s.slice(0, 8).toLowerCase();
	}
	if (Array.isArray(raw) && raw.length >= 4) return raw.slice(0, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("");
	return "";
}
function decodeKeypath(raw) {
	if (typeof raw === "string") return raw.replace(/^m\//, "").replace(/h/g, "'");
	if (!Array.isArray(raw)) return "";
	return raw.map((n) => {
		const num = Number(n);
		if (!Number.isFinite(num)) return "0";
		return num >= 2147483648 ? `${num - 2147483648}'` : String(num);
	}).join("/");
}
function keyFromUnknown(v, index) {
	if (typeof v === "string") {
		const parsed = parseKeyExpr(v.trim());
		if (parsed.kind === "alias" && !parsed.xpub) {
			const extracted = v.match(XPUB_RE);
			if (!extracted) return null;
			return keyFromUnknown(extracted[0], index);
		}
		const name = `ABCDEFGHJKLMNPQRSTUVWXYZ`[index] ?? `K${index + 1}`;
		return {
			index,
			name,
			fingerprint: formatFingerprint(parsed.fingerprint),
			derivation: parsed.derivation.replace(/^m\//, ""),
			xpub: parsed.xpub,
			origin: formatKeyOrigin({
				...emptyKey(name),
				fingerprint: parsed.fingerprint,
				derivation: parsed.derivation,
				xpub: parsed.xpub
			})
		};
	}
	const rec = asRecord(v);
	if (!rec) return null;
	const xpubMatch = firstString(rec, [
		"xpub",
		"tpub",
		"extPubKey",
		"ExtPubKey",
		"pubkey"
	]).match(XPUB_RE)?.[0] ?? "";
	if (!xpubMatch) return null;
	const fp = decodeFingerprint(rec.rootFingerprint ?? rec.root_fingerprint ?? rec.fingerprint ?? rec.xfp ?? rec.fp);
	const derivation = decodeKeypath(rec.keypath ?? rec.path ?? rec.derivation ?? rec.deriv ?? rec.bip32_path);
	const name = firstString(rec, [
		"name",
		"label",
		"note"
	]) || `ABCDEFGHJKLMNPQRSTUVWXYZ`[index] || `K${index + 1}`;
	return {
		index,
		name,
		fingerprint: formatFingerprint(fp),
		derivation,
		xpub: xpubMatch,
		origin: formatKeyOrigin({
			...emptyKey(name),
			fingerprint: fp,
			derivation,
			xpub: xpubMatch
		})
	};
}
function pickTemplate(rec) {
	const nested = asRecord(rec.policy);
	const script = asRecord(rec.scriptConfig) ?? asRecord(rec.script_config);
	const scriptPolicy = script ? asRecord(script.policy) : null;
	const wallet = asRecord(rec.wallet);
	return [
		firstString(rec, [
			"template",
			"descriptor_template",
			"descriptorTemplate"
		]),
		nested ? firstString(nested, ["policy", "template"]) : "",
		scriptPolicy ? firstString(scriptPolicy, ["policy", "template"]) : "",
		wallet ? firstString(wallet, ["template", "policy"]) : "",
		typeof rec.policy === "string" ? rec.policy : ""
	].find((s) => s.includes("(")) ?? "";
}
function pickKeyList(rec) {
	if (Array.isArray(rec.keyOrigins)) return rec.keyOrigins;
	if (Array.isArray(rec.keys)) return rec.keys;
	const nested = asRecord(rec.policy);
	if (nested && Array.isArray(nested.keys)) return nested.keys;
	const script = asRecord(rec.scriptConfig) ?? asRecord(rec.script_config);
	const scriptPolicy = script ? asRecord(script.policy) : null;
	if (scriptPolicy && Array.isArray(scriptPolicy.keys)) return scriptPolicy.keys;
	return [];
}
function parseJsonPolicy(text) {
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		return null;
	}
	const rec = asRecord(parsed);
	if (!rec) return null;
	const template = pickTemplate(rec).replace(/\s+/g, "");
	if (!template || !/@\d+/.test(template)) return null;
	const keys = pickKeyList(rec).map((k, i) => keyFromUnknown(k, i)).filter((k) => Boolean(k));
	return {
		name: (firstString(rec, [
			"name",
			"label",
			"walletName"
		]) || "Scriptwerk").slice(0, 64),
		template,
		keys
	};
}
function parseTextPolicy(text) {
	const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
	if (!lines.length) return null;
	const joined = lines.join("\n");
	if (!/@\d+/.test(joined)) return null;
	const templateLine = lines.find((l) => /^(wsh|sh)\(/i.test(l.replace(/\s+/g, "")));
	if (!templateLine) return null;
	const template = templateLine.replace(/\s+/g, "");
	const nameLine = lines.find((l) => /^(name|wallet)\s*[:=]/i.test(l) || /^BIP388\s+\S/.test(l) || !XPUB_RE.test(l) && !/^(wsh|sh)\(/i.test(l) && !/^@\d+/.test(l) && l.length < 65);
	let name = "Scriptwerk";
	if (nameLine) {
		const labeled = nameLine.match(/^(?:name|wallet)\s*[:=]\s*(.+)$/i);
		const bip = nameLine.match(/^BIP388\s+(.+)$/i);
		name = (labeled?.[1] || bip?.[1] || (!templateLine.includes(nameLine) ? nameLine : "")).trim() || "Scriptwerk";
	}
	const keys = [];
	for (const line of lines) {
		if (line === templateLine) continue;
		const labeled = line.match(/^@(\d+)\s+(.+)$/);
		const raw = labeled ? labeled[2] : line;
		if (!XPUB_RE.test(raw) && !raw.startsWith("[")) continue;
		const index = labeled ? Number(labeled[1]) : keys.length;
		const key = keyFromUnknown(raw, index);
		if (key) keys[index] = {
			...key,
			index
		};
	}
	return {
		name: name.slice(0, 64),
		template,
		keys: keys.filter(Boolean)
	};
}
function parseWalletPolicy(text) {
	const raw = text.trim();
	if (!raw) return null;
	return parseJsonPolicy(raw) ?? parseTextPolicy(raw);
}
function materializeWalletPolicy(policy, existing) {
	const extracted = extractKeysFromTree(parseAny(walletPolicyToDescriptor(policy)).node, existing);
	const byXpub = new Map(policy.keys.filter((k) => k.xpub).map((k) => [k.xpub, k]));
	const keys = extracted.keys.map((k) => {
		const hit = k.xpub ? byXpub.get(k.xpub) : void 0;
		if (!hit) return k;
		const note = k.note || (hit.name && !/^[A-Z]$/.test(hit.name) && !/^K\d+$/.test(hit.name) ? hit.name : "");
		return {
			...k,
			fingerprint: k.fingerprint || hit.fingerprint,
			derivation: k.derivation || hit.derivation,
			note
		};
	});
	return {
		node: extracted.node,
		keys
	};
}
function explainPolicy(root, locale = "de") {
	const paths = mergePaths(flatten(root, 0, locale).sort((a, b) => a.delay - b.delay || a.label.localeCompare(b.label)));
	const groups = groupByDelay(paths);
	const narrative = groups.map((g) => t(locale, "explain.when", {
		when: blocksWhen(g.delay, locale),
		body: g.paths.map((p) => p.label).join(t(locale, "explain.or"))
	}));
	const immediate = paths.filter((p) => p.delay === 0).length;
	let title = t(locale, "explain.none");
	if (paths.length) {
		if (immediate === paths.length) title = paths.length === 1 ? t(locale, "explain.allNowOne") : t(locale, "explain.allNow", { n: paths.length });
		else if (immediate === 0) title = paths.length === 1 ? t(locale, "explain.allLaterOne") : t(locale, "explain.allLater", { n: paths.length });
		else title = t(locale, "explain.mix", {
			now: immediate,
			later: paths.length - immediate
		});
	}
	return {
		title,
		paths,
		groups,
		narrative: narrative.length ? narrative : [t(locale, "explain.empty")]
	};
}
function groupByDelay(paths) {
	const map = /* @__PURE__ */ new Map();
	for (const p of paths) {
		const list = map.get(p.delay) ?? [];
		list.push(p);
		map.set(p.delay, list);
	}
	return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([delay, items]) => ({
		delay,
		paths: items
	}));
}
function flatten(node, delay, locale) {
	switch (node.kind) {
		case "hole": return [{
			delay,
			label: t(locale, "explain.incomplete"),
			detail: t(locale, "explain.hole")
		}];
		case "pk": return [{
			delay,
			label: node.key,
			detail: `pk(${node.key})`
		}];
		case "pkh": return [{
			delay,
			label: t(locale, "explain.hash", { key: node.key }),
			detail: `pkh(${node.key})`
		}];
		case "multi": return [{
			delay,
			label: t(locale, "explain.kofn", {
				k: node.k,
				n: node.keys.length,
				keys: node.keys.join(" · ")
			}),
			detail: `multi(${node.k},${node.keys.join(",")})`
		}];
		case "older": return [{
			delay: delay + node.n,
			label: t(locale, "explain.timelock"),
			detail: `older(${node.n})`
		}];
		case "after": return [{
			delay,
			label: t(locale, "explain.afterBlock", { n: node.n.toLocaleString(numberLocale(locale)) }),
			detail: `after(${node.n})`
		}];
		case "wrap": return flatten(node.child, delay, locale);
		case "and_v":
		case "and_b": return andCombine(flatten(node.left, delay, locale), flatten(node.right, delay, locale), locale);
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return [...flatten(node.left, delay, locale), ...flatten(node.right, delay, locale)];
		case "andor": return [...andCombine(flatten(node.x, delay, locale), flatten(node.y, delay, locale), locale), ...flatten(node.z, delay, locale)];
		case "thresh": {
			const childPaths = node.children.map((c) => flatten(c, delay, locale));
			return [{
				delay,
				label: t(locale, "explain.thresh", {
					k: node.k,
					n: node.children.length
				}),
				detail: childPaths.map((p, i) => `(${i + 1}) ${p.map((x) => x.label).join(" + ")}`).join(" · ")
			}];
		}
	}
}
function andCombine(a, b, locale) {
	const lock = t(locale, "explain.timelock");
	const out = [];
	for (const x of a) for (const y of b) out.push({
		delay: Math.max(x.delay, y.delay),
		label: joinAnd(x.label, y.label, lock),
		detail: `${x.detail} ∧ ${y.detail}`
	});
	return out;
}
function joinAnd(a, b, lock) {
	if (a === lock) return b;
	if (b === lock) return a;
	return `${a} + ${b}`;
}
function mergePaths(paths) {
	const map = /* @__PURE__ */ new Map();
	for (const p of paths) {
		const key = `${p.delay}|${p.label}`;
		if (!map.has(key)) map.set(key, p);
	}
	return [...map.values()];
}
function holeTitle(hint, locale) {
	if (!hint) return t(locale, "sub.slot");
	if (hint.startsWith("sub.branchN:")) return t(locale, "sub.branchN", { n: hint.slice(12) });
	if (hint.includes(".")) return t(locale, hint);
	return hint;
}
function nodeTitle(node, locale = "de") {
	switch (node.kind) {
		case "hole": return holeTitle(node.hint, locale);
		case "pk": return `pk ${node.key}`;
		case "pkh": return `pkh ${node.key}`;
		case "multi": return `${node.sorted ? "sortedmulti" : "multi"} ${node.k}/${node.keys.length}`;
		case "thresh": return `thresh ${node.k}/${node.children.length}`;
		case "older": return `older ${node.n}`;
		case "after": return `after ${node.n}`;
		case "wrap": return `${node.wrap}:`;
		default: return node.kind;
	}
}
function nodeSubtitle(node, locale = "de") {
	switch (node.kind) {
		case "hole": return t(locale, "sub.pick");
		case "pk":
		case "pkh": return t(locale, "sub.key");
		case "multi": return node.keys.join(" · ");
		case "older": return blocksToHuman(node.n, locale);
		case "after": return t(locale, "sub.block", { n: node.n.toLocaleString(numberLocale(locale)) });
		case "and_v":
		case "and_b": return t(locale, "sub.both");
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return t(locale, "sub.either");
		case "andor": return "(X ∧ Y) ∨ Z";
		case "thresh": return t(locale, "sub.any");
		case "wrap": return "";
	}
}
function validatePolicy(root, locale = "de") {
	if (!root) return [{
		level: "info",
		message: t(locale, "val.noPolicy")
	}];
	const issues = [];
	if (hasHoles(root)) issues.push({
		level: "error",
		message: t(locale, "val.holes")
	});
	visit(root, (n) => {
		if (n.kind === "older") {
			if (n.n < 1 || n.n > 65535) issues.push({
				level: "error",
				message: t(locale, "val.olderRange", { n: n.n })
			});
		}
		if (n.kind === "multi") {
			if (n.k < 1 || n.k > n.keys.length) issues.push({
				level: "error",
				message: t(locale, "val.multiK", {
					k: n.k,
					n: n.keys.length
				})
			});
			if (n.keys.length > 20) issues.push({
				level: "error",
				message: t(locale, "val.multiMax")
			});
			const dup = n.keys.filter((k, i) => n.keys.indexOf(k) !== i);
			if (dup.length) issues.push({
				level: "warn",
				message: t(locale, "val.multiDup", { names: [...new Set(dup)].join(", ") })
			});
		}
		if (n.kind === "and_v") {
			if (!isVerifyish(n.left)) issues.push({
				level: "warn",
				message: t(locale, "val.andV")
			});
		}
	});
	const keys = collectKeys(root);
	const reused = reusedNames(root);
	if (reused.length) issues.push({
		level: "info",
		message: t(locale, "val.reuse", { names: reused.join(", ") })
	});
	if (compileMiniscript(root).length > 360 && !hasHoles(root)) issues.push({
		level: "warn",
		message: t(locale, "val.long")
	});
	if (keys.length >= 5) issues.push({
		level: "info",
		message: t(locale, "val.manyKeys", { n: keys.length })
	});
	const depth = treeDepth(root);
	if (depth >= 6) issues.push({
		level: "warn",
		message: t(locale, "val.depth", { n: depth })
	});
	return issues;
}
function isVerifyish(n) {
	if (n.kind === "wrap" && n.wrap === "v") return true;
	if (n.kind === "and_v") return true;
	return false;
}
function reusedNames(root) {
	const counts = /* @__PURE__ */ new Map();
	visit(root, (n) => {
		const add = (k) => counts.set(k, (counts.get(k) ?? 0) + 1);
		if (n.kind === "pk" || n.kind === "pkh") add(n.key);
		if (n.kind === "multi") n.keys.forEach(add);
	});
	return [...counts.entries()].filter(([, c]) => c > 1).map(([k]) => k);
}
function treeDepth(n) {
	switch (n.kind) {
		case "thresh": return 1 + Math.max(0, ...n.children.map(treeDepth));
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return 1 + Math.max(treeDepth(n.left), treeDepth(n.right));
		case "andor": return 1 + Math.max(treeDepth(n.x), treeDepth(n.y), treeDepth(n.z));
		case "wrap": return 1 + treeDepth(n.child);
		default: return 1;
	}
}
var WRAPPERS = [
	{
		code: "v",
		summary: "VERIFY – bricht bei Fehlschlag ab (für and_v nötig)"
	},
	{
		code: "a",
		summary: "Altstack – für thresh-Zweige"
	},
	{
		code: "c",
		summary: "CHECKSIG auf einem Key-Fragment"
	},
	{
		code: "d",
		summary: "DUP IF … ENDIF (dissatisfiable)"
	},
	{
		code: "n",
		summary: "0NOTEQUAL"
	},
	{
		code: "t",
		summary: "and_v(X,1) – unit-true"
	},
	{
		code: "u",
		summary: "or_i(X,0)"
	},
	{
		code: "l",
		summary: "or_i(0,X)"
	},
	{
		code: "s",
		summary: "SWAP"
	},
	{
		code: "j",
		summary: "SIZE 0NOTEQUAL IF"
	}
];
var OPERATORS = [
	{
		id: "pk",
		label: "pk",
		group: "keys",
		summary: "Signatur eines öffentlichen Schlüssels",
		hint: "Sofort spendbar mit diesem Key. In Native SegWit die übliche Form.",
		params: [{
			name: "key",
			kind: "key"
		}]
	},
	{
		id: "pkh",
		label: "pkh",
		group: "keys",
		summary: "Signatur zum Hash eines Schlüssels",
		hint: "Spart Platz im Script, Key kommt erst beim Spenden. Oft in Liana-Exporten.",
		params: [{
			name: "key",
			kind: "key"
		}]
	},
	{
		id: "multi",
		label: "multi",
		group: "keys",
		summary: "k-von-n CHECKMULTISIG",
		hint: "Klassisches Multisig. Maximal 20 Keys. Reihenfolge der Keys ist relevant.",
		params: [{
			name: "k",
			kind: "int",
			min: 1,
			max: 20
		}, {
			name: "keys",
			kind: "keylist"
		}]
	},
	{
		id: "older",
		label: "older",
		group: "time",
		summary: "Relatives Timelock (CSV, Blöcke)",
		hint: "Gültig, wenn die Coin-Age ≥ n Blöcke ist. Max 65535. 144 Blöcke ≈ 1 Tag.",
		params: [{
			name: "n",
			kind: "blocks",
			min: 1,
			max: 65535
		}]
	},
	{
		id: "after",
		label: "after",
		group: "time",
		summary: "Absolutes Timelock (CLTV)",
		hint: "Gültig ab Blockhöhe n. Für UTXO-Alter eher older verwenden.",
		params: [{
			name: "n",
			kind: "blocks",
			min: 1,
			max: 5e8
		}]
	},
	{
		id: "and_v",
		label: "and_v",
		group: "and",
		summary: "Beide Zweige müssen gelten",
		hint: "Linkes Kind muss vom Typ V sein (oft v:pk). Standard-UND für Policies.",
		params: []
	},
	{
		id: "and_b",
		label: "and_b",
		group: "and",
		summary: "BOOLAND der beiden Zweige",
		hint: "Seltener; für boolesche Kombinationen in thresh.",
		params: []
	},
	{
		id: "andor",
		label: "andor",
		group: "and",
		summary: "(X und Y) oder Z",
		hint: "Kompakte Vererbung: z. B. andor(pk(Backup), older(n), multi(2,A,B,C)).",
		params: []
	},
	{
		id: "or_i",
		label: "or_i",
		group: "or",
		summary: "IF / ELSE – einer der beiden Zweige",
		hint: "Stabilste ODER-Form in Nunchuk. Witness wählt den Zweig (1 oder 0).",
		params: []
	},
	{
		id: "or_d",
		label: "or_d",
		group: "or",
		summary: "IFDUP NOTIF – kompakteres ODER",
		hint: "Gut für A+(B oder C): and_v(v:pk(A), or_d(pk(B), pk(C))). Linker Zweig muss dissatisfiable sein.",
		params: []
	},
	{
		id: "or_c",
		label: "or_c",
		group: "or",
		summary: "NOTIF – Verify-ODER",
		hint: "Rechter Zweig vom Typ V. Kompakter, weniger flexibel.",
		params: []
	},
	{
		id: "or_b",
		label: "or_b",
		group: "or",
		summary: "BOOLOR der beiden Zweige",
		hint: "Beide Zweige werden ausgeführt. Für thresh-artige Konstruktionen.",
		params: []
	},
	{
		id: "thresh",
		label: "thresh",
		group: "thresh",
		summary: "k von n beliebigen Fragmenten",
		hint: "Allgemeiner als multi: Zweige können Keys, Zeit oder ganze Policies sein.",
		params: [{
			name: "k",
			kind: "int",
			min: 1,
			max: 20
		}]
	}
];
function buildOperator(id, params) {
	switch (id) {
		case "pk": return {
			id: uid(),
			kind: "pk",
			key: params.key?.trim() || "A"
		};
		case "pkh": return {
			id: uid(),
			kind: "pkh",
			key: params.key?.trim() || "A"
		};
		case "multi": {
			const keys = (params.keys ?? [
				"A",
				"B",
				"C"
			]).map((k) => k.trim()).filter(Boolean);
			const k = Math.min(Math.max(params.k ?? 2, 1), Math.max(keys.length, 1));
			return {
				id: uid(),
				kind: "multi",
				k,
				keys: keys.length ? keys : ["A", "B"]
			};
		}
		case "older": return {
			id: uid(),
			kind: "older",
			n: clamp(params.n ?? 144, 1, 65535)
		};
		case "after": return {
			id: uid(),
			kind: "after",
			n: Math.max(params.n ?? 8e5, 1)
		};
		case "and_v":
		case "and_b": return {
			id: uid(),
			kind: id,
			left: hole("sub.left"),
			right: hole("sub.right")
		};
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return {
			id: uid(),
			kind: id,
			left: hole("sub.branchA"),
			right: hole("sub.branchB")
		};
		case "andor": return {
			id: uid(),
			kind: "andor",
			x: hole("X"),
			y: hole("Y"),
			z: hole("Z")
		};
		case "thresh": {
			const count = Math.max(params.childCount ?? 3, 2);
			const k = clamp(params.k ?? 2, 1, count);
			return {
				id: uid(),
				kind: "thresh",
				k,
				children: Array.from({ length: count }, (_, i) => hole(`sub.branchN:${i + 1}`))
			};
		}
		default: return hole();
	}
}
function wrapNode(child, wrap) {
	return {
		id: uid(),
		kind: "wrap",
		wrap,
		child
	};
}
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, Math.round(n)));
}
var DELAY_PRESETS = [
	0,
	1,
	144,
	1008,
	4320,
	52596,
	6e4,
	65534
];
function defaultStages() {
	return [{
		id: uid("st"),
		delay: 0,
		k: 2,
		keys: [
			"A",
			"B",
			"C"
		]
	}];
}
function nextStageDelay(stages) {
	const max = Math.max(0, ...stages.map((s) => s.delay));
	if (max <= 0) return 52596;
	if (max < 6e4) return 6e4;
	if (max < 65534) return 65534;
	return Math.min(65534, max);
}
function cleanedStages(stages) {
	return stages.map((s) => ({
		...s,
		keys: s.keys.map((k) => k.trim()).filter(Boolean),
		delay: Math.max(0, Math.round(Number(s.delay) || 0)),
		k: Math.max(1, Math.round(Number(s.k) || 1))
	})).filter((s) => s.keys.length > 0).sort((a, b) => a.delay - b.delay || a.id.localeCompare(b.id));
}
function reuseAliasHints(stages, reuse) {
	const map = /* @__PURE__ */ new Map();
	const cleaned = cleanedStages(stages);
	const counts = /* @__PURE__ */ new Map();
	for (const s of cleaned) for (const k of s.keys) counts.set(k, (counts.get(k) ?? 0) + 1);
	const seen = /* @__PURE__ */ new Map();
	for (const s of cleaned) for (const name of s.keys) {
		if ((counts.get(name) ?? 0) <= 1) continue;
		const n = (seen.get(name) ?? 0) + 1;
		seen.set(name, n);
		const list = map.get(name) ?? [];
		if (reuse) list.push({
			alias: `${name}${n}`,
			delay: s.delay
		});
		else if (n > 1) list.push({
			alias: `${name}${n - 1}`,
			delay: s.delay,
			account: n - 1
		});
		map.set(name, list);
	}
	return map;
}
function isDerivedAlias(name, masters) {
	const set = masters instanceof Set ? masters : new Set(masters);
	if (set.has(name)) return false;
	const m = name.match(/^([A-Za-z_][A-Za-z_]*)(\d+)$/);
	return Boolean(m && set.has(m[1]));
}
function compileStages(stages, reuse = true) {
	const cleaned = cleanedStages(stages);
	if (!cleaned.length) return {
		root: {
			id: uid(),
			kind: "hole",
			hint: "Stufe"
		},
		aliases: []
	};
	const counts = /* @__PURE__ */ new Map();
	for (const s of cleaned) for (const k of s.keys) counts.set(k, (counts.get(k) ?? 0) + 1);
	const seen = /* @__PURE__ */ new Map();
	function alias(name) {
		if ((counts.get(name) ?? 0) <= 1) return name;
		const n = (seen.get(name) ?? 0) + 1;
		seen.set(name, n);
		if (reuse) return `${name}${n}`;
		return n === 1 ? name : `${name}${n - 1}`;
	}
	const aliases = [];
	function body(s) {
		const names = s.keys.map((k) => {
			const a = alias(k);
			aliases.push(a);
			return a;
		});
		const k = Math.min(Math.max(s.k, 1), names.length);
		if (names.length === 1 && k === 1) return {
			id: uid(),
			kind: "pk",
			key: names[0]
		};
		return {
			id: uid(),
			kind: "multi",
			k,
			keys: names
		};
	}
	function locked(s) {
		const b = body(s);
		if (s.delay <= 0) return b;
		return {
			id: uid(),
			kind: "and_v",
			left: {
				id: uid(),
				kind: "wrap",
				wrap: "v",
				child: b
			},
			right: {
				id: uid(),
				kind: "older",
				n: Math.min(s.delay, 65535)
			}
		};
	}
	let acc = locked(cleaned[0]);
	for (let i = 1; i < cleaned.length; i++) acc = {
		id: uid(),
		kind: "or_i",
		left: locked(cleaned[i]),
		right: acc
	};
	return {
		root: acc,
		aliases
	};
}
function insertInto(root, selectedId, next) {
	if (!root) return next;
	if (!selectedId) return next;
	if (!findNode(root, selectedId)) return next;
	return mapNode(root, selectedId, () => next);
}
function unwrapOneAround(root, targetId) {
	if (root.kind === "wrap" && (root.id === targetId || coreOf(root).id === targetId)) return root.child;
	switch (root.kind) {
		case "thresh": return {
			...root,
			children: root.children.map((c) => unwrapOneAround(c, targetId))
		};
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return {
			...root,
			left: unwrapOneAround(root.left, targetId),
			right: unwrapOneAround(root.right, targetId)
		};
		case "andor": return {
			...root,
			x: unwrapOneAround(root.x, targetId),
			y: unwrapOneAround(root.y, targetId),
			z: unwrapOneAround(root.z, targetId)
		};
		case "wrap": return {
			...root,
			child: unwrapOneAround(root.child, targetId)
		};
		default: return root;
	}
}
function mergeKeyLists(current, incoming) {
	const byName = new Map(current.map((k) => [k.name, k]));
	const out = [...current];
	for (const k of incoming) {
		const hit = byName.get(k.name);
		if (hit) {
			const i = out.findIndex((x) => x.id === hit.id);
			out[i] = {
				...hit,
				fingerprint: k.fingerprint || hit.fingerprint,
				derivation: k.derivation || hit.derivation,
				xpub: k.xpub || hit.xpub,
				multipath: k.multipath || hit.multipath,
				childPath: k.childPath || hit.childPath,
				children: (k.children?.length ? k.children : hit.children) ?? [],
				note: k.note || hit.note
			};
		} else {
			out.push(k);
			byName.set(k.name, k);
		}
	}
	return out;
}
function keysForStages(stages, current, network) {
	const names = [...new Set(stages.flatMap((s) => s.keys))];
	const masters = new Set(names);
	const byName = new Map(current.map((k) => [k.name, k]));
	const out = [];
	for (const name of names) {
		const prev = byName.get(name);
		out.push(prev ? normalizeKeyEntry(prev) : emptyKey(name, network));
	}
	for (const k of current) {
		if (names.includes(k.name)) continue;
		if (isDerivedAlias(k.name, masters)) continue;
		if (k.xpub) out.push(normalizeKeyEntry(k));
	}
	return out;
}
function applyStageTree(stages, current, network, reuseKeys) {
	const { root } = compileStages(stages, reuseKeys);
	return {
		stages,
		root,
		keys: keysForStages(stages, current, network),
		selectedId: root.id,
		importError: null
	};
}
var memoryStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
};
var useStudio = create()(persist((set, get) => ({
	keys: [
		emptyKey("A"),
		emptyKey("B"),
		emptyKey("C")
	],
	root: null,
	stages: [],
	selectedId: null,
	network: "mainnet",
	reuseKeys: true,
	locale: "de",
	importError: null,
	setNetwork: (network) => {
		const nextPath = network === "testnet" ? "48'/1'/0'/2'" : "48'/0'/0'/2'";
		const prevPath = network === "testnet" ? "48'/0'/0'/2'" : "48'/1'/0'/2'";
		set({
			network,
			keys: get().keys.map((k) => !k.xpub && (!k.derivation || k.derivation === prevPath) ? {
				...k,
				derivation: nextPath
			} : k)
		});
	},
	setReuseKeys: (reuseKeys) => {
		const { stages, keys, network } = get();
		if (stages.length) {
			set({
				reuseKeys,
				...applyStageTree(stages, keys, network, reuseKeys)
			});
			return;
		}
		set({ reuseKeys });
	},
	setLocale: (locale) => set({ locale: isLocale(locale) ? locale : "de" }),
	select: (selectedId) => set({ selectedId }),
	setRoot: (root) => set({
		root,
		selectedId: root?.id ?? null
	}),
	setStages: (stages) => set(applyStageTree(stages, get().keys, get().network, get().reuseKeys)),
	applyOperator: (opId, params) => {
		const node = buildOperator(opId, params);
		const { root, selectedId } = get();
		set({
			root: insertInto(root, selectedId, node),
			selectedId: node.id,
			importError: null,
			stages: []
		});
	},
	wrapSelected: (wrap) => {
		const { root, selectedId } = get();
		if (!root || !selectedId) return;
		const target = findNode(root, selectedId);
		if (!target) return;
		const wrapped = wrapNode(target, wrap);
		set({
			root: mapNode(root, selectedId, () => wrapped),
			selectedId: wrapped.id,
			stages: []
		});
	},
	unwrapSelected: () => {
		const { root, selectedId } = get();
		if (!root || !selectedId) return;
		const target = findNode(root, selectedId);
		if (!target) return;
		if (target.kind === "wrap") {
			set({
				root: mapNode(root, selectedId, () => target.child),
				selectedId: target.child.id,
				stages: []
			});
			return;
		}
		set({
			root: unwrapOneAround(root, selectedId),
			stages: []
		});
	},
	deleteSelected: () => {
		const { root, selectedId } = get();
		if (!root || !selectedId) return;
		if (root.id === selectedId) {
			set({
				root: null,
				selectedId: null,
				stages: []
			});
			return;
		}
		const nextHole = hole();
		set({
			root: mapNode(root, selectedId, () => nextHole),
			selectedId: nextHole.id,
			stages: []
		});
	},
	patchNode: (id, patch) => {
		const { root } = get();
		if (!root) return;
		set({
			root: mapNode(root, id, (n) => ({
				...n,
				...patch
			})),
			stages: []
		});
	},
	addKey: () => {
		const names = get().keys.map((k) => k.name);
		set({ keys: [...get().keys, emptyKey(nextKeyName(names), get().network)] });
	},
	updateKey: (id, patch) => {
		set({ keys: get().keys.map((k) => k.id === id ? {
			...k,
			...patch
		} : k) });
	},
	removeKey: (id) => {
		const { keys, stages, reuseKeys } = get();
		const removed = keys.find((k) => k.id === id);
		const nextKeys = keys.filter((k) => k.id !== id);
		if (!removed || !stages.length) {
			set({ keys: nextKeys });
			return;
		}
		const nextStages = stages.map((s) => {
			const names = s.keys.filter((n) => n !== removed.name);
			return {
				...s,
				keys: names,
				k: Math.min(s.k, Math.max(names.length, 1))
			};
		}).filter((s) => s.keys.length);
		set(applyStageTree(nextStages.length ? nextStages : defaultStages(), nextKeys, get().network, reuseKeys));
	},
	removeChild: (keyId, childId) => {
		set({ keys: get().keys.map((k) => {
			if (k.id !== keyId) return k;
			const cur = normalizeKeyEntry(k);
			return {
				...cur,
				children: cur.children.filter((c) => c.id !== childId)
			};
		}) });
	},
	importText: (text) => {
		const wallet = parseWalletPolicy(text);
		if (wallet) {
			try {
				const extracted = materializeWalletPolicy(wallet, get().keys);
				set({
					root: extracted.node,
					selectedId: extracted.node.id,
					keys: extracted.keys,
					stages: [],
					importError: null
				});
			} catch (e) {
				set({ importError: e instanceof Error ? e.message : t(get().locale, "import.fail") });
			}
			return;
		}
		const keyList = parseKeyList(text);
		if (keyList) {
			set({
				keys: mergeKeyLists(get().keys, keyList),
				importError: null
			});
			return;
		}
		try {
			const extracted = extractKeysFromTree(parseAny(text).node, get().keys);
			set({
				root: extracted.node,
				selectedId: extracted.node.id,
				keys: extracted.keys,
				stages: [],
				importError: null
			});
		} catch (e) {
			set({ importError: e instanceof Error ? e.message : t(get().locale, "import.fail") });
		}
	},
	importKeysText: (text) => {
		const keyList = parseKeyList(text);
		if (!keyList) {
			set({ importError: t(get().locale, "import.noXpubs") });
			return;
		}
		set({
			keys: mergeKeyLists(get().keys, keyList),
			importError: null
		});
	},
	importKeyText: (id, text) => {
		const target = get().keys.find((k) => k.id === id);
		if (!target) return t(get().locale, "err.noKey");
		const result = applyKeyMaterial(target, text);
		if (!result.ok) return localizeMessage(get().locale, result.error);
		set({
			keys: get().keys.map((k) => k.id === id ? result.key : k),
			importError: null
		});
		return null;
	},
	importChildText: (id, text, opts) => {
		const target = get().keys.find((k) => k.id === id);
		if (!target) return t(get().locale, "err.noKey");
		const parsed = parseChildKey(normalizeKeyEntry(target), text, opts);
		if (!parsed.ok) return localizeMessage(get().locale, parsed.error);
		if (target.children?.some((c) => c.path === parsed.child.path)) return t(get().locale, "err.dupChild");
		set({ keys: get().keys.map((k) => k.id === id ? normalizeKeyEntry({
			...k,
			children: [...k.children ?? [], parsed.child]
		}) : k) });
		return null;
	},
	reset: () => set(applyStageTree(defaultStages(), [], get().network, get().reuseKeys))
}), {
	name: "scriptwerk-studio-v2",
	storage: createJSONStorage(() => typeof window === "undefined" ? memoryStorage : localStorage),
	partialize: (s) => ({
		keys: s.keys,
		root: s.root,
		stages: s.stages,
		network: s.network,
		reuseKeys: s.reuseKeys,
		locale: s.locale
	}),
	skipHydration: true
}));
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-muted text-fg-muted",
		accent: "bg-primary text-primary-foreground",
		warn: "bg-warn/15 text-warn",
		danger: "bg-danger/15 text-danger",
		ok: "bg-ok/15 text-ok"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
			outline: "border border-border bg-transparent hover:bg-muted",
			ghost: "hover:bg-muted",
			destructive: "bg-danger text-danger-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
		className: "size-full rounded-[inherit]",
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
		orientation: "vertical",
		className: "flex w-2 touch-none p-px select-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
	})]
}));
ScrollArea.displayName = Root.displayName;
function useT() {
	const locale = useStudio((s) => s.locale);
	return {
		locale,
		setLocale: useStudio((s) => s.setLocale),
		t: (0, import_react.useCallback)((key, vars) => t(locale, key, vars), [locale])
	};
}
function InterpreterPanel() {
	const { t, locale } = useT();
	const root = useStudio((s) => s.root);
	const keys = useStudio((s) => s.keys);
	const reuseKeys = useStudio((s) => s.reuseKeys);
	const explained = root ? explainPolicy(root, locale) : explainPolicy({
		id: "empty",
		kind: "hole"
	}, locale);
	const issues = validatePolicy(root, locale);
	const compiled = root ? compileDescriptor(root, keys, reuseKeys) : {
		ok: false,
		miniscript: "",
		descriptor: "",
		error: t("read.noPolicy")
	};
	const ms = root ? compileMiniscript(root) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
		className: "h-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase",
						children: t("read.title")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-lg leading-snug tracking-tight text-balance",
						children: explained.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 space-y-2",
						children: explained.narrative.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm text-pretty text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-2 font-mono text-2xs text-fg-subtle",
								children: String(i + 1).padStart(2, "0")
							}), line]
						}, i))
					})
				] }),
				explained.groups.length > 0 && root ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "space-y-1.5",
					children: explained.groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-surface px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm",
								children: blocksWhen(g.delay, locale)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: g.delay === 0 ? "ok" : "default",
								children: g.delay === 0 ? t("read.now") : t("read.blocksShort", { n: g.delay.toLocaleString(numberLocale(locale)) })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 space-y-0.5",
							children: g.paths.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "font-mono text-2xs break-all text-fg-subtle",
								children: [p.label, p.detail !== p.label ? ` · ${p.detail}` : ""]
							}, p.label))
						})]
					}, g.delay))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase",
					children: t("read.check")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5",
					children: issues.map((iss, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: iss.level === "error" ? "danger" : iss.level === "warn" ? "warn" : "default",
							children: iss.level
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-pretty text-fg-muted",
							children: iss.message
						})]
					}, i))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, {
					title: "Miniscript",
					value: ms
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, {
					title: "Descriptor (wsh)",
					value: compiled.ok ? compiled.descriptor : compiled.error ?? ""
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, {
					title: "BSMS",
					value: compiled.ok ? compileBsms(compiled.descriptor) : ""
				})
			]
		})
	});
}
function CopyBlock({ title, value }) {
	const { t } = useT();
	const [done, setDone] = (0, import_react.useState)(false);
	if (!value) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-1.5 flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "sm",
			className: "h-8",
			onClick: async () => {
				await navigator.clipboard.writeText(value);
				setDone(true);
				toast.success(t("read.copied"));
				setTimeout(() => setDone(false), 1200);
			},
			children: [done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), t("read.copy")]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "max-h-40 overflow-auto rounded-lg border border-border bg-ink px-3 py-2 font-mono text-2xs leading-relaxed break-all whitespace-pre-wrap text-paper",
		children: value
	})] });
}
var Dialog = Dialog$1;
var DialogTrigger = DialogTrigger$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-bg/70", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed top-1/2 left-1/2 z-50 w-[min(560px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-elevated p-5 shadow-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute top-3 right-3 rounded-md p-2 text-fg-muted hover:bg-muted hover:text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Schließen"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1 pr-8", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("font-display text-lg font-medium tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-fg-muted", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg shadow-none transition-colors placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
	ref,
	className: cn("text-xs font-medium tracking-wide text-fg-muted", className),
	...props
}));
Label.displayName = "Label";
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-11 items-center gap-1 rounded-lg bg-muted p-1", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-fg-muted transition-colors data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-sm", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-3 outline-none", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	className: cn("flex min-h-32 w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-fg placeholder:text-fg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
	ref,
	...props
}));
Textarea.displayName = "Textarea";
function QrPreview({ value, label, compact }) {
	const { t } = useT();
	const [src, setSrc] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setError(null);
		setSrc(null);
		if (!value) {
			setError(t("qr.none"));
			return;
		}
		import_lib.toDataURL(value, {
			errorCorrectionLevel: value.length > 800 ? "L" : "M",
			margin: 1,
			width: compact ? 200 : 320,
			color: {
				dark: "#0b0c0e",
				light: "#ffffff"
			}
		}).then((url) => {
			if (!cancelled) setSrc(url);
		}).catch(() => {
			if (!cancelled) setError(t("qr.long"));
		});
		return () => {
			cancelled = true;
		};
	}, [
		value,
		t,
		compact
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3",
		children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt: t("qr.alt", { label }),
			className: compact ? "size-40 rounded-lg bg-paper p-2" : "size-64 rounded-lg bg-paper p-2",
			width: compact ? 160 : 256,
			height: compact ? 160 : 256
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: compact ? "flex size-40 items-center justify-center rounded-lg border border-border bg-surface text-xs text-fg-muted" : "flex size-64 items-center justify-center rounded-lg border border-border bg-surface text-xs text-fg-muted",
			children: error ?? t("qr.building")
		}), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-danger",
			children: error
		}) : null]
	});
}
function QrScanner({ onRead, compact }) {
	const { t } = useT();
	const videoRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const [camError, setCamError] = (0, import_react.useState)(null);
	const [active, setActive] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!active) return;
		let stream = null;
		let raf = 0;
		let stopped = false;
		async function start() {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment" },
					audio: false
				});
				const video = videoRef.current;
				if (!video) return;
				video.srcObject = stream;
				await video.play();
				const tick = () => {
					if (stopped) return;
					const canvas = canvasRef.current;
					if (video && canvas && video.readyState >= 2) {
						canvas.width = video.videoWidth;
						canvas.height = video.videoHeight;
						const ctx = canvas.getContext("2d");
						if (ctx && canvas.width && canvas.height) {
							ctx.drawImage(video, 0, 0);
							const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
							const code = (0, import_jsQR.default)(img.data, img.width, img.height);
							if (code?.data) {
								onRead(code.data);
								stopped = true;
								return;
							}
						}
					}
					raf = requestAnimationFrame(tick);
				};
				raf = requestAnimationFrame(tick);
			} catch {
				setCamError(t("qr.noCam"));
				setActive(false);
			}
		}
		start();
		return () => {
			stopped = true;
			cancelAnimationFrame(raf);
			stream?.getTracks().forEach((tr) => tr.stop());
		};
	}, [
		active,
		onRead,
		t
	]);
	function onFile(file) {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.drawImage(img, 0, 0);
			const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const code = (0, import_jsQR.default)(data.data, data.width, data.height);
			URL.revokeObjectURL(url);
			if (code?.data) onRead(code.data);
			else setCamError(t("qr.noCode"));
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			setCamError(t("qr.badImage"));
		};
		img.src = url;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl border border-border bg-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					className: "aspect-video max-h-40 w-full object-cover",
					muted: true,
					playsInline: true
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "hidden"
			}),
			camError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-danger",
				children: camError
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: active ? "secondary" : "outline",
						onClick: () => setActive((v) => !v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}), active ? t("qr.camOff") : t("qr.cam")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => fileRef.current?.click(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUp, {}),
							" ",
							t("qr.image")
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: (e) => {
							const f = e.target.files?.[0];
							if (f) onFile(f);
							e.target.value = "";
						}
					})
				]
			})
		]
	});
}
var DEMO_XPUBS = [
	"xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5hqK5Gb4u1Q2ZbQW2kfykAPzh9RQQJwYvNUbaMhEaKfLUWuBvYJMTx5N",
	"xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8",
	"xpub6D4BDPcP2GT577Vvch3R8WUkKAVonqrBH13JC6iqnMuzFjVsT8g3NBRgIQlnAjkE8kKNFUBBSa5RLDjEFtaY3wQaULPgLUfowojV5SMX3sM",
	"xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV"
];
function accountIndex(path) {
	const m = normalizeHwPath(path).match(/\/(\d+)'\/2'$/);
	return m ? Number(m[1]) : 0;
}
function wait(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
function openDemoSession(kind) {
	const fingerprint = kind === "ledger" ? "c0ffee01" : "b17b0b02";
	return {
		kind,
		demo: true,
		label: kind === "ledger" ? "Ledger Nano (Demo)" : "BitBox02 (Demo)",
		fingerprint,
		product: kind === "ledger" ? "Ledger Bitcoin App" : "BitBox02 BTC",
		async getXpub(path) {
			await wait(450);
			const derivation = pathToDerivation(path);
			const xpub = DEMO_XPUBS[accountIndex(path) % DEMO_XPUBS.length];
			return {
				xpub,
				fingerprint,
				derivation,
				origin: formatOrigin(fingerprint, path, xpub)
			};
		},
		async registerPolicy(_policy) {
			await wait(700);
			return { hmac: "demo" };
		},
		async close() {}
	};
}
function refreshHid() {
	return detectHid();
}
var useHardware = create((set, get) => ({
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
		set({
			open,
			hid: refreshHid(),
			error: open ? get().error : null
		});
	},
	setPendingKey: (id) => set({ pendingKeyId: id }),
	connect: async (kind, demo = false) => {
		const prev = get().session;
		if (prev) await prev.close().catch(() => void 0);
		set({
			status: demo ? "connecting" : "picking",
			kind,
			demo,
			error: null,
			pairingCode: null,
			session: null,
			hid: refreshHid()
		});
		try {
			const session = demo ? openDemoSession(kind) : kind === "ledger" ? await (await import("./ledger-CRr7fGBv.mjs")).openLedgerSession() : await (await import("./bitbox-CbSNca7j.mjs")).openBitBoxSession((code) => set({
				pairingCode: code,
				status: code ? "pairing" : "connecting"
			}), () => {
				const cur = get();
				if (cur.kind === "bitbox" && !cur.demo) set({
					status: "idle",
					session: null,
					fingerprint: "",
					label: "",
					pairingCode: null
				});
			});
			if (demo && kind === "bitbox") {
				set({
					status: "pairing",
					pairingCode: "K7T9",
					session: null
				});
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
				error: null
			});
		} catch (err) {
			set({
				status: "error",
				session: null,
				pairingCode: null,
				error: hwErrorMessage(err)
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
			lastHmac: null
		});
		if (session) await session.close().catch(() => void 0);
	},
	fetchXpub: async (path, display = true) => {
		const session = get().session;
		if (!session) throw new Error("hw.err.notConnected");
		const network = useStudio.getState().network;
		const p = path || defaultAccountPath(network);
		set({
			status: "busy",
			error: null
		});
		try {
			const result = await session.getXpub(p, display);
			set({ status: "ready" });
			return result;
		} catch (err) {
			set({
				status: "error",
				error: hwErrorMessage(err)
			});
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
		if (session && key && !key.note.trim()) useStudio.getState().updateKey(keyId, { note: session.kind === "ledger" ? "Ledger" : "BitBox" });
	},
	fillEmptyKeys: async () => {
		const { keys, network } = useStudio.getState();
		const empty = keys.filter((k) => !k.xpub.trim());
		let n = 0;
		for (let i = 0; i < empty.length; i++) {
			const key = empty[i];
			const path = key.derivation?.trim() ? `m/${key.derivation.replace(/^m\//, "")}` : defaultAccountPath(network, i);
			await get().fillKey(key.id, path);
			n++;
		}
		return n;
	},
	registerPolicy: async (policy) => {
		const session = get().session;
		if (!session) throw new Error("hw.err.notConnected");
		set({
			status: "busy",
			error: null
		});
		try {
			set({
				status: "ready",
				lastHmac: (await session.registerPolicy(policy)).hmac ?? "ok"
			});
		} catch (err) {
			set({
				status: "error",
				error: hwErrorMessage(err)
			});
			throw err;
		}
	}
}));
function HardwareButton() {
	const { t } = useT();
	const open = useHardware((s) => s.open);
	const setOpen = useHardware((s) => s.setOpen);
	const status = useHardware((s) => s.status);
	const ready = status === "ready" || status === "busy";
	(0, import_react.useEffect)(() => {
		useHardware.setState({ hid: detectHid() });
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				"aria-pressed": ready,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usb, {}),
					t("header.usb"),
					ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-0.5 size-1.5 rounded-full bg-ok",
						"aria-hidden": true
					}) : null
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardwareDialogBody, {})]
	});
}
function HardwareDialogBody() {
	const { t, locale } = useT();
	const status = useHardware((s) => s.status);
	const kind = useHardware((s) => s.kind);
	const demo = useHardware((s) => s.demo);
	const label = useHardware((s) => s.label);
	const fingerprint = useHardware((s) => s.fingerprint);
	const pairingCode = useHardware((s) => s.pairingCode);
	const error = useHardware((s) => s.error);
	const hid = useHardware((s) => s.hid);
	const pendingKeyId = useHardware((s) => s.pendingKeyId);
	const lastHmac = useHardware((s) => s.lastHmac);
	const connect = useHardware((s) => s.connect);
	const disconnect = useHardware((s) => s.disconnect);
	const fillKey = useHardware((s) => s.fillKey);
	const fillEmptyKeys = useHardware((s) => s.fillEmptyKeys);
	const registerPolicy = useHardware((s) => s.registerPolicy);
	const keys = useStudio((s) => s.keys);
	const root = useStudio((s) => s.root);
	const network = useStudio((s) => s.network);
	const reuseKeys = useStudio((s) => s.reuseKeys);
	const [path, setPath] = (0, import_react.useState)(defaultAccountPath(network));
	const [busyAction, setBusyAction] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setPath(defaultAccountPath(network));
	}, [network]);
	const pending = keys.find((k) => k.id === pendingKeyId) ?? null;
	const emptyCount = keys.filter((k) => !k.xpub.trim()).length;
	const bip = (0, import_react.useMemo)(() => root ? compileBip388(root, keys, "Scriptwerk", reuseKeys) : null, [
		root,
		keys,
		reuseKeys
	]);
	const ready = status === "ready" || status === "busy";
	const errText = error ? localizeMessage(locale, error) : null;
	async function run(fn) {
		setBusyAction("1");
		try {
			await fn();
		} catch (err) {
			const msg = localizeMessage(locale, err instanceof Error ? err.message : "hw.err.generic");
			toast.error(msg);
		} finally {
			setBusyAction(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-h-[min(720px,calc(100dvh-2rem))] w-[min(520px,calc(100vw-1.5rem))] overflow-y-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("hw.title") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("hw.blurb") })] }),
			hid === "missing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-warn",
				children: t("hw.needChrome")
			}) : null,
			hid === "iframe" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-warn",
				children: t("hw.iframe")
			}) : null,
			!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceCard, {
					title: t("export.ledger"),
					hint: t("hw.ledgerHint"),
					disabled: status === "picking" || status === "connecting" || status === "pairing",
					onUsb: () => run(async () => {
						await connect("ledger", false);
						toast.success(t("hw.connected"));
					}),
					onDemo: () => run(async () => {
						await connect("ledger", true);
						toast.success(t("hw.demoOn"));
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceCard, {
					title: t("export.bitbox"),
					hint: t("hw.bitboxHint"),
					disabled: status === "picking" || status === "connecting" || status === "pairing",
					onUsb: () => run(async () => {
						await connect("bitbox", false);
						toast.success(t("hw.connected"));
					}),
					onDemo: () => run(async () => {
						await connect("bitbox", true);
						toast.success(t("hw.demoOn"));
					})
				})]
			}) : null,
			status === "pairing" && pairingCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border-strong bg-surface px-4 py-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs tracking-[0.14em] text-fg-subtle uppercase",
						children: t("hw.pairing")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-3xl tracking-[0.3em] text-fg",
						children: pairingCode
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-fg-muted",
						children: t("hw.pairingBlurb")
					})
				]
			}) : null,
			status === "picking" || status === "connecting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg-muted",
				children: kind === "ledger" ? t("hw.waitLedger") : t("hw.waitBitbox")
			}) : null,
			errText ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-danger",
				children: errText
			}) : null,
			ready && kind ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-surface px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-fg",
							children: [label, demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-2xs text-fg-subtle uppercase",
								children: t("hw.demo")
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-2xs text-fg-muted",
							children: fingerprint || "—"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "hw-path",
							children: t("keys.bip32")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "hw-path",
							value: path,
							onChange: (e) => setPath(e.target.value),
							className: "font-mono text-xs"
						})]
					}),
					pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-fg-muted",
						children: t("hw.pendingKey", { name: pending.name })
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								disabled: Boolean(busyAction),
								onClick: () => run(async () => {
									const target = pending ?? keys.find((k) => !k.xpub.trim()) ?? keys[0];
									if (!target) {
										toast.error(t("keys.empty"));
										return;
									}
									await fillKey(target.id, path);
									toast.success(t("keys.taken", { name: target.name }));
								}),
								children: t("hw.fetchKey")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								disabled: Boolean(busyAction) || emptyCount === 0,
								onClick: () => run(async () => {
									const n = await fillEmptyKeys();
									toast.success(t("hw.filled", { n }));
								}),
								children: t("hw.fillEmpty")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								disabled: Boolean(busyAction) || !bip?.ok,
								onClick: () => run(async () => {
									if (!bip?.ok) {
										toast.error(bip?.error ?? t("export.none"));
										return;
									}
									await registerPolicy(bip.policy);
									toast.success(t("hw.registered"));
								}),
								children: t("hw.register")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => void disconnect(),
								children: t("hw.disconnect")
							})
						]
					}),
					lastHmac && lastHmac !== "ok" && lastHmac !== "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-2xs break-all text-fg-subtle",
						children: ["HMAC ", lastHmac]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs text-fg-subtle",
						children: t("hw.registerHint")
					})
				]
			}) : null
		]
	});
}
function DeviceCard({ title, hint, disabled, onUsb, onDemo }) {
	const { t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 rounded-xl border border-border bg-surface p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs text-pretty text-fg-muted",
				children: hint
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				disabled,
				onClick: onUsb,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Usb, {}),
					" ",
					t("hw.connectUsb")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				disabled,
				onClick: onDemo,
				children: t("hw.connectDemo")
			})
		]
	});
}
function useHwFillKey(keyId, onOrigin) {
	const { t, locale } = useT();
	const setOpen = useHardware((s) => s.setOpen);
	const setPendingKey = useHardware((s) => s.setPendingKey);
	const fillKey = useHardware((s) => s.fillKey);
	const fetchXpub = useHardware((s) => s.fetchXpub);
	const sessionKind = useHardware((s) => s.kind);
	const status = useHardware((s) => s.status);
	return async (kind, path) => {
		setPendingKey(keyId);
		if (status === "ready" && sessionKind === kind) {
			try {
				if (onOrigin) {
					onOrigin((await fetchXpub(path)).origin);
					return;
				}
				await fillKey(keyId, path);
				toast.success(t("keys.taken", { name: useStudio.getState().keys.find((k) => k.id === keyId)?.name ?? "" }));
			} catch (err) {
				toast.error(localizeMessage(locale, err instanceof Error ? err.message : "hw.err.generic"));
			}
			return;
		}
		setOpen(true);
	};
}
function ImportExportBar() {
	const { t } = useT();
	const root = useStudio((s) => s.root);
	const keys = useStudio((s) => s.keys);
	const reuseKeys = useStudio((s) => s.reuseKeys);
	const importText = useStudio((s) => s.importText);
	const importError = useStudio((s) => s.importError);
	const reset = useStudio((s) => s.reset);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [exportOpen, setExportOpen] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [walletName, setWalletName] = (0, import_react.useState)("Scriptwerk");
	const compiled = root ? compileDescriptor(root, keys, reuseKeys) : null;
	const miniscript = compiled?.miniscript ?? "";
	const descriptor = compiled?.ok ? compiled.descriptor : "";
	const bsms = descriptor ? compileBsms(descriptor) : "";
	const bip = (0, import_react.useMemo)(() => root ? compileBip388(root, keys, walletName, reuseKeys) : null, [
		root,
		keys,
		walletName,
		reuseKeys
	]);
	function download(filename, body) {
		const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
	function exportFiles() {
		if (!compiled?.ok) {
			toast.error(compiled?.error ?? t("export.none"));
			return;
		}
		download("scriptwerk.miniscript.txt", compiled.miniscript);
		download("scriptwerk.descriptor.txt", compiled.descriptor);
		download("scriptwerk.bsms", compileBsms(compiled.descriptor));
		if (bip?.ok) {
			download("scriptwerk-ledger.json", formatLedgerJson(bip.policy));
			download("scriptwerk-bitbox.json", formatBitboxJson(bip.policy));
		}
		toast.success(bip?.ok ? t("export.okDevices") : t("export.ok"));
	}
	const onQrRead = (0, import_react.useCallback)((text) => {
		importText(text);
		if (!useStudio.getState().importError) {
			setOpen(false);
			toast.success(t("import.qrOk"));
		}
	}, [importText, t]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 flex-1 flex-wrap items-center gap-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardwareButton, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, {}),
							" ",
							t("header.import")
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "w-[min(640px,calc(100vw-1.5rem))]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("import.title") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("import.blurb") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "qr",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "flex h-auto w-full flex-wrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "qr",
									className: "flex-1",
									children: "QR"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "policy",
									className: "flex-1",
									children: t("import.policy")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
								value: "qr",
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrScanner, {
									compact: true,
									onRead: onQrRead
								}), importError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-danger",
									children: importError
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
								value: "policy",
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: draft,
										onChange: (e) => setDraft(e.target.value),
										placeholder: "wsh(…)  ·  BIP-388 JSON (Ledger / BitBox)",
										className: "min-h-40"
									}),
									importError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-danger",
										children: importError
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-end gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											onClick: () => setOpen(false),
											children: t("ops.cancel")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: () => {
												importText(draft);
												if (!useStudio.getState().importError) {
													setOpen(false);
													toast.success(t("import.loaded"));
												}
											},
											children: t("import.read")
										})]
									})
								]
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
				open: exportOpen,
				onOpenChange: setExportOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, {}),
							" ",
							t("header.export")
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[min(720px,calc(100dvh-2rem))] w-[min(640px,calc(100vw-1.5rem))] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("export.title") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("export.blurb") })] }),
						compiled && !compiled.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: compiled.error
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							defaultValue: "descriptor",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "flex h-auto w-full flex-wrap",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "descriptor",
											className: "px-2.5 text-xs",
											children: "Descriptor"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "miniscript",
											className: "px-2.5 text-xs",
											children: "Miniscript"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "ledger",
											className: "px-2.5 text-xs",
											children: t("export.ledger")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "bitbox",
											className: "px-2.5 text-xs",
											children: t("export.bitbox")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "bsms",
											className: "px-2.5 text-xs",
											children: "BSMS"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
									value: "descriptor",
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrPreview, {
										value: descriptor,
										label: "Descriptor"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyText, { value: descriptor })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
									value: "miniscript",
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrPreview, {
										value: miniscript,
										label: "Miniscript"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyText, { value: miniscript })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "ledger",
									className: "space-y-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceExport, {
										kind: "ledger",
										result: bip,
										name: walletName,
										onName: setWalletName
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "bitbox",
									className: "space-y-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeviceExport, {
										kind: "bitbox",
										result: bip,
										name: walletName,
										onName: setWalletName
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
									value: "bsms",
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrPreview, {
										value: bsms,
										label: "BSMS"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyText, { value: bsms })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: exportFiles,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}),
									" ",
									t("export.files")
								]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: reset,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}),
					" ",
					t("header.reset")
				]
			})
		]
	});
}
function DeviceExport({ kind, result, name, onName }) {
	const { t } = useT();
	if (!result) return null;
	if (!result.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-danger",
		children: result.error
	});
	const json = kind === "ledger" ? formatLedgerJson(result.policy) : formatBitboxJson(result.policy);
	const text = formatPolicyText(result.policy);
	const qrValue = json.length > 1200 ? text : json;
	const filename = kind === "ledger" ? "scriptwerk-ledger.json" : "scriptwerk-bitbox.json";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-pretty text-fg-muted",
				children: t(kind === "ledger" ? "export.ledgerBlurb" : "export.bitboxBlurb")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `wallet-name-${kind}`,
					children: t("export.policyName")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `wallet-name-${kind}`,
					value: name,
					maxLength: 64,
					onChange: (e) => onName(e.target.value)
				})]
			}),
			result.warnings.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-warn",
				children: formatWarning(w, t)
			}, w)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrPreview, {
				value: qrValue,
				label: kind === "ledger" ? "Ledger" : "BitBox",
				compact: true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs text-fg-subtle",
				children: t("export.register")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase",
					children: t("export.template")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "max-h-16 overflow-auto rounded-lg border border-border bg-ink px-3 py-2 font-mono text-2xs leading-relaxed break-all whitespace-pre-wrap text-paper",
					children: result.policy.template
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: async () => {
							await navigator.clipboard.writeText(json);
							toast.success(t("read.copied"));
						},
						children: t("export.copyJson")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: async () => {
							await navigator.clipboard.writeText(result.policy.template);
							toast.success(t("read.copied"));
						},
						children: t("export.copyTemplate")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							const blob = new Blob([json], { type: "application/json;charset=utf-8" });
							const url = URL.createObjectURL(blob);
							const a = document.createElement("a");
							a.href = url;
							a.download = filename;
							a.click();
							URL.revokeObjectURL(url);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}),
							" ",
							t("export.downloadDevice")
						]
					})
				]
			})
		]
	});
}
function formatWarning(w, t) {
	if (w.startsWith("missingXpub:")) return t("export.needXpub", { names: w.slice(12) });
	if (w.startsWith("missingFp:")) return t("export.needFp", { names: w.slice(10) });
	return w;
}
function CopyText({ value }) {
	const { t } = useT();
	if (!value) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "max-h-28 overflow-auto rounded-lg border border-border bg-ink px-3 py-2 font-mono text-2xs leading-relaxed break-all whitespace-pre-wrap text-paper",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			className: "w-full",
			onClick: async () => {
				await navigator.clipboard.writeText(value);
				toast.success(t("read.copied"));
			},
			children: t("export.copy")
		})]
	});
}
var TooltipProvider = Provider;
var Tooltip = Root3;
var TooltipTrigger = Trigger$1;
var TooltipContent = import_react.forwardRef(({ className, sideOffset = 6, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	sideOffset,
	className: cn("z-50 max-w-xs rounded-md border border-border bg-elevated px-3 py-2 text-xs text-fg shadow-md", className),
	...props
}) }));
TooltipContent.displayName = Content2.displayName;
function OperatorPalette() {
	const { t } = useT();
	const applyOperator = useStudio((s) => s.applyOperator);
	const wrapSelected = useStudio((s) => s.wrapSelected);
	const keys = useStudio((s) => s.keys);
	const [pending, setPending] = (0, import_react.useState)(null);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const op of OPERATORS) {
			const list = map.get(op.group) ?? [];
			list.push(op);
			map.set(op.group, list);
		}
		return [...map.entries()];
	}, []);
	function onPick(op) {
		if (op.params.length === 0 && op.id !== "thresh") {
			applyOperator(op.id, {});
			return;
		}
		setPending(op);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pt-4 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase",
					children: t("ops.title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-fg-muted",
					children: t("ops.blurb")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1 px-3 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [groups.map(([group, ops]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-1.5 px-1 text-2xs font-medium tracking-wide text-fg-subtle",
						children: t(`group.${ops[0].group}`)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-1.5",
						children: ops.map((op) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-label": op.label,
								onClick: () => onPick(op),
								className: "rounded-lg border border-border bg-surface px-2.5 py-2 text-left transition-colors hover:border-border-strong hover:bg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-mono text-xs text-fg",
									children: op.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-2xs leading-snug text-fg-muted",
									children: t(`op.${op.id}.summary`)
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: t(`op.${op.id}.hint`) })] }, op.id))
					})] }, group)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-1.5 px-1 text-2xs font-medium tracking-wide text-fg-subtle",
						children: t("ops.wrap")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: WRAPPERS.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-label": t("ops.wrapAria", { code: w.code }),
								onClick: () => wrapSelected(w.code),
								className: "h-9 min-w-9 rounded-md border border-border bg-surface px-2 font-mono text-xs hover:bg-muted",
								children: [w.code, ":"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: t(`wrap.${w.code}`) })] }, w.code))
					})] })]
				})
			}),
			pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParamDialog, {
				op: pending,
				keyNames: keys.map((k) => k.name),
				onClose: () => setPending(null),
				onApply: (params) => {
					applyOperator(pending.id, params);
					setPending(null);
				}
			}) : null
		]
	});
}
function ParamDialog({ op, keyNames, onClose, onApply }) {
	const { t } = useT();
	const [key, setKey] = (0, import_react.useState)(keyNames[0] ?? "A");
	const [keys, setKeys] = (0, import_react.useState)(keyNames.slice(0, 3).length ? keyNames.slice(0, 3) : [
		"A",
		"B",
		"C"
	]);
	const [n, setN] = (0, import_react.useState)(op.id === "older" ? 144 : 8e5);
	const [k, setK] = (0, import_react.useState)(2);
	const [childCount, setChildCount] = (0, import_react.useState)(3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
			className: "font-mono",
			children: op.label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t(`op.${op.id}.hint`) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				op.params.some((p) => p.kind === "key") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$2, {
					label: t("ops.key"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeySelect, {
						value: key,
						names: keyNames,
						onChange: setKey
					})
				}) : null,
				op.params.some((p) => p.kind === "keylist") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$2, {
					label: t("ops.keyOrder"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [keys.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeySelect, {
								value: item,
								names: keyNames,
								onChange: (v) => setKeys(keys.map((x, j) => j === i ? v : x))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "icon",
								className: "size-11 shrink-0",
								onClick: () => setKeys(keys.filter((_, j) => j !== i)),
								disabled: keys.length <= 2,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
							})]
						}, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: () => setKeys([...keys, keyNames[keys.length] ?? `K${keys.length + 1}`]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Key"]
						})]
					})
				}) : null,
				op.params.some((p) => p.kind === "int") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$2, {
					label: t("ops.threshold"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						max: 20,
						value: k,
						onChange: (e) => setK(Number(e.target.value))
					})
				}) : null,
				op.id === "thresh" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$2, {
					label: t("ops.branches"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 2,
						max: 8,
						value: childCount,
						onChange: (e) => setChildCount(Number(e.target.value))
					})
				}) : null,
				op.params.some((p) => p.kind === "blocks") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field$2, {
					label: op.id === "older" ? t("ops.blocksCsv") : t("ops.heightCltv"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						value: n,
						onChange: (e) => setN(Number(e.target.value))
					}), op.id === "older" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: DELAY_PRESETS.filter((v) => v > 0).map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-8 rounded-full border border-border px-2.5 text-2xs text-fg-muted hover:bg-muted hover:text-fg",
							onClick: () => setN(v),
							children: v === 1 ? t("delay.block") : t(`delay.${v}`)
						}, v))
					}) : null]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: onClose,
						children: t("ops.cancel")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => onApply({
							key,
							keys,
							n,
							k,
							childCount
						}),
						children: t("ops.insert")
					})]
				})
			]
		})] })
	});
}
function Field$2({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function KeySelect({ value, names, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		list: "scriptwerk-keys",
		value,
		onChange: (e) => onChange(e.target.value),
		className: "font-mono"
	});
}
function KeyDatalist() {
	const keys = useStudio((s) => s.keys);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
		id: "scriptwerk-keys",
		children: keys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: k.name }, k.id))
	});
}
function NodeInspector() {
	const { t } = useT();
	const root = useStudio((s) => s.root);
	const selectedId = useStudio((s) => s.selectedId);
	const patchNode = useStudio((s) => s.patchNode);
	const deleteSelected = useStudio((s) => s.deleteSelected);
	const unwrapSelected = useStudio((s) => s.unwrapSelected);
	const node = root && selectedId ? findNode(root, selectedId) : null;
	if (!node) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-4 py-4 text-xs text-fg-muted",
		children: t("insp.empty")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-sm",
					children: node.kind === "hole" ? t("insp.hole") : node.kind
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1",
					children: [node.kind === "wrap" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: unwrapSelected,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, {}),
							" ",
							t("insp.unwrap")
						]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: deleteSelected,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}),
							" ",
							t("insp.delete")
						]
					})]
				})]
			}),
			node.kind === "pk" || node.kind === "pkh" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: t("ops.key"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					list: "scriptwerk-keys",
					className: "font-mono",
					value: node.key,
					onChange: (e) => patchNode(node.id, { key: e.target.value })
				})
			}) : null,
			node.kind === "older" || node.kind === "after" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: node.kind === "older" ? t("insp.blocks") : t("insp.height"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					value: node.n,
					onChange: (e) => patchNode(node.id, { n: Number(e.target.value) })
				})
			}) : null,
			node.kind === "multi" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "k",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					min: 1,
					max: node.keys.length,
					value: node.k,
					onChange: (e) => patchNode(node.id, { k: Number(e.target.value) })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: t("insp.keysCsv"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "font-mono",
					value: node.keys.join(","),
					onChange: (e) => patchNode(node.id, { keys: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
				})
			})] }) : null,
			node.kind === "thresh" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field$1, {
				label: "k",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "number",
					min: 1,
					max: node.children.length,
					value: node.k,
					onChange: (e) => patchNode(node.id, { k: Number(e.target.value) })
				})
			}) : null,
			node.kind === "hole" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-fg-muted",
				children: t("insp.fill")
			}) : null
		]
	});
}
function Field$1({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
var NW = 176;
var NH = 56;
var WRAP_H = 26;
var WRAP_GY = 8;
var GX = 28;
var GY = 56;
function kidsOf(n) {
	switch (n.kind) {
		case "thresh": return n.children;
		case "and_v":
		case "and_b":
		case "or_i":
		case "or_d":
		case "or_c":
		case "or_b": return [n.left, n.right];
		case "andor": return [
			n.x,
			n.y,
			n.z
		];
		case "wrap": return [n.child];
		default: return [];
	}
}
function edgeLabel(parent, index, locale) {
	if (parent.kind === "and_v" || parent.kind === "and_b") return t(locale, "edge.and");
	if (parent.kind === "or_i" || parent.kind === "or_d" || parent.kind === "or_c" || parent.kind === "or_b") return t(locale, "edge.or");
	if (parent.kind === "andor") return index === 2 ? t(locale, "edge.else") : index === 0 ? "X" : "Y";
}
function measure(n) {
	const kids = kidsOf(n).map(measure);
	const kidsW = kids.reduce((s, k) => s + k.w, 0) + GX * Math.max(0, kids.length - 1);
	const kidsH = kids.reduce((m, k) => Math.max(m, k.h), 0);
	const boxH = n.kind === "wrap" ? WRAP_H : NH;
	const gap = n.kind === "wrap" ? WRAP_GY : GY;
	return {
		node: n,
		w: Math.max(NW, kidsW),
		h: boxH + (kids.length ? gap + kidsH : 0),
		boxH,
		gap,
		kids
	};
}
function place(m, x, y, boxes, edges, locale) {
	const boxX = x + (m.w - NW) / 2;
	boxes.push({
		id: m.node.id,
		x: boxX,
		y,
		w: NW,
		h: m.boxH,
		title: nodeTitle(m.node, locale),
		subtitle: nodeSubtitle(m.node, locale),
		kind: m.node.kind,
		hole: m.node.kind === "hole"
	});
	const childY = y + m.boxH + m.gap;
	let cx = x + (m.w - (m.kids.reduce((s, k) => s + k.w, 0) + GX * Math.max(0, m.kids.length - 1))) / 2;
	m.kids.forEach((k, i) => {
		const kx = cx + (k.w - NW) / 2;
		edges.push({
			from: m.node.id,
			to: k.node.id,
			x1: boxX + NW / 2,
			y1: y + m.boxH,
			x2: kx + NW / 2,
			y2: childY,
			label: m.node.kind === "wrap" ? void 0 : edgeLabel(m.node, i, locale)
		});
		place(k, cx, childY, boxes, edges, locale);
		cx += k.w + GX;
	});
}
function layoutTree(root, locale = "de") {
	if (!root) return {
		boxes: [],
		edges: [],
		width: 320,
		height: 200
	};
	const m = measure(root);
	const boxes = [];
	const edges = [];
	place(m, 24, 20, boxes, edges, locale);
	return {
		boxes,
		edges,
		width: m.w + 48,
		height: m.h + 40
	};
}
function KeyBoard() {
	const { t } = useT();
	const keys = useStudio((s) => s.keys).map(normalizeKeyEntry);
	const stages = useStudio((s) => s.stages);
	const network = useStudio((s) => s.network);
	const setNetwork = useStudio((s) => s.setNetwork);
	const reuseKeys = useStudio((s) => s.reuseKeys);
	const setReuseKeys = useStudio((s) => s.setReuseKeys);
	const [expandedId, setExpandedId] = (0, import_react.useState)(null);
	const [detailsId, setDetailsId] = (0, import_react.useState)(null);
	const details = keys.find((k) => k.id === detailsId) ?? null;
	const aliases = reuseAliasHints(stages, reuseKeys);
	const masters = new Set(stages.flatMap((s) => s.keys));
	const visible = stages.length ? keys.filter((k) => !isDerivedAlias(k.name, masters)) : keys;
	function closeDetails() {
		setDetailsId(null);
		setExpandedId(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shrink-0 border-b border-border bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-2 px-4 pt-3 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase",
					children: t("keys.title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-fg-muted",
					children: t("keys.blurb")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": reuseKeys,
							onClick: () => setReuseKeys(!reuseKeys),
							className: `h-8 rounded-full border px-3 text-xs ${reuseKeys ? "border-border-strong bg-muted text-fg" : "border-border text-fg-muted"}`,
							children: reuseKeys ? t("keys.reuseOn") : t("keys.reuseOff")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setNetwork("mainnet"),
							className: `h-8 rounded-full border px-3 text-xs ${network === "mainnet" ? "border-border-strong bg-muted text-fg" : "border-border text-fg-muted"}`,
							children: "Mainnet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setNetwork("testnet"),
							className: `h-8 rounded-full border px-3 text-xs ${network === "testnet" ? "border-border-strong bg-muted text-fg" : "border-border text-fg-muted"}`,
							children: "Testnet"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-64 overflow-auto px-4 pb-3",
				children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-2 text-xs text-fg-muted",
					children: t("keys.empty")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: visible.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyTile, {
						entry: k,
						expanded: expandedId === k.id,
						aliases: aliases.get(k.name) ?? [],
						reuseOff: !reuseKeys,
						onToggle: () => {
							if (expandedId === k.id) {
								setDetailsId(k.id);
								return;
							}
							setExpandedId(k.id);
						}
					}, k.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyImportDialog, {
				entry: details,
				open: Boolean(details),
				onOpenChange: (open) => !open && closeDetails()
			})
		]
	});
}
function KeyTile({ entry, expanded, aliases, reuseOff, onToggle }) {
	const { t } = useT();
	const filled = keyIsFilled(entry);
	const label = keyTileLabel(entry);
	const tree = filled || entry.fingerprint ? buildKeyTree(entry, aliases) : null;
	if (!expanded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-key-tile": entry.name,
		"aria-expanded": false,
		onClick: onToggle,
		className: `h-10 max-w-44 truncate rounded-md border px-2.5 text-left text-xs transition-colors duration-150 ${filled ? "border-border-strong bg-surface text-fg hover:bg-elevated" : "border-dashed border-border bg-transparent text-fg-muted hover:bg-muted hover:text-fg"} ${/^[0-9a-f]{8}$/.test(label) || label === entry.name ? "font-mono" : ""}`,
		children: label
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-key-tile": entry.name,
		"aria-expanded": true,
		onClick: onToggle,
		className: `w-full basis-full rounded-xl border p-3 text-left transition-colors duration-150 ${filled ? "border-border-strong bg-surface hover:bg-elevated" : "border-dashed border-border bg-transparent hover:bg-muted"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm text-fg",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 font-mono text-2xs text-fg-subtle",
					children: entry.name
				})]
			}),
			tree ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyTreeView, { node: tree })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-fg-muted",
				children: t("keys.importHint")
			}),
			filled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xs text-fg-subtle",
				children: t("keys.tapDetails")
			}) : null,
			reuseOff && aliases.some((a) => a.account != null) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xs text-fg-muted",
				children: t("keys.nextAccount", { path: nextUnusedAccount(entry).path })
			}) : null
		]
	});
}
function KeyTreeView({ node, depth = 0 }) {
	const kids = node.children.filter((c) => c.label.trim());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: depth === 0 ? void 0 : "ml-1.5 border-l border-border pl-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "font-mono text-2xs leading-5 text-fg",
			children: [node.label, node.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-2 text-fg-muted",
				children: node.hint
			}) : null]
		}), kids.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyTreeView, {
			node: c,
			depth: depth + 1
		}, `${c.label}-${i}`))]
	});
}
function KeyImportDialog({ entry, open, onOpenChange }) {
	const { t } = useT();
	const importKeyText = useStudio((s) => s.importKeyText);
	const importChildText = useStudio((s) => s.importChildText);
	const updateKey = useStudio((s) => s.updateKey);
	const removeChild = useStudio((s) => s.removeChild);
	const network = useStudio((s) => s.network);
	const reuseKeys = useStudio((s) => s.reuseKeys);
	const stages = useStudio((s) => s.stages);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [childDraft, setChildDraft] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [detailId, setDetailId] = (0, import_react.useState)("master");
	const [detailDraft, setDetailDraft] = (0, import_react.useState)({
		note: "",
		fingerprint: "",
		derivation: "",
		xpub: "",
		childPath: ""
	});
	const [childDetail, setChildDetail] = (0, import_react.useState)({
		path: "",
		fingerprint: "",
		xpub: "",
		note: ""
	});
	const filled = entry ? keyIsFilled(entry) : false;
	const hwTarget = (0, import_react.useRef)("master");
	const fetchHw = useHwFillKey(entry?.id ?? "", (origin) => {
		if (hwTarget.current === "child") setChildDraft(origin);
		else setDraft(origin);
		setError(null);
	});
	const needs = entry ? reuseAliasHints(stages, reuseKeys).get(entry.name) ?? [] : [];
	const next = entry ? nextUnusedAccount(entry, network) : {
		account: 1,
		path: "48'/0'/1'/2'"
	};
	const nextNeed = needs.find((n) => n.account != null && !childForAccount(entry, n.account));
	const onRead = (0, import_react.useCallback)((text) => {
		if (!entry) return;
		const err = importKeyText(entry.id, text);
		if (err) {
			setError(err);
			return;
		}
		setDraft("");
		setError(null);
		toast.success(t("keys.taken", { name: entry.name }));
	}, [
		entry,
		importKeyText,
		t
	]);
	const onChild = (0, import_react.useCallback)((text) => {
		if (!entry) return;
		const err = importChildText(entry.id, text, {
			fallbackPath: next.path,
			alias: nextNeed?.alias
		});
		if (err) {
			setError(err);
			return;
		}
		setChildDraft("");
		setError(null);
		toast.success(t("keys.childTaken"));
	}, [
		entry,
		importChildText,
		next.path,
		nextNeed?.alias,
		t
	]);
	function openDetailsFrom(nextOpen) {
		if (!nextOpen) {
			setDraft("");
			setChildDraft("");
			setError(null);
			setDetailId("master");
		} else if (entry) setDetailDraft({
			note: entry.note,
			fingerprint: entry.fingerprint,
			derivation: entry.derivation,
			xpub: entry.xpub,
			childPath: entry.childPath
		});
		onOpenChange(nextOpen);
	}
	if (!entry) return null;
	const child = entry.children.find((c) => c.id === detailId) ?? null;
	const preview = draft.trim() ? applyKeyMaterial(entry, draft) : null;
	const childPreview = childDraft.trim() ? parseChildKey(entry, childDraft, {
		fallbackPath: next.path,
		alias: nextNeed?.alias
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: openDetailsFrom,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "flex max-h-[min(720px,calc(100dvh-2rem))] w-[min(520px,calc(100vw-1.5rem))] flex-col overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [keyTileLabel(entry), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-2 font-mono text-sm font-normal text-fg-muted",
				children: entry.name
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("keys.dialogBlurb") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "master",
				className: "flex min-h-0 flex-1 flex-col overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "master",
								className: "flex-1",
								children: t("keys.master")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "children",
								className: "flex-1",
								children: t("keys.children")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "details",
								className: "flex-1",
								children: t("keys.details")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "master",
						className: "min-h-0 flex-1 space-y-3 overflow-auto",
						children: [!reuseKeys && needs.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountPlan, {
							entry,
							needs
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ImportPane, {
							draft,
							setDraft,
							placeholder: `[deadbeef/48'/0'/0'/2']xpub…`,
							onApply: () => onRead(draft),
							onQr: setDraft,
							error,
							applyLabel: filled && draft.trim() ? t("keys.applyReplace") : t("keys.apply"),
							canApply: Boolean(draft.trim()) && preview?.ok !== false,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: () => {
											hwTarget.current = "master";
											fetchHw("ledger");
										},
										children: t("hw.fromLedger")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: () => {
											hwTarget.current = "master";
											fetchHw("bitbox");
										},
										children: t("hw.fromBitbox")
									}),
									filled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										onClick: () => {
											updateKey(entry.id, {
												xpub: "",
												fingerprint: "",
												children: []
											});
											setError(null);
											toast.success(t("keys.cleared"));
										},
										children: t("keys.clear")
									}) : null
								]
							}), preview?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-2xs text-fg-muted",
								children: [
									preview.key.fingerprint || "—",
									" · ",
									preview.key.derivation || "—",
									" · ",
									t("keys.draftHint")
								]
							}) : null]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "children",
						className: "min-h-0 flex-1 space-y-3 overflow-auto",
						children: filled || entry.fingerprint ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyTreeView, { node: buildKeyTree(entry, needs) }),
							!reuseKeys ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountPlan, {
								entry,
								needs,
								onPick: (path) => setChildDraft(`[${entry.fingerprint}/${path}]`)
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-2xs text-fg-muted",
								children: t("keys.nextAccount", { path: next.path })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ImportPane, {
								draft: childDraft,
								setDraft: setChildDraft,
								placeholder: `[${entry.fingerprint || "fp"}/${next.path}]xpub   oder   0/0`,
								onApply: () => onChild(childDraft),
								onQr: setChildDraft,
								error,
								applyLabel: t("keys.childApply"),
								canApply: Boolean(childDraft.trim()) && childPreview?.ok !== false,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: () => {
											hwTarget.current = "child";
											fetchHw("ledger", `m/${next.path}`);
										},
										children: t("hw.fromLedger")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: () => {
											hwTarget.current = "child";
											fetchHw("bitbox", `m/${next.path}`);
										},
										children: t("hw.fromBitbox")
									})]
								}), childPreview?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-2xs text-fg-muted",
									children: [
										childPreview.child.path,
										childPreview.child.note ? ` · ${childPreview.child.note}` : "",
										" · ",
										t("keys.draftHint")
									]
								}) : null]
							}),
							entry.children.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1.5",
								children: entry.children.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-2 rounded-md border border-border bg-elevated px-2.5 py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "truncate font-mono text-2xs text-fg",
										children: [
											c.note ? `${c.note} · ` : "",
											c.path,
											c.xpub ? " · xpub" : ""
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "rounded-md p-1 text-fg-muted hover:bg-muted hover:text-fg",
										onClick: () => removeChild(entry.id, c.id),
										"aria-label": t("keys.childRemove"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
									})]
								}, c.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-fg-muted",
								children: t("keys.childHelp")
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg-muted",
							children: t("keys.childNeedParent")
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "details",
						className: "min-h-0 flex-1 space-y-3 overflow-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: t("keys.detailOf"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": detailId === "master",
									onClick: () => {
										setDetailId("master");
										setDetailDraft({
											note: entry.note,
											fingerprint: entry.fingerprint,
											derivation: entry.derivation,
											xpub: entry.xpub,
											childPath: entry.childPath
										});
									},
									className: `h-8 rounded-full border px-3 text-xs ${detailId === "master" ? "border-border-strong bg-muted text-fg" : "border-border text-fg-muted"}`,
									children: t("keys.master")
								}), entry.children.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": detailId === c.id,
									onClick: () => {
										setDetailId(c.id);
										setChildDetail({
											path: c.path,
											fingerprint: c.fingerprint,
											xpub: c.xpub,
											note: c.note
										});
									},
									className: `h-8 max-w-40 truncate rounded-full border px-3 font-mono text-xs ${detailId === c.id ? "border-border-strong bg-muted text-fg" : "border-border text-fg-muted"}`,
									children: c.note || c.path
								}, c.id))]
							})
						}), detailId === "master" || !child ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t("keys.name"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: detailDraft.note,
									placeholder: "Coldcard, Alice, …",
									onChange: (e) => setDetailDraft((d) => ({
										...d,
										note: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t("keys.fp"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "font-mono text-xs",
									placeholder: "deadbeef",
									value: detailDraft.fingerprint,
									onChange: (e) => setDetailDraft((d) => ({
										...d,
										fingerprint: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t("keys.bip32"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "font-mono text-xs",
									placeholder: network === "testnet" ? "48'/1'/0'/2'" : "48'/0'/0'/2'",
									value: detailDraft.derivation,
									onChange: (e) => setDetailDraft((d) => ({
										...d,
										derivation: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "xpub",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "font-mono text-xs",
									placeholder: "xpub…",
									value: detailDraft.xpub,
									onChange: (e) => setDetailDraft((d) => ({
										...d,
										xpub: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t("keys.childPath"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "font-mono text-xs",
									placeholder: "<0;1>/*",
									value: detailDraft.childPath,
									onChange: (e) => setDetailDraft((d) => ({
										...d,
										childPath: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xs text-fg-muted",
								children: t("keys.draftHint")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									onClick: () => {
										updateKey(entry.id, {
											note: detailDraft.note,
											fingerprint: detailDraft.fingerprint,
											derivation: detailDraft.derivation,
											xpub: detailDraft.xpub.trim(),
											childPath: detailDraft.childPath,
											multipath: detailDraft.childPath.match(/^<[^>]+>/)?.[0] || entry.multipath
										});
										toast.success(t("keys.taken", { name: entry.name }));
									},
									children: t("keys.detailsApply")
								})
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t("keys.bip32"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "font-mono text-xs",
									value: childDetail.path,
									onChange: (e) => setChildDetail((d) => ({
										...d,
										path: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t("keys.fp"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "font-mono text-xs",
									value: childDetail.fingerprint,
									onChange: (e) => setChildDetail((d) => ({
										...d,
										fingerprint: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "xpub",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "font-mono text-xs",
									placeholder: "xpub…",
									value: childDetail.xpub,
									onChange: (e) => setChildDetail((d) => ({
										...d,
										xpub: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: t("keys.name"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: childDetail.note,
									onChange: (e) => setChildDetail((d) => ({
										...d,
										note: e.target.value
									}))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xs text-fg-muted",
								children: t("keys.draftHint")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									onClick: () => {
										updateKey(entry.id, { children: entry.children.map((c) => c.id === child.id ? {
											...c,
											path: childDetail.path,
											fingerprint: childDetail.fingerprint,
											xpub: childDetail.xpub.trim(),
											note: childDetail.note
										} : c) });
										toast.success(t("keys.childTaken"));
									},
									children: t("keys.detailsApply")
								})
							})
						] })]
					})
				]
			})]
		})
	});
}
function AccountPlan({ entry, needs, onPick }) {
	const { t } = useT();
	const extras = needs.filter((n) => n.account != null);
	if (!extras.length) return null;
	const next = nextUnusedAccount(entry);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5 rounded-lg border border-border bg-elevated px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-fg",
				children: t("keys.reuseNeed")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-2xs text-fg-muted",
				children: [
					t("keys.master"),
					" · ",
					entry.derivation || "48'/0'/0'/2'"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: extras.map((n) => {
					const path = n.account != null ? accountPathFrom(entry.derivation, n.account) : "";
					const has = n.account != null && Boolean(childForAccount(entry, n.account)?.xpub);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !onPick,
						onClick: () => onPick?.(path),
						className: "flex w-full items-center justify-between gap-2 rounded-md px-0.5 text-left font-mono text-2xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-fg",
							children: [
								n.alias,
								" · ",
								path
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: has ? "text-ok" : "text-danger",
							children: has ? t("keys.present") : t("keys.missing")
						})]
					}) }, n.alias);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs text-fg",
				children: t("keys.nextAccount", { path: next.path })
			})
		]
	});
}
function ImportPane({ draft, setDraft, placeholder, onApply, onQr, error, applyLabel, canApply, children }) {
	const { t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
			value: draft,
			onChange: (e) => setDraft(e.target.value),
			placeholder,
			className: "min-h-20"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrScanner, {
			compact: true,
			onRead: onQr
		}),
		children,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-danger",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				onClick: onApply,
				disabled: canApply === false || !draft.trim(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), applyLabel ?? t("keys.apply")]
			})
		})
	] });
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
var MIN_K = .18;
var MAX_K = 3.5;
function ZoomPane({ contentWidth, contentHeight, selectedRect, children }) {
	const { t } = useT();
	const viewportRef = (0, import_react.useRef)(null);
	const viewRef = (0, import_react.useRef)({
		x: 0,
		y: 0,
		k: 1
	});
	const [view, setView] = (0, import_react.useState)({
		x: 0,
		y: 0,
		k: 1
	});
	const dragRef = (0, import_react.useRef)(null);
	const pinchRef = (0, import_react.useRef)(null);
	const pointersRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [grabbing, setGrabbing] = (0, import_react.useState)(false);
	const apply = (0, import_react.useCallback)((next) => {
		const k = Math.min(MAX_K, Math.max(MIN_K, next.k));
		const v = {
			x: next.x,
			y: next.y,
			k
		};
		viewRef.current = v;
		setView(v);
	}, []);
	const fit = (0, import_react.useCallback)(() => {
		const el = viewportRef.current;
		if (!el) return;
		const vw = Math.max(1, el.clientWidth - 56);
		const vh = Math.max(1, el.clientHeight - 56);
		const k = Math.min(1.15, Math.max(MIN_K, Math.min(vw / contentWidth, vh / contentHeight)));
		apply({
			k,
			x: (el.clientWidth - contentWidth * k) / 2,
			y: (el.clientHeight - contentHeight * k) / 2
		});
	}, [
		apply,
		contentWidth,
		contentHeight
	]);
	(0, import_react.useEffect)(() => {
		fit();
	}, [fit]);
	(0, import_react.useEffect)(() => {
		const el = viewportRef.current;
		if (!el) return;
		const ro = new ResizeObserver(() => fit());
		ro.observe(el);
		return () => ro.disconnect();
	}, [fit]);
	(0, import_react.useEffect)(() => {
		const el = viewportRef.current;
		if (!el) return;
		const onWheel = (e) => {
			e.preventDefault();
			const rect = el.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			const my = e.clientY - rect.top;
			const cur = viewRef.current;
			const factor = Math.exp(-e.deltaY * .0015);
			const nextK = Math.min(MAX_K, Math.max(MIN_K, cur.k * factor));
			const ratio = nextK / cur.k;
			apply({
				k: nextK,
				x: mx - (mx - cur.x) * ratio,
				y: my - (my - cur.y) * ratio
			});
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [apply]);
	(0, import_react.useEffect)(() => {
		if (!selectedRect) return;
		const el = viewportRef.current;
		if (!el) return;
		const cur = viewRef.current;
		const sx = selectedRect.x * cur.k + cur.x;
		const sy = selectedRect.y * cur.k + cur.y;
		const sw = selectedRect.w * cur.k;
		const sh = selectedRect.h * cur.k;
		const pad = 20;
		let nx = cur.x;
		let ny = cur.y;
		if (sx < pad) nx += pad - sx;
		if (sy < pad) ny += pad - sy;
		if (sx + sw > el.clientWidth - pad) nx -= sx + sw - (el.clientWidth - pad);
		if (sy + sh > el.clientHeight - pad) ny -= sy + sh - (el.clientHeight - pad);
		if (nx !== cur.x || ny !== cur.y) apply({
			...cur,
			x: nx,
			y: ny
		});
	}, [selectedRect, apply]);
	function onPointerDown(e) {
		if (e.button !== 0 && e.pointerType === "mouse") return;
		pointersRef.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (pointersRef.current.size === 2) {
			const pts = [...pointersRef.current.values()];
			const dx = pts[0].x - pts[1].x;
			const dy = pts[0].y - pts[1].y;
			const ids = [...pointersRef.current.keys()];
			pinchRef.current = {
				a: ids[0],
				b: ids[1],
				dist: Math.hypot(dx, dy) || 1,
				midX: (pts[0].x + pts[1].x) / 2,
				midY: (pts[0].y + pts[1].y) / 2,
				k: viewRef.current.k
			};
			dragRef.current = null;
			return;
		}
		dragRef.current = {
			id: e.pointerId,
			x: e.clientX,
			y: e.clientY,
			moved: false
		};
	}
	function onPointerMove(e) {
		if (pointersRef.current.has(e.pointerId)) pointersRef.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		const pinch = pinchRef.current;
		if (pinch && pointersRef.current.size >= 2) {
			const a = pointersRef.current.get(pinch.a);
			const b = pointersRef.current.get(pinch.b);
			if (a && b) {
				const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
				const nextK = Math.min(MAX_K, Math.max(MIN_K, pinch.k * (dist / pinch.dist)));
				const el = viewportRef.current;
				if (el) {
					const rect = el.getBoundingClientRect();
					const mx = (a.x + b.x) / 2 - rect.left;
					const my = (a.y + b.y) / 2 - rect.top;
					const cur = viewRef.current;
					const ratio = nextK / cur.k;
					apply({
						k: nextK,
						x: mx - (mx - cur.x) * ratio,
						y: my - (my - cur.y) * ratio
					});
				}
			}
			return;
		}
		const d = dragRef.current;
		if (!d || d.id !== e.pointerId) return;
		const dx = e.clientX - d.x;
		const dy = e.clientY - d.y;
		if (!d.moved && Math.hypot(dx, dy) < 5) return;
		if (!d.moved) {
			d.moved = true;
			setGrabbing(true);
			e.currentTarget.setPointerCapture(e.pointerId);
		}
		d.x = e.clientX;
		d.y = e.clientY;
		const cur = viewRef.current;
		apply({
			...cur,
			x: cur.x + dx,
			y: cur.y + dy
		});
	}
	function endPointer(e) {
		pointersRef.current.delete(e.pointerId);
		if (pinchRef.current && (e.pointerId === pinchRef.current.a || e.pointerId === pinchRef.current.b)) pinchRef.current = null;
		if (dragRef.current?.id === e.pointerId) {
			dragRef.current = null;
			setGrabbing(false);
		}
	}
	function zoomBy(factor) {
		const el = viewportRef.current;
		if (!el) return;
		const cur = viewRef.current;
		const nextK = Math.min(MAX_K, Math.max(MIN_K, cur.k * factor));
		const mx = el.clientWidth / 2;
		const my = el.clientHeight / 2;
		const ratio = nextK / cur.k;
		apply({
			k: nextK,
			x: mx - (mx - cur.x) * ratio,
			y: my - (my - cur.y) * ratio
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-0 flex-1 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: viewportRef,
			"data-zoom-pane": true,
			className: `absolute inset-0 overflow-hidden ${grabbing ? "cursor-grabbing" : "cursor-grab"}`,
			style: { touchAction: "none" },
			onPointerDown,
			onPointerMove,
			onPointerUp: endPointer,
			onPointerCancel: endPointer,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				style: {
					width: contentWidth,
					height: contentHeight,
					transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
					transformOrigin: "0 0",
					willChange: "transform"
				},
				children
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-3 bottom-3 z-10 flex gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "icon",
					className: "size-9",
					onClick: fit,
					"aria-label": t("graph.fit"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "icon",
					className: "size-9",
					onClick: () => zoomBy(1 / 1.2),
					"aria-label": t("graph.zoomOut"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					size: "icon",
					className: "size-9",
					onClick: () => zoomBy(1.2),
					"aria-label": t("graph.zoomIn"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
				})
			]
		})]
	});
}
function PolicyGraph() {
	const { t, locale } = useT();
	const root = useStudio((s) => s.root);
	const selectedId = useStudio((s) => s.selectedId);
	const select = useStudio((s) => s.select);
	const layout = (0, import_react.useMemo)(() => layoutTree(root, locale), [root, locale]);
	const selectedRect = (0, import_react.useMemo)(() => {
		const b = layout.boxes.find((box) => box.id === selectedId);
		return b ? {
			x: b.x,
			y: b.y,
			w: b.w,
			h: b.h
		} : null;
	}, [layout.boxes, selectedId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyBoard, {}), root ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomPane, {
			contentWidth: Math.max(layout.width, 320),
			contentHeight: Math.max(layout.height, 240),
			selectedRect,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				width: Math.max(layout.width, 320),
				height: Math.max(layout.height, 240),
				className: "block",
				role: "img",
				"aria-label": t("graph.aria"),
				children: [layout.edges.map((e) => {
					const midY = (e.y1 + e.y2) / 2;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: `M ${e.x1} ${e.y1} L ${e.x1} ${midY} L ${e.x2} ${midY} L ${e.x2} ${e.y2}`,
						fill: "none",
						stroke: "var(--color-border-strong)",
						strokeWidth: 1.25
					}), e.label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: (e.x1 + e.x2) / 2,
						y: midY - 4,
						textAnchor: "middle",
						fill: "var(--color-fg-subtle)",
						fontSize: 9,
						fontFamily: "IBM Plex Sans, system-ui, sans-serif",
						children: e.label
					}) : null] }, `${e.from}-${e.to}`);
				}), layout.boxes.map((b) => {
					const selected = b.id === selectedId;
					const compact = b.h < 40;
					const timeish = b.kind === "older" || b.kind === "after";
					const fill = b.hole ? "transparent" : selected ? "var(--color-primary)" : "var(--color-elevated)";
					const stroke = b.hole ? "var(--color-fg-subtle)" : selected ? "var(--color-primary)" : timeish ? "var(--color-warn)" : "var(--color-border-strong)";
					const titleFill = selected && !b.hole ? "var(--color-primary-foreground)" : "var(--color-fg)";
					const subFill = selected && !b.hole ? "var(--color-primary-foreground)" : "var(--color-fg-muted)";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: `translate(${b.x} ${b.y})`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								width: b.w,
								height: b.h,
								rx: compact ? 6 : 10,
								fill,
								stroke,
								strokeWidth: selected ? 1.75 : 1,
								strokeDasharray: b.hole ? "4 3" : void 0,
								onClick: () => select(b.id),
								style: { cursor: "pointer" }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: b.w / 2,
								y: compact ? b.h / 2 + 4 : 22,
								textAnchor: "middle",
								fill: titleFill,
								fontSize: compact ? 11 : 12,
								fontFamily: "IBM Plex Mono, ui-monospace, monospace",
								style: { pointerEvents: "none" },
								children: b.title
							}),
							!compact && b.subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: b.w / 2,
								y: 42,
								textAnchor: "middle",
								fill: subFill,
								fontSize: 10,
								fontFamily: "IBM Plex Sans, system-ui, sans-serif",
								opacity: .85,
								style: { pointerEvents: "none" },
								children: b.subtitle.length > 28 ? `${b.subtitle.slice(0, 26)}…` : b.subtitle
							}) : null
						]
					}, b.id);
				})]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GitBranch, {
				className: "size-8 text-fg-subtle",
				strokeWidth: 1.25
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg tracking-tight",
				children: t("graph.empty")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-sm text-pretty text-fg-muted",
				children: t("graph.emptyBlurb")
			})] })]
		})]
	});
}
function StageBuilder() {
	const { t } = useT();
	const stages = useStudio((s) => s.stages);
	const keys = useStudio((s) => s.keys);
	const setStages = useStudio((s) => s.setStages);
	const pool = keys.map((k) => k.name);
	function patch(id, fn) {
		setStages(stages.map((s) => s.id === id ? fn(s) : s));
	}
	function addStage() {
		if (!stages.length) {
			setStages(defaultStages());
			return;
		}
		const delay = nextStageDelay(stages);
		const prev = stages[stages.length - 1];
		const names = prev?.keys.length ? [...prev.keys] : pool.slice(0, 3);
		const extra = nextKeyName([...pool, ...names]);
		names.push(extra);
		setStages([...stages, {
			id: uid("st"),
			delay,
			k: Math.min(prev?.k ?? 2, names.length),
			keys: names
		}]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pt-4 pb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase",
				children: t("stages.title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-pretty text-fg-muted",
				children: t("stages.blurb")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "min-h-0 flex-1 px-3 pb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					stages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-1 text-xs text-fg-muted",
						children: t("stages.empty")
					}) : null,
					stages.slice().sort((a, b) => a.delay - b.delay).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageCard, {
						index: i,
						stage: s,
						pool,
						entries: keys,
						canRemove: stages.length > 1,
						onChange: (next) => patch(s.id, () => next),
						onRemove: () => setStages(stages.filter((x) => x.id !== s.id))
					}, s.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: addStage,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
							" ",
							stages.length ? t("stages.addLocked") : t("stages.add")
						]
					})
				]
			})
		})]
	});
}
function StageCard({ index, stage, pool, entries, canRemove, onChange, onRemove }) {
	const { t, locale } = useT();
	const n = stage.keys.length;
	const k = Math.min(Math.max(stage.k, 1), Math.max(n, 1));
	const byName = new Map(entries.map((e) => [e.name, e]));
	function setN(nextN) {
		const count = Math.max(1, Math.min(15, nextN));
		let keys = [...stage.keys];
		const used = [...pool, ...keys];
		while (keys.length < count) {
			const name = nextKeyName(used);
			keys.push(name);
			used.push(name);
		}
		if (keys.length > count) keys = keys.slice(0, count);
		onChange({
			...stage,
			keys,
			k: Math.min(k, keys.length)
		});
	}
	function toggleKey(name) {
		const keys = stage.keys.includes(name) ? stage.keys.filter((x) => x !== name) : [...stage.keys, name];
		if (!keys.length) return;
		onChange({
			...stage,
			keys,
			k: Math.min(k, keys.length)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl border border-border bg-surface p-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium",
					children: [t("stages.n", { n: index + 1 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs font-normal text-fg-muted",
						children: blocksWhen(stage.delay, locale)
					})]
				}), canRemove ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-9",
					onClick: onRemove,
					"aria-label": t("stages.remove"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
					label: t("stages.keys"),
					value: n,
					min: 1,
					max: 15,
					onChange: setN
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
					label: t("stages.threshold"),
					value: k,
					min: 1,
					max: Math.max(n, 1),
					onChange: (v) => onChange({
						...stage,
						k: v
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("stages.inStage") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex flex-wrap gap-1.5",
					children: [Array.from(/* @__PURE__ */ new Set([...pool, ...stage.keys])).map((name) => {
						const on = stage.keys.includes(name);
						const entry = byName.get(name);
						const filled = entry ? keyIsFilled(entry) : false;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => toggleKey(name),
							className: on ? "h-9 rounded-full bg-primary px-3 font-mono text-xs text-primary-foreground" : "h-9 rounded-full border border-border px-3 font-mono text-xs text-fg-muted hover:bg-muted hover:text-fg",
							children: [name, filled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-1.5 inline-block size-1.5 rounded-full bg-current opacity-80" }) : null]
						}, name);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setN(n + 1),
						className: "h-9 rounded-full border border-dashed border-border px-3 text-xs text-fg-muted hover:bg-muted hover:text-fg",
						children: "+ Key"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: `delay-${stage.id}`,
						children: t("stages.timelock")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: `delay-${stage.id}`,
						type: "number",
						min: 0,
						max: 65535,
						value: stage.delay,
						onChange: (e) => onChange({
							...stage,
							delay: Number(e.target.value)
						}),
						className: "mt-1.5 font-mono"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: DELAY_PRESETS.map((nDelay) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onChange({
								...stage,
								delay: nDelay
							}),
							className: stage.delay === nDelay ? "h-8 rounded-full bg-muted px-2.5 text-2xs text-fg" : "h-8 rounded-full border border-border px-2.5 text-2xs text-fg-muted hover:bg-muted hover:text-fg",
							children: t(`delay.${nDelay}`)
						}, nDelay))
					})
				]
			})
		]
	});
}
function Stepper({ label, value, min, max, onChange }) {
	const { t } = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1.5 flex items-center gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "icon",
				className: "size-10 shrink-0",
				disabled: value <= min,
				onClick: () => onChange(value - 1),
				"aria-label": t("stages.dec", { label }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-10 min-w-10 flex-1 items-center justify-center font-mono text-sm tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "icon",
				className: "size-10 shrink-0",
				disabled: value >= max,
				onClick: () => onChange(value + 1),
				"aria-label": t("stages.inc", { label }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
			})
		]
	})] });
}
function StudioShell() {
	const { t, locale, setLocale } = useT();
	(0, import_react.useEffect)(() => {
		Promise.resolve(useStudio.persist.rehydrate()).then(() => {
			const s = useStudio.getState();
			if (s.stages?.length) {
				s.setStages(s.stages);
				return;
			}
			if (s.root) {
				useStudio.setState({ stages: [] });
				return;
			}
			s.setStages(defaultStages());
		});
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.lang = locale;
	}, [locale]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
		delayDuration: 200,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyDatalist, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "bottom-center"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
						className: "shrink-0 border-b border-border px-3 py-1.5 md:px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display shrink-0 text-lg tracking-tight",
									children: "Scriptwerk"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportExportBar, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangSwitch, {
									locale,
									setLocale,
									label: t("header.language")
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden min-h-0 flex-1 overflow-hidden lg:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
								className: "flex w-[300px] shrink-0 flex-col overflow-hidden border-r border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
									defaultValue: "stages",
									className: "flex min-h-0 flex-1 flex-col",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
											className: "mx-3 mt-3 shrink-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "stages",
												className: "flex-1",
												children: t("tabs.stages")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
												value: "ops",
												className: "flex-1",
												children: t("tabs.ops")
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
											value: "stages",
											className: "mt-0 min-h-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageBuilder, {})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
											value: "ops",
											className: "mt-0 min-h-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "min-h-0 flex-1 overflow-hidden",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorPalette, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "shrink-0 border-t border-border",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeInspector, {})
											})]
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
								className: "min-w-0 flex-1 overflow-hidden bg-ink",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyGraph, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
								className: "flex w-[340px] shrink-0 flex-col overflow-hidden border-l border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-h-0 flex-1 overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterpreterPanel, {})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1 overflow-hidden lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							defaultValue: "tree",
							className: "flex h-full flex-col px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "w-full shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "stages",
											className: "flex-1",
											children: t("tabs.stages")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "tree",
											className: "flex-1",
											children: t("tabs.tree")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
											value: "read",
											className: "flex-1",
											children: t("tabs.read")
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "stages",
									className: "min-h-0 flex-1 overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageBuilder, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "tree",
									className: "min-h-0 flex-1 overflow-hidden rounded-xl border border-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PolicyGraph, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
									value: "read",
									className: "min-h-0 flex-1 overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterpreterPanel, {})
								})
							]
						})
					})
				]
			})
		]
	});
}
function LangSwitch({ locale, setLocale, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"aria-label": label,
		className: "ml-auto flex shrink-0 rounded-full border border-border p-0.5",
		children: ["de", "en"].map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": locale === code,
			onClick: () => setLocale(code),
			className: `h-8 min-w-9 rounded-full px-2.5 font-mono text-2xs tracking-wide ${locale === code ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"}`,
			children: code.toUpperCase()
		}, code))
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioShell, {});
}
//#endregion
export { normalizeHwPath as a, ledgerPolicyReady as i, formatOrigin as n, pathToDerivation as o, hwErrorMessage as r, routes_exports as s, Home as t };
