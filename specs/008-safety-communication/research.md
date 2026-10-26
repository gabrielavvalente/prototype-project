# Research: Safety communication

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## R1. Computed documents, one frozen copy

- **Decision**: `alertContent(event, …)` and `warningContent(event, …)` build the documents from the
  event each time they are shown (the Alert refreshes by itself, SC-4). Publishing stores the
  Warning's content as it is then in `event.safetyWarning.content`; a published Warning is always
  shown from that copy (SC-7).
- **Rationale**: Nothing to keep in sync for the Alert and the draft; the frozen copy is the only
  stored thing.
- **Alternatives considered**: storing the Alert at review (it would not refresh).

## R2. Anonymity by construction

- **Decision**: The content functions return plain texts built from an allow-list of fields
  (record number, plant, pillar, level, dates, flags, ratings, statement, immediate action
  description and priority, 6M causes and explanations, root-cause answers, learnings, corrective
  action description / status / due date, counts, photo ids); they never read people ids, the title
  or the description. A test checks that no demo person's name appears in the documents of a fully
  worked event (SC-2).

## R3. Reading across pillars

- **Decision**: The list reads every submitted event of the context's plant (not only the events
  the person can see) and keeps those with a document; a document page checks
  `canReadCommunication(user, event)` (an event role and access to the plant) instead of event
  visibility. The link back to the event shows only when the person can see it.
- **Rationale**: SC-3 lets people read documents of events they cannot open; the content is
  anonymised (R2).

## R4. Photos by id

- **Decision**: The draft's ticks are saved as `event.safetyWarning.photoIds` (attachments that are
  images); publishing keeps them. Photos are read from the `attachments` store when shown. A
  reviewed event can no longer be edited, so its attachments do not change afterwards.

## R5. Printing

- **Decision**: **Print** calls the browser's print; an `@media print` style hides the header, the
  navigation, the buttons and the draft controls, so only the document prints.
- **Alternatives considered**: a PDF library (a new package without need).
