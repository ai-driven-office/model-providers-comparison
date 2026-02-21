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
import { formatPrice, formatPriceAxis, type Lang } from "../../data/i18n";
import { ModelIcon } from "./ProviderIcon";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

function PricingTooltip({ active, payload, lang, colorMap }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Model;
  const color = getColor(d.provider, colorMap);
  const isJa = lang === "ja";
  const labels = isJa
    ? { input: "入力", output: "出力", throughput: "スループット", longCtx: ">200K" }
    : { input: "Input", output: "Output", throughput: "Throughput", longCtx: ">200K ctx" };
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl"
      style={{
        background: "rgba(10,10,18,0.95)",
        border: `1px solid ${color}44`,
        boxShadow: `0 8px 32px ${color}22`,
      }}
    >
      <div className="flex items-center gap-1.5 text-white font-bold text-[15px]">
        <ModelIcon modelName={d.name} size={16} className="shrink-0 opacity-80" />
        {d.name}
      </div>
      <div className="text-[13px] mb-1.5" style={{ color }}>
        {d.provider}
      </div>
      <div className="text-gray-300 text-[13px]">
        {labels.input}:{" "}
        <span className="text-white font-semibold">{formatPrice(d.input, lang)}/M</span>
      </div>
      <div className="text-gray-300 text-[13px]">
        {labels.output}:{" "}
        <span className="text-white font-semibold">{formatPrice(d.output, lang)}/M</span>
      </div>
      {d.inputLong != null && (
        <div className="mt-1.5 pt-1.5 border-t border-white/10">
          <div className="text-orange-300/80 text-[11px] font-semibold mb-0.5">
            {labels.longCtx}
          </div>
          <div className="text-gray-300 text-[13px]">
            {labels.input}:{" "}
            <span className="text-orange-200 font-semibold">{formatPrice(d.inputLong, lang)}/M</span>
          </div>
          <div className="text-gray-300 text-[13px]">
            {labels.output}:{" "}
            <span className="text-orange-200 font-semibold">{formatPrice(d.outputLong!, lang)}/M</span>
          </div>
        </div>
      )}
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
  lang: Lang;
  colorMap: ColorMap;
  labels: { inputLegend: string; outputLegend: string; longContext: string };
}

export default function PricingChart({ data, lang, colorMap, labels }: Props) {
  const hasLong = data.some((m) => m.outputLong != null);
  const X_CAP = 35;

  const chartData = [...data]
    .sort((a, b) => (a.output ?? 0) - (b.output ?? 0))
    .map((m) => {
      const clamped = m.output > X_CAP;
      return {
        ...m,
        inputDisplay: clamped ? Math.min(m.input, X_CAP * 0.15) : m.input,
        outputDisplay: clamped ? X_CAP * 0.75 : m.output,
        clamped,
        outputLongDelta:
          m.outputLong != null ? m.outputLong - m.output : null,
        priceLabel: clamped
          ? `⋯ ${formatPrice(m.output, lang)}`
          : m.outputLong != null
            ? `${formatPrice(m.output, lang)} → ${formatPrice(m.outputLong, lang)}`
            : formatPrice(m.output, lang),
      };
    });

  return (
    <div>
      <ResponsiveContainer width="100%" height={hasLong ? 520 : 470}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 20, right: 80, top: 5, bottom: 5 }}
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
            tickFormatter={(v: number) => formatPriceAxis(v, lang)}
            domain={[0, X_CAP]}
            allowDataOverflow
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
            content={<PricingTooltip lang={lang} colorMap={colorMap} />}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Bar
            dataKey="inputDisplay"
            name="Input"
            radius={[0, 4, 4, 0]}
            barSize={14}
            minPointSize={4}
            stackId="a"
            isAnimationActive={false}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.tag === "fast"
                    ? "#FFAA32"
                    : getColor(entry.provider, colorMap)
                }
                fillOpacity={0.7}
              />
            ))}
          </Bar>
          <Bar
            dataKey="outputDisplay"
            name="Output"
            radius={[0, 4, 4, 0]}
            barSize={14}
            minPointSize={4}
            stackId="b"
            isAnimationActive={false}
          >
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.tag === "fast"
                    ? "#FFAA32"
                    : getColor(entry.provider, colorMap)
                }
                fillOpacity={1}
                strokeDasharray={entry.clamped ? "4 2" : "none"}
                stroke={entry.clamped ? "#FFAA32" : "none"}
                strokeWidth={entry.clamped ? 1.5 : 0}
              />
            ))}
            <LabelList
              dataKey="priceLabel"
              position="right"
              style={{ fill: "#aaa", fontSize: 10, fontFamily: MONO }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-5 justify-center pb-2 pl-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-500 opacity-50" />
          <span className="text-gray-500 text-[11px]">
            {labels.inputLegend}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-500 opacity-90" />
          <span className="text-gray-500 text-[11px]">
            {labels.outputLegend}
          </span>
        </div>
        {hasLong && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500 opacity-40 border border-amber-500/60" style={{ borderStyle: "dashed" }} />
            <span className="text-gray-500 text-[11px]">
              {labels.longContext}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
