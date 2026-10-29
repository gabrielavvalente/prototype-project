# 06 — Validation

Once the action plan is completed, a validator decides whether the actions were effective: Yes
closes and locks the event; No sends it back to Actions. A locked event can be reopened only by a
rework.

Builds on: [00 Overview](00-overview.md), [01 Roles and permissions](01-roles-and-permissions.md),
[05 Action plan](05-action-plan.md).

## Rules

- **VAL-1** The **validators** of an event are its reviewer; when its workflow has no review, the
  Managers who can see its plant and pillar. The plant's Site Admins may validate too (RP-8a).
- **VAL-2** The Validation step shows every action of the plan, read-only, and asks the validators,
  while it is the current step: "Is this event closed? Were the actions effective?" Yes / No.
  - **No** asks "Why is it not effective?" (required).
  - **Yes** needs nothing more.
  Missing answers are refused: "Say whether this event is closed." · "Explain why it is not
  effective.". Everyone else who can see the event reads the step.
- **VAL-3** **Yes** closes and locks the event (VAL-5), with the closing alerts
  ([10](10-alerts-and-notifications.md)); the step shows "Validated as effective by <name> on
  <date>".
- **VAL-4** **No** sends the event back to Actions (In Progress): the plan opens again for its
  owners, who are told "Event sent back for rework" (never the validator who answered), and the
  reporter "Action plan not effective". The owners add corrective actions (On Going at once,
  AP-9); once those are finished the plan completes again (AP-12) and the event returns to
  Validation.
- **VAL-5** **Locked**: an event closed by its validation is locked — nothing of it changes (report,
  review, analysis, plan, actions, validation), not even by a Site Admin; no optional analysis is
  offered (RCA-15); every step says "This event is closed and locked. Only a rework can reopen
  it.". Its safety communications stay readable, and its Safety Warning can still be published and
  shared.
- **VAL-6** **Rework**: on a locked event, a validator (or a Site Admin of its plant) sends it back,
  with a required reason — "Why does it need rework?" ("Explain why it needs rework."). The event
  is unlocked and back at Actions (In Progress); the plan opens again for its owners, who are told
  "Event sent back for rework". Once the plan completes again, the event returns to Validation.
  Rework can happen any number of times.
- **VAL-7** Every validation and rework is kept; the history shows "Validation: not effective —
  <reason> (<name>)", "Validation: effective — closed by <name>" and "Rework: <reason> (<name>)".

## Decisions

| Topic | Decision |
|---|---|
| Final review | The Validation step plays it; no separate Final Review, no Final Risk Score (Q-16) |
| Who validates | The reviewer; without review, the Managers of the plant and pillar; the plant's Site Admins too |
| Outcome | Effective closes and locks the event; not effective (with a reason) returns it to Actions |
| Locking | Only a rework reopens a locked event, any number of times |
| Answering Yes | Closes at once, with no extra confirmation *(the prototype also asked to confirm "No additional actions are needed.")* |

## Examples

1. **Given** a TF1 event whose plan completed, **when** its validator answers Yes, **then** the event
   is Closed and locked, with no further confirmation; completing without an answer is refused with
   "Say whether this event is closed.". (VAL-2, VAL-3)
2. **Given** a validator answering No with "Rack still unstable", **then** the event is back at
   Actions, the action plan owners are told "Event sent back for rework" and the reporter "Action
   plan not effective"; once the new actions are completed the event returns to Validation. (VAL-4)
3. **Given** a locked event, **then** nobody can change it — a Site Admin included — and no optional
   analysis is offered; its Safety Warning can still be published. (VAL-5)
4. **Given** a locked event, **when** a validator reworks it without a reason, **then** it is refused
   with "Explain why it needs rework."; with a reason, the event is In Progress at Actions and the
   history shows "Rework: <reason> (<name>)". (VAL-6, VAL-7)
