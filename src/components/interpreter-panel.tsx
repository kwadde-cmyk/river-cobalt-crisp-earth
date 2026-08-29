import { compileBsms, compileDescriptor, compileMiniscript, descriptorOrderVariants } from "@/lib/miniscript/compile";
import { stageOrderCount } from "@/lib/miniscript/stages";
import { explainPolicy } from "@/lib/miniscript/explain";
import { validatePolicy } from "@/lib/miniscript/validate";
import { blocksWhen } from "@/lib/miniscript/keys";
import { numberLocale } from "@/lib/i18n";
import { useStudio } from "@/store/studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Check, Copy } from "lucide-react";
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

        <CopyBlock title="Miniscript" value={ms} />
        <CopyBlock
          title="Descriptor (wsh)"
          value={compiled.ok ? compiled.descriptor : compiled.error ?? ""}
        />
        <CopyBlock title="BSMS" value={compiled.ok ? compileBsms(compiled.descriptor) : ""} />
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
  const root = useStudio((s) => s.root);
  const [open, setOpen] = useState(false);
  const count = useMemo(() => stageOrderCount(stages), [stages]);
  const compiled = useMemo(
    () => (root ? compileDescriptor(root, keys, reuseKeys) : null),
    [root, keys, reuseKeys],
  );
  const variants = useMemo(() => {
    if (!open || !stages.length) return [];
    return descriptorOrderVariants(stages, keys, reuseKeys, 120);
  }, [open, stages, keys, reuseKeys]);
  if (count.total <= 1 && !count.capped) return null;
  const current =
    compiled?.ok && compiled.descriptor.includes("#")
      ? compiled.descriptor.slice(compiled.descriptor.lastIndexOf("#") + 1)
      : "";
  const shown = variants.length;
  return (
    <section>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            {t("read.orders")}
            <span className="ml-auto font-mono text-2xs text-fg-muted">
              {count.capped ? `${count.total}+` : count.total}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[min(560px,calc(100vw-1.5rem))] flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>{t("read.orders")}</DialogTitle>
            <DialogDescription>{t("read.ordersHint")}</DialogDescription>
          </DialogHeader>
          <p className="shrink-0 text-xs text-pretty text-fg-muted">{t("read.sortedNote")}</p>
          {shown < count.total ? (
            <p className="shrink-0 text-2xs text-fg-muted">{t("read.ordersCapped", { n: shown, total: count.total })}</p>
          ) : null}
          <div className="mt-3 max-h-[min(28rem,calc(100dvh-14rem))] overflow-y-auto overscroll-contain pr-1">
            <ul className="space-y-1.5 pb-2">
              {variants.map((v) => {
                const active = v.checksum === current;
                return (
                  <li key={v.checksum}>
                    <button
                      type="button"
                      onClick={() => {
                        setStages(v.stages);
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
              })}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CopyBlock({ title, value }: { title: string; value: string }) {
  const { t } = useT();
  const [done, setDone] = useState(false);
  if (!value) return null;
  return (
    <section>
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
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
      <pre className="max-h-40 overflow-auto rounded-lg border border-border bg-ink px-3 py-2 font-mono text-2xs leading-relaxed break-all whitespace-pre-wrap text-paper">
        {value}
      </pre>
    </section>
  );
}
