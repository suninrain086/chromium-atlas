# Desktop UI

This document covers **Desktop UI** within the Chromium codebase. It lives under `docs/speed/benchmark/harnesses` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `speed/benchmark/harnesses/` folder.

## Overview

Desktop UI is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```sh
gn gen out/Default --args='is_debug=false'
autoninja -C out/Default chrome
```

## See also

- [Ios Voiceover](/ios_voiceover.md)
- [Wuwt E08 Processes](/transcripts/wuwt-e08-processes.md)
- [2021 06 Cls 2](/speed/metrics_changelog/2021_06_cls_2.md)
