# chromium-atlas v1.0 — Acceptance Criteria

**Quality Tier:** delightful
**Flow Template:** full-stack
**Wall-clock budget:** 6h from 2026-04-21 17:02 CST
**Source of truth:** `PROJECT_BRIEF.md` §6 (P0 list), `KICKOFF_PROMPT.md` §"v1.0 visible slice"

## Outcomes

- OUT-1: Folder-tree sidebar renders the entire `test/fixtures/docs/` hierarchy (>=50 files across >=6 top-level folders), supports collapse/expand by click, highlights the current folder/doc with the accent left bar, and persists expanded state across reload via the `atlas:sidebar:expanded` localStorage key.
- OUT-2: Three view modes (title-list / list / gallery) render the contents of any folder, are switchable via the segmented toggle in the main pane header, and the chosen mode for each folder persists in localStorage; switching modes completes in under 100ms with no full-page reload.
- OUT-3: Cmd/Ctrl+K opens a Fuse.js-backed search palette over titles + paths; first results render within 50ms for the 50-doc fixture; Enter navigates, Esc closes, Up/Down moves selection.
- OUT-4: Light/Dark theme toggle flips the entire UI via CSS variables, persists the choice in localStorage under `atlas:theme`, defaults to `prefers-color-scheme` on first visit, and applies the selected theme before first paint to avoid flash.
- OUT-5: Doc detail view renders sanitized markdown (DOMPurify post markdown-it with `html: false`) including: breadcrumb back to root, h2/h3-derived right-side TOC with scroll-spy that updates within 200ms of section entering viewport, back-links panel listing every fixture doc whose body contains a relative link to this doc, and code blocks with language badge + working copy-to-clipboard button.
- OUT-6: Hash-router permalinks `#/`, `#/folder/<path>`, `#/doc/<path>` cold-load directly to the intended view; refreshing on any deep link restores the same content; an unknown route renders a not-found state with a "go home" action (no blank page).
- OUT-7: At viewport width 375px the sidebar collapses into a hamburger-triggered drawer, every interactive element has a hit area of at least 44x44 CSS pixels, and no horizontal page scroll appears at 320px / 375px / 768px / 1024px / 1440px.

## Verification

- OUT-1 — Playwright e2e `tests/sidebar.spec.ts` asserts >=6 top-level folder nodes, expands/collapses, validates `localStorage.getItem('atlas:sidebar:expanded')` after toggle + reload, asserts active class on the current doc.
- OUT-2 — Playwright `tests/views.spec.ts` switches each view mode, takes DOM snapshots, asserts persistence via reload, and measures switch latency via `performance.now()` (must be <100ms).
- OUT-3 — Playwright `tests/palette.spec.ts` triggers Cmd+K, types a query, asserts the first matching result appears within 50ms (timed via `performance.mark`), Enter navigates to the doc.
- OUT-4 — Playwright `tests/theme.spec.ts` toggles theme, asserts `data-theme` attribute on `<html>` flips, asserts persistence after reload, asserts `prefers-color-scheme: dark` emulation yields dark on first visit.
- OUT-5 — Playwright `tests/doc-detail.spec.ts` opens a fixture doc and asserts: breadcrumb path matches, TOC item count equals h2+h3 count, scrolling to a section adds the active class to its TOC entry, back-links panel lists every fixture that links to it, copy button writes the code block contents to the clipboard.
- OUT-6 — Playwright `tests/router.spec.ts` cold-loads `#/`, `#/folder/accessibility`, `#/doc/accessibility/overview.md`, and `#/doc/does-not-exist` from a fresh page-context and asserts the expected DOM root for each.
- OUT-7 — Playwright `tests/responsive.spec.ts` runs the home page at 320, 375, 768, 1024, 1440 widths; asserts no horizontal scroll (`document.documentElement.scrollWidth <= viewport.width`); asserts the hamburger button is visible <=768px; asserts every button/link has bounding-box width AND height >=44 at <=768px.

## Quality Constraints

- Bundle: main chunk <=200 KB gzip after `npm run build`; graph view (deferred to v1.0.1) MUST stay code-split if introduced
- Security: CSP meta tag with `default-src 'self'`; markdown-it constructed with `html: false`; DOMPurify applied to every rendered markdown body; no inline event handlers in fixture bodies
- A11y: Lighthouse Accessibility >=95 on the doc detail page (run via Playwright/`@axe-core/playwright` or chrome-launcher fallback); focus-visible styles on every interactive element; sidebar tree has `role="tree"` semantics
- Performance: First Contentful Paint <1s on `npm run preview` over localhost (measured via Playwright tracing); palette query latency <50ms (OUT-3)
- Determinism: scanner output (`docs.json`, `tree.json`, `links.json`) is byte-identical across two consecutive runs over the unchanged fixture set (no timestamps inside, sorted keys)

## Out of Scope

- Graph view (`#/graph`) — deferred to v1.0.1
- Real chromium git clone / GitHub Actions hourly sync — deferred to v1.0.1
- Service worker / PWA / offline mode — deferred to v1.0.1
- Auth, pin, favorite, tag, like, follow, frequent docs — v1.1+
- Mermaid / PlantUML rendering, AI summary, comments — v2+

## Quality Baseline (delightful)

- [ ] Typography — Inter Variable + JetBrains Mono via `@fontsource-variable/inter` and `@fontsource/jetbrains-mono`, loaded with `font-display: swap`; weight 510 used for UI per DESIGN.md
- [ ] Color scheme — `data-theme="dark|light"` on `<html>`, all colors via CSS custom properties from DESIGN.md tokens; respects `prefers-color-scheme` on first visit and persists choice
- [ ] Navigation — folder-tree sidebar with active indicator + accent bar; collapses to hamburger drawer below 768px
- [ ] Responsive layout — verified at 320/375/768/1024/1440px (OUT-7)
- [ ] Code blocks — language badge, syntax highlighted via highlight.js with palette-matched theme, copy button on hover
- [ ] Tables — bordered rows with cell padding, horizontal scroll wrapper for wide tables
- [ ] Loading states — skeleton sidebar / palette result list while `docs.json` loads
- [ ] Error states — fixture fetch failure shows actionable message + retry button
- [ ] Empty states — empty folder shows "No docs in this folder" with a "go home" link; palette no-results shows hint copy
- [ ] Favicon + meta — `<link rel="icon">` SVG favicon, `<title>`, `<meta name="description">`, `og:image` placeholder
- [ ] Focus-visible styles — every interactive element has a non-default `:focus-visible` outline using `--accent`
- [ ] Page title updates per route (e.g. "overview.md · accessibility · chromium-atlas")
- [ ] Smooth scroll — `scroll-behavior: smooth` on TOC anchor jumps; respects `prefers-reduced-motion`
- [ ] View transitions — 80ms fade between view modes per DESIGN.atlas.md §I; 200ms ease-out for sidebar drawer
- [ ] Micro-interactions — copy button morphs from `copy` to `check` icon on success; hover lift on cards
- [ ] Onboarding — empty-state hint on first visit ("Press Cmd+K to search · Use the sidebar to browse")
- [ ] Performance — LCP <2.5s, CLS <0.1, INP <200ms (Lighthouse on `npm run preview`)
- [ ] 404 — branded not-found state with sidebar still visible
