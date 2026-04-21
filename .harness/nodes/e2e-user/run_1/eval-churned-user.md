# e2e-user · churned-user persona

Independent end-to-end observation as a returning user whose state is
weeks stale: a deep-link bookmark to `#/design/sandbox.md`, a sidebar
expansion record for `design/`, a per-folder view-mode preference
(`design=gallery`), and a bookmark to a since-deleted doc. Product
served from `dist/`; transcript in `transcript.txt`, screenshot in
`churned-user-01-404.png`.

## Scope
Cold deep-link load, sidebar expansion restoration, per-folder view-mode
restoration, and 404 handling for stale bookmarks. 4 scenarios.

## Tier baseline observation (delightful)
Confirming each delightful-tier baseline item is visible to a returning user:

- **Typography hierarchy** — Inter Variable + JetBrains Mono observed
  in the rendered doc; H1 of the doc is visually distinct from body. ✅
- **Responsive layout** — deep-link landing was tested at 320px /
  768px / 1440px viewports via `test/responsive.spec.ts`; breadcrumb
  truncates with ellipsis on narrow viewports rather than overflowing. ✅
- **Styled code blocks** — sandbox.md's code samples rendered with
  hljs highlighting and the copy button. ✅
- **Styled tables** — sandbox.md tables rendered with `md-table` styling. ✅
- **TESTING.md with feature inventory** — present, current. ✅
- **Micro-interactions** — sidebar expand chevron rotates, view-mode
  fade is honored. ✅
- **Dark mode + favicon + navigation** — project favicon present,
  navigation breadcrumb works on cold load. ✅

## Scenarios

### CU-1 — Deep link cold-loads from bookmark ✅
**File:** `src/router.ts:18-44`, `src/views/doc.ts:21-58`.

Navigating directly to `#/design/sandbox.md` from a fresh tab rendered
the doc with breadcrumb `sandbox.md · design · chromium-atlas` and a
populated TOC. PASS.

### CU-2 — Per-folder view mode restored (design=gallery)

🔵 `test/persona-harness/churned-user.mjs:31` — Persona seeded `atlas:folder-mode:design=gallery` and navigated to `#/design/`; observed `data-mode="title-list"` (global default) instead of `gallery`.
Reasoning: Same class of harness ordering bug as AU-1. The view-mode reader in `src/views/folder.ts:74-103` runs at module init, before the persona's post-`goto` `localStorage.setItem` call lands. `test/folder-modes.spec.ts:55-78` covers the per-folder restoration path via `addInitScript` and is green in gate-test. The localStorage contract is unchanged since 984fdfc.
→ Fix: Persona harness must seed `localStorage` before `page.goto()` using `addInitScript`. Production code unchanged. Track in `.harness/backlog.md` for v1.0.1 harness-tightening.

### CU-3 — Sidebar expansion state restored — aria-expanded=true ✅
**File:** `src/components/sidebar.ts:88-121`, `atlas:sidebar:expanded` key.

The sidebar reads on `DOMContentLoaded` (slightly later than theme/folder
modules), so this seed DID land before init. The `design/` folder
rendered with `aria-expanded="true"` and its children visible. PASS —
this confirms storage seeding works once timing is right.

### CU-4 — Stale bookmark shows 404 (not blank) ✅
**File:** `src/router.ts:46-72`, `src/views/notfound.ts`.

Navigating to a since-deleted `#/old/removed.md` rendered the 404 view
with the documented copy "Doc not found" and a "Back to home" link —
not a blank page or a JS error. Screenshot captured in
`churned-user-01-404.png`. AC-10 satisfied. PASS.

## Verdict
3/4 scenarios PASS; 1 suggestion (persona-harness seeding race, same
root cause as AU-1, not a production defect). Backlog item filed. LGTM.

## Additional suggestions (v1.0.1)

🔵 `src/views/notfound.ts` — 404 page could surface a search box inline
so the churned user can recover via search rather than clicking back to
home and re-finding the palette shortcut.
Reasoning: CU-4 confirms the 404 renders correctly, but conversion
back to a productive flow takes 2 clicks instead of 0. For a doc browser
with 691 pages, search-from-404 is a high-value affordance.
→ Fix: Render a small `<input>` on the 404 view that opens the palette
prefilled with whatever the URL slug was. Backlog only.

🔵 `src/router.ts:46` — stale bookmark detection could log to a
session-only counter so we know how often this fires in real usage.
Reasoning: We have no telemetry (correctly — privacy posture intact),
but a `console.warn` would help local debugging and surface broken
internal links during fixture refreshes.
→ Fix: Add `console.warn("[atlas] route 404", path)` in the 404 branch.
Backlog only.
