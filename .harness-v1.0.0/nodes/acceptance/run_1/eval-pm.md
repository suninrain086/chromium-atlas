# Acceptance · PM

Independent product-acceptance review of the v1.0 build against
`.harness/acceptance-criteria.md` (delightful tier). I read the criteria,
walked the source, ran `npm run test:build` to inspect the production
artifact, and cross-referenced the test-execute evidence (`8/8 P0 PASS`).

## Outcomes scorecard

| ID | Outcome | Status | Evidence |
|---|---|---|---|
| OUT-1 | Folder-tree sidebar, persisted | ✅ | `src/components/sidebar.ts:88-121` renders recursive tree, `setFolderExpanded`+`atlas:sidebar:expanded` (store), 690-file fixture > the 50-file floor |
| OUT-2 | 3 view modes + persistence + <100ms | ✅ | `src/views/folder.ts:38-65` wires title-list/list/gallery; `setViewMode` persists; `__lastViewSwitchMs` instrumented at `:64` |
| OUT-3 | Cmd/Ctrl+K Fuse palette | ✅ | `src/main.ts:162-167`, smoke test AC-5 timed pass; Fuse chunk 8.4 KB gzip — well under any latency concern for 690 docs |
| OUT-4 | Theme toggle + FOUC-free first paint | ✅ | `index.html:9-19` theme bootstrap script runs pre-paint; persisted under `atlas:theme`; toggled in smoke AC-8 |
| OUT-5 | Doc detail: breadcrumb, TOC w/ scroll-spy, back-links, copy code | ✅ | `src/views/doc.ts:30-98` (TOC + scroll-spy via IntersectionObserver `:138-155`, copy button `:81-97`, back-links `:39-47`); `renderBreadcrumb` at `src/main.ts:52-84` |
| OUT-6 | Hash router deep-load + 404 | ✅ | `src/main.ts:122-156`, `setNotFound` branded empty-state; smoke AC-9/AC-10 confirmed |
| OUT-7 | Responsive 320–1440, 44px hit areas, hamburger | 🟡 (P1) | hamburger drawer wired (`src/main.ts:25-49, store setDrawerOpen`); responsive widths NOT exercised by smoke suite (AC-12 explicitly skipped per test-execute handshake). See P1 below. |

7/7 outcomes implemented in code; 6/7 covered by automated proof.
1/7 (responsive) covered by code + manual inspection only — flagged P1.

## Quality Constraints

- Bundle: main 16.4 KB gzip / total ~98 KB gzip, **<<200 KB budget** ✅
- Security: CSP meta + `html:false` + DOMPurify (`src/lib/markdown.ts:117-123`) — XSS smoke AC-11 green ✅
- A11y: `role="tree"` on sidebar (`src/components/sidebar.ts:11`), `aria-expanded` on folder nodes, `aria-current="page"` on active. Lighthouse score not yet captured — defer to audit/a11y. ✅ (structurally)
- Determinism: scanner architect-verified byte-identical (`code-review/run_1/architect.md` §A4). ✅
- Performance: not yet measured; tier baseline LCP/CLS/INP defer to audit. (acknowledged scope)

## Out-of-scope check

- Graph view: NOT introduced (correctly deferred per CLAUDE.md). ✅
- Real chromium clone: NOT done. ✅
- Service worker: NOT introduced. ✅

## Quality Baseline (delightful) spot-check

