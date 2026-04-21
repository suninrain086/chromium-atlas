# Accessibility overview

How chromium implements accessibility on every platform — the AXTree, accessibility events, and the per-platform bridges.

## Architecture

All platform accessibility APIs are fed from a single in-process AXTree representation. See [tests](tests.md) for how this is verified, and the platform-specific implementations under [linux/sandboxing](../linux/sandboxing.md) for sandbox interactions.

```cpp
// In content/browser/accessibility/browser_accessibility_manager.cc
std::unique_ptr<BrowserAccessibilityManager> CreateManager(...);
```

### AXTree

An immutable per-frame snapshot.

### ATK on Linux

Bridged via libatk-bridge.

### UI Automation on Windows

See windows-specific notes.
