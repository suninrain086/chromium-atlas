# ARIA Roles in Chromium

ARIA Roles in Chromium covers a focused slice of the chromium codebase. See also [overview](overview.md). See also [focus-order](focus-order.md). See also [ninja](../build/ninja.md).

It is part of the **accessibility** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [overview](overview.md). See also [focus-order](focus-order.md). See also [ninja](../build/ninja.md).

## Usage

How to use this in day-to-day work. See also [overview](overview.md). See also [focus-order](focus-order.md). See also [ninja](../build/ninja.md).

## Internals

Implementation details for those reading the source. See also [overview](overview.md). See also [focus-order](focus-order.md). See also [ninja](../build/ninja.md).

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


_End of aria roles in chromium._
