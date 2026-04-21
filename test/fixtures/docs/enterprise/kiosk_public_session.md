# Kiosk Public Session

This document covers **Kiosk Public Session** within the Chromium codebase. It lives under `docs/enterprise` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `enterprise/` folder.

## Overview

Kiosk Public Session is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```python
def configure(args):
    return {"target": args.target, "use_remoteexec": True}
```

## See also

- [Multiscreen Testing](/ui/display/multiscreen_testing.md)
- [Unrealized Web State](/ios/unrealized_web_state.md)
- [Using Crashpad With Content Shell](/testing/using_crashpad_with_content_shell.md)
