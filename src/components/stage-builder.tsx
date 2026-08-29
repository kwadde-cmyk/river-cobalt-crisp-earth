import { DELAY_PRESETS, defaultStages, nextStageDelay, stageFormula, type Stage } from "@/lib/miniscript/stages";
import { blocksWhen, keyIsFilled, nextKeyName, type KeyEntry } from "@/lib/miniscript/keys";
import { uid } from "@/lib/utils";
import { useStudio } from "@/store/studio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/use-t";
import { Minus, Plus, Trash2 } from "lucide-react";

export function StageBuilder() {
  const { t } = useT();
  const stages = useStudio((s) => s.stages);
  const keys = useStudio((s) => s.keys);
  const setStages = useStudio((s) => s.setStages);
  const selectedStageId = useStudio((s) => s.selectedStageId);
  const selectStage = useStudio((s) => s.selectStage);

  const pool = keys.map((k) => k.name);

  function patch(id: string, fn: (s: Stage) => Stage) {
    setStages(stages.map((s) => (s.id === id ? fn(s) : s)));
  }

  function addStage() {
    if (!stages.length) {
      setStages(defaultStages());
      return;
    }
    const delay = nextStageDelay(stages);
    const prev = stages[stages.length - 1];
    const names = prev?.keys.length ? [...prev.keys] : pool.slice(0, 3);
    const extra = nextKeyName([...pool, ...names]);
    names.push(extra);
    setStages([
      ...stages,
      {
        id: uid("st"),
        delay,
        k: Math.min(prev?.k ?? 2, names.length),
        keys: names,
      },
    ]);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4 pb-2">
        <p className="text-2xs font-medium tracking-[0.14em] text-fg-subtle uppercase">{t("stages.title")}</p>
        <p className="mt-1 text-xs text-pretty text-fg-muted">{t("stages.blurb")}</p>
      </div>
      <ScrollArea className="min-h-0 flex-1 px-3 pb-4">
        <div className="space-y-3">
          {stages.length === 0 ? (
            <p className="px-1 text-xs text-fg-muted">{t("stages.empty")}</p>
          ) : null}
          {stages
            .slice()
            .sort((a, b) => a.delay - b.delay)
            .map((s, i) => (
              <StageCard
                key={s.id}
                index={i}
                stage={s}
                pool={pool}
                entries={keys}
                canRemove={stages.length > 1}
                selected={selectedStageId === s.id}
                onSelect={() => selectStage(s.id)}
                onChange={(next) => patch(s.id, () => next)}
                onRemove={() => setStages(stages.filter((x) => x.id !== s.id))}
              />
            ))}
          <Button variant="outline" className="w-full" onClick={addStage}>
            <Plus /> {stages.length ? t("stages.addLocked") : t("stages.add")}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}

function StageCard({
  index,
  stage,
  pool,
  entries,
  canRemove,
  selected,
  onSelect,
  onChange,
  onRemove,
}: {
  index: number;
  stage: Stage;
  pool: string[];
  entries: KeyEntry[];
  canRemove: boolean;
  selected: boolean;
  onSelect: () => void;
  onChange: (s: Stage) => void;
  onRemove: () => void;
}) {
  const { t, locale } = useT();
  const n = stage.keys.length;
  const k = Math.min(Math.max(stage.k, 1), Math.max(n, 1));
  const byName = new Map(entries.map((e) => [e.name, e]));

  function setN(nextN: number) {
    const count = Math.max(1, Math.min(15, nextN));
    let keys = [...stage.keys];
    const used = [...pool, ...keys];
    while (keys.length < count) {
      const name = nextKeyName(used);
      keys.push(name);
      used.push(name);
    }
    if (keys.length > count) keys = keys.slice(0, count);
    onChange({ ...stage, keys, k: Math.min(k, keys.length) });
  }

  function toggleKey(name: string) {
    const has = stage.keys.includes(name);
    const keys = has ? stage.keys.filter((x) => x !== name) : [...stage.keys, name];
    if (!keys.length) return;
    const required = (stage.required ?? []).filter((k) => keys.includes(k));
    onChange({
      ...stage,
      keys,
      k: Math.min(Math.max(k, 1), keys.length),
      required: required.length && k < keys.length ? required : undefined,
    });
  }

  function moveKey(name: string, dir: -1 | 1) {
    const i = stage.keys.indexOf(name);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= stage.keys.length) return;
    const keys = [...stage.keys];
    const tmp = keys[i]!;
    keys[i] = keys[j]!;
    keys[j] = tmp;
    onChange({ ...stage, keys });
  }

  const shown = [...stage.keys, ...pool.filter((n) => !stage.keys.includes(n))];

  return (
    <article
      data-stage-id={stage.id}
      className={`rounded-xl border p-2.5 ${
        selected ? "border-primary bg-primary/15 ring-1 ring-primary" : "border-border bg-surface"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <button
          type="button"
          aria-pressed={selected}
          onClick={onSelect}
          className="min-w-0 flex-1 rounded-lg px-0.5 py-0.5 text-left hover:bg-muted/40"
        >
          <span className="block text-sm font-medium">
            {t("stages.n", { n: index + 1 })}
            <span className="ml-2 text-xs font-normal text-fg-muted">{blocksWhen(stage.delay, locale)}</span>
          </span>
          <span className="mt-1 block font-mono text-2xs text-fg-muted">{stageFormula(stage)}</span>
        </button>
        {canRemove ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            type="button"
            onClick={onRemove}
            aria-label={t("stages.remove")}
          >
            <Trash2 />
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
        <Stepper label={t("stages.keys")} value={n} min={1} max={15} onChange={setN} />
        <Stepper
          label={t("stages.threshold")}
          value={k}
          min={1}
          max={Math.max(n, 1)}
          onChange={(v) => onChange({ ...stage, k: v })}
        />
      </div>

      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <Label>{t("stages.inStage")}</Label>
        <p className="mt-0.5 text-2xs text-pretty text-fg-muted">{t("stages.keyHint")}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {shown.map((name) => {
            const on = stage.keys.includes(name);
            const must = Boolean(on && k < n && stage.required?.includes(name));
            const entry = byName.get(name);
            const filled = entry ? keyIsFilled(entry) : false;
            const idx = stage.keys.indexOf(name);
            return (
              <span key={name} className="inline-flex items-center">
                {on && idx > 0 ? (
                  <button
                    type="button"
                    className="h-9 w-7 rounded-l-full bg-primary/85 text-primary-foreground hover:bg-primary"
                    aria-label={t("stages.moveLeft")}
                    onClick={() => moveKey(name, -1)}
                  >
                    ‹
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => toggleKey(name)}
                  title={must ? t("stages.mustHint") : undefined}
                  className={
                    on
                      ? `h-9 bg-primary px-3 font-mono text-xs text-primary-foreground ${
                          idx > 0 ? "" : "rounded-l-full"
                        } ${idx >= 0 && idx < n - 1 ? "" : "rounded-r-full"}`
                      : "h-9 rounded-full border border-border px-3 font-mono text-xs text-fg-muted hover:bg-muted hover:text-fg"
                  }
                >
                  {name}
                  {must ? "*" : ""}
                  {filled ? <span className="ml-1.5 inline-block size-1.5 rounded-full bg-current opacity-80" /> : null}
                </button>
                {on && idx >= 0 && idx < n - 1 ? (
                  <button
                    type="button"
                    className="h-9 w-7 rounded-r-full bg-primary/85 text-primary-foreground hover:bg-primary"
                    aria-label={t("stages.moveRight")}
                    onClick={() => moveKey(name, 1)}
                  >
                    ›
                  </button>
                ) : null}
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => setN(n + 1)}
            className="h-9 rounded-full border border-dashed border-border px-3 text-xs text-fg-muted hover:bg-muted hover:text-fg"
          >
            + Key
          </button>
        </div>
        <div className="mt-2 flex rounded-full border border-border p-0.5">
          <button
            type="button"
            aria-pressed={!stage.sorted}
            onClick={() => onChange({ ...stage, sorted: false })}
            className={`h-8 flex-1 rounded-full px-2 text-2xs ${
              !stage.sorted ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            {t("stages.unsorted")}
          </button>
          <button
            type="button"
            aria-pressed={Boolean(stage.sorted)}
            onClick={() => onChange({ ...stage, sorted: true })}
            className={`h-8 flex-1 rounded-full px-2 text-2xs ${
              stage.sorted ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            {t("stages.sorted")}
          </button>
        </div>
      </div>

      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <Label htmlFor={`delay-${stage.id}`}>{t("stages.timelock")}</Label>
        <Input
          id={`delay-${stage.id}`}
          type="number"
          min={0}
          max={65535}
          value={stage.delay}
          onChange={(e) => onChange({ ...stage, delay: Number(e.target.value) })}
          className="mt-1.5 font-mono"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DELAY_PRESETS.map((nDelay) => (
            <button
              key={nDelay}
              type="button"
              onClick={() => onChange({ ...stage, delay: nDelay })}
              className={
                stage.delay === nDelay
                  ? "h-8 rounded-full bg-muted px-2.5 text-2xs text-fg"
                  : "h-8 rounded-full border border-border px-2.5 text-2xs text-fg-muted hover:bg-muted hover:text-fg"
              }
            >
              {t(`delay.${nDelay}`)}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const { t } = useT();
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={t("stages.dec", { label })}
        >
          <Minus />
        </Button>
        <span className="flex h-10 min-w-10 flex-1 items-center justify-center font-mono text-sm tabular-nums">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={t("stages.inc", { label })}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
