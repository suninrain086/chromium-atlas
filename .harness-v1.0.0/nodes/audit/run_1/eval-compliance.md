# Audit · Compliance

Independent compliance audit. Scope is intentionally narrow because
v1.0 has no auth, no PII, no payments, no analytics, no third-party
trackers. The compliance surface for a static-site doc browser is
short — but it's not zero.

## Licensing

### 🟢 COMP-1 — Project license clearly declared

**File:** `LICENSE`, `package.json`

Project ships under MIT (see `LICENSE`). `package.json` does not yet set
`"license": "MIT"`. Minor — scanning tools that read package.json (e.g.
GitHub auto-detection, npm registry pages) will show "UNLICENSED".

### 🔵 COMP-2 — Add `"license": "MIT"` to package.json

- Reasoning: Defensive hygiene. The LICENSE file is canonical, but
  package.json is the machine-readable source for tooling. A lone LICENSE
  file gets miscategorized by some tooling.
- Fix: Add `"license": "MIT"` to `package.json` between `"version"` and
  `"type"`. One-liner; no behavior change.

### 🟢 COMP-3 — Dependency licenses are compatible

Direct deps and their published licenses:
- `markdown-it` — MIT
- `dompurify` — MPL-2.0 OR Apache-2.0
- `fuse.js` — Apache-2.0
- `highlight.js` — BSD-3-Clause
- `@fontsource-variable/inter`, `@fontsource/jetbrains-mono` — OFL-1.1
  (font files) + MIT (npm wrapper)

All compatible with MIT redistribution. The OFL-1.1 fonts must retain
their copyright notices when distributed — `node_modules` already
contains the LICENSE files, and Vite copies the font binaries verbatim
into `dist/assets/`. ✅

### 🔵 COMP-4 — Add a NOTICE / third-party-licenses page

- Reasoning: For a doc-browser shipped as v1.0, listing "Built with…"
  with link-outs to source repos is a low-effort attribution pattern that
  satisfies BSD-3-Clause + Apache-2.0 attribution-clause expectations.
- Fix: Add a `THIRD-PARTY.md` listing each direct dep with its license
  shortcode and a link. Could also live as a small "About" route in v1.1.

## Privacy

### 🟢 COMP-5 — No PII, no analytics, no tracking

`grep -ri 'analytics\|gtag\|ga(\|telemetry\|fingerprint\|cookie'
src/ index.html` returns zero hits. The app uses **localStorage only**
for UI state (theme, sidebar expansion, view mode, onboarded flag). No
network beacons, no third-party scripts.

This is the right posture for v1.0 and means GDPR / CCPA disclosures
don't apply (no personal data is collected or processed).

### 🔵 COMP-6 — Note the privacy posture in README

- Reasoning: Even when the answer is "we collect nothing", explicitly
  saying so builds trust and pre-empts privacy questions.
- Fix: README §"Privacy": "chromium-atlas v1.0 is a static SPA; we
  collect no analytics, set no cookies, and store only UI state in your
  browser's localStorage."

## Accessibility (regulatory lens)

A11y from a *compliance* angle (not the a11y reviewer's deep dive) —
WCAG 2.1 AA is the relevant baseline.

- Color contrast: tokens defined as CSS vars; spot-checked text-on-bg
  contrast in dark theme via DevTools — passes AA. ✅
- Keyboard reachability: every interactive element is a `<button>` or
  `<a>` (no `<div onclick>`). ✅
- ARIA: sidebar `role="tree"`, folder nodes `aria-expanded`, active
  doc/folder `aria-current="page"`. ✅
- Reduced motion: global `prefers-reduced-motion` override. ✅
- Specifics deferred to a11y reviewer.

## Out-of-scope for v1.0

- COPPA / age-gating: N/A (no accounts, no UGC).
- PCI-DSS: N/A (no payments).
- HIPAA: N/A (no health data).
- SOC 2: N/A (no service tier).
- Cookie banners: N/A (no cookies — see COMP-5).

## Verdict: PASS

No criticals, no warnings. Three suggestions (license field,
THIRD-PARTY.md, README privacy note) are v1.0.1 hygiene. The compliance
posture for a no-auth no-PII static doc browser is properly minimal.
