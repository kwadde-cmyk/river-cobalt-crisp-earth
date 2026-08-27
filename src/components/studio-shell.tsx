import { useEffect, useRef, useState, type ReactNode } from "react";
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
      <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
        <header className="relative z-30 shrink-0 border-b border-border" style={{ touchAction: "manipulation" }}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
            <div className="min-w-0 flex-1 overflow-hidden px-2 pt-3 lg:px-3">
              <img
                src="/miniscript-banner.jpg?v=3"
                alt=""
                className="h-16 w-auto max-w-full object-contain object-left md:h-28 lg:h-40"
              />
              <h1 className="sr-only">Miniscript Studio</h1>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 px-3 pb-2 lg:max-w-lg lg:items-end lg:py-2.5">
              <ImportExportBar />
              <LangSwitch locale={locale} setLocale={setLocale} label={t("header.language")} />
            </div>
          </div>
        </header>

        <MountWhenVisible
          dataLayout="desktop"
          className="hidden min-h-0 flex-1 overflow-hidden lg:flex"
        >
          <aside className="flex w-[300px] shrink-0 flex-col overflow-hidden border-r border-border">
            <Tabs defaultValue="stages" className="flex min-h-0 flex-1 flex-col">
              <TabsList className="mx-3 mt-3 shrink-0">
                <TabsTrigger value="stages" className="flex-1">
                  {t("tabs.stages")}
                </TabsTrigger>
                <TabsTrigger value="ops" className="flex-1">
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
          </aside>
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-ink">
            <KeyBoard />
            <div className="min-h-0 flex-1 overflow-hidden">
              <PolicyGraph />
            </div>
          </main>
          <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden border-l border-border">
            <div className="min-h-0 flex-1 overflow-hidden">
              <InterpreterPanel />
            </div>
          </aside>
        </MountWhenVisible>

        <MountWhenVisible
          dataLayout="mobile"
          className="flex min-h-0 flex-1 overflow-hidden lg:hidden"
        >
          <MobileStudioTabs />
        </MountWhenVisible>
      </div>
    </TooltipProvider>
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
    <Tabs value={tab} onValueChange={setTab} className="flex h-full flex-col px-3 py-3">
      <TabsList className="relative z-10 w-full shrink-0" style={{ touchAction: "manipulation" }}>
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
      <TabsContent value="stages" className="mt-2 min-h-0 flex-1 overflow-hidden">
        <StageBuilder />
      </TabsContent>
      <TabsContent
        value="tree"
        className="mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-border"
      >
        <PolicyGraph />
      </TabsContent>
      <TabsContent value="keys" className="mt-2 min-h-0 flex-1 overflow-hidden">
        <KeyBoard fill />
      </TabsContent>
      <TabsContent value="read" className="mt-2 min-h-0 flex-1 overflow-hidden">
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
  const [show, setShow] = useState(true);
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
    <div
      role="group"
      aria-label={label}
      className="ml-auto flex shrink-0 rounded-full border border-border p-0.5"
    >
      {(["de", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
          className={`h-8 min-w-9 rounded-full px-2.5 font-mono text-2xs tracking-wide ${
            locale === code ? "bg-muted text-fg" : "text-fg-muted hover:text-fg"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
