# Writing Unit Tests

Writing Unit Tests covers a focused slice of the chromium codebase. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

It is part of the **testing** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

## Usage

How to use this in day-to-day work. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

## Internals

Implementation details for those reading the source. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

### Subroutine

A worked example follows.

```js
// devtools-frontend snippet
export function frame(node) {
  return node && node.frameOwnerNodeId;
}
```

### Helper

And a second snippet:

```gn
static_library("example") {
  sources = [ "example.cc", "example.h" ]
  deps = [ "//base", "//content/public/browser" ]
}
```


_End of writing unit tests._
