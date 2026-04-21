# Fuzzing

Chromium uses libfuzzer + ClusterFuzz for continuous fuzzing of parsers and IPC interfaces.

## Writing a fuzzer

Notes for writing a fuzzer are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.

```cpp
extern "C" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size) {
  return 0;
}
```

### Running locally

Notes for running locally are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.
