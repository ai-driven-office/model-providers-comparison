import { useMemo, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Brain,
  Code,
  Eye,
  Microscope,
  Palette,
  Crown,
  TrendingUp,
  Zap,
  Info,
} from "lucide-react";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import { formatPrice, type Lang } from "../../data/i18n";

/* ─── Typography tokens ─── */
const SANS = "'Inter', system-ui, sans-serif";
const MONO = "'Space Mono', monospace";
const JP = "'Zen Kaku Gothic New', sans-serif";

/* ─── Ability keys ─── */
const ABILITY_KEYS = [
  "planning",
  "coding",
  "image",
  "research",
  "creative",
] as const;
type AbilityKey = (typeof ABILITY_KEYS)[number];

const ABILITY_LABELS: Record<string, Record<AbilityKey, string>> = {
  en: {
    planning: "Planning",
    coding: "Coding",
    image: "Vision",
    research: "Research",
    creative: "Creative",
  },
  ja: {
    planning: "計画力",
    coding: "コーディング",
    image: "画像理解",
    research: "リサーチ",
    creative: "創造性",
  },
};

/* ─── Category visual identity ─── */
const CATEGORY: Record<
  AbilityKey,
  {
    icon: ReactNode;
    color: string;
    gradient: string;
    bgGradient: string;
  }
> = {
  planning: {
    icon: <Brain className="w-4 h-4" />,
    color: "#A78BFA",
    gradient: "linear-gradient(135deg, #A78BFA, #7C3AED)",
    bgGradient:
      "linear-gradient(135deg, rgba(167,139,250,0.08) 0%, rgba(124,58,237,0.02) 100%)",
  },
  coding: {
    icon: <Code className="w-4 h-4" />,
    color: "#22D3EE",
    gradient: "linear-gradient(135deg, #22D3EE, #0891B2)",
    bgGradient:
      "linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(8,145,178,0.02) 100%)",
  },
  image: {
    icon: <Eye className="w-4 h-4" />,
    color: "#FBBF24",
    gradient: "linear-gradient(135deg, #FBBF24, #D97706)",
    bgGradient:
      "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(217,119,6,0.02) 100%)",
  },
  research: {
    icon: <Microscope className="w-4 h-4" />,
    color: "#2DD4BF",
    gradient: "linear-gradient(135deg, #2DD4BF, #0D9488)",
    bgGradient:
      "linear-gradient(135deg, rgba(45,212,191,0.08) 0%, rgba(13,148,136,0.02) 100%)",
  },
  creative: {
    icon: <Palette className="w-4 h-4" />,
    color: "#F472B6",
    gradient: "linear-gradient(135deg, #F472B6, #DB2777)",
    bgGradient:
      "linear-gradient(135deg, rgba(244,114,182,0.08) 0%, rgba(219,39,119,0.02) 100%)",
  },
};

/* ─── Dimension styling ─── */
const DIMENSIONS = {
  absolute: {
    color: "#FFD700",
    icon: <Crown className="w-3 h-3" />,
    label: "absolute",
  },
  value: {
    color: "#38BDF8",
    icon: <TrendingUp className="w-3 h-3" />,
    label: "value",
  },
  speed: {
    color: "#34D399",
    icon: <Zap className="w-3 h-3" />,
    label: "speed",
  },
} as const;

/* ─── Data types ─── */
interface Winner {
  model: Model;
  score: number;
  metric: number;
}
interface TopTwo {
  first: Winner;
  second: Winner | null;
}

function findTopTwo(
  models: Model[],
  key: AbilityKey,
  metric: (m: Model) => number,
): TopTwo | null {
  const eligible = models.filter((m) => m.tag !== "fast");
  if (!eligible.length) return null;
  const sorted = [...eligible]
    .map((m) => ({ model: m, score: m.abilities[key], metric: metric(m) }))
    .sort((a, b) => b.metric - a.metric);
  return {
    first: sorted[0],
    second: sorted.length > 1 ? sorted[1] : null,
  };
}

