export type LanguageBasis = "FULL" | "VALIDATED" | "SLICE";

export interface LanguageBenchmarkRow {
  language: string;
  passRate: number;
  passed: number;
  total: number;
  basis: LanguageBasis;
  note: string;
}

export interface LanguageBenchmarkDataset {
  id: string;
  model: string;
  scope: string;
  snapshotDate: string;
  overall: {
    passed: number;
    total: number;
    passRate: number;
  };
  rows: LanguageBenchmarkRow[];
}

/**
 * Claude Opus 4 (20250514) — original AutoCodeBench paper results.
 * Source: arxiv.org/abs/2508.09101 — Table 4 (Reasoning Mode)
 */
export const opus4LanguageBenchmarks: LanguageBenchmarkDataset = {
  id: "opus-4-20250514",
  model: "Claude Opus 4",
  scope: "AutoCodeBench paper (Table 4, Reasoning Mode)",
  snapshotDate: "2025-05-14",
  overall: {
    passed: 2055,
    total: 3919,
    passRate: 52.4,
  },
  rows: [
    { language: "elixir", passRate: 80.3, passed: 159, total: 198, basis: "FULL", note: "ACB paper" },
    { language: "csharp", passRate: 74.9, passed: 149, total: 199, basis: "FULL", note: "ACB paper" },
    { language: "kotlin", passRate: 72.5, passed: 145, total: 200, basis: "FULL", note: "ACB paper" },
    { language: "racket", passRate: 68.9, passed: 136, total: 198, basis: "FULL", note: "ACB paper" },
    { language: "ruby", passRate: 61.0, passed: 121, total: 199, basis: "FULL", note: "ACB paper" },
    { language: "java", passRate: 55.9, passed: 105, total: 188, basis: "FULL", note: "ACB paper" },
    { language: "julia", passRate: 55.5, passed: 111, total: 200, basis: "FULL", note: "ACB paper" },
    { language: "dart", passRate: 54.0, passed: 108, total: 200, basis: "FULL", note: "ACB paper" },
    { language: "r", passRate: 52.5, passed: 105, total: 200, basis: "FULL", note: "ACB paper" },
    { language: "shell", passRate: 51.6, passed: 97, total: 188, basis: "FULL", note: "ACB paper" },
    { language: "scala", passRate: 50.3, passed: 101, total: 200, basis: "FULL", note: "ACB paper" },
    { language: "swift", passRate: 50.0, passed: 100, total: 199, basis: "FULL", note: "ACB paper" },
    { language: "typescript", passRate: 47.2, passed: 94, total: 199, basis: "FULL", note: "ACB paper" },
    { language: "perl", passRate: 44.5, passed: 89, total: 199, basis: "FULL", note: "ACB paper" },
    { language: "cpp", passRate: 44.1, passed: 82, total: 186, basis: "FULL", note: "ACB paper" },
    { language: "python", passRate: 40.3, passed: 79, total: 196, basis: "FULL", note: "ACB paper" },
    { language: "rust", passRate: 38.7, passed: 77, total: 199, basis: "FULL", note: "ACB paper" },
    { language: "javascript", passRate: 38.6, passed: 71, total: 184, basis: "FULL", note: "ACB paper" },
    { language: "go", passRate: 37.2, passed: 71, total: 191, basis: "FULL", note: "ACB paper" },
    { language: "php", passRate: 28.1, passed: 55, total: 196, basis: "FULL", note: "ACB paper" },
  ],
};

export const gpt54MediumLanguageBenchmarks: LanguageBenchmarkDataset = {
  id: "gpt-5.4-medium",
  model: "GPT-5.4 Medium",
  scope: "AutoCodeBenchmark fork local run",
  snapshotDate: "2026-03-11",
  overall: {
    passed: 10512,
    total: 19740,
    passRate: 53.3,
  },
  rows: [
    { language: "elixir", passRate: 87.4, passed: 874, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "kotlin", passRate: 76.5, passed: 765, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "csharp", passRate: 72.4, passed: 724, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "ruby", passRate: 63.0, passed: 630, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "julia", passRate: 57.0, passed: 570, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "dart", passRate: 56.5, passed: 565, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "r", passRate: 54.5, passed: 545, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "typescript_effect", passRate: 53.6, passed: 536, total: 1000, basis: "SLICE", note: "translated slice" },
    { language: "java", passRate: 51.1, passed: 511, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "racket", passRate: 51.0, passed: 510, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "scala", passRate: 50.8, passed: 508, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "shell", passRate: 50.5, passed: 505, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "cpp", passRate: 50.0, passed: 500, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "typescript", passRate: 49.2, passed: 492, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "perl", passRate: 44.5, passed: 445, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "python", passRate: 43.9, passed: 439, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "swift", passRate: 43.5, passed: 435, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "go", passRate: 42.9, passed: 429, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "javascript", passRate: 42.9, passed: 429, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "rust", passRate: 40.2, passed: 402, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "php", passRate: 35.7, passed: 357, total: 1000, basis: "FULL", note: "ACB-Full" },
    { language: "lean4", passRate: 28.8, passed: 180, total: 625, basis: "VALIDATED", note: "validated translated subset" },
    { language: "gleam", passRate: 20.5, passed: 125, total: 610, basis: "VALIDATED", note: "validated translated subset" },
  ],
};

export function getSortedLanguageRows() {
  return [...gpt54MediumLanguageBenchmarks.rows].sort(
    (a, b) => b.passRate - a.passRate || a.language.localeCompare(b.language),
  );
}

const HIDDEN_LANGUAGES = new Set(["gleam", "lean4"]);

export function getFilteredLanguageRows() {
  return getSortedLanguageRows().filter((row) => !HIDDEN_LANGUAGES.has(row.language));
}

export function getTopLanguageRows(limit = 5) {
  return getFilteredLanguageRows().slice(0, limit);
}

/** Merged row for cross-model comparison. Sorted by GPT-5.4 pass rate descending. */
export interface ComparisonRow {
  language: string;
  gpt54: LanguageBenchmarkRow | null;
  opus4: LanguageBenchmarkRow | null;
  delta: number | null; // gpt54 - opus4 (positive = GPT-5.4 is better)
}

export function getComparisonRows(): ComparisonRow[] {
  const gptMap = new Map(gpt54MediumLanguageBenchmarks.rows.map((r) => [r.language, r]));
  const opusMap = new Map(opus4LanguageBenchmarks.rows.map((r) => [r.language, r]));
  const allLangs = new Set([...gptMap.keys(), ...opusMap.keys()]);

  const rows: ComparisonRow[] = [];
  for (const lang of allLangs) {
    if (HIDDEN_LANGUAGES.has(lang)) continue;
    const g = gptMap.get(lang) ?? null;
    const o = opusMap.get(lang) ?? null;
    rows.push({
      language: lang,
      gpt54: g,
      opus4: o,
      delta: g && o ? +(g.passRate - o.passRate).toFixed(1) : null,
    });
  }
  return rows.sort((a, b) => {
    const aRate = a.gpt54?.passRate ?? a.opus4?.passRate ?? 0;
    const bRate = b.gpt54?.passRate ?? b.opus4?.passRate ?? 0;
    return bRate - aRate || a.language.localeCompare(b.language);
  });
}
