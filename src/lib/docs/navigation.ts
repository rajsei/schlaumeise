import type { CollectionEntry } from "astro:content";
import { navigation, type NavigationConfig, type SidebarConfigItem } from "../../config/navigation";
import type { Locale } from "../../i18n/config";
import { buildLocalizedUrl, withBase } from "../../i18n/routing";

interface SidebarMetadata {
  label?: string;
  order?: number;
  hidden?: boolean;
  attrs?: Record<string, string>;
}

interface DocsPageRef {
  slug: string;
  title: string;
  label: string;
  href: string;
  order: number;
  hidden: boolean;
  attrs: Record<string, string>;
  topicId?: string;
}

export interface ResolvedSidebarDivider {
  type: "divider";
}

export interface ResolvedSidebarLink {
  type: "link";
  label: string;
  href: string;
  isExternal: boolean;
  isActive: boolean;
  attrs: Record<string, string>;
}

export interface ResolvedSidebarGroup {
  type: "group";
  label: string;
  collapsed: boolean;
  isActive: boolean;
  items: ResolvedSidebarItem[];
}

export type ResolvedSidebarItem =
  | ResolvedSidebarDivider
  | ResolvedSidebarLink
  | ResolvedSidebarGroup;

export interface ResolvedTopic {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  isExternal: boolean;
  isActive: boolean;
  hasItems: boolean;
  items: ResolvedSidebarItem[];
}

export interface ResolvedDocsNavigation {
  topics: ResolvedTopic[];
  activeTopicId: string | null;
  topicItems: ResolvedSidebarItem[];
  globalItems: ResolvedSidebarItem[];
}

function normalizePathname(path: string): string {
  try {
    const pathname = new URL(path, "https://local.invalid").pathname;
    const withoutTrailing = pathname.replace(/\/+$/, "");
    return withoutTrailing || "/";
  } catch {
    const withoutTrailing = path.replace(/\/+$/, "");
    return withoutTrailing || "/";
  }
}

function isExternalLink(link: string): boolean {
  return /^https?:\/\//i.test(link);
}

function resolveLabel(
  locale: Locale,
  label?: string,
  translations?: Partial<Record<Locale, string>>,
  fallback = "",
): string {
  return translations?.[locale] ?? label ?? fallback;
}

function toLocaleSlug(id: string, locale: Locale): string | null {
  const localePrefix = `${locale}/`;
  if (!id.startsWith(localePrefix)) {
    return null;
  }

  let slug = id.slice(localePrefix.length).replace(/\.(md|mdx)$/i, "");
  slug = slug.replace(/^\/+|\/+$/g, "");

  if (slug === "index") {
    return "";
  }

  if (slug.endsWith("/index")) {
    return slug.slice(0, -"/index".length);
  }

  return slug;
}

function frontmatterSidebarMeta(sidebar: unknown): SidebarMetadata | null {
  if (!sidebar || typeof sidebar !== "object" || Array.isArray(sidebar)) {
    return null;
  }

  const input = sidebar as Record<string, unknown>;
  const attrs: Record<string, string> = {};
  const attrsInput = input.attrs;

  if (attrsInput && typeof attrsInput === "object" && !Array.isArray(attrsInput)) {
    for (const [key, value] of Object.entries(attrsInput)) {
      if (typeof value === "string") {
        attrs[key] = value;
      }
    }
  }

  return {
    label: typeof input.label === "string" ? input.label : undefined,
    order: typeof input.order === "number" ? input.order : undefined,
    hidden: typeof input.hidden === "boolean" ? input.hidden : undefined,
    attrs,
  };
}

function buildDocPageMap(
  locale: Locale,
  docs: CollectionEntry<"docs">[],
): Map<string, DocsPageRef> {
  const map = new Map<string, DocsPageRef>();

  for (const doc of docs) {
    const slug = toLocaleSlug(doc.id, locale);
    if (slug === null) {
      continue;
    }

    const sidebarMeta = frontmatterSidebarMeta(doc.data.sidebar);
    const label = sidebarMeta?.label ?? doc.data.title;
    const order = sidebarMeta?.order ?? Number.POSITIVE_INFINITY;
    const hidden = sidebarMeta?.hidden ?? false;
    const href = buildLocalizedUrl(locale, slug ? `/${slug}/` : "/");
    const attrs = sidebarMeta?.attrs ?? {};

    map.set(slug, {
      slug,
      title: doc.data.title,
      label,
      href,
      order,
      hidden,
      attrs,
      topicId: doc.data.topicId,
    });
  }

  return map;
}

function resolveSlugLink(
  slug: string,
  docs: Map<string, DocsPageRef>,
): DocsPageRef | null {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
  return docs.get(normalizedSlug) ?? null;
}

