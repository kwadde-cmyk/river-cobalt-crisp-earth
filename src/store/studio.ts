import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { MsNode, WrapCode } from "@/lib/miniscript/ast";
import { coreOf, findNode, hole, mapKeyStrings, mapNode } from "@/lib/miniscript/ast";
import {
  applyKeyMaterial,
  collapseAliasKeys,
  emptyKey,
  extractKeysFromTree,
  groupKeysByFingerprint,
  nextKeyName,
  normalizeKeyEntry,
  orderMasterNames,
  parseChildKey,
  parseKeyList,
  relabelKeysFromA,
  type KeyEntry,
} from "@/lib/miniscript/keys";
import { buildOperator, wrapNode, type BuildParams } from "@/lib/miniscript/operators";
import { parseAny } from "@/lib/miniscript/parser";
import { compileStages, defaultStages, inferStages, isDerivedAlias, type Stage } from "@/lib/miniscript/stages";
import { materializeWalletPolicy, parseScriptwerkBundle, parseWalletPolicy } from "@/lib/miniscript/bip388";
import { isLocale, localizeMessage, t, type Locale } from "@/lib/i18n";

type Snapshot = {
  keys: KeyEntry[];
  root: MsNode | null;
  stages: Stage[];
  selectedId: string | null;
  selectedStageId: string | null;
  network: "mainnet" | "testnet";
  reuseKeys: boolean;
};

function snapOf(s: Snapshot): Snapshot {
  return structuredClone({
    keys: s.keys,
    root: s.root,
    stages: s.stages,
    selectedId: s.selectedId,
    selectedStageId: s.selectedStageId,
    network: s.network,
    reuseKeys: s.reuseKeys,
  });
}

const HISTORY = 60;

