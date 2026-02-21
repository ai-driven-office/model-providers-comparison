import type { CSSProperties } from "react";

interface TickerItem {
  text: string;
  href?: string;
  highlight?: boolean;
}

interface Props {
  items: TickerItem[];
  /** Variant: "dashboard" for the main site, "booth" for the fullscreen booth display */
  variant?: "dashboard" | "booth";
}

export default function NewsTicker({ items, variant = "dashboard" }: Props) {
  const isDash = variant === "dashboard";
  const height = isDash ? 36 : 52;
  const fontSize = isDash ? 12 : 20;
  const speed = isDash ? 35 : 50; // seconds for full scroll

  // Repeat items enough times that the scroll is seamless
  const repeated = [...items, ...items, ...items];

  const containerStyle: CSSProperties = {
    width: "100%",
    height,
    overflow: "hidden",
    position: "relative",
    borderRadius: isDash ? 10 : 0,
    background: isDash
      ? "linear-gradient(90deg, rgba(255,106,0,0.06) 0%, rgba(255,4,19,0.04) 50%, rgba(255,106,0,0.06) 100%)"
      : "linear-gradient(90deg, rgba(255,106,0,0.12) 0%, rgba(255,4,19,0.08) 50%, rgba(255,106,0,0.12) 100%)",
    border: isDash ? "1px solid rgba(255,106,0,0.15)" : "none",
    borderBottom: isDash ? undefined : "1px solid rgba(255,106,0,0.2)",
    borderTop: isDash ? undefined : "1px solid rgba(255,106,0,0.2)",
  };

  const badgeStyle: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: isDash ? 6 : 10,
    padding: isDash ? "0 12px" : "0 22px",
    background: "linear-gradient(135deg, #FF6A00, #FF0413)",
    fontFamily: "'Space Mono', monospace",
    fontSize: isDash ? 10 : 16,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: isDash ? 1.5 : 2,
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
  };

  const dotStyle: CSSProperties = {
    width: isDash ? 6 : 8,
    height: isDash ? 6 : 8,
    borderRadius: "50%",
    background: "#fff",
    animation: "ticker-pulse 1.5s ease-in-out infinite",
  };

  const trackStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: "100%",
    animation: `ticker-scroll ${speed}s linear infinite`,
    paddingLeft: isDash ? 100 : 140,
    whiteSpace: "nowrap" as const,
  };

  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes ticker-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <div style={containerStyle}>
        <div style={badgeStyle}>
          <div style={dotStyle} />
          <span>BREAKING</span>
        </div>

        {/* Fade edges */}
        <div style={{
          position: "absolute",
          left: isDash ? 95 : 130,
          top: 0,
          bottom: 0,
          width: isDash ? 30 : 50,
          background: isDash
            ? "linear-gradient(90deg, rgba(255,106,0,0.06), transparent)"
            : "linear-gradient(90deg, rgba(255,106,0,0.12), transparent)",
          zIndex: 5,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: isDash ? 40 : 60,
          background: isDash
            ? "linear-gradient(270deg, rgba(255,106,0,0.06), transparent)"
            : "linear-gradient(270deg, rgba(255,106,0,0.12), transparent)",
          zIndex: 5,
          pointerEvents: "none",
        }} />

        <div style={trackStyle}>
          {repeated.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: isDash ? 8 : 14, marginRight: isDash ? 32 : 50 }}>
              {item.highlight ? (
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize,
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #FF6A00, #FF0413)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 8px rgba(255,106,0,0.3))",
                }}>
                  {item.text}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize,
                    color: "#FF8C3A",
                    textDecoration: "underline",
                    textDecorationColor: "rgba(255,106,0,0.3)",
                    textUnderlineOffset: 3,
                  }}
                >
                  {item.text}
                </a>
              ) : (
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize,
                  color: "rgba(255,255,255,0.65)",
                }}>
                  {item.text}
                </span>
              )}
              <span style={{ color: "rgba(255,106,0,0.25)", fontSize: isDash ? 10 : 16 }}>///</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
