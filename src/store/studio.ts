import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MsNode, WrapCode } from "@/lib/miniscript/ast";
import { coreOf, findNode, hole, mapNode } from "@/lib/miniscript/ast";
import {
  applyKeyMaterial,
  emptyKey,
  extractKeysFromTree,
  nextKeyName,
  normalizeKeyEntry,
  parseChildKey,
  parseKeyList,
  type KeyEntry,
} from "@/lib/miniscript/keys";
import { buildOperator, wrapNode, type BuildParams } from "@/lib/miniscript/operators";
import { parseAny } from "@/lib/miniscript/parser";
import { compileStages, defaultStages, isDerivedAlias, type Stage } from "@/lib/miniscript/stages";
import { materializeWalletPolicy, parseWalletPolicy } from "@/lib/miniscript/bip388";
import { isLocale, localizeMessage, t, type Locale } from "@/lib/i18n";

export type { KeyEntry, Stage };

interface StudioState {
  keys: KeyEntry[];
  root: MsNode | null;
  stages: Stage[];
  selectedId: string | null;
  network: "mainnet" | "testnet";
  reuseKeys: boolean;
  locale: Locale;
  importError: string | null;
  setNetwork: (n: "mainnet" | "testnet") => void;
  setReuseKeys: (v: boolean) => void;
  setLocale: (locale: Locale) => void;
  select: (id: string | null) => void;
  setRoot: (node: MsNode | null) => void;
  setStages: (stages: Stage[]) => void;
  applyOperator: (opId: string, params: BuildParams) => void;
  wrapSelected: (wrap: WrapCode) => void;
  unwrapSelected: () => void;
  deleteSelected: () => void;
  patchNode: (id: string, patch: Record<string, unknown>) => void;
  addKey: () => void;
  updateKey: (id: string, patch: Partial<KeyEntry>) => void;
  removeKey: (id: string) => void;
  removeChild: (keyId: string, childId: string) => void;
  importText: (text: string) => void;
  importKeysText: (text: string) => void;
  importKeyText: (id: string, text: string) => string | null;
  importChildText: (id: string, text: string, opts?: { fallbackPath?: string; alias?: string }) => string | null;
  reset: () => void;
}

function insertInto(root: MsNode | null, selectedId: string | null, next: MsNode): MsNode {
  if (!root) return next;
  if (!selectedId) return next;
  if (!findNode(root, selectedId)) return next;
  return mapNode(root, selectedId, () => next);
}

function unwrapOneAround(root: MsNode, targetId: string): MsNode {
  if (root.kind === "wrap" && (root.id === targetId || coreOf(root).id === targetId)) {
    return root.child;
  }
  switch (root.kind) {
    case "thresh":
      return { ...root, children: root.children.map((c) => unwrapOneAround(c, targetId)) };
    case "and_v":
    case "and_b":
    case "or_i":
    case "or_d":
    case "or_c":
    case "or_b":
      return {
        ...root,
        left: unwrapOneAround(root.left, targetId),
        right: unwrapOneAround(root.right, targetId),
      };
    case "andor":
      return {
        ...root,
        x: unwrapOneAround(root.x, targetId),
        y: unwrapOneAround(root.y, targetId),
        z: unwrapOneAround(root.z, targetId),
      };
    case "wrap":
      return { ...root, child: unwrapOneAround(root.child, targetId) };
    default:
      return root;
  }
}

function mergeKeyLists(current: KeyEntry[], incoming: KeyEntry[]): KeyEntry[] {
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
        note: k.note || hit.note,
      };
    } else {
      out.push(k);
      byName.set(k.name, k);
    }
  }
  return out;
}

