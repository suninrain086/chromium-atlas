import Fuse from "fuse.js";
import type { Doc } from "../lib/types";
import { getStore } from "../store";

let overlay: HTMLElement | null = null;
let fuse: Fuse<Doc> | null = null;
let active = 0;
let results: Doc[] = [];

function ensureFuse(): Fuse<Doc> {
  if (fuse) return fuse;
  const store = getStore();
  fuse = new Fuse(store.docs, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "path", weight: 0.4 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 1,
  });
  return fuse;
}

export function refreshFuseIndex() { fuse = null; }

export function isPaletteOpen(): boolean { return overlay !== null; }

export function openPalette() {
  if (overlay) return;
  ensureFuse();
  overlay = document.createElement("div");
  overlay.className = "palette-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="palette" role="combobox" aria-expanded="true">
      <input id="palette-input" type="text" placeholder="Search docs by title or path…"
             autocomplete="off" spellcheck="false" aria-label="Search" />
      <div class="results" id="palette-results" role="listbox"></div>
      <div id="palette-count" class="palette-count" role="status" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
      <div class="footer">
        <span><span class="kbd">↑↓</span> navigate</span>
        <span><span class="kbd">↵</span> open</span>
        <span><span class="kbd">esc</span> close</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector<HTMLInputElement>("#palette-input")!;
  const resultsEl = overlay.querySelector<HTMLElement>("#palette-results")!;

  const update = (q: string) => {
    if (!q.trim()) {
      // Show first 8 docs as default
      results = getStore().docs.slice(0, 8);
    } else {
      results = ensureFuse().search(q, { limit: 20 }).map(r => r.item);
    }
    active = 0;
    renderResults(resultsEl);
  };

  input.addEventListener("input", () => update(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = Math.min(active + 1, results.length - 1);
      renderResults(resultsEl);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(active - 1, 0);
      renderResults(resultsEl);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) {
        closePalette();
        location.hash = `#/doc/${encodeURI(r.path)}`;
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "Tab") {
      // Focus trap: only one focusable element in the dialog (the input itself)
      e.preventDefault();
    }
  });

  resultsEl.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(".result");
    if (!el) return;
    const idx = Number(el.dataset.idx);
    const r = results[idx];
    if (r) {
      closePalette();
      location.hash = `#/doc/${encodeURI(r.path)}`;
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePalette();
  });

  update("");
  // Focus on next frame so the input is ready
  requestAnimationFrame(() => input.focus());
}

export function closePalette() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  results = [];
  active = 0;
}

function renderResults(host: HTMLElement) {
  const countEl = document.getElementById("palette-count");
  if (countEl) countEl.textContent = `${results.length} result${results.length === 1 ? "" : "s"}`;
  if (results.length === 0) {
    host.innerHTML = `<div class="empty">No matching docs. Try a different query.</div>`;
    return;
  }
  host.innerHTML = results
    .map((r, i) => `
      <div class="result ${i === active ? "active" : ""}" data-idx="${i}" role="option" aria-selected="${i === active}">
        <span class="name">${escapeHtml(r.title)}</span>
        <span class="path">${escapeHtml(r.path)}</span>
      </div>
    `).join("");
  // Scroll active into view
  const el = host.querySelector<HTMLElement>(".result.active");
  if (el) el.scrollIntoView({ block: "nearest" });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]!));
}
