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

## Clarifications

### Session 2026-10-24

- Q: Does the pillar shown in the header restrict what the user sees and reports, or is it only a
  starting point? → A: The pillar is an optional entry point. If the user selects a pillar before
  entering the module, Events opens filtered to that pillar and new events are created in that
  pillar (the pillar step is skipped). If the user enters the module without selecting a pillar,
  Events shows all pillars they can access and the pillar is chosen as the first step of event
  creation.
- Q: Should the prototype accept videos as attachments, or photos only? → A: Photos and short
  videos, with a low size limit of 5 MB per file; running out of device storage is accepted as a
  prototype limitation and must be handled with a clear message.
- Q: How does an immediate action's status change, and who can change it? → A: An immediate action
  records containment already done at the scene, so it is created with status Completed and has no
  status workflow. The Action Plan (a later phase, after submission) gathers all of an event's
  actions — the immediate ones plus new actions with due dates and a status workflow. The My
  Actions panel, the Overdue Actions tile and the Action status filter therefore move to the Action
  Plan spec.
- Q: Should a User-role user see all events in their plant and pillars, or only events they
  reported? → A: All submitted events in their scope (plant and accessible pillars), plus only
  their own drafts; the My Events toggle narrows the list to their own reports.
- Q: What format should an event's record number have? → A: Family + year + a sequence per family
  and year, e.g., `SAF-2026-0042` (superseded by the review session below: `EVE-26-0001`); assigned on
  submit only (drafts have none).

### Session 2026-10-24 (UI/UX iteration)

Design references: [design/](design/) (PNG exports from the product team's Figma for the action
management module). They are a **guideline for the overall look and interaction patterns**, not
screens to copy; product logo and name are not reused, and all text stays in English.

- Q: Should the creation form become a single scrolling page like the reference? → A: No. The 6
  sections stay, shown as a visible stepper (superseded below: one continuous page); the reference sets the look (chips, cards, fixed
  bottom action bar).
- Q: How should the event list appear? → A: Cards on phones and a table on desktop, with a toggle
  between the two. (Superseded by the review session below: Kanban and List.)
- Q: How much of the reference applies in this round? → A: Everything that fits the MVP: visual
  theme, compact top bar, bottom navigation on phones, KPI chips, cards, filters and notifications
  in bottom sheets, full-screen search, and the new event detail layout.

### Session 2026-10-24 (review of the first UI round)

- Q: What are the pillar and family names and acronyms? → A: The pillar is "Industrial Risk" (not
  "Site Risk"). Each family uses the same acronym as its levels: **TF** (Safety, TF1–TF5), **EVE**
  (Environment, EvE1–EvE5), **SRE** (Industrial Risk, SRE1–SRE5) and **OH** (Occupational Health).
- Q: Can the record number be simpler? → A: Family acronym + last two digits of the year + a
  4-digit sequence, e.g., `EVE-26-0001`, `TF-26-0042`.
- Q: How should the event list look? → A: Two views, chosen with icon + word buttons: **Kanban**
  (event cards in columns by status) and **List** (a table). The list columns, in order: record
  number, status, level, report date, title, department, reporter. One eye icon opens the quick
  view (replacing "Quick view" and "View"). Search, Filters and Columns sit on one line. Statuses
  are shown as colored badges.

### Session 2026-10-24 (review of the event creation form)

- Q: Should the form keep its 6 sections? → A: No. Everything is on **one continuous page** with
  section headings; Save as draft and Submit sit in a bar fixed to the bottom. Missing fields are
  flagged in place when the user submits. (Supersedes the stepper decision above and the summary
  step.)
- Q: How is the location chosen? → A: One location field opens a picker where the user can
  **type to search**, **browse one level at a time**, or **scan the QR code** of a station.
- Q: What is the follow-up question for Safety and Environment? → A: "Could this be a **SIP**?"
  (not HPR). Industrial Risk keeps CRP / SRP.
- Q: Are photos/videos or immediate actions mandatory for some levels? → A: No. Both are
  optional for every level.
- Q: Which fields does an immediate action have? → A: Subcategory and Action plan detail are
  removed.

