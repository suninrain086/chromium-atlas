# Audit run_1 — Security review (v1.0.2)

Independent security review of v1.0.2 delta against OWASP ASVS L1
baseline + supply-chain + GH Actions hardening checklist.

## OWASP ASVS L1 baseline (regression scan)

### V5 Validation/Sanitization/Encoding
- ✅ V5.2.5 markdown rendering: `markdown-it` still configured `html: false` (unchanged from v1.0)
- ✅ V5.2.6 HTML sanitization: `DOMPurify.sanitize` still applied post-render
- ✅ V5.3.4 CSP meta tag in `index.html` unchanged (`default-src 'self'`)
- ✅ Three-wall XSS pipeline intact

### V14 Configuration
- ✅ V14.4.5 PWA service worker scope unchanged
- ✅ V14.5.2 No new external script/style sources introduced; CSP unchanged

### V8 Data Protection
- ✅ No new PII, cookies, analytics, or telemetry surfaces in v1.0.2
- ✅ `public/sync-meta.json` payload reviewed (`scripts/sync-chromium.mjs:88-94`): only `lastSyncedAt`, `sourceRef`, `sha`, `docCount`, `syncDurationMs` — no usernames, no tokens, no paths beyond `main`/sha. Safe to ship publicly.

## v1.0.2-specific surface

### Sync script command injection (`scripts/sync-chromium.mjs`)
- ✅ All `git` invocations use `spawnSync(cmd, [args...], { cwd })` — array form, no shell. CLI flag injection is the only attack surface.
- ⚠ `scripts/sync-chromium.mjs:18` parses `--ref <value>` from argv with no validation. The value flows unsanitized into `git checkout REF` (`:41`) and `git fetch --depth 1 origin REF` (`:45`). spawnSync with array args is shell-safe, but git itself treats `-`-prefixed values as options. A hostile `--ref --upload-pack=touch /tmp/pwn` could trigger git option injection during `fetch`. The script is invoked only by maintainers locally and by GH Actions (where `inputs.ref` is gated by repo write access), so the realistic attack surface is low. Tracked as finding S1 below.

### Workflow secrets handling (`.github/workflows/sync-docs.yml`, `deploy.yml`)
- ✅ `sync-docs.yml` uses no custom secrets; only `GITHUB_TOKEN` (auto-provisioned, scoped via `permissions: { contents: read, issues: write }`).
- ✅ `deploy.yml` uses `GITHUB_TOKEN` for cross-workflow artifact download + Pages deployment; permissions scoped to `pages: write, id-token: write` — minimum needed for `actions/deploy-pages@v4`.
- ✅ No hardcoded tokens, no `secrets.*` in shell strings, no third-party action calls beyond `actions/*` core + `actions/github-script@v7`.
- ⚠ `sync-docs.yml:47` runs `node scripts/sync-chromium.mjs --ref ${{ inputs.ref || 'main' }}` — direct interpolation of workflow_dispatch input into the shell command. While `inputs.ref` is gated by repo write access (only authorized users can dispatch), GH Actions hardening guidance (CodeQL `actions/script-injection`) recommends passing via environment variable. Tracked as finding S2 below.

### License posture
- ✅ `package.json` `license: MIT` unchanged
- ✅ No new runtime dependencies added (review of `package.json:dependencies` vs v1.0.1 — identical set)
- ✅ `THIRD-PARTY.md` unchanged from v1.0.1; sync script has no third-party imports (only Node stdlib + `git` CLI)

### Cross-origin / CSP
- ✅ Real chromium docs are static markdown fetched server-side at build time, then served from same origin as the rest of the SPA. No runtime cross-origin requests added.
- ✅ Workflow fetches `https://chromium.googlesource.com/chromium/src.git` server-side only; never client-facing.

## Findings

### S1 — sync script: validate `--ref` argv + use `--` separator

**Severity:** 🔵 Suggestion
**File:** `scripts/sync-chromium.mjs:18,41,45`

- `REF` flows from argv directly into git args. Although `spawnSync` array form prevents shell injection, git itself accepts `-`-prefixed args as options.
- A maintainer could be tricked (or a misconfigured CI variable could) feed `--upload-pack=...` or similar.

Reasoning: defense-in-depth; the realistic threat is low because the script is only invoked by maintainers and by the GH Actions cron (with default `main`), but adding the validation makes the script safe to expose more broadly in v1.0.3+ (e.g., if we accept REF from a public form).

→ Fix: at top of `main()`, add `if (!/^[A-Za-z0-9._/-]+$/.test(REF)) { throw new Error("invalid --ref"); }` and change git invocations to `run("git", ["checkout", "--", REF], CACHE)` and `run("git", ["fetch", "--depth", "1", "origin", REF, "--"], CACHE)`.

### S2 — workflow: pass `inputs.ref` via env instead of `${{ }}` shell interpolation

**Severity:** 🔵 Suggestion
**File:** `.github/workflows/sync-docs.yml:47`

- `run: node scripts/sync-chromium.mjs --ref ${{ inputs.ref || 'main' }}` interpolates the input into the shell command. Although `workflow_dispatch` is gated by write access, this pattern is flagged by `actions/script-injection` static analysis.

Reasoning: matches GH Actions security hardening guidance; same-class fix is being adopted across the org (zero-trust on workflow inputs).

→ Fix:
```yaml
- name: Sync chromium docs (sparse clone)
  env:
    REF: ${{ inputs.ref || 'main' }}
  run: node scripts/sync-chromium.mjs --ref "$REF"
```

## XSS regression test
- ✅ `test/e2e/smoke.spec.ts:65` XSS case still green (35/35 suite). No new HTML rendering paths in v1.0.2.

## Findings tally: 0 critical, 0 warning, 2 suggestions (both v1.0.3 hardening)

## Verdict: PASS (security)

Both findings are 🔵 suggestions for v1.0.3 hardening — no critical or warning. Security posture unchanged or strengthened vs v1.0.1.
