import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
  const providerEntries = await getCollection("providers");
  const providerMap = Object.fromEntries(
    providerEntries.map((p) => [p.id, p.data]),
  );

  const modelEntries = await getCollection("models");
  const models = modelEntries
    .filter((e) => !e.data.hidden)
    .map((e) => ({
      ...e.data,
      provider: providerMap[e.data.provider]?.name ?? e.data.provider,
    }));

  const buildDate = new Date().toISOString().split("T")[0];
  const base = "https://ai-driven-office.github.io/model-providers-comparison";

  const lines = [
    "# AI Model Comparison",
    "",
    `> ${base}`,
    "",
    "AI model throughput and pricing comparison dashboard by AI Driven Office (CyberAgent, Inc.).",
    "Compare speed (tokens/sec), pricing ($/M tokens), and capability scores across frontier AI models.",
    "",
    `Last updated: ${buildDate}`,
    "",
    "## Models tracked",
    "",
    ...models.map(
      (m) => {
        const price = m.input != null && m.output != null
          ? `$${m.input}/$${m.output} per M tokens`
          : "pricing not published";
        return `- ${m.name} (${m.provider}): ${m.tps} tps, ${price}`;
      },
    ),
    "",
    "## Pages",
    "",
    `- Dashboard: ${base}/`,
    `- Full data (Markdown): ${base}/data.md`,
    `- GLM x Cerebras Guide: ${base}/glm-cerebras/`,
    "",
    "## Data format",
    "",
    "For machine-readable data, fetch the Markdown version:",
    `  ${base}/data.md`,
    "",
    "The Markdown version contains full model data tables, ability scores, and provider information.",
    "",
  ];

  // --- Recent News ---
  const newsEntries = await getCollection("news");
  const newsPosts = [...newsEntries]
    .map((e) => e.data)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (newsPosts.length > 0) {
    lines.push("## Recent News");
    lines.push("");
    for (const post of newsPosts) {
      const topComp = post.comparisons[0];
      const compStr = topComp
        ? ` — ${topComp.factor}x faster than ${topComp.model}`
        : "";
      lines.push(`- ${post.date}: ${post.title.en}${compStr}`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
