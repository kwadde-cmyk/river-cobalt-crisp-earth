import { compileBsms, compileDescriptor, compileMiniscript, descriptorOrderVariants } from "@/lib/miniscript/compile";
import { descriptorChecksums, highlightScript, peekScript, type ScriptSpan } from "@/lib/miniscript/highlight";
import { stageOrderCount, type Stage } from "@/lib/miniscript/stages";
import { explainPolicy } from "@/lib/miniscript/explain";
import { validatePolicy } from "@/lib/miniscript/validate";
import { blocksWhen, type KeyEntry } from "@/lib/miniscript/keys";
import { numberLocale } from "@/lib/i18n";
import { useStudio } from "@/store/studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/use-t";
import { Check, Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { NodeCheckCard } from "@/components/node-rpc";

export function InterpreterPanel() {
  const { t, locale } = useT();
  const root = useStudio((s) => s.root);
  const keys = useStudio((s) => s.keys);
  const reuseKeys = useStudio((s) => s.reuseKeys);
  const explained = useMemo(
    () => explainPolicy(root ?? { id: "empty", kind: "hole" }, locale),
    [root, locale],
  );
  const issues = useMemo(() => validatePolicy(root, locale), [root, locale]);
  const compiled = useMemo(
    () =>
      root
        ? compileDescriptor(root, keys, reuseKeys)
        : { ok: false as const, miniscript: "", descriptor: "", error: t("read.noPolicy") },
    [root, keys, reuseKeys, t],
  );
  const ms = useMemo(() => (root ? compileMiniscript(root) : ""), [root]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-4">
        <section>
          <h2 className="text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">
            {t("read.title")}
          </h2>
          <p className="mt-2 font-display text-lg leading-snug tracking-tight text-balance">
            {explained.title}
          </p>
          <ol className="mt-3 space-y-2">
            {explained.narrative.map((line, i) => (
              <li key={i} className="text-sm text-pretty text-fg">
                <span className="mr-2 font-mono text-2xs text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {line}
              </li>
            ))}
          </ol>
        </section>

        {explained.groups.length > 0 && root ? (
          <section className="space-y-1.5">
            {explained.groups.map((g) => (
              <div key={g.delay} className="rounded-lg border border-border bg-surface px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{blocksWhen(g.delay, locale)}</span>
                  <Badge variant={g.delay === 0 ? "ok" : "default"}>
                    {g.delay === 0
                      ? t("read.now")
                      : t("read.blocksShort", { n: g.delay.toLocaleString(numberLocale(locale)) })}
                  </Badge>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {g.paths.map((p) => (
                    <li key={p.label} className="font-mono text-2xs break-all text-fg-subtle">
                      {p.label}
                      {p.detail !== p.label ? ` · ${p.detail}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : null}

        <section>
          <h2 className="mb-2 text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">
            {t("read.check")}
          </h2>
          <ul className="space-y-1.5">
            {issues.map((iss, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Badge
                  variant={iss.level === "error" ? "danger" : iss.level === "warn" ? "warn" : "default"}
                >
                  {iss.level}
                </Badge>
                <span className="text-pretty text-fg-muted">{iss.message}</span>
              </li>
            ))}
          </ul>
        </section>

        <NodeCheckCard />

        <OrderVariants />

        <ScriptPeek title="Miniscript" value={ms} />
        <ScriptPeek
          title="Descriptor (wsh)"
          value={compiled.ok ? compiled.descriptor : compiled.error ?? ""}
        />
        <ScriptPeek title="BSMS" value={compiled.ok ? compileBsms(compiled.descriptor) : ""} />
      </div>
    </ScrollArea>
  );
}

function OrderVariants() {
  const { t } = useT();
  const stages = useStudio((s) => s.stages);
  const keys = useStudio((s) => s.keys);
  const reuseKeys = useStudio((s) => s.reuseKeys);
  const setStages = useStudio((s) => s.setStages);
  const updateKey = useStudio((s) => s.updateKey);
  const root = useStudio((s) => s.root);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const count = useMemo(() => stageOrderCount(stages), [stages]);
  const compiled = useMemo(
    () => (root ? compileDescriptor(root, keys, reuseKeys) : null),
    [root, keys, reuseKeys],
  );
  const checksums = useMemo(
    () => (compiled?.ok ? descriptorChecksums(compiled.descriptor) : []),
    [compiled],
  );
  const variants = useMemo(() => {
    if (!open || !stages.length) return [];
    return descriptorOrderVariants(stages, keys, reuseKeys, 120);
  }, [open, stages, keys, reuseKeys]);
  const needle = query.trim().replace(/^#/, "").toLowerCase();
  const hits = useMemo(() => {
    if (!needle) return variants;
    return variants.filter((v) => {
      const n = needle.replace(/:/g, ";").replace(/^\/+/, "");
      return (
        v.checksum.toLowerCase().includes(n) ||
        v.childPath.toLowerCase().includes(n) ||
        v.orders.some((row) => row.toLowerCase().includes(n))
      );
    });
  }, [variants, needle]);
  if (count.total <= 1 && !count.capped) {
    if (!checksums.length) return null;
    return (
      <section>
        <p className="mb-1 text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">{t("read.currentCs")}</p>
        <ChecksumList items={checksums} />
      </section>
    );
  }
  const current =
    compiled?.ok && compiled.descriptor.includes("#")
      ? compiled.descriptor.slice(compiled.descriptor.lastIndexOf("#") + 1)
      : "";
  const shown = variants.length;
  return (
    <section>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" className="h-auto w-full flex-col items-start gap-1 py-2">
            <span className="flex w-full items-center">
              {t("read.orders")}
              <span className="ml-auto font-mono text-2xs text-fg-muted">
                {count.capped ? `${count.total}+` : count.total}
              </span>
            </span>
            {checksums.length ? (
              <span className="font-mono text-2xs text-fg-muted">
                {checksums.map((c) => `#${c.checksum}`).join("  ·  ")}
              </span>
            ) : null}
          </Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[min(560px,calc(100vw-1.5rem))] flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("read.orders")}</DialogTitle>
            <DialogDescription>{t("read.ordersHint")}</DialogDescription>
          </DialogHeader>
          <p className="shrink-0 text-xs text-pretty text-fg-muted">{t("read.sortedNote")}</p>
          <div className="shrink-0 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <p className="text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">{t("read.currentCs")}</p>
            <ChecksumList items={checksums} />
          </div>
          {shown < count.total ? (
            <p className="shrink-0 text-2xs text-fg-muted">{t("read.ordersCapped", { n: shown, total: count.total })}</p>
          ) : null}
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fg-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("read.orderSearch")}
              className="pl-8 font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="mt-3 max-h-[min(28rem,calc(100dvh-16rem))] overflow-y-auto overscroll-contain pr-1">
            <ul className="space-y-1.5 pb-2">
              {hits.length ? (
                hits.map((v) => {
                  const active = v.checksum === current;
                  return (
                    <li key={v.checksum}>
                      <button
                        type="button"
                        onClick={() => {
                          setStages(v.stages);
                          const mp = v.childPath.match(/^<[^>]+>/)?.[0] || "<0;1>";
                          for (const k of keys) {
                            updateKey(k.id, { childPath: v.childPath, multipath: mp });
                          }
                          setOpen(false);
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left ${
                          active ? "border-border-strong bg-muted" : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm text-fg">#{v.checksum}</span>
                          <span className="text-2xs text-fg-muted">
                            {active ? t("read.orderCurrent") : t("read.useOrder")}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-2xs text-fg-muted">{t("read.orderPath", { path: v.childPath })}</p>
                        <ul className="mt-1 space-y-0.5">
                          {v.orders.map((row, i) => (
                            <li key={`${v.checksum}-${i}`} className="font-mono text-2xs text-fg-muted">
                              {t("stages.n", { n: i + 1 })}: {row}
                            </li>
                          ))}
                        </ul>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-1 py-6 text-center text-sm text-fg-muted">{t("read.orderNone")}</li>
              )}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ChecksumList({ items }: { items: { path: string; checksum: string }[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {items.map((c) => (
        <li key={`${c.path}-${c.checksum}`} className="font-mono text-xs text-fg">
          {c.path ? <span className="text-fg-muted">/{c.path} </span> : null}
          #{c.checksum}
        </li>
      ))}
    </ul>
  );
}

function ScriptHighlight({
  value,
  keys,
  stages,
}: {
  value: string;
  keys: KeyEntry[];
  stages: Stage[];
}) {
  const spans = useMemo(() => highlightScript(value, keys, stages), [value, keys, stages]);
  return (
    <pre className="max-h-[min(28rem,calc(100dvh-14rem))] overflow-auto rounded-lg border border-border bg-ink px-3 py-2 font-mono text-2xs leading-relaxed break-all whitespace-pre-wrap">
      {spans.map((s, i) => (
        <Span key={i} span={s} />
      ))}
    </pre>
  );
}

function Span({ span }: { span: ScriptSpan }) {
  return <span style={{ color: span.color }}>{span.text}</span>;
}

function ScriptPeek({ title, value }: { title: string; value: string }) {
  const { t } = useT();
  const keys = useStudio((s) => s.keys);
  const stages = useStudio((s) => s.stages);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  if (!value) return null;
  const peek = peekScript(value);
  return (
    <section>
      <h2 className="mb-1.5 text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">{title}</h2>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t("read.openScript")}
        className="w-full rounded-lg border border-border bg-ink px-3 py-2 text-left font-mono text-2xs leading-relaxed break-all text-paper hover:border-border-strong"
      >
        {peek}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[min(640px,calc(100vw-1.5rem))] flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{t("read.openScript")}</DialogDescription>
          </DialogHeader>
          <ScriptHighlight value={value} keys={keys} stages={stages} />
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(value);
                setDone(true);
                toast.success(t("read.copied"));
                setTimeout(() => setDone(false), 1200);
              }}
            >
              {done ? <Check /> : <Copy />}
              {t("read.copy")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
