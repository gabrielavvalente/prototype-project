# Feature Specification: Event Reporting — MVP (Global Shell, Event Creation, Event Library)

**Feature Branch**: `001-event-reporting`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "Rewrite the Event Reporting spec based on the source requirements in
`specs/001-event-reporting/source/`. MVP scope for this first prototype (app folder
`apps/event-reporting/`): 01 Global Shell, 03 Event Creation, 02 Event Library. All other features
are out of scope. Keep BRD story IDs (US-SHELL-, US-LIB-, US-CREATE-) for traceability."

**App folder**: `apps/event-reporting/` (first app of the monorepo)

**Sources** (all under [source/](source/)):
[Global Shell](source/features/01-global-shell/Global%20Shell.md),
[Event Library](source/features/02-event-library/Event%20Library.md),
[Event Creation](source/features/03-event-creation/Event%20Creation.md),
[Core Event Lifecycle](source/core.md),
[Detailed Screens Specification](source/detailed-screens-specification.md) (SCR-MOB-01, SCR-MOB-04,
SCR-DSK-01, SCR-DSK-02), and the event-type specs for level names
([Safety](source/safety%20event/safety-event.md),
[Environment](source/environement%20event/environment-event.md),
[Industrial Risk](source/Industrial%20risk%20event/industrial-risk-event.md),
[Health](source/Health%20event/health-event.md)).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Report an event from the shop floor (Priority: P1)

*Traces to: US-CREATE-01, 02, 03, 04, 05, 06, 09, 10, 11 (and proposed US-CREATE-12).*

A frontline worker sees something wrong — a near miss with a forklift, an oil spill, a damaged
guard. From the landing screen they start a new event in no more than 3 taps. A guided form takes
them through sections with a visible progress indicator: they pick the pillar, family and level
(each level explained in plain language) and answer the follow-up risk question (HPR, CRP or SRP),
drill down to the exact location, enter the core facts and attach photos, add event details, and
record any immediate actions with up to 5 assignees. A summary page shows everything they entered
and flags anything missing. They either save a draft to finish later or submit. On submit the event
gets a unique record number, its assignees see the new actions in My Actions, and the pillar's
Managers see a new alert in My Alerts.

**Why this priority**: Event creation is the highest-traffic flow. Without fast, reliable reporting
every other part of the product has no data.

**Independent Test**: Choose a User-role demo user, report one TF4 event on a phone-sized screen
and one TF2 event with a photo and an immediate action, then confirm that both receive record
numbers, that the TF2 assignee sees the action in My Actions, and that a Manager sees two new
alerts.

**Acceptance Scenarios**:

1. **Given** I start a new event, **When** the form opens, **Then** I first choose a pillar
   (Health & Safety / Environment / Site Risk / Industrial Hygiene), then the family, then the
   specific type and level, and each level shows a short plain-language description
   (e.g., "TF4 — Near Miss: something occurred but nobody was hurt").
2. **Given** I choose a Health & Safety or Environment level, **When** the level is selected,
   **Then** "Could this be an HPR?" (Yes/No) is required before I can continue.
3. **Given** I choose Site Risk level SRE1 or SRE2, **When** the level is selected, **Then**
   "Could this be a CRP? (Critical Risk Potential)" (Yes/No) with a brief definition is required;
   **and given** SRE3, SRE4 or SRE5, **then** "Could this be an SRP? (Serious Risk Potential)" is
   required instead.
4. **Given** I reach the location step, **When** I select a level of Plant → Department →
   Workshop → Job → Workstation → Task, **Then** each child list only shows the children of the
   selected parent, and I cannot continue without choosing a Task Type.
5. **Given** I reach General Information, **When** the section renders, **Then** Title, Reporter
   (pre-filled with me, editable only by a Manager), Report Date (today, read-only), Event Time,
   Shift Moment (Day / Night / Afternoon) and Description are captured.
6. **Given** the event is TF1, TF2 or TF3, **When** I try to submit without a photo or video,
   **Then** submission is blocked and the missing attachment is flagged.
