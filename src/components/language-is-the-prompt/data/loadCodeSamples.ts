import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { LANG_IDS, type CodeSample, type LangId } from "./types";
import { loadCodeSampleSpecs } from "./codeSamplesSpec.ts";
import { SUPPLEMENTAL_SNIPPETS } from "./supplementalSnippets";

const PROJECT_ROOT = process.cwd();
const SNIPPETS_ROOT = path.join(
  PROJECT_ROOT,
  "src/components/language-is-the-prompt/snippets",
);

type SnippetCacheEntry = {
  mtimeMs: number;
  contents: string;
};

const snippetCache = new Map<string, SnippetCacheEntry>();

async function readSnippet(fullPath: string): Promise<string> {
  const stats = await stat(fullPath);
  const cached = snippetCache.get(fullPath);

  if (cached && cached.mtimeMs === stats.mtimeMs) {
    return cached.contents;
  }

  const contents = await readFile(fullPath, "utf8");
  snippetCache.set(fullPath, { mtimeMs: stats.mtimeMs, contents });
  return contents;
}

function isLangId(value: string): value is LangId {
  return LANG_IDS.includes(value as LangId);
}

async function loadSnippetsForSample(
  sampleId: string,
): Promise<Partial<Record<LangId, string>>> {
  const sampleDir = path.join(SNIPPETS_ROOT, sampleId);
  const fileNames = await readdir(sampleDir);
  const snippetsByLang = new Map<LangId, string>();

  for (const fileName of fileNames) {
    const fullPath = path.join(sampleDir, fileName);
    const stats = await stat(fullPath);

    if (!stats.isFile()) {
      continue;
    }

    const langId = path.parse(fileName).name;
    if (!isLangId(langId)) {
      throw new Error(
        `[language-is-the-prompt] Unexpected snippet file "${fileName}" in sample "${sampleId}"`,
      );
    }

    snippetsByLang.set(langId, await readSnippet(fullPath));
  }

  return {
    ...Object.fromEntries(snippetsByLang),
    ...(SUPPLEMENTAL_SNIPPETS[sampleId] ?? {}),
  };
}

export async function loadCodeSamples(): Promise<CodeSample[]> {
  const codeSamplesSpec = await loadCodeSampleSpecs();
  const samples = await Promise.all(
    codeSamplesSpec.map(async (sampleSpec) => {
      const snippets = await loadSnippetsForSample(sampleSpec.id);
      const { order: _removedOrder, ...sample } = sampleSpec;

      return {
        ...sample,
        snippets,
      };
    }),
  );

  return samples;
}
