# Web Platform Tests

Web Platform Tests covers a focused slice of the chromium codebase. See also [service-manager](../design/service-manager.md). See also [debugging](../linux/debugging.md).

It is part of the **testing** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [service-manager](../design/service-manager.md). See also [debugging](../linux/debugging.md).

## Usage

How to use this in day-to-day work. See also [service-manager](../design/service-manager.md). See also [debugging](../linux/debugging.md).

## Internals

Implementation details for those reading the source. See also [service-manager](../design/service-manager.md). See also [debugging](../linux/debugging.md).

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


_End of web platform tests._
