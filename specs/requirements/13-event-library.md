# 13 — Event library

Finding, following and opening events: the events of the context with search, filters and saved
filters, the indicators, the event register, and the page of each event with its steps and history.

Builds on: [00 Overview](00-overview.md) (context, visibility, lifecycle, steps), the step files
[02](02-event-reporting.md)–[09](09-sharing-hub.md).

## Rules

### What is listed

- **EL-1** The event library shows the events of the person's context (OV-2): the submitted events
  they can see (RP-6) plus their own drafts — never someone else's drafts. Archived events show only
  when the Status filter asks for them ("Archived events show only when you choose Archived."). The
  event workspace also gives access to the Safety communications (SC-8) and the Sharing Hub (SH-5).
- **EL-2** **Search**: title containing the text, or the event whose record number is exactly the text
  (ignoring case). A person's last 5 searches are offered again.
- **EL-3** **Filters**: Type and Level, From / To (report date), Location (department down to task),
  Reporter, SIP (Yes / No), Status (Draft, Open, In Progress, Closed, Archived) and My events. Nothing
  applies until the person applies the filters; each filter in use can be removed on its own, or all
  at once.
- **EL-4** **Saved filters**: a person saves the current search, filters and quick filter under a name,
  applies one later (shown as "Saved filter: <name>") and deletes them. "No saved filters yet" when
  none.
- **EL-5** **Quick filters**, each with its count: **All** (own drafts included), **My events**
  (reported or created by the person, drafts included), **Open** (Open and In Progress), **With SIP**
  (submitted), **Drafts** (own).
- **EL-6** Search, filters, saved filters and quick filters combine, and every count and indicator
  follows them — the Archived count follows every filter except Status.
- **EL-7** **SIP** (quick filter, filter, indicator) means that a valid review flagged the event SIP;
  HCI, SPL and HCL do not count. The reporter's "Could this be a SIP?" answer is only shown with the
  event's facts; only the review's critical flags mark an event critical (OV-11).
- **EL-8** Each event shows its level, critical flags, record number (or "Draft — no record number
  yet"), title, status, location, reporter and report date; and, on demand, its description, full
  location, event time, shift, task type, SIP answer, photos and immediate actions ("No immediate
  action recorded."). From it, a reviewer can start the review (RV-2), anyone who can see it opens it,
  and its author continues a draft.
- **EL-9** The events can be shown **grouped by status** (Draft, Open, In Progress, Closed, Archived,
  with each status's count) or as a **table** (Record number, Title, Status, Level, Report date,
  Department, Reporter — the last five can be hidden), sortable by report date, level, status and
  reporter, in pages. The person's choice of view and columns is remembered.
- **EL-10** Empty: "No events yet." / "No events match the current search and filters.".

### Indicators

- **EL-11** Five numbers, each opening the matching events: **Events with SIP** ("Reviewed as a serious
  incident potential"), **Open actions** ("Deployed and not yet completed": corrective actions of
  deployed plans neither Completed nor Cancelled), **Overdue actions** ("Past their due date", AP-5),
  **Events in progress** ("Submitted and not yet closed": Open or In Progress) and **Archived events**
  ("Reviewed as not valid").
- **EL-12** **Reported events by type**: per event type, the events by level, every type and level
  listed even when zero, also as a table (Type, Level, Events).
- **EL-13** **Archived events by reason**: per reason (Duplicated, Useless, Bad quality), the events by
  type ("Events reviewed as not valid in your scope, split by type."), also as a table (Reason, Type,
  Events).

### Event register

- **EL-14** "A record-by-record view of events visible to you. Use search and filters to define the
  records shown; this page uses event data already captured in the system." — the table of events
  with the same search and filters; no export or extra analytics.

### The event

- **EL-15** A **draft** shows everything entered so far, and lets its author continue or delete it
  (ER-20).
- **EL-16** A **submitted** event shows its key facts (pillar, level, status, critical flags, title),
  its **steps** — Submission, Review, Root cause analysis, Actions, Validation — each Done, Current
  step, Not reached yet, Not required or Optional (OV-10a), its safety communications (SC-10) and its
  Record Historian (RH-2). Opening an event shows its current step (Submission right after
  submitting). A step that cannot be opened says "This step is not required for this event." or "This
  step has not been reached yet."; an optional analysis opens for those who can start it (RCA-15).
- **EL-17** The **Submission** step shows the report, its photos and videos, the immediate actions and
  the **history**, oldest first: Created by …, Submitted — record number …, Review taken by …, Review
  completed — valid / archived (<reason>), Immediate actions updated in the root cause analysis by …,
  Root cause analysis started / completed by …, Action plan deployed by …, Action plan completed,
  Validation: not effective — <reason> (…), Validation: effective — closed by …, Rework: <reason>
  (…), Last updated by …. Those who may correct the report do it there (ER-21, ER-22).
- **EL-18** People who cannot open an event are told "You do not have permission to open this page.".

## Decisions

| Topic | Decision |
|---|---|
| SIP | Only the review's SIP flag counts; the reporter's answer is informative |
| Archived events | Hidden unless the Status filter asks for them |
| Event register | The same events as the table, with the same filters; no export (later) |
| Indicators | Follow the search and filters in use |

## Examples

1. **Given** a User of plant A with drafts, **then** the library of plant A shows the submitted events
   they can see and their own drafts, no other person's draft and no archived event. (EL-1)
2. **Given** a search "tf-26-0003", **then** only event TF-26-0003 is found; a search "fire" finds the
   events whose title contains "fire". (EL-2)
3. **Given** the filters Type TF and SIP Yes saved as "TF with SIP", **when** the person clears
   everything and applies the saved filter, **then** the same events are listed with "Saved filter: TF
   with SIP". (EL-3, EL-4)
4. **Given** an event archived by its review, **then** it is not listed until Status = Archived is
   chosen, and the Archived events indicator counts it. (EL-1, EL-11)
5. **Given** an event reported with SIP Yes but reviewed as not SIP, **then** it is not counted With
   SIP. (EL-7)
6. **Given** an In Progress event at Actions, **then** opening it shows the Actions step; Submission,
   Review and Root cause analysis are Done, Validation Not reached yet. (EL-16)
