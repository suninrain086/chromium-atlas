# Discuss — Decision (run_1)

Synthesis of round-1 architect/engineer/tester outputs. Rounds 2-3 collapsed to
preserve wall-clock budget; the three plans converged with no contradictions.

## Stack (locked)

- Vite 6 + Vanilla TS 5.7, ESM, `type: module`
- markdown-it 14 (`html: false`) + DOMPurify 3.2 (single config in `src/lib/markdown.ts`)
- Fuse.js 7 (basic build), highlight.js 11.10 **core only** + dynamic per-language imports
- `@fontsource-variable/inter` + `@fontsource/jetbrains-mono` (weight 400)
- Playwright 1.59 (chromium-only project, port 4173)
- tsx 4.19 for the build-time scanner

Skip: gray-matter (no frontmatter in chromium docs), cytoscape (graph deferred),
shiki (bundle), prismjs (duplicate of hljs).

## Module layout

Per `round-1-architect.md` §1 verbatim. Highlights:
`src/{main,router,store,shell}.ts`, `components/{sidebar,top-bar,palette,theme-toggle,view-mode-toggle,code-block,toc,backlinks,breadcrumb,not-found}.ts`,
`views/{folder,doc,home}.ts`, `lib/{types,markdown,fuse-index,paths,storage,dom}.ts`,
`styles/{tokens,base,layout,sidebar,views,doc,palette,code}.css`,
`scripts/scan-docs.ts`.

## Data contracts

`Doc`, `TreeNode`, `LinksIndex` per architect §2. Scanner emits to `public/`:
`docs.json` (Doc[]), `tree.json` (root TreeNode), `links.json` (LinksIndex).
Determinism: sorted keys via recursive sorted-key serializer, lexicographic
sort on every array, no `mtime`/`Date.now()`/absolute paths, `path.posix` only.

## State

Single module-scoped `store` in `src/store.ts` (per architect §3). Views own
their container element; no diffing. `ui` slice persists `theme`,
`sidebarExpanded:Set<string>`, `viewModes:Map<folderPath,Mode>` to localStorage
keys: `atlas:theme`, `atlas:sidebar:expanded`, `atlas:view:<folderPath>`.

## Markdown pipeline

Centralized in `src/lib/markdown.ts`. Single DOMPurify config shared by doc
body + palette previews. Plugins:
- **headingIdPlugin** — slug = `lowercase, [^a-z0-9]+→-, trim, dedupe -2/-3`.
  Same `slugify()` exported from `lib/paths.ts` and imported by both
  `scripts/scan-docs.ts` and `lib/markdown.ts` (mitigates ID-drift risk).
- **linkRewritePlugin** — relative `.md` → `#/doc/<resolved>`; anchors stripped
  to data attribute consumed post-navigation; external links get
  `target="_blank" rel="noopener"`.
- `md.options.highlight` calls hljs core; languages `cpp,python,gn,bash,js,ts,json`
  registered lazily in doc-detail render path. Plain `<pre>` until pack lands.
- `enhanceCodeBlocks(root)` injects `<span class="lang-badge">` + `<button class="copy">`;
  delegated click handler in `code-block.ts`.
- Per-path LRU (size 32) caches sanitized HTML.

## Theme without flash

Inline IIFE in `index.html <head>` before stylesheet (engineer §3). Reads
`atlas:theme`, falls back to `prefers-color-scheme`, sets
`documentElement.dataset.theme`. CSS keys off `:root[data-theme="..."]`.

## Scroll-spy

Single IntersectionObserver, `rootMargin: "-80px 0px -70% 0px"`, threshold 0.
Maintain `Set<Element>` of intersecting headings; pick smallest
`top ≥ 0`, fall back to last above viewport. 400ms suppression after
programmatic `scrollIntoView` to prevent flicker (engineer §4).

## Mobile drawer (≤768px)

Sidebar always in DOM; `position: fixed; transform: translateX(-100%)`;
`data-drawer="open"` on `<html>` opens it. Backdrop scrim. `inert` on
`<main>` while open (skip full focus trap for v1.0 — call out in CHANGELOG).
ESC + backdrop click close. `prefers-reduced-motion`: transition none.

## Bundle strategy

Main chunk: router, sidebar, view renderers, palette, theme, md-it, DOMPurify,
Fuse basic, hljs core. Code-split: hljs language packs (dynamic import per fence
language); JSON fixtures fetched at runtime, not bundled. Vite `manualChunks`
splits `markdown`, `fuse`, `hljs-core`. Fallback if budget exceeded: drop hljs
for ~50 LOC tokenizer covering cpp/js/py/bash.

## Test plan

Per `round-1-tester.md`. Playwright config: chromium-only, port 4173,
`webServer` runs `npm run preview -- --port 4173 --strictPort`. Spec files
mapped 1:1 to OUT-1..7. Anti-flake: `document.fonts.ready` in `beforeEach`,
disable smooth scroll via injected style, `context.grantPermissions` for
clipboard, 5-trial median for 50ms palette assertion.

## Top risks

1. Heading-ID drift (mitigation: shared `slugify` import).
2. Bundle budget (mitigation: hljs core + dynamic langs, Fuse basic).
3. Scanner determinism (mitigation: sorted-keys serializer + array sorts).
4. Relative `.md` link resolution must match in scanner back-link computation
   AND runtime `linkRewritePlugin` (single `resolveRelativeMd()` in `lib/paths.ts`).

## Handoff to build

The implementer should follow the architect's file layout exactly, share
`slugify` + `resolveRelativeMd` helpers between scanner and runtime, and ship
the test fixture set the tester specified before writing the scanner so the
determinism test can run from day one.