interface StudioState {
  keys: KeyEntry[];
  root: MsNode | null;
  stages: Stage[];
  selectedId: string | null;
  selectedStageId: string | null;
  network: "mainnet" | "testnet";
  reuseKeys: boolean;
  locale: Locale;
  importError: string | null;
  past: Snapshot[];
  future: Snapshot[];
  setNetwork: (n: "mainnet" | "testnet") => void;
  setReuseKeys: (v: boolean) => void;
  setLocale: (locale: Locale) => void;
  select: (id: string | null) => void;
  selectStage: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
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

function adoptImportedTree(node: MsNode, keys: KeyEntry[]) {
  const grouped = groupKeysByFingerprint(keys);
  const renamed = grouped.rename.size
    ? mapKeyStrings(node, (tok) => grouped.rename.get(tok) ?? tok)
    : node;
  const stages = inferStages(renamed);
  const masters = stages.flatMap((s) => s.keys);
  const folded = masters.length ? collapseAliasKeys(grouped.keys, masters) : grouped.keys;
  const labeled = relabelKeysFromA(folded, stages, renamed);
  return {
    root: labeled.root ?? renamed,
    selectedId: (labeled.root ?? renamed).id,
    keys: labeled.keys,
    stages: labeled.stages,
    importError: null as string | null,
  };
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
  const names = orderMasterNames(stages, current);
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

function debounceStorage(inner: { getItem: (n: string) => string | null; setItem: (n: string, v: string) => void; removeItem: (n: string) => void }, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: { name: string; value: string } | undefined;
  return {
    getItem: (name: string) => inner.getItem(name),
    setItem: (name: string, value: string) => {
      pending = { name, value };
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (pending) inner.setItem(pending.name, pending.value);
        pending = undefined;
      }, ms);
    },
    removeItem: (name: string) => {
      if (timer) clearTimeout(timer);
      pending = undefined;
      inner.removeItem(name);
    },
  };
}

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => {
      const mutate = (patch: Partial<StudioState>) => {
        const cur = get();
        set({
          ...patch,
          past: [...cur.past, snapOf(cur)].slice(-HISTORY),
          future: [],
        });
      };
      const boot = applyStageTree(
        defaultStages(),
        [emptyKey("A"), emptyKey("B"), emptyKey("C")],
        "mainnet",
        false,
      );
      return {
      keys: boot.keys,
      root: boot.root,
      stages: boot.stages,
      selectedId: boot.selectedId,
      selectedStageId: null,
      network: "mainnet",
      reuseKeys: false,
      locale: "de",
      importError: null,
      past: [],
      future: [],
      setNetwork: (network) => {
        const nextPath = network === "testnet" ? "48'/1'/0'/2'" : "48'/0'/0'/2'";
        const prevPath = network === "testnet" ? "48'/0'/0'/2'" : "48'/1'/0'/2'";
        mutate({
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
          mutate({ reuseKeys, ...applyStageTree(stages, keys, network, reuseKeys) });
          return;
        }
        mutate({ reuseKeys });
      },
      setLocale: (locale) => set({ locale: isLocale(locale) ? locale : "de" }),
      select: (selectedId) => set({ selectedId, selectedStageId: null }),
      selectStage: (id) =>
        set({
          selectedStageId: get().selectedStageId === id ? null : id,
          selectedId: get().selectedStageId === id ? get().selectedId : null,
        }),
      undo: () => {
        const cur = get();
        if (!cur.past.length) return;
        const prev = cur.past[cur.past.length - 1]!;
        set({
          ...prev,
          past: cur.past.slice(0, -1),
          future: [...cur.future, snapOf(cur)],
          importError: null,
        });
      },
      redo: () => {
        const cur = get();
        if (!cur.future.length) return;
        const next = cur.future[cur.future.length - 1]!;
        set({
          ...next,
          future: cur.future.slice(0, -1),
          past: [...cur.past, snapOf(cur)],
          importError: null,
        });
      },
      setRoot: (root) => mutate({ root, selectedId: root?.id ?? null }),
      setStages: (stages) => {
        const cur = get();
        const next = applyStageTree(stages, cur.keys, cur.network, cur.reuseKeys);
        mutate({
          ...next,
          selectedId: cur.selectedStageId ? null : (next.root?.id ?? null),
          selectedStageId: cur.selectedStageId,
        });
      },
      applyOperator: (opId, params) => {
        const node = buildOperator(opId, params);
        const { root, selectedId } = get();
        mutate({
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
        mutate({
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
          mutate({
            root: mapNode(root, selectedId, () => target.child),
            selectedId: target.child.id,
            stages: [],
          });
          return;
        }
        mutate({ root: unwrapOneAround(root, selectedId), stages: [] });
      },
      deleteSelected: () => {
        const { root, selectedId } = get();
        if (!root || !selectedId) return;
        if (root.id === selectedId) {
          mutate({ root: null, selectedId: null, stages: [] });
          return;
        }
        const nextHole = hole();
        mutate({
          root: mapNode(root, selectedId, () => nextHole),
          selectedId: nextHole.id,
          stages: [],
        });
      },
      patchNode: (id, patch) => {
        const { root } = get();
        if (!root) return;
        mutate({
          root: mapNode(root, id, (n) => ({ ...n, ...patch }) as MsNode),
          stages: [],
        });
      },
      addKey: () => {
        const names = get().keys.map((k) => k.name);
        mutate({ keys: [...get().keys, emptyKey(nextKeyName(names), get().network)] });
      },
      updateKey: (id, patch) => {
        mutate({ keys: get().keys.map((k) => (k.id === id ? { ...k, ...patch } : k)) });
      },
      removeKey: (id) => {
        const { keys, stages, reuseKeys } = get();
        const removed = keys.find((k) => k.id === id);
        const nextKeys = keys.filter((k) => k.id !== id);
        if (!removed || !stages.length) {
          mutate({ keys: nextKeys });
          return;
        }
        const nextStages = stages
          .map((s) => {
            const names = s.keys.filter((n) => n !== removed.name);
            return { ...s, keys: names, k: Math.min(s.k, Math.max(names.length, 1)) };
          })
          .filter((s) => s.keys.length);
        mutate(
          applyStageTree(
            nextStages.length ? nextStages : defaultStages(),
            nextKeys,
            get().network,
            reuseKeys,
          ),
        );
      },
      removeChild: (keyId, childId) => {
        mutate({
          keys: get().keys.map((k) => {
            if (k.id !== keyId) return k;
            const cur = normalizeKeyEntry(k);
            return { ...cur, children: cur.children.filter((c) => c.id !== childId) };
          }),
        });
      },
      importText: (text) => {
        const bundle = parseScriptwerkBundle(text);
        if (bundle) {
          try {
            const src = bundle.miniscript || bundle.descriptor;
            const parsed = parseAny(src);
            const extracted = extractKeysFromTree(parsed.node, bundle.keys);
            const byXpub = new Map(bundle.keys.filter((k) => k.xpub).map((k) => [k.xpub, k]));
            const byName = new Map(bundle.keys.map((k) => [k.name, k]));
            const keys = extracted.keys.map((k) => {
              const hit = (k.xpub ? byXpub.get(k.xpub) : undefined) ?? byName.get(k.name);
              if (!hit) return k;
              return {
                ...k,
                note: hit.note || k.note,
                children: hit.children.length ? hit.children : k.children,
                fingerprint: k.fingerprint || hit.fingerprint,
                derivation: k.derivation || hit.derivation,
              };
            });
            const adopted = adoptImportedTree(extracted.node, keys);
            mutate({
              ...adopted,
              ...(bundle.reuseKeys != null ? { reuseKeys: bundle.reuseKeys } : {}),
              ...(bundle.network ? { network: bundle.network } : {}),
            });
          } catch (e) {
            set({
              importError: e instanceof Error ? e.message : t(get().locale, "import.fail"),
            });
          }
          return;
        }
        const wallet = parseWalletPolicy(text);
        if (wallet) {
          try {
            const extracted = materializeWalletPolicy(wallet, get().keys);
            mutate(adoptImportedTree(extracted.node, extracted.keys));
          } catch (e) {
            set({
              importError: e instanceof Error ? e.message : t(get().locale, "import.fail"),
            });
          }
          return;
        }
        const keyList = parseKeyList(text);
        if (keyList) {
          mutate({ keys: mergeKeyLists(get().keys, keyList), importError: null });
          return;
        }
        try {
          const parsed = parseAny(text);
          const extracted = extractKeysFromTree(parsed.node, get().keys);
          mutate(adoptImportedTree(extracted.node, extracted.keys));
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
        mutate({ keys: mergeKeyLists(get().keys, keyList), importError: null });
      },
      importKeyText: (id, text) => {
        const target = get().keys.find((k) => k.id === id);
        if (!target) return t(get().locale, "err.noKey");
        const result = applyKeyMaterial(target, text);
        if (!result.ok) return localizeMessage(get().locale, result.error);
        mutate({
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
        mutate({
          keys: get().keys.map((k) =>
            k.id === id
              ? normalizeKeyEntry({ ...k, children: [...(k.children ?? []), parsed.child] })
              : k,
          ),
        });
        return null;
      },
      reset: () => mutate(applyStageTree(defaultStages(), [], get().network, get().reuseKeys)),
    };
    },
    {
      name: "scriptwerk-studio-v3",
      storage: createJSONStorage(() => {
        try {
          if (typeof window === "undefined") return memoryStorage;
          return debounceStorage(localStorage, 400);
        } catch {
          return memoryStorage;
        }
      }),
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
