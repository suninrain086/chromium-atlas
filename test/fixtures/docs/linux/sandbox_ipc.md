# Sandbox IPC

This document covers **Sandbox IPC** within the Chromium codebase. It lives under `docs/linux` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `linux/` folder.

## Overview

Sandbox IPC is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

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

- [2025 02 Lcp](/speed/metrics_changelog/2025_02_lcp.md)
- [Tour Of Luci UI](/tour_of_luci_ui.md)
- [Builder And Parameter Bundle](/patterns/builder-and-parameter-bundle.md)
- [Gerrit Guide](/gerrit_guide.md)
