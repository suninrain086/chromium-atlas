# Web Tests With Manual Fallback

This document covers **Web Tests With Manual Fallback** within the Chromium codebase. It lives under `docs/testing` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `testing/` folder.

## Overview

Web Tests With Manual Fallback is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Graphics Pipeline](/linux/graphics_pipeline.md)
- [Style Guide](/imported/gn/style_guide.md)
- [Suid Sandbox Development](/linux/suid_sandbox_development.md)
- [Angle In Chromium](/angle_in_chromium.md)
