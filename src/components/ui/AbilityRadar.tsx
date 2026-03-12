import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useState } from "react";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import type { Lang } from "../../data/i18n";
import { ModelIcon } from "./ProviderIcon";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

const ABILITY_KEYS = ["planning", "coding", "image", "research", "creative"] as const;

const ABILITY_LABELS: Record<string, Record<string, string>> = {
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

const ABILITY_COLORS: Record<string, string> = {
  planning: "#60A5FA",
  coding: "#34D399",
  image: "#FBBF24",
  research: "#A78BFA",
  creative: "#F472B6",
};

const BENCHMARKS: Record<string, Record<string, string[]>> = {
  en: {
    planning: [
      "ARC-AGI-1 / ARC-AGI-2",
      "AIME 2024/2025",
      "FrontierMath",
      "OSWorld",
      "Terminal-Bench 2.0",
    ],
    coding: [
      "SWE-bench Verified",
      "SWE-bench Pro",
      "LiveCodeBench",
      "HumanEval",
      "SWE-Lancer (IC-Diamond)",
    ],
    image: [
      "MMMU / MMMU-Pro",
      "MathVista",
      "MRCR v2",
      "Visual Reasoning",
    ],
    research: [
      "GPQA Diamond",
      "MMMLU (Multilingual)",
      "HLE (Humanity's Last Exam)",
      "PhD-level Science QA",
    ],
    creative: [
      "Chatbot Arena ELO (Overall)",
      "Arena Creative Writing",
      "GDPval-AA ELO",
      "Human Preference Ratings",
    ],
  },
  ja: {
    planning: [
      "ARC-AGI-1 / ARC-AGI-2",
      "AIME 2024/2025",
      "FrontierMath",
      "OSWorld",
      "Terminal-Bench 2.0",
    ],
    coding: [
      "SWE-bench Verified",
      "SWE-bench Pro",
      "LiveCodeBench",
      "HumanEval",
      "SWE-Lancer (IC-Diamond)",
    ],
    image: [
      "MMMU / MMMU-Pro",
      "MathVista",
      "MRCR v2",
      "視覚推論テスト",
    ],
    research: [
      "GPQA Diamond",
      "MMMLU（多言語）",
      "HLE（人類最終試験）",
      "博士レベル科学QA",
    ],
    creative: [
      "Chatbot Arena ELO（総合）",
      "Arena クリエイティブライティング",
      "GDPval-AA ELO",
      "人間の嗜好評価",
    ],
  },
};

function renderAbilityIcon(ability: string, color: string) {
  switch (ability) {
    case "planning":
      return (
        <>
          <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
          <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
          <circle cx="12" cy="12" r="1.5" fill={color} />
          <line x1="12" y1="2.5" x2="12" y2="6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="21.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="2.5" y1="12" x2="6" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="12" x2="21.5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "coding":
      return (
        <>
          <polyline points="8,5 2.5,12 8,19" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="16,5 21.5,12 16,19" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="13.5" y1="5" x2="10.5" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </>
      );
    case "image":
      return (
        <>
          <path d="M2,12 C4,7 8,5.5 12,5.5 C16,5.5 20,7 22,12 C20,17 16,18.5 12,18.5 C8,18.5 4,17 2,12Z" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.5" fill={`${color}25`} />
          <circle cx="12" cy="12" r="1.5" fill={color} />
        </>
      );
    case "research":
      return (
        <>
          <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.5" fill="none" />
          <line x1="15" y1="15" x2="21" y2="21" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
        </>
      );
    case "creative":
      return (
        <>
          <path d="M12,3 L13.5,9.5 L20,11 L13.5,12.5 L12,19 L10.5,12.5 L4,11 L10.5,9.5Z" fill={color} opacity="0.85" />
          <path d="M19,3 L19.7,5.2 L22,5.5 L19.7,5.8 L19,8 L18.3,5.8 L16,5.5 L18.3,5.2Z" fill={color} opacity="0.45" />
          <circle cx="4.5" cy="18" r="1" fill={color} opacity="0.3" />
        </>
      );
    default:
      return null;
  }
}

function CustomAxisTick(props: any) {
  const { x, y, cx, cy, payload, abilityLabels: labels } = props;
  const key = payload?.value;
  if (!key || !labels) return null;

  const label = labels[key] || key;
  const color = ABILITY_COLORS[key] || "#888";

  if (typeof cx !== "number" || typeof cy !== "number") {
    return (
      <text x={x} y={y} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={12} fontFamily={SANS}>
        {label}
      </text>
    );
  }

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;

  const push = 6;
  const ix = x + nx * push;
  const iy = y + ny * push;
  const absNx = Math.abs(nx);
  const badgeR = 14;
  const iconSize = 18;

  let textDx = 0, textDy = 0;
  let textAnchor: "middle" | "start" | "end" = "middle";
  let textBaseline: "auto" | "central" | "hanging" = "central";

  if (absNx < 0.2) {
    textDy = ny < 0 ? -(badgeR + 8) : (badgeR + 14);
    textBaseline = ny < 0 ? "auto" : "hanging";
  } else {
    textDx = nx > 0 ? (badgeR + 6) : -(badgeR + 6);
    textDy = 1;
    textAnchor = nx > 0 ? "start" : "end";
  }

  return (
    <g>
      <circle cx={ix} cy={iy} r={badgeR + 5} fill={color} opacity={0.05}>
        <animate
          attributeName="r"
          values={`${badgeR + 3};${badgeR + 7};${badgeR + 3}`}
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={ix} cy={iy} r={badgeR}
        fill={`${color}15`}
        stroke={`${color}30`}
        strokeWidth={1}
      />
      <g
        transform={`translate(${ix - iconSize / 2}, ${iy - iconSize / 2}) scale(${iconSize / 24})`}
        style={{ filter: `drop-shadow(0 0 4px ${color}55)` }}
      >
        {renderAbilityIcon(key, color)}
      </g>
      <text
        x={ix + textDx}
        y={iy + textDy}
        textAnchor={textAnchor}
        dominantBaseline={textBaseline}
        fill="rgba(255,255,255,0.5)"
        fontSize={11}
        fontWeight={600}
        fontFamily={SANS}
      >
        {label}
      </text>
    </g>
  );
}

function RadarTooltipContent({ active, payload, lang }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const labels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;
  const abilityKey = d.ability;
  const color = ABILITY_COLORS[abilityKey] || "#888";
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{
        background: "rgba(10,10,18,0.96)",
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${color}15`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg width={16} height={16} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 3px ${color}66)` }}>
          {renderAbilityIcon(abilityKey, color)}
        </svg>
        <span className="text-white font-bold text-sm">{labels[abilityKey] || abilityKey}</span>
      </div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-[12px] flex items-center gap-1.5 mb-0.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.stroke || p.fill }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", mixBlendMode: "plus-lighter" }}>{p.dataKey}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

interface Props {
  data: Model[];
  lang: Lang;
  colorMap: ColorMap;
  labels: {
    abilityTitle: string;
    abilitySub: string;
    benchmarkTitle: string;
    benchmarkSub: string;
    selectModels: string;
    selectAll: string;
    deselectAll: string;
  };
}

export default function AbilityRadar({ data, lang, colorMap, labels }: Props) {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(() => {
    // Default: select top 4 models by total ability score
    const scored = data.map((m) => ({
      name: m.name,
      total: Object.values(m.abilities).reduce((a, b) => a + b, 0),
    }));
    scored.sort((a, b) => b.total - a.total);
    return new Set(scored.slice(0, 4).map((s) => s.name));
  });

  const [hoveredBenchmark, setHoveredBenchmark] = useState<string | null>(null);
  const abilityLabels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;
  const benchmarks = BENCHMARKS[lang] || BENCHMARKS.en;

  /* dynamic radar floor: drops below 60 if any selected model scores low */
  const selectedData = data.filter((m) => selectedModels.has(m.name));
  const allScores = selectedData.flatMap((m) => Object.values(m.abilities));
  const minScore = allScores.length ? Math.min(...allScores) : 60;
  const domainFloor = minScore < 55 ? 0 : 60;

  const radarData = ABILITY_KEYS.map((key) => {
    const point: Record<string, any> = {
      ability: key,
      label: abilityLabels[key],
      fullMark: 100,
    };
    data.forEach((m) => {
      if (selectedModels.has(m.name)) {
        point[m.name] = m.abilities[key];
      }
    });
    return point;
  });

  const toggleModel = (name: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedModels(new Set(data.map((m) => m.name)));
  const deselectAll = () => setSelectedModels(new Set());

  return (
    <div>
      {/* Model selector chips */}
      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px]" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}>
            {labels.selectModels}
          </span>
          <button
            onClick={selectAll}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-transparent border-none cursor-pointer"
            style={{ fontFamily: MONO }}
          >
            {labels.selectAll}
          </button>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <button
            onClick={deselectAll}
            className="text-[10px] bg-transparent border-none cursor-pointer"
            style={{ fontFamily: MONO, color: "rgba(255,255,255,0.3)", mixBlendMode: "plus-lighter" }}
          >
            {labels.deselectAll}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data
            .filter((m) => m.tag !== "fast")
            .map((m) => {
              const isSelected = selectedModels.has(m.name);
              const color = m.tag === "fast" ? "#FFAA32" : getColor(m.provider, colorMap);
              return (
                <button
                  key={m.name}
                  onClick={() => toggleModel(m.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-[11px] font-semibold transition-all duration-200"
                  style={{
                    fontFamily: SANS,
                    background: isSelected ? `${color}18` : "transparent",
                    borderColor: isSelected ? `${color}55` : "rgba(255,255,255,0.08)",
                    color: isSelected ? color : "rgba(255,255,255,0.3)",
                    boxShadow: isSelected ? `0 0 12px ${color}15` : "none",
                  }}
                >
                  <ModelIcon modelName={m.name} size={13} className="shrink-0 opacity-70" />
                  {m.name}
                </button>
              );
            })}
        </div>
      </div>

      {/* Radar Chart */}
      <div
        className="relative"
        style={{
          background: "radial-gradient(ellipse at 50% 46%, rgba(96,165,250,0.03) 0%, rgba(167,139,250,0.02) 25%, transparent 55%)",
        }}
      >
        <ResponsiveContainer width="100%" height={560}>
          <RadarChart data={radarData} cx="50%" cy="48%" outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,0.07)" gridType="circle" />
            <PolarAngleAxis
              dataKey="ability"
              tickLine={false}
              tick={<CustomAxisTick abilityLabels={abilityLabels} />}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[domainFloor, 100]}
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontFamily: MONO }}
              tickCount={5}
              stroke="rgba(255,255,255,0.04)"
            />
            <Tooltip content={<RadarTooltipContent lang={lang} />} />
            {data
              .filter((m) => selectedModels.has(m.name) && m.tag !== "fast")
              .map((m) => {
                const color = getColor(m.provider, colorMap);
                return (
                  <Radar
                    key={m.name}
                    name={m.name}
                    dataKey={m.name}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.10}
                    strokeWidth={2}
                    isAnimationActive={false}
                    dot={{ r: 4, fill: color, fillOpacity: 1, stroke: "#0a0a12", strokeWidth: 2 }}
                  />
                );
              })}
            <Legend
              wrapperStyle={{
                fontSize: 11,
                fontFamily: SANS,
                paddingTop: 8,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark Sources */}
      <div className="px-6 mt-4 mb-2">
        <h3
          className="text-[13px] font-bold mb-1"
          style={{ fontFamily: SANS, color: "rgba(255,255,255,0.45)", mixBlendMode: "plus-lighter" }}
        >
          {labels.benchmarkTitle}
        </h3>
        <p
          className="text-[11px] m-0 mb-3"
          style={{ fontFamily: SANS, color: "rgba(255,255,255,0.25)", mixBlendMode: "plus-lighter" }}
        >
          {labels.benchmarkSub}
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          {ABILITY_KEYS.map((key) => {
            const iconColor = ABILITY_COLORS[key] || "#888";
            const isHovered = hoveredBenchmark === key;
            return (
              <div
                key={key}
                className="cursor-default"
                onMouseEnter={() => setHoveredBenchmark(key)}
                onMouseLeave={() => setHoveredBenchmark(null)}
                style={{
                  opacity: hoveredBenchmark && !isHovered ? 0.35 : 1,
                  transform: isHovered ? "translateY(-2px)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg
                    width={15}
                    height={15}
                    viewBox="0 0 24 24"
                    className="shrink-0"
                    style={{
                      opacity: isHovered ? 1 : 0.6,
                      filter: isHovered
                        ? `drop-shadow(0 0 4px ${iconColor}88)`
                        : `drop-shadow(0 0 2px ${iconColor}33)`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {renderAbilityIcon(key, iconColor)}
                  </svg>
                  <span
                    className="text-[11px] font-bold"
                    style={{
                      color: isHovered ? iconColor : "rgba(255,255,255,0.4)",
                      fontFamily: SANS,
                      transition: "color 0.3s ease",
                    }}
                  >
                    {abilityLabels[key]}
                  </span>
                </div>
                <ul className="list-none m-0 p-0">
                  {benchmarks[key].map((b) => (
                    <li
                      key={b}
                      className="text-[10px] leading-relaxed"
                      style={{ fontFamily: MONO, color: "rgba(255,255,255,0.25)", mixBlendMode: "plus-lighter" }}
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
