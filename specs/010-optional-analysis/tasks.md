---

description: "Task list for feature 010 Optional analysis and guided corrections"
---

# Tasks: Optional analysis and guided corrections

**Input**: `/specs/010-optional-analysis/` — spec.md, plan.md

**Tests**: Small Vitest tests for every pure rule (constitution III); screens checked with the spec's
acceptance scenarios through the launcher.

---

## Phase 1: Rules

- [X] T001 In `apps/event-reporting/src/logic/review.js` and `rootCause.js`: the optional Root cause
  analysis step (valid review, In Progress or Closed, nobody required it) and Root cause analysis
  required once `event.optionalAnalysis` is set; `designatedIds` reads its people; tests in
  `review.test.js` and `rootCause.test.js` (RCA-18, Domain Steps)
- [X] T002 New `apps/event-reporting/src/logic/optionalAnalysis.js` with
  `optionalAnalysis.test.js`: `canStartAnalysis(user, event)`, `startAnalysis(event, assignees,
  user, now)` (reopens a Closed event); its alert candidates in `logic/notifications.js` (RCA-18,
  NT-3)

## Phase 2: The optional step

**Scenarios**: 1–4

- [X] T003 New `apps/event-reporting/src/events/OptionalAnalysisStart.jsx`; `EventSteps.jsx` opens the
  optional step for those who can start it; `EventDetail.jsx` history line (RCA-18, EL-18)

## Phase 3: Guided corrections

**Scenarios**: 2, 5–7

- [X] T004 New `shared/ui/scrollToProblem.js` and its calls in `ReviewStep.jsx`, `RootCauseStep.jsx`,
  `ActionModal.jsx`, `ValidationStep.jsx`, `ShareToHub.jsx`, `HubItemPage.jsx`,
  `OptionalAnalysisStart.jsx` and the Control Panel's `RuleForm.jsx` and `ValueForm.jsx` (Domain)

## Phase 4: Apply the change to the capabilities

- [ ] T005 Apply the change to `specs/capabilities/root-cause-analysis.md` (RCA-1, RCA-18, scenarios),
  `event-library.md` (EL-18), `notifications.md` (NT-3) and `specs/domain.md` (Steps, Product-wide
  rules). No "was", no change history.
- [ ] T006 Check the counts and names of every changed scenario against the demo data

## Phase 5: Checks

- [ ] T007 `npm test` and `npm run build` in `apps/event-reporting/` and `apps/control-panel/`, then
  the scenarios through the launcher, at 320px and with the keyboard, with a clean console
