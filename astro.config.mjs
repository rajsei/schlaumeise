// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightImageZoom from "starlight-image-zoom";
import starlightKbd from "starlight-kbd";
import starlightFullViewMode from "starlight-fullview-mode";
import starlightGitHubAlerts from "starlight-github-alerts";
import starlightUtils from "@lorenzo_lewis/starlight-utils";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightUtils({
          navLinks: {
            leading: { useSidebarLabelled: "leadingNavLinks" },
          },
        }),
        starlightImageZoom(),
        starlightKbd({
          types: [
            { id: "windows", label: "Windows", default: true },
            { id: "mac", label: "macOS" },
          ],
        }),
        starlightFullViewMode({
          leftSidebarEnabled: false,
          rightSidebarEnabled: true,
        }),
        starlightGitHubAlerts(),
      ],
      title: "Schlaumeise",
      //social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
      logo: {
        src: "./src/assets/favicon.svg",
      },

      sidebar: [
        {
          label: "leadingNavLinks",
          items: [{ label: "Overview", slug: "project_overview" }],
        },

        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