### Session 2026-10-24 (review of the list, Kanban and form details)

- Q: How are event details shown from the List and Kanban views? → A: Clicking a row or a card
  **expands it in place, vertically**, showing the description, key facts and one sub-card per
  immediate action, with links to open or edit the event. This replaces the eye icon and the
  quick-view side panel.
- Q: What do rows and cards show? → A: No SIP badge in the List level column; no severity bar on
  Kanban cards (the level and SIP tags are enough). All Kanban columns must be reachable: they fit
  side by side on wide screens, and scroll horizontally with ‹ › buttons on narrower ones.
- Q: How are family and level chosen? → A: The family is hidden and filled in automatically when
  the pillar has only one. Levels are compact badges (e.g., "TF1"); choosing one shows its name and
  description.
- Q: Which task types exist? → A: Routine and Non-routine only.
- Q: Is the event time required? → A: No, it is optional.
- Q: Can the description be dictated? → A: Yes, a microphone button transcribes speech into the
  description where the browser supports it.
- Q: What replaces "Feedback email recipients"? → A: **Shared with**: users of this plant (who can
  see the event's pillar) chosen from a list; each gets an "Event shared with you" alert on submit.

### Session 2026-10-24 (review of header, list and form)

- Q: How does the user get back to the pillars and to the event list? → A: A **Home** icon in the
  top bar opens the entry screen (pillars); the "Event Reporting" name in the top bar opens the
  event list, on every screen size.
- Q: What does an expanded row or card show? → A: Only what the row or card does not already show
  (no repeated level, date or title).
- Q: Is the page size adjustable? → A: No, it is fixed at 20 rows for now.
- Q: Where is the dictation button? → A: On the same line as Take photo and Attach photo or video.
- Q: How is "Shared with" chosen? → A: A dropdown of the plant's users; each choice appears as a
  removable badge below it.
- Q: What happens after saving? → A: The event's view page opens, with a confirmation banner.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Report an event from the shop floor (Priority: P1)

*Traces to: US-CREATE-01, 02, 03, 04, 05, 06, 09, 10, 11 (and proposed US-CREATE-12).*

A frontline worker sees something wrong — a near miss with a forklift, an oil spill, a damaged
guard. From the landing screen they start a new event in no more than 3 taps. One continuous page
takes them from top to bottom: they pick the pillar (unless they entered the module through a
pillar, which then sets it), family and level (each level explained in plain language) and answer
the follow-up risk question (SIP, CRP or SRP), find the exact location by typing, browsing or
scanning a station's QR code, enter the core facts and optionally attach photos, add event
details, and optionally record immediate actions already taken at the scene (with up to 5 people
who performed each). They either save a draft to finish later or submit; anything missing is
flagged in place. On submit the event gets a unique record number and the pillar's
Managers see a new alert in My Alerts.

**Why this priority**: Event creation is the highest-traffic flow. Without fast, reliable reporting
every other part of the product has no data.

**Independent Test**: Choose a User-role demo user, report one TF4 event on a phone-sized screen
and one TF2 event with a photo and an immediate action (both optional), then confirm that both receive record
numbers, that the TF2 event shows its immediate action as Completed, and that a Manager sees two
new alerts.

**Acceptance Scenarios**:

1. **Given** I entered the module without selecting a pillar, **When** I start a new event,
   **Then** I first choose a pillar (Health & Safety / Environment / Industrial Risk / Industrial
   Hygiene), then the family, then the specific type and level, and each level shows a short
   plain-language description (e.g., "TF4 — Near Miss: something occurred but nobody was hurt");
   **and given** I entered through a pillar, **then** the pillar step is skipped and the form
   opens with that pillar's families and levels.
2. **Given** I choose a Health & Safety or Environment level, **When** the level is selected,
   **Then** "Could this be a SIP?" (Yes/No) is required before I can submit.
3. **Given** I choose Industrial Risk level SRE1 or SRE2, **When** the level is selected, **Then**
   "Could this be a CRP? (Critical Risk Potential)" (Yes/No) with a brief definition is required;
   **and given** SRE3, SRE4 or SRE5, **then** "Could this be an SRP? (Serious Risk Potential)" is
   required instead.
4. **Given** I open the location picker, **When** I type part of a name, browse level by level, or
   scan a station's QR code, **Then** I end on a full location (Department → Workshop → Job →
   Workstation → Task in my plant), shown as one path in the form; Task Type is also required.
