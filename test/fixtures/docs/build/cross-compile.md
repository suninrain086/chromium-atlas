# Cross Compiling

Cross Compiling covers a focused slice of the chromium codebase. See also [overview](overview.md). See also [cpp-sample](cpp-sample.md).

It is part of the **build** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [overview](overview.md). See also [cpp-sample](cpp-sample.md).

## Usage

How to use this in day-to-day work. See also [overview](overview.md). See also [cpp-sample](cpp-sample.md).

## Internals

Implementation details for those reading the source. See also [overview](overview.md). See also [cpp-sample](cpp-sample.md).

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

Edge cases and known issues to look out for. See also [overview](overview.md). See also [cpp-sample](cpp-sample.md).


_End of cross compiling._
