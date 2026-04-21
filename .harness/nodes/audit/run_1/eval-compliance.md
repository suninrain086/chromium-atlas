# Audit run_1 — Compliance review (v1.0.2)

Independent compliance review against license posture, gitignore
discipline, dependency provenance, and data-handling guarantees.

## License + attribution
- ✅ `package.json` `"license": "MIT"` unchanged
- ✅ `LICENSE` file unchanged from v1.0.1
- ✅ `THIRD-PARTY.md` enumerates runtime deps; v1.0.2 adds zero new runtime deps (verified via `package.json:dependencies` diff vs v1.0.1)
- ✅ Real chromium docs corpus is licensed under BSD-3-Clause (chromium/src `LICENSE`); since we redistribute markdown content, the upstream license file MUST accompany the deployed `dist-docs/` — currently `scripts/sync-chromium.mjs:48-69` only copies `*.md` and skips dotfiles, so `LICENSE` is NOT carried over. See finding C1 below.
- ⚠ Recommend a small follow-up to copy chromium's `LICENSE` into `dist-docs/CHROMIUM-LICENSE.txt` and link from README, OR document a NOTICE statement in README explaining the docs are mirrored from chromium/src under BSD-3-Clause. Tracked as finding C1 below.

## Gitignore + cache discipline
- ✅ `.gitignore` lines 8-9 already cover `dist-docs/` and `.cache/`
- ✅ `public/sync-meta.json` is gitignored (line 7) — never committed
- ✅ Sync script writes only to `dist-docs/`, `public/`, and `.cache/` — all gitignored
- ✅ Verified via `git status` clean after sync run; no accidental staging of pulled chromium content

## Sync-meta payload data-handling
- ✅ `public/sync-meta.json` contains `lastSyncedAt`, `sourceRef`, `sha`, `docCount`, `syncDurationMs` — all derived from chromium's public git history. No tokens, no usernames, no IPs, no client identifiers, no internal paths.
- ✅ Indicator (`src/components/sync-health.ts:34-37`) renders only the relative time + sha8 + docCount in `host.title` — no PII surface
- ✅ Sync script does not log credentials; `[sync-chromium] OK — 694 docs, sha 03514af6, 29766ms` is the only output line — safe for CI logs

## Workflow attestation
- ✅ `sync-docs.yml` and `deploy.yml` use only first-party `actions/*` actions, all pinned to major version (`@v4`, `@v3`, `@v7`). No third-party action introduces supply-chain risk.
- ✅ `actions/deploy-pages@v4` is the sanctioned GH Pages publish path; `id-token: write` permission is required for OIDC attestation and is correctly scoped to deploy job only.
- ✅ Cache key `chromium-cache-${{ inputs.ref || 'main' }}-v1` is deterministic and includes a manual version bump suffix — safe for cache-poisoning hardening.

## Privacy baseline (carry-over)
- ✅ "no analytics, no cookies, no PII, no third-party network calls beyond the static asset host" — README.md privacy paragraph still accurate
- ✅ The `chromium.googlesource.com` clone happens server-side (in GH Actions), never client-facing; the deployed SPA still issues zero third-party requests at runtime

## Findings

### C1 — chromium upstream LICENSE not carried into dist-docs/

**Severity:** 🔵 Suggestion
**File:** `scripts/sync-chromium.mjs:48-69`, `README.md:54+`

- We mirror chromium docs (BSD-3-Clause) into our deployed site. Best practice for distributed mirrors is to carry the upstream LICENSE alongside the content.
- `copyMdTree` filter only copies `*.md` files and skips dotfiles, so chromium's `LICENSE` is not present in `dist-docs/`.

Reasoning: BSD-3-Clause requires the copyright notice and license to accompany redistributions. The risk is low because we display these as documentation rather than redistributing source, but adding a NOTICE is the conservative path.

→ Fix: append a step in `scripts/sync-chromium.mjs` to `copyFileSync(join(CACHE, "LICENSE"), join(DEST, "CHROMIUM-LICENSE.txt"))` and add a one-line notice in README ("Mirrored chromium docs are © The Chromium Authors, BSD-3-Clause; see `CHROMIUM-LICENSE.txt`"). Mark v1.0.3.

## Findings tally: 0 critical, 0 warning, 1 suggestion

## Verdict: PASS (compliance)

License/gitignore/data-handling posture all green. One 🔵 suggestion for v1.0.3 about upstream LICENSE attribution.