7. **Given** I am on a phone, **When** I add media, **Then** I can take a photo or video with the
   device camera.
8. **Given** I upload a file of a type or size that is not allowed, **When** it is checked,
   **Then** it is rejected with a clear message and not attached.
9. **Given** I reach Event Details, **When** the section renders, **Then** I choose an Employee
   type, set Recurrence (Yes/No), enter Comments and Feedback email recipients; **and given** the
   family is OH, **then** a Disease(s) multi-select is also shown.
10. **Given** the event is TF1–TF3 or SRE1–SRE3, **When** I try to submit without an immediate
    action, **Then** submission is blocked.
11. **Given** I add an immediate action, **When** the action card renders, **Then** I capture
    Description, Priority, Category, Subcategory, Action plan detail, Due date, KPI ID (optional)
    and Comments; the creation date is set automatically; I can add more actions as repeatable
    cards and assign up to 5 users to each.
12. **Given** I reach the summary page, **When** it renders, **Then** every section is shown with
    its values, missing mandatory fields are flagged, and each section has an edit link back to it.
13. **Given** I choose Save as Draft, **When** it is saved, **Then** the event has status `Draft`
    and nobody is notified; **and given** I choose Submit, **then** the event gets a record number
    and status `Open`, each action assignee gets a My Actions entry, and every Manager of the
    event's pillar and plant gets a My Alerts entry.

---

### User Story 2 - Work inside a trusted application frame (Priority: P2)

*Traces to: US-SHELL-01, 02, 03, 04, 06, 08.*

Every screen sits inside the same frame. A header shows who I am (avatar, name, role), the business,
plant and pillar I am working in, and quick-access controls for My Alerts and My Actions. The
navigation only shows what my role can use. I only ever see events from my business, plant and
pillar. My Alerts lists alerts addressed to me and takes me to the source event; My Actions lists
actions assigned to me and lets me change their status without leaving the current screen.

**Why this priority**: The selected business → plant → pillar context governs everything else.
Without it, people report against the wrong plant or see data that is not theirs. It is P2 because
a single-plant demo of Story 1 is already useful without switching context.

**Independent Test**: Sign in as demo users with different roles and plants and confirm that the
header, navigation, visible events, My Alerts and My Actions match each user's role and scope, and
that changing an action's status in My Actions shows the new status on the event.

**Acceptance Scenarios**:

1. **Given** I open any screen, **When** it renders, **Then** the header shows my avatar, name,
   role, the current business, plant and pillar, and controls for My Alerts and My Actions.
2. **Given** I have access to more than one business, **When** I switch business, **Then** the
   whole page reloads in the new business scope.
3. **Given** I open the plant selector, **When** the list renders, **Then** each plant shows its
   plant-type icon and country flag.
4. **Given** I open the product, **When** the navigation renders, **Then** it matches the
   visibility matrix for my role exactly (see FR-022).
5. **Given** a screen is outside my role, **When** I open it by direct link, **Then** I get a
   permission message and see none of its content.
6. **Given** events exist in another plant, **When** I browse, search or open a direct link,
   **Then** none of those events are ever shown to me.
7. **Given** I open My Alerts, **When** the panel slides open, **Then** it lists my alerts newest
   first with source event, type and creation date, and clicking one opens the source event.
8. **Given** I open My Actions, **When** the panel slides open, **Then** it lists the actions
   assigned to me with status On Going / To Complete / Completed / Overdue, and changing a status
   saves it without leaving my current screen and shows the new status on the event.
9. **Given** I use a phone, **When** I use the frame, **Then** it behaves the same as on desktop,
   and all of it can be operated with a keyboard and a screen reader.

---

### User Story 3 - Find and act on existing events (Priority: P3)

*Traces to: US-LIB-01, 02, 03, 04 (View / Edit), 06, 07.*

A Manager arrives at the start of a shift and opens Events. KPI tiles show Total Events, Open
Events, Overdue Actions and Events With HPR. They click "Events With HPR" and the list filters to
those events. They search a record number someone mentioned in a meeting, open a quick view of the
event without leaving the list, then open it to view or edit it. A Reporter turns on "My Events" to
see only what they submitted.