5. **Given** I look at General Information, **When** the section renders, **Then** Title, Reporter
   (pre-filled with me, editable only by a Manager), Report Date (today, read-only), Event Time (optional),
   Shift Moment (Day / Night / Afternoon) and Description are captured.
6. **Given** any level, **When** I submit without a photo or video, **Then** the event is
   accepted (photos and videos are optional).
7. **Given** I am on a phone, **When** I add media, **Then** I can take a photo or video with the
   device camera.
8. **Given** I upload a file of a type or size that is not allowed, **When** it is checked,
   **Then** it is rejected with a clear message and not attached.
9. **Given** I look at Event Details, **When** the section renders, **Then** I choose an Employee
   type, set Recurrence (Yes/No), enter Comments and choose who it is Shared with; **and given** the
   family is OH, **then** a Disease(s) multi-select is also shown.
10. **Given** any level, **When** I submit without an immediate action, **Then** the event is
    accepted (immediate actions are optional).
11. **Given** I add an immediate action, **When** the action card renders, **Then** I capture
    Description, Priority, Category, Completion date, KPI ID (optional), Comments and 1 to 5
    people who performed it; the action is saved with status
    Completed and its creation date is set automatically; I can add more actions as repeatable
    cards.
12. **Given** something required is missing, **When** I tap Submit, **Then** nothing is saved,
    each missing field is flagged next to it, and the page scrolls to the first one.
13. **Given** I choose Save as Draft, **When** it is saved, **Then** the event has status `Draft`
    and nobody is notified; **and given** I choose Submit, **then** the event gets a record number
    and status `Open`, and every Manager of the event's pillar and plant gets a My Alerts entry.

---

### User Story 2 - Work inside a trusted application frame (Priority: P2)

*Traces to: US-SHELL-01, 02, 03, 06, 08.*

Every screen sits inside the same frame. A header shows who I am (avatar, name, role), the business,
plant and pillar I am working in, and a quick-access control for My Alerts. The navigation only
shows what my role can use. I can enter through a pillar or straight into the module; I only ever
see events from my business, plant and accessible pillars, narrowed to the selected pillar when I
entered through one. My Alerts lists alerts addressed to me and takes me to the source event.

**Why this priority**: The selected business → plant → pillar context governs everything else.
Without it, people report against the wrong plant or see data that is not theirs. It is P2 because
a single-plant demo of Story 1 is already useful without switching context.

**Independent Test**: Sign in as demo users with different roles and plants and confirm that the
header, navigation, visible events and My Alerts match each user's role and scope.

**Acceptance Scenarios**:

1. **Given** I open any screen, **When** it renders, **Then** the header shows my avatar, name,
   role, the current business, plant and pillar (or "All pillars" when I entered without one), and
   a control for My Alerts.
2. **Given** I am on the entry screen, **When** I select a pillar, **Then** the module opens with
   Events filtered to that pillar; **and given** I open the module without selecting a pillar,
   **then** Events shows all pillars I can access.
3. **Given** I have access to more than one business, **When** I switch business, **Then** the
   whole page reloads in the new business scope.
4. **Given** I open the plant selector, **When** the list renders, **Then** each plant shows its
   plant-type icon and country flag.
5. **Given** I open the product, **When** the navigation renders, **Then** it matches the
   visibility matrix for my role exactly (see FR-022).
6. **Given** a screen is outside my role, **When** I open it by direct link, **Then** I get a
   permission message and see none of its content.
7. **Given** events exist in another plant, **When** I browse, search or open a direct link,
   **Then** none of those events are ever shown to me.
8. **Given** I open My Alerts, **When** the panel slides open, **Then** it lists my alerts newest
   first with source event, type and creation date, and clicking one opens the source event.
