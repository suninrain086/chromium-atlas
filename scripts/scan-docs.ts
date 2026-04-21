/**
 * Scans DOCS_DIR (default test/fixtures/docs) and emits three deterministic JSON indexes:
 *   public/docs.json  - flat list of Doc records (with body)
 *   public/tree.json  - folder hierarchy (TreeNode)
 *   public/links.json - { incoming: {path: [path]}, outgoing: {path: [path]} }
 *
 * Determinism:
 *   - posix paths only (path.posix)
 *   - lexicographic sort on every array
 *   - sorted-keys serialization (no Date.now / mtime in payload)
 */
import { readFileSync, readdirSync, writeFileSync, statSync, mkdirSync, existsSync } from "node:fs";
import * as nodePath from "node:path";
import { resolve as resolveAbs } from "node:path";
import { homedir } from "node:os";

const posix = nodePath.posix;

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface Doc {
  path: string;             // posix relative to docs root, e.g. "accessibility/overview.md"
  title: string;
  description: string;
  headings: Heading[];
  outgoingLinks: string[];  // resolved doc paths within the corpus
  body: string;             // raw markdown
}

export interface TreeNode {
  name: string;
  path: string;             // "" for root
  type: "folder" | "doc";
  title?: string;           // for docs
  children?: TreeNode[];    // for folders
}

export interface LinksIndex {
  incoming: Record<string, string[]>;
  outgoing: Record<string, string[]>;
}

// === slugify (must match runtime markdown.ts) ===
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// === relative .md link resolver (shared with runtime) ===
export function resolveRelativeMd(fromDocPath: string, href: string): string | null {
  // Strip anchors and query for resolution; keep them off the resolved path.
  const cleanHref = href.split("#")[0].split("?")[0];
  if (!cleanHref) return null;
  if (/^https?:\/\//i.test(cleanHref) || cleanHref.startsWith("//")) return null;
  if (!cleanHref.endsWith(".md")) return null;
  const dir = posix.dirname(fromDocPath);
  const resolved = posix.normalize(posix.join(dir, cleanHref));
  if (resolved.startsWith("../") || resolved.startsWith("/")) return null;
  return resolved;
}

export function resolveDocsDir(): string {
  const env = process.env.DOCS_DIR;
  if (env && env.length) {
    const expanded = env.replace(/^~(?=$|\/|\\)/, homedir());
    return resolveAbs(expanded);
  }
  return resolveAbs("test", "fixtures", "docs");
}

function walk(root: string, sub = ""): string[] {
  const out: string[] = [];
  const abs = sub ? nodePath.join(root, sub) : root;
  let entries: string[];
  try {
    entries = readdirSync(abs).sort();
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.startsWith(".")) continue;
    const subRel = sub ? posix.join(sub, e) : e;
    const absChild = nodePath.join(root, subRel);
    let st;
    try { st = statSync(absChild); } catch { continue; }
    if (st.isDirectory()) {
      out.push(...walk(root, subRel));
    } else if (e.endsWith(".md")) {
      out.push(subRel);
    }
  }
  return out;
}

