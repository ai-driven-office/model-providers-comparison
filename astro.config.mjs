import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ai-driven-office.github.io",
  base: "/model-providers-comparison",

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});
