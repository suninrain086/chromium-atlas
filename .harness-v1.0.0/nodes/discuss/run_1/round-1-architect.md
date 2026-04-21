# Round 1 — Architect

Concrete plan for the v1.0 visible slice. Mirrors MCB structure where it carries
weight; deviates only for the tree/folder nature of the corpus.

## 1. Module / file layout (`src/`)

```
src/
  main.ts                 # bootstrap: theme pre-paint, fetch /docs.json+/tree.json+/links.json, init router, mount shell
  router.ts               # hash router: parseHash(), navigate(), onChange(); routes: '#/', '#/folder/<path>', '#/doc/<path>'
  store.ts                # in-memory singleton: docs[], tree, links, indexes (byPath, byFolder); load() once; tiny pub/sub
  shell.ts                # 3-pane layout shell: <aside.sidebar> <main#view> <aside.context>; mounts top bar
  components/
    sidebar.ts            # folder tree (role=tree); expand/collapse; persists 'atlas:sidebar:expanded'; keyboard nav
    top-bar.ts            # logo, search trigger, theme toggle, hamburger (mobile)
    palette.ts            # Cmd/Ctrl+K modal; Fuse.js index built lazily at first open
    theme-toggle.ts       # 'atlas:theme' get/set; sets data-theme on <html>
    view-mode-toggle.ts   # segmented control; persists 'atlas:viewmode:<folderPath>'
    code-block.ts         # post-render enhancer: lang badge + copy button (delegated click)
    toc.ts                # right panel; IntersectionObserver scroll-spy
    backlinks.ts          # right panel section; reads links.incoming[path]
    breadcrumb.ts
    not-found.ts          # branded 404 with sidebar still visible
  views/
    folder.ts             # renders title-list | list | gallery for a folder; reads viewmode from store
    doc.ts                # markdown render + TOC + back-links; per-path LRU render cache
    home.ts               # '#/' = root folder view + onboarding hint
  lib/
    types.ts              # shared interfaces (mirror scanner output)
    markdown.ts           # md-it instance, link-rewrite plugin, heading-id plugin, sanitize+enhance pipeline
    fuse-index.ts         # builds & memoizes Fuse instance over docs (title, path)
    paths.ts              # join/split/parent helpers; toHash(path); fromHash(hash)
    storage.ts            # safe localStorage get/setJSON
    dom.ts                # h() helper, on(), clear()
  styles/
    tokens.css            # CSS vars from DESIGN.md (light + dark via [data-theme=...])
    base.css              # reset, typography, scrollbars
    layout.css            # shell grid + responsive breakpoints
    sidebar.css, views.css, doc.css, palette.css, code.css
scripts/
  scan-docs.ts            # build-time scanner (see §2)
```

## 2. Build-time scanner — `scripts/scan-docs.ts`

Reads `DOCS_DIR` (default `test/fixtures/docs`), recurses *.md, emits three
files into `public/`. Determinism: lexicographic sort on every array, stable
JSON.stringify with sorted keys, **no** `generatedAt`/mtime fields in output.

```ts
// lib/types.ts (shared with scanner)
export interface DocHeading { level: 2 | 3; text: string; id: string; }
export interface Doc {
  path: string;          // 'accessibility/overview.md' (POSIX, relative to DOCS_DIR)
  folder: string;        // 'accessibility' or '' for root
  slug: string;          // 'overview'
  title: string;         // first h1 or filename
  description: string;   // first non-heading paragraph, trimmed to 160 chars
  headings: DocHeading[];
  outgoing: string[];    // resolved doc paths (relative links resolved & validated)
  body: string;          // raw markdown (rendered client-side)
  bytes: number;         // size for sort tie-break / stats; deterministic
}
export interface TreeNode {
  name: string;          // segment, e.g. 'accessibility'
  path: string;          // full folder path
  docs: string[];        // doc paths in this folder, sorted
  children: TreeNode[];  // sorted by name
}
export interface LinksIndex {
  outgoing: Record<string, string[]>;  // path -> [path...]
  incoming: Record<string, string[]>;  // path -> [path...]  (back-links)
}
// Files emitted: public/docs.json (Doc[]), public/tree.json (TreeNode root),
// public/links.json (LinksIndex).
```

