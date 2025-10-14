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
  site: "https://rajsei.github.io/schlaumeise/",
  base: "/schlaumeise/",
  integrations: [
    starlight({
      customCss: ["./src/styles/project.css"],
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
          items: [
            { label: "Projekte", slug: "projects" },
            { label: "Impressum", slug: "impressum" },
          ],
        },

        {
          label: "Das lauschende Vogelhaus",
          autogenerate: { directory: "project01" },
        },
        {
          label: "Wissenssammlung",
          autogenerate: { directory: "knowledge_collection" },
        },
        //{label: "Project02",autogenerate: { directory: "project02" },},
        {
          label: "Begriffsverzeichnis",
          autogenerate: { directory: "glossary" },
        },
      ],
    }),
  ],
});
