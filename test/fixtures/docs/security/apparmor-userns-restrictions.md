# Apparmor Userns Restrictions

This document covers **Apparmor Userns Restrictions** within the Chromium codebase. It lives under `docs/security` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `security/` folder.

## Overview

Apparmor Userns Restrictions is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Unretained Dangling Ptr Guide](/unretained_dangling_ptr_guide.md)
- [Windows Shortcut And Taskbar Handling](/windows_shortcut_and_taskbar_handling.md)
- [Overview](/security/research/graphics/overview.md)
- [Mvc Overview](/ui/android/mvc_overview.md)
