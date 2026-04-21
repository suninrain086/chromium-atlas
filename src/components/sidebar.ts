import type { TreeNode } from "../lib/types";
import { getStore, isFolderExpanded, toggleFolder, setFolderExpanded, setDrawerOpen } from "../store";
import { ancestorFolders, parentFolder } from "../lib/paths";

const FOLDER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>`;
const DOC_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>`;
const CHEV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="10" height="10"><path d="M9 6l6 6-6 6"/></svg>`;

export function mountSidebar(host: HTMLElement) {
  host.classList.add("sidebar");
  host.setAttribute("role", "navigation");
  host.setAttribute("aria-label", "Documentation tree");
  render(host);

  // Delegated click handler
  host.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(".node");
    if (!target) return;
    const type = target.dataset.type;
    const path = target.dataset.path || "";
    if (type === "folder") {
      // Click on chevron or folder name → toggle
      if ((e.target as HTMLElement).closest(".chev") ||
          target.dataset.action === "toggle") {
        toggleFolder(path);
        render(host);
        return;
      }
      // Otherwise navigate to folder view
      e.preventDefault();
      window.location.hash = `#/folder/${path}`;
      // close drawer on mobile
      setDrawerOpen(false);
    } else if (type === "doc") {
      setDrawerOpen(false);
    }
  });
}

export function refreshSidebar() {
  const host = document.querySelector<HTMLElement>(".sidebar");
  if (host) render(host);
}

/**
 * Auto-expand all ancestor folders of the current route (so the active doc/folder is visible).
 */
export function expandToCurrent() {
  const hash = location.hash || "#/";
  let target = "";
  if (hash.startsWith("#/doc/")) target = parentFolder(decodeURIComponent(hash.slice(6)));
  else if (hash.startsWith("#/folder/")) target = decodeURIComponent(hash.slice(9));
  for (const a of ancestorFolders(target)) setFolderExpanded(a, true);
}

function activePath(): { folder: string; doc: string } {
  const hash = location.hash || "#/";
  if (hash.startsWith("#/doc/")) {
    const docPath = decodeURIComponent(hash.slice(6).split("#")[0]);
    return { folder: parentFolder(docPath), doc: docPath };
  }
  if (hash.startsWith("#/folder/")) {
    return { folder: decodeURIComponent(hash.slice(9)), doc: "" };
  }
  return { folder: "", doc: "" };
}

function render(host: HTMLElement) {
  const store = getStore();
  const active = activePath();

  const html: string[] = [];
  html.push(`
    <div class="brand-block">
      <span class="logo" aria-hidden="true"></span>
      <span>chromium-atlas</span>
    </div>
    <a href="#/" class="node" data-type="folder" data-path="" data-depth="0" role="treeitem"
       style="--depth:0;${active.folder === "" && !active.doc ? "" : ""}"
       ${active.folder === "" && !active.doc ? 'aria-current="page"' : ""}>
      <span class="chev"></span>
      <span class="icon">${FOLDER_ICON}</span>
      <span class="label">All docs</span>
    </a>
    <div class="tree" role="tree">
  `);

  const renderNode = (node: TreeNode, depth: number) => {
    if (depth === 0) {
      // Root — render its children only
      if (node.children) for (const c of node.children) renderNode(c, 1);
      return;
    }
    if (node.type === "folder") {
      const expanded = isFolderExpanded(node.path);
      const isActive = active.folder === node.path && !active.doc;
      html.push(`
        <a class="node ${isActive ? "active" : ""}" data-type="folder" data-path="${escapeHtml(node.path)}"
           data-expanded="${expanded}" href="#/folder/${encodeURI(node.path)}" role="treeitem"
           aria-expanded="${expanded}" style="--depth:${depth - 1}">
          <span class="chev" data-action="toggle">${CHEV}</span>
          <span class="icon">${FOLDER_ICON}</span>
          <span class="label">${escapeHtml(node.name)}</span>
        </a>
      `);
      if (expanded && node.children) {
        for (const c of node.children) renderNode(c, depth + 1);
      }
    } else {
      const isActive = active.doc === node.path;
      html.push(`
        <a class="node ${isActive ? "active" : ""}" data-type="doc" data-path="${escapeHtml(node.path)}"
           href="#/doc/${encodeURI(node.path)}" role="treeitem" style="--depth:${depth - 1}"
           ${isActive ? 'aria-current="page"' : ""}>
          <span class="chev"></span>
          <span class="icon">${DOC_ICON}</span>
          <span class="label">${escapeHtml(node.title || node.name)}</span>
        </a>
      `);
    }
  };

  renderNode(store.tree, 0);
  html.push(`</div>`);
  host.innerHTML = html.join("");
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]!));
}
