# Code review · Architect

Independent architectural review of the v1.0 build. Focus: module boundaries,
state ownership, determinism, and adherence to discuss/decision.md.

## Module dependency graph (verified)

```
scripts/scan-docs.ts → public/{docs,tree,links}.json
                       ↓ fetch
src/store.ts ← single source of truth (cache: Store | null)
  ↑                ↓
src/router.ts   src/views/{folder,doc}.ts
                src/components/{sidebar,palette,theme-toggle}.ts
  ↑                ↓
src/main.ts ─── DOM
```

Verified: `src/views/doc.ts:1-3` imports only from `../store`, `../lib/markdown`,
`../lib/paths` — no view→view import. `src/views/folder.ts` ditto. No circular
deps detected.

`src/lib/{types,markdown,paths,storage,dom}.ts` are leaf modules with zero app-state
deps — pure, reusable.

## Adherence to discuss/decision.md

| Locked decision | Code location | Status |
|---|---|---|
| Vite 6 + Vanilla TS, `type:module` | `package.json:5` | ✓ |
| markdown-it `html:false` | `src/lib/markdown.ts:109` | ✓ |
| DOMPurify single config in markdown.ts | `src/lib/markdown.ts:117-121` | ✓ |
| Fuse.js 7 basic build | `src/components/palette.ts:1,13-22` | ✓ |
| highlight.js core + dynamic langs | `src/lib/markdown.ts:3-25` | ✓ (langs imported eagerly, see A1) |
| Single store in src/store.ts | `src/store.ts:23` (`let cache: Store \| null = null`) | ✓ |
| Deterministic scanner (sort, posix, no mtime) | `scripts/scan-docs.ts:8-10,17,82` | ✓ |
| localStorage keys `atlas:theme`, `atlas:sidebar:expanded` | `src/store.ts:20-21` | ✓ partial — see A2 |
| `atlas:view:<folderPath>` per-folder mode | `src/store.ts:19` (`atlas:viewmode` map) | ⚠ schema deviation, see A2 |

## Findings

### 🟡 A1 — Eager language imports inflate main chunk

**File:** `src/lib/markdown.ts:5-10`

```ts
import cpp from "highlight.js/lib/languages/cpp";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
...
```

decision.md §"Stack (locked)" specified "highlight.js 11.10 **core only** + dynamic
per-language imports". Current impl imports 6 languages eagerly at module load,
which forces them into the markdown chunk (`markdown-pmc3iiuK.js`, 126 kB / 54 kB
gzip). That chunk is already lazy-loaded so the *main* chunk budget (200 kB gzip
per CLAUDE.md) is not breached, but the markdown chunk is fatter than needed for
a folder browse that never opens a doc.

**Reasoning:** The promise was on-demand grammar load. Eager registration violates
that contract and slows first-doc TTI on cold cache.

**Fix:** Convert each `import` to a dynamic import inside `highlightFn`
(`src/lib/markdown.ts:77-89`); register on first sighting of each lang, fall back
to plaintext while loading. Acceptable to keep this as ITERATE in a future build
node — not a blocker.

### 🟡 A2 — localStorage key for view modes diverges from decision

**File:** `src/store.ts:19`

decision.md specified per-folder keys: `atlas:view:<folderPath>`. Implementation
uses a single key `atlas:viewmode` storing a JSON object map. Functionally
equivalent for a single-tab user but:

- Loses cross-tab independence (whole-map write clobbers concurrent edits).
- Migration risk if v1.1 wants to namespace by user.

**Reasoning:** Doesn't break anything in v1.0, but it's a silent contract drift
the decision doc explicitly fixed.

**Fix:** Either (a) update `decision.md` with the new schema and a one-liner
rationale, or (b) refactor `src/store.ts:42-44, 103-110` to write per-folder keys.
Recommend (a) since (b) costs more and the bigger benefit is cross-tab safety which
isn't a v1.0 requirement.

### 🟢 A3 — Render cache is correctly bounded

**File:** `src/lib/markdown.ts:91-127`

LRU semantics implemented via Map insertion-order + delete/reinsert on hit
(`:103-106`) and eviction at size > `RENDER_CACHE_LIMIT=64` (`:123-126`). Keys
include both length and a djb2-style hash (`:94-98`) to avoid false positives
when two docs at the same path are concurrently edited in dev.

Note: cache is never invalidated by `themechange`, but theme is CSS-only, so
sanitized HTML doesn't depend on it. Correct.

### 🟢 A4 — Scanner determinism reality-checked

**File:** `scripts/scan-docs.ts:77-99` + `:68-75`

`walk` sorts `readdirSync` output (`:82`) before recursion. `resolveDocsDir`
(`:68-75`) returns absolute paths but those don't enter the JSON output (the
docs are stored relative to root via `subRel`, `:88,95`). I ran the build twice
back-to-back and `public/docs.json` is byte-identical between runs (verified by
hash; build log embedded in `run_1/build-log.txt`).

## Extensibility observations

- Adding a fourth view mode: extend `ViewMode` union in `src/lib/types.ts` + add
  branch in `src/views/folder.ts` render switch. No store change.
- Graph view (deferred): infra is present — `src/router.ts` already routes
  `#/graph`, `package.json` build budget has headroom for cytoscape lazy chunk.
- Markdown plugins compose at `src/lib/markdown.ts:114-115` via `.use(...)` —
  trivial to add e.g. mermaid.

## Verdict: ITERATE

Two 🟡 findings (A1, A2). Neither is a runtime defect but both diverge from the
locked discuss decision and should be reconciled before audit. Build is otherwise
structurally sound.
