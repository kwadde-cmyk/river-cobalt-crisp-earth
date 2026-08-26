import { useEffect } from "react";
import { InterpreterPanel } from "@/components/interpreter-panel";
import { ImportExportBar } from "@/components/import-export";
import { KeyDatalist, OperatorPalette } from "@/components/operator-palette";
import { NodeInspector } from "@/components/node-inspector";
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
    void Promise.resolve(useStudio.persist.rehydrate()).then(() => {
      const s = useStudio.getState();
      if (s.stages?.length) {
        s.setStages(s.stages);
        return;
      }
      if (s.root) {
        useStudio.setState({ stages: [] });
        return;
      }
      s.setStages(defaultStages());
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <TooltipProvider delayDuration={200}>
      <KeyDatalist />
      <Toaster theme="dark" position="bottom-center" />
      <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
        <header className="shrink-0 border-b border-border px-3 py-1.5 md:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="shrink-0 leading-none">
              <p className="text-2xs font-medium tracking-[0.18em] text-fg-muted uppercase">Mini –</p>
              <h1 className="font-display text-lg tracking-tight">Scriptwerk</h1>
            </div>
            <ImportExportBar />
            <LangSwitch locale={locale} setLocale={setLocale} label={t("header.language")} />
          </div>
        </header>

        <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
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
          <main className="min-w-0 flex-1 overflow-hidden bg-ink">
            <PolicyGraph />
          </main>
          <aside className="flex w-[340px] shrink-0 flex-col overflow-hidden border-l border-border">
            <div className="min-h-0 flex-1 overflow-hidden">
              <InterpreterPanel />
            </div>
          </aside>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden lg:hidden">
          <Tabs defaultValue="tree" className="flex h-full flex-col px-3 py-3">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="stages" className="flex-1">
                {t("tabs.stages")}
              </TabsTrigger>
              <TabsTrigger value="tree" className="flex-1">
                {t("tabs.tree")}
              </TabsTrigger>
              <TabsTrigger value="read" className="flex-1">
                {t("tabs.read")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stages" className="min-h-0 flex-1 overflow-hidden">
              <StageBuilder />
            </TabsContent>
            <TabsContent
              value="tree"
              className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border"
            >
              <PolicyGraph />
            </TabsContent>
            <TabsContent value="read" className="min-h-0 flex-1 overflow-hidden">
              <InterpreterPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
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
