// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import { createDocsCodeTransformer } from "./src/plugins/shiki-transformer-docs-code.mjs";
import { rehypeCodeBlockWrapper } from "./src/plugins/rehype-code-block-wrapper.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://rajsei.github.io",
  base: "/schlaumeise",
  redirects: {
    // Alte URL mit "+" (Encoding-Risiko), umbenannt am 2026-06-12
    "/knowledge_collection/ai+bioacoustic": "/knowledge_collection/ai-and-bioacoustic",
  },
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap(), mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [createDocsCodeTransformer()],
    },
    rehypePlugins: [rehypeCodeBlockWrapper],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
