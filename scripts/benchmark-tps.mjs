#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const MODELS_DIR = path.join(ROOT, "src", "content", "models");

const DEFAULT_PROMPT =
  "Output the integers 1 through 120, one per line, with no prose or explanation.";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions";
const HAS_CODEX_CLI = spawnSync("codex", ["--version"], { stdio: "ignore" }).status === 0;

const DIRECT_TARGETS = {
  "glm-4-7": {
    route: "cerebras",
    model: "zai-glm-4.7",
    envKey: "CEREBRAS_API_KEY",
    note: "Direct Cerebras benchmark for the GLM 4.7 row.",
  },
};

const SKIP_TARGETS = {
  "gpt-5-4-fast": "Service tier / routing variant, not a distinct benchmarkable model id.",
  "opus-4-6-fast": "Service tier / routing variant, not a distinct benchmarkable model id.",
  "llama-3-1-8b-taalas": "No public API benchmark route is configured for this row.",
};

const OPENROUTER_HINTS = {
  "claude-haiku-4-5": [
    "anthropic/claude-haiku-4.5",
    "anthropic/claude-4.5-haiku",
  ],
  "claude-opus-4-6": [
    "anthropic/claude-opus-4.6",
    "anthropic/claude-4.6-opus",
  ],
  "claude-sonnet-4-6": [
    "anthropic/claude-sonnet-4.6",
    "anthropic/claude-4.6-sonnet",
  ],
  "gemini-3-1-flash-lite": [
    "google/gemini-3.1-flash-lite",
    "google/gemini-3.1-flash-lite-preview",
  ],
  "gemini-3-1-pro": ["google/gemini-3.1-pro"],
  "gemini-3-flash": ["google/gemini-3-flash"],
  "glm-5": ["z-ai/glm-5"],
  "gpt-5-2-codex": ["openai/gpt-5.2-codex"],
  "gpt-5-3-codex": ["openai/gpt-5.3-codex"],
  "gpt-5-3-codex-spark": [
    "openai/gpt-5.3-codex-spark-preview",
    "openai/gpt-5.3-codex-spark",
  ],
  "gpt-5-4": ["openai/gpt-5.4"],
  "gpt-5-4-pro": ["openai/gpt-5.4-pro"],
  "grok-code-fast-1": ["x-ai/grok-code-fast-1", "x-ai/grok-code-fast"],
  "kimi-k2-5": ["moonshotai/kimi-k2.5", "moonshot/kimi-k2.5"],
  "mercury-2": ["inception/mercury-2"],
  "minimax-m2-5": ["minimax/minimax-m2.5"],
  "qwen-3-5-27b": ["qwen/qwen3.5-27b"],
  "qwen-3-5-397b": ["qwen/qwen3.5-397b-a17b", "qwen/qwen3.5-397b"],
};

