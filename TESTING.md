# TESTING.md — chromium-atlas v1.0

A QA & contributor guide that assumes **no source-code access** —
every step is copy-paste-able from a freshly cloned repo.

## 1. Environment setup

Requirements: Node.js ≥ 20, npm ≥ 10, a Chromium-based browser, a POSIX shell.

```bash
git clone <this-repo> chromium-atlas && cd chromium-atlas
npm ci                                         # installs Vite, Playwright, etc.
npx playwright install chromium                # one-time browser bootstrap
```

Build a production bundle backed by the checked-in mock corpus:

```bash
npm run test:build         # runs `DOCS_DIR=test/fixtures/docs vite build` + tsc check
npm run preview            # serves dist/ on http://127.0.0.1:4173
```

Open http://127.0.0.1:4173 in a Chromium-based browser. You should see the
"chromium-atlas" brand, a left-side folder tree of >25 top-level folders,
and an "All docs" home view.

## 2. Feature inventory

Every user-visible feature, how to reach it, and the expected result.

| Feature | How to trigger | Expected behavior |
|---|---|---|
| Folder tree | Click any folder name in the left sidebar | Folder expands; child folders + docs appear, indented one level |
| Folder navigation | Click a folder's *name* (not its chevron) | Main pane shows that folder's contents; URL updates to `#/folder/<path>` |
| Doc render | Click any doc in the sidebar or in a folder view | Markdown renders in main pane; right-rail TOC + back-links appear |
| Three view modes | In any folder view, click the segmented `≡ / ☰ / ▦` toggle in the header | Layout swaps between title-list / list / gallery with an 80ms fade |
| Per-folder mode persistence | Switch a folder's mode, navigate elsewhere, return | The chosen mode is restored (stored in `localStorage["atlas:viewmode"]`) |
| Search palette (Cmd+K) | Anywhere in the app, press <kbd>⌘K</kbd> or <kbd>Ctrl+K</kbd> | Modal palette opens; type to fuzzy-search titles+paths |
| Search palette (`/`) | Press <kbd>/</kbd> while not focused in a text field | Same modal opens |
| Palette navigation | <kbd>↑</kbd>/<kbd>↓</kbd> moves selection, <kbd>Enter</kbd> opens, <kbd>Esc</kbd> closes | Focus stays trapped on the input (<kbd>Tab</kbd> does NOT escape the modal) |
| Theme toggle | Click the sun/moon button in the top bar | UI flips light/dark; `<html data-theme>` flips; persisted in `localStorage["atlas:theme"]` |
| First-paint theme | Cold-load the page with browser dark-mode set | Page renders dark on first paint — no white flash |
| TOC scroll-spy | Open any doc with multiple H2/H3 headings, scroll the main pane | TOC entry on the right gets `.active` as its section enters the viewport |
| TOC click | Click any TOC entry | Smooth-scrolls the section to the top; URL gets `#<heading-id>` appended |
| Code copy | Hover a fenced code block, click "Copy" | Button morphs to "✓ Copied" for 1.5s; clipboard contains the code |
| Back-links | Open a doc that other docs reference | Right-rail "Referenced by" lists every linking doc as a clickable row |
| Hash router (deep load) | Cold-load `http://127.0.0.1:4173/#/doc/design/sandbox.md` | Doc renders directly; sidebar auto-expands ancestors |
| 404 | Navigate to `#/doc/does/not/exist.md` | "Page not found" branded empty-state with `Go home` link; sidebar still visible |
| Onboarding hint | Clear `localStorage["atlas:onboarded"]`, reload home | A one-line welcome strip appears above the header; clicking ✕ dismisses it for the session |
| Mobile drawer | Resize to <768px width; click ☰ in the top bar | Sidebar slides in as an overlay drawer; backdrop closes it |
| External link safety | Click any `http(s)://` link inside a doc body | Opens in a new tab (`target=_blank rel=noopener noreferrer`) |
| XSS hardening | Visit `#/doc/misc/orphan.md` (contains a `<script>` tag) | Script does NOT execute; tag is rendered as escaped text |

## 3. Automated tests

```bash
npm test                    # runs test:build + Playwright suite (8 P0 + responsive + onboarding + view-fade)
npm run test:ui             # opens Playwright UI runner for debugging
```

Tests live in `test/e2e/`. Coverage map:

| Spec | Outcomes covered |
|---|---|
| `smoke.spec.ts` | OUT-1, OUT-3, OUT-4, OUT-5 (partial), OUT-6 (404), security wall 1+2 |
| `responsive.spec.ts` | OUT-7 (320/375/768/1024/1440 widths, hamburger, no horizontal scroll) |
| `polish.spec.ts` | Onboarding hint dismiss + persistence; view-mode swap class flip |

## 4. Cleanup / reset between runs

```bash
rm -rf dist test-results playwright-report node_modules/.vite
# Browser-side state (run inside the dev tools console of the live app):
#   localStorage.clear();
```

To rebuild the mock fixtures from scratch (rare — the corpus is checked in):

```bash
node scripts/regenerate-mock-fixtures.mjs    # only if present
DOCS_DIR=test/fixtures/docs npm run scan      # writes public/{docs,tree,links}.json
```

## 5. Bundle budget verification

```bash
npm run test:build
ls -la dist/assets/*.js dist/assets/*.css
# Main chunk gzip must stay <200 KB. Current: ~16 KB main, ~98 KB total JS gzip.
for f in dist/assets/*.js dist/assets/*.css; do
  printf "%6d B gzip   %s\n" $(gzip -c "$f" | wc -c) "$f"
done
```

## 6. Out of scope for v1.0

- Real chromium git clone (mocks only).
- Graph view (`#/graph` route is a placeholder).
- Service worker / PWA / offline cache.
- Auth, pin, favorites, comments.
- These are deferred to v1.0.1 and v1.1+.
