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
  and, for the validators while it is the current step, "Is the action plan effective?" Yes / No;
  No asks "Why is it not effective?" (required); **Complete validation**. Missing answers are refused
  next to their field ("Say whether the action plan is effective.", "Explain why it is not
  effective."). Everyone else who can see the event reads it.
- **VAL-3** **Yes** closes the event (Closed), with the alerts of [notifications](notifications.md)
  NT-3; the step shows "Validated as effective by <name> on <date>".
- **VAL-4** **No** sends the event back to Actions (In Progress, current step Actions): the plan
  opens again for its owners, who are alerted with its reporter (NT-3) and add corrective actions
  (On Going at once, AP-9); once they are finished, the plan completes again (AP-12) and the event
  returns to Validation.
- **VAL-5** Every validation is kept; the history shows "Validation: not effective — <reason> (<name>)"
  and "Validation: effective — closed by <name>".

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), after [action plan](action-plan.md) scenarios
1–6: `TF-26-0005` (TF1, Lyon; Review, Actions and Validation; reviewer Carla Mendes) has its plan
completed and Validation as its current step.

1. **Not effective** — Carla opens Validation: the three actions read-only; Complete validation with
   No and no reason is refused with "Explain why it is not effective."; with "The rack is still
   unfixed at night" → the event is back at Actions (In Progress), Carla (owner) gets "Action plan
   not effective", and the history shows "Validation: not effective — The rack is still unfixed at
   night (Carla Mendes)". (VAL-2, VAL-4, VAL-5)
2. **Effective** — Carla adds "Night check of the rack" for Ana (On Going at once); Ana
   completes it; the plan completes again and the event returns to Validation; Carla answers Yes.
   *Then* the event is Closed (no "Event closed": Carla, its reporter, closed it herself), and the
   step shows "Validated as effective by Carla Mendes on …". Diego sees the Validation step
   read-only. (AP-9, AP-12, VAL-1, VAL-3)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Who validates | The reviewer; without review, the Managers of the plant and pillar | Sources: "validator" not defined (core open question) |
| Outcome | Effective closes the event; not effective (with a reason) returns it to Actions, In Progress | Safety FR-26/27, Environment FR-20/22, Industrial Risk FR-6/7 |
