# Screen Reader Support

Screen Reader Support covers a focused slice of the chromium codebase. See also [overview](overview.md). See also [rolls](../ops/rolls.md). See also [focus-order](focus-order.md).

It is part of the **accessibility** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [overview](overview.md). See also [rolls](../ops/rolls.md). See also [focus-order](focus-order.md).

## Usage

How to use this in day-to-day work. See also [overview](overview.md). See also [rolls](../ops/rolls.md). See also [focus-order](focus-order.md).

## Internals

Implementation details for those reading the source. See also [overview](overview.md). See also [rolls](../ops/rolls.md). See also [focus-order](focus-order.md).

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

Edge cases and known issues to look out for. See also [overview](overview.md). See also [rolls](../ops/rolls.md). See also [focus-order](focus-order.md).


_End of screen reader support._
