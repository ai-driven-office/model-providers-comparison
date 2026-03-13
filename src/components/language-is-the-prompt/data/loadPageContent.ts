import { getEntry } from "astro:content";
import type { LanguagePromptPageContent } from "./types";

export async function loadLanguagePromptPageContent(): Promise<LanguagePromptPageContent> {
  const entry = await getEntry("languagePromptPages", "language-is-the-prompt");

  if (!entry) {
    throw new Error(
      "[language-is-the-prompt] Missing content entry: languagePromptPages/language-is-the-prompt",
    );
  }

  return entry.data;
}
