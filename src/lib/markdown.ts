import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/core";

import cpp from "highlight.js/lib/languages/cpp";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";

import { slugify, resolveRelativeMd } from "./paths";

hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("c++", cpp);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("json", json);
// "gn" - chromium build language - fall back to plaintext (no hljs grammar).

function headingIdPlugin(md: MarkdownIt) {
  md.core.ruler.push("heading_ids", (state) => {
    const seen = new Map<string, number>();
    for (let i = 0; i < state.tokens.length; i++) {
      const t = state.tokens[i];
      if (t.type !== "heading_open") continue;
      const inline = state.tokens[i + 1];
      if (!inline || inline.type !== "inline") continue;
      const text = inline.content.trim();
      const base = slugify(text);
      if (!base) continue;
      const c = seen.get(base) ?? 0;
      const id = c === 0 ? base : `${base}-${c + 1}`;
      seen.set(base, c + 1);
      t.attrSet("id", id);
    }
  });
}

function linkRewritePlugin(fromDocPath: string) {
  return function (md: MarkdownIt) {
    md.core.ruler.push("rewrite_links", (state) => {
      for (const tok of state.tokens) {
        if (tok.type !== "inline" || !tok.children) continue;
        for (const ch of tok.children) {
          if (ch.type !== "link_open") continue;
          const href = ch.attrGet("href");
          if (!href) continue;
          // External links — open in new tab
          if (/^https?:\/\//i.test(href) || href.startsWith("//")) {
            ch.attrSet("target", "_blank");
            ch.attrSet("rel", "noopener noreferrer");
            continue;
          }
          // In-page anchor — leave alone
          if (href.startsWith("#")) continue;
          // Relative .md link → resolve to corpus path → hash route
          const anchor = href.includes("#") ? href.slice(href.indexOf("#")) : "";
          const resolved = resolveRelativeMd(fromDocPath, href);
          if (resolved) {
            ch.attrSet("href", `#/doc/${resolved}${anchor}`);
            ch.attrSet("data-doc", resolved);
          }
        }
      }
    });
  };
}

function highlightFn(code: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const out = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      return out;
    } catch { /* fallthrough */ }
  }
  // Escape unhighlighted code
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const renderCache = new Map<string, string>();
const RENDER_CACHE_LIMIT = 64;

function bodyFingerprint(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function renderDoc(docPath: string, body: string): string {
  const key = `${docPath}::${body.length}::${bodyFingerprint(body)}`;
  const hit = renderCache.get(key);
  if (hit !== undefined) {
    renderCache.delete(key);
    renderCache.set(key, hit);
    return hit;
  }
  const md = new MarkdownIt({
    html: false,           // 3-wall XSS: no raw HTML
    linkify: true,
    breaks: false,
    highlight: highlightFn,
  })
    .use(headingIdPlugin)
    .use(linkRewritePlugin(docPath));
  const dirty = md.render(body);
  const clean = DOMPurify.sanitize(dirty, {
    ADD_ATTR: ["target", "rel", "id", "data-doc"],
    FORBID_TAGS: ["style", "iframe", "object", "embed"],
    // Note: DOMPurify's default config strips ALL on* event handlers
    // (onerror, onload, onclick, onmouseover, onfocus, ...). We rely on
    // that default rather than maintaining an incomplete denylist.
  });
  renderCache.set(key, clean);
  if (renderCache.size > RENDER_CACHE_LIMIT) {
    const first = renderCache.keys().next().value;
    if (first !== undefined) renderCache.delete(first);
  }
  return clean;
}

export function clearRenderCache(): void {
  renderCache.clear();
}
