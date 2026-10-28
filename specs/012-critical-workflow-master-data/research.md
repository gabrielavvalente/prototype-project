# Research: Workflow for critical events, and the master data workbook

## R1 — The critical row is a reserved level code

- **Decision**: Store its settings with `levelCode: 'critical'` and show the pillar's label
  (SIP/HCI, SIP, SPL/HCL) from a table in `shared/platform/workflow.js`.
- **Why**: Locks, colleagues' notifications, audit and Result per plant all key on the level code,
  so they work unchanged. A label such as "SIP/HCI" as the code would put a slash in setting ids
  and differ per pillar.
- **Alternatives**: a separate settings list for critical events (duplicates every rule).

## R2 — The event keeps the critical row, applied when flagged

- **Decision**: `workflowForEvent` adds `workflow.critical` (Root cause analysis, Actions,
  Validation: `{ required, sources }`); Event Reporting computes "required" from it and the review's
  `criticalFlags` (live answers while reviewing, stored ones after).
- **Why**: The flag is only known at the review; merging it into `phases` at that moment would
  hide where a requirement came from.
- **Alternatives**: recompute from the Control Panel at the review (breaks "settings at
  submission", WF-11).

## R3 — Injuries carry their body parts

- **Decision**: Each injury value gets `bodyPartIds` (fixed global list, set from the workbook);
  `injuriesFor(values, bodyPartIds)` returns the injuries of any chosen body part.
- **Why**: The pairing is many-to-many (423 pairs); `parentId` holds one parent only.
- **Alternatives**: one injury value per body part (423 values, duplicated names in the lists).
