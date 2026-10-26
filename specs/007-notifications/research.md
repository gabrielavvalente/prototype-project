# Research: Notifications

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## R1. Settings in the platform database, version 2 adds stores only

- **Decision**: The settings, rules and their changes are three new stores of the shared
  `platform` database. Its version goes to 2; the upgrade creates only the stores that are missing,
  so workflow settings, master data and the audit kept in a browser survive. They are loaded once
  like the other editable lists (PD-3): the demo data has none, so nothing is seeded.
- **Rationale**: Both apps read and write them (constitution: shared data in `shared/`); the
  `event-reporting` database is Event Reporting's alone, and bumping its version deletes every
  store.
- **Alternatives considered**: settings in the `event-reporting` database (the Control Panel cannot
  reach it); in `meta` records (no index by plant or person, no clear reset).

## R2. One delivery function, candidates per step

- **Decision**: Each step produces **candidates** `[{ recipientId, type }]` in stage order (NT-3);
  `deliverAlerts(candidates, { event, actorId, users, settings })` keeps the recipients who can see
  the event and have an event role, drops information alerts to the actor ("Event submitted"
  excepted) and those turned off, and keeps one per person: a work alert first, otherwise the
  latest-stage one. The db functions load the settings before opening their transaction (an
  IndexedDB transaction cannot wait for another database).
- **Rationale**: NT-1/NT-2 are written once and tested once; the steps stay simple.
- **Alternatives considered**: each step filtering on its own (the rules would be repeated in six
  places).

## R3. A setting is stored only once someone changes it

- **Decision**: One record per changed (person, alert type): `on`, `setById`, `setAt`. No record =
  on, set by nobody. "Latest change wins" is simply overwriting the record; "Set by" shows when
  `setById` is not the person.
- **Rationale**: No seeding per person; new people and new alert types start on.

## R4. Rule matching uses the event's department

- **Decision**: A rule matches an event of its plant and pillar whose `levelCode` is in its levels
  and whose `location.departmentId` is in its departments (or the rule has none). Rules are read
  when the event is submitted.

## R5. Clearing "Event to review" without a new index

- **Decision**: Taking the review deletes, in the same transaction as the event, the "Event to
  review" alerts of that event for the other reviewers and marks the taker's read; the alerts are
  found by reading the store and filtering on `eventId` and `type`.
- **Rationale**: An `eventId` index would need a new `event-reporting` database version, which
  deletes every store; the store holds few alerts.

## R6. Demo alerts come from the same candidates

- **Decision**: The sample alerts are the submission candidates of the two latest submitted events
  of each plant, delivered with every switch on and the reporter as actor.
- **Rationale**: The demo bells match the rules (spec scenario 1) without a hand-written list.

## R7. Who may change what

- **Decision**: `setNotificationSetting(actor, userId, type, on)` accepts the person themself or a
  Site Admin whose access includes a plant of the person's access; work alerts are refused.
  Rule writes accept a Site Admin of the rule's plant who sees its pillar there. Site Admin writes
  save a `notificationChanges` entry in the same transaction; the person's own changes do not
  (they are not Control Panel changes).
- **Alternatives considered**: letting Control Panel Local roles manage notifications (the user
  chose Site Admins only).
