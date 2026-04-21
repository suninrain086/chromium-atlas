# Site isolation

Each site (eTLD+1) gets its own renderer process. The architecture and the security guarantees it provides.

## Process model

See the [linux sandbox doc](../linux/sandboxing.md) for how process boundaries are enforced.

```cpp
// In content/browser/site_instance_impl.cc
class SiteInstanceImpl : public SiteInstance { ... };
```

### Cross-origin embedding

Notes for cross-origin embedding are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.
