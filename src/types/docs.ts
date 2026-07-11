import type { CollectionEntry } from "astro:content";

export interface DocsSidebarMeta {
  label?: string;
  order?: number;
  hidden?: boolean;
  attrs?: Record<string, string>;
}

export interface DocsPaginationOverrideObject {
  link?: string;
  label?: string;
}

export type DocsPaginationOverride =
  | boolean
  | string
  | DocsPaginationOverrideObject;

/** 1 = leicht/keine Vorkenntnisse · 2 = mittel/Grundkenntnisse · 3 = anspruchsvoll/Fortgeschritten */
export type ProjectMetaLevel = 1 | 2 | 3;

export type ProjectMetaSupervision = "alone" | "adults" | "supervised";

export type ProjectMetaLocation = "indoor" | "outdoor" | "both";

/** Projekt-Steckbrief im Frontmatter einer Projekt-index-Seite (Schema: content.config.ts). */
export interface DocsProjectMeta {
  difficulty: ProjectMetaLevel;
  skillLevel: ProjectMetaLevel;
  duration: string;
  cost: string;
  supervision: ProjectMetaSupervision;
  ageMin: number;
  indoorOutdoor: ProjectMetaLocation;
  tools?: string[];
  learningGoals?: string[];
  safetyNotes?: string;
}

/**
 * Docs-Eintrag der `docs`-Collection (todo #16): Typ wird direkt aus dem
 * Zod-Schema in content.config.ts abgeleitet — Schema ändern = Typ ändern.
 * Die Interfaces oben bleiben als benannte Teil-Typen für Komponenten
 * (z. B. ProjectMeta.astro) erhalten; sie sind strukturell identisch mit
 * den abgeleiteten Schema-Typen.
 */
export type DocsEntry = CollectionEntry<"docs">;

export type DocsEntryData = DocsEntry["data"];
