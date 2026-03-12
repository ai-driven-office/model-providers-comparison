import { useEffect, useMemo, useRef, useState } from "react";
import { createPluginRegistration } from "@embedpdf/core";
import { EmbedPDF } from "@embedpdf/core/react";
import { usePdfiumEngine } from "@embedpdf/engines/react";
import {
  DocumentContent,
  DocumentManagerPluginPackage,
} from "@embedpdf/plugin-document-manager/react";
import {
  I18nPluginPackage,
  type Locale,
  useI18nCapability,
  useTranslations,
} from "@embedpdf/plugin-i18n/react";
import { RenderPluginPackage } from "@embedpdf/plugin-render/react";
import { Scroller, useScroll, ScrollPluginPackage } from "@embedpdf/plugin-scroll/react";
import { TilingLayer, TilingPluginPackage } from "@embedpdf/plugin-tiling/react";
import { Viewport, ViewportPluginPackage } from "@embedpdf/plugin-viewport/react";
import { ZoomMode, ZoomPluginPackage, useZoom } from "@embedpdf/plugin-zoom/react";
import type { Lang } from "../data/i18n";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";
const JA_SANS = "'Zen Kaku Gothic New', sans-serif";

const PAPER_SOURCES = {
  en: {
    pdfUrl: "https://raw.githubusercontent.com/ai-driven-office/language-is-the-prompt/main/paper/main.pdf",
    sourceHref: "https://github.com/ai-driven-office/language-is-the-prompt/blob/main/paper/main.pdf",
  },
  ja: {
    pdfUrl: "https://raw.githubusercontent.com/ai-driven-office/language-is-the-prompt/main/paper/main_ja.pdf",
    sourceHref: "https://github.com/ai-driven-office/language-is-the-prompt/blob/main/paper/main_ja.pdf",
  },
} as const;

const viewerLocales: Locale[] = [
  {
    code: "en",
    name: "English",
    translations: {
      viewer: {
        title: "Read the paper",
        subtitle: "Switch between the English and Japanese PDFs, or open the paper fullscreen.",
        loadingTitle: "Loading PDF engine...",
        loadingBody: "Preparing the paper viewer and opening the selected PDF version.",
        errorTitle: "Viewer unavailable",
        errorBody: "The PDF engine could not be initialized in this browser session.",
        documentLoading: "Opening paper...",
        documentError: "The paper could not be opened.",
        previousPage: "Previous",
        nextPage: "Next",
        page: "Page",
        of: "of",
        zoomOut: "Zoom out",
        zoomIn: "Zoom in",
        fitWidth: "Fit width",
        fitPage: "Fit page",
        fullscreen: "Fullscreen",
        exitFullscreen: "Exit fullscreen",
        pdfVersion: "PDF",
        pdfEnglish: "EN",
        pdfJapanese: "JP",
        source: "Original source",
      },
    },
  },
  {
    code: "ja",
    name: "日本語",
    translations: {
      viewer: {
        title: "論文を読む",
        subtitle: "英語版と日本語版を切り替えたり、全画面で読むことができます。",
        loadingTitle: "PDFエンジンを読み込み中...",
        loadingBody: "ビューアを準備して、選択されたPDFを開いています。",
        errorTitle: "ビューアを開けません",
        errorBody: "このブラウザセッションではPDFエンジンを初期化できませんでした。",
        documentLoading: "論文を開いています...",
        documentError: "論文を開けませんでした。",
        previousPage: "前へ",
        nextPage: "次へ",
        page: "ページ",
        of: "/",
        zoomOut: "縮小",
        zoomIn: "拡大",
        fitWidth: "幅に合わせる",
        fitPage: "ページ全体",
        fullscreen: "全画面",
        exitFullscreen: "全画面を終了",
        pdfVersion: "PDF",
        pdfEnglish: "英語版",
        pdfJapanese: "日本語版",
        source: "元のソース",
      },
    },
  },
];

function ToolbarButton({
  children,
  onClick,
  disabled = false,
  active = false,
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full px-3 py-1.5 border transition-colors cursor-pointer disabled:cursor-not-allowed"
      style={{
        borderColor: disabled
          ? "rgba(255,255,255,0.06)"
          : active
            ? "rgba(6,182,212,0.28)"
            : "rgba(255,255,255,0.12)",
        background: disabled
          ? "rgba(255,255,255,0.03)"
          : active
            ? "rgba(6,182,212,0.10)"
            : "rgba(255,255,255,0.05)",
        color: disabled
          ? "rgba(255,255,255,0.28)"
          : active
            ? "#7DD3FC"
            : "rgba(255,255,255,0.82)",
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: 0.4,
      }}
    >
      {children}
    </button>
  );
}

