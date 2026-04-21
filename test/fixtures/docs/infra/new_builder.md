# New Builder

This document covers **New Builder** within the Chromium codebase. It lives under `docs/infra` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `infra/` folder.

## Overview

New Builder is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Implementation notes

Implementation details for New Builder are intentionally elided in this mock. Real content will be sourced from the chromium/src `docs/` tree once the v1.0.1 sync pipeline is wired.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [2020 05 Lcp](/speed/metrics_changelog/2020_05_lcp.md)
- [Oom](/memory/oom.md)
- [Login Dialog](/ui/create/examples/login_dialog.md)
- [Pgo](/pgo.md)
