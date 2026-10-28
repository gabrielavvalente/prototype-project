---

description: "Task list for feature 009 Event Sharing Hub"
---

# Tasks: Event Sharing Hub

**Input**: `/specs/009-sharing-hub/` — spec.md (the change), plan.md, research.md, data-model.md,
contracts/routes.md

**Tests**: Small Vitest tests for every pure rule added or changed (constitution III); screens
checked with the spec's acceptance scenarios through the launcher.

## Format: `[ID] [P?] Description (rule ids)`

- **[P]**: can run in parallel (different files, no dependency on unfinished tasks)
- Every task names its files (paths from the repository root) and the rule ids it implements

---

## Phase 1: Rules

- [X] T001 [P] Regions of the plants in `shared/platform/sampleData.js` and the plant criteria in
  `shared/platform/organization.js` (test in `organization.test.js`); "Shared event received" in
  `shared/platform/notifications.js` (Demo data, NT-4)
- [X] T002 New `apps/event-reporting/src/logic/sharingHub.js` with `sharingHub.test.js`: `canShare`,
  `reachPlants`, `namedParts`, `buildPackage`, `shareWarning`, `receivedPackages`, `checkOf`,
  `canCheck`, `startCheck`, `validateLocalAction`, `saveLocalAction`, `setLocalActionStatus`,
  `completeCheck`, `historyOf` (SH-1 to SH-9)
- [X] T003 In `apps/event-reporting/src/logic/notifications.js`: the alerts of a share for the
  reached plants' Site Admins and Managers, skipping the sharer and switched-off alerts; test in
  `notifications.test.js` (SH-6, NT-1, NT-3)

**Checkpoint**: Rules ready, tests green

---

## Phase 2: Sharing

**Scenarios**: 1–3, 7

- [X] T004 New `apps/event-reporting/src/communications/ShareToHub.jsx`; the Share to Hub button and
  the "Shared with" lines in `CommunicationView.jsx`; `apps/event-reporting/src/data/db.js` saves a
  share with its plant alerts (SH-1 to SH-4, SH-6)

**Checkpoint**: Scenarios 1–3 and 7 pass

---

## Phase 3: Receiving

**Scenarios**: 4–6, 8, 9

- [X] T005 New `apps/event-reporting/src/hub/HubList.jsx` (the fifth workspace page in
  `events/EventLibrary.jsx`) and `hub/HubItemPage.jsx` (package with its Classification part, the
  local check, the history); the route in `App.jsx` and `logic/access.js`; plant alerts in
  `shell/Header.jsx` and `shell/AlertsPanel.jsx`; styles appended to `app.css` (SH-5, SH-7 to SH-9,
  EL-1)

**Checkpoint**: Scenarios 4–6, 8 and 9 pass

---

## Phase 6: Review remarks — Share to Hub next to Print

- [X] T009 In `apps/event-reporting/src/communications/CommunicationView.jsx`: Share to Hub in the
  toolbar, next to Print; apply SH-1 to `specs/capabilities/sharing-hub.md`; check scenario 1 (SH-1)

---

## Phase 7: Review remarks — buttons, verifying and closing cases

**Scenarios**: 1, 5, 6, 6b

- [X] T010 In `apps/event-reporting/src/logic/sharingHub.js`: no pre-filled action; `answerYes`,
  `answerNo`, `closeCase`, open and closed cases; tests in `sharingHub.test.js` (SH-7 to SH-9)
- [X] T011 In `apps/event-reporting/src/hub/HubItemPage.jsx` and `HubList.jsx`: Verify locally at the
  top right, Add action, Yes / No, Close case; Open and History parts (SH-5, SH-7, SH-8)
- [X] T012 In `apps/event-reporting/src/communications/CommunicationView.jsx`: Publish Safety Warning
  next to Print (SC-7)
- [X] T013 Apply the remarks to `specs/capabilities/sharing-hub.md` and
  `specs/capabilities/safety-communication.md` (SC-7); run the tests, the builds and the scenarios
  through the launcher

---

## Phase 4: Apply the change to the capabilities

- [X] T006 Create `specs/capabilities/sharing-hub.md` (SH-1 to SH-9, scenarios, Decisions) and apply
  the changes to `specs/capabilities/event-library.md` (EL-1), `notifications.md` (NT-1, NT-3, NT-4,
  scenario 9), `platform-data.md` (Organization) and `specs/domain.md` (Organization, Glossary,
  Capabilities). No "was", no change history.
- [X] T007 Check the counts and names of every changed scenario against the demo data

---

## Phase 5: Checks

- [X] T008 Run `npm test` and `npm run build` in `apps/event-reporting/` and `apps/control-panel/`,
  then the spec's scenarios from **Reset demo data** through the launcher, at 320px and with the
  keyboard, with a clean browser console

---

## Notes

- Commit after each logical group with Conventional Commits
- Review remarks: edit spec.md in place, then add their tasks as a new phase before
  "Apply the change to the capabilities"
