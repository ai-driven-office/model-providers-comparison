import { useState, type ReactNode } from "react";
import {
  Zap,
  Brain,
  Code,
  ExternalLink,
  ChevronRight,
  Cpu,
  Layers,
  DollarSign,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useLang, type Lang } from "../data/i18n";
import { sfxLang, sfxSuccess, sfxClick } from "../data/sfx";

/* ─────────────────── i18n content ─────────────────── */
const content = {
  en: {
    badge: "Guide · Feb 2026",
    backLabel: "← Back to Benchmark",
    title: "GLM 4.7 × Cerebras",
    subtitle:
      "Blazing-fast AI coding at 1,000 tokens/sec — for a fraction of the cost",
    introP1:
      "Cerebras serves GLM 4.7 at roughly 1,000 tokens per second — that's 10-25× faster than typical cloud inference. Combined with strong coding benchmarks and a generous free tier, it's the best-kept secret for developers who want instant AI feedback.",
    introP2:
      "This guide walks you through the recommended two-phase workflow: use a frontier planning model for architecture and design, then switch to GLM 4.7 on Cerebras for the actual code generation at lightning speed.",
    statSpeed: "~1,000",
    statSpeedLabel: "tokens/sec",
    statContext: "131K",
    statContextLabel: "context window",
    statInput: "$2.25",
    statInputLabel: "per M input tokens",
    statOutput: "$2.75",
    statOutputLabel: "per M output tokens",
    freeTitle: "Free Tier",
    freeSub: "Get started at zero cost",
    freeItems: [
      "64K context window",
      "10 requests / minute",
      "1M tokens / day",
      "Reasoning, streaming, tool calling",
    ],
    whyTitle: "The Two-Phase Workflow",
    whySub: "Top-tier planning + instant execution — the best of both worlds",
    phase1Title: "Phase 1 — Plan",
    phase1Model: "Gemini 3.1 Pro or Claude Opus 4.7",
    phase1Desc:
      "Use a frontier model for architecture decisions, task decomposition, file planning, and edge-case analysis. These models excel at reasoning through ambiguity and producing structured plans.",
    phase1Points: [
      "Break the feature into concrete subtasks",
      "Decide on file structure and interfaces",
      "Identify edge cases and error handling patterns",
      "Write pseudocode or detailed specs",
    ],
    phase2Title: "Phase 2 — Code",
    phase2Model: "GLM 4.7 on Cerebras",
    phase2Desc:
      "Execute the plan at 1,000 tps. GLM 4.7 scores 80/100 on coding benchmarks — strong enough for implementation when you already have a clear plan. The speed advantage is massive: what takes 30 seconds elsewhere finishes in 2–3 seconds here.",
    phase2Points: [
      "Generate implementation code from the plan",
      "Iterate rapidly — fix, refactor, test",
      "Write unit tests and documentation",
      "Bulk operations: refactor, migrate, convert",
    ],
    setupTitle: "Setup with OpenCode",
    setupSub: "Three steps, two minutes",
    step1Title: "1. Install OpenCode",
    step1Desc: "One-line install — works on macOS, Linux, and WSL:",
    step2Title: "2. Get Your Cerebras API Key",
    step2Desc: "Sign up or log in to get your API key:",
    step2Link: "cloud.cerebras.ai",
    step2After: "Then authenticate OpenCode:",
    step2Instruction:
      'Select "Cerebras" from the provider list and paste your API key.',
    step3Title: "3. Select GLM 4.7",
    step3Desc: "Inside an OpenCode session, switch to the GLM model:",
    step3After:
      "Select zai-glm-4.7 from the model list. You're ready to code at 1,000 tps.",
    modelTitle: "GLM 4.7 — Model Details",
    modelSub: "What you're getting under the hood",
    modelId: "Model ID",
    modelIdVal: "zai-glm-4.7",
    modelFeatures: "Features",
    featuresList: [
      "Reasoning — enabled by default (chain-of-thought)",
      "Streaming — real-time token output",
      "Structured outputs — JSON mode",
      "Tool calling / function calling",
      "Vision — image understanding",
    ],
    modelBenchmarks: "Benchmark Scores (0–100)",
    benchmarkRows: [
      { label: "Planning", score: 76 },
      { label: "Coding", score: 80 },
      { label: "Image Understanding", score: 58 },
      { label: "Research", score: 82 },
      { label: "Creative", score: 74 },
    ],
    tipsTitle: "Pro Tips",
    tips: [
      {
        title: "Plan first, always",
        desc: "Spending 2 minutes on a plan with Opus/Gemini saves 20 minutes of iteration with any model.",
      },
      {
        title: "Reasoning is on by default",
        desc: "GLM 4.7 uses chain-of-thought reasoning automatically. You get better answers without extra prompting.",
      },
      {
        title: "Use structured outputs",
        desc: "For code generation, request JSON-structured responses to get clean, parseable output.",
      },
      {
        title: "Bulk operations shine",
        desc: "At 1,000 tps, tasks like renaming across a codebase or generating test suites become almost instant.",
      },
    ],
    linksTitle: "Resources",
    links: [
      {
        label: "Cerebras GLM 4.7 Docs",
        url: "https://inference-docs.cerebras.ai/models/zai-glm-47",
      },
      {
        label: "OpenCode × Cerebras Integration",
        url: "https://inference-docs.cerebras.ai/integrations/opencode",
      },
      {
        label: "Cerebras Cloud Console",
        url: "https://cloud.cerebras.ai",
      },
      {
        label: "OpenCode — Homepage",
        url: "https://opencode.ai",
      },
    ],
    footer: "©CyberAgent, Inc. · AI Driven Office (AIドリブン推進室)",
    dataNote:
      "Benchmark scores from public benchmarks · Pricing from Cerebras, Feb 2026",
  },

  ja: {
    badge: "ガイド · 2026年2月",
    backLabel: "← ベンチマークに戻る",
    title: "GLM 4.7 × Cerebras",
    subtitle: "1,000トークン/秒の超高速AIコーディング — 低コストで実現",
    introP1:
      "CerebrasはGLM 4.7を約1,000トークン/秒で提供しています。これは一般的なクラウド推論の10〜25倍の速さです。高いコーディングベンチマークと無料枠を組み合わせると、即座にAIフィードバックを得たい開発者にとって最高のツールです。",
    introP2:
      "このガイドでは、推奨される2フェーズワークフローを紹介します。まず設計にはフロンティアプランニングモデルを使い、次に実際のコード生成にはCerebras上のGLM 4.7を使って超高速で実行します。",
    statSpeed: "約1,000",
    statSpeedLabel: "トークン/秒",
    statContext: "131K",
    statContextLabel: "コンテキストウィンドウ",
    statInput: "$2.25",
    statInputLabel: "100万入力トークンあたり",
    statOutput: "$2.75",
    statOutputLabel: "100万出力トークンあたり",
    freeTitle: "無料枠",
    freeSub: "ゼロコストで始められる",
    freeItems: [
      "64Kコンテキストウィンドウ",
      "10リクエスト/分",
      "100万トークン/日",
      "推論・ストリーミング・ツール呼び出し対応",
    ],
    whyTitle: "2フェーズワークフロー",
    whySub: "最高の計画力 + 最速の実行力",
    phase1Title: "フェーズ1 — 計画",
    phase1Model: "Gemini 3.1 Pro または Claude Opus 4.7",
    phase1Desc:
      "フロンティアモデルでアーキテクチャの決定、タスク分解、ファイル計画、エッジケース分析を行います。これらのモデルは曖昧さを推論し、構造化されたプランを生成するのに優れています。",
    phase1Points: [
      "機能を具体的なサブタスクに分解",
      "ファイル構造とインターフェースを決定",
      "エッジケースとエラーハンドリングパターンを特定",
      "擬似コードまたは詳細な仕様を作成",
    ],
    phase2Title: "フェーズ2 — コーディング",
    phase2Model: "Cerebras上のGLM 4.7",
    phase2Desc:
      "計画を1,000 tpsで実行します。GLM 4.7はコーディングベンチマークで80/100を獲得しています。明確なプランがあれば、実装には十分な能力です。速度の利点は圧倒的で、他では30秒かかるタスクがここでは2〜3秒で完了します。",
    phase2Points: [
      "プランから実装コードを生成",
      "高速イテレーション — 修正・リファクタ・テスト",
      "ユニットテストとドキュメントの作成",
      "一括操作：リファクタ・移行・変換",
    ],
    setupTitle: "OpenCodeでのセットアップ",
    setupSub: "3ステップ、2分で完了",
    step1Title: "1. OpenCodeをインストール",
    step1Desc: "ワンラインインストール — macOS、Linux、WSLで動作：",
    step2Title: "2. Cerebras APIキーを取得",
    step2Desc: "サインアップまたはログインしてAPIキーを取得：",
    step2Link: "cloud.cerebras.ai",
    step2After: "次にOpenCodeを認証：",
    step2Instruction:
      "プロバイダーリストから「Cerebras」を選択し、APIキーを貼り付けます。",
    step3Title: "3. GLM 4.7を選択",
    step3Desc: "OpenCodeセッション内でGLMモデルに切り替え：",
    step3After:
      "モデルリストからzai-glm-4.7を選択。1,000 tpsでコーディングする準備完了です。",
    modelTitle: "GLM 4.7 — モデル詳細",
    modelSub: "内部仕様の概要",
    modelId: "モデルID",
    modelIdVal: "zai-glm-4.7",
    modelFeatures: "機能",
    featuresList: [
      "推論 — デフォルトで有効（Chain-of-Thought）",
      "ストリーミング — リアルタイムトークン出力",
      "構造化出力 — JSONモード",
      "ツール呼び出し / 関数呼び出し",
      "ビジョン — 画像理解",
    ],
    modelBenchmarks: "ベンチマークスコア（0〜100）",
    benchmarkRows: [
      { label: "計画力", score: 76 },
      { label: "コーディング", score: 80 },
      { label: "画像理解", score: 58 },
      { label: "リサーチ", score: 82 },
      { label: "クリエイティブ", score: 74 },
    ],
    tipsTitle: "プロのコツ",
    tips: [
      {
        title: "まず計画を立てる",
        desc: "Opus/Geminiで2分間プランを立てると、どのモデルでも20分のイテレーションを節約できます。",
      },
      {
        title: "推論はデフォルトでON",
        desc: "GLM 4.7はChain-of-Thought推論を自動的に使用します。追加のプロンプトなしでより良い回答が得られます。",
      },
      {
        title: "構造化出力を活用",
        desc: "コード生成にはJSON構造化レスポンスをリクエストして、クリーンでパース可能な出力を得ましょう。",
      },
      {
        title: "一括操作が光る",
        desc: "1,000 tpsでは、コードベース全体のリネームやテストスイート生成などがほぼ瞬時に完了します。",
      },
    ],
    linksTitle: "リソース",
    links: [
      {
        label: "Cerebras GLM 4.7 ドキュメント",
        url: "https://inference-docs.cerebras.ai/models/zai-glm-47",
      },
      {
        label: "OpenCode × Cerebras 統合ガイド",
        url: "https://inference-docs.cerebras.ai/integrations/opencode",
      },
      {
        label: "Cerebras Cloud コンソール",
        url: "https://cloud.cerebras.ai",
      },
      {
        label: "OpenCode — ホームページ",
        url: "https://opencode.ai",
      },
    ],
    footer: "©CyberAgent, Inc. · AIドリブン推進室（AI Driven Office）",
    dataNote:
      "ベンチマークスコアは公開ベンチマーク · 価格はCerebras（2026年2月時点）",
  },
} as const;

