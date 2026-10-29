# Domain: EHS event management

The shared vocabulary, entities and rules that every capability spec builds on. It describes the
product as it behaves **now**, with no technology, no file names and no history. A capability spec
refers to these terms instead of redefining them; when a rule here changes, this file is updated in
place.

## Products

| Product | Purpose | Who uses it |
|---|---|---|
| **Event Reporting** | Report EHS events, follow them through their workflow (review, root cause analysis, actions, validation) | Everyone with an event role |
| **Control Panel** | Configure, per pillar, which workflow phases are required and the master data lists | People with a Control Panel role |
| **User Management** | See the users and investigation groups within one's perimeter (read only) | People with a Control Panel role |

The three products share the same organization, people and reference data (one platform). A change
made in one product is seen by the others.

## Glossary

| Term | Meaning |
|---|---|
| **Event** | Something that happened (or could happen) at a plant and must be recorded: an accident, a near miss, an environmental release, a hazardous situation… |
| **Pillar** | The EHS domain of an event: Health & Safety, Environment, Industrial Risk, Industrial Hygiene. |
| **Family** | The event classification scheme of a pillar (one family per pillar). |
| **Level** | The class of an event within its family (e.g. TF1 Lost Time Accident … TF5 Hazardous Situation). |
| **Plant** | A site; every event belongs to one plant. Plants belong to a business. |
| **Perimeter** | The plants (and pillars) a person acts for. |
| **Phase / step** | A stage of an event's workflow: Submission, Review, Root cause analysis, Actions, Validation. "Phase" when configuring, "step" on an event. |
| **Required** | A phase the event must go through. Phases that are not required are skipped. |
| **Reviewer** | A person allowed to review an event (configured per pillar, level and scope). |
| **Designated people** | The users and investigation groups chosen in the review to perform the root cause analysis. |
| **Investigation group** | A named set of people covering some pillars and plants, who can be designated together. |
| **Critical event** | An event flagged SIP, HCI, SPL or HCL by its review (see Critical events). |
| **HCI** | High Consequence Injury: a Health & Safety event whose actual severity is Very Critical. |
| **HCL** | High Consequence Loss: an Industrial Risk event with real, actual consequences (a major loss for the Group). |
| **SPL** | Serious Potential Loss: an Industrial Risk near miss or moderate event whose potential severity is serious (a weak signal before a major loss). |
| **Immediate action** | Something done at the scene right away to make the situation safe; recorded with the event, always completed. |
| **Action plan** | One per event: all its actions — the immediate actions and the corrective actions. |
| **Corrective action** | An action of the plan with assignees, a due date, a priority and a status (Planned, On Going, To Complete, Completed, Cancelled). |
| **Validator** | The person who checks that the completed action plan was effective: the reviewer. |
| **Master data** | Pillar-specific reference lists (Standards, Hazards, Body Parts, Injuries, Aspects, Impacts, Industrial Risk Categories) used to classify events. |
| **Central / Cluster / Local** | The three levels of Control Panel roles: all plants / two or more plants / one plant. |
| **Safety Alert** | An anonymised summary of a reviewed event for its plant. |
| **Safety Warning** | The anonymised lessons of an analysed event, published by its plan owners for its plant. |
| **Locked** | An event closed by its validation: read-only until a validator sends it back for rework. |
| **Record Historian** | The log of every change made to an event after its review. |
| **Sharing Hub** | Where a plant receives the Safety Warnings other plants shared with it, and checks whether they could happen there. |

## Organization

```text
Business ─► Plant ─► Department ─► Workshop ─► Job ─► Workstation ─► Task
```

- A plant has a type (with an icon), a country (with a flag) and a region.
- An event's location is a path in this tree under the event's plant; each node must belong to its
  parent.

## Pillars, families and levels

| Pillar | Family | Levels (most to least severe) |
|---|---|---|
| Health & Safety | TF (Safety) | TF1 Lost Time Accident · TF2 Non-Lost Time Accident · TF3 First Aid · TF4 Near Miss · TF5 Hazardous Situation |
| Environment | EVE (Environment) | EvE1 Major environmental accident · EvE2 Environmental accident · EvE3 Minor environmental accident · EvE4 Near-accident · EvE5 Poor environmental situation |
| Industrial Risk | SRE (Industrial Risk) | SRE1 Major site risk accident · SRE2 Significant site risk accident · SRE3 Moderate site risk accident · SRE4 Site risk near accident · SRE5 Site risk hazardous acts or conditions |
| Industrial Hygiene | OH (Occupational Health) | By disease type instead of levels: Respiratory disease · Skin disease · Musculoskeletal disorder · Hearing loss |

