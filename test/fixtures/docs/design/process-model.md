# Process Model

Process Model covers a focused slice of the chromium codebase. See also [cross-compile](../build/cross-compile.md). See also [site-isolation](site-isolation.md).

It is part of the **design** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [cross-compile](../build/cross-compile.md). See also [site-isolation](site-isolation.md).

## Usage

How to use this in day-to-day work. See also [cross-compile](../build/cross-compile.md). See also [site-isolation](site-isolation.md).

## Internals

Implementation details for those reading the source. See also [cross-compile](../build/cross-compile.md). See also [site-isolation](site-isolation.md).

### Subroutine

A worked example follows.

```python
# tools/example.py
def build_targets(targets):
    for t in targets:
        print(f"building {t}")
    return 0
```

### Helper

And a second snippet:

```bash
# bisect helper
git bisect start HEAD HEAD~50
git bisect run ./tools/check.sh
```


_End of process model._
