/**
 * Generate ~50 mock chromium-style docs under test/fixtures/docs/.
 * Deterministic — no Date.now / Math.random; output is stable across runs.
 *
 * Usage: tsx test/fixtures/generate.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve("test", "fixtures", "docs");

interface Spec {
  path: string;
  title: string;
  description: string;
  sections: { heading: string; level: 2 | 3; body?: string }[];
  links?: string[];        // relative .md links to other fixtures
  code?: { lang: string; body: string }[];
}

const SPECS: Spec[] = [
  {
    path: "README.md",
    title: "Chromium developer documentation",
    description: "Top-level entry point for the chromium developer documentation tree. Start here.",
    sections: [
      { heading: "Getting started", level: 2, body: "New contributors should read the [build overview](build/overview.md) and the [accessibility overview](accessibility/overview.md) before opening their first patch." },
      { heading: "Major topic areas", level: 2, body: "The tree is organized by subsystem. The most active areas in v117+ are Build, Accessibility, Testing, and the platform-specific docs under linux/, mac/, and windows/." },
      { heading: "Reporting bugs", level: 3, body: "File at crbug.com using the appropriate component." },
    ],
    links: ["build/overview.md", "accessibility/overview.md", "testing/overview.md"],
    code: [{ lang: "sh", body: "git clone https://chromium.googlesource.com/chromium/src.git" }],
  },

  // Accessibility (~9 docs to mirror real Gitiles page)
  {
    path: "accessibility/overview.md",
    title: "Accessibility overview",
    description: "How chromium implements accessibility on every platform — the AXTree, accessibility events, and the per-platform bridges.",
    sections: [
      { heading: "Architecture", level: 2, body: "All platform accessibility APIs are fed from a single in-process AXTree representation. See [tests](tests.md) for how this is verified, and the platform-specific implementations under [linux/sandboxing](../linux/sandboxing.md) for sandbox interactions." },
      { heading: "AXTree", level: 3, body: "An immutable per-frame snapshot." },
      { heading: "ATK on Linux", level: 3, body: "Bridged via libatk-bridge." },
      { heading: "UI Automation on Windows", level: 3, body: "See windows-specific notes." },
    ],
    links: ["accessibility/tests.md", "linux/sandboxing.md", "accessibility/chromevox_on_chrome_os.md"],
    code: [{ lang: "cpp", body: "// In content/browser/accessibility/browser_accessibility_manager.cc\nstd::unique_ptr<BrowserAccessibilityManager> CreateManager(...);" }],
  },
  {
    path: "accessibility/tests.md",
    title: "Accessibility tests",
    description: "How to write and run accessibility tests for chromium, including dump-tree expectations and event recorders.",
    sections: [
      { heading: "Dump-tree tests", level: 2, body: "Run `content_browsertests --gtest_filter=DumpAccessibilityTree*` to update expectation files." },
      { heading: "Event recorders", level: 2, body: "Each platform has an event recorder; on Linux, see at-spi recorder. On Mac, see AX event observer." },
      { heading: "Cross-platform expectations", level: 3, body: "Expectation files live under content/test/data/accessibility/. See [the overview](overview.md) for context and [build flags](../build/gn_check.md)." },
    ],
    links: ["accessibility/overview.md", "build/gn_check.md"],
    code: [{ lang: "sh", body: "autoninja -C out/Default content_browsertests\nout/Default/content_browsertests --gtest_filter=DumpAccessibilityTree*" }],
  },
  {
    path: "accessibility/chromevox_on_chrome_os.md",
    title: "ChromeVox on ChromeOS",
    description: "ChromeVox is the built-in screen reader for ChromeOS. This page documents the development setup and architecture.",
    sections: [
      { heading: "Architecture", level: 2, body: "ChromeVox runs as a chrome extension with private API access to the AXTree." },
      { heading: "Development build", level: 2, body: "Use the chromevox panel to enable from chrome://extensions." },
      { heading: "Testing", level: 3, body: "See [tests](tests.md) for the e2e setup." },
    ],
    links: ["accessibility/tests.md"],
    code: [{ lang: "js", body: "chrome.automation.getDesktop(function(desktop) {\n  desktop.find({attributes: {role: 'button'}});\n});" }],
  },
  {
    path: "accessibility/aria_attributes.md",
    title: "ARIA attribute mapping",
    description: "How chromium maps ARIA attributes from the DOM to the AXTree and out to platform APIs.",
    sections: [
      { heading: "Mapping table", level: 2, body: "The full mapping lives in third_party/blink/renderer/modules/accessibility/." },
      { heading: "Computed roles", level: 3, body: "Many ARIA roles are computed lazily." },
    ],
    links: ["accessibility/overview.md"],
  },
  {
    path: "accessibility/browser_tests.md",
    title: "Accessibility browser tests",
    description: "How browser tests interact with the AXTree fixture infrastructure.",
    sections: [
      { heading: "Fixture base", level: 2, body: "AccessibilityBrowserTest." },
      { heading: "Dump tests", level: 3, body: "See [tests](tests.md)." },
    ],
    links: ["accessibility/tests.md"],
  },
  {
    path: "accessibility/dump_tree.md",
    title: "Dump-accessibility-tree tests",
    description: "Expectation-based tests that snapshot the AXTree and compare to a baseline.",
    sections: [
      { heading: "How it works", level: 2 },
      { heading: "Updating baselines", level: 2, body: "Pass --rebase to regenerate." },
    ],
    links: ["accessibility/tests.md"],
  },
  {
    path: "accessibility/automation_api.md",
    title: "chrome.automation API",
    description: "Extension API for traversing the live AXTree from javascript.",
    sections: [
      { heading: "Roots", level: 2 },
      { heading: "Walking the tree", level: 3, body: "Use `find()` and `findAll()`." },
    ],
  },
  {
    path: "accessibility/atk_on_linux.md",
    title: "ATK on Linux",
    description: "How chromium bridges to ATK / AT-SPI on Linux and ChromeOS.",
    sections: [
      { heading: "Bridge process", level: 2 },
      { heading: "Sandboxing constraints", level: 3, body: "See [the linux sandbox doc](../linux/sandboxing.md)." },
    ],
    links: ["linux/sandboxing.md"],
  },
  {
    path: "accessibility/uia_on_windows.md",
    title: "UI Automation on Windows",
    description: "Implementation notes for the chromium UIA provider, including known compatibility quirks with Narrator and NVDA.",
    sections: [
      { heading: "Provider", level: 2 },
      { heading: "Compatibility", level: 3, body: "See the [windows accessibility notes](../windows/accessibility.md)." },
    ],
    links: ["windows/accessibility.md"],
  },

  // Build (~9 docs)
  {
    path: "build/overview.md",
    title: "Build overview",
    description: "How to build chromium from source — dependencies, gclient, gn, and ninja.",
    sections: [
      { heading: "Dependencies", level: 2, body: "Run install-build-deps.sh on Linux." },
      { heading: "Generating GN args", level: 2, body: "See [gn_check](gn_check.md) for verifying your args." },
      { heading: "Building", level: 3, body: "Use `autoninja -C out/Default chrome`. For testing builds, see [the testing overview](../testing/overview.md)." },
    ],
    links: ["build/gn_check.md", "testing/overview.md"],
    code: [
      { lang: "sh", body: "./build/install-build-deps.sh\ngclient sync\ngn gen out/Default" },
      { lang: "gn", body: "is_debug = false\nis_component_build = true\nsymbol_level = 1" },
    ],
  },
  {
    path: "build/gn_check.md",
    title: "Verifying GN build args",
    description: "Use `gn check` to catch include violations and `gn args` to inspect the resolved arg set.",
    sections: [
      { heading: "Checking includes", level: 2 },
      { heading: "Listing args", level: 3, body: "`gn args out/Default --list`. See the [build overview](overview.md)." },
    ],
    links: ["build/overview.md"],
    code: [{ lang: "sh", body: "gn check out/Default //content/browser/*" }],
  },
  {
    path: "build/python_requirements.md",
    title: "Python requirements",
    description: "All build-time python tooling targets python3 ≥ 3.9.",
    sections: [
      { heading: "vpython", level: 2 },
      { heading: "Cipd packages", level: 3 },
    ],
    code: [{ lang: "python", body: "import sys\nassert sys.version_info >= (3, 9), 'Python 3.9+ required'" }],
  },
  {
    path: "build/component_build.md",
    title: "Component build",
    description: "is_component_build splits chromium into many shared libraries for faster incremental linking.",
    sections: [
      { heading: "Trade-offs", level: 2 },
      { heading: "When to disable", level: 3, body: "For perf testing, set `is_component_build = false`. See [overview](overview.md)." },
    ],
    links: ["build/overview.md"],
  },
  {
    path: "build/jumbo.md",
    title: "Jumbo builds (deprecated)",
    description: "Jumbo builds (a.k.a. unity builds) are deprecated in favor of regular component builds.",
    sections: [{ heading: "Status", level: 2, body: "Removed in m100." }],
  },
  {
    path: "build/clang.md",
    title: "Building with clang",
    description: "Chromium ships its own clang toolchain in third_party/llvm-build.",
    sections: [
      { heading: "Updating the toolchain", level: 2 },
      { heading: "Local clang builds", level: 3 },
    ],
    code: [{ lang: "sh", body: "tools/clang/scripts/update.py" }],
  },
  {
    path: "build/lld.md",
    title: "Linking with lld",
    description: "lld is the default linker. Notes on debugging linker issues, especially for thin-LTO builds.",
    sections: [{ heading: "Debugging", level: 2 }],
  },
  {
    path: "build/code_coverage.md",
    title: "Code coverage",
    description: "How to generate and read clang source-based coverage for chromium.",
    sections: [
      { heading: "Generating", level: 2 },
      { heading: "Viewing", level: 2, body: "See [testing overview](../testing/overview.md)." },
    ],
    links: ["testing/overview.md"],
    code: [{ lang: "sh", body: "tools/code_coverage/coverage.py components_unittests -b out/Coverage" }],
  },
  {
    path: "build/reclient.md",
    title: "Distributed builds with reclient",
    description: "Reclient is the supported distributed build tool. Goma is deprecated.",
    sections: [{ heading: "Setup", level: 2 }],
  },

  // Design (~6 docs)
  {
    path: "design/site_isolation.md",
    title: "Site isolation",
    description: "Each site (eTLD+1) gets its own renderer process. The architecture and the security guarantees it provides.",
    sections: [
      { heading: "Process model", level: 2, body: "See the [linux sandbox doc](../linux/sandboxing.md) for how process boundaries are enforced." },
      { heading: "Cross-origin embedding", level: 3 },
    ],
    links: ["linux/sandboxing.md"],
    code: [{ lang: "cpp", body: "// In content/browser/site_instance_impl.cc\nclass SiteInstanceImpl : public SiteInstance { ... };" }],
  },
  {
    path: "design/mojo.md",
    title: "Mojo IPC",
    description: "Mojo is chromium's IPC system. All process boundaries cross via Mojo interfaces.",
    sections: [
      { heading: "Interface definition", level: 2 },
      { heading: "Bindings", level: 3 },
    ],
    code: [{ lang: "cpp", body: "interface Foo {\n  DoBar(int32 x) => (string result);\n};" }],
  },
  {
    path: "design/security_model.md",
    title: "Security model",
    description: "Defense in depth: sandboxing, site isolation, and the rule of two.",
    sections: [
      { heading: "Rule of two", level: 2, body: "See also: [site isolation](site_isolation.md), [linux sandbox](../linux/sandboxing.md)." },
      { heading: "Privilege separation", level: 3 },
    ],
    links: ["design/site_isolation.md", "linux/sandboxing.md"],
  },
  {
    path: "design/threading.md",
    title: "Threading",
    description: "Chromium's threading model — sequences, task runners, and the rules around blocking.",
    sections: [
      { heading: "Sequences", level: 2 },
      { heading: "Task runners", level: 3 },
    ],
  },
  {
    path: "design/network_stack.md",
    title: "Network stack",
    description: "Architecture of the chromium network service.",
    sections: [
      { heading: "URLLoader", level: 2 },
      { heading: "Out-of-process", level: 3 },
    ],
  },
  {
    path: "design/v8_integration.md",
    title: "V8 integration",
    description: "How blink embeds V8 — isolates, contexts, microtasks.",
    sections: [
      { heading: "Isolates", level: 2 },
      { heading: "Microtask checkpoints", level: 3 },
    ],
  },

  // Linux (~6 docs)
  {
    path: "linux/sandboxing.md",
    title: "Linux sandboxing",
    description: "How the renderer and other helper processes are sandboxed on Linux using user namespaces and seccomp-bpf.",
    sections: [
      { heading: "Layers", level: 2, body: "Layer 1 is user namespaces; layer 2 is seccomp-bpf. See [the security model](../design/security_model.md)." },
      { heading: "seccomp-bpf", level: 3 },
    ],
    links: ["design/security_model.md"],
    code: [{ lang: "cpp", body: "// In sandbox/linux/seccomp-bpf-helpers/sigsys_handlers.cc\nbpf_dsl::ResultExpr Handler(int sysno);" }],
  },
  {
    path: "linux/build_instructions.md",
    title: "Linux build instructions",
    description: "Step-by-step build instructions for chromium on Linux. Targets Ubuntu LTS and recent Debian.",
    sections: [
      { heading: "Install build deps", level: 2 },
      { heading: "Configure GN", level: 3, body: "See [the build overview](../build/overview.md)." },
    ],
    links: ["build/overview.md"],
    code: [{ lang: "sh", body: "sudo ./build/install-build-deps.sh\ngclient sync" }],
  },
  {
    path: "linux/debugging.md",
    title: "Debugging chromium on Linux",
    description: "Tips for using gdb / lldb / rr against chromium browser tests.",
    sections: [
      { heading: "gdb", level: 2 },
      { heading: "rr replay", level: 3 },
    ],
    code: [{ lang: "sh", body: "gdb --args out/Default/content_shell --no-sandbox" }],
  },
  {
    path: "linux/perf.md",
    title: "Linux perf profiling",
    description: "Use perf and pprof to capture flamegraphs of chromium running under linux.",
    sections: [{ heading: "Capture", level: 2 }],
  },
  {
    path: "linux/wayland.md",
    title: "Wayland support",
    description: "Status of native Wayland for the linux/ozone build of chromium.",
    sections: [{ heading: "Build flag", level: 2 }],
  },
  {
    path: "linux/cgroups.md",
    title: "cgroups and resource limits",
    description: "How chromium interacts with linux cgroups, especially for renderer process priority.",
    sections: [{ heading: "Renderer priority", level: 2 }],
  },

  // Mac (~5 docs)
  {
    path: "mac/build_instructions.md",
    title: "Mac build instructions",
    description: "Build instructions for chromium on macOS. Requires Xcode 14+.",
    sections: [
      { heading: "Xcode setup", level: 2 },
      { heading: "Building", level: 3, body: "See [the cross-platform build overview](../build/overview.md)." },
    ],
    links: ["build/overview.md"],
    code: [{ lang: "sh", body: "xcode-select --install\ngclient sync" }],
  },
  {
    path: "mac/sandboxing.md",
    title: "Mac sandboxing",
    description: "Sandbox-exec policies used by chromium on macOS.",
    sections: [
      { heading: "Policy files", level: 2 },
      { heading: "Common policies", level: 3, body: "See [linux sandbox](../linux/sandboxing.md) for cross-platform context." },
    ],
    links: ["linux/sandboxing.md"],
  },
  {
    path: "mac/code_signing.md",
    title: "Mac code signing",
    description: "How chromium dev builds are codesigned for local execution.",
    sections: [{ heading: "Self-signing", level: 2 }],
  },
  {
    path: "mac/notarization.md",
    title: "Notarization",
    description: "Notarization is required for distribution but optional for local dev builds.",
    sections: [{ heading: "Distribution", level: 2 }],
  },
  {
    path: "mac/universal_binaries.md",
    title: "Universal binaries (mac arm64 + x86_64)",
    description: "How chromium ships universal binaries for Apple Silicon and Intel macs.",
    sections: [{ heading: "Lipo", level: 2 }],
  },

  // Testing (~7 docs)
  {
    path: "testing/overview.md",
    title: "Testing overview",
    description: "Top-level guide to chromium's test categories: unit, browser, web platform, and integration tests.",
    sections: [
      { heading: "Test categories", level: 2 },
      { heading: "Running tests", level: 3, body: "See [browser tests](browser_tests.md) and [web tests](web_tests.md)." },
    ],
    links: ["testing/browser_tests.md", "testing/web_tests.md", "build/code_coverage.md"],
    code: [{ lang: "sh", body: "autoninja -C out/Default unit_tests\nout/Default/unit_tests --gtest_filter=Foo*" }],
  },
  {
    path: "testing/browser_tests.md",
    title: "Browser tests",
    description: "Browser tests run in a real browser process — slower than unit tests but exercise the full stack.",
    sections: [
      { heading: "Fixtures", level: 2 },
      { heading: "Async helpers", level: 3 },
    ],
    code: [{ lang: "cpp", body: "IN_PROC_BROWSER_TEST_F(MyBrowserTest, DoesThing) {\n  EXPECT_TRUE(navigate_to_url(...));\n}" }],
  },
  {
    path: "testing/web_tests.md",
    title: "Web tests (formerly layout tests)",
    description: "Web platform tests that compare blink rendering output to expected baselines.",
    sections: [
      { heading: "Running", level: 2 },
      { heading: "Rebaselining", level: 3 },
    ],
    code: [{ lang: "sh", body: "third_party/blink/tools/run_web_tests.py -t Default" }],
  },
  {
    path: "testing/fuzzing.md",
    title: "Fuzzing",
    description: "Chromium uses libfuzzer + ClusterFuzz for continuous fuzzing of parsers and IPC interfaces.",
    sections: [
      { heading: "Writing a fuzzer", level: 2 },
      { heading: "Running locally", level: 3 },
    ],
    code: [{ lang: "cpp", body: "extern \"C\" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size) {\n  return 0;\n}" }],
  },
  {
    path: "testing/perf.md",
    title: "Performance testing",
    description: "Telemetry and the chromeperf dashboard. Microbenchmarks via gtest perf_tests.",
    sections: [{ heading: "Telemetry", level: 2 }],
  },
  {
    path: "testing/flakiness.md",
    title: "Flaky tests",
    description: "Process for triaging and disabling flaky tests in chromium CI.",
    sections: [{ heading: "Disabling", level: 2 }],
  },
  {
    path: "testing/skia_gold.md",
    title: "Skia Gold",
    description: "Pixel-diff testing infrastructure used for accessibility and rendering tests.",
    sections: [{ heading: "Triage", level: 2 }],
  },

  // Windows (~5 docs)
  {
    path: "windows/build_instructions.md",
    title: "Windows build instructions",
    description: "Build instructions for chromium on Windows. Requires Visual Studio 2022.",
    sections: [
      { heading: "VS setup", level: 2 },
      { heading: "Building", level: 3, body: "See [build overview](../build/overview.md)." },
    ],
    links: ["build/overview.md"],
  },
  {
    path: "windows/sandboxing.md",
    title: "Windows sandboxing",
    description: "Job objects, restricted tokens, and the integrity-level model used to sandbox renderers on Windows.",
    sections: [
      { heading: "Job objects", level: 2 },
      { heading: "Integrity levels", level: 3 },
    ],
    links: ["linux/sandboxing.md"],
  },
  {
    path: "windows/accessibility.md",
    title: "Windows accessibility",
    description: "UI Automation provider implementation for chromium on Windows.",
    sections: [
      { heading: "UIA provider", level: 2 },
      { heading: "MSAA fallback", level: 3, body: "See [the cross-platform accessibility overview](../accessibility/overview.md)." },
    ],
    links: ["accessibility/overview.md", "accessibility/uia_on_windows.md"],
  },
  {
    path: "windows/code_signing.md",
    title: "Windows code signing",
    description: "Authenticode signing for chromium installers.",
    sections: [{ heading: "Stable channel", level: 2 }],
  },
  {
    path: "windows/etw.md",
    title: "ETW tracing on Windows",
    description: "Capture chromium traces via Windows Event Tracing.",
    sections: [{ heading: "Capture", level: 2 }],
  },

  // Misc top-level
  {
    path: "contributing.md",
    title: "Contributing to chromium",
    description: "How to send your first patch to chromium — the contributor agreement, gerrit, and the review process.",
    sections: [
      { heading: "CLA", level: 2 },
      { heading: "Sending a patch", level: 2, body: "Use `git cl upload`. See the [build overview](build/overview.md) first." },
    ],
    links: ["build/overview.md"],
  },
];

function renderSpec(s: Spec): string {
  const lines: string[] = [];
  lines.push(`# ${s.title}`);
  lines.push("");
  lines.push(s.description);
  lines.push("");
  let codeIdx = 0;
  for (const sec of s.sections) {
    lines.push(`${"#".repeat(sec.level)} ${sec.heading}`);
    lines.push("");
    if (sec.body) {
      lines.push(sec.body);
      lines.push("");
    } else {
      lines.push(`Notes for ${sec.heading.toLowerCase()} are still being expanded; this is a placeholder paragraph used by the chromium-atlas mock fixture set so that the title-list view always has descriptive copy to render.`);
      lines.push("");
    }
    if (s.code && s.code[codeIdx] && sec.level === 2) {
      const c = s.code[codeIdx];
      lines.push("```" + c.lang);
      lines.push(c.body);
      lines.push("```");
      lines.push("");
      codeIdx++;
    }
  }
  // Append remaining code blocks at the end.
  if (s.code) {
    while (codeIdx < s.code.length) {
      const c = s.code[codeIdx++];
      lines.push("```" + c.lang);
      lines.push(c.body);
      lines.push("```");
      lines.push("");
    }
  }
  return lines.join("\n");
}

let written = 0;
for (const spec of SPECS) {
  const target = join(ROOT, spec.path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, renderSpec(spec), "utf8");
  written++;
}
console.log(`[fixtures] wrote ${written} mock chromium docs under ${ROOT}`);
