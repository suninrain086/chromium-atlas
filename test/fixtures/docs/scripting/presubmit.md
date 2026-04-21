# Presubmit Checks

Presubmit Checks covers a focused slice of the chromium codebase. See also [fuzzing](../testing/fuzzing.md). See also [python-style](python-style.md).

It is part of the **scripting** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [fuzzing](../testing/fuzzing.md). See also [python-style](python-style.md).

## Usage

How to use this in day-to-day work. See also [fuzzing](../testing/fuzzing.md). See also [python-style](python-style.md).

## Internals

Implementation details for those reading the source. See also [fuzzing](../testing/fuzzing.md). See also [python-style](python-style.md).

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

Edge cases and known issues to look out for. See also [fuzzing](../testing/fuzzing.md). See also [python-style](python-style.md).


_End of presubmit checks._
