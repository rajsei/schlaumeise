import { z } from "astro/zod";

/**
 * Quiz-Schema (Single Source of Truth).
 *
 * Quizdaten liegen als JSON unter `src/data/quizzes/<locale>/<quiz-id>.json`
 * und werden über `src/lib/quizzes.ts` geladen und beim Build validiert.
 * Die TypeScript-Typen werden aus diesem Zod-Schema abgeleitet —
 * Schema ändern = Typen ändern. Details: docs/quiz-handbook.md
 */

/** Medienreferenz, relativ zu `src/assets/` (z. B. "audio/Blauhaeher.mp3"). */
export const quizMediaSchema = z.object({
  type: z.enum(["image", "audio"]),
  src: z.string().min(1),
  /** Alt-Text (Bild) bzw. textliche Beschreibung (Audio) — Pflicht für Accessibility. */
  alt: z.string().min(1),
});

export const quizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().optional(),
  media: quizMediaSchema.optional(),
});

const questionBase = {
  id: z.string().min(1),
  /** Fragetext. */
  prompt: z.string().min(1),
  /** Optionales Medium zur Frage (Bildfrage, Audiofrage). */
  media: quizMediaSchema.optional(),
  /** Erklärung, die nach dem Beantworten angezeigt wird. */
  explanation: z.string().optional(),
  /** Verweis auf eine Lernseite (Doc-Pfad ohne Locale, z. B. "knowledge_collection/birds"). */
  relatedDoc: z.string().optional(),
};

export const singleChoiceQuestionSchema = z.object({
  ...questionBase,
  type: z.literal("single-choice"),
  options: z.array(quizOptionSchema).min(2),
  correctOptionId: z.string().min(1),
});

export const multipleChoiceQuestionSchema = z.object({
  ...questionBase,
  type: z.literal("multiple-choice"),
  options: z.array(quizOptionSchema).min(2),
  correctOptionIds: z.array(z.string().min(1)).min(1),
});

export const trueFalseQuestionSchema = z.object({
  ...questionBase,
  type: z.literal("true-false"),
  correctAnswer: z.boolean(),
});

/** Reihenfolge-Aufgabe: Items in die richtige Reihenfolge bringen. */
export const orderingQuestionSchema = z.object({
  ...questionBase,
  type: z.literal("ordering"),
  items: z.array(quizOptionSchema).min(2),
  /** Item-IDs in korrekter Reihenfolge. */
  correctOrder: z.array(z.string().min(1)).min(2),
});

/** Zuordnungsaufgabe: linke und rechte Begriffe paaren. */
export const matchingQuestionSchema = z.object({
  ...questionBase,
  type: z.literal("matching"),
  pairs: z
    .array(
      z.object({
        id: z.string().min(1),
        left: quizOptionSchema.omit({ id: true }),
        right: quizOptionSchema.omit({ id: true }),
      }),
    )
    .min(2),
});

export const quizQuestionSchema = z.discriminatedUnion("type", [
  singleChoiceQuestionSchema,
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  orderingQuestionSchema,
  matchingQuestionSchema,
]);

export const quizSchema = z.object({
  /** Eindeutige ID, identisch mit Dateinamen (kebab-case). */
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  /** Schemaversion für spätere Migrationen. */
  version: z.literal(1),
  locale: z.enum(["de", "en"]),
  title: z.string().min(1),
  description: z.string().optional(),
  /** Themenbereich aus docs-navigation (z. B. "knowledge_collection"). */
  topicId: z.string().optional(),
  /** Zugehörige Lernseite (Doc-Pfad ohne Locale). */
  relatedDoc: z.string().optional(),
  shuffleQuestions: z.boolean().default(false),
  questions: z.array(quizQuestionSchema).min(1),
});

export type QuizMedia = z.infer<typeof quizMediaSchema>;
export type QuizOption = z.infer<typeof quizOptionSchema>;
export type SingleChoiceQuestion = z.infer<typeof singleChoiceQuestionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type TrueFalseQuestion = z.infer<typeof trueFalseQuestionSchema>;
export type OrderingQuestion = z.infer<typeof orderingQuestionSchema>;
export type MatchingQuestion = z.infer<typeof matchingQuestionSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Quiz = z.infer<typeof quizSchema>;

/** Zusätzliche Konsistenzprüfungen, die Zod allein nicht abdeckt. */
export function validateQuizIntegrity(quiz: Quiz): string[] {
  const problems: string[] = [];

  for (const question of quiz.questions) {
    switch (question.type) {
      case "single-choice": {
        if (!question.options.some((o) => o.id === question.correctOptionId)) {
          problems.push(
            `${quiz.id}/${question.id}: correctOptionId "${question.correctOptionId}" existiert nicht in options.`,
          );
        }
        break;
      }
      case "multiple-choice": {
        for (const id of question.correctOptionIds) {
          if (!question.options.some((o) => o.id === id)) {
            problems.push(
              `${quiz.id}/${question.id}: correctOptionIds enthält unbekannte ID "${id}".`,
            );
          }
        }
        break;
      }
      case "ordering": {
        const itemIds = new Set(question.items.map((i) => i.id));
        if (
          question.correctOrder.length !== itemIds.size ||
          !question.correctOrder.every((id) => itemIds.has(id))
        ) {
          problems.push(
            `${quiz.id}/${question.id}: correctOrder muss exakt alle Item-IDs enthalten.`,
          );
        }
        break;
      }
      default:
        break;
    }
  }

  return problems;
}
