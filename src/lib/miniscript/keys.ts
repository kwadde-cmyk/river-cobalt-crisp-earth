import { mapKeyStrings, type MsNode } from "./ast.ts";
import { uid } from "../utils.ts";
import { numberLocale, t, type Locale } from "../i18n.ts";

export interface KeyChild {
  id: string;
  path: string;
  xpub: string;
  fingerprint: string;
  note: string;
}

export interface KeyEntry {
  id: string;
  name: string;
  fingerprint: string;
  derivation: string;
  xpub: string;
  multipath: string;
  childPath: string;
  children: KeyChild[];
  note: string;
}

export function emptyKey(name: string, network: "mainnet" | "testnet" = "mainnet"): KeyEntry {
  return {
    id: `k_${name}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    fingerprint: "",
    derivation: network === "testnet" ? "48'/1'/0'/2'" : "48'/0'/0'/2'",
    xpub: "",
    multipath: "<0;1>",
    childPath: "<0;1>/*",
    children: [],
    note: "",
  };
}

export function normalizeKeyEntry(k: KeyEntry): KeyEntry {
  const multipath = k.multipath || "<0;1>";
  const childPath = k.childPath?.trim() || `${multipath}/*`;
  return {
    ...k,
    multipath,
    childPath,
    children: Array.isArray(k.children) ? k.children : [],
    note: k.note ?? "",
  };
}

export function nextKeyName(existing: string[]): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  for (const ch of alphabet) {
    if (!existing.includes(ch)) return ch;
  }
  let i = 1;
  while (existing.includes(`K${i}`)) i++;
  return `K${i}`;
}

function approx(n: number, locale: Locale = "de"): string {
  if (n <= 1) return t(locale, "approx.min");
  if (n < 144) return t(locale, "approx.hours", { n: Math.round((n * 10) / 60) });
  const days = n / 144;
  if (days < 1.5) return t(locale, "approx.day");
  if (days < 30) return t(locale, "approx.days", { n: Math.round(days) });
  const months = days / 30.44;
  if (months < 18) {
    const value = months < 10 ? months.toFixed(1) : String(Math.round(months));
    return t(locale, "approx.months", { n: value });
  }
  return t(locale, "approx.years", { n: (days / 365.25).toFixed(1) });
}

export function blocksToHuman(n: number, locale: Locale = "de"): string {
  return t(locale, "time.human", {
    n: n.toLocaleString(numberLocale(locale)),
    approx: approx(n, locale),
  });
}

export function blocksWhen(n: number, locale: Locale = "de"): string {
  if (n <= 0) return t(locale, "time.now");
  if (n === 1) return t(locale, "time.one");
  return t(locale, "time.after", {
    n: n.toLocaleString(numberLocale(locale)),
    approx: approx(n, locale),
  });
}

export interface ParsedKeyExpr {
  kind: "alias" | "origin" | "xpub";
  alias: string | null;
  fingerprint: string;
  derivation: string;
  xpub: string;
  multipath: string;
  childPath: string;
  raw: string;
}

const XPUB_BODY = /^(xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+/;
const ORIGIN_IN_TEXT =
  /\[[0-9a-fA-F]{8}(?:\/[^\]]*)?\](?:(?:xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+(?:\/[^\s,)\]"']+)?|(?:m\/)?[0-9hH'/*<>;]+)?/;
const XPUB_IN_TEXT =
  /(?:xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+(?:\/[^\s,)\]"']+)?/;

function blankParsed(raw: string, kind: ParsedKeyExpr["kind"] = "alias"): ParsedKeyExpr {
  return {
    kind,
    alias: kind === "alias" ? raw : null,
    fingerprint: "",
    derivation: "",
    xpub: "",
    multipath: "<0;1>",
    childPath: "<0;1>/*",
    raw,
  };
}

export function parseKeyExpr(raw: string): ParsedKeyExpr {
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
    const split = rest ? splitXpubPath(rest) : { xpub: "", multipath: "<0;1>", childPath: "<0;1>/*" };
    const xpub = XPUB_BODY.test(split.xpub) ? split.xpub : "";
    return {
      kind: derivation || xpub ? "origin" : "alias",
      alias: null,
      fingerprint: origin[1]!,
      derivation,
      xpub,
      multipath: split.multipath,
      childPath: xpub ? split.childPath : "<0;1>/*",
      raw: s,
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
      raw: s,
    };
  }
  return blankParsed(s);
}

function normalizePath(path: string): string {
  return path.replace(/h/g, "'").replace(/^m\//, "");
}

function splitXpubPath(rest: string): { xpub: string; multipath: string; childPath: string } {
  const s = rest.trim();
  const m = s.match(/^(xpub|tpub|ypub|zpub|vpub|Ypub|Zpub|Vpub)[1-9A-HJ-NP-Za-km-z]+/);
  if (!m) {
    return { xpub: s, multipath: "<0;1>", childPath: "<0;1>/*" };
  }
  const xpub = m[0]!;
  let tail = s.slice(xpub.length).replace(/^\//, "").trim();
  if (!tail) tail = "<0;1>/*";
  return { xpub, childPath: tail, multipath: multipathFromChildPath(tail) };
}

function multipathFromChildPath(childPath: string): string {
  const angle = childPath.match(/^<[^>]+>/);
  if (angle) return angle[0]!;
  return "<0;1>";
}

export function looksLikePolicy(text: string): boolean {
  const t = text.trim();
  if (/^BSMS/i.test(t)) return true;
  return /\b(wsh|sh|tr|pkh|pk|multi|thresh|older|after|and_v|and_b|andor|or_i|or_d|or_c|or_b)\s*\(/i.test(
    t,
  );
}

export function parseKeyList(text: string): KeyEntry[] | null {
  if (looksLikePolicy(text)) return null;
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (!lines.length) return null;
  const keys: KeyEntry[] = [];
  const used: string[] = [];
  for (const line of lines) {
    const named = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/);
    let name: string | undefined;
    let expr = line;
    if (named) {
      const parsedRest = parseKeyExpr(named[2]!);
      if (parsedRest.kind !== "alias") {
        name = named[1];
        expr = named[2]!;
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
      childPath: parsed.childPath || "<0;1>/*",
    });
  }
  return keys.length ? keys : null;
}

export function extractKeysFromTree(
  root: MsNode,
  existing: KeyEntry[],
): { node: MsNode; keys: KeyEntry[] } {
  const existingByName = new Map(existing.map((k) => [k.name, k]));
  const existingByXpub = new Map(existing.filter((k) => k.xpub).map((k) => [k.xpub, k]));
  const assigned: KeyEntry[] = [];
  const usedNames = new Set<string>();
  const xpubToName = new Map<string, string>();

  const remember = (k: KeyEntry) => {
    assigned.push(normalizeKeyEntry(k));
    usedNames.add(k.name);
    if (k.xpub) xpubToName.set(k.xpub, k.name);
  };

  const node = mapKeyStrings(root, (raw) => {
    const parsed = parseKeyExpr(raw);
    if (parsed.kind === "alias") {
      const alias = parsed.alias!;
      if (!usedNames.has(alias)) {
        const prev = existingByName.get(alias);
        remember(prev ? { ...prev, name: alias } : emptyKey(alias));
      }
      return alias;
    }
    if (parsed.xpub && xpubToName.has(parsed.xpub)) return xpubToName.get(parsed.xpub)!;
    const prevX = parsed.xpub ? existingByXpub.get(parsed.xpub) : undefined;
    if (prevX && !usedNames.has(prevX.name)) {
      remember({
        ...prevX,
        fingerprint: parsed.fingerprint || prevX.fingerprint,
        derivation: parsed.derivation || prevX.derivation,
        xpub: parsed.xpub || prevX.xpub,
        multipath: parsed.multipath || prevX.multipath,
        childPath: parsed.childPath || prevX.childPath,
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
      childPath: parsed.childPath || "<0;1>/*",
    });
    return name;
  });

  return { node, keys: assigned };
}

export function keyIsFilled(k: KeyEntry): boolean {
  return Boolean(k.xpub.trim());
}

export function baseKeyName(token: string): string {
  const m = token.match(/^([A-Za-z_][A-Za-z_]*)(\d+)$/);
  return m ? m[1]! : token;
}

export function aliasAccountIndex(token: string): number | null {
  const m = token.match(/^([A-Za-z_][A-Za-z_]*)(\d+)$/);
  if (!m) return null;
  const n = Number(m[2]);
  return Number.isFinite(n) ? n : null;
}

export function keyNeedsAction(
  key: KeyEntry,
  extras: { account?: number }[] = [],
  reuse = true,
): "empty" | "child" | null {
  if (!keyIsFilled(key)) return "empty";
  if (reuse) return null;
  const missing = extras.some((e) => e.account != null && !childForAccount(key, e.account)?.xpub.trim());
  return missing ? "child" : null;
}

export function tokenNeedsAction(token: string, keys: KeyEntry[], reuse = true): boolean {
  const base = baseKeyName(token);
  const key = keys.find((k) => k.name === token) ?? keys.find((k) => k.name === base);
  if (!key) return true;
  if (!keyIsFilled(key)) return true;
  if (reuse) return false;
  const idx = token === base ? null : aliasAccountIndex(token);
  if (idx == null || idx < 1) return false;
  return !childForAccount(key, idx)?.xpub.trim();
}

export function formatFingerprint(fp: string): string {
  return fp.replace(/^#/, "").replace(/^0x/i, "").trim().slice(0, 8).toLowerCase();
}

export function parseAccountIndex(path: string): number | null {
  const p = normalizePath(path);
  const m = p.match(/^48'\/(\d+)'\/(\d+)'\/(\d+)'?$/);
  if (!m) return null;
  return Number(m[2]);
}

export function accountPathFrom(
  path: string,
  account: number,
  network: "mainnet" | "testnet" = "mainnet",
): string {
  const p = normalizePath(path);
  const m = p.match(/^48'\/(\d+)'\/(\d+)'\/(\d+)'?$/);
  const coin = m ? m[1] : network === "testnet" ? "1" : "0";
  const script = m ? m[3] : "2";
  return `48'/${coin}'/${account}'/${script}'`;
}

export function usedAccountIndices(key: KeyEntry): number[] {
  const k = normalizeKeyEntry(key);
  const used = new Set<number>();
  const master = parseAccountIndex(k.derivation);
  used.add(master ?? 0);
  for (const c of k.children) {
    const n = parseAccountIndex(c.path);
    if (n != null) used.add(n);
  }
  return [...used].sort((a, b) => a - b);
}

export function nextUnusedAccount(
  key: KeyEntry,
  network: "mainnet" | "testnet" = "mainnet",
): { account: number; path: string } {
  const used = new Set(usedAccountIndices(key));
  let account = 0;
  while (used.has(account)) account++;
  return { account, path: accountPathFrom(key.derivation, account, network) };
}

export function childForAccount(key: KeyEntry, account: number): KeyChild | undefined {
  return normalizeKeyEntry(key).children.find((c) => parseAccountIndex(c.path) === account);
}

export function keyHeadline(k: KeyEntry): string {
  const note = k.note.trim();
  if (note) return note;
  const fp = formatFingerprint(k.fingerprint);
  if (fp) return fp;
  return "ohne Material";
}

export function keyTileLabel(k: KeyEntry): string {
  const note = k.note.trim();
  if (note) return note;
  const fp = formatFingerprint(k.fingerprint);
  if (fp) return fp;
  return k.name;
}

export function formatBip32Path(k: KeyEntry): string {
  const der = normalizePath(k.derivation || "").trim();
  if (!der) return "";
  return `m/${der}`;
}

export function formatScriptPath(k: KeyEntry): string {
  const child = (k.childPath || "").trim();
  if (child) return child.replace(/^\//, "");
  const multi = (k.multipath || "").trim();
  if (!multi) return "";
  return `${multi}/*`;
}

function firstString(rec: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = rec[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function fromJsonBlob(text: string): ParsedKeyExpr | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const rec = parsed as Record<string, unknown>;
    const xpub = firstString(rec, ["xpub", "tpub", "p2wsh", "extPubKey", "ExtPubKey", "pubkey"]);
    if (!xpub || (!XPUB_IN_TEXT.test(xpub) && !ORIGIN_IN_TEXT.test(xpub))) {
      const nested = extractFirstKeyExpr(JSON.stringify(rec));
      return nested;
    }
    if (ORIGIN_IN_TEXT.test(xpub) || xpub.startsWith("[")) {
      const inner = parseKeyExpr(xpub);
      if (inner.kind !== "alias" && inner.xpub) return inner;
    }
    const fp = firstString(rec, [
      "fingerprint",
      "xfp",
      "master_fingerprint",
      "masterFingerprint",
      "rootFingerprint",
      "root_fingerprint",
      "fp",
    ]);
    const der = firstString(rec, [
      "derivation",
      "deriv",
      "p2wsh_deriv",
      "path",
      "keypath",
      "bip32_path",
      "bip32Path",
    ]);
    const expr =
      fp && der
        ? `[${formatFingerprint(fp)}/${normalizePath(der)}]${xpub}`
        : xpub;
    const out = parseKeyExpr(expr);
    if (out.kind === "alias" || !out.xpub) return null;
    if (der && !out.derivation) out.derivation = normalizePath(der);
    if (fp && !out.fingerprint) out.fingerprint = formatFingerprint(fp);
    return out;
  } catch {
    return null;
  }
}

export function extractFirstKeyExpr(text: string): ParsedKeyExpr | null {
  const origin = text.match(ORIGIN_IN_TEXT);
  if (origin?.[0]) {
    const p = parseKeyExpr(origin[0]);
    if (p.kind !== "alias" && (p.xpub || p.fingerprint)) return p;
  }
  const xpub = text.match(XPUB_IN_TEXT);
  if (xpub?.[0]) {
    const p = parseKeyExpr(xpub[0]);
    if (p.kind !== "alias" && p.xpub) {
      const pathLine = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => /^(m\/)?\d/.test(l) && !XPUB_IN_TEXT.test(l));
      if (pathLine && !p.derivation) p.derivation = normalizePath(pathLine);
      return p;
    }
  }
  return null;
}

export type ApplyKeyResult = { ok: true; key: KeyEntry } | { ok: false; error: string };

export function applyKeyMaterial(entry: KeyEntry, text: string): ApplyKeyResult {
  const raw = text.trim();
  if (!raw) return { ok: false, error: "err.empty" };
  const json = fromJsonBlob(raw);
  const parsed = json ?? (looksLikePolicy(raw) ? null : extractFirstKeyExpr(raw) ?? parseKeyExpr(raw));
  if (parsed && parsed.kind !== "alias" && !parsed.xpub && (parsed.fingerprint || parsed.derivation)) {
    const parent = normalizeKeyEntry(entry);
    return {
      ok: true,
      key: {
        ...parent,
        fingerprint: parsed.fingerprint || parent.fingerprint,
        derivation: parsed.derivation || parent.derivation,
      },
    };
  }
  if (!parsed?.xpub) {
    if (looksLikePolicy(raw)) {
      return { ok: false, error: "err.policy" };
    }
    return { ok: false, error: "err.noXpub" };
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
      childPath: parsed.childPath || parent.childPath,
    },
  };
}

export interface KeyTreeNode {
  label: string;
  hint?: string;
  last: boolean;
  children: KeyTreeNode[];
}

export function buildKeyTree(
  k: KeyEntry,
  aliases: { alias: string; delay: number }[] = [],
): KeyTreeNode {
  const key = normalizeKeyEntry(k);
  const extra = key.children;
  const aliasNodes: KeyTreeNode[] = aliases.map((a, i) => ({
    label: a.alias,
    hint: a.delay <= 0 ? "Sofort" : `${a.delay.toLocaleString("de-DE")} Bl.`,
    last: i === aliases.length - 1,
    children: [],
  }));
  const script = formatScriptPath(key) || "<0;1>/*";
  const absoluteKids = extra.filter((c) => isAbsoluteChildPath(c.path, key.derivation));
  const relativeKids = extra.filter((c) => !isAbsoluteChildPath(c.path, key.derivation));

  if (absoluteKids.length) {
    const account: KeyTreeNode = {
      label: formatBip32Path(key).replace(/^m\//, "") || key.derivation || "0",
      hint: formatFingerprint(key.fingerprint) || undefined,
      last: false,
      children: [
        {
          label: script,
          last: relativeKids.length === 0,
          children: aliasNodes,
        },
        ...relativeKids.map((c) => ({
          label: c.path,
          hint: c.note || (c.xpub ? "Child-xpub" : undefined),
          last: false,
          children: [] as KeyTreeNode[],
        })),
      ],
    };
    const siblings: KeyTreeNode[] = [
      account,
      ...absoluteKids.map((c) => ({
        label: c.path.replace(/^m\//, ""),
        hint: c.note || (c.xpub ? "Account" : formatFingerprint(c.fingerprint) || undefined),
        last: false,
        children: [] as KeyTreeNode[],
      })),
    ];
    siblings.forEach((n, i) => {
      n.last = i === siblings.length - 1;
    });
    account.children.forEach((n, i) => {
      n.last = i === account.children.length - 1;
    });
    return {
      label: "m",
      hint: formatFingerprint(key.fingerprint) || undefined,
      last: true,
      children: siblings,
    };
  }

  const origin = formatBip32Path(key) || "m";
  const kids: KeyTreeNode[] = [
    {
      label: script,
      last: extra.length === 0,
      children: aliasNodes,
    },
    ...extra.map((c) => ({
      label: c.path,
      hint: c.note || (c.xpub ? "Child-xpub" : undefined),
      last: false,
      children: [] as KeyTreeNode[],
    })),
  ];
  kids.forEach((n, i) => {
    n.last = i === kids.length - 1;
  });

  return {
    label: origin,
    hint: formatFingerprint(key.fingerprint) || undefined,
    last: true,
    children: kids,
  };
}

function isAbsoluteChildPath(path: string, parentDerivation: string): boolean {
  const p = normalizePath(path);
  const origin = normalizePath(parentDerivation);
  if (!p) return false;
  if (origin && (p === origin || p.startsWith(`${origin}/`))) return false;
  return /'/.test(p) || /^48['h]/.test(p);
}

function isPathOnly(text: string): boolean {
  const t = text.trim();
  if (!t || t.includes("[") || XPUB_IN_TEXT.test(t) || ORIGIN_IN_TEXT.test(t)) return false;
  return /^(m\/)?[0-9hH'/*<>;]+$/.test(t);
}

function relativizePath(parent: KeyEntry, rawPath: string): string {
  let p = normalizePath(rawPath).replace(/^\//, "");
  const origin = normalizePath(parent.derivation || "");
  if (origin && (p === origin || p.startsWith(`${origin}/`))) {
    p = p.slice(origin.length).replace(/^\//, "");
  }
  return p;
}

export function parseChildKey(
  parent: KeyEntry,
  text: string,
  opts?: { fallbackPath?: string; alias?: string },
): { ok: true; child: KeyChild } | { ok: false; error: string } {
  const raw = text.trim();
  if (!raw) return { ok: false, error: "err.empty" };
  if (looksLikePolicy(raw)) {
    return { ok: false, error: "err.policyChild" };
  }
  const base = normalizeKeyEntry(parent);

  if (isPathOnly(raw)) {
    const path = relativizePath(base, raw);
    if (!path) return { ok: false, error: "err.pathEmpty" };
    if (normalizePath(path) === normalizePath(base.derivation)) {
      return { ok: false, error: "err.samePath" };
    }
    return {
      ok: true,
      child: { id: uid("ck"), path, xpub: "", fingerprint: formatFingerprint(base.fingerprint), note: opts?.alias || "" },
    };
  }

  const json = fromJsonBlob(raw);
  const parsed = json ?? extractFirstKeyExpr(raw) ?? (parseKeyExpr(raw).kind !== "alias" ? parseKeyExpr(raw) : null);
  if (!parsed || parsed.kind === "alias") return { ok: false, error: "err.noChildExpr" };

  const sameXpub = Boolean(base.xpub && parsed.xpub && parsed.xpub === base.xpub);
  const childFp = formatFingerprint(parsed.fingerprint);
  const parentFp = formatFingerprint(base.fingerprint);
  const sameFp = Boolean(childFp && parentFp && childFp === parentFp) || (!childFp && Boolean(parentFp));
  if (childFp && parentFp && childFp !== parentFp) {
    return { ok: false, error: "err.mismatch" };
  }

  const origin = normalizePath(base.derivation);
  const childOrigin = normalizePath(parsed.derivation);
  let path = "";

  if (childOrigin && origin && (childOrigin === origin || childOrigin.startsWith(`${origin}/`))) {
    const extra = childOrigin === origin ? "" : childOrigin.slice(origin.length + 1);
    const tail =
      parsed.childPath && parsed.childPath !== "<0;1>/*" && parsed.childPath !== "*"
        ? extra
          ? `/${parsed.childPath}`
          : parsed.childPath
        : "";
    path = `${extra}${tail}`;
    if (!path && parsed.xpub && !sameXpub) {
      path = childOrigin;
    }
  } else if (childOrigin && origin && childOrigin !== origin) {
    path = childOrigin;
  } else if (sameXpub || sameFp) {
    const tail =
      parsed.childPath && parsed.childPath !== "<0;1>/*" && parsed.childPath !== "*"
        ? parsed.childPath
        : "";
    path = tail ? relativizePath(base, tail) : "";
  }

  if (!path && opts?.fallbackPath && (parsed.xpub || sameFp)) {
    path = normalizePath(opts.fallbackPath);
  }

  if (!path) {
    if (!base.xpub && !parentFp) return { ok: false, error: "err.needParent" };
    return { ok: false, error: "err.noChildExpr" };
  }
  if (normalizePath(path) === origin) {
    return { ok: false, error: "err.samePath" };
  }

  return {
    ok: true,
    child: {
      id: uid("ck"),
      path,
      xpub: sameXpub ? "" : parsed.xpub,
      fingerprint: childFp || parentFp,
      note: opts?.alias || "",
    },
  };
}

export function attachChildOrReplace(entry: KeyEntry, text: string): ApplyKeyResult {
  const parent = normalizeKeyEntry(entry);
  if (keyIsFilled(parent)) {
    const child = parseChildKey(parent, text);
    if (child.ok) {
      if (parent.children.some((c) => c.path === child.child.path)) {
        return { ok: false, error: "err.dupChild" };
      }
      return { ok: true, key: { ...parent, children: [...parent.children, child.child] } };
    }
  }
  return applyKeyMaterial(parent, text);
}
