---

description: "Task list for [FEATURE NAME]"
---

# Tasks: [FEATURE NAME]

**Input**: `/specs/[###-feature-name]/` — spec.md (the change), plan.md, and research.md,
data-model.md, contracts/ when present

**Tests**: Small Vitest tests for every pure rule added or changed (constitution III); screens
checked with the spec's acceptance scenarios through the launcher.

## Format: `[ID] [P?] Description (rule ids)`

- **[P]**: can run in parallel (different files, no dependency on unfinished tasks)
- Every task names its files (paths from the repository root) and the rule ids it implements
- Group tasks by the change's rule groups, smallest working slice first; there are no user stories

<!--
  Replace the sample tasks below with the real ones. Keep the last two phases: applying the change
  to the capability files is what keeps specs/capabilities/ true; skipping it breaks the
  constitution (Development Workflow).
-->

---

## Phase 1: Rules

**Purpose**: The pure functions and their tests

- [ ] T001 [P] [Rule or helper] in `apps/[app]/src/logic/[file].js` with tests in
  `apps/[app]/src/logic/[file].test.js` ([ID-N], [ID-N])

**Checkpoint**: Rules ready, tests green

---

## Phase 2: [Rule group, e.g. "The review form"]

**Goal**: [What works at the end of this phase]

**Scenarios**: [Acceptance scenario numbers of the spec this phase makes pass]

- [ ] T002 [Screen or data change] in `apps/[app]/src/[path]` ([ID-N])

**Checkpoint**: [Scenarios N–M pass]

---

## Phase N-1: Apply the change to the capabilities

- [ ] TXXX Apply the change to `specs/capabilities/[capability].md` (and `specs/domain.md` when a
  shared term or rule changes): add, replace or remove the rules with their ids, add or replace
  the acceptance scenarios, update the demo data in `specs/capabilities/platform-data.md` when it
  changed, and the capability map in `specs/domain.md` for a new capability. The capability must
  read as the current behavior: no "was", no change history.
- [ ] TXXX Check the counts and names of every changed scenario against the demo data

---

## Phase N: Checks

- [ ] TXXX Run `npm test` and `npm run build` in each app touched (and `apps/control-panel/` when
  `shared/` changed), then the spec's acceptance scenarios from **Reset demo data** through the
  launcher, at 320px and with the keyboard, with a clean browser console

---

## Notes

- Commit after each logical group with Conventional Commits
- Review remarks: edit spec.md in place, then add their tasks as a new phase before
  "Apply the change to the capabilities"
