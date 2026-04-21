# Focus Order Rules

Focus Order Rules covers a focused slice of the chromium codebase. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

It is part of the **accessibility** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

## Usage

How to use this in day-to-day work. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

## Internals

Implementation details for those reading the source. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

### Subroutine

A worked example follows.

```cpp
// content/browser/example.cc
#include "base/logging.h"

void Example::Run() {
  LOG(INFO) << "hello from chromium";
  if (frame_) frame_->Render();
}
```

### Helper

And a second snippet:

```sh
# fetch and build
gclient sync
autoninja -C out/Default chrome
```

## Caveats

Edge cases and known issues to look out for. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).


_End of focus order rules._
