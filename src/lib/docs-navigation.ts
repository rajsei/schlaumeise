import type { Locale } from "../i18n/config";
import { buildLocalizedUrl, withBase } from "../i18n/routing";
import type { DocsEntry, DocsPaginationOverride } from "../types/docs";
import {
  navigation,
  type NavigationAutogenerateItem,
  type NavigationConfig,
  type NavigationGroupItem,
  type NavigationLinkItem,
  type NavigationSidebarItem,
  type NavigationTopicWithItems,
  type NavigationTopicWithLink,
  type NavigationTopic,
  type TopicIconName,
} from "../config/docs-navigation";

interface SidebarMeta {
  label?: string;
  order?: number;
  hidden?: boolean;
  attrs?: Record<string, string>;
}

interface DocIndexEntry {
  path: string;
  href: string;
  title: string;
  sidebar: SidebarMeta;
}

export interface ResolvedNavLinkItem {
  type: "link";
  label: string;
  href: string;
  attrs?: Record<string, string>;
  active: boolean;
  emphasis?: boolean;
}

export interface ResolvedNavGroupItem {
  type: "group";
  label: string;
  items: ResolvedNavItem[];
  expanded: boolean;
  emphasis?: boolean;
}

export type ResolvedNavItem = ResolvedNavLinkItem | ResolvedNavGroupItem;

export interface ResolvedTopicWithItems {
  type: "items";
  id: string;
  label: string;
  icon?: TopicIconName;
  items: ResolvedNavItem[];
  active: boolean;
}

export interface ResolvedTopicLink {
  type: "link";
  id: string;
  label: string;
  icon?: TopicIconName;
  href: string;
  active: boolean;
}

export interface ResolvedTopicStatic {
  type: "static";
  id: string;
  label: string;
  icon?: TopicIconName;
}

export type ResolvedTopic =
  | ResolvedTopicWithItems
  | ResolvedTopicLink
  | ResolvedTopicStatic;

export interface ResolvedSidebarNavigation {
  topics: ResolvedTopic[];
  topicPanels: ResolvedTopicWithItems[];
  globalItems: ResolvedNavLinkItem[];
  activeTopicId: string | null;
}

export interface ResolvedDocsPaginationLink {
  href: string;
  label: string;
}

export interface ResolvedDocsPagination {
  prev: ResolvedDocsPaginationLink | null;
  next: ResolvedDocsPaginationLink | null;
}

