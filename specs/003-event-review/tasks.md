---

description: "Task list for feature 003 Event review"
---

# Tasks: Event review

**Input**: Design documents from `specs/003-event-review/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/routes.md](contracts/routes.md),
[quickstart.md](quickstart.md)

**Tests**: Small Vitest tests for the review rules and the list filtering (constitution principle
III, plan "Testing"). Screens are checked manually with [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be built and checked on its
own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: User story the task belongs to (US1–US5)
- All paths are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Start from a working Event Reporting

- [X] T001 Confirm the branch `003-event-review` runs: `npm test` in `apps/event-reporting/`
  passes and Event Reporting opens through the launcher (`npm run dev` in `launcher/`) with no
  console errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Review rules, storage and the steps route every story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create `apps/event-reporting/src/logic/review.js` (research R2, data-model "Workflow
  step"): `STEPS = ['submission', 'review', 'rootCause', 'actions', 'validation']`,
  `STEP_LABELS`, `INVALID_REASONS = ['Duplicated', 'Useless', 'Bad quality']`,
  `isReviewer(user, event)` (user id in `workflow.phases.review.reviewerIds`),
  `currentStep(event)` ("none when the status is Draft, Archived or Closed; otherwise the first
  required step after Submission that is not done (Review is done once `review.decision` is
  set)"), `stepStates(event)` → `[{ step, state }]` with `done` / `current` / `upcoming` /
  `skipped`
- [X] T003 [P] Add `saveReviewStep(event, alerts)` to `apps/event-reporting/src/data/db.js`:
  writes the event and one alert per `{ recipientId, type }` (with `eventId`, `createdAt =
  event.updatedAt`) in one transaction on `events` and `alerts`; database stays at version 6
  (research R1)
- [X] T004 [P] Add the route name `event-steps` for User, Manager and Site Admin in
  `apps/event-reporting/src/logic/access.js` and the route
  `events/:id/steps/:step` → `EventSteps` in `apps/event-reporting/src/App.jsx`
  (contracts/routes.md "Route")
- [X] T005 Create `apps/event-reporting/src/events/EventSteps.jsx`: load the event by record number
  (`findEvent`), "Not found" for missing, Draft, out of scope or unknown step; top bar (back,
  record number link, `StatusBadge`), title; `document.title` "<Step> — <record number> — Event
  Reporting"; content area per step (filled by the stories)

**Checkpoint**: `#/events/<record number>/steps/submission` opens for a submitted event

---

## Phase 3: User Story 1 - Review a submitted event (Priority: P1) 🎯 MVP

**Goal**: A configured reviewer opens Review from the expanded row or card, assigns themself and
records a valid review; the event moves to its next required step or is Closed

**Independent Test**: Quickstart scenarios 1, 3, 5, 6

### Tests for User Story 1

- [X] T006 [P] [US1] Write `apps/event-reporting/src/logic/review.test.js`: `canStartReview` true
  for a listed reviewer while Review is current, false for others; `claimReview` sets "In
  Progress" and the reviewer; `validateReview` asks for the decision, refuses an empty statement
  and one containing the reporter's full name (case ignored); `completeReview` valid → Closed when
  nothing else is required, In Progress when Actions is required

### Implementation for User Story 1