/* ─────────────────── Code block with copy ─────────────────── */
function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    sfxSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative group rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(51,112,254,0.12)" }}
    >
      {label && (
        <div
          className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase"
          style={{
            fontFamily: "'Space Mono', monospace",
            background: "rgba(51,112,254,0.06)",
            color: "#5C8DFE",
            borderBottom: "1px solid rgba(51,112,254,0.08)",
          }}
        >
          {label}
        </div>
      )}
      <pre
        className="m-0 px-4 py-3 overflow-x-auto text-[13px] leading-relaxed"
        style={{
          fontFamily: "'Space Mono', monospace",
          background: "rgba(8,18,26,0.8)",
          color: "#c5d0dc",
        }}
      >
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
        style={{
          background: "rgba(51,112,254,0.15)",
          color: copied ? "#4ade80" : "#5C8DFE",
        }}
        aria-label="Copy"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

/* ─────────────────── Stat card ─────────────────── */
function StatCard({
  value,
  label,
  icon,
  gradient,
}: {
  value: string;
  label: string;
  icon: ReactNode;
  gradient: string;
}) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: gradient }}
      />
      <div className="flex items-center gap-2 mb-2" style={{ color: "#666" }}>
        {icon}
      </div>
      <div
        className="text-xl font-bold mb-0.5"
        style={{
          fontFamily: "'Space Mono', monospace",
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {value}
      </div>
      <div className="text-[11px]" style={{ color: "#888" }}>
        {label}
      </div>
    </div>
  );
}