**Why this priority**: The library is how existing events are found and triaged, but it only has
value once events are being reported (Story 1) inside a scoped frame (Story 2).

**Independent Test**: Load the sample data, then check that the list, search, every filter, every
KPI tile, the quick view, View and Edit all behave as described for a Manager and for a User.

**Acceptance Scenarios**:

1. **Given** I open Events, **When** the list loads, **Then** it shows only events in my scope,
   sortable by date, type, level, status and reporter, with 20, 50 or 100 records per page.
2. **Given** the list is displayed, **When** I select a row's quick view, **Then** a preview of the
   event opens without leaving the list.
3. **Given** I show or hide columns, **When** I come back later, **Then** my column choices are kept.
4. **Given** I type text or a record number in the search bar, **When** the list refreshes,
   **Then** it shows events whose title matches, or the event with that record number, combined
   with any active filters.
5. **Given** the filter bar is open, **When** I inspect it, **Then** I can filter by Type (and
   level), Time range, Organization (Department → Task), Action status (On Going / To Complete /
   Completed / Cancelled / No Action), Reporter, HPR flag, Status and a My Events toggle.
6. **Given** I apply a filter, **When** the list refreshes, **Then** the list and all KPI counts
   update to match; **and given** My Events is on, **then** only events I reported are listed.
7. **Given** I open Events, **When** the page loads, **Then** clickable KPI tiles show Total
   Events, Open Events, Overdue Actions and Events With HPR; clicking a tile applies its filter.
8. **Given** any row, **When** I open its actions, **Then** View is available, and Edit is
   available only when my role allows editing that event.

---

### Edge Cases

- **No events yet**: the list, KPI tiles, My Alerts and My Actions show a clear empty state rather
  than bare zeros.
- **Search with no match**: the list says no event matches and offers to clear search and filters.
- **Level changed after answering the risk question**: changing the pillar or level clears answers
  that no longer apply (e.g., switching SRE2 → SRE4 replaces the CRP question with the SRP question).
- **Parent location changed**: changing a parent location level clears every child level chosen
  under it.
- **Level changed to one that needs more**: switching from TF4 to TF2 makes a photo and an
  immediate action mandatory, and the summary flags them as missing.
- **More than 5 assignees**: the 6th assignee cannot be added and the limit is explained.
- **Due date in the past**: an immediate action's due date cannot be earlier than today.
- **Event time in the future**: the event time cannot be later than the current time on the report
  date.
- **Leaving the form**: leaving with unsaved changes asks whether to save a draft, discard or stay.
- **Draft visibility**: drafts are visible only to their reporter, are excluded from KPI counts, and
  never create alerts or actions.
- **Business switch with unsaved form**: the user is warned before the page reloads.
- **Action becomes overdue**: an action not Completed by its due date shows as Overdue in My Actions
  and counts in the Overdue Actions tile.

## Requirements *(mandatory)*

### Functional Requirements

**Event creation** (US-CREATE-)

- **FR-001**: Users MUST be able to start a new event from the landing screen in no more than
  3 taps. *(US-CREATE-10, US-SHELL-08)*
- **FR-002**: The creation form MUST be split into sections — Classification, Location, General
  Information, Event Details, Immediate Actions, Summary — with a progress indicator showing the
  current section and how many remain. *(US-CREATE-12, SCR-MOB-01, SCR-DSK-01)*
- **FR-003**: Users MUST classify the event by pillar, then family, then type and level, using
  these catalogs, each level with a plain-language description: Health & Safety / TF: TF1 Lost
  Time Accident, TF2 Non-Lost Time Accident, TF3 First Aid, TF4 Near Miss, TF5 Hazardous
  Situation; Environment / ENV: EvE1 Major environmental accident … EvE5 Poor environmental
  situation or condition; Site Risk / IR: SRE1 Major site risk accident … SRE5 Site risk hazardous
  acts or conditions; Industrial Hygiene / OH: classification by disease type. *(US-CREATE-01)*
