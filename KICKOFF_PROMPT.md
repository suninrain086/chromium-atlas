# chromium-atlas v1.0 — autonomous build kickoff

Hi Claude. You are the lead engineer for **chromium-atlas**, a graph-aware browser
for chromium docs. Your job is to build the **v1.0 "visible slice"** end-to-end
under the OPC full-stack flow (delightful tier), within a 6-hour wall-clock budget.

## Required reading (do this FIRST, in order)

1. `PROJECT_BRIEF.md` — full v1.0 / v1.1 / v2 scope, acceptance criteria, decisions
2. `DESIGN.md` — Linear-inspired tokens (inherited from memex-card-browser)
3. `DESIGN.atlas.md` — chromium-atlas-specific layout (sidebar, 3 view modes, TOC, back-links, graph)
4. The reference project at `~/projects/memex-card-browser/` — same stack, proven patterns. Reuse:
   - Vite + vanilla TS template
   - markdown-it + DOMPurify + CSP 3-wall XSS pattern
   - Per-slug LRU markdown render cache
   - Cytoscape lazy chunk + `cy.style().fromJson().update()` theme switch (graph view is OUT for this slice but keep the door open)
   - Hash router style
   - Playwright e2e setup pattern

## v1.0 "visible slice" scope (this build)

**Ship only these features** — Graph view, real GH Actions sync, and PWA are explicitly deferred to v1.0.1:

1. **Folder-tree sidebar** mirroring `docs/` structure — collapsible, current folder/doc highlighted, persists expanded state in localStorage
2. **Three view modes** for current folder: **title list** (default — mirrors official Gitiles), **list** (single-column cards), **gallery** (grid cards). Toggle persists per-folder.
3. **Cmd/Ctrl+K search palette** — fuzzy search over titles + paths via Fuse.js. <50ms for 50+ docs.
4. **Light / Dark mode toggle** — CSS variables, persists in localStorage, defaults to `prefers-color-scheme`.
5. **Doc detail view** — markdown render with:
   - Right-side TOC (auto from h2/h3, scroll-spy)
   - Back-links panel ("Referenced by")
   - Code blocks: language badge + copy button + syntax highlight (highlight.js or shiki)
   - Breadcrumb navigation
6. **URL permalinks** — hash routes `#/`, `#/folder/<path>`, `#/doc/<path>`. Cold-load any permalink works.
7. **Mobile responsive** — sidebar drawer ≤768px, touch targets ≥44px. (Service worker / PWA NOT required this round.)

## Data source — mock fixtures (NO real chromium clone this round)

Generate **~50 mock chromium-style docs** under `test/fixtures/docs/` mirroring real chromium docs/ folder structure:

```
test/fixtures/docs/
  README.md
  accessibility/
    overview.md
    tests.md
    chromevox_on_chrome_os.md
    ... (~9 files matching the real "Accessibility" page jacky shared)
  build/
    overview.md
    gn_check.md
    ...
  design/
    ...
  linux/
    sandboxing.md
    ...
  mac/
    ...
  testing/
    ...
  windows/
    ...
```

Each fixture should have:
- realistic h1 title (first line)
- 1-2 paragraph description (used by title-list view)
- 2-4 sections (h2/h3) with placeholder body text
- relative markdown links to other fixture docs (this seeds the back-links panel)
- 1-2 code blocks in plausible languages (cpp, python, gn, sh)

A build-time scanner (similar to MCB's `scripts/scan-cards.ts`) should produce:
- `public/docs.json` — flat list with `{path, title, description, headings, outgoing_links}`
- `public/tree.json` — folder hierarchy
- `public/links.json` — incoming/outgoing edge map (for back-links panel)

Configurable via `DOCS_DIR` env var (defaults to `test/fixtures/docs`).

## Tech stack — locked

- **Vite + Vanilla TypeScript** (no framework)
- **markdown-it** + **DOMPurify** + CSP meta (3 walls XSS)
- **Fuse.js** for search
- **highlight.js** OR **shiki** for code (you choose; weigh bundle size)
- **Lucide** icons (stroke 1.5px)
- **CSS variables** for theming, Inter Variable + JetBrains Mono fonts
- **Hash router** (no SPA framework router)
- **Playwright** for e2e

## OPC flow

You are running under `opc-harness` full-stack, delightful tier. The flow:

```
discuss → build → code-review → test-design → test-execute → gate-test
       → acceptance → gate-acceptance → audit → gate-audit
       → e2e-user → gate-e2e → post-launch-sim → gate-final
```

Use `opc-harness status` to check current node. Use `opc-harness synthesize` after each review/gate node. **Never grade your own work** — gates compute verdicts mechanically from independent reviewer artifacts.

If a gate FAILs, you may iterate up to **10 times per gate**; track this in your own notes. If you hit 10 retries on one gate, write `BLOCKED.md` at repo root with the reason and stop.

## Hard constraints

1. **6-hour wall-clock budget.** Started at: (will be set when you start). If you're past 5h30 and not at `gate-final`, write `TIMEOUT_PARTIAL.md` documenting what shipped and stop cleanly.
2. **Never push to GitHub.** Commit to local `main` freely (use conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`). jacky reviews and pushes manually.
3. **No backend.** Static site only. Anything requiring a server is v1.1.
4. **Mock data only.** No real chromium git clone, no GitHub Actions.
5. **Sanitize all rendered HTML** — DOMPurify after markdown-it, with `html: false` upstream.
6. **Bundle budget:** main chunk ≤ 200 KB gzipped.

## Emit progress reports

Every meaningful milestone (or whenever you complete a node), emit:

```
=== PROGRESS REPORT ===
Time: <YYYY-MM-DD HH:MM>
OPC node: <current_node>
What I just did: <one paragraph>
What's next: <one paragraph>
Files touched: <count>
Tests: <pass/fail counts>
Bundle size: <main / total>
=== END REPORT ===
```

These get scraped by a 30-min cron and posted to Discord, so jacky knows you're alive.

## Definition of done

- All 7 v1.0 features above work end-to-end on `npm run dev` and `npm run preview`
- `npm test` (Playwright) all green
- `npm run build` succeeds; bundle within budget
- `README.md` updated with quickstart
- All commits on local `main`
- `gate-final` reached with PASS verdict
- A `RELEASE_NOTES_v1.0.md` written with screenshots references

## When you're confused

- Re-read `PROJECT_BRIEF.md` and `DESIGN.atlas.md`
- Look at how memex-card-browser solved the analogous problem (`~/projects/memex-card-browser/src/`)
- If genuinely stuck: write a `QUESTION.md` at repo root with specifics, commit it, and continue with your best guess. jacky will read it on next checkpoint.

Now start. First step: run `/init` to create CLAUDE.md, then read the three spec files, then advance the OPC harness through `discuss`.
