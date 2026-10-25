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
- Q: Which 6M themes, and how are causes chosen? → A: The UI/UX design (`ui-ux/6m.png`):
  Management, Human Factors, Methods, Machine / Tools & Equip., Materials, Environment. Each theme
  has a fixed list of contributory causes to tick (plus Other) and guidance questions; each ticked
  cause is explained in a question/answer card; at most 6 causes in total. (The Investigation
  source lists Man, Machine, Method, Materials, Mother Nature, Management; SCR-DSK-04 lists
  Methods, Manpower, Milieu, Machinery, Materials, Measurement.)
- Q: What does 5W1H look like? → A: The UI/UX design (`ui-ux/5w1h.png`): six sections (Who was
  injured?, What happened?, When?, Where?, Why did the event occur?, How did the event occur?),
  each with "Is this section applicable to your event?" and, when Yes, numbered questions with a
  text answer each. 5W1H stays optional. (Investigation makes it required; the event-type sources
  make it optional.)
- Q: Where do the 5W1H questions and the 6M cause lists come from? → A: The design gives "What
  happened?" (13 questions) and the Management theme (causes and guidance); the other sections and
  themes are **drafts written for this prototype, to be reviewed by the user**.
- Q: Where does 5 Why start? → A: From the 6M causes: each ticked cause heads a column showing
  the explanation given in 6M (not editable) with its first why below; ticking a cause adds that why, unticking it removes its
  whys. 5 Why stays collapsed and disabled until 6M is done (every ticked cause explained), then
  opens.
- Q: What does Branch do in 5 Why? → A: Any why can be branched: Branch adds an alternative answer
  to the same question, beside that why. Each path holds up to 5 whys below its cause.
- Q: Can the immediate actions be changed during the analysis? → A: Yes. The analysis shows the
  submission's immediate actions as compact lines, one below the other; the designated people can
  add and edit them in a popup with the submission's card, and delete them; they are the same
  data as the submission, so the change shows there too.
- Q: Is a root cause classified Behavioral / Conditional? → A: No. Marking a why as a root cause
  only highlights its card. (The Investigation source requires the classification; the user
  decided against it.)
- Q: When can an action be created from a why? → A: Once the why has an answer. Its card shows
  how many actions it has; the actions are listed under 5 Why in compact lines like the immediate
  actions (one line for the why, one for the action). The popups create with **Create**.
- Q: Is 5W1H always open? → A: No, it is collapsed; the person expands it if they decide to use
  it (it opens by itself when it already has answers).
- Q: What happens after completing a review that leads to the analysis? → A: If the reviewer is
  one of the designated people (directly or through a group), the page goes straight to the Root
  cause analysis step; otherwise the review summary stays.
- Q: Can actions be created from the analysis? → A: Yes, from any why: description, assignees
  (up to 5), due date and priority (Emergency, High, Medium, Low), linked to that why (fields of
  the Action Plan source). They are listed under 5 Why; the Actions step will show them with the
  Action Plan feature.
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
5. **Given** I designated myself (or a group I belong to), **When** I complete the review,
   **Then** the page opens the Root cause analysis step; otherwise the review summary stays.

---

### User Story 2 - Perform the root cause analysis (Priority: P1)

Diego opens the event: its current step is Root cause analysis. The step shows an overview — the
event statement (pre-filled), the immediate actions as cards and the status of each part — then
the parts: 5W1H (optional guide, collapsed), 6M, 5 Why (locked until 6M is done) and Learnings.
He adds a missing immediate action. In 6M he ticks Management › Lack of Resources and Methods ›
Procedure Unclear or Outdated and explains how each contributed; 5 Why opens with one column per
cause; under Lack of Resources he builds a path down to "The cleaning contract does not cover
the night shift", marks it as a root cause (its card is highlighted) and creates an action from
it; branches the second why to record another reason; writes the learnings; saves; later
completes the analysis. Actions is required next, so the event stays In Progress at Actions.

**Why this priority**: The analysis is the reason the step exists; its root causes will anchor
the action plan.

**Independent Test**: As a designated person, fill each part, save, reopen, complete; as someone
else, check the step is read-only.

**Acceptance Scenarios**:

1. **Given** I am designated (directly or through a group), **When** I open the step, **Then** I
   can edit every part and save my work without completing it.
2. **Given** I am not designated, **When** I open the step, **Then** I see the analysis read-only.
3. **Given** the overview, **When** it renders, **Then** it shows the event statement (full width,
   pre-filled, editable by the designated people), the immediate actions as compact lines one
   below the other, and each part as Not started, In progress or Done (5W1H marked optional).
4. **Given** the immediate actions, **When** I add or edit one in its popup (kept only when
   complete) or delete one, and save, **Then** the submission shows the same immediate actions.
5. **Given** 5W1H, collapsed, **When** I expand it, pick a section and set it to Yes, **Then** its
   numbered questions appear; No hides them; nothing in 5W1H is required to complete.
6. **Given** 6M, **When** I pick a theme, **Then** I see its guidance and its contributory causes
   to tick; each ticked cause gets a card "How did [cause] contribute to the event occurrence?";
   after 6 causes in total no more can be ticked.
