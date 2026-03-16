/* @refresh reset */
import { useState, useEffect, useRef, type ReactNode, type WheelEvent as ReactWheelEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Zap, Code2, Beaker, Shield, Layers, GitBranch, Terminal, BookOpen, Cpu, FlaskConical, Sparkles, FileCheck, Shuffle, Lock, ArrowRight, Paintbrush, FileText, ExternalLink, PenTool, TestTube, CheckCircle, BookMarked, BrainCircuit, Eraser } from "lucide-react";
import type { Lang } from "../../data/i18n";
import {
  DEFAULT_COMPARISON_LANGS,
  LANG_COLORS,
  LANG_LABELS,
  LANG_MONOGRAMS,
  LANG_ORDER,
  LANG_SHIKI,
} from "./data/languageMeta";
import type {
  CodeAnnotation,
  CodeSample,
  CodeSampleIconId,
  DifficultyDatum,
  HighlightMap,
  LangId,
  LanguagePromptPageContent,
  PrincipleIconId,
} from "./data/types";
import PaperEmbed from "./PaperEmbed";

/* ── Typography constants ── */
const MONO = "'Space Mono', monospace";
const CODE_FONT = "'JetBrains Mono', 'Fira Code', 'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";
const JA_SANS = "'Zen Kaku Gothic New', sans-serif";

const ANNOTATION_ACCENTS = [
  { color: "#7DD3FC", glow: "rgba(125,211,252,0.22)", icon: BrainCircuit },
  { color: "#A78BFA", glow: "rgba(167,139,250,0.22)", icon: Shuffle },
  { color: "#34D399", glow: "rgba(52,211,153,0.22)", icon: CheckCircle },
  { color: "#FBBF24", glow: "rgba(251,191,36,0.22)", icon: FileCheck },
  { color: "#FB7185", glow: "rgba(251,113,133,0.22)", icon: Sparkles },
  { color: "#F97316", glow: "rgba(249,115,22,0.22)", icon: Layers },
  { color: "#22D3EE", glow: "rgba(34,211,238,0.22)", icon: BookMarked },
  { color: "#C084FC", glow: "rgba(192,132,252,0.22)", icon: Shield },
  { color: "#60A5FA", glow: "rgba(96,165,250,0.22)", icon: Cpu },
] as const;

function renderAnnotationText(text: string, isActive: boolean) {
  return text.split(/(`[^`]+`)/g).filter(Boolean).map((segment, index) => {
    const isCode = segment.startsWith("`") && segment.endsWith("`");
    if (!isCode) {
      return <span key={`${segment}-${index}`}>{segment}</span>;
    }

    return (
      <code
        key={`${segment}-${index}`}
        className="font-bold"
        style={{
          fontFamily: CODE_FONT,
          color: isActive ? "#D6F3FF" : "#7DD3FC",
          background: isActive ? "rgba(125,211,252,0.12)" : "rgba(125,211,252,0.08)",
          border: `1px solid ${isActive ? "rgba(125,211,252,0.24)" : "rgba(125,211,252,0.16)"}`,
          borderRadius: "0.35rem",
          padding: "0.08rem 0.34rem",
          fontSize: "0.92em",
        }}
      >
        {segment.slice(1, -1)}
      </code>
    );
  });
}

interface CodeSegment {
  text: string;
  annotationIndex: number | null;
}

const HIGHLIGHTS_SCRIPT_ID = "language-is-the-prompt-highlights";
let cachedScriptHighlights: HighlightMap | null = null;

function readHighlightsFromScript(): HighlightMap {
  if (cachedScriptHighlights) return cachedScriptHighlights;
  if (typeof document === "undefined") return {};

  const script = document.getElementById(HIGHLIGHTS_SCRIPT_ID);
  if (!script?.textContent) return {};

  try {
    cachedScriptHighlights = JSON.parse(script.textContent) as HighlightMap;
    return cachedScriptHighlights;
  } catch (error) {
    console.warn("[language-is-the-prompt] Failed to parse highlight payload", error);
    return {};
  }
}

function annotateCodeHtml(html: string, code: string, annotations: CodeAnnotation[]) {
  if (!annotations.length || typeof DOMParser === "undefined") return html;

  const ranges = annotations
    .map((annotation, index) => {
      const start = code.indexOf(annotation.match);
      if (start === -1) return null;
      return { start, end: start + annotation.match.length, index };
    })
    .filter((range): range is { start: number; end: number; index: number } => Boolean(range))
    .sort((a, b) => b.start - a.start);

  if (!ranges.length) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const codeNode = doc.querySelector("code");
  if (!codeNode) return html;

  const wrapRange = (start: number, end: number, annotationIndex: number) => {
    const walker = doc.createTreeWalker(codeNode, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      if (current.textContent) textNodes.push(current as Text);
      current = walker.nextNode();
    }

    let offset = 0;
    for (const textNode of textNodes) {
      const text = textNode.textContent ?? "";
      const nodeStart = offset;
      const nodeEnd = offset + text.length;
      offset = nodeEnd;

      if (nodeEnd <= start || nodeStart >= end) continue;

      const localStart = Math.max(0, start - nodeStart);
      const localEnd = Math.min(text.length, end - nodeStart);
      let target = textNode;

      if (localStart > 0) target = target.splitText(localStart);
      if (localEnd - localStart < (target.textContent?.length ?? 0)) {
        target.splitText(localEnd - localStart);
      }

      const accent = ANNOTATION_ACCENTS[annotationIndex % ANNOTATION_ACCENTS.length];
      const span = doc.createElement("span");
      span.className = "code-annotation-hit";
      span.setAttribute("data-code-annotation-id", String(annotationIndex));
      span.setAttribute("tabindex", "0");
      span.style.setProperty("--annotation-color", accent.color);
      span.style.setProperty("--annotation-glow", accent.glow);
      target.parentNode?.replaceChild(span, target);
      span.appendChild(target);
    }
  };

  for (const range of ranges) {
    wrapRange(range.start, range.end, range.index);
  }

  return doc.body.innerHTML;
}

function getCodeSegments(code: string, annotations: CodeAnnotation[]): CodeSegment[] {
  const ranges = annotations
    .map((annotation, index) => {
      const start = code.indexOf(annotation.match);
      if (start === -1) return null;
      return { start, end: start + annotation.match.length, index };
    })
    .filter((range): range is { start: number; end: number; index: number } => Boolean(range))
    .sort((a, b) => a.start - b.start);

  if (!ranges.length) {
    return [{ text: code, annotationIndex: null }];
  }

  const segments: CodeSegment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (cursor < range.start) {
      segments.push({ text: code.slice(cursor, range.start), annotationIndex: null });
    }
    segments.push({
      text: code.slice(range.start, range.end),
      annotationIndex: range.index,
    });
    cursor = range.end;
  }

  if (cursor < code.length) {
    segments.push({ text: code.slice(cursor), annotationIndex: null });
  }

  return segments;
}

function SyntaxBlock({
  code,
  language,
  annotations = [],
  uiLang = "en",
  highlightedHtml,
}: {
  code: string;
  language: string;
  annotations?: CodeAnnotation[];
  uiLang?: Lang;
  highlightedHtml?: string;
}) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  /* annotation ordering: indices into `annotations` array, reordered on click */
  const [annoOrder, setAnnoOrder] = useState<number[]>(() => annotations.map((_, i) => i));
  const [enhancedHtml, setEnhancedHtml] = useState<string | null>(() => highlightedHtml ?? null);
  const codeWrapperRef = useRef<HTMLDivElement | null>(null);
  const segments = enhancedHtml ? [] : getCodeSegments(code, annotations);

  useEffect(() => {
    setActiveAnnotation(null);
    setAnnoOrder(annotations.map((_, i) => i));
  }, [annotations, code, highlightedHtml, language]);

  useEffect(() => {
    if (!highlightedHtml) {
      setEnhancedHtml(null);
      return;
    }

    const annotatedHtml = annotateCodeHtml(highlightedHtml, code, annotations);
    setEnhancedHtml(annotatedHtml);
  }, [annotations, code, highlightedHtml]);

  useEffect(() => {
    const wrapper = codeWrapperRef.current;
    if (!wrapper) return;

    const nodes = wrapper.querySelectorAll<HTMLElement>("[data-code-annotation-id]");
    nodes.forEach((node) => {
      const isMatch =
        activeAnnotation !== null &&
        node.getAttribute("data-code-annotation-id") === String(activeAnnotation);
      node.classList.toggle("code-annotation-hit-active", isMatch);
    });
  }, [activeAnnotation, enhancedHtml]);

  const styledHtml = enhancedHtml
    ? enhancedHtml
        .replace(
          /(<pre[^>]*style=")/,
          `$1font-family:${CODE_FONT};padding:20px 24px;height:100%;margin:0;box-sizing:border-box;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;`
        )
        .replace(
          /(<code[^>]*)/,
          `$1 style="font-family:${CODE_FONT};white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;"`
        )
    : null;

  return (
    <div>
      {styledHtml ? (
        <div
          ref={codeWrapperRef}
          className="shiki-wrapper overflow-x-auto h-full text-[12.5px] sm:text-[13.5px]"
          lang="und"
          translate="no"
          spellCheck={false}
          style={{
            fontFeatureSettings: "'liga' 1, 'calt' 1",
            lineHeight: 1.75,
            tabSize: 2,
          }}
          aria-label={`Code sample (${language})`}
          onMouseOver={(event) => {
            const hit = (event.target as HTMLElement | null)?.closest?.("[data-code-annotation-id]");
            const nextId = hit?.getAttribute("data-code-annotation-id");
            setActiveAnnotation(nextId ? Number(nextId) : null);
          }}
          onClick={(event) => {
            const hit = (event.target as HTMLElement | null)?.closest?.("[data-code-annotation-id]");
            const clickedId = hit?.getAttribute("data-code-annotation-id");
            if (clickedId != null) {
              const index = Number(clickedId);
              playAnnotationSound(index);
              setActiveAnnotation(index);
              setAnnoOrder((prev) => {
                if (prev[0] === index) return prev;
                return [index, ...prev.filter((i) => i !== index)];
              });
            }
          }}
          onFocusCapture={(event) => {
            const hit = (event.target as HTMLElement | null)?.closest?.("[data-code-annotation-id]");
            const nextId = hit?.getAttribute("data-code-annotation-id");
            setActiveAnnotation(nextId ? Number(nextId) : null);
          }}
          onMouseLeave={() => setActiveAnnotation(null)}
          dangerouslySetInnerHTML={{ __html: styledHtml }}
        />
      ) : (
        <pre
          className="m-0 px-6 py-5 overflow-x-auto text-[12.5px] sm:text-[13.5px] leading-[1.75] h-full"
          lang="und"
          translate="no"
          spellCheck={false}
          style={{
            fontFamily: CODE_FONT,
            fontFeatureSettings: "'liga' 1, 'calt' 1",
            background: "transparent",
            color: "rgba(255,255,255,0.76)",
            tabSize: 2,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
        >
          <code style={{ fontFamily: CODE_FONT }} aria-label={`Code sample (${language})`}>
            {segments.map((segment, index) => {
              if (segment.annotationIndex === null) {
                return <span key={`${index}-${segment.text.slice(0, 12)}`}>{segment.text}</span>;
              }

              const annotationIndex = segment.annotationIndex;
              const accent = ANNOTATION_ACCENTS[annotationIndex % ANNOTATION_ACCENTS.length];
              const isActive = activeAnnotation === annotationIndex;

              return (
                <span
                  key={`${annotationIndex}-${index}`}
                  data-code-annotation-id={annotationIndex}
                  tabIndex={0}
                  style={{
                    background: isActive ? accent.glow : "rgba(255,255,255,0.04)",
                    color: isActive ? "#F4FBFF" : accent.color,
                    borderRadius: "0.4rem",
                    boxShadow: isActive ? `0 0 0 1px ${accent.glow}` : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={() => setActiveAnnotation(annotationIndex)}
                  onMouseLeave={() => setActiveAnnotation(null)}
                  onFocus={() => setActiveAnnotation(annotationIndex)}
                  onBlur={() => setActiveAnnotation(null)}
                  onClick={() => {
                    playAnnotationSound(annotationIndex);
                    setActiveAnnotation(annotationIndex);
                    setAnnoOrder((prev) => {
                      if (prev[0] === annotationIndex) return prev;
                      return [annotationIndex, ...prev.filter((i) => i !== annotationIndex)];
                    });
                  }}
                >
                  {segment.text}
                </span>
              );
            })}
          </code>
        </pre>
      )}
      {annotations.length > 0 && (
        <div
          className="px-6 py-4 border-t"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-2.5" style={{ color: "#7DD3FC", fontFamily: MONO }}>
            {uiLang === "ja" ? "見るポイント" : "Reading Guide"}
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {annoOrder.map((index) => {
              const annotation = annotations[index];
              if (!annotation) return null;
              const isActive = activeAnnotation === index;
              const isTop = annoOrder[0] === index && annoOrder.length > 1;
              const accent = ANNOTATION_ACCENTS[index % ANNOTATION_ACCENTS.length];
              const AccentIcon = accent.icon;
              return (
                <div
                  key={`${annotation.match}-${index}`}
                  className="rounded-xl px-3.5 py-3 cursor-pointer"
                  tabIndex={0}
                  style={{
                    background: isActive ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: isActive ? `1px solid ${accent.glow}` : "1px solid rgba(255,255,255,0.04)",
                    boxShadow: isActive
                      ? `0 0 0 1px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.03)`
                      : isTop
                        ? `0 0 12px ${accent.glow}40, inset 0 1px 0 rgba(255,255,255,0.03)`
                        : "inset 0 1px 0 rgba(255,255,255,0.02)",
                    transition: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                    /* flash effect when item just moved to top */
                    animation: isTop ? "anno-pop 0.4s ease-out" : undefined,
                  }}
                  onClick={() => {
                    playAnnotationSound(index);
                    setActiveAnnotation(index);
                    setAnnoOrder((prev) => {
                      if (prev[0] === index) return prev;
                      return [index, ...prev.filter((i) => i !== index)];
                    });
                  }}
                  onMouseEnter={() => setActiveAnnotation(index)}
                  onMouseLeave={() => setActiveAnnotation(null)}
                  onFocus={() => setActiveAnnotation(index)}
                  onBlur={() => setActiveAnnotation(null)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="inline-flex items-center justify-center shrink-0 w-9 h-9 rounded-xl"
                      style={{
                        background: isActive ? accent.glow : "rgba(255,255,255,0.05)",
                        color: accent.color,
                        boxShadow: isActive ? `0 0 0 1px ${accent.glow}` : "none",
                      }}
                    >
                      <AccentIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span
                          className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{
                            background: isActive ? accent.glow : "rgba(255,255,255,0.05)",
                            color: accent.color,
                            fontFamily: MONO,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="text-[12.5px] font-bold" style={{ color: isActive ? "#F4FBFF" : "rgba(255,255,255,0.88)", fontFamily: uiLang === "ja" ? JA_SANS : SANS }}>
                          {annotation.title[uiLang]}
                        </div>
                      </div>
                      <div className="mb-2">
                        <code
                          className="font-bold"
                          style={{
                            fontFamily: CODE_FONT,
                            color: accent.color,
                            background: isActive ? accent.glow : "rgba(255,255,255,0.04)",
                            border: `1px solid ${isActive ? accent.glow : "rgba(255,255,255,0.08)"}`,
                            borderRadius: "0.5rem",
                            padding: "0.22rem 0.48rem",
                            fontSize: "11.5px",
                            display: "inline-block",
                            lineHeight: 1.55,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {annotation.match}
                        </code>
                      </div>
                      <p className="m-0 text-[12px] leading-[1.75] font-medium" style={{ color: isActive ? "rgba(232,245,252,0.84)" : "rgba(255,255,255,0.58)", fontFamily: uiLang === "ja" ? JA_SANS : SANS }}>
                        {renderAnnotationText(annotation.body[uiLang], isActive)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}
      {/* keyframe for annotation pop */}
      <style>{`
        .code-annotation-hit {
          border-radius: 0.4rem;
          cursor: pointer;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          background: color-mix(in srgb, var(--annotation-glow) 55%, transparent);
        }
        .code-annotation-hit-active {
          background: color-mix(in srgb, var(--annotation-glow) 85%, transparent);
          box-shadow: 0 0 0 1px var(--annotation-glow);
        }
        @keyframes anno-pop {
          0% { transform: scale(1.03) translateY(-4px); opacity: 0.7; }
          60% { transform: scale(1.005) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ── Language Icons ── */
function LangIcon({ id, size = 16 }: { id: LangId; size?: number }) {
  const s = size;
  const c = LANG_COLORS[id];
  const glyph = LANG_MONOGRAMS[id];
  const fontSize = glyph.length >= 3 ? 8.5 : glyph.length === 1 ? 11.5 : 10;

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" fill={c} fillOpacity={0.18} stroke={c} strokeWidth={1.4} />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill={id === "javascript" ? "#111827" : c}
        fontSize={fontSize}
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {glyph}
      </text>
    </svg>
  );
}

function PrincipleIcon({ id, color }: { id: PrincipleIconId; color: string }) {
  const s = 18;
  switch (id) {
    case "contract":
      return <FileCheck size={s} style={{ color }} strokeWidth={1.8} />;
    case "pattern":
      return <Shuffle size={s} style={{ color }} strokeWidth={1.8} />;
    case "lock":
      return <Lock size={s} style={{ color }} strokeWidth={1.8} />;
    case "pipe":
      return <ArrowRight size={s} style={{ color }} strokeWidth={1.8} />;
    case "format":
      return <Paintbrush size={s} style={{ color }} strokeWidth={1.8} />;
    case "docs":
      return <FileText size={s} style={{ color }} strokeWidth={1.8} />;
    default:
      return null;
  }
}

/* small language icons for the difficulty chart (supports JS which isn't in LangId) */
function DiffLangIcon({ lang, color }: { lang: string; color: string }) {
  const s = 16;
  switch (lang) {
    case "Elixir":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.5 6 6 10.5 6 14.5C6 18.64 8.69 22 12 22C15.31 22 18 18.64 18 14.5C18 10.5 15.5 6 12 2Z" fill={color} fillOpacity={0.85} />
        </svg>
      );
    case "Kotlin":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20L12 12L20 20H4V4Z" fill={color} />
        </svg>
      );
    case "C#":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5h2v2h2v2h-2v2h-2v-2H9v-2h2V7zm4 4h1v2h-1v-2zm2 0h1v2h-1v-2z" fill={color} />
        </svg>
      );
    case "Python":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M11.9 2c-1.4 0-2.6.2-3.5.5C6.4 3.2 6 4.3 6 5.7v2h6v.7H5.2C3.4 8.4 2 10 2 12.3c0 2.3 1.4 3.9 3.2 3.9H7v-2.5c0-1.8 1.5-3.4 3.3-3.4h5.4c1.5 0 2.3-1 2.3-2.5V5.7c0-1.4-.9-2.5-2.5-2.9-.9-.3-1.9-.8-3.6-.8zM9.5 4a1 1 0 110 2 1 1 0 010-2z" fill={color} />
          <path d="M18 8.2v2.4c0 1.8-1.5 3.5-3.3 3.5H9.3c-1.5 0-2.3 1-2.3 2.5v2.1c0 1.4 1.2 2.2 2.5 2.6 1.6.4 3.1.5 5 0 1.3-.3 2.5-1 2.5-2.6v-2h-6v-.7h8.8c1.8 0 2.5-1.3 3.2-3.1.7-1.9.7-3.7 0-6.1-.5-1.7-1.4-2.6-3.2-2.6H18zm-3.5 10a1 1 0 110 2 1 1 0 010-2z" fill={color} />
        </svg>
      );
    case "JS":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5} />
          <text x="12" y="16.5" textAnchor="middle" fill={color} fontSize="11" fontWeight="bold" fontFamily="system-ui">JS</text>
        </svg>
      );
    default:
      return null;
  }
}


