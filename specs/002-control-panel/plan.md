# Implementation Plan: Control Panel — workflow and master data per pillar

**Branch**: `002-control-panel` | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-control-panel/spec.md`

## Summary

A new app, `apps/control-panel/`, where administrators set per pillar which workflow phases are
Required for each level (Central → Cluster → Local, "Required wins") and govern the master data
lists (Standards, Hazards, Body Parts, Injuries, Aspects, Impacts, Industrial Risk Categories).
Users, organization, roles, workflow settings and master data become **shared platform data** in
`shared/platform/` (plain JavaScript, built-in IndexedDB, no packages). A root `launcher/` serves
every app from one address so they share that data. Event Reporting moves its users and
organization to the platform data, stores the resulting workflow on each submitted event and
closes the event when only Submission is Required. Details in [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES2022, `.js` / `.jsx`), Node.js LTS for tooling

**Primary Dependencies**: Control Panel pins the same exact versions as Event Reporting —
React 19.3.1, react-dom 19.3.1, react-router-dom 7.18.4, `@fontsource/poppins` 5.3.0; dev: Vite
8.3.5, `@vitejs/plugin-react` 6.1.2, Vitest 5.0.5. No `idb` in the Control Panel (it reads and
writes only through `shared/platform/`). Launcher: Vite 8.3.5 and `@vitejs/plugin-react` 6.1.2
only. No new package anywhere.

**Storage**: Browser IndexedDB at the launcher's address — database `platform` (owned by
`shared/platform/`) and database `event-reporting` (owned by the app, version 6) (R4)

**Testing**: Vitest for business rules — `shared/platform/` rules (resulting workflow, permissions,
available values, validation) and the Control Panel's view logic; Event Reporting's existing tests
plus submission status. Manual checks in [quickstart.md](quickstart.md).

**Target Platform**: Recent Chrome, Edge, Firefox, Safari; desktop and phone (from 320px)

**Project Type**: Browser-only web apps in a monorepo (two apps + shared code + launcher)

**Performance Goals**: Panels open and grids update instantly on the sample data (4 pillars,
≤ 20 levels × 5 phases, ≤ 50 values per list, 3 plants, ~12 users)

**Constraints**: No server; no new dependencies; apps never import each other; data shared only
when opened through the launcher (R1)

**Scale/Scope**: Control Panel ~8 screens (pillar choice, Workflow with 3 views, Master data,
Audit, Users list and detail, notifications); Event Reporting small changes (data source,
submission)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule (v2.3.0) | Status | How this plan complies |
|---|---|---|
| I. Simple, readable code | ✅ | Rules are small pure functions (`resultingWorkflow`, `availableValues`, `canEditSetting`…); one tiny storage helper; no state library, no generic framework. |
| I. No unjustified libraries | ✅ | Control Panel reuses Event Reporting's exact stack; `idb` deliberately not used in shared code (R2). |
| II. Isolated apps | ✅ | `apps/control-panel/` and `apps/event-reporting/` never import each other; both import only `shared/`. UI pieces are copied, not shared (R2). Each app still runs alone (own seed). |
| II. `shared/` independent | ✅ | `shared/platform/` imports nothing from apps and no packages. |
| III. Minimal tests | ✅ | Vitest on the platform rules and submission status; quickstart manual flow; console checked before each commit. |
| IV. Consistent interface | ✅ | Both apps use `shared/theme.css`; the Control Panel reuses Event Reporting's header, sheet, chips and badges patterns; titles per screen; 320px layouts (grids scroll horizontally inside their card). |
| V. Short documentation | ✅ | New `apps/control-panel/README.md`; the launcher is explained in the root README; Event Reporting README updated (run through the launcher). |
| Monorepo: launcher | ✅ | `launcher/` has its own `package.json` (Vite only) and an index page; no app or business code. No root `package.json`, no workspaces. |
| Monorepo: shared platform data | ✅ | Users, plants, locations, roles, workflow settings, master data, rules and sample data in `shared/platform/`; stored once at the launcher's address. |
| Stack, pinned versions, UTF-8, English, no secrets | ✅ | Exact versions above; all text in English; demo data only. |

**Result**: PASS before research and after design. No exceptions — Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-control-panel/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R10
├── data-model.md        # Phase 1: platform entities and rules
├── quickstart.md        # Phase 1: run and validation scenarios
├── contracts/
│   ├── routes.md        # Control Panel screens and access
│   └── platform-api.md  # Functions shared/platform/ offers to apps
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
launcher/
├── package.json          # vite + @vitejs/plugin-react only
├── vite.config.js        # root = repository; serves /apps/<app-name>/
└── index.html            # page listing the apps (uses shared/theme.css)

shared/
├── theme.css             # existing
└── platform/
    ├── storage.js        # tiny promise helper over IndexedDB, database "platform"
    ├── platformData.js   # load/save functions used by the apps (contracts/platform-api.md)
    ├── sampleData.js     # users (+ Control Panel roles), organization, pillars, levels,
    │                     #   starting workflow settings
    ├── catalogs.js       # initial master data catalogs from the sources
    ├── workflow.js       # PHASES, resultingWorkflow, workflowForEvent, reviewer rules
    ├── masterData.js     # LISTS, availableValues, validateValue
    ├── permissions.js    # Control Panel roles: levels, plants covered, what a user may change
    ├── organization.js   # plants, ancestry helpers moved from Event Reporting
    └── *.test.js         # Vitest, run by the Control Panel

apps/control-panel/
├── package.json, vite.config.js, index.html, README.md
└── src/
    ├── main.jsx, App.jsx, app.css
    ├── shell/            # Header, StartScreen (demo users), PillarPicker, NotificationsPanel,
    │                     #   Sheet, Icon, NotAllowed (copied patterns from Event Reporting)
    ├── workflow/         # WorkflowTab, SettingsGrid, ResultGrid, CellDetails, EventPath,
    │                     #   ComparePlants, ReviewersPicker
    ├── masterData/       # MasterDataTab, ValueList, ValueForm, ActivationToggle
    ├── audit/            # AuditTab
    └── users/            # UsersList, UserDetail

apps/event-reporting/     # changes only
├── index.html            # entry loaded with a relative path (R1)
├── vite.config.js        # unchanged allow-list already includes shared/
└── src/
    ├── data/db.js        # version 6; users/organization/reference read from shared/platform
    ├── data/sampleData.js# keeps events, alerts, counters and form lists only
    ├── logic/locations.js# uses shared/platform/organization.js helpers
    └── App.jsx           # loads platform data; submit stores workflow and Closed status
```

**Structure Decision**: Two isolated apps, one shared plain-JavaScript data module and a minimal
launcher, exactly as allowed by constitution v2.3.0 (Monorepo Structure → Root and Shared platform
data).

## Complexity Tracking

No violations.
