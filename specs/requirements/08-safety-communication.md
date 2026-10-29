# 08 — Safety communication

Two anonymised documents tell a plant about its events: the **Safety Alert**, as soon as an event
is reviewed, and the **Safety Warning**, with the lessons of its analysis, published by its action
plan owners.

Builds on: [00 Overview](00-overview.md), [01 Roles and permissions](01-roles-and-permissions.md),
[03 Event review](03-event-review.md), [04 Root cause analysis](04-root-cause-analysis.md),
[05 Action plan](05-action-plan.md).

## Rules

### The documents

- **SC-1** Events of type Safety, Environment and Industrial Risk have a Safety Alert and a Safety
  Warning; Occupational Health events have neither (Q-14).
- **SC-2** **No names**: neither document shows the reporter, the person involved, the reviewer, the
  analysts, the action plan owners or the assignees, nor the event's title and description (written
  by the reporter): the event is told through its statement.
- **SC-3** **Who reads them**: everyone with an event role whose access includes the event's plant,
  whatever their pillars — also people who cannot open the event itself. A document of another
  plant is not available to them ("This safety communication is not available.").
- **SC-4** The **Safety Alert** exists once the event's review is completed as valid (never for an
  archived event). It always shows the event's current content:

  | Part | Content |
  |---|---|
  | Header | "Safety Alert", record number, plant, pillar, level (code — name), event date |
  | Critical | The review's critical flags (SIP, HCI, HCL, SPL), or "No" |
  | Severity | Safety: "Potential severity" and "Actual severity", each "<score> — <band> (<impact> × <duration>)"; Environment: "Is this event a SIP?" Yes / No; Industrial Risk: "Is this event an HCL?" or "Is this event an SPL?" Yes / No |
  | What happened | The event statement |
  | What was done | Each immediate action: description · priority |
  | Next steps | The required steps not done yet (e.g. "Root cause analysis · Actions · Validation"), or "None — the event is closed." |

- **SC-5** The **Safety Warning** exists once the event's root cause analysis is completed and its
  action plan deployed — no analysis, no Warning. Until published it is a **draft**, seen only by
  the action plan owners and the plant's Site Admins ("Draft — only the plan owners see it until it
  is published."). It holds the Alert's header, Critical, Severity, What happened and What was done
  (not its Next steps), the photos chosen (SC-6), then:

  | Part | Content |
  |---|---|
  | Contributory causes | Each 6M cause chosen: theme › cause, and how it contributed |
  | Root causes | The answer of each why marked Root cause |
  | Corrective actions | Each: description · status · due date; then "<n> actions · <n> completed · <n> overdue" |
  | Key learnings | The analysis's learnings (always the last part) |

### Publishing

- **SC-6** In the draft, the action plan owners choose which of the event's photos the Warning shows
  ("Choose photos that show no one's face or name."); none is chosen at first; videos are not
  offered. The Alert shows no photo.
- **SC-7** **Publish Safety Warning** (action plan owners and the plant's Site Admins, draft only)
  asks "Publish this Safety Warning? Everyone at <plant> will be able to read it, and it will no
  longer change." — then the Warning shows "Published on <date>", keeps the content it had at that
  moment (later changes to the event do not appear) and becomes readable as SC-3 says. It cannot be
  unpublished (Q-14). Publishing raises no alert.

### Reading

- **SC-8** **Safety communications** lists the Safety Alerts and the published Safety Warnings of the
  context's plant, all pillars, newest first, each with its kind, pillar, level, record number, date
  (review or publication) and the first line of the statement. Empty: "No safety communications
  yet.". A published Warning also shows the plants it was shared with, and offers sharing to those
  who may share it ([09](09-sharing-hub.md) SH-1).
- **SC-9** Each document can be printed on its own (or saved as PDF through printing); people who
  can open the event can go to it from the document.
- **SC-10** On an event, both documents are listed with their state; an available one opens from the
  event:

  | Document | State | Can be opened |
  |---|---|---|
  | Safety Alert | "Available" | yes |
  | Safety Alert | "After the review" · "Not for an archived event" · "Not for Occupational Health" | no |
  | Safety Warning | "Published" | yes |
  | Safety Warning | "Draft — ready to publish" (action plan owners, Site Admins) | yes |
  | Safety Warning | "Being prepared by the plan owners" (everyone else, during the draft) | no |
  | Safety Warning | "After the analysis and the action plan" · "Only after a root cause analysis" (reviewed, no analysis) · "Not for an archived event" · "Not for Occupational Health" | no |

## Decisions

| Topic | Decision |
|---|---|
| When the Alert exists | When the review is completed as valid |
| Who reads the documents | Everyone with an event role whose access includes the event's plant, whatever their pillars |
| The Alert over time | Always the event's current content |
| When the Warning exists | A draft once the analysis is completed and the action plan deployed; no analysis, no Warning |
| Publishing | By the action plan owners (and the plant's Site Admins); then frozen and readable by the plant |
| Names | None on either document |
| Photos | The owners choose which photos the Warning shows; the Alert shows none |
| Warning content | No Next steps; the key learnings close the document |
| Export | Printing (which can save as PDF); another export is Q-14 |
| Alerts | Publishing raises none |
| Free texts | Statement, actions, causes and learnings are shown as written; the owners check them before publishing |

## Examples

1. **Given** a TF2 event reviewed as valid with potential 50 and actual 5, **then** its Safety Alert
   reads Critical "SIP", "Potential severity 50 — Very Critical (Severe × Medium term)", "Actual
   severity 5 — Moderate (Minor × Short term)", its statement, its immediate actions and Next steps
   "Root cause analysis · Actions", and no name. (SC-2, SC-4)
2. **Given** a person of plant A without the event's pillar, **then** they read the Alert but cannot
   open the event; a person of plant B cannot read it. (SC-3)
3. **Given** a TF3 whose analysis is completed and plan deployed, **then** the Warning is a draft seen
   only by its owners (and the plant's Site Admins); after publishing it, everyone at the plant reads
   it, and later changes to the event do not change it. (SC-5, SC-7)
4. **Given** an archived event or an Occupational Health event, **then** it has no Safety Alert.
   (SC-1, SC-4, SC-10)
5. **Given** a reviewed event with no root cause analysis, **then** its Warning shows "Only after a
   root cause analysis". (SC-10)
