import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const models = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/models" }),
  schema: z.object({
    name: z.string(),
    provider: z.string(),
    tps: z.number(),
    input: z.number(),
    output: z.number(),
    hero: z.boolean().default(false),
    tag: z.string().nullable().default(null),
  }),
});

export const collections = { models };
