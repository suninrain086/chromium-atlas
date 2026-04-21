export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface Doc {
  path: string;
  title: string;
  description: string;
  headings: Heading[];
  outgoingLinks: string[];
  body: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: "folder" | "doc";
  title?: string;
  children?: TreeNode[];
}

export interface LinksIndex {
  incoming: Record<string, string[]>;
  outgoing: Record<string, string[]>;
}

export type ViewMode = "title-list" | "list" | "gallery";
export type Theme = "dark" | "light";
