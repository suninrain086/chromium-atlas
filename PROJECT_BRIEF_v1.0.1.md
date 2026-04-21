# chromium-atlas v1.0.1 — Project Brief

**Cycle:** v1.0.1 (incremental release on top of v1.0.0)
**Tier:** delightful
**Wall-clock budget:** 4 hours
**Started from:** v1.0.0 commit `9e9487e` (gate-final PASS, 0🔴 0🟡)

## Why v1.0.1

v1.0.0 shipped the "visible slice" with 5 explicit deferrals. This release closes 5 of the 6 backlog items. The 6th (real chromium docs sync via sparse clone + GitHub Actions) is parked for v1.0.2 because it touches CI infrastructure, R2 hosting, and would collide with graph-view code paths landing this cycle.

## In scope (v1.0.1)

### F1 — Graph view (the differentiator)
- New `#/graph` route + sidebar entry
- Cytoscape-rendered force-directed graph using existing `public/links.json`
- Nodes = docs (sized by in-degree), edges = markdown links
- Click node → navigate to `#/doc/<path>`
- Highlight current doc when entering graph from a doc detail page
- Theme-aware (re-style on light/dark toggle via `cy.style().fromJson().update()` — NOT teardown/rebuild)
- **Lazy chunk** — Cytoscape pulled in via dynamic `import()` only when graph route is visited; main chunk must stay ≤ 30 KB gz
- Empty/error states (no edges, scan failure)
- Keyboard accessible: focus a node with Tab, Enter to navigate

### F2 — PWA / offline support
- `vite-plugin-pwa` with workbox precache strategy
- Cache: HTML shell + main JS/CSS chunks + `public/{docs,tree,links}.json`
- Cache strategy: stale-while-revalidate for JSON, cache-first for hashed assets
- Install prompt UI: small "Install" button in header (only when `beforeinstallprompt` fires)
- Offline fallback page for unknown doc paths
- Service worker version bumps on every build (Vite handles via hash)

### F3 — A11y polish (from v1.0 audit backlog)
- Theme toggle: `aria-pressed="true|false"` reflecting current state
- View-mode group: `role="radiogroup"` wrapper, each toggle `role="radio"` + `aria-checked`
- Roving tabindex inside view-mode group (only the active one in tab order)
- Hit-area minimum 44×44px on all toggles (currently some are smaller on mobile)
- `aria-live="polite"` region announcing search-result count when palette filters

### F4 — Open-source hygiene
- `SECURITY.md` — disclosure email, supported versions table
- `THIRD-PARTY.md` — list every npm dep with license + URL
- `package.json` add `"license": "MIT"` field
- `README.md` — add badges (license, build status, version), expand quickstart, add screenshots section
- Privacy paragraph in README (no analytics, no cookies, no PII)

### F5 — Persona-harness fixes (from v1.0 e2e-user backlog)
- Add `waitFor` primitives in `test/e2e-user/_helpers.ts` (waitForRoute, waitForPaletteOpen, waitForRender)
- Add `seedLocalStorage()` helper that runs BEFORE first `page.goto()` via `addInitScript`
- Re-run all 14 persona scenarios; target 14/14 raw green (was 11/14)

## Out of scope (deferred to v1.0.2 or later)

- ❌ Real chromium docs sync (sparse clone, GH Actions cron, R2 hosting) — v1.0.2
- ❌ User accounts / Supabase backend — v1.1
- ❌ Notifications / Realtime — v1.1
- ❌ Frequent-docs decay algorithm — needs accounts, so v1.1
- ❌ Pinning — needs accounts, so v1.1

## Acceptance criteria (delightful tier)

| AC | Description | Test |
|---|---|---|
| AC-1 | `#/graph` renders within 800ms cold-load on 691-doc fixture | Playwright timing |
| AC-2 | Click graph node navigates to `#/doc/<path>` | Playwright |
| AC-3 | Theme toggle on graph view re-styles without rebuild | Playwright + visual |
| AC-4 | Main chunk (excluding lazy graph chunk) ≤ 30 KB gz | Build assertion |
| AC-5 | App is installable as PWA (manifest valid, SW registers) | Lighthouse PWA audit |
| AC-6 | Cold reload under DevTools "offline" still renders home + recent docs | Playwright network=offline |
| AC-7 | Theme toggle has `aria-pressed` reflecting state | Playwright a11y query |
| AC-8 | View-mode group is keyboard-navigable as a radiogroup | Playwright keyboard test |
| AC-9 | All toggles meet 44×44px on mobile viewport (375px) | Playwright bbox check |
| AC-10 | SECURITY.md, THIRD-PARTY.md exist; package.json has license field | File assertion |
| AC-11 | All 14 persona scenarios green (was 11/14) | persona harness |
| AC-12 | All v1.0 tests still green (no regression) | npm test |

## Hard constraints (inherited from v1.0)

1. Local main commits only (after v1.0.0 push, jacky pushes manually)
2. No backend
3. Mock data only (real sync = v1.0.2)
4. Sanitize all rendered HTML (DOMPurify + html:false)
5. **New bundle budget:** main ≤ 30 KB gz, total (incl. graph chunk) ≤ 250 KB gz
6. Conventional commits

## OPC flow

`full-stack` template, delightful tier. Same 14 nodes as v1.0. Verdict synthesis is mechanical via `opc-harness synthesize`.

## Definition of done

- All 5 features (F1-F5) work end-to-end
- All 12 ACs pass
- gate-final reached with PASS verdict
- `RELEASE_NOTES_v1.0.1.md` written
- v1.0.1 tag pushed + GitHub Release created
