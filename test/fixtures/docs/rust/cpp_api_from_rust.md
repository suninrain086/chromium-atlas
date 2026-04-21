# Cpp API From Rust

This document covers **Cpp API From Rust** within the Chromium codebase. It lives under `docs/rust` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `rust/` folder.

## Overview

Cpp API From Rust is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

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

- [Ia2 To UIA](/accessibility/browser/ia2_to_uia.md)
- [C++ Style Changes](/process/c++_style_changes.md)
- [Qtcreator](/qtcreator.md)
