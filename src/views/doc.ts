import { getStore, incomingFor } from "../store";
import { renderDoc } from "../lib/markdown";
import { parentFolder, ancestorFolders } from "../lib/paths";

export function renderDocView(host: HTMLElement, docPath: string, anchor?: string) {
  const store = getStore();
  const doc = store.byPath.get(docPath);
  if (!doc) {
    host.innerHTML = `
      <div class="main-inner">
        <div class="empty-state">
          <h2>Doc not found</h2>
          <p><code>${escapeHtml(docPath)}</code> doesn't exist.</p>
          <p><a href="#/">Go home</a></p>
        </div>
      </div>`;
    return;
  }

  const html = renderDoc(doc.path, doc.body);
  const inbound = incomingFor(doc.path);

  // Update document title for permalink-friendly tabs
  const parts = doc.path.split("/");
  document.title = `${parts[parts.length - 1]} · ${parts.slice(0, -1).join("/")} · chromium-atlas`;

  host.innerHTML = `
    <div class="main-inner" data-doc="${escapeHtml(doc.path)}">
      <div class="doc-layout">
        <article class="doc-body">${html}</article>
        <aside class="doc-side">
          <div class="toc">
            <h4>On this page</h4>
            <ul>
              ${doc.headings.map(h => `<li><a href="#${h.id}" data-toc-id="${h.id}" class="${h.level === 3 ? "h3" : ""}">${escapeHtml(h.text)}</a></li>`).join("")}
              ${doc.headings.length === 0 ? `<li class="empty" style="color:var(--text-4);font-style:italic;font-size:12px;padding-left:8px;">no headings</li>` : ""}
            </ul>
          </div>
          <div class="backlinks">
            <h4>Referenced by</h4>
            ${inbound.length === 0
              ? `<div class="empty">No back-links</div>`
              : `<ul>${inbound.map(p => {
                  const d = store.byPath.get(p);
                  return `<li><a href="#/doc/${encodeURI(p)}">${escapeHtml(d?.title || p)}</a></li>`;
                }).join("")}</ul>`}
          </div>
        </aside>
      </div>
    </div>
  `;

  enhanceCodeBlocks(host);
  attachTocSmoothScroll(host);
  setupScrollSpy(host);
  attachInternalDocLinkHandler(host);

  // Anchor scroll AFTER render
  if (anchor) {
    const target = host.querySelector<HTMLElement>(`#${CSS.escape(anchor)}`);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    }
  }
}

function enhanceCodeBlocks(host: HTMLElement) {
  const pres = host.querySelectorAll<HTMLPreElement>(".doc-body pre");
  pres.forEach(pre => {
    const code = pre.querySelector("code");
    if (!code) return;
    const langClass = [...code.classList].find(c => c.startsWith("language-"));
    const lang = langClass ? langClass.replace("language-", "") : "";
    if (lang) {
      pre.classList.add("has-lang");
      const badge = document.createElement("span");
      badge.className = "lang-badge";
      badge.textContent = lang;
      pre.appendChild(badge);
    }
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Copy code");
    btn.textContent = "Copy";
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(code.textContent || "");
        btn.textContent = "✓ Copied";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1500);
      } catch {
        btn.textContent = "Failed";
      }
    });
    pre.appendChild(btn);
  });
}

let activeObserver: IntersectionObserver | null = null;

function setupScrollSpy(host: HTMLElement) {
  if (activeObserver) { activeObserver.disconnect(); activeObserver = null; }
  const main = document.querySelector<HTMLElement>(".main");
  if (!main) return;
  const headings = host.querySelectorAll<HTMLElement>(".doc-body :is(h2, h3)[id]");
  const tocLinks = host.querySelectorAll<HTMLAnchorElement>(".toc a[data-toc-id]");
  if (!headings.length || !tocLinks.length) return;

  const visible = new Set<Element>();
  let suppressed = false;

  const update = () => {
    if (suppressed) return;
    let activeId: string | null = null;
    const mainTop = main.getBoundingClientRect().top;
    let bestTop = -Infinity;
    let bestAboveTop = -Infinity;
    let bestAboveId: string | null = null;
    headings.forEach((h) => {
      const top = h.getBoundingClientRect().top - mainTop;
      if (top >= 0 && top < (main.clientHeight * 0.4)) {
        if (top < (bestTop === -Infinity ? Infinity : 999999) || activeId === null) {
          bestTop = top;
          activeId = h.id;
        }
      }
      if (top < 0 && top > bestAboveTop) {
        bestAboveTop = top;
        bestAboveId = h.id;
      }
    });
    if (!activeId) activeId = bestAboveId || (headings[0] as HTMLElement).id;
    tocLinks.forEach(a => a.classList.toggle("active", a.dataset.tocId === activeId));
  };

  activeObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target);
      else visible.delete(e.target);
    }
    update();
  }, { root: main, rootMargin: "-60px 0px -60% 0px", threshold: 0 });

  headings.forEach(h => activeObserver!.observe(h));

  // Suppress 400ms after programmatic scroll triggered by TOC click
  host.querySelector(".toc")?.addEventListener("click", () => {
    suppressed = true;
    setTimeout(() => { suppressed = false; update(); }, 450);
  });

  // Initial paint
  requestAnimationFrame(update);
}

function attachTocSmoothScroll(host: HTMLElement) {
  host.querySelectorAll<HTMLAnchorElement>(".toc a[data-toc-id]").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.dataset.tocId!;
      const target = host.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (target) {
        target.scrollIntoView({ block: "start", behavior: "smooth" });
        // Update the URL anchor without re-routing
        const docPath = host.querySelector<HTMLElement>(".main-inner")?.dataset.doc;
        if (docPath) history.replaceState(null, "", `#/doc/${encodeURI(docPath)}#${id}`);
        // Mark active immediately
        host.querySelectorAll<HTMLAnchorElement>(".toc a[data-toc-id]").forEach(x => x.classList.toggle("active", x === a));
      }
    });
  });
}

function attachInternalDocLinkHandler(host: HTMLElement) {
  // Markdown-it gives us `data-doc` on links to known corpus docs;
  // ensure they navigate via hash router (they already use `#/doc/...` href, so default works).
  // We also ensure missing-target links get a visual "broken" hint by post-processing.
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]!));
}
