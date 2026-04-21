# e2e-user — Active user persona

Persona: regular contributor, uses app daily, has localStorage state from prior visits (theme=dark, expanded folders, view-mode=gallery).

## Walkthrough (5 scenarios)

| # | Scenario | Outcome | Evidence |
|---|---|---|---|
| 1 | Cold reload → dark theme persists, expanded sidebar state restored, gallery view active | PASS | smoke.spec.ts theme + view-mode persistence tests |
| 2 | Toggles theme → graph view (if open) re-styles without rebuild | PASS | v101.spec.ts:97 (AC-3 explicit graph re-style assertion) |
| 3 | Opens graph view, taps node-with-many-edges → cytoscape renders edges with hover-highlight, theme-aware | PASS | v101.spec.ts:80 |
| 4 | Switches view mode via arrow keys (radiogroup focus traps) | PASS | v101.spec.ts:49 (AC-8) |
| 5 | Goes offline (DevTools throttle), reloads → home + last-viewed doc still render from PWA cache | PASS | v101.spec.ts:111 (AC-6 offline) |

Findings: 0 critical, 0 warning. 0 suggestions.

VERDICT: PASS (active-user)
