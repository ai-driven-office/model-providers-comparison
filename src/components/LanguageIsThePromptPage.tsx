import { useState, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, Zap, Code2, Beaker, Shield, Layers, GitBranch, Terminal, BookOpen, Cpu, FlaskConical, Sparkles } from "lucide-react";
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
      { title: "Explicit Contracts", desc: "Tagged success/error tuples are short, explicit, and heavily repeated  - LLMs love patterns." },
      { title: "Pattern Matching", desc: "Branching logic lives in function heads and case expressions  - no hidden if/else chains to reason about." },
      { title: "Immutability Default", desc: "No stale state. No mutation bugs. The model never has to track what changed where." },
      { title: "Pipe Operator", desc: "Data flows left-to-right through |> pipes  - each step is locally obvious and self-documenting." },
      { title: "Formatter Uniformity", desc: "mix format collapses all stylistic freedom. One way to write code = less entropy for LLMs." },
      { title: "Executable Docs", desc: "Doctests embed working examples right in the documentation. Tests, docs, and code are perfectly aligned." },
    ],
    difficultyTitle: "The Hard Problem Gap",
    difficultySub: "On hard tasks, Elixir barely flinches while other languages collapse.",
    difficultyNote: "Elixir barely degrades from easy to hard problems. Python collapses.",
    codeTitle: "Show Me the Code",
    codeSub: "Elixir features side-by-side with how you'd write them in other languages. See why explicitness wins.",
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
      { title: "明示的な契約", desc: "タグ付き成功/エラータプルは短く、明示的で、頻繁に繰り返される。LLMはパターンを好む。" },
      { title: "パターンマッチ", desc: "分岐ロジックは関数ヘッドとcase式に存在する  - 隠れたif/elseチェーンを推論する必要がない。" },
      { title: "デフォルト不変性", desc: "古い状態なし。変異バグなし。モデルはどこで何が変わったかを追跡する必要がない。" },
      { title: "パイプ演算子", desc: "データは |> パイプを通じて左から右に流れる  - 各ステップがローカルに明白で自己文書化される。" },
      { title: "フォーマッタ統一", desc: "mix format がすべてのスタイルの自由度を排除。コードの書き方が1つ = LLMのエントロピーが低い。" },
      { title: "実行可能なドキュメント", desc: "Doctestはドキュメント内に動作例を埋め込む。テスト・ドキュメント・コードが完璧に整合。" },
    ],
    difficultyTitle: "難問での差",
    difficultySub: "難しい問題では、Elixirはほぼ動じないが他の言語は崩壊する。",
    difficultyNote: "Elixirは簡単な問題から難しい問題でもほぼ劣化しない。Pythonは崩壊する。",
    codeTitle: "コードで見る",
    codeSub: "Elixirの特徴を他の言語での書き方と並べて比較。明示性が勝つ理由がわかる。",
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