7. **Given** 6M is not done, **When** I look at 5 Why, **Then** it is collapsed and disabled;
   once 6M is done it opens with one column per ticked cause (shown, not editable), each with a
   first why; I can add a why under another (up to 5 per path), Branch any why to add an
   alternative answer beside it, and remove a why with the whys below it (not a cause's only
   first why).
8. **Given** a why answer, **When** I mark it as a root cause, **Then** its card is highlighted;
   nothing else is asked.
9. **Given** a why without an answer, **When** I look at Add action, **Then** it is disabled; once
   answered, **When** I create an action from it, **Then** the action (description, assignees,
   due date, priority) is linked to that why, the popup shows that why's answer, the why card
   shows its number of actions, and the action is listed under 5 Why (why on one line, action on
   the next), where I can edit or delete it.
10. **Given** no 6M cause, no root cause or empty Learnings, **When** I complete, **Then** it is
   refused and each missing part is flagged.
11. **Given** a complete analysis and a workflow requiring Actions, **When** I complete it,
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
- 6M at 6 causes: the unticked causes are disabled and a hint says why.
- A why with actions (itself or a why below it) is removed: after confirmation its actions are
  deleted with it.
- A 6M cause whose whys have answers or actions is unticked: after confirmation its whys and
  their actions are deleted.
- A new 6M cause is ticked but not yet explained: 6M is no longer done, so 5 Why is locked again
  until it is explained (nothing is lost).
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
- **FR-003a**: After completing a review that leads to the analysis, a reviewer who is one of the
  designated people (directly or through a group) MUST be taken to the Root cause analysis step;
  any other reviewer stays on the review summary.

**Groups**

- **FR-004**: The shared data MUST hold a few fixed sample investigation groups, each with a
  name, its pillars, its plants and its members.
- **FR-005**: User Management MUST offer a read-only **Groups** tab listing the groups covering at
  least one of the viewer's plants (all for Central) with name, pillars, plants and members.

**Root cause analysis step**

- **FR-006**: The designated users, the members of the designated groups (and, for events
  reviewed without designation, the reviewer) MUST be able to edit and save the analysis while it
  is the current step; everyone else who can see the event MUST see it read-only.
- **FR-007**: The step MUST start with an overview: the event statement (pre-filled from the
  review, full width), the immediate actions, and the status of 5W1H (optional), 6M, 5 Why and
  Learnings — Not started, In progress or Done.
- **FR-007a**: The immediate actions MUST be the submission's own, shown as compact lines one
  below the other (description, priority, who did it); the designated people MUST be able to add
  and edit them in a popup with the submission's card (kept only when complete) and delete them;
  the submission MUST show the result and the history "Immediate actions updated in the root
  cause analysis".
- **FR-008**: 5W1H MUST be collapsed until expanded (open when it already has answers) and MUST
  offer six sections — Who was injured?, What happened?, When?, Where?, Why
  did the event occur?, How did the event occur? — chosen from a list; each with "Is this section
  applicable to your event?" (Yes/No) and, when Yes, its numbered questions with a text answer
  each. It never blocks completion; it is Done when every section is No or Yes with every answer.
- **FR-009**: 6M MUST offer six themes — Management, Human Factors, Methods, Machine / Tools &
  Equip., Materials, Environment — chosen from a list, each with its guidance questions and its
  contributory causes to tick (Other asks for a name). Each ticked cause MUST be explained in a
  card "How did [cause] contribute to the event occurrence?", numbered C1, C2…; at most 6 causes
  in total across themes.
- **FR-010**: 5 Why MUST be collapsed and disabled until 6M is done, then open. It MUST show one
  column per ticked 6M cause, headed by the explanation given in 6M (not editable), with whys
  below it as a tree: a first why is added when the cause is ticked, up to 5 successive whys on
  each path; Branch on any why MUST add an alternative answer beside it; a why can be deleted
  with its X icon, with the whys below it, except a cause's only first why; unticking a cause
  removes its whys (and their actions).
- **FR-011**: Any why answer MUST be markable as a root cause, which highlights its card; there is
  no classification.
- **FR-011a**: The designated people MUST be able to create an action from any answered why — description,
  1 to 5 assignees (users of the event's plant who can see its pillar), due date and priority
  (Emergency, High, Medium, Low), all required — linked to that why, whose answer the popup
  shows; the popup's button is **Create** (Save when editing). The why card MUST show its number
  of actions. Under 5 Why, an actions summary MUST list every action in a compact line like the
  immediate actions — one line for the why's answer, one for the action — and let them be edited
  and deleted. Actions are
  not required to complete the analysis.
- **FR-012**: Learnings MUST be a required text.
- **FR-013**: Save MUST keep the work without completing; Complete analysis MUST require at least
  one 6M cause with its explanation, at least one root cause, every root cause answered, and the
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
- **Root cause analysis**: event statement, 5W1H (six sections with applicability and an answer
  per question), 6M causes (theme, ticked cause, explanation), 5 Why tree (whys; each why may be
  a root cause), learnings, who saved it last, and who
  completed it and when.
- **Action**: description, assignees, due date, priority, the why it comes from; belongs to the
  event, so the Actions step can use it later.

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
- The Action Plan feature will show the actions in the Actions step, and add their status,
  category and the rest of its fields.
