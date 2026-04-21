# Live Regions and Announcements

Live Regions and Announcements covers a focused slice of the chromium codebase. See also [telemetry](../testing/telemetry.md). See also [depot-tools](../scripting/depot-tools.md).

It is part of the **accessibility** area and pairs well with neighboring documents in the same folder.

## Background

This document describes part of the chromium codebase. See also [telemetry](../testing/telemetry.md). See also [depot-tools](../scripting/depot-tools.md).

## Usage

How to use this in day-to-day work. See also [telemetry](../testing/telemetry.md). See also [depot-tools](../scripting/depot-tools.md).

## Internals

Implementation details for those reading the source. See also [telemetry](../testing/telemetry.md). See also [depot-tools](../scripting/depot-tools.md).

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


_End of live regions and announcements._
