# chromium-atlas

> A graph-aware, developer-friendly browser for the official
> [Chromium documentation](https://chromium.googlesource.com/chromium/src/+/main/docs/).

Browse 600+ chromium docs with a folder-tree sidebar, three reading layouts,
global search, dark/light mode, a global relationship **graph view**, and
offline / installable PWA support — plus (v1.1) personal pin / favorite /
tag / like / follow.

**Status:** v1.0.1 — released. See [`RELEASE_NOTES_v1.0.md`](./RELEASE_NOTES_v1.0.md).

## Stack (shipped)

- **Frontend:** Vite 6 + Vanilla TypeScript (no framework, hash router)
- **Markdown:** markdown-it (`html: false`) + relative-link plugin → DOMPurify → CSP `<meta>` (3-wall XSS)
- **Search:** Fuse.js (lazy-loaded chunk)
- **Graph:** Cytoscape.js with built-in `cose` layout (lazy chunk; v1.0.1 dropped `cytoscape-fcose` to fit the 250 KB total bundle ceiling)
- **Code highlight:** highlight.js core (subset of languages)
- **PWA:** vite-plugin-pwa (`autoUpdate`) + Workbox; StaleWhileRevalidate for the 3 JSON indexes; CacheFirst for hashed assets
- **Type / fonts:** Inter Variable + JetBrains Mono via `@fontsource(-variable)`
- **Tests:** Playwright e2e

See [`THIRD-PARTY.md`](./THIRD-PARTY.md) for the full dependency list with licenses.

## Roadmap (not yet shipped)

- **v1.0.2:** Real chromium docs sync (sparse clone of `chromium/src`, GitHub Actions hourly cron, Cloudflare R2 hosting)
- **v1.1:** Supabase backend (Auth · Postgres · Realtime · Edge Functions); OAuth (GitHub/Google/Apple/Microsoft); pin (max 20); favorite; tags; like; follow; in-app + email notifications; frequent-docs view (exponential decay, half-life 28d)
- **v2+:** Comments · AI Q&A · Mermaid · link-health report · RSS

## Quickstart

```bash
npm install
npm run scan        # generates public/{docs,tree,links}.json from test/fixtures/docs/
npm run dev         # http://localhost:5173
npm run build       # production bundle in dist/
npm test            # Playwright suite (builds first)
```

To point the scanner at a different doc tree:

```bash
DOCS_DIR=/path/to/markdown npm run scan
```

## Screenshots

_(coming soon — folder view, doc detail with TOC, palette, graph view, light/dark)_

## Privacy

chromium-atlas is a **static SPA with no backend**. We collect nothing.

- ✅ No analytics, no telemetry
- ✅ No cookies
- ✅ No PII, no user accounts (until v1.1)
- ✅ No third-party network calls beyond the static asset host
- ✅ All state lives in `localStorage` (theme preference, sidebar expansion, view-mode, onboarding-dismissed flag)

See [`SECURITY.md`](./SECURITY.md) for the threat model and disclosure policy.

## License

MIT — see [`LICENSE`](./LICENSE).

Chromium docs themselves are BSD-3 licensed; we mirror with attribution.

## Inspired by

[memex-card-browser](https://github.com/suninrain086/memex-card-browser) — same
3-wall XSS approach, lazy graph chunk pattern, and Linear-inspired tokens.
