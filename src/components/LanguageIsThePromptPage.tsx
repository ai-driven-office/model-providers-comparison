import { useState, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, Zap, Code2, Beaker, Shield, Layers, GitBranch, Terminal, BookOpen, Cpu, FlaskConical, Sparkles, FileCheck, Shuffle, Lock, ArrowRight, Paintbrush, FileText } from "lucide-react";
import { createHighlighter, type Highlighter } from "shiki";
import type { Lang } from "../data/i18n";

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
    subtitle: "How Elixir achieves 87.4% while Python manages 43.9%. Your programming language IS the prompt.",
    heroStat1Label: "Elixir Pass@1",
    heroStat1Value: "87.4%",
    heroStat2Label: "Python Pass@1",
    heroStat2Value: "43.9%",
    heroStat3Label: "Gap on Hard Tasks",
    heroStat3Value: "55pt",
    tldr: "TL;DR",
    tldrText: "LLMs don't just read your prompt  - they read your language. Elixir's design makes intent so explicit that it passes 87.4% of coding benchmarks vs Python's 43.9%. This isn't about training data. It's about how much guessing the model has to do.",
    whyTitle: "Why does this matter?",
    whyPoints: [
      "Elixir has far less training data than Python, yet crushes it at code generation",
      "The advantage grows on harder problems  - Elixir barely degrades while Python collapses",
      "Explicit error contracts are the strongest portable signal across all languages tested",
      "Other languages can adopt these principles to improve their LLM code generation",
    ],
    hypothesisTitle: "The Explicitness Hypothesis",
    hypothesisSub: "Languages that make intent, contracts, and data flow locally visible reduce the predictive burden on LLMs.",
    principles: [
      { title: "Explicit Contracts", desc: "Tagged success/error tuples are short, explicit, and heavily repeated  - LLMs love patterns.", icon: "contract" },
      { title: "Pattern Matching", desc: "Branching logic lives in function heads and case expressions  - no hidden if/else chains to reason about.", icon: "pattern" },
      { title: "Immutability Default", desc: "No stale state. No mutation bugs. The model never has to track what changed where.", icon: "lock" },
      { title: "Pipe Operator", desc: "Data flows left-to-right through |> pipes  - each step is locally obvious and self-documenting.", icon: "pipe" },
      { title: "Formatter Uniformity", desc: "mix format collapses all stylistic freedom. One way to write code = less entropy for LLMs.", icon: "format" },
      { title: "Executable Docs", desc: "Doctests embed working examples right in the documentation. Tests, docs, and code are perfectly aligned.", icon: "docs" },
    ],
    difficultyTitle: "The Hard Problem Gap",
    difficultySub: "On hard tasks, Elixir barely flinches while other languages collapse.",
    difficultyNote: "Elixir barely degrades from easy to hard problems. Python collapses.",
    codeTitle: "Show Me the Code",
    codeSub: "Elixir stays on the left; the selected language shows the closest idiomatic equivalent, using current language features and common libraries when they matter.",
    paperLink: "Read the full paper",
    paperLinkSub: "Günther Brunner, CyberAgent Inc.",
    methodology: "Source: \"The Language Is the Prompt\" by Günther Brunner, CyberAgent Inc.",
  },
  ja: {
    back: "ダッシュボードに戻る",
    badge: "研究",
    title: "言語がプロンプトである",
    subtitle: "Elixirが87.4%を達成し、Pythonが43.9%にとどまる理由。プログラミング言語そのものがプロンプトだ。",
    heroStat1Label: "Elixir Pass@1",
    heroStat1Value: "87.4%",
    heroStat2Label: "Python Pass@1",
    heroStat2Value: "43.9%",
    heroStat3Label: "難問での差",
    heroStat3Value: "55pt",
    tldr: "要約",
    tldrText: "LLMはプロンプトだけでなく、あなたの言語を読む。Elixirの設計は意図を明確にし、コーディングベンチマークで87.4%を通過（Python 43.9%）。これは学習データの問題ではない。モデルがどれだけ推測しなければならないかの問題だ。",
    whyTitle: "なぜ重要か？",
    whyPoints: [
      "ElixirはPythonよりはるかに少ない学習データしかないのに、コード生成で圧倒する",
      "難問になるほど差は広がる  - Elixirはほぼ劣化しないがPythonは崩壊する",
      "明示的なエラー契約が、テストされた全言語で最も強力なポータブルシグナル",
      "他の言語もこれらの原則を採用してLLMコード生成を改善できる",
    ],
    hypothesisTitle: "明示性仮説",
    hypothesisSub: "意図・契約・データフローをローカルに可視化する言語は、LLMの予測負荷を減らす。",
    principles: [
      { title: "明示的な契約", desc: "タグ付き成功/エラータプルは短く、明示的で、頻繁に繰り返される。LLMはパターンを好む。", icon: "contract" },
      { title: "パターンマッチ", desc: "分岐ロジックは関数ヘッドとcase式に存在する  - 隠れたif/elseチェーンを推論する必要がない。", icon: "pattern" },
      { title: "デフォルト不変性", desc: "古い状態なし。変異バグなし。モデルはどこで何が変わったかを追跡する必要がない。", icon: "lock" },
      { title: "パイプ演算子", desc: "データは |> パイプを通じて左から右に流れる  - 各ステップがローカルに明白で自己文書化される。", icon: "pipe" },
      { title: "フォーマッタ統一", desc: "mix format がすべてのスタイルの自由度を排除。コードの書き方が1つ = LLMのエントロピーが低い。", icon: "format" },
      { title: "実行可能なドキュメント", desc: "Doctestはドキュメント内に動作例を埋め込む。テスト・ドキュメント・コードが完璧に整合。", icon: "docs" },
    ],
    difficultyTitle: "難問での差",
    difficultySub: "難しい問題では、Elixirはほぼ動じないが他の言語は崩壊する。",
    difficultyNote: "Elixirは簡単な問題から難しい問題でもほぼ劣化しない。Pythonは崩壊する。",
    codeTitle: "コードで見る",
    codeSub: "左にElixir、右に選択した言語での最も自然な等価表現を表示。必要に応じて最新の言語機能や定番ライブラリを使う。",
    paperLink: "論文全文を読む",
    paperLinkSub: "Günther Brunner, CyberAgent Inc.",
    methodology: "出典: 「The Language Is the Prompt」  - Günther Brunner, CyberAgent Inc.",
  },
} as const;

