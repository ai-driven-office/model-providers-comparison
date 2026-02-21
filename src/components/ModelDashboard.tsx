import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense, type ReactNode } from "react";
import {
  Trophy,
  DollarSign,
  Zap,
  ScatterChart,
  Brain,
  Sparkles,
} from "lucide-react";
import type { Model, Provider, NewsPost } from "../data/types";
import { formatPrice, useLang, type Lang } from "../data/i18n";
import { buildColorMap } from "../data/colors";
import { ModelIcon, ProviderIcon } from "./ui/ProviderIcon";
import ThroughputChart from "./ui/ThroughputChart";
import DataTable from "./ui/DataTable";
import AbilityTable from "./ui/AbilityTable";
import NewsTimeline from "./ui/NewsTimeline";
import { MeshGradient, Dithering, NeuroNoise } from "@paper-design/shaders-react";
import { sfxTab, sfxLang, sfxClick, sfxShare } from "../data/sfx";
import NewsTicker from "./ui/NewsTicker";
import Testimonials from "./ui/Testimonials";
import ShareButtons, { ShareCta } from "./ui/ShareButtons";

const pricingImport = () => import("./ui/PricingChart");
const scatterImport = () => import("./ui/ScatterPlot");
const radarImport = () => import("./ui/AbilityRadar");
const resultsImport = () => import("./ui/ResultsPanel");

const PricingChart = lazy(pricingImport);
const ScatterPlot = lazy(scatterImport);
const AbilityRadar = lazy(radarImport);
const ResultsPanel = lazy(resultsImport);

interface Props {
  models: Model[];
  providers: Provider[];
  news: NewsPost[];
  i18n: Record<string, Record<string, string>>;
  buildDate: string;
}

type Tab = "throughput" | "pricing" | "scatter" | "abilities" | "recommendations";

function AidLogo({ className = "" }: { className?: string }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return (
    <img
      src={`${base}rbg_Logomark_white.png`}
      alt="AI := Driven"
      className={className}
    />
  );
}

function ChartSkeleton({ height = 470 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div
        className="w-5 h-5 rounded-full animate-spin"
        style={{
          border: "2px solid rgba(51,112,254,0.15)",
          borderTopColor: "rgba(51,112,254,0.5)",
        }}
      />
    </div>
  );
}

function useReduceMotion(): [boolean, (v: boolean) => void] {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("aid-reduce-motion");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const toggle = useCallback((v: boolean) => {
    setReduced(v);
    localStorage.setItem("aid-reduce-motion", String(v));
  }, []);
  return [reduced, toggle];
}

