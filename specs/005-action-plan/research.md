# Research: Action plan

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Product decisions are in the spec (Decisions); these are the technical ones.

## R1. Actions stay in `event.actions`; the plan in `event.actionPlan`

- **Decision**: Each action gains `status`, `location`, `notifyMaintenance`, `dueDateHistory`,
  `statusChangedBy` / `statusChangedAt`; `event.actionPlan = { deployedBy, deployedAt,
  completedBy, completedAt }` (null until deployed).
- **Rationale**: 004 already stores the analysis's actions there (004 R5a); one record per event,
  no database version change.
- **Alternatives considered**: an `actions` store (the version bump would delete the demo data
  for nothing).

## R2. Actions saved before this change

- **Decision**: `normalizeAction(action, event)` fills `status: 'planned'`, the event's department
  and workshop, `notifyMaintenance: null` (to be answered before deploying) and an empty history.
- **Rationale**: Actions created in a 004 analysis must open in the new step.

## R3. Steps

- **Decision**: In `logic/review.js`, `isRequired('actions')` is also true when
  `event.actions.length > 0`; `isDone('actions')` is `actionPlan.completedAt`; a not-required
  Actions step of an Open / In Progress event has the state `optional` (instead of `skipped`).
  `EventSteps` opens an Optional step only for the plan's owners.
- **Rationale**: Steps stay computed (003 R2); the analysis and the review already move the event
  to "the next required step", so adding actions is enough to route it to Actions (AP-3).

## R4. Owners and permissions

- **Decision**: `planOwners(event, groups, users)`: the analysis's designated ids (users and group
  members, as `canPerformAnalysis`), else `[review.reviewerId]`, else the Managers who can see the
  event. `canEditPlan(user, event, groups, users)` also requires Actions to be the current step or
  an Optional step of an active event, and the plan not completed.
- **Rationale**: AP-2 and AP-3 in one place, tested.

## R5. Overdue and KPIs

- **Decision**: `isOverdue(action, today)` compares the due date with today's date (local); the
  KPIs count actions with `countActions(events, today)` → `{ open, overdue }`; two hidden quick
  filters `openActions` and `overdueActions` narrow the Events page to the events having such
  actions.
- **Rationale**: Overdue is computed, never stored, so it is right on every day without a server.

## R6. Deploy alerts

- **Decision**: Deploying writes the event and one "Action assigned to you" alert per distinct
  assignee who can see the event (`saveWorkflowStep(event, alerts)`); an action added after
  deployment alerts its assignees the same way.
- **Rationale**: Same pattern as the analysis's designation alerts (004 R4).
