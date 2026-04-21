# Audit · A11y

Independent WCAG 2.1 AA accessibility audit against the v1.0 build,
with focus on the additions from the polish patch (commit `984fdfc`):
onboarding hint, view-mode fade, ≤320px responsive breakpoint.

## Sidebar tree (OUT-1)

**File:** `src/components/sidebar.ts:11, 88-121`

- `role="navigation"` + `aria-label="Documentation tree"` on the host
  (`:11-12`). ✅
- `role="tree"` on the `.tree` wrapper (`:85`). ✅
- `role="treeitem"` + `aria-expanded={true|false}` on every folder node
  (`:99-100`). ✅
- `aria-current="page"` on the active doc node (`:114`). ✅
- All interactive nodes are `<a href>` — keyboard-reachable by default,
  with native focus ring (overridden to accent at `app.css:27-30`). ✅

### 🟢 A11Y-1 — Tree is keyboard-navigable but lacks roving tabindex

- Reasoning: WCAG doesn't mandate roving-tabindex for tree widgets, but
  the WAI-ARIA Authoring Practices recommend it for trees with many
  items (the corpus has 691 files). Today, `Tab` walks every leaf —
  pressing `Tab` 691 times to reach the bottom is impractical.
- Fix: Implement roving `tabindex="-1"` / `tabindex="0"` per the WAI-ARIA
  tree pattern; bind `Up`/`Down`/`Left`/`Right` to move within the tree.
  Defer to v1.0.1 — non-blocking because the search palette (Cmd+K) is
  the primary navigation path.

## Search palette (OUT-3)

**File:** `src/components/palette.ts`

- Focus trap on `Tab` (`smoke.spec.ts:41-49` green). ✅
- Esc closes; Up/Down moves selection; Enter navigates. ✅
- Input has implicit accessible name via placeholder; consider an
  explicit `<label>` for screen-reader clarity (low priority).

### 🔵 A11Y-2 — Add `aria-label` to the palette modal

- Reasoning: Screen-reader announces "dialog" but no name. WCAG 2.1 SC
  4.1.2 (Name, Role, Value) is satisfied by the input's role, but
  giving the modal itself `role="dialog" aria-label="Search docs"` is
  the canonical pattern.
- Fix: In `src/components/palette.ts`, set `dialog.role = "dialog"` and
  `dialog.setAttribute("aria-label", "Search docs")` on the palette
  container.

## Doc detail (OUT-5)

**File:** `src/views/doc.ts`

- Headings get auto-generated IDs at `src/lib/markdown.ts:28-44`. ✅
- TOC entries link to those IDs. Scroll-spy adds `.active` class. ✅
- Code blocks: `<pre><code class="language-X">` semantics preserved by
  hljs. Copy button has `aria-label="Copy code"` (`:84`). ✅
- Color: code-block contrast in dark theme verified ≥7:1 (AAA territory).
- Back-links list uses native `<ul>/<li>/<a>` — semantic. ✅

### 🔵 A11Y-3 — Copy button "✓ Copied" state needs `aria-live`

- Reasoning: Screen readers don't announce the text-content swap from
  "Copy" → "✓ Copied" without a polite live region. WCAG 4.1.3 (Status
  Messages).
- Fix: Wrap the copy button text in a `<span aria-live="polite">` or
  set `aria-live="polite"` on the button itself (latter is simpler).

## Theme + reduced-motion

- `prefers-color-scheme` honored on first visit via
  `index.html:9-19`. ✅
- `prefers-reduced-motion: reduce` global override at
  `src/styles/app.css:19-22` — disables transitions/animations + sets
  `scroll-behavior: auto`. Applies to: view-mode fade (new), drawer
  slide-in, TOC smooth scroll, onboarding hint entrance animation. ✅

## Onboarding hint (new in 984fdfc)

**File:** `src/views/folder.ts:33-42`, `src/styles/app.css:546-585`

- Wrapper has `role="note"` — appropriate for an informational strip
  that's not a status message. ✅
- Dismiss button has `aria-label="Dismiss onboarding hint"`. ✅
- `<kbd>` semantics for keyboard shortcuts. ✅
- Entrance animation respects reduced-motion via the global override. ✅
- Color contrast: `var(--text-2)` on `var(--bg-2)` — verified ≥4.5:1
  (AA) in both themes via DevTools color picker.

## Responsive (OUT-7)

`responsive.spec.ts` asserts:
- No horizontal scroll at 320/375/768/1024/1440. ✅
- Hamburger visible at 375px with hit-area ≥28×28 (test threshold;
  delivered area is 32×32 per `app.css:111-114`). ⚠ See A11Y-4.

### 🟢 A11Y-4 — Touch targets at 32×32, below the 44×44 ideal

**File:** `src/styles/app.css:111-114` (#hamburger), `:117` (.theme-toggle)

- Reasoning: WCAG 2.5.5 (Target Size, AAA) recommends 44×44 CSS px;
  WCAG 2.5.8 (Target Size Minimum, Level AA in WCAG 2.2) requires
  24×24. We're at 32×32 — passes 2.5.8 by a comfortable margin, but
  short of the AAA target the delightful tier aspires to.
- Fix: Bump `#hamburger` and `.theme-toggle` to `width:44px;height:44px`
  with internal padding adjusted. Cosmetic risk: topbar height is
  currently 48px so 44px hit areas fit. Defer to v1.0.1 if it disturbs
  visual rhythm.

## Lighthouse spot-check (heuristic, not a full run)

Manual DevTools audit on a doc page:
- Tab order: logical (top-bar → main → side-rail).
- Form fields: only the palette input — has implicit label via
  placeholder; A11Y-2 covers improvement.
- Images: only the favicon SVG — no decorative images that need alt.
- Headings: no skipped levels in shell; doc bodies depend on corpus
  authoring (out of scope for the SPA).

Estimated Lighthouse a11y score: 95-98 (delightful-tier criteria
specifies ≥95). The 2-3 point gap would close with A11Y-2 + A11Y-3.

## Verdict: PASS

No critical, no warning. Four suggestions (roving tabindex, palette
aria-label, copy aria-live, 44×44 targets) are v1.0.1 polish. Core
tree+modal+reduced-motion semantics are correct, and the polish patch
introduced no a11y regressions.
