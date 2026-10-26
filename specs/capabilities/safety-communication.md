# Capability: Safety communication

**Product**: Event Reporting (the Safety communications page, the Safety Alert and Safety Warning pages)
**Builds on**: [domain](../domain.md) (roles, Visibility), [event review](event-review.md), [root cause analysis](root-cause-analysis.md), [action plan](action-plan.md), [event library](event-library.md)
**Status**: built

A reviewed event becomes a lesson for its whole plant: the Safety Alert says what happened and what
was done, the Safety Warning shares what the analysis found and what is changing — without naming
anyone.

## Scope

- **In**: the Safety Alert and the Safety Warning of Health & Safety, Environment and Industrial
  Risk events, their content and readers, the Warning's photos and publication, the Safety
  communications page, printing.
- **Out**: the "Could it happen here?" card, PDF export other than the browser's print, sending to
  a regional governance office and email; Industrial Hygiene documents; uploading new images;
  unpublishing or republishing; alerts about communications.

## Rules

### The documents

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
  | Severity | Health & Safety: "Potential severity" and "Actual severity" of the review, each a badge "<score> — <band>" in its band's color (Moderate green, Critical amber, Very Critical red, as in the review's matrix) followed by "(<impact> × <duration>)"; Environment: "Is this event a SIP?" Yes / No; Industrial Risk: "Is this event an HCL?" or "Is this event an SPL?" Yes / No |
  | What happened | The event statement |
  | What was done | Each immediate action: description · priority |
  | Next steps | The event's required steps not done yet ("Root cause analysis · Actions · Validation"), or "None — the event is closed." |

- **SC-5** The **Safety Warning** exists once the event's root cause analysis is completed and its
  action plan deployed. Until it is published it is a **draft** that only the plan owners see,
  with "Draft — only the plan owners see it until it is published."; it shows the Alert's header,
  Critical, Severity, What happened and What was done — not its Next steps — with the photos
  chosen (SC-6) next to the header (below it on phones), then, in this order:

  | Part | Content |
  |---|---|
  | Contributory causes | Each 6M cause ticked: theme › cause, and how it contributed |
  | Root causes | The answer of each why marked Root cause |
  | Corrective actions | Each: description · status · due date; then "<n> actions · <n> completed · <n> overdue" |
  | Key learnings | The analysis's learnings (always the last part) |


### Publishing

- **SC-6** In the draft, the plan owners tick the event's photos to include ("Photos to include",
  with "Choose photos that show no one's face or name."); none is ticked at first; videos are not
  offered.
- **SC-7** **Publish Safety Warning** (plan owners, draft only) asks "Publish this Safety Warning?
  Everyone at <plant> will be able to read it, and it will no longer change." — then the Warning
  shows "Published on <date>", keeps the content it had at that moment (later changes to the event
  do not appear) and becomes readable as SC-3 says. It cannot be unpublished. Publishing raises no
  alert.

### Reading

- **SC-8** **Safety communications**, a page of the event workspace (EL-1), lists the Safety Alerts
  and the published Safety Warnings of the context's plant, all pillars, newest first: each card
  shows Safety Alert or Safety Warning, the pillar, the level, the record number, the date (review
  or publication) and the first line of the statement; opening one opens its document. Empty: "No
  safety communications yet.".
- **SC-9** Each document's page has a **Print** button that prints the document only (with the
  browser's print, which can also save it as PDF), and, for people who can open the event, a link
  back to it. Page titles: "Safety Alert — <record> — Event Reporting", "Safety Warning — <record> —
  Event Reporting".
- **SC-10** On the event's page, the steps menu ends with a **Communications** section: **Safety
  Alert** and **Safety Warning**, each with its state. An available one opens inside the event page,
  beside the menu, like a step (its document and, for the Warning draft, the photos and Publish);
  one that is not available is greyed and cannot be opened:

  | Document | State shown | Opens |
  |---|---|---|
  | Safety Alert | "Available" | yes |
  | Safety Alert | "After the review" — or "Not for an archived event", "Not for Industrial Hygiene" | no |
  | Safety Warning | "Published" | yes |
  | Safety Warning | "Draft — ready to publish" (plan owners) | yes |
  | Safety Warning | "Being prepared by the plan owners" (everyone else, during the draft) | no |
  | Safety Warning | "After the analysis and the action plan" — or "Only after a root cause analysis" (the review is done and the event has no analysis), "Not for an archived event", "Not for Industrial Hygiene" | no |

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), in order.

