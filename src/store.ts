import type { Doc, TreeNode, LinksIndex, ViewMode, Theme } from "./lib/types";
import { storage } from "./lib/storage";

interface UIState {
  theme: Theme;
  sidebarExpanded: Set<string>;     // folder paths
  viewModes: Map<string, ViewMode>; // folder path -> mode
  drawerOpen: boolean;
}

interface Store {
  docs: Doc[];
  byPath: Map<string, Doc>;
  tree: TreeNode;
  links: LinksIndex;
  ui: UIState;
}

const VIEW_KEY = "atlas:viewmode";
const SIDEBAR_KEY = "atlas:sidebar:expanded";
const THEME_KEY = "atlas:theme";

let cache: Store | null = null;

function loadUIState(): UIState {
  const theme = (storage.get(THEME_KEY) as Theme | null) ||
    ((window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light");
  const expandedArr = storage.getJSON<string[]>(SIDEBAR_KEY, []);
  const viewObj = storage.getJSON<Record<string, ViewMode>>(VIEW_KEY, {});
  return {
    theme,
    sidebarExpanded: new Set(expandedArr),
    viewModes: new Map(Object.entries(viewObj)),
    drawerOpen: false,
  };
}

function saveSidebar() {
  if (!cache) return;
  storage.setJSON(SIDEBAR_KEY, [...cache.ui.sidebarExpanded].sort());
}
function saveViewModes() {
  if (!cache) return;
  storage.setJSON(VIEW_KEY, Object.fromEntries(cache.ui.viewModes));
}

export async function loadStore(force = false): Promise<Store> {
  if (cache && !force) return cache;
  const base = (import.meta as any).env?.BASE_URL || "/";
  const ts = Date.now();
  const [docsRes, treeRes, linksRes] = await Promise.all([
    fetch(`${base}docs.json?ts=${ts}`),
    fetch(`${base}tree.json?ts=${ts}`),
    fetch(`${base}links.json?ts=${ts}`),
  ]);
  if (!docsRes.ok) throw new Error(`Failed to load docs.json: ${docsRes.status}`);
  if (!treeRes.ok) throw new Error(`Failed to load tree.json: ${treeRes.status}`);
  if (!linksRes.ok) throw new Error(`Failed to load links.json: ${linksRes.status}`);
  const { docs } = (await docsRes.json()) as { docs: Doc[] };
  const tree = (await treeRes.json()) as TreeNode;
  const links = (await linksRes.json()) as LinksIndex;
  const byPath = new Map<string, Doc>();
  for (const d of docs) byPath.set(d.path, d);
  cache = { docs, byPath, tree, links, ui: loadUIState() };
  return cache;
}

export function getStore(): Store {
  if (!cache) throw new Error("store not loaded");
  return cache;
}

export function setTheme(t: Theme) {
  if (!cache) return;
  cache.ui.theme = t;
  storage.set(THEME_KEY, t);
  document.documentElement.dataset.theme = t;
  document.dispatchEvent(new CustomEvent("themechange", { detail: t }));
}

export function getTheme(): Theme {
  return cache?.ui.theme ?? "dark";
}

export function toggleFolder(path: string): boolean {
  if (!cache) return false;
  const s = cache.ui.sidebarExpanded;
  const expanded = s.has(path);
  if (expanded) s.delete(path); else s.add(path);
  saveSidebar();
  return !expanded;
}
export function setFolderExpanded(path: string, on: boolean) {
  if (!cache) return;
  const s = cache.ui.sidebarExpanded;
  if (on) s.add(path); else s.delete(path);
  saveSidebar();
}
export function isFolderExpanded(path: string): boolean {
  return cache?.ui.sidebarExpanded.has(path) ?? false;
}

export function getViewMode(folderPath: string): ViewMode {
  return cache?.ui.viewModes.get(folderPath) ?? "title-list";
}
export function setViewMode(folderPath: string, mode: ViewMode) {
  if (!cache) return;
  cache.ui.viewModes.set(folderPath, mode);
  saveViewModes();
}

export function setDrawerOpen(on: boolean) {
  if (!cache) return;
  cache.ui.drawerOpen = on;
  document.documentElement.dataset.drawer = on ? "open" : "closed";
}
export function isDrawerOpen(): boolean {
  return cache?.ui.drawerOpen ?? false;
}

export function getFolderNode(path: string): TreeNode | null {
  if (!cache) return null;
  if (!path) return cache.tree;
  const parts = path.split("/");
  let cur: TreeNode | undefined = cache.tree;
  for (const p of parts) {
    if (!cur || !cur.children) return null;
    cur = cur.children.find(c => c.name === p && c.type === "folder");
  }
  return cur ?? null;
}

export function incomingFor(path: string): string[] {
  return cache?.links.incoming[path] ?? [];
}
