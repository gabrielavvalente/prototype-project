---

description: "Task list for feature 008 Safety communication"
---

# Tasks: Safety communication

**Input**: `/specs/008-safety-communication/` — spec.md (the change), plan.md, research.md,
data-model.md, contracts/routes.md

**Tests**: Small Vitest tests for every pure rule added or changed (constitution III); screens
checked with the spec's acceptance scenarios through the launcher.

## Format: `[ID] [P?] Description (rule ids)`

- **[P]**: can run in parallel (different files, no dependency on unfinished tasks)
- Every task names its files (paths from the repository root) and the rule ids it implements

---

## Phase 1: Rules

**Purpose**: The pure functions and their tests

- [X] T001 [P] Move the rating text to `ratingText(matrix, rating)` in
  `apps/event-reporting/src/logic/severity.js` (test in `severity.test.js`) and use it in
  `apps/event-reporting/src/events/ReviewStep.jsx` (RV-15, SC-4)
- [X] T002 New `apps/event-reporting/src/logic/safetyCommunication.js` with tests in
  `safetyCommunication.test.js`: `hasAlert(event)` (valid review, not Industrial Hygiene),
  `nextSteps(event)`, `alertContent(event, lookups)`, `warningState(event)` (none / draft /
  published), `warningContent(event, lookups)`, `canReadCommunication(user, event)`,
  `canSeeWarning(user, event, groups, users)`, `canPublish(…)`, `setWarningPhotos(event, ids)`,
  `publishWarning(event, content, userId, now)`; a test that no demo person's name appears in the
  documents of a fully worked event (SC-1 to SC-7, research R1, R2)

**Checkpoint**: Rules ready, tests green

---

## Phase 2: The documents

**Goal**: Each document has its page; owners choose photos and publish

**Scenarios**: 2, 5–9

- [X] T003 New `apps/event-reporting/src/communications/CommunicationDocument.jsx` (the document
  parts of SC-4 and SC-5, photos) and `CommunicationPage.jsx` (routes of contracts/routes.md,
  "This safety communication is not available.", the draft notice, "Photos to include" with its
  hint, **Publish Safety Warning** with its confirmation, "Published on <date>", **Print**, the link
  back to the event); routes and route names in `App.jsx` and `logic/access.js` (SC-3, SC-5 to
  SC-7, SC-9)
- [X] T004 In `apps/event-reporting/src/events/EventSteps.jsx` (header card): the **Safety Alert**
  and **Safety Warning** links (EL-17)
- [X] T005 [P] In `apps/event-reporting/src/app.css` (appended at the end): document, cards and an
  `@media print` style that prints the document only (SC-9, research R5)

**Checkpoint**: Scenarios 2 and 5–9 pass

---

## Phase 3: The list

**Goal**: The plant's documents in the event workspace

**Scenarios**: 1, 3, 4

- [X] T006 New `apps/event-reporting/src/communications/CommunicationsList.jsx` and the fourth page
  **Safety communications** in `apps/event-reporting/src/events/EventLibrary.jsx` (SC-8, EL-1,
  research R3)

**Checkpoint**: Scenarios 1, 3 and 4 pass

---

## Phase 6: Review remarks — Communications in the steps menu

**Scenarios**: 1, 2, 6, 7

- [X] T010 In `apps/event-reporting/src/logic/safetyCommunication.js`: `communicationStates(user,
  event, groups, users)` — each document's state text and whether it opens (SC-10); tests in
  `safetyCommunication.test.js`
- [X] T011 Move the document view (document, draft photos, Publish, Print) out of
  `apps/event-reporting/src/communications/CommunicationPage.jsx` into `CommunicationView.jsx`,
  used by the standalone page and by the event page (SC-10)
- [X] T012 In `apps/event-reporting/src/events/EventSteps.jsx`: the Communications section of the
  steps menu, `#/events/:id/steps/alert` and `…/warning` opening the document beside the menu; the
  header card links removed; styles appended to `apps/event-reporting/src/app.css` (SC-10, EL-17)
- [X] T013 Apply the remark to `specs/capabilities/safety-communication.md` (SC-10, scenarios,
  Decisions) and `specs/capabilities/event-library.md` (EL-17); run `npm test`, `npm run build` and
  the changed scenarios through the launcher, at 320px and with the keyboard, with a clean console

---

## Phase 4: Apply the change to the capabilities

- [X] T007 Create `specs/capabilities/safety-communication.md` (SC-1 to SC-9, the acceptance
  scenarios, Decisions) and apply the changed rules to `specs/capabilities/event-library.md` (EL-1,
  EL-17), `event-review.md` (Decisions), `root-cause-analysis.md` and `validation.md` (Scope) and
  `specs/domain.md` (Glossary, Capabilities). No "was", no change history.
- [X] T008 Check the counts and names of every changed scenario against the demo data

---

## Phase 5: Checks

- [X] T009 Run `npm test` and `npm run build` in `apps/event-reporting/`, then the spec's acceptance
  scenarios from **Reset demo data** through the launcher, at 320px and with the keyboard, with a
  clean browser console

---

## Notes

- Commit after each logical group with Conventional Commits
- Review remarks: edit spec.md in place, then add their tasks as a new phase before
  "Apply the change to the capabilities"