1. **No communication yet** — Ana Ribeiro opens Safety communications at Lyon: "No safety
   communications yet.". On `TF-26-0003`, the steps menu shows Communications with Safety Alert
   greyed, "After the review", and Safety Warning greyed, "After the analysis and the action
   plan"; neither opens. (SC-8, SC-10)
2. **Alert after review** — Carla Mendes reviews `TF-26-0003` as valid, Potential Severe × Medium
   term (SIP, type chosen), Actual Minor × Short term, "further analyze" No. *Then* its steps menu
   shows Communications with Safety Alert "Available" and Safety Warning greyed, "Only after a root
   cause analysis"; opening the Alert there reads "Safety Alert", `TF-26-0003`, Lyon, Health & Safety, "TF2 — Non-Lost Time
   Accident", Critical "SIP", "Potential severity" with the red badge "50 — Very Critical" and
   "(Severe × Medium term)", "Actual severity" with the green badge "5 — Moderate", its
   statement, the immediate action "Area made safe and people informed · High", and Next steps
   "Actions"; no name appears (not Ana Ribeiro, Tom Baker or Carla Mendes). (SC-2, SC-4, SC-10,
   EL-17)
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
   edges must be deburred before handling") and deploys the plan. *Then* Diego's steps menu shows
   Safety Warning "Draft — ready to publish"; it opens a draft
   with "Draft — only the plan owners see it until it is published.", the red badge "50 — Very
   Critical" and the green "2 — Moderate", no Next steps, the cause "Methods › Inadequate
   procedure", the root cause, the action with "On Going" and its due date and "3 actions · 2
   completed · 0 overdue", and last the learnings; below, "Photos to include" with the two photos
   unticked.
   Ana's menu shows Safety Warning greyed, "Being prepared by the plan owners", and the list has
   no Warning. (SC-5, SC-6, SC-10)
7. **Publish** — Diego ticks one photo and publishes ("Publish this Safety Warning? Everyone at Lyon
   will be able to read it, and it will no longer change."). *Then* it shows "Published on
   <today>" and the photo next to its header; Ana's menu now shows Safety Warning "Published"; Lucas Weber and Eva
   Novak find it in Safety communications; no alert is raised. Diego then moves the action's due
   date: the Warning keeps the old date. (SC-3, SC-7, SC-10)
8. **No analysis, no Warning** — Carla deploys the plan of `TF-26-0003` (Review and Actions, no
   analysis) without corrective actions: the event closes, its Alert's Next steps read "None — the
   event is closed.", and it has no Safety Warning. (SC-4, SC-5)
9. **Print** — The published Warning's Print opens the browser's print with the document only.
   (SC-9)
10. **Phone and keyboard** — At 320px the list and both documents are readable without sideways
    scrolling; Print, the photo choices and Publish work with the keyboard. (Domain)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| When the Alert exists | When the review is completed as valid | Safety Communication FR-1 (Initial Review save) vs Safety FR-21 / Environment FR-27 (statement and immediate actions complete in the analysis) |
| Who reads the Alert | Everyone with an event role whose access includes the event's plant, whatever their pillars | Safety Communication ("workers learn about a hazard on their site") |
| The Alert's content over time | Always the event's current content | Safety Communication FR-2 (refreshes) |
| When the Warning exists | A draft once the root cause analysis is completed and the action plan deployed; no analysis, no Warning | Safety Communication FR-5 vs Safety FR-27 (at closure) and FR-28 |
| Publishing the Warning | The plan owners publish it; it is then frozen and readable by everyone with an event role whose access includes the event's plant | Safety Communication FR-7 (Owner publishes, sent to a regional office) |
| Names | None on either document: no reporter, person involved, reviewer, analysts or assignees | Safety Communication FR-4 vs Safety table ("Investigator(s)") |
| Photos | The plan owners choose which of the event's photos the Warning shows, next to its header; the Alert shows none | Safety Communication FR-6, FR-10 (images in the Warning); Safety table (photos in both); user (review remark) |
| Warning layout | No Next steps; the key learnings close the document | User (review remark) |
| Severity display | A badge in the band's color for each rating | User (review remark) |
| Print | A Print button (the browser's print, which can also save as PDF) | Safety Communication US-COMM-04 (PDF export, deferred) |
| Pillars | Health & Safety, Environment, Industrial Risk; not Industrial Hygiene | Safety Communication (common template SAF, ENV, IR) |
| Alerts | Publishing raises no alert | Safety Communication FR-7 (email to the regional office) |
| Free texts | Statement, actions, causes and learnings are shown as written; the owners check them before publishing | The review already refuses the reporter's name in the statement (RV-11) |
| On the event | A Communications section of the steps menu, each document Available or greyed with when it will be; it opens inside the event page | User (review remark) |
