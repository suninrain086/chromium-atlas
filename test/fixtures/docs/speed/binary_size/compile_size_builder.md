# Compile Size Builder

This document covers **Compile Size Builder** within the Chromium codebase. It lives under `docs/speed/binary_size` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `speed/binary_size/` folder.

## Overview

Compile Size Builder is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Service Worker Security Faq](/security/service-worker-security-faq.md)
- [Dev Manual](/updater/dev_manual.md)
