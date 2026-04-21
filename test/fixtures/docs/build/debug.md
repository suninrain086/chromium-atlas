# Debug Builds and Symbols

Debug Builds and Symbols covers a focused slice of the chromium codebase. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

It is part of the **build** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

## Usage

How to use this in day-to-day work. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

## Internals

Implementation details for those reading the source. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).

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

Edge cases and known issues to look out for. See also [debugging](../linux/debugging.md). See also [unit-tests](../testing/unit-tests.md).


_End of debug builds and symbols._
