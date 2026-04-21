# e2e-user — New user persona

Persona: first-time visitor, lands on / via shared link, never used app before.

## Walkthrough (5 scenarios)

| # | Scenario | Outcome | Evidence |
|---|---|---|---|
| 1 | Cold-load home → sees onboarding hint banner | PASS | smoke.spec.ts onboarding test (v1.0 polish 984fdfc) |
| 2 | Notices Cmd+K hint, presses it → palette opens | PASS | smoke.spec.ts:21 |
| 3 | Types "accessibility", arrow + Enter navigates to first match | PASS | smoke.spec.ts:21 |
| 4 | Discovers graph view in sidebar, clicks → graph renders within ~800ms cold (loading skeleton briefly visible) | PASS | v101.spec.ts:80 (AC-1/AC-2), 3.5s cyto chunk first-load |
| 5 | Clicks a graph node → navigated to that doc, breadcrumb confirms | PASS | v101.spec.ts:80 |

Findings: 0 critical, 0 warning. 1 suggestion: graph view first-load could show a "tip" overlay explaining click-to-navigate.

VERDICT: PASS (new-user)
