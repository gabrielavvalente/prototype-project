# Feature Specification: Event Reporting

**Feature Branch**: `001-event-reporting`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "Event Reporting module (primeiro app do monorepo, pasta
apps/event-reporting): the single place where any environmental, safety or industrial risk event
is reported and managed. It gives frontline teams on the shop floor one clear reporting point and
gives leaders a complete operational picture for faster and better decisions."

**App folder**: `apps/event-reporting/` (first app of the monorepo)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Report an event from the shop floor (Priority: P1)

A frontline worker sees something wrong on the shop floor, such as an oil spill, a near miss with
a forklift or a damaged safety guard. They open the app, choose the event category
(environmental, safety or industrial risk), say where and when it happened, how serious it looks,
and describe it in a few words. They submit it and get a confirmation with a reference number.

**Why this priority**: Without a fast, single reporting point, nothing else in the app has data
to work with. This story alone already replaces scattered reporting channels.

**Independent Test**: Can be fully tested by submitting one event of each category and checking
that each one appears with its reference number, all entered details and the status "New".

**Acceptance Scenarios**:

1. **Given** the reporting form is open, **When** the worker fills in category, location, date
   and time, severity and description and submits, **Then** the event is saved with status "New"
   and a confirmation with a unique reference number is shown.
2. **Given** the reporting form is open, **When** the worker submits without a required field,
   **Then** the event is not saved and the missing field is clearly indicated.
3. **Given** the worker opens the form, **When** they look at date and time, **Then** these are
   pre-filled with the current date and time and can be changed.

---

### User Story 2 - Manage reported events (Priority: P2)

A leader opens the list of reported events, filters it to find what needs attention (for example,
open high-severity safety events), opens an event, assigns a responsible person, records the
action being taken and moves the event through its status until it is closed.

**Why this priority**: Reporting only creates value when events are followed up. This turns
reports into actions with clear ownership.

**Independent Test**: Can be tested by creating a few events (via Story 1 or sample data), then
filtering, assigning a responsible person, adding an action note and closing one event, and
checking that the list reflects each change.

**Acceptance Scenarios**:

1. **Given** several events exist, **When** the leader filters by category, severity, status or
   location, **Then** only matching events are shown, newest first.
2. **Given** an event with status "New", **When** the leader assigns a responsible person and
   changes the status to "In progress", **Then** the event shows the new status and responsible
   person.
3. **Given** an event "In progress", **When** the leader closes it without writing a closing
   note, **Then** closing is blocked and a closing note is requested.
4. **Given** an event's status changes, **When** anyone opens the event, **Then** they see the
   history of status changes with who made them and when.

---

### User Story 3 - See the operational picture (Priority: P3)

A leader opens an overview screen that shows, at a glance, how many events are open, how they
split by category, severity and location, how many are critical and still open, and how the
number of reports changes over the last weeks.

**Why this priority**: This is the "complete operational picture" that supports faster and better
decisions, but it depends on events already being reported and managed.

**Independent Test**: Can be tested by loading a known set of events and checking that every
number on the overview matches a manual count of that set.

**Acceptance Scenarios**:

1. **Given** a known set of events, **When** the leader opens the overview, **Then** the totals
   by status, category, severity and location match the events.
2. **Given** at least one critical event is open, **When** the leader opens the overview,
   **Then** critical open events are highlighted at the top with a direct link to each one.
3. **Given** the leader clicks on a number in the overview (for example, "Safety: 4 open"),
   **When** the list opens, **Then** it is already filtered to those events.

---

### User Story 4 - Follow up on my own reports (Priority: P4)

A frontline worker who reported an event wants to know whether it is being handled. They open
"My reports" and see each report's current status and the latest action recorded.

**Why this priority**: Seeing that reports lead to action encourages people to keep reporting,
but the app is still useful without it.

**Independent Test**: Can be tested by submitting a report as a worker, changing its status as a
leader, and checking that the worker sees the updated status.

**Acceptance Scenarios**:

1. **Given** a worker has submitted reports, **When** they open "My reports", **Then** they see
   only their own reports with current status and latest action.

---

### Edge Cases

- The worker does not know the exact time of the event: date and time stay pre-filled and
  editable; the event cannot be dated in the future.
- The worker is unsure of the category or severity: each option has a one-line explanation, and
  the leader can correct category and severity later (the change is recorded in the history).
- The same event is reported twice by different people: the leader can mark one as a duplicate
  of the other, which closes it with a link to the original.
