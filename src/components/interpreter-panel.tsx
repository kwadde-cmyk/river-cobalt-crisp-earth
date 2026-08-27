import { compileBsms, compileDescriptor, compileMiniscript } from "@/lib/miniscript/compile";
import { explainPolicy } from "@/lib/miniscript/explain";
import { validatePolicy } from "@/lib/miniscript/validate";
import { blocksWhen } from "@/lib/miniscript/keys";
import { numberLocale } from "@/lib/i18n";
import { useStudio } from "@/store/studio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
