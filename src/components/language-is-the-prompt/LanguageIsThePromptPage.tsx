import { useState, useEffect, useRef, type ReactNode, type WheelEvent as ReactWheelEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Zap, Code2, Beaker, Shield, Layers, GitBranch, Terminal, BookOpen, Cpu, FlaskConical, Sparkles, FileCheck, Shuffle, Lock, ArrowRight, Paintbrush, FileText, ExternalLink, PenTool, TestTube, CheckCircle, BookMarked, BrainCircuit } from "lucide-react";
import type { Lang } from "../../data/i18n";
import PaperEmbed from "./PaperEmbed";

/* ── Typography constants ── */
const MONO = "'Space Mono', monospace";
const CODE_FONT = "'JetBrains Mono', 'Fira Code', 'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";
const JA_SANS = "'Zen Kaku Gothic New', sans-serif";


/* ══════════════════════════════════════════════════════════════════════════
   BILINGUAL CONTENT
   ══════════════════════════════════════════════════════════════════════════ */

const content = {
  en: {
    back: "Back to Dashboard",
    badge: "Research",
    title: "The Language Is the Prompt",
    subtitle: "What Elixir's 87.4% vs Python's 43.9% suggests about explicitness, language design, and LLM code generation.",
    heroStat1Label: "Elixir Pass@1",
    heroStat1Value: "87.4%",
    heroStat2Label: "Python Pass@1",
    heroStat2Value: "43.9%",
    heroStat3Label: "Gap on Hard Tasks",
    heroStat3Value: "55pt",
    tldr: "TL;DR",
    tldrText: "LLMs don't just read your prompt  - they read your **language**, its **conventions**, and its **libraries**. Elixir makes intent unusually explicit, but the broader lesson is portable: the **less guesswork** a model has to do, the **better it tends to perform**.",
    whyTitle: "Why does this matter?",
    whyPoints: [
      "Elixir has **far less training data** than Python, yet performs **unusually well** at code generation",
      "The gap **widens on harder problems**, suggesting that explicitness matters more as **complexity grows**",
      "**Explicit error contracts** are the **strongest portable signal** across all languages tested",
      "Other languages can **adopt these principles** to improve their LLM code generation",
    ],
    hypothesisTitle: "The Explicitness Hypothesis",
    hypothesisSub: "Languages that make **intent**, **contracts**, and **data flow** locally visible **reduce the predictive burden** on LLMs.",
    principles: [
      { title: "Explicit Contracts", desc: "Algebraic data typing for errors -every function returns {:ok, val} or {:error, reason} instead of throwing exceptions. The paper identified this as the single strongest cross-language predictor of LLM performance. The {:ok, _}/{:error, _} pattern appears thousands of times in training data, creating extremely strong next-token prediction signal.", icon: "contract" },
      { title: "Pattern Matching", desc: "Algebraic pattern matching decomposes data by shape -each function clause handles exactly one variant, and the compiler guarantees exhaustiveness. For LLMs, flat branch-per-clause structures are far more predictable than deeply nested conditional trees; the model reasons about each branch in isolation.", icon: "pattern" },
      { title: "Immutability Default", desc: "Referential transparency by default: once bound, a value never changes. This eliminates stale references, shared-state races, and temporal coupling. LLMs never need to trace mutation history across scopes -every value is defined exactly where it appears, making code locally self-contained.", icon: "lock" },
      { title: "Pipe Operator", desc: "Function composition made visually linear: data |> step1 |> step2 |> step3. The paper found pipeline style reduces nesting depth and makes each transformation locally obvious. LLMs predict left-to-right sequences far more accurately than nested calls like step3(step2(step1(data))).", icon: "pipe" },
      { title: "Formatter Uniformity", desc: "A canonical formatter (mix format) eliminates all stylistic variation -indentation, spacing, line breaks become deterministic. In information theory terms, this collapses surface-level entropy to near zero. The model spends zero capacity on style, all capacity on semantics.", icon: "format" },
      { title: "Executable Docs", desc: "Doctests embed runnable examples inside function documentation, serving as specification, test, and docs simultaneously -the literate programming ideal. ExUnit executes these as part of the test suite. LLMs get verified input/output pairs co-located with the function definition.", icon: "docs" },
    ],
    difficultyTitle: "The Hard Problem Gap",
    difficultySub: "On hard tasks, Elixir degrades far less than most comparison languages.",
    difficultyNote: "Elixir stays relatively stable from easy to hard problems; Python and JS drop much more sharply.",
    codeTitle: "Show Me the Code",
    codeSub: "Elixir stays on the left; the selected language shows the closest idiomatic equivalent, using current language features and common libraries when they matter.",
    codeNote: "Note: Effect is not a separate language. It is a TypeScript library. We show it separately because the syntax and idioms are different enough from mainstream TypeScript that side-by-side comparison is useful for learning.",
    readPaperCta: "Read the full research paper",
    readPaperCtaSub: "Scroll down to the embedded PDF with all data, methodology, and analysis",
    paperLink: "Research Source",
    paperLinkSub: "Günther Brunner · CyberAgent",
    methodology: "Source: \"The Language Is the Prompt\" by Günther Brunner, CyberAgent Inc.",
  },
  ja: {
    back: "ダッシュボードに戻る",
    badge: "研究",
    title: "言語がプロンプトである",
    subtitle: "Elixirの87.4%、Pythonの43.9%という差が、明示性・言語設計・LLMコード生成について何を示しているか。プログラミング言語そのものがプロンプトだ。",
    heroStat1Label: "Elixir Pass@1",
    heroStat1Value: "87.4%",
    heroStat2Label: "Python Pass@1",
    heroStat2Value: "43.9%",
    heroStat3Label: "難問での差",
    heroStat3Value: "55pt",
    tldr: "要約",
    tldrText: "LLMはプロンプトだけでなく、**言語**・**慣習**・**ライブラリ**も読む。Elixirは意図を非常に明示しやすいが、重要なのはその発想が**他言語にも移せる**ことだ。モデルが**推測しなくてよい**ほど、**性能は安定しやすい**。",
    whyTitle: "なぜ重要か？",
    whyPoints: [
      "ElixirはPythonより**学習データが少ない**のに、コード生成で**非常に高い性能**を示す",
      "**難問になるほど差は広がり**、明示性が**複雑さに強く効いている**ことを示唆する",
      "**明示的なエラー契約**が、テストされた全言語で**最も強力なポータブルシグナル**",
      "他の言語もこれらの原則を**採用してLLMコード生成を改善**できる",
    ],
    hypothesisTitle: "明示性仮説",
    hypothesisSub: "**意図**・**契約**・**データフロー**をローカルに可視化する言語は、LLMの**予測負荷を減らす**。",
    principles: [
      { title: "明示的な契約", desc: "代数的データ型によるエラーハンドリング -例外をスローせず、すべての関数が{:ok, val}または{:error, reason}を返す。論文ではこれが最も強力な言語横断的LLM性能予測因子と特定された。{:ok, _}/{:error, _}パターンは訓練データに何千回も出現し、極めて強い次トークン予測シグナルを生む。", icon: "contract" },
      { title: "パターンマッチ", desc: "代数的パターンマッチングはデータを形状で分解し、各関数句が正確に1つのバリアントを処理、コンパイラが網羅性を保証する。LLMにとって、フラットな句ごとの分岐は深くネストした条件分岐ツリーよりはるかに予測しやすく、各分岐を独立に推論できる。", icon: "pattern" },
      { title: "デフォルト不変性", desc: "デフォルトの参照透過性：一度束縛された値は変わらない。古い参照、共有状態の競合、時間的結合を排除する。LLMはスコープ間の変異履歴を追跡する必要がなく、すべての値が出現箇所で定義されるため、コードがローカルに自己完結する。", icon: "lock" },
      { title: "パイプ演算子", desc: "関数合成を視覚的に線形にする：data |> step1 |> step2 |> step3。論文ではパイプラインスタイルがネスト深度を減らし各変換をローカルに明白にすることを発見。LLMはstep3(step2(step1(data)))より左から右のシーケンスをはるかに正確に予測する。", icon: "pipe" },
      { title: "フォーマッタ統一", desc: "標準フォーマッタ（mix format）がスタイル変動を完全排除 -インデント・スペース・改行が決定論的に。情報理論的には表面エントロピーをほぼゼロに圧縮。モデルはスタイルに容量ゼロ、セマンティクスに全容量を使える。", icon: "format" },
      { title: "実行可能なドキュメント", desc: "関数ドキュメント内に実行可能な例を埋め込み、仕様・テスト・ドキュメントの三役を同時に果たすリテラルプログラミングの理想形。ExUnitがテストスイートとして実行する。LLMは関数定義の隣に検証済みの入出力ペアを得る。", icon: "docs" },
    ],
    difficultyTitle: "難問での差",
    difficultySub: "難しい問題でも、Elixirは多くの比較対象より劣化がかなり小さい。",
    difficultyNote: "Elixirは易しい問題から難しい問題まで比較的安定しており、PythonやJSは落ち込みが大きい。",
    codeTitle: "コードで見る",
    codeSub: "左にElixir、右に選択した言語での最も自然な等価表現を表示。必要に応じて最新の言語機能や定番ライブラリを使う。",
    codeNote: "注: Effectは独立した言語ではなく、TypeScriptのライブラリです。ただし構文と慣用スタイルが通常のTypeScriptとかなり異なるため、学習と比較をしやすくするために別枠で表示しています。",
    readPaperCta: "研究論文を読む",
    readPaperCtaSub: "埋め込みPDFで全データ・手法・分析を確認できます",
    paperLink: "研究ソース",
    paperLinkSub: "Günther Brunner · CyberAgent",
    methodology: "出典: 「The Language Is the Prompt」  - Günther Brunner, CyberAgent Inc.",
  },
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   DIFFICULTY DATA
   ══════════════════════════════════════════════════════════════════════════ */

const difficultyData = [
  { lang: "Elixir",     easy: 96.6, medium: 86.7, hard: 86.3, degradation: -10.3, color: "#22D694" },
  { lang: "Kotlin",     easy: 100.0, medium: 88.1, hard: 63.6, degradation: -36.4, color: "#5B9EFF" },
  { lang: "C#",         easy: 97.8, medium: 81.1, hard: 63.1, degradation: -34.7, color: "#A78BFA" },
  { lang: "Python",     easy: 82.0, medium: 48.6, hard: 31.6, degradation: -50.4, color: "#FFB340" },
  { lang: "JS",         easy: 78.5, medium: 45.2, hard: 28.3, degradation: -50.2, color: "#FF5A5A" },
];

/* ══════════════════════════════════════════════════════════════════════════
   CODE SAMPLES  - Elixir features with equivalents in 8 other languages
   ══════════════════════════════════════════════════════════════════════════ */

export type LangId = "elixir" | "python" | "typescript" | "typescript_effect" | "go" | "csharp" | "dart" | "swift" | "kotlin";

interface LibRef {
  lang: string;
  name: string;
  url?: string;
  builtin?: boolean;
}

interface CodeAnnotation {
  match: string;
  title: { en: string; ja: string };
  body: { en: string; ja: string };
}

interface CodeSample {
  id: string;
  title: { en: string; ja: string };
  description: { en: string; ja: string };
  importance?: "critical" | "high" | "medium";
  icon: ReactNode;
  diagram?: (isJa: boolean) => ReactNode;
  snippets: Record<LangId, string>;
  libraries?: LibRef[];
  caveats?: { en: string; ja: string };
  annotations?: Partial<Record<LangId, CodeAnnotation[]>>;
}

const LANG_LABELS: Record<LangId, string> = {
  elixir: "Elixir",
  python: "Python",
  typescript: "TS",
  typescript_effect: "Effect",
  go: "Go",
  csharp: "C#",
  dart: "Dart",
  swift: "Swift",
  kotlin: "Kotlin",
};

const LANG_COLORS: Record<LangId, string> = {
  elixir: "#9B59B6",
  python: "#3776AB",
  typescript: "#3178C6",
  typescript_effect: "#7B61FF",
  go: "#00ADD8",
  csharp: "#68217A",
  dart: "#0175C2",
  swift: "#F05138",
  kotlin: "#7F52FF",
};

export const LANG_SHIKI: Record<LangId, string> = {
  elixir: "elixir",
  python: "python",
  typescript: "typescript",
  typescript_effect: "typescript",
  go: "go",
  csharp: "csharp",
  dart: "dart",
  swift: "swift",
  kotlin: "kotlin",
};

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

export type HighlightMap = Record<string, Partial<Record<LangId, string>>>;

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

/* ── Language SVG Icons (16x16) ── */
function LangIcon({ id, size = 16 }: { id: LangId; size?: number }) {
  const s = size;
  const c = LANG_COLORS[id];
  switch (id) {
    case "elixir":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.5 6 6 10.5 6 14.5C6 18.64 8.69 22 12 22C15.31 22 18 18.64 18 14.5C18 10.5 15.5 6 12 2Z" fill={c} fillOpacity={0.85} />
          <path d="M12 2C8.5 6 6 10.5 6 14.5C6 18.64 8.69 22 12 22C15.31 22 18 18.64 18 14.5C18 10.5 15.5 6 12 2Z" stroke={c} strokeWidth={1.5} fill="none" />
        </svg>
      );
    case "python":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M11.9 2C6.5 2 7 4.5 7 4.5V7h5v1H5.5S2 7.5 2 12.1 4.9 17 4.9 17H7v-2.9s-.1-2.9 2.9-2.9h4.9s2.8 0 2.8-2.7V4.8S18 2 11.9 2zM9.2 4c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z" fill={c} />
          <path d="M12.1 22c5.4 0 4.9-2.5 4.9-2.5V17h-5v-1h6.5s3.5.5 3.5-4.1S19.1 7 19.1 7H17v2.9s.1 2.9-2.9 2.9H9.2s-2.8 0-2.8 2.7v3.7S6 22 12.1 22zm2.7-2c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" fill={c} fillOpacity={0.65} />
        </svg>
      );
    case "typescript":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" fill={c} />
          <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">TS</text>
        </svg>
      );
    case "typescript_effect":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" fill={c} />
          <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Efx</text>
        </svg>
      );
    case "go":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" fill={c} fillOpacity={0.15} />
          <text x="12" y="16.5" textAnchor="middle" fill={c} fontSize="11" fontWeight="bold" fontFamily="sans-serif">Go</text>
        </svg>
      );
    case "csharp":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" fill={c} />
          <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">C#</text>
        </svg>
      );
    case "dart":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4.5 12L7 4.5H17L19.5 7V17L17 19.5H7L4.5 17V12Z" fill={c} fillOpacity={0.2} stroke={c} strokeWidth={1.5} />
          <path d="M7 4.5L12 12L17 19.5" stroke={c} strokeWidth={1.2} />
          <path d="M19.5 7L12 12L4.5 17" stroke={c} strokeWidth={1.2} />
        </svg>
      );
    case "swift":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" fill={c} />
          <path d="M16.5 16.5c-1 1-5.5-.5-8-3.5 3 1.5 5 1.5 5 1.5-2-2-3.5-4.5-4-5.5 2 2 4.5 3.5 4.5 3.5C12 10 9 6.5 9 6.5c4 3 7 6.5 7.5 7 .8-1 1-3 .5-5 2 2.5 1.5 6-.5 8z" fill="white" />
        </svg>
      );
    case "kotlin":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <path d="M4 4H20L12 12L20 20H4V4Z" fill={c} />
        </svg>
      );
  }
}

