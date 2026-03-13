import { Link2, Share2, Trophy, Zap } from "lucide-react";
import type { Lang } from "../../data/i18n";
import type { Model, NewsPost, Provider } from "../../data/types";
import { buildColorMap } from "../../data/colors";
import { ProviderIcon } from "../ui/ProviderIcon";
import DataTable from "../ui/DataTable";
import AbilityTable from "../ui/AbilityTable";
import NewsTimeline from "../ui/NewsTimeline";

interface Props {
  models: Model[];
  providers: Provider[];
  news: NewsPost[];
  lang: Lang;
  copy: Record<string, string>;
  buildDate: string;
}

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

export default function DashboardStaticSections({
  models,
  providers,
  news,
  lang,
  copy,
  buildDate,
}: Props) {
  const colorMap = buildColorMap(providers);
  const isJa = lang === "ja";
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");

  return (
    <>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-8 justify-center hdr-vivid">
        {providers.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <ProviderIcon providerId={p.id} size={14} className="opacity-60" />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: p.color,
                boxShadow: `0 0 6px ${p.color}44`,
              }}
            />
            <span
              className="text-xs sm:text-[11px]"
              style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
            >
              {p.name}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(255,170,50,0.27)]" />
          <span
            className="text-xs sm:text-[11px]"
            style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
          >
            Fast Mode
          </span>
        </div>
      </div>

      <a
        href={`${base}glm-cerebras`}
        className="flex items-center justify-between rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 mt-6 sm:mt-8 mb-3 no-underline relative overflow-hidden gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(51,112,254,0.04) 0%, rgba(255,4,19,0.02) 100%)",
          border: "1px solid rgba(51,112,254,0.1)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #3370FE, #5C8DFE)" }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div
              className="text-[13px] sm:text-[13px] font-bold"
              style={{ color: "rgba(255,255,255,0.6)", mixBlendMode: "plus-lighter" }}
            >
              {isJa ? "GLM 4.7 × Cerebras ガイド" : "GLM 4.7 × Cerebras Guide"}
            </div>
            <div
              className="text-[11px] sm:text-[11px] truncate"
              style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
            >
              {isJa
                ? "1,000 tps でAIコーディング — OpenCodeセットアップガイド"
                : "AI coding at 1,000 tps — OpenCode setup & recommended workflow"}
            </div>
          </div>
        </div>
        <span
          className="text-sm shrink-0"
          style={{ color: "rgba(255,255,255,0.25)", mixBlendMode: "plus-lighter" }}
        >
          →
        </span>
      </a>

      <a
        href="https://taalas.com/the-path-to-ubiquitous-ai/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-xl px-4 sm:px-5 py-3 sm:py-3.5 mt-3 mb-3 no-underline relative overflow-hidden gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(255,106,0,0.04) 0%, rgba(255,4,19,0.02) 100%)",
          border: "1px solid rgba(255,106,0,0.1)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #FF6A00, #FF8C33)" }}
          >
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div
              className="text-[13px] sm:text-[13px] font-bold"
              style={{ color: "rgba(255,255,255,0.6)", mixBlendMode: "plus-lighter" }}
            >
              {isJa ? "Taalas HC1 — 速度新記録" : "Taalas HC1 — New Speed Record"}
            </div>
            <div
              className="text-[11px] sm:text-[11px] truncate"
              style={{ color: "rgba(255,255,255,0.35)", mixBlendMode: "plus-lighter" }}
            >
              {isJa
                ? "17,000 tps — 量子化込みでも際立って速いカスタムシリコン"
                : "17,000 tps — custom silicon with extreme throughput even after heavy quantization"}
            </div>
          </div>
        </div>
        <span
          className="text-sm shrink-0"
          style={{ color: "rgba(255,255,255,0.25)", mixBlendMode: "plus-lighter" }}
        >
          →
        </span>
      </a>

      <div id="dashboard-data-table">
        <DataTable
          data={models}
          lang={lang}
          colorMap={colorMap}
          labels={{
            colModel: copy.colModel,
            colProvider: copy.colProvider,
            colTPS: copy.colTPS,
            colInput: copy.colInput,
            colOutput: copy.colOutput,
            colInputLong: copy.colInputLong,
            colOutputLong: copy.colOutputLong,
          }}
        />
      </div>

      <div id="dashboard-ability-table" hidden>
        <AbilityTable
          data={models}
          lang={lang}
          colorMap={colorMap}
          labels={{
            colModel: copy.colModel,
            colProvider: copy.colProvider,
            colAverage: copy.colAverage,
          }}
        />
      </div>

      <div className="mt-14 sm:mt-20 mb-10 sm:mb-14 flex items-center gap-4 sm:gap-6 hdr-vivid">
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(51,112,254,0.15), rgba(138,60,184,0.1))" }}
        />
        <div
          className="text-[11px] sm:text-[10px] tracking-widest shrink-0"
          style={{
            fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: 3,
            color: "rgba(255,255,255,0.25)",
            mixBlendMode: "plus-lighter",
          }}
        >
          {isJa ? "ニュース & コミュニティ" : "News & Community"}
        </div>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, rgba(138,60,184,0.1), rgba(255,4,19,0.12), transparent)" }}
        />
      </div>

      {news.length > 0 && (
        <NewsTimeline
          posts={news}
          providers={providers}
          lang={lang}
          labels={{
            newsTitle: copy.newsTitle ?? "News & Updates",
            newsSub:
              copy.newsSub ??
              "Latest developments in AI model performance and infrastructure",
            fasterThan: copy.fasterThan ?? "faster than",
            tryFree: copy.tryFree ?? "Try it free",
            useCases: copy.useCases ?? "Use cases",
            speedComparisons: copy.speedComparisons ?? "Speed Comparisons",
          }}
        />
      )}

      <div
        id="dashboard-share-cta"
        className="mt-10 rounded-xl border relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(29,155,240,0.04) 0%, rgba(51,112,254,0.06) 50%, rgba(138,60,184,0.04) 100%)",
          borderColor: "rgba(51,112,254,0.12)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(29,155,240,0.4), rgba(51,112,254,0.3), transparent)",
          }}
        />
        <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(51,112,254,0.15), rgba(138,60,184,0.1))",
              border: "1px solid rgba(51,112,254,0.2)",
            }}
          >
            <Share2
              className="w-5 h-5"
              style={{ color: "rgba(255,255,255,0.45)", mixBlendMode: "plus-lighter" }}
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3
              className="text-sm font-bold text-white m-0 mb-1"
              style={{
                fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
              }}
            >
              {copy.shareCtaTitle ?? "Spread the word"}
            </h3>
            <p
              className="text-xs m-0 leading-relaxed max-w-lg"
              style={{
                fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
                color: "rgba(255,255,255,0.4)",
                mixBlendMode: "plus-lighter",
              }}
            >
              {copy.shareCtaBody ?? "Share this comparison with others."}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              data-share-native
              hidden
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-all duration-200"
              style={{
                fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
                fontSize: 12,
                background: "rgba(51,112,254,0.1)",
                borderColor: "rgba(51,112,254,0.25)",
                color: "#7BAAFF",
              }}
            >
              <Share2 className="w-3 h-3" />
              {isJa ? "共有" : "Share"}
            </button>

            <button
              type="button"
              data-share-x
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-all duration-200"
              style={{
                fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
                fontSize: 12,
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.12)",
                color: "#ccc",
              }}
            >
              X
            </button>

            <button
              type="button"
              data-share-copy
              data-label-default={copy.shareCopy ?? "Copy link"}
              data-label-copied={copy.shareCopied ?? "Copied!"}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-all duration-200"
              style={{
                fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
                fontSize: 12,
                background: "rgba(51,112,254,0.1)",
                borderColor: "rgba(51,112,254,0.25)",
                color: "#7BAAFF",
              }}
            >
              <Link2 className="w-3 h-3" />
              <span>{copy.shareCopy ?? "Copy link"}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className="mt-6 rounded-xl border relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(51,112,254,0.06) 0%, rgba(138,60,184,0.04) 50%, rgba(255,4,19,0.05) 100%)",
          borderColor: "rgba(51,112,254,0.12)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(51,112,254,0.4), rgba(138,60,184,0.3), rgba(255,4,19,0.4), transparent)",
          }}
        />
        <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(51,112,254,0.15), rgba(138,60,184,0.1))",
              border: "1px solid rgba(51,112,254,0.2)",
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-5 h-5"
              style={{ color: "rgba(255,255,255,0.45)", mixBlendMode: "plus-lighter" }}
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3
              className="text-sm font-bold text-white m-0 mb-1"
              style={{
                fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
              }}
            >
              {copy.ctaTitle}
            </h3>
            <p
              className="text-xs m-0 leading-relaxed max-w-lg"
              style={{
                fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
                color: "rgba(255,255,255,0.4)",
                mixBlendMode: "plus-lighter",
              }}
            >
              {copy.ctaBody}
            </p>
          </div>
          <a
            href="https://github.com/ai-driven-office/model-providers-comparison/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold no-underline transition-all duration-200"
            style={{
              fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
              fontSize: 12,
              background: "rgba(51,112,254,0.1)",
              borderColor: "rgba(51,112,254,0.25)",
              color: "#7BAAFF",
            }}
          >
            {copy.ctaButton}
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-3 h-3"
            >
              <path d="M2.5 6h7M6.5 3l3 3-3 3" />
            </svg>
          </a>
        </div>
      </div>

      <footer
        className="mt-12 pt-8 relative isolate"
        style={{ borderTop: "1px solid rgba(51,112,254,0.08)" }}
      >
        <div
          className="absolute inset-0 -z-10 pointer-events-none hdr-ambient"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(255,4,19,0.07) 0%, rgba(138,60,184,0.04) 35%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-48 hdr-vivid hdr-pulse"
          style={{
            background:
              "linear-gradient(90deg, transparent, #3370FE, #8A3CB8, #E0247A, #FF0413, transparent)",
          }}
        />

        <div className="flex flex-col items-center gap-4">
          <AidLogo className="h-6 w-auto opacity-40" />

          <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-[10px]"
            style={{ color: "rgba(255,255,255,0.45)", mixBlendMode: "plus-lighter" }}
          >
            <span
              style={{
                fontFamily: isJa
                  ? "'Zen Kaku Gothic New', sans-serif"
                  : "'Space Mono', monospace",
              }}
            >
              {copy.lastUpdated}: {buildDate}
            </span>
            <span className="hidden sm:inline" style={{ color: "rgba(51,112,254,0.2)" }}>
              |
            </span>
            <a
              href={`${base}data.md`}
              className="no-underline transition-colors duration-200"
              style={{ color: "#5C8DFE" }}
              title={copy.downloadMd}
            >
              {copy.downloadMd}
            </a>
            <span className="hidden sm:inline" style={{ color: "rgba(51,112,254,0.2)" }}>
              |
            </span>
            <a
              href={`${base}why`}
              className="no-underline transition-colors duration-200"
              style={{ color: "#5C8DFE" }}
            >
              {isJa ? "なぜ作ったのか" : "Why this site?"}
            </a>
          </div>

          <div
            className="text-center text-[11px] sm:text-[10px]"
            style={{
              fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Space Mono', monospace",
              color: "rgba(255,255,255,0.4)",
              mixBlendMode: "plus-lighter" as const,
            }}
          >
            {copy.footer}
          </div>

          <div
            className="text-center text-[11px] sm:text-[10px]"
            style={{
              fontFamily: isJa ? "'Zen Kaku Gothic New', sans-serif" : "'Inter', sans-serif",
              letterSpacing: 0.5,
              color: "rgba(255,255,255,0.35)",
              mixBlendMode: "plus-lighter" as const,
            }}
          >
            ©
            <a
              href="https://www.cyberagent.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="no-underline hover:underline"
              style={{ color: "inherit" }}
            >
              CyberAgent, Inc.
            </a>
            {isJa
              ? " · AIドリブン推進室（AI Driven Office）"
              : " · AI Driven Office (AIドリブン推進室)"}
          </div>
        </div>
      </footer>
    </>
  );
}
