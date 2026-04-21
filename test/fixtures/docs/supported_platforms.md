# Supported Platforms

This document covers **Supported Platforms** within the Chromium codebase. It lives under `docs/root` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `root/` folder.

## Overview

Supported Platforms is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Implementation notes

Implementation details for Supported Platforms are intentionally elided in this mock. Real content will be sourced from the chromium/src `docs/` tree once the v1.0.1 sync pipeline is wired.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Installer API Mac](/updater/installer_api_mac.md)
- [Finding Reviewer](/finding_reviewer.md)
- [2021 06 Cls 2](/speed/metrics_changelog/2021_06_cls_2.md)
