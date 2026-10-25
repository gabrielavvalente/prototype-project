# Feature Specification: Event review

**Feature Branch**: `003-event-review`

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description: "For the reviewers, there should be a review button on the expanded
row in the list view and Kanban view." Then, after reading the Review and Governance sources: "The
reviewers configured in the Control Panel can review. Include the new statuses. Take the user to
a review page, which has a submenu recapping the steps Submission, Review, Root cause, Actions and
Validation; steps that have not happened yet are disabled and the ones that have happened can be
opened again. If there is no other phase, the event is Closed."

**App folder**: `apps/event-reporting/` (reads the workflow kept on each event and the master
data of `shared/platform/`, from feature 002)

**Sources**: [core.md](../001-event-reporting/source/core.md) (lifecycle, statuses, review and
archiving),
[Review and Governance](../001-event-reporting/source/features/06-review-and-governance/Review%20and%20Governance.md)
(Initial Review, event statement without the reporter's name),
[detailed-screens-specification.md](../001-event-reporting/source/detailed-screens-specification.md)
(SCR-DSK-03 and SCR-MOB-03: claim the review, valid / invalid decision, classification blocks),
[002 Control Panel](../002-control-panel/spec.md) (review groups FR-010, workflow kept on the
event FR-012, master data per pillar).

## Clarifications

### Session 2026-10-25

- Q: Who can review an event? → A: The reviewers configured in the Control Panel for the event's
  pillar, level and plant, as kept on the event when it was submitted. Their event role does not
  matter (a Site Admin in the group can review).
- Q: Which statuses does the event use? → A: The core lifecycle: Draft, Open, **In Progress**,
  **Archived**, Closed.
- Q: What does the Review button do? → A: It opens the event's review page. The page has a
  steps menu (Submission, Review, Root cause analysis, Actions, Validation); steps already reached
  can be opened again, the others are disabled.
- Q: How does a reviewer take the review? → A: On the review page, with an **Assign myself as
  reviewer** button. Opening the page alone changes nothing.
- Q: What happens after a valid review when no other phase is required? → A: The event is
  **Closed**.
- Q: Where do Archived events appear? → A: They are hidden from the list and the Kanban by
  default and appear only when the Status filter asks for Archived.
- Q: Can a reviewed event still be edited from the form? → A: No. Once reviewed (In Progress,
  Archived or Closed) the submission is locked; corrections belong to the review.
- Q: Which classification lists does the review offer? → A: The Control Panel lists of the
  event's pillar, with the values available at the event's plant. Health & Safety: Standards,
  Hazards, Body Parts (grouped by category), Injuries. Environment: Aspects, Impacts. Industrial
  Risk: Categories, plus the Health & Safety Standards and Hazards. Industrial Hygiene: none yet.
- Q: What is in this version of the review? → A: Valid / not valid with a reason, event
  statement, classification and comments. Owner, Final Reviewer, HPR, Risk / Cost / Ease and
  Attackability score, severity matrix, investigators, Safety Alert, Record Historian, Rework and
  Final Review come later.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review a submitted event (Priority: P1)

Carla Mendes is in the review group of Health & Safety TF1–TF4 at Lyon. In the event list she
expands the row of a TF4 near miss that is waiting for review and sees a **Review** button. It
opens the event's review page, which says "This event is waiting for a reviewer." She clicks
**Assign myself as reviewer**: the event becomes **In Progress** and she is now its only
reviewer. She answers "Is this a valid event?" with Yes, writes the event statement ("An
operator saw a pallet fall from the racking; nobody was nearby."), picks the related Standard and
Hazard and completes the review. Nothing else is required for TF4, so the event is **Closed**.

**Why this priority**: Review is the first control point after submission; without it every
event stays Open and nothing tells whether it is valid.

**Independent Test**: Sign in as a configured reviewer, open the Review button of an Open event
whose workflow requires Review, assign yourself, record a valid review and check the new status.

**Acceptance Scenarios**:

1. **Given** an Open event whose workflow requires Review and lists me as a reviewer, **When** I
   expand its row in the List view or its card in the Kanban view, **Then** I see a Review button
   that opens the event's review page.
2. **Given** I am not one of the event's reviewers, **When** I expand the same row or card,
   **Then** there is no Review button (I see a link to the workflow steps instead).
3. **Given** the review page of an event nobody has taken, **When** I click Assign myself as
   reviewer, **Then** the event becomes In Progress and the review form opens for me.
4. **Given** I am the assigned reviewer, **When** I say the event is valid and leave the event
   statement empty, **Then** the review is not saved and the statement is asked for.
5. **Given** the reporter is Ana Ribeiro, **When** my event statement contains "Ana Ribeiro",
   **Then** the review is not saved and I am told not to name the reporter.
6. **Given** a valid review and a workflow that requires nothing after Review, **When** I complete
   the review, **Then** the event is Closed.
7. **Given** a valid review and a workflow that also requires Actions, **When** I complete the
   review, **Then** the event stays In Progress and its current step is Actions.

---

### User Story 2 - Archive an event that is not valid (Priority: P1)

Felix Tanaka takes the review of an event at Curitiba that repeats one reported the day before.
He answers "Is this a valid event?" with No, must choose a reason (Duplicated, Useless or Bad
quality), chooses Duplicated and archives it. The event becomes **Archived**, leaves the active
list, and the reporter, the people it was shared with and the other reviewers get an alert with
the reason.

**Why this priority**: Invalid events must leave the active workflow without being deleted, so
duplicates and low-quality reports do not pollute it while staying traceable.

**Independent Test**: As the assigned reviewer, answer No, try to archive without a reason, then
with one; check the status, the list and the alerts of the people involved.

**Acceptance Scenarios**:

1. **Given** I answered No, **When** I try to archive without a reason, **Then** nothing is saved
   and a reason is asked for.
2. **Given** I answered No and chose Duplicated, **When** I archive the event, **Then** its status
   is Archived and the reporter, the people it was shared with and the other reviewers each get an
   "Event archived (Duplicated)" alert; I do not alert myself.
3. **Given** an Archived event, **When** anyone opens the event list or the Kanban without a
   status filter, **Then** the event is not shown.
4. **Given** an Archived event, **When** I choose Status = Archived in the filters, **Then** the
   event is listed and can still be opened.

---

### User Story 3 - Follow the steps of an event (Priority: P2)

Any person who can see a submitted event can open its workflow steps: a menu with Submission,
Review, Root cause analysis, Actions and Validation. Each step shows whether it is done, current,
not reached yet or not required. Steps done and the current step open; the others are disabled.
Submission shows what was reported; a done Review shows the decision, reason or statement,
classification, reviewer and date.

**Why this priority**: Reviewers and reporters need to see where an event stands and what was
decided; it also prepares the place where the later steps will live.

**Independent Test**: Open the steps of events in several states (waiting for review, reviewed
with Actions required, Closed, Archived) and check which steps are enabled and what they show.

**Acceptance Scenarios**:

1. **Given** an Open event waiting for review, **When** I open its steps, **Then** Submission is
   done, Review is current, and the steps not required are marked "Not required" and disabled.
2. **Given** a reviewed event that requires Validation only after Review, **When** I open its
   steps, **Then** Submission and Review are done and can be opened, Validation is current, Root
   cause analysis and Actions are "Not required".
3. **Given** a step that is not reached yet or not required, **When** I try to open it, **Then**
   it cannot be opened and says why.
4. **Given** the current step is Root cause analysis, Actions or Validation, **When** I open it,
   **Then** it says this step comes in a later version.

---

### User Story 4 - One reviewer at a time (Priority: P2)

Eva Novak is also in the Lyon review group. Carla already assigned herself to an event. Eva no
longer sees the Review button on it; if she opens its review page she reads "Carla Mendes is
reviewing this event." and cannot record a decision. On events nobody has taken, Eva can still
assign herself.

**Why this priority**: Two reviewers must never review the same event (Notifications US-NOT-03,
Review and Governance US-GOV-02).

**Independent Test**: Assign one reviewer, sign in as another reviewer of the same event, check
the button and the page.

**Acceptance Scenarios**:

1. **Given** Carla is the assigned reviewer, **When** Eva expands the event, **Then** she sees no
   Review button.
2. **Given** Carla is the assigned reviewer, **When** Eva opens the review page, **Then** she sees
   who is reviewing and no form.
3. **Given** a reviewer who is not in the event's review group, **When** they open the review page,
   **Then** they see who the reviewers are and cannot assign themselves.

---

### User Story 5 - Reviewed events are locked for editing (Priority: P3)

Once an event is In Progress, Archived or Closed, its submission can no longer be edited from the
event form; the Edit button disappears and the edit address is refused. Corrections to the
classification are made by the reviewer in the review.

**Why this priority**: What the reviewer decided must not change behind them.

**Independent Test**: As a Manager, check that Edit is offered on an Open event and not on an In
Progress, Archived or Closed one.

**Acceptance Scenarios**:

1. **Given** an Open event of my plant and pillar, **When** I (a Manager) view it, **Then** I can
   edit it as before.
2. **Given** an In Progress, Archived or Closed event, **When** I view it, **Then** there is no
   Edit button and opening its edit address shows "not allowed".

### Edge Cases

- An event submitted before this feature, or whose workflow did not require Review: there is no
  Review button; its steps show Review as "Not required".
- An event whose review group became empty (reviewers lost access before submission): nobody can
  take the review; the page lists no reviewers. (Resolving it belongs to the Control Panel, which
  warns about reviewers who lost access.)
- Two reviewers click Assign myself at almost the same moment on the same device data: the last
  save wins; the other sees who is reviewing when the page reloads (no server in the prototype).
- The event is closed right after submission (only Submission required): all later steps are
  "Not required" and there is nothing to review.
- The reviewer changes their mind after answering No: the reason chips disappear when they answer
  Yes, and the statement fields appear; nothing is saved until they complete or archive.
- A Body Part whose category is not available at the plant is not offered.
- Industrial Hygiene events: the review asks only valid / not valid, statement and comments.

## Requirements *(mandatory)*

### Functional Requirements

**Reviewers and the Review button**

- **FR-001**: The reviewers of an event MUST be the people listed on the workflow kept on the
  event at submission (002 FR-012), whatever their event role.
- **FR-002**: The expanded List row and the expanded Kanban card MUST show a **Review** button to
  a reviewer of the event while its current step is Review and nobody else has taken it. The
  button opens the event's review page.
- **FR-003**: Other people who can see a submitted event MUST be offered a link to its workflow
  steps instead; the event's detail page MUST offer the same (labelled Review for a reviewer who
  can review).

**Steps page**

- **FR-004**: Each submitted event MUST have a steps page listing Submission, Review, Root cause
  analysis, Actions and Validation, in that order.
- **FR-005**: Each step MUST show one state: **Done**, **Current step**, **Not reached yet** or
  **Not required** (a step the event's workflow does not require). Done and current steps open;
  the others are disabled and say why.
- **FR-006**: The current step MUST be the first required step after Submission that is not done;
  an event that is Draft, Archived or Closed has no current step.
- **FR-007**: The Submission step MUST show what was reported (classification, location, general
  information, event details).
- **FR-008**: Root cause analysis, Actions and Validation MUST say they come in a later version.

**Taking the review**

- **FR-009**: While nobody has taken the review, the Review step MUST show "This event is waiting
  for a reviewer." with an **Assign myself as reviewer** button for the event's reviewers, or the
  list of reviewers for anyone else.
- **FR-010**: Assigning oneself MUST record the reviewer and the time and set the status to **In
  Progress**. From then on only that reviewer can record the decision; the other reviewers see who
  is reviewing.

**Decision**

- **FR-011**: The assigned reviewer MUST answer "Is this a valid event?" (Yes / No).
- **FR-012**: When the answer is No, the reviewer MUST choose exactly one reason: Duplicated,
  Useless or Bad quality. Saving MUST set the status to **Archived** and send an alert "Event
  archived (reason)" to the reporter, the people the event was shared with and the other
  reviewers, never to the reviewer who archived it.
- **FR-013**: When the answer is Yes, the reviewer MUST write an **event statement**, which MUST
  NOT contain the reporter's name, and MAY classify the event with the Control Panel lists of its
  pillar (values available at the event's plant only; Body Parts grouped by category; lists that
  only group another list are not offered on their own).
- **FR-014**: The reviewer MAY add comments in both cases.
- **FR-015**: Saving a valid review MUST move the event to its next required step with status In
  Progress, or set it to **Closed** (with the closing time) when no other step is required.
- **FR-016**: A done review MUST show the reviewer, the date, the decision and, as applicable,
  the reason or the statement and classification, and the comments. It cannot be changed in this
  version.

**Statuses, list and editing**

- **FR-017**: The statuses MUST be Draft, Open, In Progress, Archived and Closed, each with its
  own badge.
- **FR-018**: Archived events MUST be hidden from the list, the Kanban and the counters unless the
  Status filter is Archived; the filters MUST offer a Status choice.
- **FR-019**: The "Open" counter and the "Events in progress" KPI MUST count Open and In Progress
  events.
- **FR-020**: Only Open events MAY be edited from the event form (by Managers, as before); Drafts
  stay editable by their author. In Progress, Archived and Closed events MUST NOT be edited.
- **FR-021**: All texts MUST be in English, every screen MUST have a title and work from 320px
  wide, and the steps menu MUST work with the keyboard (constitution IV).

### Key Entities

- **Event (extended)**: gains the statuses In Progress and Archived, the time it was archived and
  a **review**.
- **Review**: the assigned reviewer, when they took it, the decision (valid / not valid), the
  reason when not valid, the event statement, the chosen values per classification list, the
  comments, and when it was completed.
- **Workflow step**: one of Submission, Review, Root cause analysis, Actions, Validation, with its
  state for an event, derived from the workflow kept on the event (002) and its review.
- **Alert (extended)**: a new type "Event archived (reason)".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer goes from the expanded row to a completed valid review in under 2
  minutes on the sample data.
- **SC-002**: In 100% of the quickstart checks, exactly one reviewer can record the decision of an
  event once someone has assigned themself.
- **SC-003**: 100% of events reviewed as not valid are Archived with a reason, disappear from the
  default list and are found with the Archived filter.
- **SC-004**: After a valid review, the status matches the workflow in 100% of the quickstart
  checks: Closed when nothing else is required, In Progress otherwise.
- **SC-005**: Every person concerned by an archived event (reporter, people shared with, other
  reviewers) has the alert; the reviewer who archived it does not.
- **SC-006**: No In Progress, Archived or Closed event can be opened in the edit form.

## Assumptions

- The workflow and its review group are those kept on the event at submission (002 FR-012);
  changes in the Control Panel afterwards do not change who reviews an existing event.
- In the prototype everything is stored on the device, so "one reviewer at a time" holds for the
  data of that browser; there is no server-side locking.
- A review cannot be undone or redone in this version (Rework is out of scope).
- Alerts are the existing in-app alerts of Event Reporting; no email.
- The demo data keeps its events Open or Closed; reviewers create In Progress and Archived events
  while testing, and Reset demo data puts everything back.
- Out of scope: Owner, Final Reviewer, HPR and its category, Risk / Cost / Ease and Attackability
  score, severity matrix, investigators, Safety Alert, Record Historian, Rework, Final Review, and
  the content of Root cause analysis, Actions and Validation.
