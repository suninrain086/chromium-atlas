# Animation Builder

This document covers **Animation Builder** within the Chromium codebase. It lives under `docs/ui/animation_builder` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `ui/animation_builder/` folder.

## Overview

Animation Builder is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Code Reviews](/code_reviews.md)
- [Windows Build Instructions](/windows_build_instructions.md)
- [2020 12 Cls](/speed/metrics_changelog/2020_12_cls.md)
