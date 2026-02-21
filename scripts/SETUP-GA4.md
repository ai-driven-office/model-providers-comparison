# GA4 Setup Guide

Automated CLI to create a Google Analytics 4 property, web data stream, and wire the Measurement ID into your project.

## Prerequisites

### 1. Google Analytics account

If you don't have one, go to [analytics.google.com](https://analytics.google.com) and create an account (free).

### 2. Google Cloud project with Analytics Admin API enabled

The script uses the Admin API to create the property programmatically. You need to enable it once:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select an existing project or click **New Project** to create one (any name works)
3. Open the API library for Analytics Admin API:

   [Enable Analytics Admin API](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com)

4. Click **Enable**

That's it — the API is now available for your project.

### 3. Authentication (pick one)

**Option A — gcloud CLI (recommended)**

If you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

The script will automatically get an access token via `gcloud auth print-access-token`.

**Option B — OAuth Playground (no install needed)**

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. In **Step 1**, find **Google Analytics Admin API v1beta** and select:

   ```
   https://www.googleapis.com/auth/analytics.edit
   ```

3. Click **Authorize APIs** → sign in → grant access
4. In **Step 2**, click **Exchange authorization code for tokens**
5. Copy the **Access token** (starts with `ya29.`)

## Run the Script

```bash
# Option A — gcloud handles auth automatically
bun scripts/setup-ga4.ts

# Option B — pass the token from OAuth Playground
bun scripts/setup-ga4.ts --token ya29.xxxxx
```

The script will:

1. List your Google Analytics accounts and let you pick one
2. Create a GA4 property ("AI Model Comparison")
3. Create a web data stream for `ai-driven-office.github.io/model-providers-comparison/`
4. Write `PUBLIC_GA_ID=G-XXXXXXXXXX` to `.env`
5. Patch `.github/workflows/deploy.yml` to inject the secret into the build step

## After Running

### Local development

Already done — the Measurement ID is in `.env` and will be picked up by `bun run dev`.

### Production (GitHub Pages)

Add the Measurement ID as a repository secret so the deploy workflow can use it:

1. Go to your repo on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GA_MEASUREMENT_ID`
5. Value: the `G-XXXXXXXXXX` ID printed by the script
6. Click **Add secret**

Next push to `main` will deploy with analytics active.

### Verify it works

1. Open [Google Analytics](https://analytics.google.com) → select your new property
2. Go to **Reports** → **Realtime**
3. Visit your site in another tab
4. You should appear as a live user within a few seconds

## What Gets Tracked

Out of the box (GA4 enhanced measurement):

- Page views
- Scroll depth
- Outbound link clicks
- Site search
- Session engagement

Custom events added to this project:

| Event | Parameter | Trigger |
|---|---|---|
| `tab_switch` | `tab_name` | User clicks a dashboard tab |
| `lang_switch` | `language` | User toggles EN/JA |
| `share` | `method` | User shares via X, copy link, or native share |

## Troubleshooting

**"API has not been used in project X"**
→ You need to enable the Analytics Admin API. Click the link in step 2 of Prerequisites above.

**"Request had insufficient authentication scopes"**
→ Your token doesn't have the `analytics.edit` scope. Re-run `gcloud auth login` or redo the OAuth Playground flow with the correct scope selected.

**"No Google Analytics accounts found"**
→ You need a Google Analytics account (not just a Google account). Create one at [analytics.google.com](https://analytics.google.com).

**GA4 script not appearing in production**
→ Check that `GA_MEASUREMENT_ID` is set as a GitHub Actions secret and that `deploy.yml` has `PUBLIC_GA_ID: ${{ secrets.GA_MEASUREMENT_ID }}` in the Build step's `env`.