Link resolution: a relative md link `../build/gn_check.md` from
`accessibility/overview.md` resolves via `path.posix.normalize`; unresolved
targets are dropped (and logged) so back-links stay clean.

## 3. Store / state pattern

`store.ts` exports a single module-scoped object built once in `main.ts`:

```ts
const store = {
  docs: Doc[], byPath: Map<string,Doc>, tree: TreeNode, links: LinksIndex,
  ui: { theme, sidebarExpanded:Set<string>, viewModes:Map<folderPath,Mode> },
  subscribe(fn): unsub, set(patch): void  // shallow merge + notify
};
```

Views never re-fetch; on hash change, `router` calls the right view's
`render(store, route)` which writes into `#view`. Sidebar/top-bar subscribe to
`store.ui` for theme + active path highlighting. No framework, no diff — each
view fully owns its container element.

## 4. Markdown pipeline (`lib/markdown.ts`)

```ts
const md = new MarkdownIt({ html:false, linkify:true, typographer:true });
md.use(headingIdPlugin);   // adds id="<slug>" to h2/h3; collects to headings[]
md.use(linkRewritePlugin); // see below
// Per-doc: render(body) -> html -> DOMPurify.sanitize -> insert -> enhance().
```

- **Relative-link rewrite plugin** runs on `link_open`; if `href` ends in `.md`
  and is not absolute (no `://`, not starting `/` or `#`), resolve against
  current doc dir via `paths.join` + `posix.normalize`, then rewrite to
  `#/doc/<resolved>`. Anchors `foo.md#section` become `#/doc/foo.md` plus a
  data attribute the doc view consumes after navigation to scroll to `#section`.
  Absolute Gitiles / external links get `target="_blank" rel="noopener"`.
- **Heading IDs**: stable `slug(text)` (lowercase, `[^a-z0-9]+`→`-`, trim,
  dedupe with `-2`, `-3`). Same algorithm in scanner so `Doc.headings[i].id`
  matches the rendered DOM — TOC click → `el.scrollIntoView`, scroll-spy via
  `IntersectionObserver` flips `.toc-active`.
- **Code blocks**: `md.options.highlight` calls `hljs.highlight(lang, code)`
  with a curated language subset (`cpp`, `python`, `gn`, `bash`, `js`, `ts`,
  `json`); fallback `hljs.highlightAuto`. Post-render `enhanceCodeBlocks(root)`
  walks `pre>code[class*="language-"]`, wraps in `<div class="code">`, injects
  `<span class="lang-badge">cpp</span>` and `<button class="copy">` (delegated
  click handler in `code-block.ts` writes `code.textContent` to clipboard,
  morphs icon copy→check for 1.2s).

Per-path LRU (size 32) caches the sanitized HTML so revisits skip parse+sanitize.

## 5. Risks (top 3 for this slice)

- **Heading-ID drift**: scanner-side and runtime-side slug functions must be
  byte-identical, otherwise TOC `#anchor` links 404. Mitigation: import the
  same `slugify()` from `lib/paths.ts` in both `scripts/scan-docs.ts` and
  `lib/markdown.ts`; unit-test a fixture with collisions.
- **Bundle budget (≤200 KB gz)**: highlight.js full build is ~90 KB gz alone.
  Mitigation: import `highlight.js/lib/core` + register only the 6 languages
  above; tree-shake Fuse.js (use `fuse.basic`); lazy-load DOMPurify only on
  first doc render (small but nonzero); monitor with `npm run build`.
- **Determinism of `links.json`**: relative-link resolution is order-sensitive
  if dedupe uses Set iteration. Mitigation: explicitly `.sort()` every emitted
  array (outgoing, incoming, headings, docs, children) and write JSON via a
  recursive sorted-keys serializer rather than relying on insertion order.