9. **Given** I use a phone, **When** I use the frame, **Then** it behaves the same as on desktop,
   and all of it can be operated with a keyboard and a screen reader.

---

### User Story 3 - Find and act on existing events (Priority: P3)

*Traces to: US-LIB-01, 02, 03, 04 (View / Edit), 06, 07.*

A Manager arrives at the start of a shift and opens Events. KPI chips show All, My events, Open,
With SIP and Drafts. They tap "With SIP" and the list narrows to those events. They search a record number someone mentioned in a meeting, click its row to expand it in
place and read the description and immediate actions, then open it to view or edit it. A Reporter turns on "My Events" to
see only what they submitted.

**Why this priority**: The library is how existing events are found and triaged, but it only has
value once events are being reported (Story 1) inside a scoped frame (Story 2).

**Independent Test**: Load the sample data, then check that the list, search, every filter, every
KPI chip, row and card expansion, View and Edit all behave as described for a Manager and for a User.

**Acceptance Scenarios**:

1. **Given** I open Events, **When** the list loads, **Then** it shows only events in my scope,
   sortable by date, type, level, status and reporter, 20 records per page.
2. **Given** the list or the Kanban board is displayed, **When** I click a row or a card, **Then**
   it expands in place showing the description, key facts and the immediate actions as sub-cards.
3. **Given** I show or hide columns, **When** I come back later, **Then** my column choices are kept.
4. **Given** I type text or a record number in the search bar, **When** the list refreshes,
   **Then** it shows events whose title matches, or the event with that record number, combined
   with any active filters.
5. **Given** the filter bar is open, **When** I inspect it, **Then** I can filter by Type (and
   level), Time range, Organization (Department → Task), Reporter, SIP flag, Status and a My Events
   toggle.
6. **Given** I apply a filter, **When** the list refreshes, **Then** the list and all KPI counts
   update to match; **and given** My Events is on, **then** only events I reported are listed.
7. **Given** I open Events, **When** the page loads, **Then** clickable KPI chips show All,
   My events, Open, With SIP and Drafts; selecting a chip narrows the list to it.
8. **Given** any row, **When** I open its actions, **Then** View is available, and Edit is
   available only when my role allows editing that event.

---

### Edge Cases

- **No events yet**: the list, KPI chips and notifications show a clear empty state rather
  than bare zeros.
- **Search with no match**: the list says no event matches and offers to clear search and filters.
- **Level changed after answering the risk question**: changing the pillar or level clears answers
  that no longer apply (e.g., switching SRE2 → SRE4 replaces the CRP question with the SRP question).
- **Location search with no match**: the picker says nothing matches and offers browsing.
- **QR code not recognized or scanning unavailable**: the picker explains it (unknown code, or
  this browser cannot scan) and the user searches or browses instead; a QR code pointing to a
  workstation opens browsing at that workstation so the task can be chosen.
- **More than 5 performers**: a 6th person cannot be added to an immediate action and the limit is
  explained.
- **Completion date in the future**: an immediate action's completion date cannot be later than
  today, nor earlier than the event date.
- **Event time in the future**: when given, the event time cannot be later than the current time on the report
  date.
- **Leaving the form**: leaving with unsaved changes asks whether to save a draft, discard or stay.
- **Draft visibility**: drafts are visible only to their reporter, count only under "All",
  "My events" and "Drafts" (never under "Open" or "With SIP"), and never create alerts.
- **Device storage full**: when an attachment or event cannot be saved because device storage is
  full, the user sees a clear message, nothing already entered is lost, and they can remove
  attachments and try again.
- **Business or pillar switch with unsaved form**: the user is warned before the context changes.

## Requirements *(mandatory)*

### Functional Requirements

**Event creation** (US-CREATE-)

- **FR-001**: Users MUST be able to start a new event from the landing screen in no more than
  3 taps. *(US-CREATE-10, US-SHELL-08)*
- **FR-002**: The creation form MUST be one continuous page with the sections Classification,
  Location, General Information, Event Details and Immediate Actions under headings, and a bar
  fixed to the bottom with Save as Draft and Submit. *(Clarification 2026-10-24, form review)*
