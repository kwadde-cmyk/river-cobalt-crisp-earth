import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { InterpreterPanel } from "@/components/interpreter-panel";
import { ImportExportBar } from "@/components/import-export";
import { KeyDatalist, OperatorPalette } from "@/components/operator-palette";
import { NodeInspector } from "@/components/node-inspector";
import { KeyBoard } from "@/components/key-board";
import { PolicyGraph } from "@/components/policy-graph";
import { StageBuilder } from "@/components/stage-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { defaultStages } from "@/lib/miniscript/stages";
import { useStudio } from "@/store/studio";
import { useT } from "@/lib/use-t";
import { Toaster } from "sonner";
import type { Locale } from "@/lib/i18n";

export function StudioShell() {
  const { t, locale, setLocale } = useT();

  useEffect(() => {
    const unlock = () => {
      document.body.style.pointerEvents = "";
      document.body.removeAttribute("data-scroll-locked");
    };
    unlock();
    window.addEventListener("pointerdown", unlock, true);
    return () => window.removeEventListener("pointerdown", unlock, true);
  }, []);

  useEffect(() => {
    void Promise.resolve(useStudio.persist.rehydrate()).then(() => {
      const s = useStudio.getState();
      if (s.root) {
        useStudio.setState({ past: [], future: [] });
        return;
      }
      if (s.stages?.length) s.setStages(s.stages);
      else s.setStages(defaultStages());
      useStudio.setState({ past: [], future: [] });
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useStudio.getState().undo();
        return;
      }
      if ((e.key === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault();
        useStudio.getState().redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <TooltipProvider delayDuration={200}>
      <KeyDatalist />
      <Toaster theme="dark" position="bottom-center" />
      <div className="flex h-dvh w-full min-w-0 flex-col overflow-hidden bg-bg text-fg">
        <header className="relative z-30 shrink-0 border-b border-border bg-[#0b0c0e]" style={{ touchAction: "manipulation" }}>
          <div className="relative h-20 w-full overflow-hidden sm:h-24 lg:h-[7.25rem]">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[6.75rem] overflow-hidden sm:w-36 lg:w-[11.5rem]">
              <img
                src="/miniscript-banner.jpg?v=5"
                alt=""
                className="h-full w-auto max-w-none object-cover object-left"
              />
            </div>
            <div className="absolute top-1.5 right-3 z-10 text-right sm:top-2 lg:top-2 lg:right-4">
              <p className="font-display text-[1.2rem] font-semibold tracking-[0.2em] text-fg sm:text-2xl lg:text-[1.95rem] lg:tracking-[0.24em]">
                SCRIPTWERK
              </p>
              <p className="mt-0.5 text-[0.55rem] font-medium tracking-[0.3em] text-fg-muted uppercase sm:text-[0.65rem] lg:text-[0.72rem] lg:tracking-[0.36em]">
                Miniscript Studio
              </p>
            </div>
            <div className="absolute right-3 bottom-2 z-20 hidden lg:flex flex-wrap items-center justify-end gap-2">
              <ImportExportBar />
              <LangSwitch locale={locale} setLocale={setLocale} label={t("header.language")} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 px-3 py-2 lg:hidden">
            <ImportExportBar />
            <LangSwitch locale={locale} setLocale={setLocale} label={t("header.language")} />
          </div>
          <h1 className="sr-only">Scriptwerk — Miniscript Studio</h1>
        </header>

        <MountWhenVisible
          dataLayout="desktop"
          className="hidden min-h-0 w-full min-w-0 flex-1 overflow-hidden lg:flex"
        >
          <DesktopStudio />
        </MountWhenVisible>

        <MountWhenVisible
          dataLayout="mobile"
          className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden lg:hidden"
        >
          <MobileStudioTabs />
        </MountWhenVisible>
      </div>
    </TooltipProvider>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function readWidth(key: string, fallback: number) {
  try {
    const n = Number(localStorage.getItem(key));
    if (Number.isFinite(n)) return n;
  } catch {
    /* ignore */
  }
  return fallback;
}

function usePaneWidth(key: string, fallback: number, min: number, max: number) {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? fallback : clamp(readWidth(key, fallback), min, max),
  );
  const ref = useRef<HTMLElement | null>(null);

  const onDrag = useCallback(
    (e: ReactPointerEvent, dir: 1 | -1) => {
      e.preventDefault();
      const el = ref.current;
      if (!el) return;
      const startX = e.clientX;
      const startW = el.getBoundingClientRect().width;
      const handle = e.currentTarget as HTMLElement;
      handle.setPointerCapture(e.pointerId);
      const move = (ev: PointerEvent) => {
        const next = Math.round(clamp(startW + dir * (ev.clientX - startX), min, max));
        el.style.width = `${next}px`;
      };
      const up = (ev: PointerEvent) => {
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        const next = Math.round(clamp(startW + dir * (ev.clientX - startX), min, max));
        el.style.width = `${next}px`;
        setWidth(next);
        try {
          localStorage.setItem(key, String(next));
        } catch {
          /* ignore */
        }
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
    },
    [key, min, max],
  );

  return { width, ref, onDrag };
}

function DesktopStudio() {
  const { t } = useT();
  const left = usePaneWidth("scriptwerk-left-w", 300, 240, 560);
  const right = usePaneWidth("scriptwerk-right-w", 340, 260, 520);
  return (
    <>
      <aside
        ref={left.ref}
        style={{ width: left.width }}
        className="relative flex shrink-0 flex-col overflow-hidden border-r border-border"
      >
        <Tabs defaultValue="stages" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-2 mt-3 shrink-0">
            <TabsTrigger value="stages" className="flex-1 px-1.5 text-xs">
              {t("tabs.stages")}
            </TabsTrigger>
            <TabsTrigger value="keys" className="flex-1 px-1.5 text-xs">
              {t("tabs.keys")}
            </TabsTrigger>
            <TabsTrigger value="ops" className="flex-1 px-1.5 text-xs">
              {t("tabs.ops")}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="stages"
            className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <StageBuilder />
          </TabsContent>
          <TabsContent
            value="keys"
            className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <KeyBoard fill />
          </TabsContent>
          <TabsContent
            value="ops"
            className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              <OperatorPalette />
            </div>
            <div className="shrink-0 border-t border-border">
              <NodeInspector />
            </div>
          </TabsContent>
        </Tabs>
        <button
          type="button"
          aria-label={t("pane.resize")}
          className="absolute top-0 right-0 z-20 h-full w-1.5 cursor-col-resize bg-transparent hover:bg-border-strong"
          onPointerDown={(e) => left.onDrag(e, 1)}
        />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-ink">
        <PolicyGraph />
      </main>
      <aside
        ref={right.ref}
        style={{ width: right.width }}
        className="relative flex shrink-0 flex-col overflow-hidden border-l border-border"
      >
        <button
          type="button"
          aria-label={t("pane.resize")}
          className="absolute top-0 left-0 z-20 h-full w-1.5 cursor-col-resize bg-transparent hover:bg-border-strong"
          onPointerDown={(e) => right.onDrag(e, -1)}
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          <InterpreterPanel />
        </div>
      </aside>
    </>
  );
}

function MobileStudioTabs() {
  const { t } = useT();
  const selectedStageId = useStudio((s) => s.selectedStageId);
  const [tab, setTab] = useState("tree");
  const prevStage = useRef<string | null>(null);

  useEffect(() => {
    if (selectedStageId && selectedStageId !== prevStage.current) setTab("tree");
    prevStage.current = selectedStageId;
  }, [selectedStageId]);

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex h-full w-full min-w-0 flex-col">
      <div className="shrink-0 px-3 pt-2">
        <TabsList className="relative z-10 w-full" style={{ touchAction: "manipulation" }}>
          <TabsTrigger value="stages" className="flex-1 px-2 text-xs">
            {t("tabs.stages")}
          </TabsTrigger>
          <TabsTrigger value="tree" className="flex-1 px-2 text-xs">
            {t("tabs.tree")}
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex-1 px-2 text-xs">
            {t("tabs.keys")}
          </TabsTrigger>
          <TabsTrigger value="read" className="flex-1 px-2 text-xs">
            {t("tabs.read")}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="stages" className="mt-2 min-h-0 w-full min-w-0 flex-1 overflow-hidden px-3 data-[state=active]:flex data-[state=active]:flex-col">
        <StageBuilder />
      </TabsContent>
      <TabsContent
        value="tree"
        className="mt-2 min-h-0 w-full min-w-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
      >
        <PolicyGraph />
      </TabsContent>
      <TabsContent value="keys" className="mt-2 min-h-0 w-full min-w-0 flex-1 overflow-hidden px-3 data-[state=active]:flex data-[state=active]:flex-col">
        <KeyBoard fill />
      </TabsContent>
      <TabsContent value="read" className="mt-2 min-h-0 w-full min-w-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
        <InterpreterPanel />
      </TabsContent>
    </Tabs>
  );
}

function MountWhenVisible({
  className,
  dataLayout,
  children,
}: {
  className?: string;
  dataLayout: "desktop" | "mobile";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    return dataLayout === "desktop" ? wide : !wide;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      setShow(getComputedStyle(el).display !== "none");
    };
    check();
    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);
  return (
    <div ref={ref} data-layout={dataLayout} className={className}>
      {show ? children : null}
    </div>
  );
}

function LangSwitch({
  locale,
  setLocale,
  label,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="ml-auto flex shrink-0 flex-wrap gap-1.5">
      {(["de", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
          className={
            locale === code
              ? "h-9 min-w-9 rounded-full bg-primary px-2.5 font-mono text-2xs tracking-wide text-primary-foreground"
              : "h-9 min-w-9 rounded-full border border-border px-2.5 font-mono text-2xs tracking-wide text-fg-muted hover:bg-muted hover:text-fg"
          }
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
