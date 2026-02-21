import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

function pad(s: string, len: number) {
  return s + " ".repeat(Math.max(0, len - s.length));
}

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
      providerId: e.data.provider,
      provider: providerMap[e.data.provider]?.name ?? e.data.provider,
    }));

  const providers = providerEntries.map((p) => ({
    id: p.id,
    ...p.data,
  }));

  const buildDate = new Date().toISOString().split("T")[0];
  const base = "https://ai-driven-office.github.io/model-providers-comparison";

  // --- Build Markdown ---
  const md: string[] = [];

  md.push("# AI Model Comparison");
  md.push("");
  md.push(
    "Compare AI model throughput and pricing across frontier models from OpenAI, Anthropic, Google, xAI, and more.",
  );
  md.push("");
  md.push(`**Last updated:** ${buildDate}`);
  md.push(`**Source:** [AI Driven Office](${base}/)`);
  md.push(
    `**Data:** [OpenRouter](https://openrouter.ai/) · Prices per million tokens`,
  );
  md.push("");

  // --- Providers ---
  md.push("## Providers");
  md.push("");
  for (const p of providers) {
    md.push(`- **${p.name}** — [${p.url}](${p.url})`);
  }
  md.push("");

  // --- Throughput & Pricing Table ---
  md.push("## Model Throughput & Pricing");
  md.push("");
  md.push(
    "| Model | Provider | TPS | Input $/M | Output $/M | Input >200K $/M | Output >200K $/M |",
  );
  md.push(
    "| ----- | -------- | --: | --------: | ---------: | --------------: | ---------------: |",
  );

  const sorted = [...models].sort((a, b) => b.tps - a.tps);
  for (const m of sorted) {
    const tag = m.hero ? " ★" : m.tag === "fast" ? " ⚡" : m.tag === "record" ? " 🏆" : "";
    const inp = m.input != null ? `$${m.input}` : "N/A";
    const out = m.output != null ? `$${m.output}` : "N/A";
    const iL = m.inputLong != null ? `$${m.inputLong}` : "—";
    const oL = m.outputLong != null ? `$${m.outputLong}` : "—";
    md.push(
      `| ${m.name}${tag} | ${m.provider} | ${m.tps.toLocaleString()} | ${inp} | ${out} | ${iL} | ${oL} |`,
    );
  }
  md.push("");
  md.push("★ = Speed champion · ⚡ = Fast mode variant");
  md.push("");

  // --- Ability Scores ---
  md.push("## Ability Scores (0–100)");
  md.push("");
  md.push(
    "Scores are approximate — normalized 0–100 from public benchmarks (Feb 2026).",
  );
  md.push("");
  md.push(
    "| Model | Provider | Planning | Coding | Image | Research | Creative | Avg |",
  );
  md.push(
    "| ----- | -------- | -------: | -----: | ----: | -------: | -------: | --: |",
  );

  const withAvg = models
    .map((m) => {
      const a = m.abilities;
      const avg =
        Math.round(
          ((a.planning + a.coding + a.image + a.research + a.creative) / 5) *
            10,
        ) / 10;
      return { ...m, avg };
    })
    .sort((a, b) => b.avg - a.avg);

  for (const m of withAvg) {
    const a = m.abilities;
    md.push(
      `| ${m.name} | ${m.provider} | ${a.planning} | ${a.coding} | ${a.image} | ${a.research} | ${a.creative} | ${m.avg} |`,
    );
  }
  md.push("");

  // --- Recommendations summary ---
  md.push("## Quick Recommendations");
  md.push("");

  const nonFast = models.filter((m) => m.tag !== "fast");

  // Best absolute (highest avg ability)
  const bestAbsolute = withAvg.filter((m) => m.tag !== "fast")[0];
  if (bestAbsolute) {
    md.push(
      `- **Best overall quality:** ${bestAbsolute.name} (${bestAbsolute.provider}) — avg score ${bestAbsolute.avg}`,
    );
  }

  // Best value (ability / output price)
  const bestValue = [...nonFast].sort(
    (a, b) => {
      const aA = a.abilities;
      const bA = b.abilities;
      const aAvg = (aA.planning + aA.coding + aA.image + aA.research + aA.creative) / 5;
      const bAvg = (bA.planning + bA.coding + bA.image + bA.research + bA.creative) / 5;
      return (b.output ? bAvg / b.output : 0) - (a.output ? aAvg / a.output : 0);
    },
  )[0];
  if (bestValue) {
    md.push(
      `- **Best value:** ${bestValue.name} (${bestValue.provider}) — $${bestValue.output}/M output`,
    );
  }

  // Fastest
  const fastest = [...models].sort((a, b) => b.tps - a.tps)[0];
  if (fastest) {
    md.push(
      `- **Fastest throughput:** ${fastest.name} (${fastest.provider}) — ${fastest.tps.toLocaleString()} tps`,
    );
  }

  // Cheapest
  const cheapest = [...nonFast].filter(m => m.output != null).sort((a, b) => (a.output ?? 0) - (b.output ?? 0))[0];
  if (cheapest) {
    md.push(
      `- **Cheapest output:** ${cheapest.name} (${cheapest.provider}) — $${cheapest.output}/M tokens`,
    );
  }

  md.push("");

  // --- News & Updates ---
  const newsEntries = await getCollection("news");
  const newsPosts = [...newsEntries]
    .map((e) => e.data)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (newsPosts.length > 0) {
    md.push("## News & Updates");
    md.push("");

    for (const post of newsPosts) {
      md.push(`### ${post.title.en}`);
      md.push("");
      md.push(`**${post.date}**${post.featured ? " ★ Featured" : ""}`);
      md.push("");
      md.push(post.body.en);
      md.push("");

      if (post.comparisons.length > 0) {
        md.push("**Speed Comparisons:**");
        md.push("");
        md.push("| vs Model | TPS | Factor |");
        md.push("| -------- | --: | -----: |");
        for (const c of post.comparisons) {
          md.push(`| ${c.model} | ${c.tps.toLocaleString()} | ${c.factor}x |`);
        }
        md.push("");
      }

      if (post.specs.length > 0) {
        md.push(
          `**Specs:** ${post.specs.map((s) => `${s.label.en}: ${s.value}`).join(" · ")}`,
        );
        md.push("");
      }

      if (post.link) {
        md.push(`**→ [${post.link.label.en}](${post.link.url})**`);
        md.push("");
      }
    }
  }

  // --- Footer ---
  md.push("---");
  md.push("");
  md.push(
    `*Generated on ${buildDate} by [AI Model Comparison](${base}/) — AI Driven Office (CyberAgent, Inc.)*`,
  );
  md.push("");

  return new Response(md.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
