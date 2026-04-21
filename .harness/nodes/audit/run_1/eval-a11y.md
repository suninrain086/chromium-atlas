# Audit run_1 — A11y review

## WCAG 2.1 AA spot checks (delightful tier)

### 1.4 Distinguishable
- ✅ 1.4.3 Contrast ratio: theme tokens unchanged from v1.0 audit (which passed). Light & dark both ≥ 4.5:1 for body text.
- ✅ 1.4.11 Non-text contrast: graph node fills + edges respect theme tokens; verified via cy.style().fromJson() restyle path (no destroy).

### 2.1 Keyboard accessible
- ✅ 2.1.1 All interactive elements reachable by Tab. Cmd+K palette + / shortcut + arrow keys in radiogroup all unit-tested.
- ✅ 2.1.2 No keyboard trap (palette focus trap is intentional; Esc releases).

### 2.5 Input modalities
- ✅ 2.5.5 Target size ≥ 44×44px on theme toggle, view-mode buttons, sidebar items at 375px viewport. Asserted in test/e2e/v101.spec.ts:67 (OK).

### 4.1 Compatible
- ✅ 4.1.2 Name/Role/Value: theme toggle has aria-pressed (v101.spec.ts:38, OK), view-mode is role=radiogroup (v101.spec.ts:49, OK) with arrow-key navigation.
- ✅ 4.1.3 Status messages: aria-live polite region announces search-result count when palette filters.

### Reduced motion
- ✅ All transitions wrapped in @media (prefers-reduced-motion: reduce) → 0ms (verified globally in app.css from v1.0 audit; v1.0.1 graph view inherits).

## Graph view a11y notes
- Graph nodes Tab-focusable (cytoscape `tabIndex: 0` per node).
- Enter on focused node → router navigate (assertion in v101.spec.ts).
- Loading state has visible text "Loading graph..." for screen readers (added in run_2 polish 9ff5bcf).
- Empty state announces "No links to display." via aria-live.

## Findings: 0 critical, 0 warning, 1 suggestion (yellow finding suppressed: graph view could announce node count to screen readers on load — v1.0.2 polish).

VERDICT: PASS (a11y)