function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  const lines = body.split(/\r?\n/);
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const level = m[1].length;
    if (level < 2 || level > 3) continue; // TOC uses h2/h3
    const text = m[2].replace(/`/g, "").trim();
    let base = slugify(text);
    if (!base) continue;
    let id = base;
    const c = seen.get(base) ?? 0;
    if (c > 0) id = `${base}-${c + 1}`;
    seen.set(base, c + 1);
    headings.push({ level, text, id });
  }
  return headings;
}

function extractTitle(body: string, fallback: string): string {
  const m = body.match(/^#\s+(.+?)\s*#*\s*$/m);
  return (m && m[1].trim()) || fallback;
}

function extractDescription(body: string): string {
  // First paragraph after the H1, plain text, max 200 chars.
  const stripped = body
    .replace(/^#\s+.+/m, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+.*$/gm, " ")
    .replace(/^\s*[-*+]\s+/gm, "")
    .trim();
  const firstPara = stripped.split(/\n\s*\n/).map(s => s.trim()).find(Boolean) || "";
  const oneLine = firstPara.replace(/\s+/g, " ");
  return oneLine.length > 200 ? oneLine.slice(0, 200).trimEnd() + "…" : oneLine;
}

function extractOutgoingLinks(body: string, docPath: string, allPaths: Set<string>): string[] {
  const links = new Set<string>();
  // 1) Markdown links [text](url)
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const resolved = resolveRelativeMd(docPath, m[2]);
    if (resolved && allPaths.has(resolved)) links.add(resolved);
  }
  return [...links].sort();
}

export function buildTree(docs: Doc[]): TreeNode {
  const root: TreeNode = { name: "", path: "", type: "folder", children: [] };
  const folderMap = new Map<string, TreeNode>();
  folderMap.set("", root);

  const ensureFolder = (path: string): TreeNode => {
    if (folderMap.has(path)) return folderMap.get(path)!;
    const parts = path.split("/");
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join("/");
    const parent = ensureFolder(parentPath);
    const node: TreeNode = { name, path, type: "folder", children: [] };
    parent.children!.push(node);
    folderMap.set(path, node);
    return node;
  };

  for (const d of docs) {
    const parentPath = posix.dirname(d.path) === "." ? "" : posix.dirname(d.path);
    const parent = ensureFolder(parentPath);
    parent.children!.push({
      name: posix.basename(d.path),
      path: d.path,
      type: "doc",
      title: d.title,
    });
  }

  // Sort children: folders first then docs, both alphabetically.
  const sortNode = (n: TreeNode) => {
    if (!n.children) return;
    n.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const c of n.children) sortNode(c);
  };
  sortNode(root);
  return root;
}

export function scanDocs(dir: string): { docs: Doc[]; tree: TreeNode; links: LinksIndex } {
  if (!existsSync(dir)) {
    console.warn(`[scan-docs] dir does not exist: ${dir}`);
    return { docs: [], tree: { name: "", path: "", type: "folder", children: [] }, links: { incoming: {}, outgoing: {} } };
  }
  const files = walk(dir).sort();
  const allPaths = new Set(files);

  const docs: Doc[] = [];
  for (const rel of files) {
    const abs = nodePath.join(dir, rel);
    const raw = readFileSync(abs, "utf8");
    const title = extractTitle(raw, posix.basename(rel, ".md"));
    const description = extractDescription(raw);
    const headings = extractHeadings(raw);
    const outgoingLinks = extractOutgoingLinks(raw, rel, allPaths);
    docs.push({
      path: rel,
      title,
      description,
      headings,
      outgoingLinks,
      body: raw,
    });
  }
  docs.sort((a, b) => a.path.localeCompare(b.path));

  const incoming: Record<string, string[]> = {};
  const outgoing: Record<string, string[]> = {};
  for (const d of docs) {
    outgoing[d.path] = [...d.outgoingLinks].sort();
    for (const target of d.outgoingLinks) {
      if (!incoming[target]) incoming[target] = [];
      incoming[target].push(d.path);
    }
  }
  for (const k of Object.keys(incoming)) incoming[k].sort();

  const tree = buildTree(docs);
  return { docs, tree, links: { incoming, outgoing } };
}

// Sorted-key JSON serializer (deterministic).
export function stableStringify(v: unknown): string {
  const seen = new WeakSet();
  const helper = (val: unknown): unknown => {
    if (val === null || typeof val !== "object") return val;
    if (seen.has(val as object)) return null;
    seen.add(val as object);
    if (Array.isArray(val)) return val.map(helper);
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(val as object).sort()) {
      out[k] = helper((val as Record<string, unknown>)[k]);
    }
    return out;
  };
  return JSON.stringify(helper(v));
}

export function writeAllIndexes(outDir: string, docsDir: string): { docCount: number } {
  const { docs, tree, links } = scanDocs(docsDir);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(nodePath.join(outDir, "docs.json"), stableStringify({ docs }), "utf8");
  writeFileSync(nodePath.join(outDir, "tree.json"), stableStringify(tree), "utf8");
  writeFileSync(nodePath.join(outDir, "links.json"), stableStringify(links), "utf8");
  return { docCount: docs.length };
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const dir = resolveDocsDir();
  const out = resolveAbs("public");
  const r = writeAllIndexes(out, dir);
  console.log(`[scan-docs] indexed ${r.docCount} doc(s) from ${dir}`);
}
