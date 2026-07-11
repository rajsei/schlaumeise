import { getCollection } from "astro:content";
import type { Locale } from "@i18n/config";
import type { Quiz } from "./quiz-schema";

/**
 * Zugriff auf die `quizzes`-Collection (content.config.ts, todo #16).
 *
 * Quizdaten liegen als JSON unter `src/data/quizzes/<locale>/<quiz-id>.json`
 * und werden vom glob()-Loader geladen. Schema- und Konsistenzvalidierung
 * (quizSchema + validateQuizIntegrity) laufen build-seitig über das
 * Collection-Schema — fehlerhafte Quizze brechen den Build ab und
 * erreichen so nie die Produktion.
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  const entries = await getCollection("quizzes");
  return entries.map((entry) => entry.data);
}

export async function getQuizzesForLocale(locale: Locale): Promise<Quiz[]> {
  const quizzes = await getAllQuizzes();
  return quizzes.filter((quiz) => quiz.locale === locale);
}

export async function getQuizById(
  locale: Locale,
  id: string,
): Promise<Quiz | null> {
  const quizzes = await getQuizzesForLocale(locale);
  return quizzes.find((quiz) => quiz.id === id) ?? null;
}