Each level has a one-sentence plain-language description shown when choosing it.

**Risk question at reporting**: Health & Safety (Safety) and Environment events ask "Could this be a
SIP?" — recorded as the reporter's view, it never makes the event critical; a TF5 answered Yes
becomes TF4 (with a warning). Industrial Risk and Industrial Hygiene events ask none.

## People and roles

A person has, independently:

1. **An event role** (or none) with an **access list**: for each plant, the pillars they may see.

   | Event role | Can |
   |---|---|
   | User | Report events, see the events of their access, receive alerts. |
   | Manager | As User, plus: edit Open events of their plant and pillars, report on behalf of someone else, receive "Event submitted" alerts, be a reviewer. |
   | Site Admin | The highest access on the events of their plants, every pillar: as Manager, plus correct an event at any status and act on any step of any event — take over a review, the analysis, the action plan and any action, validation, rework, the Safety Warning — without being its reviewer, designated, owner, assignee or validator; never on a locked event (a rework first). Manage the notifications of their plants (Control Panel). |

2. **Control Panel roles**: at most one per pillar, each Central (all plants), Cluster (two or more
   plants) or Local (one plant). A Site Admin automatically holds a Local role for every pillar
   they see at their plant (unless they already hold a role on that pillar).

3. **Membership of investigation groups** (any number).

A person with no event role does not appear in Event Reporting; a person with no Control Panel role
cannot open the Control Panel or User Management.

## Visibility

| What | Who sees it |
|---|---|
| A submitted event | People whose access includes the event's plant **and** pillar; the Site Admins of its plant, whatever its pillar. |
| A draft event | Only the person who created it. |
| A user (User Management) | Central (on any pillar): everyone. Others: users linked, by event access or by Control Panel role, to a plant of one of the viewer's Control Panel roles. |
| An investigation group | Central: all. Others: groups covering a plant of one of the viewer's Control Panel roles. |

Event Reporting always works within a **context**: one business, one plant and either one pillar
or all of the person's pillars at that plant. Lists, searches and KPIs show only events of the
context.

## Event lifecycle

```text
Draft ──submit──► Open ──a reviewer takes the review──► In Progress ──► … ──► Closed
  │                                 │
  │                                 └──review: not valid──► Archived
  └──submit, nothing required besides Submission──► Closed
```

| Status | Meaning |
|---|---|
| Draft | Being written; no record number; only its author sees and edits it. |
| Open | Submitted and waiting for its first required step (normally Review); Managers of its plant and pillar may still edit it. |
| In Progress | Reviewed as valid (or being reviewed) and going through its required steps. Not editable from the report form. |
| Archived | Reviewed as not valid (with a reason). Final. Hidden unless the Status filter asks for it. |
| Closed | Every required step is done. Final. |

- **Record number**: given at submission, `<FAMILY>-<YY>-<NNNN>`, e.g. `TF-26-0003`, numbered per
  family and year.
- An event is **Closed at submission** when its workflow requires nothing besides Submission.

## Workflow

**Configuring** ([workflow settings](capabilities/workflow-settings.md)). For each pillar, level
and phase (except Submission, always required), a Control Panel level may mark the phase
**Required** for its plants; nothing marked means Optional.

- A Central setting applies to every plant; a Cluster or Local setting to its plants.
- A phase is required for a plant when at least one applying setting requires it; a higher level
  (Central > Cluster > Local) requiring it locks it for the lower levels.
- A required Review has the reviewers (Managers or Site Admins) that every level — Central, Cluster,
  Local — chose for its plants, added together.
- Root cause analysis can be required only where Review is required too (Actions and Validation
  can be required without Review).

**On an event.** At submission the event takes a copy of its resulting workflow (required phases
and reviewers for its plant, pillar and level). Later Control Panel changes never affect existing
events.

**Steps** are derived, never stored:

- Required steps: Submission; each phase required by the event's workflow — its level's, and its
  critical row's once the review flags it critical; Root cause analysis also when someone started
  it on its optional step; Actions also as soon as the event's action plan has a corrective
  action.
