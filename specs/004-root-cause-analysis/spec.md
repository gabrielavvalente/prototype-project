# Feature Specification: Root cause analysis

**Feature Branch**: `004-root-cause-analysis`

**Created**: 2026-10-25

**Status**: Draft

**Input**: User description: "Proceed with the root cause analysis." Then: "When the root cause
analysis is required for the plant or when the plant decides to do it, the review must say which
group or user(s) perform it. Create some fixed sample groups, shown in a new read-only tab of User
Management. A multiple-choice dropdown with the plant's users and the sample groups."

**App folders**: `apps/event-reporting/` (assignment in the review, Root cause analysis step),
`apps/user-management/` (Groups tab), `shared/platform/` (sample investigation groups)

**Sources**: [Investigation](../001-event-reporting/source/features/04-investigation/Investigation.md)
(overview, 5W1H, 6M, 3-legged 5 Why), the RCA sections of
[safety-event.md](../001-event-reporting/source/safety%20event/safety-event.md),
[environment-event.md](../001-event-reporting/source/environement%20event/environment-event.md) and
[industrial-risk-event.md](../001-event-reporting/source/Industrial%20risk%20event/industrial-risk-event.md)
(investigators, learnings, pre-filled statement and immediate actions),
[detailed-screens-specification.md](../001-event-reporting/source/detailed-screens-specification.md)
(SCR-DSK-04), [core.md](../001-event-reporting/source/core.md) (RCA stage, status In Progress).
Builds on [003 Event review](../003-event-review/spec.md) (steps page, "further analyze", review).

## Clarifications

### Session 2026-10-25

- Q: Who performs the root cause analysis? → A: The people the **reviewer designates in the
  review**, whenever the analysis will happen (the plant's workflow requires it, or the reviewer
  answered Yes to "Do you want to further analyze?"). (The sources disagree: an "Event Owner"
  from the Initial Review, investigators chosen in the RCA, or investigators assigned by the
  reviewer.)
- Q: Users or groups? → A: Both, in one multiple-choice dropdown listing the users of the event's
  plant and the investigation groups.
- Q: Where do the groups come from? → A: A few **fixed sample groups** in the shared data, with no
  editing screen, shown read-only in a new **Groups** tab of User Management.
- Q: Which 6M themes? → A: Man, Machine, Method, Materials, Mother Nature, Management (the
  Investigation source; Management replaces Measurement on purpose), at most 6 causes in total.
  (SCR-DSK-04 lists Methods, Manpower, Milieu, Machinery, Materials, Measurement.)
- Q: Is 5W1H required? → A: No, it is an optional guide. (Investigation makes it required; the
  event-type sources make it optional.)
- Q: Is the risk-assessment gap question asked? → A: Not in this version (no risk assessment
  register exists yet; the Investigation source defers it too).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Designate who analyzes, in the review (Priority: P1)

Carla reviews a TF2 as valid; it is SIP, so "Do you want to further analyze?" is Yes. A new field
asks "Who will perform the root cause analysis?": she picks the "Lyon H&S investigation team"
group and Diego Laurent. On Complete review the event goes to Root cause analysis, and Diego and
the team's members get an alert "Root cause analysis assigned to you".

**Why this priority**: Without designated people nobody owns the analysis.

**Independent Test**: Complete a review that leads to Root cause analysis with and without
assignees; check the refusal, the saved assignees and the alerts.

**Acceptance Scenarios**:

1. **Given** a valid review where the workflow requires Root cause analysis or "further analyze"
   is Yes, **When** the form renders, **Then** "Who will perform the root cause analysis?" is
   shown, listing the users of the event's plant who can see its pillar and the groups covering
   the event's plant and pillar.
2. **Given** that field is empty, **When** I complete the review, **Then** it is refused with a
   message next to the field.
3. **Given** "further analyze" is No and the workflow does not require the analysis, **When** the
   form renders, **Then** the field is not shown.
4. **Given** I designated a group and a user, **When** the review is saved, **Then** each
   designated user and each member of the designated group gets one alert (no duplicates, never
   the reviewer themself).

