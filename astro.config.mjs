// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import mdx from '@astrojs/mdx';
import tailwindcss from "@tailwindcss/vite";
import { createDocsCodeTransformer } from "./src/plugins/shiki-transformer-docs-code.mjs";
import { rehypeCodeBlockWrapper } from "./src/plugins/rehype-code-block-wrapper.mjs";

// Content-Ordner-Umbenennung (todo #15, 2026-07-11): knowledge_collection →
// knowledge, workshop_materials → workshops, guides/birdnet_live →
// guides/birdnet-live. Explizite Redirects für alle Seiten, die zum
// Migrationszeitpunkt unter den alten Pfaden existierten — später neu
// angelegte Seiten brauchen keine Einträge, da es sie unter den alten
// URLs nie gab. Statischer Build ⇒ Meta-Refresh-Seiten.
function buildRenameRedirects(localePrefixes, from, to, pages) {
  const redirects = {};
  for (const prefix of localePrefixes) {
    for (const page of pages) {
      const suffix = page ? `/${page}` : "";
      redirects[`${prefix}/${from}${suffix}`] = `${prefix}/${to}${suffix}`;
    }
  }
  return redirects;
}

const contentRenameRedirects = {
  ...buildRenameRedirects(["", "/en"], "guides/birdnet_live", "guides/birdnet-live", [
    "", "aru", "live", "point-count", "settings", "survey",
  ]),
  ...buildRenameRedirects(["", "/en"], "knowledge_collection", "knowledge", [
    "acoustics", "ai-and-bioacoustic", "audiosample", "bioacoustics", "biology", "birds",
  ]),
  ...buildRenameRedirects([""], "workshop_materials", "workshops", ["springschool"]),
  ...buildRenameRedirects(["/en"], "workshop_materials", "workshops", [
    "springschool", "springschool/data", "springschool/hotspot-setup",
    "springschool/more", "springschool/pi-settings", "springschool/pi-setup",
  ]),
};

// https://astro.build/config
export default defineConfig({
  site: "https://rajsei.github.io",
  base: "/schlaumeise",
  redirects: {
    ...contentRenameRedirects,
    // Alte URL mit "+" (Encoding-Risiko), umbenannt am 2026-06-12;
    // Ziel seit der Ordner-Migration (#15) direkt unter /knowledge/
    "/knowledge_collection/ai+bioacoustic": "/knowledge/ai-and-bioacoustic",
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
