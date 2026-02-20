import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  Tooltip,
  ZAxis,
} from "recharts";
import type { Model, Provider, Abilities } from "../data/types";
import { buildColorMap, getColor, type ColorMap } from "../data/colors";
import { ModelIcon, ProviderIcon } from "./ui/ProviderIcon";

/* ═══════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════ */

const SLIDE_DURATION_DATA = 12_000;
const SLIDE_DURATION_IMAGE = 5_000;
const FADE_MS = 450;
const W = 2560;
const H = 1080;
const JPY_RATE = 150; // $1 = ¥150

const AID_GRADIENT = ["#3370FE", "#8A3CB8", "#E0247A", "#FF0413"] as const;
const BG = "#08121a";
const MONO = "'Space Mono', monospace";
const SANS = "'Noto Sans JP', sans-serif";

const ABILITY_KEYS: (keyof Abilities)[] = ["planning", "coding", "image", "research", "creative"];
const ABILITY_LABELS: Record<keyof Abilities, string> = {
  planning: "計画力",
  coding: "コーディング",
  image: "画像理解",
  research: "リサーチ",
  creative: "創造性",
};

function toJpy(usd: number): string {
  const yen = Math.round(usd * JPY_RATE);
  return `¥${yen.toLocaleString()}`;
}

/* ═══════════════════════════════════════════════════════
   AID LOGO
   ═══════════════════════════════════════════════════════ */

function AidLogo({ style = {} }: { style?: React.CSSProperties }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return <img src={`${base}rbg_Logomark_white.png`} alt="AI := Driven" style={style} />;
}

/* ═══════════════════════════════════════════════════════
   LIVE CLOCK — updates every second
   ═══════════════════════════════════════════════════════ */

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now.getHours().toString().padStart(2, "0");
  const mins = now.getMinutes().toString().padStart(2, "0");
  const secs = now.getSeconds().toString().padStart(2, "0");
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const dateStr = `${now.getMonth() + 1}/${now.getDate()} (${weekdays[now.getDay()]})`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 28,
          fontWeight: 700,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: 2,
          lineHeight: 1,
        }}>
          {hours}
          <span style={{ opacity: 0.4, animation: "booth-pulse 2s ease-in-out infinite" }}>:</span>
          {mins}
          <span style={{ fontFamily: MONO, fontSize: 18, color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>
            {secs}
          </span>
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 13,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: 1,
          marginTop: 3,
        }}>
          {dateStr}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WEATHER WIDGET — Tokyo ambient display
   ═══════════════════════════════════════════════════════ */

function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; icon: string; desc: string } | null>(null);

  useEffect(() => {
    // Open-Meteo free API — Tokyo coordinates, no API key needed
    const url = "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=temperature_2m,weather_code&timezone=Asia/Tokyo";
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        // WMO weather codes → icon + description
        const weatherMap: Record<number, [string, string]> = {
          0: ["☀️", "快晴"],
          1: ["🌤️", "晴れ"],
          2: ["⛅", "曇り"],
          3: ["☁️", "曇天"],
          45: ["🌫️", "霧"],
          48: ["🌫️", "霧氷"],
          51: ["🌦️", "小雨"],
          53: ["🌧️", "雨"],
          55: ["🌧️", "大雨"],
          61: ["🌧️", "小雨"],
          63: ["🌧️", "雨"],
          65: ["🌧️", "大雨"],
          71: ["🌨️", "小雪"],
          73: ["🌨️", "雪"],
          75: ["❄️", "大雪"],
          80: ["🌦️", "にわか雨"],
          81: ["🌧️", "にわか雨"],
          82: ["⛈️", "豪雨"],
          95: ["⛈️", "雷雨"],
        };
        const [icon, desc] = weatherMap[code] ?? ["🌤️", "晴れ"];
        setWeather({ temp, icon, desc });
      })
      .catch(() => {
        // Fallback if offline
        setWeather({ temp: 12, icon: "🌤️", desc: "晴れ" });
      });
  }, []);

  if (!weather) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <span style={{ fontSize: 22 }}>{weather.icon}</span>
      <div>
        <div style={{
          fontFamily: MONO,
          fontSize: 20,
          fontWeight: 700,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1,
        }}>
          {weather.temp}°C
        </div>
        <div style={{
          fontFamily: SANS,
          fontSize: 12,
          color: "rgba(255,255,255,0.22)",
          marginTop: 2,
        }}>
          東京 · {weather.desc}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PERSISTENT LOGO WATERMARK — shown on every slide
   ═══════════════════════════════════════════════════════ */

