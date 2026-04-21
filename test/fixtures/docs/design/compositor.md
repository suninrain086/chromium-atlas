# Compositor Pipeline

Compositor Pipeline covers a focused slice of the chromium codebase. See also [unit-tests](../testing/unit-tests.md). See also [mitigations](../security/mitigations.md).

It is part of the **design** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [unit-tests](../testing/unit-tests.md). See also [mitigations](../security/mitigations.md).

## Usage

How to use this in day-to-day work. See also [unit-tests](../testing/unit-tests.md). See also [mitigations](../security/mitigations.md).

## Internals

Implementation details for those reading the source. See also [unit-tests](../testing/unit-tests.md). See also [mitigations](../security/mitigations.md).

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

Edge cases and known issues to look out for. See also [unit-tests](../testing/unit-tests.md). See also [mitigations](../security/mitigations.md).


_End of compositor pipeline._
