# Arc

This document covers **Arc** within the Chromium codebase. It lives under `docs/mac` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `mac/` folder.

## Overview

Arc is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```python
def configure(args):
    return {"target": args.target, "use_remoteexec": True}
```

## See also

- [Kiosk Public Session](/enterprise/kiosk_public_session.md)
- [Delegated Triage](/security/delegated-triage.md)
- [2020 11 Lcp](/speed/metrics_changelog/2020_11_lcp.md)
