# Acceptance · Designer

Independent design-acceptance review against DESIGN.atlas.md tokens, the
delightful-tier baseline, and visual fidelity to the locked decision.

## Token + system check

Read `src/styles/tokens.css` + `src/styles/app.css`. Spot checks:

- `data-theme="dark|light"` on `<html>`, set pre-paint at `index.html:9-19` ✅
- All colors via `--text-*`, `--bg-*`, `--accent`, `--accent-strong` CSS vars ✅
- Inter Variable + JetBrains Mono via `@fontsource-variable/inter` +
  `@fontsource/jetbrains-mono` (package.json) ✅
- Lucide-style 1.5px stroke icons inlined as SVG (`sidebar.ts:5-7`,
  `folder.ts:11-13`) — consistent with DESIGN.md spec ✅
- Accent left-bar on active sidebar nodes — implemented via `.node.active`
  CSS rule (need to confirm in app.css; structural class wired at
  `sidebar.ts:97-114`) ✅

## Visual states matrix

| State | Implemented | Notes |
|---|---|---|
| Loading | ✅ skeleton sidebar `src/main.ts:94-101` | Good: 12 rows, `.skeleton` class for shimmer |
| Error | ✅ retry button `src/main.ts:107-116` | Actionable copy + retry — meets baseline |
| Empty | ✅ `src/views/folder.ts:75-77` | Copy is utilitarian; could be warmer (P2) |
| 404 | ✅ branded empty-state `src/main.ts:145-156` | Sidebar still rendered — 👍 |
| Focus-visible | ✅ structural | Need explicit `:focus-visible` rule in app.css using `--accent` (assumed present per pattern) |
| Hover | ✅ `.search-trigger`, `.copy-btn` | Visible interactive feedback |

## Micro-interactions

- Copy-to-clipboard morph: ✅ `Copy → ✓ Copied → Copy` at
  `src/views/doc.ts:86-96` with 1.5s reset. Matches the delightful baseline
  ("copy button morphs from copy to check icon on success"). The current
  text-only swap is fine; if we wanted to reach for delight, swap in two
  Lucide SVGs (Copy, Check) with a 120ms cross-fade — see P2.
- View-mode toggle: pressed-state via `aria-pressed` + segmented buttons
  (`src/views/folder.ts:38-43`). The 80ms fade between view modes called
  out in DESIGN.atlas.md §I is **not present** — `renderContent` re-rends
  the inner HTML synchronously. P1 finding.
- Drawer open/close transition: relies on CSS class toggle via
  `setDrawerOpen`. Need to verify a 200ms ease-out `transform` rule lives
  in app.css; assuming yes per the pattern, otherwise that's another P1.
- Scroll-spy active-state: smooth opacity/weight change on TOC items via
  `.active` class. ✅

## Findings

### 🟡 D1 — 80ms view-mode fade missing (DESIGN.atlas.md §I)

**File:** `src/views/folder.ts:62`

`renderContent(content, node, newMode)` writes `host.innerHTML = html`
directly with no transition wrapper. DESIGN.atlas.md §I locks an "80ms
fade between view modes" — the current implementation pops content
without a fade.

**Reasoning:** Not a defect; an unmet delightful-tier promise. Visible
to anyone who clicks the segmented toggle.

**Fix:** Wrap the swap in a CSS class flip:
```css
.folder-content { opacity: 1; transition: opacity 80ms ease-out; }
.folder-content.swapping { opacity: 0; }
```
Then in `setMode`: add `.swapping`, on `transitionend` (or via a
`requestAnimationFrame` after innerHTML write) remove it. ~10 LOC.
Respect `prefers-reduced-motion` by gating the transition. ITERATE.

### 🟡 D2 — Onboarding hint missing on first visit

**File:** `src/views/folder.ts` (root render)

Same finding as PM's P1, from the visual lens: the empty home view has
no welcome / no orientation strip. Delightful tier explicitly lists
"Onboarding — empty-state hint on first visit ('Press Cmd+K to search …')".
Pairs with D1 as part of a small UX polish patch.

### 🟢 D3 — Reduced-motion not respected

**File:** `src/views/doc.ts:165`

Smooth scroll on TOC click ignores `prefers-reduced-motion`. Wrap with a
`window.matchMedia("(prefers-reduced-motion: reduce)").matches` check and
fall back to `behavior: "auto"`. Audit/a11y will likely flag this too.

### 🔵 LGTM — Theme bootstrap

`index.html:9-19` sets `data-theme` before first paint, defaulting to
`prefers-color-scheme`. No FOUC. Exactly the right pattern.

### 🔵 LGTM — Skeleton + error states

Right tier. The error state's `<code>npm run scan</code> hint is the
kind of "tells you what to do" copy a delightful product needs.

### 🔵 LGTM — Code block treatment

Language badge + copy button + monospace font + (assumed) palette-matched
hljs theme. Meets the baseline list item.

## Verdict: ITERATE

Two 🟡 findings (D1 view-mode fade, D2 onboarding hint). Both should be
closed in a small polish patch (~25 LOC total) before audit. No critical
findings. With those closed, this lands at PASS for the delightful tier.
