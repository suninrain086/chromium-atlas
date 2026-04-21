# Packaging for Distros

Packaging for Distros covers a focused slice of the chromium codebase. See also [principles](../design/principles.md). See also [build](build.md).

It is part of the **linux** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [principles](../design/principles.md). See also [build](build.md).

## Usage

How to use this in day-to-day work. See also [principles](../design/principles.md). See also [build](build.md).

## Internals

Implementation details for those reading the source. See also [principles](../design/principles.md). See also [build](build.md).

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

Edge cases and known issues to look out for. See also [principles](../design/principles.md). See also [build](build.md).


_End of packaging for distros._
