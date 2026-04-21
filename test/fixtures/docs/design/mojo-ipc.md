# Mojo IPC Patterns

Mojo IPC Patterns covers a focused slice of the chromium codebase. See also [component-build](../build/component-build.md). See also [process-model](process-model.md).

It is part of the **design** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [component-build](../build/component-build.md). See also [process-model](process-model.md).

## Usage

How to use this in day-to-day work. See also [component-build](../build/component-build.md). See also [process-model](process-model.md).

## Internals

Implementation details for those reading the source. See also [component-build](../build/component-build.md). See also [process-model](process-model.md).

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

Edge cases and known issues to look out for. See also [component-build](../build/component-build.md). See also [process-model](process-model.md).


_End of mojo ipc patterns._
