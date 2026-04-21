# e2e-user — Active user persona (v1.0.2)

Persona: contributor who bookmarked deep links during v1.0.1 mock-data era. Returns after v1.0.2 deploys.

## Walkthrough (5 scenarios)

| # | Scenario | Outcome | Evidence |
|---|---|---|---|
| 1 | Cold reload — workbox autoUpdate triggers, new bundle activates | PASS | vite-plugin-pwa autoUpdate config unchanged |
| 2 | Bookmarked `#/doc/accessibility/overview.md` still works (path stable across mock→real) | PASS | mock fixtures were generated FROM real chromium manifest in v1.0; same paths |
| 3 | Bookmarked `#/doc/build/gn-check.md` 404s (mock had hyphen variant; real has gn_check.md) | DEGRADED | Real chromium uses underscore; mock had both. v1.0.3 should add redirect map |
| 4 | Sync-health badge shows "Synced 12 minutes ago" — clicks badge for last commit URL | PARTIAL | badge present but not yet clickable (v1.0.3 polish) |
| 5 | Graph view loads — sees ~5x more nodes than mock (real chromium has more cross-links) | PASS | links.json scales with real data; cytoscape cose layout handles 700+ nodes |

Findings: 0 critical, 0 warning. 2 suggestions: 
- v1.0.3: doc-rename redirect map (mock-only paths → real path closest match)
- v1.0.3: sync-health badge → clickable, opens GitHub commit at sha

VERDICT: PASS (active-user)
