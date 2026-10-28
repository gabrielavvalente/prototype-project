# Capability: Record Historian

**Product**: Event Reporting (the Record Historian page of an event)
**Builds on**: [domain](../domain.md) (Visibility), [event library](event-library.md), [validation](validation.md)
**Status**: built

Every change made to an event after its review is kept, field by field, so that a closed event is
trustworthy evidence for an audit.

## Scope

- **In**: one entry per changed field from the review on; the read-only, filterable log.
- **Out**: exporting the log; server-side enforcement (the prototype has no server).

## Rules

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

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), after [validation](validation.md) scenario 4.

1. **The log** — On `TF-26-0005`, Record Historian lists, newest first, the Validation and Status
   changes, the rework with its reason "Guard rail still loose", and the corrective actions added
   and completed, each with who and when; filtering Who = Carla Mendes and What = Status keeps only
   the status changes. Ana Ribeiro opens it read-only. (RH-1, RH-2)
2. **Before the review** — `TF-26-0001` (Open, not reviewed): its Record Historian says "No change
   since the review.". (RH-1, RH-2)
3. **Phone and keyboard** — At 320px the log and its filters are usable without sideways scrolling,
   and with the keyboard. (Domain)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Who reads it | Everyone who can see the event | Review and Governance US-GOV-06 (an EHS auditor) |
| From when | The review: earlier changes are not recorded | Review and Governance FR-5 |
