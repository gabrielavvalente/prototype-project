# Implementation Plan: Event Reporting — MVP (Global Shell, Event Creation, Event Library)

**Branch**: `001-event-reporting` | **Date**: 2026-10-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-event-reporting/spec.md`

## Summary

Build the first app of the monorepo, `apps/event-reporting/`: a browser-only web app where a
frontline worker reports an event through a guided 6-section form (classification with HPR / CRP /
SRP questions, location drill-down, general information with photos and videos, event details,
immediate actions, summary), saves it as a draft or submits it with a record number such as
`SAF-2026-0042`; a shell scopes everything to business, plant and an optional pillar and shows
My Alerts; and an event library lists, searches, filters and counts events in scope.

Technical approach: React + Vite in plain JavaScript, all data in the browser's IndexedDB (via the
small `idb` library), hash-based routes for direct links, business rules in small plain-JavaScript
functions tested with Vitest, and a common look from `shared/theme.css`. Demo users replace login.
Details and alternatives are in [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES2022 modules, JSX); Node.js LTS for tooling only

**Primary Dependencies**: React, React DOM, React Router (`react-router-dom`), `idb`; dev:
Vite, `@vitejs/plugin-react`, Vitest — exact versions pinned at install (research R7)

**Storage**: IndexedDB in the browser (stores and fields in [data-model.md](data-model.md));
`sessionStorage` only for the signed-in demo user id

**Testing**: Vitest for business-rule functions; manual main-flow checks in the app README and
[quickstart.md](quickstart.md)

**Target Platform**: Current Chrome, Edge, Firefox and Safari, desktop and mobile, from 320px wide

**Project Type**: Single-page web application, client only (no server)

**Performance Goals**: Creation form appears in < 2 s; event list with 100 rows and all filters
in < 3 s; TF4/TF5 report on a phone in < 3 min (SC-001–SC-004)

**Constraints**: No server and no real login (FR-036, Assumptions); attachments ≤ 5 MB each, ≤ 5
per event, limited by browser storage; English-only text; WCAG-minded keyboard and screen-reader
use

**Scale/Scope**: 1 app, ~8 screens/panels, 3 demo roles, sample data of 2 businesses, 3 plants and
a few dozen events; built for demonstrations on one device

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / rule | How this plan complies | Status |
|---|---|---|
| I. Simple, readable code | Plain JavaScript, no TypeScript; rules in small named functions (`isRiskQuestionRequired`, `formatRecordNumber`); components per screen section; no state-management library (React state + one data module). Each added library is justified below. | ✅ Pass |
| II. Isolated apps | Everything in `apps/event-reporting/` with its own `package.json`; no workspaces; only `shared/theme.css` is used from outside; `shared/` does not depend on the app. | ✅ Pass |
| III. Minimal tests | Vitest tests for validation, record numbers, access/scope, filters and KPI counts; main flow as manual steps in README "How to test"; no coverage target; console checked before commits. | ✅ Pass |
| IV. Consistent interface | Colors, fonts, spacing and button/field/error styles come from `shared/theme.css`; every screen has a title; layouts work from 320px; images have `alt`; all controls reachable by keyboard. | ✅ Pass |
| V. Short documentation | `apps/event-reporting/README.md` with only: what it does, how to run, how to test; root `README.md` links the app. | ✅ Pass |
| Stack | Chosen in this first plan: React + Vite, JavaScript (research R1). Constitution "Monorepo Structure → Stack" to be updated via `/speckit-constitution`. | ✅ Pass (follow-up) |
| External dependencies pinned and justified | Exact versions via `npm install --save-exact` + committed lock file (R7); justification table below. | ✅ Pass |
| UTF-8, English, no secrets | All files UTF-8; all text English; no keys or personal data (demo names are fictional). | ✅ Pass |
| Workflow | Spec states its app; small Conventional Commits; `main` kept working. | ✅ Pass |

### Dependency justification

| Dependency | Why it is needed | Simpler alternative rejected because |
|---|---|---|
| `react`, `react-dom` | Chosen stack (R1) | — |
| `vite`, `@vitejs/plugin-react` | Chosen stack: dev server, JSX, build (R1) | — |
| `react-router-dom` | Direct links per screen, required for access checks and alert links (FR-021–FR-023) | Hand-written router reinvents a standard, less familiar to learners (R3) |
| `idb` (~1 KB) | Readable `await` access to IndexedDB, needed for 5 MB videos (FR-009, FR-036) | Raw IndexedDB API is callback-based and error-prone; `localStorage` too small (R2) |
| `vitest` (dev) | Small automated tests of business rules (principle III) | Jest needs extra configuration with Vite (R4) |

**Post-design re-check (after Phase 1)**: data model, routes contract and quickstart introduce no
new libraries, folders outside the app, or patterns beyond the above. ✅ Pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-event-reporting/
├── spec.md              # Feature specification (with Clarifications)
├── plan.md              # This file
├── research.md          # Phase 0: decisions and alternatives
├── data-model.md        # Phase 1: IndexedDB stores, fields, rules, states
├── quickstart.md        # Phase 1: run and validation guide
├── contracts/
│   └── routes.md        # Phase 1: screens, URLs, access and refusals
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── source/              # Original requirement documents (reference only)
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
shared/
└── theme.css                    # Common colors, fonts, spacing, buttons, fields, messages

apps/event-reporting/
├── README.md                    # What it does, how to run, how to test
├── package.json                 # Exact dependency versions
├── package-lock.json
├── vite.config.js               # React plugin, allow reading ../../shared
├── index.html
└── src/
    ├── main.jsx                 # Starts React, imports theme and app styles
    ├── App.jsx                  # Routes and the signed-in user / context
    ├── app.css                  # App-specific layout only (values from theme.css)
    ├── data/
    │   ├── db.js                # Opens IndexedDB, read/write helpers per store
    │   └── sampleData.js        # Demo users, organization, reference lists, sample events
    ├── logic/                   # Plain functions, no React — each with a .test.js next to it
    │   ├── access.js            # Roles, menu, routes, event visibility, edit rights
    │   ├── validation.js        # Mandatory-field and file rules per section
    │   ├── recordNumber.js      # Format and next sequence
    │   └── eventList.js         # Search, filters, sorting, pagination, KPI counts
    ├── shell/
    │   ├── StartScreen.jsx      # Pick demo user, reset demo data
    │   ├── EntryScreen.jsx      # Choose pillar or enter without one
    │   ├── Header.jsx           # User, business/plant/pillar, My Alerts control
    │   ├── Navigation.jsx
    │   ├── AlertsPanel.jsx
    │   └── NotAllowed.jsx       # Permission / not found messages
    ├── events/
    │   ├── EventLibrary.jsx     # Page: KPI tiles + search + filters + list
    │   ├── KpiTiles.jsx
    │   ├── FilterBar.jsx
    │   ├── EventTable.jsx       # Sorting, columns, pagination
    │   ├── QuickView.jsx
    │   └── EventDetail.jsx
    └── create/
        ├── EventForm.jsx        # Sections, progress, draft/submit (also used for edit)
        ├── ClassificationSection.jsx
        ├── LocationSection.jsx
        ├── GeneralInfoSection.jsx
        ├── AttachmentInput.jsx
        ├── DetailsSection.jsx
        ├── ImmediateActionsSection.jsx
        └── SummarySection.jsx
```

**Structure Decision**: One standalone app folder per constitution principle II, organized by
area (`shell`, `events`, `create`) so each folder maps to one user story, with all business rules
in `src/logic/` (plain, testable functions) and all storage in `src/data/`. Tests sit next to the
logic files they test (`validation.test.js`). The only file outside the app is `shared/theme.css`.

## Complexity Tracking

No constitution violations. Added libraries are justified in the Constitution Check above.

## Follow-ups

- Update the constitution's "Monorepo Structure → Stack" with React + Vite (JavaScript) via
  `/speckit-constitution` (MINOR amendment).
- Description is plain multi-line text instead of rich text (research R8); revisit if formatting
  such as bold is required.
