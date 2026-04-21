# GN Check Reference

GN Check Reference covers a focused slice of the chromium codebase. See also [live-regions](../accessibility/live-regions.md). See also [jumbo](jumbo.md).

It is part of the **build** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [live-regions](../accessibility/live-regions.md). See also [jumbo](jumbo.md).

## Usage

How to use this in day-to-day work. See also [live-regions](../accessibility/live-regions.md). See also [jumbo](jumbo.md).

## Internals

Implementation details for those reading the source. See also [live-regions](../accessibility/live-regions.md). See also [jumbo](jumbo.md).

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


_End of gn check reference._
