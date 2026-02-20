import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
    input: z.number(),
    output: z.number(),
    inputLong: z.number().nullable().default(null),
    outputLong: z.number().nullable().default(null),
    hero: z.boolean().default(false),
    hidden: z.boolean().default(false),
    tag: z.string().nullable().default(null),
    abilities: abilitySchema,
  }),
});

export const collections = { i18n, providers, models };
