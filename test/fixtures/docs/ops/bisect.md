# Bisect a Regression

Bisect a Regression covers a focused slice of the chromium codebase. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

It is part of the **ops** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

## Usage

How to use this in day-to-day work. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

## Internals

Implementation details for those reading the source. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

### Subroutine

A worked example follows.

```sh
# fetch and build
gclient sync
autoninja -C out/Default chrome
```

### Helper

And a second snippet:

```cpp
// content/browser/example.cc
#include "base/logging.h"

void Example::Run() {
  LOG(INFO) << "hello from chromium";
  if (frame_) frame_->Render();
}
```


_End of bisect a regression._