/* ─────────────────── Phase card ─────────────────── */
function PhaseCard({
  number,
  title,
  model,
  desc,
  points,
  gradient,
  icon,
}: {
  number: string;
  title: string;
  model: string;
  desc: string;
  points: readonly string[];
  gradient: string;
  icon: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: gradient }}
      />
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: gradient, opacity: 0.9 }}
        >
          {icon}
        </div>
        <div>
          <div
            className="text-[10px] font-bold uppercase tracking-[3px]"
            style={{
              fontFamily: "'Space Mono', monospace",
              background: gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {number}
          </div>
          <div className="text-base font-bold text-gray-200">{title}</div>
        </div>
      </div>
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[11px] font-semibold"
        style={{
          background: "rgba(51,112,254,0.08)",
          border: "1px solid rgba(51,112,254,0.15)",
          color: "#5C8DFE",
          fontFamily: "'Space Mono', monospace",
        }}
      >
        <Cpu className="w-3 h-3" />
        {model}
      </div>
      <p className="text-[13px] leading-relaxed text-gray-400 m-0 mb-4">
        {desc}
      </p>
      <ul className="m-0 p-0 list-none space-y-2">
        {points.map((pt, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[12px] text-gray-500"
          >
            <ChevronRight
              className="w-3 h-3 mt-0.5 shrink-0"
              style={{ color: "#5C8DFE" }}
            />
            {pt}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────── AidLogo ─────────────────── */
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

/* ═══════════════════ Main Component ═══════════════════ */
export default function GlmCerebrasGuide() {
  const [lang, setLang] = useLang("ja");
  const l = content[lang];
  const isJa = lang === "ja";
  const base =
    (typeof import.meta !== "undefined" &&
      import.meta.env?.BASE_URL?.replace(/\/?$/, "/")) ||
    "/model-providers-comparison/";

  return (
    <div className="max-w-[780px] mx-auto">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <a href={base} className="no-underline flex items-center gap-2">
            <AidLogo className="h-6 w-auto" />
          </a>
          <div
            className="h-4 w-px"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(51,112,254,0.3), transparent)",
            }}
          />
          <span
            className="text-[11px]"
            style={{
              fontFamily: isJa
                ? "'Zen Kaku Gothic New', sans-serif"
                : "'Space Mono', monospace",
              letterSpacing: isJa ? 1 : 3,
              textTransform: isJa ? "none" : "uppercase",
              background: "linear-gradient(135deg, #5C8DFE, #FF3640)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {l.badge}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={base}
            onClick={() => sfxClick()}
            className="text-[11px] no-underline transition-colors"
            style={{
              fontFamily: isJa
                ? "'Zen Kaku Gothic New', sans-serif"
                : "'Space Mono', monospace",
              color: "#555",
            }}
          >
            {l.backLabel}
          </a>
          <div
            className="flex gap-0.5 rounded-lg p-[3px] border"
            style={{
              background: "rgba(51,112,254,0.06)",
              borderColor: "rgba(51,112,254,0.12)",
            }}
          >
            {(
              [
                { code: "en" as Lang, label: "EN" },
                { code: "ja" as Lang, label: "日本語" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.code}
                onClick={() => { setLang(opt.code); sfxLang(); }}
                className="px-3.5 py-1 rounded-md border-none cursor-pointer transition-all duration-200"
                style={{
                  fontFamily:
                    opt.code === "ja"
                      ? "'Zen Kaku Gothic New', sans-serif"
                      : "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: opt.code === "ja" ? 0 : 1,
                  background:
                    lang === opt.code
                      ? "linear-gradient(135deg, rgba(51,112,254,0.2), rgba(255,4,19,0.15))"
                      : "transparent",
                  color: lang === opt.code ? "#fff" : "#555",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative mb-12 pt-4">
        <div
          className="absolute top-0 right-0 opacity-[0.04]"
          style={{ width: 300, height: 200 }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px"
              style={{
                top: `${12 + i * 22}px`,
                right: 0,
                width: `${60 + i * 30}px`,
                background: `linear-gradient(90deg, transparent, ${
                  i % 2 === 0 ? "#3370FE" : "#FF0413"
                })`,
              }}
            />
          ))}
        </div>

        <div
          className="text-[120px] font-black leading-none m-0 mb-2 select-none"
          style={{
            fontFamily: "'Space Mono', monospace",
            background:
              "linear-gradient(135deg, #3370FE 0%, #8A3CB8 35%, #E0247A 65%, #FF0413 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 60px rgba(51,112,254,0.15))",
            letterSpacing: -8,
          }}
        >
          1K
        </div>

        <h1
          className="text-3xl font-black m-0 mb-2"
          style={{
            letterSpacing: isJa ? 2 : -1,
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
            color: "#fff",
          }}
        >
          {l.title}
        </h1>

        <p
          className="text-base m-0 mb-6 max-w-[560px]"
          style={{
            color: "#777",
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
            lineHeight: 1.6,
          }}
        >
          {l.subtitle}
        </p>

        <div
          className="h-px w-full mb-8"
          style={{
            background:
              "linear-gradient(90deg, #3370FE, #8A3CB8, #E0247A, #FF0413, transparent)",
          }}
        />
      </div>

      {/* ── Introduction ── */}
      <div className="mb-12">
        <p
          className="text-[14px] leading-relaxed text-gray-400 m-0 mb-4"
          style={{
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
          }}
        >
          {l.introP1}
        </p>
        <p
          className="text-[14px] leading-relaxed text-gray-400 m-0"
          style={{
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
          }}
        >
          {l.introP2}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard
          value={l.statSpeed}
          label={l.statSpeedLabel}
          icon={<Zap className="w-3.5 h-3.5" />}
          gradient="linear-gradient(135deg, #3370FE, #8A3CB8)"
        />
        <StatCard
          value={l.statContext}
          label={l.statContextLabel}
          icon={<Layers className="w-3.5 h-3.5" />}
          gradient="linear-gradient(135deg, #8A3CB8, #E0247A)"
        />
        <StatCard
          value={l.statInput}
          label={l.statInputLabel}
          icon={<DollarSign className="w-3.5 h-3.5" />}
          gradient="linear-gradient(135deg, #E0247A, #FF0413)"
        />
        <StatCard
          value={l.statOutput}
          label={l.statOutputLabel}
          icon={<DollarSign className="w-3.5 h-3.5" />}
          gradient="linear-gradient(135deg, #FF0413, #FF6B35)"
        />
      </div>

      {/* ── Free Tier ── */}
      <div
        className="rounded-2xl p-5 mb-12 relative overflow-hidden"
        style={{
          background: "rgba(51,112,254,0.03)",
          border: "1px solid rgba(51,112,254,0.1)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, #3370FE, transparent)",
          }}
        />
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4" style={{ color: "#5C8DFE" }} />
          <span className="text-sm font-bold" style={{ color: "#5C8DFE" }}>
            {l.freeTitle}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 m-0 mb-3">{l.freeSub}</p>
        <div className="grid grid-cols-2 gap-2">
          {l.freeItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[12px] text-gray-400"
            >
              <Check
                className="w-3 h-3 shrink-0"
                style={{ color: "#4ade80" }}
              />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-Phase Workflow ── */}
      <section className="mb-14">
        <h2
          className="text-2xl font-black m-0 mb-1"
          style={{
            background: "linear-gradient(135deg, #5C8DFE, #E0247A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
          }}
        >
          {l.whyTitle}
        </h2>
        <p className="text-gray-500 text-[13px] m-0 mb-6">{l.whySub}</p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(138,60,184,0.1)",
              border: "1px solid rgba(138,60,184,0.2)",
            }}
          >
            <Brain className="w-3.5 h-3.5" style={{ color: "#A855F7" }} />
            <span
              className="text-[11px] font-semibold"
              style={{
                color: "#A855F7",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              PLAN
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600" />
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(51,112,254,0.1)",
              border: "1px solid rgba(51,112,254,0.2)",
            }}
          >
            <Code className="w-3.5 h-3.5" style={{ color: "#5C8DFE" }} />
            <span
              className="text-[11px] font-semibold"
              style={{
                color: "#5C8DFE",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              CODE
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-600" />
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.15)",
            }}
          >
            <Zap className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
            <span
              className="text-[11px] font-semibold"
              style={{
                color: "#4ade80",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              SHIP
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <PhaseCard
            number="Phase 1"
            title={l.phase1Title}
            model={l.phase1Model}
            desc={l.phase1Desc}
            points={l.phase1Points}
            gradient="linear-gradient(135deg, #8A3CB8, #E0247A)"
            icon={<Brain className="w-4 h-4 text-white" />}
          />
          <PhaseCard
            number="Phase 2"
            title={l.phase2Title}
            model={l.phase2Model}
            desc={l.phase2Desc}
            points={l.phase2Points}
            gradient="linear-gradient(135deg, #3370FE, #5C8DFE)"
            icon={<Code className="w-4 h-4 text-white" />}
          />
        </div>
      </section>

      {/* ── Setup ── */}
      <section className="mb-14">
        <h2
          className="text-2xl font-black m-0 mb-1"
          style={{
            background: "linear-gradient(135deg, #3370FE, #8A3CB8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
          }}
        >
          {l.setupTitle}
        </h2>
        <p className="text-gray-500 text-[13px] m-0 mb-8">{l.setupSub}</p>

        {/* Step 1 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "linear-gradient(135deg, #3370FE, #5C8DFE)",
                color: "#fff",
              }}
            >
              1
            </div>
            <h3 className="text-base font-bold m-0 text-gray-200">
              {l.step1Title}
            </h3>
          </div>
          <p className="text-[13px] text-gray-500 m-0 mb-3 ml-10">
            {l.step1Desc}
          </p>
          <div className="ml-10">
            <CodeBlock
              code="curl -fsSL https://opencode.ai/install | bash"
              label="bash"
            />
          </div>
        </div>

        {/* Step 2 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "linear-gradient(135deg, #8A3CB8, #A855F7)",
                color: "#fff",
              }}
            >
              2
            </div>
            <h3 className="text-base font-bold m-0 text-gray-200">
              {l.step2Title}
            </h3>
          </div>
          <p className="text-[13px] text-gray-500 m-0 mb-3 ml-10">
            {l.step2Desc}{" "}
            <a
              href="https://cloud.cerebras.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 no-underline font-semibold"
              style={{ color: "#5C8DFE" }}
            >
              {l.step2Link}
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-[13px] text-gray-500 m-0 mb-3 ml-10">
            {l.step2After}
          </p>
          <div className="ml-10 mb-3">
            <CodeBlock code="opencode auth login" label="bash" />
          </div>
          <p className="text-[12px] text-gray-600 m-0 ml-10 italic">
            {l.step2Instruction}
          </p>
        </div>

        {/* Step 3 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "linear-gradient(135deg, #E0247A, #FF0413)",
                color: "#fff",
              }}
            >
              3
            </div>
            <h3 className="text-base font-bold m-0 text-gray-200">
              {l.step3Title}
            </h3>
          </div>
          <p className="text-[13px] text-gray-500 m-0 mb-3 ml-10">
            {l.step3Desc}
          </p>
          <div className="ml-10 mb-3">
            <CodeBlock code="/models" label="opencode" />
          </div>
          <p className="text-[12px] text-gray-600 m-0 ml-10 italic">
            {l.step3After}
          </p>
        </div>
      </section>

      {/* ── Model Details ── */}
      <section className="mb-14">
        <h2
          className="text-2xl font-black m-0 mb-1"
          style={{
            background: "linear-gradient(135deg, #E0247A, #FF0413)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
          }}
        >
          {l.modelTitle}
        </h2>
        <p className="text-gray-500 text-[13px] m-0 mb-6">{l.modelSub}</p>

        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="mb-5">
            <div
              className="text-[10px] font-bold uppercase tracking-[3px] text-gray-600 mb-1"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {l.modelId}
            </div>
            <code
              className="text-sm px-3 py-1 rounded-md"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "rgba(51,112,254,0.08)",
                color: "#5C8DFE",
                border: "1px solid rgba(51,112,254,0.12)",
              }}
            >
              {l.modelIdVal}
            </code>
          </div>

          <div className="mb-6">
            <div
              className="text-[10px] font-bold uppercase tracking-[3px] text-gray-600 mb-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {l.modelFeatures}
            </div>
            <ul className="m-0 p-0 list-none space-y-2">
              {l.featuresList.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-gray-400"
                >
                  <Check
                    className="w-3 h-3 mt-0.5 shrink-0"
                    style={{ color: "#4ade80" }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-[3px] text-gray-600 mb-3"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {l.modelBenchmarks}
            </div>
            <div className="space-y-2.5">
              {l.benchmarkRows.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="text-[11px] text-gray-500 w-28 shrink-0"
                    style={{
                      fontFamily: isJa
                        ? "'Zen Kaku Gothic New', sans-serif"
                        : "'Inter', sans-serif",
                    }}
                  >
                    {row.label}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="h-full rounded-full animate-bar-fill"
                      style={{
                        width: `${row.score}%`,
                        background: `linear-gradient(90deg, #3370FE, ${
                          row.score > 75 ? "#4ade80" : "#E0247A"
                        })`,
                      }}
                    />
                  </div>
                  <span
                    className="text-[12px] font-bold w-8 text-right"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      color: row.score > 75 ? "#5C8DFE" : "#999",
                    }}
                  >
                    {row.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pro Tips ── */}
      <section className="mb-14">
        <h2
          className="text-2xl font-black m-0 mb-6"
          style={{
            background: "linear-gradient(135deg, #5C8DFE, #4ade80)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
          }}
        >
          {l.tipsTitle}
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {l.tips.map((tip, i) => (
            <div
              key={i}
              className="rounded-xl p-4 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    background: "rgba(51,112,254,0.12)",
                    color: "#5C8DFE",
                  }}
                >
                  {i + 1}
                </div>
                <h4 className="text-[13px] font-bold m-0 text-gray-200">
                  {tip.title}
                </h4>
              </div>
              <p className="text-[12px] text-gray-500 m-0 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Resources ── */}
      <section className="mb-14">
        <h2
          className="text-lg font-bold m-0 mb-4 text-gray-300"
          style={{
            fontFamily: isJa
              ? "'Zen Kaku Gothic New', sans-serif"
              : "'Inter', sans-serif",
          }}
        >
          {l.linksTitle}
        </h2>
        <div className="grid md:grid-cols-2 gap-2">
          {l.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline transition-all"
              onClick={() => sfxClick()}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#aaa",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(51,112,254,0.2)";
                e.currentTarget.style.background =
                  "rgba(51,112,254,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor =
                  "rgba(255,255,255,0.06)";
                e.currentTarget.style.background =
                  "rgba(255,255,255,0.02)";
              }}
            >
              <ExternalLink
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#5C8DFE" }}
              />
              <span className="text-[12px]">{link.label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="mt-10 pt-6 pb-8 relative"
        style={{ borderTop: "1px solid rgba(51,112,254,0.08)" }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-48"
          style={{
            background:
              "linear-gradient(90deg, transparent, #3370FE, #8A3CB8, #E0247A, #FF0413, transparent)",
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <AidLogo className="h-5 w-auto opacity-40" />
          <div
            className="text-center text-gray-600 text-[10px]"
            style={{
              fontFamily: isJa
                ? "'Zen Kaku Gothic New', sans-serif"
                : "'Space Mono', monospace",
            }}
          >
            {l.dataNote}
          </div>
          <div
            className="text-center text-gray-700 text-[10px]"
            style={{
              fontFamily: isJa
                ? "'Zen Kaku Gothic New', sans-serif"
                : "'Inter', sans-serif",
              letterSpacing: 0.5,
            }}
          >
            {l.footer}
          </div>
        </div>
      </footer>
    </div>
  );
}
