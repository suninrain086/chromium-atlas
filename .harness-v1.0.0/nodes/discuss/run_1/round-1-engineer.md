# Round 1 — Engineer Plan (chromium-atlas v1.0)

## 1. Dependencies (mirror MCB where sensible)

`package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000 --host",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --port 3000",
    "scan": "tsx scripts/scan-docs.ts",
    "test:build": "ATLAS_DOCS=test/fixtures/docs npm run build",
    "test": "npm run test:build && playwright test"
  },
  "dependencies": {
    "@fontsource-variable/inter": "^5.1.0",
    "@fontsource/jetbrains-mono": "^5.1.0",
    "dompurify": "^3.2.3",
    "fuse.js": "^7.0.0",
    "highlight.js": "^11.10.0",
    "markdown-it": "^14.1.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.59.1",
    "@types/dompurify": "^3.0.5",
    "@types/markdown-it": "^14.1.2",
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.3"
  }
}
```

Skip `gray-matter` — chromium docs are plain `.md` without YAML; parse the leading `# Title` ourselves in the scanner. Skip `cytoscape*` (graph deferred to v1.0.1). **highlight.js over shiki**: shiki ships ~2 MB of grammars/themes (would blow the 200 KB budget even after splitting); hljs core + dynamic per-language imports stays well under. No `prismjs` either — duplicate of hljs.

## 2. Bundle strategy (≤200 KB main gzip)

Main chunk contains: router, sidebar, view-mode renderers, palette, theme, markdown-it + DOMPurify, Fuse.js, hljs **core only**.

Code-split:
- **hljs language packs**: `import('highlight.js/lib/languages/cpp')` etc., one per language seen in a code fence. Register lazily in the doc-detail render path; show plain `<pre>` until pack lands. Languages we preload statically: `none` — even `cpp` is dynamic.
- **`docs.json` / `tree.json` / `links.json`**: fetched at runtime, not bundled. Sidebar boots from `tree.json` (small); `docs.json` (titles + paths + first-line desc) loaded lazily for palette + view modes; full bodies fetched per-doc.
- Fonts: `@fontsource-variable/inter` (only the variable woff2) + `@fontsource/jetbrains-mono` weight 400 only. `font-display: swap`.
- Vite `manualChunks`: split `hljs-core`, `markdown` (md-it + DOMPurify), `fuse` into separate chunks so cache survives across deploys.

If we breach budget, the next thing to drop is hljs → ship our own ~50 LOC tokenizer for `cpp`/`js`/`py`/`bash` only.

## 3. Theme without flash

Inline `<script>` in `index.html` `<head>` **before** the stylesheet link:

```html
<script>
(function(){
  try {
    var t = localStorage.getItem('atlas:theme');
    if (t !== 'light' && t !== 'dark') {
      t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = t;
  } catch (_) { document.documentElement.dataset.theme = 'dark'; }
})();
</script>
```

CSS `:root[data-theme="dark"]` / `[data-theme="light"]` token blocks — never reference theme via JS class toggling on `body`. Toggle button just rewrites `dataset.theme` + `localStorage.setItem`.

## 4. TOC scroll-spy

- After markdown render, walk `h2, h3` in the article, assign `id` (slugify, dedup with `-2` suffix), build TOC list with `<a href="#id">`.
- Single `IntersectionObserver` over all heading elements: `rootMargin: "-80px 0px -70% 0px"`, `threshold: 0`. The negative top margin offsets the sticky topbar; the −70% bottom shrinks the trigger band to roughly the top third of the viewport, so the "active" heading is whichever just crossed into the upper reading zone.
- Maintain a `Set<Element>` of currently-intersecting headings. On each callback, pick the one with the smallest `boundingClientRect.top ≥ 0`; fall back to the last one above the viewport. Update active class on the corresponding TOC link via a single classList swap.
- No debounce on the IO callback itself (already throttled by browser); debounce the `click → scrollIntoView` programmatic scroll's "suppress spy for 400ms" guard so the clicked target stays highlighted instead of flickering to a midway heading.

## 5. Mobile drawer (≤768px)

- Sidebar is always in DOM. Below 768px: `position: fixed; inset: 0 auto 0 0; width: min(86vw, 320px); transform: translateX(-100%); transition: transform 200ms ease-out;`.
- Open state: toggle `data-drawer="open"` on `<html>` → drawer gets `transform: none`, backdrop `<div class="drawer-scrim">` fades in (`opacity 0 → 1`, 200ms).
- When closed, set `inert` attribute on the sidebar (and `aria-hidden="true"`) so tab/screen-reader skip it; remove on open. `inert` polyfill not needed (Safari 15.5+, all current evergreens).
- ESC closes (single `keydown` listener at document level, only active when drawer open).
- Backdrop click closes.
- **Focus trap: skip for v1.0** — call out as known a11y gap; we set `inert` on `<main>` while drawer is open, which gives 80% of the value (tab can't escape into hidden content). Note in CHANGELOG.
- Restore `prefers-reduced-motion`: `transition: none` when matched.

## 6. Three "you might break this" gotchas

1. **Relative markdown links break navigation.** Chromium docs use `./foo.md` and `../bar/baz.md`. Do NOT pass through markdown-it's default link renderer — patch `renderer.rules.link_open` to: (a) detect relative `.md` targets, (b) resolve against the current doc's path, (c) rewrite to `#/doc/<resolved-path>`. Anchor-only links (`#section`) stay as-is. External `http(s)://` links get `target="_blank" rel="noopener"`. Forgetting this means every in-doc link 404s and back-links computation is also wrong (back-links scanner must use the SAME resolver).

2. **Scanner determinism.** Tests assert `docs.json` is byte-identical across runs. Pitfalls: `Object.keys` is insertion-ordered (fine if you insert sorted), but `JSON.stringify` of a `Map` is `{}`. Use plain objects with keys inserted in sorted order, sort arrays (back-links list, headings list) lexicographically, NEVER include `mtime`/`Date.now()`/absolute paths. Use forward slashes on Windows (`path.posix`).

3. **DOMPurify config drift between palette previews and doc body.** Palette result snippets and rendered doc bodies must share one `sanitize()` config; otherwise `ADD_ATTR` differences let an `id` survive in the body but get stripped from a preview, breaking TOC anchor resolution if a preview is ever inlined. Centralize in `src/lib/markdown.ts` (single exported `renderMarkdown`). Also: hljs output contains `<span class="hljs-...">` — these survive default DOMPurify, but if we ever add `ALLOWED_ATTR` we must keep `class`. Pin the config; add a unit test that round-trips a fixture with code + table + image.
