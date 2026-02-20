import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from "recharts";
import type { Model } from "../../data/types";
import { getColor } from "../../data/colors";

const MONO = "'Space Mono', monospace";
const SANS = "'DM Sans', sans-serif";

function ScatterTooltip({ active, payload, lang }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Model & { x: number; y: number };
  const color = getColor(d.provider);
  const labels =
    lang === "ja"
      ? {
          speed: "速度",
          outputCost: "出力コスト",
          tip: "↗ 右上 = 高速＆高価 · ↙ 左下 = 低速＆安価",
        }
      : {
          speed: "Speed",
          outputCost: "Output cost",
          tip: "↗ Top-right = fast & expensive · ↙ Bottom-left = slow & cheap",
        };
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
        {labels.speed}:{" "}
        <span className="text-white font-semibold">
          {d.tps.toLocaleString()} tps
        </span>
      </div>
      <div className="text-gray-300 text-[13px]">
        {labels.outputCost}:{" "}
        <span className="text-white font-semibold">${d.output}/M</span>
      </div>
      <div className="text-gray-400 text-[11px] mt-1 italic">{labels.tip}</div>
    </div>
  );
}

interface Props {
  data: Model[];
  lang: string;
  labels: { xLabel: string; yLabel: string; sub: string };
}

export default function ScatterPlot({ data, lang, labels }: Props) {
  const scatterData = data.map((m) => ({
    ...m,
    x: m.tps,
    y: m.output,
    z: Math.min(m.input, 10) * 10 + 20,
  }));

  return (
    <ResponsiveContainer width="100%" height={440}>
      <ScatterChart margin={{ left: 10, right: 40, top: 20, bottom: 10 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.04)"
        />
        <XAxis
          dataKey="x"
          type="number"
          name="Throughput"
          tick={{ fill: "#555", fontSize: 11, fontFamily: MONO }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
          label={{
            value: labels.xLabel,
            position: "bottom",
            fill: "#555",
            fontSize: 11,
          }}
          domain={[0, 1100]}
        />
        <YAxis
          dataKey="y"
          type="number"
          name="Output Price"
          tick={{ fill: "#555", fontSize: 11, fontFamily: MONO }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
          tickFormatter={(v: number) => `$${v}`}
          label={{
            value: labels.yLabel,
            angle: -90,
            position: "insideLeft",
            fill: "#555",
            fontSize: 11,
          }}
        />
        <ZAxis dataKey="z" range={[120, 400]} />
        <Tooltip content={<ScatterTooltip lang={lang} />} />
        <ReferenceLine
          x={200}
          stroke="rgba(0,229,160,0.15)"
          strokeDasharray="6 4"
        />
        <ReferenceLine
          y={5}
          stroke="rgba(0,229,160,0.15)"
          strokeDasharray="6 4"
        />
        <Scatter data={scatterData}>
          {scatterData.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.tag === "fast" ? "#FFAA32" : getColor(entry.provider)
              }
              fillOpacity={entry.hero ? 1 : 0.8}
              stroke={
                entry.hero
                  ? "#00E5A0"
                  : entry.tag === "fast"
                    ? "#FFAA32"
                    : "none"
              }
              strokeWidth={entry.hero || entry.tag === "fast" ? 2 : 0}
            />
          ))}
          <LabelList
            dataKey="name"
            position="top"
            style={{ fill: "#888", fontSize: 9, fontFamily: SANS }}
            offset={10}
          />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