- [X] T007 [US1] Add to `apps/event-reporting/src/logic/review.js`: `canStartReview(user, event)`
  (reviewer, current step Review, `review.reviewerId` empty or the user), `claimReview(event,
  userId, now)` → status "In Progress", `review = { reviewerId, claimedAt, decision: null }`,
  `validateReview(review, reporterName)` → `{ field: message }` ("Required when `decision =
  'valid'`; must not contain the reporter's full name (case ignored)"), `completeReview(event,
  review, now)` → next required step with "In Progress", or "Closed" with `closedAt`
- [X] T008 [US1] Create `apps/event-reporting/src/events/ReviewStep.jsx` — taking the review:
  "This event is waiting for a reviewer." with **Assign myself as reviewer** for the event's
  reviewers (saves `claimReview` through `saveReviewStep`), or the list of reviewers for others
- [X] T009 [US1] In `apps/event-reporting/src/events/ReviewStep.jsx`, the form for the assigned reviewer: "You are the assigned
  reviewer for this event."; "Is this a valid event?" (`YesNoField`); Yes → Event statement
  (required, hint "Do not name the reporter") and one optional searchable multi-select per list of
  `listsForPillar(event.pillarId)` minus lists that only group another list, values from
  `availableValues(values, activations, { listId, plantId: event.plantId })`, Body Parts grouped
  by category (research R5); Comments (optional); **Complete review** saves `completeReview`;
  errors next to the fields
- [X] T010 [US1] In `apps/event-reporting/src/events/ReviewStep.jsx`, the read-only summary of a done review: reviewer, date,
  valid, statement and chosen values per list (or reason), comments (FR-016)
- [X] T011 [US1] Show the Review step in `apps/event-reporting/src/events/EventSteps.jsx` and
  update the event shown after each save
- [X] T012 [P] [US1] Add the **Review** button (primary, to `…/steps/review`) to
  `apps/event-reporting/src/events/EventExpanded.jsx` when `canStartReview(user, event)`; otherwise a
  **Workflow steps** link to the current step (or Submission) for submitted events (FR-002,
  FR-003)
- [X] T013 [P] [US1] Add a **Review** / **Workflow steps** button to the bottom bar of
  `apps/event-reporting/src/events/EventDetail.jsx` for submitted events, same rule (FR-003)

**Checkpoint**: A reviewer completes a valid review; TF4 closes, TF1–TF2 stay In Progress

---

## Phase 4: User Story 2 - Archive an event that is not valid (Priority: P1)

**Goal**: A not valid event is Archived with a reason, the people concerned are alerted, and it
leaves the default list

**Independent Test**: Quickstart scenario 7

### Tests for User Story 2

- [X] T014 [P] [US2] Add to `apps/event-reporting/src/logic/review.test.js`: `validateReview`
  asks for a reason when not valid; `completeReview` not valid → "Archived" with the reason kept
- [X] T015 [P] [US2] Add to `apps/event-reporting/src/logic/eventList.test.js`: Archived events are
  left out without a status filter and listed with `status: 'Archived'`

### Implementation for User Story 2

- [X] T016 [US2] Extend `completeReview` in `apps/event-reporting/src/logic/review.js`: not valid →
  status "Archived", `archivedAt`; `validateReview` requires `invalidReason` in
  `INVALID_REASONS` ("Required when `decision = 'invalid'`")
- [X] T017 [US2] In `apps/event-reporting/src/events/ReviewStep.jsx`: No → reason chips Duplicated
  / Useless / Bad quality, button **Archive event**; on save send "Event archived (<reason>)" to
  the reporter, the people shared with and the other reviewers, never the reviewer (research R6)
- [X] T018 [US2] In `apps/event-reporting/src/logic/eventList.js`: `applyFilters` drops Archived
  events unless `filters.status === 'Archived'`; the `open` quick filter counts Open and In
  Progress (research R7, FR-019)
- [X] T019 [P] [US2] Add a Status choice (Draft, Open, In Progress, Closed, Archived; tap again to
  clear) to `apps/event-reporting/src/events/FilterSheet.jsx`
- [X] T020 [P] [US2] In `apps/event-reporting/src/events/KanbanBoard.jsx`, show the Archived column
  only when the events shown include Archived ones

**Checkpoint**: Archived events disappear from the list and come back with the filter

---

## Phase 5: User Story 3 - Follow the steps of an event (Priority: P2)

**Goal**: The steps menu with done / current / not reached / not required steps, Submission
content and placeholders

**Independent Test**: Quickstart scenario 2 and the steps of scenarios 5–7

### Tests for User Story 3

- [X] T021 [P] [US3] Add to `apps/event-reporting/src/logic/review.test.js`: `currentStep` after a
  valid review is the next required step; `stepStates` for "Review + Actions after review" is
  done, done, skipped, current, skipped; no current step once Archived or Closed

### Implementation for User Story 3

- [X] T022 [US3] Add the steps menu to `apps/event-reporting/src/events/EventSteps.jsx`: one entry
  per step with number or check, name and "Done" / "Current step" / "Not reached yet" / "Not
  required"; done and current are links, the others `aria-disabled`; the open step marked
  `aria-current="step"`
- [X] T023 [US3] In `apps/event-reporting/src/events/EventSteps.jsx`: Submission shows the reported event section by section
  (`describeEvent`); Root cause analysis, Actions and Validation say "<Step> comes in a later
  version of the prototype."; a disabled step opened by its address says "This step has not been
  reached yet." or "This step is not required for this event."
- [X] T024 [P] [US3] Add the steps page styles to `apps/event-reporting/src/app.css` with theme
  variables only: menu beside the content, a horizontal strip under 768px, struck-through names of
  "Not required" steps

**Checkpoint**: The steps of any submitted event read correctly

---

## Phase 6: User Story 4 - One reviewer at a time (Priority: P2)

**Goal**: Once a reviewer assigned themself, the others cannot review

**Independent Test**: Quickstart scenario 4

- [X] T025 [US4] Add to `apps/event-reporting/src/logic/review.test.js`: after `claimReview` by
  Carla, `canStartReview` is false for Eva and still true for Carla
- [X] T026 [US4] In `apps/event-reporting/src/events/ReviewStep.jsx`, when the review is taken by
  someone else: "<name> is reviewing this event." (+ "Only the assigned reviewer can complete the
  review." for a reviewer) and no form

**Checkpoint**: Two reviewers never both get the form

---

## Phase 7: User Story 5 - Reviewed events are locked for editing (Priority: P3)

**Goal**: Only Draft and Open events can be edited from the form

**Independent Test**: Quickstart scenario 8

- [X] T027 [US5] In `canEditEvent` of `apps/event-reporting/src/logic/access.js`: submitted events
  are editable only while "Open" (Managers of the plant and pillar); In Progress, Archived and
  Closed are not (research R8); check the Edit buttons of
  `apps/event-reporting/src/events/EventDetail.jsx` and `EventExpanded.jsx` and the `/edit`
  address follow it

**Checkpoint**: All five stories work

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T028 [P] Update the "How to test" section of `apps/event-reporting/README.md` with the review
  flow (constitution V)
- [X] T029 Check `apps/event-reporting/src/events/EventSteps.jsx` and `ReviewStep.jsx` at 320px and with the keyboard (step links, Yes/No
  and reason chips, multi-selects, buttons), titles per step (constitution IV)
- [X] T030 Run `npm test` and `npm run build` in `apps/event-reporting/`; open Event Reporting,
  Control Panel and User Management through the launcher with no console errors
- [X] T031 Run the whole [quickstart.md](quickstart.md) from **Reset demo data** and mark this file
  complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup — blocks all stories
- **US1 (Phase 3)**: after Foundational
- **US2 (Phase 4)**: after US1 (the decision form is built there)
- **US3 (Phase 5)**: after Foundational; the menu can be built alongside US1
- **US4 (Phase 6)**: after US1 (needs the claim)
- **US5 (Phase 7)**: after Foundational; independent of the review screens
- **Polish (Phase 8)**: after the stories wanted

### Within Each Story

- Rules in `logic/review.js` and their tests first, then `ReviewStep.jsx` / `EventSteps.jsx`, then
  the entry points
- `ReviewStep.jsx` is touched by T008–T010, T017, T026 and `review.js` by T002, T007, T016 — never
  in parallel

### Parallel Opportunities

- T003 and T004 together after T002
- US1: T006 with T007's start; T012 and T013 together after T007
- US2: T014, T015, T019, T020 together
- US3: T021 and T024 alongside T022
- US5 can run beside US2–US4

---

## Parallel Example: User Story 2

```text
Task: "Tests: not valid needs a reason, Archived kept"      (T014)
Task: "Tests: Archived hidden unless filtered"              (T015)
Task: "Status choice in FilterSheet.jsx"                    (T019)
Task: "Archived Kanban column only when shown"              (T020)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 US1 → **stop and validate** quickstart scenarios 1, 3, 5, 6
3. Demo: a reviewer closes a TF4 near miss with a valid review

### Incremental Delivery

1. + US2 archiving → scenario 7
2. + US3 steps menu → scenario 2
3. + US4 one reviewer → scenario 4
4. + US5 edit lock → scenario 8
5. Polish → full quickstart

---

## Notes

- A first version of this feature already exists on the branch (written before the spec);
  `/speckit-converge` compares it with these tasks and adds what is missing
- Commit after each task or logical group with Conventional Commits (`feat:`, `test:`, `docs:`…)
- Event Reporting imports only from `shared/`; never from another app
- Check the browser console before each commit (constitution III)

## Phase 9: Convergence

- [X] T032 Keep only the fields of the decision taken in the saved review (not valid: `invalidReason`, no statement or classification; valid: statement and classification, no reason) in `completeReview` of `apps/event-reporting/src/logic/review.js`, with a test in `apps/event-reporting/src/logic/review.test.js`, per data-model "Review" (partial)

## Phase 10: Second review — severity and critical events (User Story 6)

**Goal**: Severity / loss and SIP answers at review, the critical classification in red, "further
analyze" routing, and the form changes of the second review (spec Clarifications, second review)

**Independent Test**: Quickstart scenarios 11–15

- [X] T033 [P] [US6] Create `apps/event-reporting/src/logic/severity.js`: `BANDS` (Low 2–15, Medium
  20–30, High 50–100), `INJURY_MATRIX` (safety source), provisional `LOSS_MATRIX`, `rate`,
  `assessmentFor(event)` (safety Potential TF1–TF4 / Actual TF1–TF3 and required lists;
  Environment SIP question; Industrial Risk Potential SRE1–SRE5 / Actual SRE1–SRE3),
  `criticalFlagsOf`, `typedFlag`, `criticalLabels`; tests in `severity.test.js`
- [X] T034 [US6] Extend `apps/event-reporting/src/logic/review.js`: `validateReview(review, event,
  reporterName)` with the Bad quality comment, required lists, matrices, SIP answer, SIP / SPL type
  and "further analyze"; `asksFurtherAnalysis`; Root cause analysis required when `furtherAnalysis`
  is true; Archived steps after Review never Done; `completeReview` keeps only the decided fields
  and `criticalFlags`; tests in `review.test.js`
- [X] T035 [P] [US6] Add the reference lists `sipTypeHs` (15 source values), `sipTypeEnv` and
  `splType` (provisional) to `apps/event-reporting/src/data/sampleData.js`
- [X] T036 [P] [US6] Create `apps/event-reporting/src/events/SeverityMatrix.jsx` (clickable cells
  with score, band colors, chosen cell, result line) and its styles in `apps/event-reporting/src/app.css`
- [X] T037 [US6] Rework `apps/event-reporting/src/events/ReviewStep.jsx`: statement pre-filled
  with the description; Bad quality comment; no Comments; per-pillar severity, SIP question,
  critical notice and type; "further analyze" proposed Yes when critical; summary with severities,
  flags and type; `noValidate` so the app's messages show
- [X] T038 [P] [US6] Show the critical classification in red: `isCritical` in
  `apps/event-reporting/src/logic/display.js`, `isSip` from the review in `logic/eventList.js`,
  `apps/event-reporting/src/events/CriticalBadges.jsx` in the List title, Kanban card, event page and steps page
- [X] T039 [US6] Recreate the review form per event (`key={event.id}`) in
  `apps/event-reporting/src/events/EventSteps.jsx` so answers never carry over between events
- [X] T040 Check `apps/event-reporting/src/events/SeverityMatrix.jsx` and the review form at 320px
  and with the keyboard
- [X] T041 Run `npm test` and `npm run build` in `apps/event-reporting/` and quickstart scenarios
  11–15 from **Reset demo data**

## Phase 11: Convergence

- [X] T042 Describe the severity, critical events and Bad quality comment in the "How to test" of `apps/event-reporting/README.md` per Constitution V (partial)

## Phase 12: Third review — layout and one event page

**Goal**: Clearer review form, required lists per pillar, and the steps page as the only page of
a submitted event (spec Clarifications, third review)

**Independent Test**: Quickstart scenarios 16–18

- [X] T043 [US6] Require Aspects and Impacts (Environment) and the Category (Industrial Risk) in
  `assessmentFor` of `apps/event-reporting/src/logic/severity.js`; test in `severity.test.js`
- [X] T044 [US6] In `apps/event-reporting/src/events/ReviewStep.jsx`: titled parts
  (`ReviewSection`), framed Potential / Actual / SIP blocks with the type inside (`CriticalType`),
  Industrial Risk without the read-only H&S lists, button on the right; styles in
  `apps/event-reporting/src/app.css`
- [X] T045 [US3] Share the header card and sections of `apps/event-reporting/src/events/EventDetail.jsx`
  (`EventHeadCard`, `EventSections`, `SavedBanner`), redirect submitted events to their steps page,
  add the review to the history
- [X] T046 [US3] Make `apps/event-reporting/src/events/EventSteps.jsx` the event page: header card,
  banner after a submit, Submission with sections and Edit; Open event in `EventExpanded.jsx` opens
  the current step and the Workflow steps link is removed
- [X] T047 Run `npm test`, `npm run build` and quickstart scenarios 16–18 in `apps/event-reporting/`

## Phase 13: Fourth review — compact header, archived KPIs, editing in place

**Independent Test**: Quickstart scenarios 19–20

- [X] T048 [P] [US3] Compact header card (`compact` prop of `EventHeadCard` in
  `apps/event-reporting/src/events/EventDetail.jsx`, styles in `app.css`) on the steps page
- [X] T049 [P] Add `countArchivedByReason` to `apps/event-reporting/src/logic/eventList.js` with a
  test; extract `apps/event-reporting/src/events/StackedColumnChart.jsx` from `EventsByTypeChart.jsx`;
  add `ArchivedByReasonChart.jsx` and the "Archived events" number in `KpiOverview.jsx` and
  `EventLibrary.jsx`
- [X] T050 [US5] Embedded mode of `apps/event-reporting/src/create/EventForm.jsx` shown in the
  Submission step of `events/EventSteps.jsx` for those who may edit, with `EventHistory`; no Edit
  link in `events/EventExpanded.jsx`; the standalone edit page sends submitted events to their page
- [X] T051 Run `npm test`, `npm run build` and quickstart scenarios 19–20 in `apps/event-reporting/`
