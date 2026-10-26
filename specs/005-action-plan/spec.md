# Change: Action plan

**Feature Branch**: `005-action-plan`

**Created**: 2026-10-26

**Input**: User description: "Action plan" — the Actions step of an event: preparing, deploying,
following and completing its corrective actions. Decisions confirmed with the user on 2026-10-26.

**Capabilities**: new: `specs/capabilities/action-plan.md`; changed:
`specs/capabilities/root-cause-analysis.md` (RCA-12, RCA-13, RCA-16),
`specs/capabilities/event-library.md` (EL-12, EL-17, EL-18, EL-19), `specs/domain.md` (Steps,
Glossary, capability map)

## Why

A reviewed event needs its corrective actions to be carried out and followed until they are done;
today the Actions step only says it comes later, and the actions created in the analysis go
nowhere.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Who owns the plan | The people designated for the analysis; without analysis, the reviewer; without review, the Managers of the plant and pillar | "Owner" (Action Plan), "Action Owner" (Industrial Risk), reviewer (Safety) |
| Where actions live | In Event Reporting; "View in Action Management" is a placeholder button | Action Plan: created and monitored in an external Action Management Platform |
| Maintenance | A "Notify maintenance" Yes / No shown as a tag; no Work Notification, no sync | Action Plan US-AP-03 (maintenance system integration); Safety FR-22/23 |
| Lifecycle | Prepare → Deploy action plan (actions On Going, assignees alerted) → assignees complete → owner completes the plan | Action Plan US-AP-04 deferred deployment yet gates validation on it (its open question) |
| Link to a root cause | Optional link to a why of the 5 Why when the analysis was done | Action Plan US-AP-02 makes it required |
| Where assignees act | Only in the event's Actions step; no My actions page | Action Plan US-AP-05 (My Actions) |
| Overdue | Overdue badge and KPIs only; no alert (no server to send it on time) | Action Plan US-AP-06 (email escalation) |
| Action plan when Actions is not required | The step stays visible as optional for the owner until the event closes; once the plan has an action, the event goes through Actions | Sources: the plant may choose an action plan; no rule given |
| Key learnings | Stay in the root cause analysis | Action Plan US-AP-01 (in the plan) |

## Rules

### Added — capability "Action plan" (prefix AP)

**The step and its owner**

- **AP-1** The **Actions** step of an event holds its action plan: the actions created in the root
  cause analysis and those added in the step.
- **AP-2** The plan's **owners** are the people designated for the root cause analysis (directly
  or through a group); when the event had no analysis, its reviewer; when it had no review either,
  the Managers who can see its plant and pillar. Only owners prepare, deploy, cancel and complete;
  each assignee updates their own deployed actions; everyone else who can see the event reads the
  plan.
- **AP-3** When the event's workflow does not require Actions, the step shows **Optional** in the
  steps menu (until it becomes the current step) and its owners can open it while the event is Open
  or In Progress; others see "This step is not required for this event.". As soon as the plan has
  at least one action, Actions counts as a required step of that event: the step before it moves
  the event to Actions instead of closing it. While the root cause analysis is the current step,
  the plan is read-only in the Actions step (the analysis lists and edits its actions).

**Actions**

- **AP-4** An action has: description, assignees (1 to 5 people whose access includes the event's
  plant and pillar), due date, priority (Emergency, High, Medium, Low), location — department and
  workshop of the event's plant, filled from the event and adjustable — **Notify maintenance**
  (Yes / No, required), and optionally the why of the 5 Why it comes from (only when the event has
  an analysis). All but the why are required; the action popup's button is **Create** (Save when
  editing).
- **AP-5** An action's status is **Planned** (prepared, not deployed), **On Going**, **To
  Complete**, **Completed** or **Cancelled**. A deployed action that is not Completed or Cancelled
  and whose due date is before today also shows **Overdue** (red) wherever it appears.
- **AP-6** The plan lists every action in a compact line: the why's answer on its own line when
  linked, then the description, status (and Overdue), priority, assignees, due date and a
  "Maintenance" tag when Notify maintenance is Yes; owners have edit and delete icons. Each action
  has **View in Action Management**, which only says "Action Management is not connected in this
  prototype.".
- **AP-7** Owners add actions with **Add action**, edit them (all fields) and delete Planned ones
  (after confirmation). A deployed action cannot be deleted; owners **Cancel** it instead (after
  confirmation).
- **AP-8** Changing the due date of an action keeps its **due date history**: "Due date changed
  from <old> to <new> by <name> on <date>", newest first, shown under the action.

**Deploying and following**

- **AP-9** **Deploy action plan** (owners, at least one Planned action) sets every Planned action
  On Going and sends "Action assigned to you" to each of their assignees who can see the event,
  once per person. An action added after deployment is On Going at once and alerts its assignees.
- **AP-10** An assignee sets their own On Going action to **To Complete** or **Completed**, and a To
  Complete one to **Completed**; a Completed or Cancelled action no longer changes.
- **AP-11** The plan header shows "N actions · N completed · N overdue" and, before deployment,
  "Not deployed".

**Completing the plan**

- **AP-12** **Complete action plan** (owners) is possible only when the plan is deployed, every
  action is Completed or Cancelled, and at least one is Completed; otherwise the button is disabled
  with the reason ("Every action must be Completed or Cancelled, and at least one Completed.").
  Completing records who and when and moves the event to its next required step (In Progress), or
  closes it when none is left.
