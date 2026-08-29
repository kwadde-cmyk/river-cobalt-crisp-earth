import type { MsNode } from "./ast.ts";
import { visit } from "./ast.ts";
import { uid } from "../utils.ts";
import { baseKeyName, keyRoleLabel } from "./keys.ts";

export interface Stage {
  id: string;
  delay: number;
  k: number;
  keys: string[];
  /** Keys that must sign (AND). Remaining keys are an OR / k-of-rest. */
  required?: string[];
  /** If true, compile sortedmulti — pubkey order does not change the script. */
  sorted?: boolean;
}

export const DELAY_PRESETS = [0, 1, 144, 1008, 4320, 52596, 60000, 65534] as const;

export function defaultStages(): Stage[] {
  return [{ id: uid("st"), delay: 0, k: 2, keys: ["A", "B", "C"] }];
}

export function nextStageDelay(stages: Stage[]): number {
  const max = Math.max(0, ...stages.map((s) => s.delay));
  if (max <= 0) return 52596;
  if (max < 60000) return 60000;
  if (max < 65534) return 65534;
  return Math.min(65534, max);
}

function cleanedStages(stages: Stage[]) {
  return stages
    .map((s) => {
      const keys = s.keys.map((k) => k.trim()).filter(Boolean);
      const required = (s.required ?? []).map((k) => k.trim()).filter((k) => keys.includes(k));
      const k = Math.max(1, Math.round(Number(s.k) || 1));
      return {
        ...s,
        keys,
        k,
        required: required.length && k < keys.length ? required : undefined,
        delay: Math.max(0, Math.round(Number(s.delay) || 0)),
      };
    })
    .filter((s) => s.keys.length > 0)
    .sort((a, b) => a.delay - b.delay || a.id.localeCompare(b.id));
}

