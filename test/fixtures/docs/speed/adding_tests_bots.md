# Adding Tests Bots

This document covers **Adding Tests Bots** within the Chromium codebase. It lives under `docs/speed` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `speed/` folder.

## Overview

Adding Tests Bots is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```python
def configure(args):
    return {"target": args.target, "use_remoteexec": True}
```

## See also

- [2025 02 Lcp](/speed/metrics_changelog/2025_02_lcp.md)
- [Mac Lld](/mac_lld.md)
- [Domain Lens](/patterns/domain-lens.md)
- [Proxy Config](/linux/proxy_config.md)
