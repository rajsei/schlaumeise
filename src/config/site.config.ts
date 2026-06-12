import type { ImageMetadata } from "astro";
import schlaumeiseLogo from "../assets/SchlaumeiseLogo.svg";
import smartfinchLogo from "../assets/SmartfinchLogo.svg";
import { type Locale } from "../i18n/config";

type BrandKey = "schlaumeise" | "smartfinch";

export interface BrandConfig {
  key: BrandKey;
  name: string;
  logo: ImageMetadata;
}

interface SiteConfig {
  basePath: string;
  defaultTheme: "light" | "dark";
  brandByLocale: Record<Locale, BrandConfig>;
}

export const siteConfig: SiteConfig = {
  basePath: "/schlaumeise",
  defaultTheme: "light",
  brandByLocale: {
    de: {
      key: "schlaumeise",
      name: "schlaumeise",
      logo: schlaumeiseLogo,
    },
    en: {
      key: "smartfinch",
      name: "smartfinch",
      logo: smartfinchLogo,
    },
  },
};

export function getBrandConfig(locale: Locale): BrandConfig {
  return siteConfig.brandByLocale[locale];
}
