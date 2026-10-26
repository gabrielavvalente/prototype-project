# Capability: Action plan

**Product**: Event Reporting (Actions step)
**Builds on**: [domain](../domain.md) (steps, roles, visibility), [platform data](platform-data.md),
[event review](event-review.md) (the reviewer), [root cause analysis](root-cause-analysis.md)
(designated people, whys, the actions created there), [event library](event-library.md) (event page)
**Status**: built

One action plan per event, with all its actions: the owners prepare the corrective actions and
deploy them, assignees carry them out, and the plan completes by itself, which moves the event on
(to [validation](validation.md) when required).

## Scope

- **In**: one plan per event with all its actions (immediate and corrective), the plan's owners,
  preparing corrective actions (also from the analysis), deploying, the assignees' updates,
  cancelling, due date history, Overdue, the plan completing by itself, an optional plan when the
  workflow does not require Actions.
- **Out**: checking the plan ([validation](validation.md)), key learnings (they are in the root
  cause analysis), a comments thread, export, the Action Management and maintenance integrations,
  overdue alerts, a My actions page.

## Rules

### The step and its owner

- **AP-1** The **Actions** step of an event holds its action plan — one per event — with every
  action of the event: its **immediate actions** (from the submission, always Completed) and its
  **corrective actions** (created in the root cause analysis or in the step). Only corrective actions
  make the Actions step required (AP-3).
- **AP-2** The plan's **owners** are the people designated for the root cause analysis (directly
  or through a group); when the event had no analysis, its reviewer; when it had no review either,
  the Managers who can see its plant and pillar. Only owners prepare, deploy and cancel; each
  assignee updates their own deployed actions; everyone else who can see the event reads the plan,
  with the list of owners shown.
- **AP-3** When the event's workflow does not require Actions, the step shows **Optional** in the
  steps menu (until it becomes the current step) and its owners can open it while the event is Open
  or In Progress; others see "This step is not required for this event.". As soon as the plan has
  at least one corrective action, Actions counts as a required step of that event: the step before it moves
  the event to Actions instead of closing it. While the root cause analysis is the current step,
  the plan is read-only in the Actions step (the analysis lists and edits its actions).

### Actions

- **AP-4** A corrective action has: description, assignees (1 to 5 people whose access includes the event's
  plant and pillar), due date, priority (Emergency, High, Medium, Low), the event's location (kept
  with the action, not asked), **Notify maintenance**
  (Yes / No, required), and optionally the why of the 5 Why it comes from (only when the event has
  an analysis). All but the why are required; the action popup's button is **Create** (Save when
  editing).
- **AP-5** A corrective action's status is **Planned** (prepared, not deployed), **On Going**, **To
  Complete**, **Completed** or **Cancelled**. A deployed action that is not Completed or Cancelled
  and whose due date is before today also shows **Overdue** (red) wherever it appears.
- **AP-6** The plan lists, in compact lines, first **Immediate actions** (description, Completed,
  priority, who did it, completion date; read-only here — they are edited in the submission or the
  analysis), then **Corrective actions**: the why's answer on its own line when linked, then the
  description, status (and Overdue), a "Maintenance" tag when Notify maintenance is Yes, priority,
  assignees and due date; owners have edit and (for Planned actions) delete icons. Each corrective
  action has **View in Action Management**, which only says "Action Management is not connected in
  this prototype.".
- **AP-7** Owners add actions with **Add action**, edit them (all fields) and delete Planned ones
  (after confirmation). A deployed action cannot be deleted; owners **Cancel** it instead (after
  confirmation).
- **AP-8** Changing the due date of an action keeps its **due date history**: "Due date changed
  from <old> to <new> by <name> on <date>", newest first, shown under the action.

### Deploying and following

- **AP-9** **Deploy action plan** (owners, once per plan) sets every Planned action On Going and
  sends "Action assigned to you" to each of their assignees who can see the event, once per
  person. It is possible without any corrective action: the immediate actions are then the plan.
  A corrective action added after deployment is On Going at once and alerts its assignees.
- **AP-10** An assignee sets their own On Going action to **To Complete** or **Completed**, and a To
  Complete one to **Completed**; a Completed or Cancelled action no longer changes.
- **AP-11** The plan header counts every action of the plan, immediate ones included: "N actions ·
  N completed · N overdue", with "· Not deployed" before deployment.

### Completing the plan

- **AP-12** The plan **completes by itself** as soon as it is deployed, every action is Completed
  or Cancelled, and at least one is Completed (immediate actions included) — at deployment, or with
  the status change that finishes the last action. It records who made that change and when, and
  moves the event to its next required step (In Progress) — alerting the validators "Action plan
  ready for validation" when it is Validation — or closes it when none is left.
- **AP-13** A completed plan is read-only, with "Completed on <date>"; the history of the event
  shows "Action plan deployed by <name>" and "Action plan completed". A plan sent back by the
  validation (VAL-4) opens again.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md). `TF-26-0005` (TF1, Lyon) requires Review,
