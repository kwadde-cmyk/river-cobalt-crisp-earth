import { explainPolicy } from "@/lib/miniscript/explain";
import type { MsNode } from "@/lib/miniscript/ast";

export function SpendTimeline({ root }: { root: MsNode }) {
  const { groups, title } = explainPolicy(root);
  if (!groups.length) return null;

  return (
    <div className="shrink-0 border-b border-border bg-bg px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">
          So spendet das Wallet
        </p>
        <p className="text-2xs text-fg-muted">{title}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {groups.map((g) => (
          <article
            key={g.delay}
            className="min-w-40 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5"
          >
            <p className="text-2xs font-medium tracking-wide text-fg-subtle">
              {g.delay === 0 ? "Sofort" : `${g.delay.toLocaleString("de-DE")} Blöcke`}
            </p>
            <ul className="mt-1.5 space-y-1">
              {g.paths.map((p) => (
                <li key={`${p.delay}-${p.label}`} className="font-mono text-sm text-fg">
                  {p.label}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
