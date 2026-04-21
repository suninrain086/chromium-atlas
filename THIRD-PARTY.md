# Third-party dependencies

chromium-atlas is licensed under MIT. The following third-party packages
are used at runtime or build time. All are open-source and license-compatible.

## Runtime

| Package | Version | License | URL |
|---|---|---|---|
| markdown-it | ^14.1 | MIT | https://github.com/markdown-it/markdown-it |
| dompurify | ^3.2 | (MPL-2.0 OR Apache-2.0) | https://github.com/cure53/DOMPurify |
| fuse.js | ^7.0 | Apache-2.0 | https://github.com/krisk/Fuse |
| highlight.js | ^11.10 | BSD-3-Clause | https://github.com/highlightjs/highlight.js |
| @fontsource-variable/inter | ^5.1 | OFL-1.1 | https://fontsource.org/fonts/inter |
| @fontsource/jetbrains-mono | ^5.1 | OFL-1.1 | https://fontsource.org/fonts/jetbrains-mono |
| cytoscape | ^3.33 | MIT | https://github.com/cytoscape/cytoscape.js |

> v1.0.1 note: we use Cytoscape's built-in `cose` layout; the
> `cytoscape-fcose` plugin was evaluated and dropped to keep the lazy
> graph chunk under the 250 KB total bundle ceiling.

## Build / dev

| Package | Version | License | URL |
|---|---|---|---|
| vite | ^6.0 | MIT | https://github.com/vitejs/vite |
| typescript | ^5.7 | Apache-2.0 | https://github.com/microsoft/TypeScript |
| @playwright/test | ^1.59 | Apache-2.0 | https://github.com/microsoft/playwright |
| tsx | ^4.19 | MIT | https://github.com/esbuild-kit/tsx |
| vite-plugin-pwa | ^0.21 | MIT | https://github.com/vite-pwa/vite-plugin-pwa |
| workbox-window | (transitive) | MIT | https://github.com/GoogleChrome/workbox |

Run `npm ls --all --json` for the full transitive tree.
