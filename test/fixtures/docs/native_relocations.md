# Native Relocations

This document covers **Native Relocations** within the Chromium codebase. It lives under `docs/root` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `root/` folder.

## Overview

Native Relocations is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```cpp
#include "base/logging.h"

void DoTheThing() {
  LOG(INFO) << "hello";
}
```

## See also

- [Minidump To Core](/linux/minidump_to_core.md)
- [Perf Lab Platforms](/speed/perf_lab_platforms.md)
- [Style](/ios/style.md)