- **FR-003**: Users MUST classify the event by pillar (skipped and pre-set when the user entered
  through a pillar), then family, then type and level, using these catalogs, each level with a
  plain-language description: Health & Safety / TF: TF1 Lost Time Accident, TF2 Non-Lost Time Accident, TF3 First Aid, TF4 Near Miss, TF5 Hazardous
  Situation; Environment / EVE: EvE1 Major environmental accident … EvE5 Poor environmental
  situation or condition; Industrial Risk / SRE: SRE1 Major site risk accident … SRE5 Site risk hazardous
  acts or conditions; Industrial Hygiene / OH: classification by disease type. *(US-CREATE-01)*
- **FR-004**: The system MUST require, immediately after the level: "Could this be a SIP?" for
  Health & Safety and Environment; "Could this be a CRP?" for SRE1–SRE2; "Could this be an SRP?"
  for SRE3–SRE5. Each question MUST show a brief definition. *(SCR-MOB-01 FR-2 to FR-4)*
- **FR-005**: Users MUST pick a full location (Department → Workshop → Job → Workstation → Task in
  the event's plant) from a location picker offering three ways: typing part of any level's name
  (results show the full path), browsing one level at a time, and scanning a station QR code
  where the browser supports it. Task Type MUST also be chosen. *(US-CREATE-02, SCR-MOB-01 FR-5,
  Clarification 2026-10-24, form review)*
- **FR-006**: The system MUST capture Title, Reporter (pre-filled with the current user, editable
  only by a Manager), Report Date (today, read-only), Event Time (optional), Shift Moment (Day /
  Night / Afternoon) and Description; a Dictate button, on the same line as the photo and video
  buttons, MUST transcribe speech into the description where the browser supports it. *(US-CREATE-03, SCR-MOB-01 FR-8, Clarification
  2026-10-24, list/Kanban/form review)*
- **FR-007**: Users MUST be able to attach photos and videos, and capture them directly with the
  device camera on a phone. *(US-CREATE-03)*
- **FR-008**: Photos and videos MUST be optional for every level. *(Clarification 2026-10-24,
  form review; replaces the TF1–TF3 rule of US-CREATE-03)*
- **FR-009**: The system MUST check each file's type, extension and size against the allowed list
  (common image and video formats, at most 5 MB per file and 5 files per event) and reject failing
  files with a clear message without attaching them. *(US-CREATE-11, Clarification 2026-10-24)*
- **FR-010**: The system MUST capture Employee type (Employee / Temporary Worker / Permanent
  Contractor / Non-Permanent Contractor / Other), Recurrence (Yes/No), Comments and **Shared
  with** (a dropdown of users of the event's plant who can see its pillar; each choice shown as a
  removable badge below it), plus a Disease(s) multi-select when
  the family is OH. *(US-CREATE-04, Clarification 2026-10-24, list/Kanban/form review)*
- **FR-011**: Users MUST be able to add any number of immediate actions as repeatable cards, each
  with Description, Priority, Category, Completion date, KPI ID (optional) and Comments; each immediate action MUST be saved with status Completed (it records
  containment already done at the scene) and its creation date set automatically.
  *(US-CREATE-05, Clarification 2026-10-24)*
- **FR-012**: Immediate actions MUST be optional for every level. *(Clarification 2026-10-24,
  form review; replaces the TF1–TF3 / SRE1–SRE3 rule of US-CREATE-05)*
- **FR-013**: Users MUST record 1 to 5 people who performed each immediate action; this creates no
  task or notification for them. *(US-CREATE-06, Clarification 2026-10-24)*
- **FR-014**: When the user submits with something missing, the system MUST save nothing, flag
  each missing field next to it, show how many are missing, and scroll to the first one.
  *(US-CREATE-09, Clarification 2026-10-24, form review)*
- **FR-015**: Save as Draft MUST store the event with status `Draft` and trigger nothing; Submit
  MUST be possible only when no mandatory field is missing. After any save (draft, submit, changes)
  the event's view page MUST open with a confirmation banner (record number when submitted, and a
  link to report another event). *(US-CREATE-09, Clarification 2026-10-24, header/list/form review)*
