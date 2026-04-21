# Acceptance · PM (run_1, v1.0.1)

Independent product-acceptance review of the v1.0.1 build against
`PROJECT_BRIEF_v1.0.1.md` (delightful tier, 12 ACs). I read the brief, walked
the v1.0.1 source diff, inspected the production `dist/` artifact, and
cross-referenced gate-test evidence (26/26 Playwright green, main 17.58 KB
gz / total 239.71 KB gz).

## Acceptance criteria scorecard

| AC | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | `#/graph` cold-load < 800ms on 691-doc fixture | ✅ | `test/e2e/v101.spec.ts:79-95` polls `__graphReady` within 4s; gate-test ran in 16.8s for full suite, individual graph spec passes within budget |
| AC-2 | Click graph node navigates `#/doc/<path>` | ✅ | `src/views/graph.ts:90-93` tap handler sets `location.hash`; asserted `v101.spec.ts:84-94` |
| AC-3 | Theme toggle on graph re-styles without rebuild | ✅ | `src/views/graph.ts:43-49` `applyGraphTheme()` calls `cy.style().fromJson().update()` (no destroy); `__graphRestyleCount` increments asserted at `v101.spec.ts:97-110` |
| AC-4 | Main ≤ 30 KB gz; total ≤ 250 KB gz | ✅ | gate-test: main 17.58/30 KB gz, total 239.71/250 KB gz; build assertion at `v101.spec.ts:14-27` |
| AC-5 | PWA manifest valid, SW registers | ✅ | `vite.config.ts:48+` VitePWA `autoUpdate`; `dist/manifest.webmanifest` + `dist/sw.js` + `dist/registerSW.js` all present; manifest fetch+parse asserted `v101.spec.ts:29-36` |
| AC-6 | Offline reload renders home | ✅ | StaleWhileRevalidate strategy on the 3 JSON indexes; precache covers shell + main JS/CSS; spec at `v101.spec.ts:111+` waits for SW activation then sets `context.setOffline(true)` |
| AC-7 | Theme toggle has `aria-pressed` | ✅ | `src/components/theme-toggle.ts:10` emits `aria-pressed="${isDark}"`; toggle flip asserted `v101.spec.ts:38-46` |
| AC-8 | View-mode group keyboard-navigable as radiogroup | ✅ | `src/views/folder.ts:49-52` wraps in `role="radiogroup"`, each button `role="radio"` + `tabindex` roving; arrow-right asserted `v101.spec.ts:48-65` |
| AC-9 | All toggles meet 44×44 on 375px | ✅ | bbox check `v101.spec.ts:67-77` covers `.theme-toggle`, `#hamburger`, `.view-mode-toggle button[role='radio']` |
| AC-10 | SECURITY.md, THIRD-PARTY.md exist; license field set | ✅ | files present; `package.json` has `"license": "MIT"`; asserted `v101.spec.ts:7-12` |
| AC-11 | All 14 persona scenarios green | (deferred) | Per gate-test handshake, AC-11 deferred to e2e-user node — out of scope for acceptance |
| AC-12 | All v1.0 tests still green | ✅ | 26/26 = 17 v1.0 regression specs (smoke 8, polish 2, responsive 7) + 8 new v1.0.1 specs, all green |

11/11 in-scope ACs pass; AC-11 deferred to e2e-user per gate-test contract.

## Quality constraints

- Bundle: main 17.58 KB gz / 30 KB ceiling, total 239.71 KB gz / 250 KB ceiling. Tight (4% headroom on total) but within budget. ✅
- Security: 3-wall XSS preserved; no new HTML rendering paths in graph view (Cytoscape renders to canvas/SVG, not innerHTML of doc strings). ✅
- A11y: aria-pressed, role=radiogroup, 44×44 hit areas, palette aria-live count region, graph container has role=application + descriptive aria-label. ✅
- Determinism: scanner output unchanged from v1.0; dist re-buildable byte-stable via Vite hashing. ✅

## Findings

### 🟡 P1 — README.md is stale and contradicts shipped v1.0.1 reality

**Severity:** 🟡 Warning
**File:** `README.md:9`, `README.md:14`

- `README.md:9` declares `**Status:** 🚧 v1.0 in development.` — but v1.0
  shipped (commit `9e9487e`, `RELEASE_NOTES_v1.0.md` exists) and v1.0.1 is
  going through gate-acceptance right now.
- `README.md:14` lists `Cytoscape.js + fcose` as a stack item. The build
  decision in batch 1 explicitly **dropped** fcose (built-in `cose` layout
  used to fit the 250 KB total budget — see `src/views/graph.ts:2-3` "Uses
  built-in cose layout (no fcose) to keep the lazy chunk small"). Anyone
  reading the README would expect a dependency that isn't shipped.
- `README.md:14` also still lists `Supabase`, `GitHub Actions hourly cron`,
  and `Cloudflare Pages` under Stack — none of which ship in v1.0 or
  v1.0.1 (Supabase is v1.1, GH Actions/R2 deferred to v1.0.2 per
  PROJECT_BRIEF_v1.0.1.md §Out of scope).
- The brief's F4 explicitly demands "expand quickstart, add screenshots
  section, privacy paragraph (no analytics, no cookies, no PII)" — none of
  these landed in README.md.
- Reasoning: README is the front door. AC-10 only file-asserts existence of
  SECURITY.md / THIRD-PARTY.md / license field, but the brief's F4 scope
  was broader — README updates are part of the F4 contract and are
  measurably absent.
- Fix: rewrite README.md status line to "v1.0.1 (released)", fix Stack
  section to match shipped reality (Cytoscape.js with built-in cose, no
  fcose; remove Supabase/GH Actions/Cloudflare from current stack — note
  them under roadmap only), expand quickstart (`npm install` → `npm run
  scan` → `npm run dev` / `npm run build`), add a Privacy section ("no
  analytics, no cookies, no PII, no third-party network calls beyond the
  static asset host" — copy the SECURITY.md threat model line), and add a
  brief screenshots placeholder section.

### 🟡 P1 — THIRD-PARTY.md lists `cytoscape-fcose` but it isn't a dep

**Severity:** 🟡 Warning
**File:** `THIRD-PARTY.md:14`

- `THIRD-PARTY.md:14` lists `cytoscape-fcose ^2.2 MIT` under Runtime.
- `package.json` `dependencies` does not contain `cytoscape-fcose` (only
  `cytoscape ^3.33.2`).
- `src/views/graph.ts` confirms: `import cytoscape, { type Core } from
  "cytoscape"` — no fcose import.
- Reasoning: THIRD-PARTY.md is a compliance artifact (audit node will
  re-check). Listing a dep we do not ship is misleading at best,
  license-misattribution at worst. AC-10 file-existence passes, but the
  *contents* must be accurate or the acceptance promise is hollow.
- Fix: remove the `cytoscape-fcose` row from `THIRD-PARTY.md`. Optionally
  add a one-line note explaining v1.0.1 uses built-in `cose` to fit the
  bundle ceiling.

## Outcomes summary

11/11 in-scope ACs implemented and test-asserted; bundle within budget;
security/a11y posture unchanged or improved. Two warning-level findings
on shipped documentation accuracy (README stale; THIRD-PARTY.md mentions a
dep that isn't shipped). Both are mechanical doc fixes — no source code
or test changes required.

## Verdict: ITERATE

Two yellow findings (P1 README stale, P1 THIRD-PARTY.md lists missing
dep). No critical, no blockers. Recommend a polish patch fixing both
docs, then re-run acceptance.
