# 00 — Overview and glossary

The vocabulary, the main entities and the rules every other file builds on.

## Products

The platform has two products sharing one organization, one set of people and one set of
reference data: a change made in one is seen by the other at once. People, their roles, layers and
groups come from a user management tool built separately by the development team; what the two
products need from it is in [Roles and permissions](01-roles-and-permissions.md).

| Product | Purpose | Who uses it |
|---|---|---|
| **Event Reporting** | Report EHS events and follow each one through its workflow (review, root cause analysis, actions, validation), with its safety communications | Everyone with an event role |
| **Control Panel** | Configure, per pillar, the workflow each event follows and the master data lists used to classify events; manage the alert settings of a plant | People with a Control Panel role (and Site Admins for their plants' alerts) |

## Glossary

| Term | Meaning |
|---|---|
| **Event** | Something that happened, or could have happened, at a plant and must be recorded: an accident, a near miss, an environmental release, a hazardous situation, an occupational disease. |
| **Pillar** | The EHS domain of an event: Health & Safety, Environment, Industrial Risk. Roles, access, workflow settings and master data are per pillar. |
| **Event type (family)** | The classification scheme of events. Health & Safety has two — Safety (TF) and Occupational Health (OH) — the other pillars one each. The reporter chooses the event type; in the Control Panel both belong to Health & Safety. |
| **Level** | The class of an event within its event type, from most to least severe (e.g. TF1 Lost Time Accident … TF5 Hazardous Situation). Occupational Health uses disease types instead. |
| **Plant** | A site. Every event belongs to one plant; every plant belongs to one business. |
| **Perimeter** | The plants and pillars a person acts for. |
| **Context** | In Event Reporting, the business, plant and pillar (or all the person's pillars) the person is working in. |
| **Phase / step** | A stage of an event's workflow: Submission, Review, Root cause analysis, Actions, Validation — "phase" when configuring, "step" on an event. |
| **Required** | A phase an event must go through. A phase that is not required is skipped. |
| **Reviewer** | A person allowed to review a given event (OV-9). |
| **Designated people** | The users and investigation groups chosen to perform an event's root cause analysis. |
| **Investigation group** | A named set of people covering some pillars and plants, who can be designated together. |
| **Critical event** | An event the review flags SIP, HCI, SPL or HCL (OV-11). |
| **SIP** | Serious Incident Potential: under slightly different circumstances, the event could have caused a serious injury or serious harm. |
| **HCI** | High Consequence Injury: a Health & Safety event whose actual severity is Very Critical. |
| **HCL** | High Consequence Loss: an Industrial Risk event with real, actual consequences — a major loss for the Group. |
| **SPL** | Serious Potential Loss: an Industrial Risk near miss or moderate event whose potential severity is a weak signal before a major loss. |
| **Immediate action** | Something done at the scene right away to make the situation safe; recorded with the event, always completed. |
| **Action plan** | One per event: its immediate actions and its corrective actions. |
| **Corrective action** | An action of the plan with assignees, a due date, a priority and a status. |
| **Action plan owners** | The people who prepare and deploy an event's action plan. |
| **Validator** | The person who decides whether a completed action plan was effective and the event can close. |
| **Rework** | A validator reopening a closed event so that more actions are taken. |
| **Locked** | An event closed by its validation: nothing of it changes until a rework. |
| **Master data** | Pillar-specific reference lists used to classify events (Standards, Hazards, Body Parts, Injuries, Diseases, Aspects, Impacts, Industrial Risk Categories). |
| **Central / Cluster / Local** | The three levels of Control Panel roles: all plants / two or more plants / one plant. |
| **Safety Alert** | An anonymised summary of a reviewed event, readable by everyone at its plant. |
| **Safety Warning** | The anonymised lessons of an analysed event, published by its action plan owners for its plant. |
| **Sharing Hub** | Where a plant receives the Safety Warnings other plants shared with it, and checks whether the same could happen there. |
| **Record Historian** | The log of every change made to an event after its review. |
| **Alert** | An Event Reporting message telling a person about an event that concerns them. |
| **Notification** | A Control Panel message telling a person that someone changed a setting they made. |
| **Audit trail** | The record of every Control Panel change: who, when, scope, before → after. |

## Main entities

| Entity | Holds |
|---|---|
| Business, Plant, location nodes | The organization tree (OV-1) |
| Pillar, Event type, Level | The classification of events (OV-4) |
| Person | Event role and access, Control Panel roles, group memberships — from the user management tool ([01](01-roles-and-permissions.md)) |
| Investigation group | Name, pillars, plants, members — from the user management tool |
| Event | Its report, the workflow it took at submission, its review, root cause analysis, action plan, validations, safety communications, history and Record Historian |
| Action | Immediate or corrective; on a corrective one, assignees, due date (and its changes), priority, status |
| Workflow setting | A Control Panel level requiring a phase for a pillar, level and plants; the reviewers a level chose |
| Master data list and value | Values with code, name, owner, status; deactivations per scope |
| Alert, notification setting, submission rule | Who is told what (file 10) |
| Shared package, local check | A Safety Warning shared to plants and each plant's check (file 09) |
| Audit entry, Control Panel notification | Control Panel changes |

## Rules

### Organization

- **OV-1** The organization is a tree: Business › Plant › Department › Workshop › Job › Workstation
  › Task. A plant has a type, a country and a region. An event's location is a path in this tree
  under the event's plant; each node belongs to its parent.
- **OV-2** Event Reporting always works within a context: one business, one plant, and one pillar
  or all the person's pillars at that plant. Lists, searches and indicators show only events of the
  context. The last context is remembered for each person.
- **OV-3** Each person chooses the language of the interface with a **language selector**; English
  is the default. The languages offered are an open question (Q-9). Dates read "25 Oct 2026"; times
  use 24 hours.

### Pillars, families and levels

- **OV-4** The pillars, their event types and levels:

  | Pillar | Event type | Levels (most to least severe) |
  |---|---|---|
  | Health & Safety | TF (Safety) | TF1 Lost Time Accident · TF2 Non-Lost Time Accident · TF3 First Aid · TF4 Near Miss · TF5 Hazardous Situation |
  | Health & Safety | OH (Occupational Health) | By disease type: Respiratory disease · Skin disease · Musculoskeletal disorder · Hearing loss |
  | Environment | EVE (Environment) | EvE1 Major environmental accident · EvE2 Environmental accident · EvE3 Minor environmental accident · EvE4 Near-accident · EvE5 Poor environmental situation |
  | Industrial Risk | SRE (Industrial Risk) | SRE1 Major site risk accident · SRE2 Significant site risk accident · SRE3 Moderate site risk accident · SRE4 Site risk near accident · SRE5 Site risk hazardous acts or conditions |

  In Event Reporting, Safety and Occupational Health are two different event types, each with its
  own form, record numbers and assessment; in the Control Panel they are the same pillar: one set
  of roles, one master data, and one workflow grid holding the TF levels and the OH disease types.

- **OV-5** Each level has a one-sentence plain-language description, shown when the reporter
  chooses it (the texts are in [Reference catalogs](14-reference-catalogs.md)).
- **OV-6** The reporter of a Safety (TF) or Environment event answers "Could this be a SIP?"
  ([02](02-event-reporting.md) ER-4). The answer is recorded as the reporter's view and never
  makes the event critical; a TF5 answered Yes becomes TF4, and the reporter is told. Occupational
  Health and Industrial Risk events have no such question.

### Event lifecycle

- **OV-7** Statuses:

  ```text
  Draft ──submit──► Open ──a reviewer takes the review──► In Progress ──► … ──► Closed
    │                                 │                                          │
    │                                 └──review: not valid──► Archived           └─rework─► In Progress
    └──submit, nothing required besides Submission──► Closed
  ```

  | Status | Meaning |
  |---|---|
  | Draft | Being written; no record number; only its author sees and edits it. |
  | Open | Submitted, waiting for its first required step (normally Review); Managers of its plant and pillar may still correct it. |
  | In Progress | Being reviewed, or reviewed as valid and going through its required steps. |
  | Archived | Reviewed as not valid, with a reason. Final. Hidden from lists unless asked for. |
  | Closed | Every required step is done. Locked when closed by its validation (only a rework reopens it). |

- **OV-8** **Record number**: given at submission, `<EVENT TYPE>-<YY>-<NNNN>` (e.g. `TF-26-0003`,
  `OH-26-0001`), numbered per event type and year, never reused. A draft has none.

### Workflow

- **OV-9** For each pillar, level and phase (Submission is always required), a Control Panel level
  may make the phase **Required** for its plants ([Workflow settings](11-workflow-settings.md)); a
  phase nobody requires is skipped. Each level also chooses the reviewers for its plants; an
  event's reviewers are everyone chosen at every level covering its plant who can see its plant
  and pillar.
- **OV-10** At submission an event keeps a copy of the workflow in force for its plant, pillar and
  level — the required phases, the reviewers, and the phases its critical row adds if the review
  flags it. Later configuration changes never affect existing events.
- **OV-10a** The steps of an event are derived, never stored: a step is required when its workflow
  requires it (its level's, or its critical row's once the review flags it critical), when someone
  started an optional analysis, or — for Actions — as soon as the plan has a corrective action. The
  **current step** is the first required step not done; completing a step moves the event to the
  next, or closes it when none is left. A step not required can still be offered as optional
  (Actions while the event is active; a root cause analysis after a valid review).

### Critical events

- **OV-11** Only the review can flag an event critical:

  | Flag | Pillar | Raised when |
  |---|---|---|
  | SIP | Safety (TF) | The potential severity is Very Critical |
  | HCI | Safety (TF) | The actual severity is Very Critical |
  | SIP | Environment | The reviewer answers Yes to "Is this event a SIP?" |
  | HCL | Industrial Risk SRE1–SRE3 | The reviewer answers Yes to "Is this event an HCL?" |
  | SPL | Industrial Risk SRE4–SRE5 | The reviewer answers Yes to "Is this event an SPL?" |

  Very Critical is a score of 50 or more on the injury matrix (Critical 20–49, Moderate 2–19). A
  SIP needs a type. Before its review no event is critical, whatever the reporter answered.
  Critical events are marked as such wherever they appear.

### Master data

- **OV-12** Master data lists belong to a pillar. A value is owned by Central or by a Cluster (for
  its plants) and is Active, Inactive or Retired (final). It is **available at a plant** when it is
  Active, owned by Central or by a Cluster covering the plant, and not deactivated there by Central,
  a covering Cluster or the plant's Local; a Body Part also needs its category available.
  Classifying an event offers only the values available at its plant.

### Changes and traceability

- **OV-13** Every event records who created it and when, and who last changed it and when; its
  history lists the main steps (created, submitted, reviewed, analysed, plan deployed, validated,
  reworked, …) with who and when.
- **OV-14** Every Control Panel change is saved together with its audit entry, never one without
  the other.
- **OV-15** When saving or completing something is refused, nothing is saved and each problem is
  reported against the information it concerns, with the message given by the rule.

## Decisions

| Topic | Decision |
|---|---|
| Who reviews | The reviewers chosen in the Control Panel and kept on the event at submission |
| Statuses | Draft, Open, In Progress, Archived, Closed; a validator's rework reopens a locked event |
| Language | A language selector, English by default *(the prototype: English only)* |
| Health & Safety | One pillar holding two event types, Safety (TF) and Occupational Health (OH) *(the prototype had a separate Industrial Hygiene pillar for OH)* |
| People and roles | Maintained in a user management tool built by the development team, outside this specification |