export function reuseAliasHints(
  stages: Stage[],
  reuse: boolean,
): Map<string, { alias: string; delay: number; account?: number }[]> {
  const map = new Map<string, { alias: string; delay: number; account?: number }[]>();
  const cleaned = cleanedStages(stages);
  const counts = new Map<string, number>();
  for (const s of cleaned) {
    for (const k of s.keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  for (const s of cleaned) {
    for (const name of s.keys) {
      if ((counts.get(name) ?? 0) <= 1) continue;
      const n = (seen.get(name) ?? 0) + 1;
      seen.set(name, n);
      const list = map.get(name) ?? [];
      if (reuse) {
        list.push({ alias: `${name}${n}`, delay: s.delay });
      } else if (n > 1) {
        list.push({ alias: `${name}${n - 1}`, delay: s.delay, account: n - 1 });
      }
      map.set(name, list);
    }
  }
  return map;
}

export function stageIndicesForAccount(
  stages: Stage[],
  masterName: string,
  account: number,
  reuse: boolean,
): number[] {
  return slotsForAccount(stages, masterName, account, reuse).map((s) => s.index);
}

export interface StageSignerSlot {
  index: number;
  delay: number;
  k: number;
  n: number;
  quorum: string;
  signers: { token: string; role: string; account: number }[];
}

export function describeStageSlots(stages: Stage[], reuse: boolean): StageSignerSlot[] {
  const cleaned = cleanedStages(stages);
  const counts = new Map<string, number>();
  for (const s of cleaned) {
    for (const k of s.keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  return cleaned.map((s, i) => {
    const signers = s.keys.map((name) => {
      const total = counts.get(name) ?? 1;
      const n = (seen.get(name) ?? 0) + 1;
      seen.set(name, n);
      let account = 0;
      if (!reuse && total > 1) account = n === 1 ? 0 : n - 1;
      const token = account > 0 ? `${name}${account}` : name;
      return { token, role: keyRoleLabel(token), account };
    });
    const nKeys = s.keys.length;
    const k = Math.min(Math.max(s.k, 1), Math.max(nKeys, 1));
    return {
      index: i + 1,
      delay: s.delay,
      k,
      n: nKeys,
      quorum: `${k}of${nKeys}`,
      signers,
    };
  });
}

export function slotsForAccount(
  stages: Stage[],
  masterName: string,
  account: number,
  reuse: boolean,
): StageSignerSlot[] {
  return describeStageSlots(stages, reuse).filter((slot) =>
    slot.signers.some((s) => baseKeyName(s.token) === masterName && s.account === account),
  );
}

export function isDerivedAlias(name: string, masters: Iterable<string>): boolean {
  const set = masters instanceof Set ? masters : new Set(masters);
  if (set.has(name)) return false;
  const m = name.match(/^([A-Za-z_][A-Za-z_]*)(\d+)$/);
  return Boolean(m && set.has(m[1]!));
}

export function compileStages(
  stages: Stage[],
  reuse = true,
): { root: MsNode; aliases: string[] } {
  const cleaned = cleanedStages(stages);

  if (!cleaned.length) {
    return { root: { id: uid(), kind: "hole", hint: "Stufe" }, aliases: [] };
  }

  const counts = new Map<string, number>();
  for (const s of cleaned) {
    for (const k of s.keys) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  function alias(name: string): string {
    if ((counts.get(name) ?? 0) <= 1) return name;
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    if (reuse) return `${name}${n}`;
    return n === 1 ? name : `${name}${n - 1}`;
  }

  const aliases: string[] = [];
  function aliasName(name: string): string {
    const a = alias(name);
    aliases.push(a);
    return a;
  }

  function pk(name: string): MsNode {
    return { id: uid(), kind: "pk", key: name };
  }
  function wrapV(child: MsNode): MsNode {
    return { id: uid(), kind: "wrap", wrap: "v", child };
  }
  function andV(left: MsNode, right: MsNode): MsNode {
    return { id: uid(), kind: "and_v", left: wrapV(left), right };
  }
  function orD(left: MsNode, right: MsNode): MsNode {
    return { id: uid(), kind: "or_d", left, right };
  }
  function andAll(nodes: MsNode[]): MsNode {
    return nodes.reduce((acc, n) => andV(acc, n));
  }
  function orAll(nodes: MsNode[]): MsNode {
    return nodes.reduce((acc, n) => orD(acc, n));
  }

  function body(s: (typeof cleaned)[number]): MsNode {
    const mapped = new Map<string, string>();
    const names = s.keys.map((k) => {
      if (!mapped.has(k)) mapped.set(k, aliasName(k));
      return mapped.get(k)!;
    });
    const reqNames = (s.required ?? [])
      .map((k) => mapped.get(k))
      .filter((n): n is string => Boolean(n));
    const rest = names.filter((n) => !reqNames.includes(n));
    if (reqNames.length && rest.length) {
      const must = reqNames.length === 1 ? pk(reqNames[0]!) : andAll(reqNames.map(pk));
      const restK = Math.max(1, Math.min((s.k || 1) - reqNames.length, rest.length));
      const choice =
        restK >= rest.length
          ? rest.length === 1
            ? pk(rest[0]!)
            : { id: uid(), kind: "multi" as const, k: rest.length, keys: rest }
          : restK === 1
            ? rest.length === 1
              ? pk(rest[0]!)
              : orAll(rest.map(pk))
            : { id: uid(), kind: "multi" as const, k: restK, keys: rest };
      return andV(must, choice);
    }
    if (reqNames.length && !rest.length) {
      return reqNames.length === 1 ? pk(reqNames[0]!) : andAll(reqNames.map(pk));
    }
    const k = Math.min(Math.max(s.k, 1), names.length);
    if (names.length === 1 && k === 1) return pk(names[0]!);
    return { id: uid(), kind: "multi", k, keys: names, sorted: Boolean(s.sorted) };
  }

  function locked(s: (typeof cleaned)[number]): MsNode {
    const b = body(s);
    if (s.delay <= 0) return b;
    return {
      id: uid(),
      kind: "and_v",
      left: { id: uid(), kind: "wrap", wrap: "v", child: b },
      right: { id: uid(), kind: "older", n: Math.min(s.delay, 65535) },
    };
  }

  let acc = locked(cleaned[0]!);
  for (let i = 1; i < cleaned.length; i++) {
    acc = { id: uid(), kind: "or_i", left: locked(cleaned[i]!), right: acc };
  }
  return { root: acc, aliases };
}

function unwrap(n: MsNode): MsNode {
  while (n.kind === "wrap") n = n.child;
  return n;
}

function splitDisjuncts(n: MsNode): MsNode[] {
  n = unwrap(n);
  if (n.kind === "or_i" || n.kind === "or_d" || n.kind === "or_c" || n.kind === "or_b") {
    return [...splitDisjuncts(n.left), ...splitDisjuncts(n.right)];
  }
  if (n.kind === "andor") {
    const xy: MsNode = { id: uid(), kind: "and_v", left: n.x, right: n.y };
    return [...splitDisjuncts(xy), ...splitDisjuncts(n.z)];
  }
  return [n];
}

function peelLock(n: MsNode): { delay: number; body: MsNode } {
  n = unwrap(n);
  if (n.kind === "older" || n.kind === "after") {
    return { delay: n.n, body: { id: uid(), kind: "hole" } };
  }
  if (n.kind === "and_v" || n.kind === "and_b") {
    const L = peelLock(n.left);
    const R = peelLock(n.right);
    const delay = L.delay + R.delay;
    const lHole = L.body.kind === "hole";
    const rHole = R.body.kind === "hole";
    if (lHole && rHole) return { delay, body: { id: uid(), kind: "hole" } };
    if (lHole) return { delay, body: R.body };
    if (rHole) return { delay, body: L.body };
    return {
      delay,
      body: { id: uid(), kind: n.kind, left: L.body, right: R.body },
    };
  }
  return { delay: 0, body: n };
}

type KeyShape =
  | { type: "pk"; key: string }
  | { type: "multi"; k: number; keys: string[] }
  | { type: "and"; parts: KeyShape[] }
  | { type: "or"; parts: KeyShape[] };

function shapeOf(n: MsNode): KeyShape | null {
  n = unwrap(n);
  if (n.kind === "pk" || n.kind === "pkh") return { type: "pk", key: baseKeyName(n.key) };
  if (n.kind === "multi") {
    return { type: "multi", k: n.k, keys: [...new Set(n.keys.map(baseKeyName))] };
  }
  if (n.kind === "older" || n.kind === "after" || n.kind === "hole") return null;
  if (n.kind === "and_v" || n.kind === "and_b") {
    const L = shapeOf(n.left);
    const R = shapeOf(n.right);
    if (!L) return R;
    if (!R) return L;
    const parts = [...(L.type === "and" ? L.parts : [L]), ...(R.type === "and" ? R.parts : [R])];
    return { type: "and", parts };
  }
  if (n.kind === "or_i" || n.kind === "or_d" || n.kind === "or_c" || n.kind === "or_b") {
    const L = shapeOf(n.left);
    const R = shapeOf(n.right);
    if (!L) return R;
    if (!R) return L;
    const parts = [...(L.type === "or" ? L.parts : [L]), ...(R.type === "or" ? R.parts : [R])];
    return { type: "or", parts };
  }
  if (n.kind === "thresh") {
    const parts = n.children.map(shapeOf);
    if (parts.some((p) => !p)) return null;
    const keys = [...new Set(parts.flatMap((p) => shapeKeys(p!)))];
    return { type: "multi", k: Math.min(n.k, keys.length), keys };
  }
  return null;
}

function shapeKeys(s: KeyShape): string[] {
  if (s.type === "pk") return [s.key];
  if (s.type === "multi") return s.keys;
  return s.parts.flatMap(shapeKeys);
}

function flattenShape(shape: KeyShape): { keys: string[]; k: number; required?: string[] } {
  if (shape.type === "pk") return { keys: [shape.key], k: 1, required: [shape.key] };
  if (shape.type === "multi") {
    const keys = [...new Set(shape.keys)];
    const required = shape.k >= keys.length ? keys : undefined;
    return { keys, k: Math.min(shape.k, keys.length), required };
  }
  if (shape.type === "and") {
    const parts = shape.parts.map(flattenShape);
    const keys = [...new Set(parts.flatMap((p) => p.keys))];
    const required = [
      ...new Set(parts.flatMap((p) => p.required ?? (p.k >= p.keys.length ? p.keys : []))),
    ].filter((k) => keys.includes(k));
    const k = Math.min(
      keys.length,
      parts.reduce((sum, p) => sum + p.k, 0),
    );
    return { keys, k, required: required.length ? required : undefined };
  }
  const parts = shape.parts.map(flattenShape);
  const keys = [...new Set(parts.flatMap((p) => p.keys))];
  const k = Math.min(...parts.map((p) => p.k));
  return { keys, k };
}

export function stageFormula(stage: Stage): string {
  const req = (stage.required ?? []).filter((k) => stage.keys.includes(k));
  const rest = stage.keys.filter((k) => !req.includes(k));
  if (req.length && rest.length) {
    const must = req.join(" + ");
    const choice = rest.length === 1 ? rest[0]! : `(${rest.join(" | ")})`;
    return `${must} + ${choice}`;
  }
  if (req.length && !rest.length) return req.join(" + ");
  if (stage.k >= stage.keys.length) return stage.keys.join(" + ");
  return `${stage.k}/${stage.keys.length} ${stage.keys.join(" · ")}`;
}

function stageSig(delay: number, keys: string[], k: number, required?: string[]): string {
  const sorted = [...keys].sort();
  const req = (required ?? []).filter((x) => keys.includes(x)).sort();
  const reqPart =
    req.length > 0 ? req.join(",") : k >= sorted.length || sorted.length <= 1 ? sorted.join(",") : "";
  return `${delay}|${k}|${sorted.join(",")}|${reqPart}`;
}

/** Recover the left-hand stage GUI from an imported miniscript / wallet policy. */
export function inferStages(root: MsNode | null): Stage[] {
  if (!root || root.kind === "hole") return [];
  const stages: Stage[] = [];
  for (const branch of splitDisjuncts(root)) {
    const { delay, body } = peelLock(branch);
    const shape = shapeOf(body);
    if (!shape) continue;
    const flat = flattenShape(shape);
    if (!flat.keys.length) continue;
    stages.push({
      id: uid("st"),
      delay: Math.max(0, Math.min(65534, delay)),
      k: Math.max(1, flat.k),
      keys: flat.keys,
      required: flat.required,
    });
  }
  if (!stages.length) return [];
  const merged = new Map<string, Stage>();
  for (const s of stages) {
    const sig = stageSig(s.delay, s.keys, s.k, s.required);
    if (!merged.has(sig)) merged.set(sig, s);
  }
  return [...merged.values()].sort((a, b) => a.delay - b.delay);
}

export function stageHighlightIds(
  root: MsNode | null,
  stages: Stage[],
  stageId: string | null,
): Set<string> {
  const ids = new Set<string>();
  if (!root || !stageId) return ids;
  const target = stages.find((s) => s.id === stageId);
  if (!target) return ids;
  const want = stageSig(target.delay, target.keys, target.k, target.required);
  for (const branch of splitDisjuncts(root)) {
    const { delay, body } = peelLock(branch);
    const shape = shapeOf(body);
    if (!shape) continue;
    const flat = flattenShape(shape);
    if (stageSig(delay, flat.keys, flat.k, flat.required) !== want) continue;
    visit(branch, (n) => ids.add(n.id));
    break;
  }
  if (ids.size) return ids;
  const names = new Set(target.keys.map(baseKeyName));
  visit(root, (n) => {
    if ((n.kind === "pk" || n.kind === "pkh") && names.has(baseKeyName(n.key))) ids.add(n.id);
    if (n.kind === "multi" && n.keys.some((k) => names.has(baseKeyName(k)))) ids.add(n.id);
    if ((n.kind === "older" || n.kind === "after") && n.n === target.delay && target.delay > 0) ids.add(n.id);
  });
  return ids;
}

export function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items.slice()];
  if (items.length > 5) return [items.slice()];
  const out: T[][] = [];
  const a = items.slice();
  const c = new Array(a.length).fill(0);
  out.push(a.slice());
  let i = 0;
  while (i < a.length) {
    if (c[i]! < i) {
      const j = i % 2 === 0 ? 0 : c[i]!;
      const tmp = a[j]!;
      a[j] = a[i]!;
      a[i] = tmp;
      out.push(a.slice());
      c[i]! += 1;
      i = 0;
    } else {
      c[i] = 0;
      i += 1;
    }
  }
  return out;
}

export function stageKeyOrderVariants(stages: Stage[], limit = 48): Stage[][] {
  const cleaned = cleanedStages(stages);
  if (!cleaned.length) return [];
  const options = cleaned.map((s) => (s.sorted || s.keys.length <= 1 ? [s.keys] : permutations(s.keys)));
  let product: string[][][] = [[]];
  for (const list of options) {
    product = product.flatMap((row) => list.map((keys) => [...row, keys]));
    if (product.length > limit * 4) break;
  }
  return product.slice(0, limit).map((orders) =>
    cleaned.map((s, i) => ({
      ...s,
      keys: orders[i] ?? s.keys,
    })),
  );
}

export function stageOrderCount(stages: Stage[]): { total: number; capped: boolean } {
  const cleaned = cleanedStages(stages);
  let total = 1;
  let capped = false;
  for (const s of cleaned) {
    if (s.sorted || s.keys.length <= 1) continue;
    if (s.keys.length > 5) capped = true;
    const n = Math.min(s.keys.length, 5);
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    total *= f;
  }
  return { total, capped };
}
