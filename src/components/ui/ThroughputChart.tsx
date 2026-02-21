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
import { Zap } from "lucide-react";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import { ModelIcon } from "./ProviderIcon";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

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
      <div className="flex items-center gap-1.5 text-white font-bold text-[15px]">
        <ModelIcon modelName={d.name} size={16} className="shrink-0 opacity-80" />
        {d.name}
      </div>
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
        <div className="text-amber-400 text-[11px] mt-1 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          2.5x faster than standard Opus 4.6
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

/* ── axis-break: bars beyond this value are visually capped ── */
const X_CAP = 1200;

type BarRow = Model & { displayTps: number; isCapped: boolean };

/** Custom bar shape – draws ⫽ break marks when the bar is truncated. */
function TruncatedBarShape(props: any) {
  const { x, y, width, height, payload } = props;
  if (typeof x !== "number" || typeof y !== "number" || !width || !height)
    return null;

  const row = payload as BarRow;
  const isAccent = row.tag === "fast" || row.tag === "record";
  const fill = row.hero
    ? "url(#heroGrad)"
    : isAccent
      ? "#FFAA32"
      : getColor(row.provider, props.colorMap);
  const opacity = row.hero || isAccent ? 1 : 0.75;

  if (!row.isCapped) {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={opacity}
        rx={6}
        ry={6}
      />
    );
  }

  /* capped bar: solid portion + diagonal break lines + faded tail */
  const solidW = width - 18;
  const bx = x + solidW; // break zone start
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={solidW}
        height={height}
        fill={fill}
        fillOpacity={opacity}
        rx={6}
        ry={6}
      />
      {/* two diagonal "break" slashes */}
      <line
        x1={bx + 2}
        y1={y + 1}
        x2={bx + 6}
        y2={y + height - 1}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={1.5}
      />
      <line
        x1={bx + 7}
        y1={y + 1}
        x2={bx + 11}
        y2={y + height - 1}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={1.5}
      />
      {/* faded continuation nub */}
      <rect
        x={bx + 13}
        y={y + 2}
        width={4}
        height={height - 4}
        fill={fill}
        fillOpacity={opacity * 0.35}
        rx={2}
      />
    </g>
  );
}

export default function ThroughputChart({ data, lang, colorMap }: Props) {
  const sorted: BarRow[] = [...data]
    .sort((a, b) => b.tps - a.tps)
    .map((m) => ({
      ...m,
      displayTps: Math.min(m.tps, X_CAP),
      isCapped: m.tps > X_CAP,
    }));

  return (
    <ResponsiveContainer width="100%" height={470}>
      <BarChart
        data={sorted}
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
          domain={[0, X_CAP]}
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
          dataKey="displayTps"
          radius={[0, 6, 6, 0]}
          barSize={26}
          isAnimationActive={false}
          shape={(props: any) => (
            <TruncatedBarShape {...props} colorMap={colorMap} />
          )}
        >
          {sorted.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.hero
                  ? "url(#heroGrad)"
                  : entry.tag === "fast" || entry.tag === "record"
                    ? "#FFAA32"
                    : getColor(entry.provider, colorMap)
              }
              fillOpacity={entry.hero || entry.tag === "fast" || entry.tag === "record" ? 1 : 0.75}
            />
          ))}
          <LabelList
            dataKey="tps"
            position="right"
            content={({ x, y, width: _w, height: h, value, index }: any) => {
              const row = sorted[index as number];
              if (!row) return null;
              const label =
                typeof value === "number"
                  ? value.toLocaleString()
                  : String(value ?? "");
              const labelColor = row.isCapped ? "#D43D00" : "#888";
              return (
                <text
                  x={(x ?? 0) + (_w ?? 0) + 6}
                  y={(y ?? 0) + (h ?? 0) / 2 + 4}
                  fill={labelColor}
                  fontSize={11}
                  fontFamily={MONO}
                  fontWeight={row.isCapped ? 700 : 600}
                >
                  {label}
                </text>
              );
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
