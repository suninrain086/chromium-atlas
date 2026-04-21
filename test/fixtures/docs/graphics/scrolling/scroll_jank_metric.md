# Scroll Jank Metric

This document covers **Scroll Jank Metric** within the Chromium codebase. It lives under `docs/graphics/scrolling` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `graphics/scrolling/` folder.

## Overview

Scroll Jank Metric is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Implementation notes

Implementation details for Scroll Jank Metric are intentionally elided in this mock. Real content will be sourced from the chromium/src `docs/` tree once the v1.0.1 sync pipeline is wired.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Security Considerations For Browser UI](/security/security-considerations-for-browser-ui.md)
- [Help Improve Performance](/speed/help_improve_performance.md)
- [2024 06 Inp Lcp Fcp](/speed/metrics_changelog/2024_06_inp_lcp_fcp.md)
- [Site Search Explainer](/site_search_explainer.md)
