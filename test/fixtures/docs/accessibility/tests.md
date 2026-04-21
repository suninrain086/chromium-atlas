# Accessibility tests

How to write and run accessibility tests for chromium, including dump-tree expectations and event recorders.

## Dump-tree tests

Run `content_browsertests --gtest_filter=DumpAccessibilityTree*` to update expectation files.

```sh
autoninja -C out/Default content_browsertests
out/Default/content_browsertests --gtest_filter=DumpAccessibilityTree*
```

## Event recorders

Each platform has an event recorder; on Linux, see at-spi recorder. On Mac, see AX event observer.

### Cross-platform expectations

Expectation files live under content/test/data/accessibility/. See [the overview](overview.md) for context and [build flags](../build/gn_check.md).