/* ══════════════════════════════════════════════════════════════════════════
   DIFFICULTY DATA
   ══════════════════════════════════════════════════════════════════════════ */

const difficultyData = [
  { lang: "Elixir",     easy: 96.6, medium: 86.7, hard: 86.3, degradation: -10.3, color: "#10B981" },
  { lang: "Kotlin",     easy: 100.0, medium: 88.1, hard: 63.6, degradation: -36.4, color: "#3B82F6" },
  { lang: "C#",         easy: 97.8, medium: 81.1, hard: 63.1, degradation: -34.7, color: "#8B5CF6" },
  { lang: "Python",     easy: 82.0, medium: 48.6, hard: 31.6, degradation: -50.4, color: "#F59E0B" },
  { lang: "JavaScript", easy: 78.5, medium: 45.2, hard: 28.3, degradation: -50.2, color: "#EF4444" },
];

/* ══════════════════════════════════════════════════════════════════════════
   CODE SAMPLES  - Elixir features with equivalents in 7 other languages
   ══════════════════════════════════════════════════════════════════════════ */

type LangId = "elixir" | "python" | "typescript" | "typescript_effect" | "go" | "csharp" | "dart" | "swift" | "kotlin";

interface CodeSample {
  id: string;
  title: { en: string; ja: string };
  description: { en: string; ja: string };
  icon: ReactNode;
  snippets: Record<LangId, string>;
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

/* Shiki language IDs for each LangId */
const LANG_SHIKI: Record<LangId, string> = {
  elixir: "elixir",
  python: "python",
  typescript: "typescript",
  typescript_effect: "typescript",
  go: "go",
  // Reuse TS highlighting for C# to avoid an extra browser-side grammar fetch.
  csharp: "typescript",
  dart: "dart",
  swift: "swift",
  kotlin: "kotlin",
};

const SHIKI_LANGS = ["elixir", "python", "typescript", "go", "dart", "swift", "kotlin"] as const;
const SHIKI_THEME = "night-owl";

/* Singleton highlighter - loaded once, reused across all code blocks */
let _highlighter: Highlighter | null = null;
let _highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter(): Promise<Highlighter> {
  if (_highlighter) return Promise.resolve(_highlighter);
  if (!_highlighterPromise) {
    _highlighterPromise = createHighlighter({
      themes: [SHIKI_THEME],
      langs: [...SHIKI_LANGS],
    })
      .then((h) => {
        _highlighter = h;
        return h;
      })
      .catch((error) => {
        _highlighterPromise = null;
        throw error;
      });
  }
  return _highlighterPromise;
}

/* Syntax-highlighted code block using shiki */
function SyntaxBlock({ code, language }: { code: string; language: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((h) => {
        if (cancelled) return;
        let result = h.codeToHtml(code, {
          lang: language,
          theme: SHIKI_THEME,
        });
        // Inject monospace font into shiki's <pre> style to override Tailwind v4 base
        result = result.replace(
          /(<pre[^>]*style=")/,
          `$1font-family:${CODE_FONT};`
        );
        setHtml(result);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load syntax highlighter", error);
        setHtml("");
      });
    return () => { cancelled = true; };
  }, [code, language]);

  if (!html) {
    // Fallback while shiki loads - plain text with mono font
    return (
      <pre
        className="m-0 px-6 py-5 overflow-x-auto text-[12.5px] sm:text-[13.5px] leading-[1.75] h-full"
        style={{
          fontFamily: CODE_FONT,
          fontFeatureSettings: "'liga' 1, 'calt' 1",
          background: "transparent",
          color: "rgba(255,255,255,0.6)",
          tabSize: 2,
        }}
      >
        <code style={{ fontFamily: CODE_FONT }}>{code}</code>
      </pre>
    );
  }

  // Inject font + padding + height into shiki's <pre> output
  const styled = html
    .replace(
      /(<pre[^>]*style=")/,
      `$1font-family:${CODE_FONT};padding:20px 24px;height:100%;margin:0;box-sizing:border-box;`
    )
    .replace(
      /(<code[^>]*)/,
      `$1 style="font-family:${CODE_FONT}"`
    );

  return (
    <div
      className="shiki-wrapper overflow-x-auto h-full"
      style={{
        fontFeatureSettings: "'liga' 1, 'calt' 1",
        fontSize: "13px",
        lineHeight: 1.75,
        tabSize: 2,
      }}
      dangerouslySetInnerHTML={{ __html: styled }}
    />
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
    case "JavaScript":
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

const codeSamples: CodeSample[] = [
  /* ── 1. Pattern Matching ── */
  {
    id: "pattern-matching",
    title: { en: "Pattern Matching", ja: "パターンマッチング" },
    description: {
      en: "Same branching idea, rendered idiomatically in each language: tagged data plus the native branching construct each ecosystem actually uses.",
      ja: "同じ分岐の考え方を各言語で素直に書く: タグ付きデータと、その言語圏で実際に使われる自然な分岐構文を組み合わせる。",
    },
    icon: <GitBranch className="w-4 h-4" />,
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

      typescript_effect: `import { Data } from "effect"

type Shape = Data.TaggedEnum<{
  Circle: { radius: number }
  Rect: { width: number; height: number }
  Triangle: { base: number; height: number }
}>

const Shape = Data.taggedEnum<Shape>()

const area = Shape.$match({
  Circle: ({ radius }) => Math.PI * radius ** 2,
  Rect: ({ width, height }) => width * height,
  Triangle: ({ base, height }) => 0.5 * base * height,
})

area(Shape.Circle({ radius: 5 })) // 78.53981633974483
area(Shape.Rect({ width: 3, height: 4 })) // 12
area(Shape.Triangle({ base: 6, height: 3 })) // 9`,

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
    Triangle(var baseLength, var height) => 0.5 * baseLength * height,
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
  Rect(width: final width, height: final height) => width * height,
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
      en: "Same explicit success/failure contract, but rendered in each ecosystem's native style: `Result` containers where they are common, Effect's typed error channel, and Go's standard `(value, error)` pair.",
      ja: "同じ成功/失敗の明示的な契約を、各言語圏の自然な形で表現する: 一般的な`Result`コンテナ、Effectの型付きエラーチャネル、そしてGoの標準的な`(value, error)`。",
    },
    icon: <Shield className="w-4 h-4" />,
    snippets: {
      elixir: `def fetch_user(id) do
  case Repo.get(User, id) do
    nil   -> {:error, :not_found}
    user  -> {:ok, user}
  end
end

def update_email(user_id, new_email) do
  with {:ok, user}    <- fetch_user(user_id),
       {:ok, updated} <- User.changeset(user, %{email: new_email})
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
    return Success(user) if user is not None else Failure(NotFound(user_id))

def persist_email(user: User, new_email: str) -> Result[User, UpdateEmailError]:
    return repo.update(user, email=new_email).alt(UpdateFailed)

def update_email(user_id: int, new_email: str) -> Result[User, UpdateEmailError]:
    return fetch_user(user_id).bind(
        lambda user: persist_email(user, new_email)
    )`,

      typescript: `type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

type UpdateEmailError =
  | { type: "not_found"; userId: number }
  | { type: "update_failed"; message: string }

const fetchUser = (userId: number): Result<User, UpdateEmailError> => {
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
    : { ok: false, error: { type: "update_failed", message: result.error } }
}

const updateEmail = (
  userId: number,
  newEmail: string,
): Result<User, UpdateEmailError> => {
  const userResult = fetchUser(userId)
  if (!userResult.ok) return userResult

  return persistEmail(userResult.value, newEmail)
}`,

      typescript_effect: `import { Data, Effect } from "effect"

class NotFound extends Data.TaggedError("NotFound")<{ readonly userId: number }> {}
class UpdateFailed extends Data.TaggedError("UpdateFailed")<{
  readonly message: string
}> {}

const fetchUser = (userId: number) =>
  Effect.gen(function* () {
    const user = yield* repo.get(userId)
    if (!user) {
      return yield* Effect.fail(new NotFound({ userId }))
    }
    return user
  })

const persistEmail = (user: User, newEmail: string) =>
  repo.update(user, { email: newEmail }).pipe(
    Effect.mapError((message) => new UpdateFailed({ message })),
  )

const updateEmail = (userId: number, newEmail: string) =>
  Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    return yield* persistEmail(user, newEmail)
  })

const program = updateEmail(42, "new@example.com").pipe(
  Effect.catchTag("NotFound", () => Effect.succeed(fallback)),
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

if _, err := updateEmail(42, "new@example.com"); errors.Is(err, ErrNotFound) {
  log.Println("missing user")
}`,

      csharp: `public readonly record struct Result<TValue, TError>(
    TValue? Value,
    TError? Error
)
{
    public bool IsOk => Error is null;
    public static Result<TValue, TError> Ok(TValue value) => new(value, default);
    public static Result<TValue, TError> Fail(TError error) => new(default, error);
}

public abstract record UpdateEmailError
{
    public sealed record NotFound(int UserId) : UpdateEmailError;
    public sealed record UpdateFailed(string Message) : UpdateEmailError;
}

static Result<User, UpdateEmailError> FetchUser(int userId) =>
    repo.Get(userId) is { } user
        ? Result<User, UpdateEmailError>.Ok(user)
        : Result<User, UpdateEmailError>.Fail(new UpdateEmailError.NotFound(userId));

static Result<User, UpdateEmailError> PersistEmail(User user, string newEmail) =>
    repo.Update(user, newEmail) switch
    {
        { IsOk: true, Value: var updated } => Result<User, UpdateEmailError>.Ok(updated!),
        { Error: var message } => Result<User, UpdateEmailError>.Fail(
            new UpdateEmailError.UpdateFailed(message!)
        ),
    };

static Result<User, UpdateEmailError> UpdateEmail(int userId, string newEmail) =>
    FetchUser(userId) switch
    {
        { IsOk: false, Error: var error } => Result<User, UpdateEmailError>.Fail(error!),
        { Value: var user } => PersistEmail(user!, newEmail),
    };`,

      dart: `sealed class UpdateEmailError {
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

sealed class Result<T> {
  const Result();
}

final class Ok<T> extends Result<T> {
  const Ok(this.value);
  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.error);
  final UpdateEmailError error;
}

Result<User> fetchUser(int userId) {
  final user = repo.get(userId);
  return user == null ? Err(NotFound(userId)) : Ok(user);
}

Result<User> persistEmail(User user, String newEmail) =>
  switch (repo.update(user, email: newEmail)) {
    Ok(:final value) => Ok(value),
    Err(:final error) => Err(UpdateFailed(error)),
  };

Result<User> updateEmail(int userId, String newEmail) =>
  switch (fetchUser(userId)) {
    Err(:final error) => Err(error),
    Ok(:final value) => persistEmail(value, newEmail),
  };`,

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

func persistEmail(_ user: User, newEmail: String) -> Result<User, UpdateEmailError> {
  repo.update(user, email: newEmail)
    .mapError { .updateFailed(message: $0.localizedDescription) }
}

func updateEmail(userId: Int, newEmail: String) -> Result<User, UpdateEmailError> {
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

fun fetchUser(userId: Int): Either<UpdateEmailError, User> = either {
  ensureNotNull(repo.get(userId)) { NotFound(userId) }
}

fun persistEmail(user: User, newEmail: String): Either<UpdateEmailError, User> =
  repo.update(user, email = newEmail).mapLeft(::UpdateFailed)

fun updateEmail(userId: Int, newEmail: String): Either<UpdateEmailError, User> = either {
  val user = fetchUser(userId).bind()
  persistEmail(user, newEmail).bind()
}`,
    },
  },

  /* ── 3. Pipe Operator ── */
  {
    id: "pipe-operator",
    title: { en: "Pipe Operator & Data Pipelines", ja: "パイプ演算子とデータパイプライン" },
    description: {
      en: "Same left-to-right transformation, rendered with each ecosystem's real pipeline style: native `|>` where it exists, fluent chains where they are idiomatic, and helper-based `pipe()` for TypeScript / Effect because today's Node and Bun do not natively ship the TC39 proposal.",
      ja: "同じ左から右への変換を、各言語圏の実際の流儀で表現する: ネイティブ`|>`、自然なメソッドチェーン、そしてTypeScript / Effectでは、現行のNodeとBunがTC39提案をネイティブ実装していないため helper ベースの`pipe()`。",
    },
    icon: <Layers className="w-4 h-4" />,
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

      typescript_effect: `import { pipe, Array, String } from "effect"

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
slugSource = regexp.MustCompile(\`[^a-z0-9\\s]\`).ReplaceAllString(slugSource, "")
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
        .Replace("  Hello, World!  ".Trim().ToLowerInvariant(), @"[^a-z0-9\\s]", "")
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

  /* ── 4. With Statement (Happy Path) ── */
  {
    id: "with-statement",
    title: { en: "Happy Path Chaining (with)", ja: "ハッピーパスの連鎖（with文）" },
    description: {
      en: "Same happy-path flow, rendered with each ecosystem's short-circuiting idiom: do/generator DSLs where they exist, fluent binds in result libraries, and early returns where the language leans imperative.",
      ja: "同じハッピーパスの流れを、各言語圏のショートサーキット手法で表現する: do / generator DSL、Resultライブラリの fluent bind、そして命令型寄りの言語では早期return。",
    },
    icon: <Sparkles className="w-4 h-4" />,
    snippets: {
      elixir: `def create_order(params) do
  with {:ok, user}     <- authenticate(params.token),
       {:ok, items}    <- validate_items(params.items),
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

type CreateOrderError = Unauthorized | InvalidItems | PaymentFailed | OrderFailed

def confirm(user: User, order: Order) -> Order:
    send_confirmation(user, order)
    return order

def create_order(params: OrderParams) -> Result[Order, CreateOrderError]:
    return Result.do(
        confirm(user, order)
        for user in authenticate(params.token).alt(lambda _: Unauthorized())
        for items in validate_items(params.items).alt(lambda _: InvalidItems())
        for payment in charge_card(user, items).alt(lambda _: PaymentFailed())
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

  const paymentResult = chargeCard(userResult.value, itemsResult.value)
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
      error: { type: "order_failed", message: orderResult.error },
    }
  }

  sendConfirmation(userResult.value, orderResult.value)
  return orderResult
}`,

      typescript_effect: `import { Data, Effect } from "effect"

class Unauthorized extends Data.TaggedError("Unauthorized") {}
class InvalidItems extends Data.TaggedError("InvalidItems") {}
class PaymentFailed extends Data.TaggedError("PaymentFailed") {}
class OrderFailed extends Data.TaggedError("OrderFailed")<{
  readonly message: string
}> {}

const createOrder = (params: OrderParams) =>
  Effect.gen(function* () {
    const user = yield* authenticate(params.token).pipe(
      Effect.orElseFail(() => new Unauthorized()),
    )
    const items = yield* validateItems(params.items).pipe(
      Effect.orElseFail(() => new InvalidItems()),
    )
    const payment = yield* chargeCard(user, items).pipe(
      Effect.orElseFail(() => new PaymentFailed()),
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

Result<Order> CreateOrder(OrderParams params) =>
    Authenticate(params.Token)
        .MapError(_ => "Please log in")
        .Bind(user => ValidateItems(params.Items)
            .MapError(_ => "Invalid cart")
            .Bind(items => ChargeCard(user, items)
                .MapError(_ => "Payment declined")
                .Bind(payment => SaveOrder(user, items, payment)
                    .MapError(error => $"Order failed: {error}")
                    .Tap(order => SendConfirmation(user, order)))));`,

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

TaskEither<CreateOrderError, Order> createOrder(OrderParams params) =>
  TaskEither.Do((_) async {
    final user = await _(
      authenticate(params.token).mapLeft((_) => const Unauthorized()),
    );
    final items = await _(
      validateItems(params.items).mapLeft((_) => const InvalidItems()),
    );
    final payment = await _(
      chargeCard(user, items).mapLeft((_) => const PaymentFailed()),
    );
    final order = await _(
      saveOrder(user, items, payment).mapLeft((message) => OrderFailed(message)),
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

func createOrder(_ params: OrderParams) throws(CreateOrderError) -> Order {
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

fun createOrder(params: OrderParams): Either<CreateOrderError, Order> = either {
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
      en: "Same single-owner state machine idea, rendered with each platform's real concurrency primitive: processes, actors, channels, mailboxes, isolates, and async tasks.",
      ja: "同じ『単一オーナーの状態機械』という考え方を、各プラットフォームの実際の並行プリミティブで表現する: プロセス、actor、channel、mailbox、isolate、async task。",
    },
    icon: <Cpu className="w-4 h-4" />,
    snippets: {
      elixir: `defmodule Counter do
  use GenServer

  # Client API
  def start_link(initial \\\\ 0),
    do: GenServer.start_link(__MODULE__, initial, name: __MODULE__)

  def increment, do: GenServer.call(__MODULE__, :increment)
  def get,       do: GenServer.call(__MODULE__, :get)

  # Server callbacks  - explicit message handling
  @impl true
  def init(initial), do: {:ok, initial}

  @impl true
  def handle_call(:increment, _from, count),
    do: {:reply, count + 1, count + 1}

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

      typescript: `type Command =
  | { type: "increment"; reply: (value: number) => void }
  | { type: "get"; reply: (value: number) => void }

class Counter {
  #count: number
  #mailbox: Command[] = []
  #scheduled = false

  constructor(initial = 0) {
    this.#count = initial
  }

  #ask(type: Command["type"]): Promise<number> {
    return new Promise((resolve) => {
      this.#mailbox.push({ type, reply: resolve })
      this.#drain()
    })
  }

  #drain(): void {
    if (this.#scheduled) return
    this.#scheduled = true

    queueMicrotask(() => {
      while (this.#mailbox.length > 0) {
        const command = this.#mailbox.shift()!
        switch (command.type) {
          case "increment":
            command.reply(++this.#count)
            break
          case "get":
            command.reply(this.#count)
            break
        }
      }
      this.#scheduled = false
    })
  }

  increment(): Promise<number> {
    return this.#ask("increment")
  }

  get(): Promise<number> {
    return this.#ask("get")
  }
}

// For CPU-parallel isolation, run the mailbox loop inside a Worker.
const counter = new Counter(0)
await counter.increment() // 1
await counter.increment() // 2
await counter.get() // 2`,

      typescript_effect: `import { Data, Deferred, Effect, Mailbox, Stream } from "effect"

type Command = Data.TaggedEnum<{
  Increment: { reply: Deferred.Deferred<number> }
  Get: { reply: Deferred.Deferred<number> }
}>

const Command = Data.taggedEnum<Command>()

const makeCounter = (initial = 0) =>
  Effect.scoped(
    Effect.gen(function* () {
      const mailbox = yield* Mailbox.make<Command>()

      yield* Effect.addFinalizer(() => mailbox.end)

      yield* Mailbox.toStream(mailbox).pipe(
        Stream.runFoldEffect(initial, (count, command) =>
          Command.$match(command, {
            Increment: ({ reply }) => {
              const next = count + 1
              return Deferred.succeed(reply, next).pipe(Effect.as(next))
            },
            Get: ({ reply }) =>
              Deferred.succeed(reply, count).pipe(Effect.as(count)),
          }),
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
        increment: ask((reply) => Command.Increment({ reply })),
        get: ask((reply) => Command.Get({ reply })),
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
      en: "Same goal everywhere: keep examples honest. Some ecosystems ship doctests, others execute docs through test runners, and others publish snippets straight from real sample files.",
      ja: "目標は同じ: サンプルを嘘にしないこと。doctestを標準搭載する言語もあれば、テストランナーでドキュメントを実行する言語、実サンプルファイルから公開用スニペットを取り込む言語もある。",
    },
    icon: <BookOpen className="w-4 h-4" />,
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
  @spec safe_add(integer(), integer()) :: {:ok, integer()} | {:error, :overflow}
  def safe_add(a, b) when is_integer(a) and is_integer(b) do
    result = a + b
    if abs(result) > 9_999_999_999, do: {:error, :overflow}, else: {:ok, result}
  end
end

# math_test.exs
doctest Math
# Run: mix test`,

      python: `# Native executable docs: doctest runs these examples directly.
from typing import Literal

type SafeAddResult = tuple[Literal["ok"], int] | tuple[Literal["error"], Literal["overflow"]]

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

      typescript: `// Tooling-based executable docs: doc-vitest turns @example blocks into Vitest tests.

type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E }

/**
 * Safely adds two integers.
 *
 * @example
 * \`\`\`ts @import.meta.vitest
 * expect(safeAdd(1, 2)).toEqual({ ok: true, value: 3 })
 * expect(safeAdd(9_999_999_999, 1)).toEqual({ ok: false, error: "overflow" })
 * \`\`\`
 */
export const safeAdd = (a: number, b: number): Result<number, "overflow"> => {
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

      typescript_effect: `// Tooling-based executable docs: doc-vitest runs the example, Effect stays in the implementation.
import { Data, Effect } from "effect"

class Overflow extends Data.TaggedError("Overflow") {}

/**
 * Safely adds two integers.
 *
 * @example
 * \`\`\`ts @import.meta.vitest
 * await expect(runEffect(safeAdd(1, 2))).resolves.toBe(3)
 * await expect(runEffect(safeAdd(9_999_999_999, 1))).rejects.toBeInstanceOf(Overflow)
 * \`\`\`
 */
const safeAdd = (a: number, b: number) =>
  Effect.succeed(a + b).pipe(
    Effect.filterOrFail(
      (result) => Math.abs(result) <= 9_999_999_999,
      () => new Overflow(),
    ),
  )

// vitest.setup.ts
// import { Effect } from "effect"
// globalThis.runEffect = Effect.runPromise
// // addEqualityTesters() is useful when you compare Effect data structures directly`,

      go: `// Native executable docs: Example... functions run under go test.
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

      csharp: `// Source-backed docs: DocFX publishes snippets from real tested files.
using System;
using Xunit;

public readonly record struct Result<T>(bool Ok, T Value, string? Error);

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
        Assert.Equal(new Result<long>(true, 3, null), SafeAdd(1, 2));
        Assert.Equal(new Result<long>(false, 0, "overflow"), SafeAdd(9_999_999_999, 1));
#endregion
    }
}`,

      dart: `// Checked doc examples: dartdoc_test validates examples under dart test.
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

      swift: `// Source-backed docs: DocC publishes snippets from real files, not inline doctests.
// Documentation.docc/SafeAdd.md
// @Snippet(path: "SafeAddSnippet")

// Snippets/SafeAddSnippet.swift
import MathKit

let ok = safeAdd(1, 2)
let overflow = safeAdd(9_999_999_999, 1)

print(ok)        // .success(3)
print(overflow)  // .failure(.overflow)

// DocC publishes the example from this real file in Snippets/`,

      kotlin: `// Source-backed docs: KDoc @sample pulls in real sample functions.
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
      en: "Same nested iteration and filtering idea, rendered as each ecosystem's natural collection syntax: comprehensions, query expressions, collection builders, or iterator / generator APIs.",
      ja: "同じ入れ子の反復とフィルタの発想を、各言語圏で自然な収集構文に落とし込む: 内包表記、クエリ構文、コレクションビルダ、あるいはイテレータ / ジェネレータAPI。",
    },
    icon: <FlaskConical className="w-4 h-4" />,
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

function* honorRoll(lines: Iterable<string>): Generator<HonorRollEntry> {
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

      typescript_effect: `import { Array, Stream, pipe } from "effect"

type Pair = readonly [x: number, y: number]
type HonorRollEntry = {
  readonly name: string
  readonly score: number
  readonly grade: "A"
}

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
      return {
        name: name.trim(),
        score: Number.parseInt(scoreText.trim(), 10),
      }
    }),
    Stream.filter(({ score }) => !Number.isNaN(score) && score > 80),
    Stream.map(
      ({ name, score }): HonorRollEntry => ({
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

readonly record struct HonorRollEntry(string Name, int Score, string Grade);

var lines = new[] { "Alice,88", "Bob,72", "Carol,91" };

var pairs =
    (from x in Enumerable.Range(1, 10)
     from y in Enumerable.Range(1, 10)
     let product = x * y
     where x + y > 12 && product % 3 == 0
     select (x, y)).ToArray();

static IEnumerable<HonorRollEntry> HonorRoll(IEnumerable<string> lines)
{
    foreach (var line in lines)
    {
        var parts = line.Split(',', 2);
        if (parts.Length != 2 || !int.TryParse(parts[1].Trim(), out var score) || score <= 80)
        {
            continue;
        }

        yield return new HonorRollEntry(parts[0].Trim(), score, "A");
    }
}

var results = HonorRoll(lines).ToArray();`,

      dart: `typedef Pair = (int, int);
typedef HonorRollEntry = ({String name, int score, String grade});

final lines = ['Alice,88', 'Bob,72', 'Carol,91'];

final pairs = <Pair>[
  for (final x in Iterable<int>.generate(10, (i) => i + 1))
    for (final y in Iterable<int>.generate(10, (i) => i + 1))
      if (x + y > 12 && (x * y) % 3 == 0) (x, y),
];

Iterable<HonorRollEntry> honorRoll(Iterable<String> lines) sync* {
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
            x + y > 12 && (x * y).isMultiple(of: 3) ? (x, y) : nil
        }
    }
)

let results = Array(
    lines.lazy.compactMap { line -> HonorRollEntry? in
        let parts = line.split(separator: ",", maxSplits: 1)
        guard parts.count == 2,
              let score = Int(String(parts[1]).trimmingCharacters(in: .whitespaces)),
              score > 80 else {
            return nil
        }

        return HonorRollEntry(
            name: String(parts[0]).trimmingCharacters(in: .whitespaces),
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

        val score = parts[1].trim().toIntOrNull() ?: return@mapNotNull null
        if (score > 80) HonorRollEntry(parts[0].trim(), score) else null
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

const LangTab = ({ lid, isActive, onClick, showStar }: { lid: LangId; isActive: boolean; onClick: () => void; showStar?: boolean }) => (
  <button onClick={onClick}
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

function CodeComparison({ sample, lang, activeLang, setActiveLang, accentColor = "#10B981" }: { sample: CodeSample; lang: Lang; activeLang: LangId; setActiveLang: (lid: LangId) => void; accentColor?: string }) {
  const [mobileLang, setMobileLang] = useState<LangId>("elixir");
  const isJa = lang === "ja";
  const fontBody = isJa ? JA_SANS : SANS;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2.5 mb-1">
          <span style={{ color: accentColor }}>{sample.icon}</span>
          <h3 className="text-[18px] sm:text-[20px] font-bold m-0" style={{ fontFamily: fontBody, color: accentColor }}>
            {sample.title[lang]}
          </h3>
        </div>
        <p className="text-[13px] sm:text-sm m-0 leading-relaxed" style={{ color: "rgba(255,255,255,0.50)", fontFamily: fontBody }}>
          {sample.description[lang]}
        </p>
      </div>

      {/* ═══ MOBILE: single pane with all tabs (< md) ═══ */}
      <div className="md:hidden">
        <div className="rounded-[14px] overflow-hidden" style={{ background: WINDOW_BG, border: WINDOW_BORDER, boxShadow: WINDOW_SHADOW }}>
          <div className="flex overflow-x-auto scrollbar-hide gap-0 px-2" style={{ borderBottom: DIVIDER, background: "rgba(0,0,0,0.15)" }}>
            {LANG_ORDER.map((lid) => (
              <LangTab key={lid} lid={lid} isActive={mobileLang === lid} showStar={lid === "elixir"}
                onClick={() => setMobileLang(lid)} />
            ))}
          </div>
          <SyntaxBlock code={sample.snippets[mobileLang]} language={LANG_SHIKI[mobileLang]} />
        </div>
      </div>

      {/* ═══ DESKTOP: single window, split inside (>= md) ═══ */}
      <div className="hidden md:block rounded-[14px] overflow-hidden" style={{ background: WINDOW_BG, border: WINDOW_BORDER, boxShadow: WINDOW_SHADOW }}>
        {/* Tab bars side-by-side */}
        <div className="grid grid-cols-2" style={{ borderBottom: DIVIDER, background: "rgba(0,0,0,0.15)" }}>
          {/* Left: Elixir pinned tab */}
          <div className="flex px-2" style={{ borderRight: DIVIDER }}>
            <LangTab lid="elixir" isActive showStar onClick={() => {}} />
          </div>
          {/* Right: Other language tabs — distribute evenly */}
          <div className="flex justify-evenly">
            {OTHER_LANGS.map((lid) => (
              <LangTab key={lid} lid={lid} isActive={activeLang === lid}
                onClick={() => setActiveLang(lid)} />
            ))}
          </div>
        </div>
        {/* Code panes side-by-side — stretch to equal height */}
        <div className="grid grid-cols-2" style={{ minHeight: 200 }}>
          <div className="flex flex-col" style={{ borderRight: DIVIDER }}>
            <div className="flex-1" style={{ background: "transparent" }}>
              <SyntaxBlock code={sample.snippets.elixir} language={LANG_SHIKI.elixir} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex-1" style={{ background: "transparent" }}>
              <SyntaxBlock code={sample.snippets[activeLang]} language={LANG_SHIKI[activeLang]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ── Difficulty Bar ── */
function DifficultyRow({ data, isJa }: { data: typeof difficultyData[0]; isJa: boolean }) {
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
              <span className="text-[11px] font-bold" style={{ color: data.color, fontFamily: MONO }}>{d.value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${d.value}%`,
                  background: data.color,
                  opacity: d.label === (isJa ? "難" : "Hard") ? 1 : 0.5,
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

export default function LanguageIsThePromptPage() {
  const [lang, setLang] = useState<Lang>("ja");
  const [activeLang, setActiveLang] = useState<LangId>("python");
  useEffect(() => {
    const stored = localStorage.getItem("aid-lang");
    if (stored === "en" || stored === "ja") setLang(stored);
  }, []);
  const isJa = lang === "ja";
  const l = content[lang];
  const reduceMotion = useReduceMotion();
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const fontBody = isJa ? JA_SANS : SANS;

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
        className="rounded-[28px] p-6 sm:p-8 border relative overflow-hidden mb-8"
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
          className="text-[32px] sm:text-[52px] leading-[0.94] font-black m-0 mb-3"
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
          className="text-sm sm:text-base max-w-[720px] m-0 mb-5 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.72)", fontFamily: fontBody }}
        >
          {l.subtitle}
        </p>

        {/* KPI cards */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
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
          TL;DR
         ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-[24px] px-5 sm:px-6 py-5 border mb-8"
        style={{
          background: "linear-gradient(135deg, rgba(155,89,182,0.06), rgba(8,18,26,0.28))",
          borderColor: "rgba(155,89,182,0.15)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <Zap className="w-4 h-4" style={{ color: "#F59E0B" }} />
          <h2 className="text-[18px] font-black m-0" style={{ fontFamily: fontBody, color: "#F59E0B" }}>{l.tldr}</h2>
        </div>
        <p
          className="text-[14px] sm:text-[15px] m-0 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.78)", fontFamily: fontBody }}
        >
          {l.tldrText}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          WHY IT MATTERS
         ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="rounded-[24px] px-5 sm:px-6 py-5 border mb-8"
        style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(8,18,26,0.26))",
          borderColor: "rgba(16,185,129,0.12)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <Beaker className="w-4 h-4" style={{ color: "#10B981" }} />
          <h2 className="text-[18px] sm:text-[20px] font-bold m-0" style={{ fontFamily: fontBody, color: "#10B981" }}>
            {l.whyTitle}
          </h2>
        </div>
        <div className="space-y-3">
          {l.whyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                style={{ background: i === 0 ? "#10B981" : i === 1 ? "#3B82F6" : i === 2 ? "#9B59B6" : "#F59E0B" }}
              />
              <span
                className="text-[13px] sm:text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.72)", fontFamily: fontBody }}
              >
                {point}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          THE EXPLICITNESS HYPOTHESIS
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="mb-8">
        <h2
          className="text-[24px] sm:text-[30px] font-black mb-2"
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
          className="text-sm sm:text-base mb-5 max-w-[720px]"
          style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}
        >
          {l.hypothesisSub}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {l.principles.map((p, i) => {
            const colors = ["#10B981", "#3B82F6", "#9B59B6", "#F59E0B", "#06B6D4", "#E0247A"];
            const c = colors[i % colors.length];
            return (
              <div
                key={i}
                className="rounded-2xl px-4 py-4 border transition-all duration-300 hover:border-[rgba(255,255,255,0.14)]"
                style={{
                  background: `linear-gradient(135deg, ${c}08, rgba(8,18,26,0.2))`,
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: `${c}18` }}>
                    <PrincipleIcon id={p.icon} color={c} />
                  </div>
                  <div className="text-[15px] font-bold" style={{ color: c, fontFamily: fontBody }}>
                    {p.title}
                  </div>
                </div>
                <div className="text-[12px] sm:text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}>
                  {p.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DIFFICULTY RESILIENCE
         ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="rounded-[24px] px-5 sm:px-6 py-5 border mb-8"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(8,18,26,0.26))",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <Terminal className="w-4 h-4" style={{ color: "#EF4444" }} />
          <h2 className="text-[22px] sm:text-[26px] font-black m-0" style={{ fontFamily: fontBody, color: "#EF4444" }}>
            {l.difficultyTitle}
          </h2>
        </div>
        <p className="text-sm mt-0 mb-4 max-w-[760px]" style={{ color: "rgba(255,255,255,0.48)", fontFamily: fontBody }}>
          {l.difficultySub}
        </p>

        <div>
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
            <DifficultyRow key={d.lang} data={d} isJa={isJa} />
          ))}
        </div>

        <p className="text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.3)", fontFamily: fontBody }}>
          {l.difficultyNote}
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CODE COMPARISONS
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Code2 className="w-5 h-5" style={{ color: "#3B82F6" }} />
          <h2
            className="text-[24px] sm:text-[30px] font-black m-0"
            style={{
              fontFamily: isJa ? JA_SANS : SANS,
              letterSpacing: isJa ? 0 : -0.8,
              color: "#3B82F6",
            }}
          >
            {l.codeTitle}
          </h2>
        </div>
        <p className="text-sm sm:text-base mt-1 mb-6 max-w-[720px]" style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}>
          {l.codeSub}
        </p>

        {codeSamples.map((sample, idx) => (
          <CodeComparison key={sample.id} sample={sample} lang={lang} activeLang={activeLang} setActiveLang={setActiveLang} accentColor={["#10B981","#3B82F6","#9B59B6","#F59E0B","#06B6D4","#E0247A","#8B5CF6"][idx % 7]} />
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          PAPER LINK
         ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-[24px] px-5 sm:px-6 py-5 border mb-8 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(155,89,182,0.08), rgba(16,185,129,0.06))",
          borderColor: "rgba(155,89,182,0.18)",
        }}
      >
        <h3 className="text-[20px] font-bold mb-2" style={{ fontFamily: fontBody, color: "#06B6D4" }}>
          📄 {l.paperLink}
        </h3>
        <p className="text-[13px] m-0" style={{ color: "rgba(255,255,255,0.5)", fontFamily: fontBody }}>
          {l.paperLinkSub}
        </p>
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
