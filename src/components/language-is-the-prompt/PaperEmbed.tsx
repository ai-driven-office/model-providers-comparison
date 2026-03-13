import { Expand, ExternalLink, FileText, Minimize } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Lang } from "../../data/i18n";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";
const JA_SANS = "'Zen Kaku Gothic New', sans-serif";

const PAPER_SOURCES = {
  en: {
    pdfPath: "language-is-the-prompt.pdf",
    sourceHref: "https://github.com/ai-driven-office/language-is-the-prompt/blob/main/paper/main.pdf",
  },
  ja: {
    pdfPath: "language-is-the-prompt-ja.pdf",
    sourceHref: "https://github.com/ai-driven-office/language-is-the-prompt/blob/main/paper/main_ja.pdf",
  },
} as const;

const viewerText = {
  en: {
    title: "Read the paper",
    subtitle: "Switch between the English and Japanese PDFs, open the source, or expand the viewer fullscreen.",
    pdfEnglish: "English PDF",
    pdfJapanese: "Japanese PDF",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    source: "Open source PDF",
    fallback: "If the embedded PDF does not load in this browser, open the original source in a new tab.",
  },
  ja: {
    title: "論文を読む",
    subtitle: "英語版と日本語版を切り替えたり、元ソースを開いたり、全画面表示にできます。",
    pdfEnglish: "英語版 PDF",
    pdfJapanese: "日本語版 PDF",
    fullscreen: "全画面",
    exitFullscreen: "全画面を終了",
    source: "元PDFを開く",
    fallback: "ブラウザで埋め込みPDFが表示されない場合は、元ソースを新しいタブで開いてください。",
  },
} as const;

function ToolbarButton({
  children,
  onClick,
  active = false,
  fontFamily,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  fontFamily: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition-colors cursor-pointer"
      style={{
        borderColor: active ? "rgba(6,182,212,0.28)" : "rgba(255,255,255,0.12)",
        background: active ? "rgba(6,182,212,0.10)" : "rgba(255,255,255,0.05)",
        color: active ? "#7DD3FC" : "rgba(255,255,255,0.82)",
        fontFamily,
        fontSize: 11,
        letterSpacing: 0.4,
      }}
    >
      {children}
    </button>
  );
}

export default function PaperEmbed({
  lang,
}: {
  lang: Lang;
}) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const text = viewerText[lang];
  const fontBody = lang === "ja" ? JA_SANS : SANS;
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const [pdfLang, setPdfLang] = useState<Lang>(lang);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setPdfLang(lang);
  }, [lang]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const selectedPdf = PAPER_SOURCES[pdfLang];
  const pdfUrl = `${base}${selectedPdf.pdfPath}`;

  useEffect(() => {
    setShowFallback(false);

    if (typeof navigator !== "undefined" && "pdfViewerEnabled" in navigator) {
      const canRenderPdf = (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled;
      if (canRenderPdf === false) {
        setShowFallback(true);
        return;
      }
    }

    fallbackTimeoutRef.current = window.setTimeout(() => {
      setShowFallback(true);
    }, 4000);

    return () => {
      if (fallbackTimeoutRef.current != null) {
        window.clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
    };
  }, [pdfUrl]);

  const toggleFullscreen = async () => {
    const el = viewerRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void }) | null;
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void };
    if (!el) return;

    if (document.fullscreenElement === el) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        await doc.webkitExitFullscreen?.();
      }
      return;
    }

    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else {
      await el.webkitRequestFullscreen?.();
    }
  };

  return (
    <section
      ref={viewerRef}
      className="rounded-[24px] overflow-hidden border mb-8"
      style={{
        background: "linear-gradient(135deg, rgba(155,89,182,0.08), rgba(16,185,129,0.06))",
        borderColor: "rgba(155,89,182,0.18)",
      }}
    >
      <div
        className="flex flex-col gap-3 px-4 py-3 border-b md:flex-row md:items-center md:justify-between"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        }}
      >
        <div className="min-w-0">
          <h3 className="m-0 text-[20px] font-bold" style={{ color: "#06B6D4", fontFamily: fontBody }}>
            {text.title}
          </h3>
          <p className="m-0 mt-1 text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.52)", fontFamily: fontBody }}>
            {text.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton
            onClick={() => setPdfLang("en")}
            active={pdfLang === "en"}
            fontFamily={fontBody}
          >
            <FileText className="w-3.5 h-3.5" />
            {text.pdfEnglish}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setPdfLang("ja")}
            active={pdfLang === "ja"}
            fontFamily={fontBody}
          >
            <FileText className="w-3.5 h-3.5" />
            {text.pdfJapanese}
          </ToolbarButton>
          <ToolbarButton onClick={toggleFullscreen} fontFamily={fontBody}>
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" />
            ) : (
              <Expand className="w-3.5 h-3.5" />
            )}
            {isFullscreen ? text.exitFullscreen : text.fullscreen}
          </ToolbarButton>
          <a
            href={selectedPdf.sourceHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border no-underline transition-colors"
            style={{
              borderColor: "rgba(6,182,212,0.28)",
              background: "rgba(6,182,212,0.08)",
              color: "#7DD3FC",
              fontFamily: fontBody,
              fontSize: 11,
              letterSpacing: 0.4,
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {text.source}
          </a>
        </div>
      </div>

      <div
        style={{
          height: isFullscreen ? "calc(100vh - 96px)" : "72vh",
          minHeight: isFullscreen ? "calc(100vh - 96px)" : "560px",
          background:
            "radial-gradient(circle at top, rgba(59,130,246,0.10), transparent 36%), linear-gradient(180deg, rgba(6,12,18,0.92), rgba(4,8,14,0.98))",
          padding: 16,
        }}
      >
        <iframe
          key={pdfUrl}
          src={`${pdfUrl}#view=FitH`}
          title={text.title}
          className="w-full h-full rounded-[18px] border-0"
          onLoad={() => {
            if (fallbackTimeoutRef.current != null) {
              window.clearTimeout(fallbackTimeoutRef.current);
              fallbackTimeoutRef.current = null;
            }
            setShowFallback(false);
          }}
          onError={() => setShowFallback(true)}
          style={{
            background: "#fff",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(15,23,42,0.12)",
          }}
        />
      </div>

      {showFallback && (
        <p
          className="m-0 px-4 py-3 text-[12px] leading-relaxed border-t"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.52)",
            fontFamily: fontBody,
          }}
        >
          {text.fallback}
        </p>
      )}
    </section>
  );
}
