import type { ImageMetadata } from "astro";
import schlaumeiseLogo from "../assets/SchlaumeiseLogo.svg";
import schlaumeiseFull from "../assets/SchlaumeiseFull.svg";
import smartfinchLogo from "../assets/SmartfinchLogo.svg";
import smartfinchFull from "../assets/SmartfinchFull.svg";
import { type Locale } from "../i18n/config";

type BrandKey = "schlaumeise" | "smartfinch";

export interface BrandConfig {
  key: BrandKey;
  name: string;
  logo: ImageMetadata;
  /** Wort-Bild-Marke (volles Logo) für die Hero-Sektion der Startseite. */
  logoFull: ImageMetadata;
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
      logoFull: schlaumeiseFull,
    },
    en: {
      key: "smartfinch",
      name: "smartfinch",
      logo: smartfinchLogo,
      logoFull: smartfinchFull,
    },
  },
};

export function getBrandConfig(locale: Locale): BrandConfig {
  return siteConfig.brandByLocale[locale];
}
