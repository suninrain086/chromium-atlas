# Acceptance · Designer (run_1, v1.0.1)

Independent design-acceptance review against `DESIGN.atlas.md` tokens and
the delightful-tier baseline. I walked the v1.0.1 component diff, inspected
the graph view live, exercised the install button + theme toggle on the
production `dist/` build, and re-read the brief's F1/F3 visual contracts.

## Visual states matrix (v1.0.1)

| Surface | State | Status | Notes |
|---|---|---|---|
| Graph view | empty (no edges) | ✅ | `src/views/graph.ts:67-70` empty-state copy points to `npm run scan` |
| Graph view | populated | ✅ | Cose layout, 8–30px node sizing on in-degree, 50% edge opacity, ellipsis labels |
| Graph view | current-doc highlight | ✅ | `:84-86` adds `.current` class with stronger border-width 3 |
| Graph view | dark→light theme | ✅ | `applyGraphTheme()` reads CSS vars, fromJson().update() — no destroy/rebuild |
| Theme toggle | aria-pressed | ✅ | sun/moon swap on click; `aria-pressed` flips |
| View-mode toggle | radiogroup | ✅ | role/aria-checked/tabindex roving; arrow-key navigation |
| Install button | hidden default | ✅ | only revealed on `beforeinstallprompt`; aria-label "Install chromium-atlas" |
| Hit areas @ 375px | 44×44 minimum | ✅ | bbox spec covers theme/hamburger/view-mode |
| Onboarding hint (v1.0 carry-over) | first-visit only | ✅ | `folder.ts:41-46` still renders `[data-onboarding]` gated on localStorage |
| `prefers-reduced-motion` | global override | ✅ | inherited from v1.0 polish patch (`app.css:19-22`) — applies to graph layout `animate:false` (already reduced) |

10/10 visual states correct.

## Token usage

- Graph view reads `--text`, `--accent`, `--surface`, `--border-solid` /
  `--border` via `getComputedStyle(document.documentElement)` — single
  source of truth, no hardcoded brand colors. ✅
- Fallback colors in `readTokens()` (`#f7f8f8`, `#7170ff`, `#191a1b`,
  `#23252a`) match DESIGN.atlas.md spec. ✅
- Inter at 10px / 510 weight for graph labels — matches the system font
  scale for tertiary metadata. ✅

## Motion + reduced-motion

- Graph layout `animate: false` (`graph.ts:82`) — no motion to suppress;
  trivially compliant. ✅
- Theme restyle is instantaneous (`fromJson().update()` is synchronous);
  no transition flicker. ✅
- View-mode 80ms fade from v1.0 polish still in place. ✅

## Findings

### 🟡 D1 — Graph view lacks a "loading" state during cold lazy-import

**Severity:** 🟡 Warning
**File:** `src/main.ts` (graph route dispatch), `src/views/graph.ts:54-65`

- The `#/graph` route triggers a dynamic `import("./views/graph")` that
  pulls in the 138.62 KB gz `cyto-*.js` chunk.
- On a cold network or throttled connection, the user sees the existing
  view (or a flash of empty `<main>`) until the chunk arrives — there is
  no skeleton, spinner, or "Loading graph…" affordance.
- Brief AC-1 says "renders within 800ms cold-load" — we hit that on a
  warm dev fixture, but the *delightful* tier asks for thoughtful
  loading states for any user-perceptible delay > 100ms.
- Reasoning: lazy chunks are great for budget, but the UX promise of the
  delightful tier requires visible feedback during the wait. Otherwise
  it looks broken on slow connections — exactly the audience PWA + offline
  is targeting.
- Fix: in `src/main.ts` (or wherever `#/graph` is dispatched), set
  `root.innerHTML` to a one-line "Loading graph…" placeholder *before*
  awaiting the dynamic import; the imported module then overwrites it.
  No new bundle weight (just a string in main.ts).

## Verdict: ITERATE

One yellow finding (D1 — missing loading affordance on lazy graph
chunk). No critical, no blockers. PM also raised two doc-accuracy
warnings; one polish patch can address all three.
