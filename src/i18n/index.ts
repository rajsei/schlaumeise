import { defaultLocale, type Locale } from "./config";
import { de } from "./locales/de";
import { en } from "./locales/en";

export type Dictionary = {
  [Section in keyof typeof de]: {
    [Key in keyof (typeof de)[Section]]: string;
  };
};

const dictionaries = {
  de,
  en,
} satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function formatMessage(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => vars[key] ?? "");
}
