import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from "recharts";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import { formatPrice, formatPriceAxis, type Lang } from "../../data/i18n";
import { ModelIcon } from "./ProviderIcon";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

function ScatterTooltip({ active, payload, lang, colorMap }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Model & { x: number; y: number };
  const color = getColor(d.provider, colorMap);
  const isJa = lang === "ja";
  const labels = isJa
    ? {
        speed: "速度",
        outputCost: "出力コスト",
        longCtx: ">200K",
        tip: "↗ 右上 = 高速＆高価 · ↙ 左下 = 低速＆安価",
      }
    : {
        speed: "Speed",
        outputCost: "Output cost",
        longCtx: ">200K ctx",
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
      <div className="flex items-center gap-1.5 text-white font-bold text-[15px]">
        <ModelIcon modelName={d.name} size={16} className="shrink-0 opacity-80" />
        {d.name}
      </div>
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
        <span className="text-white font-semibold">{formatPrice(d.output, lang)}/M</span>
        {d.outputLong != null && (
          <span className="text-orange-300/80 text-[11px] ml-1">
            ({labels.longCtx}: {formatPrice(d.outputLong, lang)}/M)
          </span>
        )}
      </div>
      <div className="text-gray-400 text-[11px] mt-1 italic">{labels.tip}</div>
    </div>
  );
}

interface Props {
  data: Model[];
  lang: Lang;
  colorMap: ColorMap;
  labels: { xLabel: string; yLabel: string; sub: string };
}

export default function ScatterPlot({ data, lang, colorMap, labels }: Props) {
  const Y_CAP = 35;
  const X_CAP = 1200;

  const scatterData = data.map((m) => {
    const yClamp = (m.output ?? 0) > Y_CAP;
    const xClamp = m.tps > X_CAP;
    const clamped = yClamp || xClamp;
    const nameParts = [m.name];
    if (xClamp) nameParts.push(`${m.tps.toLocaleString()} tps`);
    if (yClamp) nameParts.push(formatPrice(m.output, lang));
    return {
      ...m,
      x: xClamp ? X_CAP - 40 : m.tps,
      y: yClamp ? Y_CAP - 2 : (m.output ?? 0),
      z: Math.min(m.input ?? 0, 10) * 10 + 20,
      clamped,
      xClamped: xClamp,
      clampedLabel: clamped
        ? `${nameParts[0]} (${nameParts.slice(1).join(", ")})`
        : m.name,
    };
  });

  const renderPoint = ({ cx, cy, payload }: any) => {
    if (typeof cx !== "number" || typeof cy !== "number" || !payload) {
      return null;
    }

    const fill =
      payload.tag === "fast" || payload.tag === "record"
        ? "#FFAA32"
        : getColor(payload.provider, colorMap);
    const isHighlighted = payload.hero || payload.tag === "fast" || payload.tag === "record";

    return (
      <circle
        cx={cx}
        cy={cy}
        r={isHighlighted ? 7 : 6}
        fill={fill}
        fillOpacity={0.95}
        stroke={isHighlighted ? fill : "rgba(255,255,255,0.45)"}
        strokeWidth={isHighlighted ? 2 : 1}
      />
    );
  };

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
          domain={[0, X_CAP]}
          allowDataOverflow
        />
        <YAxis
          dataKey="y"
          type="number"
          name="Output Price"
          tick={{ fill: "#555", fontSize: 11, fontFamily: MONO }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
          tickFormatter={(v: number) => formatPriceAxis(v, lang)}
          label={{
            value: labels.yLabel,
            angle: -90,
            position: "insideLeft",
            fill: "#555",
            fontSize: 11,
          }}
          domain={[0, Y_CAP]}
          allowDataOverflow
        />
        <ZAxis dataKey="z" range={[120, 400]} />
        <Tooltip content={<ScatterTooltip lang={lang} colorMap={colorMap} />} />
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
        <Scatter data={scatterData} shape={renderPoint} isAnimationActive={false}>
          <LabelList
            dataKey="clampedLabel"
            position="top"
            style={{ fill: "#888", fontSize: 9, fontFamily: SANS }}
            offset={10}
            content={({ x, y, value, index }: any) => {
              const entry = scatterData[index];
              if (!entry) return null;
              if (entry.clamped) {
                const labelFill = entry.xClamped ? "#D43D00" : "#C07800";
                return (
                  <g>
                    <text
                      x={x}
                      y={(y ?? 0) - 12}
                      textAnchor="middle"
                      fill={labelFill}
                      fontSize={9}
                      fontFamily={SANS}
                      fontWeight={entry.xClamped ? 700 : 400}
                    >
                      {entry.xClamped ? "⫸ " : "⋯ "}{value}
                    </text>
                    <line
                      x1={x}
                      y1={(y ?? 0) - 4}
                      x2={x}
                      y2={(y ?? 0) + 4}
                      stroke={labelFill}
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      opacity={0.6}
                    />
                  </g>
                );
              }
              return (
                <text
                  x={x}
                  y={(y ?? 0) - 10}
                  textAnchor="middle"
                  fill="#888"
                  fontSize={9}
                  fontFamily={SANS}
                >
                  {value}
                </text>
              );
            }}
          />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
