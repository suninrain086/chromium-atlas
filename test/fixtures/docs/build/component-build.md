# Component Build Tips

Component Build Tips covers a focused slice of the chromium codebase. See also [notarization](../mac/notarization.md). See also [telemetry](../testing/telemetry.md).

It is part of the **build** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [notarization](../mac/notarization.md). See also [telemetry](../testing/telemetry.md).

## Usage

How to use this in day-to-day work. See also [notarization](../mac/notarization.md). See also [telemetry](../testing/telemetry.md).

## Internals

Implementation details for those reading the source. See also [notarization](../mac/notarization.md). See also [telemetry](../testing/telemetry.md).

### Subroutine

A worked example follows.

```gn
static_library("example") {
  sources = [ "example.cc", "example.h" ]
  deps = [ "//base", "//content/public/browser" ]
}
```

### Helper

And a second snippet:

```js
// devtools-frontend snippet
export function frame(node) {
  return node && node.frameOwnerNodeId;
}
```

## Caveats

Edge cases and known issues to look out for. See also [notarization](../mac/notarization.md). See also [telemetry](../testing/telemetry.md).


_End of component build tips._
