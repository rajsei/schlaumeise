import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const sidebarMetadataSchema = z.object({
  label: z.string().optional(),
  order: z.number().optional(),
  hidden: z.boolean().optional(),
  attrs: z.record(z.string(), z.string()).optional(),
});

const docs = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/docs",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    showSidebar: z.boolean().optional(),
    sidebar: z.union([z.boolean(), sidebarMetadataSchema]).optional(),
    topicId: z.string().optional(),
  }),
});

export const collections = {
  docs,
};