- **FR-004**: The system MUST require, immediately after the level: "Could this be an HPR?" for
  Health & Safety and Environment; "Could this be a CRP?" for SRE1–SRE2; "Could this be an SRP?"
  for SRE3–SRE5. Each question MUST show a brief definition. *(SCR-MOB-01 FR-2 to FR-4)*
- **FR-005**: Users MUST pick the location through Plant → Department → Workshop → Job →
  Workstation → Task, with each list filtered to the selected parent, and MUST choose a Task Type
  before continuing. *(US-CREATE-02)*
- **FR-006**: The system MUST capture Title, Reporter (pre-filled with the current user, editable
  only by a Manager), Report Date (today, read-only), Event Time, Shift Moment (Day / Night /
  Afternoon) and Description with basic formatting. *(US-CREATE-03)*
- **FR-007**: Users MUST be able to attach photos and videos, and capture them directly with the
  device camera on a phone. *(US-CREATE-03)*
- **FR-008**: The system MUST require at least one photo or video before submitting a TF1, TF2 or
  TF3 event. *(US-CREATE-03)*
- **FR-009**: The system MUST check each file's type, extension and size against the allowed list
  (images and videos, see Assumptions) and reject failing files with a clear message without
  attaching them. *(US-CREATE-11)*
- **FR-010**: The system MUST capture Employee type (Employee / Temporary Worker / Permanent
  Contractor / Non-Permanent Contractor / Other), Recurrence (Yes/No), Comments and Feedback email
  recipients, plus a Disease(s) multi-select when the family is OH. *(US-CREATE-04)*
- **FR-011**: Users MUST be able to add any number of immediate actions as repeatable cards, each
  with Description, Priority, Category, Subcategory, Action plan detail, Due date, KPI ID
  (optional) and Comments; the creation date MUST be set automatically. *(US-CREATE-05)*
- **FR-012**: The system MUST require at least one immediate action before submitting a TF1–TF3 or
  SRE1–SRE3 event. *(US-CREATE-05)*
- **FR-013**: Users MUST be able to assign 1 to 5 users to each immediate action. *(US-CREATE-06)*
- **FR-014**: The summary MUST show every section with its values, flag missing mandatory fields
  and link back to each section for editing. *(US-CREATE-09)*
- **FR-015**: Save as Draft MUST store the event with status `Draft` and trigger nothing; Submit
  MUST be possible only when no mandatory field is missing. *(US-CREATE-09)*
- **FR-016**: On submit, the system MUST give the event a unique, human-readable record number,
  set its status to `Open`, create a My Actions entry for each action assignee, and create a
  My Alerts entry "Event submitted" for every Manager of the event's plant and pillar.
  *(US-CREATE-06, US-CREATE-09, Core FR-1)*
- **FR-017**: A reporter MUST be able to reopen their own draft, continue it and submit it.
  *(US-CREATE-09)*

**Global shell** (US-SHELL-)

- **FR-018**: Every screen MUST show a header with the user's avatar, name and role, the current
  business, plant and pillar, and quick-access controls for My Alerts and My Actions.
  *(US-SHELL-01)*
- **FR-019**: Users with more than one business MUST be able to switch business, which reloads the
  page in the new scope. *(US-SHELL-01)*
- **FR-020**: The plant selector MUST show each plant with its plant-type icon and country flag.
  *(US-SHELL-01)*
- **FR-021**: Every list, count, search result and record shown MUST be limited to the user's
  business → plant → pillar scope; out-of-scope events MUST NOT be shown or reachable, including
  by direct link. *(US-SHELL-06)*
- **FR-022**: The navigation MUST be built from the user's role, following this matrix for the
  in-scope items; screens outside a role MUST show a permission message when opened by direct link.
  *(US-SHELL-02)*

  | Menu item | User | Manager | Site Admin |
  |---|:---:|:---:|:---:|
  | Events | ✓ | ✓ | ✓ |
  | Create Event | ✓ | ✓ | — |
  | My Actions | ✓ | ✓ | — |
  | My Alerts | ✓ | ✓ | — |

