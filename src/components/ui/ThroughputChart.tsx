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
} from "recharts";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";

const MONO = "'Space Mono', monospace";
const SANS = "'DM Sans', sans-serif";

function ThroughputTooltip({ active, payload, lang, colorMap }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Model;
  const color = getColor(d.provider, colorMap);
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl"
      style={{
        background: "rgba(10,10,18,0.95)",
        border: `1px solid ${color}44`,
        boxShadow: `0 8px 32px ${color}22`,
      }}
    >
      <div className="text-white font-bold text-[15px]">{d.name}</div>
      <div className="text-[13px] mb-1.5" style={{ color }}>
        {d.provider}
      </div>
      <div className="text-gray-300 text-[13px]">
        <span className="font-bold text-white text-lg">
          {d.tps.toLocaleString()}
        </span>{" "}
        {lang === "ja" ? "\u30c8\u30fc\u30af\u30f3/\u79d2" : "tokens/sec"}
      </div>
      {d.tag === "fast" && (
        <div className="text-amber-400 text-[11px] mt-1">
          \u26a1 2.5x faster than standard Opus 4.6
        </div>
      )}
    </div>
  );
}

interface Props {
  data: Model[];
  lang: string;
  colorMap: ColorMap;
}

export default function ThroughputChart({ data, lang, colorMap }: Props) {
  const sorted = [...data].sort((a, b) => b.tps - a.tps);

  return (
    <ResponsiveContainer width="100%" height={470}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ left: 20, right: 50, top: 5, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fill: "#555", fontSize: 11, fontFamily: MONO }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
          domain={[0, 1100]}
        />
        <YAxis
          dataKey="name"
          type="category"
          width={150}
          tick={{ fill: "#999", fontSize: 11, fontFamily: SANS }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<ThroughputTooltip lang={lang} colorMap={colorMap} />}
          cursor={{ fill: "rgba(255,255,255,0.02)" }}
        />
        <Bar
          dataKey="tps"
          radius={[0, 6, 6, 0]}
          barSize={26}
          isAnimationActive={false}
        >
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.hero
                  ? "url(#heroGrad)"
                  : entry.tag === "fast"
                    ? "#FFAA32"
                    : getColor(entry.provider, colorMap)
              }
              fillOpacity={entry.hero || entry.tag === "fast" ? 1 : 0.75}
            />
          ))}
          <LabelList
            dataKey="tps"
            position="right"
            formatter={(value) =>
              typeof value === "number"
                ? value.toLocaleString()
                : String(value ?? "")
            }
            style={{
              fill: "#aaa",
              fontSize: 11,
              fontFamily: MONO,
              fontWeight: 600,
            }}
          />
        </Bar>
        <defs>
          <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00E5A0" />
            <stop offset="100%" stopColor="#00FFC6" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
