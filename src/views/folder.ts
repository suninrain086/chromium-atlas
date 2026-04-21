import type { TreeNode, ViewMode, Doc } from "../lib/types";
import { getStore, getFolderNode, getViewMode, setViewMode } from "../store";

const VIEW_LABELS: Record<ViewMode, string> = {
  "title-list": "Title list",
  "list": "List",
  "gallery": "Gallery",
};

const ICONS: Record<ViewMode, string> = {
  "title-list": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  "list":       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="3" y="5" width="18" height="4" rx="1"/><rect x="3" y="11" width="18" height="4" rx="1"/><rect x="3" y="17" width="18" height="3" rx="1"/></svg>`,
  "gallery":    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>`,
};

export function renderFolderView(host: HTMLElement, folderPath: string) {
  const node = getFolderNode(folderPath);
  if (!node) {
    host.innerHTML = `
      <div class="main-inner">
        <div class="empty-state">
          <h2>Folder not found</h2>
          <p>The folder <code>${escapeHtml(folderPath)}</code> doesn't exist in the docs tree.</p>
          <p><a href="#/">Go home</a></p>
        </div>
      </div>`;
    return;
  }

  const mode = getViewMode(folderPath);
  const folderTitle = folderPath || "All docs";

  host.innerHTML = `
    <div class="main-inner" data-folder="${escapeHtml(folderPath)}" data-mode="${mode}">
      <div class="view-header">
        <h1>${escapeHtml(folderTitle)}</h1>
        <div class="view-mode-toggle" role="tablist" aria-label="View mode">
          ${(["title-list", "list", "gallery"] as ViewMode[]).map(m => `
            <button data-mode="${m}" aria-pressed="${m === mode}" aria-label="${VIEW_LABELS[m]} view" title="${VIEW_LABELS[m]}">
              ${ICONS[m]}
            </button>
          `).join("")}
        </div>
      </div>
      <div class="folder-content"></div>
    </div>
  `;

  const content = host.querySelector<HTMLElement>(".folder-content")!;
  renderContent(content, node, mode);

  host.querySelector(".view-mode-toggle")!.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-mode]");
    if (!btn) return;
    const newMode = btn.dataset.mode as ViewMode;
    const start = performance.now();
    setViewMode(folderPath, newMode);
    host.querySelector<HTMLElement>(".main-inner")!.dataset.mode = newMode;
    host.querySelectorAll<HTMLButtonElement>(".view-mode-toggle button").forEach(b => {
      b.setAttribute("aria-pressed", b.dataset.mode === newMode ? "true" : "false");
    });
    renderContent(content, node, newMode);
    const ms = performance.now() - start;
    (window as any).__lastViewSwitchMs = ms;
  });
}

function renderContent(host: HTMLElement, node: TreeNode, mode: ViewMode) {
  const store = getStore();
  // Collect direct child docs (not recursive) and child folders
  const childFolders = (node.children ?? []).filter(c => c.type === "folder");
  const childDocPaths = (node.children ?? []).filter(c => c.type === "doc").map(c => c.path);
  const childDocs: Doc[] = childDocPaths.map(p => store.byPath.get(p)!).filter(Boolean);

  if (childFolders.length === 0 && childDocs.length === 0) {
    host.innerHTML = `<div class="empty-state"><h2>No docs in this folder</h2><p><a href="#/">Go home</a></p></div>`;
    return;
  }

  let html = "";

  if (childFolders.length > 0) {
    html += `<div class="folder-meta">${childFolders.length} subfolder${childFolders.length === 1 ? "" : "s"}, ${childDocs.length} doc${childDocs.length === 1 ? "" : "s"}</div>`;
  }

  if (mode === "title-list") {
    html += `<div class="title-list" role="list">`;
    for (const f of childFolders) {
      html += `<a class="row" href="#/folder/${encodeURI(f.path)}" role="listitem">
        <span class="name">📁 ${escapeHtml(f.name)}/</span>
        <span class="desc">${countDescendants(f)} docs</span>
      </a>`;
    }
    for (const d of childDocs) {
      html += `<a class="row" href="#/doc/${encodeURI(d.path)}" role="listitem">
        <span class="name">${escapeHtml(d.title)}</span>
        <span class="desc">${escapeHtml(d.description)}</span>
      </a>`;
    }
    html += `</div>`;
  } else if (mode === "list") {
    html += `<div class="list-view">`;
    for (const f of childFolders) {
      html += `<a class="card" href="#/folder/${encodeURI(f.path)}">
        <div class="name">📁 ${escapeHtml(f.name)}/</div>
        <div class="desc">${countDescendants(f)} docs</div>
      </a>`;
    }
    for (const d of childDocs) {
      html += `<a class="card" href="#/doc/${encodeURI(d.path)}">
        <div class="name">${escapeHtml(d.title)}</div>
        <div class="desc">${escapeHtml(d.description)}</div>
      </a>`;
    }
    html += `</div>`;
  } else {
    html += `<div class="gallery">`;
    for (const f of childFolders) {
      html += `<a class="card" href="#/folder/${encodeURI(f.path)}">
        <div class="name">📁 ${escapeHtml(f.name)}/</div>
        <div class="desc">${countDescendants(f)} docs</div>
      </a>`;
    }
    for (const d of childDocs) {
      html += `<a class="card" href="#/doc/${encodeURI(d.path)}">
        <div class="name">${escapeHtml(d.title)}</div>
        <div class="desc">${escapeHtml(d.description)}</div>
      </a>`;
    }
    html += `</div>`;
  }

  host.innerHTML = html;
}

function countDescendants(n: TreeNode): number {
  if (n.type === "doc") return 1;
  if (!n.children) return 0;
  let c = 0;
  for (const ch of n.children) c += countDescendants(ch);
  return c;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]!));
}
