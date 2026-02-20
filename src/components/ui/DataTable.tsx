import type { Model } from "../../data/types";
import { getColor } from "../../data/colors";

interface Props {
  data: Model[];
  lang: string;
  labels: {
    colModel: string;
    colProvider: string;
    colTPS: string;
    colInput: string;
    colOutput: string;
  };
}

export default function DataTable({ data, lang, labels }: Props) {
  const sorted = [...data].sort((a, b) => b.tps - a.tps);
  const isJa = lang === "ja";
  const headerFont = isJa
    ? "'Noto Sans JP', sans-serif"
    : "'Space Mono', monospace";

  return (
    <div className="mt-7 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {[
              labels.colModel,
              labels.colProvider,
              labels.colTPS,
              labels.colInput,
              labels.colOutput,
            ].map((h) => (
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
                  : m.tag === "fast"
                    ? "rgba(255,170,50,0.04)"
                    : "transparent",
              }}
            >
              <td className="px-4 py-2.5 font-semibold">
                <span
                  style={{
                    color: m.hero
                      ? "#00E5A0"
                      : m.tag === "fast"
                        ? "#FFAA32"
                        : "#ccc",
                  }}
                >
                  {m.hero && "\ud83c\udfc6 "}
                  {m.name}
                </span>
                {m.tag === "fast" && (
                  <span className="ml-1.5 inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    FAST
                  </span>
                )}
              </td>
              <td
                className="px-4 py-2.5"
                style={{
                  color:
                    m.tag === "fast" ? "#FFAA32" : getColor(m.provider),
                }}
              >
                {m.provider}
              </td>
              <td
                className="px-4 py-2.5 font-mono font-bold"
                style={{
                  color: m.hero
                    ? "#00E5A0"
                    : m.tag === "fast"
                      ? "#FFAA32"
                      : "#fff",
                }}
              >
                {m.tps.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 font-mono text-gray-400">
                ${m.input}
              </td>
              <td className="px-4 py-2.5 font-mono text-gray-400">
                ${m.output}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
