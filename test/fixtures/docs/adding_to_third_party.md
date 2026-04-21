# Adding To Third Party

This document covers **Adding To Third Party** within the Chromium codebase. It lives under `docs/root` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `root/` folder.

## Overview

Adding To Third Party is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Chrome Browser Design Principles](/chrome_browser_design_principles.md)
- [2020 05 Fid](/speed/metrics_changelog/2020_05_fid.md)
- [Saml Authentication](/enterprise/saml_authentication.md)
- [Class Splitting](/ui/views/class_splitting.md)
