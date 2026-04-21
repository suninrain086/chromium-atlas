# Patts

This document covers **Patts** within the Chromium codebase. It lives under `docs/accessibility/os` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `accessibility/os/` folder.

## Overview

Patts is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

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

- [Activity Result Tracker](/ui/android/activity_result_tracker.md)
- [Windows Split Dll](/windows_split_dll.md)
- [About Hotkeys And Keycodes](/mac/about_hotkeys_and_keycodes.md)
