# 07 — Record Historian

Every change made to an event after its review is kept, field by field, so that an event is
trustworthy evidence for an audit.

Builds on: [00 Overview](00-overview.md), [06 Validation](06-validation.md).

## Rules

- **RH-1** From the review on, every change to an event is recorded as one entry per field: **when**,
  **who**, **what** (the field, e.g. "Event statement", "Immediate actions", "Corrective action ›
  <description> › Due date", "Contributory causes", "Learnings", "Action plan", "Validation",
  "Status", or a field of the report corrected by a Site Admin, ER-22), **before → after** ("—" when
  empty) and, for a rework or a plan found not effective, the **reason**. Changes made before the
  review completes are not recorded.
- **RH-2** The **Record Historian** of an event lists its entries, newest first, read-only, for
  everyone who can see the event, titled "Record Historian — <record>". It can be narrowed by
  **From** and **To** dates, **Who** (everyone, or one person of the log) and **What** (everything,
  or one field of the log), with the number of changes shown. Empty: "No change since the review."
  · "No change matches these filters.".

## Decisions

| Topic | Decision |
|---|---|
| Who reads it | Everyone who can see the event |
| From when | The review: earlier changes are not recorded |
| Export | Not in these requirements (Q-17) |

## Examples

1. **Given** a TF1 event reviewed, analysed, planned and validated, **then** its Record Historian lists
   the status changes, the validation, the corrective actions added and completed, each with who and
   when, newest first. (RH-1, RH-2)
2. **Given** the same log narrowed to Who = the validator and What = Status, **then** only the
   validator's status changes are listed. (RH-2)
3. **Given** an Open event, **then** its Record Historian says "No change since the review.". (RH-1)
4. **Given** a reworked event, **then** the entry shows the rework's reason. (RH-1)
5. **Given** a Site Admin correcting the report's title of an In Progress event, **then** the change is
   listed with the old and new title. (RH-1)
