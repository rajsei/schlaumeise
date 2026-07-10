import { defineCollection, z } from "astro:content";

const paginationOverrideSchema = z.union([
  z.boolean(),
  z.string(),
  z.object({
    link: z.string().optional(),
    label: z.string().optional(),
  }),
]);

// Projekt-Steckbrief (docs/roadmap.md "Projekt-Steckbrief & Projektübersicht"):
// kompakte Einordnung eines Projekts auf seiner index-Seite. Wird von
// DocsLayout automatisch als ProjectMeta-Karte gerendert, sobald `project`
// im Frontmatter gesetzt ist. Skalen (difficulty/skillLevel): 1 = leicht /
// keine Vorkenntnisse, 2 = mittel / Grundkenntnisse, 3 = anspruchsvoll /
// Fortgeschritten. Freitextfelder (duration, cost, …) sind lokalisiert und
// stehen je Sprachversion im jeweiligen Frontmatter.
const projectMetaSchema = z.object({
  difficulty: z.number().int().min(1).max(3),
  skillLevel: z.number().int().min(1).max(3),
  duration: z.string(),
  cost: z.string(),
  supervision: z.enum(["alone", "adults", "supervised"]),
  ageMin: z.number().int().positive(),
  indoorOutdoor: z.enum(["indoor", "outdoor", "both"]),
  tools: z.array(z.string()).optional(),
  learningGoals: z.array(z.string()).optional(),
  safetyNotes: z.string().optional(),
});

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
    project: projectMetaSchema.optional(),
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