function PaperToolbar({
  documentId,
  lang,
  pdfLang,
  onSelectPdfLang,
  onToggleFullscreen,
  isFullscreen,
}: {
  documentId: string;
  lang: Lang;
  pdfLang: Lang;
  onSelectPdfLang: (next: Lang) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}) {
  const { translate } = useTranslations(documentId);
  const { provides: i18n } = useI18nCapability();
  const { state: zoomState, provides: zoom } = useZoom(documentId);
  const { state: scrollState, provides: scroll } = useScroll(documentId);
  const fontBody = lang === "ja" ? JA_SANS : SANS;

  useEffect(() => {
    i18n?.setLocale(lang);
  }, [i18n, lang]);

  const zoomLabel = `${Math.round(zoomState.currentZoomLevel * 100)}%`;
  const pageLabel = `${scrollState.currentPage} ${translate("viewer.of")} ${scrollState.totalPages}`;

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3 border-b md:flex-row md:items-center md:justify-between"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      }}
    >
      <div className="min-w-0">
        <h3
          className="m-0 text-[20px] font-bold"
          style={{ color: "#06B6D4", fontFamily: fontBody }}
        >
          {translate("viewer.title")}
        </h3>
        <p
          className="m-0 mt-1 text-[12px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.52)", fontFamily: fontBody }}
        >
          {translate("viewer.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton
          onClick={() =>
            scroll?.scrollToPreviousPage(scrollState.currentPage > 1 ? "smooth" : "instant")
          }
          disabled={!scroll || scrollState.currentPage <= 1}
        >
          {translate("viewer.previousPage")}
        </ToolbarButton>
        <div
          className="rounded-full px-3 py-1.5 border"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.74)",
            fontFamily: MONO,
            fontSize: 11,
          }}
        >
          {translate("viewer.page")} {pageLabel}
        </div>
        <ToolbarButton
          onClick={() =>
            scroll?.scrollToNextPage(
              scrollState.currentPage < scrollState.totalPages ? "smooth" : "instant",
            )
          }
          disabled={!scroll || scrollState.currentPage >= scrollState.totalPages}
        >
          {translate("viewer.nextPage")}
        </ToolbarButton>
        <ToolbarButton onClick={() => zoom?.zoomOut()} disabled={!zoom}>
          {translate("viewer.zoomOut")}
        </ToolbarButton>
        <div
          className="rounded-full px-3 py-1.5 border"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.74)",
            fontFamily: MONO,
            fontSize: 11,
          }}
        >
          {zoomLabel}
        </div>
        <ToolbarButton onClick={() => zoom?.zoomIn()} disabled={!zoom}>
          {translate("viewer.zoomIn")}
        </ToolbarButton>
        <ToolbarButton onClick={() => zoom?.requestZoom(ZoomMode.FitWidth)} disabled={!zoom}>
          {translate("viewer.fitWidth")}
        </ToolbarButton>
        <ToolbarButton onClick={() => zoom?.requestZoom(ZoomMode.FitPage)} disabled={!zoom}>
          {translate("viewer.fitPage")}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => onSelectPdfLang("en")}
          active={pdfLang === "en"}
        >
          {translate("viewer.pdfVersion")} {translate("viewer.pdfEnglish")}
        </ToolbarButton>
        <ToolbarButton
          onClick={() => onSelectPdfLang("ja")}
          active={pdfLang === "ja"}
        >
          {translate("viewer.pdfVersion")} {translate("viewer.pdfJapanese")}
        </ToolbarButton>
        <ToolbarButton onClick={onToggleFullscreen}>
          {isFullscreen ? translate("viewer.exitFullscreen") : translate("viewer.fullscreen")}
        </ToolbarButton>
        <a
          href={PAPER_SOURCES[pdfLang].sourceHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-3 py-1.5 border no-underline transition-colors"
          style={{
            borderColor: "rgba(6,182,212,0.28)",
            background: "rgba(6,182,212,0.08)",
            color: "#7DD3FC",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 0.4,
          }}
        >
          {translate("viewer.source")}
        </a>
      </div>
    </div>
  );
}

function PaperSurface({ documentId, isFullscreen }: { documentId: string; isFullscreen: boolean }) {
  return (
    <Viewport
      documentId={documentId}
      className="w-full overflow-hidden"
      style={{
        height: isFullscreen ? "calc(100vh - 96px)" : "72vh",
        minHeight: isFullscreen ? "calc(100vh - 96px)" : "560px",
        background:
          "radial-gradient(circle at top, rgba(59,130,246,0.10), transparent 36%), linear-gradient(180deg, rgba(6,12,18,0.92), rgba(4,8,14,0.98))",
      }}
    >
      <Scroller
        documentId={documentId}
        className="px-4 py-6 sm:px-6"
        renderPage={({ pageIndex, rotatedWidth, rotatedHeight }) => (
          <div
            style={{
              width: `${rotatedWidth}px`,
              height: `${rotatedHeight}px`,
              position: "relative",
              background: "#fff",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(15,23,42,0.12)",
            }}
          >
            <TilingLayer
              documentId={documentId}
              pageIndex={pageIndex}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
        )}
      />
    </Viewport>
  );
}

