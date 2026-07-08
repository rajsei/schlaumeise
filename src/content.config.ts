import { defineCollection, z } from "astro:content";

const paginationOverrideSchema = z.union([
  z.boolean(),
  z.string(),
  z.object({
    link: z.string().optional(),
    label: z.string().optional(),
  }),
]);

const docs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    menu: z.boolean().optional(),
    content: z.boolean().optional(),
    sidebar: z
      .union([
        z.boolean(),
        z.object({
          label: z.string().optional(),
          order: z.number().optional(),
          hidden: z.boolean().optional(),
          attrs: z.record(z.string()).optional(),
        }),
      ])
      .optional(),
    topicId: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    prev: paginationOverrideSchema.optional(),
    next: paginationOverrideSchema.optional(),
  }),
});

// Startseiten-Fließtext je Sprache (src/content/home/<locale>.mdx).
// Wird direkt als Komponente in die index-Seiten importiert, nicht geroutet;
// die Deklaration verhindert nur die "auto-generierte Collection"-Warnung.
const home = defineCollection({
  type: "content",
  schema: z.object({}).passthrough(),
});

export const collections = {
  docs,
  home,
};
