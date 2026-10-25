<!--
Sync Impact Report
==================
Version change: 2.2.0 → 2.3.0
Bump rationale: MINOR — "Monorepo Structure" materially expanded so several apps can share one
configuration (feature 002 Control Panel): a root `launcher/` folder opening every app from one
address, and `shared/platform/` for the platform data all apps read. No rule removed or
redefined.

Modified principles: none (Principle II "Isolated Apps" unchanged: apps still never import each
other; shared code lives only in `shared/`)
Modified rules: Monorepo Structure → Root (launcher allowed); new bullet "Shared platform data";
Stack → package.json rule now names the launcher as the only other place with its own setup
Added sections: none
Removed sections: none

Deferred TODOs: none.
-->

# Prototype Project Constitution

## Core Principles

### I. Simple, Readable Code

Code MUST be easy for a beginner to read and understand.

- The simplest solution that satisfies the spec MUST be chosen; advanced patterns, generic
  abstractions and "future-proofing" MUST NOT be used without justification in `plan.md`.
- Names of variables, functions and files MUST describe what they do (e.g., `calculateTotal`,
  not `ct`).
- Functions SHOULD have a single responsibility and fit on one screen (about 30 lines).
- Comments SHOULD explain *why* for non-obvious code, not repeat what the code does.
- Libraries and tools beyond those that are part of the chosen stack MUST NOT be added without
  justification in `plan.md`.

**Rationale**: This is a learning project; simple code can be understood, fixed and changed
without advanced knowledge.

### II. Isolated Apps

Each app MUST live in its own folder `apps/<app-name>/`.

- The folder name MUST use lowercase letters and hyphens (e.g., `apps/event-reporting/`).
- All code, styles, images and tests of an app MUST stay inside its folder.
- An app MUST NOT import or reference files from another app.
- Resources used by more than one app (e.g., a common visual theme) MAY live in `shared/`; apps
  MAY use `shared/`, but `shared/` MUST NOT depend on any app.
- Each app MUST work on its own: deleting one app's folder MUST NOT break the others.

**Rationale**: Isolation lets each prototype be built, tested and discarded without side effects
on the others.

### III. Minimal Tests

Each app MUST test only what matters: the main flow and the important logic.

- Each app MUST have at least one check of its main flow — a simple automated test or a list of
  manual steps in the "How to test" section of its README.
- Functions with business rules (calculations, validations, data transformations) SHOULD have a
  small automated test.
- There is no coverage target; complex testing tools MUST NOT be added without justification in
  `plan.md`.
- Before each commit, the main flow of the changed app MUST be checked and the browser console
  MUST show no errors.

**Rationale**: Prototypes change fast; a few focused tests give confidence without becoming a
maintenance burden.

### IV. Consistent Interface

All apps MUST look like they belong to the same family.

- Colors, fonts, spacing and the styles of buttons and fields MUST come from a common theme in
  `shared/`, instead of loose values in each app.
- Elements with the same purpose (primary buttons, error messages, titles) MUST look and behave
  the same across all apps.
- Each screen MUST have a clear title and MUST be usable on a mobile phone (from 320px wide).
- Non-decorative images MUST have `alt` text, and interactive elements MUST work with the
  keyboard.

**Rationale**: A common visual base avoids rework and makes the prototypes look professional with
little effort.

### V. Short Documentation

Each app MUST have a short `README.md` at `apps/<app-name>/README.md`.

- The README MUST contain only: what the app does (1–3 sentences), how to open or run it, and
  how to test it.
- The README SHOULD fit on one screen; design details belong in `specs/`, not in the README.
- The README MUST be updated in the same commit that changes how the app is opened, run or
  tested.
- The root `README.md` SHOULD list the apps with a link to each app's folder.

**Rationale**: Short documentation gets read and maintained; long documentation goes stale.

## Monorepo Structure

- **Folders**: `apps/` (one subfolder per app), `shared/` (common resources: the visual theme and
  the platform data), `launcher/` (opens all apps from one address), `specs/` (Spec Kit artifacts)
  and `.specify/` (Spec Kit configuration).
- **Root**: MAY contain a `launcher/` folder that opens every app from one address (e.g.,
  `…/event-reporting/` and `…/control-panel/`) and shows a page listing them. The launcher MAY have
  its own `package.json` for that purpose only and MUST NOT contain app or business code. A
  `package.json` directly at the repository root and npm workspaces remain forbidden.
- **Shared platform data**: resources used by more than one app MAY live in `shared/` — the visual
  theme and `shared/platform/`, the platform data every app reads (users, plants and locations,
  roles, workflow settings, master data) with its rules and sample data. Shared code MUST NOT
  depend on any app and MUST NOT bring dependencies that the apps using it do not already pin.
  Data shared between apps MUST be stored once, in the browser, at the launcher's address.
- **Stack**: React + Vite, written in plain JavaScript (`.js` / `.jsx`, no TypeScript), chosen in
  the first `/speckit-plan` (`specs/001-event-reporting/plan.md`, research R1). Apps run in the
  browser only, with no server.
  - Each app MUST be standalone, with its own `package.json` inside `apps/<app-name>/`; a
    `package.json` at the repository root and npm workspaces MUST NOT be used (the `launcher/`
    folder is the only other place with its own `package.json`).
  - Automated tests MUST use Vitest.
  - The shared visual theme MUST be plain CSS in `shared/theme.css` (CSS custom properties);
    UI component libraries and CSS frameworks MUST NOT be added without justification in
    `plan.md`.
  - All apps SHOULD use this stack; a different stack for one app MUST be justified in that app's
    `plan.md`.
- **External dependencies**: MUST be pinned to an exact version and justified in `plan.md`.
- **Encoding**: All files MUST be saved as UTF-8.
- **Language**: All user-facing text, documentation, specs and code (names and comments) MUST be
  in English.
- **Secrets**: Passwords, API keys and personal data MUST NOT be committed.

## Development Workflow

- Each feature MUST follow the Spec Kit flow: `/speckit-specify` → (`/speckit-clarify`) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Each spec MUST state which app it belongs to (or `shared/`).
- Each `plan.md` MUST include the Constitution Check; any exception MUST be recorded with
  justification in the Complexity Tracking section.
- Commits MUST be small, cover a single concern and use Conventional Commit prefixes (`feat:`,
  `fix:`, `docs:`, `chore:`, `refactor:`, `style:`).
- The `main` branch MUST keep working: all apps open with no errors in the console.

## Governance

This constitution takes precedence over every other project practice. When a plan or task
conflicts with it, the constitution wins unless it is amended.

- **Amendments**: Made via `/speckit-constitution`, recorded in the Sync Impact Report and
  committed with a `docs:` prefix. Specs and plans in progress MUST be reviewed after an
  amendment.
- **Versioning**: Semantic versioning — MAJOR for removing or redefining a principle, MINOR for
  adding a principle or section (or materially expanding guidance), PATCH for wording and
  clarifications.
- **Compliance**: Every `plan.md` MUST pass the Constitution Check before and after design.
  Unjustified complexity MUST be rejected.

**Version**: 2.3.0 | **Ratified**: 2026-10-24 | **Last Amended**: 2026-10-24
