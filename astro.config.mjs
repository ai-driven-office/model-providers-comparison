import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ai-driven-office.github.io",
  base: "/model-providers-comparison",

  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true,
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: [/@lobehub\//],
    },
  },
});
