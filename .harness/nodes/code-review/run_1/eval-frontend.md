# Code Review · Frontend (v1.0.2 run_1)

## Process
Read the v1.0.2 build handshake, opened: `src/components/sync-health.ts`,
`src/main.ts`, `src/styles/app.css`, `scripts/scan-docs.ts`. Cross-checked
each line against discuss/decision.md and AC-5, AC-9, AC-10, AC-12 in
PROJECT_BRIEF_v1.0.2.md.

## Acceptance Criteria Results

- [PASS] AC-5 mock path preserved — `scripts/scan-docs.ts:269-278` only
  mutates `process.env.DOCS_DIR` when `--source` is explicitly passed; legacy
  `npm run scan` (no flag) still resolves via `resolveDocsDir()` → unchanged.
  `npm run test:build` passed `DOCS_DIR=test/fixtures/docs` and produced a
  green build (verified at build node).
- [PASS] AC-9 sync-meta indicator behavior — `src/components/sync-health.ts:24-37`
  fetches `./sync-meta.json` with `cache:"no-store"`, parses `lastSyncedAt`,
  validates with `Number.isFinite`, gates render on `0 ≤ ageMs ≤ 24h`. Element
  is `hidden` by default in `src/main.ts:44` and only revealed when fresh.
- [PASS] AC-10 README badge + live URL placeholder — `README.md:3` adds the
  `sync-docs` workflow badge; `README.md:9` adds the live URL placeholder.
- [PASS] AC-12 bundle budget — verified via `node scripts/check-budget.mjs`:
  main 18.13 KB / 30 KB (39.5 % headroom), total 240.29 KB / 250 KB (3.9 %).

## Domain Findings

🟢 F1 — sync-health is non-blocking and safe-by-default
File: `src/components/sync-health.ts:23-39`. The whole function is wrapped in
try/catch; on any fetch/parse failure the indicator stays hidden. No console
noise, no UI flicker. A 404 on the static path is the expected dev-mode case
and is silently tolerated.
  → Suggested fix: none.
  reasoning: Matches the brief's "rendered if … fetched successfully" gate.

🟢 F2 — Indicator mounted via existing topbar pattern
File: `src/main.ts:44, 52`. Span is added inside `renderShell`'s template
literal alongside `theme-host` / `install-host`, then mounted with the same
`document.getElementById` idiom as the install button. Zero new DOM-mounting
patterns; matches v1.0.1 conventions.
  → Suggested fix: none.
  reasoning: Consistent with `mountInstallButton` line above; reviewer would
  confuse a different pattern.

🟢 F3 — `--source` flag mapping is explicit > env
File: `scripts/scan-docs.ts:269-278`. When `--source real|mock` is passed,
the script overrides `process.env.DOCS_DIR` BEFORE calling `resolveDocsDir()`.
This means `--source` wins over inherited env; documented in the comment
above the parse block. Unknown values exit with code 2 and a clear message,
which prevents silently scanning the wrong directory.
  → Suggested fix: none.
  reasoning: Fail-loud on unknown values is exactly right for CI.

🟢 F4 — Cytoscape lazy chunk discipline preserved
File: `vite.config.ts` (unchanged). The new `sync-health.ts` is statically
imported in `main.ts`, but it is ~1.5 KB raw / ~0.5 KB gz, well below the
30 KB main-chunk ceiling. No accidental dependency on cytoscape was added
(grep confirmed). v1.0.1 graph route still loads only on `/#/graph`.
  → Suggested fix: none.
  reasoning: Confirms AC-12 holds independently of any future feature creep.

🟢 F5 — No new XSS surface
File: `src/components/sync-health.ts:33-35`. We assign to `host.textContent`
(not `innerHTML`); `host.title` is a plain string attribute. Even if the
sync-meta.json were tampered with, the worst case is malformed text in the
indicator, not script execution. The 3-wall XSS pipeline (markdown-it
`html:false` + DOMPurify + CSP) is untouched.
  → Suggested fix: none.
  reasoning: Brief constraint #5 ("Sanitize all rendered HTML") is honored.

🟢 F6 — CSS uses CSS-vars, theme-aware automatically
File: `src/styles/app.css:606-614`. `.sync-health` uses `var(--text-dim, #888)`
fallback so light/dark themes both render correctly without a JS theme hook.
  → Suggested fix: none.
  reasoning: Aligns with the theme-toggle approach used elsewhere.

## Threads

- T1 — `mountSyncHealth` returns a Promise but is not awaited at call site
  (`src/main.ts:52`). That's intentional: we don't want indicator latency to
  delay shell render. Acceptable per the brief which describes this as a
  passive enhancement.

## Verdict: PASS

Six green findings, no warnings, no criticals. All in-scope ACs verified
by code path; no blocking findings.