/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

function AidLogo({ className = "" }: { className?: string }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  return (
    <img
      src={`${base}rbg_Logomark_white.png`}
      alt="AI := Driven"
      className={className}
    />
  );
}

function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("aid-reduce-motion");
    if (stored !== null) {
      setReduced(stored === "true");
    } else {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
  }, []);
  return reduced;
}

/* Shared window chrome pieces */
const WINDOW_BG = "linear-gradient(180deg, #1e2432 0%, #171c28 100%)";
const WINDOW_BORDER = "1px solid rgba(255,255,255,0.08)";
const WINDOW_SHADOW = "0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset";
const DIVIDER = "1px solid rgba(255,255,255,0.06)";

const SELECTOR_LANGS = LANG_ORDER.filter((lid) => lid !== "elixir");
const RADAR_LANGS: LangId[] = ["elixir", ...DEFAULT_COMPARISON_LANGS];

/* ── Tab change sounds (Web Audio API) ── */
function getTabSoundConfig(lid: LangId): { notes: [number, number]; type: OscillatorType; dur: number } {
  const index = Math.max(0, LANG_ORDER.indexOf(lid));
  const base = 392 + (index % 12) * 37;
  const ratio = index % 3 === 0 ? 1.25 : index % 3 === 1 ? 1.33 : 1.5;
  return {
    notes: [base, Math.round(base * ratio)] as [number, number],
    type: index % 2 === 0 ? "sine" : "triangle",
    dur: 0.08 + (index % 3) * 0.01,
  };
}

let _audioCtx: AudioContext | null = null;
function playTabSound(lid: LangId) {
  try {
    if (!_audioCtx) _audioCtx = new AudioContext();
    const ctx = _audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const cfg = getTabSoundConfig(lid);
    const t = ctx.currentTime;
    const half = cfg.dur / 2;
    // Note 1
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = cfg.type; osc1.frequency.value = cfg.notes[0];
    g1.gain.setValueAtTime(0.09, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + half);
    osc1.connect(g1).connect(ctx.destination);
    osc1.start(t); osc1.stop(t + half + 0.01);
    // Note 2 — slightly softer, overlaps note 1 for the cute uptick
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = cfg.type; osc2.frequency.value = cfg.notes[1];
    g2.gain.setValueAtTime(0.07, t + half * 0.6);
    g2.gain.exponentialRampToValueAtTime(0.001, t + cfg.dur);
    osc2.connect(g2).connect(ctx.destination);
    osc2.start(t + half * 0.6); osc2.stop(t + cfg.dur + 0.01);
  } catch { /* Silently fail if Web Audio unavailable */ }
}

function scrollTabsOnWheel(event: ReactWheelEvent<HTMLDivElement>) {
  const el = event.currentTarget;
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || el.scrollWidth <= el.clientWidth) {
    return;
  }
  el.scrollLeft += event.deltaY;
  event.preventDefault();
}

function LangTab({
  lid,
  isActive,
  onClick,
  showStar = false,
}: {
  lid: LangId;
  isActive: boolean;
  onClick: () => void;
  showStar?: boolean;
}) {
  return (
    <button
      onClick={() => {
        playTabSound(lid);
        onClick();
      }}
      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 border-none cursor-pointer transition-all duration-200 whitespace-nowrap"
      style={{
        fontFamily: CODE_FONT,
        fontSize: 12,
        fontWeight: isActive ? 600 : 400,
        background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
        color: isActive ? LANG_COLORS[lid] : "rgba(255,255,255,0.35)",
        borderBottom: isActive ? `2px solid ${LANG_COLORS[lid]}` : "2px solid transparent",
      }}
    >
      <span className="shrink-0">
        <LangIcon id={lid} size={14} />
      </span>
      {showStar ? (
        <span className="flex items-center gap-1">
          <span style={{ color: isActive ? "#FFD700" : "rgba(255,255,255,0.2)" }}>★</span>
          {LANG_LABELS[lid]}
        </span>
      ) : (
        LANG_LABELS[lid]
      )}
    </button>
  );
}

/* ── Explicitness Radar Diagram (Interactive) ── */
const RADAR_SCORES: Partial<Record<LangId, number[]>> = {
  // [Contracts, Pattern Match, Immutability, Pipe Operator, Formatter, Exec Docs]
  elixir:           [0.95, 0.97, 1.0,  0.95, 0.92, 0.98],
  python:           [0.35, 0.55, 0.30, 0.20, 0.60, 0.40],
  typescript:       [0.75, 0.40, 0.45, 0.25, 0.70, 0.30],
  typescript_effect: [0.90, 0.65, 0.80, 0.90, 0.70, 0.35],
  go:               [0.55, 0.30, 0.40, 0.15, 0.95, 0.75],
  csharp:           [0.82, 0.62, 0.55, 0.18, 0.72, 0.58],
  swift:            [0.80, 0.85, 0.65, 0.15, 0.55, 0.30],
  kotlin:           [0.75, 0.75, 0.60, 0.25, 0.65, 0.30],
  rust:             [0.86, 0.82, 0.88, 0.25, 0.90, 0.78],
  dream:            [0.84, 0.88, 0.84, 0.78, 0.94, 0.64],
  javascript:       [0.45, 0.25, 0.25, 0.20, 0.72, 0.18],
  gleam:            [0.90, 0.92, 0.92, 0.55, 0.95, 0.70],
};

function ExplicitnessRadar({ isJa }: { isJa: boolean }) {
  const [enabled, setEnabled] = useState<Set<LangId>>(() => new Set(["elixir", "python"] as LangId[]));

  const principles = isJa
    ? ["明示的契約", "パターンマッチ", "不変性", "パイプ演算子", "フォーマッタ", "実行可能ドキュメント"]
    : ["Contracts", "Pattern Match", "Immutability", "Pipe Operator", "Formatter", "Exec Docs"];

  const cx = 170, cy = 150, r = 108;
  const n = principles.length;

  const point = (i: number, val: number): [number, number] => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + r * val * Math.cos(angle), cy + r * val * Math.sin(angle)];
  };

  const makePath = (scores: number[]) =>
    scores.map((s, i) => point(i, s)).map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

  const toggle = (id: LangId) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const enabledLangs = RADAR_LANGS.filter((id) => enabled.has(id) && RADAR_SCORES[id]);

  return (
    <div className="rounded-xl px-5 py-5 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 opacity-30" style={{ fontFamily: MONO }}>
        {isJa ? "明示性レーダー - インタラクティブ" : "Explicitness Radar - Interactive"}
      </div>

      <svg viewBox="0 0 340 300" className="w-full max-w-[460px] mx-auto" style={{ filter: "drop-shadow(0 0 20px rgba(155,89,182,0.1))" }}>
        {/* Grid rings */}
        {gridLevels.map((lv) => (
          <polygon key={lv} points={Array.from({ length: n }, (_, i) => point(i, lv).join(",")).join(" ")}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        ))}
        {/* Grid level labels */}
        {gridLevels.map((lv) => {
          const [lx, ly] = point(0, lv);
          return (
            <text key={`gl${lv}`} x={lx + 3} y={ly - 3} fill="rgba(255,255,255,0.18)" fontSize="6" fontFamily={MONO}>
              {Math.round(lv * 100)}%
            </text>
          );
        })}
        {/* Axes */}
        {principles.map((_, i) => {
          const [ex, ey] = point(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />;
        })}
        {/* Language areas - render in reverse so first enabled is on top */}
        {[...enabledLangs].reverse().map((lid) => {
          const scores = RADAR_SCORES[lid] ?? [0, 0, 0, 0, 0, 0];
          const color = LANG_COLORS[lid];
          return (
            <path key={lid} d={makePath(scores)}
              fill={hexToRgba(color, 0.08)} stroke={color} strokeWidth="1.5" strokeOpacity="0.7"
              style={{ transition: "all 0.3s ease" }} />
          );
        })}
        {/* Dots */}
        {enabledLangs.map((lid) => {
          const scores = RADAR_SCORES[lid] ?? [0, 0, 0, 0, 0, 0];
          const color = LANG_COLORS[lid];
          return scores.map((s, i) => {
            const [x, y] = point(i, s);
            return <circle key={`${lid}-${i}`} cx={x} cy={y} r="2.5" fill={color} style={{ transition: "all 0.3s ease" }} />;
          });
        })}
        {/* Axis labels */}
        {principles.map((label, i) => {
          const [x, y] = point(i, 1.22);
          const anchor = x < cx - 15 ? "end" : x > cx + 15 ? "start" : "middle";
          return (
            <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="central"
              fill="rgba(255,255,255,0.50)" fontSize="8" fontFamily={MONO}>
              {label}
            </text>
          );
        })}
      </svg>

      {/* Interactive toggle buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {RADAR_LANGS.map((lid) => {
          const isOn = enabled.has(lid);
          const color = LANG_COLORS[lid];
          return (
            <button key={lid} onClick={() => { playTabSound(lid); toggle(lid); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer border"
              style={{
                fontFamily: MONO,
                background: isOn ? hexToRgba(color, 0.15) : "rgba(255,255,255,0.03)",
                borderColor: isOn ? hexToRgba(color, 0.4) : "rgba(255,255,255,0.08)",
                color: isOn ? color : "rgba(255,255,255,0.3)",
                opacity: isOn ? 1 : 0.6,
              }}>
              <span className="shrink-0"><LangIcon id={lid} size={12} /></span>
              {LANG_LABELS[lid]}
            </button>
          );
        })}
      </div>
      <div className="text-[9px] text-center mt-2 opacity-20" style={{ fontFamily: MONO }}>
        {isJa ? "クリックで言語を表示/非表示" : "Click to toggle languages"}
      </div>
    </div>
  );
}

/* ── Hard Problem Gap Degradation Chart (Paper-accurate) ── */
function DegradationCurve({ isJa }: { isJa: boolean }) {
  // Data from the actual paper - colors match difficultyData at top of file
  const langs = [
    { name: "Elixir", easy: 96.6, medium: 86.7, hard: 86.3, deg: -10.3, color: "#10B981" },
    { name: "Kotlin", easy: 100.0, medium: 88.1, hard: 63.6, deg: -36.4, color: "#3B82F6" },
    { name: "C#",     easy: 97.8, medium: 81.1, hard: 63.1, deg: -34.7, color: "#8B5CF6" },
    { name: "Python", easy: 82.0, medium: 48.6, hard: 31.6, deg: -50.4, color: "#F59E0B" },
    { name: "JS",     easy: 78.5, medium: 45.2, hard: 28.3, deg: -50.2, color: "#EF4444" },
  ];
  const w = 380, h = 220, pl = 42, pr = 50, pt = 14, pb = 34;
  const cw = w - pl - pr, ch = h - pt - pb;
  const xPositions = [0, 0.5, 1]; // Easy, Medium, Hard

  const xLabels = isJa ? ["易", "中", "難"] : ["Easy", "Medium", "Hard"];

  return (
    <div className="rounded-xl px-4 py-4 mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2 opacity-30" style={{ fontFamily: MONO }}>
        {isJa ? "難易度別パフォーマンス (論文データ)" : "Performance by Difficulty (Paper Data)"}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[480px] mx-auto">
        {/* Y axis grid + labels */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = pt + ch - (v / 100) * ch;
          return (
            <g key={v}>
              <line x1={pl} y1={y} x2={pl + cw} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <text x={pl - 6} y={y} textAnchor="end" dominantBaseline="central" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily={MONO}>{v}%</text>
            </g>
          );
        })}
        {/* X axis labels */}
        {xLabels.map((label, i) => (
          <text key={label} x={pl + xPositions[i] * cw} y={h - 8} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily={MONO}>
            {label}
          </text>
        ))}
        {/* X axis tick marks */}
        {xPositions.map((xp, i) => (
          <line key={i} x1={pl + xp * cw} y1={pt} x2={pl + xp * cw} y2={pt + ch} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2,3" />
        ))}
        {/* Lines for each language - 3 points: Easy -> Medium -> Hard */}
        {langs.map((l) => {
          const pts = [
            { x: pl + xPositions[0] * cw, y: pt + ch - (l.easy / 100) * ch },
            { x: pl + xPositions[1] * cw, y: pt + ch - (l.medium / 100) * ch },
            { x: pl + xPositions[2] * cw, y: pt + ch - (l.hard / 100) * ch },
          ];
          const pathD = `M${pts[0].x},${pts[0].y} L${pts[1].x},${pts[1].y} L${pts[2].x},${pts[2].y}`;
          return (
            <g key={l.name}>
              <path d={pathD} fill="none" stroke={l.color} strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill={l.color} />
              ))}
              {/* Label at end */}
              <text x={pts[2].x + 6} y={pts[2].y} dominantBaseline="central" fill={l.color} fontSize="7.5" fontFamily={MONO} fillOpacity="0.9" fontWeight="bold">
                {l.name}
              </text>
              {/* Degradation label */}
              <text x={pts[2].x + 6} y={pts[2].y + 10} dominantBaseline="central" fill={l.color} fontSize="6" fontFamily={MONO} fillOpacity="0.5">
                {l.deg > 0 ? "+" : ""}{l.deg}pt
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-[9px] text-center mt-1 opacity-25" style={{ fontFamily: MONO }}>
        {isJa ? "Elixirは難問でもほとんど劣化しない (-10.3pt) vs Python (-50.4pt)" : "Elixir barely degrades on hard problems (-10.3pt) vs Python (-50.4pt)"}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED INTERACTIVE ELIXIR PRINCIPLE DEMOS
   Inspired by effect.kitlangton.com — fun, cute, with sounds & animations
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Shared animation sound helper ── */
function playNote(freq: number, type: OscillatorType = "sine", dur = 0.12, vol = 0.07) {
  try {
    if (!_audioCtx) _audioCtx = new AudioContext();
    const ctx = _audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur + 0.02);
  } catch { /* */ }
}
function playChime(notes: number[], delay = 0.08) {
  notes.forEach((f, i) => setTimeout(() => playNote(f, "sine", 0.15, 0.06), i * delay * 1000));
}

/* ── Annotation sounds — completely unique synthesis per section ──
   Echo grows with index: top items are dry, bottom items reverberate heavily.
   Each function is a different synthesis technique. */

function _aCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
}

/** Helper: repeat a sound function N times with decay */
function _withEcho(play: (ctx: AudioContext, t: number, vol: number, detune: number) => void, echoes: number) {
  const ctx = _aCtx();
  const t = ctx.currentTime;
  for (let i = 0; i <= echoes; i++) {
    play(ctx, t + i * 0.15, 0.07 * Math.pow(0.5, i), i * 18);
  }
}

const ANNOTATION_SOUND_FNS: ((idx: number) => void)[] = [

  /* 0 — WATER DROP: fast pitch-sweep downward, plop */
  () => _withEcho((ctx, t, vol) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.12);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
  }, 2),

  /* 1 — BUBBLE: quick pitch up then down, bubbly pop */
  () => _withEcho((ctx, t, vol) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.14);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.18);
  }, 2),

  /* 2 — METALLIC BELL: two detuned sines beating against each other */
  () => _withEcho((ctx, t, vol, detune) => {
    [440, 443.5].forEach(f => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = f; osc.detune.value = detune;
      g.gain.setValueAtTime(vol * 0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(g).connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.5);
    });
  }, 3),

  /* 3 — SPARKLE: rapid random high-freq pings like tiny stars */
  () => _withEcho((ctx, t, vol) => {
    const freqs = [1568, 2093, 1760, 2349, 1975];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = f;
      const st = t + i * 0.03;
      g.gain.setValueAtTime(vol * 0.5, st);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.08);
      osc.connect(g).connect(ctx.destination);
      osc.start(st); osc.stop(st + 0.1);
    });
  }, 3),

  /* 4 — WOODEN KNOCK: filtered noise burst, percussive */
  () => _withEcho((ctx, t, vol) => {
    const bufLen = ctx.sampleRate * 0.06;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.15));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass"; filt.frequency.value = 800; filt.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol * 2.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start(t); src.stop(t + 0.12);
  }, 4),

  /* 5 — WHOOSH: filtered noise sweep, airy swoosh */
  () => _withEcho((ctx, t, vol) => {
    const bufLen = ctx.sampleRate * 0.25;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass"; filt.Q.value = 5;
    filt.frequency.setValueAtTime(200, t);
    filt.frequency.exponentialRampToValueAtTime(4000, t + 0.1);
    filt.frequency.exponentialRampToValueAtTime(300, t + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol * 1.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start(t); src.stop(t + 0.3);
  }, 5),

  /* 6 — LASER ZAP: fast descending sawtooth sweep */
  () => _withEcho((ctx, t, vol, detune) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth"; osc.detune.value = detune;
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);
    g.gain.setValueAtTime(vol * 0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
  }, 5),

  /* 7 — DEEP GONG: low fundamental + inharmonic overtones that beat slowly */
  () => _withEcho((ctx, t, vol, detune) => {
    [110, 277.5, 173, 342].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = f; osc.detune.value = detune;
      g.gain.setValueAtTime(vol * (i === 0 ? 1 : 0.35), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.connect(g).connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.75);
    });
  }, 6),

  /* 8 — CRYSTAL CASCADE: harmonics with staggered slow attack, massive echo */
  () => _withEcho((ctx, t, vol, detune) => {
    [523, 784, 1047, 1319, 1568].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = f; osc.detune.value = detune;
      const st = t + i * 0.045;
      g.gain.setValueAtTime(0.001, st);
      g.gain.linearRampToValueAtTime(vol * 0.6, st + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.35);
      osc.connect(g).connect(ctx.destination);
      osc.start(st); osc.stop(st + 0.38);
    });
  }, 7),
];

function playAnnotationSound(index: number) {
  try {
    ANNOTATION_SOUND_FNS[index % ANNOTATION_SOUND_FNS.length](index);
  } catch { /* */ }
}

