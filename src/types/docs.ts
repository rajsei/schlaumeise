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

export interface DocsEntryData {
  title: string;
  description?: string;
  menu?: boolean;
  content?: boolean;
  topicId?: string;
  category?: string;
  tags?: string[];
  sidebar?: boolean | DocsSidebarMeta;
  prev?: DocsPaginationOverride;
  next?: DocsPaginationOverride;
  project?: DocsProjectMeta;
}

export interface DocsEntry {
  id: string;
  data: DocsEntryData;
  render: () => Promise<{
    Content: unknown;
    headings: Array<{ depth: number; slug: string; text: string }>;
  }>;
}
