# Audit run_1 — Compliance review

## License posture
- ✅ package.json `"license": "MIT"` field set (OK)
- ✅ LICENSE file present at repo root
- ✅ SECURITY.md present (OK) — disclosure email, supported-versions table
- ✅ THIRD-PARTY.md present (OK) — accurate dep list (cytoscape-fcose removed in 9ff5bcf, only built-in `cose` layout used)

## Dependency licenses (spot-checked)
- cytoscape: MIT ✅
- markdown-it: MIT ✅
- dompurify: Apache-2.0 OR MPL-2.0 ✅
- fuse.js: Apache-2.0 ✅
- highlight.js: BSD-3-Clause ✅
- vite, vite-plugin-pwa, workbox-*: MIT ✅
- @lucide/static: ISC ✅
All compatible with MIT redistribution.

## Privacy posture
- ✅ README.md privacy paragraph: no analytics, no cookies, no PII
- ✅ No external network requests at runtime (only relative `/docs.json`, `/tree.json`, `/links.json`)
- ✅ Service worker scope = '/'; no cross-origin caching

## Findings: 0 critical, 0 warning, 0 suggestion.

VERDICT: PASS (compliance)