export default function PaperEmbed({
  lang,
}: {
  lang: Lang;
}) {
  const { engine, isLoading, error } = usePdfiumEngine();
  const fontBody = lang === "ja" ? JA_SANS : SANS;
  const viewerRef = useRef<HTMLElement | null>(null);
  const [pdfLang, setPdfLang] = useState<Lang>(lang);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = async () => {
    const el = viewerRef.current as (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }) | null;
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
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        await doc.webkitExitFullscreen?.();
      }
    }
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return;
    }
    await el.webkitRequestFullscreen?.();
    if (!document.fullscreenElement) {
      setIsFullscreen(true);
    }
    void doc;
  };

  const plugins = useMemo(
    () => [
      createPluginRegistration(DocumentManagerPluginPackage, {
        initialDocuments: [{ url: selectedPdf.pdfUrl, autoActivate: true }],
      }),
      createPluginRegistration(ViewportPluginPackage),
      createPluginRegistration(ScrollPluginPackage, { defaultPageGap: 28 }),
      createPluginRegistration(RenderPluginPackage, { defaultImageType: "image/webp" }),
      createPluginRegistration(TilingPluginPackage, {
        tileSize: 512,
        overlapPx: 24,
        extraRings: 1,
      }),
      createPluginRegistration(ZoomPluginPackage, {
        defaultZoomLevel: ZoomMode.FitWidth,
      }),
      createPluginRegistration(I18nPluginPackage, {
        defaultLocale: "en",
        fallbackLocale: "en",
        locales: viewerLocales,
      }),
    ],
    [selectedPdf.pdfUrl],
  );

  const viewerText =
    lang === "ja"
      ? viewerLocales[1].translations.viewer
      : viewerLocales[0].translations.viewer;

  if (error) {
    return (
      <section
        className="rounded-[24px] overflow-hidden border mb-8"
        style={{
          background: "linear-gradient(135deg, rgba(155,89,182,0.08), rgba(16,185,129,0.06))",
          borderColor: "rgba(155,89,182,0.18)",
        }}
      >
        <div className="px-5 sm:px-6 py-5">
          <h3 className="m-0 text-[20px] font-bold" style={{ color: "#EF4444", fontFamily: fontBody }}>
            {viewerText.errorTitle}
          </h3>
          <p
            className="m-0 mt-2 text-[13px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.54)", fontFamily: fontBody }}
          >
            {viewerText.errorBody}
          </p>
        </div>
      </section>
    );
  }

  if (isLoading || !engine) {
    return (
      <section
        className="rounded-[24px] overflow-hidden border mb-8"
        style={{
          background: "linear-gradient(135deg, rgba(155,89,182,0.08), rgba(16,185,129,0.06))",
          borderColor: "rgba(155,89,182,0.18)",
        }}
      >
        <div className="px-5 sm:px-6 py-5">
          <h3 className="m-0 text-[20px] font-bold" style={{ color: "#06B6D4", fontFamily: fontBody }}>
            {viewerText.loadingTitle}
          </h3>
          <p
            className="m-0 mt-2 text-[13px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.54)", fontFamily: fontBody }}
          >
            {viewerText.loadingBody}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={viewerRef}
      className="rounded-[24px] overflow-hidden border mb-8"
      style={{
        background: "linear-gradient(135deg, rgba(155,89,182,0.08), rgba(16,185,129,0.06))",
        borderColor: "rgba(155,89,182,0.18)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
      }}
    >
      <EmbedPDF key={selectedPdf.pdfUrl} engine={engine} plugins={plugins}>
        {({ activeDocumentId }) =>
          activeDocumentId ? (
            <>
              <PaperToolbar
                documentId={activeDocumentId}
                lang={lang}
                pdfLang={pdfLang}
                onSelectPdfLang={setPdfLang}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
              />
              <DocumentContent documentId={activeDocumentId}>
                {({ isLoading: isDocumentLoading, isError, isLoaded }) => {
                  if (isDocumentLoading) {
                    return (
                      <div
                        className="px-5 sm:px-6 py-5"
                        style={{ color: "rgba(255,255,255,0.62)", fontFamily: fontBody }}
                      >
                        {viewerText.documentLoading}
                      </div>
                    );
                  }

                  if (isError) {
                    return (
                      <div
                        className="px-5 sm:px-6 py-5"
                        style={{ color: "rgba(255,255,255,0.62)", fontFamily: fontBody }}
                      >
                        {viewerText.documentError}
                      </div>
                    );
                  }

                  if (!isLoaded) {
                    return null;
                  }

                  return <PaperSurface documentId={activeDocumentId} isFullscreen={isFullscreen} />;
                }}
              </DocumentContent>
            </>
          ) : (
            <div
              className="px-5 sm:px-6 py-5"
              style={{ color: "rgba(255,255,255,0.62)", fontFamily: fontBody }}
            >
              {viewerText.documentLoading}
            </div>
          )
        }
      </EmbedPDF>
    </section>
  );
}
