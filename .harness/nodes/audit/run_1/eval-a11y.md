# Audit run_1 — Accessibility review (v1.0.2)

Independent a11y review of the v1.0.2 delta against WCAG 2.1 AA + the
v1.0.1 baseline (which already covers aria-pressed, role=radiogroup,
44×44 hit areas, focus styles, prefers-reduced-motion, palette aria-live).

## v1.0.2 delta surface
- Single new UI element: `#sync-health` informational indicator in header
- All other v1.0.2 work is server-side (sync script, GH Actions, scan flag)

## WCAG 2.1 AA scan on `#sync-health`

### Perceivable
- ✅ 1.1.1 Non-text content: indicator is text-only (`Synced N minutes ago`), no image, no icon. Trivially compliant.
- ✅ 1.3.1 Info and relationships: rendered as semantic text inside an existing header `<span>` host; no orphan structure
- ✅ 1.4.3 Contrast: inherits header text token (existing `--text` / `--text-muted`), which already meets 4.5:1 in both themes per v1.0.1 audit
- ✅ 1.4.4 Resize text: pure text, no fixed pixel sizing on width/height; reflows naturally

### Operable
- ✅ 2.1.1 Keyboard: indicator is non-interactive (no click handler, no tabindex), so keyboard reachability requirements don't apply
- ✅ 2.4.4 Link purpose: not a link
- ✅ 2.5.5 Target size: not a tap target (non-interactive); 44×44 floor doesn't apply

### Understandable
- ✅ 3.1.1 Language: text in default page language (en); inherits `<html lang="en">`
- ✅ 3.3.1 Error identification: indicator gracefully hides on fetch error (`src/components/sync-health.ts:39-41` catch block keeps `host.hidden = true`); no error message to misclassify

### Robust
- ✅ 4.1.2 Name role value: text content provides accessible name; `host.title` provides programmatic tooltip with detail (timestamp, sha, doc count). Screen readers will announce the visible text and the title attribute on focus/hover.
- ⚠ 4.1.3 Status messages: when meta becomes fresh, indicator appears in DOM without an `aria-live` region. Screen reader users won't be notified. Since the indicator is informational and not action-required, this is borderline — the WCAG text recommends `aria-live` for status messages "presented to the user without receiving focus". Tracked as finding A1 below.

## Regression check (v1.0/v1.0.1 baseline)
- ✅ Theme toggle aria-pressed unchanged (`src/components/theme-toggle.ts`)
- ✅ View-mode radiogroup unchanged (`src/views/folder.ts`)
- ✅ Hit-area 44×44 spec still asserted (`test/e2e/responsive.spec.ts`, `v101.spec.ts:67-77`) — green
- ✅ prefers-reduced-motion global override unchanged (`app.css:19-22`)
- ✅ Palette aria-live count region unchanged
- ✅ Graph view role=application + aria-label unchanged

## Findings

### A1 — `#sync-health` could expose status-message live region

**Severity:** 🔵 Suggestion
**File:** `src/components/sync-health.ts:34-37`, `index.html` (host element definition)

- Indicator silently appears once `sync-meta.json` resolves; screen readers don't announce the change.
- WCAG 2.1 AA 4.1.3 recommends `aria-live="polite"` on status messages presented without focus change.
- Risk is genuinely low because the message is informational and the same data is available in the page chrome on demand, but adding `aria-live="polite" aria-atomic="true"` to the host span costs nothing and improves SR experience.

Reasoning: the indicator is an "appeared" status (sync just landed) — exactly the WCAG 4.1.3 use case. Implementation is one HTML attribute and zero JS change.

→ Fix: in `index.html`, add `aria-live="polite" aria-atomic="true"` to the `#sync-health` span. Optional v1.0.3: add a short SR-only prefix like "Documentation" so the announcement reads "Documentation synced 2 minutes ago" rather than just "Synced 2 minutes ago" in isolation.

## Tally: 0 critical, 0 warning, 1 suggestion

## Verdict: PASS (a11y)

v1.0.2 introduces a single non-interactive informational indicator with no a11y regressions to the v1.0.1 baseline. One 🔵 suggestion (aria-live for status-message announcement) tracked for v1.0.3.
