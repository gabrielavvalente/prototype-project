# Capability: Event library

**Product**: Event Reporting
**Builds on**: [domain](../domain.md) (visibility, lifecycle, steps, critical events),
[platform data](platform-data.md), [Event Reporting shell](event-reporting-shell.md),
[event reporting](event-reporting.md)
**Status**: built

Finding, triaging and opening events: the Events, KPIs and Reports pages, and the page of an event
with its workflow steps.

## Rules

### Event workspace

- **EL-1** "EVENT WORKSPACE" offers three pages — **Events**, **KPIs**, **Reports** — and **Create
  event** for those who can report. All three show the events of the context (domain Visibility):
  submitted events plus the person's own drafts, never someone else's drafts.
- **EL-2** One toolbar line: search ("Title or record number": title contains the text, or the
  record number is exactly the text, ignoring case), **Filters** (with the number of filters in
  use) and, on Events, the column chooser **Show columns** and the view switch **Kanban** / **List**
  (icon and word). Kanban is the default on phones and List on wider screens; the choice and the
  shown columns are remembered for the person.
- **EL-3** **Filters** opens a sheet (bottom on phones, side on wide screens) with Type and Level,
  From / To (report date), Location (department down to task), Reporter, SIP (Yes / No), Status
  (Draft, Open, In Progress, Closed, Archived — "Archived events show only when you choose
  Archived.") and My events; **Clear all** empties it and nothing applies until **Apply
  filters**. Archived events never show unless the
  Status filter asks for them. Filters in use appear as removable badges under the toolbar.
- **EL-4** **Saved filters** (in the Filters button's menu): "Save current filters" with a filter
  name keeps the search, the sheet's criteria and the chosen KPI chip for that person; applying one
  marks it "Applied" in the menu and shows one badge "Saved filter: <name>" (removing it clears
  it); presets can be deleted. "No saved
  filters yet" when empty.
- **EL-5** Search, filters and saved filters combine, and every count and chart follows them — the
  Archived count and chart follow the search and every filter except Status.
- **EL-6** "SIP" (the With SIP chip, the SIP filter, the Events with SIP number) means the SIP flag
  only: the submission's "Could this be a SIP?" answer until the event is reviewed, then whether a
  valid review flagged it SIP (an archived event is not SIP). HCI, SPL, HCL and the CRP / SRP
  answers do not count. Critical flags show as red badges on cards, rows and
  the event page.

### Events page

- **EL-7** A row of KPI chips, each with its number and word: **All** (including own drafts), **My
  events** (reported or created by the person, drafts included), **Open** (Open and In Progress),
  **With SIP** (submitted), **Drafts** (own). Choosing a chip narrows the list.
- **EL-8** **Kanban**: one column per status — Draft, Open, In Progress, Closed, Archived — with a
  status badge and count; side by side on wide screens, scrolling sideways with ‹ › ("Previous
  column", "Next column") otherwise. Cards show level and critical badges, record number (or
  "Draft — no record number yet"), title, location, reporter and report date.
- **EL-9** **List**: columns Record number and Title (always), Status, Level, Report date,
  Department, Reporter (can be hidden); sortable by report date, level, status and reporter; 20 rows
  per page.
- **EL-10** Clicking a card or row expands it in place with what it does not already show:
  description, full location, event time, shift, task type, risk answer, photos and each immediate
  action ("No immediate action recorded."). Links: **Review** (for a reviewer who can start the
  review, Event review capability), **Open event** (a submitted event opens on its current step,
  Submission if none; a draft opens its page) and, for its author, **Continue draft**. Clicking
  again collapses it.
- **EL-11** Empty states: "No events yet." / "No events match the current search and filters.".

### KPIs page

- **EL-12** Five numbers: **Events with SIP** ("Submitted with serious incident potential"), **Open
  actions** ("Deployed and not yet completed": actions of the [action plans](action-plan.md) that
  are deployed and not Completed or Cancelled), **Overdue actions** ("Past their due date", AP-5),
  **Events in progress** ("Submitted and not yet closed": status Open or In Progress) and **Archived
  events** ("Reviewed as not valid"). Each opens the Events page narrowed to its events; Open and
  Overdue actions show the badge "Events with open actions" / "Events with overdue actions"
  (removable) since they are not chips.
- **EL-13** **Reported events by type**: a stacked column per type (family), split by level in the
  pillar's color ("Darker shades are more serious levels."), every type and level listed even when
  zero, with details on hover and a table view (Type, Level, Events).
- **EL-14** **Archived events by reason**: a stacked column per reason (Duplicated, Useless, Bad
  quality) split by type ("Events reviewed as not valid in your scope, split by type."), with a
  table view (Reason, Type, Events).

### Reports page

- **EL-15** **Event register**: "A record-by-record view of events visible to you. Use search and
  filters to define the records shown; this page uses event data already captured in the system."
  — the List view of the events, with the same search and filters. No export or extra analytics.

### Event page

- **EL-16** A **draft** has its own page: back, "Draft", the header card, every section entered,
  and a bottom bar with **All events** and, for its author, **Continue draft**.
- **EL-17** A **submitted** event has one page, its steps: back to events and the record number,
  a compact header card (pillar, level, status and critical badges, title, key facts on one line),
  the **steps menu** — Submission, Review, Root cause analysis, Actions, Validation, each Done,
  Current step, Not reached yet, Not required or Optional (domain Steps) — and the chosen step. Opening the
  event shows its current step (Submission right after submitting, with the banner of the event
  reporting capability).
- **EL-18** Steps that cannot be opened say "This step is not required for this event." or "This
  step has not been reached yet.". Review, Root cause analysis and Actions are described by their
  capabilities; Validation says "Validation comes in a later version of the prototype.".
- **EL-19** The **Submission** step shows every section, the photos and videos, the immediate
  actions and the **history** (Created by …, Submitted — record number …, Review taken by …,
  Review completed — valid / archived (<reason>), Immediate actions updated in the root cause
  analysis by …, Root cause analysis completed by …, Action plan deployed by …, Action plan
  completed by …, Last updated by …, oldest first). A Manager
  who can edit it sees the form instead ([event reporting](event-reporting.md) ER-21).
- **EL-20** Every page title names the page and the event ("Root cause analysis — TF-26-0003 —
  Event Reporting").

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), Carla Mendes at Lyon, all pillars.

1. **Chips** — All 17, My events 7, Open 13, With SIP 6, Drafts 1. Choosing Drafts leaves "Hydraulic
   oil drip from forklift". (EL-1, EL-7)
2. **Kanban** — Draft 1, Open 13, In Progress 0, Closed 3; on a phone the columns scroll with ‹ ›.
   (EL-8)
3. **List** — Hide Department: it stays hidden after reloading. Sort by level; 17 rows on one page.
   (EL-2, EL-9)
4. **Search** — "tf-26-0003" finds only `TF-26-0003`; "fire" finds "Small fire in electrical
   cabinet"; with the filter Type = SRE as well, the counts follow. (EL-2, EL-5)
5. **Filters and presets** — Filters: Type TF, SIP Yes → Apply filters: the button shows 2 and the
   badges TF and SIP appear. Save it as "TF with SIP"; clear everything; apply the preset: one badge
   "Saved filter: TF with SIP".
   (EL-3, EL-4)
6. **Archived** — After Carla archives `TF-26-0001` in its review, it disappears from the Events
   page and the KPIs page shows Archived events 1; Status = Archived lists it. (EL-3, EL-12, EL-14)
7. **Expand** — Clicking `TF-26-0002` shows its description and its immediate action; Open event
   opens its Review step (current step). (EL-10, EL-17)
8. **KPIs** — Events with SIP 6, Open actions 0, Overdue actions 0, Events in progress 13,
   Archived events 0; the TF column splits by level and the table view lists every type and level.
   After [action plan](action-plan.md) scenario 3 (two deployed actions on `TF-26-0005`, one
   overdue): Open actions 2, Overdue actions 1; Overdue actions opens the Events page with
   `TF-26-0005` and the badge "Events with overdue actions". (EL-12, EL-13)
9. **Reports** — Event register lists the 17 events with the List columns. (EL-15)
10. **Event page** — `TF-26-0003` shows the steps Submission Done, Review Current step, Root cause
    analysis Not required, Actions Not reached yet, Validation Not required; Validation cannot be
    opened. Its Submission step shows the history "Created by Ana Ribeiro", "Submitted — record
    number TF-26-0003". (EL-17, EL-18, EL-19)
11. **Draft page** — Carla's draft opens its page with Continue draft; Ana cannot see it. (EL-16)
12. **Phone and keyboard** — At 320px the toolbar wraps and the filter sheet opens from the bottom;
    every chip, card and row works with the keyboard. (Domain)
