# Research: Event Sharing Hub

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## R1. Package and checks stored on the event

- **Decision**: `event.hubShares` keeps each share (who, when, plants reached, package);
  `event.hubChecks[plantId]` keeps each receiving plant's check. The inbox reads every event and
  keeps the packages shared with the context's plant.
- **Rationale**: No new store, so no new `event-reporting` database version (which deletes every
  store); one browser holds every plant's data in this prototype.
- **Alternatives considered**: a `hub` store (needs a version bump).

## R2. The package is built from the frozen Warning

- **Decision**: The package is `{ content: event.safetyWarning.content, classification: [{ list,
  values }] }`, the classification names read from the platform master data when sharing; never
  people ids. Later shares reuse the first package.

## R3. The gate checks full names

- **Decision**: `namedParts(content, names)` lists the parts (What happened, What was done,
  Contributory causes, Root causes, Corrective actions, Key learnings) containing, ignoring case, the
  full name of any platform person or of the event's person involved.

## R4. Reach

- **Decision**: `reachPlants(plants, { regions, countries, businesses, plantIds }, originPlantId)`:
  a plant matches when each non-empty criterion list contains its value; the chosen plants are
  added; the origin plant is removed. A share skips plants already reached.

## R5. The hub alert

- **Decision**: A share's alerts go to the Site Admins and Managers whose access includes each plant
  reached (not the event's visibility), skipping the person who shared and those who turned the
  alert off; each alert keeps the receiving `plantId`. The header shows such an alert when the
  context's plant is that plant, with the package's first statement line instead of the event's
  title, and opens `#/hub/<record>`.