/* ─── Props ─── */
interface Props {
  data: Model[];
  lang: Lang;
  colorMap: ColorMap;
  reduceMotion?: boolean;
  labels: {
    resultsTitle: string;
    resultsSub: string;
    resultsDisclaimer: string;
    bestAbsolute: string;
    bestValue: string;
    bestSpeed: string;
  };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  WinnerCard — glass morphism card with large score, bar, and runner-up
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function WinnerCard({
  dimKey,
  dimLabel,
  topTwo,
  subtitle1,
  subtitle2,
  colorMap,
  delay,
  reduceMotion,
}: {
  dimKey: keyof typeof DIMENSIONS;
  dimLabel: string;
  topTwo: TopTwo;
  subtitle1: string;
  subtitle2: string;
  colorMap: ColorMap;
  delay: number;
  reduceMotion?: boolean;
}) {
  const dim = DIMENSIONS[dimKey];
  const { first, second } = topTwo;
  const provColor = getColor(first.model.provider, colorMap);
  const barPct = Math.max(0, ((first.score - 50) / 50) * 100);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Dimension label badge — top-left */}
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span style={{ color: dim.color }}>{dim.icon}</span>
          <span
            className="text-[9px] font-bold tracking-[0.15em] uppercase"
            style={{ color: dim.color, fontFamily: MONO }}
          >
            {dimLabel}
          </span>
        </div>

