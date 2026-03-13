import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  lazy,
  Suspense,
  startTransition,
  type ReactNode,
} from "react";
import {
  Trophy,
  DollarSign,
  Zap,
  ScatterChart,
  Brain,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import type { Model, Provider, NewsPost } from "../data/types";
import { formatPrice, type Lang } from "../data/i18n";
import { buildColorMap } from "../data/colors";
import { ModelIcon } from "./ui/ProviderIcon";
import ThroughputChart from "./ui/ThroughputChart";
import { sfxTab, sfxLang, sfxClick, sfxShare } from "../data/sfx";
import NewsTicker from "./ui/NewsTicker";
import ShareButtons from "./ui/ShareButtons";
import { trackTabSwitch, trackLangSwitch } from "../data/analytics";
import {
  DASHBOARD_STATE_EVENT,
  getDashboardShareText,
  type DashboardTab as Tab,
} from "./dashboard/share";

const HDR_VIDEO_SRC =
  "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAvG1kYXQAAAAfTgEFGkdWStxcTEM/lO/FETzRQ6gD7gAA7gIAA3EYgAAAAEgoAa8iNjAkszOL+e58c//cEe//0TT//scp1n/381P/RWP/zOW4QtxorfVogeh8nQDbQAAAAwAQMCcWUTAAAAMAAAMAAAMA84AAAAAVAgHQAyu+KT35E7gAADFgAAADABLQAAAAEgIB4AiS76MTkNbgAAF3AAAPSAAAABICAeAEn8+hBOTXYAADUgAAHRAAAAPibW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAAKcAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAw10cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAAKcAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAACnAAAAAAABAAAAAAKFbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABdwAAAD6BVxAAAAAAAMWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABDb3JlIE1lZGlhIFZpZGVvAAAAAixtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAHsc3RibAAAARxzdHNkAAAAAAAAAAEAAAEMaHZjMQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAQABAASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAHVodmNDAQIgAAAAsAAAAAAAPPAA/P36+gAACwOgAAEAGEABDAH//wIgAAADALAAAAMAAAMAPBXAkKEAAQAmQgEBAiAAAAMAsAAAAwAAAwA8oBQgQcCTDLYgV7kWVYC1CRAJAICiAAEACUQBwChkuNBTJAAAAApmaWVsAQAAAAATY29scm5jbHgACQAQAAkAAAAAEHBhc3AAAAABAAAAAQAAABRidHJ0AAAAAAAALPwAACz8AAAAKHN0dHMAAAAAAAAAAwAAAAIAAAPoAAAAAQAAAAEAAAABAAAD6AAAABRzdHNzAAAAAAAAAAEAAAABAAAAEHNkdHAAAAAAIBAQGAAAAChjdHRzAAAAAAAAAAMAAAABAAAAAAAAAAEAAAfQAAAAAgAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAQAAAABAAAAJHN0c3oAAAAAAAAAAAAAAAQAAABvAAAAGQAAABYAAAAWAAAAFHN0Y28AAAAAAAAAAQAAACwAAABhdWR0YQAAAFltZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAACxpbHN0AAAAJKl0b28AAAAcZGF0YQAAAAEAAAAATGF2ZjYwLjMuMTAw";
const HDR_POSTER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQAAAAA3iMLMAAAAAXNSR0IArs4c6QAAAA5JREFUeNpj+P+fgRQEAP1OH+HeyHWXAAAAAElFTkSuQmCC";

const pricingImport = () => import("./ui/PricingChart");
const scatterImport = () => import("./ui/ScatterPlot");
const radarImport = () => import("./ui/AbilityRadar");
const resultsImport = () => import("./ui/ResultsPanel");
const shaderImport = () => import("@paper-design/shaders-react");

const PricingChart = lazy(pricingImport);
const ScatterPlot = lazy(scatterImport);
const AbilityRadar = lazy(radarImport);
const ResultsPanel = lazy(resultsImport);
const MeshGradient = lazy(async () => ({ default: (await shaderImport()).MeshGradient }));
const Dithering = lazy(async () => ({ default: (await shaderImport()).Dithering }));
const NeuroNoise = lazy(async () => ({ default: (await shaderImport()).NeuroNoise }));

type DeferredTab = Exclude<Tab, "throughput">;

const deferredTabImports: Record<DeferredTab, () => Promise<unknown>> = {
  pricing: pricingImport,
  scatter: scatterImport,
  abilities: radarImport,
  recommendations: resultsImport,
};

interface Props {
  models: Model[];
  providers: Provider[];
  news: NewsPost[];
  i18n: Record<string, Record<string, string>>;
  lang: Lang;
  shareUrl: string;
}

function deferIdleWork(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const requestIdleCallback = window.requestIdleCallback.bind(window);
    const cancelIdleCallback = window.cancelIdleCallback.bind(window);
    const id = requestIdleCallback(callback, { timeout: 1500 });
    return () => cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 1200);
  return () => window.clearTimeout(id);
}

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
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

