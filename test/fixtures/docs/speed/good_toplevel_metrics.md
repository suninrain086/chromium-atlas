# Good Toplevel Metrics

This document covers **Good Toplevel Metrics** within the Chromium codebase. It lives under `docs/speed` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `speed/` folder.

## Overview

Good Toplevel Metrics is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Objectives](/memory/objectives.md)
- [Mixing Cpp And Objc](/mac/mixing_cpp_and_objc.md)
- [2022 03 Lcp Fcp](/speed/metrics_changelog/2022_03_lcp_fcp.md)
