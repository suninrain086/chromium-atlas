import type { Doc, LinksIndex } from "../lib/types";

export interface GraphElements {
  nodes: { data: { id: string; label: string; deg: number } }[];
  edges: { data: { id: string; source: string; target: string } }[];
}

export function buildGraphElements(docs: Doc[], links: LinksIndex): GraphElements {
  const known = new Set(docs.map(d => d.path));
  const inDeg = new Map<string, number>();
  for (const p of known) inDeg.set(p, 0);
  const edges: GraphElements["edges"] = [];
  // outgoing: { [source]: string[] } of outbound paths
  for (const [src, targets] of Object.entries(links.outgoing || {})) {
    if (!known.has(src)) continue;
    for (const t of targets || []) {
      if (!known.has(t)) continue;
      inDeg.set(t, (inDeg.get(t) || 0) + 1);
      edges.push({ data: { id: `${src}__${t}`, source: src, target: t } });
    }
  }
  const nodes = docs.map(d => ({
    data: { id: d.path, label: d.title || d.path.split("/").pop() || d.path, deg: inDeg.get(d.path) || 0 },
  }));
  return { nodes, edges };
}
