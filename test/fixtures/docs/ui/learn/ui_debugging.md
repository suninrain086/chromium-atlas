# UI Debugging

This document covers **UI Debugging** within the Chromium codebase. It lives under `docs/ui/learn` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `ui/learn/` folder.

## Overview

UI Debugging is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Apparmor Userns Restrictions](/security/apparmor-userns-restrictions.md)
- [2023 08 Inp](/speed/metrics_changelog/2023_08_inp.md)
- [Chrome Browser Design Principles](/chrome_browser_design_principles.md)
- [Cpp API From Rust](/rust/cpp_api_from_rust.md)
