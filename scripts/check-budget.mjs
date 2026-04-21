#!/usr/bin/env node
// Bundle budget assertion for chromium-atlas.
// Reads dist/assets/*.js and *.css, gzips, classifies main vs lazy chunks,
// prints a table, exits 1 if budgets are exceeded.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, join } from "node:path";

const MAIN_LIMIT = 30 * 1024;   // 30 KB gz
const TOTAL_LIMIT = 250 * 1024; // 250 KB gz

const distAssets = resolve("dist/assets");
let entries;
try { entries = readdirSync(distAssets); }
catch { console.error("dist/assets not found — run `npm run build` first."); process.exit(2); }

const files = entries
  .filter(f => /\.(js|css)$/.test(f))
  .map(f => {
    const full = join(distAssets, f);
    const raw = readFileSync(full);
    const gz = gzipSync(raw).length;
    return { name: f, raw: raw.length, gz };
  })
  .sort((a, b) => b.gz - a.gz);

// Main entry: chunk whose name starts with "index-"
const main = files.find(f => /^index-.*\.js$/.test(f.name));
const graph = files.find(f => /^graph-/.test(f.name) || /cyto/.test(f.name));
const total = files.reduce((s, f) => s + f.gz, 0);

const fmt = (n) => `${(n / 1024).toFixed(2)} KB`;
console.log("\n📦 Bundle budget report\n");
console.log("File".padEnd(48) + "raw".padStart(10) + "gz".padStart(10));
console.log("-".repeat(68));
for (const f of files) {
  console.log(f.name.padEnd(48) + fmt(f.raw).padStart(10) + fmt(f.gz).padStart(10));
}
console.log("-".repeat(68));
console.log("TOTAL".padEnd(48) + "".padStart(10) + fmt(total).padStart(10));
console.log();
if (main) console.log(`main (${main.name}): ${fmt(main.gz)} / ${fmt(MAIN_LIMIT)}`);
if (graph) console.log(`graph chunk (${graph.name}): ${fmt(graph.gz)}`);
console.log(`total: ${fmt(total)} / ${fmt(TOTAL_LIMIT)}`);

let fail = false;
if (main && main.gz > MAIN_LIMIT) { console.error(`🔴 main exceeds ${fmt(MAIN_LIMIT)}`); fail = true; }
if (total > TOTAL_LIMIT)          { console.error(`🔴 total exceeds ${fmt(TOTAL_LIMIT)}`); fail = true; }
if (fail) process.exit(1);
console.log("\n🟢 Within budget.");