        {/* Main content */}
        <div className="px-3 pb-3">
          {/* Large score number — editorial treatment */}
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="leading-none font-black"
              style={{
                fontSize: 32,
                fontFamily: MONO,
                background: `linear-gradient(180deg, ${dim.color} 0%, ${dim.color}88 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {first.score}
            </span>
            <span
              className="text-[10px] font-medium"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO }}
            >
              /100
            </span>
          </div>

          {/* Score bar with animation */}
          <div
            className="h-[3px] rounded-full mb-2.5 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className={`h-full rounded-full${reduceMotion ? "" : " animate-bar-fill"}`}
              style={{
                width: `${barPct}%`,
                background: `linear-gradient(90deg, ${dim.color}, ${dim.color}88)`,
                ...(reduceMotion
                  ? {}
                  : { animationDelay: `${delay + 0.3}s`, animationFillMode: "both" }),
              }}
            />
          </div>

          {/* Winner name + provider */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <div
              className="w-[5px] h-[5px] rounded-full shrink-0"
              style={{
                background: provColor,
                boxShadow: `0 0 6px ${provColor}66`,
              }}
            />
            <span
              className="text-[12px] font-bold truncate"
              style={{ color: "#e5e5e5", fontFamily: SANS }}
            >
              {first.model.name}
            </span>
          </div>

          {/* Metric subtitle */}
          <div
            className="text-[9px] mb-2"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO, mixBlendMode: "plus-lighter" }}
          >
            {subtitle1}
          </div>

          {/* Runner-up — compressed, dimmed */}
          {second && (
            <div
              className="pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1 h-1 rounded-full shrink-0 opacity-50"
                  style={{
                    background: getColor(second.model.provider, colorMap),
                  }}
                />
                <span
                  className="text-[10px] truncate"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: SANS, mixBlendMode: "plus-lighter" }}
                >
                  {second.model.name}
                </span>
                <span
                  className="text-[10px] shrink-0 font-semibold"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO, mixBlendMode: "plus-lighter" }}
                >
                  {second.score}
                </span>
              </div>
              <div
                className="text-[8px] ml-[10px]"
                style={{ color: "rgba(255,255,255,0.2)", fontFamily: MONO, mixBlendMode: "plus-lighter" }}
              >
                {subtitle2}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  CategoryRow — one ability, three winner cards
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CategoryRow({
  abilityKey,
  label,
  absolute,
  value,
  speed,
  colorMap,
  lang,
  rowIndex,
  labels,
  reduceMotion,
}: {
  abilityKey: AbilityKey;
  label: string;
  absolute: TopTwo | null;
  value: TopTwo | null;
  speed: TopTwo | null;
  colorMap: ColorMap;
  lang: Lang;
  rowIndex: number;
  labels: Props["labels"];
  reduceMotion?: boolean;
}) {
  const cat = CATEGORY[abilityKey];
  const baseDelay = rowIndex * 0.12;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.4, delay: baseDelay }}
    >
      {/* Category section — icon + label as a left-aligned badge */}
      <div className="flex items-center gap-2 mb-3 ml-1">
        <div
          className="flex items-center justify-center w-6 h-6 rounded-md"
          style={{
            background: cat.gradient,
            boxShadow: `0 2px 12px ${cat.color}33`,
          }}
        >
          <span className="text-white/90">{cat.icon}</span>
        </div>
        <span
          className="text-[12px] font-bold tracking-wide"
          style={{ color: cat.color, fontFamily: SANS }}
        >
          {label}
        </span>
        {/* Fading line extending to the right */}
        <div
          className="flex-1 h-px ml-2"
          style={{
            background: `linear-gradient(90deg, ${cat.color}30 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* Three winner cards in a grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {absolute && (
          <WinnerCard
            dimKey="absolute"
            dimLabel={labels.bestAbsolute}
            topTwo={absolute}
            subtitle1={`${absolute.first.score}/100`}
            subtitle2={
              absolute.second ? `${absolute.second.score}/100` : ""
            }
            colorMap={colorMap}
            delay={baseDelay + 0.05}
            reduceMotion={reduceMotion}
          />
        )}
        {value && (
          <WinnerCard
            dimKey="value"
            dimLabel={labels.bestValue}
            topTwo={value}
            subtitle1={`${value.first.score} pts / ${formatPrice(value.first.model.output, lang)}`}
            subtitle2={
              value.second
                ? `${value.second.score} / ${formatPrice(value.second.model.output, lang)}`
                : ""
            }
            colorMap={colorMap}
            delay={baseDelay + 0.1}
            reduceMotion={reduceMotion}
          />
        )}
        {speed && (
          <WinnerCard
            dimKey="speed"
            dimLabel={labels.bestSpeed}
            topTwo={speed}
            subtitle1={`${speed.first.score} × ${speed.first.model.tps.toLocaleString()} tps`}
            subtitle2={
              speed.second
                ? `${speed.second.score} × ${speed.second.model.tps.toLocaleString()}`
                : ""
            }
            colorMap={colorMap}
            delay={baseDelay + 0.15}
            reduceMotion={reduceMotion}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  ResultsPanel — main export
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ResultsPanel({ data, lang, colorMap, labels, reduceMotion }: Props) {
  const abilityLabels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;
  const isJa = lang === "ja";

  const results = useMemo(() => {
    return ABILITY_KEYS.map((key) => ({
      key,
      absolute: findTopTwo(data, key, (m) => m.abilities[key]),
      value: findTopTwo(data, key, (m) =>
        m.output != null && m.output > 0 ? m.abilities[key] / m.output : 0,
      ),
      speed: findTopTwo(data, key, (m) => m.abilities[key] * m.tps),
    }));
  }, [data]);

  return (
    <div className="relative px-4 sm:px-6 pb-6">
      {/* Film grain overlay */}
      {!reduceMotion && (
        <div className="grain absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" />
      )}

      {/* Dimension legend — top-right compact strip */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-end gap-4 mb-5"
      >
        {(
          [
            { key: "absolute" as const, label: labels.bestAbsolute },
            { key: "value" as const, label: labels.bestValue },
            { key: "speed" as const, label: labels.bestSpeed },
          ] as const
        ).map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span style={{ color: DIMENSIONS[key].color }}>
              {DIMENSIONS[key].icon}
            </span>
            <span
              className="text-[9px] font-bold tracking-wider uppercase"
              style={{
                color: DIMENSIONS[key].color,
                fontFamily: MONO,
                opacity: 0.7,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Category rows */}
      <div className="space-y-5">
        {results.map(({ key, absolute, value, speed }, i) => (
          <CategoryRow
            key={key}
            abilityKey={key}
            label={abilityLabels[key]}
            absolute={absolute}
            value={value}
            speed={speed}
            colorMap={colorMap}
            lang={lang}
            rowIndex={i}
            labels={labels}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      {/* Disclaimer — editorial footnote style */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.8 }}
        className="mt-6 flex items-start gap-2 px-1"
      >
        <Info
          className="w-3 h-3 shrink-0 mt-[2px]"
          style={{ color: "rgba(255,255,255,0.15)" }}
        />
        <p
          className="text-[9px] leading-relaxed m-0"
          style={{
            color: "rgba(255,255,255,0.2)",
            fontFamily: isJa ? JP : SANS,
            maxWidth: 560,
          }}
        >
          {labels.resultsDisclaimer}
        </p>
      </motion.div>
    </div>
  );
}
