import { useCallback, useRef, useState } from "react";
import {
  accountPathFrom,
  applyKeyMaterial,
  buildKeyTree,
  childForAccount,
  keyIsFilled,
  keyNeedsAction,
  keyTileLabel,
  nextUnusedAccount,
  normalizeKeyEntry,
  parseChildKey,
  sortKeyEntries,
  type KeyEntry,
  type KeyTreeNode,
} from "@/lib/miniscript/keys";
import { isDerivedAlias, reuseAliasHints } from "@/lib/miniscript/stages";
import { useStudio } from "@/store/studio";
import { FilePick, QrScanner } from "@/components/qr-io";
import { useHwFillKey } from "@/components/hardware-usb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/lib/use-t";
import { KeyRound, Upload, X } from "lucide-react";
import { toast } from "sonner";

export function KeyBoard({ fill = false }: { fill?: boolean }) {
  const { t } = useT();
  const rawKeys = useStudio((s) => s.keys);
  const keys = rawKeys.map(normalizeKeyEntry);
  const stages = useStudio((s) => s.stages);
  const network = useStudio((s) => s.network);
  const setNetwork = useStudio((s) => s.setNetwork);
  const reuseKeys = useStudio((s) => s.reuseKeys);
  const setReuseKeys = useStudio((s) => s.setReuseKeys);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const details = keys.find((k) => k.id === detailsId) ?? null;
  const aliases = reuseAliasHints(stages, reuseKeys);
  const masters = new Set(stages.flatMap((s) => s.keys));
  const visible = sortKeyEntries(
    stages.length ? keys.filter((k) => !isDerivedAlias(k.name, masters)) : keys,
    stages,
  );
  const childPresent = visible.reduce((n, k) => n + k.children.filter((c) => c.xpub.trim()).length, 0);
  const childNeeded = reuseKeys
    ? childPresent
    : visible.reduce((n, k) => n + (aliases.get(k.name) ?? []).filter((a) => a.account != null).length, 0);

  function closeDetails() {
    setDetailsId(null);
    setExpandedId(null);
  }

  return (
    <div className={fill ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-bg" : "shrink-0 border-b border-border bg-bg"}>
      <div className="flex flex-wrap items-end justify-end gap-3 px-4 pt-3 pb-2">
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center gap-1 text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">
            <KeyRound className="size-3" aria-hidden />
            {t("keys.reuse")}
          </span>
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label={t("keys.reuse")}
              className="flex shrink-0 rounded-full border border-border p-0.5"
            >
              <button
                type="button"
                aria-pressed={!reuseKeys}
                onClick={() => setReuseKeys(false)}
                className={`h-8 rounded-full px-3 text-xs ${
                  !reuseKeys ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"
                }`}
              >
                {t("keys.reuseOffShort")}
              </button>
              <button
                type="button"
                aria-pressed={reuseKeys}
                onClick={() => setReuseKeys(true)}
                className={`h-8 rounded-full px-3 text-xs ${
                  reuseKeys ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"
                }`}
              >
                {t("keys.reuseOnShort")}
              </button>
            </div>
            <NestedKeyStack present={childPresent} total={Math.max(childNeeded, childPresent)} />
          </div>
        </div>
        <div
          role="group"
          aria-label={t("keys.network")}
          className="ml-auto flex shrink-0 rounded-full border border-border p-0.5"
        >
          <button
            type="button"
            aria-pressed={network === "mainnet"}
            onClick={() => setNetwork("mainnet")}
            className={`h-8 rounded-full px-3 text-xs ${
              network === "mainnet" ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            Mainnet
          </button>
          <button
            type="button"
            aria-pressed={network === "testnet"}
            onClick={() => setNetwork("testnet")}
            className={`h-8 rounded-full px-3 text-xs ${
              network === "testnet" ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            Testnet
          </button>
        </div>
      </div>
      <div className={fill ? "min-h-0 flex-1 overflow-auto px-4 pb-3" : "max-h-40 overflow-auto px-4 pb-3"}>
        {visible.length === 0 ? (
          <p className="py-2 text-xs text-fg-muted">{t("keys.empty")}</p>
        ) : (
          <div className="flex w-full flex-col gap-1.5">
            {visible.map((k) => (
              <KeyTile
                key={k.id}
                entry={k}
                expanded={expandedId === k.id}
                aliases={aliases.get(k.name) ?? []}
                reuseOff={!reuseKeys}
                needsAction={Boolean(keyNeedsAction(k, aliases.get(k.name) ?? [], reuseKeys))}
                childPresent={k.children.filter((c) => c.xpub.trim()).length}
                childTotal={
                  reuseKeys
                    ? k.children.length
                    : Math.max(
                        k.children.length,
                        (aliases.get(k.name) ?? []).filter((a) => a.account != null).length,
                      )
                }
                onToggle={() => {
                  if (expandedId === k.id) {
                    setDetailsId(k.id);
                    return;
                  }
                  setExpandedId(k.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <KeyImportDialog entry={details} open={Boolean(details)} onOpenChange={(open) => !open && closeDetails()} />
    </div>
  );
}

function KeyTile({
  entry,
  expanded,
  aliases,
  reuseOff,
  needsAction,
  childPresent,
  childTotal,
  onToggle,
}: {
  entry: KeyEntry;
  expanded: boolean;
  aliases: { alias: string; delay: number; account?: number }[];
  reuseOff: boolean;
  needsAction: boolean;
  childPresent: number;
  childTotal: number;
  onToggle: () => void;
}) {
  const { t } = useT();
  const filled = keyIsFilled(entry);
  const label = keyTileLabel(entry);
  const tree = filled || entry.fingerprint ? buildKeyTree(entry, aliases) : null;
  const alertLabels = new Set(
    aliases
      .filter((a) => a.account != null && !childForAccount(entry, a.account)?.xpub.trim())
      .flatMap((a) => [a.alias, a.account != null ? String(a.account) : ""]),
  );
  const tileClass = needsAction
    ? "border-danger/80 bg-danger/10 text-fg hover:bg-danger/15"
    : filled
      ? "border-border-strong bg-surface text-fg hover:bg-elevated"
      : "border-dashed border-border bg-transparent text-fg-muted hover:bg-muted hover:text-fg";

  if (!expanded) {
    return (
      <button
        type="button"
        data-key-tile={entry.name}
        data-need-action={needsAction ? "true" : undefined}
        aria-expanded={false}
        aria-label={needsAction ? t("keys.needAction", { name: entry.name }) : undefined}
        onClick={onToggle}
        className={`flex h-10 w-full items-center gap-1.5 rounded-md border px-2.5 text-left text-xs transition-colors duration-150 ${tileClass}`}
      >
        <span className={`min-w-0 truncate ${/^[0-9a-f]{8}$/.test(label) || label === entry.name ? "font-mono" : ""}`}>
          {label}
        </span>
        {label !== entry.name ? (
          <span className={`shrink-0 font-mono text-2xs ${needsAction ? "text-danger" : "text-fg-subtle"}`}>
            {entry.name}
          </span>
        ) : null}
        {childTotal > 0 ? <NestedKeyStack present={childPresent} total={childTotal} compact /> : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      data-key-tile={entry.name}
      data-need-action={needsAction ? "true" : undefined}
      aria-expanded={true}
      aria-label={needsAction ? t("keys.needAction", { name: entry.name }) : undefined}
      onClick={onToggle}
      className={`w-full rounded-xl border p-3 text-left transition-colors duration-150 ${tileClass}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-sm text-fg">{label}</p>
        <span className={`shrink-0 font-mono text-2xs ${needsAction ? "text-danger" : "text-fg-subtle"}`}>
          {entry.name}
        </span>
        {childTotal > 0 ? <NestedKeyStack present={childPresent} total={childTotal} compact /> : null}
      </div>
      {tree ? (
        <div className="mt-2">
          <KeyTreeView node={tree} alerts={alertLabels} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-fg-muted">{t("keys.importHint")}</p>
      )}
      {filled ? <p className="mt-2 text-2xs text-fg-subtle">{t("keys.tapDetails")}</p> : null}
      {reuseOff && aliases.some((a) => a.account != null) ? (
        <p className="mt-2 text-2xs text-fg-muted">
          {t("keys.nextAccount", { path: nextUnusedAccount(entry).path })}
        </p>
      ) : null}
    </button>
  );
}

function NestedKeyStack({
  present,
  total,
  compact = false,
}: {
  present: number;
  total: number;
  compact?: boolean;
}) {
  const { t } = useT();
  const n = Math.min(Math.max(total, 0), 5);
  const size = compact ? "size-4" : "size-5";
  const step = compact ? 8 : 10;
  const chip = compact ? 16 : 20;
  const width = n <= 0 ? chip : (n - 1) * step + chip;
  return (
    <span
      className="relative inline-flex h-5 shrink-0 items-center"
      style={{ width }}
      title={t("keys.childMark", { have: present, need: Math.max(total, present) })}
      aria-label={t("keys.childMark", { have: present, need: Math.max(total, present) })}
    >
      {n <= 0 ? (
        <span className="relative flex size-5 items-center justify-center text-fg-subtle">
          <KeyRound className="size-3.5 opacity-40" />
        </span>
      ) : (
        Array.from({ length: n }, (_, i) => {
          const ok = i < present;
          return (
            <span
              key={i}
              className={`absolute flex items-center justify-center rounded-md border ${size} ${
                ok ? "border-border-strong bg-elevated text-fg" : "border-danger/70 bg-danger/10 text-danger"
              }`}
              style={{ left: i * step, zIndex: i + 1 }}
            >
              <KeyRound className="absolute size-3 opacity-35" aria-hidden />
              <span className="relative font-mono text-[9px] leading-none">{i + 1}</span>
            </span>
          );
        })
      )}
    </span>
  );
}

function KeyTreeView({
  node,
  depth = 0,
  alerts,
}: {
  node: KeyTreeNode;
  depth?: number;
  alerts?: Set<string>;
}) {
  const kids = node.children.filter((c) => c.label.trim());
  const warn = Boolean(alerts?.has(node.label));
  return (
    <div className={depth === 0 ? "w-full" : "ml-0 w-full border-l border-border pl-3"}>
      <p className={`break-all font-mono text-xs leading-5 ${warn ? "text-danger" : "text-fg"}`}>{node.label}</p>
      {node.hint ? (
        <p className={`break-all font-mono text-2xs ${warn ? "text-danger" : "text-fg-muted"}`}>{node.hint}</p>
      ) : null}
      {kids.map((c, i) => (
        <KeyTreeView key={`${c.label}-${i}`} node={c} depth={depth + 1} alerts={alerts} />
      ))}
    </div>
  );
}

function KeyImportDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: KeyEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useT();
  const importKeyText = useStudio((s) => s.importKeyText);
  const importChildText = useStudio((s) => s.importChildText);
  const updateKey = useStudio((s) => s.updateKey);
  const removeChild = useStudio((s) => s.removeChild);
  const network = useStudio((s) => s.network);
  const reuseKeys = useStudio((s) => s.reuseKeys);
  const stages = useStudio((s) => s.stages);
  const [draft, setDraft] = useState("");
  const [childDraft, setChildDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState("master");
  const [detailDraft, setDetailDraft] = useState({
    note: "",
    fingerprint: "",
    derivation: "",
    xpub: "",
    childPath: "",
  });
  const [childDetail, setChildDetail] = useState({ path: "", fingerprint: "", xpub: "", note: "" });
  const filled = entry ? keyIsFilled(entry) : false;
  const hwTarget = useRef<"master" | "child">("master");
  const fetchHw = useHwFillKey(entry?.id ?? "", (origin) => {
    if (hwTarget.current === "child") setChildDraft(origin);
    else setDraft(origin);
    setError(null);
  });

  const needs = entry ? (reuseAliasHints(stages, reuseKeys).get(entry.name) ?? []) : [];
  const next = entry ? nextUnusedAccount(entry, network) : { account: 1, path: "48'/0'/1'/2'" };
  const nextNeed = needs.find((n) => n.account != null && !childForAccount(entry!, n.account));

  const onRead = useCallback(
    (text: string) => {
      if (!entry) return;
      const err = importKeyText(entry.id, text);
      if (err) {
        setError(err);
        return;
      }
      setDraft("");
      setError(null);
      toast.success(t("keys.taken", { name: entry.name }));
    },
    [entry, importKeyText, t],
  );

  const onChild = useCallback(
    (text: string) => {
      if (!entry) return;
      const err = importChildText(entry.id, text, {
        fallbackPath: next.path,
        alias: nextNeed?.alias,
      });
      if (err) {
        setError(err);
        return;
      }
      setChildDraft("");
      setError(null);
      toast.success(t("keys.childTaken"));
    },
    [entry, importChildText, next.path, nextNeed?.alias, t],
  );

  function openDetailsFrom(nextOpen: boolean) {
    if (!nextOpen) {
      setDraft("");
      setChildDraft("");
      setError(null);
      setDetailId("master");
    } else if (entry) {
      setDetailDraft({
        note: entry.note,
        fingerprint: entry.fingerprint,
        derivation: entry.derivation,
        xpub: entry.xpub,
        childPath: entry.childPath,
      });
    }
    onOpenChange(nextOpen);
  }

  if (!entry) return null;
  const child = entry.children.find((c) => c.id === detailId) ?? null;
  const preview = draft.trim() ? applyKeyMaterial(entry, draft) : null;
  const childPreview = childDraft.trim()
    ? parseChildKey(entry, childDraft, { fallbackPath: next.path, alias: nextNeed?.alias })
    : null;

  return (
    <Dialog open={open} onOpenChange={openDetailsFrom}>
      <DialogContent className="flex max-h-[min(720px,calc(100dvh-2rem))] w-[min(720px,calc(100vw-1rem))] flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {keyTileLabel(entry)}
            <span className="ml-2 font-mono text-sm font-normal text-fg-muted">{entry.name}</span>
          </DialogTitle>
          <DialogDescription>{t("keys.dialogBlurb")}</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="master" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="master" className="flex-1">
              {t("keys.master")}
            </TabsTrigger>
            <TabsTrigger value="children" className="flex-1">
              {t("keys.children")}
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1">
              {t("keys.details")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="master" className="min-h-0 flex-1 space-y-3 overflow-auto">
            {!reuseKeys && needs.length ? <AccountPlan entry={entry} needs={needs} /> : null}
            <ImportPane
              draft={draft}
              setDraft={setDraft}
              placeholder={`[deadbeef/48'/0'/0'/2']xpub…`}
              onApply={() => onRead(draft)}
              onQr={setDraft}
              error={error}
              applyLabel={filled && draft.trim() ? t("keys.applyReplace") : t("keys.apply")}
              canApply={Boolean(draft.trim()) && preview?.ok !== false}
            >
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    hwTarget.current = "master";
                    void fetchHw("ledger");
                  }}
                >
                  {t("hw.fromLedger")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    hwTarget.current = "master";
                    void fetchHw("bitbox");
                  }}
                >
                  {t("hw.fromBitbox")}
                </Button>
                {filled ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateKey(entry.id, { xpub: "", fingerprint: "", children: [] });
                      setError(null);
                      toast.success(t("keys.cleared"));
                    }}
                  >
                    {t("keys.clear")}
                  </Button>
                ) : null}
              </div>
              {preview?.ok ? (
                <p className="font-mono text-2xs text-fg-muted">
                  {preview.key.fingerprint || "—"} · {preview.key.derivation || "—"} · {t("keys.draftHint")}
                </p>
              ) : null}
            </ImportPane>
          </TabsContent>
          <TabsContent value="children" className="min-h-0 flex-1 space-y-3 overflow-auto">
            {filled || entry.fingerprint ? (
              <>
                <KeyTreeView
                  node={buildKeyTree(entry, needs)}
                  alerts={
                    new Set(
                      needs
                        .filter((n) => n.account != null && !childForAccount(entry, n.account)?.xpub.trim())
                        .map((n) => n.alias),
                    )
                  }
                />
                {!reuseKeys ? <AccountPlan entry={entry} needs={needs} onPick={(path) => setChildDraft(`[${entry.fingerprint}/${path}]`)} /> : null}
                <p className="font-mono text-2xs text-fg-muted">{t("keys.nextAccount", { path: next.path })}</p>
                <ImportPane
                  draft={childDraft}
                  setDraft={setChildDraft}
                  placeholder={`[${entry.fingerprint || "fp"}/${next.path}]xpub   oder   0/0`}
                  onApply={() => onChild(childDraft)}
                  onQr={setChildDraft}
                  error={error}
                  applyLabel={t("keys.childApply")}
                  canApply={Boolean(childDraft.trim()) && childPreview?.ok !== false}
                >
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        hwTarget.current = "child";
                        void fetchHw("ledger", `m/${next.path}`);
                      }}
                    >
                      {t("hw.fromLedger")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        hwTarget.current = "child";
                        void fetchHw("bitbox", `m/${next.path}`);
                      }}
                    >
                      {t("hw.fromBitbox")}
                    </Button>
                  </div>
                  {childPreview?.ok ? (
                    <p className="font-mono text-2xs text-fg-muted">
                      {childPreview.child.path}
                      {childPreview.child.note ? ` · ${childPreview.child.note}` : ""} · {t("keys.draftHint")}
                    </p>
                  ) : null}
                </ImportPane>
                {entry.children.length ? (
                  <ul className="w-full space-y-1.5">
                    {entry.children.map((c) => (
                      <li
                        key={c.id}
                        className="flex w-full items-start gap-2 rounded-md border border-border bg-elevated px-2.5 py-2"
                      >
                        <span className="min-w-0 flex-1 space-y-0.5">
                          <span className="block font-mono text-xs text-fg">
                            {c.note ? `${c.note} · ` : ""}
                            {c.path}
                          </span>
                          {c.fingerprint ? (
                            <span className="block font-mono text-2xs text-fg-muted">{c.fingerprint}</span>
                          ) : null}
                          <span className="block break-all font-mono text-2xs text-fg-muted">
                            {c.xpub || "—"}
                          </span>
                        </span>
                        <button
                          type="button"
                          className="shrink-0 rounded-md p-1 text-fg-muted hover:bg-muted hover:text-fg"
                          onClick={() => removeChild(entry.id, c.id)}
                          aria-label={t("keys.childRemove")}
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-fg-muted">{t("keys.childHelp")}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-fg-muted">{t("keys.childNeedParent")}</p>
            )}
          </TabsContent>
          <TabsContent value="details" className="min-h-0 flex-1 space-y-3 overflow-auto">
            <Field label={t("keys.detailOf")}>
              <div className="flex w-full flex-col gap-1">
                <button
                  type="button"
                  aria-pressed={detailId === "master"}
                  onClick={() => {
                    setDetailId("master");
                    setDetailDraft({
                      note: entry.note,
                      fingerprint: entry.fingerprint,
                      derivation: entry.derivation,
                      xpub: entry.xpub,
                      childPath: entry.childPath,
                    });
                  }}
                  className={`h-9 w-full rounded-md border px-3 text-left text-xs ${
                    detailId === "master"
                      ? "border-border-strong bg-muted text-fg"
                      : "border-border text-fg-muted"
                  }`}
                >
                  {t("keys.master")}
                </button>
                {entry.children.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={detailId === c.id}
                    onClick={() => {
                      setDetailId(c.id);
                      setChildDetail({
                        path: c.path,
                        fingerprint: c.fingerprint,
                        xpub: c.xpub,
                        note: c.note,
                      });
                    }}
                    className={`h-9 w-full truncate rounded-md border px-3 text-left font-mono text-xs ${
                      detailId === c.id
                        ? "border-border-strong bg-muted text-fg"
                        : "border-border text-fg-muted"
                    }`}
                  >
                    {c.note || c.path}
                  </button>
                ))}
              </div>
            </Field>
            {detailId === "master" || !child ? (
              <>
                <Field label={t("keys.name")}>
                  <Input
                    value={detailDraft.note}
                    placeholder="Coldcard, Alice, …"
                    onChange={(e) => setDetailDraft((d) => ({ ...d, note: e.target.value }))}
                  />
                </Field>
                <Field label={t("keys.fp")}>
                  <Input
                    className="font-mono text-xs"
                    placeholder="deadbeef"
                    value={detailDraft.fingerprint}
                    onChange={(e) => setDetailDraft((d) => ({ ...d, fingerprint: e.target.value }))}
                  />
                </Field>
                <Field label={t("keys.bip32")}>
                  <Input
                    className="font-mono text-xs"
                    placeholder={network === "testnet" ? "48'/1'/0'/2'" : "48'/0'/0'/2'"}
                    value={detailDraft.derivation}
                    onChange={(e) => setDetailDraft((d) => ({ ...d, derivation: e.target.value }))}
                  />
                </Field>
                <Field label="xpub">
                  <Textarea
                    className="min-h-24 w-full break-all"
                    placeholder="xpub…"
                    value={detailDraft.xpub}
                    onChange={(e) => setDetailDraft((d) => ({ ...d, xpub: e.target.value }))}
                  />
                </Field>
                <Field label={t("keys.childPath")}>
                  <Input
                    className="font-mono text-xs"
                    placeholder="<0;1>/*"
                    value={detailDraft.childPath}
                    onChange={(e) => setDetailDraft((d) => ({ ...d, childPath: e.target.value }))}
                  />
                </Field>
                <p className="text-2xs text-fg-muted">{t("keys.draftHint")}</p>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      updateKey(entry.id, {
                        note: detailDraft.note,
                        fingerprint: detailDraft.fingerprint,
                        derivation: detailDraft.derivation,
                        xpub: detailDraft.xpub.trim(),
                        childPath: detailDraft.childPath,
                        multipath: detailDraft.childPath.match(/^<[^>]+>/)?.[0] || entry.multipath,
                      });
                      toast.success(t("keys.taken", { name: entry.name }));
                    }}
                  >
                    {t("keys.detailsApply")}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Field label={t("keys.bip32")}>
                  <Input
                    className="font-mono text-xs"
                    value={childDetail.path}
                    onChange={(e) => setChildDetail((d) => ({ ...d, path: e.target.value }))}
                  />
                </Field>
                <Field label={t("keys.fp")}>
                  <Input
                    className="font-mono text-xs"
                    value={childDetail.fingerprint}
                    onChange={(e) => setChildDetail((d) => ({ ...d, fingerprint: e.target.value }))}
                  />
                </Field>
                <Field label="xpub">
                  <Textarea
                    className="min-h-24 w-full break-all"
                    placeholder="xpub…"
                    value={childDetail.xpub}
                    onChange={(e) => setChildDetail((d) => ({ ...d, xpub: e.target.value }))}
                  />
                </Field>
                <Field label={t("keys.name")}>
                  <Input
                    value={childDetail.note}
                    onChange={(e) => setChildDetail((d) => ({ ...d, note: e.target.value }))}
                  />
                </Field>
                <p className="text-2xs text-fg-muted">{t("keys.draftHint")}</p>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => {
                      updateKey(entry.id, {
                        children: entry.children.map((c) =>
                          c.id === child.id
                            ? {
                                ...c,
                                path: childDetail.path,
                                fingerprint: childDetail.fingerprint,
                                xpub: childDetail.xpub.trim(),
                                note: childDetail.note,
                              }
                            : c,
                        ),
                      });
                      toast.success(t("keys.childTaken"));
                    }}
                  >
                    {t("keys.detailsApply")}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AccountPlan({
  entry,
  needs,
  onPick,
}: {
  entry: KeyEntry;
  needs: { alias: string; delay: number; account?: number }[];
  onPick?: (path: string) => void;
}) {
  const { t } = useT();
  const extras = needs.filter((n) => n.account != null);
  if (!extras.length) return null;
  const next = nextUnusedAccount(entry);
  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-elevated px-3 py-2">
      <p className="text-xs text-fg">{t("keys.reuseNeed")}</p>
      <p className="font-mono text-2xs text-fg-muted">
        {t("keys.master")} · {entry.derivation || "48'/0'/0'/2'"}
      </p>
      <ul className="space-y-1">
        {extras.map((n) => {
          const path = n.account != null ? accountPathFrom(entry.derivation, n.account) : "";
          const has = n.account != null && Boolean(childForAccount(entry, n.account)?.xpub);
          return (
            <li key={n.alias}>
              <button
                type="button"
                disabled={!onPick}
                onClick={() => onPick?.(path)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-0.5 text-left font-mono text-2xs"
              >
                <span className="text-fg">
                  {n.alias} · {path}
                </span>
                <span className={has ? "text-ok" : "text-danger"}>{has ? t("keys.present") : t("keys.missing")}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="font-mono text-2xs text-fg">{t("keys.nextAccount", { path: next.path })}</p>
    </div>
  );
}

function ImportPane({
  draft,
  setDraft,
  placeholder,
  onApply,
  onQr,
  error,
  applyLabel,
  canApply,
  children,
}: {
  draft: string;
  setDraft: (v: string) => void;
  placeholder: string;
  onApply: () => void;
  onQr: (text: string) => void;
  error: string | null;
  applyLabel?: string;
  canApply?: boolean;
  children?: React.ReactNode;
}) {
  const { t } = useT();
  return (
    <>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="min-h-20"
      />
      <div className="flex flex-wrap items-center gap-2">
        <FilePick onRead={setDraft} />
      </div>
      <QrScanner compact onRead={onQr} />
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <div className="flex justify-end">
        <Button type="button" onClick={onApply} disabled={canApply === false || !draft.trim()}>
          <Upload />
          {applyLabel ?? t("keys.apply")}
        </Button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-full space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}