| Item | Status |
|---|---|
| Inter Variable + JetBrains Mono with `font-display:swap` | ✅ `package.json` deps + Vite consumes the variable subset |
| Theme tokens via CSS vars + pre-paint bootstrap | ✅ `index.html:9-19` |
| Hamburger drawer ≤768px | ✅ `src/main.ts:25-49`; visual breakpoint not test-asserted (P1) |
| Code blocks: language badge + copy button | ✅ `src/views/doc.ts:67-98` |
| Loading skeleton sidebar | ✅ `src/main.ts:94-101` |
| Error state with retry | ✅ `src/main.ts:107-116` |
| Empty state ("No docs in this folder") | ✅ `src/views/folder.ts:75-77` |
| Favicon + meta + title-per-route | ✅ `index.html:8-9`, `src/main.ts:127,135`, `src/views/doc.ts:23-25` |
| Smooth scroll + reduced-motion respect | ⚠ smooth scroll on TOC click (`src/views/doc.ts:165`), but no explicit `prefers-reduced-motion` guard (P2 — defer to audit/a11y) |
| Onboarding hint ("Press Cmd+K…") | 🟡 NOT FOUND in source (P1 — see findings) |
| 404 branded with sidebar | ✅ `src/main.ts:145-156` (sidebar shell still renders) |

## Findings

### 🟡 P1 — Onboarding hint absent

**File:** `src/views/folder.ts` (root render path)

The delightful-tier baseline mandates an onboarding hint on first visit:
"Press Cmd+K to search · Use the sidebar to browse". I grepped for `Cmd+K`,
`onboard`, `hint` in `src/` — nothing in the rendered shell or the empty/home
view. The home view (`renderFolderView(view, "")`) immediately drops the user
into a folder grid with no orientation copy.

**Reasoning:** This is a delightful-tier criteria-listed item, not just a
nice-to-have. New users have no signal that the palette exists.

**Fix:** In `src/views/folder.ts:renderFolderView`, when `folderPath === ""`
AND `localStorage.getItem("atlas:onboarded") !== "1"`, prepend a one-line hint
strip ("Press ⌘K to search · Pick a folder on the left to start browsing")
with a dismiss "✕" that writes the flag. ~12 lines of code, ~0.3 KB gzip.
Pairs with the existing `.search-trigger` `⌘K` chip in the topbar so the
moment is consistent. Recommended ITERATE in this run if time permits;
otherwise carry forward as the only delightful gap.

### 🟡 P1 — Responsive breakpoints not asserted by automated tests

**File:** `test/e2e/smoke.spec.ts` (entire suite)

OUT-7 specifies viewport assertions at 320/375/768/1024/1440. The current
smoke suite uses Playwright's default viewport only. test-execute
acknowledged this in its `skipped[]` (AC-12) but routed it as "deferred to
acceptance". Acceptance (this node) is the bag-holder.

**Reasoning:** Without these assertions, regressions to the hamburger
breakpoint or hit-area sizing would slip silently. Code looks correct on
inspection; the gap is *evidence*, not implementation.

**Fix:** Add `tests/responsive.spec.ts` with 5 viewport contexts asserting:
(a) `document.documentElement.scrollWidth <= viewport.width` at each width,
(b) hamburger button visible ≤768px and hidden >768px, (c) interactive
elements ≥44×44 at the two mobile widths. ~50 LOC. Recommend ITERATE
unless audit picks it up under a11y.

### 🟢 P2 — `prefers-reduced-motion` not guarded

**File:** `src/views/doc.ts:165`

`scrollIntoView({ behavior: "smooth" })` ignores the user's reduced-motion
preference. Defer to audit/a11y (which has the right lens).

### 🔵 LGTM — three-mode view persistence

OUT-2 implementation is exactly what the criteria asks for and the
performance.now() instrumentation makes it self-verifying.

### 🔵 LGTM — hash router cold-load

OUT-6 implementation walks the right tradeoffs (single source of truth in
`location.hash`, `setNotFound` as a hookable handler, `dispatch()` once on
boot).

## Verdict: ITERATE

Two 🟡 findings (P1 onboarding hint, P1 responsive evidence). No 🔴.
Implementation is sound; gaps are scope-completion gaps that the
delightful tier explicitly requires. If we close P1.onboarding in a tight
patch, P1.responsive can shift to audit (which already has a11y in scope)
and we land at PASS.
