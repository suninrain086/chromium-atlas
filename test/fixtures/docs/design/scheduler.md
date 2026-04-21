# Renderer Scheduler

Renderer Scheduler covers a focused slice of the chromium codebase. See also [compositor](compositor.md). See also [signing](../mac/signing.md).

It is part of the **design** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [compositor](compositor.md). See also [signing](../mac/signing.md).

## Usage

How to use this in day-to-day work. See also [compositor](compositor.md). See also [signing](../mac/signing.md).

## Internals

Implementation details for those reading the source. See also [compositor](compositor.md). See also [signing](../mac/signing.md).

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


_End of renderer scheduler._
