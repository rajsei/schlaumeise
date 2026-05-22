import { defaultLocale, isLocale, type Locale } from "./config";
import { siteConfig } from "../config/site.config";

function ensureLeadingSlash(path: string): string {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function normalizePath(path: string): string {
  const withLeadingSlash = ensureLeadingSlash(path);
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function stripBase(pathname: string): string {
  const normalized = normalizePath(pathname);
  const runtimeBase = import.meta.env.BASE_URL.replace(/\/$/, "");
  const bases = [runtimeBase, siteConfig.basePath].filter(Boolean);

  for (const base of bases) {
    if (normalized === base) {
      return "/";
    }

    if (normalized.startsWith(`${base}/`)) {
      const withoutBase = normalized.slice(base.length);
      return withoutBase || "/";
    }
  }

  return normalized;
}

export function getLocaleFromPathname(pathname: string): Locale {
  const firstSegment = stripBase(pathname).split("/")[1];
  if (firstSegment && isLocale(firstSegment) && firstSegment !== defaultLocale) {
    return firstSegment;
  }
  return defaultLocale;
}

export function stripLocaleFromPathname(pathname: string): string {
  const normalized = stripBase(pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) {
    return "/";
  }

  if (isLocale(segments[0]) && segments[0] !== defaultLocale) {
    segments.shift();
  }

  if (segments.length === 0) {
    return "/";
  }

  return `/${segments.join("/")}${normalized.endsWith("/") ? "/" : ""}`;
}

export function localizedPath(path: string, locale: Locale): string {
  const normalized = normalizePath(path);
  if (locale === defaultLocale) {
    return normalized;
  }

  return normalized === "/" ? `/${locale}/` : `/${locale}${normalized}`;
}

export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const pathWithoutLocale = stripLocaleFromPathname(pathname);
  return localizedPath(pathWithoutLocale, nextLocale);
}

export function withBase(path: string): string {
  const normalized = normalizePath(path);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  if (!base) {
    return normalized;
  }

  if (normalized === base || normalized.startsWith(`${base}/`)) {
    return normalized;
  }

  if (normalized === "/") {
    return `${base}/`;
  }

  return `${base}${normalized}`;
}

export function buildLocalizedUrl(locale: Locale, path = "/"): string {
  return withBase(localizedPath(path, locale));
}
