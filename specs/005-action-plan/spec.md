# Change: Action plan

**Feature Branch**: `005-action-plan`

**Created**: 2026-10-26

**Input**: User description: "Action plan" — the Actions step of an event: preparing, deploying,
following and completing its corrective actions — and its validation ("one event = one action
plan"; the reviewer validates the actions and can close the event). Decisions confirmed with the
user on 2026-10-26.

**Capabilities**: new: `specs/capabilities/action-plan.md`, `specs/capabilities/validation.md`;
changed:
`specs/capabilities/event-review.md` (RV-6, RV-10, RV-11),
`specs/capabilities/root-cause-analysis.md` (RCA-12, RCA-13, RCA-16),
`specs/capabilities/event-library.md` (EL-6, EL-12, EL-17, EL-18, EL-19), `specs/domain.md` (Steps,
Glossary, capability map, risk question, Critical events)

## Why

A reviewed event needs all its actions in one place, carried out and followed until they are
done, then checked by the reviewer before the event closes; today the Actions and Validation steps
only say they come later, and the actions created in the analysis go nowhere.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Who owns the plan | The people designated for the analysis; without analysis, the reviewer; without review, the Managers of the plant and pillar | "Owner" (Action Plan), "Action Owner" (Industrial Risk), reviewer (Safety) |
| Where actions live | In Event Reporting; "View in Action Management" is a placeholder button | Action Plan: created and monitored in an external Action Management Platform |
| Maintenance | A "Notify maintenance" Yes / No shown as a tag; no Work Notification, no sync | Action Plan US-AP-03 (maintenance system integration); Safety FR-22/23 |
| One event = one action plan | The plan lists every action of the event: its immediate actions (always Completed) and the corrective ones; all count in the plan | Action Plan, core FR-11 |
| Lifecycle | Prepare → Deploy action plan (actions On Going, assignees alerted) → assignees complete → the plan completes by itself once deployed and finished | Action Plan US-AP-04 deferred deployment yet gates validation on it (its open question) |
| Deploying without corrective actions | Allowed: it says the immediate actions are enough, and the plan completes at once | No rule in the sources |
| Validation | The reviewer (Managers without review) answers "Is the action plan effective?": Yes closes the event, No returns it to Actions | Safety FR-26/27, Environment FR-20/22, Industrial Risk FR-6/7 |
| Link to a root cause | Optional link to a why of the 5 Why when the analysis was done | Action Plan US-AP-02 makes it required |
| Where assignees act | Only in the event's Actions step; no My actions page | Action Plan US-AP-05 (My Actions) |
| Overdue | Overdue badge and KPIs only; no alert (no server to send it on time) | Action Plan US-AP-06 (email escalation) |
| Action plan when Actions is not required | The step stays visible as optional for the owner until the event closes; once the plan has an action, the event goes through Actions | Sources: the plant may choose an action plan; no rule given |
| Key learnings | Stay in the root cause analysis | Action Plan US-AP-01 (in the plan) |
| Further analysis | Asked only for a critical (red) event whose workflow does not require the analysis | User's remark (was asked for every event) |
| What makes an event red | Only the review: Potential or Actual severity (or loss) of 50 or more, or a confirmed Environment SIP; the reporter's SIP answer is information only | User's remark (the reporter's answer used to show it red until reviewed) |
| Standards and Hazards in the review | One value each | User's remark |
| Location of an action | The event's location, not asked | Safety FR-22 (department and workshop, adjustable) |

## Rules

### Added — capability "Action plan" (prefix AP)

**The step and its owner**

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

**Actions**

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

**Deploying and following**

- **AP-9** **Deploy action plan** (owners, once per plan) sets every Planned action On Going and
  sends "Action assigned to you" to each of their assignees who can see the event, once per
  person. It is possible without any corrective action: the immediate actions are then the plan.
  A corrective action added after deployment is On Going at once and alerts its assignees.
- **AP-10** An assignee sets their own On Going action to **To Complete** or **Completed**, and a To
  Complete one to **Completed**; a Completed or Cancelled action no longer changes.
- **AP-11** The plan header counts every action of the plan, immediate ones included: "N actions ·
  N completed · N overdue", with "· Not deployed" before deployment.

**Completing the plan**

- **AP-12** The plan **completes by itself** as soon as it is deployed, every action is Completed
  or Cancelled, and at least one is Completed (immediate actions included) — at deployment, or with
  the status change that finishes the last action. It records who made that change and when, and
  moves the event to its next required step (In Progress) — alerting the validators "Action plan
  ready for validation" when it is Validation — or closes it when none is left.
- **AP-13** A completed plan is read-only, with "Completed on <date>"; the history of the event
  shows "Action plan deployed by <name>" and "Action plan completed". A plan sent back by the
  validation (VAL-4) opens again.

### Added — capability "Validation" (prefix VAL)

- **VAL-1** The **validators** of an event are its reviewer; when its workflow has no review, the
  Managers who can see its plant and pillar.
- **VAL-2** The **Validation** step shows every action of the plan read-only (the lines of AP-6)
  and, for the validators while it is the current step, "Is the action plan effective?" Yes / No;
  No asks "Why is it not effective?" (required); **Complete validation**. Missing answers are refused
  next to their field ("Say whether the action plan is effective.", "Explain why it is not
  effective."). Everyone else who can see the event reads it.
- **VAL-3** **Yes** closes the event (Closed) and sends "Event closed" to its reporter; the step
  shows "Validated as effective by <name> on <date>".
- **VAL-4** **No** sends the event back to Actions (In Progress, current step Actions): the plan
  opens again for its owners, who get "Action plan not effective" and add corrective actions (On
  Going at once, AP-9); once they are finished, the plan completes again (AP-12) and the event
  returns to Validation.
- **VAL-5** Every validation is kept; the history shows "Validation: not effective — <reason> (<name>)"
  and "Validation: effective — closed by <name>".

### Changed

- **RCA-12** *(one sub-rule changes)* A why card's **Add action** opens the action popup of the
  action plan (AP-4) with that why linked. *(was: the popup with description, assignees, due date
  and priority only)*
- **RCA-13** Actions created in the analysis are the plan's actions (AP-1), Planned until the plan
  is deployed; the analysis lists them under 5 Why as before and they are not required to complete
  the analysis. *(was: actions with the core fields, to be used later by the Action plan)*
- **RCA-16** Completing the analysis moves the event to its next required step — Actions when the
  workflow requires it or the plan has actions (AP-3) — or closes it when none is left; when it is
  Actions, the analyst is taken to the Actions step. *(was: next required step or Closed, staying
  on the analysis)*
- **RV-6** *(the classification part)* Standards and Hazards take **one value** each (a searchable
  single choice); the other lists stay multiple. *(was: several values)*
- **RV-10** "Do you want to further analyze?" is asked only for a **critical** event (red: SIP, HCI,
  SPL or HCL from the review's answers) whose workflow does not already require Root cause
  analysis, with Yes proposed; otherwise it is not asked and the event does not go to the analysis
  unless its workflow requires it. *(was: asked for every event whose workflow does not require the
  analysis)*
- **RV-11** *(one message)* A missing Standard or Hazard says "Choose a value."; the other lists
  still say "Choose at least one value.". *(was: "Choose at least one value." for every list)*
- **EL-12** **Open actions** counts the deployed actions not Completed or Cancelled, and a fifth
  number **Overdue actions** counts those that are Overdue (AP-5) (Events with SIP now reads
  "Reviewed as a serious incident potential", EL-6), both in the events of the
  context and following the search and filters; each opens the Events page narrowed to their
  events. *(was: Open actions always 0)*
- **EL-6** "SIP" counts only events a valid review flagged SIP; the reporter's "Could this be a
  SIP?" answer is information only and never makes an event SIP or red; only the review's flags
  are red. *(was: the reporter's answer counted and showed red until the review)*
- **EL-17** Each step of the steps menu is Done, Current step, Not reached yet, Not required or
  **Optional** (AP-3). *(was: without Optional)*
- **EL-18** The Actions and Validation steps are described by their capabilities. *(was: Actions
  and Validation came later)*
- **EL-19** The history also shows "Action plan deployed by …", "Action plan completed" and the
  validations (VAL-5). *(was: without them)*
- **Domain, Steps**: a step is required also when it is Actions and the event's plan has at least
  corrective action; a not-required Actions step shows Optional; Validation is done once a
  validation found the plan effective. **Glossary**: Action plan — every action of an event (its
  immediate and corrective actions); Corrective action — an action of the plan with assignees, due
  date, priority and status.

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`). `TF-26-0005` (TF1, Lyon)
requires Review, Actions and Validation; `TF-26-0002` (TF3, Lyon) requires Review only; both have
one immediate action ("Area made safe and people informed") and the reviewers Carla Mendes, Eva
Novak and Diego Laurent.

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
7. **Not effective** — Carla opens Validation: the three actions read-only; Complete validation with
   No and no reason is refused with "Explain why it is not effective."; with "The rack is still
   unfixed at night" → the event is back at Actions (In Progress), Carla (owner) gets "Action plan
   not effective", and the history shows "Validation: not effective — The rack is still unfixed at
   night (Carla Mendes)". (VAL-2, VAL-4, VAL-5)
8. **Effective** — Carla adds "Night check of the rack" for Ana (On Going at once, Ana alerted); Ana
   completes it; the plan completes again and the event returns to Validation; Carla answers Yes.
   *Then* the event is Closed, its reporter (Carla Mendes herself here) gets "Event closed", and the
   step shows "Validated as effective by Carla Mendes on …". Diego sees the Validation step
   read-only. (AP-9, AP-12, VAL-1, VAL-3)
9. **Immediate actions are enough** — Felix Tanaka reviews `TF-26-0010` (TF2, Curitiba: Review and
   Actions; one immediate action) as valid, rated below High, then Deploy action plan without
   any corrective action. *Then* the plan completes at once and the event is Closed. (AP-9, AP-12)
10. **Optional plan** — Carla takes the review of `TF-26-0002`: its Actions step shows Optional and
    she can open it, with its immediate action listed; she adds a corrective action, then completes
    the review as valid, rated below High (not asked to analyze further). *Then* the event is In
    Progress at Actions
    instead of Closed; after deploying and completing the action, the plan completes and the event
    is Closed (no Validation). Ana sees the Actions step of `TF-26-0006` as "This step is not
    required for this event.". (AP-3, AP-12, EL-17)
11. **From the analysis** — After the root cause analysis scenarios, on `TF-26-0003` (designated:
    Lyon H&S investigation team and Diego Laurent), an action created from Why 3 appears under
    Corrective actions as Planned, with Why 3's answer on its first line; after completing the
    analysis the current step is Actions and Eva Novak (team member) can deploy. (RCA-12, RCA-13,
    RCA-16, AP-2)
12. **KPIs** — Right after scenario 3, Carla's KPIs page shows Open actions 2 and Overdue actions 1;
    Overdue actions opens the Events page with `TF-26-0005`. (EL-12)
13. **Action Management** — View in Action Management says "Action Management is not connected in
    this prototype.". (AP-6)
14. **Phone and keyboard** — At 320px the action lines wrap and the popups fit; every control works
    with the keyboard. (Domain)

15. **Further analysis only when red** — Carla reviews `TF-26-0006` (TF4): with Potential Minor ×
    Minimal (Low) "Do you want to further analyze?" is not shown; with Severe × Long term (High,
    SIP) it appears, proposing Yes. (RV-10)
16. **One Standard, one Hazard** — In the same review, Standards and Hazards each take a single
    value; leaving Standards empty says "Choose a value.". (RV-6, RV-11)
17. **On to Actions** — When Diego completes the analysis of `TF-26-0003`, the page opens its
    Actions step. (RCA-16)

18. **Red only from the review** — Before any review, Carla's Events page shows With SIP 0 and no
    red badge, though several reporters answered SIP Yes; `TF-26-0003` reviewed with Potential
    Severe × Medium term (50) becomes SIP and red, and With SIP shows 1. (EL-6, Domain)

## Out of scope

- Key learnings in the plan (they stay in the root cause analysis), a comments thread, export.
- The Action Management and maintenance integrations (Work Notifications, sync), overdue alerts and
  escalation, a My actions page.
