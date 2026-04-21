# Running axe-core Tests

Running axe-core Tests covers a focused slice of the chromium codebase. See also [color-contrast](color-contrast.md). See also [clang](../build/clang.md).

It is part of the **accessibility** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [color-contrast](color-contrast.md). See also [clang](../build/clang.md).

## Usage

How to use this in day-to-day work. See also [color-contrast](color-contrast.md). See also [clang](../build/clang.md).

## Internals

Implementation details for those reading the source. See also [color-contrast](color-contrast.md). See also [clang](../build/clang.md).

### Subroutine

A worked example follows.

```bash
# bisect helper
git bisect start HEAD HEAD~50
git bisect run ./tools/check.sh
```

### Helper

And a second snippet:

```python
# tools/example.py
def build_targets(targets):
    for t in targets:
        print(f"building {t}")
    return 0
```

## Caveats

Edge cases and known issues to look out for. See also [color-contrast](color-contrast.md). See also [clang](../build/clang.md).


_End of running axe-core tests._