- **FR-016**: On submit, the system MUST give the event a unique record number in the format
  `<FAMILY>-<YY>-<NNNN>` (family acronym TF / EVE / SRE / OH, last two digits of the year of
  submission, 4-digit sequence restarting at 0001 for each family and year, e.g., `EVE-26-0001`), set its status to `Open`, and create a My Alerts entry "Event submitted" for every Manager of
  the event's plant and pillar, and "Event shared with you" for each Shared with user not already
  alerted. *(US-CREATE-09, Core FR-1, Clarification 2026-10-24, list/Kanban/form review)*
- **FR-017**: A reporter MUST be able to reopen their own draft, continue it and submit it.
  *(US-CREATE-09)*

**Global shell** (US-SHELL-)

- **FR-018**: Every screen MUST show a header with the user's avatar, name and role, the current
  business, plant and pillar (or "All pillars"), and a quick-access control for My Alerts.
  *(US-SHELL-01)*
- **FR-037**: The entry screen MUST let the user either select one of their accessible pillars
  before entering the module, or enter the module without a pillar. With a pillar, Events is
  filtered to it and new events are created in it; without one, Events shows all accessible
  pillars and event creation starts with the pillar step. *(US-SHELL-01, Clarification 2026-10-24)*
- **FR-019**: Users with more than one business MUST be able to switch business, which reloads the
  page in the new scope. *(US-SHELL-01)*
- **FR-020**: The plant selector MUST show each plant with its plant-type icon and country flag.
  *(US-SHELL-01)*
- **FR-021**: Every list, count, search result and record shown MUST be limited to the user's
  business, plant and accessible pillars, narrowed to the selected pillar when the user entered
  through one; out-of-scope events MUST NOT be shown or reachable, including
  by direct link. *(US-SHELL-06)*
- **FR-022**: The navigation MUST be built from the user's role, following this matrix for the
  in-scope items; screens outside a role MUST show a permission message when opened by direct link.
  *(US-SHELL-02)*

  | Menu item | User | Manager | Site Admin |
  |---|:---:|:---:|:---:|
  | Events | ✓ | ✓ | ✓ |
  | Create Event | ✓ | ✓ | — |
  | My Alerts | ✓ | ✓ | — |

- **FR-023**: My Alerts MUST list the user's alerts newest first, each with source event, type and
  creation date; selecting one MUST open the source event. *(US-SHELL-03)*
- **FR-025**: The shell and all MVP screens MUST work on screens from 320px wide, behave the same
  on phone and desktop, and be usable with keyboard and screen reader. *(US-SHELL-08)*

**Event library** (US-LIB-)

- **FR-026**: Events MUST list, for every role including User, all submitted events in the user's
  scope plus the user's own drafts (never other users' drafts),
  sortable by date, type, level, status and reporter, 20 records per page (fixed, Clarification
  2026-10-24, header/list/form review).
  *(US-LIB-01, Clarification 2026-10-24)*
- **FR-027**: Clicking a List row or a Kanban card MUST expand it in place, vertically, showing
  only what the row or card does not already show — the description, full location, event time,
  shift, task type, risk-question answer, photos — and each immediate action as a sub-card, with links to open the event and, when allowed, edit it; clicking again collapses
  it. *(Clarification 2026-10-24, list/Kanban/form review; replaces the quick view)*
  *(US-LIB-01, SCR-DSK-02 FR-33)*
- **FR-028**: Users MUST be able to show and hide columns, and their choice MUST be remembered.
  *(US-LIB-01)*
- **FR-029**: Search MUST match event titles or an exact record number (e.g., `TF-26-0042`,
  case-insensitive) and MUST combine with active
  filters. *(US-LIB-02)*
- **FR-030**: Users MUST be able to filter by Type (and level), Time range, Organization
  (Department → Task), Reporter, SIP flag, Status (Draft / Open) and a My Events toggle; filters MUST update the list and
  the KPI counts. *(US-LIB-03)*