function PrincipleIcon({ id, color }: { id: string; color: string }) {
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

export const codeSamples: CodeSample[] = [
  /* ── 1. Pattern Matching ── */
  {
    id: "pattern-matching",
    title: { en: "Pattern Matching", ja: "パターンマッチング" },
    description: {
      en: "Algebraic data decomposition -instead of testing conditions imperatively, you declare the shape of data each branch handles, and the compiler guarantees exhaustiveness. The paper found function-head dispatch eliminates hidden control flow, making each branch a self-contained, locally predictable unit for LLMs. Below: Elixir multi-clause function heads, Python 3.10+ structural matching, Kotlin sealed-class when, TypeScript discriminated unions, and more.",
      ja: "代数的データ分解 -命令的に条件をテストする代わりに、各分岐が処理するデータの形状を宣言し、コンパイラが網羅性を保証する。論文では関数ヘッドディスパッチが隠れた制御フローを排除し、各分岐がLLMにとって自己完結した予測可能な単位になることを発見。以下：Elixirの複数句関数ヘッド、Python 3.10+構造的マッチ、Kotlinのsealed class + when、TypeScriptの判別共用体など。",
    },
    importance: "high",
    icon: <GitBranch className="w-4 h-4" />,
    libraries: [
      { lang: "python", name: "match statement (3.10+)", url: "https://docs.python.org/3/reference/compound_stmts.html#the-match-statement", builtin: true },
      { lang: "typescript", name: "Discriminated unions", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions", builtin: true },
      { lang: "typescript_effect", name: "Match.tag + Schema.TaggedClass (v4 beta)", url: "https://effect.website/docs/data-types/match" },
      { lang: "go", name: "Type switch", url: "https://go.dev/tour/methods/16", builtin: true },
      { lang: "csharp", name: "Switch expressions (C# 8+)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression", builtin: true },
      { lang: "dart", name: "Switch expressions (Dart 3.0+)", url: "https://dart.dev/language/branches#switch-expressions", builtin: true },
      { lang: "swift", name: "switch + pattern matching", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow/#Switch", builtin: true },
      { lang: "kotlin", name: "sealed class + when", url: "https://kotlinlang.org/docs/sealed-classes.html", builtin: true },
    ],
    caveats: {
      en: "Python structural pattern matching requires 3.10+. Dart switch expressions require Dart 3.0+. C# switch expressions require C# 8+.",
      ja: "Pythonの構造的パターンマッチには3.10+が必要。Dartのswitch式にはDart 3.0+が必要。C#のswitch式にはC# 8+が必要。",
    },
    annotations: {
      elixir: [
        {
          match: "def area(",
          title: { en: "Pattern matching starts in the head", ja: "パターンマッチは関数ヘッドから始まる" },
          body: {
            en: "Elixir chooses the clause before entering the body. You do not scan for a later `if`, `switch`, or `match` to discover the branch.",
            ja: "Elixirでは関数本体に入る前に節が選ばれる。後から `if` や `switch` を探して分岐を理解する必要がない。",
          },
        },
        {
          match: "{:circle, r}",
          title: { en: "Tag + destructure in one move", ja: "タグ判定と分解を同時に行う" },
          body: {
            en: "The `:circle` atom picks the variant, and `r` becomes the radius immediately. The code both checks shape and pulls out data in the same syntax.",
            ja: "`:circle` アトムでバリアントを選び、同時に `r` が半径として束縛される。形の判定とデータ取り出しが同じ構文で済む。",
          },
        },
        {
          match: "def area({:rect, w, h})",
          title: { en: "Each case gets its own clause", ja: "各ケースが独立した節になる" },
          body: {
            en: "Circle, rect, and triangle are laid out as parallel clauses instead of one nested decision tree. The structure is repetitive and visually flat.",
            ja: "circle / rect / triangle が、1つの深い分岐木ではなく並列な節として並ぶ。反復的で平坦な構造になっている。",
          },
        },
        {
          match: "Shape.area({:circle, 5})",
          title: { en: "The call site mirrors the clause", ja: "呼び出し側の形が節と対応する" },
          body: {
            en: "Seeing `{:circle, 5}` at the call site already tells you which clause will execute. The data shape itself advertises the control flow.",
            ja: "呼び出し側に `{:circle, 5}` が見えた時点で、どの節が実行されるかほぼ分かる。データの形そのものが制御フローを示している。",
          },
        },
      ],
    },
    snippets: {
      elixir: `defmodule Shape do
  def area({:circle, r}), do: :math.pi() * r * r
  def area({:rect, w, h}), do: w * h
  def area({:triangle, b, h}), do: 0.5 * b * h
end

Shape.area({:circle, 5})    # => 78.54
Shape.area({:rect, 3, 4})   # => 12
Shape.area({:triangle, 6, 3}) # => 9.0`,

      python: `from dataclasses import dataclass
from math import pi

@dataclass(frozen=True, slots=True)
class Circle:
    radius: float

@dataclass(frozen=True, slots=True)
class Rect:
    width: float
    height: float

@dataclass(frozen=True, slots=True)
class Triangle:
    base: float
    height: float

type Shape = Circle | Rect | Triangle

def area(shape: Shape) -> float:
    match shape:
        case Circle(radius):
            return pi * radius ** 2
        case Rect(width, height):
            return width * height
        case Triangle(base, height):
            return 0.5 * base * height

area(Circle(5))         # 78.53981633974483
area(Rect(3, 4))        # 12
area(Triangle(6, 3))    # 9.0`,

      typescript: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number }

const area = (shape: Shape): number => {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2
    case "rect":
      return shape.width * shape.height
    case "triangle":
      return 0.5 * shape.base * shape.height
    default: {
      const exhaustiveCheck: never = shape
      return exhaustiveCheck
    }
  }
}

area({ kind: "circle", radius: 5 }) // 78.53981633974483
area({ kind: "rect", width: 3, height: 4 }) // 12
area({ kind: "triangle", base: 6, height: 3 }) // 9`,

      typescript_effect: `import { Match, Schema } from "effect"

class Circle extends Schema.TaggedClass<Circle>()("Circle", {
  radius: Schema.Number,
}) {}

class Rect extends Schema.TaggedClass<Rect>()("Rect", {
  width: Schema.Number,
  height: Schema.Number,
}) {}

class Triangle extends Schema.TaggedClass<Triangle>()("Triangle", {
  base: Schema.Number,
  height: Schema.Number,
}) {}

type Shape = Circle | Rect | Triangle

const area = Match.type<Shape>().pipe(
  Match.tag("Circle", ({ radius }) => Math.PI * radius ** 2),
  Match.tag("Rect", ({ width, height }) => width * height),
  Match.tag("Triangle", ({ base, height }) => 0.5 * base * height),
  Match.exhaustive,
)

area(new Circle({ radius: 5 })) // 78.53981633974483
area(new Rect({ width: 3, height: 4 })) // 12
area(new Triangle({ base: 6, height: 3 })) // 9`,

      go: `import "math"

type Shape interface{ shape() }

type Circle struct{ Radius float64 }
func (Circle) shape() {}

type Rect struct {
  Width  float64
  Height float64
}
func (Rect) shape() {}

type Triangle struct {
  Base   float64
  Height float64
}
func (Triangle) shape() {}

func area(shape Shape) float64 {
  switch s := shape.(type) {
  case Circle:
    return math.Pi * s.Radius * s.Radius
  case Rect:
    return s.Width * s.Height
  case Triangle:
    return 0.5 * s.Base * s.Height
  }
  panic("unreachable")
}

area(Circle{Radius: 5})          // 78.53981633974483
area(Rect{Width: 3, Height: 4})  // 12
area(Triangle{Base: 6, Height: 3}) // 9`,

      csharp: `using System;

abstract record Shape;
sealed record Circle(double Radius) : Shape;
sealed record Rect(double Width, double Height) : Shape;
sealed record Triangle(double BaseLength, double Height) : Shape;

static double Area(Shape shape) => shape switch
{
    Circle(var radius) => Math.PI * radius * radius,
    Rect(var width, var height) => width * height,
    Triangle(var baseLength, var height) =>
        0.5 * baseLength * height,
    _ => throw new ArgumentOutOfRangeException(nameof(shape))
};

Area(new Circle(5));          // 78.53981633974483
Area(new Rect(3, 4));         // 12
Area(new Triangle(6, 3));     // 9`,

      dart: `import 'dart:math';

sealed class Shape {
  const Shape();
}

final class Circle extends Shape {
  const Circle(this.radius);
  final double radius;
}

final class Rect extends Shape {
  const Rect(this.width, this.height);
  final double width;
  final double height;
}

final class Triangle extends Shape {
  const Triangle(this.baseLength, this.height);
  final double baseLength;
  final double height;
}

double area(Shape shape) => switch (shape) {
  Circle(radius: final radius) => pi * radius * radius,
  Rect(
    width: final width,
    height: final height,
  ) => width * height,
  Triangle(baseLength: final baseLength, height: final height) =>
    0.5 * baseLength * height,
};

area(const Circle(5));      // 78.53981633974483
area(const Rect(3, 4));     // 12
area(const Triangle(6, 3)); // 9`,

      swift: `import Foundation

enum Shape {
  case circle(radius: Double)
  case rect(width: Double, height: Double)
  case triangle(base: Double, height: Double)
}

func area(_ shape: Shape) -> Double {
  switch shape {
  case let .circle(radius):
    return .pi * radius * radius
  case let .rect(width, height):
    return width * height
  case let .triangle(base, height):
    return 0.5 * base * height
  }
}

area(.circle(radius: 5))           // 78.53981633974483
area(.rect(width: 3, height: 4))   // 12
area(.triangle(base: 6, height: 3)) // 9`,

      kotlin: `import kotlin.math.PI

sealed interface Shape
data class Circle(val radius: Double) : Shape
data class Rect(val width: Double, val height: Double) : Shape
data class Triangle(val base: Double, val height: Double) : Shape

fun area(shape: Shape): Double = when (shape) {
  is Circle -> PI * shape.radius * shape.radius
  is Rect -> shape.width * shape.height
  is Triangle -> 0.5 * shape.base * shape.height
}

area(Circle(5.0))         // 78.53981633974483
area(Rect(3.0, 4.0))      // 12
area(Triangle(6.0, 3.0))  // 9`,
    },
  },

  /* ── 2. Result Types / Tagged Tuples ── */
  {
    id: "result-types",
    title: { en: "Result Types & Error Handling", ja: "Result型とエラーハンドリング" },
    description: {
      en: "Explicit error types formalize success vs. failure at the type level -a function's signature tells you exactly what can go wrong, rather than hiding exceptions in the call stack. The paper identified this as the single strongest cross-language predictor of LLM performance: every language scoring above 70% Pass@1 had idiomatic result types. Below: Elixir's {:ok, val}/{:error, reason} tuples, Swift/Kotlin Result and Arrow Either, Go's (value, error) pairs, Effect's typed error channel, and library-based approaches for Python, TypeScript, C#, and Dart.",
      ja: "明示的なエラー型は成功と失敗の区別を型レベルで形式化する -関数シグネチャが失敗の可能性を正確に伝え、コールスタックに例外を隠さない。論文ではこれが最も強力な言語横断的LLM性能予測因子と特定：Pass@1が70%超のすべての言語は慣用的なResult型を持っていた。以下：Elixirの{:ok, val}/{:error, reason}タプル、Swift/KotlinのResultとArrow Either、Goの(value, error)ペア、Effectの型付きエラーチャネル、Python・TypeScript・C#・Dartのライブラリベースのアプローチ。",
    },
    importance: "critical",
    icon: <Shield className="w-4 h-4" />,
    libraries: [
      { lang: "python", name: "returns", url: "https://github.com/dry-python/returns" },
      { lang: "typescript", name: "neverthrow", url: "https://github.com/supermacro/neverthrow" },
      { lang: "typescript_effect", name: "Schema.TaggedErrorClass + ServiceMap.Service (v4 beta)", url: "https://effect.website/docs/getting-started/running-effects" },
      { lang: "go", name: "(value, error) tuple", url: "https://go.dev/blog/error-handling-and-go", builtin: true },
      { lang: "csharp", name: "Result<T> (manual / CSharpFunctionalExtensions)", url: "https://github.com/vkhorikov/CSharpFunctionalExtensions" },
      { lang: "dart", name: "fpdart", url: "https://pub.dev/packages/fpdart" },
      { lang: "swift", name: "Result<Success, Failure>", url: "https://developer.apple.com/documentation/swift/result", builtin: true },
      { lang: "kotlin", name: "Arrow Either", url: "https://arrow-kt.io/docs/apidocs/arrow-core/arrow.core/-either/" },
    ],
    caveats: {
      en: "Python returns library provides monadic Result; native Python has no built-in Result type. TypeScript has no native Result -neverthrow or manual discriminated unions. C# sample uses a manual Result record; consider CSharpFunctionalExtensions for production use.",
      ja: "Pythonのreturnsライブラリはモナド的Resultを提供。ネイティブPythonにはResult型がない。TypeScriptにもネイティブResultはなく、neverthrowまたは手動の判別共用体を使用。C#サンプルは手動Result record。本番にはCSharpFunctionalExtensionsも検討を。",
    },
    annotations: {
      elixir: [
        {
          match: "nil   -> {:error, :not_found}",
          title: { en: "Failure is returned as data", ja: "失敗もデータとして返す" },
          body: {
            en: "A missing user does not throw. The branch returns a tagged tuple that every caller can pattern-match on explicitly.",
            ja: "ユーザー未発見でも例外は投げず、タグ付きタプルを返す。呼び出し側はその形をそのままパターンマッチできる。",
          },
        },
        {
          match: "with {:ok, user}    <- fetch_user(user_id),",
          title: { en: "Happy path reads top to bottom", ja: "ハッピーパスが上から下へ読める" },
          body: {
            en: "Each `<-` step expects `{:ok, value}` and binds the value only on success. The chain stops automatically on the first non-matching result.",
            ja: "各 `<-` は `{:ok, value}` を期待し、成功時だけ値を束縛する。形が合わなければその時点で自動的に連鎖が止まる。",
          },
        },
        {
          match: "User.changeset(user, %{email: new_email})",
          title: { en: "Validation stays in the same data flow", ja: "バリデーションも同じデータフローに乗る" },
          body: {
            en: "Building the changeset and persisting it remain ordinary tuple-producing steps. Validation is not a hidden side channel.",
            ja: "changeset の生成と保存も、通常のタプルを返すステップとして連鎖に残る。検証が隠れた副経路にならない。",
          },
        },
        {
          match: "{:error, changeset}  -> {:error, format_errors(changeset)}",
          title: { en: "Errors can be normalized at the boundary", ja: "エラーは境界で正規化できる" },
          body: {
            en: "The raw failure shape from deeper layers is converted into a caller-friendly error right in the `else` branch, without exceptions or out-of-band control flow.",
            ja: "下位層の失敗形を `else` 側で呼び出し側向けのエラーへ変換できる。例外や別経路の制御フローは不要。",
          },
        },
      ],
    },
    snippets: {
      elixir: `def fetch_user(id) do
  case Repo.get(User, id) do
    nil   -> {:error, :not_found}
    user  -> {:ok, user}
  end
end

def update_email(user_id, new_email) do
  with {:ok, user}    <- fetch_user(user_id),
       {:ok, updated} <-
         User.changeset(user, %{email: new_email})
                         |> Repo.update() do
    {:ok, updated}
  else
    {:error, :not_found} -> {:error, "User not found"}
    {:error, changeset}  -> {:error, format_errors(changeset)}
  end
end`,

      python: `from dataclasses import dataclass
from returns.result import Failure, Result, Success

@dataclass(frozen=True, slots=True)
class NotFound:
    user_id: int

@dataclass(frozen=True, slots=True)
class UpdateFailed:
    message: str

type UpdateEmailError = NotFound | UpdateFailed

def fetch_user(user_id: int) -> Result[User, UpdateEmailError]:
    user = repo.get(user_id)
    return (
        Success(user)
        if user is not None
        else Failure(NotFound(user_id))
    )

def persist_email(
    user: User,
    new_email: str,
) -> Result[User, UpdateEmailError]:
    return repo.update(user, email=new_email).alt(UpdateFailed)

def update_email(
    user_id: int,
    new_email: str,
) -> Result[User, UpdateEmailError]:
    return fetch_user(user_id).bind(
        lambda user: persist_email(user, new_email)
    )`,

      typescript: `type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

type UpdateEmailError =
  | { type: "not_found"; userId: number }
  | { type: "update_failed"; message: string }

const fetchUser = (
  userId: number,
): Result<User, UpdateEmailError> => {
  const user = repo.get(userId)
  return user
    ? { ok: true, value: user }
    : { ok: false, error: { type: "not_found", userId } }
}

const persistEmail = (
  user: User,
  newEmail: string,
): Result<User, UpdateEmailError> => {
  const result = repo.update(user, { email: newEmail })
  return result.ok
    ? result
    : {
        ok: false,
        error: { type: "update_failed", message: result.error },
      }
}

const updateEmail = (
  userId: number,
  newEmail: string,
): Result<User, UpdateEmailError> => {
  const userResult = fetchUser(userId)
  if (!userResult.ok) return userResult

  return persistEmail(userResult.value, newEmail)
}`,

      typescript_effect: `import { Effect, Schema, ServiceMap } from "effect"

class NotFound extends Schema.TaggedErrorClass<NotFound>()(
  "NotFound",
  { userId: Schema.Number },
) {}

class UpdateFailed extends Schema.TaggedErrorClass<UpdateFailed>()(
  "UpdateFailed",
  { message: Schema.String },
) {}

class UserRepo extends ServiceMap.Service<UserRepo, {
  getById(userId: number): Effect.Effect<User | null>
  updateEmail(user: User, newEmail: string): Effect.Effect<User, string>
}>()("example/UserRepo") {}

const fetchUser = Effect.fn("fetchUser")(function*(userId: number) {
  const repo = yield* UserRepo
  const user = yield* repo.getById(userId)
  if (!user) {
    return yield* new NotFound({ userId })
  }
  return user
})

const persistEmail = Effect.fn("persistEmail")(function*(
  user: User,
  newEmail: string,
) {
  const repo = yield* UserRepo
  return yield* repo.updateEmail(user, newEmail).pipe(
    Effect.mapError((message) => new UpdateFailed({ message })),
  )
})

const updateEmail = (userId: number, newEmail: string) =>
  Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    return yield* persistEmail(user, newEmail)
  })

const program = updateEmail(42, "new@example.com").pipe(
  Effect.catchTags({
    NotFound: () => Effect.succeed(fallback),
  }),
)`,

      go: `import (
  "errors"
  "fmt"
)

var ErrNotFound = errors.New("user not found")

func fetchUser(userID int) (User, error) {
  user, ok := repo.Get(userID)
  if !ok {
    return User{}, ErrNotFound
  }
  return user, nil
}

func updateEmail(userID int, newEmail string) (User, error) {
  user, err := fetchUser(userID)
  if err != nil {
    return User{}, err
  }

  updated, err := repo.Update(user, newEmail)
  if err != nil {
    return User{}, fmt.Errorf("update email: %w", err)
  }
  return updated, nil
}

if _, err := updateEmail(
  42,
  "new@example.com",
); errors.Is(err, ErrNotFound) {
  log.Println("missing user")
}`,

      csharp: `using CSharpFunctionalExtensions;

public abstract record UpdateEmailError
{
    public sealed record NotFound(int UserId) : UpdateEmailError;
    public sealed record UpdateFailed(
        string Message
    ) : UpdateEmailError;
}

static Result<User, UpdateEmailError> FetchUser(
    int userId
) =>
    repo.Get(userId) is { } user
        ? Result.Success<User, UpdateEmailError>(user)
        : Result.Failure<User, UpdateEmailError>(
            new UpdateEmailError.NotFound(userId)
        );

static Result<User, UpdateEmailError> PersistEmail(
    User user,
    string newEmail
) =>
    repo.Update(user, newEmail)
        .MapError(
            message =>
                (UpdateEmailError)new UpdateEmailError
                    .UpdateFailed(message)
        );

static Result<User, UpdateEmailError> UpdateEmail(
    int userId,
    string newEmail
) =>
    FetchUser(userId).Bind(user => PersistEmail(user, newEmail));`,

      dart: `import 'package:fpdart/fpdart.dart';

sealed class UpdateEmailError {
  const UpdateEmailError();
}

final class NotFound extends UpdateEmailError {
  const NotFound(this.userId);
  final int userId;
}

final class UpdateFailed extends UpdateEmailError {
  const UpdateFailed(this.message);
  final String message;
}

Either<UpdateEmailError, User> fetchUser(int userId) =>
  Option.fromNullable(repo.get(userId))
      .toEither(() => NotFound(userId));

Either<UpdateEmailError, User> persistEmail(
  User user,
  String newEmail,
) =>
  repo.update(user, email: newEmail).mapLeft(UpdateFailed.new);

Either<UpdateEmailError, User> updateEmail(
  int userId,
  String newEmail,
) =>
  Either.Do((_) {
    final user = _(fetchUser(userId));
    return _(persistEmail(user, newEmail));
  });`,

      swift: `enum UpdateEmailError: Error {
  case notFound(userId: Int)
  case updateFailed(message: String)
}

func fetchUser(id: Int) -> Result<User, UpdateEmailError> {
  guard let user = repo.get(id) else {
    return .failure(.notFound(userId: id))
  }
  return .success(user)
}

func persistEmail(
  _ user: User,
  newEmail: String
) -> Result<User, UpdateEmailError> {
  repo.update(user, email: newEmail)
    .mapError { .updateFailed(message: $0.localizedDescription) }
}

func updateEmail(
  userId: Int,
  newEmail: String
) -> Result<User, UpdateEmailError> {
  fetchUser(id: userId).flatMap { user in
    persistEmail(user, newEmail: newEmail)
  }
}`,

      kotlin: `import arrow.core.Either
import arrow.core.mapLeft
import arrow.core.raise.either
import arrow.core.raise.ensureNotNull

sealed interface UpdateEmailError
data class NotFound(val userId: Int) : UpdateEmailError
data class UpdateFailed(val message: String) : UpdateEmailError

fun fetchUser(
  userId: Int
): Either<UpdateEmailError, User> = either {
  ensureNotNull(repo.get(userId)) { NotFound(userId) }
}

fun persistEmail(
  user: User,
  newEmail: String,
): Either<UpdateEmailError, User> =
  repo.update(user, email = newEmail).mapLeft(::UpdateFailed)

fun updateEmail(
  userId: Int,
  newEmail: String,
): Either<UpdateEmailError, User> = either {
  val user = fetchUser(userId).bind()
  persistEmail(user, newEmail).bind()
}`,
    },
  },

  /* ── 3. Immutability ── */
  {
    id: "immutability",
    title: { en: "Immutability Default", ja: "デフォルト不変性" },
    description: {
      en: "Referential transparency -once a binding is established, it never changes. This is the foundation of equational reasoning (Backus 1978) and eliminates entire categories of bugs: stale references, aliasing hazards, time-of-check/time-of-use races. For LLMs, immutability means every value is defined exactly where it appears -no tracing mutation history across scopes. The paper found that languages with immutable-by-default semantics produced significantly fewer stateful bugs in generated code, because the model never needs to reason about 'which version of X am I looking at?'",
      ja: "参照透過性 -一度束縛された値は決して変わらない。等式推論（Backus 1978）の基盤であり、古参照・エイリアシング・TOCTOU競合を丸ごと排除する。LLMにとって不変性は、すべての値がその出現箇所で定義されることを意味し、スコープをまたぐ変異履歴の追跡が不要となる。論文では、デフォルト不変の言語が生成コードにおいて有意にステートフルバグを減らすことを確認 -モデルが「今見ているXはどのバージョンか」を推論する必要がないため。",
    },
    importance: "high",
    icon: <Lock className="w-4 h-4" />,
    snippets: {
      elixir: `defmodule Counter do
  def increment(state) do
    next = state.count + 1

    %{
      state
      | count: next,
        history: state.history ++ [next]
    }
  end
end

state = %{count: 0, history: []}
next_state = Counter.increment(state)

state.count      # => 0
next_state.count # => 1`,

      python: `from dataclasses import dataclass, replace

@dataclass(frozen=True, slots=True)
class CounterState:
    count: int
    history: tuple[int, ...] = ()

def increment(state: CounterState) -> CounterState:
    next_count = state.count + 1
    return replace(
        state,
        count=next_count,
        history=(*state.history, next_count),
    )

state = CounterState(count=0)
next_state = increment(state)

state.count      # 0
next_state.count # 1`,

      typescript: `type CounterState = Readonly<{
  count: number
  history: ReadonlyArray<number>
}>

const increment = (state: CounterState): CounterState => {
  const nextCount = state.count + 1
  return {
    ...state,
    count: nextCount,
    history: [...state.history, nextCount],
  }
}

const state: CounterState = { count: 0, history: [] }
const nextState = increment(state)

state.count // 0
nextState.count // 1`,

      typescript_effect: `import { Schema } from "effect"

class CounterState extends Schema.Class<CounterState>(
  "CounterState",
)({
  count: Schema.Number,
  history: Schema.Array(Schema.Number),
}) {}

const increment = (state: CounterState): CounterState => {
  const nextCount = state.count + 1

  return new CounterState({
    ...state,
    count: nextCount,
    history: [...state.history, nextCount],
  })
}

const state = new CounterState({ count: 0, history: [] })
const nextState = increment(state)

state.count // 0
nextState.count // 1`,

      go: `import "slices"

type CounterState struct {
  Count   int
  History []int
}

func Increment(state CounterState) CounterState {
  nextCount := state.Count + 1
  history := slices.Clone(state.History)
  history = append(history, nextCount)

  return CounterState{
    Count:   nextCount,
    History: history,
  }
}

state := CounterState{Count: 0, History: []int{}}
nextState := Increment(state)

state.Count     // 0
nextState.Count // 1`,

      csharp: `using System.Collections.Immutable;

public sealed record CounterState(
    int Count,
    ImmutableArray<int> History
);

static CounterState Increment(CounterState state)
{
    var nextCount = state.Count + 1;

    return state with
    {
        Count = nextCount,
        History = state.History.Add(nextCount),
    };
}

var state = new CounterState(0, ImmutableArray<int>.Empty);
var nextState = Increment(state);

state.Count;     // 0
nextState.Count; // 1`,

      dart: `typedef CounterState = ({int count, List<int> history});

CounterState increment(CounterState state) {
  final nextCount = state.count + 1;

  return (
    count: nextCount,
    history: List<int>.unmodifiable([
      ...state.history,
      nextCount,
    ]),
  );
}

final state = (count: 0, history: List<int>.unmodifiable([]));
final nextState = increment(state);

state.count;     // 0
nextState.count; // 1`,

      swift: `struct CounterState {
    let count: Int
    let history: [Int]

    func increment() -> CounterState {
        let nextCount = count + 1
        return CounterState(
            count: nextCount,
            history: history + [nextCount]
        )
    }
}

let state = CounterState(count: 0, history: [])
let nextState = state.increment()

state.count      // 0
nextState.count  // 1`,

      kotlin: `data class CounterState(
    val count: Int,
    val history: List<Int> = emptyList(),
)

fun increment(state: CounterState): CounterState {
    val nextCount = state.count + 1
    return state.copy(
        count = nextCount,
        history = state.history + nextCount,
    )
}

val state = CounterState(count = 0)
val nextState = increment(state)

state.count      // 0
nextState.count  // 1`,
    },
    libraries: [
      { lang: "elixir", name: "Immutable by default (all data)", url: "https://hexdocs.pm/elixir/basic-types.html", builtin: true },
      { lang: "python", name: "dataclasses(frozen=True)", url: "https://docs.python.org/3/library/dataclasses.html#frozen-instances", builtin: true },
      { lang: "typescript", name: "Readonly<T> + as const", url: "https://www.typescriptlang.org/docs/handbook/2/objects.html#readonly-properties", builtin: true },
      { lang: "typescript_effect", name: "Schema.Class (v4 beta immutable data)", url: "https://effect.website/docs/data-types/data" },
      { lang: "go", name: "Value types (struct copy semantics)", url: "https://go.dev/doc/effective_go#allocation_new", builtin: true },
      { lang: "csharp", name: "record + with expression (C# 9+)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/record", builtin: true },
      { lang: "dart", name: "freezed code generation", url: "https://pub.dev/packages/freezed" },
      { lang: "swift", name: "struct (value type) + let bindings", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/", builtin: true },
      { lang: "kotlin", name: "data class + copy()", url: "https://kotlinlang.org/docs/data-classes.html#copying", builtin: true },
    ],
    caveats: {
      en: "Elixir, Erlang, and Haskell are truly immutable by default -all others require opt-in. Python frozen dataclasses are shallow-frozen only. TypeScript Readonly is a compile-time check only (no runtime enforcement). Go struct copies are shallow -nested pointers still alias. Dart requires codegen (freezed) for deep immutability. Swift structs are value types but classes are reference types.",
      ja: "Elixir・Erlang・Haskellのみが真のデフォルト不変 -他はすべてオプトイン。Pythonのfrozen dataclassは浅いフリーズのみ。TypeScriptのReadonlyはコンパイル時チェックのみ（実行時は未保証）。Goの構造体コピーは浅く、ネストしたポインタはエイリアスする。Dartは深い不変性にコード生成（freezed）が必要。Swiftのstructは値型だがclassは参照型。",
    },
    annotations: {
      elixir: [
        {
          match: "next = state.count + 1",
          title: { en: "You derive a new value, not mutate the old one", ja: "既存値を変更せず、新しい値を導く" },
          body: {
            en: "The next count is computed into a fresh binding. `state.count` itself never changes anywhere in the function.",
            ja: "次の値は新しい束縛 `next` に計算される。`state.count` 自体は関数内のどこでも書き換わらない。",
          },
        },
        {
          match: "| count: next,",
          title: { en: "Struct/map update copies with one field changed", ja: "マップ更新は差分だけ変えた新しい値を作る" },
          body: {
            en: "The `%{state | ...}` form reuses the old map shape while producing a new value. It reads like “same state, except these fields”.",
            ja: "`%{state | ...}` は元のマップ形を保ちながら新しい値を返す。「同じ state だが、この項目だけ違う」と読める。",
          },
        },
        {
          match: "history: state.history ++ [next]",
          title: { en: "Collection growth is explicit data construction", ja: "コレクション更新も明示的なデータ構築" },
          body: {
            en: "Appending history creates the next list in place of mutating a hidden buffer. The new state shows exactly where the extra item came from.",
            ja: "履歴追加も隠れたバッファ更新ではなく、新しいリストを明示的に組み立てる。追加要素の出所がコード上で見える。",
          },
        },
        {
          match: "state.count      # => 0",
          title: { en: "The old value remains valid after the call", ja: "呼び出し後も元の値はそのまま有効" },
          body: {
            en: "The example proves immutability directly: after `Counter.increment(state)`, the original `state` still reports `0`.",
            ja: "この例は不変性をそのまま示している。`Counter.increment(state)` の後でも元の `state` は `0` のまま。",
          },
        },
      ],
    },
  },

  /* ── 4. Pipe Operator ── */
  {
    id: "pipe-operator",
    title: { en: "Pipe Operator & Data Pipelines", ja: "パイプ演算子とデータパイプライン" },
    description: {
      en: "Pipeline composition expresses data transformation as a linear sequence -the dual of deeply nested function calls. In CS terms, this is function composition (f ∘ g ∘ h) made human-readable. The paper found pipeline style correlates with lower prediction entropy: each step is context-independent, so the model only needs local understanding. Below: Elixir's native |>, method chaining in OOP ecosystems, Effect's pipe() (since TC39 pipe is still Stage 2), and explicit staging in Go.",
      ja: "パイプライン合成はデータ変換を線形シーケンスで表現する -深くネストした関数呼び出しの双対。CS的には関数合成(f ∘ g ∘ h)の人間可読版。論文ではパイプラインスタイルが予測エントロピー低下と相関：各ステップがコンテキスト独立で、モデルはローカルな理解だけで予測できる。以下：Elixirのネイティブ|>、OOPでのメソッドチェーン、EffectのTC39 Stage 2待ちpipe()、Goの明示的ステージング。",
    },
    importance: "high",
    icon: <Layers className="w-4 h-4" />,
    libraries: [
      { lang: "python", name: "toolz pipe()", url: "https://toolz.readthedocs.io/en/latest/api.html#toolz.functoolz.pipe" },
      { lang: "typescript", name: "Array method chains", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#instance_methods", builtin: true },
      { lang: "typescript_effect", name: "pipe()", url: "https://effect.website/docs/getting-started/the-pipe-function" },
      { lang: "go", name: "Explicit variables (idiomatic)", url: "https://go.dev/doc/effective_go#named-results", builtin: true },
      { lang: "csharp", name: "LINQ method chains", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/", builtin: true },
      { lang: "dart", name: "Cascade (..) notation", url: "https://dart.dev/language/operators#cascade-notation", builtin: true },
      { lang: "swift", name: "Method chaining", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/methods/", builtin: true },
      { lang: "kotlin", name: "let / run scope functions", url: "https://kotlinlang.org/docs/scope-functions.html", builtin: true },
    ],
    caveats: {
      en: "TC39 Pipe Operator (|>) proposal is at Stage 2 -current Node/Bun/Deno do not ship it natively. Effect's pipe() is the recommended workaround for TypeScript. Python's toolz.pipe() is a third-party utility; most Python code uses method chaining or intermediate variables.",
      ja: "TC39パイプ演算子(|>)提案はStage 2 -現行のNode/Bun/Denoはネイティブ未実装。Effectのpipe()がTypeScriptの推奨回避策。Pythonのtoolz.pipe()はサードパーティ。多くのPythonコードはメソッドチェーンまたは中間変数を使用。",
    },
    annotations: {
      elixir: [
        {
          match: "|> Enum.filter(&(&1.status == :completed))",
          title: { en: "Each pipe step names one transformation", ja: "各パイプが変換を一段ずつ示す" },
          body: {
            en: "Filtering completed orders is its own line and its own operation. You do not have to mentally unwrap nested calls to find the first stage.",
            ja: "完了注文の抽出が1行1操作として独立している。ネストをほどいて最初の処理を探す必要がない。",
          },
        },
        {
          match: "|> Enum.map(& &1.total)",
          title: { en: "Shape changes stay visible in sequence", ja: "データの形の変化が順番に見える" },
          body: {
            en: "After filtering orders, the pipeline projects them down to totals. The reader can track the data shape one small step at a time.",
            ja: "注文を絞った後、そのまま total の列へ写像している。データ形の変化を小さな段階ごとに追える。",
          },
        },
        {
          match: "|> then(&(&1 * 1.1))",
          title: { en: "Ad hoc math still fits the pipeline", ja: "一時的な計算もパイプの中に収まる" },
          body: {
            en: "When no named function exists, `then/2` inserts a tiny anonymous step without breaking the left-to-right flow.",
            ja: "専用関数がなくても `then/2` で小さな匿名処理を差し込める。左から右の流れは崩れない。",
          },
        },
        {
          match: "|> String.replace(~r/[^a-z0-9\\\\s]/, \"\")",
          title: { en: "The same pattern scales to text pipelines", ja: "同じ形を文字列処理にもそのまま使える" },
          body: {
            en: "The second example shows the exact same grammar applied to strings: trim, lowercase, clean, split, join. The visual pattern stays stable across domains.",
            ja: "2つ目の例では同じ文法が文字列処理にもそのまま使われる。trim, lowercase, clean, split, join と視覚パターンが変わらない。",
          },
        },
      ],
    },
    snippets: {
      elixir: `# Elixir: read top-to-bottom, each step is obvious
orders
|> Enum.filter(&(&1.status == :completed))
|> Enum.map(& &1.total)
|> Enum.sum()
|> then(&(&1 * 1.1))       # add 10% tax
|> Float.round(2)
|> IO.inspect(label: "Revenue")

# More complex pipeline
"  Hello, World!  "
|> String.trim()
|> String.downcase()
|> String.replace(~r/[^a-z0-9\\s]/, "")
|> String.split()
|> Enum.join("-")
# => "hello-world"`,

      python: `import re
from operator import attrgetter
from toolz.curried import filter, map, pipe

revenue = pipe(
    orders,
    filter(lambda o: o.status == "completed"),
    map(attrgetter("total")),
    sum,
    lambda total: round(total * 1.1, 2),
)
print(f"Revenue: {revenue}")

# More complex pipeline
result = pipe(
    "  Hello, World!  ",
    str.strip,
    str.lower,
    lambda s: re.sub(r"[^a-z0-9\\s]", "", s),
    str.split,
    "-".join,
)
# => "hello-world"`,

      typescript: `import { filter, map, pipe } from "remeda"

// Runs today in Node/Bun. Native |> is still a proposal.
const revenue = pipe(
  orders,
  filter((o) => o.status === "completed"),
  map((o) => o.total),
  (totals) => totals.reduce((sum, total) => sum + total, 0),
  (sum) => Math.round(sum * 1.1 * 100) / 100,
)
console.log(\`Revenue: \${revenue}\`)

// More complex pipeline
const result = pipe(
  "  Hello, World!  ",
  (s) => s.trim(),
  (s) => s.toLowerCase(),
  (s) => s.replace(/[^a-z0-9\\s]/g, ""),
  (s) => s.split(/\\s+/),
  (parts) => parts.join("-"),
)
// => "hello-world"`,

      typescript_effect: `import { Array, String, pipe } from "effect"

// Effect's pipe() is the idiomatic today-runnable choice.
const revenue = pipe(
  orders,
  Array.filter((o) => o.status === "completed"),
  Array.map((o) => o.total),
  Array.reduce(0, (sum, total) => sum + total),
  (sum) => Math.round(sum * 1.1 * 100) / 100
)
console.log(\`Revenue: \${revenue}\`)

// More complex pipeline
const result = pipe(
  "  Hello, World!  ",
  String.trim,
  String.toLowerCase,
  (s) => s.replace(/[^a-z0-9\\s]/g, ""),
  String.split(/\\s+/),
  Array.join("-")
)`,

      go: `import (
    "fmt"
    "math"
    "regexp"
    "strings"
)

var total float64
for _, order := range orders {
    if order.Status == "completed" {
        total += order.Total
    }
}
revenue := math.Round(total*1.1*100) / 100
fmt.Printf("Revenue: %.2f\\n", revenue)

slugSource := strings.TrimSpace("  Hello, World!  ")
slugSource = strings.ToLower(slugSource)
slugSource = regexp.MustCompile(
  \`[^a-z0-9\\s]\`,
).ReplaceAllString(slugSource, "")
result := strings.Join(strings.Fields(slugSource), "-")
// => "hello-world"`,

      csharp: `using System.Linq;
using System.Text.RegularExpressions;

var revenue = Math.Round(
    orders
        .Where(o => o.Status == "completed")
        .Select(o => o.Total)
        .Sum() * 1.1,
    2
);
Console.WriteLine($"Revenue: {revenue}");

// More complex pipeline
var result = string.Join(
    "-",
    Regex
        .Replace(
            "  Hello, World!  ".Trim().ToLowerInvariant(),
            @"[^a-z0-9\\s]",
            ""
        )
        .Split(' ', StringSplitOptions.RemoveEmptyEntries)
);
// => "hello-world"`,

      dart: `final revenue = (
  orders
      .where((o) => o.status == OrderStatus.completed)
      .map((o) => o.total)
      .fold<double>(0, (sum, total) => sum + total) *
  1.1
).toStringAsFixed(2);
print('Revenue: \$revenue');

// More complex pipeline
final result = '  Hello, World!  '
    .trim()
    .toLowerCase()
    .replaceAll(RegExp(r'[^a-z0-9\\s]'), '')
    .split(RegExp(r'\\s+'))
    .join('-');
// => "hello-world"`,

      swift: `import Foundation

let revenue = (
    orders
        .filter { $0.status == .completed }
        .map(\\.total)
        .reduce(0, +) * 1.1 * 100
).rounded() / 100
print("Revenue: \\(revenue)")

let cleaned = String(
    "  Hello, World!  "
        .trimmingCharacters(in: .whitespacesAndNewlines)
        .lowercased()
        .filter { $0.isLetter || $0.isNumber || $0.isWhitespace }
)
let result = cleaned
    .split(whereSeparator: \\.isWhitespace)
    .joined(separator: "-")
// => "hello-world"`,

      kotlin: `import kotlin.math.round

val revenue = orders
    .asSequence()
    .filter { it.status == Status.COMPLETED }
    .sumOf { it.total }
    .let { round(it * 1.1 * 100) / 100 }
    .also { println("Revenue: $it") }

// More complex pipeline
val result = "  Hello, World!  "
    .trim()
    .lowercase()
    .replace(Regex("[^a-z0-9\\\\s]"), "")
    .split(Regex("\\\\s+"))
    .joinToString("-")
// => "hello-world"`,
    },
  },

  /* ── 5. Formatter Uniformity ── */
  {
    id: "formatter-uniformity",
    title: { en: "Formatter Uniformity", ja: "フォーマッタ統一" },
    description: {
      en: "A canonical, zero-config formatter collapses surface-level entropy to near zero. In information-theoretic terms (Shannon 1948), if all projects look identical after formatting, the model spends zero predictive capacity on style and allocates 100% to semantics. Elixir ships mix format built-in -formatting is not a choice but a property of the ecosystem. The paper observed that consistent formatting across training data significantly reduces token-level perplexity, meaning the LLM wastes fewer parameters modeling whitespace, brace placement, and import ordering. Below: each language's current best opinionated formatter.",
      ja: "標準のゼロコンフィグフォーマッタが表面レベルのエントロピーをほぼゼロに圧縮する。情報理論（Shannon 1948）の観点では、全プロジェクトがフォーマット後に同一に見えれば、モデルはスタイルに予測容量をゼロ消費し、100%をセマンティクスに割り当てる。Elixirはmix formatを組み込みで提供 -フォーマットは選択ではなくエコシステムの性質。論文では、訓練データ全体の一貫したフォーマットがトークンレベルのパープレキシティを有意に低下させ、LLMが空白・括弧配置・import順序のモデリングに浪費するパラメータが減ることを確認。",
    },
    importance: "high",
    icon: <Paintbrush className="w-4 h-4" />,
    snippets: {
      elixir: `# Canonical built-in formatter: mix format
def build_user(name, email, admin?) do
  %{
    name: String.trim(name),
    email: email |> String.trim() |> String.downcase(),
    admin?: admin?,
    tags: ["active", if(admin?, do: "staff", else: "member")]
  }
end`,

      python: `# Fast modern formatter: ruff format
def build_user(
    name: str,
    email: str,
    is_admin: bool,
) -> dict[str, object]:
    return {
        "name": name.strip(),
        "email": email.strip().lower(),
        "is_admin": is_admin,
        "tags": ["active", "staff" if is_admin else "member"],
    }`,

      typescript: `// High-performance formatter: oxfmt
type User = {
  name: string
  email: string
  isAdmin: boolean
  tags: ReadonlyArray<string>
}

const buildUser = (
  name: string,
  email: string,
  isAdmin: boolean,
): User => ({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  isAdmin,
  tags: ["active", isAdmin ? "staff" : "member"],
})`,

      typescript_effect: `// High-performance formatter: oxfmt
import { Schema, String, pipe } from "effect"

class User extends Schema.Class<User>("User")({
  name: Schema.String,
  email: Schema.String,
  isAdmin: Schema.Boolean,
  tags: Schema.Array(Schema.String),
}) {}

const buildUser = (
  name: string,
  email: string,
  isAdmin: boolean,
): User =>
  new User({
    name: pipe(name, String.trim),
    email: pipe(email, String.trim, String.toLowerCase),
    isAdmin,
    tags: ["active", isAdmin ? "staff" : "member"],
  })`,

      go: `// Stricter drop-in formatter: gofumpt -w .
import "strings"

type User struct {
  Name  string
  Email string
  Admin bool
  Tags  []string
}

func BuildUser(name, email string, admin bool) User {
  tag := "member"
  if admin {
    tag = "staff"
  }

  return User{
    Name:  strings.TrimSpace(name),
    Email: strings.ToLower(strings.TrimSpace(email)),
    Admin: admin,
    Tags:  []string{"active", tag},
  }
}`,

      csharp: `// Opinionated formatter: csharpier format .
using System.Collections.Generic;

public sealed record User(
    string Name,
    string Email,
    bool IsAdmin,
    IReadOnlyList<string> Tags
);

static User BuildUser(string name, string email, bool isAdmin) =>
    new(
        name.Trim(),
        email.Trim().ToLowerInvariant(),
        isAdmin,
        ["active", isAdmin ? "staff" : "member"]
    );`,

      dart: `// Built-in formatter: dart format .
typedef User = ({
  String name,
  String email,
  bool isAdmin,
  List<String> tags,
});

User buildUser(String name, String email, bool isAdmin) => (
  name: name.trim(),
  email: email.trim().toLowerCase(),
  isAdmin: isAdmin,
  tags: ['active', isAdmin ? 'staff' : 'member'],
);`,

      swift: `// Official formatter technology: swift-format format -ir Sources
struct User {
    let name: String
    let email: String
    let isAdmin: Bool
    let tags: [String]
}

func buildUser(
    name: String,
    email: String,
    isAdmin: Bool
) -> User {
    User(
        name: name.trimmingCharacters(
            in: .whitespacesAndNewlines
        ),
        email: email
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .lowercased(),
        isAdmin: isAdmin,
        tags: ["active", isAdmin ? "staff" : "member"]
    )
}`,

      kotlin: `// Opinionated formatter: ktfmt --kotlinlang-style
data class User(
    val name: String,
    val email: String,
    val isAdmin: Boolean,
    val tags: List<String>,
)

fun buildUser(
    name: String,
    email: String,
    isAdmin: Boolean,
): User =
    User(
        name = name.trim(),
        email = email.trim().lowercase(),
        isAdmin = isAdmin,
        tags = listOf(
            "active",
            if (isAdmin) "staff" else "member",
        ),
    )`,
    },
    libraries: [
      { lang: "elixir", name: "mix format (built-in)", url: "https://hexdocs.pm/mix/Mix.Tasks.Format.html", builtin: true },
      { lang: "python", name: "ruff format", url: "https://docs.astral.sh/ruff/formatter/" },
      { lang: "typescript", name: "oxfmt (Oxc project)", url: "https://oxc.rs/docs/guide/usage/formatter" },
      { lang: "typescript_effect", name: "oxfmt (Oxc project)", url: "https://oxc.rs/docs/guide/usage/formatter" },
      { lang: "go", name: "gofumpt (stricter gofmt)", url: "https://github.com/mvdan/gofumpt" },
      { lang: "csharp", name: "CSharpier", url: "https://csharpier.com/" },
      { lang: "dart", name: "dart format (built-in)", url: "https://dart.dev/tools/dart-format", builtin: true },
      { lang: "swift", name: "swift-format", url: "https://github.com/swiftlang/swift-format" },
      { lang: "kotlin", name: "ktfmt", url: "https://github.com/facebook/ktfmt" },
    ],
    caveats: {
      en: "Only Elixir (mix format), Go (gofmt), and Dart (dart format) ship built-in formatters with zero config. Python migrated from Black to the faster Ruff. TypeScript ecosystem is shifting from Prettier to Rust-native oxfmt (Oxc). Go's gofumpt adds stricter rules on top of gofmt. Swift-format is official but not bundled with the compiler. Kotlin has multiple competing formatters (ktfmt, ktlint, IntelliJ built-in).",
      ja: "Elixir（mix format）・Go（gofmt）・Dart（dart format）のみがゼロコンフィグの組み込みフォーマッタを提供。PythonはBlackからより高速なRuffに移行中。TypeScriptエコシステムはPrettierからRustネイティブのoxfmt（Oxc）へシフト中。Goのgofumptはgofmtの上により厳密なルールを追加。swift-formatは公式だがコンパイラには同梱されず。Kotlinには複数の競合フォーマッタ（ktfmt, ktlint, IntelliJ組み込み）がある。",
    },
    annotations: {
      elixir: [
        {
          match: "mix format",
          title: { en: "Formatting is part of the language workflow", ja: "フォーマットが言語ワークフローに組み込まれている" },
          body: {
            en: "Elixir’s canonical formatter ships with the toolchain. Teams do not need to negotiate style before they can share code that looks familiar.",
            ja: "Elixir の標準フォーマッタはツールチェーン同梱。見慣れた形のコードを共有する前に、チームでスタイル交渉する必要がない。",
          },
        },
        {
          match: "%{",
          title: { en: "Composite literals get one predictable layout", ja: "複合リテラルの配置が一貫する" },
          body: {
            en: "The map opens into a standard multiline shape with aligned fields. Readers learn one house style and see it everywhere.",
            ja: "マップは標準的な複数行レイアウトに展開され、項目配置も揃う。読む側は1つの様式を覚えればよい。",
          },
        },
        {
          match: "email: email |> String.trim() |> String.downcase(),",
          title: { en: "Even dense expressions keep a normalized form", ja: "密な式でも正規化された形を保つ" },
          body: {
            en: "A short pipeline stays inline here because it still fits the formatter’s rules. The shape is decided mechanically, not by personal taste.",
            ja: "この短いパイプラインはフォーマッタ規則に従ってインラインのまま保たれる。見た目は好みではなく機械的に決まる。",
          },
        },
        {
          match: "tags: [\"active\", if(admin?, do: \"staff\", else: \"member\")]",
          title: { en: "Inline conditionals are rendered consistently too", ja: "インライン条件式も同じく一貫して整形される" },
          body: {
            en: "The formatter preserves the compact `if(..., do:, else:)` idiom in a stable way. Special forms do not create style divergence across projects.",
            ja: "コンパクトな `if(..., do:, else:)` も安定した形で整形される。特殊フォームがプロジェクトごとの見た目差を生みにくい。",
          },
        },
      ],
    },
  },

  /* ── 6. Happy Path Chaining ── */
  {
    id: "with-statement",
    title: { en: "Happy Path Chaining & Short-Circuiting", ja: "ハッピーパスの連鎖とショートサーキット" },
    description: {
      en: "Monadic composition (>>= / bind) sequences fallible operations so that the first failure short-circuits the entire chain -no nested if-checks required. In CS terms, this is the Either monad applied to real workflow orchestration. The paper found that multi-step pipelines with explicit error propagation produce dramatically higher pass rates: LLMs generate each step as an independent unit, and the short-circuit semantics are trivially predictable. Below: Elixir with/else, Python returns.do, TypeScript early returns, Effect generators, and each language's idiomatic chaining.",
      ja: "モナド合成（>>= / bind）が失敗可能な操作を順序立て、最初の失敗でチェーン全体をショートサーキットする -ネストしたif文不要。CS的にはEitherモナドを実ワークフローオーケストレーションに適用したもの。論文では、明示的エラー伝播を伴う多段パイプラインが劇的に高いPass率を生むことを発見：LLMは各ステップを独立ユニットとして生成し、ショートサーキットセマンティクスは自明に予測可能。",
    },
    importance: "high",
    icon: <Sparkles className="w-4 h-4" />,
    libraries: [
      { lang: "elixir", name: "with/else special form", url: "https://hexdocs.pm/elixir/Kernel.SpecialForms.html#with/1", builtin: true },
      { lang: "python", name: "returns Result.do", url: "https://returns.readthedocs.io/en/latest/pages/railway.html" },
      { lang: "typescript", name: "neverthrow andThen()", url: "https://github.com/supermacro/neverthrow#chaining" },
      { lang: "typescript_effect", name: "Effect.gen + Schema.TaggedErrorClass (v4 beta)", url: "https://effect.website/docs/getting-started/using-generators" },
      { lang: "go", name: "Sequential if err != nil", url: "https://go.dev/blog/error-handling-and-go", builtin: true },
      { lang: "csharp", name: "CSharpFunctionalExtensions Bind", url: "https://github.com/vkhorikov/CSharpFunctionalExtensions" },
      { lang: "dart", name: "fpdart flatMap", url: "https://pub.dev/packages/fpdart" },
      { lang: "swift", name: "Result flatMap", url: "https://developer.apple.com/documentation/swift/result/flatmap(_:)", builtin: true },
      { lang: "kotlin", name: "Arrow either { } / bind()", url: "https://arrow-kt.io/docs/apidocs/arrow-core/arrow.core/-either/" },
    ],
    caveats: {
      en: "Python returns.do requires dry-python/returns ≥ 0.22. TypeScript lacks native monadic chaining -manual early returns or neverthrow .andThen() chains are the standard workaround. Effect.gen uses generators to simulate do-notation.",
      ja: "Python returns.doにはdry-python/returns ≥ 0.22が必要。TypeScriptにはネイティブのモナド連鎖がなく、手動の早期returnまたはneverthrow .andThen()チェーンが標準的な回避策。Effect.genはジェネレータでdo記法をシミュレートする。",
    },
    annotations: {
      elixir: [
        {
          match: "with {:ok, user}     <- authenticate(token),",
          title: { en: "The workflow declares its success contract up front", ja: "成功条件を最初に宣言している" },
          body: {
            en: "Each line says “continue only if this step returns `{:ok, ...}`”. The happy path is encoded structurally, not implied by convention.",
            ja: "各行が「このステップが `{:ok, ...}` を返した時だけ続行」と宣言している。成功経路が慣習ではなく構造として表現される。",
          },
        },
        {
          match: "{:ok, payment}  <- charge_card(user, items),",
          title: { en: "Later steps can use earlier bindings directly", ja: "後続ステップは前段の束縛をそのまま使える" },
          body: {
            en: "By the time payment runs, `user` and `items` are already guaranteed-good values. No extra null checks or success flags clutter the call.",
            ja: "payment の時点では `user` と `items` はすでに成功確定済み。追加の null チェックや成功フラグは不要。",
          },
        },
        {
          match: "send_confirmation(user, order)",
          title: { en: "Side effects happen only after the full chain succeeds", ja: "副作用は全工程成功後にだけ実行される" },
          body: {
            en: "Confirmation sits inside the `do` block after every fallible step. That makes its preconditions obvious at a glance.",
            ja: "確認送信は、失敗しうる全ステップの後に `do` ブロック内で実行される。前提条件が一目で分かる。",
          },
        },
        {
          match: "else",
          title: { en: "All failure exits are centralized", ja: "失敗出口が1か所に集約される" },
          body: {
            en: "The `else` block is the single place where non-matching results are translated into user-facing errors. Recovery logic does not leak into the happy path.",
            ja: "`else` は不一致結果をユーザー向けエラーへ変換する唯一の場所。回復ロジックがハッピーパス側へ漏れない。",
          },
        },
      ],
    },
    snippets: {
      elixir: `def create_order(%{token: token, items: raw_items}) do
  with {:ok, user}     <- authenticate(token),
       {:ok, items}    <- validate_items(raw_items),
       {:ok, payment}  <- charge_card(user, items),
       {:ok, order}    <- save_order(user, items, payment) do
    send_confirmation(user, order)
    {:ok, order}
  else
    {:error, :unauthorized} -> {:error, "Please log in"}
    {:error, :invalid_items} -> {:error, "Invalid cart"}
    {:error, :payment_failed} -> {:error, "Payment declined"}
    {:error, reason} -> {:error, "Order failed: \#{reason}"}
  end
end`,

      python: `from dataclasses import dataclass
from returns.result import Result

@dataclass(frozen=True, slots=True)
class Unauthorized: pass

@dataclass(frozen=True, slots=True)
class InvalidItems: pass

@dataclass(frozen=True, slots=True)
class PaymentFailed: pass

@dataclass(frozen=True, slots=True)
class OrderFailed:
    message: str

type CreateOrderError = (
    Unauthorized
    | InvalidItems
    | PaymentFailed
    | OrderFailed
)

def confirm(user: User, order: Order) -> Order:
    send_confirmation(user, order)
    return order

def create_order(
    params: OrderParams,
) -> Result[Order, CreateOrderError]:
    return Result.do(
        confirm(user, order)
        for user in authenticate(params.token).alt(
            lambda _: Unauthorized()
        )
        for items in validate_items(params.items).alt(
            lambda _: InvalidItems()
        )
        for payment in charge_card(user, items).alt(
            lambda _: PaymentFailed()
        )
        for order in save_order(user, items, payment).alt(
            lambda message: OrderFailed(message)
        )
    )`,

      typescript: `type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

type CreateOrderError =
  | { type: "unauthorized" }
  | { type: "invalid_items" }
  | { type: "payment_failed" }
  | { type: "order_failed"; message: string }

const createOrder = (
  params: OrderParams,
): Result<Order, CreateOrderError> => {
  const userResult = authenticate(params.token)
  if (!userResult.ok) {
    return { ok: false, error: { type: "unauthorized" } }
  }

  const itemsResult = validateItems(params.items)
  if (!itemsResult.ok) {
    return { ok: false, error: { type: "invalid_items" } }
  }

  const paymentResult = chargeCard(
    userResult.value,
    itemsResult.value,
  )
  if (!paymentResult.ok) {
    return { ok: false, error: { type: "payment_failed" } }
  }

  const orderResult = saveOrder(
    userResult.value,
    itemsResult.value,
    paymentResult.value,
  )
  if (!orderResult.ok) {
    return {
      ok: false,
      error: {
        type: "order_failed",
        message: orderResult.error,
      },
    }
  }

  sendConfirmation(userResult.value, orderResult.value)
  return orderResult
}`,

      typescript_effect: `import { Effect, Schema } from "effect"

class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {},
) {}

class InvalidItems extends Schema.TaggedErrorClass<InvalidItems>()(
  "InvalidItems",
  {},
) {}

class PaymentFailed extends Schema.TaggedErrorClass<PaymentFailed>()(
  "PaymentFailed",
  {},
) {}

class OrderFailed extends Schema.TaggedErrorClass<OrderFailed>()(
  "OrderFailed",
  { message: Schema.String },
) {}

const createOrder = Effect.fn("createOrder")(function*(params: OrderParams) {
  const user = yield* authenticate(params.token).pipe(
    Effect.orElseFail(() => new Unauthorized({})),
  )
  const items = yield* validateItems(params.items).pipe(
    Effect.orElseFail(() => new InvalidItems({})),
  )
  const payment = yield* chargeCard(user, items).pipe(
    Effect.orElseFail(() => new PaymentFailed({})),
  )
  const order = yield* saveOrder(user, items, payment).pipe(
    Effect.mapError((message) => new OrderFailed({ message })),
  )

  yield* sendConfirmation(user, order)
  return order
})`,

      go: `import (
  "errors"
  "fmt"
)

var (
  ErrUnauthorized = errors.New("please log in")
  ErrInvalidItems = errors.New("invalid cart")
  ErrPaymentFailed = errors.New("payment declined")
)

func createOrder(params OrderParams) (Order, error) {
  user, err := authenticate(params.Token)
  if err != nil {
    return Order{}, ErrUnauthorized
  }

  items, err := validateItems(params.Items)
  if err != nil {
    return Order{}, ErrInvalidItems
  }

  payment, err := chargeCard(user, items)
  if err != nil {
    return Order{}, ErrPaymentFailed
  }

  order, err := saveOrder(user, items, payment)
  if err != nil {
    return Order{}, fmt.Errorf("order failed: %w", err)
  }

  sendConfirmation(user, order)
  return order, nil
}`,

      csharp: `using CSharpFunctionalExtensions;

public abstract record CreateOrderError
{
    public sealed record Unauthorized : CreateOrderError;
    public sealed record InvalidItems : CreateOrderError;
    public sealed record PaymentFailed : CreateOrderError;
    public sealed record OrderFailed(
        string Message
    ) : CreateOrderError;
}

Result<Order, CreateOrderError> CreateOrder(
    OrderParams params
) =>
    Authenticate(params.Token)
        .MapError(
            _ =>
                (CreateOrderError)new CreateOrderError
                    .Unauthorized()
        )
        .Bind(
            user => ValidateItems(params.Items)
                .MapError(
                    _ =>
                        (CreateOrderError)new CreateOrderError
                            .InvalidItems()
                )
                .Bind(
                    items => ChargeCard(user, items)
                        .MapError(
                            _ =>
                                (CreateOrderError)new
                                    CreateOrderError.PaymentFailed()
                        )
                        .Bind(
                            payment =>
                                SaveOrder(user, items, payment)
                                .MapError(
                                    message =>
                                        (CreateOrderError)new
                                            CreateOrderError.OrderFailed(
                                                message
                                            )
                                )
                                .Tap(
                                    order =>
                                        SendConfirmation(
                                            user,
                                            order
                                        )
                                )
                        )
                )
        );`,

      dart: `import 'package:fpdart/fpdart.dart';

sealed class CreateOrderError {
  const CreateOrderError();
}

final class Unauthorized extends CreateOrderError {
  const Unauthorized();
}

final class InvalidItems extends CreateOrderError {
  const InvalidItems();
}

final class PaymentFailed extends CreateOrderError {
  const PaymentFailed();
}

final class OrderFailed extends CreateOrderError {
  const OrderFailed(this.message);
  final String message;
}

TaskEither<CreateOrderError, Order> createOrder(
  OrderParams params,
) =>
  TaskEither.Do((_) async {
    final user = await _(
      authenticate(params.token).mapLeft(
        (_) => const Unauthorized(),
      ),
    );
    final items = await _(
      validateItems(params.items).mapLeft(
        (_) => const InvalidItems(),
      ),
    );
    final payment = await _(
      chargeCard(user, items).mapLeft(
        (_) => const PaymentFailed(),
      ),
    );
    final order = await _(
      saveOrder(user, items, payment).mapLeft(
        (message) => OrderFailed(message),
      ),
    );

    sendConfirmation(user, order);
    return order;
  });`,

      swift: `enum CreateOrderError: Error {
  case unauthorized
  case invalidItems
  case paymentFailed
  case orderFailed(String)
}

func createOrder(
  _ params: OrderParams
) throws(CreateOrderError) -> Order {
  let user = try authenticate(params.token)
    .mapError { _ in .unauthorized }
    .get()

  let items = try validateItems(params.items)
    .mapError { _ in .invalidItems }
    .get()

  let payment = try chargeCard(user, items)
    .mapError { _ in .paymentFailed }
    .get()

  let order = try saveOrder(user, items, payment)
    .mapError { .orderFailed($0.localizedDescription) }
    .get()

  sendConfirmation(user, order)
  return order
}`,

      kotlin: `import arrow.core.Either
import arrow.core.raise.either
import arrow.core.raise.withError

sealed interface CreateOrderError
data object Unauthorized : CreateOrderError
data object InvalidItems : CreateOrderError
data object PaymentFailed : CreateOrderError
data class OrderFailed(val message: String) : CreateOrderError

fun createOrder(
  params: OrderParams,
): Either<CreateOrderError, Order> = either {
  val user = withError({ Unauthorized }) {
    authenticate(params.token).bind()
  }
  val items = withError({ InvalidItems }) {
    validateItems(params.items).bind()
  }
  val payment = withError({ PaymentFailed }) {
    chargeCard(user, items).bind()
  }
  val order = withError(::OrderFailed) {
    saveOrder(user, items, payment).bind()
  }

  sendConfirmation(user, order)
  order
}`,
    },
  },

  /* ── 5. GenServer / Concurrency ── */
  {
    id: "concurrency",
    title: { en: "Concurrency & State", ja: "並行処理と状態管理" },
    description: {
      en: "The actor model isolates mutable state inside a single-owner process that communicates only via message passing -no shared memory, no locks, no races by construction. In CS terms, this is Hewitt's actor model (1973) realized as a language primitive. The paper found this was the hardest domain across all languages: Elixir's GenServer scored 75% on hard concurrency tasks while most others dropped below 35%. The gap exists because GenServer's callback structure (init/handle_call/handle_cast) is a rigid, well-documented template that LLMs can fill in, whereas ad-hoc threading requires reasoning about non-local state mutations.",
      ja: "アクターモデルは可変状態を単一オーナープロセス内に隔離し、メッセージパッシングのみで通信する -共有メモリなし、ロックなし、構造的に競合なし。CS的にはHewittのアクターモデル（1973）を言語プリミティブとして実現したもの。論文ではこれが全言語で最も困難な領域であることを発見：Elixir GenServerは難しい並行処理タスクで75%を記録した一方、他のほとんどの言語は35%以下に低下。GenServerのコールバック構造（init/handle_call/handle_cast）が厳格で十分に文書化されたテンプレートでありLLMが穴埋めできるのに対し、アドホックなスレッディングは非局所的な状態変異の推論を必要とするためである。",
    },
    importance: "critical",
    icon: <Cpu className="w-4 h-4" />,
    libraries: [
      { lang: "elixir", name: "GenServer (OTP)", url: "https://hexdocs.pm/elixir/GenServer.html", builtin: true },
      { lang: "python", name: "asyncio.Queue + Task", url: "https://docs.python.org/3/library/asyncio-queue.html", builtin: true },
      { lang: "typescript", name: "Worker Threads", url: "https://nodejs.org/api/worker_threads.html", builtin: true },
      { lang: "typescript_effect", name: "Mailbox + Stream + Deferred", url: "https://effect.website/docs/concurrency/fibers" },
      { lang: "go", name: "goroutine + channel", url: "https://go.dev/doc/effective_go#goroutines", builtin: true },
      { lang: "csharp", name: "Channel<T> + Task", url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/channels", builtin: true },
      { lang: "dart", name: "Isolate + SendPort", url: "https://dart.dev/language/concurrency", builtin: true },
      { lang: "swift", name: "actor (Swift 5.5+)", url: "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/#Actors", builtin: true },
      { lang: "kotlin", name: "Coroutines Channel", url: "https://kotlinlang.org/docs/channels.html" },
    ],
    caveats: {
      en: "Swift actors (5.5+) are the closest mainstream equivalent to GenServer -both enforce single-owner isolation. Go channels are lightweight but require manual select/done patterns. Python asyncio is single-threaded cooperative; true parallelism needs multiprocessing. Dart Isolates cannot share memory -communication is always via message ports.",
      ja: "Swiftのactor（5.5+）がGenServerに最も近い主流の等価物 -両者とも単一オーナー隔離を強制。Goチャネルは軽量だが手動のselect/doneパターンが必要。Python asyncioはシングルスレッド協調型で、真の並列性にはmultiprocessingが必要。Dart Isolateはメモリ共有不可 -通信は常にメッセージポート経由。",
    },
    annotations: {
      elixir: [
        {
          match: "use GenServer",
          title: { en: "The concurrency model is a named runtime primitive", ja: "並行モデルが名前付きのランタイム原語になっている" },
          body: {
            en: "This is not a custom thread pattern. `GenServer` tells you immediately that the module follows a standard OTP process template with well-known callbacks.",
            ja: "これは独自スレッド設計ではなく、標準OTPプロセステンプレートだと `GenServer` だけで分かる。コールバックも既知の形になる。",
          },
        },
        {
          match: "def increment, do: GenServer.call(__MODULE__, :increment)",
          title: { en: "The public API is just message sending", ja: "公開APIはメッセージ送信に薄く対応する" },
          body: {
            en: "Client functions stay tiny because they only package requests. State access is never performed directly by outside callers.",
            ja: "クライアント関数は要求を包むだけなので短い。外部呼び出し側が状態へ直接触ることはない。",
          },
        },
        {
          match: "def handle_call(:increment, _from, count),",
          title: { en: "State transitions live in explicit callbacks", ja: "状態遷移は明示的なコールバックに閉じ込められる" },
          body: {
            en: "All logic for the `:increment` message is concentrated in the matching callback head. You can inspect one clause to understand one message.",
            ja: "`:increment` に対するロジックが、このコールバックヘッドに集中している。1つのメッセージを理解するのに1つの節を読めばよい。",
          },
        },
        {
          match: "{:reply, count + 1, count + 1}",
          title: { en: "Reply and next state are returned together", ja: "返信値と次状態を同時に返す" },
          body: {
            en: "The tuple spells out the protocol: what the caller gets back, and what state the server should keep. Mutation is made explicit as data.",
            ja: "このタプルがプロトコルをそのまま示す。呼び出し側への返信と、サーバが保持すべき次状態が明示される。",
          },
        },
      ],
    },
    snippets: {
      elixir: `defmodule Counter do
  use GenServer

  # Client API
  def start_link(initial \\\\ 0) do
    GenServer.start_link(__MODULE__, initial, name: __MODULE__)
  end

  def increment, do: GenServer.call(__MODULE__, :increment)
  def get,       do: GenServer.call(__MODULE__, :get)

  # Server callbacks  - explicit message handling
  @impl true
  def init(initial), do: {:ok, initial}

  @impl true
  def handle_call(:increment, _from, count),
    do: {:reply, count + 1, count + 1}

  @impl true
  def handle_call(:get, _from, count),
    do: {:reply, count, count}
end

# Usage: fully concurrent, no locks needed
{:ok, _} = Counter.start_link(0)
Counter.increment() # => 1
Counter.increment() # => 2
Counter.get()       # => 2`,

      python: `import asyncio
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Increment:
    reply: asyncio.Future[int]

@dataclass(frozen=True, slots=True)
class Get:
    reply: asyncio.Future[int]

type Command = Increment | Get

class Counter:
    def __init__(self, initial: int = 0):
        self._mailbox: asyncio.Queue[Command] = asyncio.Queue()
        self._task = asyncio.create_task(self._run(initial))

    async def _run(self, count: int) -> None:
        while True:
            command = await self._mailbox.get()
            match command:
                case Increment(reply):
                    count += 1
                    reply.set_result(count)
                case Get(reply):
                    reply.set_result(count)

    async def increment(self) -> int:
        reply = asyncio.get_running_loop().create_future()
        await self._mailbox.put(Increment(reply))
        return await reply

    async def get(self) -> int:
        reply = asyncio.get_running_loop().create_future()
        await self._mailbox.put(Get(reply))
        return await reply

counter = Counter(0)
await counter.increment()  # => 1
await counter.increment()  # => 2
await counter.get()        # => 2`,

      typescript: `import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads"

type Command =
  | { type: "increment"; id: number }
  | { type: "get"; id: number }

type Reply = { id: number; value: number }

if (!isMainThread) {
  let count = workerData as number

  parentPort!.on("message", (command: Command) => {
    switch (command.type) {
      case "increment":
        count += 1
        parentPort!.postMessage(
          { id: command.id, value: count } satisfies Reply,
        )
        break
      case "get":
        parentPort!.postMessage(
          { id: command.id, value: count } satisfies Reply,
        )
        break
    }
  })
}

class Counter {
  #worker: Worker
  #nextId = 0
  #pending = new Map<number, (value: number) => void>()

  constructor(initial = 0) {
    this.#worker = new Worker(
      new URL(import.meta.url),
      { workerData: initial },
    )
    this.#worker.on("message", ({ id, value }: Reply) => {
      this.#pending.get(id)?.(value)
      this.#pending.delete(id)
    })
  }

  #ask(type: Command["type"]): Promise<number> {
    const id = this.#nextId++
    const { promise, resolve } = Promise.withResolvers<number>()
    this.#pending.set(id, resolve)
    this.#worker.postMessage({ type, id } satisfies Command)
    return promise
  }

  increment(): Promise<number> {
    return this.#ask("increment")
  }

  get(): Promise<number> {
    return this.#ask("get")
  }
}

const counter = new Counter(0)
await counter.increment() // 1
await counter.increment() // 2
await counter.get() // 2`,

      typescript_effect: `import { Deferred, Effect, Mailbox, Match, Stream } from "effect"

type Command =
  | { readonly _tag: "Increment"; readonly reply: Deferred.Deferred<number> }
  | { readonly _tag: "Get"; readonly reply: Deferred.Deferred<number> }

const makeCounter = (initial = 0) =>
  Effect.scoped(
    Effect.gen(function* () {
      const mailbox = yield* Mailbox.make<Command>()

      yield* Effect.addFinalizer(() => mailbox.end)

      yield* Mailbox.toStream(mailbox).pipe(
        Stream.runFoldEffect(initial, (count, command) =>
          Match.value(command).pipe(
            Match.tag("Increment", ({ reply }) => {
              const next = count + 1
              return Deferred.succeed(reply, next).pipe(Effect.as(next))
            }),
            Match.tag("Get", ({ reply }) =>
              Deferred.succeed(reply, count).pipe(Effect.as(count))),
            Match.exhaustive,
          ),
        ),
        Effect.forkScoped,
      )

      const ask = (build: (reply: Deferred.Deferred<number>) => Command) =>
        Effect.gen(function* () {
          const reply = yield* Deferred.make<number>()
          yield* mailbox.offer(build(reply))
          return yield* Deferred.await(reply)
        })

      return {
        increment: ask((reply) => ({ _tag: "Increment", reply })),
        get: ask((reply) => ({ _tag: "Get", reply })),
      } as const
    }),
  )

const program = Effect.gen(function* () {
  const counter = yield* makeCounter(0)
  yield* counter.increment // => 1
  yield* counter.increment // => 2
  return yield* counter.get // => 2
})`,

      go: `type command interface{ isCommand() }

type increment struct{ reply chan int }
func (increment) isCommand() {}

type get struct{ reply chan int }
func (get) isCommand() {}

type Counter struct {
  mailbox chan command
}

func NewCounter(initial int) *Counter {
  mailbox := make(chan command)

  go func() {
    count := initial
    for command := range mailbox {
      switch msg := command.(type) {
      case increment:
        count++
        msg.reply <- count
      case get:
        msg.reply <- count
      }
    }
  }()

  return &Counter{mailbox: mailbox}
}

func (c *Counter) Increment() int {
  reply := make(chan int)
  c.mailbox <- increment{reply: reply}
  return <-reply
}

func (c *Counter) Get() int {
  reply := make(chan int)
  c.mailbox <- get{reply: reply}
  return <-reply
}

counter := NewCounter(0)
counter.Increment() // => 1
counter.Increment() // => 2
counter.Get()       // => 2`,

      csharp: `using System.Threading.Channels;

abstract record Command;
sealed record Increment(TaskCompletionSource<int> Reply) : Command;
sealed record Get(TaskCompletionSource<int> Reply) : Command;

sealed class Counter
{
    private readonly Channel<Command> _mailbox = Channel.CreateUnbounded<Command>();

    public Counter(int initial = 0)
    {
        _ = Run(initial);
    }

    private async Task Run(int count)
    {
        await foreach (var command in _mailbox.Reader.ReadAllAsync())
        {
            switch (command)
            {
                case Increment(var reply):
                    reply.SetResult(++count);
                    break;
                case Get(var reply):
                    reply.SetResult(count);
                    break;
            }
        }
    }

    public async ValueTask<int> IncrementAsync()
    {
        var reply = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
        await _mailbox.Writer.WriteAsync(new Increment(reply));
        return await reply.Task;
    }

    public async ValueTask<int> GetAsync()
    {
        var reply = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
        await _mailbox.Writer.WriteAsync(new Get(reply));
        return await reply.Task;
    }
}

var counter = new Counter(0);
await counter.IncrementAsync(); // => 1
await counter.IncrementAsync(); // => 2
await counter.GetAsync();       // => 2`,

      dart: `import 'dart:isolate';

sealed class CounterCommand {
  const CounterCommand(this.replyTo);
  final SendPort replyTo;
}

final class Increment extends CounterCommand {
  const Increment(super.replyTo);
}

final class Get extends CounterCommand {
  const Get(super.replyTo);
}

Future<SendPort> startCounter([int initial = 0]) async {
  final ready = ReceivePort();
  await Isolate.spawn(_counterLoop, (initial, ready.sendPort));
  return await ready.first as SendPort;
}

void _counterLoop((int, SendPort) args) {
  final (initial, readyTo) = args;
  var count = initial;
  final mailbox = ReceivePort();
  readyTo.send(mailbox.sendPort);

  mailbox.listen((message) {
    switch (message) {
      case Increment(replyTo: final replyTo):
        count += 1;
        replyTo.send(count);
      case Get(replyTo: final replyTo):
        replyTo.send(count);
    }
  });
}

Future<int> increment(SendPort counter) async {
  final reply = ReceivePort();
  counter.send(Increment(reply.sendPort));
  final value = await reply.first as int;
  reply.close();
  return value;
}

Future<int> get(SendPort counter) async {
  final reply = ReceivePort();
  counter.send(Get(reply.sendPort));
  final value = await reply.first as int;
  reply.close();
  return value;
}

final counter = await startCounter(0);
await increment(counter); // => 1
await increment(counter); // => 2
await get(counter);       // => 2`,

      swift: `// Swift: actor keyword (closest to GenServer)
actor Counter {
  private var count: Int

  init(initial: Int = 0) {
    self.count = initial
  }

  func increment() -> Int {
    count += 1
    return count
  }

  func get() -> Int {
    return count
  }
}

// Usage: automatically thread-safe
let counter = Counter(initial: 0)
await counter.increment()  // => 1
await counter.increment()  // => 2
await counter.get()        // => 2`,

      kotlin: `import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

sealed interface Command
data class Increment(val reply: CompletableDeferred<Int>) : Command
data class Get(val reply: CompletableDeferred<Int>) : Command

class Counter(scope: CoroutineScope, initial: Int = 0) {
    private val mailbox = Channel<Command>(Channel.UNLIMITED)

    init {
        scope.launch {
            var count = initial
            for (command in mailbox) {
                when (command) {
                    is Increment -> command.reply.complete(++count)
                    is Get -> command.reply.complete(count)
                }
            }
        }
    }

    suspend fun increment(): Int {
        val reply = CompletableDeferred<Int>()
        mailbox.send(Increment(reply))
        return reply.await()
    }

    suspend fun get(): Int {
        val reply = CompletableDeferred<Int>()
        mailbox.send(Get(reply))
        return reply.await()
    }
}

coroutineScope {
    val counter = Counter(this, 0)
    counter.increment() // => 1
    counter.increment() // => 2
    counter.get()       // => 2
}`,
    },
  },

  /* ── 6. Doctests ── */
  {
    id: "doctests",
    title: { en: "Executable Documentation", ja: "実行可能なドキュメント" },
    description: {
      en: "Literate programming -embedding runnable examples directly inside function documentation so that spec, test, and docs are a single artifact. Elixir's @doc + doctest runs examples as part of the test suite via ExUnit, creating verified input/output pairs co-located with the function definition. The paper found this uniquely beneficial for LLMs: when the training data contains thousands of functions with inline I/O examples, the model learns to treat documentation as executable specification rather than prose. Languages without native doctests approximate this through test-sourced documentation (DocFX, KDoc @sample, DocC @Snippet) -correct but less tightly co-located.",
      ja: "リテラルプログラミング -実行可能な例を関数ドキュメント内に直接埋め込み、仕様・テスト・ドキュメントを単一の成果物とする。Elixirの@doc + doctestはExUnitを介してテストスイートの一部として例を実行し、関数定義の隣に検証済みの入出力ペアを生成する。論文ではこれがLLMに特に有益であることを発見：訓練データにインラインI/O例付きの関数が何千も含まれると、モデルはドキュメントを散文ではなく実行可能な仕様として学習する。ネイティブdoctestを持たない言語はテストソース型ドキュメント（DocFX、KDoc @sample、DocC @Snippet）で近似する -正確だが共配置の緊密さは劣る。",
    },
    importance: "high",
    icon: <BookOpen className="w-4 h-4" />,
    diagram: (isJa: boolean) => <DocPipelineDiagram isJa={isJa} />,
    libraries: [
      { lang: "elixir", name: "ExUnit doctest", url: "https://hexdocs.pm/ex_unit/ExUnit.DocTest.html", builtin: true },
      { lang: "python", name: "doctest module", url: "https://docs.python.org/3/library/doctest.html", builtin: true },
      { lang: "typescript", name: "tsdoc + Vitest", url: "https://tsdoc.org/" },
      { lang: "typescript_effect", name: "@effect/vitest + JSDoc @example", url: "https://github.com/Effect-TS/effect/tree/main/packages/vitest" },
      { lang: "go", name: "Example functions (_test.go)", url: "https://go.dev/blog/examples", builtin: true },
      { lang: "csharp", name: "DocFX code snippets", url: "https://dotnet.github.io/docfx/" },
      { lang: "dart", name: "dartdoc_test", url: "https://pub.dev/packages/dartdoc_test" },
      { lang: "swift", name: "DocC @Snippet (Xcode 14+)", url: "https://developer.apple.com/documentation/docc" },
      { lang: "kotlin", name: "KDoc @sample", url: "https://kotlinlang.org/docs/kotlin-doc.html#sample-identifier" },
    ],
    caveats: {
      en: "Only Elixir, Python, Go, and Rust have truly native doctests that run as part of the standard test suite. TypeScript/JavaScript has no built-in doctest -various third-party tools exist but none are standard. Dart's dartdoc_test is a community package, not built-in. Swift DocC @Snippet compiles but doesn't assert return values. C# DocFX pulls source from test files -correct but indirect.",
      ja: "真にネイティブなdoctestを標準テストスイートの一部として実行できるのはElixir、Python、Go、Rustのみ。TypeScript/JavaScriptにはビルトインdoctestがなく、サードパーティツールが存在するが標準ではない。Dartのdartdoc_testはコミュニティパッケージ。Swift DocC @Snippetはコンパイルするが戻り値をアサートしない。C# DocFXはテストファイルからソースを取り込む -正確だが間接的。",
    },
    annotations: {
      elixir: [
        {
          match: "@doc \"\"\"",
          title: { en: "Examples live inside the official docs", ja: "公式ドキュメントの中に実例が入る" },
          body: {
            en: "The primary documentation block is also where executable examples are written. Spec and example are co-located with the function.",
            ja: "実行例は主要なドキュメントブロックの中に書かれる。仕様と例が関数の隣に共配置される。",
          },
        },
        {
          match: "iex> Math.safe_add(1, 2)",
          title: { en: "The docs show exact I/O, not vague prose", ja: "散文ではなく具体的な入出力を示す" },
          body: {
            en: "An `iex>` example captures the function call exactly as a reader would try it. The expected result is right below it.",
            ja: "`iex>` 例は、読者がそのまま試す呼び出し形を示す。期待結果も直下に並ぶ。",
          },
        },
        {
          match: "@spec safe_add(integer(), integer()) ::",
          title: { en: "Type-level contract and doc examples reinforce each other", ja: "型契約とドキュメント例が相互補強する" },
          body: {
            en: "The `@spec` says the allowed result shapes, and the doctest demonstrates concrete instances of those shapes.",
            ja: "`@spec` が許される結果形を示し、doctest がその具体例を示す。抽象契約と具体例が一致する。",
          },
        },
        {
          match: "doctest Math",
          title: { en: "One line turns the docs into test cases", ja: "1行でドキュメントがテストになる" },
          body: {
            en: "This test declaration imports the examples from the docs and executes them under ExUnit. The examples are not decorative; they are enforced.",
            ja: "この宣言がドキュメント例を ExUnit テストとして取り込み、実行する。例は飾りではなく検証対象になる。",
          },
        },
      ],
    },
    snippets: {
      elixir: `# Native executable docs: ExUnit runs @doc examples via doctest.
defmodule Math do
  @doc """
  Safely adds two integers.

  ## Examples

      iex> Math.safe_add(1, 2)
      {:ok, 3}

      iex> Math.safe_add(9_999_999_999, 1)
      {:error, :overflow}
  """
  @spec safe_add(integer(), integer()) ::
          {:ok, integer()} | {:error, :overflow}
  def safe_add(a, b) when is_integer(a) and is_integer(b) do
    result = a + b
    if abs(result) > 9_999_999_999,
      do: {:error, :overflow},
      else: {:ok, result}
  end
end

# math_test.exs
defmodule MathTest do
  use ExUnit.Case, async: true

  doctest Math
end

# Run: mix test`,

      python: `# Native executable docs: doctest runs these examples directly.
from typing import Literal

type SafeAddResult = (
    tuple[Literal["ok"], int]
    | tuple[Literal["error"], Literal["overflow"]]
)

def safe_add(a: int, b: int) -> SafeAddResult:
    """Safely adds two integers.

    >>> safe_add(1, 2)
    ('ok', 3)
    >>> safe_add(9_999_999_999, 1)
    ('error', 'overflow')
    """
    result = a + b
    if abs(result) > 9_999_999_999:
        return ("error", "overflow")
    return ("ok", result)

# Run: pytest --doctest-modules
# Or: python -m doctest -v math.py`,

      typescript: `// Tooling-based executable docs:
// doc-vitest turns @example blocks into Vitest tests.

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * Safely adds two integers.
 *
 * @example
 * \`\`\`ts @import.meta.vitest
 * expect(safeAdd(1, 2)).toEqual({ ok: true, value: 3 })
 * expect(safeAdd(9_999_999_999, 1)).toEqual(
 *   { ok: false, error: "overflow" },
 * )
 * \`\`\`
 */
export const safeAdd = (
  a: number,
  b: number,
): Result<number, "overflow"> => {
  const result = a + b
  return Math.abs(result) > 9_999_999_999
    ? { ok: false, error: "overflow" }
    : { ok: true, value: result }
}

// vitest.config.ts -> plugins: [doctest()], test: {
//   globals: true,
//   setupFiles: ["./vitest.setup.ts"],
//   includeSource: ["src/**/*.ts"],
// }`,

      typescript_effect: `// Tooling-based executable docs:
// doc-vitest runs the example; @effect/vitest fits the real test files.
import { Effect, Exit, Schema } from "effect"

class Overflow extends Schema.TaggedErrorClass<Overflow>()(
  "Overflow",
  {},
) {}

/**
 * Safely adds two integers.
 *
 * @example
 * \`\`\`ts @import.meta.vitest
 * const ok = await Effect.runPromiseExit(safeAdd(1, 2))
 * expect(ok).toStrictEqual(Exit.succeed(3))
 *
 * const overflow = await Effect.runPromiseExit(safeAdd(9_999_999_999, 1))
 * expect(Exit.isFailure(overflow)).toBe(true)
 * \`\`\`
 */
const safeAdd = Effect.fn("safeAdd")(function*(a: number, b: number) {
  const result = a + b
  if (Math.abs(result) > 9_999_999_999) {
    return yield* new Overflow({})
  }
  return result
})

// math.test.ts
// import { expect, it } from "@effect/vitest"
// it.effect("safeAdd docs stay honest", () =>
//   Effect.gen(function* () {
//     expect(yield* safeAdd(1, 2)).toBe(3)
//   }))`,

      go: `// Native executable docs:
// Example... functions run under go test.
package math

import (
  "errors"
  "fmt"
)

var ErrOverflow = errors.New("overflow")

// SafeAdd safely adds two integers.
func SafeAdd(a, b int64) (int64, error) {
  result := a + b
  if result > 9_999_999_999 || result < -9_999_999_999 {
    return 0, ErrOverflow
  }
  return result, nil
}

func ExampleSafeAdd() {
  result, _ := SafeAdd(1, 2)
  fmt.Println(result)
  // Output: 3
}

func ExampleSafeAdd_overflow() {
  _, err := SafeAdd(9_999_999_999, 1)
  fmt.Println(err)
  // Output: overflow
}`,

      csharp: `// Source-backed docs:
// DocFX publishes snippets from real tested files.
using System;
using Xunit;

public readonly record struct Result<T>(
    bool Ok,
    T Value,
    string? Error
);

public static Result<long> SafeAdd(long a, long b)
{
    var result = a + b;
    return Math.Abs(result) > 9_999_999_999
        ? new(false, 0, "overflow")
        : new(true, result, null);
}

// docs/articles/safe-add.md
// [!code-csharp[](../../tests/MathExamples.cs#safe-add)]

public sealed class MathExamples
{
    [Fact]
    public void SafeAdd_docs()
    {
#region safe-add
        Assert.Equal(
            new Result<long>(true, 3, null),
            SafeAdd(1, 2)
        );
        Assert.Equal(
            new Result<long>(false, 0, "overflow"),
            SafeAdd(9_999_999_999, 1)
        );
#endregion
    }
}`,

      dart: `// Checked doc examples:
// dartdoc_test validates examples under dart test.
import 'package:dartdoc_test/dartdoc_test.dart';

/// Safely adds two integers.
///
/// \`\`\`dart
/// safeAdd(1, 2);  // => Ok(3)
/// safeAdd(9_999_999_999, 1);  // => Err('overflow')
/// \`\`\`
Result<int> safeAdd(int a, int b) {
  final result = a + b;
  if (result.abs() > 9999999999) return Err('overflow');
  return Ok(result);
}

// test/dartdoc_test.dart
void main() {
  runDartdocTest();
}`,

      swift: `// Source-backed docs:
// DocC publishes snippets from real files, not inline doctests.
// Documentation.docc/SafeAdd.md
// @Snippet(path: "SafeAddSnippet")

// Snippets/SafeAddSnippet.swift
import MathKit

let ok = safeAdd(1, 2)
let overflow = safeAdd(9_999_999_999, 1)

print(ok)        // .success(3)
print(overflow)  // .failure(.overflow)

// DocC publishes the example from this real file in Snippets/`,

      kotlin: `// Source-backed docs:
// KDoc @sample pulls in real sample functions.
sealed interface AddResult {
    data class Ok(val value: Long) : AddResult
    data object Overflow : AddResult
}

/**
 * Safely adds two integers.
 *
 * @sample Samples.safeAddOk
 * @sample Samples.safeAddOverflow
 */
fun safeAdd(a: Long, b: Long): AddResult {
    val result = a + b
    return if (kotlin.math.abs(result) > 9_999_999_999L)
        AddResult.Overflow
    else
        AddResult.Ok(result)
}

object Samples {
    fun safeAddOk() {
        check(safeAdd(1, 2) == AddResult.Ok(3))
    }

    fun safeAddOverflow() {
        check(safeAdd(9_999_999_999, 1) == AddResult.Overflow)
    }
}`,
    },
  },

  /* ── 7. Comprehensions with Filters ── */
  {
    id: "comprehensions",
    title: { en: "Comprehensions & Generators", ja: "内包表記とジェネレータ" },
    description: {
      en: "List comprehensions are set-builder notation (∀x ∈ S, P(x) → f(x)) made executable -a declarative way to express map/filter/flatMap in a single construct. For LLMs, comprehensions are highly predictable because the entire transformation is specified in one syntactic unit with no hidden control flow. Elixir's for comprehension with <- generators, pattern-match filters, and :into collectors follows the same structure as mathematical set notation. Languages without native comprehensions approximate this through method chains (.map/.filter/.flatMap), LINQ query syntax, or sequence/yield builders.",
      ja: "リスト内包表記は集合構成記法（∀x ∈ S, P(x) → f(x)）を実行可能にしたもの -map/filter/flatMapを単一構文で宣言的に表現する方法。LLMにとって内包表記は非常に予測しやすい：変換全体が隠れた制御フローのない単一の構文単位で指定されるため。Elixirのfor内包表記は<-ジェネレータ、パターンマッチフィルタ、:intoコレクタで数学的集合記法と同じ構造に従う。ネイティブ内包表記を持たない言語はメソッドチェーン（.map/.filter/.flatMap）、LINQクエリ構文、sequence/yieldビルダで近似する。",
    },
    importance: "medium",
    icon: <FlaskConical className="w-4 h-4" />,
    libraries: [
      { lang: "elixir", name: "for comprehension", url: "https://hexdocs.pm/elixir/comprehensions.html", builtin: true },
      { lang: "python", name: "List/dict/set comprehensions", url: "https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions", builtin: true },
      { lang: "typescript", name: "Array .map/.filter/.flatMap", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#instance_methods", builtin: true },
      { lang: "typescript_effect", name: "Array.Do + Stream + Schema", url: "https://effect.website/docs/data-types/stream" },
      { lang: "go", name: "iter.Seq + slices package (Go 1.23+)", url: "https://pkg.go.dev/iter", builtin: true },
      { lang: "csharp", name: "LINQ query expressions", url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/get-started/query-expression-basics", builtin: true },
      { lang: "dart", name: "Collection-for + sync* generators", url: "https://dart.dev/language/collections#control-flow-operators", builtin: true },
      { lang: "swift", name: "lazy + compactMap chains", url: "https://developer.apple.com/documentation/swift/lazysequenceprotocol", builtin: true },
      { lang: "kotlin", name: "sequence { yield() } builder", url: "https://kotlinlang.org/docs/sequences.html#construct", builtin: true },
    ],
    caveats: {
      en: "Go lacked iterator protocol until 1.23 (iter.Seq). Dart collection-for (Dart 2.3+) is the closest to comprehension syntax. TypeScript has no comprehension syntax -method chains are idiomatic. C# LINQ from/where/select is syntactic sugar over .Select/.Where extension methods. Kotlin sequence builders use coroutines internally.",
      ja: "Goは1.23（iter.Seq）まで反復子プロトコルを欠いていた。Dartのcollection-for（Dart 2.3+）が内包表記構文に最も近い。TypeScriptには内包表記構文がなく、メソッドチェーンが慣用的。C# LINQのfrom/where/selectは.Select/.Where拡張メソッドのシンタックスシュガー。Kotlinのsequenceビルダは内部でコルーチンを使用する。",
    },
    annotations: {
      elixir: [
        {
          match: "for x <- 1..10,",
          title: { en: "Generators declare the input domains inline", ja: "ジェネレータが入力範囲をその場で宣言する" },
          body: {
            en: "The comprehension starts by saying where `x` and `y` come from. Iteration source and result construction live in one syntactic unit.",
            ja: "内包表記は `x` と `y` の出所を最初に宣言する。反復元と結果構築が1つの構文単位に収まる。",
          },
        },
        {
          match: "rem(x * y, 3) == 0",
          title: { en: "Filters sit next to the generators they constrain", ja: "フィルタが対象ジェネレータのすぐ横に置かれる" },
          body: {
            en: "Instead of a nested `if`, the predicate appears directly inside the comprehension header. Selection rules stay local and declarative.",
            ja: "入れ子の `if` ではなく、条件が内包表記ヘッダ内に直接書かれる。選別ルールがローカルで宣言的になる。",
          },
        },
        {
          match: "[name, score_text] = String.split(line, \",\", parts: 2),",
          title: { en: "Pattern matching can filter and destructure mid-stream", ja: "途中でパターンマッチによる分解と絞り込みができる" },
          body: {
            en: "This line both asserts the split shape and binds its pieces. Inputs that do not match are discarded automatically from the comprehension.",
            ja: "この行は分割結果の形を確認しつつ、要素を束縛する。形が合わない入力は内包表記から自動的に落ちる。",
          },
        },
        {
          match: "%{name: String.trim(name), score: score, grade: \"A\"}",
          title: { en: "The output expression is the final line of the construct", ja: "出力形が構文の最後に明示される" },
          body: {
            en: "After generators and filters, the body says exactly what each kept item becomes. Input selection and output shape are visually adjacent.",
            ja: "ジェネレータとフィルタの後に、採用された各要素が何になるかを最後の式で示す。入力条件と出力形が近接して見える。",
          },
        },
      ],
    },
    snippets: {
      elixir: `lines = ["Alice,88", "Bob,72", "Carol,91"]

pairs =
  for x <- 1..10,
      y <- 1..10,
      x + y > 12,
      rem(x * y, 3) == 0 do
    {x, y}
  end

honor_roll =
  for line <- lines,
      [name, score_text] = String.split(line, ",", parts: 2),
      {score, ""} = Integer.parse(String.trim(score_text)),
      score > 80 do
    %{name: String.trim(name), score: score, grade: "A"}
  end`,

      python: `from dataclasses import dataclass
from typing import Iterable, Iterator, Literal

lines = ["Alice,88", "Bob,72", "Carol,91"]

type Pair = tuple[int, int]

@dataclass(frozen=True, slots=True)
class HonorRollEntry:
    name: str
    score: int
    grade: Literal["A"] = "A"

pairs: list[Pair] = [
    (x, y)
    for x in range(1, 11)
    for y in range(1, 11)
    if x + y > 12 and (x * y) % 3 == 0
]

def honor_roll(lines: Iterable[str]) -> Iterator[HonorRollEntry]:
    for line in lines:
        name, score_text = line.split(",", maxsplit=1)
        if (score := int(score_text.strip())) > 80:
            yield HonorRollEntry(name=name.strip(), score=score)

results = list(honor_roll(lines))`,

      typescript: `type Pair = readonly [x: number, y: number]
type HonorRollEntry = {
  name: string
  score: number
  grade: "A"
}

const lines = ["Alice,88", "Bob,72", "Carol,91"]

function* matchingPairs(): Generator<Pair> {
  for (let x = 1; x <= 10; x++) {
    for (let y = 1; y <= 10; y++) {
      if (x + y > 12 && (x * y) % 3 === 0) {
        yield [x, y] as const
      }
    }
  }
}

function* honorRoll(
  lines: Iterable<string>,
): Generator<HonorRollEntry> {
  for (const line of lines) {
    const [name, scoreText] = line.split(",", 2)
    const score = Number.parseInt(scoreText.trim(), 10)

    if (score > 80) {
      yield { name: name.trim(), score, grade: "A" }
    }
  }
}

const pairs = [...matchingPairs()]
const results = [...honorRoll(lines)]`,

      typescript_effect: `import { Array, Schema, Stream, pipe } from "effect"

type Pair = readonly [x: number, y: number]

class HonorRollEntry extends Schema.Class<HonorRollEntry>(
  "HonorRollEntry",
)({
  name: Schema.String,
  score: Schema.Number,
  grade: Schema.Literal("A"),
}) {}

const ParsedEntry = Schema.Struct({
  name: Schema.String,
  score: Schema.NumberFromString,
})

const decodeEntry = Schema.decodeUnknownSync(ParsedEntry)

const lines = ["Alice,88", "Bob,72", "Carol,91"]

const pairs: ReadonlyArray<Pair> = pipe(
  Array.Do,
  Array.bind("x", () => Array.range(1, 10)),
  Array.bind("y", () => Array.range(1, 10)),
  Array.filter(({ x, y }) => x + y > 12 && (x * y) % 3 === 0),
  Array.map(({ x, y }) => [x, y] as const),
)

const honorRoll = (lines: Iterable<string>) =>
  Stream.fromIterable(lines).pipe(
    Stream.map((line) => {
      const [name, scoreText] = line.split(",", 2)
      return decodeEntry({
        name: name.trim(),
        score: scoreText.trim(),
      })
    }),
    Stream.filter(({ score }) => score > 80),
    Stream.map(
      ({ name, score }) => new HonorRollEntry({
        name,
        score,
        grade: "A",
      }),
    ),
  )

const program = Stream.runCollect(honorRoll(lines))`,

      go: `import (
  "iter"
  "slices"
  "strconv"
  "strings"
)

type Pair = [2]int

type HonorRollEntry struct {
  Name  string
  Score int
  Grade string
}

func MatchingPairs() iter.Seq[Pair] {
  return func(yield func(Pair) bool) {
    for x := 1; x <= 10; x++ {
      for y := 1; y <= 10; y++ {
        if x+y > 12 && (x*y)%3 == 0 {
          if !yield(Pair{x, y}) {
            return
          }
        }
      }
    }
  }
}

func HonorRoll(lines []string) iter.Seq[HonorRollEntry] {
  return func(yield func(HonorRollEntry) bool) {
    for _, line := range lines {
      name, scoreText, found := strings.Cut(line, ",")
      if !found {
        continue
      }
      score, err := strconv.Atoi(strings.TrimSpace(scoreText))
      if err == nil && score > 80 {
        if !yield(HonorRollEntry{
          Name:  strings.TrimSpace(name),
          Score: score,
          Grade: "A",
        }) {
          return
        }
      }
    }
  }
}

lines := []string{"Alice,88", "Bob,72", "Carol,91"}
pairs := slices.Collect(MatchingPairs())
results := slices.Collect(HonorRoll(lines))`,

      csharp: `using System;
using System.Collections.Generic;
using System.Linq;

readonly record struct HonorRollEntry(
    string Name,
    int Score,
    string Grade
);

var lines = new[] { "Alice,88", "Bob,72", "Carol,91" };

var pairs =
    (from x in Enumerable.Range(1, 10)
     from y in Enumerable.Range(1, 10)
     let product = x * y
     where x + y > 12 && product % 3 == 0
     select (x, y)).ToArray();

static IEnumerable<HonorRollEntry> HonorRoll(
    IEnumerable<string> lines
)
{
    foreach (var line in lines)
    {
        var parts = line.Split(',', 2);
        if (
            parts.Length != 2
            || !int.TryParse(parts[1].Trim(), out var score)
            || score <= 80
        )
        {
            continue;
        }

        yield return new HonorRollEntry(
            parts[0].Trim(),
            score,
            "A"
        );
    }
}

var results = HonorRoll(lines).ToArray();`,

      dart: `typedef Pair = (int, int);
typedef HonorRollEntry = ({
  String name,
  int score,
  String grade,
});

final lines = ['Alice,88', 'Bob,72', 'Carol,91'];

final pairs = <Pair>[
  for (final x in Iterable<int>.generate(10, (i) => i + 1))
    for (final y in Iterable<int>.generate(10, (i) => i + 1))
      if (x + y > 12 && (x * y) % 3 == 0) (x, y),
];

Iterable<HonorRollEntry> honorRoll(
  Iterable<String> lines,
) sync* {
  for (final line in lines) {
    if (line.split(',') case [final name, final scoreText]) {
      final score = int.tryParse(scoreText.trim());
      if (score != null && score > 80) {
        yield (name: name.trim(), score: score, grade: 'A');
      }
    }
  }
}

final results = honorRoll(lines).toList();`,

      swift: `import Foundation

typealias Pair = (Int, Int)

struct HonorRollEntry {
    let name: String
    let score: Int
    let grade: String = "A"
}

let lines = ["Alice,88", "Bob,72", "Carol,91"]

let pairs: [Pair] = Array(
    (1...10).lazy.flatMap { x in
        (1...10).lazy.compactMap { y -> Pair? in
            x + y > 12 && (x * y).isMultiple(of: 3)
                ? (x, y)
                : nil
        }
    }
)

let results = Array(
    lines.lazy.compactMap { line -> HonorRollEntry? in
        let parts = line.split(separator: ",", maxSplits: 1)
        guard parts.count == 2,
              let score = Int(
                String(parts[1]).trimmingCharacters(
                    in: .whitespaces
                )
              ),
              score > 80 else {
            return nil
        }

        return HonorRollEntry(
            name: String(parts[0]).trimmingCharacters(
                in: .whitespaces
            ),
            score: score
        )
    }
)`,

      kotlin: `data class HonorRollEntry(
    val name: String,
    val score: Int,
    val grade: String = "A",
)

val lines = sequenceOf("Alice,88", "Bob,72", "Carol,91")

val pairs = sequence {
    for (x in 1..10) {
        for (y in 1..10) {
            if (x + y > 12 && (x * y) % 3 == 0) {
                yield(x to y)
            }
        }
    }
}.toList()

fun honorRoll(lines: Sequence<String>) =
    lines.mapNotNull { line ->
        val parts = line.split(",", limit = 2)
        if (parts.size != 2) return@mapNotNull null

        val score = parts[1].trim().toIntOrNull()
            ?: return@mapNotNull null
        if (score > 80) {
            HonorRollEntry(parts[0].trim(), score)
        } else {
            null
        }
    }

val results = honorRoll(lines).toList()`,
    },
  },
];

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

/* ── Code Tab Selector ── */
const LANG_ORDER: LangId[] = ["elixir", "python", "typescript", "typescript_effect", "go", "csharp", "dart", "swift", "kotlin"];

/* Shared window chrome pieces */
const WINDOW_BG = "linear-gradient(180deg, #1e2432 0%, #171c28 100%)";
const WINDOW_BORDER = "1px solid rgba(255,255,255,0.08)";
const WINDOW_SHADOW = "0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset";
const DIVIDER = "1px solid rgba(255,255,255,0.06)";

const OTHER_LANGS = LANG_ORDER.filter((l) => l !== "elixir") as LangId[];

/* ── Tab change sounds (Web Audio API) ── two-note chirps, all soft waveforms ── */
const TAB_SOUNDS: Record<LangId, { notes: [number, number]; type: OscillatorType; dur: number }> = {
  elixir:            { notes: [1047, 1319], type: "sine",     dur: 0.10 },  // C6→E6  bright major 3rd
  python:            { notes: [523, 659],   type: "triangle", dur: 0.09 },  // C5→E5  warm chirp
  typescript:        { notes: [784, 988],   type: "sine",     dur: 0.09 },  // G5→B5  gentle major 3rd
  typescript_effect: { notes: [880, 1175],  type: "sine",     dur: 0.10 },  // A5→D6  sparkly 4th
  go:                { notes: [440, 554],   type: "sine",     dur: 0.08 },  // A4→C#5 calm major 3rd
  csharp:            { notes: [587, 740],   type: "triangle", dur: 0.10 },  // D5→F#5 mellow chirp
  kotlin:            { notes: [698, 880],   type: "sine",     dur: 0.09 },  // F5→A5  sweet minor 3rd
  swift:             { notes: [988, 1319],  type: "triangle", dur: 0.08 },  // B5→E6  airy 4th
  dart:              { notes: [659, 880],   type: "sine",     dur: 0.09 },  // E5→A5  bubbly 4th
  rust:              { notes: [554, 698],   type: "triangle", dur: 0.09 },  // C#5→F5 soft minor 3rd
};

let _audioCtx: AudioContext | null = null;
function playTabSound(lid: LangId) {
  try {
    if (!_audioCtx) _audioCtx = new AudioContext();
    const ctx = _audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const cfg = TAB_SOUNDS[lid] ?? { notes: [660, 880] as [number, number], type: "sine" as OscillatorType, dur: 0.09 };
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

const LangTab = ({ lid, isActive, onClick, showStar }: { lid: LangId; isActive: boolean; onClick: () => void; showStar?: boolean }) => (
  <button onClick={() => { playTabSound(lid); onClick(); }}
    className="flex items-center justify-center gap-1 px-2.5 py-1.5 border-none cursor-pointer transition-all duration-200 whitespace-nowrap"
    style={{ fontFamily: CODE_FONT, fontSize: 12, fontWeight: isActive ? 600 : 400,
      background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
      color: isActive ? LANG_COLORS[lid] : "rgba(255,255,255,0.35)",
      borderBottom: isActive ? `2px solid ${LANG_COLORS[lid]}` : "2px solid transparent",
    }}>
    <span className="shrink-0"><LangIcon id={lid} size={14} /></span>
    {showStar ? <span className="flex items-center gap-1"><span style={{ color: isActive ? "#FFD700" : "rgba(255,255,255,0.2)" }}>★</span>{LANG_LABELS[lid]}</span> : LANG_LABELS[lid]}
  </button>
);

/* ── Explicitness Radar Diagram (Interactive) ── */
const RADAR_SCORES: Record<LangId, number[]> = {
  // [Contracts, Pattern Match, Immutability, Pipe Operator, Formatter, Exec Docs]
  elixir:           [0.95, 0.97, 1.0,  0.95, 0.92, 0.98],
  python:           [0.35, 0.55, 0.30, 0.20, 0.60, 0.40],
  typescript:       [0.75, 0.40, 0.45, 0.25, 0.70, 0.30],
  typescript_effect: [0.90, 0.65, 0.80, 0.90, 0.70, 0.35],
  go:               [0.55, 0.30, 0.40, 0.15, 0.95, 0.75],
  csharp:           [0.70, 0.80, 0.55, 0.15, 0.65, 0.30],
  dart:             [0.65, 0.70, 0.50, 0.20, 0.90, 0.25],
  swift:            [0.80, 0.85, 0.65, 0.15, 0.55, 0.30],
  kotlin:           [0.75, 0.75, 0.60, 0.25, 0.65, 0.30],
};

const ALL_LANG_IDS: LangId[] = ["elixir", "python", "typescript", "typescript_effect", "go", "csharp", "dart", "swift", "kotlin"];

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
  const enabledLangs = ALL_LANG_IDS.filter((id) => enabled.has(id));

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
          const scores = RADAR_SCORES[lid];
          const color = LANG_COLORS[lid];
          return (
            <path key={lid} d={makePath(scores)}
              fill={hexToRgba(color, 0.08)} stroke={color} strokeWidth="1.5" strokeOpacity="0.7"
              style={{ transition: "all 0.3s ease" }} />
          );
        })}
        {/* Dots */}
        {enabledLangs.map((lid) => {
          const scores = RADAR_SCORES[lid];
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
        {ALL_LANG_IDS.map((lid) => {
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

function CodeComparison({
  sample,
  lang,
  activeLang,
  onActiveLangChange,
  accentColor = "#10B981",
  highlights,
}: {
  sample: CodeSample;
  lang: Lang;
  activeLang: LangId;
  onActiveLangChange: (lid: LangId) => void;
  accentColor?: string;
  highlights: HighlightMap;
}) {
  const [mobileLang, setMobileLang] = useState<LangId>("elixir");
  const isJa = lang === "ja";
  const fontBody = isJa ? JA_SANS : SANS;

  return (
    <div className="mb-20">
      {/* Section header */}
      <div className="mb-4 px-1">
        <div className="flex items-center gap-2.5 mb-2">
          <span style={{ color: accentColor }}>{sample.icon}</span>
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
      {sample.diagram && <div className="mb-3">{sample.diagram(isJa)}</div>}

      {/* ═══ MOBILE: single pane with all tabs (< md) ═══ */}
      <div className="md:hidden">
        <div className="rounded-[14px] overflow-hidden" style={{ background: WINDOW_BG, border: WINDOW_BORDER, boxShadow: WINDOW_SHADOW }}>
          <div
            className="flex overflow-x-auto scrollbar-hide gap-0 px-2"
            style={{ borderBottom: DIVIDER, background: "rgba(0,0,0,0.15)" }}
            onWheel={scrollTabsOnWheel}
          >
            {LANG_ORDER.map((lid) => (
              <LangTab key={lid} lid={lid} isActive={mobileLang === lid} showStar={lid === "elixir"}
                onClick={() => setMobileLang(lid)} />
            ))}
          </div>
          <SyntaxBlock
            code={sample.snippets[mobileLang]}
            language={LANG_SHIKI[mobileLang]}
            annotations={sample.annotations?.[mobileLang] ?? []}
            uiLang={lang}
            highlightedHtml={highlights[sample.id]?.[mobileLang]}
          />
        </div>
        <FootnoteSection sample={sample} lang={lang} />
      </div>

      {/* ═══ DESKTOP: single window, split inside (>= md) ═══ */}
      <div className="hidden md:block">
        <div className="rounded-t-[14px] overflow-hidden" style={{ background: WINDOW_BG, border: WINDOW_BORDER, borderBottom: "none", boxShadow: WINDOW_SHADOW }}>
          {/* Tab bars side-by-side */}
          <div className="grid grid-cols-2" style={{ borderBottom: DIVIDER, background: "rgba(0,0,0,0.15)" }}>
            {/* Left: Elixir pinned tab */}
            <div className="flex px-2" style={{ borderRight: DIVIDER }}>
              <LangTab lid="elixir" isActive showStar onClick={() => {}} />
            </div>
            {/* Right: Other language tabs -distribute evenly */}
            <div
              className="min-w-0 overflow-x-auto scrollbar-hide"
              onWheel={scrollTabsOnWheel}
            >
              <div className="flex w-max min-w-full px-2">
                {OTHER_LANGS.map((lid) => (
                  <LangTab key={lid} lid={lid} isActive={activeLang === lid}
                    onClick={() => onActiveLangChange(lid)} />
                ))}
              </div>
            </div>
          </div>
          {/* Code panes side-by-side -stretch to equal height */}
          <div className="grid grid-cols-2" style={{ minHeight: 200 }}>
            <div className="flex flex-col" style={{ borderRight: DIVIDER }}>
              <div className="flex-1" style={{ background: "transparent" }}>
                <SyntaxBlock
                  code={sample.snippets.elixir}
                  language={LANG_SHIKI.elixir}
                  annotations={sample.annotations?.elixir ?? []}
                  uiLang={lang}
                  highlightedHtml={highlights[sample.id]?.elixir}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex-1" style={{ background: "transparent" }}>
                <SyntaxBlock
                  code={sample.snippets[activeLang]}
                  language={LANG_SHIKI[activeLang]}
                  annotations={sample.annotations?.[activeLang] ?? []}
                  uiLang={lang}
                  highlightedHtml={highlights[sample.id]?.[activeLang]}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-b-[14px] overflow-hidden" style={{ background: WINDOW_BG, border: WINDOW_BORDER, borderTop: "none" }}>
          <FootnoteSection sample={sample} lang={lang} />
        </div>
      </div>
    </div>
  );
}


/* ── Difficulty Bar ── */
function DifficultyBars({ isJa }: { isJa: boolean }) {
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
      {difficultyData.map((d) => (
        <DifficultyRow key={d.lang} data={d} isJa={isJa} visible={visible} />
      ))}
    </div>
  );
}

function DifficultyRow({ data, isJa, visible }: { data: typeof difficultyData[0]; isJa: boolean; visible: boolean }) {
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
  highlights = {},
}: {
  highlights?: HighlightMap;
}) {
  const [lang, setLang] = useState<Lang>("ja");
  const [sectionLangs, setSectionLangs] = useState<LangId[]>(
    () => codeSamples.map(() => "python" as LangId),
  );
  useEffect(() => {
    const stored = localStorage.getItem("aid-lang");
    if (stored === "en" || stored === "ja") setLang(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem("aid-lang", lang);
  }, [lang]);
  useEffect(() => {
    setSectionLangs((prev) => {
      if (prev.length === codeSamples.length) return prev;
      return codeSamples.map((_, idx) => prev[idx] ?? ("python" as LangId));
    });
  }, []);
  const isJa = lang === "ja";
  const l = content[lang];
  const reduceMotion = useReduceMotion();
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const fontBody = isJa ? JA_SANS : SANS;

  const handleSectionLangChange = (sectionIndex: number, lid: LangId) => {
    setSectionLangs((prev) => prev.map((current, idx) => (idx < sectionIndex ? current : lid)));
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

        <DifficultyBars isJa={isJa} />

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

        {codeSamples.map((sample, idx) => (
          <CodeComparison
            key={sample.id}
            sample={sample}
            lang={lang}
            activeLang={sectionLangs[idx] ?? "python"}
            onActiveLangChange={(lid) => handleSectionLangChange(idx, lid)}
            accentColor={["#10B981", "#3B82F6", "#9B59B6", "#F59E0B", "#06B6D4", "#E0247A", "#8B5CF6"][idx % 7]}
            highlights={highlights}
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
