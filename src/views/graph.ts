// Graph view — Cytoscape force-directed graph of doc link structure.
// Imported lazily to keep main chunk small. Uses built-in cose layout
// (no fcose) to keep the lazy chunk small.
import cytoscape, { type Core } from "cytoscape";
import { getStore } from "../store";
import { buildGraphElements } from "../lib/graph-data";

let cy: Core | null = null;
let restyleCount = 0;
let onTheme: ((e: Event) => void) | null = null;

interface Tokens { text: string; accent: string; surface: string; border: string; }

function readTokens(): Tokens {
  const css = getComputedStyle(document.documentElement);
  return {
    text: css.getPropertyValue("--text").trim() || "#f7f8f8",
    accent: css.getPropertyValue("--accent").trim() || "#7170ff",
    surface: css.getPropertyValue("--surface").trim() || "#191a1b",
    border: css.getPropertyValue("--border-solid").trim() || css.getPropertyValue("--border").trim() || "#23252a",
  };
}

function buildStyle(t: Tokens): any[] {
  return [
    { selector: "node", style: {
      "background-color": t.accent, "border-color": t.border, "border-width": 1,
      "label": "data(label)", "color": t.text,
      "font-family": "Inter, sans-serif", "font-size": 10, "font-weight": 510,
      "text-valign": "bottom", "text-margin-y": 4,
      "text-wrap": "ellipsis", "text-max-width": "120",
      "width": "mapData(deg, 0, 20, 8, 30)", "height": "mapData(deg, 0, 20, 8, 30)",
    }},
    { selector: "node:selected", style: { "background-color": t.accent, "border-color": t.text, "border-width": 2 } },
    { selector: "node.current", style: { "background-color": t.accent, "border-color": t.text, "border-width": 3 } },
    { selector: "edge", style: {
      "width": 1, "line-color": t.border, "target-arrow-color": t.border,
      "target-arrow-shape": "triangle", "arrow-scale": 0.7, "curve-style": "bezier", "opacity": 0.5,
    }},
  ];
}

export function applyGraphTheme(): boolean {
  if (!cy) return false;
  cy.style().fromJson(buildStyle(readTokens())).update();
  restyleCount += 1;
  (window as any).__graphRestyleCount = restyleCount;
  return true;
}

export function disposeGraph() {
  if (onTheme) { document.removeEventListener("themechange", onTheme); onTheme = null; }
  if (cy) { cy.destroy(); cy = null; }
}

export function renderGraphView(root: HTMLElement, currentDocPath?: string) {
  const store = getStore();
  root.innerHTML = `
    <div class="main-inner">
      <div class="view-header"><h1>Graph</h1>
        <div class="meta">${store.docs.length} docs · click a node to open</div>
      </div>
      <div id="cy" class="graph-cy" tabindex="0" role="application"
           aria-label="Documentation link graph; press Tab then Enter to open the focused doc"
           style="width:100%;height:calc(100vh - 160px);min-height:480px;background:var(--panel,var(--surface,#0f1011));border:1px solid var(--border-solid,var(--border));border-radius:8px;"></div>
    </div>
  `;
  const elements = buildGraphElements(store.docs, store.links);
  const container = document.getElementById("cy") as HTMLElement;

  if (elements.edges.length === 0 && elements.nodes.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:48px;text-align:center;">No graph to display — run <code>npm run scan</code> first.</div>`;
    return;
  }

  if (cy) { cy.destroy(); cy = null; }
  cy = cytoscape({
    container,
    elements: [...elements.nodes, ...elements.edges] as any,
    minZoom: 0.1, maxZoom: 3, wheelSensitivity: 0.25,
    style: buildStyle(readTokens()),
    layout: {
      name: "cose", animate: false, randomize: true,
      nodeRepulsion: 4500, idealEdgeLength: 80, gravity: 0.25,
      padding: 30,
    } as any,
  });

  if (currentDocPath) {
    const cur = cy.getElementById(currentDocPath);
    if (cur && cur.length) cur.addClass("current");
  }

  cy.on("tap", "node", (evt) => {
    const id = evt.target.id() as string;
    location.hash = `#/doc/${encodeURI(id)}`;
  });

  // Keyboard activation: Enter on container opens currently selected node, else first
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const sel = cy!.nodes(":selected");
    const node = sel.length ? sel[0] : cy!.nodes().first();
    if (node) location.hash = `#/doc/${encodeURI(node.id())}`;
  });

  if (!onTheme) {
    onTheme = () => applyGraphTheme();
    document.addEventListener("themechange", onTheme);
  }

  (window as any).__cy = cy;
  (window as any).__graphReady = true;
}
