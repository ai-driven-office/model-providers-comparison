import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const bilingualText = z.object({ en: z.string(), ja: z.string() });
const langId = z.enum([
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
]);
const principleIconId = z.enum([
  "contract",
  "pattern",
  "lock",
  "pipe",
  "format",
  "docs",
]);

const i18n = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/i18n" }),
  schema: z.record(z.string(), z.string()),
});

const providers = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/providers" }),
  schema: z.object({
    name: z.string(),
    color: z.string(),
    url: z.string().url(),
  }),
});

const abilitySchema = z.object({
  planning: z.number().min(0).max(100),
  coding: z.number().min(0).max(100),
  image: z.number().min(0).max(100),
  research: z.number().min(0).max(100),
  creative: z.number().min(0).max(100),
});

const models = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/models" }),
  schema: z.object({
    name: z.string(),
    provider: z.string(),
    tps: z.number(),
    input: z.number().nullable().default(null),
    output: z.number().nullable().default(null),
    inputLong: z.number().nullable().default(null),
    outputLong: z.number().nullable().default(null),
    hero: z.boolean().default(false),
    hidden: z.boolean().default(false),
    tag: z.string().nullable().default(null),
    link: z.string().url().nullable().default(null),
    abilities: abilitySchema,
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/news" }),
  schema: z.object({
    title: bilingualText,
    body: bilingualText,
    date: z.string(),
    timestamp: z.number(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    link: z
      .object({
        url: z.string().url(),
        label: bilingualText,
      })
      .nullable()
      .default(null),
    models: z.array(z.string()).default([]),
    providers: z.array(z.string()).default([]),
    comparisons: z
      .array(
        z.object({
          model: z.string(),
          tps: z.number(),
          factor: z.number(),
        }),
      )
      .default([]),
    specs: z
      .array(
        z.object({
          label: bilingualText,
          value: z.string(),
        }),
      )
      .default([]),
  }),
});

const codeAnnotation = z.object({
  match: z.string(),
  title: bilingualText,
  body: bilingualText,
});

const codeSampleAnnotations = z.record(z.string(), z.array(codeAnnotation));

const languagePromptSamples = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/language-prompt-samples" }),
  schema: z.object({
    order: z.number().int().positive(),
    title: bilingualText,
    description: bilingualText,
    importance: z.enum(["critical", "high", "medium"]),
    icon: z.enum([
      "git-branch",
      "shield",
      "lock",
      "layers",
      "paintbrush",
      "sparkles",
      "cpu",
      "book-open",
      "flask-conical",
    ]),
    diagramId: z.enum(["doc-pipeline"]).optional(),
    libraries: z.array(
      z.object({
        lang: langId,
        name: z.string(),
        url: z.string().url().optional(),
        builtin: z.boolean().optional(),
      }),
    ),
    caveats: bilingualText.optional(),
    annotations: codeSampleAnnotations.optional(),
  }),
});

const languagePromptPageCopyEntry = z.object({
  back: z.string(),
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  heroStat1Label: z.string(),
  heroStat1Value: z.string(),
  heroStat2Label: z.string(),
  heroStat2Value: z.string(),
  heroStat3Label: z.string(),
  heroStat3Value: z.string(),
  tldr: z.string(),
  tldrText: z.string(),
  whyTitle: z.string(),
  whyPoints: z.array(z.string()),
  hypothesisTitle: z.string(),
  hypothesisSub: z.string(),
  principles: z.array(
    z.object({
      title: z.string(),
      desc: z.string(),
      icon: principleIconId,
    }),
  ),
  difficultyTitle: z.string(),
  difficultySub: z.string(),
  difficultyNote: z.string(),
  codeTitle: z.string(),
  codeSub: z.string(),
  codeNote: z.string(),
  readPaperCta: z.string(),
  readPaperCtaSub: z.string(),
  paperLink: z.string(),
  paperLinkSub: z.string(),
  methodology: z.string(),
});

const languagePromptPages = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/language-prompt-pages" }),
  schema: z.object({
    copy: z.object({
      en: languagePromptPageCopyEntry,
      ja: languagePromptPageCopyEntry,
    }),
    difficultyData: z.array(
      z.object({
        lang: z.string(),
        easy: z.number(),
        medium: z.number(),
        hard: z.number(),
        degradation: z.number(),
        color: z.string(),
      }),
    ),
  }),
});

export const collections = {
  i18n,
  providers,
  models,
  news,
  languagePromptSamples,
  languagePromptPages,
};
