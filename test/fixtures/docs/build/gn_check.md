# Verifying GN build args

Use `gn check` to catch include violations and `gn args` to inspect the resolved arg set.

## Checking includes

Notes for checking includes are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.

```sh
gn check out/Default //content/browser/*
```

### Listing args

`gn args out/Default --list`. See the [build overview](overview.md).
