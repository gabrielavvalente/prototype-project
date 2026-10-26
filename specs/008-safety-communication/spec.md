# Change: Safety communication

**Feature Branch**: `008-safety-communication`

**Created**: 2026-10-26

**Input**: User description: "Safety communication" — the Safety Alert and the Safety Warning of the
sources (Safety Communication feature; Safety event FR-21, FR-27, FR-28 and its communication
table; Environment event FR-27), with the open points decided with the user on 2026-10-26.

**Capabilities**: new: `specs/capabilities/safety-communication.md` (prefix SC); changed:
`specs/capabilities/event-library.md` (EL-1, EL-17), `specs/capabilities/event-review.md`
(Decisions), `specs/capabilities/root-cause-analysis.md` (Scope), `specs/capabilities/validation.md`
(Scope), `specs/domain.md` (Glossary, Capabilities)

## Why

A reviewed event is a lesson for the whole plant, but today it is only visible to the people of its
pillar, inside the event. The Safety Alert tells the plant quickly what happened and what was done;
the Safety Warning shares what the analysis found and what is being changed — without naming
anyone.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| When the Alert exists | When the review is completed as valid | Safety Communication FR-1 (Initial Review save) vs Safety FR-21 / Environment FR-27 (statement and immediate actions complete in the analysis) |
| Who reads the Alert | Everyone with an event role whose access includes the event's plant, whatever their pillars | Safety Communication ("workers learn about a hazard on their site") |
| The Alert's content over time | Always the event's current content | Safety Communication FR-2 (refreshes) |
| When the Warning exists | A draft once the root cause analysis is completed and the action plan deployed; no analysis, no Warning | Safety Communication FR-5 vs Safety FR-27 (at closure) and FR-28 |
| Publishing the Warning | The plan owners publish it; it is then frozen and readable by everyone with an event role whose access includes the event's plant | Safety Communication FR-7 (Owner publishes, sent to a regional office) |
| Names | None on either document: no reporter, person involved, reviewer, analysts or assignees | Safety Communication FR-4 vs Safety table ("Investigator(s)") |
| Photos | The plan owners choose which of the event's photos the Warning shows; the Alert shows none | Safety Communication FR-6, FR-10 (images in the Warning); Safety table (photos in both) |
| Print | A Print button (the browser's print, which can also save as PDF) | Safety Communication US-COMM-04 (PDF export, deferred) |
| Pillars | Health & Safety, Environment, Industrial Risk; not Industrial Hygiene | Safety Communication (common template SAF, ENV, IR) |
| Alerts | Publishing raises no alert | Safety Communication FR-7 (email to the regional office) |
| Free texts | Statement, actions, causes and learnings are shown as written; the owners check them before publishing | The review already refuses the reporter's name in the statement (RV-11) |

## Rules

### Added — `safety-communication.md`

- **SC-1** Two documents come from an event of Health & Safety, Environment or Industrial Risk:
  the **Safety Alert** and the **Safety Warning**. Industrial Hygiene events have neither.
- **SC-2** **No names**: neither document shows the reporter, the person involved, the reviewer,
  the analysts, the plan owners or the assignees, nor the event's title and description (written
  by the reporter); the event is told through its statement.
- **SC-3** **Who reads them**: everyone with an event role whose access includes the event's
  plant, whatever their pillars — also people who cannot open the event itself. A document of
  another plant, opened by link, says "This safety communication is not available.".
- **SC-4** The **Safety Alert** exists once the event's review is completed as valid (none for an
  archived event). It always shows the event's current content:

  | Part | Content |
  |---|---|
  | Header | "Safety Alert", the record number, plant, pillar, level (code — name), event date |
  | Critical | The critical flags of the review (SIP, HCI, HCL, SPL) or "No" |
  | Severity | Health & Safety: "Potential severity" and "Actual severity" ratings of the review; Environment: "Is this event a SIP?" Yes / No; Industrial Risk: "Is this event an HCL?" or "Is this event an SPL?" Yes / No |
  | What happened | The event statement |
  | What was done | Each immediate action: description · priority |
  | Next steps | The event's required steps not done yet ("Root cause analysis · Actions · Validation"), or "None — the event is closed." |

- **SC-5** The **Safety Warning** exists once the event's root cause analysis is completed and its
  action plan deployed. Until it is published it is a **draft** that only the plan owners see,
  with "Draft — only the plan owners see it until it is published."; it shows the Alert's parts
  and:

  | Part | Content |
  |---|---|
  | Contributory causes | Each 6M cause ticked: theme › cause, and how it contributed |
  | Root causes | The answer of each why marked Root cause |
  | Key learnings | The analysis's learnings |
  | Corrective actions | Each: description · status · due date; then "<n> actions · <n> completed · <n> overdue" |
  | Photos | The photos chosen (SC-6) |

- **SC-6** In the draft, the plan owners tick the event's photos to include ("Photos to include",
  with "Choose photos that show no one's face or name."); none is ticked at first; videos are not
  offered.
- **SC-7** **Publish Safety Warning** (plan owners, draft only) asks "Publish this Safety Warning?
  Everyone at <plant> will be able to read it, and it will no longer change." — then the Warning
  shows "Published on <date>", keeps the content it had at that moment (later changes to the event
  do not appear) and becomes readable as SC-3 says. It cannot be unpublished. Publishing raises no
  alert.
