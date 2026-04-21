import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";
import { existsSync, watch } from "node:fs";
import { writeAllIndexes, resolveDocsDir } from "./scripts/scan-docs";
import { VitePWA } from "vite-plugin-pwa";

function atlasScannerPlugin(): Plugin {
  let dir = resolveDocsDir();
  let watcher: ReturnType<typeof watch> | null = null;
  let debounce: NodeJS.Timeout | null = null;

  const regen = (reason: string) => {
    try {
      const r = writeAllIndexes(resolve("public"), dir);
      console.log(`[atlas] (${reason}) indexed ${r.docCount} doc(s) from ${dir}`);
    } catch (e) {
      console.error(`[atlas] scan failed: ${(e as Error).message}`);
    }
  };

  return {
    name: "chromium-atlas-scanner",
    buildStart() {
      regen("buildStart");
    },
    configureServer(server) {
      regen("dev-init");
      if (existsSync(dir)) {
        try {
          watcher = watch(dir, { recursive: true, persistent: false }, (_evt, filename) => {
            if (!filename || !String(filename).endsWith(".md")) return;
            if (debounce) clearTimeout(debounce);
            debounce = setTimeout(() => {
              regen(`fs:${filename}`);
              server.ws.send({ type: "full-reload" });
            }, 150);
          });
        } catch (e) {
          console.warn(`[atlas] watcher unavailable: ${(e as Error).message}`);
        }
      }
      server.httpServer?.once("close", () => watcher?.close());
    },
  };
}

export default defineConfig({
  plugins: [
    atlasScannerPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "chromium-atlas",
        short_name: "atlas",
        description: "Graph-aware browser for chromium docs",
        start_url: "/",
        display: "standalone",
        background_color: "#08090a",
        theme_color: "#7170ff",
        icons: [
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /\/(docs|tree|links)\.json/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "atlas-json", expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 } },
          },
        ],
        navigateFallback: "/index.html",
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 3000, strictPort: false },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2022",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: ["markdown-it", "dompurify"],
          fuse: ["fuse.js"],
          "hljs-core": ["highlight.js/lib/core"],
          cyto: ["cytoscape"],
        },
      },
    },
  },
});
