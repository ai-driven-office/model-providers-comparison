import { useMemo, type ReactNode } from "react";
import {
  Brain,
  Code,
  Eye,
  Microscope,
  Palette,
  AlertTriangle,
} from "lucide-react";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import { formatPrice, type Lang } from "../../data/i18n";

const SANS = "'DM Sans', sans-serif";
const MONO = "'Space Mono', monospace";

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

/** Each category has a unique accent hue and lucide icon */
const CATEGORY_THEME: Record<
  AbilityKey,
  { icon: ReactNode; color: string; glow: string }
> = {
  planning: {
    icon: <Brain className="w-5 h-5" />,
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.12)",
  },
  coding: {
    icon: <Code className="w-5 h-5" />,
    color: "#22D3EE",
    glow: "rgba(34,211,238,0.12)",
  },
  image: {
    icon: <Eye className="w-5 h-5" />,
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.12)",
  },
  research: {
    icon: <Microscope className="w-5 h-5" />,
    color: "#2DD4BF",
    glow: "rgba(45,212,191,0.12)",
  },
  creative: {
    icon: <Palette className="w-5 h-5" />,
    color: "#F472B6",
    glow: "rgba(244,114,182,0.12)",
  },
};

/** Dimension accent colors — gold / sky / emerald */
const DIM_COLORS = {
  absolute: "#FFD700",
  value: "#38BDF8",
  speed: "#34D399",
} as const;

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

interface Props {
  data: Model[];
  lang: Lang;
  colorMap: ColorMap;
  labels: {
    resultsTitle: string;
    resultsSub: string;
    resultsDisclaimer: string;
    bestAbsolute: string;
    bestValue: string;
    bestSpeed: string;
  };
}

/* ─── Score bar: thin horizontal bar from 50–100 ─── */
function ScoreBar({
  score,
  color,
  dimmed,
}: {
  score: number;
  color: string;
  dimmed?: boolean;
}) {
  const pct = Math.max(0, ((score - 50) / 50) * 100);
  return (
    <div
      className="h-[3px] rounded-full mt-1"
      style={{ background: "rgba(255,255,255,0.04)", width: "100%" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          opacity: dimmed ? 0.3 : 0.7,
        }}
      />
    </div>
  );
}

/* ─── Single winner entry (1st or 2nd) ─── */
function PlaceEntry({
  winner,
  subtitle,
  dimColor,
  colorMap,
  rank,
}: {
  winner: Winner;
  subtitle: string;
  dimColor: string;
  colorMap: ColorMap;
  rank: 1 | 2;
}) {
  const providerColor = getColor(winner.model.provider, colorMap);
  const is2nd = rank === 2;
  return (
    <div className={is2nd ? "mt-2 opacity-50" : ""}>
      <div className="flex items-center gap-1.5">
        <div
          className="shrink-0 rounded-full"
          style={{
            width: is2nd ? 5 : 6,
            height: is2nd ? 5 : 6,
            background: providerColor,
            boxShadow: is2nd ? "none" : `0 0 8px ${providerColor}66`,
          }}
        />
        <span
          className="truncate font-semibold"
          style={{
            fontSize: is2nd ? 11 : 13,
            color: is2nd ? "#888" : "#e5e5e5",
            fontFamily: SANS,
          }}
        >
          {winner.model.name}
        </span>
        <span
          className="shrink-0 font-bold"
          style={{
            fontSize: is2nd ? 10 : 13,
            color: is2nd ? "#666" : dimColor,
            fontFamily: MONO,
          }}
        >
          {winner.score}
        </span>
      </div>
      <div
        className="mt-0.5"
        style={{ fontSize: is2nd ? 9 : 10, color: "#555", fontFamily: MONO }}
      >
        {subtitle}
      </div>
      <ScoreBar score={winner.score} color={dimColor} dimmed={is2nd} />
    </div>
  );
}

