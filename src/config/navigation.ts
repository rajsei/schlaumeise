import type { Locale } from "../i18n/config";

export type SidebarAttrs = Record<string, string>;
export type SidebarTranslations = Partial<Record<Locale, string>>;

export interface SidebarDividerItem {
  divider: true;
}

export interface SidebarAutogenerateItem {
  autogenerate: {
    directory: string;
    collapsed?: boolean;
    attrs?: SidebarAttrs;
  };
}

export interface SidebarLinkItem {
  label?: string;
  translations?: SidebarTranslations;
  slug?: string;
  link?: string;
  attrs?: SidebarAttrs;
}

export interface SidebarGroupItem {
  label: string;
  translations?: SidebarTranslations;
  collapsed?: boolean;
  items: SidebarConfigItem[];
}

export type SidebarConfigItem =
  | string
  | SidebarDividerItem
  | SidebarAutogenerateItem
  | SidebarLinkItem
  | SidebarGroupItem;

export interface TopicConfig {
  id: string;
  label: string;
  translations?: SidebarTranslations;
  icon?: string;
  link?: string;
  items?: SidebarConfigItem[];
}

export interface NavigationConfig {
  topics: TopicConfig[];
  globalItems?: SidebarConfigItem[];
}

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
          label: "Start Here",
          translations: {
            de: "Start hier",
          },
          items: ["guides/concepts", "guides/courses"],
        },
        {
          label: "Recipes",
          translations: {
            de: "Rezepte",
          },
          items: [{ autogenerate: { directory: "guides/recipes" } }],
        },
      ],
    },
    {
      id: "reference",
      label: "Reference",
      translations: {
        de: "Referenz",
      },
      icon: "information",
      
      items: [
        "reference/api",
        "reference/components",
        "reference/faq",
      ],
    },

  ],
  globalItems: [
    { divider: true },
    {
      label: "Meteor Store",
      translations: {
        de: "Meteor Shop",
      },
      link: "/shop/",
    },
    {
      label: "NASA",
      link: "https://www.nasa.gov/",
      attrs: { target: "_blank", rel: "noreferrer noopener" },
    },
  ],
};
