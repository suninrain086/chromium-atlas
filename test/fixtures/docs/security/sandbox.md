# Sandbox Architecture

Sandbox Architecture covers a focused slice of the chromium codebase. See also [ninja](../build/ninja.md). See also [principles](../design/principles.md).

It is part of the **security** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [ninja](../build/ninja.md). See also [principles](../design/principles.md).

## Usage

How to use this in day-to-day work. See also [ninja](../build/ninja.md). See also [principles](../design/principles.md).

## Internals

Implementation details for those reading the source. See also [ninja](../build/ninja.md). See also [principles](../design/principles.md).

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


_End of sandbox architecture._
