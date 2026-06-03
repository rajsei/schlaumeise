// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import { createDocsCodeTransformer } from "./src/plugins/shiki-transformer-docs-code.mjs";
import { rehypeCodeBlockWrapper } from "./src/plugins/rehype-code-block-wrapper.mjs";

// https://astro.build/config
export default defineConfig({
  base: "/schlaumeise",
  i18n: {
    defaultLocale: "de",
    locales: ["de" , "en"],
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
