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
  - Statement pre-filled from `review.statement`, editable.
  - Immediate actions: the step keeps a working copy of `event.immediateActions` and writes it back
    on Save with the analysis (one transaction); the submission's `ImmediateActionsSection` is
    reused, so fields and validation are identical.
  - 5W1H and 6M content (sections, questions, themes, causes, guidance) are constants in
    `logic/rootCause.js`, so the drafts are easy to correct.
  - Part status: Not started (nothing filled), In progress, Done (6M: ≥1 cause, each explained;
    5 Why: ≥1 root cause and every root cause answered; Learnings: text; 5W1H: every section No, or
    Yes with every answer).
  - Complete requires 6M, 5 Why and Learnings Done; it stores `completedBy` / `completedAt` and
    moves the event like the review (next required step, or Closed).
- **Rationale**: Investigation source FR-2 to FR-7, the event-type RCA fields and the UI/UX
  designs, with the user's choices (5W1H optional, no risk gap).

## R5a. Actions from whys live on the event

- **Decision**: `event.actions` (not inside `event.rca`), each with its `whyId`; saved with the
  analysis. Fields from the Action Plan source's corrective action (description, assignees ≤ 5,
  due date, priority); created and edited in a modal, listed in a summary under 5 Why.
- **Rationale**: The Action Plan feature will extend the same records in the Actions step; keeping
  them outside the analysis avoids moving them later.

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

- **Decision**: The whys are a flat list with `parentId` (a tree). Drawn top-down: a why and its
  only next why stack vertically; when a why has several next whys (or there are several first
  whys) they sit in columns side by side, with horizontal scroll on narrow screens. Each why is a
  card numbered by depth with its answer, a "Root cause" toggle (highlights the card), the
  number of its actions, an X icon to delete it, and buttons: Add why (when it has no next why
  and depth < 5), Branch (alternative answer beside it), Add action (once answered).
- **Rationale**: Readable without a diagram library; keyboard-usable controls; a flat list keeps
  updates simple.
