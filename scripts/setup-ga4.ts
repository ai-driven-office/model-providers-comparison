#!/usr/bin/env bun
/**
 * GA4 Setup CLI — creates a Google Analytics 4 property + web data stream,
 * writes the Measurement ID to .env, and patches the deploy workflow.
 *
 * Usage:
 *   bun scripts/setup-ga4.ts              # interactive (uses gcloud for auth)
 *   bun scripts/setup-ga4.ts --token XXX  # pass an OAuth2 access token directly
 *
 * Prerequisites:
 *   - A Google account with access to Google Analytics
 *   - `gcloud` CLI installed (or pass --token manually)
 *   - Google Analytics Admin API enabled in your Google Cloud project
 *     → https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const API = "https://analyticsadmin.googleapis.com/v1beta";
const SITE_URL = "https://ai-driven-office.github.io/model-providers-comparison/";
const PROPERTY_NAME = "AI Model Comparison";
const STREAM_NAME = "model-providers-comparison (GitHub Pages)";
const SCOPE = "https://www.googleapis.com/auth/analytics.edit";

// ─── Helpers ─────────────────────────────────────────────

function die(msg: string): never {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

function info(msg: string) {
  console.log(`  → ${msg}`);
}

function success(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function heading(msg: string) {
  console.log(`\n  ── ${msg} ──`);
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input, output });
  try {
    return await new Promise((resolve) => {
      rl.question(`  ? ${question} `, (answer) => {
        resolve(answer.trim());
      });
    });
  } finally {
    rl.close();
  }
}

async function api(
  token: string,
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<unknown> {
  const url = `${API}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    die(`API ${method} ${path} → ${res.status}\n${text}`);
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const flagIdx = process.argv.indexOf("--token");
  if (flagIdx !== -1 && process.argv[flagIdx + 1]) {
    return process.argv[flagIdx + 1];
  }

  info("No --token flag; trying gcloud CLI...");

  try {
    const token = execFileSync(
      "gcloud",
      ["auth", "print-access-token", `--scopes=${SCOPE}`],
      { encoding: "utf8" },
    ).trim();
    if (token && !token.includes("ERROR")) {
      success("Got access token from gcloud");
      return token;
    }
  } catch {
    // gcloud not installed or not logged in
  }

  heading("Manual Auth Required");
  console.log(`
  gcloud is not available or not logged in.

  Option A — Install gcloud and run:
    gcloud auth login
    bun scripts/setup-ga4.ts

  Option B — Get a token manually:
    1. Go to https://developers.google.com/oauthplayground/
    2. In "Step 1", find "Google Analytics Admin API v1beta"
       and select "https://www.googleapis.com/auth/analytics.edit"
    3. Click "Authorize APIs" → sign in → grant access
    4. In "Step 2", click "Exchange authorization code for tokens"
    5. Copy the "Access token" and run:
       bun scripts/setup-ga4.ts --token YOUR_ACCESS_TOKEN
  `);
  process.exit(1);
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log("\n  GA4 Setup CLI\n  ─────────────");

  const token = await getToken();

  // 1. List accounts
  heading("Google Analytics Accounts");
  const accountsRes = (await api(token, "GET", "/accountSummaries")) as {
    accountSummaries?: { account: string; displayName: string }[];
  };

  const accounts = accountsRes.accountSummaries ?? [];
  if (accounts.length === 0) {
    die(
      "No Google Analytics accounts found. Create one at https://analytics.google.com",
    );
  }

  accounts.forEach((a, i) => {
    console.log(`    [${i + 1}] ${a.displayName}  (${a.account})`);
  });

  let accountIdx = 0;
  if (accounts.length > 1) {
    const choice = await prompt(`Select account [1-${accounts.length}]:`);
    accountIdx = parseInt(choice, 10) - 1;
    if (isNaN(accountIdx) || accountIdx < 0 || accountIdx >= accounts.length) {
      die("Invalid selection");
    }
  } else {
    info(`Using: ${accounts[0].displayName}`);
  }

  const account = accounts[accountIdx];
  const accountId = account.account; // "accounts/123456"

  // 2. Create property
  heading("Creating GA4 Property");
  info(`Property: "${PROPERTY_NAME}"`);
  info(`Parent:   ${accountId}`);

  const property = (await api(token, "POST", "/properties", {
    parent: accountId,
    displayName: PROPERTY_NAME,
    industryCategory: "TECHNOLOGY",
    timeZone: "Asia/Tokyo",
    currencyCode: "JPY",
  })) as { name: string; displayName: string };

  success(`Created property: ${property.name}`);

  // 3. Create web data stream
  heading("Creating Web Data Stream");
  info(`Stream: "${STREAM_NAME}"`);
  info(`URL:    ${SITE_URL}`);

  const stream = (await api(
    token,
    "POST",
    `/${property.name}/dataStreams`,
    {
      type: "WEB_DATA_STREAM",
      displayName: STREAM_NAME,
      webStreamData: {
        defaultUri: SITE_URL,
      },
    },
  )) as {
    name: string;
    webStreamData: { measurementId: string; defaultUri: string };
  };

  const measurementId = stream.webStreamData.measurementId;
  success(`Created stream: ${stream.name}`);
  success(`Measurement ID: ${measurementId}`);

  // 4. Write to .env
  heading("Writing Configuration");
  const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
  const envPath = join(rootDir, ".env");
  const envLine = `PUBLIC_GA_ID=${measurementId}`;

  if (existsSync(envPath)) {
    const content = await readFile(envPath, "utf8");
    if (content.includes("PUBLIC_GA_ID=")) {
      const updated = content.replace(/^PUBLIC_GA_ID=.*$/m, envLine);
      await writeFile(envPath, updated, "utf8");
      success(`Updated PUBLIC_GA_ID in .env`);
    } else {
      await writeFile(envPath, content.trimEnd() + "\n" + envLine + "\n", "utf8");
      success(`Appended PUBLIC_GA_ID to .env`);
    }
  } else {
    await writeFile(envPath, envLine + "\n", "utf8");
    success(`Created .env with PUBLIC_GA_ID`);
  }

  // 5. Patch deploy workflow if needed
  const workflowPath = join(rootDir, ".github/workflows/deploy.yml");
  if (existsSync(workflowPath)) {
    const wf = await readFile(workflowPath, "utf8");
    if (!wf.includes("PUBLIC_GA_ID")) {
      const patched = wf.replace(
        /(\s+- name: Build\n\s+run: bun run build)/,
        `$1\n        env:\n          PUBLIC_GA_ID: \${{ secrets.GA_MEASUREMENT_ID }}`,
      );
      if (patched !== wf) {
        await writeFile(workflowPath, patched, "utf8");
        success("Patched deploy.yml → Build step now reads GA_MEASUREMENT_ID secret");
      } else {
        info("Could not auto-patch deploy.yml — add the env var manually (see below)");
      }
    } else {
      info("deploy.yml already has PUBLIC_GA_ID");
    }
  }

  // 6. Summary
  heading("Done! Next Steps");
  console.log(`
    Measurement ID: ${measurementId}

    Local dev:
      Already written to .env — GA4 is active in local builds.

    Production (GitHub Pages):
      1. Go to your repo → Settings → Secrets and variables → Actions
      2. Click "New repository secret"
      3. Name:  GA_MEASUREMENT_ID
         Value: ${measurementId}
      4. Push to main — the deploy workflow will pick it up.

    Verify:
      Open https://analytics.google.com → Realtime
      Visit your site — you should see yourself as a live user.
  `);
}

main().catch((err) => {
  die(err.message ?? String(err));
});
