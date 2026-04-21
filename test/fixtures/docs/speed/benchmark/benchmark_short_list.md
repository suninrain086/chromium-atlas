# Benchmark Short List

This document covers **Benchmark Short List** within the Chromium codebase. It lives under `docs/speed/benchmark` and is part of the broader Chromium contributor documentation set.

Use this page as a starting point. For deeper coverage, see the linked references below or browse the surrounding `speed/benchmark/` folder.

## Overview

Benchmark Short List is concerned with the design, implementation, and operational characteristics of the relevant subsystem. The text on this page is a placeholder for the v1.0 mock fixture build of chromium-atlas.

## Getting started

Before diving in, ensure your checkout is up to date and that you have read the README under the same folder. The mock fixture intentionally keeps the structure realistic while the prose is generic.

## Example

```python
def configure(args):
    return {"target": args.target, "use_remoteexec": True}
```

## See also

- [2024 07 Inp](/speed/metrics_changelog/2024_07_inp.md)
- [Video Decoder Perf Test Usage](/media/gpu/video_decoder_perf_test_usage.md)
- [Windows Build Instructions](/windows_build_instructions.md)
