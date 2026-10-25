---

description: "Task list for feature 004 Root cause analysis"
---

# Tasks: Root cause analysis

**Input**: Design documents from `specs/004-root-cause-analysis/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/routes.md](contracts/routes.md),
[quickstart.md](quickstart.md)

**Tests**: Small Vitest tests for the groups helpers, the analysis rules and the steps rules
(constitution principle III); screens checked with [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be built and checked on its
own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: User story the task belongs to (US1–US3)
- All paths are relative to the repository root

---

## Phase 1: Setup

- [X] T001 Confirm the branch `004-root-cause-analysis` runs: `npm test` passes in
  `apps/event-reporting/` and `apps/control-panel/`, and the apps open through the launcher with
  no console errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Sample groups, the analysis rules and the storage every story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Add `investigationGroups` to `shared/platform/sampleData.js` — the 4 groups of
  data-model.md, each `{ id, name, pillarIds, plantIds, memberIds }`
- [X] T003 [P] Create `shared/platform/groups.js`: `groupsCovering(groups, { plantId, pillarId })`
  ("A group is offered for an event when it covers the event's plant and pillar"),
  `groupsVisibleTo(viewer, groups)` (Central: all; others: groups sharing a plant with their
  roles), `membersOf(groups, groupIds)`; tests in `shared/platform/groups.test.js`
- [X] T004 Create `apps/event-reporting/src/logic/rootCause.js`: `THEMES` (Man, Machine, Method,
  Materials, Mother Nature, Management), `MAX_CAUSES = 6`, `MAX_WHYS = 5`, `FIVE_W1H` sections,
  `emptyAnalysis(event, lists)` (statement from `review.statement`, immediate actions from the
  submission), `partStatus(analysis)`, `validateAnalysis(analysis)`, `completeAnalysis(event,
  analysis, userId, now)` (research R5, R6)
- [X] T005 [P] Rename `saveReviewStep` to `saveWorkflowStep` in
  `apps/event-reporting/src/data/db.js` and its callers (event + alerts in one transaction, R2)
- [X] T006 In `apps/event-reporting/src/logic/review.js`: a step is done when `review.decision`
  (Review) or `rca.completedAt` (Root cause analysis) is set; `currentStep` and `stepStates`
  follow (R6); tests in `review.test.js`

**Checkpoint**: Rules and groups ready, tests green

---

## Phase 3: User Story 1 - Designate who analyzes, in the review (Priority: P1) 🎯 MVP

**Goal**: The review requires the designation when the analysis will happen and alerts the people

**Independent Test**: Quickstart scenarios 1–3

- [X] T007 [US1] Add to `apps/event-reporting/src/logic/review.js`: `leadsToAnalysis(event,
  review)` (workflow requires Root cause analysis or `furtherAnalysis = true`); `validateReview`
  requires ≥1 assignee then ("Required (≥1 entry) when the analysis will happen");
  `completeReview` keeps `rcaAssignees` (null otherwise); tests in `review.test.js`
- [X] T008 [US1] Add `assigneeIds(event, groups, users)` to
  `apps/event-reporting/src/logic/rootCause.js` (designated users + group members who can see the
  event, once each, without the reviewer) with a test
- [X] T009 [US1] In `apps/event-reporting/src/events/ReviewStep.jsx`: "Who will perform the root
  cause analysis?" in the Next step part — searchable multi-select with option groups Users (plant
  users who can see the pillar) and Groups (`groupsCovering`), values `user:<id>` / `group:<id>`;
  alerts "Root cause analysis assigned to you" on save; the summary shows the designation

**Checkpoint**: A review leading to the analysis cannot be completed without designated people

---

## Phase 4: User Story 2 - Perform the root cause analysis (Priority: P1)

**Goal**: Designated people fill, save and complete the analysis; others read it

**Independent Test**: Quickstart scenarios 4–7

- [X] T010 [US2] Add `canPerformAnalysis(user, event, groups)` to
  `apps/event-reporting/src/logic/rootCause.js` (designated user or member; the reviewer when
  nobody was designated; only while it is the current step) and tests for it, `partStatus`,
  `validateAnalysis` and `completeAnalysis` in `rootCause.test.js`
- [X] T011 [P] [US2] Create `apps/event-reporting/src/events/FiveW1HPart.jsx` (six sections,
  Applies? Yes/No, answer when Yes)
- [X] T012 [P] [US2] Create `apps/event-reporting/src/events/SixMPart.jsx` (cause cards: theme,
  cause, "Why was … a possible cause?", remove; Add cause disabled at 6 with "At most 6 causes")
- [X] T013 [P] [US2] Create `apps/event-reporting/src/events/FiveWhyPart.jsx` (legs as columns,
  numbered whys, Root cause toggle with Behavioral / Conditional, Add why up to 5, Remove last
  why, Branch, Remove leg)
- [X] T014 [US2] Create `apps/event-reporting/src/events/RootCauseStep.jsx`: overview (assigned
  to, statement, immediate actions, part status chips), the parts, Learnings, Save and Complete
  analysis on the right, errors per part, read-only view (and "Completed by … on …")
- [X] T015 [US2] Show `RootCauseStep` for the Root cause analysis step in
  `apps/event-reporting/src/events/EventSteps.jsx`; add "Root cause analysis completed" to the
  history in `apps/event-reporting/src/events/EventDetail.jsx`
- [X] T016 [P] [US2] Styles for the parts (cause cards, 5 Why columns with horizontal scroll,
  status chips) in `apps/event-reporting/src/app.css` with theme variables only

**Checkpoint**: The analysis can be saved, completed, and read by others

---

## Phase 5: User Story 3 - See the investigation groups (Priority: P2)

**Goal**: A read-only Groups tab in User Management

**Independent Test**: Quickstart scenario 8

- [X] T017 [P] [US3] Create `apps/user-management/src/shell/PageTabs.jsx` (Users · Groups) and show
  it on `apps/user-management/src/users/UsersList.jsx`
- [X] T018 [US3] Create `apps/user-management/src/groups/GroupsList.jsx` (route `#/groups` in
  `apps/user-management/src/App.jsx`): groups from `groupsVisibleTo`, name, pillar tags, plants,
  members with their event role; title "Groups — User Management"

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T019 [P] Update "How to test" in `apps/event-reporting/README.md` and
  `apps/user-management/README.md`
- [X] T020 Check `apps/event-reporting/src/events/RootCauseStep.jsx` and the Groups tab at 320px and
  with the keyboard (constitution IV)
- [X] T021 Run `npm test` and `npm run build` in `apps/event-reporting/`, `apps/control-panel/`
  and `apps/user-management/`, then the whole [quickstart.md](quickstart.md) from **Reset demo
  data**

---

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2; US3 needs only Foundational (T002–T003)
- `logic/rootCause.js` is touched by T004, T008, T010 and `logic/review.js` by T006, T007 —
  never in parallel; `ReviewStep.jsx` by T005 (rename) and T009

### Parallel Opportunities

- T002, T003 and T005 together
- T011, T012, T013 and T016 together once T010 is done
- US3 (T017, T018) beside US1 and US2

---

## Implementation Strategy

1. Foundational → US1 (designation) → validate scenarios 1–3
2. US2 (analysis) → scenarios 4–7
3. US3 (Groups tab) → scenario 8
4. Polish → full quickstart

## Notes

- Commit after each logical group with Conventional Commits; check the console before committing
- Apps import only `shared/`; the groups are read, never written
