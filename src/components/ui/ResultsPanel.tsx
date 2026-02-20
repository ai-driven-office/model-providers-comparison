import { useMemo, type ReactNode } from "react";
import {
  Brain,
  Code,
  Eye,
  Microscope,
  Palette,
  Medal,
  DollarSign,
  Zap,
  AlertTriangle,
} from "lucide-react";
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

const ABILITY_ICON: Record<AbilityKey, ReactNode> = {
  planning: <Brain className="w-4 h-4 text-violet-400" />,
  coding: <Code className="w-4 h-4 text-cyan-400" />,
  image: <Eye className="w-4 h-4 text-amber-400" />,
  research: <Microscope className="w-4 h-4 text-teal-400" />,
  creative: <Palette className="w-4 h-4 text-pink-400" />,
};

interface Winner {
  model: Model;
  score: number;
  metric: number; // the computed metric (raw score, score/$, score×tps)
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

  // Sort descending by metric
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

function WinnerBadge({
  icon,
  label,
  winner,
  runnerUp,
  subtitle,
  runnerUpSubtitle,
  accentColor,
  colorMap,
}: {
  icon: ReactNode;
  label: string;
  winner: Winner;
  runnerUp: Winner | null;
  subtitle: string;
  runnerUpSubtitle: string;
  accentColor: string;
  colorMap: ColorMap;
}) {
  const providerColor = getColor(winner.model.provider, colorMap);
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="leading-none mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div
          className="text-[10px] mb-0.5"
          style={{ color: accentColor, fontFamily: MONO, letterSpacing: 1 }}
        >
          {label}
        </div>
        {/* 1st place */}
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
        {/* 2nd place */}
        {runnerUp && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div
              className="w-1 h-1 rounded-full shrink-0"
              style={{ background: getColor(runnerUp.model.provider, colorMap), opacity: 0.6 }}
            />
            <span
              className="text-[11px] truncate"
              style={{ color: "#777" }}
            >
              {runnerUp.model.name}
            </span>
            <span
              className="text-[10px] shrink-0"
              style={{ color: "#555", fontFamily: MONO }}
            >
              {runnerUp.score}
            </span>
            <span
              className="text-[9px] shrink-0"
              style={{ color: "#444", fontFamily: MONO }}
            >
              {runnerUpSubtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResultsPanel({ data, lang, colorMap, labels }: Props) {
  const abilityLabels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;

  const results = useMemo(() => {
    return ABILITY_KEYS.map((key) => {
      const absolute = findTopTwo(data, key, (m) => m.abilities[key]);
      const value = findTopTwo(
        data,
        key,
        (m) => (m.output > 0 ? m.abilities[key] / m.output : 0),
      );
      const speed = findTopTwo(
        data,
        key,
        (m) => m.abilities[key] * m.tps,
      );
      return { key, absolute, value, speed };
    });
  }, [data]);

  return (
    <div className="px-6 pb-2">
      <div className="space-y-2">
        {results.map(({ key, absolute, value, speed }) => (
          <div
            key={key}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3.5"
          >
            {/* Category header */}
            <div className="flex items-center gap-2 mb-3">
              {ABILITY_ICON[key]}
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
                  icon={<Medal className="w-3.5 h-3.5 text-yellow-400" />}
                  label={labels.bestAbsolute}
                  winner={absolute.first}
                  runnerUp={absolute.second}
                  subtitle={`${absolute.first.score}/100`}
                  runnerUpSubtitle={absolute.second ? `${absolute.second.score}/100` : ""}
                  accentColor="#FFD700"
                  colorMap={colorMap}
                />
              )}
              {value && (
                <WinnerBadge
                  icon={<DollarSign className="w-3.5 h-3.5 text-sky-400" />}
                  label={labels.bestValue}
                  winner={value.first}
                  runnerUp={value.second}
                  subtitle={`${value.first.score} pts / ${formatPrice(value.first.model.output, lang)}`}
                  runnerUpSubtitle={value.second ? `${value.second.score} / ${formatPrice(value.second.model.output, lang)}` : ""}
                  accentColor="#38BDF8"
                  colorMap={colorMap}
                />
              )}
              {speed && (
                <WinnerBadge
                  icon={<Zap className="w-3.5 h-3.5 text-emerald-400" />}
                  label={labels.bestSpeed}
                  winner={speed.first}
                  runnerUp={speed.second}
                  subtitle={`${speed.first.score} × ${speed.first.model.tps.toLocaleString()} tps`}
                  runnerUpSubtitle={speed.second ? `${speed.second.score} × ${speed.second.model.tps.toLocaleString()}` : ""}
                  accentColor="#00E5A0"
                  colorMap={colorMap}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div
        className="mt-5 px-4 py-3 rounded-lg border border-amber-500/10 bg-amber-500/[0.04]"
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400/60 mt-0.5 shrink-0" />
          <p
            className="text-[10px] text-amber-200/60 m-0 leading-relaxed"
            style={{ fontFamily: SANS }}
          >
            {labels.resultsDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}
