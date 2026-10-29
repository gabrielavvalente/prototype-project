# 05 — Action plan

Each event has one action plan holding all its actions: the immediate actions taken at the scene
and the corrective actions decided afterwards. Its owners prepare and deploy it; each assignee
completes their own actions; the plan completes by itself when every action is finished.

Builds on: [00 Overview](00-overview.md), [01 Roles and permissions](01-roles-and-permissions.md),
[04 Root cause analysis](04-root-cause-analysis.md).

## Rules

### The plan and its owners

- **AP-1** The **Actions** step of an event holds its action plan — one per event — with every
  action of the event: its **immediate actions** (from the report, always Completed) and its
  **corrective actions** (created in the root cause analysis or in this step). Only corrective
  actions make the Actions step required (AP-3).
- **AP-2** The **action plan owners** are the people designated for the root cause analysis
  (directly or through a group); when the event had no analysis, its reviewer; when it had no
  review either, the Managers who can see its plant and pillar. The plant's Site Admins may act as
  owners (RP-8a). Only owners prepare, deploy and cancel; each assignee updates their own deployed
  actions; everyone else who can see the event reads the plan and sees who its owners are.
- **AP-3** When the event's workflow does not require Actions, the step is **Optional**: its owners
  can still prepare a plan while the event is Open or In Progress; others are told "This step is
  not required for this event.". As soon as the plan has a corrective action, Actions becomes a
  required step of that event: the step before it moves the event to Actions instead of closing it.
  While the root cause analysis is the current step, the plan is changed only from the analysis
  (RCA-11).

### Actions

- **AP-4** A corrective action has: a description, assignees (1 to 5 people whose access includes the
  event's plant and pillar), a due date, a priority (Emergency, High, Medium, Low), **Notify
  maintenance** (Yes / No), the event's location (kept with the action, not asked) and, optionally,
  the why of the 5 Why it answers (only when the event has an analysis). All but the why are
  required.
- **AP-5** A corrective action is **Planned** (prepared, not deployed), **On Going**, **To Complete**,
  **Completed** or **Cancelled**. A deployed action that is neither Completed nor Cancelled and
  whose due date is before today is also **Overdue** wherever it appears.
- **AP-6** The plan shows its **immediate actions** (description, Completed, priority, who did it,
  completion date — read-only here, changed in the report or the analysis) and its **corrective
  actions** (the why it answers when linked, description, status and Overdue, whether maintenance is
  notified, priority, assignees, due date).
- **AP-7** Owners add actions, edit them (every field) and delete Planned ones (after confirmation).
  A deployed action is never deleted: owners **cancel** it (after confirmation).
- **AP-8** Every change of an action's due date is kept: "Due date changed from <old> to <new> by
  <name> on <date>", newest first, with the action.

### Deploying and following

- **AP-9** **Deploy action plan** (owners, once per plan) sets every Planned action On Going. A plan
  can be deployed without corrective action: its immediate actions are then the plan. A corrective
  action added after deployment is On Going at once. Deploying raises "Action plan deployed"
  ([10](10-alerts-and-notifications.md)); nothing is sent about single actions (Q-11).
- **AP-10** An assignee moves their own On Going action to **To Complete** or **Completed**, and a To
  Complete one to **Completed**; a Completed or Cancelled action no longer changes.
- **AP-11** The plan counts every action, immediate ones included: "N actions · N completed · N
  overdue", with "Not deployed" before deployment.

### Completing the plan

- **AP-12** The plan **completes by itself** as soon as it is deployed, every action is Completed or
  Cancelled, and at least one is Completed (immediate actions included) — at deployment, or with the
  status change that finishes the last action. It records who made that change and when, and moves
  the event to its next required step (In Progress) or closes it when none is left, with the alerts
  "Action plan ready for validation", "Action plan completed" or "Event closed"
  ([10](10-alerts-and-notifications.md)).
- **AP-13** A completed plan is read-only ("Completed on <date>"); the history shows "Action plan
  deployed by <name>" and "Action plan completed". A plan sent back by the validation or reworked
  opens again (VAL-4, VAL-6).

## Decisions

| Topic | Decision |
|---|---|
| Who owns the plan | The people designated for the analysis; without analysis, the reviewer; without review, the Managers of the plant and pillar; the plant's Site Admins too |
| One event, one plan | The plan lists every action of the event, immediate ones included, and they count |
| Lifecycle | Prepare → deploy → assignees complete → the plan completes by itself |
| Deploying without corrective actions | Allowed: the immediate actions are then the plan |
| Link to a root cause | Optional: a corrective action may answer a why of the 5 Why |
| Where assignees act | In the event's Actions step |
| Overdue | Shown and counted; no alert from this product (whether an action management tool or this product alerts about actions is Q-11) |
| Maintenance | A Yes / No to notify maintenance, recorded with the action; no work order is created (Q-11) |
| Plan when Actions is not required | Optional for the owners; once it has a corrective action, the event goes through Actions |
| Key learnings | In the root cause analysis |
| Location of an action | The event's location, not asked |

## Examples

1. **Given** a TF2 event whose analysis designated P, **then** P is the action plan owner: they add a
   corrective action for assignee A (due date, priority High, Notify maintenance No) — Planned. A
   cannot change it before deployment. (AP-2, AP-4, AP-5)
2. **Given** the plan deployed, **then** the action is On Going and "Action plan deployed" is raised;
   A sets it Completed; the plan completes by itself and the event moves to Validation (or closes).
   (AP-9, AP-10, AP-12)
3. **Given** a deployed action, **then** it cannot be deleted, only cancelled; a Planned action can be
   deleted. (AP-7)
4. **Given** an On Going action due yesterday, **then** it is Overdue and counted in "N overdue".
   (AP-5, AP-11)
5. **Given** an action's due date changed twice, **then** both changes are listed with who and when,
   newest first. (AP-8)
6. **Given** a TF3 whose workflow does not require Actions, **when** the owner adds a corrective
   action during the analysis, **then** completing the analysis moves the event to Actions instead
   of closing it. (AP-3)
7. **Given** a plan with only an immediate action, **when** it is deployed, **then** it completes at
   once. (AP-9, AP-12)
