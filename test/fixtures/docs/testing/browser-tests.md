# Browser Tests

Browser Tests covers a focused slice of the chromium codebase. See also [mojo-ipc](../design/mojo-ipc.md). See also [sandboxing](../linux/sandboxing.md).

It is part of the **testing** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [mojo-ipc](../design/mojo-ipc.md). See also [sandboxing](../linux/sandboxing.md).

## Usage

How to use this in day-to-day work. See also [mojo-ipc](../design/mojo-ipc.md). See also [sandboxing](../linux/sandboxing.md).

## Internals

Implementation details for those reading the source. See also [mojo-ipc](../design/mojo-ipc.md). See also [sandboxing](../linux/sandboxing.md).

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

Edge cases and known issues to look out for. See also [mojo-ipc](../design/mojo-ipc.md). See also [sandboxing](../linux/sandboxing.md).


_End of browser tests._
