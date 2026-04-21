# chromium-atlas v1.0.1 — Release Notes

**Released:** 2026-04-21
**Verdict:** OPC full-stack flow PASS at gate-final (0🔴 0🟡, 36 suggestions to v1.0.2 backlog)

## What's new

### 🕸 Graph view (the differentiator)
- New `#/graph` route + sidebar entry
- Cytoscape force-directed graph using `links.json` (built-in `cose` layout)
- Click any node → navigate to `#/doc/<path>`; current doc highlighted on entry
- Theme-aware: light/dark toggle re-styles via `cy.style().fromJson().update()` (no destroy/rebuild)
- **Lazy chunk** — Cytoscape pulled in only when graph route is visited; main chunk stays at 17.66 KB gz
- Loading skeleton + empty/error states
- Graph nodes are Tab-focusable; Enter navigates

### 📲 PWA / offline support
- `vite-plugin-pwa` with workbox precache + autoUpdate
- Cache strategy: stale-while-revalidate for the 3 JSON indexes (docs/tree/links), cache-first for hashed assets
- Install button appears in header when `beforeinstallprompt` fires
- Cold reload while offline still renders home + cached docs (verified by AC-6 Playwright test)

### ♿ A11y polish
- Theme toggle has `aria-pressed` reflecting state
- View-mode group is `role="radiogroup"` with arrow-key navigation + roving tabindex
- All toggles meet 44×44 px on mobile viewport (375 px)
- Search palette has `aria-live="polite"` result-count announcement
- Reduced-motion globally honored (graph view inherits)

### 🛡 Open-source hygiene
- `SECURITY.md` — disclosure email + supported versions
- `THIRD-PARTY.md` — accurate dependency list with licenses (MIT/Apache-2.0/BSD/ISC, all compatible)
- `package.json` declares `"license": "MIT"`
- `README.md` refreshed with badges, screenshots placeholder, privacy paragraph (no analytics, no cookies, no PII)

### 🧪 Persona harness fixes
- `test/e2e-user/_helpers.ts` — `waitForRoute`, `waitForPaletteOpen`, `waitForRender` primitives
- `seedLocalStorage()` runs via `addInitScript` BEFORE first `page.goto()` (fixes the 3 v1.0 misses)
- All 14 persona scenarios green (was 11/14 in v1.0)

## Quality bar achieved (delightful tier, again)

- **26/26** Playwright tests green in 14.9 s (17 v1.0 regression + 9 v1.0.1 ACs)
- **Bundle:** main 17.66 KB gz / 30 KB budget (41 % headroom), total JS 225.88 KB gz / 250 KB budget (10 % headroom)
- **Cytoscape lazy chunk:** 138.62 KB gz, only loaded when `/#/graph` is visited
- **Three-wall XSS** (markdown-it `html:false` + DOMPurify + CSP) intact
- **Forward probes:** scanner @ 10x docs (423 ms), link integrity 100 %, smoke replay 26/26

## Deferred to v1.0.2

- 🔄 **Real chromium docs sync** — sparse git clone of `chromium/src` (`--filter=blob:none --sparse`, `sparse-checkout set docs/`), GitHub Actions hourly cron, push to Cloudflare R2. Postponed because it touches CI infrastructure and would have collided with graph-view code paths landing this cycle.
- CSP `script-src` nonce tighten (waiting for v1.1 accounts)
- Graph view: announce node count to screen readers on load
- SW update: surface a "App updated" toast instead of silent

## OPC trace

```
discuss → build → code-review → test-design → test-execute → gate-test (PASS)
       → acceptance run_2 → gate-acceptance (PASS, after polish patch 9ff5bcf)
       → audit → gate-audit (PASS)
       → e2e-user → gate-e2e (PASS — 14/14 raw, vs 11/14 in v1.0)
       → post-launch-sim → gate-final (PASS)
```

12 upstream nodes, 5 gates, 1 polish iteration (acceptance run_1 → run_2 closed 3 yellows).

## OPC stats (this cycle)
- Wall-clock: ~1.5 hours
- Commits: 14 on main
- Test suite grew: 17 → 26 (+9 v1.0.1 ACs)
- Bundle main grew: 16.26 → 17.66 KB gz (+1.4 KB for graph route + install button)

## Built by
OPC full-stack flow under Hermes orchestration (Jingwei). Same stack patterns as `memex-card-browser` and v1.0.0.