Actions and Validation; `TF-26-0002` (TF3, Lyon) requires Review only; both have one immediate
action ("Area made safe and people informed") and the reviewers Carla Mendes, Eva Novak and Diego
Laurent.

1. **Owner without analysis** — Carla reviews `TF-26-0005` as valid and rates it below High (not critical, so "Do you want to further analyze?" is not asked). *Then*
   the current step is Actions: "1 action · 1 completed · 0 overdue · Not deployed", the immediate
   action under Immediate actions, Add action and Deploy action plan for Carla; Diego sees the plan
   read-only. (AP-1, AP-2, AP-6, AP-11)
2. **Prepare** — Carla adds "Fix the ladder storage rack": assignees Ana Ribeiro and Diego Laurent,
   due date in two weeks, High, Notify maintenance Yes → Create (no location is asked: the action
   keeps the event's). *Then* the line shows Planned, "Maintenance", High and both assignees.
   Create with no assignee is refused with "Choose 1 to 5 assignees.". (AP-4, AP-6)
3. **Deploy** — Carla adds a second action assigned to Diego Laurent only, due yesterday, then Deploy
   action plan. *Then* both are On Going, the second also Overdue; Ana and Diego each get one
   "Action assigned to you"; the header reads "3 actions · 1 completed · 1 overdue". (AP-5, AP-9,
   AP-11)
4. **Due date history** — Carla moves the second action's due date to next week: Overdue disappears
   and the action shows "Due date changed from <yesterday> to <next week> by Carla Mendes on
   <today>". (AP-8)
5. **Assignee updates** — Ana sets the first action To Complete, then Completed; she cannot change
   the second one (Diego's) nor cancel anything; the plan is not complete yet. (AP-10, AP-12)
6. **Completes by itself** — Carla cancels the second action (after confirmation). *Then* the plan
   completes by itself ("Completed on …"), the current step is Validation, Carla (the reviewer) gets
   "Action plan ready for validation", and the history shows "Action plan deployed by Carla Mendes"
   and "Action plan completed". (AP-7, AP-12, AP-13)
7. **Immediate actions are enough** — Felix Tanaka reviews `TF-26-0010` (TF2, Curitiba: Review and
   Actions; one immediate action) as valid, rated below High, then Deploy action plan without
   any corrective action. *Then* the plan completes at once and the event is Closed. (AP-9, AP-12)
8. **Optional plan** — Carla takes the review of `TF-26-0002`: its Actions step shows Optional and
   she can open it, with its immediate action listed; she adds a corrective action, then completes
   the review as valid, rated below High (not asked to analyze further). *Then* the event is In
   Progress at Actions
   instead of Closed; after deploying and completing the action, the plan completes and the event
   is Closed (no Validation). Ana sees the Actions step of `TF-26-0006` as "This step is not
   required for this event.". (AP-3, AP-12, EL-17)
9. **From the analysis** — After the [root cause analysis](root-cause-analysis.md) scenarios, on
   `TF-26-0003` (designated:
   Lyon H&S investigation team and Diego Laurent), an action created from Why 3 appears under
   Corrective actions as Planned, with Why 3's answer on its first line; after completing the
   analysis the current step is Actions and Eva Novak (team member) can deploy. (RCA-12, RCA-13,
   RCA-16, AP-2)
10. **Action Management** — View in Action Management says "Action Management is not connected in
    this prototype.". (AP-6)
11. **Phone and keyboard** — At 320px the action lines wrap and the popups fit; every control works
    with the keyboard. (Domain)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Who owns the plan | The people designated for the analysis; without analysis, the reviewer; without review, the Managers of the plant and pillar | "Owner" (Action Plan), "Action Owner" (Industrial Risk), reviewer (Safety) |
| Where actions live | In Event Reporting; "View in Action Management" is a placeholder | Action Plan: an external Action Management Platform |
| Maintenance | A Notify maintenance Yes / No shown as a tag; no Work Notification, no sync | Action Plan US-AP-03; Safety FR-22/23 |
| One event = one action plan | The plan lists every action of the event, immediate ones included, and they count | Action Plan, core FR-11 |
| Lifecycle | Prepare → deploy → assignees complete → the plan completes by itself | Action Plan US-AP-04 deferred deployment yet gates validation on it |
| Deploying without corrective actions | Allowed: the immediate actions are then the plan | No rule in the sources |
| Link to a root cause | Optional link to a why when the analysis was done | Action Plan US-AP-02 makes it required |
| Where assignees act | Only in the event's Actions step | Action Plan US-AP-05 (My Actions) |
| Overdue | Badge and KPIs only, no alert | Action Plan US-AP-06 (email escalation) |
| Plan when Actions is not required | Optional for the owners; once it has an action, the event goes through Actions | No rule in the sources |
| Key learnings | In the root cause analysis | Action Plan US-AP-01 (in the plan) |
| Location of an action | The event's location, not asked | Safety FR-22 (department and workshop, adjustable) |