function resolveConfigItem(
  item: SidebarConfigItem,
  locale: Locale,
  docs: Map<string, DocsPageRef>,
  currentPathname: string,
): ResolvedSidebarItem[] {
  if (typeof item === "string") {
    const page = resolveSlugLink(item, docs);
    if (!page || page.hidden) {
      return [];
    }

    return [
      {
        type: "link",
        label: page.label,
        href: page.href,
        isExternal: false,
        isActive: normalizePathname(page.href) === currentPathname,
        attrs: page.attrs,
      },
    ];
  }

  if ("divider" in item && item.divider) {
    return [{ type: "divider" }];
  }

  if ("autogenerate" in item) {
    const directory = item.autogenerate.directory.replace(/^\/+|\/+$/g, "");
    const directoryPrefix = directory ? `${directory}/` : "";
    const pages = Array.from(docs.values())
      .filter((page) => {
        if (page.hidden) {
          return false;
        }

        if (!directory) {
          return true;
        }

        return page.slug === directory || page.slug.startsWith(directoryPrefix);
      })
      .sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }

        return a.slug.localeCompare(b.slug);
      });

    return pages.map((page) => ({
      type: "link",
      label: page.label,
      href: page.href,
      isExternal: false,
      isActive: normalizePathname(page.href) === currentPathname,
      attrs: {
        ...(item.autogenerate.attrs ?? {}),
        ...page.attrs,
      },
    }));
  }

  if ("items" in item && Array.isArray(item.items)) {
    const resolvedItems = item.items.flatMap((child) =>
      resolveConfigItem(child, locale, docs, currentPathname),
    );
    const isActive = resolvedItems.some((entry) =>
      entry.type === "group" ? entry.isActive : entry.type === "link" ? entry.isActive : false,
    );

    return [
      {
        type: "group",
        label: resolveLabel(locale, item.label, item.translations, item.label),
        collapsed: item.collapsed ?? false,
        isActive,
        items: resolvedItems,
      },
    ];
  }

  if ("slug" in item && item.slug) {
    const page = resolveSlugLink(item.slug, docs);
    if (!page || page.hidden) {
      return [];
    }

    return [
      {
        type: "link",
        label: resolveLabel(locale, item.label, item.translations, page.label),
        href: page.href,
        isExternal: false,
        isActive: normalizePathname(page.href) === currentPathname,
        attrs: {
          ...page.attrs,
          ...(item.attrs ?? {}),
        },
      },
    ];
  }

  if ("link" in item && item.link) {
    const link = isExternalLink(item.link)
      ? item.link
      : withBase(item.link.startsWith("/") ? item.link : `/${item.link}`);

    return [
      {
        type: "link",
        label: resolveLabel(locale, item.label, item.translations, item.link),
        href: link,
        isExternal: isExternalLink(link),
        isActive: !isExternalLink(link) && normalizePathname(link) === currentPathname,
        attrs: item.attrs ?? {},
      },
    ];
  }

  return [];
}

function resolveTopicItems(
  locale: Locale,
  topic: NavigationConfig["topics"][number],
  docs: Map<string, DocsPageRef>,
  currentPathname: string,
): ResolvedSidebarItem[] {
  if (!topic.items?.length) {
    return [];
  }

  return topic.items.flatMap((item) =>
    resolveConfigItem(item, locale, docs, currentPathname),
  );
}

function routeMatchesTopic(
  topicItems: ResolvedSidebarItem[],
  currentPathname: string,
): boolean {
  for (const item of topicItems) {
    if (item.type === "link" && !item.isExternal && normalizePathname(item.href) === currentPathname) {
      return true;
    }

    if (item.type === "group" && routeMatchesTopic(item.items, currentPathname)) {
      return true;
    }
  }

  return false;
}

export function resolveDocsNavigation(params: {
  locale: Locale;
  currentPathname: string;
  docs: CollectionEntry<"docs">[];
  currentTopicId?: string;
}): ResolvedDocsNavigation {
  const { locale } = params;
  const currentPathname = normalizePathname(params.currentPathname);
  const docsMap = buildDocPageMap(locale, params.docs);
  const perTopicItems = new Map<string, ResolvedSidebarItem[]>();

  for (const topic of navigation.topics) {
    perTopicItems.set(
      topic.id,
      resolveTopicItems(locale, topic, docsMap, currentPathname),
    );
  }

  let activeTopicId: string | null = null;

  if (params.currentTopicId && navigation.topics.some((topic) => topic.id === params.currentTopicId)) {
    activeTopicId = params.currentTopicId;
  } else {
    for (const topic of navigation.topics) {
      const topicHref = topic.link
        ? (isExternalLink(topic.link)
          ? topic.link
          : withBase(topic.link.startsWith("/") ? topic.link : `/${topic.link}`))
        : null;
      const topicItems = perTopicItems.get(topic.id) ?? [];

      if (routeMatchesTopic(topicItems, currentPathname)) {
        activeTopicId = topic.id;
        break;
      }

      if (
        topicHref &&
        topic.items?.length &&
        !isExternalLink(topicHref) &&
        normalizePathname(topicHref) === currentPathname
      ) {
        activeTopicId = topic.id;
        break;
      }
    }
  }

  const topics: ResolvedTopic[] = navigation.topics.map((topic) => {
    const href = topic.link
      ? (isExternalLink(topic.link)
        ? topic.link
        : withBase(topic.link.startsWith("/") ? topic.link : `/${topic.link}`))
      : undefined;
    return {
      id: topic.id,
      label: resolveLabel(locale, topic.label, topic.translations, topic.label),
      icon: topic.icon,
      href,
      isExternal: href ? isExternalLink(href) : false,
      isActive: topic.id === activeTopicId,
      hasItems: (topic.items?.length ?? 0) > 0,
      items: perTopicItems.get(topic.id) ?? [],
    };
  });

  const topicItems = activeTopicId ? perTopicItems.get(activeTopicId) ?? [] : [];
  const globalItems = (navigation.globalItems ?? []).flatMap((item) =>
    resolveConfigItem(item, locale, docsMap, currentPathname),
  );

  return {
    topics,
    activeTopicId,
    topicItems,
    globalItems,
  };
}
