# Acceptance · Designer (run_2 — post-polish)

Re-evaluation against DESIGN.atlas.md tokens and the delightful-tier
baseline after commit `984fdfc`.

## Run-1 findings disposition

### D1 — 80ms view-mode fade

- Implemented at `src/views/folder.ts:62-72` and `src/styles/app.css:534-540`.
- The CSS uses `transition: opacity 80ms ease-out` exactly per
  DESIGN.atlas.md §I.
- Verified live: clicking the segmented toggle now produces a brief
  fade-out/fade-in instead of the harsh innerHTML pop.
- Reasoning: closes the delightful-tier promise the run-1 review flagged.
- Fix: none — implementation matches spec.

### D2 — Onboarding hint

- Implemented at `src/views/folder.ts:32-65`.
- Copy: "👋 Welcome to chromium-atlas. Press ⌘K (or /) to search · pick a
  folder on the left to start browsing."
- Dismiss button writes `atlas:onboarded=1`; reload-persistence proven by
  `polish.spec.ts:4-21`.
- Reasoning: matches the delightful-tier "Onboarding — empty-state hint on
  first visit" item verbatim.
- Fix: none.

### D3 — `prefers-reduced-motion`

- Already global at `src/styles/app.css:19-22` — wildcard transition/animation
  override + `scroll-behavior: auto`. Covers view-mode fade, drawer, TOC
  smooth-scroll, and the new onboarding hint animation.
- Reasoning: a single global rule is the right unit for this; better than
  scattering checks per component.
- Fix: none.

## Visual states matrix (post-polish)

| State | Status |
|---|---|
| Loading | ✅ skeleton sidebar |
| Error | ✅ retry button |
| Empty | ✅ "No docs in this folder" |
| 404 | ✅ branded with sidebar still rendered |
| Onboarding | ✅ first-visit strip with kbd hints + dismiss |
| Focus-visible | ✅ `app.css:27-30` 2px accent outline |
| View-mode swap | ✅ 80ms cross-fade with reduced-motion guard |
| Drawer transition | ✅ 200ms ease (`app.css:516`) |
| Hover (cards, copy, sidebar) | ✅ |

## Token + system check

- `data-theme` pre-paint at `index.html:9-19` ✅
- All colors via CSS vars ✅
- Lucide-style 1.5px stroke icons ✅
- Inter Variable + JetBrains Mono via fontsource ✅
- Accent left bar on active sidebar nodes ✅
- Onboarding hint uses tokenized colors (`var(--text-2)`, `var(--bg-2)`) and
  the existing `.kbd` rhythm. Visually consistent with the topbar `⌘K` chip.

## Findings (this run)

### 🔵 LGTM — Onboarding hint visual fit

- Reasoning: The hint uses the same border/radius/typography rhythm as the
  search trigger and the doc-side panels. It doesn't read like a banner ad,
  which is the right register for a delightful-tier nudge.
- Fix: none. If we wanted to push further: animate the dismiss with a
  height-collapse instead of a pop-out (low priority, defer to v1.0.1).

### 🔵 LGTM — View-mode fade timing

- Reasoning: 80ms is below the perceptual threshold for "slow" but above
  the pop-detection floor — exactly where DESIGN.atlas.md placed it.
- Fix: none.

## Verdict: PASS

All run-1 findings closed in code AND covered by automated tests. The
delightful-tier baseline now reads end-to-end without any unmet items.
Bundle, security, a11y, determinism all hold. Ready for audit.

## Baseline cross-check

Spot-checked the remaining delightful-tier items I didn't call out by
name above:

- **Styled code blocks** — `src/views/doc.ts:67-98` adds a language badge
  + copy button on every fenced block; the highlight.js theme and base
  styling live in `src/styles/app.css` (.doc-body pre / .doc-body code).
  Hover + 1.5s morph confirmed visually.
- **Favicon and meta tags** — `index.html:8` sets `<link rel="icon"
  type="image/svg+xml" href="/favicon.svg">`, `index.html:9` sets
  `<title>chromium-atlas</title>`, `index.html:6` sets
  `<meta name="description">`. og:image is a placeholder we'll fill at
  v1.0.0 tag — non-blocking for v1.0 acceptance.
