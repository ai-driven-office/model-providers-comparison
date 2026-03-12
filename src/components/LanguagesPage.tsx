import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  ReferenceLine,
} from "recharts";
import { Languages, Trophy, ArrowLeft, TrendingUp, Zap, GitCompare } from "lucide-react";
import { MeshGradient } from "@paper-design/shaders-react";
import { useLang, type Lang } from "../data/i18n";
import {
  gpt54MediumLanguageBenchmarks,
  opus4LanguageBenchmarks,
  getFilteredLanguageRows,
  getTopLanguageRows,
  getComparisonRows,
} from "../data/languageBenchmarks";
import { sfxLang } from "../data/sfx";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";
const JA_SANS = "'Zen Kaku Gothic New', sans-serif";

/* ── Performance tier system ── */
interface PerformanceTier {
  label: string;
  labelJa: string;
  color: string;
  gradient: [string, string];
  bg: string;
  border: string;
  min: number;
}

const TIERS: PerformanceTier[] = [
  { label: "Excellent", labelJa: "優秀", color: "#10B981", gradient: ["#059669", "#34D399"], bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", min: 80 },
  { label: "Strong", labelJa: "強い", color: "#3B82F6", gradient: ["#2563EB", "#60A5FA"], bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", min: 60 },
  { label: "Moderate", labelJa: "中程度", color: "#06B6D4", gradient: ["#0891B2", "#22D3EE"], bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.25)", min: 50 },
  { label: "Fair", labelJa: "やや低い", color: "#F59E0B", gradient: ["#D97706", "#FCD34D"], bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", min: 40 },
  { label: "Low", labelJa: "低い", color: "#F43F5E", gradient: ["#E11D48", "#FB7185"], bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.25)", min: 0 },
];

function getTier(passRate: number): PerformanceTier {
  return TIERS.find((t) => passRate >= t.min) || TIERS[TIERS.length - 1];
}

/* ── Display names for languages ── */
const DISPLAY_NAMES: Record<string, string> = {
  elixir: "Elixir",
  kotlin: "Kotlin",
  csharp: "C#",
  ruby: "Ruby",
  julia: "Julia",
  dart: "Dart",
  r: "R",
  typescript_effect: "TS Effect",
  java: "Java",
  racket: "Racket",
  scala: "Scala",
  shell: "Shell",
  cpp: "C++",
  typescript: "TypeScript",
  perl: "Perl",
  python: "Python",
  swift: "Swift",
  go: "Go",
  javascript: "JavaScript",
  rust: "Rust",
  php: "PHP",
};

function displayName(lang: string): string {
  return DISPLAY_NAMES[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

/* ── Rank badge colors (gold / silver / bronze) ── */
const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32", "#7BAAFF", "#7BE4D4"];

const content = {
  en: {
    backLabel: "Back to Dashboard",
    badge: "Languages",
    title: "AutoCodeBench language rankings",
    subtitle:
      "Language-level pass rates from AutoCodeBench. We re-ran the benchmark with GPT-5.4 to update the original paper's results, which only covered models up to mid-2025.",
    overallLabel: "Overall ACB-Full",
    topLabel: "Best current picks",
    scopeLabel: "Languages tracked",
    scopeValue: "21 languages",
    topSection: "Top performing languages",
    topSectionBody:
      "The strongest coding languages in AutoCodeBench — rankings are broadly consistent with the original paper.",
    findingsTitle: "Key findings",
    findings: [
      "Elixir leads at 87.4% — 11 points ahead of #2 Kotlin, confirming its top position from the original paper.",
      "Top 5 languages (Elixir, Kotlin, C#, Ruby, Julia) all exceed 57%, consistent across both runs.",
      "Mainstream languages (Python, JS, Go) cluster around 42–49%, matching the paper's relative ordering.",
      "Overall pass rate (53.3%) is within 1 point of the original Opus 4 result (52.4%), suggesting the benchmark difficulty is well-calibrated.",
    ],
    methodology:
      "Re-run date: March 11, 2026. Benchmark: AutoCodeBench fork (arxiv.org/abs/2508.09101). Model: GPT-5.4 Medium.",
    chartTitle: "Pass rate by language",
    chartSub: "Sorted by benchmark pass rate — higher is better. Color indicates performance tier.",
    avgLabel: "AVG",
    passRate: "Pass Rate",
    compTitle: "Comparison with original paper",
    compSub: "Side-by-side: Claude Opus 4 from the original paper vs our GPT-5.4 re-run. Rankings are largely stable.",
    compSource: "Opus 4 source: AutoCodeBench paper (arxiv.org/abs/2508.09101), Table 4, Reasoning Mode.",
    colLang: "Language",
    colOpus4: "Opus 4",
    colGpt54: "GPT-5.4 M",
    colDelta: "Delta",
    colPassed: "passed",
  },
  ja: {
    backLabel: "ダッシュボードに戻る",
    badge: "言語",
    title: "AutoCodeBench 言語別ランキング",
    subtitle:
      "AutoCodeBench の言語別パス率。原論文が2025年半ばまでのモデルしかカバーしていなかったため、GPT-5.4 で再実行しました。",
    overallLabel: "ACB-Full 全体",
    topLabel: "今の有力候補",
    scopeLabel: "対象言語数",
    scopeValue: "21言語",
    topSection: "トップパフォーマンス言語",
    topSectionBody:
      "AutoCodeBench で最も強いコーディング言語。ランキングは原論文とほぼ一致しています。",
    findingsTitle: "主な発見",
    findings: [
      "Elixir が 87.4% で首位 — 原論文でもトップであり、その優位性を再確認。",
      "上位5言語（Elixir、Kotlin、C#、Ruby、Julia）はすべて合格率57%以上。両実行で安定。",
      "主要言語（Python、JS、Go）は42–49%に集中し、原論文の相対順位と一致。",
      "全体パス率（53.3%）は原論文の Opus 4 結果（52.4%）と1ポイント以内。ベンチマーク難易度が適切に調整されていることを示唆。",
    ],
    methodology:
      "再実行日: 2026-03-11。ベンチマーク: AutoCodeBench fork（arxiv.org/abs/2508.09101）。モデル: GPT-5.4 Medium。",
    chartTitle: "言語別パス率",
    chartSub: "ベンチマーク合格率順 — 高いほど良い。色はパフォーマンス区分を示します。",
    avgLabel: "平均",
    passRate: "合格率",
    compTitle: "原論文との比較",
    compSub: "原論文の Claude Opus 4 と GPT-5.4 再実行の並列比較。ランキングはほぼ安定。",
    compSource: "Opus 4 出典: AutoCodeBench 論文（arxiv.org/abs/2508.09101）Table 4, Reasoning Mode。",
    colLang: "言語",
    colOpus4: "Opus 4",
    colGpt54: "GPT-5.4 M",
    colDelta: "差分",
    colPassed: "通過",
  },
} as const;

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

function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("aid-reduce-motion");
    if (stored !== null) {
      setReduced(stored === "true");
    } else {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);
  return reduced;
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

/* ── Custom Tooltip ── */
function BarTooltipContent({ active, payload, lang }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  if (!d) return null;
  const tier = getTier(d.passRate);
  const isJa = lang === "ja";
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{
        background: "rgba(10,10,18,0.96)",
        border: `1px solid ${tier.color}44`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${tier.color}15`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-white font-bold text-[15px]">{d.displayName}</span>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] font-bold"
          style={{ background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color }}
        >
          {isJa ? tier.labelJa : tier.label}
        </span>
      </div>
      <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
        {d.passed}/{d.total} {isJa ? "通過" : "passed"}
      </div>
      <div className="text-white font-black text-[22px] mt-1">
        {d.passRate.toFixed(1)}%
      </div>
      {d.basis !== "FULL" && (
        <div className="text-[10px] mt-1 italic" style={{ color: "rgba(255,255,255,0.35)" }}>
          {d.note}
        </div>
      )}
    </div>
  );
}

/* ── Custom Bar Label ── */
function BarLabel(props: any) {
  const { x, y, width, height, value } = props;
  if (width < 50) return null;
  return (
    <text
      x={x + width - 8}
      y={y + height / 2}
      textAnchor="end"
      dominantBaseline="central"
      fill="rgba(255,255,255,0.9)"
      fontSize={11}
      fontWeight={700}
      fontFamily={MONO}
    >
      {value.toFixed(1)}%
    </text>
  );
}

export default function LanguagesPage() {
  const [lang, setLang] = useLang("ja");
  const isJa = lang === "ja";
  const l = content[lang];
  const reduceMotion = useReduceMotion();
  const heroGlow = useInView("200px");
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const rows = getFilteredLanguageRows();
  const topRows = getTopLanguageRows();
  const compRows = getComparisonRows();

  const fontBody = isJa ? JA_SANS : SANS;

  /* ── Bar chart data (strongest at top) ── */
  const barData = rows.map((row) => ({
    ...row,
    displayName: displayName(row.language),
  }));

  const avgPassRate = gpt54MediumLanguageBenchmarks.overall.passRate;

  return (
    <div className={`max-w-[1080px] mx-auto relative isolate px-4 sm:px-6 pb-16${!reduceMotion ? " hdr-active" : ""}`}>
      {/* ── Mesh gradient background ── */}
      <div
        ref={heroGlow.ref}
        className="absolute inset-x-0 -top-8 h-[620px] -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 72% 52% at 28% 14%, rgba(51,112,254,0.11) 0%, transparent 70%), radial-gradient(ellipse 54% 42% at 74% 8%, rgba(224,36,122,0.09) 0%, transparent 60%), radial-gradient(ellipse 46% 38% at 58% 28%, rgba(138,60,184,0.08) 0%, transparent 62%)",
          maskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
        }}
      >
        {!reduceMotion && heroGlow.inView && (
          <MeshGradient
            colors={["#3370FE", "#8A3CB8", "#E0247A", "#FF0413"]}
            speed={0.17}
            distortion={0.56}
            swirl={0.13}
            grainOverlay={0.06}
            style={{
              width: "100%",
              height: "100%",
              opacity: 0.18,
              maskImage: "linear-gradient(to bottom, black 18%, transparent 88%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 18%, transparent 88%)",
            }}
          />
        )}
      </div>

      {/* ── Nav bar ── */}
      <div className="flex items-center justify-between mb-10 gap-4 pt-2">
        <a
          href={base}
          className="flex items-center gap-3 no-underline group"
          style={{ color: "#5C8DFE" }}
        >
          <AidLogo className="h-7 w-auto opacity-70 group-hover:opacity-100 transition-opacity" />
          <span className="flex items-center gap-1.5 text-xs transition-colors" style={{ fontFamily: isJa ? JA_SANS : MONO, letterSpacing: isJa ? 0.5 : 1 }}>
            <ArrowLeft className="w-3 h-3" />
            {l.backLabel}
          </span>
        </a>

        <div
          className="flex items-center gap-0.5 rounded-lg p-[3px] border"
          style={{
            background: "rgba(51,112,254,0.06)",
            borderColor: "rgba(51,112,254,0.12)",
          }}
        >
          {(
            [
              { code: "en" as Lang, label: "EN" },
              { code: "ja" as Lang, label: "日本語" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.code}
              onClick={() => {
                setLang(opt.code);
                if (!reduceMotion) sfxLang();
              }}
              className="px-3.5 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
              style={{
                fontFamily: opt.code === "ja" ? JA_SANS : SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: opt.code === "ja" ? 0 : 1,
                background:
                  lang === opt.code
                    ? "linear-gradient(135deg, rgba(51,112,254,0.2), rgba(255,4,19,0.15))"
                    : "transparent",
                color: lang === opt.code ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          HERO CARD
         ═══════════════════════════════════════════════════════════ */}
      <div
        className="rounded-[28px] p-6 sm:p-8 border relative overflow-hidden mb-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(51,112,254,0.09) 0%, rgba(138,60,184,0.08) 52%, rgba(255,4,19,0.08) 100%)",
          borderColor: "rgba(92,141,254,0.18)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Languages className="w-4 h-4" style={{ color: "#7BAAFF" }} />
          <span
            className="text-[11px] uppercase tracking-[0.28em]"
            style={{ color: "#7BAAFF", fontFamily: MONO }}
          >
            {l.badge}
          </span>
        </div>
        <h1
          className="text-[34px] sm:text-[54px] leading-[0.94] font-black m-0 mb-3"
          style={{
            letterSpacing: isJa ? 0 : -1.6,
            fontFamily: isJa ? JA_SANS : SANS,
            background: "linear-gradient(135deg, #79E7FF 0%, #7BAAFF 36%, #C67CFF 68%, #FF7CA8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {l.title}
        </h1>
        <p
          className="text-sm sm:text-base max-w-[720px] m-0 mb-5 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.72)", fontFamily: fontBody }}
        >
          {l.subtitle}
        </p>

        {/* KPI cards */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: l.overallLabel,
              value: `${gpt54MediumLanguageBenchmarks.overall.passRate.toFixed(1)}%`,
              sub: `${gpt54MediumLanguageBenchmarks.overall.passed} / ${gpt54MediumLanguageBenchmarks.overall.total}`,
              color: "#7BE4D4",
              glow: "rgba(123,228,212,0.08)",
            },
            {
              label: l.topLabel,
              value: topRows.slice(0, 3).map((r) => displayName(r.language)).join(", "),
              sub: `${topRows[0]?.passRate.toFixed(1)}% — ${topRows[2]?.passRate.toFixed(1)}%`,
              color: "#7BAAFF",
              glow: "rgba(123,170,255,0.08)",
              small: true,
            },
            {
              label: l.scopeLabel,
              value: l.scopeValue,
              sub: gpt54MediumLanguageBenchmarks.snapshotDate,
              color: "#C4B5FD",
              glow: "rgba(196,181,253,0.08)",
              small: true,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl px-4 py-4 border transition-all duration-300 hover:border-[rgba(255,255,255,0.14)]"
              style={{
                background: `linear-gradient(135deg, ${card.glow}, rgba(8,18,26,0.3))`,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="text-[11px] uppercase tracking-[0.22em] mb-1.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: MONO }}>
                {card.label}
              </div>
              <div
                className={`font-black ${card.small ? "text-[17px]" : "text-[28px]"}`}
                style={{ color: card.color, fontFamily: card.small ? fontBody : MONO }}
              >
                {card.value}
              </div>
              <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.48)" }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          KEY FINDINGS
         ═══════════════════════════════════════════════════════════ */}
      <section className="mb-8">
        <div
          className="rounded-[24px] px-5 sm:px-6 py-5 border"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.04), rgba(8,18,26,0.26))",
            borderColor: "rgba(255,215,0,0.12)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <Zap className="w-4 h-4" style={{ color: "#FFD700" }} />
            <h2 className="text-[18px] sm:text-[20px] font-bold m-0" style={{ fontFamily: fontBody }}>
              {l.findingsTitle}
            </h2>
          </div>
          <div className="space-y-3">
            {l.findings.map((finding, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ background: TIERS[Math.min(i, TIERS.length - 1)].color }}
                />
                <span className="text-[13px] sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)", fontFamily: fontBody }}>
                  {finding}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TOP LANGUAGES — CARDS WITH RANK BADGES
         ═══════════════════════════════════════════════════════════ */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-4 h-4" style={{ color: "#FFD700" }} />
          <h2 className="text-[22px] sm:text-[26px] font-black m-0" style={{ fontFamily: fontBody }}>
            {l.topSection}
          </h2>
        </div>
        <p className="text-sm sm:text-base mt-0 mb-5 max-w-[720px]" style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}>
          {l.topSectionBody}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {topRows.map((row, i) => {
            const tier = getTier(row.passRate);
            const rankColor = RANK_COLORS[i] || "#7BAAFF";
            return (
              <div
                key={row.language}
                className="rounded-2xl px-4 py-4 border relative overflow-hidden group transition-all duration-300"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(8,18,26,0.18))",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${rankColor}44`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 12px 40px ${rankColor}11`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Rank badge */}
                <div
                  className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black"
                  style={{
                    background: `${rankColor}18`,
                    border: `1.5px solid ${rankColor}44`,
                    color: rankColor,
                    fontFamily: MONO,
                  }}
                >
                  {i + 1}
                </div>

                {/* Language name */}
                <div className="text-[20px] font-black mb-0.5" style={{ fontFamily: MONO }}>
                  {displayName(row.language)}
                </div>
                <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {row.passed}/{row.total}
                </div>

                {/* Mini progress bar — tier colored */}
                <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.passRate}%`,
                      background: `linear-gradient(90deg, ${tier.gradient[0]}, ${tier.gradient[1]})`,
                      boxShadow: `0 0 12px ${tier.color}33`,
                    }}
                  />
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="text-[30px] font-black leading-none" style={{ color: "#fff" }}>
                    {row.passRate.toFixed(1)}
                    <span className="text-[14px] ml-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>%</span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color }}
                  >
                    {isJa ? tier.labelJa : tier.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FULL HORIZONTAL BAR CHART — PERFORMANCE TIER COLORED
         ═══════════════════════════════════════════════════════════ */}
      <section
        className="rounded-[28px] px-3 sm:px-6 py-5 sm:py-6 border mb-8"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(8,18,26,0.26))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3 mb-1 px-1">
          <TrendingUp className="w-4 h-4" style={{ color: "#7BE4D4" }} />
          <h2 className="text-[22px] sm:text-[26px] font-black m-0" style={{ fontFamily: fontBody }}>
            {l.chartTitle}
          </h2>
        </div>
        <p className="text-sm mt-0 mb-4 max-w-[760px] px-1" style={{ color: "rgba(255,255,255,0.48)", fontFamily: fontBody }}>
          {l.chartSub}
        </p>

        <ResponsiveContainer width="100%" height={Math.max(480, rows.length * 38 + 60)}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
            barCategoryGap="18%"
          >
            <CartesianGrid
              horizontal={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3 3"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: MONO }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              width={110}
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, fontFamily: MONO }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<BarTooltipContent lang={lang} />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />

            {/* Tier boundary reference lines */}
            <ReferenceLine x={80} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.25} />
            <ReferenceLine x={60} stroke="#3B82F6" strokeDasharray="4 4" strokeOpacity={0.25} />
            <ReferenceLine x={50} stroke="#06B6D4" strokeDasharray="4 4" strokeOpacity={0.2} />
            <ReferenceLine x={40} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.2} />

            {/* Average reference line */}
            <ReferenceLine
              x={avgPassRate}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={1.5}
              strokeDasharray="8 4"
              label={{
                value: `${l.avgLabel} ${avgPassRate}%`,
                position: "insideTopLeft",
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            <defs>
              <linearGradient id="barExcellent" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="barStrong" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="barModerate" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0891B2" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
              <linearGradient id="barFair" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#FCD34D" />
              </linearGradient>
              <linearGradient id="barLow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#FB7185" />
              </linearGradient>
            </defs>
            <Bar
              dataKey="passRate"
              radius={[0, 6, 6, 0]}
              isAnimationActive={!reduceMotion}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {barData.map((entry) => {
                const tier = getTier(entry.passRate);
                const gradId = `url(#bar${tier.label})`;
                return <Cell key={entry.language} fill={gradId} />;
              })}
              <LabelList content={<BarLabel />} dataKey="passRate" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Tier legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 px-1">
          {TIERS.map((tier) => {
            const count = rows.filter((r) => getTier(r.passRate) === tier).length;
            if (count === 0) return null;
            return (
              <span key={tier.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{ background: `linear-gradient(135deg, ${tier.gradient[0]}, ${tier.gradient[1]})` }}
                />
                <span style={{ color: tier.color, fontWeight: 700 }}>
                  {isJa ? tier.labelJa : tier.label}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>
                  ({tier.min > 0 ? `≥${tier.min}%` : `<40%`})
                </span>
                <span style={{ color: "rgba(255,255,255,0.25)" }}>
                  ×{count}
                </span>
              </span>
            );
          })}
          <span className="flex items-center gap-1.5 text-[11px] ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span className="w-4 border-t-[1.5px] border-dashed" style={{ borderColor: "rgba(255,255,255,0.4)" }} />
            {l.avgLabel}
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MODEL COMPARISON TABLE
         ═══════════════════════════════════════════════════════════ */}
      <section
        className="rounded-[28px] px-3 sm:px-6 py-5 sm:py-6 border mb-8"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(8,18,26,0.26))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3 mb-1 px-1">
          <GitCompare className="w-4 h-4" style={{ color: "#C4B5FD" }} />
          <h2 className="text-[22px] sm:text-[26px] font-black m-0" style={{ fontFamily: fontBody }}>
            {l.compTitle}
          </h2>
        </div>
        <p className="text-sm mt-0 mb-4 max-w-[760px] px-1" style={{ color: "rgba(255,255,255,0.48)", fontFamily: fontBody }}>
          {l.compSub}
        </p>

        <div className="overflow-x-auto -mx-3 sm:-mx-6 px-3 sm:px-6">
          <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th
                  className="text-left py-2.5 px-3 sticky left-0 z-10"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 1.2,
                    color: "rgba(255,255,255,0.4)",
                    background: "rgba(8,12,20,0.95)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {l.colLang}
                </th>
                <th
                  className="text-right py-2.5 px-3"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 1.2,
                    color: "#C4B5FD",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {l.colOpus4}
                </th>
                <th
                  className="text-right py-2.5 px-3"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 1.2,
                    color: "#7BAAFF",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {l.colGpt54}
                </th>
                <th
                  className="text-right py-2.5 px-3"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 1.2,
                    color: "rgba(255,255,255,0.4)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {l.colDelta}
                </th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((row, i) => {
                const delta = row.delta;
                const deltaColor =
                  delta === null
                    ? "rgba(255,255,255,0.25)"
                    : delta > 0
                      ? "#10B981"
                      : delta < 0
                        ? "#F43F5E"
                        : "rgba(255,255,255,0.35)";
                const isTop3 = i < 3;
                return (
                  <tr
                    key={row.language}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: isTop3 ? "rgba(255,215,0,0.03)" : "transparent",
                    }}
                  >
                    <td
                      className="py-2 px-3 font-bold sticky left-0 z-10"
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        color: isTop3 ? "#fff" : "rgba(255,255,255,0.7)",
                        background: isTop3 ? "rgba(14,18,28,0.97)" : "rgba(8,12,20,0.95)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {displayName(row.language)}
                    </td>
                    <td
                      className="py-2 px-3 text-right"
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        color: row.opus4 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {row.opus4 ? (
                        <>
                          <span className="font-bold">{row.opus4.passRate.toFixed(1)}%</span>
                          <span className="hidden sm:inline text-[10px] ml-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {row.opus4.passed}/{row.opus4.total}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="py-2 px-3 text-right"
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        color: row.gpt54 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {row.gpt54 ? (
                        <>
                          <span className="font-bold">{row.gpt54.passRate.toFixed(1)}%</span>
                          <span className="hidden sm:inline text-[10px] ml-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {row.gpt54.passed}/{row.gpt54.total}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className="py-2 px-3 text-right font-bold"
                      style={{
                        fontFamily: MONO,
                        fontSize: 13,
                        color: deltaColor,
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {delta !== null ? (
                        `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* Overall row */}
              <tr
                style={{
                  borderTop: "2px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <td
                  className="py-2.5 px-3 font-black sticky left-0 z-10"
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "#fff",
                    background: "rgba(14,18,28,0.97)",
                  }}
                >
                  {l.overallLabel}
                </td>
                <td
                  className="py-2.5 px-3 text-right font-black"
                  style={{ fontFamily: MONO, fontSize: 13, color: "#C4B5FD" }}
                >
                  {opus4LanguageBenchmarks.overall.passRate.toFixed(1)}%
                  <span className="hidden sm:inline text-[10px] ml-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {opus4LanguageBenchmarks.overall.passed}/{opus4LanguageBenchmarks.overall.total}
                  </span>
                </td>
                <td
                  className="py-2.5 px-3 text-right font-black"
                  style={{ fontFamily: MONO, fontSize: 13, color: "#7BAAFF" }}
                >
                  {gpt54MediumLanguageBenchmarks.overall.passRate.toFixed(1)}%
                  <span className="hidden sm:inline text-[10px] ml-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {gpt54MediumLanguageBenchmarks.overall.passed}/{gpt54MediumLanguageBenchmarks.overall.total}
                  </span>
                </td>
                <td
                  className="py-2.5 px-3 text-right font-black"
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color:
                      gpt54MediumLanguageBenchmarks.overall.passRate > opus4LanguageBenchmarks.overall.passRate
                        ? "#10B981"
                        : "#F43F5E",
                  }}
                >
                  {(gpt54MediumLanguageBenchmarks.overall.passRate - opus4LanguageBenchmarks.overall.passRate) > 0 ? "+" : ""}
                  {(gpt54MediumLanguageBenchmarks.overall.passRate - opus4LanguageBenchmarks.overall.passRate).toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 px-1 text-[11px]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: fontBody }}>
          {l.compSource}
        </div>
      </section>

      {/* ── Footer ── */}
      <div
        className="text-center text-xs mt-10"
        style={{ color: "rgba(255,255,255,0.35)", fontFamily: isJa ? JA_SANS : MONO }}
      >
        {l.methodology}
      </div>
    </div>
  );
}