function MobileTabSelect({
  tabs,
  activeTab,
  onSelect,
}: {
  tabs: { id: Tab; label: string; icon: ReactNode }[];
  activeTab: Tab;
  onSelect: (id: Tab) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = tabs.find((t) => t.id === activeTab)!;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative sm:hidden mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full gap-2 px-4 py-3 rounded-xl border-none cursor-pointer text-sm font-semibold"
        style={{
          background: "rgba(51,112,254,0.06)",
          border: "1px solid rgba(51,112,254,0.15)",
          color: "#fff",
        }}
      >
        <span className="flex items-center gap-2">
          <span style={{ color: "#5C8DFE" }}>{current.icon}</span>
          {current.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {tabs.indexOf(current) + 1} / {tabs.length}
          </span>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{
              color: "rgba(255,255,255,0.4)",
              transform: open ? "rotate(180deg)" : "rotate(0)",
            }}
          />
        </span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(10,14,22,0.97)",
            border: "1px solid rgba(51,112,254,0.18)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelect(tab.id);
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-3 border-none cursor-pointer text-sm font-medium transition-colors duration-150"
                style={{
                  background: isActive ? "rgba(51,112,254,0.1)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                <span style={{ color: isActive ? "#5C8DFE" : "rgba(255,255,255,0.3)" }}>
                  {tab.icon}
                </span>
                {tab.label}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: "#5C8DFE" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabPanel({
  active,
  mounted,
  children,
}: {
  active: boolean;
  mounted: boolean;
  children: ReactNode;
}) {
  if (!mounted) return null;

  return (
    <section hidden={!active} aria-hidden={!active}>
      {children}
    </section>
  );
}

export default function ModelDashboard({
  models,
  providers,
  news,
  i18n,
  lang,
  shareUrl,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("throughput");
  const [mountedTabs, setMountedTabs] = useState<Record<Tab, boolean>>({
    throughput: true,
    pricing: false,
    scatter: false,
    abilities: false,
    recommendations: false,
  });
  const fallbackCopy =
    i18n.en ?? Object.values(i18n)[0] ?? ({} as Record<string, string>);
  const l = i18n[lang] ?? fallbackCopy;
  const isJa = lang === "ja";
  const [reduceMotion, setReduceMotion] = useReduceMotion();
  const topGlow = useInView("200px");
  const chartGlow = useInView("100px");

  useEffect(() => {
    localStorage.setItem("aid-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const shell = document.getElementById("dashboard-shell");
    shell?.classList.toggle("hdr-active", !reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    setMountedTabs((current) =>
      current[activeTab] ? current : { ...current, [activeTab]: true },
    );
  }, [activeTab]);

  useEffect(() => {
    const cancelIdle = deferIdleWork(() => {
      void pricingImport();
      void scatterImport();
      void radarImport();
      void resultsImport();
      if (!reduceMotion) {
        void shaderImport();
      }
    });

    return cancelIdle;
  }, [reduceMotion]);

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

  const shareTitle = l.title ?? "AI Model Comparison";
  const shareText = useMemo(
    () =>
      getDashboardShareText({
        activeTab,
        heroModel,
        priceHero,
        copy: l,
        lang,
      }),
    [activeTab, heroModel, priceHero, l, lang],
  );

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(DASHBOARD_STATE_EVENT, {
        detail: {
          activeTab,
          shareText,
          shareUrl,
          shareTitle,
        },
      }),
    );
  }, [activeTab, shareText, shareTitle, shareUrl]);

  const handleShare = useCallback(() => {
    if (!reduceMotion) sfxShare();
  }, [reduceMotion]);

  const warmTab = useCallback((tab: Tab) => {
    if (tab === "throughput") return;
    void deferredTabImports[tab]();
  }, []);

  const handleTabChange = useCallback(
    (tab: Tab) => {
      warmTab(tab);
      startTransition(() => {
        setActiveTab(tab);
      });
      trackTabSwitch(tab);
      if (!reduceMotion) sfxTab();
    },
    [reduceMotion, warmTab],
  );

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "throughput", label: l.tabThroughput, icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "pricing", label: l.tabPricing, icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: "scatter", label: l.tabScatter, icon: <ScatterChart className="w-3.5 h-3.5" /> },
    { id: "abilities", label: l.tabAbilities, icon: <Brain className="w-3.5 h-3.5" /> },
    { id: "recommendations", label: l.tabRecommendations, icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const langLinks = {
    ja: base,
    en: `${base}en/`,
  } as const;

  return (
    <>
      {!reduceMotion && (
        <video
          muted
          autoPlay
          playsInline
          className="hdr-trigger-video"
          onCanPlayThrough={(e) => {
            (e.target as HTMLVideoElement).currentTime = 0;
          }}
          poster={HDR_POSTER}
          src={HDR_VIDEO_SRC}
        />
      )}

      <div
        ref={topGlow.ref}
        className="absolute inset-x-0 -top-8 h-[650px] -z-10 pointer-events-none hdr-ambient"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 30% 20%, rgba(51,112,254,0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 70% 10%, rgba(255,4,19,0.08) 0%, transparent 60%)",
          maskImage: "linear-gradient(to bottom, black 20%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 85%)",
        }}
      >
        {!reduceMotion && topGlow.inView && (
          <Suspense fallback={null}>
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
                maskImage: "linear-gradient(to bottom, black 20%, transparent 85%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 20%, transparent 85%)",
              }}
            />
          </Suspense>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-2 sm:mb-2.5 flex-wrap">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <AidLogo className="h-7 sm:h-8 w-auto shrink-0" />
          <div
            className="h-4 w-px shrink-0 hidden sm:block"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(51,112,254,0.3), transparent)",
            }}
          />
          <span
            className="text-[11px] sm:text-[11px] hdr-glow truncate"
            style={{
              fontFamily: isJa
                ? "'Zen Kaku Gothic New', sans-serif"
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

        <div className="flex items-center gap-1.5 sm:gap-2">
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
          >
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 transition-colors duration-200 group-hover:text-white"
              style={{
                color: "rgba(255,255,255,0.35)",
                mixBlendMode: "plus-lighter",
              }}
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <div
            className="flex items-center gap-0.5 rounded-lg p-[3px] border"
            style={{
              background: "rgba(51,112,254,0.06)",
              borderColor: "rgba(51,112,254,0.12)",
            }}
          >
            <div className="relative group/fx">
              <button
                onClick={() => setReduceMotion(!reduceMotion)}
                className="px-2 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
                style={{
                  background: reduceMotion ? "transparent" : "rgba(255,255,255,0.12)",
                  color: reduceMotion ? "rgba(255,255,255,0.3)" : "#fff",
                }}
              >
                <Sparkles className="w-3 h-3" />
              </button>
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/fx:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{
                  background: "rgba(10,10,18,0.95)",
                  border: "1px solid rgba(51,112,254,0.2)",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                {reduceMotion
                  ? isJa
                    ? "エフェクトON"
                    : "Turn on effects"
                  : isJa
                    ? "エフェクトOFF"
                    : "Turn off effects"}
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: "4px solid rgba(10,10,18,0.95)",
                  }}
                />
              </div>
            </div>
            <div
              className="w-px h-3.5 self-center"
              style={{ background: "rgba(51,112,254,0.15)" }}
            />
            {(
              [
                { code: "en" as Lang, label: "EN" },
                { code: "ja" as Lang, label: "日本語" },
              ] as const
            ).map((opt) => (
              <a
                key={opt.code}
                href={langLinks[opt.code]}
                onClick={() => {
                  trackLangSwitch(opt.code);
                  if (!reduceMotion) sfxLang();
                }}
                className="px-3.5 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
                style={{
                  textDecoration: "none",
                  fontFamily:
                    opt.code === "ja"
                      ? "'Zen Kaku Gothic New', sans-serif"
                      : "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: opt.code === "ja" ? 0 : 1,
                  background:
                    lang === opt.code
                      ? "linear-gradient(135deg, rgba(51,112,254,0.2), rgba(255,4,19,0.15))"
                      : "transparent",
                  color: lang === opt.code ? "#fff" : "rgba(255,255,255,0.35)",
                  mixBlendMode: lang === opt.code ? "normal" : ("plus-lighter" as any),
                }}
              >
                {opt.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <h1
        className="text-xl sm:text-[28px] font-black m-0 mb-1 hdr-text"
        style={{
          color: "#fff",
          letterSpacing: isJa ? 1 : -0.5,
          fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
          lineHeight: 1.2,
        }}
      >
        {l.title}
      </h1>
      <p
        className="text-xs sm:text-xs m-0 mb-4 sm:mb-5 max-w-[580px] leading-relaxed"
        style={{
          color: "rgba(255,255,255,0.35)",
          mixBlendMode: "plus-lighter",
          fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
        }}
      >
        {l.subtitle}
        <span style={{ color: "rgba(255,255,255,0.15)", margin: "0 6px" }}>·</span>
        <a
          href={`${base}why`}
          className="no-underline transition-colors duration-200"
          style={{ color: "#5C8DFE", whiteSpace: "nowrap" }}
        >
          {isJa ? "なぜ作ったか →" : "Why →"}
        </a>
      </p>

      <div className="mb-4 sm:mb-5">
        <NewsTicker
          variant="dashboard"
          text={
            news.length > 0
              ? isJa
                ? news[0].title.ja
                : news[0].title.en
              : l.tickerHeadline ?? ""
          }
        />
      </div>

      <a
        href={`${base}languages`}
        onClick={() => {
          if (!reduceMotion) sfxClick();
        }}
        className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 mb-5 sm:mb-6 no-underline transition-all group"
        style={{
          background: "rgba(51,112,254,0.06)",
          border: "1px solid rgba(92,141,254,0.12)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-[13px] font-bold"
            style={{ color: "#7BAAFF", fontFamily: "'Space Mono', monospace" }}
          >
            ACB
          </span>
          <span
            className="text-[13px] truncate"
            style={{
              color: "rgba(255,255,255,0.7)",
              fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
            }}
          >
            {isJa
              ? "AutoCodeBench 言語別ランキング — 21言語のパス率を比較"
              : "AutoCodeBench language rankings — pass rates across 21 languages"}
          </span>
        </div>
        <span className="text-[12px] shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
          {isJa ? "開く →" : "View →"}
        </span>
      </a>

      <MobileTabSelect tabs={tabs} activeTab={activeTab} onSelect={handleTabChange} />

      <div
        className="hidden sm:flex gap-0 mb-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              onMouseEnter={() => warmTab(tab.id)}
              onFocus={() => warmTab(tab.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 border-none cursor-pointer text-[13px] font-medium transition-all duration-200 relative whitespace-nowrap shrink-0"
              style={{
                background: "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.35)",
                mixBlendMode: isActive ? undefined : ("plus-lighter" as any),
              }}
            >
              <span style={{ color: isActive ? "#5C8DFE" : "inherit" }}>{tab.icon}</span>
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full hdr-vivid"
                  style={{ background: "linear-gradient(90deg, #3370FE, #5C8DFE)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <TabPanel active={activeTab === "throughput"} mounted={Boolean(heroModel)}>
        {heroModel && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-8 relative overflow-hidden"
            style={{
              border: "1px solid rgba(51,112,254,0.2)",
              background:
                "linear-gradient(135deg, rgba(51,112,254,0.08) 0%, rgba(255,4,19,0.04) 100%)",
            }}
          >
            {!reduceMotion && (
              <Suspense fallback={null}>
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
              </Suspense>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: "#5C8DFE" }} />
                <span
                  className="text-[11px] sm:text-[11px]"
                  style={{
                    fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Space Mono', monospace",
                    letterSpacing: isJa ? 1 : 2,
                    textTransform: isJa ? "none" : "uppercase",
                    color: "#5C8DFE",
                  }}
                >
                  {l.heroLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[17px] sm:text-[22px] font-extrabold flex-wrap">
                <ModelIcon modelName={heroModel.name} size={20} className="shrink-0 opacity-80" />
                <span className="truncate">{heroModel.name}</span>
                <span
                  className="font-normal text-[13px] sm:text-sm"
                  style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
                >
                  {isJa
                    ? `（${heroModel.provider.replace(" (Direct)", "")}）`
                    : `on ${heroModel.provider}`}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div
                className="leading-none"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "clamp(28px, 8vw, 38px)",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #5C8DFE, #FF3640)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 30px rgba(51,112,254,0.3))${!reduceMotion ? " brightness(2.5)" : ""}`,
                }}
              >
                {heroModel.tps.toLocaleString()}
              </div>
              <div
                className="text-[13px] sm:text-xs"
                style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
              >
                {l.heroUnit}
              </div>
            </div>
          </div>
        )}
      </TabPanel>

      <TabPanel active={activeTab === "pricing"} mounted={Boolean(priceHero)}>
        {priceHero && (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-8 relative overflow-hidden"
            style={{
              border: "1px solid rgba(255,4,19,0.2)",
              background:
                "linear-gradient(135deg, rgba(255,4,19,0.06) 0%, rgba(138,60,184,0.04) 100%)",
            }}
          >
            {!reduceMotion && (
              <Suspense fallback={null}>
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
              </Suspense>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" style={{ color: "#FF3640" }} />
                <span
                  className="text-[11px] sm:text-[11px]"
                  style={{
                    fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Space Mono', monospace",
                    letterSpacing: isJa ? 1 : 2,
                    textTransform: isJa ? "none" : "uppercase",
                    color: "#FF3640",
                  }}
                >
                  {l.priceHeroLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[17px] sm:text-[22px] font-extrabold flex-wrap">
                <ModelIcon modelName={priceHero.name} size={20} className="shrink-0 opacity-80" />
                <span className="truncate">{priceHero.name}</span>
                <span
                  className="font-normal text-[13px] sm:text-sm"
                  style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
                >
                  {isJa
                    ? `（${priceHero.provider.replace(" (Direct)", "")}）`
                    : `on ${priceHero.provider}`}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <div
                className="leading-none"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "clamp(28px, 8vw, 38px)",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #FF3640, #E0247A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: `drop-shadow(0 0 30px rgba(255,4,19,0.3))${!reduceMotion ? " brightness(2.5)" : ""}`,
                }}
              >
                {formatPrice(priceHero.output, lang)}
              </div>
              <div
                className="text-[13px] sm:text-xs"
                style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
              >
                {l.priceHeroUnit}
              </div>
            </div>
          </div>
        )}
      </TabPanel>

      <div
        ref={chartGlow.ref}
        className="rounded-xl sm:rounded-2xl pt-4 sm:pt-6 pr-2 sm:pr-4 pb-3 sm:pb-4 relative overflow-hidden isolate hdr-vivid"
        style={{ background: "rgba(51,112,254,0.02)", border: "1px solid rgba(51,112,254,0.06)" }}
      >
        {!reduceMotion && chartGlow.inView && (
          <Suspense fallback={null}>
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
          </Suspense>
        )}

        <TabPanel active={activeTab === "throughput"} mounted={mountedTabs.throughput}>
          <div>
            <div className="pl-4 sm:pl-6 mb-3 sm:mb-4">
              <h2 className="text-[15px] sm:text-base font-bold m-0 hdr-text">
                {l.tpsTitle}{" "}
                <span
                  className="font-normal text-[13px] sm:text-[13px]"
                  style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
                >
                  {l.tpsUnit}
                </span>
              </h2>
            </div>
            <ThroughputChart data={models} lang={lang} colorMap={colorMap} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab === "pricing"} mounted={mountedTabs.pricing}>
          <div>
            <div className="pl-4 sm:pl-6 mb-3 sm:mb-4">
              <h2 className="text-[15px] sm:text-base font-bold m-0 hdr-text">
                {l.priceTitle}{" "}
                <span
                  className="font-normal text-[13px] sm:text-[13px]"
                  style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
                >
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
        </TabPanel>

        <TabPanel active={activeTab === "scatter"} mounted={mountedTabs.scatter}>
          <div>
            <div className="pl-4 sm:pl-6 mb-3 sm:mb-4">
              <h2 className="text-[15px] sm:text-base font-bold m-0 hdr-text">
                {l.scatterTitle}
              </h2>
              <p
                className="text-[11px] sm:text-xs m-0 mt-1"
                style={{ color: "rgba(255,255,255,0.3)", mixBlendMode: "plus-lighter" }}
              >
                {l.scatterSub}
              </p>
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
        </TabPanel>

        <TabPanel active={activeTab === "abilities"} mounted={mountedTabs.abilities}>
          <div>
            <div className="pl-4 sm:pl-6 mb-3 sm:mb-4">
              <h2 className="text-[15px] sm:text-base font-bold m-0 hdr-text">
                {l.abilityTitle}
              </h2>
              <p
                className="text-[11px] sm:text-xs m-0 mt-1"
                style={{ color: "rgba(255,255,255,0.3)", mixBlendMode: "plus-lighter" }}
              >
                {l.abilitySub}
              </p>
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
        </TabPanel>

        <TabPanel active={activeTab === "recommendations"} mounted={mountedTabs.recommendations}>
          <div>
            <div className="pl-4 sm:pl-6 mb-3 sm:mb-4">
              <h2 className="text-[15px] sm:text-base font-bold m-0 hdr-text">
                {l.resultsTitle}
              </h2>
              <p
                className="text-[11px] sm:text-xs m-0 mt-1 max-w-[580px]"
                style={{ color: "rgba(255,255,255,0.3)", mixBlendMode: "plus-lighter" }}
              >
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
        </TabPanel>
      </div>
    </>
  );
}
