# Linux build instructions

Step-by-step build instructions for chromium on Linux. Targets Ubuntu LTS and recent Debian.

## Install build deps

Notes for install build deps are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.

```sh
sudo ./build/install-build-deps.sh
gclient sync
```

### Configure GN

See [the build overview](../build/overview.md).
