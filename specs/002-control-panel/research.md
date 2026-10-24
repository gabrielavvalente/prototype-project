# Research: Control Panel

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-24

Decisions taken to build the Control Panel as a separate app sharing data with Event Reporting,
under constitution v2.3.0.

## R1. One address for every app: the launcher

- **Decision**: `launcher/` starts **one dev server per app** (each in its own folder, with its own
  packages, on its own port: Event Reporting 5181, Control Panel 5182, User Management 5183) and a
  small Vite server on `http://localhost:5173/` in front of them. That front server shows the page
  listing the apps and **forwards** `/apps/<app-name>/` to the app's server (Vite's built-in
  `server.proxy`, WebSockets included for live reload). One command, `npm run dev` in
  `launcher/`, runs `launcher/start.js`, which starts everything. The list of apps and their
  ports is in `launcher/apps.js`. The launcher's `package.json` pins only `vite`.
- **Rationale**: The browser keeps stored data per address (origin). Everything the browser sees
  comes from `localhost:5173`, so the apps share the platform data (constitution v2.3.0), while
  each app still runs with only its own packages, exactly as when it runs alone.
- **Required change in apps**: `index.html` loads the entry with a relative path
  (`./src/main.jsx`); the launcher starts each app with `--base /apps/<app-name>/`. No app config
  changes; each app still runs on its own with `npm run dev`.
- **Alternatives considered**: one Vite server for the whole repository (first choice, rejected
  after testing — see below); a backend (out of the constitution); exporting/importing
  configuration files (clumsy, rejected by the user).
- **Why not one server for the repository** (tested 2026-10-24): Vite pre-bundles packages once
  per server. With two apps each having their own React installed, React Router was bundled
  against one copy of React and the app ran with another: "Invalid hook call" and a blank page.
  Fixing it would have meant sharing one React install between apps, which breaks their
  isolation.
- **Verified (2026-10-24)**: launcher page, Event Reporting (sign in, entry, events list) and the
  Control Panel all open through `localhost:5173` with no console errors; both databases
  (`platform`, `event-reporting`) are visible from both apps.
- **Note**: when an app is run on its own (its own port), it gets its own copy of the platform
  data seeded from the sample data — useful for development, but not shared with other apps.

## R2. Shared code without dependencies

- **Decision**: `shared/platform/` is plain JavaScript with **no imports of packages**. Its storage
  uses the browser's built-in IndexedDB through a tiny promise helper (`storage.js`, ~60 lines).
  React components are not shared: each app keeps its own small UI pieces (`Icon`, `Sheet`…), the
  Control Panel starting from copies of Event Reporting's.
- **Rationale**: Files in `shared/` cannot resolve packages (there is no `node_modules` there), and
  the constitution forbids shared code bringing dependencies. Plain JavaScript keeps `shared/`
  usable by any app.
- **Alternatives considered**: importing `idb` from shared code (cannot be resolved without
  per-app aliases — fragile); a shared React UI package (needs a package setup the constitution
  does not allow); copying the platform data into each app (defeats the purpose).

## R3. What becomes platform data

- **Decision**: Move to `shared/platform/`: users (with their event access **and** Control Panel
  roles), organization (businesses, plants, location hierarchy), pillars, families and levels,
  workflow settings, master data lists and values, activation choices, audit trail and Control
  Panel notifications. Event Reporting keeps its own data: events, attachments, event alerts,
  record-number counters, user settings, and its form lists (shift moments, employee types, task
  types, action priorities and categories, first aid treatments, diseases).
- **Rationale**: Exactly what other apps need to share; event-specific lists stay with the app
  that uses them (diseases move later with Industrial Hygiene master data).
- **Alternatives considered**: moving everything into one database (couples apps; deleting Event
  Reporting would leave its data in the shared store).

## R4. Two databases, one origin

- **Decision**: database `platform` (owned by `shared/platform/`, version-managed there) and
  database `event-reporting` (owned by the app, version bumped to 6 to drop the stores that moved).
  Whoever opens the platform database first seeds it from `shared/platform/sampleData.js`.
- **Rationale**: Each owner manages its own stores and upgrades; the constitution's "deleting one
  app must not break the others" holds.
- **Note**: at submission, Event Reporting reads the workflow settings from `platform`, computes
  the event's workflow, then writes the event in its own database. The two steps are not one
  transaction; that is acceptable because only the submitting device writes.

## R5. Storing and combining workflow settings

- **Decision**: Only **Required** settings are stored; "Optional" is the absence of a setting.
  A setting: pillar, level code, phase, scope level (`central` / `cluster` / `local`), covered
  plants, reviewers (when the phase is Review), author and date. Switching a cell back to Optional
  deletes the setting at that level. The resulting workflow for a plant is computed by a pure
  function: a phase is Required when at least one setting of its pillar and level applies to the
  plant (Central always; Cluster or Local when its plants include it); Submission is always
  Required.
- **Rationale**: The combination rule ("required wins") becomes a simple, testable function;
  storing only Required settings makes "only add Required" automatic.
- **Alternatives considered**: storing Optional/Required for every cell and level (more data, and
  conflicting values to resolve).

## R6. Workflow kept on each event

- **Decision**: At submission the event gets `workflow`: for each phase `{ required, sources,
  reviewerIds }` plus `computedAt`. If no phase besides Submission is Required, the event status
  is `Closed` instead of `Open` (FR-026). Reviewers are the union of the reviewer groups of the
  settings that make Review Required, limited to Managers and Site Admins with access to the
  event's plant and pillar.
- **Rationale**: Later features (Review, Root cause analysis…) read the event's own workflow, so
  changes in the Control Panel never affect events already submitted (FR-012).

## R7. Master data availability

- **Decision**: Values carry their owner level and scope; deactivations are separate "activation
  choices" (value, scope level, plants). A pure function returns the values available to a plant:
  Active, owned by Central or by a Cluster covering the plant, and not deactivated by Central, a
  covering Cluster, or the plant's Local; Retired values are never available. Body Parts are
  available only when their category is too.
- **Rationale**: Mirrors the source governance model (inheritance + local activation) and is easy
  to test (SC-004).

## R8. Control Panel roles and demo users

- **Decision**: Each user gets `controlPanelRoles: [{ pillarId, level, plantIds }]`. New demo users:
  Central administrators (one for Health & Safety and Industrial Hygiene, one for Environment, one
  for Industrial Risk) and a Cluster administrator for Health & Safety and Environment covering
  Lyon and Porto, plus a second Health & Safety Cluster administrator covering Lyon and Curitiba
  (overlapping clusters); Local roles are added to Eva Novak (Site Admin, Lyon), Carla Mendes
  (Manager, Lyon — a second Local on Lyon to show option A) and Felix Tanaka (Manager, Curitiba).
  Users without event access are not offered on Event Reporting's start screen.
- **Rationale**: Covers every case of the spec with few people; event roles and Control Panel
  roles stay independent (source governance model).

## R9. Tests for shared code

- **Decision**: Tests for `shared/platform/` live next to the code (`*.test.js`) and run with the
  Control Panel's Vitest (`test.include` covers `../../shared/**/*.test.js`). The rule functions
  are pure and need no browser.
- **Rationale**: Constitution: Vitest for business rules; no extra tooling.

## R10. Control Panel notifications

- **Decision**: Stored in the platform database and shown in the Control Panel's own bell. Event
  Reporting keeps its event alerts as today.
- **Rationale**: The notification concerns Control Panel settings; the person acts on it in the
  Control Panel.
