# User Types

This document covers **User Types** within the Chromium codebase. It lives under `docs/login` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `login/` folder.

## Overview

User Types is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Builder Types](/infra/builder_types.md)
- [How To Repro Bot Failures](/testing/how_to_repro_bot_failures.md)
- [Inp](/speed/metrics_changelog/inp.md)
- [Proxy Config](/linux/proxy_config.md)