function parseArgs(argv) {
  const options = {
    models: null,
    provider: null,
    runs: 1,
    maxTokens: 384,
    timeoutMs: 120_000,
    prompt: DEFAULT_PROMPT,
    out: null,
    json: false,
    writeTps: false,
    includeHidden: false,
    verbose: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    switch (arg) {
      case "--models":
        options.models = new Set(String(next ?? "").split(",").map((value) => value.trim()).filter(Boolean));
        index += 1;
        break;
      case "--provider":
        options.provider = String(next ?? "").trim() || null;
        index += 1;
        break;
      case "--runs":
        options.runs = Math.max(1, Number.parseInt(next ?? "1", 10) || 1);
        index += 1;
        break;
      case "--max-tokens":
        options.maxTokens = Math.max(32, Number.parseInt(next ?? "384", 10) || 384);
        index += 1;
        break;
      case "--timeout-ms":
        options.timeoutMs = Math.max(10_000, Number.parseInt(next ?? "120000", 10) || 120_000);
        index += 1;
        break;
      case "--prompt":
        options.prompt = String(next ?? "").trim() || DEFAULT_PROMPT;
        index += 1;
        break;
      case "--out":
        options.out = path.resolve(ROOT, String(next ?? "").trim());
        index += 1;
        break;
      case "--json":
        options.json = true;
        break;
      case "--write-tps":
        options.writeTps = true;
        break;
      case "--include-hidden":
        options.includeHidden = true;
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Usage:
  npm run benchmark:tps -- [options]

Options:
  --models <ids>         Comma-separated local model ids (e.g. gpt-5-4-pro,minimax-m2-5)
  --provider <slug>      Filter catalog rows by provider slug
  --runs <n>             Number of runs per model (default: 1)
  --max-tokens <n>       Completion token cap for the test prompt (default: 384)
  --timeout-ms <n>       Request timeout in ms (default: 120000)
  --prompt <text>        Override the default benchmark prompt
  --json                 Print JSON instead of a table
  --out <path>           Write JSON results to a file
  --write-tps            Update matching src/content/models/*.yaml tps values with measured medians
  --include-hidden       Include hidden catalog rows
  --verbose              Print per-run details
  --help                 Show this help

Env:
  OPENAI_API_KEY         Optional direct benchmark path for gpt-5-3-codex-spark
  OPENROUTER_API_KEY     Required for OpenRouter-routed models
  CEREBRAS_API_KEY       Optional direct benchmark for glm-4-7

Notes:
  - OpenRouter calls use provider.sort = "throughput" and disable fallbacks so the request
    stays pinned to the fastest available provider route.
  - The script measures completion_tps from first emitted token to last emitted token.
  - --write-tps only updates rows that completed successfully.
`);
}

function parseScalar(raw) {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null") return null;
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

function loadCatalogModels() {
  return fs
    .readdirSync(MODELS_DIR)
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => {
      const filePath = path.join(MODELS_DIR, file);
      const text = fs.readFileSync(filePath, "utf8");
      const entry = {
        id: file.replace(/\.yaml$/, ""),
        filePath,
        hidden: false,
      };

      for (const line of text.split(/\r?\n/)) {
        if (!line || /^\s/.test(line)) continue;
        const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (key === "abilities") break;
        entry[key] = parseScalar(rawValue.trim());
      }

      return entry;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function dedupeBy(list, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function fetchOpenRouterModels() {
  const response = await fetch(OPENROUTER_MODELS_URL, {
    headers: {
      "User-Agent": "model-providers-comparison-benchmark/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter model list failed: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  return Array.isArray(body?.data) ? body.data : [];
}

function resolveOpenRouterModel(entry, openRouterModels) {
  const hints = dedupeBy(
    [entry.name, entry.id, ...(OPENROUTER_HINTS[entry.id] ?? [])].filter(Boolean),
    (value) => normalize(value),
  );

  const matches = [];
  for (const hint of hints) {
    const normalizedHint = normalize(hint);
    for (const model of openRouterModels) {
      const values = [model.id, model.canonical_slug, model.name].filter(Boolean);
      if (
        values.some((value) => value === hint) ||
        values.some((value) => String(value).startsWith(`${hint}-`)) ||
        values.some((value) => normalize(value).includes(normalizedHint))
      ) {
        matches.push(model);
      }
    }
  }

  return dedupeBy(matches, (model) => model.id).sort(
    (a, b) => (Number(b.created) || 0) - (Number(a.created) || 0),
  )[0] ?? null;
}

function buildBenchmarkPlan(entry, openRouterModels) {
  if (SKIP_TARGETS[entry.id]) {
    return {
      status: "skipped",
      reason: SKIP_TARGETS[entry.id],
    };
  }

  const direct = DIRECT_TARGETS[entry.id];
  if (direct) {
    if (!process.env[direct.envKey]) {
      return {
        status: "skipped",
        reason: `Missing ${direct.envKey}.`,
      };
    }

    return {
      status: "ready",
      route: direct.route,
      apiModel: direct.model,
      note: direct.note,
    };
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return {
      status: "skipped",
      reason: "Missing OPENROUTER_API_KEY.",
    };
  }

  const resolved = resolveOpenRouterModel(entry, openRouterModels);
  if (!resolved) {
    return {
      status: "skipped",
      reason: "No matching OpenRouter model id found.",
    };
  }

  return {
    status: "ready",
    route: "openrouter",
    apiModel: resolved.id,
    note: `Resolved via OpenRouter model list (${resolved.name}).`,
  };
}

function maybeBuildCodexCliPlan(entry) {
  if (entry.id !== "gpt-5-3-codex-spark") return null;
  if (!HAS_CODEX_CLI) return null;

  return {
    status: "ready",
    route: "codex-cli",
    apiModel: "gpt-5.3-codex-spark-preview",
    note: "Direct Codex CLI benchmark using the preview alias.",
  };
}

function maybeBuildOpenAiDirectPlan(entry) {
  if (entry.id !== "gpt-5-3-codex-spark") return null;
  if (!process.env.OPENAI_API_KEY) return null;

  return {
    status: "ready",
    route: "openai-responses",
    apiModel: "gpt-5.3-codex-spark-preview",
    note: "Direct OpenAI Responses API benchmark using the preview alias.",
  };
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function round(value, digits = 1) {
  if (value == null || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

async function readResponseText(response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function consumeSseStream(response) {
  if (!response.body) {
    throw new Error("Response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let firstTokenAt = null;
  let lastTokenAt = null;
  let usage = null;
  let output = "";
  let doneSeen = false;
  let streamError = null;

  while (!doneSeen) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n\n");

    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");

      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data) continue;
        if (data === "[DONE]") {
          doneSeen = true;
          continue;
        }

        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          continue;
        }

        if (parsed.usage) {
          usage = parsed.usage;
        }
        if (parsed.response?.usage) {
          usage = parsed.response.usage;
        }
        if (parsed.error?.message) {
          streamError = parsed.error.message;
        }
        if (parsed.response?.error?.message) {
          streamError = parsed.response.error.message;
        }

        const delta = parsed.choices?.[0]?.delta ?? {};
        const pieces = [];
        if (typeof delta.content === "string" && delta.content.length > 0) {
          pieces.push(delta.content);
        }
        if (typeof delta.reasoning === "string" && delta.reasoning.length > 0) {
          pieces.push(delta.reasoning);
        }
        if (Array.isArray(delta.content)) {
          for (const item of delta.content) {
            if (typeof item?.text === "string" && item.text.length > 0) {
              pieces.push(item.text);
            }
          }
        }
        if (typeof parsed.delta === "string" && parsed.delta.length > 0) {
          pieces.push(parsed.delta);
        }

        if (pieces.length > 0) {
          const now = performance.now();
          firstTokenAt ??= now;
          lastTokenAt = now;
          output += pieces.join("");
        }

        if (parsed.type === "response.completed") {
          doneSeen = true;
        }
        if (parsed.type === "response.failed" || parsed.type === "error") {
          doneSeen = true;
        }
      }
    }
  }

  if (streamError) {
    throw new Error(streamError);
  }

  const completionTokens = Number(
    usage?.completion_tokens ??
      usage?.output_tokens ??
      usage?.completionTokens ??
      Math.max(1, Math.round(output.length / 4)),
  );

  return {
    completionTokens,
    firstTokenAt,
    lastTokenAt,
    output,
  };
}

async function benchmarkOpenAICompatible({
  url,
  apiKey,
  model,
  headers = {},
  body = {},
  timeoutMs,
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Timed out after ${timeoutMs} ms`));
  }, timeoutMs);

  const startedAt = performance.now();
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        model,
        stream: true,
        stream_options: { include_usage: true },
        temperature: 0,
        ...body,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await readResponseText(response)}`);
  }

  const providerHeader =
    response.headers.get("x-openrouter-provider") ??
    response.headers.get("openrouter-provider") ??
    null;

  const streamed = await consumeSseStream(response);
  const endedAt = performance.now();

  const ttftMs = streamed.firstTokenAt == null ? null : streamed.firstTokenAt - startedAt;
  const emitMs =
    streamed.firstTokenAt == null || streamed.lastTokenAt == null
      ? null
      : Math.max(1, streamed.lastTokenAt - streamed.firstTokenAt);
  const wallMs = Math.max(1, endedAt - startedAt);

  return {
    completionTokens: streamed.completionTokens,
    ttftMs,
    emitMs,
    wallMs,
    completionTps:
      emitMs == null ? null : streamed.completionTokens / (emitMs / 1000),
    wallTps: streamed.completionTokens / (wallMs / 1000),
    providerHeader,
    sample: streamed.output.slice(0, 120),
  };
}

async function benchmarkOpenAIResponses({
  url,
  apiKey,
  model,
  timeoutMs,
  input,
  maxOutputTokens,
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Timed out after ${timeoutMs} ms`));
  }, timeoutMs);

  const startedAt = performance.now();
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input,
        stream: true,
        max_output_tokens: maxOutputTokens,
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await readResponseText(response)}`);
  }

  const streamed = await consumeSseStream(response);
  const endedAt = performance.now();

  const ttftMs = streamed.firstTokenAt == null ? null : streamed.firstTokenAt - startedAt;
  const emitMs =
    streamed.firstTokenAt == null || streamed.lastTokenAt == null
      ? null
      : Math.max(1, streamed.lastTokenAt - streamed.firstTokenAt);
  const wallMs = Math.max(1, endedAt - startedAt);

  return {
    completionTokens: streamed.completionTokens,
    ttftMs,
    emitMs,
    wallMs,
    completionTps:
      emitMs == null ? null : streamed.completionTokens / (emitMs / 1000),
    wallTps: streamed.completionTokens / (wallMs / 1000),
    providerHeader: null,
    sample: streamed.output.slice(0, 120),
  };
}

async function benchmarkCodexCli({
  model,
  prompt,
  timeoutMs,
}) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codex-benchmark-"));

  try {
    return await new Promise((resolve, reject) => {
      const startedAt = performance.now();
      let stderr = "";
      let stdoutBuffer = "";
      let firstTextAt = null;
      let lastTextAt = null;
      let output = "";
      let outputTokens = null;
      let settled = false;

      const child = spawn(
        "codex",
        [
          "exec",
          "-m",
          model,
          "--json",
          "--skip-git-repo-check",
          "--color",
          "never",
          "-C",
          tempDir,
          prompt,
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
          env: process.env,
        },
      );

      const finish = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      const fail = (error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        fail(new Error(`Timed out after ${timeoutMs} ms`));
      }, timeoutMs);

      child.stdout.on("data", (chunk) => {
        stdoutBuffer += chunk.toString("utf8");
        let newlineIndex = stdoutBuffer.indexOf("\n");

        while (newlineIndex !== -1) {
          const line = stdoutBuffer.slice(0, newlineIndex).trim();
          stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);
          newlineIndex = stdoutBuffer.indexOf("\n");

          if (!line.startsWith("{")) continue;

          let parsed;
          try {
            parsed = JSON.parse(line);
          } catch {
            continue;
          }

          const text = parsed.item?.type === "agent_message" ? parsed.item.text : null;
          if (typeof text === "string" && text.length > 0) {
            const now = performance.now();
            firstTextAt ??= now;
            lastTextAt = now;
            output = text;
          }

          const tokens = parsed.usage?.output_tokens;
          if (typeof tokens === "number" && Number.isFinite(tokens)) {
            outputTokens = tokens;
          }
        }
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf8");
      });

      child.on("error", (error) => {
        clearTimeout(timeout);
        fail(error);
      });

      child.on("close", (code) => {
        clearTimeout(timeout);

        if (code !== 0) {
          fail(new Error(stderr.trim() || `codex exited with code ${code}`));
          return;
        }

        const endedAt = performance.now();
        const wallMs = Math.max(1, endedAt - startedAt);
        const completionTokens = Number(
          outputTokens ?? Math.max(1, Math.round(output.length / 4)),
        );

        finish({
          completionTokens,
          ttftMs: null,
          emitMs: null,
          wallMs,
          // Codex CLI does not expose token deltas, so use end-to-end wall TPS.
          completionTps: completionTokens / (wallMs / 1000),
          wallTps: completionTokens / (wallMs / 1000),
          providerHeader: "codex-cli",
          sample: output.slice(0, 120),
        });
      });
    });
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function runSingleBenchmark(plan, options) {
  const baseBody = {
    messages: [
      {
        role: "user",
        content: options.prompt,
      },
    ],
    max_tokens: options.maxTokens,
  };

  if (plan.route === "openrouter") {
    return benchmarkOpenAICompatible({
      url: OPENROUTER_API_URL,
      apiKey: process.env.OPENROUTER_API_KEY,
      model: plan.apiModel,
      timeoutMs: options.timeoutMs,
      headers: {
        "HTTP-Referer": "https://ai-driven-office.github.io/model-providers-comparison/",
        "X-Title": "model-providers-comparison tps benchmark",
      },
      body: {
        ...baseBody,
        provider: {
          sort: "throughput",
          allow_fallbacks: false,
          require_parameters: true,
        },
      },
    });
  }

  if (plan.route === "openai-responses") {
    return benchmarkOpenAIResponses({
      url: OPENAI_RESPONSES_API_URL,
      apiKey: process.env.OPENAI_API_KEY,
      model: plan.apiModel,
      timeoutMs: options.timeoutMs,
      input: options.prompt,
      maxOutputTokens: options.maxTokens,
    });
  }

  if (plan.route === "codex-cli") {
    return benchmarkCodexCli({
      model: plan.apiModel,
      prompt: options.prompt,
      timeoutMs: options.timeoutMs,
    });
  }

  if (plan.route === "openai") {
    return benchmarkOpenAICompatible({
      url: OPENAI_API_URL,
      apiKey: process.env.OPENAI_API_KEY,
      model: plan.apiModel,
      timeoutMs: options.timeoutMs,
      body: baseBody,
    });
  }

  if (plan.route === "cerebras") {
    return benchmarkOpenAICompatible({
      url: CEREBRAS_API_URL,
      apiKey: process.env.CEREBRAS_API_KEY,
      model: plan.apiModel,
      timeoutMs: options.timeoutMs,
      body: baseBody,
    });
  }

  throw new Error(`Unsupported route: ${plan.route}`);
}

function formatMs(value) {
  return value == null ? "—" : `${Math.round(value)}ms`;
}

function formatRate(value) {
  return value == null ? "—" : `${round(value, 1)}`;
}

function renderTable(results) {
  const headers = [
    ["model", 20],
    ["route", 11],
    ["catalog", 7],
    ["measured", 8],
    ["ttft", 8],
    ["emit", 8],
    ["tokens", 8],
    ["status", 8],
  ];

  const lines = [
    headers.map(([label, width]) => label.padEnd(width)).join(" "),
    headers.map(([, width]) => "-".repeat(width)).join(" "),
  ];

  for (const result of results) {
    lines.push(
      [
        result.id.padEnd(20),
        String(result.route ?? "skip").padEnd(11),
        String(result.catalogTps ?? "—").padStart(7),
        String(formatRate(result.medianCompletionTps)).padStart(8),
        formatMs(result.medianTtftMs).padStart(8),
        formatMs(result.medianEmitMs).padStart(8),
        String(result.medianCompletionTokens ?? "—").padStart(8),
        result.status.padEnd(8),
      ].join(" "),
    );

    if (result.status !== "ok" && result.reason) {
      lines.push(`  reason: ${result.reason}`);
    }
    if (result.providerHeader) {
      lines.push(`  provider: ${result.providerHeader}`);
    }
  }

  return lines.join("\n");
}

function maybeWriteTps(results) {
  for (const result of results) {
    if (result.status !== "ok" || result.medianCompletionTps == null) continue;
    const fileText = fs.readFileSync(result.filePath, "utf8");
    const updated = fileText.replace(
      /^tps:\s*.*$/m,
      `tps: ${Math.round(result.medianCompletionTps)}`,
    );
    fs.writeFileSync(result.filePath, updated);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalog = loadCatalogModels()
    .filter((entry) => (options.includeHidden ? true : !entry.hidden))
    .filter((entry) => (options.provider ? entry.provider === options.provider : true))
    .filter((entry) => (options.models ? options.models.has(entry.id) : true));

  if (!catalog.length) {
    throw new Error("No matching catalog rows found.");
  }

  const needsOpenRouter =
    Boolean(process.env.OPENROUTER_API_KEY) &&
    catalog.some((entry) => !SKIP_TARGETS[entry.id] && !DIRECT_TARGETS[entry.id]);
  const openRouterModels = needsOpenRouter ? await fetchOpenRouterModels() : [];
  const results = [];

  for (const entry of catalog) {
    let plan =
      maybeBuildCodexCliPlan(entry) ??
      maybeBuildOpenAiDirectPlan(entry) ??
      buildBenchmarkPlan(entry, openRouterModels);
    if (plan.status !== "ready") {
      results.push({
        id: entry.id,
        name: entry.name,
        filePath: entry.filePath,
        route: null,
        catalogTps: entry.tps ?? null,
        status: "skip",
        reason: plan.reason,
      });
      continue;
    }

    const runs = [];
    let fatalError = null;

    for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
      try {
        const run = await runSingleBenchmark(plan, options);
        runs.push(run);
        if (options.verbose) {
          console.error(
            `[${entry.id}] run ${runIndex + 1}/${options.runs}: ${round(run.completionTps, 1)} tps, ${run.completionTokens} tokens`,
          );
        }
      } catch (error) {
        fatalError = error instanceof Error ? error.message : String(error);
        break;
      }
    }

    if (
      fatalError &&
      (plan.route === "codex-cli" || plan.route === "openai" || plan.route === "openai-responses")
    ) {
      const fallbackPlan = buildBenchmarkPlan(entry, openRouterModels);
      if (fallbackPlan.status === "ready" && fallbackPlan.route === "openrouter") {
        if (options.verbose) {
          console.error(
            `[${entry.id}] direct OpenAI path failed, retrying via OpenRouter: ${fatalError}`,
          );
        }
        plan = fallbackPlan;
        fatalError = null;
        runs.length = 0;

        for (let runIndex = 0; runIndex < options.runs; runIndex += 1) {
          try {
            const run = await runSingleBenchmark(plan, options);
            runs.push(run);
            if (options.verbose) {
              console.error(
                `[${entry.id}] run ${runIndex + 1}/${options.runs}: ${round(run.completionTps, 1)} tps, ${run.completionTokens} tokens`,
              );
            }
          } catch (error) {
            fatalError = error instanceof Error ? error.message : String(error);
            break;
          }
        }
      }
    }

    if (fatalError) {
      results.push({
        id: entry.id,
        name: entry.name,
        filePath: entry.filePath,
        route: plan.route,
        apiModel: plan.apiModel,
        catalogTps: entry.tps ?? null,
        status: "error",
        reason: fatalError,
      });
      continue;
    }

    results.push({
      id: entry.id,
      name: entry.name,
      filePath: entry.filePath,
      route: plan.route,
      apiModel: plan.apiModel,
      catalogTps: entry.tps ?? null,
      status: "ok",
      note: plan.note,
      providerHeader: runs.find((run) => run.providerHeader)?.providerHeader ?? null,
      medianCompletionTps: median(runs.map((run) => run.completionTps).filter((value) => value != null)),
      medianWallTps: median(runs.map((run) => run.wallTps).filter((value) => value != null)),
      medianTtftMs: median(runs.map((run) => run.ttftMs).filter((value) => value != null)),
      medianEmitMs: median(runs.map((run) => run.emitMs).filter((value) => value != null)),
      medianCompletionTokens: median(runs.map((run) => run.completionTokens).filter((value) => value != null)),
      runs,
    });
  }

  if (options.writeTps) {
    maybeWriteTps(results);
  }

  const payload = {
    timestamp: new Date().toISOString(),
    prompt: options.prompt,
    runs: options.runs,
    maxTokens: options.maxTokens,
    writeTps: options.writeTps,
    results,
  };

  if (options.out) {
    fs.mkdirSync(path.dirname(options.out), { recursive: true });
    fs.writeFileSync(options.out, JSON.stringify(payload, null, 2));
  }

  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(renderTable(results));
    if (results.some((result) => result.status === "ok")) {
      console.log("");
      console.log("Measured medians are completion tokens per second from first token to last token.");
    }
  }

  if (!results.some((result) => result.status === "ok")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
