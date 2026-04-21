# depot_tools Reference

depot_tools Reference covers a focused slice of the chromium codebase. See also [live-regions](../accessibility/live-regions.md). See also [cross-compile](../build/cross-compile.md).

It is part of the **scripting** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [live-regions](../accessibility/live-regions.md). See also [cross-compile](../build/cross-compile.md).

## Usage

How to use this in day-to-day work. See also [live-regions](../accessibility/live-regions.md). See also [cross-compile](../build/cross-compile.md).

## Internals

Implementation details for those reading the source. See also [live-regions](../accessibility/live-regions.md). See also [cross-compile](../build/cross-compile.md).

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

Edge cases and known issues to look out for. See also [live-regions](../accessibility/live-regions.md). See also [cross-compile](../build/cross-compile.md).


_End of depot_tools reference._
