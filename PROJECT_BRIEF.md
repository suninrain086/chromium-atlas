# chromium-atlas — Project Brief

> A graph-aware, developer-friendly browser for the official Chromium documentation
> at <https://chromium.googlesource.com/chromium/src/+/main/docs/>.
>
> Inspired by [memex-card-browser](https://github.com/suninrain086/memex-card-browser),
> rebuilt for a tree-structured doc corpus with cross-document links.

---

## 1. Vision

Chromium's `docs/` is a goldmine — 600+ markdown files covering everything from
accessibility internals to the build system. But the official Gitiles renderer is
flat: no graph view, no cross-doc relationships, no personalization, no search.

**chromium-atlas** turns it into a developer's home page: browse the folder tree
on the left, switch between three reading layouts on the right, see the global
relationship graph, and (post-v1) pin / favorite / tag / follow the docs you
actually use. Goal: become the place developers go _first_ when looking up
Chromium internals.

---

## 2. Users & Use Cases

**Primary:** Chromium contributors, browser-engine engineers, and platform
developers who frequently consult chromium docs.

**Top scenarios:**
1. "I need the doc on accessibility internals — let me search and open it."
2. "I'm reading the AX overview — what other docs reference it?" (back-links)
3. "I'm exploring the build system — show me everything related on a graph."
4. "These 5 docs are my daily reference — pin them." (v1.1)
5. "I follow the linux/sandboxing doc — notify me when it changes." (v1.1)

---

## 3. Scope

### v1.0 — MVP (no auth, all read-only)

| # | Feature | Notes |
|---|---|---|
| F1 | Folder-tree sidebar mirroring `docs/` structure | Collapsible; current folder highlighted |
| F2 | Three view modes for current folder | **Title list** (default, mirrors official Gitiles) / **List** (single-column cards) / **Gallery** (grid cards) |
| F3 | Global keyword search (Cmd/Ctrl+K palette) | Title + path + (lazy) body via Fuse.js |
| F4 | Light / Dark mode toggle | Persists in `localStorage`; defaults to `prefers-color-scheme` |
| F5 | Document detail view | Markdown render + syntax-highlighted code blocks + copy button |
| F6 | Right-side TOC (table of contents) panel | Auto-generated from `h2`/`h3`; sticky scroll-spy |
| F7 | **Back-links panel** | "Documents that reference this page" — graph's killer feature surfaced inline |
| F8 | **Graph view** (`/#graph`) | Cytoscape + fcose; click node = jump to doc; folder color-coded |
| F9 | URL permalink scheme | `/#/doc/<relative/path>` — shareable & SEO-friendly |
| F10 | Mobile responsive + PWA | Offline-capable for last-viewed docs |
| F11 | Hourly doc sync | GitHub Actions cron pulls chromium/src docs/, recomputes graph, pushes to CDN |
| F12 | Incremental graph algorithm | Only re-link changed files; cache by commit SHA |

### v1.1 — Accounts & Personalization

| # | Feature | Notes |
|---|---|---|
| A1 | OAuth login | GitHub / Google / Apple / Microsoft via Supabase Auth |
| A2 | **Pin** (max 20) | Sticky strip at top of home |
| A3 | **Favorite** (★) | One-click on any doc; "My Favorites" view |
| A4 | **Tags** (user-defined) | Tag any doc; filter by tag on home |
| A5 | **Like** (👍) | Public count visible to all |
| A6 | **Follow** | Notify on update / move / deletion |
| A7 | **Frequent docs** view | Exponential decay, half-life **28 days** |
| A8 | **Read marker** | Auto-mark visited; toggle "show unread only" |
| A9 | **Diff view** ("What's new") | Followed docs show inline diff since last view |
| A10 | In-app notifications (Realtime) + email digest | Resend free tier; daily/weekly digest preference |

### v2+ — Backlog

K. Comments / private notes per doc
L. AI summary + Q&A (per-doc embedding)
M. Mermaid / PlantUML rendering
N. Link-health report (dead links, orphan docs) — give back to chromium community
O. RSS / Atom feed of follow list

---

## 4. Tech Stack

### Frontend
- **Vite + Vanilla TypeScript** (proven by MCB; 5-route reader doesn't need a framework)
- **Hash router** (`#/`, `#/folder/<path>`, `#/doc/<path>`, `#/graph`)
- **markdown-it** + custom relative-link plugin + **DOMPurify** + CSP meta (3-wall XSS defense)
- **Cytoscape.js + fcose** (lazy-loaded chunk; `cy.style().fromJson().update()` for theme switch)
- **Fuse.js** for fuzzy search (titles + paths in v1.0; bodies in v1.1 if perf allows)
- **highlight.js** (or shiki) for code blocks; copy button on hover
- **Service Worker** for PWA / offline last-viewed
- **CSS variables** for light/dark theming (Linear-inspired tokens, see DESIGN.md)

### Backend (v1.1+)
- **Supabase Free Tier**
  - Auth (GitHub / Google / Apple / Microsoft via OIDC)
  - Postgres 500 MB (pin, favorite, tag, like, follow, doc_stats tables)
  - Realtime (notification push, no polling)
  - Edge Functions (cron triggers, email dispatch)
- **Resend free tier** (100 emails/day) for follow notifications

### Doc Sync Pipeline
- **GitHub Actions cron** every 1h
- Sparse clone: `git clone --filter=blob:none --sparse chromium/src` → `sparse-checkout set docs/`
- `git diff --name-only OLD..NEW` → list of changed files
- Recompute affected graph nodes/edges only (incremental)
- Output artifacts: `docs.json` (metadata + content hashes), `graph.json` (nodes + edges), `tree.json` (folder hierarchy)
- Push to **Cloudflare R2** (or repo `gh-pages` branch as bootstrap)
- Mirror full `docs/` to **`chromium-atlas-mirror`** repo for fallback + community PRs

### Hosting
- **Cloudflare Pages** for the Vite app (free, global CDN, git-push deploy, no cold start)
- Custom domain TBD (e.g. `chromium-atlas.dev`)

### Repo
- **`https://github.com/suninrain086/chromium-atlas`** — public, **MIT license**

---

## 5. Architecture Diagrams

### Data flow

```
┌────────────────────────────────────────────────────────────────────┐
│                      GitHub Actions (every 1h)                     │
│  sparse clone chromium/src docs/  →  diff  →  build artifacts      │
│        │                                                           │
│        ├─→ docs.json (per-doc metadata + body hash)                │
│        ├─→ graph.json (nodes + edges, incremental)                 │
│        └─→ tree.json (folder hierarchy)                            │
│                                                                    │
│        │   push                                                    │
│        ▼                                                           │
│   Cloudflare R2 / gh-pages                                         │
│        ▲                                                           │
│        │   fetch on app load + ETag check                          │
│        │                                                           │
│  ┌─────┴─────────────────────────────────────────────────────┐     │
│  │  chromium-atlas (Cloudflare Pages, static SPA)            │     │
│  │   sidebar ┃ list/gallery/title view ┃ TOC + back-links    │     │
│  │   graph view (Cytoscape, lazy)  ┃ search palette          │     │
│  └─────┬─────────────────────────────────────────────────────┘     │
│        │   v1.1+: REST + Realtime                                  │
│        ▼                                                           │
│   Supabase (Auth · Postgres · Realtime · Edge Fn)                  │
└────────────────────────────────────────────────────────────────────┘
```

### Frequent-doc score algorithm (Exponential Decay, half-life 28 days)

```
On every doc visit by user u:
  score' = score × 0.5 ^ (days_since_last_visit / 28) + 1
  last_visit = now()

SQL:
  UPDATE doc_stats
  SET score = score * power(0.5, EXTRACT(EPOCH FROM now() - last_visit) / 86400 / 28) + 1,
      last_visit = now()
  WHERE user_id = $1 AND doc_path = $2;

Frequent-docs view = SELECT * FROM doc_stats WHERE user_id = $1 ORDER BY score DESC LIMIT 20;
```

---

## 6. Acceptance Criteria

### v1.0 P0 (must have)
- [ ] Sidebar renders the full `docs/` tree, click expands/collapses, current folder highlighted
- [ ] Three view modes switch instantly with no full re-render flash
- [ ] Cmd/Ctrl+K opens search; <50ms result for 600+ docs
- [ ] Light/Dark toggle persists; respects `prefers-color-scheme` on first load
- [ ] Doc detail page renders all markdown features chromium docs use (tables, code, quotes, headings, lists, images)
- [ ] Code blocks have language highlight + copy-to-clipboard button
- [ ] TOC right panel auto-generates from headings; click scrolls; scroll-spy highlights current section
- [ ] Back-links panel shows incoming references; click navigates
- [ ] Graph view loads on demand (route `#/graph`); ≥600 nodes don't freeze the UI; click node navigates
- [ ] Permalink `/#/doc/path/to/file.md` directly opens that doc on cold load
- [ ] Mobile breakpoint (≤768px): sidebar collapses to drawer; touch-friendly hit targets ≥44px
- [ ] PWA manifest + service worker; previously visited docs viewable offline
- [ ] GitHub Actions sync runs hourly, succeeds without manual intervention for ≥7 consecutive days
- [ ] Incremental graph rebuild: 1-file change triggers <5s rebuild (vs full rebuild ~30s)

### v1.0 P1 (should have)
- [ ] Loading skeletons (no layout shift)
- [ ] Empty/error states with action ("retry", "report on GitHub")
- [ ] Keyboard navigation: `↑/↓` in lists, `Enter` to open, `Esc` to close panels
- [ ] Bundle: main chunk ≤ 200 KB gzip, graph chunk lazy
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95

### v1.0 P2 (nice to have)
- [ ] Reading time estimate per doc
- [ ] "Random doc" button for serendipity
- [ ] Print stylesheet for clean PDF export

---

## 7. Non-functional Requirements

- **Performance:** First contentful paint <1s on cable, <3s on 3G; Cytoscape graph <500ms to render (cached layout)
- **Accessibility:** WCAG 2.1 AA; full keyboard navigation; screen-reader-friendly headings/landmarks
- **Security:** CSP `default-src 'self'`; markdown sanitized; no inline event handlers; OAuth tokens never in localStorage (Supabase handles this)
- **Privacy:** v1.0 no telemetry; v1.1 user actions stored only with consent; export-my-data endpoint
- **Cost:** $0/month operating cost across Cloudflare Pages + R2 free tier + Supabase free tier + GH Actions free tier (public repo)
- **Open source:** MIT license; CONTRIBUTING.md; conventional commits; semantic versioning

---

## 8. Out of Scope

- Editing docs (read-only by design; edits go through Gerrit upstream)
- Comments/discussion in v1.x (deferred to v2)
- Multi-language (English only confirmed)
- Native apps (PWA covers mobile)
- Downloading entire docs/ as a bundle (sparse clone is the supported route)

---

## 9. Open Decisions Locked

| # | Decision | Rationale |
|---|---|---|
| 1 | Backend: Supabase free tier | Auth + DB + Realtime + Functions in one; $0 |
| 2 | Doc source: Sparse git clone (A) + mirror repo (C) as fallback | Native diff; community PR entry point |
| 3 | MVP first (no auth); accounts in v1.1 | De-risk; deliver value sooner |
| 4 | Hosting: Cloudflare Pages | Free, no cold start, git-push deploy |
| 5 | Open source: yes, MIT | Invite chromium contributor PRs |
| 6 | Pin cap: 20 | Tunable post-launch |
| 7 | Notifications: in-app + email (no push API) | Email via Resend free tier |
| 8 | Frequent algorithm: Exponential decay, **half-life 28 days** | Storage-cheap, smooth, fits dev-doc lifecycle |
| 9 | Language: English only | |
| 10 | Project name: **chromium-atlas** | "Atlas" = map collection, fits the graph metaphor |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Chromium `docs/` uses non-standard markdown (Gitiles flavor) | Audit early; add custom md-it plugins as needed; mirror Gitiles tests |
| 600+ nodes in graph view chokes mobile | Folder-level filtering; auto-collapse subgraphs; "show neighbors only" mode |
| GH Actions free tier limit (2000 min/mo private; unlimited public) | We're public — no concern |
| Supabase 7-day inactivity pause | Public project will stay active; uptime-bot ping if needed |
| Some chromium docs have absolute Gitiles links | Rewrite at sync time to internal `#/doc/...` |
| OAuth provider misconfig (Apple esp.) | Ship GitHub-only at v1.1.0; add others incrementally |

---

_Project kickoff: April 21, 2026 — drafted by Jingwei (jingwei@hermes) for jacky._
