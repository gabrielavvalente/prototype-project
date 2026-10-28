---

description: "Task list for Workflow for critical events, and the master data workbook"
---

# Tasks: Workflow for critical events, and the master data workbook

**Input**: `/specs/012-critical-workflow-master-data/` — spec.md, plan.md, research.md,
data-model.md

**Tests**: Small Vitest tests for every pure rule added or changed (constitution III); screens
checked with the spec's acceptance scenarios through the launcher.

## Format: `[ID] [P?] Description (rule ids)`

---

## Phase 1: Rules

- [ ] T001 [P] `CRITICAL_ROWS`, `levelLabel(pillarId, levelCode)`, `workflow.critical` in
  `workflowForEvent`, `analysisWithoutReview` skipping the critical row, in
  `shared/platform/workflow.js`, with tests in `shared/platform/workflow.test.js` (WF-5a, WF-11,
  WF-13)
- [ ] T002 [P] The workbook catalogs in `shared/platform/catalogs.js` (Standards 12, Hazards 16,
  Diseases 17, `bodyPartIds` on injuries); the Diseases list and `injuriesFor` in
  `shared/platform/masterData.js`, with tests in `shared/platform/masterData.test.js` (MD-1, MD-2,
  MD-4, MD-7)
- [ ] T003 [P] `requiredByWorkflow`, `leadsToAnalysis` from the critical row, no
  `asksFurtherAnalysis` nor its message, in `apps/event-reporting/src/logic/review.js` (and
  `logic/safetyCommunication.js`), with tests in `apps/event-reporting/src/logic/review.test.js`
  (RV-10, RV-11, RV-14, RCA-1)

**Checkpoint**: Rules ready, tests green

---

## Phase 2: The critical row in the Control Panel

**Scenarios**: 1–3

- [ ] T004 Root cause analysis Required on the three critical rows in
  `shared/platform/sampleData.js`; labels in the messages, audit and notifications of
  `shared/platform/platformData.js` (WF-12, WF-13)
- [ ] T005 The critical row in `apps/control-panel/src/workflow/workflowText.js`,
  `SettingsGrid.jsx` ("From the level"), `ResultGrid.jsx` and `EventPath.jsx` ("Added at <plant>
  when the review flags …", "Nothing is added.") (WF-1, WF-10, WF-13)

**Checkpoint**: Scenarios 1–3 pass

---

## Phase 3: The review

**Scenarios**: 4–7

- [ ] T006 `apps/event-reporting/src/events/ReviewStep.jsx`: no "Do you want to further analyze?";
  Next step only with the designation; Injuries by body part ("Choose the body parts first.",
  pruning) (RV-6, RV-10, RV-15)

**Checkpoint**: Scenarios 4–7 pass

---

## Phase 4: Master data screens

**Scenarios**: 8–10

- [ ] T007 `apps/control-panel/src/masterData/ValueList.jsx`: Injuries' Body parts column ("<N>
  body parts", "1 body part") and its export column (MD-11, MD-12)

**Checkpoint**: Scenarios 8–10 pass

---

## Phase 5: Apply the change to the capabilities

- [ ] T008 Apply the change to `specs/capabilities/workflow-settings.md`, `event-review.md`,
  `root-cause-analysis.md`, `master-data.md` (with the Initial catalogs and the injuries by body
  part), `platform-data.md` (workflow settings) and `specs/domain.md` (Critical events). No "was",
  no change history.
- [ ] T009 Check the counts and names of every changed scenario against the demo data

---

## Phase 6: Checks

- [ ] T010 Run `npm test` and `npm run build` in `apps/event-reporting/` and `apps/control-panel/`,
  then the spec's acceptance scenarios from **Reset demo data** through the launcher, at 320px and
  with the keyboard, with a clean browser console

---

## Notes

- Commit after each logical group with Conventional Commits
- Review remarks: edit spec.md in place, then add their tasks as a new phase before
  "Apply the change to the capabilities"