function normalizeTrailingSlash(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

function normalizePath(path: string): string {
  const pathname = new URL(path, "https://docs.local").pathname;
  const withoutTrailing = pathname.replace(/\/+$/, "");
  return withoutTrailing === "" ? "/" : withoutTrailing;
}

function normalizeDocPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

function localizeLabel(
  label: string,
  translations: Partial<Record<Locale, string>> | undefined,
  locale: Locale,
): string {
  return translations?.[locale] ?? label;
}

function getDocPath(entry: DocsEntry): string {
  const [, ...segments] = entry.id.split("/");
  const docPath = segments
    .join("/")
    .replace(/\.(md|mdx)$/i, "")
    .replace(/\/index$/i, "");
  return normalizeDocPath(docPath);
}

function getDocLabel(entry: DocsEntry): string {
  const sidebar = entry.data.sidebar;
  if (sidebar && typeof sidebar === "object" && sidebar.label) {
    return sidebar.label;
  }
  return entry.data.title;
}

function getDocSidebarMeta(entry: DocsEntry): SidebarMeta {
  const sidebar = entry.data.sidebar;
  if (!sidebar || typeof sidebar !== "object") {
    return {};
  }

  return {
    label: sidebar.label,
    order: sidebar.order,
    hidden: sidebar.hidden,
    attrs: sidebar.attrs,
  };
}

function buildDocIndex(
  locale: Locale,
  entries: DocsEntry[],
): Map<string, DocIndexEntry> {
  return new Map(
    entries.map((entry) => {
      const path = getDocPath(entry);
      return [
        path,
        {
          path,
          href: buildLocalizedUrl(locale, normalizeTrailingSlash(`/${path}`)),
          title: getDocLabel(entry),
          sidebar: getDocSidebarMeta(entry),
        },
      ] as const;
    }),
  );
}

function isActivePath(currentPathname: string, href: string): boolean {
  return normalizePath(currentPathname) === normalizePath(href);
}

function createMissingDocLink(
  locale: Locale,
  currentPathname: string,
  docPath: string,
): ResolvedNavLinkItem {
  const href = buildLocalizedUrl(locale, normalizeTrailingSlash(`/${docPath}`));
  const fallbackLabel =
    docPath.split("/").filter(Boolean).pop()?.replace(/[-_]/g, " ") ?? docPath;
  return {
    type: "link",
    label: fallbackLabel,
    href,
    active: isActivePath(currentPathname, href),
  };
}

function resolveDocReference(
  locale: Locale,
  currentPathname: string,
  docIndex: Map<string, DocIndexEntry>,
  value: string,
): ResolvedNavLinkItem {
  const path = normalizeDocPath(value);
  const entry = docIndex.get(path);
  if (!entry) {
    return createMissingDocLink(locale, currentPathname, path);
  }

  return {
    type: "link",
    label: entry.title,
    href: entry.href,
    attrs: entry.sidebar.attrs,
    active: isActivePath(currentPathname, entry.href),
  };
}

function sortBySidebarOrder(a: DocIndexEntry, b: DocIndexEntry): number {
  const orderA = a.sidebar.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.sidebar.order ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  return a.title.localeCompare(b.title);
}

function resolveAutogenerated(
  currentPathname: string,
  docIndex: Map<string, DocIndexEntry>,
  definition: NavigationAutogenerateItem,
): ResolvedNavLinkItem[] {
  const directory = normalizeDocPath(definition.autogenerate.directory);

  return Array.from(docIndex.values())
    .filter((entry) => {
      if (entry.sidebar.hidden) {
        return false;
      }
      return entry.path === directory || entry.path.startsWith(`${directory}/`);
    })
    .sort(sortBySidebarOrder)
    .map((entry) => ({
      type: "link" as const,
      label: entry.title,
      href: entry.href,
      attrs: entry.sidebar.attrs,
      active: isActivePath(currentPathname, entry.href),
    }));
}

function isGroupItem(item: NavigationSidebarItem): item is NavigationGroupItem {
  return typeof item === "object" && "items" in item && !("link" in item);
}

function isAutogenerateItem(
  item: NavigationSidebarItem,
): item is NavigationAutogenerateItem {
  return typeof item === "object" && "autogenerate" in item;
}

function isLinkItem(item: NavigationSidebarItem): item is NavigationLinkItem {
  return typeof item === "object" && "link" in item;
}

function resolveLinkItem(
  locale: Locale,
  currentPathname: string,
  item: NavigationLinkItem,
): ResolvedNavLinkItem {
  const isExternal = item.link.startsWith("http");
  const href = isExternal ? item.link : buildLocalizedUrl(locale, item.link);

  return {
    type: "link",
    label: localizeLabel(item.label, item.translations, locale),
    href,
    attrs: item.attrs,
    active: isExternal ? false : isActivePath(currentPathname, href),
  };
}

function resolveSidebarItem(
  locale: Locale,
  currentPathname: string,
  docIndex: Map<string, DocIndexEntry>,
  item: NavigationSidebarItem,
  topLevel: boolean,
): ResolvedNavItem[] {
  if (typeof item === "string") {
    return [resolveDocReference(locale, currentPathname, docIndex, item)];
  }

  if (isAutogenerateItem(item)) {
    return resolveAutogenerated(currentPathname, docIndex, item);
  }

  if (isLinkItem(item)) {
    return [resolveLinkItem(locale, currentPathname, item)];
  }

  if (isGroupItem(item)) {
    const resolvedChildren = item.items.flatMap((child) =>
      resolveSidebarItem(locale, currentPathname, docIndex, child, false),
    );
    const hasActiveChild = resolvedChildren.some((child) =>
      child.type === "link" ? child.active : child.expanded,
    );

    return [
      {
        type: "group",
        label: localizeLabel(item.label, item.translations, locale),
        items: resolvedChildren,
        expanded: hasActiveChild,
        emphasis: topLevel,
      },
    ];
  }

  return [];
}

function topicHasItems(topic: NavigationTopic): topic is NavigationTopicWithItems {
  return "items" in topic;
}

function topicHasLink(topic: NavigationTopic): topic is NavigationTopicWithLink {
  return "link" in topic;
}

function getActiveTopicFromContent(
  entries: DocsEntry[],
  currentPathname: string,
  locale: Locale,
): string | null {
  for (const entry of entries) {
    const href = buildLocalizedUrl(
      locale,
      normalizeTrailingSlash(`/${getDocPath(entry)}`),
    );
    if (isActivePath(currentPathname, href)) {
      return entry.data.topicId ?? null;
    }
  }
  return null;
}

export function resolveSidebarNavigation(
  locale: Locale,
  currentPathname: string,
  docsEntries: DocsEntry[],
  config: NavigationConfig = navigation,
): ResolvedSidebarNavigation {
  const docIndex = buildDocIndex(locale, docsEntries);
  const contentTopicId = getActiveTopicFromContent(
    docsEntries,
    currentPathname,
    locale,
  );

  const topics: ResolvedTopic[] = [];
  const topicPanels: ResolvedTopicWithItems[] = [];

  for (const topic of config.topics) {
    const base = {
      id: topic.id,
      label: localizeLabel(topic.label, topic.translations, locale),
      icon: topic.icon,
    };

    if (topicHasItems(topic)) {
      const items = topic.items.flatMap((item) =>
        resolveSidebarItem(locale, currentPathname, docIndex, item, true),
      );
      const active = items.some((item) =>
        item.type === "link" ? item.active : item.expanded,
      );
      const resolved: ResolvedTopicWithItems = {
        ...base,
        type: "items",
        items,
        active,
      };
      topics.push(resolved);
      topicPanels.push(resolved);
      continue;
    }

    if (topicHasLink(topic)) {
      const isExternal = topic.link.startsWith("http");
      const href = isExternal ? topic.link : buildLocalizedUrl(locale, topic.link);
      topics.push({
        ...base,
        type: "link",
        href,
        active: isExternal ? false : isActivePath(currentPathname, href),
      });
      continue;
    }

    topics.push({
      ...base,
      type: "static",
    });
  }

  const globalItems = config.globalItems.map((item) =>
    resolveLinkItem(locale, currentPathname, item),
  );

  const firstToggleable = topicPanels[0]?.id ?? null;
  const activeByPanel = topicPanels.find((panel) => panel.active)?.id ?? null;
  const activeFromContent =
    contentTopicId && topicPanels.some((panel) => panel.id === contentTopicId)
      ? contentTopicId
      : null;

  const activeTopicId = activeByPanel ?? activeFromContent ?? firstToggleable;

  return {
    topics,
    topicPanels,
    globalItems,
    activeTopicId,
  };
}

function flattenResolvedLinks(items: ResolvedNavItem[]): ResolvedNavLinkItem[] {
  return items.flatMap((item) =>
    item.type === "link" ? [item] : flattenResolvedLinks(item.items),
  );
}

function buildDefaultPaginationSequence(
  locale: Locale,
  currentPathname: string,
  docsEntries: DocsEntry[],
  config: NavigationConfig,
): ResolvedDocsPaginationLink[] {
  const docIndex = buildDocIndex(locale, docsEntries);
  const visibleEntries = Array.from(docIndex.values()).filter(
    (entry) => !entry.sidebar.hidden,
  );
  const visibleByHref = new Map(
    visibleEntries.map((entry) => [
      normalizePath(entry.href),
      { href: entry.href, label: entry.title },
    ]),
  );

  const nav = resolveSidebarNavigation(locale, currentPathname, docsEntries, config);
  const ordered: ResolvedDocsPaginationLink[] = [];
  const seen = new Set<string>();

  for (const panel of nav.topicPanels) {
    for (const link of flattenResolvedLinks(panel.items)) {
      const key = normalizePath(link.href);
      const docLink = visibleByHref.get(key);
      if (!docLink || seen.has(key)) {
        continue;
      }
      seen.add(key);
      ordered.push(docLink);
    }
  }

  for (const entry of visibleEntries.sort(sortBySidebarOrder)) {
    const key = normalizePath(entry.href);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    ordered.push({ href: entry.href, label: entry.title });
  }

  return ordered;
}

function resolveCustomHref(locale: Locale, value: string): string {
  const link = value.trim();

  if (link.startsWith("#")) {
    return link;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(link) || link.startsWith("//")) {
    return link;
  }

  if (link.startsWith("/")) {
    return withBase(link);
  }

  return buildLocalizedUrl(locale, normalizeTrailingSlash(`/${normalizeDocPath(link)}`));
}

function resolvePaginationSide(
  locale: Locale,
  fallbackLabel: string,
  defaultLink: ResolvedDocsPaginationLink | null,
  override: DocsPaginationOverride | undefined,
): ResolvedDocsPaginationLink | null {
  if (override === false) {
    return null;
  }

  if (override === undefined || override === true) {
    return defaultLink;
  }

  if (typeof override === "string") {
    if (!defaultLink) {
      return null;
    }
    return { ...defaultLink, label: override };
  }

  const href = override.link
    ? resolveCustomHref(locale, override.link)
    : defaultLink?.href;

  if (!href) {
    return null;
  }

  return {
    href,
    label: override.label ?? defaultLink?.label ?? fallbackLabel,
  };
}

interface ResolveDocsPaginationOptions {
  locale: Locale;
  currentPathname: string;
  docsEntries: DocsEntry[];
  currentEntry: DocsEntry;
  prevFallbackLabel: string;
  nextFallbackLabel: string;
  config?: NavigationConfig;
}

export function resolveDocsPagination({
  locale,
  currentPathname,
  docsEntries,
  currentEntry,
  prevFallbackLabel,
  nextFallbackLabel,
  config = navigation,
}: ResolveDocsPaginationOptions): ResolvedDocsPagination {
  const sequence = buildDefaultPaginationSequence(
    locale,
    currentPathname,
    docsEntries,
    config,
  );

  const currentIndex = sequence.findIndex((item) =>
    isActivePath(currentPathname, item.href),
  );

  const defaultPrev = currentIndex > 0 ? sequence[currentIndex - 1] : null;
  const defaultNext =
    currentIndex >= 0 && currentIndex < sequence.length - 1
      ? sequence[currentIndex + 1]
      : null;

  return {
    prev: resolvePaginationSide(
      locale,
      prevFallbackLabel,
      defaultPrev,
      currentEntry.data.prev,
    ),
    next: resolvePaginationSide(
      locale,
      nextFallbackLabel,
      defaultNext,
      currentEntry.data.next,
    ),
  };
}
