# Capability: Validation

**Product**: Event Reporting (Validation step)
**Builds on**: [domain](../domain.md) (steps, roles), [platform data](platform-data.md),
[event review](event-review.md) (the reviewer), [action plan](action-plan.md) (the plan and its
owners), [event library](event-library.md) (event page)
**Status**: built

The reviewer checks that the completed action plan was effective: the event closes, or the plan
goes back to Actions for more corrective actions.

## Scope

- **In**: who validates, the question and its answer, closing the event, sending the plan back,
  the validations kept in the history.
- **Out**: a Final Review, the Safety Alert and Warning ([safety communication](safety-communication.md)),
  effectiveness checks after closing.

## Rules

- **VAL-1** The **validators** of an event are its reviewer; when its workflow has no review, the
  Managers who can see its plant and pillar.
- **VAL-2** The **Validation** step shows every action of the plan read-only (the lines of AP-6)
  and, for the validators while it is the current step, "Is this event closed? Were the actions
  effective?" Yes / No; No asks "Why is it not effective?" (required); Yes asks "No additional
  actions are needed." to be ticked; **Complete validation**. Missing answers are refused next to
  their field ("Say whether this event is closed.", "Explain why it is not effective.", "Confirm
  that no additional actions are needed."). Everyone else who can see the event reads it.
- **VAL-3** **Yes** closes and locks the event (Closed, VAL-6), with the alerts of
  [notifications](notifications.md) NT-3; the step shows "Validated as effective by <name> on
  <date>".
- **VAL-4** **No** sends the event back to Actions as a rework (In Progress, current step Actions):
  the plan opens again for its owners, who get "Event sent back for rework" (never the validator who
  answered) while the reporter gets "Action plan not effective" (NT-3), and add corrective actions
  (On Going at once, AP-9); once they are finished, the plan completes again (AP-12) and the event
  returns to Validation.
- **VAL-5** Every validation is kept; the history shows "Validation: not effective — <reason> (<name>)",
  "Validation: effective — closed by <name>" and "Rework: <reason> (<name>)".
- **VAL-6** **Locked**: an event closed by its validation is locked — nothing of it can be changed
  (submission, analysis, plan, actions, validation), its optional analysis (RCA-18) is not offered,
  and every step shows "This event is closed and locked. Only a rework can reopen it.". Its safety
  communications stay readable, and its Safety Warning can still be published and shared.
- **VAL-7** **Rework** (the validators, on a locked event's Validation step) asks "Why does it need
  rework?" (required: "Explain why it needs rework."); then the event is unlocked and back at
  Actions (In Progress, current step Actions), the plan opens again for its owners, who get "Event
  sent back for rework" (work), and the history shows "Rework: <reason> (<name>)". Once the plan
  completes again (AP-12), the event returns to Validation. Rework can happen any number of times.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), after [action plan](action-plan.md) scenarios
1–6: `TF-26-0005` (TF1, Lyon; Review, Actions and Validation; reviewer Carla Mendes) has its plan
completed and Validation as its current step.

1. **Not effective** — Carla opens Validation: the three actions read-only; Complete validation with
   No and no reason is refused with "Explain why it is not effective."; with "The rack is still
   unfixed at night" → the event is back at Actions (In Progress), Carla (owner, but the validator
   who answered) gets no alert, and the history shows "Validation: not effective — The rack is still unfixed at
   night (Carla Mendes)". (VAL-2, VAL-4, VAL-5)
2. **Effective** — Carla adds "Night check of the rack" for Ana (On Going at once); Ana
   completes it; the plan completes again and the event returns to Validation; Carla answers Yes
   and presses Complete validation: refused with "Confirm that no additional actions are needed."
   (and the page scrolls to it); she ticks "No additional actions are needed." and completes.
   *Then* the event is Closed and locked (no "Event closed": Carla, its reporter, closed it
   herself), the step shows "Validated as effective by Carla Mendes on …" and every step shows
   "This event is closed and locked. Only a rework can reopen it.". Diego sees the Validation step
   read-only. (AP-9, AP-12, VAL-1, VAL-2, VAL-3, VAL-6)
3. **Locked** — On `TF-26-0005`, the Actions step offers no action buttons, Root cause analysis is
   not Optional, and the Safety communications section still opens the Safety Alert. Diego Laurent
   (not a validator) sees no Rework. (VAL-6)
4. **Rework** — Carla presses Rework and sends it back without a reason: refused with "Explain why
   it needs rework."; with "Guard rail still loose" the event is In Progress at Actions, the history
   shows "Rework: Guard rail still loose (Carla Mendes)", and Carla — the plan owner here — gets no
   alert (she sent it). She adds an action for herself and completes it: the event is back at
   Validation; she validates again (Yes, ticked): Closed and locked. (VAL-7)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Final Review | This step plays it and keeps the name Validation; no Final Risk Score | Review and Governance US-GOV-04, FR-11 |
| Locking | An event closed by its validation is locked; only Rework by a validator reopens it, unlimited times | Review and Governance FR-12 to FR-14 |
| Roles | No Owner nor Final Reviewer: the validators close and rework; the plan owners receive the rework | Review and Governance FR-2 |
| Who validates | The reviewer; without review, the Managers of the plant and pillar | Sources: "validator" not defined (core open question) |
| Outcome | Effective closes the event; not effective (with a reason) returns it to Actions, In Progress | Safety FR-26/27, Environment FR-20/22, Industrial Risk FR-6/7 |