- **SC-8** **Safety communications**, a page of the event workspace (EL-1), lists the Safety Alerts
  and the published Safety Warnings of the context's plant, all pillars, newest first: each card
  shows Safety Alert or Safety Warning, the pillar, the level, the record number, the date (review
  or publication) and the first line of the statement; opening one opens its document. Empty: "No
  safety communications yet.".
- **SC-9** Each document's page has a **Print** button that prints the document only (with the
  browser's print, which can also save it as PDF), and, for people who can open the event, a link
  back to it. Page titles: "Safety Alert — <record> — Event Reporting", "Safety Warning — <record> —
  Event Reporting".

### Changed

- **EL-1** "EVENT WORKSPACE" offers four pages — **Events**, **KPIs**, **Reports**, **Safety
  communications** ([safety communication](safety-communication.md) SC-8) — and **Create event**
  for those who can report. The first three show the events of the context (domain Visibility):
  submitted events plus the person's own drafts, never someone else's drafts. On phones the page
  names scroll sideways within their row. *(was: three pages)*
- **EL-17** *(the header card)* The header card also offers **Safety Alert** once it exists and
  **Safety Warning** to the plan owners for the draft, to everyone once published (SC-4 to SC-7).
  *(was: no links)*
- **Review Decisions**, **Root cause analysis Scope**, **Validation Scope**: "Safety Alert / Warning"
  leaves "Out of this version" and points to [safety communication](safety-communication.md).
- **Domain**: the Glossary adds **Safety Alert** ("an anonymised summary of a reviewed event for its
  plant") and **Safety Warning** ("the anonymised lessons of an analysed event, published by its plan
  owners for its plant"); the Capabilities table lists safety communication.

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`), in order.

1. **No communication yet** — Ana Ribeiro opens Safety communications at Lyon: "No safety
   communications yet.". (SC-8)
2. **Alert after review** — Carla Mendes reviews `TF-26-0003` as valid, Potential Severe × Medium
   term (SIP, type chosen), Actual Minor × Short term, "further analyze" No. *Then* its header card
   offers Safety Alert;
   the Alert reads "Safety Alert", `TF-26-0003`, Lyon, Health & Safety, "TF2 — Non-Lost Time
   Accident", Critical "SIP", "Potential severity" "50 — Very Critical (Severe × Medium term)", its
   statement, the immediate action "Area made safe and people informed · High", and Next steps
   "Actions"; no name appears (not Ana Ribeiro, Tom Baker or Carla Mendes). (SC-2, SC-4, EL-17)
3. **Plant-wide** — Carla reviews `EVE-26-0001` as valid. *Then* Diego Laurent (Lyon: Health &
   Safety, Industrial Risk) sees two Safety Alerts in Safety communications and opens the
   Environment one, without a link to the event; Felix Tanaka (Curitiba) sees "No safety
   communications yet.", and opening the Lyon Alert's address says "This safety communication is
   not available.". (SC-3, SC-8, SC-9)
4. **No document** — Carla archives `TF-26-0001` (Duplicated) and reviews `OH-26-0001` as valid:
   neither has a Safety Alert, and the list still shows two. (SC-1, SC-4)
5. **Alert follows the event** — On `TF-26-0002`, Carla, a Manager, attaches two photos while it is
   Open, then reviews it as valid, Potential Severe × Medium term (SIP), "further analyze" Yes,
   designating Diego. Diego, in the analysis, adds the immediate action "Edges taped" (Medium).
   *Then* the Alert of `TF-26-0002` lists both immediate actions and Next steps "Root cause
   analysis" (its Actions step is Optional). (SC-4)
6. **Warning draft** — Diego completes the analysis (one 6M cause, Methods › Inadequate procedure;
   one root cause with the corrective action "Deburr the sheet edges" for Ana; learnings "Sharp
   edges must be deburred before handling") and deploys the plan. *Then* Diego's header card offers Safety Warning, a draft
   with "Draft — only the plan owners see it until it is published.", the cause "Methods ›
   Inadequate procedure", the root cause, the learnings, the action with "On Going" and its due date
   and "3 actions · 2 completed · 0 overdue", and "Photos to include" with the two photos unticked.
   Ana sees no Safety Warning link and the list has no Warning. (SC-5, SC-6, EL-17)
7. **Publish** — Diego ticks one photo and publishes ("Publish this Safety Warning? Everyone at Lyon
   will be able to read it, and it will no longer change."). *Then* it shows "Published on
   <today>" and the photo; Lucas Weber and Eva Novak find it in Safety communications; no alert is
   raised. Diego then moves the action's due date: the Warning keeps the old date. (SC-3, SC-7)
8. **No analysis, no Warning** — Carla deploys the plan of `TF-26-0003` (Review and Actions, no
   analysis) without corrective actions: the event closes, its Alert's Next steps read "None — the
   event is closed.", and it has no Safety Warning. (SC-4, SC-5)
9. **Print** — The published Warning's Print opens the browser's print with the document only.
   (SC-9)
10. **Phone and keyboard** — At 320px the list and both documents are readable without sideways
    scrolling; Print, the photo choices and Publish work with the keyboard. (Domain)

## Out of scope

- The "Could it happen here?" card, PDF export (other than the browser's print), sending to a
  regional governance office and email.
- Industrial Hygiene documents; uploading new images into the Warning.
- Unpublishing or republishing a Warning; alerts about communications.
