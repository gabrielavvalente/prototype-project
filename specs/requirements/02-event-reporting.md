# 02 — Event reporting

A person with an event role reports an event in a few minutes, saving it as a draft when needed.
Submitting gives it a record number and its workflow, and alerts its reviewers and the plant's
Managers ([10 Alerts](10-alerts-and-notifications.md)).

Builds on: [00 Overview](00-overview.md) (pillars, event types, levels, SIP question, lifecycle,
workflow), [01 Roles and permissions](01-roles-and-permissions.md).

## Rules

### Who and where

- **ER-1** Users, Managers and Site Admins can report an event, for a plant of their access. The
  event belongs to the plant and pillar of the person's context unless they choose otherwise
  within their access.
- **ER-2** The report is made of five groups of information: **Classification**, **Location**,
  **General information**, **Event details** and **Immediate actions**. Nothing but the
  classification can be entered until the pillar, event type and level are chosen ("Choose the
  classification first.").

### Classification

- **ER-3** Pillar (taken from the context when the person works in one pillar), then event type
  (taken automatically when the pillar has only one), then level — each level with its
  description ([14](14-reference-catalogs.md)).
- **ER-4** For Safety and Environment events, right after the level, the SIP question of OV-6,
  required: "Could this be a SIP?" — "Serious Incident Potential: under slightly different
  circumstances, could this have caused a serious injury or serious harm?". Occupational Health and
  Industrial Risk events have none.
- **ER-5** A TF5 answered SIP = Yes becomes TF4, and the reporter is told why — whether the answer
  or the level is given last. Changing the pillar or event type clears the SIP answer; changing
  the level keeps it.

### Location

- **ER-6** The location is a path of the organization tree under the event's plant (OV-1). It can
  be found three ways: by typing part of any node's name (results show the full path; "No location
  matches — try browsing below"), by browsing one level at a time, or by scanning a **QR code**
  placed at a station, where the device can:
  - the QR code holds the identifier of a location node; a node deep enough for the event fills the
    location; a higher node opens browsing from there ("QR code read. Choose a deeper level below.");
  - otherwise: "This QR code is not a known location." or "This QR code belongs to another plant.";
  - no scanning on the device: "QR code scanning is not available in this browser. Search or browse
    the location instead."; camera refused: "The camera could not be opened. Allow camera access,
    or search or browse instead."
- **ER-7** Required: the full path down to the task and a task type (Routine, Non-routine) —
  except TF4, TF5, EvE4 and EvE5, which need only department and workshop (task type optional).

### General information

- **ER-8** Title (required, under 120 characters) and description (required, under 2,000
  characters). The description can be dictated (speech to text) where the device allows it.
- **ER-9** Photos and videos are optional, taken with the camera on mobile devices or chosen from
  files. Their number, size and formats are set by the platform (Q-6).
- **ER-10** The employee type (Employee, Temporary Worker, Permanent Contractor, Non-Permanent
  Contractor, Other) and the person involved — for Employee, a person of the plant; otherwise their
  name and "What was the person doing?" (optional). Required for TF1–TF3 (the employee type, and the
  person or their name); optional for every other level.
- **ER-11** For TF1–TF3: "What was the first aid treatment?", one or more of the first aid
  treatments ([14](14-reference-catalogs.md)); Other asks for a required description.

### Event details

- **ER-12** **Reporter**: the person reporting; a Manager or a Site Admin can choose another person
  of the plant instead (reporting on behalf of them).
- **ER-13** Report date (the day of reporting, not editable), event time (optional, never in the
  future), shift moment (Day, Night, Afternoon), recurrence ("Has this happened before?" Yes / No),
  **Shared with** (people of the event's plant who can see its pillar, any number: they are told
  "Event shared with you" and follow its archiving and closing, [10](10-alerts-and-notifications.md))
  and, for
  Occupational Health events, the diseases ([14](14-reference-catalogs.md); at least one).

### Immediate actions

- **ER-14** Optional, any number. Each has a description, a priority (Low, Medium, High, Urgent),
  optional comments and "Performed by" (1 to 5 people of the plant; no task or alert for them). Each
  is saved as **Completed**, with the event's report date as completion date and the event's pillar
  as category.

### Saving

- **ER-15** Once classified, a draft is saved automatically shortly after each change; when the
  automatic save fails the reporter is told: "Could not save automatically — use Save as draft".
  Submitted events are never saved automatically.
- **ER-16** **Save as draft** keeps the event as Draft: visible only to its author, no record number,
  nothing sent. Leaving with unsaved changes asks "Leave this form? You have changes that are not
  saved." — Save as draft, Discard changes, Stay.
- **ER-17** **Submit** with something missing saves nothing and reports each missing item, with
  "N required fields are missing.":
  "Choose a pillar." · "Choose an event type." · "Choose a level." · "Answer "Could this be a
  SIP?"." · "Choose the location down to the task." / "Choose at least the department and
  workshop." · "Choose a task type." · "Enter a title." · "Describe what happened." · "Choose the
  employee type." · "Choose the person involved." / "Enter the name of the person involved." (TF1–TF3) ·
  "Choose at least one first aid treatment." · "Describe the other first aid treatment." · "The
  event time cannot be in the future." · "Choose the shift moment." · "Say whether this has
  happened before." · "Choose at least one disease." · "Complete immediate action N." (with
  "Describe the action.", "Choose a priority.", "Choose 1 to 5 people who did it.").
