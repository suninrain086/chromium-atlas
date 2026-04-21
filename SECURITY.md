# Security Policy

## Reporting a Vulnerability

If you believe you've found a security issue in chromium-atlas, please **do not**
open a public GitHub issue. Instead, email the maintainer:

**security@chromium-atlas.invalid** (replace with your real address)

Include:
- A description of the issue and where you found it
- Steps to reproduce (if applicable)
- The version / commit you were testing against

We aim to respond within **5 business days** and ship a fix or mitigation
within **30 days** for high-severity issues.

## Supported Versions

Only the latest minor release receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Threat model summary (v1.0)

chromium-atlas is a static SPA with no backend, no auth, no user data. The
threat surface is limited to:

1. **XSS via doc content** — mitigated by markdown-it `html: false`,
   DOMPurify, and a CSP `<meta>` (3-wall).
2. **Supply chain** — pinned npm versions, no postinstall scripts in our deps.
3. **Service worker cache poisoning** (v1.0.1+) — workbox precache integrity
   via revision hashes; SW versioned per build.

There is no PII, no analytics, no cookies, no third-party network calls
beyond the static asset host.
