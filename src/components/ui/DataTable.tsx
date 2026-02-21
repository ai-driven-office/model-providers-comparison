import { Trophy } from "lucide-react";
import type { Model } from "../../data/types";
import { getColor, type ColorMap } from "../../data/colors";
import { formatPrice, type Lang } from "../../data/i18n";
import { ModelIcon, ProviderIcon } from "./ProviderIcon";

interface Props {
  data: Model[];
  lang: Lang;
  colorMap: ColorMap;
  labels: {
    colModel: string;
    colProvider: string;
    colTPS: string;
    colInput: string;
    colOutput: string;
    colInputLong: string;
    colOutputLong: string;
  };
}

export default function DataTable({ data, lang, colorMap, labels }: Props) {
  const sorted = [...data].sort((a, b) => b.tps - a.tps);
  const hasLongContext = data.some((m) => m.inputLong != null);
  const isJa = lang === "ja";
  const headerFont = isJa
    ? "'Noto Sans JP', sans-serif"
    : "'Space Mono', monospace";

  const headers = [
    labels.colModel,
    labels.colProvider,
    labels.colTPS,
    labels.colInput,
    labels.colOutput,
    ...(hasLongContext ? [labels.colInputLong, labels.colOutputLong] : []),
  ];

  return (
    <div className="mt-5 sm:mt-7 bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full border-collapse text-xs min-w-[600px]">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-gray-500 font-semibold tracking-wider"
                style={{
                  fontFamily: headerFont,
                  fontSize: 10,
                  textTransform: isJa ? "none" : "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((m, i) => (
            <tr
              key={i}
              className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
              style={{
                background: m.hero
                  ? "rgba(0,229,160,0.04)"
                  : m.tag === "fast" || m.tag === "record"
                    ? "rgba(255,170,50,0.04)"
                    : "transparent",
              }}
            >
              <td className="px-4 py-2.5 font-semibold">
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    color: m.hero
                      ? "#00E5A0"
                      : m.tag === "fast" || m.tag === "record"
                        ? "#FFAA32"
                        : "#ccc",
                  }}
                >
                  {m.hero && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  <ModelIcon modelName={m.name} size={15} className="shrink-0 opacity-70" />
                  {m.name}
                </span>
                {m.tag === "fast" && (
                  <span className="ml-1.5 inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    FAST
                  </span>
                )}
                {m.link && (
                  <a
                    href={m.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1.5 inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wide no-underline transition-opacity hover:opacity-80"
                    style={{
                      background: "rgba(255,106,0,0.12)",
                      color: "#FF6A00",
                      border: "1px solid rgba(255,106,0,0.3)",
                    }}
                  >
                    {isJa ? "無料体験 →" : "Try free →"}
                  </a>
                )}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    color:
                      m.tag === "fast" || m.tag === "record"
                        ? "#FFAA32"
                        : getColor(m.provider, colorMap),
                  }}
                >
                  <ProviderIcon providerId={m.providerId} size={14} className="shrink-0 opacity-60" />
                  {m.provider}
                </span>
              </td>
              <td
                className="px-4 py-2.5 font-mono font-bold"
                style={{
                  color: m.hero
                    ? "#00E5A0"
                    : m.tag === "fast" || m.tag === "record"
                      ? "#FFAA32"
                      : "#fff",
                }}
              >
                {m.tps.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 font-mono text-gray-400">
                {formatPrice(m.input, lang)}
              </td>
              <td className="px-4 py-2.5 font-mono text-gray-400">
                {formatPrice(m.output, lang)}
              </td>
              {hasLongContext && (
                <td className="px-4 py-2.5 font-mono text-gray-400">
                  {m.inputLong != null ? (
                    <span className="text-orange-300/80">{formatPrice(m.inputLong, lang)}</span>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </td>
              )}
              {hasLongContext && (
                <td className="px-4 py-2.5 font-mono text-gray-400">
                  {m.outputLong != null ? (
                    <span className="text-orange-300/80">{formatPrice(m.outputLong, lang)}</span>
                  ) : (
                    <span className="text-gray-700">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
