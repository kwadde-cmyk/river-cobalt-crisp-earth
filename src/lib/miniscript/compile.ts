import type { KeyEntry } from "./keys.ts";
import { accountPathFrom, childForAccount } from "./keys.ts";
import type { MsNode } from "./ast.ts";
import { collectKeys, hasHoles } from "./ast.ts";
import { descsumCreate } from "./checksum.ts";
import { compileStages, stageKeyOrderVariants, type Stage } from "./stages.ts";

export function compileMiniscript(node: MsNode, compact = true): string {
  const raw = compileNode(node);
  return compact ? raw.replace(/\s+/g, "") : raw;
}

function compileNode(node: MsNode): string {
  switch (node.kind) {
    case "hole":
      return "/*?*/";
    case "pk":
      return `pk(${node.key})`;
    case "pkh":
      return `pkh(${node.key})`;
    case "multi":
      return `${node.sorted ? "sortedmulti" : "multi"}(${node.k},${node.keys.join(",")})`;
    case "thresh":
      return `thresh(${node.k},${node.children.map(compileNode).join(",")})`;
    case "older":
      return `older(${node.n})`;
    case "after":
      return `after(${node.n})`;
    case "and_v":
    case "and_b":
    case "or_i":
    case "or_d":
    case "or_c":
    case "or_b":
      return `${node.kind}(${compileNode(node.left)},${compileNode(node.right)})`;
    case "andor":
      return `andor(${compileNode(node.x)},${compileNode(node.y)},${compileNode(node.z)})`;
    case "wrap":
      return `${node.wrap}:${compileNode(node.child)}`;
  }
}

export function expandAliasKeys(node: MsNode, keys: KeyEntry[], reuse = true): KeyEntry[] {
  const byName = new Map(keys.map((k) => [k.name, k]));
  const out = [...keys];
  for (const n of collectKeys(node)) {
    if (byName.has(n)) continue;
    const m = n.match(/^([A-Za-z_][A-Za-z_]*?)(\d+)$/);
    const src = m ? byName.get(m[1]!) : undefined;
    if (!src) continue;
    const idx = m ? Number(m[2]) : 0;
    const child = Number.isFinite(idx) ? childForAccount(src, idx) : undefined;
    const expected = accountPathFrom(src.derivation, idx);
    let clone: KeyEntry;
    if (!reuse && child?.xpub) {
      clone = {
        ...src,
        id: `${src.id}_${n}`,
        name: n,
        xpub: child.xpub,
        derivation: child.path.replace(/^m\//, "") || expected,
        fingerprint: child.fingerprint || src.fingerprint,
        children: [],
      };
    } else if (!reuse) {
      clone = {
        ...src,
        id: `${src.id}_${n}`,
        name: n,
        xpub: "",
        derivation: expected,
        children: [],
      };
    } else {
      clone = { ...src, id: `${src.id}_${n}`, name: n };
    }
    out.push(clone);
    byName.set(n, clone);
  }
  return out;
}

export function substituteKeys(ms: string, keys: KeyEntry[]): string {
  let out = ms;
  const sorted = [...keys].sort((a, b) => b.name.length - a.name.length);
  for (const k of sorted) {
    if (!k.xpub.trim()) continue;
    out = replaceKeyToken(out, k.name, formatKeyExpr(k));
  }
  return out;
}

function replaceKeyToken(src: string, name: string, expr: string): string {
  const re = new RegExp(`(?<![A-Za-z0-9_])${escapeRe(name)}(?![A-Za-z0-9_])`, "g");
  return src.replace(re, expr);
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatKeyExpr(k: KeyEntry): string {
  const xpub = k.xpub.trim();
  if (!xpub) return k.name;
  if (xpub.includes("[") || xpub.includes("/")) return xpub;
  const path = (k.derivation || "48'/0'/0'/2'").replace(/^m\//, "");
  const fp = (k.fingerprint || "00000000").replace(/^#/, "").slice(0, 8);
  const tail = (k.childPath || `${k.multipath || "<0;1>"}/*`).replace(/^\//, "");
  return `[${fp}/${path}]${xpub}/${tail}`;
}

export function compileDescriptor(
  node: MsNode,
  keys: KeyEntry[],
  reuse = true,
): { ok: boolean; miniscript: string; descriptor: string; error?: string } {
  if (hasHoles(node)) {
    return {
      ok: false,
      miniscript: compileMiniscript(node),
      descriptor: "",
      error: "Es fehlen noch Bausteine (leere Slots).",
    };
  }
  const miniscript = compileMiniscript(node);
  const inner = substituteKeys(miniscript, expandAliasKeys(node, keys, reuse));
  const descriptor = descsumCreate(`wsh(${inner})`);
  return { ok: true, miniscript, descriptor };
}

export function compileBsms(descriptor: string, firstAddress?: string): string {
  const lines = ["BSMS 1.0", descriptor, "/0/*,/1/*"];
  if (firstAddress) lines.push(firstAddress);
  return lines.join("\n");
}

export function descriptorOrderVariants(
  stages: Stage[],
  keys: KeyEntry[],
  reuse = true,
  limit = 120,
): { stages: Stage[]; descriptor: string; checksum: string; orders: string[] }[] {
  const variants = stageKeyOrderVariants(stages, limit);
  const seen = new Set<string>();
  const out: { stages: Stage[]; descriptor: string; checksum: string; orders: string[] }[] = [];
  for (const next of variants) {
    const { root } = compileStages(next, reuse);
    const compiled = compileDescriptor(root, keys, reuse);
    if (!compiled.ok) continue;
    const hash = compiled.descriptor.lastIndexOf("#");
    const checksum = hash >= 0 ? compiled.descriptor.slice(hash + 1) : "";
    if (!checksum || seen.has(checksum)) continue;
    seen.add(checksum);
    out.push({
      stages: next,
      descriptor: compiled.descriptor,
      checksum,
      orders: next.map((s) => s.keys.join(" · ")),
    });
  }
  return out;
}
