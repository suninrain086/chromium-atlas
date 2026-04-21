# Code Signing

Code Signing covers a focused slice of the chromium codebase. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

It is part of the **mac** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

## Usage

How to use this in day-to-day work. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

## Internals

Implementation details for those reading the source. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).

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

Edge cases and known issues to look out for. See also [overview](../security/overview.md). See also [presubmit](../scripting/presubmit.md).


_End of code signing._
