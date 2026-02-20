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

const MONO = "'Space Mono', monospace";
const SANS = "'DM Sans', sans-serif";

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

function RadarTooltipContent({ active, payload, lang }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const labels = ABILITY_LABELS[lang] || ABILITY_LABELS.en;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl"
      style={{
        background: "rgba(10,10,18,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="text-white font-bold text-sm mb-1.5">{labels[d.ability] || d.ability}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="text-[12px] flex items-center gap-1.5 mb-0.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.stroke || p.fill }}
          />
          <span className="text-gray-400">{p.dataKey}:</span>
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

  const radarData = ABILITY_KEYS.map((key) => {
    const point: Record<string, any> = {
      ability: key,
      label: abilityLabels[key],
      fullMark: 100,
      domainMin: 50,
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
          <span className="text-gray-500 text-[11px]" style={{ fontFamily: MONO }}>
            {labels.selectModels}
          </span>
          <button
            onClick={selectAll}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-transparent border-none cursor-pointer"
            style={{ fontFamily: MONO }}
          >
            {labels.selectAll}
          </button>
          <span className="text-gray-700 text-[10px]">|</span>
          <button
            onClick={deselectAll}
            className="text-[10px] text-gray-500 hover:text-gray-400 bg-transparent border-none cursor-pointer"
            style={{ fontFamily: MONO }}
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
                  className="px-3 py-1.5 rounded-lg border cursor-pointer text-[11px] font-semibold transition-all duration-200"
                  style={{
                    fontFamily: SANS,
                    background: isSelected ? `${color}18` : "transparent",
                    borderColor: isSelected ? `${color}55` : "rgba(255,255,255,0.08)",
                    color: isSelected ? color : "#555",
                    boxShadow: isSelected ? `0 0 12px ${color}15` : "none",
                  }}
                >
                  {m.name}
                </button>
              );
            })}
        </div>
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: "#888", fontSize: 12, fontFamily: SANS }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[50, 100]}
            tick={{ fill: "#444", fontSize: 9, fontFamily: MONO }}
            tickCount={6}
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
                  fillOpacity={0.08}
                  strokeWidth={2}
                  isAnimationActive={false}
                  dot={{ r: 3, fill: color, fillOpacity: 0.9 }}
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

      {/* Benchmark Sources */}
      <div className="px-6 mt-4 mb-2">
        <h3
          className="text-[13px] font-bold text-gray-400 mb-1"
          style={{ fontFamily: SANS }}
        >
          {labels.benchmarkTitle}
        </h3>
        <p
          className="text-[11px] text-gray-600 m-0 mb-3"
          style={{ fontFamily: SANS }}
        >
          {labels.benchmarkSub}
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          {ABILITY_KEYS.map((key) => (
            <div
              key={key}
              className="cursor-default transition-opacity"
              onMouseEnter={() => setHoveredBenchmark(key)}
              onMouseLeave={() => setHoveredBenchmark(null)}
              style={{
                opacity: hoveredBenchmark && hoveredBenchmark !== key ? 0.4 : 1,
              }}
            >
              <div
                className="text-[11px] font-bold mb-1"
                style={{
                  color:
                    hoveredBenchmark === key ? "#00E5A0" : "#888",
                  fontFamily: SANS,
                }}
              >
                {abilityLabels[key]}
              </div>
              <ul className="list-none m-0 p-0">
                {benchmarks[key].map((b) => (
                  <li
                    key={b}
                    className="text-[10px] text-gray-600 leading-relaxed"
                    style={{ fontFamily: MONO }}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
