# Model Providers Comparison

AI model throughput and pricing comparison dashboard built with Astro, React, and Recharts.

## Tech Stack

- **Framework**: Astro v5 with React islands
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Charts**: Recharts
- **Data**: Astro Content Collections (JSON files with Zod validation)
- **Package Manager**: Bun
- **Deployment**: GitHub Pages via GitHub Actions

## Commands

```sh
bun install    # install dependencies
bun run dev    # start dev server at localhost:4321
bun run build  # build static site to dist/
bun run preview # preview production build locally
```

## Project Structure

```
src/
├── content/
│   ├── config.ts          # Collection schemas (Zod)
│   └── models/*.json      # One JSON file per AI model
├── components/
│   ├── ModelDashboard.tsx  # Main React island (tabs, hero, legend)
│   └── ui/                # Chart sub-components
│       ├── ThroughputChart.tsx
│       ├── PricingChart.tsx
│       ├── ScatterPlot.tsx
│       └── DataTable.tsx
├── data/
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── colors.ts          # Provider → color mapping
│   └── i18n.ts            # EN/JA translations
├── layouts/
│   └── BaseLayout.astro   # HTML shell with fonts & meta
├── pages/
│   └── index.astro        # Entry page, fetches collection data
└── styles/
    └── global.css         # Tailwind import + dark theme base
```

## Adding a Model

1. Create a new JSON file in `src/content/models/` (e.g., `new-model.json`)
2. Follow the schema: `name`, `provider`, `tps`, `input`, `output`, `hero`, `tag`
3. If the provider is new, add its color to `src/data/colors.ts`

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`.

**One-time setup**: In GitHub repo Settings → Pages → Source, select "GitHub Actions".

Site URL: `https://ai-driven-office.github.io/model-providers-comparison/`
