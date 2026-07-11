import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { quizSchema, validateQuizIntegrity } from "./lib/quiz-schema";

const paginationOverrideSchema = z.union([
  z.boolean(),
  z.string(),
  z.object({
    link: z.string().optional(),
    label: z.string().optional(),
  }),
]);

// Skala 1–3 als Literal-Union statt int().min(1).max(3), damit der
// abgeleitete Typ exakt `1 | 2 | 3` ist (passt zu ProjectMetaLevel in
// types/docs.ts) — Validierung ist identisch.
const projectMetaLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

// Projekt-Steckbrief (docs/roadmap.md "Projekt-Steckbrief & Projektübersicht"):
// kompakte Einordnung eines Projekts auf seiner index-Seite. Wird von
// DocsLayout automatisch als ProjectMeta-Karte gerendert, sobald `project`
// im Frontmatter gesetzt ist. Skalen (difficulty/skillLevel): 1 = leicht /
// keine Vorkenntnisse, 2 = mittel / Grundkenntnisse, 3 = anspruchsvoll /
// Fortgeschritten. Freitextfelder (duration, cost, …) sind lokalisiert und
// stehen je Sprachversion im jeweiligen Frontmatter.
const projectMetaSchema = z.object({
  difficulty: projectMetaLevelSchema,
  skillLevel: projectMetaLevelSchema,
  duration: z.string(),
  cost: z.string(),
  supervision: z.enum(["alone", "adults", "supervised"]),
  ageMin: z.number().int().positive(),
  indoorOutdoor: z.enum(["indoor", "outdoor", "both"]),
  tools: z.array(z.string()).optional(),
  learningGoals: z.array(z.string()).optional(),
  safetyNotes: z.string().optional(),
});

// Loader-API (todo #16): Entry-IDs sind Pfade relativ zu `base`, ohne
// Dateiendung und ohne trailing `/index` (z. B. "de/knowledge/birds",
// "de/projects/project01"). Erstes Segment = Locale, Rest = Doc-Pfad
// (siehe src/lib/docs-content.ts).
const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Kurzdefinition (1–2 Sätze) für das Inline-Glossar: wird von der
    // Term-Komponente als Tooltip angezeigt. Nur für glossary/-Einträge gedacht.
    definition: z.string().optional(),
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
// die Deklaration verhindert nur die "unbekannter Ordner in src/content"-Warnung.
const home = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/home" }),
  schema: z.object({}).passthrough(),
});

// Quiz-Daten (docs/quiz-handbook.md): eine JSON-Datei pro Quiz unter
// src/data/quizzes/<locale>/<quiz-id>.json. Zod-Validierung + Konsistenz-
// prüfungen laufen build-seitig über das Collection-Schema — fehlerhafte
// Quizze brechen den Build ab und erreichen nie die Produktion.
const quizzes = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/data/quizzes" }),
  schema: quizSchema.superRefine((quiz, ctx) => {
    for (const problem of validateQuizIntegrity(quiz)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: problem });
    }
  }),
});

export const collections = {
  docs,
  home,
  quizzes,
};
