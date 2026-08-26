import type { MsNode } from "./ast.ts";
import { uid } from "../utils.ts";

export interface Stage {
  id: string;
  delay: number;
  k: number;
  keys: string[];
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
    .map((s) => ({
      ...s,
      keys: s.keys.map((k) => k.trim()).filter(Boolean),
      delay: Math.max(0, Math.round(Number(s.delay) || 0)),
      k: Math.max(1, Math.round(Number(s.k) || 1)),
    }))
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
  function body(s: (typeof cleaned)[number]): MsNode {
    const names = s.keys.map((k) => {
      const a = alias(k);
      aliases.push(a);
      return a;
    });
    const k = Math.min(Math.max(s.k, 1), names.length);
    if (names.length === 1 && k === 1) {
      return { id: uid(), kind: "pk", key: names[0]! };
    }
    return { id: uid(), kind: "multi", k, keys: names };
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
