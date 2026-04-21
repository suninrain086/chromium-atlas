# Vulnerability Rewards Program

Vulnerability Rewards Program covers a focused slice of the chromium codebase. See also [process-model](../design/process-model.md). See also [wayland](../linux/wayland.md).

It is part of the **security** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [process-model](../design/process-model.md). See also [wayland](../linux/wayland.md).

## Usage

How to use this in day-to-day work. See also [process-model](../design/process-model.md). See also [wayland](../linux/wayland.md).

## Internals

Implementation details for those reading the source. See also [process-model](../design/process-model.md). See also [wayland](../linux/wayland.md).

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


_End of vulnerability rewards program._