- A closed event needs to be reopened: the leader can reopen it, and the reopening is recorded in
  the history.
- No events exist yet: the list and overview show a clear empty state instead of zeros without
  explanation.
- The description is very long: it is limited to 2,000 characters with a visible counter.

## Requirements *(mandatory)*

### Functional Requirements

**Reporting**

- **FR-001**: Users MUST be able to report an event with: category (Environmental, Safety,
  Industrial risk), location (chosen from a list of shop floor areas), date and time, severity
  (Low, Medium, High, Critical) and a short description.
- **FR-002**: System MUST pre-fill date and time with the current moment and MUST reject dates in
  the future.
- **FR-003**: System MUST assign each event a unique, human-readable reference number
  (e.g., EV-0001) and show it in the confirmation.
- **FR-004**: System MUST record who reported the event and when it was reported.
- **FR-005**: System MUST show a one-line explanation for each category and severity option.

**Management**

- **FR-006**: Leaders MUST be able to see all events in a list sorted newest first and filter it
  by category, severity, status, location and date range.
- **FR-007**: Leaders MUST be able to assign a responsible person and add action notes to an
  event.
- **FR-008**: Events MUST follow the statuses New → In progress → Closed, and leaders MUST be able
  to reopen a closed event.
- **FR-009**: System MUST require a closing note before an event can be closed.
- **FR-010**: Leaders MUST be able to correct an event's category and severity and mark an event
  as a duplicate of another.
- **FR-011**: System MUST keep a history of every change to an event (what changed, who changed
  it and when) and show it on the event's detail.
- **FR-012**: Event workflow MUST be [NEEDS CLARIFICATION: how far does "managed" go in this
  prototype — only status, responsible person and notes (as above), or also investigation steps
  such as root cause and corrective actions with due dates?]

**Overview**

- **FR-013**: Leaders MUST have an overview showing open-event totals by status, category,
  severity and location, plus the number of events reported per week over the last 8 weeks.
- **FR-014**: The overview MUST highlight open Critical events at the top, each linking to its
  detail.
- **FR-015**: Each total on the overview MUST open the event list pre-filtered to the events it
  counts.

**Users and data**

- **FR-016**: The app MUST support two profiles: Reporter (reports events and sees own reports)
  and Leader (everything a Reporter can do, plus management and overview).
- **FR-017**: Reporters MUST be able to see the list of their own reports with current status and
  latest action note.
- **FR-018**: Reported events MUST be [NEEDS CLARIFICATION: should reports made on one device be
  visible to leaders on other devices, or is it acceptable for this prototype that all data lives
  on a single device used for demonstration?]
- **FR-019**: All user-facing text MUST be in English.
- **FR-020**: The reporting flow MUST be usable on a mobile phone screen.

### Key Entities

- **Event**: Something that happened on the shop floor and was reported. Has a reference number,
  category, location, date and time of occurrence, severity, description, status, reporter,
  reported-at time, responsible person (optional), and an optional link to an original event if it
  is a duplicate.
- **Action note**: A short text a leader records on an event (what is being done, or the closing
  note). Belongs to one event; has author and time.
- **History entry**: A record of one change to an event (field changed, old and new value, who,
  when). Belongs to one event.
- **Location**: A shop floor area where events can happen (e.g., "Assembly line 1", "Warehouse").
  A fixed list in this prototype.
- **User profile**: A person using the app, with a name and a profile (Reporter or Leader).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A frontline worker can report an event in under 2 minutes from opening the app.
- **SC-002**: At least 9 out of 10 first-time users complete a report without help.
- **SC-003**: A leader can find all open Critical events in under 30 seconds from opening the app.
- **SC-004**: Every number on the overview matches a manual count of the underlying events
  (100% accuracy in testing).
- **SC-005**: A newly submitted event appears in the leader's list and overview the next time
  they open or refresh it.
- **SC-006**: Every status change on an event can be traced to a person and a time.

## Assumptions

- This is a prototype: there is no real login or password. The user picks their name and profile
  when opening the app.
- The list of shop floor locations and the list of people who can be made responsible are fixed
  sample lists, editable only by changing the app's data, not through a screen.
- Photos, file attachments, notifications (email, SMS, push), anonymous reporting, exports and
  integrations with other company systems are out of scope for this first version.
- The app includes sample events so the list and overview can be demonstrated without entering
  data first.
- Events are never deleted; mistakes are handled by correcting fields or marking duplicates.
- This app is self-contained in `apps/event-reporting/` and shares only the common visual theme in
  `shared/`, as required by the constitution.
