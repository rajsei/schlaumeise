import { getCollection } from "astro:content";
import { defaultLocale, isLocale, type Locale, locales } from "@i18n/config";
import type { DocsEntry } from "@types/docs";

const getCollectionUnsafe = getCollection as unknown as (
  collection: string,
) => Promise<DocsEntry[]>;

export function getEntryLocale(entry: DocsEntry): Locale | null {
  const first = entry.id.split("/")[0] ?? "";
  return isLocale(first) ? first : null;
}

export function getEntryDocPath(entry: DocsEntry): string {
  const [, ...segments] = entry.id.split("/");
  return segments
    .join("/")
    .replace(/\.(md|mdx)$/i, "")
    .replace(/\/index$/i, "");
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
  const entries = await getCollectionUnsafe("docs");
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
