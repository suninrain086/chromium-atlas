# C++ Code Sample

C++ Code Sample covers a focused slice of the chromium codebase. See also [build](../mac/build.md). See also [web-platform-tests](../testing/web-platform-tests.md).

It is part of the **build** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [build](../mac/build.md). See also [web-platform-tests](../testing/web-platform-tests.md).

## Usage

How to use this in day-to-day work. See also [build](../mac/build.md). See also [web-platform-tests](../testing/web-platform-tests.md).

## Internals

Implementation details for those reading the source. See also [build](../mac/build.md). See also [web-platform-tests](../testing/web-platform-tests.md).

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


_End of c++ code sample._