- **FR-031**: Events MUST show a row of clickable KPI chips — All, My events, Open, With SIP,
  Drafts — whose counts reflect the search and active filters; selecting a chip narrows the list
  to it. "All" and "My events" include the user's own drafts; "Open" and "With SIP" count
  submitted events only; "Drafts" counts the user's own drafts. *(US-LIB-06, Clarification 2026-10-24 UI/UX)*
- **FR-032**: Each row MUST offer View; Edit MUST be offered to the reporter of a draft and to
  Managers for any event in their scope. *(US-LIB-04)*
- **FR-033**: The event detail view MUST show every field entered at creation, its attachments and
  its immediate actions. *(US-LIB-04)*
- **FR-034**: Edits MUST follow the same validation rules as creation. *(US-LIB-04)*

**Interface** (design guideline, Clarification 2026-10-24 UI/UX)

- **FR-038**: *(Replaced by FR-002: one continuous page instead of a stepper.)*
- **FR-039**: Choices with few options (pillar, shift moment, employee type, recurrence, action
  priority, task type: Routine / Non-routine) MUST be shown as tappable chips; pillars show a
  color dot. The family is hidden and filled in when the pillar has only one. Levels MUST be
  compact badges (e.g., "TF1"); the chosen level's name and description MUST appear below them.
- **FR-040**: The top bar MUST hold the app name (a link to the event list on every screen size),
  a search field (an icon on phones), a Home icon to the entry screen (pillars), a notifications
  bell with an unread dot and the user's avatar; the avatar opens a sheet with name, role, business, plant,
  pillar (with Change) and Switch user. On phones a bottom navigation MUST offer Home (entry
  screen), Events and a floating New button (hidden for roles that cannot create).
- **FR-041**: Users MUST be able to switch the event list between a **Kanban** view (event cards
  in columns by status: Draft, Open, In Progress, Closed, Archived) and a **List** view (a table
  with columns record number, status, level, report date, title, department, reporter), using
  buttons with an icon and a word; Kanban is the default on phones and List on wider screens, and
  the choice MUST be remembered. Search, Filters and Columns MUST sit on one line, and statuses
  MUST appear as colored badges. Every Kanban column MUST be reachable: side by side on wide
  screens, horizontal scrolling with ‹ › buttons otherwise. The List level column shows the level
  only (no SIP badge) and Kanban cards show no severity bar. *(Clarification 2026-10-24, review;
  list/Kanban/form review)*
- **FR-042**: Filters MUST open in a bottom sheet (side sheet on wide screens) with chip groups
  and date fields, and apply only when the user taps Apply; a Filters button MUST show how many
  filters are active.
- **FR-043**: Notifications MUST open in a sheet listing alerts newest first with relative time
  ("2h ago"), unread ones highlighted, and a "Mark all read" action; opening an alert marks it
  read.
- **FR-044**: The top-bar search MUST open a full-screen search that shows the user's last 5
  searches (kept on the device) and live results by title or record number; an exact record
  number opens that event directly.
- **FR-045**: The event detail MUST show a top bar with back and record number, a header card
  with tags (pillar, level, status, SIP) and title, key facts in a grid, collapsible sections,
  a history timeline (created, submitted, last updated) and a fixed bottom bar with the actions
  the user may take (Edit / Continue draft).

**Data**

- **FR-035**: The system MUST record, for every event, who created it and when, and who last
  changed it and when. *(Core FR-16, reduced)*
- **FR-036**: All data (events, drafts, immediate actions, alerts, read state, column and view
  choices, recent searches) MUST be kept on the single
  device and browser used for the demonstration and MUST survive closing and reopening the app;
  sharing data across devices is not required. Switching demo users on the same device is how
  multi-user flows (e.g., reporter → Manager alert) are demonstrated.

### Key Entities

- **Event**: Something reported from the shop floor. Record number (`<FAMILY>-<YY>-<NNNN>`,
  unique, assigned on submit), pillar, family, type and level,
  risk-question answer (SIP / CRP / SRP), location chain (Plant → Task) and Task Type, title,
  description, reporter, report date, event time, shift moment, employee type, recurrence,
  comments, shared-with users, diseases (OH only), status (`Draft` or `Open` in this MVP),
  created/updated by and at. Belongs to one business, plant and pillar.