- **FR-023**: My Alerts MUST list the user's alerts newest first, each with source event, type and
  creation date; selecting one MUST open the source event. *(US-SHELL-03)*
- **FR-024**: My Actions MUST list the actions assigned to the user with status On Going /
  To Complete / Completed / Overdue, and changing a status MUST save it without leaving the
  current screen and show the new status on the event. *(US-SHELL-04)*
- **FR-025**: The shell and all MVP screens MUST work on screens from 320px wide, behave the same
  on phone and desktop, and be usable with keyboard and screen reader. *(US-SHELL-08)*

**Event library** (US-LIB-)

- **FR-026**: Events MUST list the events in the user's scope (excluding other users' drafts),
  sortable by date, type, level, status and reporter, with 20, 50 or 100 records per page.
  *(US-LIB-01)*
- **FR-027**: Users MUST be able to open a quick view of a row's event without leaving the list.
  *(US-LIB-01, SCR-DSK-02 FR-33)*
- **FR-028**: Users MUST be able to show and hide columns, and their choice MUST be remembered.
  *(US-LIB-01)*
- **FR-029**: Search MUST match event titles or an exact record number and MUST combine with active
  filters. *(US-LIB-02)*
- **FR-030**: Users MUST be able to filter by Type (and level), Time range, Organization
  (Department → Task), Action status (On Going / To Complete / Completed / Cancelled / No Action),
  Reporter, HPR flag, Status (Draft / Open) and a My Events toggle; filters MUST update the list and
  the KPI counts. *(US-LIB-03)*
- **FR-031**: Events MUST show clickable KPI tiles — Total Events, Open Events, Overdue Actions,
  Events With HPR — whose counts reflect active filters and which apply their filter when clicked.
  *(US-LIB-06)*
- **FR-032**: Each row MUST offer View; Edit MUST be offered to the reporter of a draft and to
  Managers for any event in their scope. *(US-LIB-04)*
- **FR-033**: The event detail view MUST show every field entered at creation, its attachments and
  its immediate actions with their current status. *(US-LIB-04)*
- **FR-034**: Edits MUST follow the same validation rules as creation. *(US-LIB-04)*

**Data**

- **FR-035**: The system MUST record, for every event, who created it and when, and who last
  changed it and when. *(Core FR-16, reduced)*
- **FR-036**: All data (events, drafts, actions, alerts, column choices) MUST be kept on the single
  device and browser used for the demonstration and MUST survive closing and reopening the app;
  sharing data across devices is not required. Switching demo users on the same device is how
  multi-user flows (e.g., reporter → Manager alert) are demonstrated.

### Key Entities

- **Event**: Something reported from the shop floor. Record number, pillar, family, type and level,
  risk-question answer (HPR / CRP / SRP), location chain (Plant → Task) and Task Type, title,
  description, reporter, report date, event time, shift moment, employee type, recurrence,
  comments, feedback recipients, diseases (OH only), status (`Draft` or `Open` in this MVP),
  created/updated by and at. Belongs to one business, plant and pillar.
- **Immediate Action**: Containment recorded at creation. Description, priority, category,
  subcategory, action plan detail, due date, KPI ID, comments, creation date, 1–5 assignees, status
  (On Going / To Complete / Completed / Cancelled; shown as Overdue when past due and not
  Completed). Belongs to one event.
- **Attachment**: A photo or video on an event. File name, type, size, added by and when.
- **Alert**: A message in a user's My Alerts. Type (e.g., "Event submitted"), source event,
  recipient, creation date.
- **User**: A person using the app. Name, avatar, role (User / Manager / Site Admin), and the
  businesses, plants and pillars they can access.
- **Organization structure**: Business → Plant (with plant type and country) and the location
  hierarchy Department → Workshop → Job → Workstation → Task, plus the Task Type list.
- **Reference lists**: pillars, families and levels with descriptions; employee types; action
  priorities, categories and subcategories; diseases.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A frontline worker completes a TF4 or TF5 report on a phone in under 3 minutes.
