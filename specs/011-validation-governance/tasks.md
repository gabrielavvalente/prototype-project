---

description: "Task list for feature 011 Locked closure, rework and the Record Historian"
---

# Tasks: Locked closure, rework and the Record Historian

**Input**: `/specs/011-validation-governance/` — spec.md, plan.md

**Tests**: Small Vitest tests for every pure rule (constitution III); screens checked with the spec's
acceptance scenarios through the launcher.

---

## Phase 1: Rules

- [X] T001 In `apps/event-reporting/src/logic/planValidation.js`: the "No additional actions"
  confirmation, `isLocked`, `rework`; `optionalAnalysis.js` never on a locked event; "Event sent back
  for rework" in `shared/platform/notifications.js` and its candidates in `logic/notifications.js`;
  tests (VAL-2, VAL-3, VAL-6, VAL-7, RCA-18, NT-2 to NT-4)
- [X] T002 New `apps/event-reporting/src/logic/recordHistorian.js` with tests: `historianEntries`,
  `filterEntries`; `data/db.js` appends the entries in `saveWorkflowStep` (RH-1)

## Phase 2: Screens

**Scenarios**: 1–7

- [X] T003 `events/ValidationStep.jsx` (confirmation, Rework), `events/EventSteps.jsx` (locked notice,
  Record Historian link), `events/EventDetail.jsx` (history line) (VAL-2, VAL-5 to VAL-7)
- [X] T004 New `events/RecordHistorianPage.jsx`, route in `App.jsx` and `logic/access.js`, styles in
  `app.css` (RH-2)

## Phase 3: Apply the change to the capabilities

- [X] T005 Create `specs/capabilities/record-historian.md`; apply the changes to `validation.md`,
  `root-cause-analysis.md`, `notifications.md` and `specs/domain.md`. No "was", no change history.
- [X] T006 Check the counts and names of every changed scenario against the demo data

## Phase 4: Checks

- [X] T007 `npm test` and `npm run build` in `apps/event-reporting/` and `apps/control-panel/`, then the
  scenarios through the launcher, at 320px and with the keyboard, with a clean console

## Phase 5: Review remarks (2026-10-28)

**Scenarios**: 1, 6, 6b

- [X] T008 The question "Is this event closed? Were the actions effective?" and its message in
  `events/ValidationStep.jsx` and `logic/planValidation.js`; No alerts the plan owners (never the
  validator) with "Event sent back for rework" in `logic/notifications.js`; "Action plan not
  effective" an information alert only in `shared/platform/notifications.js`; tests (VAL-2, VAL-4,
  NT-2 to NT-4)
- [X] T009 Apply the remarks to `specs/capabilities/validation.md` and `notifications.md`
- [X] T010 `npm test` and `npm run build`, then scenarios 1, 6 and 6b through the launcher
