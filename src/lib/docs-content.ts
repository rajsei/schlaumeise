import { getCollection } from "astro:content";
import { defaultLocale, isLocale, type Locale, locales } from "@i18n/config";
import type { DocsEntry } from "@types/docs";

export function getEntryLocale(entry: DocsEntry): Locale | null {
  const first = entry.id.split("/")[0] ?? "";
  return isLocale(first) ? first : null;
}

// Entry-IDs der Loader-API sind bereits Pfade ohne Dateiendung und ohne
// trailing "/index" (siehe content.config.ts): erstes Segment = Locale,
// Rest = Doc-Pfad (= URL-Pfad unterhalb der Locale).
export function getEntryDocPath(entry: DocsEntry): string {
  const [, ...segments] = entry.id.split("/");
  return segments.join("/");
}

function normalizeSlugParam(value: string | undefined): string {
  if (!value) {
    return "";
  }
  return value.replace(/^\/+|\/+$/g, "");
}

export async function getDocsEntriesForLocale(
  locale: Locale,
): Promise<DocsEntry[]> {
  const entries = await getCollection("docs");
  return entries.filter((entry) => getEntryLocale(entry) === locale);
}

export async function getDefaultLocaleDocsEntries(): Promise<DocsEntry[]> {
  return getDocsEntriesForLocale(defaultLocale);
}

export async function getLocalizedDocsEntries(): Promise<
  Record<Locale, DocsEntry[]>
> {
  const result = {} as Record<Locale, DocsEntry[]>;
  await Promise.all(
    locales.map(async (locale) => {
      result[locale] = await getDocsEntriesForLocale(locale);
    }),
  );
  return result;
}

export function createSlugParam(entry: DocsEntry): string {
  return getEntryDocPath(entry);
}

export function findDocEntryBySlug(
  entries: DocsEntry[],
  slug: string | undefined,
): DocsEntry | null {
  const normalized = normalizeSlugParam(slug);
  return entries.find((entry) => getEntryDocPath(entry) === normalized) ?? null;
}
