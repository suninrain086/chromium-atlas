# Audit · Security

Independent v1.0 security audit against OWASP ASVS L1 + the v1.0 trust
boundary defined in `code-review/run_1/security.md`. I read the source,
diffed against the polish patch (commit `984fdfc`), and re-verified the
3-wall XSS defense.

## Trust boundary (re-stated)

Static SPA, no backend, no auth, no PII. Untrusted input = markdown
content from `public/docs.json` built from the mock corpus
(`test/fixtures/docs/`, 691 .md files). All fetches are same-origin to
disk-served static JSON.

## Wall 1 — markdown-it `html: false`

**File:** `src/lib/markdown.ts:108-113`

`html: false` on the markdown-it constructor strips all raw HTML before
tokenization. Verified by grepping `html:` in the codebase — only one
construction site, and it's locked. ✅

## Wall 2 — DOMPurify

**File:** `src/lib/markdown.ts:117-123`

The misleading `FORBID_ATTR: ["onerror", "onload", "onclick"]` flagged
in code-review S1 was correctly removed (commit `d00d265`). Current
config:

```ts
DOMPurify.sanitize(dirty, {
  ADD_ATTR: ["target", "rel", "id", "data-doc"],
  FORBID_TAGS: ["style", "iframe", "object", "embed"],
});
```

DOMPurify default config drops every `on*` attribute, `javascript:`
URLs, and `data:text/html`. Verified the smoke test at
`test/e2e/smoke.spec.ts:65-75` (XSS via `<script>` tag in
`misc/orphan.md` — script does NOT execute, no script element in
`.doc-body`). ✅

## Wall 3 — CSP meta

**File:** `index.html:7`

```
default-src 'self' data: blob:;
script-src 'self';
style-src 'self' 'unsafe-inline';
font-src 'self' data:;
img-src 'self' data: blob:;
connect-src 'self';
```

### 🔵 SEC-1 — `style-src 'unsafe-inline'` is broader than needed

**File:** `index.html:7`

- Reasoning: Carryover from code-review S4. Not exploitable today (Walls
  1+2 hold and there is no user-controllable HTML), and v1.0 ships from
  `file:`/`http://localhost:4173`. Tightening to a SHA-256 script-src
  hash for the pre-paint theme bootstrap is pure hygiene; defer to v1.0.1.
- Fix: At v1.0.1, replace the inline `<script>` theme bootstrap at
  `index.html:9-19` with `<script src="/theme-init.js">` and pin its
  SHA-256 in CSP `script-src 'sha256-...'`.

### 🟢 SEC-2 — External-link `noopener noreferrer` enforced

**File:** `src/lib/markdown.ts:57-60`

`linkRewritePlugin` sets `target="_blank" rel="noopener noreferrer"` on
every `^https?://` link. Prevents `window.opener` tab-nabbing. ✅

## Routing & navigation

**File:** `src/router.ts`, `src/views/doc.ts:5-18`

- Hash route values are looked up in the prebuilt `byPath` Map; never
  executed, never `eval`'d, never injected as innerHTML.
- 404 path `escapeHtml(docPath)` at `src/views/doc.ts:13`. ✅
- New onboarding hint at `src/views/folder.ts:38-42` is a static literal —
  no user-controlled data interpolated. ✅

## Clipboard

**File:** `src/views/doc.ts:86-96`

`navigator.clipboard.writeText(code.textContent || "")` — string only,
no HTML, no shell. Safe. ✅

## localStorage surface (post-polish)

Keys written: `atlas:theme`, `atlas:sidebar:expanded`, `atlas:viewmode`,
`atlas:onboarded` (new). All values are short, controlled strings. No
PII, no tokens. Reads are wrapped in try/catch (`folder.ts:34, 50`,
`store.ts`). ✅

## Fetch surface

`src/store.ts:51-58` fetches `${BASE_URL}/{docs,tree,links}.json` only.
Same-origin, no CORS exposure, no user-controllable URL. ✅

## Dependency vulnerabilities

`npm audit` snapshot (deps are pinned in `package.json`):
- `markdown-it@14.x`, `dompurify@3.x`, `fuse.js@7.x`, `highlight.js@11.x`
- All major versions have current patches; no known high/critical CVEs
  for these versions per the public advisory DB.

### 🔵 SEC-3 — Add a CHANGELOG note before v1.0.0 tag

- Reasoning: Audit hygiene — security posture should be visible to
  downstream consumers cloning the repo.
- Fix: Add a "Security" section to README.md or create SECURITY.md noting
  the 3-wall XSS defense, the trust boundary, and how to report issues.

## Verdict: PASS

Three walls hold. No critical, no warning. Two suggestions (CSP tighten,
SECURITY.md) are v1.0.1 hygiene items. Bundle size unchanged by polish
patch (verified in build log).

## Baseline cross-check (delightful)

- **TESTING.md** — present at repo root (added in 984fdfc); 18-row
  feature inventory + setup + cleanup. From a security lens, important
  because it makes black-box testing (incl. fuzzing the markdown
  pipeline) feasible without source access.
- **Loading states** — `src/main.ts:94-101` skeleton sidebar during
  `loadStore()` plus `error-state` retry at `:107-116` cover the async
  fetch path; reviewed for security implications (no error message
  leaks paths or stack traces beyond the user-thrown error message,
  which is escaped via `escapeHtml`).
