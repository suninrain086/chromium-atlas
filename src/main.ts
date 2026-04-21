import "./styles/app.css";

import { loadStore, setDrawerOpen, isDrawerOpen, setTheme, getTheme } from "./store";
import { route, dispatch, startRouter, setNotFound, navigate } from "./router";
import { mountSidebar, refreshSidebar, expandToCurrent } from "./components/sidebar";
import { mountThemeToggle } from "./components/theme-toggle";
import { openPalette, closePalette, isPaletteOpen, refreshFuseIndex } from "./components/palette";
import { renderFolderView } from "./views/folder";
import { renderDocView } from "./views/doc";
import { ancestorFolders, parentFolder } from "./lib/paths";

const app = document.getElementById("app") as HTMLElement;

function renderShell() {
  app.innerHTML = `
    <aside class="sidebar"></aside>
    <header class="topbar">
      <button id="hamburger" aria-label="Open navigation" title="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" width="16" height="16"><path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round"/></svg>
      </button>
      <span class="brand">
        <span style="display:inline-block;width:18px;height:18px;background:linear-gradient(135deg,var(--accent),var(--accent-strong));border-radius:4px;"></span>
        <span>chromium-atlas</span>
      </span>
      <nav class="breadcrumb" id="breadcrumb"></nav>
      <span class="grow"></span>
      <button class="search-trigger" id="open-palette" aria-label="Search docs">
        <svg class="icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <span>Search docs</span>
        <span class="grow"></span>
        <span class="kbd">⌘K</span>
      </button>
      <div id="theme-host"></div>
    </header>
    <main class="main" id="view"></main>
    <div class="backdrop" id="backdrop"></div>
  `;
  mountSidebar(document.querySelector(".sidebar") as HTMLElement);
  mountThemeToggle(document.getElementById("theme-host")!);
  document.getElementById("open-palette")!.addEventListener("click", () => openPalette());
  document.getElementById("hamburger")!.addEventListener("click", () => setDrawerOpen(!isDrawerOpen()));
  document.getElementById("backdrop")!.addEventListener("click", () => setDrawerOpen(false));
}

function renderBreadcrumb() {
  const host = document.getElementById("breadcrumb");
  if (!host) return;
  const hash = location.hash || "#/";
  const parts: { label: string; href: string; current?: boolean }[] = [
    { label: "atlas", href: "#/" },
  ];
  if (hash.startsWith("#/folder/")) {
    const folder = decodeURIComponent(hash.slice(9));
    const segs = folder.split("/").filter(Boolean);
    let acc = "";
    segs.forEach((s, i) => {
      acc = acc ? `${acc}/${s}` : s;
      parts.push({ label: s, href: `#/folder/${encodeURI(acc)}`, current: i === segs.length - 1 });
    });
  } else if (hash.startsWith("#/doc/")) {
    const docPath = decodeURIComponent(hash.slice(6).split("#")[0]);
    const segs = docPath.split("/");
    const folderSegs = segs.slice(0, -1);
    let acc = "";
    folderSegs.forEach((s) => {
      acc = acc ? `${acc}/${s}` : s;
      parts.push({ label: s, href: `#/folder/${encodeURI(acc)}` });
    });
    parts.push({ label: segs[segs.length - 1], href: hash, current: true });
  }
  host.innerHTML = parts.map((p, i) => {
    const sep = i > 0 ? `<span class="sep">/</span>` : "";
    return `${sep}${p.current
      ? `<span class="current">${escapeHtml(p.label)}</span>`
      : `<a href="${p.href}">${escapeHtml(p.label)}</a>`}`;
  }).join("");
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]!));
}

async function boot() {
  // Skeleton sidebar while loading
  app.innerHTML = `
    <aside class="sidebar">
      <div class="skel-sidebar">
        ${Array.from({ length: 12 }).map(() => `<div class="skeleton skel-row"></div>`).join("")}
      </div>
    </aside>
    <header class="topbar"><span class="grow"></span></header>
    <main class="main"><div class="main-inner"><div class="empty-state"><div class="skeleton" style="height:24px;width:60%;margin:0 auto 12px;"></div><div class="skeleton" style="height:16px;width:80%;margin:0 auto;"></div></div></div></main>
  `;

  try {
    await loadStore();
  } catch (e) {
    app.innerHTML = `
      <main class="main"><div class="main-inner">
        <div class="error-state">
          <h2>Couldn't load docs</h2>
          <p>${escapeHtml((e as Error).message)}</p>
          <p class="hint">Try running <code>npm run scan</code> then refresh.</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      </div></main>`;
    return;
  }

  renderShell();
  const view = document.getElementById("view") as HTMLElement;

  route("/", () => {
    expandToCurrent();
    refreshSidebar();
    renderFolderView(view, "");
    renderBreadcrumb();
    document.title = "chromium-atlas";
  });

  route("/folder/:path*", ({ path }) => {
    expandToCurrent();
    refreshSidebar();
    renderFolderView(view, path);
    renderBreadcrumb();
    document.title = `${path} · chromium-atlas`;
  });

  route("/doc/:path*", (params) => {
    expandToCurrent();
    refreshSidebar();
    renderDocView(view, params.path, params.__anchor);
    renderBreadcrumb();
  });

  setNotFound(() => {
    view.innerHTML = `
      <div class="main-inner">
        <div class="empty-state">
          <h2>Page not found</h2>
          <p>The route <code>${escapeHtml(location.hash)}</code> doesn't match anything in this build.</p>
          <p><a href="#/">Go home</a></p>
        </div>
      </div>`;
    renderBreadcrumb();
    document.title = "Not found · chromium-atlas";
  });

  startRouter();

  // Cmd/Ctrl+K palette
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (isPaletteOpen()) closePalette(); else openPalette();
    } else if (e.key === "Escape" && isDrawerOpen()) {
      setDrawerOpen(false);
    }
  });

  // HMR for fixture changes
  if ((import.meta as any).hot) {
    (import.meta as any).hot.on("vite:beforeFullReload", async () => {
      await loadStore(true);
      refreshFuseIndex();
    });
  }

  await dispatch();
}

boot();
