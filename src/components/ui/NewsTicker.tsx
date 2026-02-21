import type { CSSProperties } from "react";

interface Props {
  text: string;
  /** Variant: "dashboard" for the main site, "booth" for the fullscreen booth display */
  variant?: "dashboard" | "booth";
}

export default function NewsTicker({ text, variant = "dashboard" }: Props) {
  const isDash = variant === "dashboard";
  const height = isDash ? 36 : 52;
  const fontSize = isDash ? 12 : 20;

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

  return (
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

      <div style={{
        flex: 1,
        padding: isDash ? "0 16px" : "0 24px",
        fontFamily: "'Inter', sans-serif",
        fontSize,
        color: "rgba(255,255,255,0.55)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {text}
      </div>

      <div style={{
        paddingRight: isDash ? 12 : 20,
        flexShrink: 0,
        color: "rgba(255,255,255,0.2)",
        fontSize: isDash ? 12 : 16,
      }}>
        ↓
      </div>
    </a>
  );
}