/* ── 1. PIPE FLOW ANIMATION ── data |> step1 |> step2 |> step3 ── */
function PipeFlowDemo({ isJa }: { isJa: boolean }) {
  const [step, setStep] = useState(-1);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const pidRef = useRef(0);

  const stages = isJa
    ? [
        { label: "data", code: '[3, 1, 4, 1, 5]', color: "#64748b" },
        { label: "Enum.filter", code: '&(&1 > 2)', color: "#3B82F6" },
        { label: "Enum.map", code: '&(&1 * 10)', color: "#8B5CF6" },
        { label: "Enum.sum", code: '→ 120', color: "#10B981" },
      ]
    : [
        { label: "data", code: '[3, 1, 4, 1, 5]', color: "#64748b" },
        { label: "Enum.filter", code: '&(&1 > 2)', color: "#3B82F6" },
        { label: "Enum.map", code: '&(&1 * 10)', color: "#8B5CF6" },
        { label: "Enum.sum", code: '→ 120', color: "#10B981" },
      ];

  const values = [
    '[3, 1, 4, 1, 5]',
    '[3, 4, 5]',
    '[30, 40, 50]',
    '120',
  ];

  const runAnimation = () => {
    setStep(-1);
    setParticles([]);
    const tones = [523, 659, 784, 1047]; // C5 E5 G5 C6 — ascending major
    let s = 0;
    const next = () => {
      if (s >= stages.length) return;
      setStep(s);
      playNote(tones[s], "sine", 0.14, 0.06);
      // spawn particles at stage position
      const pid = pidRef.current++;
      const xBase = (s / (stages.length - 1)) * 100;
      setParticles(prev => [...prev, { id: pid, x: xBase, y: 50 }]);
      setTimeout(() => setParticles(prev => prev.filter(p => p.id !== pid)), 1000);
      s++;
      if (s < stages.length) setTimeout(next, 1100);
      else setTimeout(() => playChime([1047, 1319, 1568], 0.06), 500); // victory C6 E6 G6
    };
    setTimeout(next, 400);
  };

  return (
    <div className="rounded-xl px-4 py-4 mt-3 mb-2 relative overflow-hidden" style={{ background: "rgba(155,89,182,0.04)", border: "1px solid rgba(155,89,182,0.15)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40" style={{ fontFamily: MONO }}>
          {isJa ? "パイプ演算子アニメーション" : "Pipe Operator — Live"}
        </span>
        <button onClick={runAnimation}
          className="px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: "rgba(155,89,182,0.2)", color: "#C084FC", fontFamily: MONO }}>
          ▶ {isJa ? "再生" : "Play"}
        </button>
      </div>

      {/* Pipeline visualization */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {stages.map((s, i) => (
          <div key={i} className="contents">
            {i > 0 && (
              <div className="flex items-center mx-1 shrink-0">
                <span className="text-[13px] font-bold transition-all duration-300"
                  style={{ color: step >= i ? "#C084FC" : "rgba(255,255,255,0.15)", fontFamily: MONO,
                    textShadow: step >= i ? "0 0 12px rgba(192,132,252,0.5)" : "none" }}>
                  |&gt;
                </span>
              </div>
            )}
            <div className="flex flex-col items-center px-2 py-2 rounded-lg min-w-[80px] shrink-0 transition-all duration-400"
              style={{
                background: step >= i ? `${s.color}18` : "rgba(255,255,255,0.02)",
                border: `1px solid ${step >= i ? `${s.color}40` : "rgba(255,255,255,0.06)"}`,
                transform: step === i ? "scale(1.08)" : "scale(1)",
                boxShadow: step === i ? `0 0 20px ${s.color}30` : "none",
              }}>
              <span className="text-[11px] font-bold mb-0.5" style={{ color: s.color, fontFamily: MONO }}>{s.label}</span>
              <span className="text-[9px] opacity-60" style={{ fontFamily: MONO }}>{s.code}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Data value display */}
      <div className="mt-3 h-7 flex items-center justify-center">
        {step >= 0 && (
          <div className="text-[13px] font-bold px-4 py-1 rounded-full transition-all duration-300"
            style={{
              fontFamily: MONO,
              color: stages[step].color,
              background: `${stages[step].color}12`,
              border: `1px solid ${stages[step].color}30`,
              animation: "tab-enter 300ms ease both",
            }}>
            {values[step]}
          </div>
        )}
      </div>

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            background: "#C084FC",
            boxShadow: "0 0 8px rgba(192,132,252,0.6)",
            animation: "booth-float 0.6s ease-out forwards",
            opacity: 0.8,
          }} />
      ))}
    </div>
  );
}

/* ── 2. PATTERN MATCH ANIMATION ── shapes decomposing into branches ── */
function PatternMatchDemo({ isJa }: { isJa: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const sparkleId = useRef(0);

  const cases = isJa ? [
    { input: '{:ok, "Alice"}',  branch: ':ok  → name',    result: '"ようこそ、Alice!"',  color: "#10B981", icon: "✓" },
    { input: '{:error, :timeout}', branch: ':error → reason', result: '"リトライ: timeout"', color: "#EF4444", icon: "✗" },
    { input: '{:ok, ""}',      branch: ':ok  → ""',       result: '"名前が空です"',       color: "#F59E0B", icon: "⚠" },
  ] : [
    { input: '{:ok, "Alice"}',    branch: ':ok  → name',     result: '"Welcome, Alice!"',  color: "#10B981", icon: "✓" },
    { input: '{:error, :timeout}', branch: ':error → reason', result: '"Retry: timeout"',   color: "#EF4444", icon: "✗" },
    { input: '{:ok, ""}',         branch: ':ok  → ""',        result: '"Name is empty"',    color: "#F59E0B", icon: "⚠" },
  ];

  const select = (i: number) => {
    setSelected(i);
    const tones = [[659, 880], [440, 349], [523, 659]]; // major up, minor down, gentle up
    const t = tones[i] || tones[0];
    playNote(t[0], "sine", 0.1, 0.06);
    setTimeout(() => playNote(t[1], "triangle", 0.15, 0.05), 80);
    // sparkles
    for (let s = 0; s < 5; s++) {
      const sid = sparkleId.current++;
      const x = 30 + Math.random() * 40;
      const y = 20 + Math.random() * 60;
      setTimeout(() => {
        setSparkles(prev => [...prev, { id: sid, x, y }]);
        setTimeout(() => setSparkles(prev => prev.filter(p => p.id !== sid)), 700);
      }, s * 60);
    }
  };

  return (
    <div className="rounded-xl px-4 py-4 mt-3 mb-2 relative overflow-hidden" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)" }}>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40 block mb-3" style={{ fontFamily: MONO }}>
        {isJa ? "パターンマッチ — クリックして試す" : "Pattern Matching — Click to try"}
      </span>

      {/* Input selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {cases.map((c, i) => (
          <button key={i} onClick={() => select(i)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border transition-all duration-200 hover:scale-[1.03] active:scale-95"
            style={{
              fontFamily: MONO,
              background: selected === i ? `${c.color}20` : "rgba(255,255,255,0.03)",
              borderColor: selected === i ? `${c.color}50` : "rgba(255,255,255,0.08)",
              color: selected === i ? c.color : "rgba(255,255,255,0.4)",
              boxShadow: selected === i ? `0 0 16px ${c.color}20` : "none",
            }}>
            {c.input}
          </button>
        ))}
      </div>

      {/* Match result */}
      <div className="h-[72px] flex items-center justify-center">
        {selected !== null && (
          <div className="flex items-center gap-3" style={{ animation: "tab-enter 300ms ease both" }}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl text-xl"
              style={{ background: `${cases[selected].color}15`, border: `1px solid ${cases[selected].color}30` }}>
              {cases[selected].icon}
            </div>
            <div>
              <div className="text-[10px] font-bold mb-0.5" style={{ color: cases[selected].color, fontFamily: MONO }}>
                {cases[selected].branch}
              </div>
              <div className="text-[14px] font-bold" style={{ color: "#fff", fontFamily: MONO }}>
                {cases[selected].result}
              </div>
            </div>
          </div>
        )}
        {selected === null && (
          <span className="text-[11px] opacity-25" style={{ fontFamily: MONO }}>
            {isJa ? "↑ 入力値をクリック" : "↑ Click an input value"}
          </span>
        )}
      </div>

      {/* Sparkles */}
      {sparkles.map(s => (
        <div key={s.id} className="absolute pointer-events-none"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: 4, height: 4, borderRadius: "50%",
            background: selected !== null ? cases[selected].color : "#fff",
            boxShadow: `0 0 6px ${selected !== null ? cases[selected].color : "#fff"}`,
            animation: "booth-float 0.7s ease-out forwards",
            opacity: 0.7,
          }} />
      ))}
    </div>
  );
}

