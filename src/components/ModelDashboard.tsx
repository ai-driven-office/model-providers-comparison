import { useState, useMemo, lazy, Suspense, type ReactNode } from "react";
import {
  Trophy,
  DollarSign,
  Zap,
  ScatterChart,
  Brain,
  Sparkles,
} from "lucide-react";
import type { Model, Provider } from "../data/types";
import { formatPrice, type Lang } from "../data/i18n";
import { buildColorMap, type ColorMap } from "../data/colors";
import { ModelIcon, ProviderIcon } from "./ui/ProviderIcon";
import ThroughputChart from "./ui/ThroughputChart";
import DataTable from "./ui/DataTable";

const PricingChart = lazy(() => import("./ui/PricingChart"));
const ScatterPlot = lazy(() => import("./ui/ScatterPlot"));
const AbilityRadar = lazy(() => import("./ui/AbilityRadar"));
const ResultsPanel = lazy(() => import("./ui/ResultsPanel"));

interface Props {
  models: Model[];
  providers: Provider[];
  i18n: Record<string, Record<string, string>>;
}

type Tab = "throughput" | "pricing" | "scatter" | "abilities" | "recommendations";

export default function ModelDashboard({ models, providers, i18n }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("throughput");
  const [lang, setLang] = useState<Lang>("ja");
  const fallbackCopy =
    i18n.en ?? Object.values(i18n)[0] ?? ({} as Record<string, string>);
  const l = i18n[lang] ?? fallbackCopy;
  const isJa = lang === "ja";

  const colorMap = useMemo(() => buildColorMap(providers), [providers]);
  const heroModel = models.find((m) => m.hero);
  const priceHero = useMemo(
    () =>
      [...models]
        .filter((m) => m.tag !== "fast")
        .sort((a, b) => a.output - b.output)[0],
    [models],
  );

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "throughput", label: l.tabThroughput, icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "pricing", label: l.tabPricing, icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: "scatter", label: l.tabScatter, icon: <ScatterChart className="w-3.5 h-3.5" /> },
    { id: "abilities", label: l.tabAbilities, icon: <Brain className="w-3.5 h-3.5" /> },
    { id: "recommendations", label: l.tabRecommendations, icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(0,229,160,0.4)]" />
          <span
            className="text-[11px] text-emerald-400"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Space Mono', monospace",
              letterSpacing: isJa ? 1 : 3,
              textTransform: isJa ? "none" : "uppercase",
            }}
          >
            {l.badge}
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex gap-0.5 bg-white/[0.06] rounded-lg p-[3px] border border-white/[0.08]">
          {(
            [
              { code: "en" as Lang, label: "EN" },
              { code: "ja" as Lang, label: "日本語" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLang(opt.code)}
              className="px-3.5 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
              style={{
                fontFamily:
                  opt.code === "ja"
                    ? "'Noto Sans JP', sans-serif"
                    : "'Space Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: opt.code === "ja" ? 0 : 1,
                background:
                  lang === opt.code ? "rgba(255,255,255,0.12)" : "transparent",
                color: lang === opt.code ? "#fff" : "#555",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-4xl font-black m-0 mb-1.5 bg-clip-text"
        style={{
          background: "linear-gradient(135deg, #fff 0%, #aaa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: isJa ? 0 : -1,
        }}
      >
        {l.title}
      </h1>
      <p className="text-gray-500 text-sm m-0 mb-7 max-w-[520px]">
        {l.subtitle}
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 w-fit mb-7">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[9px] border-none cursor-pointer text-[13px] font-semibold transition-all duration-200"
            style={{
              background:
                activeTab === tab.id
                  ? "linear-gradient(135deg, #00E5A0 0%, #00C487 100%)"
                  : "transparent",
              color: activeTab === tab.id ? "#060610" : "#777",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Speed Hero Card */}
      {activeTab === "throughput" && heroModel && (
        <div className="flex items-center justify-between rounded-2xl px-6 py-5 mb-6 border border-emerald-400/20 bg-gradient-to-r from-emerald-400/[0.08] to-emerald-400/[0.02]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <span
                className="text-[11px] text-emerald-400"
                style={{
                  fontFamily: isJa
                    ? "'Noto Sans JP', sans-serif"
                    : "'Space Mono', monospace",
                  letterSpacing: isJa ? 1 : 2,
                  textTransform: isJa ? "none" : "uppercase",
                }}
              >
                {l.heroLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[22px] font-extrabold">
              <ModelIcon modelName={heroModel.name} size={22} className="shrink-0 opacity-80" />
              {heroModel.name}{" "}
              <span className="text-gray-500 font-normal text-sm">
                {isJa
                  ? `（${heroModel.provider.replace(" (Direct)", "")}）`
                  : `on ${heroModel.provider}`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-emerald-400 leading-none"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 38,
                fontWeight: 700,
                textShadow: "0 0 40px rgba(0,229,160,0.3)",
              }}
            >
              {heroModel.tps.toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs">{l.heroUnit}</div>
          </div>
        </div>
      )}

      {/* Pricing Hero Card */}
      {activeTab === "pricing" && priceHero && (
        <div className="flex items-center justify-between rounded-2xl px-6 py-5 mb-6 border border-sky-400/20 bg-gradient-to-r from-sky-400/[0.08] to-sky-400/[0.02]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-sky-400" />
              <span
                className="text-[11px] text-sky-400"
                style={{
                  fontFamily: isJa
                    ? "'Noto Sans JP', sans-serif"
                    : "'Space Mono', monospace",
                  letterSpacing: isJa ? 1 : 2,
                  textTransform: isJa ? "none" : "uppercase",
                }}
              >
                {l.priceHeroLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[22px] font-extrabold">
              <ModelIcon modelName={priceHero.name} size={22} className="shrink-0 opacity-80" />
              {priceHero.name}{" "}
              <span className="text-gray-500 font-normal text-sm">
                {isJa
                  ? `（${priceHero.provider.replace(" (Direct)", "")}）`
                  : `on ${priceHero.provider}`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-sky-400 leading-none"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 38,
                fontWeight: 700,
                textShadow: "0 0 40px rgba(56,189,248,0.3)",
              }}
            >
              {formatPrice(priceHero.output, lang)}
            </div>
            <div className="text-gray-500 text-xs">{l.priceHeroUnit}</div>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl pt-6 pr-4 pb-4">
        {activeTab === "throughput" && (
          <div>
            <div className="pl-6 mb-4">
              <h2 className="text-base font-bold m-0 text-gray-200">
                {l.tpsTitle}{" "}
                <span className="text-gray-600 font-normal text-[13px]">
                  {l.tpsUnit}
                </span>
              </h2>
            </div>
            <ThroughputChart data={models} lang={lang} colorMap={colorMap} />
          </div>
        )}

        {activeTab === "pricing" && (
          <div>
            <div className="pl-6 mb-4">
              <h2 className="text-base font-bold m-0 text-gray-200">
                {l.priceTitle}{" "}
                <span className="text-gray-600 font-normal text-[13px]">
                  {l.priceUnit}
                </span>
              </h2>
            </div>
            <PricingChart
              data={models}
              lang={lang}
              colorMap={colorMap}
              labels={{
                inputLegend: l.inputLegend,
                outputLegend: l.outputLegend,
                longContext: l.longContext,
              }}
            />
          </div>
        )}

        {activeTab === "scatter" && (
          <div>
            <div className="pl-6 mb-4">
              <h2 className="text-base font-bold m-0 text-gray-200">
                {l.scatterTitle}
              </h2>
              <p className="text-gray-600 text-xs m-0 mt-1">{l.scatterSub}</p>
            </div>
            <ScatterPlot
              data={models}
              lang={lang}
              colorMap={colorMap}
              labels={{
                xLabel: l.scatterXLabel,
                yLabel: l.scatterYLabel,
                sub: l.scatterSub,
              }}
            />
          </div>
        )}

        {activeTab === "abilities" && (
          <div>
            <div className="pl-6 mb-4">
              <h2 className="text-base font-bold m-0 text-gray-200">
                {l.abilityTitle}
              </h2>
              <p className="text-gray-600 text-xs m-0 mt-1">{l.abilitySub}</p>
            </div>
            <AbilityRadar
              data={models}
              lang={lang}
              colorMap={colorMap}
              labels={{
                abilityTitle: l.abilityTitle,
                abilitySub: l.abilitySub,
                benchmarkTitle: l.benchmarkTitle,
                benchmarkSub: l.benchmarkSub,
                selectModels: l.selectModels,
                selectAll: l.selectAll,
                deselectAll: l.deselectAll,
              }}
            />
          </div>
        )}

        {activeTab === "recommendations" && (
          <div>
            <div className="pl-6 mb-4">
              <h2 className="text-base font-bold m-0 text-gray-200">
                {l.resultsTitle}
              </h2>
              <p className="text-gray-600 text-xs m-0 mt-1 max-w-[580px]">
                {l.resultsSub}
              </p>
            </div>
            <ResultsPanel
              data={models}
              lang={lang}
              colorMap={colorMap}
              labels={{
                resultsTitle: l.resultsTitle,
                resultsSub: l.resultsSub,
                resultsDisclaimer: l.resultsDisclaimer,
                bestAbsolute: l.bestAbsolute,
                bestValue: l.bestValue,
                bestSpeed: l.bestSpeed,
              }}
            />
          </div>
        )}
      </div>

      {/* Provider Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 justify-center">
        {providers.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <ProviderIcon providerId={p.id} size={14} className="opacity-60" />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: p.color,
                boxShadow: `0 0 6px ${p.color}44`,
              }}
            />
            <span className="text-gray-500 text-[11px]">{p.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(255,170,50,0.27)]" />
          <span className="text-gray-500 text-[11px]">Fast Mode</span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={models}
        lang={lang}
        colorMap={colorMap}
        labels={{
          colModel: l.colModel,
          colProvider: l.colProvider,
          colTPS: l.colTPS,
          colInput: l.colInput,
          colOutput: l.colOutput,
          colInputLong: l.colInputLong,
          colOutputLong: l.colOutputLong,
        }}
      />

      {/* Footer */}
      <div
        className="text-center mt-5 text-gray-700 text-[10px]"
        style={{
          fontFamily: isJa
            ? "'Noto Sans JP', sans-serif"
            : "'Space Mono', monospace",
        }}
      >
        {l.footer}
      </div>
    </div>
  );
}
