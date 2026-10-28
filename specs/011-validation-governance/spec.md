# Change: Locked closure, rework and the Record Historian

**Feature Branch**: `011-validation-governance`

**Created**: 2026-10-28

**Input**: User description: "Review and governance (the rest of it)" — the Final Review, Rework,
record immutability and Record Historian of the sources (Review and Governance feature, US-GOV-04
to US-GOV-07), with the open points decided with the user on 2026-10-28. Review remarks
(2026-10-28): the question reads "Is this event closed? Were the actions effective?"; answering No
alerts the plan owners with "Event sent back for rework".

**Capabilities**: new: `specs/capabilities/record-historian.md` (prefix RH); changed:
`specs/capabilities/validation.md` (VAL-2, VAL-3, VAL-5, VAL-6 and VAL-7 added),
`specs/capabilities/root-cause-analysis.md` (RCA-18), `specs/capabilities/notifications.md` (NT-2,
NT-3, NT-4, scenario 9), `specs/domain.md` (Glossary, Capabilities)

## Why

Today a validated event closes but stays open to later changes, and there is no controlled way to
reopen it nor a trace of what changed after the review — so a closed event is weak evidence for an
audit.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Final Review | Our Validation step plays it; it keeps the name **Validation** everywhere | Review and Governance US-GOV-04 (a Final Review step) |
| Final Risk Score | Not asked | Review and Governance FR-11 |
| Confirmation | Closing needs "No additional actions are needed." ticked | Review and Governance FR-11 |
| The question | "Is this event closed? Were the actions effective?" — Yes closes, No keeps the path back to Actions | User (review remark) |
| Alert on No | The plan owners get "Event sent back for rework" (work); the reporter keeps "Action plan not effective" (information) | User (review remark) |
| Roles | No Owner nor Final Reviewer: the validators (VAL-1) close and rework; the plan owners (AP-2) receive the rework | Review and Governance FR-2 (Owner, Final Reviewer at the review) |
| Locking | An event closed by its validation is locked; only **Rework** by a validator reopens it, unlimited times; events closed earlier keep the optional analysis (RCA-18) | Review and Governance FR-12 to FR-14 |
| Record Historian | A read-only, filterable log of the field changes made after the review, readable by everyone who can see the event | Review and Governance US-GOV-06 |
| Not in this change | Attackability score, HPR auto-conversion (our "further analyze" plays it), the Owner role | Review and Governance FR-4, FR-17 |

## Rules

### Added — `record-historian.md`

- **RH-1** From the review on, every change to an event is recorded as one entry per field:
  **when**, **who**, **what** (the field, e.g. "Event statement", "Immediate actions", "Corrective
  action › Fix the ladder storage rack › Due date", "Contributory causes", "Learnings", "Action
  plan", "Validation", "Status"), **before → after** (texts; "—" when empty) and, for a rework or a
  plan found not effective, the **reason**. Changes before the review completes are not recorded.
- **RH-2** **Record Historian**, a link at the bottom of the event's steps menu, opens the event's
  log, newest first, read-only, for everyone who can see the event: "Record Historian — <record> —
  Event Reporting". Filters: **From** and **To** dates, **Who** (Everyone, or each person in the
  log) and **What** (Everything, or each field in the log), with the number of changes shown.
  Empty: "No change since the review." · "No change matches these filters.".

### Added — `validation.md`

- **VAL-6** **Locked**: an event closed by its validation is locked — nothing of it can be changed
  (submission, analysis, plan, actions, validation), its optional analysis (RCA-18) is not offered,
  and every step shows "This event is closed and locked. Only a rework can reopen it.". Its safety
  communications stay readable, and its Safety Warning can still be published and shared.
