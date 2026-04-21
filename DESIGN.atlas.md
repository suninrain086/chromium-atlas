# DESIGN — chromium-atlas additions

> Inherits the full **Linear-inspired** design system from `DESIGN.md` (copied
> from memex-card-browser). This file documents the deltas specific to
> chromium-atlas — sidebar, three view modes, TOC, back-links panel, and graph.
>
> When in doubt, refer to `DESIGN.md` for tokens, typography, motion, and
> component primitives.

---

## A. Layout

### Three-pane responsive layout (desktop, ≥1024px)

```
┌───────────────────────────────────────────────────────────────────┐
│  Top bar:  logo · search (Cmd+K) · theme toggle · login (v1.1)    │
├──────────────┬───────────────────────────────────┬────────────────┤
│              │                                   │                │
│  Sidebar     │    Main view                      │  TOC / Back-   │
│  (folder     │    (title list / list / gallery   │  links         │
│   tree)      │     / doc detail / graph)         │  (doc detail   │
│              │                                   │   only)        │
│  240px       │    fluid                          │  240px         │
│              │                                   │                │
└──────────────┴───────────────────────────────────┴────────────────┘
```

### Tablet (768–1023px)
- Sidebar collapses to icon-only rail (44px); click expands as overlay
- TOC moves to a floating "On this page" button → drawer

### Mobile (≤767px)
- Sidebar = full-screen drawer triggered by hamburger
- TOC = bottom sheet
- Three view modes available; default to **title list** (most info-dense for narrow screens)

---

## B. Sidebar (folder tree)

### Visuals
- Background: `var(--panel)` (`#0f1011` dark / `#f3f4f5` light)
- Right border: `var(--border-subtle)`
- Indent per depth level: `12px`
- Folder icon: chevron `▸` collapsed / `▾` expanded
- Doc leaf: small dot `·` (no icon clutter)

### Typography
- Folders: Inter 13px / weight 510 / `var(--text-secondary)`
- Active folder/doc: weight 510 / `var(--accent)` (Linear violet `#7170ff`)
- Counts (e.g. "accessibility (9)"): Inter 11px / weight 400 / `var(--text-quaternary)`

### States
- Default: `var(--text-secondary)`
- Hover: `var(--text-primary)` + bg `rgba(255,255,255,0.02)`
- Active (current): bg `rgba(113,112,255,0.08)` + left accent bar (2px × `var(--accent)`)

### Behavior
- Folder click toggles expand
- Doc click navigates to `#/doc/<path>`
- Folder name click also navigates to `#/folder/<path>` (shows folder contents in main view)
- Keyboard: `↑/↓` traverse, `→` expand, `←` collapse, `Enter` open
- State persists in `localStorage` (`atlas:sidebar:expanded`)

---

## C. Three View Modes (folder contents)

### Mode toggle (top-right of main view)
Three icon buttons in a segmented control:

```
  [ ☰ Title  |  ▤ List  |  ▦ Gallery ]
```

- Default: **Title list** (matches official Gitiles look)
- User preference persists per-folder in `localStorage`

### C1. Title list (default)
- One row per doc; rendered as `<ul>`
- Each row: `[•] [doc-title (link)] — [first-line description]`
- Description: first non-heading paragraph, truncated at 120 chars, `var(--text-tertiary)`
- Row height: 28px; tight padding (4px vertical)
- Spacing matches official chromium docs page exactly so users feel at home

### C2. List (single-column cards)
- Full-width cards stacked vertically
- Each card: title (h3 / 18px / 510), 2-line summary, meta row (path · last-modified · 3 tags max)
- Hover: bg lift to `var(--surface)`, subtle shadow
- Card height: ~96px