- **SC-002**: A new event can be started from the landing screen in no more than 3 taps.
- **SC-003**: The creation form appears in under 2 seconds after it is opened.
- **SC-004**: The event list shows 100 rows with all filters applied in under 3 seconds.
- **SC-005**: At least 9 out of 10 first-time users complete a report without help.
- **SC-006**: 100% of mandatory-field rules (photo for TF1–TF3, immediate action for TF1–TF3 and
  SRE1–SRE3, risk question, Task Type) block submission when unmet, in testing.
- **SC-007**: In testing, no user ever sees an event outside their scope, by any route.
- **SC-008**: Every KPI tile count matches a manual count of the events it represents.
- **SC-009**: A submitted event's alerts and action entries appear for the right users the next
  time they open or refresh My Alerts or My Actions.

## Assumptions

**Out of scope for this MVP** (kept for later specs):

- Features 04–14: Investigation, Action Plan, Review and Governance (including review, archiving,
  lock/unlock and closure), Safety Communication, External Reporting Platform integration,
  Reporting and Analytics, Configuration and Administration, Notifications settings, Integrations,
  Event Sharing Hub, Risk Assessment. The Core Event Lifecycle stops at `Open` here.
- Control Panel / master data administration; reference lists are fixed sample data.
- Role management beyond the three demo roles (no Reviewer, Investigator, Owner, Regional or
  Super Admin; no self-assignment).
- From Global Shell: US-SHELL-05 (translated interface, language selector, AI fallback) — the
  constitution requires English-only text; footer links; Notification Settings; the Reports,
  Configuration, Administration and Integrations menu items.
- From Event Library: US-LIB-05 bulk actions; PDF export; the Manager ellipsis menu (Unarchive,
  Unlock, Delete), since no MVP feature archives or locks events and events are never deleted;
  resizing column widths.
- From Event Creation: US-CREATE-07 First Causes; US-CREATE-08 External Reporting Platform health
  detail; proposed US-CREATE-13 (bottom sheets) and US-CREATE-14 (skip action steps); Section
  Mandatoriness Configuration (fixed defaults are used: actions mandatory for TF1–TF3 and
  SRE1–SRE3); type-specific fields from the event-type specs (e.g., First Aid Treatment for TF3).
- From Detailed Screens: QR-code and GPS location, photo mark-up, speech-to-text, report on behalf
  of others with directory search, witness statements, offline drafts, safety broadcast feed.
- Emails of any kind (assignment, feedback recipients, Manager notifications): feedback recipients
  are captured but not sent; notifications appear only in My Alerts and My Actions.
- Virus/malware scanning and a secure document service for attachments.

**Prototype simplifications**:

- Data lives only on the demonstration device and browser (decided 2026-10-24, FR-036); clearing
  the browser's site data resets the app to its sample data.

- There is no real login. The user picks a demo user (with a role and access scope) on a start
  screen; scope rules are still enforced for whatever that user can see or open.
- The Action Management Platform is not connected; immediate actions and their status live inside
  the app.
- Sample data includes at least 2 businesses, 3 plants (different types and countries), all four
  pillars, a full location hierarchy, demo users of each role, and enough events (including drafts,
  HPR events and overdue actions) to demonstrate every filter and KPI tile.
- Allowed attachments: common image and video formats, up to 10 MB per file and 5 files per event.
- The status after submission is `Open` (Core Event Lifecycle), not `Submitted` as in the Event
  Creation source; the Event Library Status filter therefore offers Draft and Open in this MVP.
- Industrial Hygiene (OH) uses disease classification instead of levels 1–5 and has no risk
  question, as the sources leave this open.
- Roles follow the Global Shell navigation matrix (User / Manager / Site Admin) rather than the
  Role Management roles (User / Reviewer / Investigator / Admin); the two sources conflict and
  reconciling them belongs to the Review and Governance spec.
- The app is self-contained in `apps/event-reporting/` and shares only the common visual theme in
  `shared/`, as required by the constitution.
