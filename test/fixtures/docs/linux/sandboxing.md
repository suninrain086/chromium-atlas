# Linux sandboxing

How the renderer and other helper processes are sandboxed on Linux using user namespaces and seccomp-bpf.

## Layers

Layer 1 is user namespaces; layer 2 is seccomp-bpf. See [the security model](../design/security_model.md).

```cpp
// In sandbox/linux/seccomp-bpf-helpers/sigsys_handlers.cc
bpf_dsl::ResultExpr Handler(int sysno);
```

### seccomp-bpf

Notes for seccomp-bpf are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.
