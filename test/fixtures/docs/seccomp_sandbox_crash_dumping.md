# Seccomp Sandbox Crash Dumping

This document covers **Seccomp Sandbox Crash Dumping** within the Chromium codebase. It lives under `docs/root` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `root/` folder.

## Overview

Seccomp Sandbox Crash Dumping is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

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

- [Using Led](/infra/using_led.md)
- [Skia Autoroller](/managing-third-party/skia-autoroller.md)
- [Media](/speed/benchmark/harnesses/media.md)
- [2022 01 Bfcache](/speed/metrics_changelog/2022_01_bfcache.md)