- **ER-18** A complete **Submit** gives the record number (OV-8), keeps the workflow in force
  (OV-10) and sets the status **Open** — or **Closed** when nothing besides Submission is required —
  and raises the submission alerts ([10](10-alerts-and-notifications.md)).
- **ER-19** After saving, the reporter is told: "Event <record> was submitted. Its reviewers and the
  Managers of this plant have been alerted." (adding "and closed right away (no other phase
  required)" when Closed, and offering to report another event) · "Your draft was saved. Only you
  can see it." · "Event <record> was updated."

### Correcting

- **ER-20** The author reopens their draft, continues and submits it, or **deletes** it after
  confirming ("Delete this draft? It cannot be recovered."). Nobody else can delete a draft, and a
  submitted event is never deleted.
- **ER-21** A Manager or a Site Admin who can see the event corrects an **Open** event with the
  same rules as reporting (no draft, no automatic save). The record number, the status and the
  workflow taken at submission do not change, even if the level does; nobody is alerted.
- **ER-22** Once reviewed (In Progress, Archived, Closed), only the plant's **Site Admins** can
  correct the report, as long as the event is not locked (RP-8a); the change is recorded in the
  Record Historian ([07](07-record-historian.md)). Otherwise the review corrects what needs
  correcting.
- **ER-23** Every event records who created it and when, and who last changed it and when (OV-13).

## Decisions

| Topic | Decision |
|---|---|
| Photos and videos | Optional for every level (a source required them for TF1–TF3) |
| Immediate actions | Optional for every level, always Completed (a source required them for TF1–TF3 and SRE1–SRE3) |
| Location for TF4, TF5, EvE4, EvE5 | Department and workshop only *(the prototype: TF4 and TF5)* |
| Employee type and person involved | Required for TF1–TF3 only *(the prototype: every level)* |
| Attachments | Optional; limits set by the platform, not by these requirements |
| Question at reporting | The SIP question only, for Safety and Environment events |
| Deleting a draft | Its author can *(the prototype: no)* |
| First aid treatments | A starting list, to be replaced by the official one |
| Who reports | Users, Managers and Site Admins; Managers and Site Admins can report on behalf of someone else *(the prototype: no reporting by Site Admins)* |
| Correcting after the review | Site Admins of the plant, unless locked *(the prototype: nobody)* |

## Examples

1. **Given** a User of plant A, **when** they report a TF4 (Near Miss) with SIP No, the department
   and workshop, a title, a description, the shift moment and the recurrence (no employee type),
   **then** the event is submitted with a record number `TF-<YY>-<NNNN>`,
   status Open, and its reviewers and plant A's Managers are alerted. (ER-1, ER-7, ER-18)
2. **Given** a reporter choosing TF5 and answering SIP Yes, **then** the level becomes TF4 and they
   are told why. (ER-5)
3. **Given** a TF2 report without location, **when** it is submitted, **then** nothing is saved and
   "Choose the location down to the task." and "Choose a task type." are reported, with "N required
   fields are missing.". (ER-7, ER-17)
4. **Given** an EvE5 event, **then** the department and workshop are enough as location; **given** a
   TF2, the employee type and the person involved are required. (ER-7, ER-10)
5. **Given** a QR code of a station of plant B scanned while reporting for plant A, **then** "This QR
   code belongs to another plant." and the location stays empty. (ER-6)
6. **Given** a Manager of plant A, **when** they report on behalf of a User of plant A, **then** that
   User is the reporter. (ER-12)
7. **Given** an Occupational Health or an Industrial Risk event, **then** no SIP question is asked;
   an Occupational Health event requires at least one disease. (ER-4, ER-13)
8. **Given** a draft, **then** only its author sees it, it has no record number and no alert is
   sent; the author continues it later and submits it, or deletes it after confirming. (ER-16, ER-20)
9. **Given** an Open event, **when** a Manager of its plant changes its level, **then** its record
   number, status and workflow stay the same and nobody is alerted. **Given** the same event In
   Progress, **then** only a Site Admin of its plant can still correct it. (ER-21, ER-22)
10. **Given** a TF5 event in a workflow requiring nothing besides Submission, **when** it is
    submitted, **then** it is Closed at once. (ER-18)
