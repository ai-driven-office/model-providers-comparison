import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ai-driven-office.github.io",
  base: "/model-providers-comparison",

  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true,
  },

  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes("/booth") &&
        !page.includes("/language-is-the-prompt"),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // This package frequently gets re-optimized in dev, which can yield
      // stale /node_modules/.vite/deps URLs and 504 "Outdated Optimize Dep".
      exclude: ["@paper-design/shaders-react", "@paper-design/shaders"],
    },
  },
});