### C3. Gallery (grid cards)
- Auto-fit columns, `minmax(280px, 1fr)`
- Same content as C2 but in a card; emphasizes title
- Cytoscape thumbnail (mini-graph of doc's local neighborhood) optional in future

---

## D. Doc Detail View

### Layout (with TOC + back-links visible)

```
┌────────────────────────────────────────────────────────────────┐
│  Breadcrumb: docs / accessibility / overview.md  [edit on GH]  │
├────────────────────────────────────────────┬───────────────────┤
│                                            │  ON THIS PAGE     │
│  # Doc Title                               │  · Section 1      │
│                                            │  · Section 2      │
│  Body content...                           │     · Subsection  │
│                                            │  · Section 3      │
│                                            │                   │
│  ```cpp                                    │  ─────────────    │
│  code with highlight + [copy] button       │  REFERENCED BY    │
│  ```                                       │  · doc A          │
│                                            │  · doc B          │
│                                            │  · doc C          │
└────────────────────────────────────────────┴───────────────────┘
```

### Markdown rendering
- Body max-width: `680px` (Linear's reading width)
- Font: Inter 16px / 1.6 line-height
- Headings: h1 32px, h2 24px, h3 18px (all weight 510, negative letter-spacing per DESIGN.md)
- Links: `var(--accent)`, underline on hover, dotted underline if cross-doc
- Inline code: bg `rgba(255,255,255,0.06)`, mono 14px, padding `2px 6px`, radius 4px
- Code block: bg `var(--code-bg)` (`#08090a` dark / `#f7f8f8` light), padding 16px, radius 8px, border `var(--border-subtle)`

### Code blocks
- Language badge top-right (lowercase, mono 11px, `var(--text-quaternary)`)
- Copy button top-right on hover; uses Lucide `copy` icon → `check` on success
- Syntax highlighting via highlight.js (or shiki); theme matches our palette

### TOC right panel
- Sticky, `top: 24px`
- Heading "ON THIS PAGE" (mono 11px / 510 / `var(--text-quaternary)` / letter-spacing 0.08em)
- Items: 13px / 510 / `var(--text-secondary)`
- Active section (scroll-spy): `var(--accent)` + left bar 2px
- Auto-collapse h3+ to compact mode if total >12 items

### Back-links panel
- Below TOC
- Heading "REFERENCED BY" (same style as TOC heading)
- Items: doc title + folder hint
- "+N more" if >5; click expands

---

## E. Graph View (`#/graph`)

### Inherits MCB's graph patterns
- Cytoscape + fcose, lazy-loaded chunk
- Theme switch via `cy.style().fromJson().update()` to preserve layout/zoom/pan/selection

### chromium-atlas-specific
- **Folder color coding**: nodes inherit a hue derived from their top-level folder (deterministic hash → HSL with controlled saturation/lightness)
- **Node label** above 0.6 zoom only (avoid overlap)
- **Edge weight**: thicker if both directions (mutual reference)
- **Filters**: top-bar checkboxes per top-level folder (accessibility, build, design, ...) — toggle visibility
- **"Focus mode"**: click node + `f` → fade non-neighbors to 15% opacity
- **Mini-map**: bottom-right (Cytoscape's `cytoscape-navigator` extension if size permits)

---

## F. Search Palette (Cmd/Ctrl+K)

- Modal centered, max-width 640px
- Same tokens as DESIGN.md `palette` component
- Result groups: "Docs", "Folders", "(v1.1) Tags"
- Keyboard: `↑/↓` navigate, `Enter` open, `Esc` close, `Tab` toggle group

---

## G. v1.1 Account UI additions

### Pin strip (home top)
- Horizontal strip of up to 20 pinned doc tiles
- Drag-reorder
- "+" placeholder when <20

### Like / Favorite buttons
- Inline on doc detail header
- `♥` favorite (private), `👍` like (public count visible to all)

### Tag chips
- Below doc title
- User-defined; click filters home to that tag
- Add via "+" → input

### Notification center
- Bell icon top-right, badge count
- Drawer with list: doc updated / moved / deleted
- Mark all read / per-item dismiss

---

## H. Iconography

Use **Lucide** (free, open-source, MIT) for all icons. Stroke 1.5px.
Common: `chevron-right`, `chevron-down`, `search`, `sun`, `moon`, `pin`, `heart`,
`thumbs-up`, `bell`, `tag`, `copy`, `check`, `network` (graph icon), `list`,
`layout-grid`, `align-justify`.

---

## I. Motion

- Respect `prefers-reduced-motion`
- Default transitions: 150ms cubic-bezier(0.4, 0, 0.2, 1)
- View-mode switch: 80ms fade only (no slide — avoid jank on long lists)
- Sidebar expand: 200ms ease-out
- Graph node hover: 100ms scale 1.0 → 1.1

---

_For everything else, defer to `DESIGN.md`._
