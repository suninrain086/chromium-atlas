# Perf Lab Platforms

This document covers **Perf Lab Platforms** within the Chromium codebase. It lives under `docs/speed` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `speed/` folder.

## Overview

Perf Lab Platforms is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Implementation notes

Implementation details for Perf Lab Platforms are intentionally elided in this mock. Real content will be sourced from the chromium/src `docs/` tree once the v1.0.1 sync pipeline is wired.

## Example

```cpp
#include "base/logging.h"

void DoTheThing() {
  LOG(INFO) << "hello";
}
```

## See also

- [Build Instructions](/ios/build_instructions.md)
- [2024 06 Inp Lcp Fcp](/speed/metrics_changelog/2024_06_inp_lcp_fcp.md)
