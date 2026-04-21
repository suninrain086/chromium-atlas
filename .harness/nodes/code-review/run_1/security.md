# Code review · Security

Independent security review with focus on the 3-wall XSS defense
(markdown-it `html:false` → DOMPurify → CSP meta) plus auxiliary surfaces:
clipboard, hash routing, fetch.

## Threat model (v1.0)

Static SPA, no backend, no auth. The only untrusted input is **markdown content
loaded from `public/docs.json`**, which in production is built from the
chromium docs corpus. For v1.0 the corpus is `test/fixtures/docs/`. A malicious
or compromised doc could try to inject script into the rendered HTML.

Out of scope (no backend): SQLi, SSRF, broken auth, IDOR.

## Wall 1 — markdown-it `html:false`

**File:** `src/lib/markdown.ts:108-113`

```ts
const md = new MarkdownIt({
  html: false,           // 3-wall XSS: no raw HTML
  linkify: true,
  breaks: false,
  highlight: highlightFn,
})
```

✓ Confirmed: `html:false` strips `<script>`, `<iframe>`, raw `<img onerror=...>`
in markdown source before tokenization. I tested by adding
`<script>alert(1)</script>` to `test/fixtures/docs/misc/orphan.md` and rebuilding;
the script tag is rendered as escaped text in the doc body.

## Wall 2 — DOMPurify

**File:** `src/lib/markdown.ts:117-121`

```ts
const clean = DOMPurify.sanitize(dirty, {
  ADD_ATTR: ["target", "rel", "id", "data-doc"],
  FORBID_TAGS: ["style", "iframe", "object", "embed"],
  FORBID_ATTR: ["onerror", "onload", "onclick"],
});
```

### 🟡 S1 — `FORBID_ATTR` denylist is incomplete

**File:** `src/lib/markdown.ts:120`

The handler list includes only `onerror`, `onload`, `onclick`. DOMPurify's
default allowlist already strips event handlers — but the explicit list here
gives the *appearance* of a complete defense while omitting `onmouseover`,
`onfocus`, `onpointerdown`, `onkeydown`, etc. A reader auditing this code may
believe the listed three are exhaustive.

**Reasoning:** Defense-in-depth principle: either trust DOMPurify's default
allowlist (and remove the misleading list) or maintain a complete denylist.
Currently we have the worst of both worlds — it looks deliberate but isn't.

**Fix:** Delete the `FORBID_ATTR` line entirely. DOMPurify default config
already drops every `on*` attribute. If we want extra hardening, set
`USE_PROFILES: { html: true }` and remove the bespoke ADD_ATTR/FORBID_TAGS in
favor of `ALLOWED_TAGS` allowlist. But for v1.0 the simplest defensible move is
to delete `FORBID_ATTR` and trust the library defaults.

### 🟢 S2 — `ADD_ATTR` is reasonable

`target`, `rel` are set by `linkRewritePlugin` for external links
(`src/lib/markdown.ts:57-60`); `id` is needed for headings
(`src/lib/markdown.ts:42`); `data-doc` is set on internal links
(`src/lib/markdown.ts:69`). All four pass through DOMPurify cleanly.
External-link `rel="noopener noreferrer"` (`:59`) prevents window.opener leak.

### 🟢 S3 — Code-block highlighter cannot inject

**File:** `src/lib/markdown.ts:77-89`

`highlightFn` only ever returns hljs's own escaped output (`:80-81`) or HTML-
escapes the raw code (`:84-88`). hljs's grammars only emit `<span class>` —
no event handlers, no script tags. The output is then re-sanitized by DOMPurify
at the document level. Two layers, correct.

## Wall 3 — CSP meta

**File:** `index.html` (CSP `<meta http-equiv>` tag)

CSP includes `script-src 'self'`, `style-src 'self' 'unsafe-inline'` (the
'unsafe-inline' is required for the pre-paint theme bootstrap script) and
`img-src 'self' data:` for embedded images.

### 🟡 S4 — `'unsafe-inline'` for `style-src` is broader than needed

CSP allows inline styles globally, but the only inline style in the codebase is
the pre-paint snippet inside `index.html`. Could be tightened with a hash or
nonce. Low priority because:
- there is no user-controllable HTML to begin with (Walls 1+2 hold);
- inline `style` attributes in markdown are scrubbed (FORBID_TAGS includes
  `style` element; DOMPurify default also scrubs `style` attr).

**Reasoning:** Style-src inline isn't a script vector, but a hardened CSP gives
us better long-term posture and is easy to fix at build time.

**Fix:** Replace `'unsafe-inline'` with the SHA-256 hash of the bootstrap
script's style content, OR move the bootstrap from inline to a tiny
`/theme-init.js` (script-hash CSP).

## Hash router

**File:** `src/router.ts`

Hash route values are pulled from `location.hash` and passed to view renderers.
The doc-view renderer (`src/views/doc.ts:5-18`) **looks up the path in the
prebuilt `byPath` Map**, never executes it. If the path is unknown it renders
the empty-state with `escapeHtml(docPath)` (`src/views/doc.ts:13`), which
correctly escapes the hash content. ✓

`encodeURI(r.path)` is used when programmatically setting `location.hash`
(`src/components/palette.ts:79,94`) — preserves `/` separators, escapes spaces.
✓

## Clipboard

**File:** `src/views/doc.ts:86-96`

`navigator.clipboard.writeText(code.textContent || "")` — writes only
`textContent` (string), never innerHTML. No injection vector. ✓

## Fetch surface

**File:** `src/store.ts:51-58`

Fetches `docs.json`, `tree.json`, `links.json` from `${BASE_URL}` only — no
user-controllable URL, no CORS exposure. Cache-buster `?ts=${Date.now()}`
(`:50,52-54`) is fine. ✓

## Summary table

| Wall | Status | Findings |
|---|---|---|
| markdown-it `html:false` | OK | none |
| DOMPurify | OK with caveat | S1 (denylist illusion) |
| CSP meta | OK with caveat | S4 (style-src inline) |
| Routing | OK | none |
| Clipboard | OK | none |
| Fetch | OK | none |

## Verdict: ITERATE

S1 and S4 are 🟡. Neither is exploitable today against the v1.0 trust boundary
(corpus is checked-in fixtures), but both should be cleaned up before the
audit node since the audit role will mechanically diff against OWASP ASVS L1.
