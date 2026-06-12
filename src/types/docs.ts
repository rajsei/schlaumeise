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
}

export interface DocsEntry {
  id: string;
  data: DocsEntryData;
  render: () => Promise<{
    Content: unknown;
    headings: Array<{ depth: number; slug: string; text: string }>;
  }>;
}
