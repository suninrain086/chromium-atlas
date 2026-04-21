# e2e-user — Churned user persona

Persona: returns after 60 days, stale browser cache, expects nothing to be broken.

## Walkthrough (4 scenarios)

| # | Scenario | Outcome | Evidence |
|---|---|---|---|
| 1 | Cold load with stale SW → workbox autoUpdate triggers, new bundle activates on next nav | PASS | vite-plugin-pwa autoUpdate config; manual smoke confirmed sw.js refresh |
| 2 | Bookmarked deep link `#/doc/accessibility/os/chromevox.md` cold-loads correctly (post fixture regen, this path now exists) | PASS | hash router + 690-doc fixture |
| 3 | Bad bookmark `#/doc/does/not/exist.md` shows 404 page (not blank) | PASS | smoke.spec.ts:60 |
| 4 | Discovers new graph view in sidebar (added since their last visit) | PASS (manual) | sidebar entry visible |

Findings: 0 critical, 0 warning. 1 suggestion: SW update could surface a small toast "App updated, reload to use new features" rather than silent.

VERDICT: PASS (churned-user)
