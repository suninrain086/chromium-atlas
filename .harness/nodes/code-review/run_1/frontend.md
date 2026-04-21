# Code review · Frontend

Independent UX-and-DOM review. Focus: rendering correctness, accessibility,
keyboard interaction, and DOM-level pitfalls. I exercised the built `dist/` via
`vite preview` and clicked through every fixture folder.

## What I checked

1. Sidebar tree expansion + persistence
2. Three view-mode toggle (titles / list / gallery) per folder
3. Doc render: TOC, copy buttons, back-links, anchor links
4. Cmd+K palette: open, type, arrow nav, Enter, Esc
5. Theme toggle: round-trip, FOUC check, prefers-color-scheme
6. Hash routing: deep-link reload, browser back/forward

## Findings

### 🟡 F1 — Palette has no focus trap; Tab escapes the dialog

**File:** `src/components/palette.ts:64-85`

The palette's keydown handler intercepts ArrowUp/Down/Enter/Esc but **not Tab**.
discuss/decision.md and `round-1-engineer.md` both call out a focus trap as a
requirement (memex-card-browser had one — see
`~/projects/memex-card-browser/src/components/palette.ts` for the pattern).

**Repro:** Open palette with Cmd+K, press Tab. Focus jumps to the doc body
behind the overlay; arrow keys still work but screen-reader users lose the
combobox context.

**Reasoning:** The palette is `role="dialog" aria-modal="true"`
(`src/components/palette.ts:34-35`); WAI-ARIA APG mandates focus containment for
modal dialogs. Without it, AT users can land on inert content and be confused.

**Fix:** In the keydown handler at `src/components/palette.ts:65`, add:
```ts
} else if (e.key === "Tab") {
  e.preventDefault();   // only one focusable element, just keep focus
}
```
(or implement a real trap if results become tabbable in v1.1).

### 🟡 F2 — `/` global shortcut promised but not bound

**File:** `src/components/palette.ts` (entire file) + `src/main.ts`

`engineer.md` claims "Cmd/Ctrl+K + `/` global shortcut", but I see no `/`
handler in either `src/components/palette.ts` or `src/main.ts:1-174`. Cmd+K
works, `/` does not (typing `/` in the body just inserts the character).

**Reasoning:** Spec drift; cheap to fix; commonly expected by docs-site users
(GitHub, MDN, Vercel docs all use `/`).

**Fix:** In `src/main.ts` keydown handler, add a branch: if
`e.key === "/" && !isPaletteOpen() && !isEditableTarget(e.target)` →
`openPalette()`.

### 🟢 F3 — Doc copy-button UX is correct

**File:** `src/views/doc.ts:81-98`

Copy button hides language label collision via `.has-lang` class
(`src/views/doc.ts:75`), uses `navigator.clipboard.writeText`, swaps to
"✓ Copied" with `setTimeout(..., 1500)` revert (`:90-93`), and announces failure
gracefully (`:93-95`). Good defensive coding.

### 🟢 F4 — TOC scroll-spy + smooth scroll cooperate correctly

**File:** `src/views/doc.ts:101-156, 158-173`

The `suppressed` flag (`src/views/doc.ts:112,115,148-152`) prevents the
IntersectionObserver from fighting the programmatic smooth-scroll when the user
clicks a TOC link. 450 ms suppression window matches typical CSS smooth-scroll
duration on macOS. Verified: clicking TOC items in
`test/fixtures/docs/design/site-isolation.md` doesn't cause active-link flicker.

### 🟢 F5 — Theme bootstrap avoids FOUC

**File:** `index.html` (pre-paint script) + `src/store.ts:25-36`

Theme is set on `document.documentElement.dataset.theme` *before* CSS loads
(verified by adding a 500ms artificial delay to `app.css` and reloading — no
flash). `setTheme()` (`src/store.ts:73-79`) dispatches `themechange` so any
listener can react.

### 🟢 F6 — Keyboard navigation in palette correct

**File:** `src/components/palette.ts:65-85`

ArrowUp/Down clamp at boundaries (`Math.min/Math.max`, `:68,72`); Enter
uses `encodeURI(r.path)` (`:79`) which preserves `/` in nested paths but
escapes spaces. Escape closes cleanly. `requestAnimationFrame(() => input.focus())`
(`:104`) avoids a race with the overlay insertion.

### 🟡 F7 — Active result not auto-scrolled in long lists

**File:** `src/components/palette.ts:127-129`

`scrollIntoView({ block: "nearest" })` is called after innerHTML rewrite
(`:128-129`), which works on first arrow press. But if the user holds ArrowDown,
intermediate active states never scroll because innerHTML rebuild moves DOM and
focus stays on the input — only the final keyup paints. Minor; below 20 results
this never matters.

**Fix:** Optional. If addressed, debounce or just call `scrollIntoView` on a
`queueMicrotask`.

## Accessibility quick-pass

- `role="combobox"` on inner palette (`src/components/palette.ts:37`) ✓
- `role="listbox"` + `role="option" aria-selected` on results (`:40,122`) ✓
- `aria-modal="true"` on overlay (`:35`) ✓
- Sidebar uses semantic `<button>` for folder rows (verified in
  `src/components/sidebar.ts`) ✓
- Doc body has no skip-link to TOC, but TOC is in DOM order after main content,
  so AT users can reach it; deferring to a11y audit node.

## Verdict: ITERATE

Two 🟡 findings (F1 focus trap, F2 missing `/` shortcut). Both small, both
contract-drift relative to engineer.md's own claims.
