import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const bilingualText = z.object({ en: z.string(), ja: z.string() });

const i18n = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/i18n" }),
  schema: z.record(z.string()),
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
    provider: z.string(), // references provider id (filename stem)
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
    date: z.string(), // "2026-02-20"
    timestamp: z.number(), // Unix ms for precise sort
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

export const collections = { i18n, providers, models, news };
