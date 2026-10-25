# Research: Root cause analysis

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-25

The product questions were settled with the user (spec Clarifications); these are the design
decisions.

## R1. Groups are fixed sample data in `shared/platform/`

- **Decision**: `investigationGroups` in `shared/platform/sampleData.js` — `{ id, name, pillarIds,
  plantIds, memberIds }` — read directly by the apps through `shared/platform/groups.js`
  (`groupsCovering(groups, { plantId, pillarId })`, `groupsVisibleTo(viewer, groups)`,
  `membersOf(groups, groupIds)`). No database store.
- **Rationale**: The groups cannot be edited anywhere; a store would need a version change of the
  `platform` database for nothing. Both apps already import `shared/platform/`.
- **Alternatives considered**: a `groups` store refreshed like the users (more code, same
  result); groups in Event Reporting only (User Management must list them too).

## R2. The analysis is stored on the event

- **Decision**: `event.rca` holds the analysis; `event.review.rcaAssignees = { userIds, groupIds }`
  holds the designation. Saves go through one helper writing the event and its alerts in one
  transaction (`saveWorkflowStep`, the former `saveReviewStep`).
- **Rationale**: Same choice as the review (003 R1): one record per event, no version bump.

## R3. Who may edit the analysis

- **Decision**: `canPerformAnalysis(user, event, groups)` — the current step is Root cause
  analysis and the user is a designated user or a member of a designated group; when nobody was
  designated (events reviewed before this feature), the reviewer. Everyone else who can see the
  event reads it.
- **Rationale**: Spec FR-006; group membership is resolved at reading time, so a change in the
  sample groups applies at once.

## R4. Designation in the review

- **Decision**: One searchable multiple-choice list with two groups of options, "Users" (users of
  the event's plant who can see its pillar) and "Groups" (groups covering the plant and pillar);
  values `user:<id>` / `group:<id>` split into `rcaAssignees` on save. Shown and required only
  when the analysis will happen: the workflow requires Root cause analysis, or "further analyze"
  is Yes (proposed Yes counts). Alerts "Root cause analysis assigned to you" go to the designated
  users and the group members who can see the event, once each, never the reviewer.
- **Rationale**: User's choice of one dropdown; visibility rules avoid alerting people who could
  not open the event.

## R5. Analysis content and completion

- **Decision**:
  - Statement pre-filled from `review.statement`; immediate actions from the descriptions of the
    submission's immediate actions (one per line, "None recorded." when empty); both editable.
  - 5W1H: six sections `{ applies: true | false | null, answer }`; optional.
  - 6M: causes `{ id, theme, cause, why }`, themes Man, Machine, Method, Materials, Mother Nature,
    Management; at most 6.
  - 5 Why: legs `{ id, whys: [{ id, answer, rootCause: null | 'behavioral' | 'conditional' |
    'unclassified' }] }`; a leg holds 1–5 whys; the first leg exists from the start.
  - Part status: Not started (nothing filled), In progress, Done (6M: ≥1 complete cause; 5 Why:
    ≥1 classified root cause with an answer; Learnings: text; 5W1H: every section answered No or
    Yes with an answer).
  - Complete requires 6M, 5 Why and Learnings Done; it stores `completedBy` / `completedAt` and
    moves the event like the review (next required step, or Closed).
- **Rationale**: Investigation source FR-2 to FR-7 and the event-type RCA fields, with the user's
  choices (5W1H optional, no risk gap).

## R6. Steps after the analysis

- **Decision**: In `logic/review.js` a step is done when `review.decision` is set (Review) or
  `rca.completedAt` is set (Root cause analysis); `currentStep` skips done steps. The completed
  analysis is shown read-only with who completed it and when.
- **Rationale**: Keeps the steps computed (003 R2).

## R7. Groups tab in User Management

- **Decision**: Tabs "Users · Groups" under the page heading; `#/groups` lists the groups covering
  at least one of the viewer's plants (all for Central): name, pillar tags, plants, members (with
  their event role). Read only, like the users.
- **Rationale**: User's choice; same perimeter rule as the users list (002 FR-027).

## R8. 5 Why layout

- **Decision**: Legs as columns side by side (horizontal scroll on narrow screens), each why a
  numbered card with its answer, a "Root cause" toggle and, when on, Behavioral / Conditional
  chips; "Add why" under a leg (up to 5), "Branch" adds a leg after it; remove the last why or a
  leg (not the only one).
- **Rationale**: Readable without a diagram library; keyboard-usable controls.