- **VAL-7** **Rework** (the validators, on a locked event's Validation step) asks "Why does it need
  rework?" (required: "Explain why it needs rework."); then the event is unlocked and back at
  Actions (In Progress, current step Actions), the plan opens again for its owners, who get "Event
  sent back for rework" (work), and the history shows "Rework: <reason> (<name>)". Once the plan
  completes again (AP-12), the event returns to Validation. Rework can happen any number of times.

### Changed

- **VAL-2** *(the question and the Yes answer)* The validators answer **"Is this event closed? Were
  the actions effective?"** Yes / No ("Say whether this event is closed." when unanswered). With
  Yes, "No additional actions are needed." must be ticked; Complete validation without it is
  refused next to it: "Confirm that no additional actions are needed.". No asks "Why is it not
  effective?" as before. *(was: "Is the action plan effective?", no confirmation)*
- **VAL-4** *(the alert)* No sends the event back to Actions as a rework: the plan owners get "Event
  sent back for rework" (work, never the validator who answered) and the reporter "Action plan not
  effective" (information). *(was: "Action plan not effective" to the owners and the reporter)*
- **VAL-3** **Yes** closes and locks the event (VAL-6), with the alerts of NT-3; the step shows
  "Validated as effective by <name> on <date>". *(was: closes it)*
- **VAL-5** *(the history)* adds "Rework: <reason> (<name>)". *(was: validations only)*
- **RCA-18** *(an exception)* … never on an event locked by its validation (VAL-6). *(was: every
  Closed event)*
- **NT-2**, **NT-3**, **NT-4** *(the work alerts)* "Event sent back for rework" (work) to the plan
  owners at a validation answered No (VAL-4) and at a rework (VAL-7), never to the validator;
  "Action plan not effective" is an information alert to the reporter only ("On an event you
  reported."). My notifications' Always on lists four work alerts: "Event to review", "Root cause
  analysis assigned to you", "Action plan ready for validation", "Event sent back for rework".
  *(was: "Action plan not effective" a work alert to the plan owners)*
- **Domain**: the Glossary adds **Locked** ("an event closed by its validation: read-only until a
  rework") and **Record Historian**; the Capabilities table lists the record historian.

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`), after [validation](../capabilities/validation.md)
scenario 1's setup: `TF-26-0005` (TF1, Lyon; Review, Actions and Validation; reviewer and validator
Carla Mendes) has its plan completed and Validation as its current step.

1. **Confirmation** — Carla reads "Is this event closed? Were the actions effective?", answers Yes
   and presses Complete validation without ticking. *Then* it is
   refused with "Confirm that no additional actions are needed." and the page scrolls to it. She
   ticks it and completes. *Then* the event is Closed, the step shows "Validated as effective by
   Carla Mendes on …" and every step shows "This event is closed and locked. Only a rework can
   reopen it.". (VAL-2, VAL-3, VAL-6)
2. **Locked** — On `TF-26-0005`, the Actions step offers no action buttons, Root cause analysis is
   not Optional, and the Safety communications section still opens the Safety Alert. Diego Laurent
   (not a validator) sees no Rework. (VAL-6, RCA-18)
3. **Rework** — Carla presses Rework and confirms without a reason: refused with "Explain why it
   needs rework."; with "Guard rail still loose" the event is In Progress at Actions, the history
   shows "Rework: Guard rail still loose (Carla Mendes)", and Carla — the plan owner here — gets no
   alert (she sent it). She adds an action, completes it: the event is back at Validation; she
   validates again (Yes, ticked): Closed and locked. (VAL-7, NT-3)
4. **Record Historian** — On `TF-26-0005`, Record Historian lists, newest first, the Validation and
   Status changes, the rework with its reason "Guard rail still loose", and the corrective actions
   added and completed, each with who and when; filtering Who = Carla Mendes and What = Status
   keeps only the status changes. Ana Ribeiro opens it read-only. (RH-1, RH-2)
5. **Before the review** — `TF-26-0001` (Open, not reviewed): its Record Historian says "No change
   since the review.". (RH-1, RH-2)
6. **My notifications** — Ana's Always on lists four work alerts, with "Event sent back for
   rework" and without "Action plan not effective" (now an information switch). (NT-4)
6b. **No is a rework** — On `TF-26-0005` reviewed and validated by Diego Laurent, analysed by Ana
   Ribeiro (designated in the review; she owns the plan) and reported by Carla Mendes, Diego answers
   No ("Rack still unstable") at Validation. *Then* Ana gets "Event sent back for rework", Carla gets
   "Action plan not effective", Diego gets nothing, and the event is back at Actions. (VAL-4,
   NT-3)
7. **Phone and keyboard** — At 320px the Record Historian, its filters and Rework are usable without
   sideways scrolling, and with the keyboard. (Domain)

## Out of scope

- The Attackability score and Risk Prioritization Matrix, a Final Risk Score, the Owner and Final
  Reviewer roles, HPR auto-conversion.
- Server-side enforcement (the prototype has no server); exporting the Record Historian.