function keysForStages(stages: Stage[], current: KeyEntry[], network: "mainnet" | "testnet"): KeyEntry[] {
  const names = [...new Set(stages.flatMap((s) => s.keys))];
  const masters = new Set(names);
  const byName = new Map(current.map((k) => [k.name, k]));
  const out: KeyEntry[] = [];
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

function applyStageTree(
  stages: Stage[],
  current: KeyEntry[],
  network: "mainnet" | "testnet",
  reuseKeys: boolean,
) {
  const { root } = compileStages(stages, reuseKeys);
  return {
    stages,
    root,
    keys: keysForStages(stages, current, network),
    selectedId: root.id,
    importError: null,
  };
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      keys: [emptyKey("A"), emptyKey("B"), emptyKey("C")],
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
          keys: get().keys.map((k) =>
            !k.xpub && (!k.derivation || k.derivation === prevPath)
              ? { ...k, derivation: nextPath }
              : k,
          ),
        });
      },
      setReuseKeys: (reuseKeys) => {
        const { stages, keys, network } = get();
        if (stages.length) {
          set({ reuseKeys, ...applyStageTree(stages, keys, network, reuseKeys) });
          return;
        }
        set({ reuseKeys });
      },
      setLocale: (locale) => set({ locale: isLocale(locale) ? locale : "de" }),
      select: (selectedId) => set({ selectedId }),
      setRoot: (root) => set({ root, selectedId: root?.id ?? null }),
      setStages: (stages) => set(applyStageTree(stages, get().keys, get().network, get().reuseKeys)),
      applyOperator: (opId, params) => {
        const node = buildOperator(opId, params);
        const { root, selectedId } = get();
        set({
          root: insertInto(root, selectedId, node),
          selectedId: node.id,
          importError: null,
          stages: [],
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
          stages: [],
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
            stages: [],
          });
          return;
        }
        set({ root: unwrapOneAround(root, selectedId), stages: [] });
      },
      deleteSelected: () => {
        const { root, selectedId } = get();
        if (!root || !selectedId) return;
        if (root.id === selectedId) {
          set({ root: null, selectedId: null, stages: [] });
          return;
        }
        const nextHole = hole();
        set({
          root: mapNode(root, selectedId, () => nextHole),
          selectedId: nextHole.id,
          stages: [],
        });
      },
      patchNode: (id, patch) => {
        const { root } = get();
        if (!root) return;
        set({
          root: mapNode(root, id, (n) => ({ ...n, ...patch }) as MsNode),
          stages: [],
        });
      },
      addKey: () => {
        const names = get().keys.map((k) => k.name);
        set({ keys: [...get().keys, emptyKey(nextKeyName(names), get().network)] });
      },
      updateKey: (id, patch) => {
        set({ keys: get().keys.map((k) => (k.id === id ? { ...k, ...patch } : k)) });
      },
      removeKey: (id) => {
        const { keys, stages, reuseKeys } = get();
        const removed = keys.find((k) => k.id === id);
        const nextKeys = keys.filter((k) => k.id !== id);
        if (!removed || !stages.length) {
          set({ keys: nextKeys });
          return;
        }
        const nextStages = stages
          .map((s) => {
            const names = s.keys.filter((n) => n !== removed.name);
            return { ...s, keys: names, k: Math.min(s.k, Math.max(names.length, 1)) };
          })
          .filter((s) => s.keys.length);
        set(
          applyStageTree(
            nextStages.length ? nextStages : defaultStages(),
            nextKeys,
            get().network,
            reuseKeys,
          ),
        );
      },
      removeChild: (keyId, childId) => {
        set({
          keys: get().keys.map((k) => {
            if (k.id !== keyId) return k;
            const cur = normalizeKeyEntry(k);
            return { ...cur, children: cur.children.filter((c) => c.id !== childId) };
          }),
        });
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
              importError: null,
            });
          } catch (e) {
            set({
              importError: e instanceof Error ? e.message : t(get().locale, "import.fail"),
            });
          }
          return;
        }
        const keyList = parseKeyList(text);
        if (keyList) {
          set({ keys: mergeKeyLists(get().keys, keyList), importError: null });
          return;
        }
        try {
          const parsed = parseAny(text);
          const extracted = extractKeysFromTree(parsed.node, get().keys);
          set({
            root: extracted.node,
            selectedId: extracted.node.id,
            keys: extracted.keys,
            stages: [],
            importError: null,
          });
        } catch (e) {
          set({
            importError: e instanceof Error ? e.message : t(get().locale, "import.fail"),
          });
        }
      },
      importKeysText: (text) => {
        const keyList = parseKeyList(text);
        if (!keyList) {
          set({ importError: t(get().locale, "import.noXpubs") });
          return;
        }
        set({ keys: mergeKeyLists(get().keys, keyList), importError: null });
      },
      importKeyText: (id, text) => {
        const target = get().keys.find((k) => k.id === id);
        if (!target) return t(get().locale, "err.noKey");
        const result = applyKeyMaterial(target, text);
        if (!result.ok) return localizeMessage(get().locale, result.error);
        set({
          keys: get().keys.map((k) => (k.id === id ? result.key : k)),
          importError: null,
        });
        return null;
      },
      importChildText: (id, text, opts) => {
        const target = get().keys.find((k) => k.id === id);
        if (!target) return t(get().locale, "err.noKey");
        const parsed = parseChildKey(normalizeKeyEntry(target), text, opts);
        if (!parsed.ok) return localizeMessage(get().locale, parsed.error);
        if (target.children?.some((c) => c.path === parsed.child.path)) {
          return t(get().locale, "err.dupChild");
        }
        set({
          keys: get().keys.map((k) =>
            k.id === id
              ? normalizeKeyEntry({ ...k, children: [...(k.children ?? []), parsed.child] })
              : k,
          ),
        });
        return null;
      },
      reset: () => set(applyStageTree(defaultStages(), [], get().network, get().reuseKeys)),
    }),
    {
      name: "scriptwerk-studio-v2",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage : localStorage,
      ),
      partialize: (s) => ({
        keys: s.keys,
        root: s.root,
        stages: s.stages,
        network: s.network,
        reuseKeys: s.reuseKeys,
        locale: s.locale,
      }),
      skipHydration: true,
    },
  ),
);
