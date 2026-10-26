# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A monorepo of browser-only React + Vite prototypes (plain JavaScript, no TypeScript, no server):
**Event Reporting** (`apps/event-reporting/`), **Control Panel** (`apps/control-panel/`) and
**User Management** (`apps/user-management/`, read-only). They share `shared/theme.css` and the
platform data in `shared/platform/`. Project rules are in `.specify/memory/constitution.md` and
are binding.

## Commands

There is no root `package.json` (forbidden by the constitution). Each app and the launcher has its
own `npm install`.

```bash
cd launcher && npm run dev        # starts every app and serves them at http://localhost:5173/
cd apps/<app> && npm test         # vitest run (event-reporting, control-panel)
cd apps/<app> && npm run build
npx vitest run src/logic/review.test.js                         # one test file (from the app folder)
npx vitest run ../../shared/platform/masterData.test.js         # shared tests run from apps/control-panel
```

- `shared/platform/*.test.js` are run **by the Control Panel** (its `vite.config.js` includes
  `../../shared/**/*.test.js`); User Management has no automated tests.
- Through the launcher the apps live at `/apps/event-reporting/`, `/apps/control-panel/`,
  `/apps/user-management/` (dev servers on 5181–5183, listed in `launcher/apps.js`). If the user
  already has the launcher running, those ports are taken: reuse it, its servers hot-reload.
- Always test through the launcher: browser storage is per origin, so only there do the apps share
  data. An app run alone gets its own copy of the demo data.
- The Event Reporting start screen's **Reset demo data** clears both databases and reseeds (the
  Control Panel's resets the platform data only).

## Architecture

**Isolation.** Apps never import each other; anything common goes in `shared/`, and `shared/`
imports no packages and nothing from `apps/`. Apps import shared code by relative path
(`../../../../shared/platform/...`); each app's `vite.config.js` allows `../../shared` in
`server.fs.allow`. Each app has its own exact-pinned dependencies (React 19.3.1, react-router-dom
7.18.4, Mantine 9.7.3, Vite 8.3.5, Vitest 5.0.5; Event Reporting also `idb`). A new package needs a
justification in the feature's `plan.md` (Mantine's is in `specs/002-control-panel/plan.md`,
Complexity Tracking).

**Two IndexedDB databases.**
- `platform` (`shared/platform/platformData.js` over a tiny `storage.js`): users, organization and
  reference (pillars, families, levels) are **rewritten from `sampleData.js` on every start**;
  workflow settings, master data values, activations, audit and notifications are seeded once
  (a `seeded-<list>` mark in `meta`) and then edited by the Control Panel. All writes go through
  functions that check permissions and write audit entries in one transaction.
- `event-reporting` (`apps/event-reporting/src/data/db.js`, via `idb`): events, attachments,
  alerts, counters, settings and the form-only lists. Bumping `DATABASE_VERSION` **deletes every
  store** (demo data is replaced), so avoid it unless the schema really changes.

**Roles.** Event roles (`User`, `Manager`, `Site Admin`) plus per-pillar Control Panel roles
(`central` = all plants, `cluster` = 2+ plants, `local` = one plant; at most one per pillar). Site
Admins automatically get Local roles from their event access (`withSiteAdminRoles` in
`shared/platform/permissions.js`), applied when `sampleData.js` builds the users.

**Workflow.** The Control Panel stores only *Required* phase settings per pillar/level/scope;
"Optional" is the absence of a setting, and a higher level's Required locks lower levels
(`shared/platform/workflow.js`). At submission Event Reporting copies the resulting workflow, with
its reviewer ids, onto the event (`workflowForEvent`), so later Control Panel changes never affect
existing events. Statuses: Draft → Open → In Progress → Closed / Archived; an event is Closed at
submission when only Submission is required.

**Review and steps** (`apps/event-reporting/src/logic/review.js`). Steps are **computed** from
`event.workflow` and `event.review`, never stored. The steps page is `#/events/:id/steps/:step`; a
configured reviewer assigns themself (In Progress), then valid → next required step or Closed,
not valid → Archived with alerts. Archived events are hidden unless the Status filter asks for
them; only Draft and Open events are editable from the form.

**Business rules are pure functions** in `apps/*/src/logic/` and `shared/platform/` (with Vitest
tests next to them); screens call them. Routing uses `createHashRouter`; each app exposes its
session and data through an `AppContext`.

**UI.** Mantine components styled by `shared/theme.css` variables (colors, pillar colors
`--color-pillar-*`, `.pillar-tag`, `.pillar-dot`). Gotcha: the theme greys out
`input[readonly]` but excludes `.mantine-Select-input`, because Mantine selects use a read-only
input internally. `apps/event-reporting/src/app.css` is long and layered: later rules override
earlier ones, so append overrides at the end.

## Conventions

- Everything in English (UI, code, comments, docs, specs), even when the user writes in Portuguese.
- **What the product does now** is in `specs/domain.md` and `specs/capabilities/*.md` (read the
  capabilities concerned before changing a behavior; each rule has an id). They must stay true:
  no history, technology or file paths in them.
- Features follow Spec Kit: `/speckit-specify` → (`/speckit-clarify`) → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement` → `/speckit-converge`, under `specs/NNN-name/`
  (`.specify/feature.json` points to the active one and is git-ignored). The project overrides
  the spec, plan and tasks templates (`.specify/templates/overrides/`): a feature's spec is a
  **change** to capabilities, and its last task applies it to the capability files (template for
  a new one: `.specify/templates/capability-template.md`). `specs/001`–`004` predate this format.
  The specify, plan and tasks skills are patched to match (`.specify/memory/skill-patches.md`);
  re-apply the patches after upgrading Spec Kit.
- Review remarks edit the feature's spec in place and become a new phase of tasks; never append
  a clarification session.
- Acceptance scenarios start from the demo data in `specs/capabilities/platform-data.md`; check
  their names and counts against it.
- The product sources in `specs/001-event-reporting/source/` contradict each other in places
  (status models, Rework, who reviews): list the open points and confirm with the user before
  building.
- Small Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `style:`); check
  the changed app's main flow and a clean browser console before committing.
- Every screen sets `document.title`, works at 320px wide and with the keyboard.
- Files mix CRLF and LF line endings; preserve each file's existing endings when editing.
