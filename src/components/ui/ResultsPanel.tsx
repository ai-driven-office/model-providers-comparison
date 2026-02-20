import { useMemo } from "react";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import { formatPrice, type Lang } from "../../data/i18n";

const SANS = "'DM Sans', sans-serif";
const MONO = "'Space Mono', monospace";

const ABILITY_KEYS = ["planning", "coding", "image", "research", "creative"] as const;
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

const ABILITY_EMOJI: Record<AbilityKey, string> = {
  planning: "🧠",
  coding: "💻",
  image: "👁",
  research: "🔬",
  creative: "🎨",
};

interface Winner {
  model: Model;
  score: number;
  metric: number; // the computed metric (raw score, score/$, score×tps)
}

function findWinner(
  models: Model[],
  key: AbilityKey,
  metric: (m: Model) => number,
): Winner | null {
  const eligible = models.filter((m) => m.tag !== "fast");
  if (!eligible.length) return null;
  let best = eligible[0];
  let bestVal = metric(best);
  for (const m of eligible) {
    const val = metric(m);
    if (val > bestVal) {
      best = m;
      bestVal = val;
    }
  }
  return { model: best, score: best.abilities[key], metric: bestVal };
}

interface Props {
  data: Model[];
  lang: Lang;
  colorMap: ColorMap;
  labels: {
    resultsTitle: string;
    resultsSub: string;
    bestAbsolute: string;
    bestValue: string;
    bestSpeed: string;
  };
}

function WinnerBadge({
  icon,
  label,
  winner,
  subtitle,
  accentColor,
  colorMap,
}: {
  icon: string;
  label: string;
  winner: Winner;
  subtitle: string;
  accentColor: string;
  colorMap: ColorMap;
}) {
  const providerColor = getColor(winner.model.provider, colorMap);
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="text-sm leading-none mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div
          className="text-[10px] mb-0.5"
          style={{ color: accentColor, fontFamily: MONO, letterSpacing: 1 }}
        >
          {label}
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: providerColor }}
          />
          <span
            className="text-[13px] font-bold truncate"
            style={{ color: "#e5e5e5" }}
          >
            {winner.model.name}
          </span>
          <span
            className="text-[12px] font-bold shrink-0"
            style={{ color: accentColor, fontFamily: MONO }}
          >
            {winner.score}
          </span>
        </div>
        <div
          className="text-[10px] mt-0.5"
          style={{ color: "#555", fontFamily: MONO }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPanel({ data, lang, colorMap, labels }: Props) {
  const abilityLabels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;

  const results = useMemo(() => {
    return ABILITY_KEYS.map((key) => {
      const absolute = findWinner(data, key, (m) => m.abilities[key]);
      const value = findWinner(
        data,
        key,
        (m) => (m.output > 0 ? m.abilities[key] / m.output : 0),
      );
      const speed = findWinner(
        data,
        key,
        (m) => m.abilities[key] * m.tps,
      );
      return { key, absolute, value, speed };
    });
  }, [data]);

  return (
    <div className="mt-7">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-lg">🏅</span>
        <h2
          className="text-base font-bold m-0 text-gray-200"
          style={{ fontFamily: SANS }}
        >
          {labels.resultsTitle}
        </h2>
      </div>
      <p
        className="text-gray-600 text-[11px] m-0 mb-4 max-w-[520px]"
        style={{ fontFamily: SANS }}
      >
        {labels.resultsSub}
      </p>

      <div className="space-y-2">
        {results.map(({ key, absolute, value, speed }) => (
          <div
            key={key}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-3.5"
          >
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">{ABILITY_EMOJI[key]}</span>
              <span
                className="text-[12px] font-bold text-gray-300"
                style={{ fontFamily: SANS }}
              >
                {abilityLabels[key]}
              </span>
            </div>

            {/* 3 winners grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {absolute && (
                <WinnerBadge
                  icon="🥇"
                  label={labels.bestAbsolute}
                  winner={absolute}
                  subtitle={`${absolute.score}/100`}
                  accentColor="#FFD700"
                  colorMap={colorMap}
                />
              )}
              {value && (
                <WinnerBadge
                  icon="💰"
                  label={labels.bestValue}
                  winner={value}
                  subtitle={`${value.score} pts / ${formatPrice(value.model.output, lang)}`}
                  accentColor="#38BDF8"
                  colorMap={colorMap}
                />
              )}
              {speed && (
                <WinnerBadge
                  icon="⚡"
                  label={labels.bestSpeed}
                  winner={speed}
                  subtitle={`${speed.score} × ${speed.model.tps.toLocaleString()} tps`}
                  accentColor="#00E5A0"
                  colorMap={colorMap}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
