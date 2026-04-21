# Acceptance · Designer (run_1, v1.0.2)

Independent design-acceptance review against `DESIGN.atlas.md` tokens and
the delightful-tier baseline. v1.0.2 is primarily a backend/data-pipeline
release (sparse clone, GH Actions, scan flag); UI surface change is one
header indicator (`#sync-health`). I walked the diff, ran the production
build, exercised the indicator across all 3 mocked sync-meta states, and
re-checked the v1.0.1 visual-states matrix for regressions.

## Visual states matrix (v1.0.2 delta + v1.0.1 baseline regression check)

| Surface | State | Status | Notes |
|---|---|---|---|
| `#sync-health` header indicator | meta missing | ✅ | `src/components/sync-health.ts:25-27` keeps `host.hidden = true`; Playwright case `v102.spec.ts:15-22` asserts hidden — green |
| `#sync-health` | meta fresh (<24h) | ✅ | `:34-38` flips `hidden = false`, sets `data-sync-fresh="true"`, text `Synced N minute(s) ago`; tooltip via `host.title`. `v102.spec.ts:24-43` asserts visible + text pattern + attribute — green |
| `#sync-health` | meta stale (>24h) | ✅ | `:33` `if (ageMs < 0 \|\| ageMs > 24h) return` keeps element hidden; `v102.spec.ts:45-65` asserts hidden — green |
| `#sync-health` | typography | ✅ | inherits header text token (Inter Variable, 13px), no new font load. Within scale. |
| `#sync-health` | dark/light theme | ✅ | text-only element, inherits `--text-muted` from CSS vars; no per-theme branch needed |
| `#sync-health` | hit area | (n/a) | non-interactive (no click handler); `title` attr provides hover tooltip; not a tap target so 44×44 not required |
| Graph view (v1.0.1 carry-over) | populated | ✅ | unchanged from v1.0.1; 17 v1.0 + 9 v1.0.1 specs still green per gate-test |
| Theme toggle / view-mode toggle | aria/keyboard | ✅ | unchanged from v1.0.1 baseline |
| Onboarding hint, install button, hit areas | first-visit / 375px | ✅ | unchanged from v1.0.1 baseline |
| `prefers-reduced-motion` | global | ✅ | inherited from v1.0; no new animations introduced in v1.0.2 |

10/10 visual states correct; v1.0.2 introduces no new tokens, no new
animations, no new color families, and no new tap targets.

## Token usage

- `#sync-health` element styled via existing header token cascade — no
  hardcoded color, font, or spacing values. ✅
- `data-sync-fresh="true"` attribute hook is available for stylesheet
  binding (e.g., subtle accent dot) but no overrides shipped in v1.0.2.
  Acceptable: indicator is informational, defaults to muted text. ✅

## Motion + reduced-motion

- No new motion in v1.0.2. Indicator appears statically after fetch
  resolves; `await fetch + render` is a one-shot mount, not a transition.
  Trivially compliant. ✅

## Information-density check

- Header indicator text length budget: longest case is `Synced 23 hours
  ago` (20 chars). Comfortably under any reasonable header-strip budget.
  Tooltip carries the longer "Last synced <local timestamp> — sha
  <8char> — <N> docs" string out of the visible flow. ✅

## Findings

### Suggestion — consider a tiny accent dot for `[data-sync-fresh="true"]`

**Severity:** 🔵 Suggestion
**File:** `src/app.css` (currently no rule for `#sync-health`)

- The `data-sync-fresh="true"` attribute is set but never styled. A 6px dot in `--accent` or a subtle `::before` would give the indicator a glanceable "live" affordance without taking layout space.

Reasoning: pure delight-tier polish; out of scope for AC-9 (which only requires render correctness). Mark v1.0.3 backlog if not landed now.

→ Fix: optional `#sync-health[data-sync-fresh="true"]::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; vertical-align: middle; }`

### Suggestion — README live-URL placeholder copy could be tightened

**Severity:** 🔵 Suggestion
**File:** `README.md:8`

- Current placeholder reads `_(deploy URL placeholder — populated after first sync-docs + deploy run lands; will be `https://<user>.github.io/chromium-atlas/`)_` — accurate but dense.
- A two-line block (status badge + URL on its own line) would scan better in the README hero.

Reasoning: AC-10 grep passes either way; this is purely scannability polish for the front door, non-blocking.

→ Fix: split the placeholder into a dedicated paragraph and add a leading `**Live site:**` bold label on its own line, with the URL placeholder on the following line in a `<code>` block.

## Outcomes summary

v1.0.2 is a clean delta: one new informational indicator, three
mocked-state Playwright cases all green, zero new tokens or animations,
zero v1.0/v1.0.1 visual regressions. No yellow findings, two green
suggestions for v1.0.3 polish.

## Verdict: PASS (with suggestions)

10/10 visual states green; 0 critical, 0 warning, 2 green suggestions.
Designer side has no blockers for advancing past acceptance.
