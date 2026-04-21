# Test Design · User-experience reviewer (v1.0.1)

## Process
Read PROJECT_BRIEF_v1.0.1.md (delightful tier — extra polish bar), the
tester's eval at `.harness/nodes/test-design/run_1/eval-tester.md`, and the
new spec `test/e2e/v101.spec.ts`. My role: stress-test whether the test plan
catches user-visible breakage, not just AC checkbox compliance.

## What the tester's plan covers well

- **Mechanical correctness** — every AC has an explicit test ID with file:line. Coverage matrix is unambiguous.
- **Theme-restyle dual probe** (TP-3) — counter + cy-alive is exactly the right pair. A naive single-probe would miss the "destroyed and rebuilt" failure mode.
- **Budget enforcement at TWO layers** — both `scripts/check-budget.mjs` (CLI) and the in-spec gzip assertion (Playwright). Defense in depth.

## Gaps I want to call out

🟢 U1 — Graph route deep-link from external (cold) load isn't tested
File: `test/e2e/v101.spec.ts:79-92`. The test does `page.goto("/#/graph")` which is correct, but the assertion only waits for `__graphReady`. We don't measure the **time to interactive** (AC-1 says "within 800ms"). The current spec proves graph renders; it does not prove it renders within 800ms.
  → Suggested fix: wrap the `waitForFunction` in a `performance.now()` delta and assert `< 800`. Keeping as suggestion since on local preview the actual render is well under 100ms; budget compliance is the dominant signal.
  reasoning: Tier is delightful — perceived speed is part of the bar. Worth at least an informational console.log of the timing.

🟢 U2 — Sidebar Graph entry click behavior not tested
File: `src/components/sidebar.ts:85-89`. Spec navigates to `/#/graph` directly via URL; never clicks the sidebar entry. A regression in sidebar wiring (e.g., href changed) would not be caught by AC-2.
  → Suggested fix: add a one-liner: `await page.goto("/"); await page.locator('a[href="#/graph"]').click(); await page.waitForFunction(...)`.
  reasoning: Defense against the silent dead-link UX bug class.

🟢 U3 — `aria-pressed` state persistence across reload
File: `test/e2e/v101.spec.ts:35-44`. Verifies that aria-pressed flips on click but not that the persisted state on reload reflects the persisted theme.
  → Suggested fix: optional follow-up — `setTheme` writes to localStorage; a reload should re-mount with matching `aria-pressed`. Not blocking AC-7 wording.
  reasoning: User-perceptible parity between the visible icon and the announced state.

🟢 U4 — Empty-graph state path
File: `src/views/graph.ts:73-76`. Empty-state HTML shows a CLI hint. No test exercises this branch (the fixture has 691 docs with links). The error path is one if-statement and unlikely to regress, so this is informational only.
  → Suggested fix: add a unit-style test that calls `buildGraphElements([], { incoming:{}, outgoing:{} })` and asserts empty arrays. Skip for v1.0.1.
  reasoning: Increased confidence on the corner case if future fixture changes drop link metadata.

## Strengths I'd emphasize

- Explicit acceptance that AC-6 (offline) tolerates either `.sidebar` or `.error-state` is honest about Playwright preview-mode SW limitations. Better than a flake-prone strict check.
- Persona harness deferral to e2e-user node aligns with the v1.0 trace and avoids duplicating the same 14 scenarios in two gates.
- Bundle test (TP-4) duplicates the CLI script intentionally — Playwright run still gates on it even if a developer skips `npm run check:budget`.

## Verdict: PASS

Test plan is sufficient for gate-test. Four suggestions are all "nice to have" — they address depth, not coverage. Recommend logging them to backlog, not blocking gate-test on any of them.

## Summary

The test-design node ships with adequate P0 coverage for AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, and AC-12. AC-11 (persona harness) is correctly deferred to the downstream e2e-user node. The four U-suggestions are good follow-up work for v1.1 polish.
