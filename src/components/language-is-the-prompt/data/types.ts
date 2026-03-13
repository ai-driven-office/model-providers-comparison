import type { Lang } from "../../../data/i18n";

export const LANG_IDS = [
  "elixir",
  "python",
  "typescript",
  "typescript_effect",
  "go",
  "csharp",
  "dart",
  "swift",
  "kotlin",
  "rust",
  "ruby",
  "julia",
  "r",
  "java",
  "racket",
  "scala",
  "shell",
  "cpp",
  "perl",
  "javascript",
  "php",
  "zig",
  "lean",
  "idris",
  "bean",
  "mojo",
  "c",
  "d",
  "moonbit",
  "fsharp",
  "clojure",
  "erlang",
  "gleam",
  "haskell",
  "lisp",
  "lua",
  "prose",
  "agda",
  "coq",
  "dream",
] as const;

export type LangId = typeof LANG_IDS[number];
export type CodeSampleImportance = "critical" | "high" | "medium";
export type CodeSampleIconId =
  | "git-branch"
  | "shield"
  | "lock"
  | "layers"
  | "paintbrush"
  | "sparkles"
  | "cpu"
  | "book-open"
  | "flask-conical";
export type CodeSampleDiagramId = "doc-pipeline";
export type PrincipleIconId =
  | "contract"
  | "pattern"
  | "lock"
  | "pipe"
  | "format"
  | "docs";

export interface LocalizedText {
  en: string;
  ja: string;
}

export interface LibRef {
  lang: LangId;
  name: string;
  url?: string;
  builtin?: boolean;
}

export interface CodeAnnotation {
  match: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface CodeSample {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  importance?: CodeSampleImportance;
  icon: CodeSampleIconId;
  diagramId?: CodeSampleDiagramId;
  snippets: Partial<Record<LangId, string>>;
  libraries?: LibRef[];
  caveats?: LocalizedText;
  annotations?: Partial<Record<LangId, CodeAnnotation[]>>;
}

export type HighlightMap = Record<string, Partial<Record<LangId, string>>>;

export interface LanguagePromptPrinciple {
  title: string;
  desc: string;
  icon: PrincipleIconId;
}

export interface LanguagePromptCopyEntry {
  back: string;
  badge: string;
  title: string;
  subtitle: string;
  heroStat1Label: string;
  heroStat1Value: string;
  heroStat2Label: string;
  heroStat2Value: string;
  heroStat3Label: string;
  heroStat3Value: string;
  tldr: string;
  tldrText: string;
  whyTitle: string;
  whyPoints: string[];
  hypothesisTitle: string;
  hypothesisSub: string;
  principles: LanguagePromptPrinciple[];
  difficultyTitle: string;
  difficultySub: string;
  difficultyNote: string;
  codeTitle: string;
  codeSub: string;
  codeNote: string;
  readPaperCta: string;
  readPaperCtaSub: string;
  paperLink: string;
  paperLinkSub: string;
  methodology: string;
}

export type LanguagePromptPageCopy = Record<Lang, LanguagePromptCopyEntry>;

export interface DifficultyDatum {
  lang: string;
  easy: number;
  medium: number;
  hard: number;
  degradation: number;
  color: string;
}

export interface LanguagePromptPageContent {
  copy: LanguagePromptPageCopy;
  difficultyData: DifficultyDatum[];
}
