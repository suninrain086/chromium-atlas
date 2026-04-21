# Exploit Mitigations

Exploit Mitigations covers a focused slice of the chromium codebase. See also [screen-reader](../accessibility/screen-reader.md). See also [overview](../build/overview.md).

It is part of the **security** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [screen-reader](../accessibility/screen-reader.md). See also [overview](../build/overview.md).

## Usage

How to use this in day-to-day work. See also [screen-reader](../accessibility/screen-reader.md). See also [overview](../build/overview.md).

## Internals

Implementation details for those reading the source. See also [screen-reader](../accessibility/screen-reader.md). See also [overview](../build/overview.md).

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


_End of exploit mitigations._