- **Immediate Action**: Containment already done at the scene, recorded at creation. Description,
  priority, category, completion date, KPI ID, comments, creation
  date, 1–5 people who performed it; status is always Completed. Belongs to one event. In the later
  Action Plan phase these become part of the event's action plan alongside new actions with due
  dates and a status workflow.
- **Attachment**: A photo or video on an event. File name, type, size, added by and when.
- **Alert**: A message in a user's My Alerts. Type (e.g., "Event submitted"), source event,
  recipient, creation date.
- **User**: A person using the app. Name, avatar, role (User / Manager / Site Admin), and the
  businesses, plants and pillars they can access.
- **Organization structure**: Business → Plant (with plant type and country) and the location
  hierarchy Department → Workshop → Job → Workstation → Task, plus the Task Type list.
- **Reference lists**: pillars, families and levels with descriptions; employee types; action
  priorities and categories; diseases.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A frontline worker completes a TF4 or TF5 report on a phone in under 3 minutes.
- **SC-002**: A new event can be started from the landing screen in no more than 3 taps.
- **SC-003**: The creation form appears in under 2 seconds after it is opened.
- **SC-004**: The event list shows 100 rows with all filters applied in under 3 seconds.
- **SC-005**: At least 9 out of 10 first-time users complete a report without help.
- **SC-006**: 100% of mandatory-field rules (risk question, full location, Task Type and the
  other required fields) block submission when unmet, in testing.
- **SC-007**: In testing, no user ever sees an event outside their scope, by any route.
- **SC-008**: Every KPI chip count matches a manual count of the events it represents.
- **SC-009**: A submitted event's alerts appear for the right Managers the next time they open or
  refresh My Alerts.

## Assumptions

**Out of scope for this MVP** (kept for later specs):

- Features 04–14: Investigation, Action Plan (including the My Actions panel from US-SHELL-04,
  the Overdue Actions tile from US-LIB-06, the Action status filter from US-LIB-03, and new actions
  with due dates and status), Review and Governance (including review, archiving,
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
  Mandatoriness Configuration (no section is mandatory by level in this MVP); type-specific fields from the event-type specs (e.g., First Aid Treatment for TF3).
- From Detailed Screens: GPS location, photo mark-up, report on behalf
  of others with directory search, witness statements, offline drafts, safety broadcast feed.
- Emails of any kind (assignment, sharing, Manager notifications): notifications appear only in
  My Alerts.
- Virus/malware scanning and a secure document service for attachments.

**Prototype simplifications**:

- Data lives only on the demonstration device and browser (decided 2026-10-24, FR-036); clearing
  the browser's site data resets the app to its sample data.
- There is no real login. The user picks a demo user (with a role and access scope) on a start
  screen; scope rules are still enforced for whatever that user can see or open.
- The Action Management Platform is not connected; immediate actions live inside the app.
- Sample data includes at least 2 businesses, 3 plants (different types and countries), all four
  pillars, a full location hierarchy, demo users of each role, and enough events (including drafts,
  SIP events and events with immediate actions) to demonstrate every filter and KPI chip.
- Allowed attachments: common image and video formats, up to 5 MB per file and 5 files per event
  (FR-009). Because data stays on the device, only a limited number of attachments fit; this is an
  accepted prototype limitation.
- The status after submission is `Open` (Core Event Lifecycle), not `Submitted` as in the Event
  Creation source; the Event Library Status filter therefore offers Draft and Open in this MVP.
- Industrial Hygiene (OH) uses disease classification instead of levels 1–5 and has no risk
  question, as the sources leave this open.
- Roles follow the Global Shell navigation matrix (User / Manager / Site Admin) rather than the
  Role Management roles (User / Reviewer / Investigator / Admin); the two sources conflict and
  reconciling them belongs to the Review and Governance spec. Following the Event Library source,
  a User sees all submitted events in their scope, not only their own (Role Management's stricter
  rule is not applied in this MVP).
- The app is self-contained in `apps/event-reporting/` and shares only the common visual theme in
  `shared/`, as required by the constitution.
