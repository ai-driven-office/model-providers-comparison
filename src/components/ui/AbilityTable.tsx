import { Trophy } from "lucide-react";
import type { Model, Abilities } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import type { Lang } from "../../data/i18n";
import { ModelIcon, ProviderIcon } from "./ProviderIcon";

const ABILITY_KEYS: (keyof Abilities)[] = [
  "planning",
  "coding",
  "image",
  "research",
  "creative",
];

const ABILITY_LABELS: Record<string, Record<keyof Abilities, string>> = {
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

interface Props {
  data: Model[];
  lang: Lang;
  colorMap: ColorMap;
  labels: {
    colModel: string;
    colProvider: string;
    colAverage: string;
  };
}

export default function AbilityTable({ data, lang, colorMap, labels }: Props) {
  const abilityLabels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;
  const isJa = lang === "ja";
  const headerFont = isJa
    ? "'Zen Kaku Gothic New', sans-serif"
    : "'Space Mono', monospace";

  // Filter out fast-tagged models and compute averages
  const modelsWithAvg = data
    .filter((m) => m.tag !== "fast")
    .map((m) => {
      const scores = ABILITY_KEYS.map((k) => m.abilities[k]);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return { ...m, avg };
    })
    .sort((a, b) => b.avg - a.avg);

  // Find max per column for highlighting
  const maxPerKey: Record<string, number> = {};
  ABILITY_KEYS.forEach((key) => {
    maxPerKey[key] = Math.max(...modelsWithAvg.map((m) => m.abilities[key]));
  });
  const maxAvg = Math.max(...modelsWithAvg.map((m) => m.avg));

  const headers = [
    labels.colModel,
    labels.colProvider,
    ...ABILITY_KEYS.map((k) => abilityLabels[k]),
    labels.colAverage,
  ];

  return (
    <div className="mt-7 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map((h, idx) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-semibold tracking-wider"
                style={{
                  fontFamily: headerFont,
                  fontSize: 10,
                  textTransform: isJa ? "none" : "uppercase",
                  textAlign: idx >= 2 ? "center" : "left",
                  color: "rgba(255,255,255,0.35)",
                  mixBlendMode: "plus-lighter",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modelsWithAvg.map((m, i) => {
            const isTop = i === 0;
            return (
              <tr
                key={m.name}
                className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                style={{
                  background: isTop
                    ? "rgba(0,229,160,0.04)"
                    : m.hero
                      ? "rgba(51,112,254,0.03)"
                      : "transparent",
                }}
              >
                {/* Model name */}
                <td className="px-4 py-2.5 font-semibold">
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: isTop ? "#00E5A0" : "#ccc" }}
                  >
                    {isTop && (
                      <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <ModelIcon
                      modelName={m.name}
                      size={15}
                      className="shrink-0 opacity-70"
                    />
                    {m.name}
                  </span>
                </td>

                {/* Provider */}
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{ color: getColor(m.provider, colorMap) }}
                  >
                    <ProviderIcon
                      providerId={m.providerId}
                      size={14}
                      className="shrink-0 opacity-60"
                    />
                    {m.provider}
                  </span>
                </td>

                {/* Ability scores */}
                {ABILITY_KEYS.map((key) => {
                  const val = m.abilities[key];
                  const isMax = val === maxPerKey[key];
                  return (
                    <td
                      key={key}
                      className="px-4 py-2.5 font-mono text-center"
                      style={{
                        fontWeight: isMax ? 800 : 500,
                        color: isMax
                          ? "#00E5A0"
                          : val >= 90
                            ? "#5C8DFE"
                            : val >= 80
                              ? "#aaa"
                              : "rgba(255,255,255,0.3)",
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{val}</span>
                        {/* Mini bar */}
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${Math.max((val - 60) * 1.2, 4)}px`,
                            background: isMax
                              ? "#00E5A0"
                              : val >= 90
                                ? "#5C8DFE"
                                : val >= 80
                                  ? "rgba(255,255,255,0.15)"
                                  : "rgba(255,255,255,0.06)",
                          }}
                        />
                      </div>
                    </td>
                  );
                })}

                {/* Average */}
                <td
                  className="px-4 py-2.5 font-mono text-center"
                  style={{
                    fontWeight: m.avg === maxAvg ? 800 : 600,
                    color:
                      m.avg === maxAvg
                        ? "#00E5A0"
                        : m.avg >= 90
                          ? "#5C8DFE"
                          : "#ccc",
                    background:
                      m.avg === maxAvg
                        ? "rgba(0,229,160,0.06)"
                        : "transparent",
                  }}
                >
                  {m.avg.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
