# chromium-atlas — Claude operating notes

A graph-aware browser for chromium docs. v1.0 is a static SPA; no backend, no auth, no real chromium clone.
Read `PROJECT_BRIEF.md`, `DESIGN.md`, `DESIGN.atlas.md` for product/scope/visual intent. `KICKOFF_PROMPT.md` is
the autonomous-build kickoff.

## Stack
- Vite + Vanilla TypeScript (no framework, hash router)
- markdown-it (+ relative-link plugin) → DOMPurify → CSP meta (3-wall XSS)
- Fuse.js for search; highlight.js for code (decision pending bundle audit)
- Lucide icons stroke 1.5px; Inter Variable + JetBrains Mono
- Playwright e2e

## Workflow
- Mock fixtures in `test/fixtures/docs/` are the only data source for v1.0
- `npm run scan` → emits `public/docs.json`, `public/tree.json`, `public/links.json`
  (configurable via `DOCS_DIR`)
- `npm run dev` for local; `npm test` runs Playwright after a fixture build
- Bundle budget: main chunk ≤ 200 KB gzipped
- Conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`); commit to local `main` only — never push

## OPC harness
- Lives in `.harness/`; orchestrated by `node ~/.claude/skills/opc/bin/opc-harness.mjs`
- Flow: `full-stack` (delightful tier). Discuss → build → code-review → test-design → test-execute →
  gate-test → acceptance → gate-acceptance → audit → gate-audit → e2e-user → gate-e2e → ux-simulation → gate-final
- Gate verdicts come from independent reviewer artifacts via `opc-harness synthesize` — never hand-grade

## Hard rules
- Sanitize all rendered HTML; markdown-it `html: false`
- Mock data only; no real chromium clone, no GH Actions in v1.0
- Static-site only; no backend
