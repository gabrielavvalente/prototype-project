---

description: "Task list for feature 006 Source content"
---

# Tasks: Source content

**Input**: `/specs/006-source-content/` — spec.md (the change), plan.md, research.md

**Tests**: Small Vitest tests for the content counts, the section rule and the band labels
(constitution III); screens checked with the spec's acceptance scenarios through the launcher.

## Format: `[ID] [P?] Description (rule ids)`

- **[P]**: can run in parallel (different files, no dependency on unfinished tasks)
- Every task names its files and the rule ids it implements

---

## Phase 1: Rules

- [X] T001 [P] In `apps/event-reporting/src/logic/rootCause.js`: `FIVE_W1H` with the Analysis
  Checklist questions (13 / 6 / 4 / 7 / 7 / 7), "Who was injured?" offered for Health & Safety only
  (`pillar-hs`); `SIX_M_THEMES` with the 6M labels, causes and guidance (keys unchanged, research R2);
  drop the "draft" comments; tests in `rootCause.test.js` (RCA-10, RCA-11, Content)
- [X] T002 [P] In `apps/event-reporting/src/logic/severity.js`: injury durations and hints; bands
  labelled Moderate 2–19, Critical 20–49, Very Critical 50–100 (keys unchanged, research R1); tests in
  `severity.test.js` (RV-8)

**Checkpoint**: Rules ready, tests green

---

## Phase 2: Screens

**Scenarios**: 1–6

- [X] T003 In `apps/event-reporting/src/events/ReviewStep.jsx`: the rating text uses the band label
  ("50 — Very Critical (Severe × Medium term)") (RV-15)
- [X] T004 In `apps/event-reporting/src/events/SeverityMatrix.jsx`: the recovery note under the injury
  matrix (RV-8)

**Checkpoint**: Scenarios 1–6 pass

---

## Phase 3: Apply the change to the capabilities

- [X] T005 Apply the change to `specs/capabilities/root-cause-analysis.md` (RCA-10, RCA-11, the
  Content tables, Decisions: no draft left), `specs/capabilities/event-review.md` (RV-8, RV-15, the
  scenarios naming bands) and `specs/domain.md` (HCL and SPL in the Glossary, Very Critical in
  Critical events, the open point on HCI); replace "below High" in
  `specs/capabilities/action-plan.md` with "below Very Critical". No "was", no change history.
- [X] T006 Check the counts and names of every changed scenario against the demo data

---

## Phase 4: Checks

- [X] T007 Run `npm test` and `npm run build` in `apps/event-reporting/`, then the spec's acceptance
  scenarios from **Reset demo data** through the launcher, at 320px and with the keyboard, with a
  clean browser console

---

## Notes

- Commit after each logical group with Conventional Commits
