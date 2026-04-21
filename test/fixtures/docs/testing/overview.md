# Testing overview

Top-level guide to chromium's test categories: unit, browser, web platform, and integration tests.

## Test categories

Notes for test categories are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.

```sh
autoninja -C out/Default unit_tests
out/Default/unit_tests --gtest_filter=Foo*
```

### Running tests

See [browser tests](browser_tests.md) and [web tests](web_tests.md).
