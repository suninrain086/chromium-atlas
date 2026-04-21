# Python Style Guide

Python Style Guide covers a focused slice of the chromium codebase. See also [principles](../design/principles.md). See also [build](../linux/build.md).

It is part of the **scripting** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [principles](../design/principles.md). See also [build](../linux/build.md).

## Usage

How to use this in day-to-day work. See also [principles](../design/principles.md). See also [build](../linux/build.md).

## Internals

Implementation details for those reading the source. See also [principles](../design/principles.md). See also [build](../linux/build.md).

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


_End of python style guide._
