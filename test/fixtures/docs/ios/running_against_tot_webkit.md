# Running Against Tot Webkit

This document covers **Running Against Tot Webkit** within the Chromium codebase. It lives under `docs/ios` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `ios/` folder.

## Overview

Running Against Tot Webkit is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

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

- [Graphics Metrics](/memory/graphics_metrics.md)
- [2020 10 Cls 2](/speed/metrics_changelog/2020_10_cls_2.md)
- [2024 06 Inp Lcp Fcp](/speed/metrics_changelog/2024_06_inp_lcp_fcp.md)
