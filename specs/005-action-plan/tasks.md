---

description: "Task list for feature 005 Action plan"
---

# Tasks: Action plan

**Input**: `/specs/005-action-plan/` — spec.md (the change), plan.md, research.md, data-model.md,
contracts/routes.md

**Tests**: Small Vitest tests for every pure rule added or changed (constitution III); screens
checked with the spec's acceptance scenarios through the launcher.

## Format: `[ID] [P?] Description (rule ids)`

- **[P]**: can run in parallel (different files, no dependency on unfinished tasks)
- Every task names its files (paths from the repository root) and the rule ids it implements

---

## Phase 1: Rules

**Purpose**: The pure functions and their tests

- [X] T001 [P] Extend `apps/event-reporting/src/logic/actions.js`: `emptyAction(whyId, event)` with
  `location` "{ departmentId, workshopId }" from the event, `notifyMaintenance: null`, `status:
  'planned'`, `dueDateHistory: []`; `validateAction` also requires the department and workshop
  ("Choose the department and workshop.") and Notify maintenance ("Say whether maintenance must be
  notified."); `normalizeAction(action, event)` for actions saved before (R2); `isOverdue(action,
  today)` (deployed, not `completed` / `cancelled`, `dueDate` before today); `changeDueDate(action,
  dueDate, userId, now)` appending `{ from, to, by, at }`; tests in `actions.test.js` (AP-4, AP-5,
  AP-8)
- [X] T002 [P] Create `apps/event-reporting/src/logic/actionPlan.js`: `planOwners(event, groups,
  users)` (designated users and group members, else the reviewer, else the Managers who can see the
  event), `canEditPlan(user, event, groups, users)`, `deployPlan(event, userId, now)` returning the
  event and the "Action assigned to you" recipients (distinct assignees who can see the event),
  `addAction` (On Going and alerting once deployed), `setActionStatus(event, actionId, status,
  user, now)` (assignee: On Going → To Complete / Completed, To Complete → Completed; owner: →
  Cancelled; Completed and Cancelled final), `planSummary(event, today)` ("N actions · N completed
  · N overdue"), `completeBlocker(event)` ("Every action must be Completed or Cancelled, and at
  least one Completed."), `completePlan(event, userId, now)` (next required step In Progress, or
  Closed); tests in `actionPlan.test.js` (AP-2, AP-7, AP-9 to AP-13)
- [X] T003 [P] In `apps/event-reporting/src/logic/review.js`: Actions is required when the workflow
  requires it or `event.actions.length > 0`; done when `actionPlan.completedAt`; a not-required
  Actions step of an Open / In Progress event has the state `optional`; tests in `review.test.js`
  (AP-3, RCA-16, EL-17)
- [X] T004 [P] In `apps/event-reporting/src/logic/eventList.js`: `countActions(events, today)` →
  `{ open, overdue }` and the quick filters `openActions` / `overdueActions` (events having such
  actions); tests in `eventList.test.js` (EL-12)

**Checkpoint**: Rules ready, tests green

---

## Phase 2: Preparing actions

**Goal**: Owners see the plan and prepare actions, in the step and from the analysis

**Scenarios**: 1, 2, 11; the first part of 9

- [X] T005 Extend `apps/event-reporting/src/events/ActionModal.jsx`: Location (department and
  workshop of the event's plant, starting from the event), Notify maintenance (Yes / No), an
  optional "Why" select of the analysis's answered whys (only when the event has an analysis, fixed
  when opened from a why), the due date history under the due date; **Create** / Save (AP-4, AP-8,
  RCA-12)
- [X] T006 Create `apps/event-reporting/src/events/ActionLines.jsx` (replaces
  `ActionsSummary.jsx`): one compact line per action — why's answer line when linked, description,
  status badge, priority, assignees, due date, "Maintenance" tag; owners' edit and delete (Planned)
  icons; **View in Action Management** saying "Action Management is not connected in this
  prototype." (AP-6, AP-7)
- [X] T007 In `apps/event-reporting/src/events/RootCauseStep.jsx`: new actions from
  `emptyAction(whyId, event)` (Planned), the list through `ActionLines`; delete
  `ActionsSummary.jsx` (RCA-12, RCA-13)
- [X] T008 Create `apps/event-reporting/src/events/ActionPlanStep.jsx`: header (`planSummary` or
  "Not deployed"), the lines, **Add action** and the popup for owners, read-only for others; title
  "Actions — <record> — Event Reporting" through the steps page (AP-1, AP-2, AP-6, AP-7, AP-11)
- [X] T009 In `apps/event-reporting/src/events/EventSteps.jsx`: show `ActionPlanStep` for the
  Actions step and drop its "comes in a later version" message (EL-18)

**Checkpoint**: Scenarios 1, 2 and 11 pass

---

## Phase 3: Deploying and following

**Goal**: Owners deploy, assignees complete their actions, owners cancel; Overdue shows

**Scenarios**: 3, 4, 5

- [X] T010 In `ActionPlanStep.jsx`: **Deploy action plan** (disabled without a Planned action),
  saved with its alerts through `saveWorkflowStep`; an action added after deployment alerts its
  assignees (AP-9)
- [X] T011 In `ActionLines.jsx`: **To Complete** / **Completed** buttons for the assignee of an On
  Going / To Complete action; **Cancel** (with confirmation) for owners on deployed actions; the
  Overdue badge (red) from `isOverdue` (AP-5, AP-7, AP-10)
- [X] T012 In `ActionModal.jsx` / `ActionPlanStep.jsx`: editing the due date of an action records
  the history through `changeDueDate` (AP-8)

**Checkpoint**: Scenarios 3, 4 and 5 pass

---

## Phase 4: Completing the plan

**Goal**: The plan completes and the event moves on; the analysis routes to Actions

**Scenarios**: 6, 7; the rest of 9

- [X] T013 In `ActionPlanStep.jsx`: **Complete action plan**, disabled with the reason from
  `completeBlocker`; after completing, read-only with "Completed by <name> on <date>" (AP-12,
  AP-13)
- [X] T014 In `apps/event-reporting/src/events/EventDetail.jsx`: history entries "Action plan
  deployed by <name>" and "Action plan completed by <name>" (AP-13, EL-19)
- [X] T015 Check in `apps/event-reporting/src/logic/rootCause.js` that `completeAnalysis` now goes to
  Actions when the plan has actions (through T003), with a test in `rootCause.test.js` (RCA-16)

**Checkpoint**: Scenarios 6, 7 and 9 pass

---

## Phase 5: Optional plan

**Goal**: The owner can start a plan on an event whose workflow does not require Actions

**Scenarios**: 8

- [X] T016 In `apps/event-reporting/src/events/EventSteps.jsx`: the steps menu shows "Optional"; an
  Optional Actions step opens for the plan's owners only, others see "This step is not required for
  this event." (AP-3, EL-17)

**Checkpoint**: Scenario 8 passes

---

## Phase 6: KPIs

**Goal**: Open actions and Overdue actions count for real

**Scenarios**: 10

- [X] T017 In `apps/event-reporting/src/events/KpiOverview.jsx` and `EventLibrary.jsx`: tiles **Open
  actions** and **Overdue actions** from `countActions`, each opening the Events page with its quick
  filter (EL-12)
- [X] T018 [P] Styles for status badges, Overdue, the plan header and the action lines in
  `apps/event-reporting/src/app.css` (appended, theme variables only) (AP-5, AP-6, AP-11)

**Checkpoint**: Scenario 10 passes

---

## Phase 7: Apply the change to the capabilities

- [X] T019 Create `specs/capabilities/action-plan.md` from `.specify/templates/capability-template.md`
  with the rules AP-1 to AP-13, the scenarios and the decisions of the spec; replace RCA-12, RCA-13
  and RCA-16 in `specs/capabilities/root-cause-analysis.md`, EL-12, EL-17, EL-18 and EL-19 in
  `specs/capabilities/event-library.md`; in `specs/domain.md` the Steps rule, the Glossary entry
  Action and the capability map (Action plan specified). The capabilities must read as the current
  behavior: no "was", no change history.
- [X] T020 Check the counts and names of every changed scenario against the demo data

---

## Phase 8: Checks

- [ ] T021 Run `npm test` and `npm run build` in `apps/event-reporting/`, then the spec's acceptance
  scenarios from **Reset demo data** through the launcher, at 320px and with the keyboard, with a
  clean browser console

---

## Notes

- Commit after each logical group with Conventional Commits
- Review remarks: edit spec.md in place, then add their tasks as a new phase before
  "Apply the change to the capabilities"
- `logic/actions.js` is touched by T001 only; `ActionPlanStep.jsx` by T008, T010, T012, T013 and
  `ActionLines.jsx` by T006, T011 — never in parallel
