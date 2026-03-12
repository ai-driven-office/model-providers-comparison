import type { CSSProperties, ReactNode } from "react";

interface Props {
  text?: string;
  items?: { text: string; highlight?: boolean }[];
  /** Variant: "dashboard" for the main site, "booth" for the fullscreen booth display */
  variant?: "dashboard" | "booth";
}

function renderTickerItems(
  tickerItems: { text: string; highlight?: boolean }[],
  isDash: boolean,
): ReactNode {
  return tickerItems.map((item, index) => (
    <span
      key={`${item.text}-${index}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isDash ? 8 : 14,
        color: item.highlight ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.58)",
        fontWeight: item.highlight ? 700 : 500,
        whiteSpace: "nowrap",
      }}
    >
      {index > 0 && (
        <span
          aria-hidden="true"
          style={{
            color: "rgba(92,141,254,0.45)",
            fontWeight: 400,
          }}
        >
          •
        </span>
      )}
      <span>{item.text}</span>
    </span>
  ));
}

export default function NewsTicker({ text, items, variant = "dashboard" }: Props) {
  const isDash = variant === "dashboard";
  const height = isDash ? 36 : 52;
  const fontSize = isDash ? 12 : 20;
  const tickerItems = items?.length ? items : text ? [{ text }] : [];
  const tickerText = tickerItems.map((item) => item.text).join(" • ");
  const useMarquee = !isDash && tickerItems.length > 1;

  const containerStyle: CSSProperties = {
    width: "100%",
    height,
    overflow: "hidden",
    position: "relative",
    borderRadius: isDash ? 10 : 0,
    background: isDash ? "rgba(51,112,254,0.04)" : "rgba(51,112,254,0.08)",
    border: isDash ? "1px solid rgba(51,112,254,0.1)" : "none",
    borderBottom: isDash ? undefined : "1px solid rgba(51,112,254,0.15)",
    borderTop: isDash ? undefined : "1px solid rgba(51,112,254,0.15)",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
    transition: "background 200ms ease, border-color 200ms ease",
  };

  const badgeStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: isDash ? 6 : 10,
    padding: isDash ? "0 12px" : "0 22px",
    height: "100%",
    background: "rgba(51,112,254,0.12)",
    borderRight: "1px solid rgba(51,112,254,0.1)",
    fontFamily: "'Space Mono', monospace",
    fontSize: isDash ? 9 : 14,
    fontWeight: 700,
    color: "#5C8DFE",
    letterSpacing: isDash ? 1.5 : 2,
    textTransform: "uppercase" as const,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  };

  const dotStyle: CSSProperties = {
    width: isDash ? 5 : 7,
    height: isDash ? 5 : 7,
    borderRadius: "50%",
    background: "#5C8DFE",
    opacity: 0.6,
  };

  const contentStyle: CSSProperties = {
    flex: 1,
    padding: isDash ? "0 16px" : "0 24px",
    fontFamily: "'Inter', sans-serif",
    fontSize,
    color: "rgba(255,255,255,0.55)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const marqueeTrackStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "max-content",
    minWidth: "100%",
    animation: "news-ticker-marquee 32s linear infinite",
  };

  const marqueeContentStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: isDash ? 12 : 24,
    paddingRight: isDash ? 12 : 32,
  };

  return (
    <>
      <style>{`
        @keyframes news-ticker-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .news-ticker-marquee {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
      <a
        href="#news"
        style={containerStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDash
            ? "rgba(51,112,254,0.07)"
            : "rgba(51,112,254,0.12)";
          e.currentTarget.style.borderColor = "rgba(51,112,254,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDash
            ? "rgba(51,112,254,0.04)"
            : "rgba(51,112,254,0.08)";
          e.currentTarget.style.borderColor = isDash
            ? "rgba(51,112,254,0.1)"
            : "rgba(51,112,254,0.15)";
        }}
      >
        <div style={badgeStyle}>
          <div style={dotStyle} />
          <span>NEW</span>
        </div>

        <div style={contentStyle}>
          {useMarquee ? (
            <div className="news-ticker-marquee" style={marqueeTrackStyle}>
              <div style={marqueeContentStyle}>
                {renderTickerItems(tickerItems, isDash)}
              </div>
              <div style={marqueeContentStyle} aria-hidden="true">
                {renderTickerItems(tickerItems, isDash)}
              </div>
            </div>
          ) : (
            tickerText
          )}
        </div>

        <div
          style={{
            paddingRight: isDash ? 12 : 20,
            flexShrink: 0,
            color: "rgba(255,255,255,0.2)",
            fontSize: isDash ? 12 : 16,
          }}
        >
          ↓
        </div>
      </a>
    </>
  );
}