---

### User Story 2 - Perform the root cause analysis (Priority: P1)

Diego opens the event: its current step is Root cause analysis. The step shows an overview — the
event recap (statement and immediate actions, pre-filled) and the status of each part — then the
parts: 5W1H (optional guide), 6M, 5 Why and Learnings. He adds two 6M causes (Method: "No wet
floor signage", Management: "Cleaning schedule overlaps the shift change"), each with why it was a
possible cause; builds a 5 Why leg down to "The cleaning contract does not cover the night shift",
marks it as a root cause and classifies it Conditional; branches a second leg; writes the
learnings; saves; later completes the analysis. Actions is required next, so the event stays In
Progress at Actions.

**Why this priority**: The analysis is the reason the step exists; its root causes will anchor
the action plan.

**Independent Test**: As a designated person, fill each part, save, reopen, complete; as someone
else, check the step is read-only.

**Acceptance Scenarios**:

1. **Given** I am designated (directly or through a group), **When** I open the step, **Then** I
   can edit every part and save my work without completing it.
2. **Given** I am not designated, **When** I open the step, **Then** I see the analysis read-only.
3. **Given** the overview, **When** it renders, **Then** it shows the event statement and the
   immediate actions (pre-filled, editable by the designated people) and each part as Not started,
   In progress or Done (5W1H marked optional).
4. **Given** 5W1H, **When** I set a section to Yes, **Then** its question field appears; No hides
   it; nothing in 5W1H is required to complete.
5. **Given** 6M, **When** I add causes, **Then** each has a theme (Man, Machine, Method,
   Materials, Mother Nature, Management), a cause and "Why was [cause] a possible cause?"; after 6
   causes in total no more can be added.
6. **Given** 5 Why, **When** I add whys to a leg, **Then** it holds up to 5; Branch adds a new
   parallel leg; I can remove a leg's last why or a whole leg (not the last leg).
7. **Given** a why answer, **When** I mark it as a root cause, **Then** I must classify it
   Behavioral or Conditional before completing.
8. **Given** no 6M cause, no root cause or empty Learnings, **When** I complete, **Then** it is
   refused and each missing part is flagged.
9. **Given** a complete analysis and a workflow requiring Actions, **When** I complete it,
   **Then** the event stays In Progress with Actions as current step; with nothing else required,
   the event is Closed.

---

### User Story 3 - See the investigation groups (Priority: P2)

Ludovic opens User Management, tab **Groups**: each sample group with its name, pillars, plants
and members. Read-only, within his perimeter like the users.

**Why this priority**: Reviewers need to know who is behind a group they designate.

**Independent Test**: Open the Groups tab as Central and as Cluster; check the groups listed and
that nothing can be edited.

**Acceptance Scenarios**:

1. **Given** I can open User Management, **When** I choose the Groups tab, **Then** I see the
   groups covering at least one of my plants (all of them for Central), with name, pillars,
   plants and members.
2. **Given** the Groups tab, **When** I look for edit actions, **Then** there are none.

### Edge Cases

- A designated group has a member who cannot see the event: the member is listed in the group
  but gets no alert and cannot open the event (visibility rules win).
- The reviewer designates only themself: allowed; they then perform the analysis.
- The workflow requires Root cause analysis but the review was completed before this feature
  (no assignees): the step is read-only for everyone except the reviewer, who can perform it.
- 6M at 6 causes: the Add cause button is disabled and says why.
- A root cause is unmarked: its classification is dropped.
- The event is Archived or Closed: the Root cause analysis step shows what was done, read-only.

## Requirements *(mandatory)*

### Functional Requirements

**Designation in the review**

- **FR-001**: When a valid review leads to Root cause analysis (the workflow requires it, or
  "Do you want to further analyze?" is Yes), the review MUST ask "Who will perform the root cause
  analysis?" — a searchable multiple-choice list of the users of the event's plant who can see
  its pillar and the groups covering the event's plant and pillar — and MUST require at least one
  choice.
- **FR-002**: Saving the review MUST keep the designated users and groups on the event and alert
  each designated user and each member of a designated group who can see the event, once, never
  the reviewer.
- **FR-003**: A done review MUST show who was designated.

**Groups**

- **FR-004**: The shared data MUST hold a few fixed sample investigation groups, each with a
  name, its pillars, its plants and its members.
- **FR-005**: User Management MUST offer a read-only **Groups** tab listing the groups covering at
  least one of the viewer's plants (all for Central) with name, pillars, plants and members.

**Root cause analysis step**

- **FR-006**: The designated users, the members of the designated groups (and, for events
  reviewed without designation, the reviewer) MUST be able to edit and save the analysis while it
  is the current step; everyone else who can see the event MUST see it read-only.
- **FR-007**: The step MUST start with an overview: event statement (pre-filled from the review)
  and immediate actions (pre-filled from the submission's immediate actions), and the status of
  5W1H (optional), 6M, 5 Why and Learnings — Not started, In progress or Done.
- **FR-008**: 5W1H MUST offer Who, What, When, Where, Why and How, each with a Yes/No
  applicability and, when Yes, a text answer; it never blocks completion.
- **FR-009**: 6M MUST let the designated people add causes, each with a theme (Man, Machine,
  Method, Materials, Mother Nature, Management), the cause and "Why was [cause] a possible
  cause?", at most 6 in total, and remove them.
- **FR-010**: 5 Why MUST show legs side by side, each with up to 5 successive whys; Branch MUST
  add a parallel leg; the last why of a leg and a leg (except the last one) can be removed.
- **FR-011**: Any why answer MUST be markable as a root cause, which then MUST be classified
  Behavioral or Conditional.
- **FR-012**: Learnings MUST be a required text.
- **FR-013**: Save MUST keep the work without completing; Complete analysis MUST require at least
  one 6M cause with its explanation, at least one classified root cause with its answer, and the
  learnings, and MUST flag what is missing.
- **FR-014**: Completing MUST move the event, In Progress, to the next step its workflow
  requires, or set it to Closed when none is required (as the review does).
- **FR-015**: Once completed, the step MUST show the analysis read-only with who completed it and
  when; the history MUST show "Root cause analysis completed".
- **FR-016**: All texts MUST be in English; the step and the Groups tab MUST work from 320px wide
  and with the keyboard (constitution IV).

### Key Entities

- **Investigation group**: name, pillars, plants, member users (fixed sample data).
- **Review (extended)**: the designated users and groups for the analysis.
- **Root cause analysis**: event statement, immediate actions summary, 5W1H (six sections with
  applicability and answer), 6M causes (theme, cause, why), 5 Why legs (whys; each why may be a
  root cause classified Behavioral / Conditional), learnings, who saved it last, and who completed
  it and when.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 100% of the quickstart checks, a review leading to Root cause analysis cannot be
  completed without designated people, and every designated person gets exactly one alert.
- **SC-002**: A designated person records a complete analysis (2 causes, one 5 Why leg with a root
  cause, learnings) in under 10 minutes on the sample data.
- **SC-003**: Saved work is found again unchanged after leaving and reopening the step, in 100% of
  the checks.
- **SC-004**: Only designated people can change the analysis; everyone else sees it read-only.
- **SC-005**: After completion the status matches the workflow in 100% of the checks (next
  required step, or Closed).

## Assumptions

- Designatable users are those of the event's plant who can see its pillar (others could not open
  the event); groups are offered when they cover the event's plant and pillar.
- The sample groups are illustrative and editable only in the sample data until a group feature
  exists in the Control Panel.
- The analysis is stored on the event, on the device (no server); one person editing at a time is
  assumed.
- The Investigation source's "Event Owner", the risk-assessment gap question, Related Hazards,
  attachments, Safety Alert / Warning, the Record Historian and the export or print of the 5 Why
  diagram are out of scope.
- Root causes will be linked to corrective actions by the Action Plan feature.