const codeSamples: CodeSample[] = [
  /* ── 1. Pattern Matching ── */
  {
    id: "pattern-matching",
    title: { en: "Pattern Matching", ja: "パターンマッチング" },
    description: {
      en: "Branching logic is explicit in function heads. No hidden if/else  - the model sees every case.",
      ja: "分岐ロジックが関数ヘッドに明示される。隠れたif/elseなし  - モデルは全ケースを見れる。",
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

      python: `import math
from dataclasses import dataclass

@dataclass
class Circle:
    r: float

@dataclass
class Rect:
    w: float
    h: float

@dataclass
class Triangle:
    b: float
    h: float

type Shape = Circle | Rect | Triangle

def area(shape: Shape) -> float:
    match shape:
        case Circle(r=r):
            return math.pi * r * r
        case Rect(w=w, h=h):
            return w * h
        case Triangle(b=b, h=h):
            return 0.5 * b * h`,

      typescript: `type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number }
  | { kind: "triangle"; b: number; h: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.r ** 2
    case "rect":
      return shape.w * shape.h
    case "triangle":
      return 0.5 * shape.b * shape.h
  }
}`,

      typescript_effect: `import { Match } from "effect"

type Shape =
  | { _tag: "Circle"; r: number }
  | { _tag: "Rect"; w: number; h: number }
  | { _tag: "Triangle"; b: number; h: number }

const area = Match.type<Shape>().pipe(
  Match.tag("Circle", ({ r }) => Math.PI * r ** 2),
  Match.tag("Rect", ({ w, h }) => w * h),
  Match.tag("Triangle", ({ b, h }) => 0.5 * b * h),
  Match.exhaustive
)`,

      go: `import "math"

type Shape interface{ area() float64 }

type Circle struct{ R float64 }
func (c Circle) area() float64 {
  return math.Pi * c.R * c.R
}

type Rect struct{ W, H float64 }
func (r Rect) area() float64 {
  return r.W * r.H
}

type Triangle struct{ B, H float64 }
func (t Triangle) area() float64 {
  return 0.5 * t.B * t.H
}`,

      csharp: `using System;

abstract record Shape;
record Circle(double R) : Shape;
record Rect(double W, double H) : Shape;
record Triangle(double B, double H) : Shape;

static double Area(Shape shape) => shape switch
{
    Circle(var r)          => Math.PI * r * r,
    Rect(var w, var h)     => w * h,
    Triangle(var b, var h) => 0.5 * b * h,
    _ => throw new ArgumentException("Unknown shape")
};`,

      dart: `import 'dart:math';

sealed class Shape {}
class Circle extends Shape { final double r; Circle(this.r); }
class Rect extends Shape { final double w, h; Rect(this.w, this.h); }
class Triangle extends Shape { final double b, h; Triangle(this.b, this.h); }

double area(Shape s) => switch (s) {
  Circle(r: var r) => pi * r * r,
  Rect(w: var w, h: var h) => w * h,
  Triangle(b: var b, h: var h) => 0.5 * b * h,
};`,

      swift: `import Foundation

enum Shape {
  case circle(r: Double)
  case rect(w: Double, h: Double)
  case triangle(b: Double, h: Double)
}

func area(_ shape: Shape) -> Double {
  switch shape {
  case .circle(let r):
    return .pi * r * r
  case .rect(let w, let h):
    return w * h
  case .triangle(let b, let h):
    return 0.5 * b * h
  }
}`,

      kotlin: `import kotlin.math.PI

sealed interface Shape
data class Circle(val r: Double) : Shape
data class Rect(val w: Double, val h: Double) : Shape
data class Triangle(val b: Double, val h: Double) : Shape

fun area(shape: Shape): Double = when (shape) {
  is Circle -> PI * shape.r * shape.r
  is Rect -> shape.w * shape.h
  is Triangle -> 0.5 * shape.b * shape.h
}`,
    },
  },

  /* ── 2. Result Types / Tagged Tuples ── */
  {
    id: "result-types",
    title: { en: "Result Types & Error Handling", ja: "Result型とエラーハンドリング" },
    description: {
      en: "Tagged tuples  - the strongest portable signal across all languages tested. Explicit success/failure contracts LLMs can latch onto.",
      ja: "タグ付きタプル  - テストされた全言語で最も強力なポータブルシグナル。LLMが活用できる明示的な成功/失敗契約。",
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
from typing import TypeVar, Generic

T = TypeVar("T")

@dataclass
class Ok(Generic[T]):
    value: T

@dataclass
class Err:
    error: str

type Result[T] = Ok[T] | Err

def fetch_user(id: int) -> Result[User]:
    user = repo.get(User, id)
    if user is None:
        return Err("not_found")
    return Ok(user)

def update_email(user_id: int, new_email: str) -> Result[User]:
    match fetch_user(user_id):
        case Err() as e:
            return e
        case Ok(user):
            match repo.update(user, email=new_email):
                case Err() as e:
                    return Err(f"Update failed: {e.error}")
                case Ok(updated):
                    return Ok(updated)`,

      typescript: `type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

function fetchUser(id: number): Result<User> {
  const user = repo.get(User, id)
  if (!user) return { ok: false, error: "not_found" }
  return { ok: true, value: user }
}

function updateEmail(userId: number, newEmail: string): Result<User> {
  const userResult = fetchUser(userId)
  if (!userResult.ok) return userResult

  const updateResult = repo.update(userResult.value, { email: newEmail })
  if (!updateResult.ok) return { ok: false, error: \`Update failed: \${updateResult.error}\` }

  return updateResult
}`,

      typescript_effect: `import { Effect, pipe } from "effect"

const fetchUser = (id: number) =>
  Effect.gen(function* () {
    const user = yield* repo.get(User, id)
    if (!user) return yield* Effect.fail(new NotFoundError())
    return user
  })

const updateEmail = (userId: number, newEmail: string) =>
  pipe(
    fetchUser(userId),
    Effect.flatMap((user) =>
      repo.update(user, { email: newEmail })
    ),
    Effect.mapError((e) => new UpdateError(e.message))
  )

// Caller: errors are typed, composable, and tracked
const program = pipe(
  updateEmail(42, "new@example.com"),
  Effect.catchTag("NotFoundError", () => Effect.succeed(fallback))
)`,

      go: `import "fmt"

func fetchUser(id int) (*User, error) {
	user, err := repo.Get(id)
	if err != nil {
		return nil, fmt.Errorf("not found: %w", err)
	}
	return user, nil
}

func updateEmail(userID int, newEmail string) (*User, error) {
	user, err := fetchUser(userID)
	if err != nil {
		return nil, err
	}

	updated, err := repo.Update(user, map[string]any{"email": newEmail})
	if err != nil {
		return nil, fmt.Errorf("update failed: %w", err)
	}
	return updated, nil
}`,

      csharp: `// C#: nullable return or custom Result<T>
public record Result<T>(bool IsOk, T? Value = default, string? Error = null)
{
    public static Result<T> Ok(T value) => new(true, Value: value);
    public static Result<T> Err(string error) => new(false, Error: error);
}

Result<User> FetchUser(int id)
{
    var user = repo.Get(id);
    return user is null
        ? Result<User>.Err("not_found")
        : Result<User>.Ok(user);
}

Result<User> UpdateEmail(int userId, string newEmail) =>
    FetchUser(userId) switch
    {
        { IsOk: false } r => r,
        { Value: var user } => repo.Update(user, newEmail) switch
        {
            { IsOk: false, Error: var e } => Result<User>.Err($"Update failed: {e}"),
            var ok => ok,
        },
    };`,

      dart: `sealed class Result<T> {}
class Ok<T> extends Result<T> { final T value; Ok(this.value); }
class Err<T> extends Result<T> { final String error; Err(this.error); }

Result<User> fetchUser(int id) {
  final user = repo.get(User, id);
  if (user == null) return Err('not_found');
  return Ok(user);
}

Result<User> updateEmail(int userId, String newEmail) =>
  switch (fetchUser(userId)) {
    Err(:final error) => Err(error),
    Ok(:final value) => switch (repo.update(value, email: newEmail)) {
      Err(:final error) => Err('Update failed: \$error'),
      Ok() && final result => result,
    },
  };`,

      swift: `enum AppError: Error {
  case notFound
  case updateFailed(String)
}

func fetchUser(id: Int) -> Result<User, AppError> {
  guard let user = repo.get(id) else {
    return .failure(.notFound)
  }
  return .success(user)
}

func updateEmail(userId: Int, newEmail: String) -> Result<User, AppError> {
  fetchUser(id: userId).flatMap { user in
    repo.update(user, email: newEmail)
      .mapError { .updateFailed($0.localizedDescription) }
  }
}`,

      kotlin: `sealed interface Result<out T>
data class Ok<T>(val value: T) : Result<T>
data class Err(val error: String) : Result<Nothing>

fun fetchUser(id: Int): Result<User> {
  val user = repo.get(id) ?: return Err("not_found")
  return Ok(user)
}

fun updateEmail(userId: Int, newEmail: String): Result<User> =
  when (val result = fetchUser(userId)) {
    is Err -> result
    is Ok -> when (val updated = repo.update(result.value, email = newEmail)) {
      is Err -> Err("Update failed: \${updated.error}")
      is Ok -> updated
    }
  }`,
    },
  },

  /* ── 3. Pipe Operator ── */
  {
    id: "pipe-operator",
    title: { en: "Pipe Operator & Data Pipelines", ja: "パイプ演算子とデータパイプライン" },
    description: {
      en: "Data flows left-to-right. Each step is locally obvious. No nested function calls to untangle.",
      ja: "データが左から右に流れる。各ステップがローカルに明白。解きほぐす必要のあるネストされた関数呼び出しなし。",
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

      python: `# Python: nested calls or intermediate variables
from functools import reduce

completed = [o for o in orders if o.status == "completed"]
totals = [o.total for o in completed]
revenue = round(sum(totals) * 1.1, 2)
print(f"Revenue: {revenue}")

# More complex pipeline
import re
result = "-".join(
    re.sub(r"[^a-z0-9\\s]", "",
        "  Hello, World!  ".strip().lower()
    ).split()
)
# => "hello-world"`,

      typescript: `// TypeScript: chain methods or nest
const revenue = orders
  .filter((o) => o.status === "completed")
  .map((o) => o.total)
  .reduce((a, b) => a + b, 0)

const withTax = Math.round(revenue * 1.1 * 100) / 100
console.log(\`Revenue: \${withTax}\`)

// More complex pipeline
const result = "  Hello, World!  "
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\\s]/g, "")
  .split(/\\s+/)
  .join("-")
// => "hello-world"`,

      typescript_effect: `import { pipe, Array, String } from "effect"

// Effect: pipe() gives you Elixir-style composition
const revenue = pipe(
  orders,
  Array.filter((o) => o.status === "completed"),
  Array.map((o) => o.total),
  Array.reduce(0, (a, b) => a + b),
  (sum) => Math.round(sum * 1.1 * 100) / 100
)

// More complex pipeline
const result = pipe(
  "  Hello, World!  ",
  String.trim,
  String.toLowerCase,
  (s) => s.replace(/[^a-z0-9\\s]/g, ""),
  String.split(/\\s+/),
  Array.join("-")
)`,

      go: `// Go: explicit loops, no built-in pipe
var total float64
for _, o := range orders {
    if o.Status == "completed" {
        total += o.Total
    }
}
revenue := math.Round(total*1.1*100) / 100
fmt.Printf("Revenue: %.2f\\n", revenue)

// More complex pipeline
s := strings.TrimSpace("  Hello, World!  ")
s = strings.ToLower(s)
re := regexp.MustCompile(\`[^a-z0-9\\s]\`)
s = re.ReplaceAllString(s, "")
result := strings.Join(strings.Fields(s), "-")
// => "hello-world"`,

      csharp: `// C#: LINQ chains
using System.Text.RegularExpressions;

var revenue = Math.Round(
    orders
        .Where(o => o.Status == "completed")
        .Sum(o => o.Total) * 1.1, 2);
Console.WriteLine($"Revenue: {revenue}");

// More complex pipeline
var result = string.Join("-",
    Regex.Replace(
        "  Hello, World!  ".Trim().ToLower(),
        @"[^a-z0-9\\s]", "")
    .Split(' ', StringSplitOptions.RemoveEmptyEntries));
// => "hello-world"`,

      dart: `// Dart: cascade or chained
final revenue = orders
    .where((o) => o.status == OrderStatus.completed)
    .map((o) => o.total)
    .fold<double>(0, (a, b) => a + b);

final withTax = (revenue * 1.1).roundToDouble();
print('Revenue: \$withTax');

// More complex pipeline
final result = '  Hello, World!  '
    .trim()
    .toLowerCase()
    .replaceAll(RegExp(r'[^a-z0-9\\s]'), '')
    .split(RegExp(r'\\s+'))
    .join('-');
// => "hello-world"`,

      swift: `// Swift: method chaining where available
let revenue = orders
    .filter { $0.status == .completed }
    .map(\\.total)
    .reduce(0, +)

let withTax = (revenue * 1.1).rounded(.toNearestOrEven)
print("Revenue: \\(withTax)")

// More complex pipeline  - no built-in pipe
let trimmed = "  Hello, World!  ".trimmingCharacters(in: .whitespaces)
let lowered = trimmed.lowercased()
let cleaned = lowered.replacing(/[^a-z0-9\\s]/, with: "")
let result = cleaned.split(separator: " ").joined(separator: "-")
// => "hello-world"`,

      kotlin: `// Kotlin: scope functions help but no pipe
val revenue = orders
    .filter { it.status == Status.COMPLETED }
    .sumOf { it.total }
    .let { (it * 1.1).roundTo(2) }
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
      en: "Chain multiple operations that can fail. Each step pattern-matches on success. Failures short-circuit cleanly.",
      ja: "失敗する可能性のある複数の操作を連鎖。各ステップで成功をパターンマッチ。失敗は綺麗にショートサーキット。",
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

      python: `def create_order(params: OrderParams) -> Result[Order]:
    # Python: nested match or early returns
    match authenticate(params.token):
        case Err(e):
            return Err("Please log in")
        case Ok(user):
            pass

    match validate_items(params.items):
        case Err(e):
            return Err("Invalid cart")
        case Ok(items):
            pass

    match charge_card(user, items):
        case Err(e):
            return Err("Payment declined")
        case Ok(payment):
            pass

    match save_order(user, items, payment):
        case Err(e):
            return Err(f"Order failed: {e}")
        case Ok(order):
            send_confirmation(user, order)
            return Ok(order)`,

      typescript: `function createOrder(params: OrderParams): Result<Order> {
  // TypeScript: manual chaining
  const authResult = authenticate(params.token)
  if (!authResult.ok) return { ok: false, error: "Please log in" }

  const itemsResult = validateItems(params.items)
  if (!itemsResult.ok) return { ok: false, error: "Invalid cart" }

  const paymentResult = chargeCard(authResult.value, itemsResult.value)
  if (!paymentResult.ok) return { ok: false, error: "Payment declined" }

  const orderResult = saveOrder(
    authResult.value, itemsResult.value, paymentResult.value
  )
  if (!orderResult.ok) return { ok: false, error: \`Order failed: \${orderResult.error}\` }

  sendConfirmation(authResult.value, orderResult.value)
  return orderResult
}`,

      typescript_effect: `import { Effect, pipe } from "effect"

// Effect: gen() gives you with-like ergonomics
const createOrder = (params: OrderParams) =>
  Effect.gen(function* () {
    const user    = yield* authenticate(params.token)
    const items   = yield* validateItems(params.items)
    const payment = yield* chargeCard(user, items)
    const order   = yield* saveOrder(user, items, payment)
    yield* sendConfirmation(user, order)
    return order
  }).pipe(
    Effect.catchTags({
      Unauthorized: () => Effect.fail(new OrderError("Please log in")),
      InvalidItems: () => Effect.fail(new OrderError("Invalid cart")),
      PaymentFailed: () => Effect.fail(new OrderError("Payment declined")),
    })
  )`,

      go: `func createOrder(params OrderParams) (*Order, error) {
	user, err := authenticate(params.Token)
	if err != nil {
		return nil, fmt.Errorf("please log in: %w", err)
	}

	items, err := validateItems(params.Items)
	if err != nil {
		return nil, fmt.Errorf("invalid cart: %w", err)
	}

	payment, err := chargeCard(user, items)
	if err != nil {
		return nil, fmt.Errorf("payment declined: %w", err)
	}

	order, err := saveOrder(user, items, payment)
	if err != nil {
		return nil, fmt.Errorf("order failed: %w", err)
	}

	sendConfirmation(user, order)
	return order, nil
}`,

      csharp: `Result<Order> CreateOrder(OrderParams p)
{
    var auth = Authenticate(p.Token);
    if (!auth.IsOk) return Result<Order>.Err("Please log in");

    var items = ValidateItems(p.Items);
    if (!items.IsOk) return Result<Order>.Err("Invalid cart");

    var payment = ChargeCard(auth.Value!, items.Value!);
    if (!payment.IsOk) return Result<Order>.Err("Payment declined");

    var order = SaveOrder(auth.Value!, items.Value!, payment.Value!);
    if (!order.IsOk) return Result<Order>.Err($"Order failed: {order.Error}");

    SendConfirmation(auth.Value!, order.Value!);
    return order;
}`,

      dart: `Future<Result<Order>> createOrder(OrderParams params) async {
  return switch (await authenticate(params.token)) {
    Err(:final error) => Err('Please log in'),
    Ok(value: final user) => switch (await validateItems(params.items)) {
      Err(:final error) => Err('Invalid cart'),
      Ok(value: final items) => switch (await chargeCard(user, items)) {
        Err(:final error) => Err('Payment declined'),
        Ok(value: final payment) =>
          switch (await saveOrder(user, items, payment)) {
            Err(:final error) => Err('Order failed: \$error'),
            Ok(value: final order) => () {
              sendConfirmation(user, order);
              return Ok(order);
            }(),
          },
      },
    },
  };
}`,

      swift: `func createOrder(_ params: OrderParams) -> Result<Order, OrderError> {
  authenticate(params.token)
    .mapError { _ in .unauthorized("Please log in") }
    .flatMap { user in
      validateItems(params.items)
        .mapError { _ in .invalidItems("Invalid cart") }
        .flatMap { items in
          chargeCard(user, items)
            .mapError { _ in .paymentFailed("Payment declined") }
            .flatMap { payment in
              saveOrder(user, items, payment)
                .map { order in
                  sendConfirmation(user, order)
                  return order
                }
            }
        }
    }
}`,

      kotlin: `fun createOrder(params: OrderParams): Result<Order> {
  val user = when (val r = authenticate(params.token)) {
    is Err -> return Err("Please log in")
    is Ok -> r.value
  }
  val items = when (val r = validateItems(params.items)) {
    is Err -> return Err("Invalid cart")
    is Ok -> r.value
  }
  val payment = when (val r = chargeCard(user, items)) {
    is Err -> return Err("Payment declined")
    is Ok -> r.value
  }
  val order = when (val r = saveOrder(user, items, payment)) {
    is Err -> return Err("Order failed: \${r.error}")
    is Ok -> r.value
  }
  sendConfirmation(user, order)
  return Ok(order)
}`,
    },
  },

  /* ── 5. GenServer / Concurrency ── */
  {
    id: "concurrency",
    title: { en: "Concurrency & State", ja: "並行処理と状態管理" },
    description: {
      en: "GenServer  - isolated processes with explicit message contracts. No shared mutable state, no locks, no data races.",
      ja: "GenServer  - 明示的なメッセージ契約を持つ分離プロセス。共有ミュータブル状態なし、ロックなし、データ競合なし。",
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
from dataclasses import dataclass, field

class Counter:
    """Python: manual locking required for thread safety"""
    def __init__(self, initial: int = 0):
        self._count = initial
        self._lock = asyncio.Lock()

    async def increment(self) -> int:
        async with self._lock:
            self._count += 1
            return self._count

    async def get(self) -> int:
        async with self._lock:
            return self._count

# Usage
counter = Counter(0)
await counter.increment()  # => 1
await counter.increment()  # => 2
await counter.get()        # => 2`,

      typescript: `// TypeScript: no built-in actor model
class Counter {
  private count: number

  constructor(initial = 0) {
    this.count = initial
  }

  increment(): number {
    return ++this.count
    // ⚠️ Not thread-safe in worker threads
  }

  get(): number {
    return this.count
  }
}

// For concurrency, you'd need worker_threads + MessagePort
// or a library like comlink`,

      typescript_effect: `import { Effect, Ref } from "effect"

// Effect: Ref provides safe concurrent state
const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0)

  const increment = Ref.updateAndGet(counter, (n) => n + 1)
  const get = Ref.get(counter)

  // Concurrent operations are safe by design
  yield* increment  // => 1
  yield* increment  // => 2
  const value = yield* get  // => 2
  return value
})`,

      go: `// Go: channels or mutex for concurrent state
type Counter struct {
	mu    sync.Mutex
	count int
}

func NewCounter(initial int) *Counter {
	return &Counter{count: initial}
}

func (c *Counter) Increment() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.count++
	return c.count
}

func (c *Counter) Get() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.count
}

// Or use channels for actor-like pattern
// but significantly more boilerplate`,

      csharp: `// C#: lock or SemaphoreSlim for thread safety
class Counter
{
    private int _count;
    private readonly object _lock = new();

    public Counter(int initial = 0) => _count = initial;

    public int Increment()
    {
        lock (_lock) { return ++_count; }
    }

    public int Get()
    {
        lock (_lock) { return _count; }
    }
}

// Usage
var counter = new Counter(0);
counter.Increment();  // => 1
counter.Increment();  // => 2
counter.Get();        // => 2`,

      dart: `// Dart: Isolates for concurrency (similar to actors)
import 'dart:isolate';

class Counter {
  int _count;
  Counter(this._count);

  int increment() => ++_count;
  int get() => _count;
}

// For true concurrency, use Isolates:
Future<void> main() async {
  final receivePort = ReceivePort();
  await Isolate.spawn(_counterIsolate, receivePort.sendPort);
  // More boilerplate for message passing...
}

void _counterIsolate(SendPort sendPort) {
  final counter = Counter(0);
  final receivePort = ReceivePort();
  sendPort.send(receivePort.sendPort);
  receivePort.listen((message) {
    // Handle messages...
  });
}`,

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

      kotlin: `// Kotlin: coroutines + Mutex or actors
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class Counter(initial: Int = 0) {
    private var count = initial
    private val mutex = Mutex()

    suspend fun increment(): Int = mutex.withLock {
        ++count
    }

    suspend fun get(): Int = mutex.withLock {
        count
    }
}

// Usage
val counter = Counter(0)
counter.increment()  // => 1
counter.increment()  // => 2
counter.get()        // => 2`,
    },
  },

  /* ── 6. Doctests ── */
  {
    id: "doctests",
    title: { en: "Executable Documentation", ja: "実行可能なドキュメント" },
    description: {
      en: "Tests live inside your docs. Documentation is always correct because it's executed. Perfect alignment for LLMs.",
      ja: "テストがドキュメント内に存在。実行されるのでドキュメントは常に正しい。LLMにとって完璧な整合性。",
    },
    icon: <BookOpen className="w-4 h-4" />,
    snippets: {
      elixir: `defmodule Math do
  @moduledoc """
  Basic math operations with overflow protection.
  """

  @doc """
  Safely adds two integers, returning an error on overflow.

  ## Examples

      iex> Math.safe_add(1, 2)
      {:ok, 3}

      iex> Math.safe_add(9_999_999_999, 1)
      {:error, :overflow}

      iex> Math.safe_add(-1, -2)
      {:ok, -3}

  """
  @spec safe_add(integer(), integer()) :: {:ok, integer()} | {:error, :overflow}
  def safe_add(a, b) when is_integer(a) and is_integer(b) do
    result = a + b
    if abs(result) > 9_999_999_999, do: {:error, :overflow}, else: {:ok, result}
  end
end

# Run: mix test
# Doctests are automatically extracted and executed as tests!`,

      python: `def safe_add(a: int, b: int) -> tuple[str, int] | tuple[str, str]:
    """Safely adds two integers, returning an error on overflow.

    >>> safe_add(1, 2)
    ('ok', 3)
    >>> safe_add(9_999_999_999, 1)
    ('error', 'overflow')
    >>> safe_add(-1, -2)
    ('ok', -3)
    """
    result = a + b
    if abs(result) > 9_999_999_999:
        return ("error", "overflow")
    return ("ok", result)

# Run: python -m doctest module.py
# ⚠️ Doctests exist but are rarely used in practice
# ⚠️ No integration with type hints or test frameworks`,

      typescript: `// TypeScript: no built-in doctest support
// Use JSDoc comments + separate test files

/**
 * Safely adds two integers, returning an error on overflow.
 *
 * @example
 * safeAdd(1, 2) // => { ok: true, value: 3 }
 * safeAdd(9_999_999_999, 1) // => { ok: false, error: "overflow" }
 */
function safeAdd(a: number, b: number): Result<number> {
  const result = a + b
  if (Math.abs(result) > 9_999_999_999)
    return { ok: false, error: "overflow" }
  return { ok: true, value: result }
}

// Tests must live in a separate file:
// safeAdd.test.ts
// ⚠️ Examples in JSDoc can go stale - they're never executed`,

      typescript_effect: `import { Effect } from "effect"

// TS Effect: same limitation - no executable docs
// But Effect's type system helps keep contracts explicit

class OverflowError {
  readonly _tag = "OverflowError"
}

const safeAdd = (a: number, b: number) =>
  Effect.gen(function* () {
    const result = a + b
    if (Math.abs(result) > 9_999_999_999) {
      return yield* Effect.fail(new OverflowError())
    }
    return result
  })

// At least errors are tracked in the type system:
// Effect<number, OverflowError, never>`,

      go: `// Go: Example functions serve as executable docs
package math

import "errors"

var ErrOverflow = errors.New("overflow")

// SafeAdd safely adds two integers.
func SafeAdd(a, b int) (int, error) {
	result := a + b
	if result > 9_999_999_999 || result < -9_999_999_999 {
		return 0, ErrOverflow
	}
	return result, nil
}

// In math_test.go  - Example functions run as tests:
func ExampleSafeAdd() {
	result, _ := SafeAdd(1, 2)
	fmt.Println(result)
	// Output: 3
}
// ✅ Go's Example tests are closest to Elixir doctests`,

      csharp: `// C#: no built-in doctest
// XML doc comments + separate test project

/// <summary>
/// Safely adds two integers, returning an error on overflow.
/// </summary>
/// <example>
/// SafeAdd(1, 2)        // => (true, 3, null)
/// SafeAdd(9999999999, 1) // => (false, 0, "overflow")
/// </example>
static (bool Ok, long Value, string? Error) SafeAdd(long a, long b)
{
    var result = a + b;
    return Math.Abs(result) > 9_999_999_999
        ? (false, 0, "overflow")
        : (true, result, null);
}

// ⚠️ XML doc examples are NOT executed
// Must maintain separate xUnit/NUnit test project`,

      dart: `// Dart: no built-in doctest
// Use doc comments + separate test files

/// Safely adds two integers, returning an error on overflow.
///
/// \`\`\`dart
/// safeAdd(1, 2);  // => Ok(3)
/// safeAdd(9999999999, 1);  // => Err('overflow')
/// \`\`\`
Result<int> safeAdd(int a, int b) {
  final result = a + b;
  if (result.abs() > 9999999999) return Err('overflow');
  return Ok(result);
}

// ⚠️ Code examples in /// comments are NOT executed
// Must maintain separate test/math_test.dart`,

      swift: `// Swift: no built-in doctest
// DocC supports code snippets but doesn't execute them

/// Safely adds two integers.
///
/// \`\`\`swift
/// safeAdd(1, 2)  // .success(3)
/// safeAdd(9_999_999_999, 1)  // .failure(.overflow)
/// \`\`\`
func safeAdd(_ a: Int, _ b: Int) -> Result<Int, MathError> {
    let result = a + b
    guard abs(result) <= 9_999_999_999 else {
        return .failure(.overflow)
    }
    return .success(result)
}

// ⚠️ Swift doc snippets are not executable
// Must maintain separate XCTest file`,

      kotlin: `// Kotlin: no built-in doctest
// KDoc supports code samples but doesn't execute them

/**
 * Safely adds two integers.
 *
 * \`\`\`kotlin
 * safeAdd(1, 2)  // Ok(3)
 * safeAdd(9_999_999_999, 1)  // Err("overflow")
 * \`\`\`
 */
fun safeAdd(a: Long, b: Long): Result<Long> {
    val result = a + b
    return if (kotlin.math.abs(result) > 9_999_999_999L)
        Err("overflow")
    else
        Ok(result)
}

// ⚠️ KDoc code samples are NOT executed
// Must maintain separate JUnit test file`,
    },
  },

  /* ── 7. Comprehensions with Filters ── */
  {
    id: "comprehensions",
    title: { en: "Comprehensions & Generators", ja: "内包表記とジェネレータ" },
    description: {
      en: "for comprehensions with multiple generators, filters, and into:  - expressive, flat, and obvious.",
      ja: "複数ジェネレータ、フィルタ、into:を持つfor内包表記  - 表現力豊か、フラット、明白。",
    },
    icon: <FlaskConical className="w-4 h-4" />,
    snippets: {
      elixir: `# Cartesian product with filters and collection target
for x <- 1..10,
    y <- 1..10,
    x + y > 12,
    rem(x * y, 3) == 0,
    into: MapSet.new() do
  {x, y}
end
# => MapSet of tuples where x+y > 12 and x*y divisible by 3

# Parse and transform in one shot
for line <- File.stream!("data.csv"),
    [name, score] = String.split(line, ","),
    score = String.trim(score) |> String.to_integer(),
    score > 80 do
  %{name: String.trim(name), score: score, grade: "A"}
end`,

      python: `# Python: list/set comprehensions
result = {
    (x, y)
    for x in range(1, 11)
    for y in range(1, 11)
    if x + y > 12 and (x * y) % 3 == 0
}

# Parse and transform
with open("data.csv") as f:
    results = [
        {"name": name.strip(), "score": int(score.strip()), "grade": "A"}
        for line in f
        for name, score in [line.split(",")]
        if int(score.strip()) > 80
    ]`,

      typescript: `// TypeScript: flatMap chains or loops
const result = new Set<string>()
for (let x = 1; x <= 10; x++) {
  for (let y = 1; y <= 10; y++) {
    if (x + y > 12 && (x * y) % 3 === 0) {
      result.add(\`\${x},\${y}\`)
    }
  }
}

// Parse and transform
const lines = fs.readFileSync("data.csv", "utf8").split("\\n")
const results = lines
  .map((line) => line.split(","))
  .filter(([, score]) => parseInt(score.trim()) > 80)
  .map(([name, score]) => ({
    name: name.trim(),
    score: parseInt(score.trim()),
    grade: "A",
  }))`,

      typescript_effect: `import { Array, pipe } from "effect"

// Effect: functional composition
const pairs = pipe(
  Array.range(1, 10),
  Array.flatMap((x) =>
    pipe(
      Array.range(1, 10),
      Array.filter((y) => x + y > 12 && (x * y) % 3 === 0),
      Array.map((y) => [x, y] as const)
    )
  )
)

// For file processing, use Effect streams
import { Stream } from "effect"
const results = pipe(
  Stream.fromReadableStream(fileStream),
  Stream.splitLines,
  Stream.map((line) => line.split(",")),
  Stream.filter(([, score]) => parseInt(score) > 80),
  Stream.map(([name, score]) => ({
    name: name.trim(),
    score: parseInt(score),
    grade: "A",
  }))
)`,

      go: `// Go: explicit loops only
result := make(map[[2]int]bool)
for x := 1; x <= 10; x++ {
    for y := 1; y <= 10; y++ {
        if x+y > 12 && (x*y)%3 == 0 {
            result[[2]int{x, y}] = true
        }
    }
}

// Parse and transform
file, _ := os.Open("data.csv")
scanner := bufio.NewScanner(file)
var results []Record
for scanner.Scan() {
    parts := strings.SplitN(scanner.Text(), ",", 2)
    score, _ := strconv.Atoi(strings.TrimSpace(parts[1]))
    if score > 80 {
        results = append(results, Record{
            Name: strings.TrimSpace(parts[0]),
            Score: score, Grade: "A",
        })
    }
}`,

      csharp: `// C#: LINQ queries
var result = (
    from x in Enumerable.Range(1, 10)
    from y in Enumerable.Range(1, 10)
    where x + y > 12 && (x * y) % 3 == 0
    select (x, y)
).ToHashSet();

// Parse and transform
var results = File.ReadLines("data.csv")
    .Select(line => line.Split(','))
    .Where(parts => int.Parse(parts[1].Trim()) > 80)
    .Select(parts => new {
        Name = parts[0].Trim(),
        Score = int.Parse(parts[1].Trim()),
        Grade = "A"
    })
    .ToList();`,

      dart: `// Dart: collection for + where
final result = {
  for (var x = 1; x <= 10; x++)
    for (var y = 1; y <= 10; y++)
      if (x + y > 12 && (x * y) % 3 == 0) (x, y),
};

// Parse and transform
final lines = File('data.csv').readAsLinesSync();
final results = [
  for (final line in lines)
    if (line.split(',') case [var name, var score]
        when int.parse(score.trim()) > 80)
      {'name': name.trim(), 'score': int.parse(score.trim()), 'grade': 'A'},
];`,

      swift: `// Swift: flatMap + filter
let result: Set<[Int]> = Set(
    (1...10).flatMap { x in
        (1...10).compactMap { y in
            x + y > 12 && (x * y) % 3 == 0 ? [x, y] : nil
        }
    }
)

// Parse and transform
let contents = try String(contentsOfFile: "data.csv")
let results = contents.split(separator: "\\n").compactMap { line -> Record? in
    let parts = line.split(separator: ",")
    guard parts.count == 2,
          let score = Int(parts[1].trimmingCharacters(in: .whitespaces)),
          score > 80 else { return nil }
    return Record(
        name: parts[0].trimmingCharacters(in: .whitespaces),
        score: score, grade: "A"
    )
}`,

      kotlin: `// Kotlin: sequence + flatMap
val result = (1..10).flatMap { x ->
    (1..10).filter { y ->
        x + y > 12 && (x * y) % 3 == 0
    }.map { y -> x to y }
}.toSet()

// Parse and transform
val results = File("data.csv").readLines()
    .map { it.split(",") }
    .filter { it[1].trim().toInt() > 80 }
    .map { (name, score) ->
        mapOf(
            "name" to name.trim(),
            "score" to score.trim().toInt(),
            "grade" to "A"
        )
    }`,
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

function CodeComparison({ sample, lang }: { sample: CodeSample; lang: Lang }) {
  const [activeLang, setActiveLang] = useState<LangId>("python");
  const [mobileLang, setMobileLang] = useState<LangId>("elixir");
  const isJa = lang === "ja";
  const fontBody = isJa ? JA_SANS : SANS;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2.5 mb-1">
          <span style={{ color: LANG_COLORS.elixir }}>{sample.icon}</span>
          <h3 className="text-[18px] sm:text-[20px] font-bold m-0" style={{ fontFamily: fontBody }}>
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
        className="w-[80px] sm:w-[100px] text-[13px] font-bold shrink-0"
        style={{ fontFamily: MONO, color: data.color }}
      >
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
          <Zap className="w-4 h-4" style={{ color: "#9B59B6" }} />
          <h2 className="text-[18px] font-black m-0" style={{ fontFamily: fontBody }}>{l.tldr}</h2>
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
          <Zap className="w-4 h-4" style={{ color: "#10B981" }} />
          <h2 className="text-[18px] sm:text-[20px] font-bold m-0" style={{ fontFamily: fontBody }}>
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
                <div className="text-[15px] font-bold mb-1.5" style={{ color: c, fontFamily: fontBody }}>
                  {p.title}
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
          <h2 className="text-[22px] sm:text-[26px] font-black m-0" style={{ fontFamily: fontBody }}>
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
          <Code2 className="w-5 h-5" style={{ color: "#9B59B6" }} />
          <h2
            className="text-[24px] sm:text-[30px] font-black m-0"
            style={{
              fontFamily: isJa ? JA_SANS : SANS,
              letterSpacing: isJa ? 0 : -0.8,
            }}
          >
            {l.codeTitle}
          </h2>
        </div>
        <p className="text-sm sm:text-base mt-1 mb-6 max-w-[720px]" style={{ color: "rgba(255,255,255,0.58)", fontFamily: fontBody }}>
          {l.codeSub}
        </p>

        {codeSamples.map((sample) => (
          <CodeComparison key={sample.id} sample={sample} lang={lang} />
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
        <h3 className="text-[20px] font-bold mb-2" style={{ fontFamily: fontBody }}>
          {l.paperLink}
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
