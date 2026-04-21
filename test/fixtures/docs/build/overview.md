# Build overview

How to build chromium from source — dependencies, gclient, gn, and ninja.

## Dependencies

Run install-build-deps.sh on Linux.

```sh
./build/install-build-deps.sh
gclient sync
gn gen out/Default
```

## Generating GN args

See [gn_check](gn_check.md) for verifying your args.

```gn
is_debug = false
is_component_build = true
symbol_level = 1
```

### Building

Use `autoninja -C out/Default chrome`. For testing builds, see [the testing overview](../testing/overview.md).
