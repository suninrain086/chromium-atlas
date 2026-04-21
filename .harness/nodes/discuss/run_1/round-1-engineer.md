# Discuss · Engineer (v1.0.2 run_1)

## Implementation order (commits)
1. `chore(sync): scaffold sync-chromium.mjs + .gitignore entries`
2. `feat(sync): real chromium sparse clone + sync-meta.json`
3. `feat(scan): --source flag {real|mock} forwarding to DOCS_DIR`
4. `feat(ui): sync-health indicator in header`
5. `ci(sync): hourly sync-docs workflow + concurrency`
6. `ci(deploy): gh-pages deploy via workflow_run`
7. `test(v102): sync-meta schema + indicator presence`
8. `chore(scripts): npm run sync:real wires sync + scan --source real`

## Code shape — sync-chromium.mjs
```js
#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

function arg(name, dflt) { const i=process.argv.indexOf(name); return i>0?process.argv[i+1]:dflt; }
const REF = arg("--ref","main");
const DEST = resolve(arg("--dest","dist-docs"));
const CACHE = resolve(".cache/chromium");
const REPO = "https://chromium.googlesource.com/chromium/src.git";

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
}
function sparseInit() {
  mkdirSync(CACHE, { recursive: true });
  run("git",["clone","--filter=blob:none","--no-checkout","--depth","1",REPO,CACHE]);
  run("git",["sparse-checkout","init","--cone"], CACHE);
  run("git",["sparse-checkout","set","docs"], CACHE);
  run("git",["checkout",REF], CACHE);
}
function sparseUpdate() {
  run("git",["fetch","--depth","1","origin",REF], CACHE);
  run("git",["reset","--hard","FETCH_HEAD"], CACHE);
}
function copyTree(src,dst){ /* recursive copy of *.md only */ }
function getSha(){ return spawnSync("git",["rev-parse","HEAD"],{cwd:CACHE,encoding:"utf8"}).stdout.trim();}

const t0=Date.now();
if (existsSync(join(CACHE,".git"))) sparseUpdate(); else sparseInit();
rmSync(DEST,{recursive:true,force:true});
mkdirSync(DEST,{recursive:true});
copyTree(join(CACHE,"docs"), DEST);
const docCount = countMd(DEST);
const meta = { lastSyncedAt: new Date().toISOString(), sourceRef: REF, sha: getSha(), docCount, syncDurationMs: Date.now()-t0 };
writeFileSync(join(DEST,"sync-meta.json"), JSON.stringify(meta,null,2));
mkdirSync("public",{recursive:true});
writeFileSync("public/sync-meta.json", JSON.stringify(meta,null,2));
console.log(`[sync-chromium] ${docCount} docs, sha ${meta.sha.slice(0,8)}, ${meta.syncDurationMs}ms`);
```

## Code shape — scan-docs.ts CLI flag
At end of file replace the isMain block:
```ts
if (isMain) {
  const args = process.argv.slice(2);
  const sIdx = args.indexOf("--source");
  if (sIdx >= 0 && args[sIdx+1]) {
    const v = args[sIdx+1];
    if (v === "real") process.env.DOCS_DIR = resolveAbs("dist-docs");
    else if (v === "mock") process.env.DOCS_DIR = resolveAbs("test","fixtures","docs");
  }
  const dir = resolveDocsDir();
  ...
}
```

## Code shape — sync health indicator
In renderShell topbar add `<span id="sync-health" class="sync-health" hidden></span>` between
install-host and theme-host (or after install-host). New module
`src/components/sync-health.ts` exports `mountSyncHealth(host)`:
```ts
export async function mountSyncHealth(host: HTMLElement) {
  try {
    const r = await fetch("./sync-meta.json", { cache: "no-store" });
    if (!r.ok) return;
    const meta = await r.json();
    const ageMs = Date.now() - new Date(meta.lastSyncedAt).getTime();
    if (ageMs < 0 || ageMs > 24*3600*1000) return;
    host.hidden = false;
    host.title = `Last synced ${new Date(meta.lastSyncedAt).toLocaleString()} (sha ${String(meta.sha).slice(0,8)})`;
    host.textContent = `Synced ${relTime(ageMs)}`;
  } catch {}
}
function relTime(ms: number): string {
  const m = Math.floor(ms/60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minute${m===1?"":"s"} ago`;
  const h = Math.floor(m/60); return `${h} hour${h===1?"":"s"} ago`;
}
```

## Workflow YAML strategy
Cron `0 * * * *`. `concurrency.cancel-in-progress: true`. `permissions:
  contents: read` on sync-docs (no push). For deploy.yml use `workflow_run`
trigger filtered to `conclusion: success`. Both YAMLs must lint clean under
actionlint.

## Bundle math (estimate)
- sync-health.ts gz ~ 0.4 KB
- main.ts modifications ~ +0.1 KB
- expected main: 17.66 + 0.5 = ~18.2 KB gz, well under 30 KB ceiling
- total expected ~ 226 KB gz, well under 250

## Open questions for tester
- Q1: how do we test the workflow YAML without running it? → actionlint static
- Q2: how do we test sync-meta indicator without running real sync? → fake meta in test fixture
- Q3: does live `fetch("./sync-meta.json")` interfere with PWA precache? → use `cache: "no-store"` and tolerate 404