- **Current step**: the first required step not yet done (none for Draft, Archived and Closed).
- Each step shows as done, current, upcoming (required, not reached), not required, or optional:
  an Actions step the workflow does not require, on an Open or In Progress event (opened by the
  plan's owners), and a Root cause analysis step nobody required after a valid review, on an In
  Progress or Closed event (opened by those who can start it, RCA-18). Done and current steps can
  be opened; the others cannot. For an Archived event, the required steps after
  Review stay upcoming.
- Completing a step moves the event to the next required step, or closes it when none is left.
  Validation is done when the last validation found the plan effective; a validation finding it
  not effective sends the event back to Actions.

## Critical events

A review can flag an event as critical:

| Flag | Pillar | Raised when |
|---|---|---|
| SIP | Health & Safety | Potential severity is Very Critical |
| HCI | Health & Safety | Actual severity is Very Critical |
| SIP | Environment | The reviewer confirms "Is this event a SIP?" |
| HCL | Industrial Risk (SRE1–SRE3) | The reviewer answers Yes to "Is this event an HCL?" |
| SPL | Industrial Risk (SRE4–SRE5) | The reviewer answers Yes to "Is this event an SPL?" |

Very Critical means a score of 50 or more on the injury matrix (Critical 20–49, Moderate 2–19).
Only the review makes an event critical: before it, no event is red, whatever the reporter answered. A SIP needs a type. Critical events show red badges
wherever the event appears; their workflow's critical row can require more phases (SIP/HCI, SIP,
SPL/HCL: [workflow settings](capabilities/workflow-settings.md) WF-13).

## Master data

- Lists belong to a pillar; some are fixed global lists (Body Part Categories, Body Parts,
  Injuries) that only Central maintains.
- A value is owned by Central or by a Cluster (for its plants), and is Active, Inactive or Retired
  (final).
- A value is **available at a plant** when it is Active, owned by Central or by a Cluster covering
  the plant, and not deactivated for that plant (by Central, a covering Cluster or the plant's
  Local). A Body Part also needs its category available.
- Classifying an event offers only the values available at the event's plant.

## Alerts and notifications

- **Alerts** (Event Reporting): a person's list of events that need their attention. Each alert
  opens its event and can be marked read. Who gets which alert, and the settings people and Site
  Admins choose, are in [notifications](capabilities/notifications.md).
- **Notifications** (Control Panel): tell a person that someone else changed their setting.
- Every Control Panel change is written to an **audit** trail (who, when, scope, before → after).

## Capabilities

Each capability has its own spec describing its current behavior. Build order for a new project
follows the dependencies.

| Capability | Depends on | Spec |
|---|---|---|
| Platform data: organization, people, reference, demo data | — | [platform-data](capabilities/platform-data.md) |
| Control Panel workspace (access, pillars, notifications, audit, search) | Platform data | [control-panel-workspace](capabilities/control-panel-workspace.md) |
| Workflow settings | Control Panel workspace | [workflow-settings](capabilities/workflow-settings.md) |
| Master data | Control Panel workspace | [master-data](capabilities/master-data.md) |
| User Management (users, groups) | Platform data, workflow settings | [user-management](capabilities/user-management.md) |
| Event Reporting shell (context, header, navigation, alerts, search) | Platform data | [event-reporting-shell](capabilities/event-reporting-shell.md) |
| Event reporting (create, draft, submit, edit) | Event Reporting shell, workflow settings | [event-reporting](capabilities/event-reporting.md) |
| Event library (list, Kanban, filters, KPIs, reports, event page) | Event reporting | [event-library](capabilities/event-library.md) |
| Event review (incl. severity and critical events) | Event reporting, master data | [event-review](capabilities/event-review.md) |
| Root cause analysis | Event review | [root-cause-analysis](capabilities/root-cause-analysis.md) |
| Action plan | Root cause analysis | [action-plan](capabilities/action-plan.md) |
| Validation | Action plan | [validation](capabilities/validation.md) |
| Notifications (lifecycle alerts, My notifications, Site Admin settings) | Validation, Control Panel workspace | [notifications](capabilities/notifications.md) |
| Safety communication (Safety Alert, Safety Warning) | Action plan, event library | [safety-communication](capabilities/safety-communication.md) |
| Sharing Hub (sharing Safety Warnings across plants, local checks) | Safety communication, notifications | [sharing-hub](capabilities/sharing-hub.md) |
| Record Historian (every change after the review) | Validation, event library | [record-historian](capabilities/record-historian.md) |

## Product-wide rules

- Everything is in English.
- Every screen has its own page title, works from 320px wide and can be used with the keyboard.
- Dates are shown as "25 Oct 2026"; times in 24 hours.
- When a save or a completion is refused, the page scrolls to the first field with a message and
  focuses it.

## Open points

- SIP is "Serious Incident Potential" (as the report form explains it).
