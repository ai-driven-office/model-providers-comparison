import { getCollection } from "astro:content";
import type { CodeSample } from "./types";

export interface CodeSampleSpec extends Omit<CodeSample, "id" | "snippets"> {
  id: string;
  order: number;
}

export async function loadCodeSampleSpecs(): Promise<CodeSampleSpec[]> {
  const entries = await getCollection("languagePromptSamples");

  return entries
    .map(({ id, data }) => ({
      id,
      ...data,
    }))
    .sort((left, right) => left.order - right.order);
}
