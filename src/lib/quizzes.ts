import type { Locale } from "@i18n/config";
import { quizSchema, validateQuizIntegrity, type Quiz } from "./quiz-schema";

/**
 * Lädt alle Quiz-JSON-Dateien aus `src/data/quizzes/` und validiert sie
 * beim Build gegen das Schema. Schlägt die Validierung fehl, bricht der
 * Build mit einer aussagekräftigen Fehlermeldung ab — fehlerhafte
 * Quizdaten erreichen so nie die Produktion.
 */
const quizModules = import.meta.glob<{ default: unknown }>(
  "../data/quizzes/**/*.json",
  { eager: true },
);

let cache: Quiz[] | null = null;

export function getAllQuizzes(): Quiz[] {
  if (cache) {
    return cache;
  }

  cache = Object.entries(quizModules).map(([path, module]) => {
    const parsed = quizSchema.safeParse(module.default);
    if (!parsed.success) {
      throw new Error(
        `Ungültiges Quiz in ${path}:\n${parsed.error.issues
          .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
          .join("\n")}`,
      );
    }

    const problems = validateQuizIntegrity(parsed.data);
    if (problems.length > 0) {
      throw new Error(
        `Inkonsistentes Quiz in ${path}:\n${problems
          .map((problem) => `  - ${problem}`)
          .join("\n")}`,
      );
    }

    return parsed.data;
  });

  return cache;
}

export function getQuizzesForLocale(locale: Locale): Quiz[] {
  return getAllQuizzes().filter((quiz) => quiz.locale === locale);
}

export function getQuizById(locale: Locale, id: string): Quiz | null {
  return (
    getQuizzesForLocale(locale).find((quiz) => quiz.id === id) ?? null
  );
}
