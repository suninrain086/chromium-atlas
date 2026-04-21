# Site Isolation

Site Isolation covers a focused slice of the chromium codebase. See also [sandboxing](../linux/sandboxing.md). See also [arm64](../mac/arm64.md).

It is part of the **design** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [sandboxing](../linux/sandboxing.md). See also [arm64](../mac/arm64.md).

## Usage

How to use this in day-to-day work. See also [sandboxing](../linux/sandboxing.md). See also [arm64](../mac/arm64.md).

## Internals

Implementation details for those reading the source. See also [sandboxing](../linux/sandboxing.md). See also [arm64](../mac/arm64.md).

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

Edge cases and known issues to look out for. See also [sandboxing](../linux/sandboxing.md). See also [arm64](../mac/arm64.md).


_End of site isolation._
