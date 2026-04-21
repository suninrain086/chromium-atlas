# Test execute · Tester (run_1)

Independent execution of the 8 P0 tests authored in `test-design/run_1`.
Author: tester role. Bundle under test: dist/ produced by
`DOCS_DIR=test/fixtures/docs npm run build` (run as the `test:build` step
of `npm test`, so we are testing the production-mode artifact, not dev).

## Command

```
$ npm test
> chromium-atlas@1.0.0-alpha.1 test
> npm run test:build && playwright test
```

## Result summary

**8 / 8 P0 tests passed in 1.7 s of test-runtime** (plus ~1 s vite preview boot
+ ~250 ms vite build). Single chromium worker, no retries. Full log archived at
`run_1/test-output.txt`.

| # | Test name | Maps to AC | Time | Result |
|---|---|---|---|---|
| 1 | home renders folder tree + brand | AC-1 | 175 ms | ✅ |
| 2 | doc route renders markdown + TOC + back-links section | AC-2,3,4,9 | 83 ms | ✅ |
| 3 | Cmd+K opens palette and arrow+Enter navigates | AC-5 | 200 ms | ✅ |
| 4 | `/` shortcut also opens palette outside inputs | AC-6 | 82 ms | ✅ |
| 5 | palette Tab is trapped (focus stays on input) | AC-7 | 81 ms | ✅ |
| 6 | theme toggle round-trips and persists data-theme | AC-8 | 78 ms | ✅ |
| 7 | 404 route shows Page-not-found state | AC-10 | 50 ms | ✅ |
| 8 | XSS — markdown `<script>` tag does not execute | AC-11 | 84 ms | ✅ |

## Friction encountered (and resolved)

1. **Initial run had stale port 4173 bound** by a leftover `vite preview` process
   from `~/projects/memex-card-browser`. With `reuseExistingServer:true`,
   Playwright connected to the wrong app and every test failed with the page
   showing "memex" content. Fixed two ways:
   - Killed the orphan PID 88509.
   - Hardened `playwright.config.ts:12-17` to use a unique port (4179) via
     `npx vite preview --port 4179 --strictPort` and set
     `reuseExistingServer:false`.
2. **`page.keyboard.press("Meta+k")` did not trigger** the `keydown` handler on
   first try — needed `body` focus first, and modifier name should be
   `ControlOrMeta+k` for cross-platform safety. Fixed in
   `test/e2e/smoke.spec.ts:23-24, 36-37, 44-45`.

Both fixes are in test infrastructure only — production code unchanged after
code-review.

## Verdict: PASS
