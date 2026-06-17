import type { Locale } from "../i18n/config";

export type TranslationMap = Partial<Record<Locale, string>>;

export type TopicIconName = "open-book" | "information" | "books" | "memo";

export interface NavigationAutogenerateItem {
  autogenerate: {
    directory: string;
  };
}

export interface NavigationGroupItem {
  label: string;
  translations?: TranslationMap;
  items: NavigationSidebarItem[];
}

export interface NavigationLinkItem {
  label: string;
  translations?: TranslationMap;
  link: string;
  attrs?: Record<string, string>;
}

export type NavigationSidebarItem =
  | string
  | NavigationAutogenerateItem
  | NavigationGroupItem
  | NavigationLinkItem;

interface TopicBase {
  id: string;
  label: string;
  translations?: TranslationMap;
  icon?: TopicIconName;
}

export interface NavigationTopicWithItems extends TopicBase {
  items: NavigationSidebarItem[];
}

export interface NavigationTopicWithLink extends TopicBase {
  link: string;
}

export interface NavigationTopicStatic extends TopicBase {
  static: true;
}

export type NavigationTopic =
  | NavigationTopicWithItems
  | NavigationTopicWithLink
  | NavigationTopicStatic;

export interface NavigationConfig {
  topics: NavigationTopic[];
  globalItems: NavigationLinkItem[];
}

/* Navigation Configuration: items: ["guides/concepts", "guides/courses"], {
      label: "NASA",
      link: "https://www.nasa.gov/",
      attrs: {
        target: "_blank",
        rel: "noreferrer noopener",
      },
    },*/
export const navigation: NavigationConfig = {
  topics: [
    {
      id: "guides",
      label: "Guides",
      translations: {
        de: "Anleitungen",
      },
      icon: "open-book",
      items: [
        {
          label: "BirdNET Live",
          translations: {
            de: "BirdNET Live",
          },
          items: [{ autogenerate: { directory: "guides/birdnet_live" } }],
        },
      ],
    },
    {
      id: "projects",
      label: "Projects",
      translations: {
        de: "Projekte",
      },
      icon: "memo",
      items: [{
        label: "The Listening Birdhouse",
        translations: {
          de: "Das lauschende Vogelhaus",
        },
        items: [{ autogenerate: { directory: "projects/project01" } }],
      }],
    },
    {
      id: "knowledge_collection",
      label: "Knowledge Base",
      translations: {
        de: "Wissenssammlung",
      },
      icon: "books",
      items: [{ autogenerate: { directory: "knowledge_collection" } }],
    },
    {
      id: "glossary",
      label: "Glossary",
      translations: {
        de: "Begriffsverzeichnis",
      },
      icon: "information",
      items: [{ autogenerate: { directory: "glossary" } }],
    },
    {
      id: "workshops",
      label: "Workshops",
      translations: {
        de: "Workshops",
      },
      icon: "open-book",
      items: [
        {
          label: "Spring School 2026",
          items: [
            { autogenerate: { directory: "workshop_materials/springschool" } },
          ],
        },
      ],
    },
  ],
  globalItems: [
    {
      label: "Imprint",
      translations: {
        de: "Impressum",
      },
      link: "/impressum",
    },
    
  ],
};
