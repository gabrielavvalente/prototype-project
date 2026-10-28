---

description: "Task list for Reviewers chosen at every level"
---

# Tasks: Reviewers chosen at every level

**Input**: `/specs/013-open-reviewers/` — spec.md, plan.md

## Format: `[ID] [P?] Description (rule ids)`

---

## Phase 1: Rules

- [X] T001 `reviewerChoices`, `reviewersAt`, `hasNoReviewer`, `ownReviewers` and the union in
  `workflowForEvent`, in `shared/platform/workflow.js`, with tests in
  `shared/platform/workflow.test.js` (WF-6a, WF-8, WF-11)
- [X] T002 `saveReviewers` and Review Required without reviewers in
  `shared/platform/platformData.js`; Central's reviewers as a choice in
  `shared/platform/sampleData.js` (WF-6, WF-6a, WF-12)

---

## Phase 2: Screens

**Scenarios**: 1–6

- [X] T003 `apps/control-panel/src/workflow/SettingsGrid.jsx` and `ReviewersPicker.jsx` (WF-6,
  WF-6a)
- [X] T004 `ResultCell.jsx`, `ResultGrid.jsx` ("No reviewer") and `CellDetails.jsx` (reviewers by
  level) (WF-8, WF-9)

---

## Phase 3: Apply the change to the capabilities

- [X] T005 Apply the change to `specs/capabilities/workflow-settings.md` and `platform-data.md`.
  No "was", no change history.
- [X] T006 Check the counts and names of every changed scenario against the demo data

---

## Phase 4: Checks

- [X] T007 `npm test` and `npm run build` in `apps/control-panel/` and `apps/event-reporting/`,
  then the scenarios from **Reset demo data** through the launcher, at 320px and with the
  keyboard, with a clean browser console