function PersistentBranding() {
  return (
    <>
      {/* CENTER WATERMARK — large subtle logo visible on every slide */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 5,
        pointerEvents: "none",
        opacity: 0.025,
      }}>
        <AidLogo style={{ height: 320, width: "auto" }} />
      </div>

      {/* Top-left logo */}
      <div style={{
        position: "absolute",
        top: 32,
        left: 44,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: 22,
      }}>
        <AidLogo style={{ height: 64, width: "auto", opacity: 0.8 }} />
        <div style={{
          width: 1,
          height: 40,
          background: `linear-gradient(180deg, transparent, ${AID_GRADIENT[0]}55, transparent)`,
        }} />
        <div>
          <div style={{
            fontFamily: SANS,
            fontSize: 18,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 3,
          }}>
            AIドリブン推進室
          </div>
          <div style={{
            fontFamily: MONO,
            fontSize: 12,
            color: "rgba(255,255,255,0.22)",
            letterSpacing: 2,
          }}>
            AI DRIVEN OFFICE
          </div>
        </div>
      </div>

      {/* Top-right: clock + weather + live indicator */}
      <div style={{
        position: "absolute",
        top: 32,
        right: 60,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}>
        <WeatherWidget />

        <div style={{
          width: 1,
          height: 36,
          background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)`,
        }} />

        <LiveClock />

        <div style={{
          width: 1,
          height: 36,
          background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)`,
        }} />

        {/* Live pulse dot + label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#00E5A0",
            boxShadow: "0 0 12px rgba(0,229,160,0.6)",
            animation: "booth-pulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: SANS,
            fontSize: 14,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 2,
          }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Bottom-right logo + copyright */}
      <div style={{
        position: "absolute",
        bottom: 38,
        right: 54,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          fontFamily: SANS,
          fontSize: 15,
          color: "rgba(255,255,255,0.22)",
        }}>
          ©CyberAgent, Inc.
        </div>
        <AidLogo style={{ height: 36, width: "auto", opacity: 0.35 }} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════ */

function AnimatedNumber({ value, duration = 2000, suffix = "", decimals = 0, style = {} }: {
  value: number; duration?: number; suffix?: string; decimals?: number; style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    setDisplay(0);
    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span style={style}>{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════════════════ */

function ProgressBar({ current, total }: { current: number; total: number }) {
  // Show 7 dot pairs (each pair = image + data slide)
  const pairIndex = Math.floor(current / 2);
  const numPairs = Math.ceil(total / 2);

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "rgba(255,255,255,0.03)", zIndex: 100 }}>
      <div style={{
        height: "100%",
        width: `${((current + 1) / total) * 100}%`,
        background: `linear-gradient(90deg, ${AID_GRADIENT.join(", ")})`,
        transition: "width 0.5s ease",
        boxShadow: `0 0 20px ${AID_GRADIENT[0]}44`,
      }} />
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 14 }}>
        {Array.from({ length: numPairs }, (_, i) => (
          <div key={i} style={{
            width: i === pairIndex ? 28 : 8,
            height: 8,
            borderRadius: 4,
            background: i === pairIndex ? `linear-gradient(90deg, ${AID_GRADIENT[0]}, ${AID_GRADIENT[2]})` : "rgba(255,255,255,0.08)",
            transition: "all 0.5s ease",
            boxShadow: i === pairIndex ? `0 0 12px ${AID_GRADIENT[0]}66` : "none",
          }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE WRAPPER
   ═══════════════════════════════════════════════════════ */

function SlideContainer({ children, fadePhase }: { children: React.ReactNode; fadePhase: "in" | "visible" | "out" }) {
  return (
    <div style={{
      position: "absolute", inset: 0, width: W, height: H,
      opacity: fadePhase === "out" ? 0 : 1,
      transform: fadePhase === "in" ? "translateY(6px)" : fadePhase === "out" ? "translateY(-6px)" : "translateY(0)",
      transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      overflow: "hidden",
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 0 — タイトル
   ═══════════════════════════════════════════════════════ */

function SlideTitle() {
  return (
    <div style={{ width: W, height: H, position: "relative", display: "flex" }}>
      <div style={{
        position: "relative", zIndex: 10, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", width: "100%", height: "100%", textAlign: "center",
      }}>
        <AidLogo style={{ height: 140, width: "auto", marginBottom: 36, opacity: 0.95 }} />

        <div style={{
          width: 320, height: 3,
          background: `linear-gradient(90deg, transparent, ${AID_GRADIENT[0]}, ${AID_GRADIENT[2]}, ${AID_GRADIENT[3]}, transparent)`,
          marginBottom: 44,
        }} />

        <h1 style={{
          fontFamily: SANS, fontSize: 88, fontWeight: 900, margin: 0, letterSpacing: 4, lineHeight: 1,
          background: `linear-gradient(135deg, #fff 30%, ${AID_GRADIENT[0]} 50%, ${AID_GRADIENT[2]} 80%, ${AID_GRADIENT[3]})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 60px rgba(51,112,254,0.3))",
        }}>
          AIモデル比較
        </h1>

        <p style={{
          fontFamily: SANS, fontSize: 34, fontWeight: 500,
          color: "rgba(255,255,255,0.45)", margin: "20px 0 0", letterSpacing: 6,
        }}>
          速度・価格・能力を一目で比較
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 100, marginTop: 72 }}>
          {[
            { val: "2026.02", label: "データ更新" },
            { val: "7", label: "プロバイダー" },
            { val: "11", label: "AIモデル" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: MONO, fontSize: 52, fontWeight: 700,
                background: `linear-gradient(135deg, ${AID_GRADIENT[i % 4]}, ${AID_GRADIENT[(i + 1) % 4]})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {item.val}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 22, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 1 — スループット
   ═══════════════════════════════════════════════════════ */

function SlideThroughput({ models, colorMap }: { models: Model[]; colorMap: ColorMap }) {
  const sorted = useMemo(() => [...models].sort((a, b) => b.tps - a.tps), [models]);
  const heroModel = sorted[0];

  return (
    <div style={{ width: W, height: H, position: "relative", display: "flex" }}>
      {/* Left panel */}
      <div style={{
        width: 720, height: H, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", position: "relative", zIndex: 10,
      }}>
        <AidLogo style={{ height: 48, width: "auto", opacity: 0.3, marginBottom: 24 }} />

        <div style={{ fontFamily: SANS, fontSize: 22, color: AID_GRADIENT[0], letterSpacing: 4, marginBottom: 20 }}>
          スピードチャンピオン
        </div>

        <div style={{
          fontFamily: MONO, fontSize: 180, fontWeight: 700, lineHeight: 1,
          background: "linear-gradient(135deg, #00E5A0, #00FFC6)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 80px rgba(0,229,160,0.4))",
        }}>
          <AnimatedNumber value={heroModel?.tps ?? 0} duration={2500} />
        </div>

        <div style={{ fontFamily: SANS, fontSize: 28, color: "rgba(255,255,255,0.4)", letterSpacing: 4, marginTop: 4 }}>
          トークン / 秒
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28 }}>
          <ModelIcon modelName={heroModel?.name ?? ""} size={36} className="opacity-80" />
          <span style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: "#fff" }}>
            {heroModel?.name}
          </span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 22, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          {heroModel?.provider}
        </div>
      </div>

      {/* Right panel — chart */}
      <div style={{
        flex: 1, height: H, display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", zIndex: 10, paddingRight: 60,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12, paddingLeft: 24 }}>
          スループット比較
          <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.3)", marginLeft: 16 }}>
            （トークン/秒）
          </span>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: 24, padding: "28px 8px 20px 0",
        }}>
          <BarChart width={1720} height={740} data={sorted} layout="vertical" margin={{ left: 30, right: 90, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#444", fontSize: 16, fontFamily: MONO }} axisLine={{ stroke: "rgba(255,255,255,0.04)" }} tickLine={false} domain={[0, 1100]} />
              <YAxis dataKey="name" type="category" width={220} tick={{ fill: "#888", fontSize: 20, fontFamily: SANS }} axisLine={false} tickLine={false} />
              <Bar dataKey="tps" radius={[0, 8, 8, 0]} barSize={44} isAnimationActive={false}>
                {sorted.map((entry, i) => (
                  <Cell key={i} fill={entry.hero ? "url(#boothHeroGrad)" : entry.tag === "fast" ? "#FFAA32" : getColor(entry.provider, colorMap)} fillOpacity={entry.hero || entry.tag === "fast" ? 1 : 0.7} />
                ))}
                <LabelList
                  dataKey="tps"
                  position="right"
                  formatter={(value) =>
                    typeof value === "number"
                      ? value.toLocaleString()
                      : String(value ?? "")
                  }
                  style={{ fill: "#aaa", fontSize: 20, fontFamily: MONO, fontWeight: 700 }}
                />
              </Bar>
              <defs>
                <linearGradient id="boothHeroGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00E5A0" />
                  <stop offset="100%" stopColor="#00FFC6" />
                </linearGradient>
              </defs>
            </BarChart>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 2 — 価格比較 (¥)
   ═══════════════════════════════════════════════════════ */

function SlidePricing({ models, colorMap }: { models: Model[]; colorMap: ColorMap }) {
  const sorted = useMemo(() =>
    [...models].filter(m => m.tag !== "fast").sort((a, b) => a.output - b.output),
    [models]
  );
  const cheapest = sorted[0];

  return (
    <div style={{ width: W, height: H, position: "relative", display: "flex" }}>
      {/* Left panel */}
      <div style={{
        width: 720, height: H, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", position: "relative", zIndex: 10,
      }}>
        <AidLogo style={{ height: 48, width: "auto", opacity: 0.3, marginBottom: 24 }} />

        <div style={{ fontFamily: SANS, fontSize: 22, color: AID_GRADIENT[3], letterSpacing: 4, marginBottom: 20 }}>
          最安チャンピオン
        </div>

        <div style={{
          fontFamily: MONO, fontSize: 130, fontWeight: 700, lineHeight: 1,
          background: `linear-gradient(135deg, ${AID_GRADIENT[3]}, ${AID_GRADIENT[2]})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: `drop-shadow(0 0 60px ${AID_GRADIENT[3]}44)`,
        }}>
          {toJpy(cheapest?.output ?? 0)}
        </div>

        <div style={{ fontFamily: SANS, fontSize: 24, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginTop: 10 }}>
          100万トークンあたり（出力）
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28 }}>
          <ModelIcon modelName={cheapest?.name ?? ""} size={36} className="opacity-80" />
          <span style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: "#fff" }}>
            {cheapest?.name}
          </span>
        </div>

        {/* Price grid */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 36px", width: 540 }}>
          {sorted.slice(0, 6).map((m, i) => (
            <div key={m.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderRadius: 14,
              background: i === 0 ? "rgba(255,4,19,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${i === 0 ? "rgba(255,4,19,0.15)" : "rgba(255,255,255,0.04)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ModelIcon modelName={m.name} size={20} className="opacity-70" />
                <span style={{ fontFamily: SANS, fontSize: 18, color: i === 0 ? "#FF3640" : "#aaa", fontWeight: 600 }}>
                  {m.name}
                </span>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 20, color: i === 0 ? "#FF3640" : "#666", fontWeight: 700 }}>
                {toJpy(m.output)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — chart */}
      <div style={{
        flex: 1, height: H, display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", zIndex: 10, paddingRight: 60,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12, paddingLeft: 24 }}>
          出力価格比較
          <span style={{ fontSize: 20, fontWeight: 400, color: "rgba(255,255,255,0.3)", marginLeft: 16 }}>
            （円/100万トークン）
          </span>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: 24, padding: "28px 8px 20px 0",
        }}>
          <BarChart width={1720} height={740} data={sorted.map(m => ({ ...m, outputJpy: Math.round(m.output * JPY_RATE) }))} layout="vertical" margin={{ left: 30, right: 100, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#444", fontSize: 16, fontFamily: MONO }} axisLine={{ stroke: "rgba(255,255,255,0.04)" }} tickLine={false} />
              <YAxis dataKey="name" type="category" width={220} tick={{ fill: "#888", fontSize: 20, fontFamily: SANS }} axisLine={false} tickLine={false} />
              <Bar dataKey="outputJpy" radius={[0, 8, 8, 0]} barSize={44} isAnimationActive={false}>
                {sorted.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? AID_GRADIENT[3] : getColor(entry.provider, colorMap)} fillOpacity={i === 0 ? 1 : 0.6} />
                ))}
                <LabelList
                  dataKey="outputJpy"
                  position="right"
                  formatter={(value) =>
                    typeof value === "number"
                      ? `¥${value.toLocaleString()}`
                      : String(value ?? "")
                  }
                  style={{ fill: "#aaa", fontSize: 20, fontFamily: MONO, fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 3 — 能力レーダー
   ═══════════════════════════════════════════════════════ */

function SlideAbilities({ models, colorMap }: { models: Model[]; colorMap: ColorMap }) {
  const nonFast = useMemo(() => models.filter(m => m.tag !== "fast"), [models]);
  const top5 = useMemo(() => {
    const scored = nonFast.map(m => ({
      ...m,
      total: Object.values(m.abilities).reduce((a, b) => a + b, 0),
      avg: Object.values(m.abilities).reduce((a, b) => a + b, 0) / 5,
    }));
    scored.sort((a, b) => b.total - a.total);
    return scored.slice(0, 5);
  }, [nonFast]);

  const radarData = ABILITY_KEYS.map(key => {
    const point: Record<string, any> = { ability: key, label: ABILITY_LABELS[key], fullMark: 100 };
    top5.forEach(m => { point[m.name] = m.abilities[key]; });
    return point;
  });

  return (
    <div style={{ width: W, height: H, position: "relative", display: "flex" }}>
      {/* Left — radar */}
      <div style={{
        width: W * 0.55, height: H, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", position: "relative", zIndex: 10,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          モデル能力スコア
        </div>
        <div style={{ fontFamily: SANS, fontSize: 18, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
          上位5モデル · 能力レーダーチャート
        </div>

        <RadarChart width={1380} height={800} data={radarData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "#999", fontSize: 22, fontFamily: SANS }} />
            <PolarRadiusAxis angle={90} domain={[60, 100]} tick={{ fill: "#333", fontSize: 14, fontFamily: MONO }} tickCount={5} stroke="rgba(255,255,255,0.04)" />
            {top5.map(m => {
              const color = getColor(m.provider, colorMap);
              return (
                <Radar key={m.name} name={m.name} dataKey={m.name} stroke={color} fill={color} fillOpacity={0.08} strokeWidth={2.5} isAnimationActive={false} dot={{ r: 5, fill: color, fillOpacity: 0.9 }} />
              );
            })}
          </RadarChart>
      </div>

      {/* Right — leaderboard */}
      <div style={{
        flex: 1, height: H, display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", zIndex: 10, paddingRight: 80,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 22, color: AID_GRADIENT[0], letterSpacing: 3, marginBottom: 28 }}>
          総合ランキング
        </div>

        {top5.map((m, i) => {
          const color = getColor(m.provider, colorMap);
          return (
            <div key={m.name} style={{
              display: "flex", alignItems: "center", gap: 20, padding: "22px 28px", marginBottom: 14, borderRadius: 18,
              background: i === 0 ? "rgba(0,229,160,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${i === 0 ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.04)"}`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 42, fontWeight: 700, width: 64, textAlign: "center", color: i === 0 ? "#00E5A0" : "rgba(255,255,255,0.15)" }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ModelIcon modelName={m.name} size={28} className="opacity-80" />
                  <span style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: i === 0 ? "#00E5A0" : "#ccc" }}>
                    {m.name}
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 18, color, marginLeft: 8 }}>
                    {m.provider}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {ABILITY_KEYS.map(key => (
                    <div key={key} style={{ flex: 1 }}>
                      <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                        {ABILITY_LABELS[key]}
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${m.abilities[key]}%`, borderRadius: 3, background: color, opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: MONO, fontSize: 42, fontWeight: 700, color: i === 0 ? "#00E5A0" : "#fff" }}>
                  {m.avg.toFixed(1)}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                  平均
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 4 — 速度 vs コスト
   ═══════════════════════════════════════════════════════ */

function SlideScatter({ models, colorMap }: { models: Model[]; colorMap: ColorMap }) {
  const plotData = useMemo(() =>
    models.filter(m => m.tag !== "fast").map(m => ({
      ...m, x: m.tps, y: Math.round(m.output * JPY_RATE),
      z: Object.values(m.abilities).reduce((a, b) => a + b, 0) / 5,
    })),
    [models]
  );

  return (
    <div style={{ width: W, height: H, position: "relative", display: "flex" }}>
      <div style={{
        width: "100%", height: H, display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", zIndex: 10, padding: "0 80px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 20 }}>
          <span style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: "#fff" }}>
            速度 vs 出力コスト
          </span>
          <span style={{ fontFamily: SANS, fontSize: 20, color: "rgba(255,255,255,0.3)" }}>
            右下が理想的（高速＆低コスト）
          </span>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: 24, padding: "36px 28px 20px", position: "relative",
        }}>
          <ScatterChart width={2340} height={780} margin={{ left: 20, right: 40, top: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="x" type="number" name="TPS"
                tick={{ fill: "#555", fontSize: 16, fontFamily: MONO }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false}
                label={{ value: "スループット (tps) →", position: "bottom", fill: "#555", fontSize: 18, fontFamily: SANS }}
              />
              <YAxis dataKey="y" type="number" name="出力コスト"
                tick={{ fill: "#555", fontSize: 16, fontFamily: MONO }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false}
                label={{ value: "出力 ¥/M ↑", angle: -90, position: "insideLeft", fill: "#555", fontSize: 18, fontFamily: SANS }}
              />
              <ZAxis dataKey="z" range={[300, 900]} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: "rgba(10,10,18,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 20px" }}>
                    <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: "#fff" }}>{d.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 18, color: "#888", marginTop: 6 }}>
                      {d.tps.toLocaleString()} tps · {toJpy(d.output)}/M
                    </div>
                  </div>
                );
              }} />
              <Scatter data={plotData} isAnimationActive={false}>
                {plotData.map((entry, i) => (
                  <Cell key={i} fill={getColor(entry.provider, colorMap)} fillOpacity={0.8} stroke={getColor(entry.provider, colorMap)} strokeWidth={2} />
                ))}
              </Scatter>
            </ScatterChart>

          {/* Legend */}
          <div style={{ position: "absolute", bottom: 80, right: 80, display: "flex", flexWrap: "wrap", gap: 14, maxWidth: 700 }}>
            {plotData.map(m => (
              <div key={m.name} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
                borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: getColor(m.provider, colorMap) }} />
                <span style={{ fontFamily: SANS, fontSize: 16, color: "#888" }}>{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 5 — 全モデルカード
   ═══════════════════════════════════════════════════════ */

function SlideModelCards({ models, colorMap }: { models: Model[]; colorMap: ColorMap }) {
  const nonFast = useMemo(() => models.filter(m => m.tag !== "fast").sort((a, b) => b.tps - a.tps), [models]);

  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <div style={{
        position: "relative", zIndex: 10, width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px",
      }}>
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <span style={{ fontFamily: SANS, fontSize: 40, fontWeight: 700, color: "#fff" }}>
            全モデル一覧
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(nonFast.length, 5)}, 1fr)`, gap: 22, width: "100%" }}>
          {nonFast.slice(0, 10).map((m, i) => {
            const color = getColor(m.provider, colorMap);
            const avg = Object.values(m.abilities).reduce((a, b) => a + b, 0) / 5;
            return (
              <div key={m.name} style={{
                background: `linear-gradient(180deg, ${color}08, ${color}03)`,
                border: `1px solid ${color}22`, borderRadius: 22, padding: "28px 24px",
                display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 16, right: 16, fontFamily: MONO, fontSize: 40, fontWeight: 700, color: `${color}20`, lineHeight: 1 }}>
                  #{i + 1}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <ModelIcon modelName={m.name} size={26} className="opacity-80" />
                    <span style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: "#fff" }}>{m.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ProviderIcon providerId={m.providerId} size={16} className="opacity-50" />
                    <span style={{ fontFamily: SANS, fontSize: 16, color }}>{m.provider}</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: m.hero ? "#00E5A0" : "#fff" }}>
                      {m.tps.toLocaleString()}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>トークン/秒</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: "#ccc" }}>
                      {toJpy(m.output)}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>出力/M</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ABILITY_KEYS.map(key => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,0.35)", width: 70 }}>
                        {ABILITY_LABELS[key]}
                      </span>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${m.abilities[key]}%`, borderRadius: 3, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 14, color: "rgba(255,255,255,0.5)", width: 28, textAlign: "right" }}>
                        {m.abilities[key]}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "auto", textAlign: "center", padding: "10px 0", borderTop: `1px solid ${color}15` }}>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>平均 </span>
                  <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color }}>{avg.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SLIDE 6 — クロージング (BIGGER LOGO)
   ═══════════════════════════════════════════════════════ */

function SlideClosing() {
  return (
    <div style={{ width: W, height: H, position: "relative" }}>
      <div style={{
        position: "relative", zIndex: 10, width: "100%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center",
      }}>
        {/* Much bigger logo for closing slide */}
        <AidLogo style={{
          height: 200,
          width: "auto",
          marginBottom: 44,
          opacity: 0.95,
          filter: "drop-shadow(0 0 80px rgba(51,112,254,0.4))",
        }} />

        <div style={{
          width: 500, height: 3,
          background: `linear-gradient(90deg, transparent, ${AID_GRADIENT[0]}, ${AID_GRADIENT[2]}, ${AID_GRADIENT[3]}, transparent)`,
          marginBottom: 52,
        }} />

        <h2 style={{
          fontFamily: SANS, fontSize: 68, fontWeight: 900, margin: 0, color: "#fff", letterSpacing: 4,
        }}>
          お気軽にお声がけください
        </h2>
        <p style={{
          fontFamily: SANS, fontSize: 32, color: "rgba(255,255,255,0.45)", marginTop: 16, letterSpacing: 2,
        }}>
          デモ・詳細についてご質問をお待ちしております
        </p>

        <div style={{ marginTop: 72, display: "flex", gap: 60 }}>
          {[
            { icon: "🔍", label: "インタラクティブ版", sub: "Webで全データを操作", url: "ai-driven-office.github.io" },
            { icon: "🏢", label: "AIドリブン推進室", sub: "CyberAgent, Inc.", url: "" },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "32px 36px", borderRadius: 22,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", width: 340,
            }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>{item.icon}</div>
              <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, color: "#fff" }}>{item.label}</div>
              <div style={{ fontFamily: SANS, fontSize: 18, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{item.sub}</div>
              {item.url && (
                <div style={{ fontFamily: MONO, fontSize: 14, color: AID_GRADIENT[0], marginTop: 12, letterSpacing: 1 }}>
                  {item.url}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   IMAGE INTERSTITIAL SLIDE
   ═══════════════════════════════════════════════════════ */

function SlideImage({ src, caption }: { src: string; caption?: string }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return (
    <div style={{
      width: W, height: H, position: "relative", overflow: "hidden", background: BG,
      perspective: 1200,
      transformStyle: "preserve-3d" as const,
    }}>
      {/* Ken Burns 3D zoom + fade-in */}
      <img
        src={`${base}booth/${src}`}
        alt=""
        style={{
          width: W,
          height: H,
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          animation: `booth-img-fade-in 1.2s ease-out, booth-ken-burns ${SLIDE_DURATION_IMAGE / 1000}s ease-out forwards`,
          willChange: "transform, opacity",
          transformOrigin: "60% 40%",
        }}
      />

      {/* Dark vignette for brand consistency */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at center, transparent 30%, ${BG}bb 90%, ${BG} 100%)`,
        pointerEvents: "none",
      }} />

      {/* Subtle bottom gradient for logo area */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 280,
        background: `linear-gradient(to top, ${BG}ee 0%, ${BG}88 40%, transparent 100%)`,
        pointerEvents: "none",
      }} />

      {/* Center logo watermark — larger and more prominent than data slides */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        animation: "booth-img-fade-in 2s ease-out",
        pointerEvents: "none",
      }}>
        <AidLogo style={{ height: 180, width: "auto", opacity: 0.12, filter: "drop-shadow(0 0 40px rgba(51,112,254,0.2))" }} />
        <div style={{
          width: 200, height: 2,
          background: `linear-gradient(90deg, transparent, ${AID_GRADIENT[0]}44, transparent)`,
        }} />
        <div style={{
          fontFamily: SANS,
          fontSize: 20,
          fontWeight: 600,
          color: "rgba(255,255,255,0.15)",
          letterSpacing: 8,
          textTransform: "uppercase",
        }}>
          AI Driven Office
        </div>
      </div>

      {/* Optional caption — bottom center */}
      {caption && (
        <div style={{
          position: "absolute",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: SANS,
          fontSize: 24,
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: 6,
          animation: "booth-img-fade-in 2.5s ease-out",
          pointerEvents: "none",
        }}>
          {caption}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   IMAGE SLIDE INDICES — used for variable timing
   ═══════════════════════════════════════════════════════ */

const IMAGE_SLIDE_INDICES = new Set([0, 2, 4, 6, 8, 10, 12]);

function getSlideDuration(slideIndex: number): number {
  return IMAGE_SLIDE_INDICES.has(slideIndex) ? SLIDE_DURATION_IMAGE : SLIDE_DURATION_DATA;
}

/* ═══════════════════════════════════════════════════════
   メインスライドショーコントローラー
   ═══════════════════════════════════════════════════════ */

interface Props {
  models: Model[];
  providers: Provider[];
  i18n: Record<string, Record<string, string>>;
}

export default function BoothSlideshow({ models, providers }: Props) {
  const colorMap = useMemo(() => buildColorMap(providers), [providers]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadePhase, setFadePhase] = useState<"in" | "visible" | "out">("in");
  const [viewport, setViewport] = useState({ width: W, height: H });
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitioningRef = useRef(false);
  const currentSlideRef = useRef(0);

  const TOTAL_SLIDES = 14;

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Keep ref in sync with state
  useEffect(() => { currentSlideRef.current = currentSlide; }, [currentSlide]);

  // Transition to a specific slide with fade animation
  const goToSlide = useCallback((targetSlide: number) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setFadePhase("out");
    slideTimerRef.current = setTimeout(() => {
      setCurrentSlide(targetSlide);
      setFadePhase("in");
      setTimeout(() => {
        setFadePhase("visible");
        transitioningRef.current = false;
      }, 50);
    }, FADE_MS);
  }, []);

  // Start or restart auto-advance timer (variable duration per slide)
  const scheduleNext = useCallback(() => {
    if (autoIntervalRef.current) clearTimeout(autoIntervalRef.current);
    const duration = getSlideDuration(currentSlideRef.current);
    autoIntervalRef.current = setTimeout(() => {
      const next = (currentSlideRef.current + 1) % TOTAL_SLIDES;
      goToSlide(next);
      // After transition completes, schedule the next one
      setTimeout(() => scheduleNext(), FADE_MS + 100);
    }, duration);
  }, [goToSlide]);

  const resetAutoAdvance = useCallback(() => {
    if (autoIntervalRef.current) clearTimeout(autoIntervalRef.current);
    scheduleNext();
  }, [scheduleNext]);

  // Initial setup: fade in + progress bar + auto-advance
  useEffect(() => {
    setTimeout(() => setFadePhase("visible"), 100);

    resetAutoAdvance();

    return () => {
      if (autoIntervalRef.current) clearTimeout(autoIntervalRef.current);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [resetAutoAdvance]);

  // Keyboard navigation: ← → arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = (currentSlideRef.current + 1) % TOTAL_SLIDES;
        goToSlide(next);
        resetAutoAdvance();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = (currentSlideRef.current - 1 + TOTAL_SLIDES) % TOTAL_SLIDES;
        goToSlide(prev);
        resetAutoAdvance();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToSlide, resetAutoAdvance]);

  const slides = [
    <SlideImage key="img-hero" src="booth_hero.jpg" />,                         // 0  IMAGE
    <SlideTitle key="title" />,                                                  // 1  DATA
    <SlideImage key="img-speed" src="booth_speed.jpg" caption="速度" />,         // 2  IMAGE
    <SlideThroughput key="throughput" models={models} colorMap={colorMap} />,     // 3  DATA
    <SlideImage key="img-cost" src="booth_cost.jpg" caption="コスト" />,         // 4  IMAGE
    <SlidePricing key="pricing" models={models} colorMap={colorMap} />,          // 5  DATA
    <SlideImage key="img-intel" src="booth_intelligence.jpg" caption="知性" />,  // 6  IMAGE
    <SlideAbilities key="abilities" models={models} colorMap={colorMap} />,       // 7  DATA
    <SlideImage key="img-analysis" src="booth_analysis.jpg" caption="分析" />,   // 8  IMAGE
    <SlideScatter key="scatter" models={models} colorMap={colorMap} />,          // 9  DATA
    <SlideImage key="img-models" src="booth_models.jpg" caption="モデル" />,     // 10 IMAGE
    <SlideModelCards key="cards" models={models} colorMap={colorMap} />,          // 11 DATA
    <SlideImage key="img-future" src="booth_future.jpg" caption="未来" />,       // 12 IMAGE
    <SlideClosing key="closing" />,                                              // 13 DATA
  ];

  const stageScaleRaw = Math.min(viewport.width / W, viewport.height / H);
  const stageScale = Number.isFinite(stageScaleRaw) && stageScaleRaw > 0 ? stageScaleRaw : 1;

  return (
    <div suppressHydrationWarning style={{
      width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: BG, fontFamily: SANS,
    }}>
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: W,
        height: H,
        transform: `translate(-50%, -50%) scale(${stageScale})`,
        transformOrigin: "center center",
        overflow: "hidden",
      }}>
        <SlideContainer fadePhase={fadePhase}>
          {slides[currentSlide]}
        </SlideContainer>

        {/* Persistent branding on ALL slides */}
        <PersistentBranding />

        <ProgressBar current={currentSlide} total={TOTAL_SLIDES} />
      </div>
    </div>
  );
}
