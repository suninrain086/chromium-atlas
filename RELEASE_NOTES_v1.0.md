# chromium-atlas v1.0 — Release Notes

**Released:** 2026-04-21
**Verdict:** OPC full-stack flow PASS at gate-final (0🔴 0🟡, 25 suggestions in v1.0.1 backlog)

## What ships (the "visible slice")
1. Folder-tree sidebar mirroring docs/ structure
2. Three view modes — title list / list / gallery
3. Cmd+K palette (Fuse.js fuzzy search) + / shortcut
4. Light/Dark theme toggle (persists, respects prefers-color-scheme)
5. Doc detail — markdown + TOC scroll-spy + back-links + code copy/highlight + breadcrumb
6. URL permalinks (#/, #/folder/<p>, #/doc/<p>) — cold-load works
7. Mobile responsive (≥320px, drawer ≤768px, reduced-motion honored)

## Deferred to v1.0.1
- Graph view (Cytoscape lazy chunk pre-wired)
- PWA / service worker
- Real chromium docs sync (sparse clone + GH Actions hourly)
- aria-pressed / role=radiogroup polish, SECURITY.md, license field

## Quality bar (delightful tier)
- 17/17 Playwright green in 4.1s
- Bundle main 16.26 KB gz / 200 KB (91.9% headroom)
- 3-wall XSS (markdown-it html:false + DOMPurify + CSP)
- Forward probes: scanner @10x docs 472ms, link integrity 100%

## OPC trace
discuss → build → code-review → test-design → test-execute → gate-test (PASS)
→ acceptance run_2 → gate-acceptance (PASS) → audit → gate-audit (PASS)
→ e2e-user → gate-e2e (PASS) → post-launch-sim → **gate-final (PASS)**

12 nodes, 5 gates, 0 blocked iterations.
