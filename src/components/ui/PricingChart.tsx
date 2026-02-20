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
import { getColor } from "../../data/colors";

const MONO = "'Space Mono', monospace";
const SANS = "'DM Sans', sans-serif";

function PricingTooltip({ active, payload, lang }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Model;
  const color = getColor(d.provider);
  const labels = lang === "ja"
    ? { input: "入力", output: "出力", throughput: "スループット" }
    : { input: "Input", output: "Output", throughput: "Throughput" };
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
        {labels.input}:{" "}
        <span className="text-white font-semibold">${d.input}/M</span>
      </div>
      <div className="text-gray-300 text-[13px]">
        {labels.output}:{" "}
        <span className="text-white font-semibold">${d.output}/M</span>
      </div>
      <div className="text-gray-300 text-[13px] mt-1">
        {labels.throughput}:{" "}
        <span className="text-white font-semibold">
          {d.tps.toLocaleString()} tps
        </span>
      </div>
    </div>
  );
}

interface Props {
  data: Model[];
  lang: string;
  labels: { inputLegend: string; outputLegend: string };
}

export default function PricingChart({ data, lang, labels }: Props) {
  const sorted = [...data].sort((a, b) => a.output - b.output);

  return (
    <div>
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
            tickFormatter={(v: number) => `$${v}`}
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
            content={<PricingTooltip lang={lang} />}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Bar
            dataKey="input"
            name="Input"
            radius={[0, 4, 4, 0]}
            barSize={14}
            stackId="a"
          >
            {sorted.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.tag === "fast" ? "#FFAA32" : getColor(entry.provider)
                }
                fillOpacity={0.5}
              />
            ))}
          </Bar>
          <Bar
            dataKey="output"
            name="Output"
            radius={[0, 4, 4, 0]}
            barSize={14}
            stackId="b"
          >
            {sorted.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.tag === "fast" ? "#FFAA32" : getColor(entry.provider)
                }
                fillOpacity={0.9}
              />
            ))}
            <LabelList
              dataKey="output"
              position="right"
              formatter={(value) => `$${value ?? ""}`}
              style={{ fill: "#aaa", fontSize: 11, fontFamily: MONO }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-5 justify-center pb-2 pl-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-500 opacity-50" />
          <span className="text-gray-500 text-[11px]">{labels.inputLegend}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-500 opacity-90" />
          <span className="text-gray-500 text-[11px]">
            {labels.outputLegend}
          </span>
        </div>
      </div>
    </div>
  );
}
