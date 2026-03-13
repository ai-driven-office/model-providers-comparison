import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { CodeSample, LangId } from "../LanguageIsThePromptPage";
import { codeSamplesSpec } from "./codeSamplesSpec.ts";

const PROJECT_ROOT = process.cwd();
const SNIPPET_PATH_PREFIXES = [
  "src/components/",
  "language-is-the-prompt/",
];

type SnippetCacheEntry = {
  mtimeMs: number;
  contents: string;
};

const snippetCache = new Map<string, SnippetCacheEntry>();

function resolveSnippetPath(snippetPath: string): string {
  const normalized = snippetPath.replace(/^\/+/, "");

  if (path.isAbsolute(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("src/components/")) {
    return path.join(PROJECT_ROOT, normalized);
  }

  if (normalized.startsWith("language-is-the-prompt/")) {
    return path.join(PROJECT_ROOT, "src/components", normalized);
  }

  if (SNIPPET_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return path.join(PROJECT_ROOT, normalized);
  }

  return path.join(PROJECT_ROOT, "src/components", normalized);
}

async function readSnippet(snippetPath: string): Promise<string> {
  const fullPath = resolveSnippetPath(snippetPath);
  const stats = await stat(fullPath);
  const cached = snippetCache.get(fullPath);

  if (cached && cached.mtimeMs === stats.mtimeMs) {
    return cached.contents;
  }

  const contents = await readFile(fullPath, "utf8");
  snippetCache.set(fullPath, { mtimeMs: stats.mtimeMs, contents });
  return contents;
}

export async function loadCodeSamples(): Promise<CodeSample[]> {
  const samples = await Promise.all(
    codeSamplesSpec.map(async (sampleSpec) => {
      const snippetEntries = await Promise.all(
        Object.entries(sampleSpec.snippetPaths).map(async ([langId, snippetPath]) => {
          const code = await readSnippet(snippetPath);
          return [langId, code] as const;
        }),
      );

      const snippets = Object.fromEntries(snippetEntries) as Record<LangId, string>;
      const { snippetPaths: _removedSnippetPaths, ...sample } = sampleSpec;

      return {
        ...sample,
        snippets,
      };
    }),
  );

  return samples;
}