function useInView(rootMargin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

export default function ModelDashboard({ models, providers, news, i18n, buildDate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("throughput");
  const [lang, setLang] = useLang("ja");
  const fallbackCopy =
    i18n.en ?? Object.values(i18n)[0] ?? ({} as Record<string, string>);
  const l = i18n[lang] ?? fallbackCopy;
  const isJa = lang === "ja";
  const [reduceMotion, setReduceMotion] = useReduceMotion();
  const topGlow = useInView("200px");
  const chartGlow = useInView("100px");

  useEffect(() => {
    pricingImport();
    scatterImport();
    radarImport();
    resultsImport();
  }, []);

  const colorMap = useMemo(() => buildColorMap(providers), [providers]);
  const heroModel = models.find((m) => m.hero);
  const pricedModels = useMemo(
    () => models.filter((m) => m.input != null && m.output != null),
    [models],
  );
  const priceHero = useMemo(
    () =>
      [...pricedModels]
        .filter((m) => m.tag !== "fast")
        .sort((a, b) => (a.output ?? 0) - (b.output ?? 0))[0],
    [pricedModels],
  );

  const shareUrl = typeof window !== "undefined"
    ? window.location.href.split("?")[0].split("#")[0]
    : "https://ai-driven-office.github.io/model-providers-comparison/";

  const shareTitle = l.title ?? "AI Model Comparison";

  const shareText = useMemo(() => {
    if (activeTab === "throughput" && heroModel) {
      return (l.shareSpeedText ?? "")
        .replace("{model}", heroModel.name)
        .replace("{tps}", heroModel.tps.toLocaleString());
    }
    if (activeTab === "pricing" && priceHero) {
      return (l.sharePriceText ?? "")
        .replace("{model}", priceHero.name)
        .replace("{price}", formatPrice(priceHero.output, lang));
    }
    return l.shareDefaultText ?? "";
  }, [activeTab, heroModel, priceHero, l, lang]);

  const handleShare = useCallback(() => {
    if (!reduceMotion) sfxShare();
  }, [reduceMotion]);

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "throughput", label: l.tabThroughput, icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "pricing", label: l.tabPricing, icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: "scatter", label: l.tabScatter, icon: <ScatterChart className="w-3.5 h-3.5" /> },
    { id: "abilities", label: l.tabAbilities, icon: <Brain className="w-3.5 h-3.5" /> },
    { id: "recommendations", label: l.tabRecommendations, icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-[960px] mx-auto relative isolate">
      {/* Ambient glow — static CSS fallback + live shader when effects are on */}
      <div
        ref={topGlow.ref}
        className="absolute inset-x-0 -top-8 h-[650px] -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 30% 20%, rgba(51,112,254,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 70% 10%, rgba(255,4,19,0.08) 0%, transparent 60%)",
          maskImage:
            "linear-gradient(to bottom, black 20%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 20%, transparent 85%)",
        }}
      >
        {!reduceMotion && topGlow.inView && (
          <MeshGradient
            colors={["#3370FE", "#8A3CB8", "#E0247A", "#FF0413"]}
            speed={0.25}
            distortion={0.7}
            swirl={0.15}
            grainOverlay={0.06}
            style={{
              width: "100%",
              height: "100%",
              opacity: 0.18,
              maskImage:
                "linear-gradient(to bottom, black 20%, transparent 85%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 20%, transparent 85%)",
            }}
          />
        )}
      </div>

      {/* Top Bar — Logo + Badge + Lang Switcher */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <AidLogo className="h-8 w-auto" />
          <div
            className="h-4 w-px"
            style={{ background: "linear-gradient(180deg, transparent, rgba(51,112,254,0.3), transparent)" }}
          />
          <span
            className="text-[11px]"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Space Mono', monospace",
              letterSpacing: isJa ? 1 : 3,
              textTransform: isJa ? "none" : "uppercase",
              background: "linear-gradient(135deg, #5C8DFE, #FF3640)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {l.badge}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
        <ShareButtons
          shareText={shareText}
          shareUrl={shareUrl}
          shareTitle={shareTitle}
          labels={{
            shareX: l.shareX ?? "Share on X",
            shareCopy: l.shareCopy ?? "Copy link",
            shareNative: l.shareNative ?? "Share…",
            shareCopied: l.shareCopied ?? "Copied!",
          }}
          lang={lang}
          reduceMotion={reduceMotion}
          onShare={handleShare}
        />
        <a
          href="https://github.com/ai-driven-office/model-providers-comparison"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200"
          style={{
            background: "rgba(51,112,254,0.06)",
            borderColor: "rgba(51,112,254,0.12)",
          }}
          title="View on GitHub"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(51,112,254,0.15)";
            e.currentTarget.style.borderColor = "rgba(51,112,254,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(51,112,254,0.06)";
            e.currentTarget.style.borderColor = "rgba(51,112,254,0.12)";
          }}
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-white"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
        <div className="flex items-center gap-0.5 rounded-lg p-[3px] border" style={{ background: "rgba(51,112,254,0.06)", borderColor: "rgba(51,112,254,0.12)" }}>
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className="px-2 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
            style={{
              background: reduceMotion ? "transparent" : "rgba(51,112,254,0.15)",
              color: reduceMotion ? "#444" : "#5C8DFE",
            }}
            title={reduceMotion ? (isJa ? "エフェクトON" : "Enable effects") : (isJa ? "エフェクトOFF" : "Disable effects")}
          >
            <Sparkles className="w-3 h-3" />
          </button>
          <div className="w-px h-3.5 self-center" style={{ background: "rgba(51,112,254,0.15)" }} />
          {(
            [
              { code: "en" as Lang, label: "EN" },
              { code: "ja" as Lang, label: "日本語" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.code}
              onClick={() => { setLang(opt.code); if (!reduceMotion) sfxLang(); }}
              className="px-3.5 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
              style={{
                fontFamily:
                  opt.code === "ja"
                    ? "'Noto Sans JP', sans-serif"
                    : "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: opt.code === "ja" ? 0 : 1,
                background:
                  lang === opt.code
                    ? "linear-gradient(135deg, rgba(51,112,254,0.2), rgba(255,4,19,0.15))"
                    : "transparent",
                color: lang === opt.code ? "#fff" : "#555",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Title */}
      <h1
        className="text-4xl font-black m-0 mb-4"
        style={{
          color: "#fff",
          letterSpacing: isJa ? 1 : -1,
          fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
        }}
      >
        {l.title}
      </h1>
      <p className="text-gray-500 text-sm m-0 mb-6 max-w-[520px]">
        {l.subtitle}
      </p>

      {/* Why brief */}
      <p className="text-gray-600 text-xs m-0 mb-7 max-w-[520px] leading-relaxed" style={{ fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif" }}>
        {isJa
          ? "AI各社は自社モデルが優れるベンチマークを強調する傾向があり、全体像の把握が困難です。本サイトは独立した比較データを提供し、その課題に応えます。"
          : "AI labs tend to highlight benchmarks where their models lead, making the full picture hard to see. This site provides independent, standardized comparison data."
        }
        {" "}
        <a
          href={`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}why`}
          className="no-underline transition-colors duration-200"
          style={{ color: "#5C8DFE", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#7BAAFF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#5C8DFE"; }}
        >
          {isJa ? "詳しく →" : "Why we built this →"}
        </a>
      </p>

      {/* News Ticker — latest headline, links to #news */}
      <div className="mb-8">
        <NewsTicker
          variant="dashboard"
          text={news.length > 0
            ? (isJa ? news[0].title.ja : news[0].title.en)
            : (l.tickerHeadline ?? "")
          }
        />
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 mb-8 w-fit"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (!reduceMotion) sfxTab(); }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border-none cursor-pointer text-[13px] font-medium transition-all duration-200 relative"
              style={{
                background: "transparent",
                color: isActive ? "#fff" : "#555",
              }}
            >
              <span style={{ color: isActive ? "#5C8DFE" : "inherit" }}>
                {tab.icon}
              </span>
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #3370FE, #5C8DFE)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content — keyed for entrance animation */}
      <div key={activeTab} className="animate-tab-enter">
        {/* Speed Hero Card */}
        {activeTab === "throughput" && heroModel && (
          <div
            className="flex items-center justify-between rounded-2xl px-6 py-5 mb-6 relative overflow-hidden"
            style={{
            border: "1px solid rgba(51,112,254,0.2)",
            background: "linear-gradient(135deg, rgba(51,112,254,0.08) 0%, rgba(255,4,19,0.04) 100%)",
          }}
        >
          {!reduceMotion && (
            <Dithering
              colorBack="#00000000"
              colorFront="#3370FE"
              shape="warp"
              type="4x4"
              size={2}
              speed={0.4}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0.1,
                pointerEvents: "none",
              }}
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5" style={{ color: "#5C8DFE" }} />
                <span
                  className="text-[11px]"
                  style={{
                    fontFamily: isJa
                      ? "'Noto Sans JP', sans-serif"
                      : "'Space Mono', monospace",
                    letterSpacing: isJa ? 1 : 2,
                    textTransform: isJa ? "none" : "uppercase",
                    color: "#5C8DFE",
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
                className="leading-none"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 38,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #5C8DFE, #FF3640)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(51,112,254,0.3))",
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
          <div
            className="flex items-center justify-between rounded-2xl px-6 py-5 mb-6 relative overflow-hidden"
            style={{
            border: "1px solid rgba(255,4,19,0.2)",
            background: "linear-gradient(135deg, rgba(255,4,19,0.06) 0%, rgba(138,60,184,0.04) 100%)",
          }}
        >
          {!reduceMotion && (
            <Dithering
              colorBack="#00000000"
              colorFront="#FF0413"
              shape="warp"
              type="4x4"
              size={2}
              speed={0.4}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0.1,
                pointerEvents: "none",
              }}
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5" style={{ color: "#FF3640" }} />
                <span
                  className="text-[11px]"
                  style={{
                    fontFamily: isJa
                      ? "'Noto Sans JP', sans-serif"
                      : "'Space Mono', monospace",
                    letterSpacing: isJa ? 1 : 2,
                    textTransform: isJa ? "none" : "uppercase",
                    color: "#FF3640",
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
                className="leading-none"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 38,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #FF3640, #E0247A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(255,4,19,0.3))",
                }}
              >
                {formatPrice(priceHero.output, lang)}
              </div>
              <div className="text-gray-500 text-xs">{l.priceHeroUnit}</div>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div
          ref={chartGlow.ref}
          className="rounded-2xl pt-6 pr-4 pb-4 relative overflow-hidden isolate"
          style={{ background: "rgba(51,112,254,0.02)", border: "1px solid rgba(51,112,254,0.06)" }}
        >
          {!reduceMotion && chartGlow.inView && (
            <NeuroNoise
              colorFront="#5C8DFE"
              colorMid="#8A3CB8"
              colorBack="#08121a"
              brightness={0.03}
              contrast={0.2}
              speed={0.3}
              scale={1.5}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0.06,
                pointerEvents: "none",
                zIndex: -1,
                borderRadius: "1rem",
              }}
            />
          )}
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
              <Suspense fallback={<ChartSkeleton />}>
                <PricingChart
                  data={pricedModels}
                  lang={lang}
                  colorMap={colorMap}
                  labels={{
                    inputLegend: l.inputLegend,
                    outputLegend: l.outputLegend,
                    longContext: l.longContext,
                  }}
                />
              </Suspense>
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
              <Suspense fallback={<ChartSkeleton />}>
                <ScatterPlot
                  data={pricedModels}
                  lang={lang}
                  colorMap={colorMap}
                  labels={{
                    xLabel: l.scatterXLabel,
                    yLabel: l.scatterYLabel,
                    sub: l.scatterSub,
                  }}
                />
              </Suspense>
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
              <Suspense fallback={<ChartSkeleton height={580} />}>
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
              </Suspense>
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
              <Suspense fallback={<ChartSkeleton />}>
                <ResultsPanel
                  data={models}
                  lang={lang}
                  colorMap={colorMap}
                  reduceMotion={reduceMotion}
                  labels={{
                    resultsTitle: l.resultsTitle,
                    resultsSub: l.resultsSub,
                    resultsDisclaimer: l.resultsDisclaimer,
                    bestAbsolute: l.bestAbsolute,
                    bestValue: l.bestValue,
                    bestSpeed: l.bestSpeed,
                  }}
                />
              </Suspense>
            </div>
          )}
        </div>
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

      {/* GLM × Cerebras Guide Link */}
      <a
        href={`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}glm-cerebras`}
        onClick={() => { if (!reduceMotion) sfxClick(); }}
        className="flex items-center justify-between rounded-xl px-5 py-3.5 mt-6 mb-2 no-underline transition-all group relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(51,112,254,0.04) 0%, rgba(255,4,19,0.02) 100%)",
          border: "1px solid rgba(51,112,254,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(51,112,254,0.25)";
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(51,112,254,0.08) 0%, rgba(255,4,19,0.04) 100%)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(51,112,254,0.1)";
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(51,112,254,0.04) 0%, rgba(255,4,19,0.02) 100%)";
        }}
      >
        {!reduceMotion && (
          <Dithering
            colorBack="#00000000"
            colorFront="#3370FE"
            shape="swirl"
            type="8x8"
            size={1.5}
            speed={0.3}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.06,
              pointerEvents: "none",
            }}
          />
        )}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3370FE, #5C8DFE)" }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-gray-200">
              {isJa ? "GLM 4.7 × Cerebras ガイド" : "GLM 4.7 × Cerebras Guide"}
            </div>
            <div className="text-[11px] text-gray-500">
              {isJa
                ? "1,000 tps でAIコーディング — OpenCodeセットアップガイド"
                : "AI coding at 1,000 tps — OpenCode setup & recommended workflow"}
            </div>
          </div>
        </div>
        <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-sm">→</span>
      </a>

      {/* Taalas HC1 Speed Record Link */}
      <a
        href="https://taalas.com/the-path-to-ubiquitous-ai/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { if (!reduceMotion) sfxClick(); }}
        className="flex items-center justify-between rounded-xl px-5 py-3.5 mt-2 mb-2 no-underline transition-all group relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,106,0,0.04) 0%, rgba(255,4,19,0.02) 100%)",
          border: "1px solid rgba(255,106,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,106,0,0.25)";
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,106,0,0.08) 0%, rgba(255,4,19,0.04) 100%)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,106,0,0.1)";
          e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,106,0,0.04) 0%, rgba(255,4,19,0.02) 100%)";
        }}
      >
        {!reduceMotion && (
          <Dithering
            colorBack="#00000000"
            colorFront="#FF6A00"
            shape="swirl"
            type="8x8"
            size={1.5}
            speed={0.3}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.06,
              pointerEvents: "none",
            }}
          />
        )}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6A00, #FF8C33)" }}
          >
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-gray-200">
              {isJa ? "Taalas HC1 — 速度新記録" : "Taalas HC1 — New Speed Record"}
            </div>
            <div className="text-[11px] text-gray-500">
              {isJa
                ? "16,960 tps — モデルをトランジスタに直接実装するカスタムシリコン"
                : "16,960 tps — custom silicon that hardwires the model into transistors"}
            </div>
          </div>
        </div>
        <span className="text-gray-600 group-hover:text-gray-400 transition-colors text-sm">→</span>
      </a>

      {/* Data Table — switch to ability ranking when on abilities tab */}
      {activeTab === "abilities" ? (
        <AbilityTable
          data={models}
          lang={lang}
          colorMap={colorMap}
          labels={{
            colModel: l.colModel,
            colProvider: l.colProvider,
            colAverage: l.colAverage,
          }}
        />
      ) : (
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
      )}

      {/* ── Section divider: data ↑ · editorial ↓ ── */}
      <div className="mt-14 mb-10 flex items-center gap-4">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(51,112,254,0.15), rgba(138,60,184,0.1))" }} />
        <div
          className="text-[10px] tracking-widest text-gray-600 shrink-0"
          style={{
            fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          {isJa ? "ニュース & コミュニティ" : "News & Community"}
        </div>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(138,60,184,0.1), rgba(255,4,19,0.12), transparent)" }} />
      </div>

      {/* News Timeline */}
      {news.length > 0 && (
        <NewsTimeline
          posts={news}
          lang={lang}
          labels={{
            newsTitle: l.newsTitle ?? "News & Updates",
            newsSub: l.newsSub ?? "Latest developments in AI model performance and infrastructure",
            fasterThan: l.fasterThan ?? "faster than",
            tryFree: l.tryFree ?? "Try it free",
            useCases: l.useCases ?? "Use cases",
            speedComparisons: l.speedComparisons ?? "Speed Comparisons",
          }}
        />
      )}

      {/* Testimonials */}
      <Testimonials
        lang={lang}
        labels={{
          testimonialsTitle: l.testimonialsTitle ?? "What People Are Saying",
          testimonialsSub: l.testimonialsSub ?? "Community reactions from X",
        }}
      />

      {/* Bottom ambient glow — CSS-only bookend (no GPU cost) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[400px] -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 120% 60% at 50% 100%, rgba(255,4,19,0.07) 0%, rgba(138,60,184,0.04) 35%, transparent 70%)",
        }}
      />

      {/* Share CTA */}
      <ShareCta
        shareText={shareText}
        shareUrl={shareUrl}
        labels={{
          shareCtaTitle: l.shareCtaTitle ?? "Spread the word",
          shareCtaBody: l.shareCtaBody ?? "Share this comparison with others.",
          shareX: l.shareX ?? "Share on X",
          shareCopy: l.shareCopy ?? "Copy link",
          shareCopied: l.shareCopied ?? "Copied!",
        }}
        lang={lang}
        reduceMotion={reduceMotion}
        onShare={handleShare}
      />

      {/* Contribution CTA */}
      <div
        className="mt-4 rounded-xl border relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(51,112,254,0.06) 0%, rgba(138,60,184,0.04) 50%, rgba(255,4,19,0.05) 100%)",
          borderColor: "rgba(51,112,254,0.12)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(51,112,254,0.4), rgba(138,60,184,0.3), rgba(255,4,19,0.4), transparent)",
          }}
        />
        <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(51,112,254,0.15), rgba(138,60,184,0.1))",
              border: "1px solid rgba(51,112,254,0.2)",
            }}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 text-gray-300">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3
              className="text-sm font-bold text-white m-0 mb-1"
              style={{
                fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
              }}
            >
              {l.ctaTitle}
            </h3>
            <p
              className="text-xs text-gray-400 m-0 leading-relaxed max-w-lg"
              style={{
                fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
              }}
            >
              {l.ctaBody}
            </p>
          </div>
          <a
            href="https://github.com/ai-driven-office/model-providers-comparison/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold no-underline transition-all duration-200"
            style={{
              fontFamily: isJa ? "'Noto Sans JP', sans-serif" : "'Inter', sans-serif",
              fontSize: 12,
              background: "rgba(51,112,254,0.1)",
              borderColor: "rgba(51,112,254,0.25)",
              color: "#7BAAFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(51,112,254,0.2)";
              e.currentTarget.style.borderColor = "rgba(51,112,254,0.4)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(51,112,254,0.1)";
              e.currentTarget.style.borderColor = "rgba(51,112,254,0.25)";
              e.currentTarget.style.color = "#7BAAFF";
            }}
          >
            {l.ctaButton}
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" />
            </svg>
          </a>
        </div>
      </div>

      {/* Footer — AID branding + copyright */}
      <footer className="mt-6 pt-6 relative" style={{ borderTop: "1px solid rgba(51,112,254,0.08)" }}>
        {/* Gradient bar — AID signature element */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-48"
          style={{
            background: "linear-gradient(90deg, transparent, #3370FE, #8A3CB8, #E0247A, #FF0413, transparent)",
          }}
        />

        <div className="flex flex-col items-center gap-3">
          {/* Footer logo */}
          <AidLogo className="h-6 w-auto opacity-40" />

          {/* Last updated + Download Markdown */}
          <div className="flex items-center gap-3 text-[10px] text-gray-600">
            <span
              style={{
                fontFamily: isJa
                  ? "'Noto Sans JP', sans-serif"
                  : "'Space Mono', monospace",
              }}
            >
              {l.lastUpdated}: {buildDate}
            </span>
            <span style={{ color: "rgba(51,112,254,0.2)" }}>|</span>
            <a
              href={`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}data.md`}
              className="no-underline transition-colors duration-200"
              style={{ color: "#5C8DFE" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#7BAAFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#5C8DFE"; }}
              title={l.downloadMd}
            >
              {l.downloadMd}
            </a>
            <span style={{ color: "rgba(51,112,254,0.2)" }}>|</span>
            <a
              href={`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}why`}
              className="no-underline transition-colors duration-200"
              style={{ color: "#5C8DFE" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#7BAAFF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#5C8DFE"; }}
            >
              {isJa ? "なぜ作ったのか" : "Why this site?"}
            </a>
          </div>

          {/* Data source note */}
          <div
            className="text-center text-gray-600 text-[10px]"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Space Mono', monospace",
            }}
          >
            {l.footer}
          </div>

          {/* Copyright */}
          <div
            className="text-center text-gray-700 text-[10px]"
            style={{
              fontFamily: isJa
                ? "'Noto Sans JP', sans-serif"
                : "'Inter', sans-serif",
              letterSpacing: isJa ? 0.5 : 0.5,
            }}
          >
            {l.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
