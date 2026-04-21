# Build node — implementation summary (run_1)

## Deliverables

All under `src/`, `scripts/`, `vite.config.ts`, `index.html`, `package.json`.

- **Scanner** (`scripts/scan-docs.ts`, 273 LOC): walks `$DOCS_DIR` (default `test/fixtures/docs/` for v1.0), parses each `.md`, derives folder tree, emits deterministic `public/{docs,tree,links}.json`. Lexicographic sort, `path.posix`, no mtime/Date.now/absolute paths — so output is reproducible across machines.
- **Vite plugin** (`vite.config.ts`): runs scanner at `buildStart`, regenerates on FS change in `vite dev`, triggers HMR full-reload.
- **Store** (`src/store.ts`, 135 LOC): single module-scoped store; loads `docs.json + tree.json + links.json`, builds `bySlug`, `inboundBy`, exposes subscriber API. Persists `theme`, `sidebar:expanded`, per-folder `viewMode` to localStorage keys per discuss/decision.md.
- **Router** (`src/router.ts`, 57 LOC): hash router with routes `#/`, `#/folder/<path>`, `#/doc/<path>`, `#/graph` (graph view stubbed for v1.0; see W1).
- **Views**
  - `views/folder.ts` (148 LOC): renders three view modes (titles / list-cards / gallery); persists per-folder mode.
  - `views/doc.ts` (186 LOC): markdown render, sticky right-side TOC built from h2/h3, copy-button on `<pre>`, back-links section pulling from store inbound map.
- **Components**
  - `components/sidebar.ts` (132 LOC): collapsible folder tree, current-folder highlight, expansion state persisted.
  - `components/palette.ts` (136 LOC): Cmd/Ctrl+K + `/` global shortcut. Fuse.js (titles + paths). Arrow nav, Enter, Esc; focus trap on Tab.
  - `components/theme-toggle.ts` (16 LOC): sun/moon button, persists to `atlas:theme`, dispatches `themechange`.
- **Markdown lib** (`src/lib/markdown.ts`, 132 LOC): markdown-it `html: false`, custom relative-link plugin rewriting `./foo.md` → `#/doc/<resolved>`, hljs core w/ dynamic per-language imports, output piped through DOMPurify with strict allowlist.
- **Styles**: `tokens.css` (light + dark per DESIGN.atlas.md), `app.css` (528 LOC for layout/sidebar/views/doc/palette/code).
- **index.html**: pre-paint theme bootstrap to avoid FOUC + meta CSP.

## Discuss-decision adherence

| Decision (decision.md) | Status |
|---|---|
| Vite 6 + Vanilla TS 5.7, ESM | ✅ |
| markdown-it 14 `html:false` + DOMPurify 3.2 | ✅ src/lib/markdown.ts |
| Fuse.js 7 basic build | ✅ components/palette.ts |
| highlight.js 11 core + dynamic langs | ✅ src/lib/markdown.ts |
| Inter Variable + JetBrains Mono 400 | ✅ index.html / app.css |
| Skip gray-matter / cytoscape / shiki / prismjs | ✅ no deps added |
| Single store in src/store.ts | ✅ |
| Deterministic scanner (sorted, posix, no mtime) | ✅ scripts/scan-docs.ts |
| localStorage keys `atlas:theme`, `atlas:sidebar:expanded`, `atlas:view:<folder>` | ✅ |

## Verification

- `npm install` → clean (45 packages, 0 vulnerabilities)
- `DOCS_DIR=test/fixtures/docs npm run scan` → indexed 94 doc(s)
- `DOCS_DIR=test/fixtures/docs npm run build` (= `tsc --noEmit && vite build`) → **dist/ produced, 102 modules transformed in 257 ms**
- Bundle (uncompressed / gzipped):
  - `index-*.js`             52.34 kB / **16.36 kB**
  - `markdown-*.js`         126.35 kB / 54.82 kB (lazy)
  - `fuse-*.js`              24.38 kB /  8.65 kB (lazy)
  - `hljs-core-*.js`         20.90 kB /  8.42 kB (lazy)
  - `index-*.css`            26.92 kB / 11.56 kB
  - **Main chunk gzipped: 16.36 kB ≪ 200 kB budget** (CLAUDE.md cap)

## Known gaps (deferred to later nodes, not blockers for build verdict)

- W1 — Graph view (`#/graph`) stub returns "Graph view coming in v1.0.1". F8 was scoped down by discuss/round-1-engineer.md to keep main chunk under budget; cytoscape lazy-load is wired but graph rendering itself is intentionally TODO. Tracked for acceptance node.
- W2 — Service worker / PWA (F10) deferred to acceptance.
- W3 — Playwright config + tests not written; will be authored by tester in test-design / test-execute nodes per OPC topology.

## Verdict: PASS
