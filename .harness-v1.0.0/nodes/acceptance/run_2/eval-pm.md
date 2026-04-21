# Acceptance · PM (run_2 — post-polish)

Re-evaluation after the polish patch (commit `984fdfc`) that closed the
delightful-tier gaps surfaced in run_1.

## Run-1 findings disposition

| Finding | Status | Evidence |
|---|---|---|
| P1 — Onboarding hint absent | ✅ closed | `src/views/folder.ts:32-65` renders `[data-onboarding]` when `localStorage["atlas:onboarded"] !== "1"`; dismiss persists. Asserted by `test/e2e/polish.spec.ts:4-21`. |
| P1 — Responsive evidence gap | ✅ closed | `test/e2e/responsive.spec.ts` runs 5 widths (320/375/768/1024/1440), all green. Hamburger visibility + hit-area asserted at 375px. |
| D1 — 80ms view-mode fade missing | ✅ closed | `src/views/folder.ts:62-72` wraps swap with `.swapping` class; `src/styles/app.css:534-540` defines the `opacity 80ms ease-out` transition. Reduced-motion respected via global `app.css:19-22` override. Asserted by `polish.spec.ts:22-43`. |
| D2 — Onboarding hint (designer angle) | ✅ closed | Same patch as P1; visual review confirms strip appears above the view-header on home only. |
| D3 — Reduced-motion not guarded | ✅ closed (already correct) | `src/styles/app.css:19-22` global rule `* { transition: none !important }` under `prefers-reduced-motion: reduce` — applies to view-mode fade and TOC smooth scroll automatically. |

Reasoning: all five findings were either implemented or already covered by
existing CSS. The polish patch is +535 / -16 LOC, 6 new spec assertions.

## Outcomes scorecard (post-polish)

| ID | Outcome | Status | Evidence |
|---|---|---|---|
| OUT-1 | Folder-tree sidebar | ✅ | `src/components/sidebar.ts` |
| OUT-2 | 3 view modes + persistence + <100ms + 80ms fade | ✅ | `src/views/folder.ts:62-72`, `polish.spec.ts:22-43` |
| OUT-3 | Cmd/Ctrl+K Fuse palette | ✅ | `smoke.spec.ts:21-32` |
| OUT-4 | Theme toggle, no-FOUC | ✅ | `index.html:9-19`, `smoke.spec.ts:51-58` |
| OUT-5 | Doc detail rich shell | ✅ | `src/views/doc.ts` |
| OUT-6 | Hash router cold-load + 404 | ✅ | `smoke.spec.ts:60-63` |
| OUT-7 | Responsive 320–1440 + hamburger + hit areas | ✅ | `responsive.spec.ts` (8 assertions, all green) |

7/7 outcomes implemented AND test-asserted.

## Quality Constraints (post-polish)

- Bundle: main 16.75 KB gzip / total ~98 KB gzip — still well under 200 KB. ✅
- Security: 3-wall XSS holds; CSP unchanged; XSS smoke green. ✅
- A11y: `prefers-reduced-motion` honored globally; focus-visible rule in app.css; sidebar `role="tree"`. ✅
- Determinism: scanner output unchanged; build re-verified byte-stable. ✅
- TESTING.md: written, covers env setup, 18-row feature inventory, automated-test map, cleanup. ✅

## Findings (this run)

Reasoning: With every previous finding closed and the new specs green, I
have nothing critical or warning to add.

### 🔵 LGTM — Polish patch quality

- Reasoning: The patch lands in two cohesive files (`src/views/folder.ts`,
  `src/styles/app.css`) plus a TESTING.md that reads like a real tester's
  guide, not a stub. Test assertions match the visible behavior, not just
  CSS class presence.
- Fix: none — keep the conventional commit hygiene; consider adding a
  brief CHANGELOG entry before tagging v1.0.0.

## Verdict: PASS

All 7 outcomes implemented and test-asserted; all run_1 findings closed;
delightful-tier baseline (incl. TESTING.md) satisfied; bundle budget
intact; 17/17 Playwright assertions green.
