---

description: "Task list for feature 007 Notifications"
---

# Tasks: Notifications

**Input**: `/specs/007-notifications/` — spec.md (the change), plan.md, research.md, data-model.md,
contracts/routes.md

**Tests**: Small Vitest tests for every pure rule added or changed (constitution III); screens
checked with the spec's acceptance scenarios through the launcher.

## Format: `[ID] [P?] Description (rule ids)`

- **[P]**: can run in parallel (different files, no dependency on unfinished tasks)
- Every task names its files (paths from the repository root) and the rule ids it implements

---

## Phase 1: Rules

**Purpose**: The pure functions and their tests

- [X] T001 [P] In `shared/platform/notifications.js`: the alert catalogue (type, kind work /
  information, stage order, hint of NT-4), `settingValue(settings, userId, type)` (no record = on,
  research R3), `canManagePlant(user, plantId)` (Site Admin whose access includes the plant),
  `canChangeSetting(actor, person, type)` (R7), `validateRule(rule)` ("Choose at least one level.",
  "Choose at least one person."), `matchingRules(rules, event)` (R4), `describeRule(rule, …)`
  ("Levels: TF1, TF2 · Departments: Logistics · People: Ana Ribeiro"); tests in
  `shared/platform/notifications.test.js` (NT-2, NT-4, NT-5, NT-6, NT-7, NT-9)
- [X] T002 [P] In `apps/event-reporting/src/logic/notifications.js`: candidates per stage
  (submission, review taken, valid, archived, analysis assigned / completed, plan deployed /
  completed, not effective, closed; NT-3) and `deliverAlerts(candidates, { event, actorId, users,
  settings })` (NT-1, NT-2, research R2); tests in `apps/event-reporting/src/logic/notifications.test.js`
  (NT-1, NT-2, NT-3)
- [X] T003 In `apps/event-reporting/src/logic/actionPlan.js` and `planValidation.js`: drop "Action
  assigned to you"; return the NT-3 candidates of deployment, completion and validation; update
  `actionPlan.test.js` and `planValidation.test.js` (AP-9, AP-12, VAL-3, VAL-4)

**Checkpoint**: Rules ready, tests green

---

## Phase 2: Platform data

**Goal**: Settings, rules and changes stored and protected

- [X] T004 In `shared/platform/platformData.js`: version 2 creating only missing stores
  (`notificationSettings`, `notificationRules`, `notificationChanges`; research R1); reset clears
  them; `getNotificationSettings(userIds)`, `setNotificationSetting(actor, userId, type, on)`,
  `getNotificationRules(plantId)`, `saveNotificationRule(user, rule)` (turns on "Event submitted"
  of its people, NT-8), `deleteNotificationRule(user, ruleId)`, `getNotificationChanges(plantId)`;
  Site Admin writes save their change entry in the same transaction (NT-5, NT-7, NT-8, NT-11,
  PD-3)

**Checkpoint**: Control Panel tests green (they run `shared/`)

---

## Phase 3: Lifecycle alerts

**Goal**: Every step raises the alerts of NT-3, filtered by NT-1/NT-2

**Scenarios**: 1–8, 13

- [X] T005 In `apps/event-reporting/src/data/db.js`: `submitEvent` and `saveWorkflowStep` take
  candidates and deliver them (settings and rules loaded before the transaction, R2); taking the
  review clears the other reviewers' "Event to review" and marks the taker's read (R5) (NT-1,
  NT-3, NT-9, ER-18, ES-9)
- [X] T006 In `apps/event-reporting/src/events/ReviewStep.jsx`, `RootCauseStep.jsx`,
  `ActionPlanStep.jsx`, `ValidationStep.jsx`: pass the candidates of their stage with the acting
  person (NT-3, RV-13, RCA-2, AP-9, AP-12, VAL-3, VAL-4)
- [X] T007 [P] In `apps/event-reporting/src/events/EventDetail.jsx`: the submission banner "Its
  reviewers and the Managers of this plant have been alerted." (ER-19)
- [X] T008 [P] In `apps/event-reporting/src/data/sampleData.js`: demo alerts from the submission
  candidates of the two latest submitted events of each plant (R6, Demo data changes)

**Checkpoint**: Scenarios 1–8 and 13 pass

---

## Phase 4: My notifications

**Goal**: A person turns their information alerts on and off

**Scenarios**: 9, 10 (Event Reporting part)

- [ ] T009 New `apps/event-reporting/src/shell/MyNotifications.jsx` and route `#/notifications` in
  `apps/event-reporting/src/App.jsx`: Always on and Information parts, switches with hints,
  "Saved.", "Set by <name> on <date>"; `document.title` "My notifications" (NT-4, NT-5)
- [ ] T010 [P] In `apps/event-reporting/src/shell/AccountSheet.jsx`: **My notifications** entry
  (ES-6)

**Checkpoint**: Scenario 9 passes

---

## Phase 5: Site Admin notifications

**Goal**: A Site Admin manages submission rules and the people of their plant

**Scenarios**: 10–12, 14

- [ ] T011 In `apps/control-panel/src/shell/PillarPicker.jsx`: one "Notifications · <plant>" card
  per plant for Site Admins (CPW-2, NT-6)
- [ ] T012 New `apps/control-panel/src/notifications/NotificationsPage.jsx` (tabs, permission
  message) and routes in `apps/control-panel/src/App.jsx` (contracts/routes.md) (NT-6)
- [ ] T013 New `apps/control-panel/src/notifications/RulesTab.jsx` and `RuleForm.jsx`: rules per
  pillar, Add rule, edit, delete with "Delete this rule?", messages next to the fields (NT-7, NT-8)
- [ ] T014 New `apps/control-panel/src/notifications/PeopleTab.jsx` and `PersonSettings.jsx`: the
  people of the plant and one person's switches, Always on read-only (NT-10)
- [ ] T015 New `apps/control-panel/src/notifications/ChangesTab.jsx`: the changes, newest first
  (NT-11)

**Checkpoint**: Scenarios 10–12 and 14 pass

---

## Phase 6: Apply the change to the capabilities

- [ ] T016 Create `specs/capabilities/notifications.md` (NT-1 to NT-11, the acceptance scenarios,
  Decisions) and apply the changed rules to `specs/capabilities/event-reporting.md` (ER-18,
  ER-19), `event-review.md` (RV-13), `root-cause-analysis.md` (RCA-2), `action-plan.md` (AP-9,
  AP-12, the Overdue decision, scenarios naming "Action assigned to you"), `validation.md` (VAL-3,
  VAL-4, scenarios naming alerts), `event-reporting-shell.md` (ES-6, ES-9, scenario 6),
  `control-panel-workspace.md` (CPW-2), `platform-data.md` (PD-3, Alerts) and `specs/domain.md`
  (roles, Alerts and notifications, the capability map). No "was", no change history.
- [ ] T017 Check the counts and names of every changed scenario against the demo data

---

## Phase 7: Checks

- [ ] T018 Run `npm test` and `npm run build` in `apps/event-reporting/` and `apps/control-panel/`,
  then the spec's acceptance scenarios from **Reset demo data** through the launcher, at 320px and
  with the keyboard, with a clean browser console

---

## Notes

- Commit after each logical group with Conventional Commits
- Review remarks: edit spec.md in place, then add their tasks as a new phase before
  "Apply the change to the capabilities"
