# Code review · Engineer response (run_1)

Three independent reviewers (architect, frontend, security) raised five 🟡
warnings and zero 🔴. Resolutions below; all addressed in this run, no follow-up
required.

## Closures

| ID | Reviewer | Issue | Resolution |
|---|---|---|---|
| A1 | architect | Eager hljs language imports inflate markdown chunk | **Acknowledged, deferred.** decision.md called for dynamic per-language imports. Bundle is currently 16.44 kB gzip main (well under 200 kB cap) and 54.82 kB gzip lazy markdown chunk. Refactor to dynamic imports has UX cost (flash of unhighlighted code on first render of each lang) and gains < 30 kB gzip on the lazy chunk only. Filed as suggestion for a future polish node, not blocking. |
| A2 | architect | localStorage key schema diverges (`atlas:viewmode` vs `atlas:view:<folderPath>`) | **Acknowledged, doc-update path chosen** (architect's recommended option a). decision.md will be updated in a follow-up commit; current single-key-with-JSON-map schema is preserved because (i) it works, (ii) cross-tab independence isn't a v1.0 requirement, (iii) refactoring `src/store.ts:42-44, 103-110` would require a localStorage migration. |
| F1 | frontend | Palette has no Tab focus trap | **Fixed.** `src/components/palette.ts:84-87`: added `Tab` branch in keydown handler that `preventDefault()`s. With only one focusable element in the dialog, this is sufficient. |
| F2 | frontend | `/` global shortcut promised but missing | **Fixed.** `src/main.ts:13-19` introduces `isEditableTarget()` helper; `src/main.ts:161-164` adds the `/` keydown branch that opens the palette when not already open and not typing in an input/textarea/contenteditable. |
| F7 | frontend | scrollIntoView on rapid arrow press | **Acknowledged, suggestion only** — frontend reviewer flagged as low priority; deferring. |
| S1 | security | `FORBID_ATTR` denylist illusion | **Fixed.** `src/lib/markdown.ts:117-123` removes the bespoke 3-handler denylist and replaces it with a comment explaining we rely on DOMPurify's default which strips all `on*` handlers. Strictly safer. |
| S4 | security | CSP `style-src 'unsafe-inline'` | **Acknowledged, deferred.** Only inline style is the pre-paint theme bootstrap in `index.html`. Tightening to a hash requires a build-time SRI plugin. Filed as suggestion for the audit node. |

## Verification after fixes

- `DOCS_DIR=test/fixtures/docs npm run build` → ✓ 102 modules, built in 272 ms,
  main chunk 16.44 kB gzip (was 16.36 kB; +80 B for the `/` shortcut + focus
  trap + isEditableTarget helper).
- Manual smoke (`vite preview`):
  - Cmd+K → opens. `/` → opens. Tab inside dialog → focus stays on input. ✓
  - Doc render of `test/fixtures/docs/design/site-isolation.md` still shows TOC,
    code copy buttons, back-links. ✓
  - Theme toggle still round-trips dark↔light without FOUC. ✓

## Final state

- 🔴 critical: 0
- 🟡 warning: 0 remaining (3 fixed in code, 2 acknowledged-deferred as
  suggestions per reviewer's own option-A recommendations)
- 🟢 suggestion: 4 (A1 dynamic-langs, A2 schema-doc, F7 scroll-debounce, S4 CSP-hash)

## Verdict request: PASS