/* ─── Column for one dimension (BEST / VALUE / SPEED) ─── */
function DimensionColumn({
  label,
  topTwo,
  dimColor,
  subtitle1,
  subtitle2,
  colorMap,
}: {
  label: string;
  topTwo: TopTwo;
  dimColor: string;
  subtitle1: string;
  subtitle2: string;
  colorMap: ColorMap;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-5 h-[2px] rounded-full"
          style={{ background: dimColor }}
        />
        <span
          className="text-[9px] font-bold tracking-widest"
          style={{ color: dimColor, fontFamily: MONO }}
        >
          {label}
        </span>
      </div>

      <PlaceEntry
        winner={topTwo.first}
        subtitle={subtitle1}
        dimColor={dimColor}
        colorMap={colorMap}
        rank={1}
      />

      {topTwo.second && (
        <PlaceEntry
          winner={topTwo.second}
          subtitle={subtitle2}
          dimColor={dimColor}
          colorMap={colorMap}
          rank={2}
        />
      )}
    </div>
  );
}

/* ─── Main ResultsPanel ─── */
export default function ResultsPanel({ data, lang, colorMap, labels }: Props) {
  const abilityLabels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;

  const results = useMemo(() => {
    return ABILITY_KEYS.map((key) => {
      const absolute = findTopTwo(data, key, (m) => m.abilities[key]);
      const value = findTopTwo(data, key, (m) =>
        m.output > 0 ? m.abilities[key] / m.output : 0,
      );
      const speed = findTopTwo(data, key, (m) => m.abilities[key] * m.tps);
      return { key, absolute, value, speed };
    });
  }, [data]);

  return (
    <div className="px-6 pb-4">
      <div className="space-y-3">
        {results.map(({ key, absolute, value, speed }) => {
          const theme = CATEGORY_THEME[key];
          return (
            <div
              key={key}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(255,255,255,0.015) 60%, transparent 100%)`,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Ambient glow in corner */}
              <div
                className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                style={{ background: theme.glow }}
              />

              <div className="relative px-5 py-4">
                {/* Category header — icon + label */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{
                      background: `${theme.color}15`,
                      color: theme.color,
                      border: `1px solid ${theme.color}20`,
                    }}
                  >
                    {theme.icon}
                  </div>
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: theme.color, fontFamily: SANS }}
                  >
                    {abilityLabels[key]}
                  </span>
                </div>

                {/* 3 dimension columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {absolute && (
                    <DimensionColumn
                      label={labels.bestAbsolute}
                      topTwo={absolute}
                      dimColor={DIM_COLORS.absolute}
                      subtitle1={`${absolute.first.score}/100`}
                      subtitle2={
                        absolute.second
                          ? `${absolute.second.score}/100`
                          : ""
                      }
                      colorMap={colorMap}
                    />
                  )}
                  {value && (
                    <DimensionColumn
                      label={labels.bestValue}
                      topTwo={value}
                      dimColor={DIM_COLORS.value}
                      subtitle1={`${value.first.score} pts / ${formatPrice(value.first.model.output, lang)}`}
                      subtitle2={
                        value.second
                          ? `${value.second.score} / ${formatPrice(value.second.model.output, lang)}`
                          : ""
                      }
                      colorMap={colorMap}
                    />
                  )}
                  {speed && (
                    <DimensionColumn
                      label={labels.bestSpeed}
                      topTwo={speed}
                      dimColor={DIM_COLORS.speed}
                      subtitle1={`${speed.first.score} × ${speed.first.model.tps.toLocaleString()} tps`}
                      subtitle2={
                        speed.second
                          ? `${speed.second.score} × ${speed.second.model.tps.toLocaleString()}`
                          : ""
                      }
                      colorMap={colorMap}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer — subtle amber strip */}
      <div
        className="mt-5 px-4 py-3 rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(251,191,36,0.04) 0%, rgba(251,191,36,0.01) 100%)",
          border: "1px solid rgba(251,191,36,0.08)",
        }}
      >
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400/50 mt-0.5 shrink-0" />
          <p
            className="text-[10px] text-amber-200/50 m-0 leading-relaxed"
            style={{ fontFamily: SANS }}
          >
            {labels.resultsDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
