# chromium-atlas

> A graph-aware, developer-friendly browser for the official
> [Chromium documentation](https://chromium.googlesource.com/chromium/src/+/main/docs/).

Browse 600+ chromium docs with a folder-tree sidebar, three reading layouts,
global search, dark/light mode, and a global relationship **graph view** —
plus (v1.1) personal pin / favorite / tag / like / follow.

**Status:** 🚧 v1.0 in development.

## Stack

- **Frontend:** Vite + Vanilla TypeScript, markdown-it + DOMPurify, Cytoscape.js + fcose, Fuse.js
- **Backend (v1.1+):** Supabase (Auth · Postgres · Realtime · Edge Functions)
- **Doc sync:** GitHub Actions hourly cron, sparse clone of chromium/src
- **Hosting:** Cloudflare Pages

See [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) for full scope and
[`DESIGN.md`](./DESIGN.md) + [`DESIGN.atlas.md`](./DESIGN.atlas.md) for visuals.

## Roadmap

- **v1.0** (no auth): sidebar · 3 view modes · search · light/dark · graph · TOC · back-links · code highlight · PWA · 1h sync
- **v1.1**: OAuth (GitHub/Google/Apple/Microsoft) · pin (max 20) · favorite · tags · like · follow + diff view · in-app + email notifications · frequent-docs view (exponential decay, half-life 28d)
- **v2+**: comments · AI Q&A · Mermaid · link-health report · RSS

## License

MIT — see [`LICENSE`](./LICENSE).

Chromium docs themselves are BSD-3 licensed; we mirror with attribution.

## Inspired by

[memex-card-browser](https://github.com/suninrain086/memex-card-browser) — same
3-wall XSS approach, lazy graph chunk pattern, and Linear-inspired tokens.
