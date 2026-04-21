# Ask Before HTTP Adoption Guide

This document covers **Ask Before HTTP Adoption Guide** within the Chromium codebase. It lives under `docs/security/ask-before-http` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `security/ask-before-http/` folder.

## Overview

Ask Before HTTP Adoption Guide is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Using A Chroot](/linux/using_a_chroot.md)
- [Windows Build Instructions](/windows_build_instructions.md)
- [Test Executable API](/testing/test_executable_api.md)
- [2020 08 Lcp](/speed/metrics_changelog/2020_08_lcp.md)
