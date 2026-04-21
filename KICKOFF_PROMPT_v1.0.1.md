# chromium-atlas v1.0.1 — autonomous build kickoff

You are continuing **chromium-atlas** at v1.0.1. v1.0.0 is shipped (commit `9e9487e`,
tag `v1.0.0`, GitHub release published). The previous OPC harness state is archived
at `.harness-v1.0.0/`; a fresh `.harness/` has been initialized.

## Required reading (do FIRST, in order)

1. `PROJECT_BRIEF_v1.0.1.md` — this cycle's scope, ACs, deferrals
2. `PROJECT_BRIEF.md` — original v1.0/v1.1 spec (still authoritative for stack)
3. `DESIGN.md` + `DESIGN.atlas.md` — design tokens + layout (graph view layout TBD)
4. `RELEASE_NOTES_v1.0.md` — what already ships, what was deferred
5. `CLAUDE.md` — operating notes
6. Reference: `~/projects/memex-card-browser/src/views/graph.ts` — Cytoscape pattern proven last week

## v1.0.1 cut

5 features, all from v1.0.0's deferral backlog except real-sync (parked for v1.0.2):

- **F1 Graph view** — Cytoscape lazy chunk, force-directed, click → navigate, theme-aware restyle
- **F2 PWA** — vite-plugin-pwa, workbox, install button, offline fallback
- **F3 A11y polish** — aria-pressed, role=radiogroup roving tabindex, 44px hit areas, aria-live search count
- **F4 OSS hygiene** — SECURITY.md, THIRD-PARTY.md, license field, README badges + privacy note
- **F5 Persona-harness** — waitFor primitives, seedLocalStorage helper, target 14/14 raw

## Hard constraints

1. Local commits only — never push to origin (jacky pushes after gate-final).
2. After EVERY OPC node: `git add -A && git commit -m "<conventional msg>"`. NO uncommitted state between nodes.
3. After EVERY review/gate node: run `node ~/.claude/skills/opc/bin/opc-harness.mjs synthesize .harness --node <id>`. Never hand-grade.
4. Bundle budget: **main chunk ≤ 30 KB gz** (was 200 KB; graph code goes in lazy chunk), **total ≤ 250 KB gz**. Over-budget = 🔴.
5. No real chromium clone. Mock fixtures only (already at 690 files in `test/fixtures/docs/`).
6. v1.0 tests must still pass (no regression).
7. Wall-clock budget: **4 hours**. At 3h30 if not at gate-final, write `TIMEOUT_PARTIAL.md` and stop.
8. Conventional commits.
9. Append a one-line entry to `.harness/PROGRESS.md` after each gate.
10. Three-wall XSS pipeline (markdown-it html:false + DOMPurify + CSP) intact — don't loosen.

## Definition of done

- All 12 ACs in `PROJECT_BRIEF_v1.0.1.md` pass
- gate-final reached with PASS verdict
- `RELEASE_NOTES_v1.0.1.md` written
- v1.0 regression suite still green
- bundle budgets respected

## Now start

1. Read the spec files above
2. Verify `.harness/flow-state.json` shows currentNode=discuss
3. Run `discuss` node (architect + engineer + tester roles, parallel round-1, then decision.md)
4. Proceed through build → code-review → test-design → test-execute → gate-test → ... → gate-final
5. After gate-final PASS, write `RELEASE_NOTES_v1.0.1.md`, then halt
