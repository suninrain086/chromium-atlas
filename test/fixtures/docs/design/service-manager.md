# Service Manager Architecture

Service Manager Architecture covers a focused slice of the chromium codebase. See also [web-platform-tests](../testing/web-platform-tests.md). See also [fuzzing](../security/fuzzing.md).

It is part of the **design** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [web-platform-tests](../testing/web-platform-tests.md). See also [fuzzing](../security/fuzzing.md).

## Usage

How to use this in day-to-day work. See also [web-platform-tests](../testing/web-platform-tests.md). See also [fuzzing](../security/fuzzing.md).

## Internals

Implementation details for those reading the source. See also [web-platform-tests](../testing/web-platform-tests.md). See also [fuzzing](../security/fuzzing.md).

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


_End of service manager architecture._