/* ── 3. {:ok}/{:error} CONTRACT FLOW ── animated branching pipeline ── */
function ContractFlowDemo({ isJa }: { isJa: boolean }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"idle" | "call" | "ok" | "error">("idle");
  const [trail, setTrail] = useState<string[]>([]);

  const run = (outcome: "ok" | "error") => {
    if (running) return;
    setRunning(true);
    setTrail([]);
    setPhase("call");
    playNote(523, "sine", 0.1);

    setTimeout(() => {
      setTrail(["call"]);
      setPhase(outcome);
      if (outcome === "ok") {
        playChime([659, 784, 1047], 0.07); // E5 G5 C6
      } else {
        playNote(349, "triangle", 0.2, 0.06);
        setTimeout(() => playNote(311, "triangle", 0.25, 0.05), 120);
      }
      setTrail(["call", outcome]);
    }, 600);

    setTimeout(() => {
      setRunning(false);
    }, 1800);
  };

  const nodeStyle = (id: string, color: string) => ({
    background: trail.includes(id) ? `${color}20` : "rgba(255,255,255,0.02)",
    borderColor: trail.includes(id) ? `${color}50` : "rgba(255,255,255,0.08)",
    boxShadow: trail.includes(id) ? `0 0 20px ${color}25` : "none",
    transform: trail.includes(id) ? "scale(1.05)" : "scale(1)",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  });

  return (
    <div className="rounded-xl px-4 py-4 mt-3 mb-2 relative overflow-hidden" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40 block mb-3" style={{ fontFamily: MONO }}>
        {isJa ? "明示的契約フロー" : "Explicit Contract Flow"}
      </span>

      {/* Flow diagram */}
      <div className="flex flex-col items-center gap-3">
        {/* Function call */}
        <div className="px-4 py-2 rounded-lg border text-[12px] font-bold" style={{ fontFamily: MONO, color: "#94A3B8", ...nodeStyle("call", "#94A3B8") }}>
          fetch_user(id)
        </div>

        {/* Arrow down */}
        <svg width="20" height="24" viewBox="0 0 20 24" className="opacity-40">
          <path d="M10 0v20M5 16l5 5 5-5" stroke={trail.includes("call") ? "#94A3B8" : "rgba(255,255,255,0.2)"} strokeWidth="1.5" fill="none" strokeLinecap="round"
            style={{ transition: "stroke 0.4s ease" }} />
        </svg>

        {/* Branch: ok / error */}
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="px-3.5 py-2 rounded-lg border text-[12px] font-bold" style={{ fontFamily: MONO, color: "#10B981", ...nodeStyle("ok", "#10B981") }}>
              {"{:ok, user}"}
            </div>
            <button onClick={() => run("ok")} disabled={running}
              className="px-2.5 py-1 rounded-full text-[9px] font-bold cursor-pointer border-none transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{ background: "rgba(16,185,129,0.2)", color: "#34D399", fontFamily: MONO }}>
              ▶ {isJa ? "成功" : "Success"}
            </button>
            {phase === "ok" && (
              <div className="text-[11px] font-bold px-3 py-1 rounded-full" style={{
                fontFamily: MONO, color: "#10B981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                animation: "tab-enter 300ms ease both",
              }}>
                {isJa ? "→ プロフィール表示" : "→ render profile"}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="px-3.5 py-2 rounded-lg border text-[12px] font-bold" style={{ fontFamily: MONO, color: "#EF4444", ...nodeStyle("error", "#EF4444") }}>
              {"{:error, reason}"}
            </div>
            <button onClick={() => run("error")} disabled={running}
              className="px-2.5 py-1 rounded-full text-[9px] font-bold cursor-pointer border-none transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{ background: "rgba(239,68,68,0.2)", color: "#F87171", fontFamily: MONO }}>
              ▶ {isJa ? "失敗" : "Failure"}
            </button>
            {phase === "error" && (
              <div className="text-[11px] font-bold px-3 py-1 rounded-full" style={{
                fontFamily: MONO, color: "#EF4444", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                animation: "tab-enter 300ms ease both",
              }}>
                {isJa ? "→ エラーログ出力" : "→ log & fallback"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-[9px] text-center mt-3 opacity-25" style={{ fontFamily: MONO }}>
        {isJa ? "例外なし — 常にどちらかの値が返る" : "No exceptions — always one of two values"}
      </div>
    </div>
  );
}

/* ── 4. IMMUTABILITY DEMO ── show that rebinding doesn't mutate ── */
function ImmutabilityDemo({ isJa }: { isJa: boolean }) {
  const [step, setStep] = useState(0);
  const lines = [
    { code: 'list = [1, 2, 3]',                      val: '[1, 2, 3]',       color: "#06B6D4", note: isJa ? "束縛" : "bind" },
    { code: 'new_list = [0 | list]',                  val: '[0, 1, 2, 3]',   color: "#8B5CF6", note: isJa ? "新しいリスト" : "new list" },
    { code: 'list',                                    val: '[1, 2, 3]',       color: "#06B6D4", note: isJa ? "元は不変！" : "original unchanged!" },
  ];

  const advance = () => {
    const next = (step + 1) % (lines.length + 1);
    setStep(next);
    if (next > 0 && next <= lines.length) {
      const n = next - 1;
      if (n === 2) {
        // The "aha" moment — original unchanged
        playChime([880, 1047, 1319], 0.06);
      } else {
        playNote([523, 659, 784][n], "sine", 0.12, 0.06);
      }
    }
  };

  return (
    <div className="rounded-xl px-4 py-4 mt-3 mb-2" style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.15)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40" style={{ fontFamily: MONO }}>
          {isJa ? "不変性デモ" : "Immutability Demo"}
        </span>
        <button onClick={advance}
          className="px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: "rgba(6,182,212,0.2)", color: "#67E8F9", fontFamily: MONO }}>
          {step === 0 ? (isJa ? "▶ 開始" : "▶ Start") : step >= lines.length ? (isJa ? "↻ リセット" : "↻ Reset") : (isJa ? "次へ →" : "Next →")}
        </button>
      </div>

      <div className="space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="flex items-center gap-3 transition-all duration-300"
            style={{ opacity: step > i ? 1 : 0.15, transform: step > i ? "translateX(0)" : "translateX(-8px)" }}>
            <span className="text-[10px] w-4 text-right opacity-30" style={{ fontFamily: MONO }}>{i + 1}</span>
            <code className="text-[12px] font-bold flex-1" style={{ fontFamily: MONO, color: l.color }}>{l.code}</code>
            {step > i && (
              <span className="text-[11px] px-2 py-0.5 rounded-full shrink-0" style={{
                fontFamily: MONO, color: l.color, background: `${l.color}12`, border: `1px solid ${l.color}25`,
                animation: "tab-enter 250ms ease both",
              }}>
                {l.val}
                {i === 2 && <span className="ml-1.5 text-[9px]" style={{ color: "#10B981" }}>✓</span>}
              </span>
            )}
            {step > i && (
              <span className="text-[8px] opacity-40 shrink-0" style={{ fontFamily: MONO }}>{l.note}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 5. FORMATTER UNIFORMITY DEMO ── messy code → formatted ── */
type FormatterTokenKind = "keyword" | "function" | "punct" | "module" | "string" | "operator";

interface FormatterToken {
  text: string;
  kind: FormatterTokenKind;
}

const FORMATTER_MESSY = `def hello( name ) do
IO.puts( "Hello, " <> name <> "!" )
end`;

const FORMATTER_CLEAN = `def hello(name) do
  IO.puts("Hello, " <> name <> "!")
end`;

const FORMATTER_TOKEN_LINES_BEFORE: FormatterToken[][] = [
  [
    { text: "def", kind: "keyword" },
    { text: " hello", kind: "function" },
    { text: "(", kind: "punct" },
    { text: " name", kind: "function" },
    { text: " )", kind: "punct" },
    { text: " do", kind: "keyword" },
  ],
  [
    { text: "IO.puts", kind: "module" },
    { text: "(", kind: "punct" },
    { text: " \"Hello, \"", kind: "string" },
    { text: " <>", kind: "operator" },
    { text: " name", kind: "function" },
    { text: " <>", kind: "operator" },
    { text: " \"!\"", kind: "string" },
    { text: " )", kind: "punct" },
  ],
  [
    { text: "end", kind: "keyword" },
  ],
];

const FORMATTER_TOKEN_LINES_AFTER: FormatterToken[][] = [
  [
    { text: "def", kind: "keyword" },
    { text: " hello", kind: "function" },
    { text: "(name)", kind: "module" },
    { text: " do", kind: "keyword" },
  ],
  [
    { text: "  ", kind: "punct" },
    { text: "IO.puts", kind: "module" },
    { text: "(\"Hello, \"", kind: "string" },
    { text: " <>", kind: "operator" },
    { text: " name", kind: "function" },
    { text: " <>", kind: "operator" },
    { text: " \"!\")", kind: "string" },
  ],
  [
    { text: "end", kind: "keyword" },
  ],
];

const FORMATTER_TOKEN_STYLES = [
  { bg: "rgba(196,113,237,0.22)", border: "rgba(196,113,237,0.36)", color: "#F4E8FF" },
  { bg: "rgba(134,239,172,0.22)", border: "rgba(134,239,172,0.34)", color: "#E8FFE8" },
  { bg: "rgba(253,224,71,0.22)", border: "rgba(253,224,71,0.34)", color: "#FFF8D6" },
  { bg: "rgba(248,113,113,0.22)", border: "rgba(248,113,113,0.34)", color: "#FFE1E1" },
  { bg: "rgba(125,211,252,0.22)", border: "rgba(125,211,252,0.34)", color: "#E3F5FF" },
  { bg: "rgba(251,191,36,0.22)", border: "rgba(251,191,36,0.34)", color: "#FFF0CF" },
];

const FORMATTER_TOKENS_BEFORE = FORMATTER_TOKEN_LINES_BEFORE.reduce((sum, line) => sum + line.length, 0);
const FORMATTER_TOKENS_AFTER = FORMATTER_TOKEN_LINES_AFTER.reduce((sum, line) => sum + line.length, 0);
const FORMATTER_CHAR_DELTA = FORMATTER_MESSY.length - FORMATTER_CLEAN.length;

function FormatterCodeBlock({
  active,
  reducedMotion,
  lines,
}: {
  active: boolean;
  reducedMotion: boolean;
  lines: FormatterToken[][];
}) {
  return (
    <div className="rounded-lg p-3" style={{
      background: active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.025)",
      border: `1px solid ${active ? "rgba(251,191,36,0.22)" : "rgba(255,255,255,0.08)"}`,
      boxShadow: active ? "0 0 0 1px rgba(251,191,36,0.08) inset, 0 18px 40px -28px rgba(251,191,36,0.45)" : "none",
      transition: "all 280ms ease",
    }}>
      <code className="block text-[12px] leading-[1.85]" style={{ fontFamily: MONO }}>
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} style={{ whiteSpace: "pre" }}>
            {line.map((token, tokenIndex) => {
              const style = FORMATTER_TOKEN_STYLES[(lineIndex * 10 + tokenIndex) % FORMATTER_TOKEN_STYLES.length];
              const order = lineIndex * 8 + tokenIndex;

              return (
                <motion.span
                  key={`${lineIndex}-${token.text}-${tokenIndex}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 10, scale: 0.94 }}
                  animate={reducedMotion ? undefined : active ? {
                    opacity: 1,
                    y: [0, -3, 0],
                    scale: [1, 1.07, 1],
                    boxShadow: [
                      "0 0 0 rgba(251,191,36,0)",
                      "0 10px 24px rgba(251,191,36,0.28)",
                      "0 0 0 rgba(251,191,36,0)",
                    ],
                  } : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={reducedMotion ? undefined : {
                    duration: 0.42,
                    delay: active ? order * 0.028 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block rounded-[3px] px-[1px] py-[1px]"
                  style={{
                    fontFamily: MONO,
                    background: style.bg,
                    color: style.color,
                    border: `1px solid ${style.border}`,
                  }}
                >
                  {token.text}
                </motion.span>
              );
            })}
          </div>
        ))}
      </code>
    </div>
  );
}

function FormatterDemo({ isJa }: { isJa: boolean }) {
  const reducedMotion = useReduceMotion();
  const [formatted, setFormatted] = useState(false);

  const toggle = () => {
    setFormatted(f => !f);
    if (!formatted) {
      playChime([784, 988, 1319], 0.05); // G5 B5 E6 — satisfying
    } else {
      playNote(440, "triangle", 0.1, 0.04);
    }
  };

  return (
    <div className="rounded-xl px-4 py-4 mt-3 mb-2 overflow-hidden relative" style={{
      background: formatted
        ? "radial-gradient(circle at top right, rgba(251,191,36,0.18), rgba(245,158,11,0.05) 34%, rgba(8,18,26,0.12) 72%)"
        : "linear-gradient(180deg, rgba(245,158,11,0.06), rgba(245,158,11,0.025))",
      border: `1px solid ${formatted ? "rgba(251,191,36,0.28)" : "rgba(245,158,11,0.15)"}`,
      boxShadow: formatted ? "0 24px 70px -45px rgba(251,191,36,0.65)" : "none",
      transition: "all 320ms ease",
    }}>
      <AnimatePresence>
        {formatted && !reducedMotion && (
          <motion.div
            key="formatter-beam"
            initial={{ x: "-120%", opacity: 0 }}
            animate={{ x: "140%", opacity: [0, 0.75, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 w-28 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, rgba(251,191,36,0), rgba(251,191,36,0.18), rgba(254,240,138,0.42), rgba(251,191,36,0))",
              filter: "blur(12px)",
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40" style={{ fontFamily: MONO }}>
          {isJa ? "mix format デモ" : "mix format Demo"}
        </span>
        <button onClick={toggle}
          className="px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: "rgba(245,158,11,0.2)", color: "#FBBF24", fontFamily: MONO }}>
          {formatted ? (isJa ? "↻ 元に戻す" : "↻ Undo") : "✨ mix format"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={formatted ? "formatted" : "messy"}
          initial={reducedMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 rounded-xl px-3 py-2.5"
          style={{
            background: formatted ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)",
            border: `1px solid ${formatted ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)"}`,
          }}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold mb-1" style={{ fontFamily: MONO, color: formatted ? "#6EE7B7" : "#FCA5A5" }}>
            <span>{formatted ? "✓" : "!"}</span>
            <span>
              {formatted
                ? (isJa ? "実際の tokenizer 表示では、after のほうがピース数が減り結合も変わる。" : "In the actual tokenizer view, the after version has fewer pieces and different merges.")
                : (isJa ? "これは有効な Elixir だが、actual tokenizer では before のほうが細かく割れる。" : "This is valid Elixir, but the actual tokenizer splits the before version into more pieces.")}
            </span>
          </div>
          <div className="text-[10px] opacity-80 leading-[1.55]" style={{ fontFamily: MONO, color: formatted ? "#D1FAE5" : "rgba(255,255,255,0.72)" }}>
            {formatted
              ? (isJa ? "あなたが共有した actual tokenization に合わせて、before/after のピース分割を別々に表示している。" : "This now matches the actual tokenization you shared, with separate piece groupings for before and after.")
              : (isJa ? "mix format は同じコード意味を保ちながら、tokenizer が見える境界まで変えうる。" : "mix format can preserve the same code meaning while still changing the boundaries the tokenizer sees.")}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          {
            label: isJa ? "Tokenizer Pieces" : "Tokenizer Pieces",
            value: `${FORMATTER_TOKENS_BEFORE}→${FORMATTER_TOKENS_AFTER}`,
            sub: isJa ? "actual tokenization" : "actual tokenization",
            color: "#C084FC",
          },
          {
            label: isJa ? "文字数" : "Characters",
            value: `${FORMATTER_MESSY.length}→${FORMATTER_CLEAN.length}`,
            sub: isJa ? `${FORMATTER_CHAR_DELTA} 文字削減` : `${FORMATTER_CHAR_DELTA} chars removed`,
            color: "#7DD3FC",
          },
          {
            label: isJa ? "要点" : "Takeaway",
            value: formatted ? (isJa ? "標準形" : "Canonical") : (isJa ? "崩れ" : "Noisy"),
            sub: formatted ? (isJa ? "merge される" : "more merged") : (isJa ? "細かく割れる" : "more split"),
            color: formatted ? "#34D399" : "#F59E0B",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg px-3 py-2" style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div className="text-[9px] uppercase tracking-[0.14em] opacity-45 mb-1" style={{ fontFamily: MONO }}>
              {stat.label}
            </div>
            <div className="text-[20px] font-bold leading-none" style={{ fontFamily: MONO, color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[9px] mt-1 opacity-60" style={{ fontFamily: MONO }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[
          {
            key: "before",
            title: isJa ? "Before" : "Before",
            source: FORMATTER_MESSY,
            active: !formatted,
            tone: "#F87171",
            bg: "rgba(239,68,68,0.05)",
            border: "rgba(239,68,68,0.18)",
            codeColor: "rgba(255,255,255,0.62)",
            caption: isJa ? "有効だが tokenizer 的には細かく分割" : "Valid code, but more split in tokenizer space",
            tokenCaption: isJa ? `${FORMATTER_TOKENS_BEFORE} pieces` : `${FORMATTER_TOKENS_BEFORE} pieces`,
            lines: FORMATTER_TOKEN_LINES_BEFORE,
          },
          {
            key: "after",
            title: isJa ? "After" : "After",
            source: FORMATTER_CLEAN,
            active: formatted,
            tone: "#34D399",
            bg: "rgba(16,185,129,0.06)",
            border: "rgba(16,185,129,0.20)",
            codeColor: "#D1FAE5",
            caption: isJa ? "mix format 後は tokenizer 上でより結合" : "After mix format, pieces merge more cleanly",
            tokenCaption: isJa ? `${FORMATTER_TOKENS_AFTER} pieces` : `${FORMATTER_TOKENS_AFTER} pieces`,
            lines: FORMATTER_TOKEN_LINES_AFTER,
          },
        ].map((panel, panelIndex) => (
          <div key={panel.key} className="space-y-2">
            {panelIndex === 1 && (
              <div className="flex items-center justify-center py-1">
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                  animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.24 }}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    fontFamily: MONO,
                    color: formatted ? "#FDE68A" : "rgba(255,255,255,0.35)",
                    background: formatted ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${formatted ? "rgba(251,191,36,0.22)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  {isJa ? "↓ mix format ↓" : "↓ mix format ↓"}
                </motion.div>
              </div>
            )}

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={reducedMotion ? undefined : {
                opacity: panel.active ? 1 : 0.82,
                y: 0,
                scale: panel.active ? 1 : 0.985,
              }}
              transition={{ duration: 0.3, delay: reducedMotion ? 0 : panelIndex * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl p-3"
              style={{
                background: panel.bg,
                border: `1px solid ${panel.border}`,
                boxShadow: panel.active ? `0 18px 42px -26px ${panel.tone}` : "none",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ fontFamily: MONO, color: panel.tone }}>
                    {panel.title}
                  </div>
                  <div className="text-[10px] opacity-55 mt-0.5" style={{ fontFamily: MONO }}>
                    {panel.caption}
                  </div>
                </div>
                <div className="text-right">
                <div className="text-[18px] font-bold leading-none" style={{ fontFamily: MONO, color: panel.tone }}>
                  {panel.source.length}
                </div>
                <div className="text-[9px] uppercase tracking-[0.14em] opacity-45" style={{ fontFamily: MONO }}>
                  {isJa ? "chars" : "chars"}
                </div>
                <div className="text-[9px] mt-1 opacity-55" style={{ fontFamily: MONO }}>
                  {panel.tokenCaption}
                </div>
              </div>
            </div>

              <FormatterCodeBlock
                active={panel.active}
                reducedMotion={reducedMotion}
                lines={panel.lines}
              />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-center mt-3 opacity-40 leading-[1.6]" style={{ fontFamily: MONO }}>
        {formatted
          ? (isJa ? "このチップ列は syntax ではなく tokenizer piece の比較。formatting が merge を変える。" : "These chips compare tokenizer pieces, not syntax nodes. Formatting changes the merges.")
          : (isJa ? "共有してもらった actual tokenization に合わせて、before と after で別のピース列を描画している。" : "The before and after rows now render different piece sequences to match the actual tokenization you shared.")}
      </div>
    </div>
  );
}

/* ── 6. DOCTEST DEMO ── inline documentation with runnable tests ── */
function DoctestDemo({ isJa }: { isJa: boolean }) {
  const [ran, setRan] = useState(false);
  const [testResult, setTestResult] = useState<"pass" | "fail" | null>(null);

  const runTest = () => {
    setRan(false);
    setTestResult(null);
    playNote(523, "sine", 0.08);

    setTimeout(() => {
      setRan(true);
      setTestResult("pass");
      playChime([784, 988, 1175, 1319], 0.05); // ascending — all tests pass!
    }, 800);
  };

  return (
    <div className="rounded-xl px-4 py-4 mt-3 mb-2" style={{ background: "rgba(224,36,122,0.04)", border: "1px solid rgba(224,36,122,0.15)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40" style={{ fontFamily: MONO }}>
          {isJa ? "Doctest デモ" : "Doctest Demo"}
        </span>
        <button onClick={runTest}
          className="px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer border-none transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: "rgba(224,36,122,0.2)", color: "#F472B6", fontFamily: MONO }}>
          ▶ mix test
        </button>
      </div>

      <div className="p-3 rounded-lg text-[11px] leading-[1.8]" style={{ fontFamily: MONO, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ color: "#6B7280" }}>@doc """</div>
        <div style={{ color: "rgba(255,255,255,0.55)" }}>  {isJa ? "2つの数値を足します。" : "Adds two numbers."}</div>
        <div style={{ color: "#6B7280" }}>&nbsp;</div>
        <div style={{ color: "#6B7280" }}>  ## Examples</div>
        <div style={{ color: "#6B7280" }}>&nbsp;</div>
        <div className="transition-all duration-300" style={{
          color: testResult === "pass" ? "#34D399" : "#7DD3FC",
          background: testResult === "pass" ? "rgba(16,185,129,0.08)" : "transparent",
          borderRadius: 4, padding: "0 4px", margin: "0 -4px",
        }}>
          {'      iex> Math.add(1, 2)'}
        </div>
        <div className="transition-all duration-300" style={{
          color: testResult === "pass" ? "#34D399" : "#7DD3FC",
          background: testResult === "pass" ? "rgba(16,185,129,0.08)" : "transparent",
          borderRadius: 4, padding: "0 4px", margin: "0 -4px",
        }}>
          {'      3'}
        </div>
        <div style={{ color: "#6B7280" }}>"""</div>
        <div><span style={{ color: "#C084FC" }}>def</span> <span style={{ color: "#7DD3FC" }}>add</span>(a, b), <span style={{ color: "#C084FC" }}>do:</span> a + b</div>
      </div>

      {/* Test runner output */}
      <div className="mt-2 h-6 flex items-center justify-center">
        {ran && testResult === "pass" && (
          <div className="flex items-center gap-2 text-[11px] font-bold" style={{ fontFamily: MONO, color: "#10B981", animation: "tab-enter 300ms ease both" }}>
            <span>✓</span>
            <span>1 doctest, 1 test, 0 failures</span>
            <span className="text-[16px]" style={{ animation: "booth-pulse 1s ease-in-out" }}>🎉</span>
          </div>
        )}
        {!ran && !testResult && (
          <span className="text-[10px] opacity-20" style={{ fontFamily: MONO }}>
            {isJa ? "↑ テストを実行" : "↑ Run the test"}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Map: principle icon → demo component ── */
const PRINCIPLE_DEMOS: Record<string, (props: { isJa: boolean }) => ReactNode> = {
  contract: (p) => <ContractFlowDemo {...p} />,
  pattern:  (p) => <PatternMatchDemo {...p} />,
  lock:     (p) => <ImmutabilityDemo {...p} />,
  pipe:     (p) => <PipeFlowDemo {...p} />,
  format:   (p) => <FormatterDemo {...p} />,
  docs:     (p) => <DoctestDemo {...p} />,
};

/* ── Why It Matters Infographic ── */
function WhyItMattersDiagram({ isJa }: { isJa: boolean }) {
  const items = isJa ? [
    { icon: "📊", label: "訓練データ量", sub: "Elixir < Python", color: "#EF4444" },
    { icon: "🎯", label: "明示性スコア", sub: "Elixir >> Python", color: "#9B59B6" },
    { icon: "📈", label: "Pass@1 結果", sub: "87.4% vs 43.9%", color: "#10B981" },
  ] : [
    { icon: "📊", label: "Training data", sub: "Elixir < Python", color: "#EF4444" },
    { icon: "🎯", label: "Explicitness", sub: "Elixir >> Python", color: "#9B59B6" },
    { icon: "📈", label: "Pass@1 Result", sub: "87.4% vs 43.9%", color: "#10B981" },
  ];

  const arrow = (
    <svg width="28" height="16" viewBox="0 0 28 16" className="shrink-0 mx-1 opacity-30">
      <path d="M0 8h24M20 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="rounded-xl px-4 py-4 mt-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 opacity-30" style={{ fontFamily: MONO }}>
        {isJa ? "パラドックス" : "The Paradox"}
      </div>
      <div className="flex items-center justify-center flex-wrap gap-y-3 sm:flex-nowrap">
        {items.map((item, i) => (
          <div key={item.label} className="contents">
            {i > 0 && <span className="hidden sm:inline-flex text-white/30">{arrow}</span>}
            <div className="flex flex-col items-center px-4 py-3 rounded-xl min-w-[100px]"
              style={{ background: `${item.color}08`, border: `1px solid ${item.color}20` }}>
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-[11px] font-bold" style={{ color: item.color, fontFamily: MONO }}>{item.label}</span>
              <span className="text-[9px] opacity-50 mt-0.5" style={{ fontFamily: MONO }}>{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-center mt-3 opacity-25" style={{ fontFamily: MONO }}>
        {isJa ? "少ないデータ + 高い明示性 = より良い結果" : "Less data + Higher explicitness = Better results"}
      </div>
    </div>
  );
}

/* ── Code Section Visual Header ── */
function CodeSectionDiagram({ isJa }: { isJa: boolean }) {
  const [ref, visible] = useInView(0.25);
  const langs = [
    { name: "Elixir", score: 87.4, color: "#C471ED" },
    { name: "Go", score: 56.2, color: "#12D8FA" },
    { name: "Kotlin", score: 51.8, color: "#22D694" },
    { name: "TypeScript", score: 48.9, color: "#5B9EFF" },
    { name: "Python", score: 43.9, color: "#FFB340" },
  ];

  return (
    <div ref={ref} className="rounded-xl px-4 py-4 mb-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-3 opacity-30" style={{ fontFamily: MONO }}>
        {isJa ? "言語別 Pass@1 スコア" : "Pass@1 Score by Language"}
      </div>
      <div className="space-y-2">
        {langs.map((l) => (
          <div key={l.name} className="flex items-center gap-3">
            <span className="w-[72px] text-right text-[10px] font-bold shrink-0" style={{ color: l.color, fontFamily: MONO }}>{l.name}</span>
            <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-full rounded-full flex items-center justify-end pr-2"
                style={{
                  width: visible ? `${l.score}%` : "0%",
                  background: `linear-gradient(90deg, ${l.color}40, ${l.color})`,
                  transition: "width 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
                }}>
                <span className="text-[9px] font-bold" style={{ color: "#fff", fontFamily: MONO, opacity: visible ? 1 : 0, transition: "opacity 0.4s ease 0.6s" }}>{l.score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Documentation Pipeline Diagram ── */
function DocPipelineDiagram({ isJa }: { isJa: boolean }) {
  const arrow = (
    <svg width="24" height="16" viewBox="0 0 24 16" className="shrink-0 mx-1 opacity-40">
      <path d="M0 8h20M16 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const stages: { label: string; sub: string; color: string; icon: ReactNode; url: string }[] = isJa ? [
    { label: "@doc", sub: "関数ドキュメント", color: "#3B82F6", icon: <PenTool className="w-4 h-4" />, url: "https://hexdocs.pm/elixir/writing-documentation.html" },
    { label: "doctest", sub: "I/Oペアを埋め込み", color: "#8B5CF6", icon: <TestTube className="w-4 h-4" />, url: "https://hexdocs.pm/ex_unit/ExUnit.DocTest.html" },
    { label: "ExUnit", sub: "テストとして実行", color: "#10B981", icon: <CheckCircle className="w-4 h-4" />, url: "https://hexdocs.pm/ex_unit/ExUnit.html" },
    { label: "ex_doc", sub: "HTML/EPUBを生成", color: "#F59E0B", icon: <BookMarked className="w-4 h-4" />, url: "https://github.com/elixir-lang/ex_doc" },
    { label: "Training", sub: "検証済みペアを学習", color: "#EF4444", icon: <BrainCircuit className="w-4 h-4" />, url: "https://github.com/ai-driven-office/language-is-the-prompt" },
  ] : [
    { label: "@doc", sub: "Function docs", color: "#3B82F6", icon: <PenTool className="w-4 h-4" />, url: "https://hexdocs.pm/elixir/writing-documentation.html" },
    { label: "doctest", sub: "Embed I/O pairs", color: "#8B5CF6", icon: <TestTube className="w-4 h-4" />, url: "https://hexdocs.pm/ex_unit/ExUnit.DocTest.html" },
    { label: "ExUnit", sub: "Run as tests", color: "#10B981", icon: <CheckCircle className="w-4 h-4" />, url: "https://hexdocs.pm/ex_unit/ExUnit.html" },
    { label: "ex_doc", sub: "Generate HTML/EPUB", color: "#F59E0B", icon: <BookMarked className="w-4 h-4" />, url: "https://github.com/elixir-lang/ex_doc" },
    { label: "Training", sub: "Learn verified pairs", color: "#EF4444", icon: <BrainCircuit className="w-4 h-4" />, url: "https://github.com/ai-driven-office/language-is-the-prompt" },
  ];

  return (
    <div className="rounded-xl px-4 py-3 overflow-x-auto" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2.5 opacity-30" style={{ fontFamily: MONO }}>
        {isJa ? "ドキュメントパイプライン" : "Documentation Pipeline"}
      </div>
      <div className="flex items-center justify-center flex-wrap gap-y-2 sm:flex-nowrap">
        {stages.map((s, i) => (
          <div key={s.label} className="contents">
            {i > 0 && <span className="hidden sm:inline-flex text-white/30">{arrow}</span>}
            <a href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center px-2.5 py-2 rounded-lg min-w-[80px] no-underline transition-all duration-200 hover:scale-105 group"
              style={{ background: `${s.color}10`, border: `1px solid ${s.color}25` }}>
              <span className="mb-1" style={{ color: s.color }}>{s.icon}</span>
              <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: s.color, fontFamily: MONO }}>
                {s.label}
                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
              </span>
              <span className="text-[9px] opacity-50 text-center whitespace-nowrap" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.5)" }}>{s.sub}</span>
            </a>
          </div>
        ))}
      </div>
      <div className="text-[10px] mt-2 text-center opacity-30" style={{ fontFamily: MONO }}>
        {isJa
          ? "Elixirでは@doc \u2192 doctest \u2192 ExUnit \u2192 ex_doc が一つの連続パイプラインを形成"
          : "@doc \u2192 doctest \u2192 ExUnit \u2192 ex_doc form a single continuous pipeline in Elixir"}
      </div>
    </div>
  );
}

/* ── Linkify: auto-hyperlink technical keywords ── */
const KEYWORD_LINKS: [RegExp, string][] = [
  // Elixir ecosystem
  [/\bExUnit\b/g, "https://hexdocs.pm/ex_unit/ExUnit.html"],
  [/\bex_doc\b/g, "https://github.com/elixir-lang/ex_doc"],
  [/\bmix format\b/g, "https://hexdocs.pm/mix/Mix.Tasks.Format.html"],
  [/\bGenServer\b/g, "https://hexdocs.pm/elixir/GenServer.html"],
  [/\bOTP\b/g, "https://www.erlang.org/doc/design_principles/des_princ"],
  [/@spec\b/g, "https://hexdocs.pm/elixir/typespecs.html"],
  [/@doc\b/g, "https://hexdocs.pm/elixir/writing-documentation.html"],
  [/\bdoctest(?:s)?\b/gi, "https://hexdocs.pm/ex_unit/ExUnit.DocTest.html"],
  // Other language tools
  [/\bDocFX\b/g, "https://dotnet.github.io/docfx/"],
  [/\bKDoc\b/g, "https://kotlinlang.org/docs/kotlin-doc.html"],
  [/@sample\b/g, "https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier"],
  [/\bDocC\b/g, "https://developer.apple.com/documentation/docc"],
  [/@Snippet\b/g, "https://developer.apple.com/documentation/docc/snippet"],
  [/\bdartdoc_test\b/g, "https://pub.dev/packages/dartdoc_test"],
  [/\bGodoc\b/gi, "https://pkg.go.dev/golang.org/x/tools/cmd/godoc"],
  [/\bJSDoc\b/g, "https://jsdoc.app/"],
  [/\bPrettier\b/g, "https://prettier.io/"],
  [/\bgofmt\b/g, "https://pkg.go.dev/cmd/gofmt"],
  [/\bBlack\b(?=\s+formatter|\s+format)/g, "https://github.com/psf/black"],
  [/\bneverthrow\b/g, "https://github.com/supermacro/neverthrow"],
  [/\bEffect\b(?=\s+(?:Ref|Fiber|library|website|pipe))/g, "https://effect.website/"],
  [/\bArrow\b(?=\s+Either)/g, "https://arrow-kt.io/"],
  [/\bfpdart\b/g, "https://pub.dev/packages/fpdart"],
  [/\breturns\b(?=\s+library)/g, "https://github.com/dry-python/returns"],
  // CS concepts
  [/\bPass@1\b/g, "https://arxiv.org/abs/2107.03374"],
  [/\bHumanEval\b/g, "https://arxiv.org/abs/2107.03374"],
  [/\breferential transparency\b/gi, "https://en.wikipedia.org/wiki/Referential_transparency"],
  [/\bliterate programming\b/gi, "https://en.wikipedia.org/wiki/Literate_programming"],
  [/\balgebraic data typ(?:e|es|ing)\b/gi, "https://en.wikipedia.org/wiki/Algebraic_data_type"],
  [/\balgebraic pattern matching\b/gi, "https://en.wikipedia.org/wiki/Pattern_matching"],
  [/\bpattern matching\b/gi, "https://en.wikipedia.org/wiki/Pattern_matching"],
  [/\binformation theory\b/gi, "https://en.wikipedia.org/wiki/Information_theory"],
  [/\bnext-token prediction\b/gi, "https://en.wikipedia.org/wiki/Language_model"],
  [/\bfunction composition\b/gi, "https://en.wikipedia.org/wiki/Function_composition_(computer_science)"],
  [/\bimmutability\b/gi, "https://en.wikipedia.org/wiki/Immutable_object"],
  [/\bpure function(?:s)?\b/gi, "https://en.wikipedia.org/wiki/Pure_function"],
  [/\btype inference\b/gi, "https://en.wikipedia.org/wiki/Type_inference"],
  [/\bsum type(?:s)?\b/gi, "https://en.wikipedia.org/wiki/Tagged_union"],
  [/\bResult type(?:s)?\b/gi, "https://en.wikipedia.org/wiki/Result_type"],
  [/\bDialyzer\b/g, "https://www.erlang.org/doc/apps/dialyzer/dialyzer_chapter"],
  [/\bBEAM\b(?=\s+(?:VM|virtual))/g, "https://en.wikipedia.org/wiki/BEAM_(Erlang_virtual_machine)"],
  [/\bErlang\b/g, "https://www.erlang.org/"],
  // Language-specific links
  [/\bRust\b(?=\s+(?:Result|pattern|error|compiler))/g, "https://www.rust-lang.org/"],
  [/\bSwift\b(?=\s+(?:Result|enum|pattern))/g, "https://developer.apple.com/swift/"],
  [/\bDart\b(?=\s+(?:sealed|pattern|class))/g, "https://dart.dev/"],
  [/\bGo\b(?=\s+(?:error|fmt|interface))/g, "https://go.dev/"],
  // JA keywords
  [/リテラルプログラミング/g, "https://en.wikipedia.org/wiki/Literate_programming"],
  [/参照透過性/g, "https://en.wikipedia.org/wiki/Referential_transparency"],
  [/代数的データ型/g, "https://en.wikipedia.org/wiki/Algebraic_data_type"],
  [/代数的パターンマッチング/g, "https://en.wikipedia.org/wiki/Pattern_matching"],
  [/パターンマッチング?/g, "https://en.wikipedia.org/wiki/Pattern_matching"],
  [/情報理論/g, "https://en.wikipedia.org/wiki/Information_theory"],
  [/関数合成/g, "https://en.wikipedia.org/wiki/Function_composition_(computer_science)"],
  [/不変性/g, "https://en.wikipedia.org/wiki/Immutable_object"],
];

const KEYWORD_TOOLTIPS: [RegExp, { en: string; ja: string }][] = [
  [/∀x ∈ S, P\(x\) → f\(x\)/g, {
    en: "Reads: \"For all x in set S, if predicate P(x) holds, apply f(x)\"\n\n- ∀x ∈ S  =  take every element x from collection S\n- P(x)  =  keep only elements where condition P is true (filter)\n- f(x)  =  transform each surviving element with function f (map)\n\nThis is set-builder notation - the mathematical origin of list comprehensions, LINQ, and .filter().map() chains.",
    ja: "読み方:「集合Sの全てのxについて、述語P(x)が真ならf(x)を適用」\n\n- ∀x ∈ S = コレクションSから全要素xを取り出す\n- P(x) = 条件Pが真の要素だけを残す（filter）\n- f(x) = 残った各要素に関数fを適用（map）\n\nこれは集合構成記法 - リスト内包表記・LINQ・.filter().map()チェーンの数学的起源。",
  }],
  [/f\s*∘\s*g\s*∘\s*h/g, {
    en: "Function composition notation.\n\n`f ∘ g ∘ h` means: run `h` first, then feed its result into `g`, then feed that result into `f`.\n\nPipelines make this same idea readable left-to-right for humans.",
    ja: "関数合成の記法。\n\n`f ∘ g ∘ h` は「先に `h` を実行し、その結果を `g` に渡し、最後に `f` に渡す」という意味。\n\nパイプラインはこの考え方を、人間に読みやすい左から右の形にしたもの。",
  }],
  [/TC39\s+Stage\s*2待ちpipe\(\)/g, {
    en: "This means: TypeScript developers often use a library `pipe()` today because the official JavaScript pipe operator proposal is still not finalized.\n\nTC39 is the standards committee for JavaScript, and Stage 2 means the proposal is real but still not stable enough to ship everywhere.",
    ja: "これは「JavaScript標準のパイプ演算子がまだ確定していないので、現時点ではライブラリの `pipe()` を使う」という意味。\n\nTC39 は JavaScript 標準化委員会で、Stage 2 は提案が本物ではあるが、まだ広く標準実装される段階ではないことを表す。",
  }],
  [/TC39 pipe is still Stage 2/gi, {
    en: "The JavaScript pipe operator is still a proposal, not a shipped language feature.\n\nTC39 is the committee that standardizes JavaScript. Stage 2 means the design direction exists, but it is not finalized or broadly implemented yet.",
    ja: "JavaScript のパイプ演算子は、まだ正式実装済みの言語機能ではなく提案段階。\n\nTC39 は JavaScript の標準化委員会で、Stage 2 は方向性はあるが、仕様確定や広範な実装にはまだ至っていない段階を意味する。",
  }],
  [/\bset-builder notation\b/gi, {
    en: "Set-builder notation is the mathematical way of describing a collection by saying:\n\n- where elements come from\n- which ones are kept\n- how each surviving element is transformed\n\nComprehensions are the executable programming version of that notation.",
    ja: "集合構成記法は、集合を\n\n- 要素の出所\n- 残す条件\n- 各要素をどう変換するか\n\nで定義する数学記法。内包表記はそのプログラミング版。",
  }],
  [/集合構成記法/g, {
    en: "Set-builder notation: a mathematical way to describe a collection by source, filter, and transformation.",
    ja: "集合構成記法: 要素の出所・条件・変換で集合を定義する数学記法。内包表記の元になっている。",
  }],
  [/\bmonadic composition\b/gi, {
    en: "Monadic composition means chaining operations in a context like `Result`, `Either`, or `Promise`.\n\nEach step can pass along success automatically, while failures or special cases short-circuit without extra nested control flow.",
    ja: "モナド合成とは、`Result` や `Either`、`Promise` のような文脈つき値を連鎖させること。\n\n成功はそのまま次へ流れ、失敗や特別なケースはネストした分岐なしで途中終了できる。",
  }],
  [/モナド合成/g, {
    en: "Monadic composition: chaining context-carrying values such as Result or Either.",
    ja: "モナド合成: Result や Either のような文脈つき値を、規則的に連鎖させること。",
  }],
  [/\bEither monad\b/gi, {
    en: "The Either monad is a success-or-failure container, usually `Right` for success and `Left` for failure.\n\nIt lets multi-step workflows stop on the first error while keeping the happy path linear.",
    ja: "Either モナドは、成功と失敗を保持するコンテナで、通常は `Right` が成功、`Left` が失敗。\n\n複数段の処理を、最初のエラーで止めつつハッピーパスは一直線に保てる。",
  }],
  [/Eitherモナド/g, {
    en: "Either monad: a success/failure container used to chain fallible computations.",
    ja: "Eitherモナド: 失敗しうる計算を連鎖させるための成功/失敗コンテナ。",
  }],
  [/\bdo-notation\b/gi, {
    en: "Do-notation is syntax sugar for sequencing chained computations.\n\nInstead of explicit nested binds, it lets the code read like direct step-by-step assignment.",
    ja: "do記法は、連鎖計算を順番に書けるようにする糖衣構文。\n\nbind をネストせず、普通の逐次代入のように読める形にする。",
  }],
  [/do記法/g, {
    en: "Do-notation: syntax sugar for sequentially chaining wrapped computations.",
    ja: "do記法: 文脈つき計算を順番に連鎖させるための糖衣構文。",
  }],
  [/\bactor model\b/gi, {
    en: "The actor model organizes concurrency around isolated processes that communicate only by messages.\n\nEach actor owns its state, so shared-memory races are avoided by construction.",
    ja: "アクターモデルは、独立したプロセス同士がメッセージだけで通信する並行モデル。\n\n各アクタが自分の状態を所有するため、共有メモリ由来の競合を構造的に避けられる。",
  }],
  [/アクターモデル/g, {
    en: "Actor model: concurrency via isolated stateful processes and message passing.",
    ja: "アクターモデル: 状態を隔離したプロセスとメッセージ通信で並行処理を組み立てる方式。",
  }],
  [/\bmessage passing\b/gi, {
    en: "Message passing means components communicate by sending discrete messages instead of mutating shared state directly.",
    ja: "メッセージパッシングとは、共有状態を直接変更せず、離散的なメッセージ送受信で通信すること。",
  }],
  [/メッセージパッシング/g, {
    en: "Message passing: components talk by exchanging messages instead of sharing mutable memory.",
    ja: "メッセージパッシング: 可変メモリ共有ではなく、メッセージ交換でやり取りする方式。",
  }],
  [/\bcallback structure\b/gi, {
    en: "Callback structure means the runtime expects a fixed set of named entry points like `init`, `handle_call`, and `handle_cast`.\n\nThat regular template makes concurrent code easier for both humans and LLMs to complete correctly.",
    ja: "コールバック構造とは、`init` や `handle_call`、`handle_cast` のような決まった入口をランタイムが期待する構造。\n\nこの規則的テンプレートが、人間にもLLMにも並行コードを埋めやすくする。",
  }],
  [/コールバック構造/g, {
    en: "Callback structure: a fixed template of runtime entry points such as init/handle_call.",
    ja: "コールバック構造: init や handle_call のような固定エントリポイントのテンプレート。",
  }],
  [/\bdiscriminated unions\b/gi, {
    en: "A discriminated union is a union type where each variant carries a tag like `kind: \"circle\"`.\n\nThat tag lets the compiler and the reader know which fields are valid in each branch.",
    ja: "判別共用体とは、`kind: \"circle\"` のようなタグを持つ union 型。\n\nそのタグにより、各分岐でどのフィールドが有効かをコンパイラと読者の両方が判断できる。",
  }],
  [/\bstructural matching\b/gi, {
    en: "Structural matching means branching based on the shape of the data itself, not just a boolean condition.\n\nThe match can validate and destructure in one step.",
    ja: "構造的マッチとは、単なる真偽条件ではなくデータの形そのものに基づいて分岐すること。\n\n形の検証と分解を1ステップで行える。",
  }],
  [/\bshort-circuit(?:ing)?\b/gi, {
    en: "Short-circuiting means a chain stops as soon as one step fails or determines the final result.\n\nLater steps are skipped automatically.",
    ja: "ショートサーキットとは、途中の1ステップが失敗したり結論を確定した時点で連鎖全体を止めること。\n\n後続ステップは自動的に実行されない。",
  }],
  [/ショートサーキット(?:する|セマンティクス)?/g, {
    en: "Short-circuiting: stopping the chain immediately when one step already determines the outcome.",
    ja: "ショートサーキット: 途中の1ステップで結果が決まった時点で残りを止めること。",
  }],
  [/\bTC39\b/g, {
    en: "TC39 is the standards committee that designs and advances new JavaScript language features.",
    ja: "TC39 は JavaScript の新しい言語機能を策定・推進する標準化委員会。",
  }],
  [/\bStage 2\b/g, {
    en: "Stage 2 means a JavaScript proposal has a concrete direction, but it is still not final or widely shipped yet.",
    ja: "Stage 2 は、JavaScript 提案に具体的な方向性はあるが、まだ最終仕様でも広範な実装済みでもない段階。",
  }],
  [/\bpipe\(\)/g, {
    en: "`pipe()` is a library helper that feeds a value through a sequence of functions.\n\nIt gives TypeScript and JavaScript a practical pipeline style today, even without a native `|>` operator.",
    ja: "`pipe()` は値を関数列に順番に流すためのライブラリ補助関数。\n\nネイティブの `|>` がなくても、TypeScript / JavaScript で今日すぐパイプライン風に書ける。",
  }],
  [/\bexplicit staging\b/gi, {
    en: "Explicit staging means naming each intermediate step with a variable instead of hiding all transformations inside one expression.",
    ja: "明示的ステージングとは、中間段階を変数として名前付けし、変換を1つの巨大式に隠さないこと。",
  }],
  [/明示的ステージング/g, {
    en: "Explicit staging: naming intermediate steps instead of relying on nested expressions.",
    ja: "明示的ステージング: 中間段階を変数で明示し、深いネストに埋め込まない書き方。",
  }],
  [/\bgenerator DSL\b/gi, {
    en: "A generator DSL is an API that uses generator syntax to express sequential effects in a more direct, imperative-looking form.",
    ja: "generator DSL とは、ジェネレータ構文を使って副作用の連鎖をより直接的に書けるAPIスタイル。",
  }],
  [/\bconventions\b/gi, {
    en: "Conventions are the unwritten but widely repeated patterns a community follows, such as naming, error-return style, module layout, and formatting habits.",
    ja: "慣習とは、命名・エラー返却スタイル・モジュール構成・フォーマット習慣など、コミュニティ内で繰り返される事実上の標準パターン。",
  }],
  [/慣習/g, {
    en: "Conventions: the common patterns a language community repeats across real codebases.",
    ja: "慣習: 実際のコードベースで繰り返される、その言語コミュニティの共通パターン。",
  }],
  [/\bintent\b/gi, {
    en: "Intent means what the programmer is trying to express: success vs failure, data shape, transformation steps, ownership, and so on.",
    ja: "意図とは、プログラマーが何を表現したいかということ。成功/失敗、データ形、変換段階、所有関係などが含まれる。",
  }],
  [/意図/g, {
    en: "Intent: what the programmer wants the code to mean or guarantee.",
    ja: "意図: コードに何を意味させ、何を保証させたいか。",
  }],
  [/\bcontracts\b/gi, {
    en: "Contracts are the promises code makes at its boundaries: what shapes it accepts, what shapes it returns, and what failures are possible.",
    ja: "契約とは、コードの境界で交わされる約束のこと。受け取る形、返す形、起こりうる失敗を明示する。",
  }],
  [/契約/g, {
    en: "Contracts: explicit promises about inputs, outputs, and failure behavior.",
    ja: "契約: 入力・出力・失敗挙動についての明示的な約束。",
  }],
  [/\bdata flow\b/gi, {
    en: "Data flow is the path values take through a program: where they come from, how they are transformed, and where they end up.",
    ja: "データフローとは、値がプログラム内をどう流れるかのこと。どこから来て、どう変換され、どこへ行くかを指す。",
  }],
  [/データフロー/g, {
    en: "Data flow: how values move and transform through the program.",
    ja: "データフロー: 値がプログラム内でどう流れ、変換されるか。",
  }],
  [/\bguesswork\b/gi, {
    en: "Guesswork is the extra inference burden on the reader or model when code leaves key information implicit rather than stating it directly.",
    ja: "推測とは、本来明示できる情報が省略されているために、読み手やモデルが補完しなければならない余分な推論負荷。",
  }],
  [/推測しなくてよい|推測/g, {
    en: "Guesswork: the hidden inference burden caused by implicit code.",
    ja: "推測: 暗黙のコードによって読み手側に押し付けられる補完負荷。",
  }],
  [/\bportable signal\b/gi, {
    en: "A portable signal is a feature that predicts good LLM behavior across multiple languages, not just inside one ecosystem.",
    ja: "ポータブルシグナルとは、特定の言語だけでなく複数言語にまたがってLLM性能を予測できる特徴のこと。",
  }],
  [/ポータブルシグナル/g, {
    en: "Portable signal: a feature that transfers as a predictor across languages.",
    ja: "ポータブルシグナル: 言語をまたいで予測因子として通用する特徴。",
  }],
  [/\bcross-language predictor\b/gi, {
    en: "A cross-language predictor is a property that correlates with outcomes across many languages rather than being specific to one of them.",
    ja: "言語横断的予測因子とは、1言語固有ではなく複数言語にまたがって結果と相関する性質。",
  }],
  [/言語横断的LLM性能予測因子|言語横断的予測因子/g, {
    en: "Cross-language predictor: a property that predicts outcomes across many languages.",
    ja: "言語横断的予測因子: 複数言語にまたがって結果を予測する性質。",
  }],
  [/\balgebraic data typ(?:e|es|ing)\b/gi, {
    en: "Algebraic data types build larger types from smaller ones using variants and records. They make data shape explicit, which is why they pair so well with pattern matching.",
    ja: "代数的データ型は、バリアントやレコードを組み合わせて型を作る考え方。データの形を明示しやすいため、パターンマッチと相性が良い。",
  }],
  [/代数的データ型/g, {
    en: "Algebraic data types: types built from explicit variants and records.",
    ja: "代数的データ型: バリアントやレコードを明示的に組み合わせて作る型。",
  }],
  [/\bvariant\b/gi, {
    en: "A variant is one possible case of a sum type, such as `circle` vs `rect` vs `triangle`.",
    ja: "バリアントとは、和型における各ケースのこと。たとえば `circle`、`rect`、`triangle` のような別々の形。",
  }],
  [/バリアント/g, {
    en: "Variant: one possible case of a tagged or sum type.",
    ja: "バリアント: タグ付き型や和型における各ケース。",
  }],
  [/\bfunction clause(?:s)?\b/gi, {
    en: "A function clause is one head/body variant of a multi-clause function. Elixir can pick the clause directly from argument shape and guards.",
    ja: "関数句とは、複数句関数の各ヘッド/本体ペアのこと。Elixirでは引数の形やガードから直接その句が選ばれる。",
  }],
  [/関数句/g, {
    en: "Function clause: one branch of a multi-clause function definition.",
    ja: "関数句: 複数句関数定義の中の1つの分岐。",
  }],
  [/\bconditional tree(?:s)?\b/gi, {
    en: "A conditional tree is a nested structure of `if`, `switch`, or similar branches where the reader must keep track of branching depth and earlier tests.",
    ja: "条件分岐ツリーとは、`if` や `switch` が入れ子になった構造のこと。読み手は分岐の深さや先行条件を追い続ける必要がある。",
  }],
  [/条件分岐ツリー/g, {
    en: "Conditional tree: nested branching logic that readers must mentally trace.",
    ja: "条件分岐ツリー: 読み手が頭の中で追跡しなければならない入れ子分岐構造。",
  }],
  [/\breferential transparency\b/gi, {
    en: "Referential transparency means an expression can be replaced with its value without changing program behavior. It is the key property behind equational reasoning.",
    ja: "参照透過性とは、式をその値で置き換えてもプログラムの振る舞いが変わらない性質。等式的推論の基盤になる。",
  }],
  [/\bstale references\b/gi, {
    en: "Stale references are pointers, bindings, or variables that still exist but no longer reflect the current intended state.",
    ja: "古い参照とは、存在はしているが、もはや現在の意図した状態を表していない参照や変数のこと。",
  }],
  [/古い参照/g, {
    en: "Stale references: bindings that still exist but no longer represent the intended current state.",
    ja: "古い参照: 残ってはいるが、現在の意図した状態を表していない束縛。",
  }],
  [/\bshared-state races\b/gi, {
    en: "Shared-state races happen when multiple parts of a program can read and write the same mutable state without a guaranteed order.",
    ja: "共有状態の競合は、複数の部分が同じ可変状態を順序保証なしに読み書きできる時に起こる。",
  }],
  [/共有状態の競合/g, {
    en: "Shared-state races: bugs caused by unsafely sharing mutable state.",
    ja: "共有状態の競合: 可変状態の危険な共有によって起こるバグ。",
  }],
  [/\btemporal coupling\b/gi, {
    en: "Temporal coupling means code only works if actions happen in the right order. The order dependency is part of the hidden contract.",
    ja: "時間的結合とは、処理が正しい順序で行われた時だけコードが成立する状態。順序依存が隠れた契約になっている。",
  }],
  [/時間的結合/g, {
    en: "Temporal coupling: hidden dependence on doing steps in the right order.",
    ja: "時間的結合: 手順の順番に隠れた依存があること。",
  }],
  [/\bmutation history\b/gi, {
    en: "Mutation history is the chain of prior in-place changes you must reconstruct to understand a variable's current meaning.",
    ja: "変異履歴とは、ある変数の現在の意味を理解するために遡る必要がある、過去の破壊的変更の連鎖。",
  }],
  [/変異履歴/g, {
    en: "Mutation history: the prior in-place updates behind a current value.",
    ja: "変異履歴: 現在の値の背後にある過去の破壊的更新の履歴。",
  }],
  [/\bpipeline style\b/gi, {
    en: "Pipeline style means expressing transformations as a visible sequence of stages rather than nested calls.",
    ja: "パイプラインスタイルとは、変換をネストした呼び出しではなく、見える段階列として表現する書き方。",
  }],
  [/パイプラインスタイル/g, {
    en: "Pipeline style: writing transformations as a visible series of stages.",
    ja: "パイプラインスタイル: 変換を見える段階列として書く方法。",
  }],
  [/\bnesting depth\b/gi, {
    en: "Nesting depth is how many layers of expressions or control flow are inside one another. Greater depth raises local cognitive load.",
    ja: "ネスト深度とは、式や制御フローが何層入れ子になっているかの尺度。深くなるほど局所的な認知負荷が上がる。",
  }],
  [/ネスト深度/g, {
    en: "Nesting depth: how many layers of nested logic or expressions a reader must track.",
    ja: "ネスト深度: 読み手が追うべき入れ子ロジックの層の深さ。",
  }],
  [/\bcanonical formatter\b/gi, {
    en: "A canonical formatter is the one accepted house style for an ecosystem. It removes personal formatting choices from normal code review.",
    ja: "標準フォーマッタとは、そのエコシステムで事実上の唯一の標準書式を与えるフォーマッタ。個人の整形好みを通常のレビューから外せる。",
  }],
  [/標準フォーマッタ/g, {
    en: "Canonical formatter: the standard formatting tool an ecosystem converges on.",
    ja: "標準フォーマッタ: エコシステム全体が収束する標準的な整形ツール。",
  }],
  [/\bdeterministic\b/gi, {
    en: "Deterministic means the same input always produces the same output. For formatting, it means the tool makes the layout choice for you every time.",
    ja: "決定論的とは、同じ入力から常に同じ出力が得られること。フォーマットでは、毎回同じ整形結果になることを意味する。",
  }],
  [/決定論的/g, {
    en: "Deterministic: always producing the same result from the same input.",
    ja: "決定論的: 同じ入力から常に同じ結果が得られること。",
  }],
  [/\bsemantics\b/gi, {
    en: "Semantics are the actual meaning and behavior of code, as distinct from surface syntax or formatting.",
    ja: "セマンティクスとは、表面的な構文や見た目ではなく、コードが実際に意味し、どう振る舞うかという部分。",
  }],
  [/セマンティクス/g, {
    en: "Semantics: the actual meaning and behavior of the code.",
    ja: "セマンティクス: コードの実際の意味や振る舞い。",
  }],
  [/\bco-located\b/gi, {
    en: "Co-located means the related information lives right next to the code it explains, instead of in a separate file or layer.",
    ja: "共配置とは、説明対象のコードのすぐ隣に関連情報が置かれていること。別ファイルや別層に離れていない。",
  }],
  [/共配置/g, {
    en: "Co-located: kept right next to the code or concept it explains.",
    ja: "共配置: 説明対象のすぐ隣に置かれていること。",
  }],
  [/\bverified input\/output pairs\b/gi, {
    en: "Verified input/output pairs are concrete examples whose outputs have been checked, not just described. They act like small executable specs.",
    ja: "検証済みの入出力ペアとは、出力が実際に確認された具体例のこと。小さな実行可能仕様として働く。",
  }],
  [/検証済みの入出力ペア/g, {
    en: "Verified input/output pairs: checked examples of inputs and expected outputs.",
    ja: "検証済みの入出力ペア: 実際に確認された入力と期待出力の組。",
  }],
  [/\bidiomatic equivalent\b/gi, {
    en: "An idiomatic equivalent is the way developers in that language would naturally write the same idea, not a literal syntax translation.",
    ja: "最も自然な等価表現とは、文字通りの直訳ではなく、その言語の開発者が普通に書く自然な書き方のこと。",
  }],
  [/最も自然な等価表現/g, {
    en: "Idiomatic equivalent: the natural, community-standard way to express the same idea in another language.",
    ja: "最も自然な等価表現: 他言語で同じ考えを自然に表す、そのコミュニティ標準の書き方。",
  }],
  [/\bidiomatic\b/gi, {
    en: "Idiomatic means written in the style experienced users of that language would consider natural and conventional.",
    ja: "idiomatic とは、その言語の熟練者が自然で慣用的だと感じる書き方のこと。",
  }],
  [/\bcurrent language features\b/gi, {
    en: "Current language features means the comparison is using modern, shipped capabilities of the language, not outdated syntax or future proposals.",
    ja: "最新の言語機能とは、古い構文や未来の提案ではなく、現在実際に使えるモダンな言語機能を指す。",
  }],
  [/最新の言語機能/g, {
    en: "Current language features: modern language capabilities that are already available today.",
    ja: "最新の言語機能: 現在すでに利用可能なモダン機能。",
  }],
  [/\bbuilt-in\b/gi, {
    en: "Built-in means the capability ships with the language or standard toolchain, so developers do not need an extra dependency to get it.",
    ja: "組み込みとは、その機能が言語や標準ツールチェーンに最初から含まれており、追加依存なしで使えること。",
  }],
  [/組み込み/g, {
    en: "Built-in: included in the language or its standard toolchain.",
    ja: "組み込み: 言語や標準ツールチェーンに最初から含まれていること。",
  }],
  [/\bthird-party\b/gi, {
    en: "Third-party means provided by an external library or tool rather than the language's official standard library or compiler toolchain.",
    ja: "サードパーティとは、その言語の標準ライブラリや公式ツールチェーンではなく、外部のライブラリやツールが提供すること。",
  }],
  [/サードパーティ/g, {
    en: "Third-party: supplied by an external library or tool, not the official standard tooling.",
    ja: "サードパーティ: 公式標準ではなく外部のライブラリやツールが提供すること。",
  }],
  [/\bcompile-time\b/gi, {
    en: "Compile-time means the property is checked or enforced while the code is being compiled or type-checked, before the program runs.",
    ja: "コンパイル時とは、プログラム実行前のコンパイルや型検査の段階で性質が確認・強制されること。",
  }],
  [/コンパイル時/g, {
    en: "Compile-time: enforced before execution, during compilation or type checking.",
    ja: "コンパイル時: 実行前のコンパイルや型検査段階。",
  }],
  [/\bruntime enforcement\b/gi, {
    en: "Runtime enforcement means the property is actually guaranteed while the program executes, not just checked by a linter or type system beforehand.",
    ja: "実行時保証とは、リントや型検査だけでなく、プログラム実行中にも実際に性質が保証されること。",
  }],
  [/実行時(?:保証|未保証)/g, {
    en: "Runtime enforcement: a property that is guaranteed while the program actually runs.",
    ja: "実行時保証: プログラムが実際に動く時点でも性質が守られること。",
  }],
  [/\bvalue type(?:s)?\b/gi, {
    en: "A value type is copied by value rather than shared by reference by default. That often makes reasoning about local changes simpler.",
    ja: "値型とは、既定で参照共有ではなく値としてコピーされる型のこと。ローカルな変化を追いやすくすることが多い。",
  }],
  [/値型/g, {
    en: "Value type: a type normally copied by value rather than shared by reference.",
    ja: "値型: 既定で参照共有ではなく値コピーされる型。",
  }],
  [/\bshallow(?:-|\s)frozen\b/gi, {
    en: "Shallow-frozen means only the outer object is protected. Nested objects or collections may still remain mutable.",
    ja: "浅いフリーズとは、外側のオブジェクトだけが保護されること。内部のオブジェクトやコレクションは可変のままかもしれない。",
  }],
  [/浅いフリーズ/g, {
    en: "Shallow-frozen: only the outer container is frozen, not nested contents.",
    ja: "浅いフリーズ: 外側だけ固定され、中の内容物までは固定されないこと。",
  }],
  [/\bmethod chaining\b/gi, {
    en: "Method chaining means expressing a sequence of operations by calling one method after another on intermediate results.",
    ja: "メソッドチェーンとは、中間結果に対してメソッドを連続で呼び出し、処理の列を表す書き方。",
  }],
  [/メソッドチェーン/g, {
    en: "Method chaining: expressing a pipeline as successive method calls.",
    ja: "メソッドチェーン: 連続したメソッド呼び出しでパイプラインを表すこと。",
  }],
  [/\bsequence\/yield builders\b/gi, {
    en: "Sequence/yield builders are constructs that let code describe a stream of produced values step by step, often lazily.",
    ja: "sequence/yield ビルダとは、値の列を段階的に、しばしば遅延評価で生成する構文やAPIのこと。",
  }],
  [/sequence\/yieldビルダ|sequence\/yield ビルダ/g, {
    en: "Sequence/yield builders: constructs for describing produced sequences step by step.",
    ja: "sequence/yield ビルダ: 値列を段階的に生成するための構文やAPI。",
  }],
  [/\bcollector(?:s)?\b/gi, {
    en: "A collector is the target structure a comprehension or pipeline is building into, such as a list, map, or stream.",
    ja: "collector とは、内包表記やパイプラインが結果を書き込んでいく先の構造のこと。リスト、マップ、ストリームなどがある。",
  }],
  [/\bcomplexity grows\b/gi, {
    en: "This phrase means the advantage becomes more visible as the task requires more steps, more state, or more branching.",
    ja: "複雑さに強く効いているとは、必要な段階数や状態、分岐が増えるほど、その利点がはっきり現れるという意味。",
  }],
  [/複雑さに強く効いている/g, {
    en: "Advantage grows with complexity: the benefit becomes clearer on harder, more multi-step tasks.",
    ja: "複雑さに強く効いている: 難しく多段な課題ほど、その利点が目立つということ。",
  }],
  [/\bexplicitness\b/gi, {
    en: "Explicitness: the degree to which a language forces the programmer to state intent, contracts, and data flow directly in code - leaving nothing implicit for the reader (or an LLM) to guess.",
    ja: "明示性: プログラマーが意図・契約・データフローをコード上で直接宣言する度合い。読み手（やLLM）が推測する余地を最小化する。",
  }],
  [/\btraining data\b/gi, {
    en: "Training data: the massive corpus of code, text, and documentation that LLMs learn from during pre-training. Elixir has far less training data than Python, yet outperforms it - suggesting data volume isn't the main driver.",
    ja: "訓練データ: LLMが事前学習で学ぶ膨大なコード・テキスト・ドキュメントの集合体。ElixirはPythonより訓練データが少ないのに上回る - データ量が主因ではないことを示唆。",
  }],
  [/\b訓練データ(?:量)?/g, {
    en: "Training data: the massive corpus of code that LLMs learn from during pre-training.",
    ja: "訓練データ: LLMが事前学習で学ぶ膨大なコード・テキスト・ドキュメントの集合体。ElixirはPythonより訓練データが少ないのに上回る。",
  }],
  [/\bpredictive burden\b/gi, {
    en: "Predictive burden: the amount of guesswork an LLM must do to infer what code should come next. Explicit languages reduce this burden by making intent visible in the syntax itself.",
    ja: "予測負荷: LLMが次のコードを推測するのに必要な「推測量」。明示的な言語は構文自体に意図を可視化し、この負荷を減らす。",
  }],
  [/\b予測負荷/g, {
    en: "Predictive burden: the guesswork an LLM must do to predict next tokens.",
    ja: "予測負荷: LLMが次のコードを推測するために必要な「推測量」。明示的な言語はこの負荷を大幅に減らす。",
  }],
  [/\bsurface-level entropy\b/gi, {
    en: "Surface-level entropy: the stylistic variation in code formatting (indentation, spacing, naming). A canonical formatter collapses this to near zero, letting the LLM focus entirely on semantics.",
    ja: "表面エントロピー: コードフォーマットのスタイル変動（インデント・スペース・命名）。標準フォーマッタがこれをほぼゼロに圧縮し、LLMがセマンティクスに集中できるようにする。",
  }],
  [/\b表面エントロピー/g, {
    en: "Surface-level entropy: stylistic variation in code formatting.",
    ja: "表面エントロピー: コードフォーマットのスタイル変動。標準フォーマッタがこれをほぼゼロに圧縮し、LLMが意味に集中できる。",
  }],
  [/\bnext-token prediction signal\b/gi, {
    en: "Next-token prediction signal: how strongly a pattern in code predicts what token comes next. {:ok, _}/{:error, _} appears so consistently in Elixir that LLMs can predict it with very high confidence.",
    ja: "次トークン予測シグナル: コードのパターンが次のトークンをどれだけ強く予測するか。{:ok, _}/{:error, _}はElixirで極めて一貫して現れるため、LLMが高い確信度で予測できる。",
  }],
  [/\b次トークン予測シグナル/g, {
    en: "Next-token prediction signal: how strongly a code pattern predicts the next token.",
    ja: "次トークン予測シグナル: コードパターンが次トークンをどれだけ強く予測するか。{:ok, _}/{:error, _}は極めて強いシグナル。",
  }],
  [/\bexhaustiveness\b/gi, {
    en: "Exhaustiveness: the compiler guarantee that every possible variant of a type or pattern is handled. No case is missed, no edge case forgotten. LLMs benefit because each branch is explicit and predictable.",
    ja: "網羅性: 型やパターンのすべてのバリアントが処理されることをコンパイラが保証すること。LLMにとっては各分岐が明示的で予測しやすいため有益。",
  }],
  [/\b網羅性/g, {
    en: "Exhaustiveness: compiler guarantee that all variants are handled.",
    ja: "網羅性: すべてのバリアントが処理されることをコンパイラが保証する。見落としがないことをLLMも活用できる。",
  }],
  [/\b{:ok, (?:val|_)}\/\{:error, (?:reason|_)}/g, {
    en: "Elixir's tagged tuple convention: every function returns {:ok, value} on success or {:error, reason} on failure. This pattern is the single strongest predictor of LLM performance across all languages tested.",
    ja: "Elixirのタグ付きタプル規約: すべての関数が成功時に{:ok, value}、失敗時に{:error, reason}を返す。テストされた全言語中、LLM性能の最も強力な予測因子。",
  }],
  [/\bPass@1\b/g, {
    en: "Pass@1: the probability that the first code sample generated by an LLM passes all test cases. It's the standard benchmark metric from the HumanEval paper (Chen et al., 2021) used to evaluate code generation quality.",
    ja: "Pass@1: LLMが生成した最初のコードサンプルが全テストケースをパスする確率。コード生成品質評価の標準ベンチマーク指標（HumanEval論文, Chen et al., 2021）。",
  }],
];

/* ── Link hover tooltips: explain what each link points to ── */
const LINK_TOOLTIPS: Record<string, { en: string; ja: string }> = {
  // Elixir ecosystem
  "https://hexdocs.pm/ex_unit/ExUnit.html": {
    en: "ExUnit - Elixir's built-in test framework. Supports doctests, async tests, and pattern-matched assertions.",
    ja: "ExUnit - Elixir組み込みのテストフレームワーク。doctest・非同期テスト・パターンマッチアサーション対応。",
  },
  "https://github.com/elixir-lang/ex_doc": {
    en: "ex_doc - Generates beautiful HTML documentation from Elixir source code and @doc attributes.",
    ja: "ex_doc - Elixirソースコードと@doc属性から美しいHTMLドキュメントを生成するツール。",
  },
  "https://hexdocs.pm/mix/Mix.Tasks.Format.html": {
    en: "mix format - Elixir's canonical code formatter. Eliminates all style debates - one format, zero entropy.",
    ja: "mix format - Elixirの標準コードフォーマッタ。スタイル議論をゼロに - 統一フォーマット。",
  },
  "https://hexdocs.pm/elixir/GenServer.html": {
    en: "GenServer - A behaviour for implementing client-server relationships in OTP. The backbone of Elixir's concurrency model.",
    ja: "GenServer - OTPのクライアント-サーバー関係を実装するビヘイビア。Elixir並行処理モデルの中核。",
  },
  "https://www.erlang.org/doc/design_principles/des_princ": {
    en: "OTP Design Principles - Erlang/Elixir's battle-tested framework for building fault-tolerant distributed systems since 1986.",
    ja: "OTP設計原則 - 1986年から実績のあるErlang/Elixirの耐障害分散システム構築フレームワーク。",
  },
  "https://hexdocs.pm/elixir/typespecs.html": {
    en: "@spec - Elixir type specifications. Declares function signatures for documentation, Dialyzer analysis, and LLM comprehension.",
    ja: "@spec - Elixir型仕様。関数シグネチャをドキュメント・Dialyzer解析・LLM理解のために宣言。",
  },
  "https://hexdocs.pm/elixir/writing-documentation.html": {
    en: "@doc - Elixir documentation attributes. First-class language feature, not afterthought comments.",
    ja: "@doc - Elixirドキュメント属性。後付けのコメントではなく、言語のファーストクラス機能。",
  },
  "https://hexdocs.pm/ex_unit/ExUnit.DocTest.html": {
    en: "Doctests - Runnable code examples inside documentation. They serve as spec, test, and docs simultaneously.",
    ja: "Doctest - ドキュメント内の実行可能コード例。仕様・テスト・ドキュメントの三役を同時に果たす。",
  },
  // Other language tools
  "https://dotnet.github.io/docfx/": {
    en: "DocFX - Microsoft's documentation generator for .NET projects. Produces API reference from XML comments.",
    ja: "DocFX - Microsoft製.NETドキュメント生成ツール。XMLコメントからAPI参照を生成。",
  },
  "https://kotlinlang.org/docs/kotlin-doc.html": {
    en: "KDoc - Kotlin's documentation format. Similar to Javadoc but with Kotlin-specific extensions.",
    ja: "KDoc - Kotlinのドキュメント形式。Javadoc類似だがKotlin固有の拡張あり。",
  },
  "https://developer.apple.com/documentation/docc": {
    en: "DocC - Apple's documentation compiler for Swift. Generates interactive tutorials and API reference.",
    ja: "DocC - Apple製Swiftドキュメントコンパイラ。インタラクティブチュートリアルとAPI参照を生成。",
  },
  "https://pub.dev/packages/dartdoc_test": {
    en: "dartdoc_test - A Dart package that extracts and runs code samples from dartdoc comments as tests.",
    ja: "dartdoc_test - dartdocコメントからコードサンプルを抽出しテストとして実行するDartパッケージ。",
  },
  "https://jsdoc.app/": {
    en: "JSDoc - JavaScript's standard documentation format. Adds type information and descriptions via comments.",
    ja: "JSDoc - JavaScriptの標準ドキュメント形式。コメントで型情報と説明を追加。",
  },
  "https://prettier.io/": {
    en: "Prettier - Opinionated code formatter for JavaScript/TypeScript. Similar philosophy to mix format.",
    ja: "Prettier - JavaScript/TypeScript用の独自見解コードフォーマッタ。mix formatと同様の思想。",
  },
  "https://pkg.go.dev/cmd/gofmt": {
    en: "gofmt - Go's canonical code formatter. One of the earliest \"one true format\" tools. Inspired many others.",
    ja: "gofmt - Go標準コードフォーマッタ。「唯一の正しいフォーマット」ツールの先駆け。多くの後続に影響。",
  },
  "https://github.com/psf/black": {
    en: "Black - The uncompromising Python code formatter. \"Any color you like, as long as it's black.\"",
    ja: "Black - 妥協なきPythonコードフォーマッタ。「好きな色を選べ、ただし黒に限る。」",
  },
  "https://github.com/supermacro/neverthrow": {
    en: "neverthrow - A TypeScript library for type-safe error handling with Result types. Brings Rust/Elixir patterns to TS.",
    ja: "neverthrow - Result型による型安全なエラーハンドリングのTypeScriptライブラリ。Rust/Elixirパターンを導入。",
  },
  "https://effect.website/": {
    en: "Effect - A powerful TypeScript library for building complex, type-safe applications with structured concurrency and error handling.",
    ja: "Effect - 構造化された並行処理とエラーハンドリングを備えた強力なTypeScriptライブラリ。",
  },
  "https://arrow-kt.io/": {
    en: "Arrow - Functional programming library for Kotlin. Provides Either, Option, and other algebraic data types.",
    ja: "Arrow - Kotlin用関数型プログラミングライブラリ。Either・Option等の代数的データ型を提供。",
  },
  "https://pub.dev/packages/fpdart": {
    en: "fpdart - Functional programming in Dart. Adds Option, Either, Task, and other FP types.",
    ja: "fpdart - Dartの関数型プログラミング。Option・Either・Task等のFP型を追加。",
  },
  "https://github.com/dry-python/returns": {
    en: "returns - Make Python functions return meaningful, typed results instead of raising exceptions.",
    ja: "returns - Python関数に例外の代わりに意味のある型付き結果を返させるライブラリ。",
  },
  // CS concepts (Wikipedia)
  "https://arxiv.org/abs/2107.03374": {
    en: "HumanEval paper (Chen et al., 2021) - Introduced Pass@1 as the standard metric for evaluating LLM code generation quality.",
    ja: "HumanEval論文 (Chen et al., 2021) - LLMコード生成品質評価の標準指標Pass@1を導入した論文。",
  },
  "https://en.wikipedia.org/wiki/Referential_transparency": {
    en: "Referential transparency: an expression can be replaced with its value without changing the program's behavior. A cornerstone of functional programming and immutability.",
    ja: "参照透過性: 式をその値に置き換えてもプログラムの動作が変わらない性質。関数型プログラミングと不変性の基盤。",
  },
  "https://en.wikipedia.org/wiki/Literate_programming": {
    en: "Literate programming: Donald Knuth's paradigm where code and documentation are interwoven. Elixir's doctests are a practical realization of this ideal.",
    ja: "リテラルプログラミング: Donald Knuthの提唱したコードとドキュメントを織り交ぜるパラダイム。Elixirのdoctestはこの理想の実用化。",
  },
  "https://en.wikipedia.org/wiki/Algebraic_data_type": {
    en: "Algebraic data types (ADTs): types formed by combining other types using sum (variants) and product (records). Foundation of pattern matching.",
    ja: "代数的データ型 (ADT): 和（バリアント）と積（レコード）で他の型を組み合わせて作る型。パターンマッチの基礎。",
  },
  "https://en.wikipedia.org/wiki/Pattern_matching": {
    en: "Pattern matching: a mechanism for checking a value against a pattern and destructuring it. Far more powerful than switch/case statements.",
    ja: "パターンマッチング: 値をパターンに照合し分解する機構。switch/case文よりはるかに強力。",
  },
  "https://en.wikipedia.org/wiki/Information_theory": {
    en: "Information theory: Claude Shannon's mathematical framework for quantifying information. Relevant here because code formatting adds entropy that LLMs must process.",
    ja: "情報理論: Claude Shannonによる情報を定量化する数学的枠組み。コードフォーマットがLLMの処理すべきエントロピーを追加するため関連。",
  },
  "https://en.wikipedia.org/wiki/Language_model": {
    en: "Language models predict the next token in a sequence. LLMs like GPT-4 use this principle at massive scale for code generation.",
    ja: "言語モデルはシーケンスの次のトークンを予測する。GPT-4等のLLMはこの原理を大規模に活用しコード生成を行う。",
  },
};

function Linkify({ text, isJa = false }: { text: string; isJa?: boolean }) {
  type Segment =
    | { type: "text"; value: string }
    | { type: "link"; value: string; url: string }
    | { type: "tooltip"; value: string; tip: string }
    | { type: "bold"; value: string };
  const segments: Segment[] = [{ type: "text", value: text }];

  // Process **bold** markers first
  const boldRe = /\*\*(.+?)\*\*/g;
  {
    const newSegments: Segment[] = [];
    for (const seg of segments) {
      if (seg.type !== "text") { newSegments.push(seg); continue; }
      const str = seg.value;
      const re = new RegExp(boldRe.source, boldRe.flags);
      let lastIdx = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(str)) !== null) {
        if (match.index > lastIdx) newSegments.push({ type: "text", value: str.slice(lastIdx, match.index) });
        newSegments.push({ type: "bold", value: match[1] });
        lastIdx = re.lastIndex;
      }
      if (lastIdx < str.length) newSegments.push({ type: "text", value: str.slice(lastIdx) });
    }
    segments.length = 0;
    segments.push(...newSegments);
  }

  // Process tooltip patterns
  for (const [pattern, tips] of KEYWORD_TOOLTIPS) {
    const tip = isJa ? tips.ja : tips.en;
    const newSegments: Segment[] = [];
    for (const seg of segments) {
      if (seg.type !== "text" && seg.type !== "bold") { newSegments.push(seg); continue; }
      const str = seg.value;
      const re = new RegExp(pattern.source, pattern.flags);
      let lastIdx = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(str)) !== null) {
        if (match.index > lastIdx) newSegments.push({ type: seg.type, value: str.slice(lastIdx, match.index) } as Segment);
        newSegments.push({ type: "tooltip", value: match[0], tip });
        lastIdx = re.lastIndex;
        if (match[0].length === 0) re.lastIndex++;
      }
      if (lastIdx < str.length) newSegments.push({ type: seg.type, value: str.slice(lastIdx) } as Segment);
    }
    segments.length = 0;
    segments.push(...newSegments);
  }

  // Then process link patterns on text and bold segments
  for (const [pattern, url] of KEYWORD_LINKS) {
    const newSegments: Segment[] = [];
    for (const seg of segments) {
      if (seg.type !== "text" && seg.type !== "bold") {
        newSegments.push(seg);
        continue;
      }
      const str = seg.value;
      const re = new RegExp(pattern.source, pattern.flags);
      let lastIdx = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(str)) !== null) {
        if (match.index > lastIdx) {
          newSegments.push({ type: seg.type, value: str.slice(lastIdx, match.index) } as Segment);
        }
        newSegments.push({ type: "link", value: match[0], url });
        lastIdx = re.lastIndex;
        if (match[0].length === 0) { re.lastIndex++; }
      }
      if (lastIdx < str.length) {
        newSegments.push({ type: seg.type, value: str.slice(lastIdx) } as Segment);
      }
    }
    segments.length = 0;
    segments.push(...newSegments);
  }

  const tooltipPopup = (tip: string) => (
    <span
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-4 py-3.5 rounded-xl text-[11px] leading-[1.7] opacity-0 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:pointer-events-auto transition-all duration-200 z-50 whitespace-pre-line"
      style={{
        width: 340,
        background: "rgba(12,16,24,0.97)",
        border: "1px solid rgba(155,89,182,0.3)",
        color: "rgba(255,255,255,0.82)",
        fontFamily: SANS,
        fontWeight: 400,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(155,89,182,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      {tip}
    </span>
  );

  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "link" ? (() => {
          const linkTip = LINK_TOOLTIPS[seg.url];
          const tip = linkTip ? (isJa ? linkTip.ja : linkTip.en) : null;
          return tip ? (
            <span key={i} className="relative inline group/tip">
              <a href={seg.url} target="_blank" rel="noopener noreferrer"
                className="no-underline border-b transition-all duration-200 hover:border-opacity-80 cursor-pointer"
                style={{ color: "rgba(130,180,255,0.85)", borderColor: "rgba(130,180,255,0.25)" }}>
                {seg.value}
                <ExternalLink className="inline w-2.5 h-2.5 ml-0.5 opacity-40" />
              </a>
              {tooltipPopup(tip)}
            </span>
          ) : (
            <a key={i} href={seg.url} target="_blank" rel="noopener noreferrer"
              className="no-underline border-b transition-all duration-200 hover:border-opacity-80"
              style={{ color: "rgba(130,180,255,0.85)", borderColor: "rgba(130,180,255,0.25)" }}>
              {seg.value}
            </a>
          );
        })() : seg.type === "tooltip" ? (
          <span key={i} className="relative inline group/tip cursor-help">
            <span
              className="border-b border-dashed"
              style={{ color: "rgba(200,170,255,0.95)", borderColor: "rgba(200,170,255,0.35)", fontFamily: MONO, fontWeight: 600, fontSize: "0.92em" }}
            >
              {seg.value}
            </span>
            {tooltipPopup(seg.tip)}
          </span>
        ) : seg.type === "bold" ? (
          <strong key={i} style={{ color: "#fff", fontWeight: 700 }}>{seg.value}</strong>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </>
  );
}

function ImportanceBadge({ level, isJa }: { level: "critical" | "high" | "medium"; isJa: boolean }) {
  const cfg = {
    critical: { label: isJa ? "最重要" : "Critical", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", color: "#EF4444" },
    high:     { label: isJa ? "重要" : "High",     bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: "#F59E0B" },
    medium:   { label: isJa ? "中程度" : "Medium",   bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", color: "#10B981" },
  }[level];
  return (
    <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full border"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color, fontFamily: MONO }}>
      {cfg.label}
    </span>
  );
}

function CodeSampleIcon({ icon }: { icon: CodeSampleIconId }) {
  switch (icon) {
    case "git-branch":
      return <GitBranch className="w-4 h-4" />;
    case "shield":
      return <Shield className="w-4 h-4" />;
    case "lock":
      return <Lock className="w-4 h-4" />;
    case "layers":
      return <Layers className="w-4 h-4" />;
    case "paintbrush":
      return <Paintbrush className="w-4 h-4" />;
    case "sparkles":
      return <Sparkles className="w-4 h-4" />;
    case "cpu":
      return <Cpu className="w-4 h-4" />;
    case "book-open":
      return <BookOpen className="w-4 h-4" />;
    case "flask-conical":
      return <FlaskConical className="w-4 h-4" />;
    default:
      return null;
  }
}

function FootnoteSection({ sample, lang }: { sample: CodeSample; lang: Lang }) {
  const isJa = lang === "ja";
  const fontBody = isJa ? JA_SANS : SANS;
  if (!sample.libraries?.length && !sample.caveats) return null;

  return (
    <div className="mt-2 px-4 py-3.5 rounded-b-[14px]" style={{ background: "rgba(255,255,255,0.025)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Libraries */}
      {sample.libraries && sample.libraries.length > 0 && (
        <div className="mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] mr-2" style={{ color: "rgba(255,255,255,0.40)", fontFamily: MONO }}>
            {isJa ? "ライブラリ" : "Libraries"}
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5">
            {sample.libraries.map((lib, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[12px]" style={{ fontFamily: MONO, color: "rgba(255,255,255,0.55)" }}>
                <span className="shrink-0 opacity-70"><LangIcon id={lib.lang as LangId} size={13} /></span>
                {lib.url ? (
                  <a href={lib.url} target="_blank" rel="noopener noreferrer"
                    className="no-underline transition-colors hover:underline"
                    style={{ color: lib.builtin ? "rgba(255,255,255,0.55)" : "rgba(99,165,255,0.85)" }}>
                    {lib.name}
                  </a>
                ) : (
                  <span style={{ color: lib.builtin ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.55)" }}>{lib.name}</span>
                )}
                {lib.builtin && <span className="text-[9px] opacity-50" style={{ fontFamily: MONO }}>(built-in)</span>}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* Caveats */}
      {sample.caveats && (
        <p className="text-[12px] m-0 leading-[1.7]" style={{ color: "rgba(255,255,255,0.40)", fontFamily: fontBody }}>
          <span className="font-bold mr-1" style={{ color: "rgba(245,158,11,0.6)" }}>⚠</span>
          <Linkify text={sample.caveats[lang]} isJa={isJa} />
        </p>
      )}
    </div>
  );
}

function tint(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function ComparisonLanguageBar({
  lang,
  availableLangs,
  selectedLangs,
  onToggle,
  onReset,
  onClear,
}: {
  lang: Lang;
  availableLangs: LangId[];
  selectedLangs: LangId[];
  onToggle: (lid: LangId) => void;
  onReset: () => void;
  onClear: () => void;
}) {
  const isJa = lang === "ja";

  return (
    <div
      className="sticky top-4 z-20 mb-8 rounded-[20px] border px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-xl"
      style={{
        background: "linear-gradient(135deg, rgba(18,28,45,0.88), rgba(29,36,58,0.84))",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.24)",
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "#7DD3FC", fontFamily: MONO }}>
              {isJa ? "比較バー" : "Comparison Bar"}
            </div>
            <div className="text-[12px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.58)", fontFamily: isJa ? JA_SANS : SANS }}>
              {isJa
                ? "下のチップで比較したい言語を追加・削除できます。"
                : "Use the chips below to add or remove comparison languages."}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 hover:opacity-100"
            style={{
              fontFamily: MONO,
              color: "rgba(255,255,255,0.6)",
              borderColor: "rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.025)",
              opacity: 0.9,
            }}
          >
            <Eraser className="h-3.5 w-3.5" />
            {isJa ? "すべて外す" : "Clear all"}
          </button>
          <button
            onClick={onReset}
            className="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 hover:opacity-100"
            style={{
              fontFamily: MONO,
              color: "rgba(255,255,255,0.72)",
              borderColor: "rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              opacity: 0.9,
            }}
          >
            {isJa ? "既定に戻す" : "Reset"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div
          className="min-w-0 flex-1 overflow-x-auto scrollbar-hide"
          onWheel={scrollTabsOnWheel}
        >
          <div className="flex w-max gap-2 pr-2">
            {availableLangs.map((lid) => {
              const active = selectedLangs.includes(lid);
              const color = LANG_COLORS[lid];
              return (
                <button
                  key={lid}
                  onClick={() => {
                    playTabSound(lid);
                    onToggle(lid);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all duration-200"
                  style={{
                    fontFamily: MONO,
                    borderColor: active ? tint(color, 0.42) : "rgba(255,255,255,0.08)",
                    background: active ? tint(color, 0.14) : "rgba(255,255,255,0.035)",
                    color: active ? color : "rgba(255,255,255,0.45)",
                    boxShadow: active ? `0 0 0 1px ${tint(color, 0.14)}` : "none",
                  }}
                >
                  <LangIcon id={lid} size={14} />
                  <span>{LANG_LABELS[lid]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MissingSnippetState({
  lang,
  lid,
  emptySelection = false,
}: {
  lang: Lang;
  lid: LangId;
  emptySelection?: boolean;
}) {
  const isJa = lang === "ja";
  const fontBody = isJa ? JA_SANS : SANS;

  return (
    <div
      className="flex h-full min-h-[200px] items-center justify-center px-8 text-center"
      style={{
        color: "rgba(255,255,255,0.48)",
        fontFamily: fontBody,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div>
        {!emptySelection && (
          <div
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: LANG_COLORS[lid], fontFamily: MONO }}
          >
            {LANG_LABELS[lid]}
          </div>
        )}
        <div className="text-[13px] leading-[1.7]">
          {emptySelection
            ? isJa
              ? "比較言語がまだ選択されていません。上の比較バーから言語を追加してください。"
              : "No comparison language is selected yet. Add one from the comparison bar above."
            : isJa
              ? "この比較サンプルはまだ用意していません。タブは保持したまま、今後ここに追加できます。"
              : "This comparison snippet is not available yet. The tab stays visible so it can be filled in later."}
        </div>
      </div>
    </div>
  );
}

function CodeComparison({
  sample,
  lang,
  comparisonLangs,
  activeLang,
  onActiveLangChange,
  accentColor = "#10B981",
  highlights,
}: {
  sample: CodeSample;
  lang: Lang;
  comparisonLangs: LangId[];
  activeLang: LangId;
  onActiveLangChange: (lid: LangId) => void;
  accentColor?: string;
  highlights: HighlightMap;
}) {
  const visibleComparisonLangs = comparisonLangs;
  const fallbackLang = visibleComparisonLangs[0] ?? null;
  const resolvedActiveLang =
    activeLang && visibleComparisonLangs.includes(activeLang)
      ? activeLang
      : fallbackLang;
  const [mobileLang, setMobileLang] = useState<LangId>("elixir");
  const isJa = lang === "ja";
  const fontBody = isJa ? JA_SANS : SANS;
  const diagramNode = sample.diagramId === "doc-pipeline" ? <DocPipelineDiagram isJa={isJa} /> : null;

  useEffect(() => {
    if (mobileLang !== "elixir" && !visibleComparisonLangs.includes(mobileLang)) {
      setMobileLang("elixir");
    }
  }, [mobileLang, visibleComparisonLangs]);

  return (
    <div className="mb-20">
      {/* Section header */}
      <div className="mb-4 px-1">
        <div className="flex items-center gap-2.5 mb-2">
          <span style={{ color: accentColor }}>
            <CodeSampleIcon icon={sample.icon} />
          </span>
          <h3 className="text-[20px] sm:text-[22px] font-bold m-0" style={{ fontFamily: fontBody, color: accentColor }}>
            {sample.title[lang]}
          </h3>
          {sample.importance && <ImportanceBadge level={sample.importance} isJa={isJa} />}
        </div>
        <p className="text-sm sm:text-[15px] m-0 leading-[1.75]" style={{ color: "rgba(255,255,255,0.55)", fontFamily: fontBody }}>
          <Linkify text={sample.description[lang]} isJa={isJa} />
        </p>
      </div>

      {/* Optional inline diagram */}
      {diagramNode && <div className="mb-3">{diagramNode}</div>}

      <div className="md:hidden">
        <div
          className="rounded-[14px] overflow-hidden"
          style={{ background: WINDOW_BG, border: WINDOW_BORDER, boxShadow: WINDOW_SHADOW }}
        >
          <div
            className="flex overflow-x-auto scrollbar-hide gap-0 px-2"
            style={{ borderBottom: DIVIDER, background: "rgba(0,0,0,0.15)" }}
            onWheel={scrollTabsOnWheel}
          >
            <LangTab
              lid="elixir"
              isActive={mobileLang === "elixir"}
              showStar
              onClick={() => setMobileLang("elixir")}
            />
            {visibleComparisonLangs.map((lid) => (
              <LangTab
                key={lid}
                lid={lid}
                isActive={mobileLang === lid}
                onClick={() => setMobileLang(lid)}
              />
            ))}
          </div>

          {sample.snippets[mobileLang] ? (
            <SyntaxBlock
              code={sample.snippets[mobileLang] ?? ""}
              language={LANG_SHIKI[mobileLang] ?? LANG_LABELS[mobileLang]}
              annotations={sample.annotations?.[mobileLang] ?? []}
              uiLang={lang}
              highlightedHtml={highlights[sample.id]?.[mobileLang]}
            />
          ) : (
            <MissingSnippetState lang={lang} lid={mobileLang} />
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <div
          className="rounded-t-[14px] overflow-hidden"
          style={{
            background: WINDOW_BG,
            border: WINDOW_BORDER,
            borderBottom: "none",
            boxShadow: WINDOW_SHADOW,
          }}
        >
          <div
            className="grid grid-cols-2"
            style={{ borderBottom: DIVIDER, background: "rgba(0,0,0,0.15)" }}
          >
            <div className="flex px-2" style={{ borderRight: DIVIDER }}>
              <LangTab lid="elixir" isActive showStar onClick={() => {}} />
            </div>
            <div className="min-w-0 overflow-x-auto scrollbar-hide" onWheel={scrollTabsOnWheel}>
              <div className="flex w-max min-w-full px-2">
                {visibleComparisonLangs.map((lid) => (
                  <LangTab
                    key={lid}
                    lid={lid}
                    isActive={resolvedActiveLang === lid}
                    onClick={() => onActiveLangChange(lid)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ minHeight: 200 }}>
            <div className="flex flex-col" style={{ borderRight: DIVIDER }}>
              <div className="flex-1">
                <SyntaxBlock
                  code={sample.snippets.elixir ?? ""}
                  language={LANG_SHIKI.elixir ?? LANG_LABELS.elixir}
                  annotations={sample.annotations?.elixir ?? []}
                  uiLang={lang}
                  highlightedHtml={highlights[sample.id]?.elixir}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex-1">
                {resolvedActiveLang ? (
                  sample.snippets[resolvedActiveLang] ? (
                    <SyntaxBlock
                      code={sample.snippets[resolvedActiveLang] ?? ""}
                      language={LANG_SHIKI[resolvedActiveLang] ?? LANG_LABELS[resolvedActiveLang]}
                      annotations={sample.annotations?.[resolvedActiveLang] ?? []}
                      uiLang={lang}
                      highlightedHtml={highlights[sample.id]?.[resolvedActiveLang]}
                    />
                  ) : (
                    <MissingSnippetState lang={lang} lid={resolvedActiveLang} />
                  )
                ) : (
                  <MissingSnippetState lang={lang} lid="python" emptySelection />
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="rounded-b-[14px] overflow-hidden"
          style={{ background: WINDOW_BG, border: WINDOW_BORDER, borderTop: "none" }}
        >
          <FootnoteSection sample={sample} lang={lang} />
        </div>
      </div>

      <div className="md:hidden">
        <FootnoteSection sample={sample} lang={lang} />
      </div>
    </div>
  );
}


/* ── Difficulty Bar ── */
function DifficultyBars({ data, isJa }: { data: DifficultyDatum[]; isJa: boolean }) {
  const [ref, visible] = useInView(0.2);
  return (
    <div ref={ref}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 mb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-[80px] sm:w-[100px] shrink-0 text-[9px] uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO }}>
          {isJa ? "言語" : "Lang"}
        </div>
        <div className="flex-1 text-[9px] uppercase tracking-[0.15em] text-center" style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO }}>
          {isJa ? "易 / 中 / 難" : "Easy / Med / Hard"}
        </div>
        <div className="w-[60px] text-right text-[9px] uppercase tracking-[0.15em] shrink-0" style={{ color: "rgba(255,255,255,0.3)", fontFamily: MONO }}>
          {isJa ? "低下" : "Drop"}
        </div>
      </div>
      {data.map((d) => (
        <DifficultyRow key={d.lang} data={d} isJa={isJa} visible={visible} />
      ))}
    </div>
  );
}

function DifficultyRow({ data, isJa, visible }: { data: DifficultyDatum; isJa: boolean; visible: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="w-[80px] sm:w-[100px] flex items-center gap-1.5 text-[13px] font-bold shrink-0"
        style={{ fontFamily: MONO, color: data.color }}
      >
        <span className="shrink-0 opacity-80"><DiffLangIcon lang={data.lang} color={data.color} /></span>
        {data.lang}
      </div>
      <div className="flex-1 flex gap-1 items-center">
        {[
          { label: isJa ? "易" : "Easy", value: data.easy },
          { label: isJa ? "中" : "Med", value: data.medium },
          { label: isJa ? "難" : "Hard", value: data.hard },
        ].map((d) => (
          <div key={d.label} className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: MONO }}>{d.label}</span>
              <span className="text-[11px] font-bold" style={{ color: data.color, fontFamily: MONO, opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}>{d.value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: visible ? `${d.value}%` : "0%",
                  background: data.color,
                  opacity: d.label === (isJa ? "難" : "Hard") ? 1 : 0.5,
                  transition: "width 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        className="w-[60px] text-right text-[13px] font-black shrink-0"
        style={{
          fontFamily: MONO,
          color: Math.abs(data.degradation) <= 15 ? "#10B981" : Math.abs(data.degradation) <= 37 ? "#F59E0B" : "#EF4444",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease 0.5s",
        }}
      >
        {data.degradation}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */

export default function LanguageIsThePromptPage({
  codeSamples = [],
  highlights = {},
  pageContent,
}: {
  codeSamples?: CodeSample[];
  highlights?: HighlightMap;
  pageContent: LanguagePromptPageContent;
}) {
  const scriptHighlights = readHighlightsFromScript();
  const resolvedHighlights =
    Object.keys(scriptHighlights).length > 0
      ? scriptHighlights
      : highlights;
  const [lang, setLang] = useState<Lang>("ja");
  const [selectedLangs, setSelectedLangs] = useState<LangId[]>(DEFAULT_COMPARISON_LANGS);
  const [sectionLangs, setSectionLangs] = useState<LangId[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("aid-lang");
    if (stored === "en" || stored === "ja") setLang(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem("aid-lang", lang);
  }, [lang]);
  useEffect(() => {
    const available = new Set<LangId>();
    for (const sample of codeSamples) {
      for (const lid of SELECTOR_LANGS) {
        if (sample.snippets[lid]) {
          available.add(lid);
        }
      }
    }

    setSelectedLangs((prev) => {
      const filtered = prev.filter((lid) => available.has(lid));
      if (filtered.length > 0) {
        return filtered;
      }
      return DEFAULT_COMPARISON_LANGS.filter((lid) => available.has(lid));
    });
  }, [codeSamples]);
  useEffect(() => {
    setSectionLangs((prev) =>
      codeSamples.map((sample, idx) => {
        const current = prev[idx];
        const availableForSample = selectedLangs.filter((lid) => Boolean(sample.snippets[lid]));

        if (current && availableForSample.includes(current)) {
          return current;
        }

        return availableForSample[0] ?? selectedLangs[0] ?? DEFAULT_COMPARISON_LANGS[0] ?? "python";
      }),
    );
  }, [codeSamples, selectedLangs]);
  const isJa = lang === "ja";
  const l = pageContent.copy[lang];
  const reduceMotion = useReduceMotion();
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const fontBody = isJa ? JA_SANS : SANS;
  const availableComparisonLangs: LangId[] = SELECTOR_LANGS.filter((lid) =>
    codeSamples.some((sample) => Boolean(sample.snippets[lid])),
  );

  const toggleComparisonLang = (lid: LangId) => {
    setSelectedLangs((prev) =>
      prev.includes(lid)
        ? prev.filter((current) => current !== lid)
        : [...prev, lid],
    );
  };

  const handleSectionLangChange = (sectionIndex: number, lid: LangId) => {
    setSectionLangs((prev) =>
      prev.map((current, idx) => (idx === sectionIndex ? lid : current)),
    );
  };

  const resetComparisonLangs = () => {
    const defaults = DEFAULT_COMPARISON_LANGS.filter((lid) =>
      availableComparisonLangs.includes(lid),
    );
    setSelectedLangs(defaults.length > 0 ? defaults : availableComparisonLangs.slice(0, 4));
  };

  const clearComparisonLangs = () => {
    setSelectedLangs([]);
  };

  return (
    <div className={`max-w-[1320px] mx-auto relative isolate px-4 sm:px-6 pb-16${!reduceMotion ? " hdr-active" : ""}`}>
      {/* ── Gradient background ── */}
      <div
        className="absolute inset-x-0 -top-8 h-[620px] -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 72% 52% at 28% 14%, rgba(155,89,182,0.13) 0%, transparent 70%), radial-gradient(ellipse 54% 42% at 74% 8%, rgba(16,185,129,0.10) 0%, transparent 60%), radial-gradient(ellipse 46% 38% at 58% 28%, rgba(51,112,254,0.09) 0%, transparent 62%)",
          maskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 90%)",
        }}
      />

      {/* ── Nav bar ── */}
      <div className="flex items-center justify-between mb-10 gap-4 pt-2">
        <a
          href={base}
          className="flex items-center gap-3 no-underline group"
          style={{ color: "#5C8DFE" }}
        >
          <AidLogo className="h-7 w-auto opacity-70 group-hover:opacity-100 transition-opacity" />
          <span
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ fontFamily: isJa ? JA_SANS : MONO, letterSpacing: isJa ? 0.5 : 1 }}
          >
            <ArrowLeft className="w-3 h-3" />
            {l.back}
          </span>
        </a>

        <div
          className="flex items-center gap-0.5 rounded-lg p-[3px] border"
          style={{
            background: "rgba(51,112,254,0.06)",
            borderColor: "rgba(51,112,254,0.12)",
          }}
        >
          {([
            { code: "en" as Lang, label: "EN" },
            { code: "ja" as Lang, label: "日本語" },
          ]).map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLang(opt.code)}
              className="px-3.5 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
              style={{
                fontFamily: opt.code === "ja" ? JA_SANS : SANS,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: opt.code === "ja" ? 0 : 1,
                background:
                  lang === opt.code
                    ? "linear-gradient(135deg, rgba(155,89,182,0.25), rgba(16,185,129,0.2))"
                    : "transparent",
                color: lang === opt.code ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
         ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-[28px] p-6 sm:p-10 border relative overflow-hidden mb-20"
        style={{
          background:
            "linear-gradient(135deg, rgba(155,89,182,0.10) 0%, rgba(16,185,129,0.08) 52%, rgba(51,112,254,0.08) 100%)",
          borderColor: "rgba(155,89,182,0.20)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Beaker className="w-4 h-4" style={{ color: "#9B59B6" }} />
          <span
            className="text-[11px] uppercase tracking-[0.28em]"
            style={{ color: "#9B59B6", fontFamily: MONO }}
          >
            {l.badge}
          </span>
        </div>
        <h1
          className="text-[36px] sm:text-[58px] leading-[0.94] font-black m-0 mb-4"
          style={{
            letterSpacing: isJa ? 0 : -1.6,
            fontFamily: isJa ? JA_SANS : SANS,
            background: "linear-gradient(135deg, #9B59B6 0%, #10B981 45%, #3370FE 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {l.title}
        </h1>
        <p
          className="text-base sm:text-lg max-w-[760px] m-0 mb-6 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.72)", fontFamily: fontBody }}
        >
          <Linkify text={l.subtitle} isJa={isJa} />
        </p>

        {/* KPI cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            { label: l.heroStat1Label, value: l.heroStat1Value, color: "#10B981", glow: "rgba(16,185,129,0.08)" },
            { label: l.heroStat2Label, value: l.heroStat2Value, color: "#F59E0B", glow: "rgba(245,158,11,0.08)" },
            { label: l.heroStat3Label, value: l.heroStat3Value, color: "#EF4444", glow: "rgba(239,68,68,0.08)" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl px-4 py-4 border transition-all duration-300 hover:border-[rgba(255,255,255,0.14)]"
              style={{
                background: `linear-gradient(135deg, ${card.glow}, rgba(8,18,26,0.3))`,
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="text-[11px] uppercase tracking-[0.22em] mb-1.5"
                style={{ color: "rgba(255,255,255,0.4)", fontFamily: MONO }}
              >
                {card.label}
              </div>
              <div
                className="font-black text-[32px]"
                style={{ color: card.color, fontFamily: MONO }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA – Paper below
         ═══════════════════════════════════════════════════════════════════ */}
      <a
        href="#paper-section"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("paper-section")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="group flex items-center gap-3 rounded-2xl px-5 py-4 border mb-10 no-underline transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: "linear-gradient(135deg, rgba(51,112,254,0.08), rgba(155,89,182,0.06))",
          borderColor: "rgba(51,112,254,0.18)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(51,112,254,0.12)" }}
        >
          <FileText className="w-5 h-5" style={{ color: "#3370FE" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold" style={{ color: "#fff", fontFamily: fontBody }}>
            {l.readPaperCta}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)", fontFamily: fontBody }}>
            {l.readPaperCtaSub}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all duration-200 rotate-90 shrink-0" style={{ color: "#3370FE" }} />
      </a>

      {/* ═══════════════════════════════════════════════════════════════════
          TL;DR
         ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-[24px] px-6 sm:px-8 py-6 border mb-20"
        style={{
          background: "linear-gradient(135deg, rgba(155,89,182,0.06), rgba(8,18,26,0.28))",
          borderColor: "rgba(155,89,182,0.15)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <Zap className="w-5 h-5" style={{ color: "#F59E0B" }} />
          <h2 className="text-[20px] sm:text-[22px] font-black m-0" style={{ fontFamily: fontBody, color: "#F59E0B" }}>{l.tldr}</h2>
        </div>
        <p
          className="text-[15px] sm:text-base m-0 leading-[1.8]"
          style={{ color: "rgba(255,255,255,0.78)", fontFamily: fontBody }}
        >
          <Linkify text={l.tldrText} isJa={isJa} />
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          WHY IT MATTERS
         ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="rounded-[24px] px-6 sm:px-8 py-6 border mb-20"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(8,18,26,0.26))",
          borderColor: "rgba(16,185,129,0.12)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-5">
          <Beaker className="w-5 h-5" style={{ color: "#10B981" }} />
          <h2 className="text-[20px] sm:text-[24px] font-bold m-0" style={{ fontFamily: fontBody, color: "#10B981" }}>
            {l.whyTitle}
          </h2>
        </div>
        <div className="space-y-4">
          {l.whyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-2 h-2 rounded-full mt-2 shrink-0"
                style={{ background: i === 0 ? "#10B981" : i === 1 ? "#3B82F6" : i === 2 ? "#9B59B6" : "#F59E0B" }}
              />
              <span
                className="text-sm sm:text-[15px] leading-[1.75]"
                style={{ color: "rgba(255,255,255,0.72)", fontFamily: fontBody }}
              >
                <Linkify text={point} isJa={isJa} />
              </span>
            </div>
          ))}
        </div>
        <WhyItMattersDiagram isJa={isJa} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          THE EXPLICITNESS HYPOTHESIS
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="mb-24">
        <h2
          className="text-[28px] sm:text-[36px] font-black mb-3"
          style={{
            fontFamily: isJa ? JA_SANS : SANS,
            letterSpacing: isJa ? 0 : -0.8,
            background: "linear-gradient(135deg, #9B59B6, #10B981)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {l.hypothesisTitle}
        </h2>
        <p
          className="text-[15px] sm:text-base mb-8 max-w-[760px] leading-[1.7]"
          style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}
        >
          <Linkify text={l.hypothesisSub} isJa={isJa} />
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          {l.principles.map((p, i) => {
            const colors = ["#10B981", "#3B82F6", "#9B59B6", "#F59E0B", "#06B6D4", "#E0247A"];
            const c = colors[i % colors.length];
            return (
              <div
                key={i}
                className="rounded-2xl px-5 py-5 border transition-all duration-300 hover:border-[rgba(255,255,255,0.14)]"
                style={{
                  background: `linear-gradient(135deg, ${c}08, rgba(8,18,26,0.2))`,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: `${c}18` }}>
                    <PrincipleIcon id={p.icon} color={c} />
                  </div>
                  <div className="text-[16px] font-bold" style={{ color: c, fontFamily: fontBody }}>
                    {p.title}
                  </div>
                </div>
                <div className="text-[13px] sm:text-sm leading-[1.75]" style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}>
                  <Linkify text={p.desc} isJa={isJa} />
                </div>
                {PRINCIPLE_DEMOS[p.icon] && (
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: `${c}20` }}>
                    {PRINCIPLE_DEMOS[p.icon]({ isJa })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <ExplicitnessRadar isJa={isJa} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DIFFICULTY RESILIENCE
         ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="rounded-[24px] px-6 sm:px-8 py-6 border mb-24"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(8,18,26,0.26))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Terminal className="w-5 h-5" style={{ color: "#EF4444" }} />
          <h2 className="text-[24px] sm:text-[30px] font-black m-0" style={{ fontFamily: fontBody, color: "#EF4444" }}>
            {l.difficultyTitle}
          </h2>
        </div>
        <p className="text-[15px] sm:text-base mt-0 mb-5 max-w-[760px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.48)", fontFamily: fontBody }}>
          <Linkify text={l.difficultySub} isJa={isJa} />
        </p>

        <DegradationCurve isJa={isJa} />

        <DifficultyBars data={pageContent.difficultyData} isJa={isJa} />

        <p className="text-[12px] mt-5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: fontBody }}>
          <Linkify text={l.difficultyNote} isJa={isJa} />
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CODE COMPARISONS
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-2">
          <Code2 className="w-6 h-6" style={{ color: "#3B82F6" }} />
          <h2
            className="text-[28px] sm:text-[36px] font-black m-0"
            style={{
              fontFamily: isJa ? JA_SANS : SANS,
              letterSpacing: isJa ? 0 : -0.8,
              color: "#3B82F6",
            }}
          >
            {l.codeTitle}
          </h2>
        </div>
        <p className="text-[15px] sm:text-base mt-1 mb-6 max-w-[760px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}>
          <Linkify text={l.codeSub} isJa={isJa} />
        </p>
        <div
          className="mb-5 rounded-xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.52)",
            fontFamily: fontBody,
          }}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] mr-2" style={{ color: "#7DD3FC", fontFamily: MONO }}>
            {isJa ? "注記" : "Note"}
          </span>
          <span className="text-[13px] sm:text-[14px] leading-[1.75]">
            <Linkify text={l.codeNote} isJa={isJa} />
          </span>
        </div>

        <CodeSectionDiagram isJa={isJa} />

        <ComparisonLanguageBar
          lang={lang}
          availableLangs={availableComparisonLangs}
          selectedLangs={selectedLangs}
          onToggle={toggleComparisonLang}
          onReset={resetComparisonLangs}
          onClear={clearComparisonLangs}
        />

        {codeSamples.map((sample, idx) => (
          <CodeComparison
            key={sample.id}
            sample={sample}
            lang={lang}
            comparisonLangs={selectedLangs}
            activeLang={sectionLangs[idx] ?? selectedLangs[0] ?? DEFAULT_COMPARISON_LANGS[0] ?? "python"}
            onActiveLangChange={(lid) => handleSectionLangChange(idx, lid)}
            accentColor={["#10B981", "#3B82F6", "#9B59B6", "#F59E0B", "#06B6D4", "#E0247A", "#8B5CF6"][idx % 7]}
            highlights={resolvedHighlights}
          />
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          EMBEDDED PAPER
         ═══════════════════════════════════════════════════════════════════ */}
      <div id="paper-section">
        <PaperEmbed lang={lang} />
      </div>

      {/* ── Footer ── */}
      <div
        className="text-center text-xs mt-10"
        style={{ color: "rgba(255,255,255,0.35)", fontFamily: isJa ? JA_SANS : MONO }}
      >
        {l.methodology}
      </div>
    </div>
  );
}