- **AP-13** A completed plan is read-only for everyone, with "Completed by <name> on <date>"; the
  history of the event shows "Action plan deployed by <name>" and "Action plan completed by
  <name>".

### Changed

- **RCA-12** *(one sub-rule changes)* A why card's **Add action** opens the action popup of the
  action plan (AP-4) with that why linked. *(was: the popup with description, assignees, due date
  and priority only)*
- **RCA-13** Actions created in the analysis are the plan's actions (AP-1), Planned until the plan
  is deployed; the analysis lists them under 5 Why as before and they are not required to complete
  the analysis. *(was: actions with the core fields, to be used later by the Action plan)*
- **RCA-16** Completing the analysis moves the event to its next required step — Actions when the
  workflow requires it or the plan has actions (AP-3) — or closes it when none is left. *(was:
  next required step or Closed)*
- **EL-12** **Open actions** counts the deployed actions not Completed or Cancelled, and a fifth
  number **Overdue actions** counts those that are Overdue (AP-5), both in the events of the
  context and following the search and filters; each opens the Events page narrowed to their
  events. *(was: Open actions always 0)*
- **EL-17** Each step of the steps menu is Done, Current step, Not reached yet, Not required or
  **Optional** (AP-3). *(was: without Optional)*
- **EL-18** The Actions step is described by the action plan capability; Validation still says
  "Validation comes in a later version of the prototype.". *(was: Actions and Validation came
  later)*
- **EL-19** The history also shows "Action plan deployed by …" and "Action plan completed by …".
  *(was: without them)*
- **Domain, Steps**: a step is required also when it is Actions and the event's plan has at least
  one action; a not-required Actions step shows Optional. **Glossary**: Action — a corrective step
  of the event's action plan, with assignees, due date, priority and status.

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`). `TF-26-0005` (TF1, Lyon)
requires Review, Actions and Validation; `TF-26-0002` (TF3, Lyon) requires Review only; both have
the reviewers Carla Mendes, Eva Novak and Diego Laurent.

1. **Owner without analysis** — Carla reviews `TF-26-0005` as valid, "further analyze" No. *Then*
   the current step is Actions: "Not deployed", no action, Add action and a disabled Deploy action
   plan for Carla; Diego sees the plan read-only. (AP-1, AP-2, AP-11)
2. **Prepare** — Carla adds "Fix the ladder storage rack": assignees Ana Ribeiro and Diego Laurent,
   due date in two weeks, High, location filled with the event's department and workshop, Notify
   maintenance Yes → Create. *Then* the line shows Planned, High, "Maintenance", both assignees.
   Create with no assignee is refused. (AP-4, AP-6)
3. **Deploy** — Carla adds a second action assigned to Diego Laurent only, due yesterday, then
   Deploy action plan. *Then* both are
   On Going, the second also Overdue; Ana and Diego each get one "Action assigned to you"; the
   header reads "2 actions · 0 completed · 1 overdue". (AP-5, AP-9, AP-11)
4. **Due date history** — Carla moves the second action's due date to next week: Overdue
   disappears and the action shows "Due date changed from <yesterday> to <next week> by Carla
   Mendes on <today>". (AP-8)
5. **Assignee updates** — Ana sets the first action To Complete, then Completed; she cannot change
   the second one (Diego's) nor cancel anything. (AP-10)
6. **Cancel and complete** — Carla cancels the second action (after confirmation): Complete action
   plan becomes possible; she completes it. *Then* the plan is read-only with "Completed by Carla
   Mendes on …", the current step is Validation ("Validation comes in a later version of the
   prototype."), and the history shows "Action plan deployed by Carla Mendes" and "Action plan
   completed by Carla Mendes". (AP-7, AP-12, AP-13, EL-18, EL-19)
7. **Cannot complete yet** — With one action On Going, Complete action plan is disabled with
   "Every action must be Completed or Cancelled, and at least one Completed.". (AP-12)
8. **Optional plan** — Carla takes the review of `TF-26-0002`: its Actions step shows Optional and
   she can open it; she adds an action, then completes the review as valid with "further analyze"
   No. *Then* the event is In Progress at Actions instead of Closed; after deploying, completing
   the action and the plan, it is Closed. Ana sees the Actions step of `TF-26-0006` as "This step
   is not required for this event.". (AP-3, EL-17)
9. **From the analysis** — After the root cause analysis scenarios, on `TF-26-0003` (designated: Lyon H&S investigation team and Diego
   Laurent), an action created from Why 3 in the analysis appears in the Actions step as Planned,
   with Why 3's answer on its first line; after completing the analysis the current step is
   Actions and Eva Novak (team member) can deploy. (RCA-12, RCA-13, RCA-16, AP-2)
10. **KPIs** — Right after scenario 3, Carla's KPIs page shows Open actions 2 and Overdue actions 1; Overdue
    actions opens the Events page with `TF-26-0005`. (EL-12)
11. **Action Management** — View in Action Management says "Action Management is not connected in
    this prototype.". (AP-6)
12. **Phone and keyboard** — At 320px the action lines wrap and the popup fits; every control works
    with the keyboard. (Domain)

## Out of scope

- The Validation step (its own later change).
- Key learnings in the plan (they stay in the root cause analysis), a comments thread, export.
- The Action Management and maintenance integrations (Work Notifications, sync), overdue alerts and
  escalation, a My actions page.
