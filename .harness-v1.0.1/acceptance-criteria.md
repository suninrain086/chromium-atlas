# Acceptance Criteria — chromium-atlas v1.0.1

Tier: **delightful**. Source: PROJECT_BRIEF_v1.0.1.md §Acceptance criteria.

| AC | Description | Verification |
|---|---|---|
| AC-1 | `#/graph` renders within 800ms cold-load on 691-doc fixture | Playwright timing |
| AC-2 | Click graph node navigates to `#/doc/<path>` | Playwright |
| AC-3 | Theme toggle on graph view re-styles without rebuild | Playwright marker probe |
| AC-4 | Main chunk (excluding lazy graph chunk) ≤ 30 KB gz; total ≤ 250 KB gz | Build assertion script |
| AC-5 | App is installable as PWA (manifest valid, SW registers) | Manifest fetch + parse |
| AC-6 | Cold reload under offline still renders home | Playwright offline |
| AC-7 | Theme toggle has `aria-pressed` reflecting state | DOM probe |
| AC-8 | View-mode group keyboard-navigable as radiogroup | Keyboard test |
| AC-9 | All toggles meet 44×44px on mobile (375px) | bbox check |
| AC-10 | SECURITY.md, THIRD-PARTY.md exist; license field present | File assertion |
| AC-11 | All 14 persona scenarios green | persona harness |
| AC-12 | All v1.0 tests still green (no regression) | npm test |
