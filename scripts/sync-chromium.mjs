#!/usr/bin/env node
// scripts/sync-chromium.mjs — F1: real chromium docs sparse-clone sync.
// Idempotent. Writes dist-docs/ and {dist-docs,public}/sync-meta.json.
//
// Usage:
//   node scripts/sync-chromium.mjs [--ref <branch|sha>] [--dest <path>]
// Defaults: --ref main, --dest dist-docs

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join, resolve, dirname, posix } from "node:path";

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i > 0 && i + 1 < process.argv.length ? process.argv[i + 1] : dflt;
}

const REF = arg("--ref", "main");
const DEST = resolve(arg("--dest", "dist-docs"));
const CACHE = resolve(".cache/chromium");
const REPO = "https://chromium.googlesource.com/chromium/src.git";
const PUBLIC = resolve("public");

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed (exit ${r.status})`);
}

function captureOut(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
  return r.stdout.trim();
}

function sparseInit() {
  mkdirSync(dirname(CACHE), { recursive: true });
  if (existsSync(CACHE)) rmSync(CACHE, { recursive: true, force: true });
  run("git", ["clone", "--filter=blob:none", "--no-checkout", "--depth", "1", REPO, CACHE]);
  run("git", ["sparse-checkout", "init", "--cone"], CACHE);
  run("git", ["sparse-checkout", "set", "docs"], CACHE);
  run("git", ["checkout", REF], CACHE);
}

function sparseUpdate() {
  run("git", ["fetch", "--depth", "1", "origin", REF], CACHE);
  run("git", ["reset", "--hard", "FETCH_HEAD"], CACHE);
}

function copyMdTree(src, dst) {
  if (!existsSync(src)) throw new Error(`source missing: ${src}`);
  let count = 0;
  const walk = (rel) => {
    const abs = rel ? join(src, rel) : src;
    let entries;
    try { entries = readdirSync(abs); } catch { return; }
    for (const e of entries) {
      if (e.startsWith(".")) continue;
      const subRel = rel ? `${rel}/${e}` : e;
      const child = join(src, subRel);
      let st;
      try { st = statSync(child); } catch { continue; }
      if (st.isDirectory()) walk(subRel);
      else if (e.endsWith(".md")) {
        const target = join(dst, subRel);
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(child, target);
        count++;
      }
    }
  };
  walk("");
  return count;
}

function main() {
  const t0 = Date.now();
  if (existsSync(join(CACHE, ".git"))) {
    console.log(`[sync-chromium] cache hit at ${CACHE} — fetching ${REF}`);
    sparseUpdate();
  } else {
    console.log(`[sync-chromium] cold init — sparse cloning ${REPO} @ ${REF}`);
    sparseInit();
  }
  rmSync(DEST, { recursive: true, force: true });
  mkdirSync(DEST, { recursive: true });
  const docCount = copyMdTree(join(CACHE, "docs"), DEST);
  const sha = captureOut("git", ["rev-parse", "HEAD"], CACHE);
  const meta = {
    lastSyncedAt: new Date().toISOString(),
    sourceRef: REF,
    sha,
    docCount,
    syncDurationMs: Date.now() - t0,
  };
  writeFileSync(join(DEST, "sync-meta.json"), JSON.stringify(meta, null, 2) + "\n");
  mkdirSync(PUBLIC, { recursive: true });
  writeFileSync(join(PUBLIC, "sync-meta.json"), JSON.stringify(meta, null, 2) + "\n");
  console.log(`[sync-chromium] OK — ${docCount} docs, sha ${sha.slice(0, 8)}, ${meta.syncDurationMs}ms`);
}

try { main(); } catch (e) { console.error(`[sync-chromium] FAILED: ${e.message}`); process.exit(1); }
