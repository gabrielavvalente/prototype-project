---

description: "Task list for feature 002 Control Panel (workflow and master data per pillar)"
---

# Tasks: Control Panel — workflow and master data per pillar

**Input**: Design documents from `specs/002-control-panel/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/routes.md](contracts/routes.md),
[contracts/platform-api.md](contracts/platform-api.md), [quickstart.md](quickstart.md)

**Tests**: Small Vitest tests for the business-rule functions of `shared/platform/` and for the
submission status in Event Reporting (plan, research R9, constitution principle III). Screens are
checked manually with [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be built and checked on its
own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: User story the task belongs to (US1–US4)
- All paths are relative to the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Launcher, the new app skeleton and the shared platform folder

- [X] T001 Create `launcher/package.json` (`"name": "launcher"`, `"private": true`,
  `"type": "module"`, script `dev: node start.js`) and install with exact versions from
  `launcher/`: `npm install --save-exact --save-dev vite@8.3.5`; add `launcher/.gitignore`
  (`node_modules/`, `dist/`); commit `package-lock.json`
- [X] T002 Create `launcher/apps.js` (folder, name, port per app: 5181, 5182) and
  `launcher/start.js` (research R1): for each app with `node_modules`, start
  `npx vite --port <port> --strictPort --base /apps/<folder>/` in the app folder, then the
  launcher's own Vite; stop the children when the launcher stops. Create `launcher/vite.config.js`:
  port 5173, `open: true`, `server.proxy` forwarding `/apps/<folder>` to each app's port with
  `ws: true`, `server.fs.allow` launcher folder and `../shared`
- [X] T003 Create `launcher/index.html` (`<title>Prototype apps</title>`, script `./main.js` which
  imports `../shared/theme.css`) showing one card per app with name, one-line description and an
  Open link to `/apps/event-reporting/` and `/apps/control-panel/`
- [X] T004 Change `apps/event-reporting/index.html` to load `./src/main.jsx` (relative path, R1);
  run the launcher (`npm run dev` in `launcher/`) and confirm `/` lists the apps and
  `/apps/event-reporting/` opens Event Reporting with no console errors
- [X] T005 Create the Control Panel skeleton in `apps/control-panel/`: `package.json`
  (`"name": "control-panel"`, private, module, scripts `dev`, `build`, `preview`, `test: vitest
  run`), `index.html` (`lang="en"`, `<title>Control Panel</title>`, script `./src/main.jsx`),
  `vite.config.js` (React plugin, `server.port` 5174, `server.fs.allow` app folder and
  `../../shared`, `test.include: ['src/**/*.test.js', '../../shared/**/*.test.js']`),
  `.gitignore`, `src/main.jsx` (imports `@fontsource/poppins` weights as Event Reporting,
  `../../../shared/theme.css`, `./app.css`, renders `<App />` in StrictMode), placeholder
  `src/App.jsx`, empty `src/app.css`
- [X] T006 Install the Control Panel dependencies with exact versions from `apps/control-panel/`:
  `npm install --save-exact react@19.3.1 react-dom@19.3.1 react-router-dom@7.18.4
  @fontsource/poppins@5.3.0` and `npm install --save-exact --save-dev vite@8.3.5
  @vitejs/plugin-react@6.1.2 vitest@5.0.5`; confirm no `^`/`~`; open it through the launcher at
  `/apps/control-panel/` with no console errors
- [X] T007 [P] Create the folder `shared/platform/` with a short header comment in each new file
  stating that it must import no packages and nothing from `apps/` (constitution v2.3.0)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Platform storage and sample data, the move of users/organization out of Event
Reporting, permissions, and the Control Panel shell

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Create `shared/platform/storage.js` (research R2, ~60 lines): `openDatabase(name,
  version, upgrade)`, `requestToPromise`, `getAll(db, store)`, `getById`, `getAllByIndex`,
  `runTransaction(db, storeNames, mode, work)` resolving on `complete`; plain IndexedDB, no
  packages
- [X] T009 Move the platform part of Event Reporting's sample data to
  `shared/platform/sampleData.js`: `organization` and `users` from
  `apps/event-reporting/src/data/sampleData.js`, and from `reference` only the types `pillar`,
  `family`, `level` (with `sortOrder`); keep in the app the form lists (taskType, employeeType,
  shiftMoment, firstAidTreatment, actionPriority, actionCategory, disease)
- [X] T010 Add Control Panel data to `shared/platform/sampleData.js` (data-model "User", R8):
  `controlPanelRoles: [{ pillarId, level: 'central' | 'cluster' | 'local', plantIds }]` on every
  user (empty when none); new users with `role: null`, `access: []`:
  Ludovic Costa (Central `pillar-hs`, `pillar-ih`), Ed Petrov (Central `pillar-env`), Sergio
  Martins (Central `pillar-ir`), Pascal Fischer (Cluster `pillar-hs`, Lyon + Curitiba); Lucas
  Weber: event role Manager at Lyon and Porto (pillars H&S, Environment) and Cluster `pillar-hs`
  and `pillar-env` for Lyon + Porto; Local roles for Eva Novak (all four pillars, Lyon), Carla
  Mendes (`pillar-hs`, Lyon), Felix Tanaka (`pillar-hs`, `pillar-env`, Curitiba). Rule: "`central`
  → `plantIds` = all plants; `cluster` → 2+ plants; `local` → exactly one plant. At most one role
  per pillar per user."
- [X] T011 [P] Create `shared/platform/organization.js`: move `getAncestry` and `getPlantOf`
  from `apps/event-reporting/src/logic/locations.js` and `getPillarIdsForPlant` from
  `apps/event-reporting/src/logic/access.js`; add `getPlants(organization)`; move their tests
  into `shared/platform/organization.test.js`
- [X] T012 [P] Create `shared/platform/permissions.js` (contracts/platform-api.md):
  `LEVEL_ORDER = { central: 3, cluster: 2, local: 1 }`, `LEVEL_LABELS`, `getRole(user,
  pillarId)`, `hasControlPanelAccess(user)`, `coveredPlantIds(role, organization)` (all plants for
  Central), `plantsOverlap(a, b)`, `canSeeUser(viewer, user, organization)` (Central sees all;
  others: user has event access to or a role on one of the viewer's plants)
- [X] T013 [P] Write `shared/platform/permissions.test.js`: role lookup per pillar, Central covers
  all plants, a role on H&S gives nothing on Environment (FR-003), `canSeeUser` for Lucas Weber
  (Lyon + Porto) excludes Ben Okafor (Curitiba)
- [X] T014 Create `shared/platform/platformData.js` — part 1 (research R4, data-model "Stores"):
  `openPlatform()` opens database `platform` version 1 with stores `users`, `organization`,
  `reference`, `workflowSettings` (index `byPillar`), `masterValues` (index `byList`),
  `activations` (index `byValue`), `audit` (index `byPillar`), `notifications` (index `byUser`),
  `meta`; seeds from `sampleData.js` when `meta.seededAt` is missing; `loadPlatform()` →
  `{ users, organization, reference }`; `resetPlatformData()` clears every store and reseeds
- [X] T015 Update Event Reporting to read platform data: `apps/event-reporting/src/data/db.js`
  version 6 deleting and no longer creating `users` and `organization` (keep `reference` for the
  form lists only); `seedIfEmpty`/`resetDemoData` stop writing users and organization;
  `resetDemoData` also calls `resetPlatformData()`; `apps/event-reporting/src/App.jsx` loads
  `loadPlatform()` and merges platform `reference` with the app's form lists; imports from
  `../../../shared/platform/…` only
- [X] T016 Update Event Reporting imports to the moved helpers
  (`apps/event-reporting/src/logic/locations.js`, `access.js` and their callers) so they import
  `getAncestry`, `getPlantOf`, `getPillarIdsForPlant` from `shared/platform/organization.js`;
  `apps/event-reporting/src/shell/StartScreen.jsx` lists only users with an event role
  (`role !== null`); run `npm test` and the quickstart 001 scenario 1 through the launcher
- [X] T017 Build the Control Panel shell in `apps/control-panel/src/`: copy and adapt `Icon.jsx`
  and `Sheet.jsx` from Event Reporting into `shell/`; `App.jsx` with `createHashRouter` routes
  of [contracts/routes.md](contracts/routes.md) (placeholders for tabs), `AppContext` (`users`,
  `organization`, `reference`, `user`, `signIn`, `signOut`, `reloadPlatform`), session in
  `sessionStorage` key `control-panel.userId`
- [X] T018 [P] Create `apps/control-panel/src/shell/StartScreen.jsx` (route `#/`): demo users,
  those without a Control Panel role disabled with "No Control Panel role"; **Reset demo data**
  button calling `resetPlatformData()`
- [X] T019 [P] Create `apps/control-panel/src/shell/Header.jsx` (app name link to `#/pillars`,
  bell placeholder, avatar with switch user), `NotAllowed.jsx` ("You don't have access to this
  page.", link to `#/pillars`, sets `document.title`) and `NotFound` handling
- [X] T020 Create `apps/control-panel/src/shell/PillarPicker.jsx` (route `#/pillars`) and
  `PillarLayout.jsx` (routes `#/pillars/:pillarId/*`): cards for the pillars the user holds a role
  on with level badge and plants ("All plants", "Lyon, Porto"); context bar (pillar · level ·
  plants) and tabs Workflow · Master data · Audit; access check with `getRole` → `NotAllowed`
- [X] T021 Add Control Panel layout styles to `apps/control-panel/src/app.css` (header, context
  bar, tabs, cards, grid card with horizontal scroll from 320px, sheet) using only
  `shared/theme.css` variables

**Checkpoint**: Both apps open through the launcher and share users and plants; the Control
Panel signs in and offers each user's pillars

---

## Phase 3: User Story 1 - Set which workflow phases are required (Priority: P1) 🎯 MVP

**Goal**: Settings, Result per plant and Compare plants views; settings combine per the rule;
new events keep their workflow and close when only Submission is required

**Independent Test**: Quickstart scenarios 1–4

### Tests for User Story 1

- [X] T022 [P] [US1] Write `shared/platform/workflow.test.js`: `resultingWorkflow` with the
  example of spec Story 1 (Central Review TF1–3, Cluster Lyon+Porto Root cause TF1–2, Local Lyon
  Actions TF3) gives Lyon TF3 = Review + Actions, Porto TF3 = Review, Curitiba TF1 = Review;
  submission always required; overlapping clusters both apply; `cellStateFor` returns `locked`
  for Local on a Central cell; `canEditSetting` true for Carla on Eva's Local Lyon setting, true
  for Pascal on Lucas's Cluster setting (same level, Lyon in common), false for Eva on a Cluster
  setting; `workflowForEvent` reviewers
  filtered to the event's plant and pillar; `isOnlySubmission`

### Implementation for User Story 1

- [X] T023 [US1] Create `shared/platform/workflow.js` (data-model "Workflow setting",
  "Resulting workflow"): `PHASES = ['submission', 'review', 'rootCause', 'actions',
  'validation']`, `PHASE_LABELS`, `settingApplies(setting, plantId)` ("applies to a plant when
  `scopeLevel = central`, or its `plantIds` include the plant"), `resultingWorkflow`,
  `cellStateFor` (`mine` / `optional` / `locked`), `validReviewers(users,
  { pillarId, plantIds })` (event role Manager or Site Admin with the pillar at the plants),
  `workflowForEvent(settings, users, event)` → `{ computedAt, phases }`, `isOnlySubmission`
- [X] T024 [US1] Add `canEditSetting(user, setting)` to `shared/platform/permissions.js`
  ("the user holds a role on the setting's pillar at the same `scopeLevel`, and their plants
  overlap the setting's plants (Central always overlaps)")
- [X] T025 [US1] Add the starting workflow settings to `shared/platform/sampleData.js`: a few
  Central settings on each pillar (e.g., H&S Review TF1–TF2 with reviewers Carla Mendes and Eva
  Novak; Environment Review EVE1; Industrial Risk Root cause SRE1), no setting for TF4/TF5 (so
  they close at submission); seed them in `openPlatform()`
- [X] T026 [US1] Add to `shared/platform/platformData.js`: `getWorkflowSettings(pillarId?)` and
  `saveWorkflowSetting(user, { pillarId, levelCode, phase, required, reviewerIds })` in one
  transaction — refuse `submission`; refuse Review without reviewers ("Choose at least one
  reviewer."); find the setting of the user's level and perimeter ("one setting per `pillarId +
  levelCode + phase + scopeLevel + plantIds` (sorted)"); create / update (new `authorId`,
  `updatedAt`) / delete when `required` is false; refuse when `canEditSetting` is false; write an
  audit entry (`subject: 'workflow'`, `action` `required` | `optional` | `reviewers`, readable
  `before`/`after`); when the previous author differs, add a notification for them (FR-009)
- [X] T027 [P] [US1] Create `apps/control-panel/src/workflow/ReviewersPicker.jsx`: sheet with a
  multi-select of `validReviewers` (name, role, plants), Done disabled until ≥ 1, warning for
  saved reviewers who lost access
- [X] T028 [US1] Create `apps/control-panel/src/workflow/SettingsGrid.jsx` (route
  `#/pillars/:pillarId/workflow`): rows = levels of the pillar with description, columns = 5
  phases; Submission "Required" disabled ("Always required"); per `cellStateFor`: switch for
  `mine`/`optional`, lock + "Required by Central — Ludovic Costa, 24 Oct 2026" for `locked`
  (a `mine` cell set by someone else shows "Set by <name>"); Review on → `ReviewersPicker`; confirm before changing
  another person's setting ("<name> set this. They will be notified."); toast "Saved — applies to
  new events"; errors shown in place
- [X] T029 [US1] Create `apps/control-panel/src/workflow/WorkflowTab.jsx` with the view switch
  Settings · Result per plant · Compare plants (Compare only for Central and Cluster) and the
  `document.title` per view
- [X] T030 [P] [US1] Create `apps/control-panel/src/workflow/ResultGrid.jsx` and
  `CellDetails.jsx` (route `…/workflow/result`): plant picker limited to `coveredPlantIds`;
  read-only grid with origin badge (highest level + "+n"); muted Optional cells; clicking a cell
  opens `CellDetails` in a `Sheet` (each source: level, perimeter, author, date; reviewers)
- [X] T031 [P] [US1] Create `apps/control-panel/src/workflow/EventPath.jsx`: for the chosen level
  row, phases in order with Optional ones crossed out (`<s>` with an accessible label "skipped"),
  ending with "Closed after submission" when only Submission is required
- [X] T032 [P] [US1] Create `apps/control-panel/src/workflow/ComparePlants.jsx` (route
  `…/workflow/compare`): level picker; rows = phases, columns = covered plants; cells Required
  with origin badge or Optional
- [X] T033 [US1] Create `apps/control-panel/src/shell/NotificationsPanel.jsx` and add
  `getNotifications(userId)` / `markNotificationsRead(userId)` to
  `shared/platform/platformData.js`; bell count in `Header.jsx` (FR-023)
- [X] T034 [US1] Event Reporting submission (research R6, FR-012, FR-026): in
  `apps/event-reporting/src/App.jsx` (or the submit caller in `create/EventForm.jsx`) read
  `getWorkflowSettings(event.pillarId)` before submitting and pass `workflowForEvent(...)` to
  `submitEvent`; in `apps/event-reporting/src/data/db.js` `submitEvent` stores `event.workflow`
  and sets `status = 'Closed'`, `closedAt = now` when `isOnlySubmission`, else `'Open'`; update
  the comment
- [X] T035 [P] [US1] Add a test in `apps/event-reporting/src/logic/` (e.g.,
  `submission.test.js`) for a small pure helper `getSubmittedStatus(workflow)` → `'Closed'` |
  `'Open'` used by `submitEvent`
- [X] T036 [US1] Event Reporting display: `events/EventDetail.jsx` saved banner adds "— closed
  right away (no other phase required)" when the event is Closed; sample events in
  `apps/event-reporting/src/data/sampleData.js` get a `workflow` computed with
  `workflowForEvent` from the starting settings at seed time
- [X] T037 [US1] Run quickstart scenarios 1–4 through the launcher; fix what fails

**Checkpoint**: Workflow fully usable; Event Reporting stores the workflow and closes TF4/TF5
events with no required phase

---

## Phase 4: User Story 2 - Maintain the master data lists of a pillar (Priority: P2)

**Goal**: Lists per pillar with the initial catalogs, governance per level, availability per
plant, lifecycle and audit

**Independent Test**: Quickstart scenario 5

### Tests for User Story 2

- [X] T038 [P] [US2] Write `shared/platform/masterData.test.js`: catalog counts (14 Standards, 36
  Hazards, 8 Body Part Categories, 38 Injuries, 15 Aspects, 13 Impacts, 11 Categories);
  `availableValues` excludes Retired, Inactive, values deactivated by Central / covering Cluster /
  the plant's Local, Cluster values outside their perimeter, and Body Parts of an unavailable
  category; `allowedValueActions` for Central, Cluster (own vs Central value), Local and fixed
  lists; `validateValue` refuses duplicate code in list + owner scope, missing name, missing code
  for Standards/Hazards/Categories, Body Part without category, active Body Part with a
  non-Active category

### Implementation for User Story 2

- [X] T039 [P] [US2] Create `shared/platform/catalogs.js` with the initial catalogs from
  `specs/001-event-reporting/source/Control Panel/` (`standard.md`, `hazard.md` A1…I1,
  `body-part.md` with the 8 categories, `injury.md`, `aspect-impact.md`,
  `industrial-risk-category.md` IRC1–IRC11), each value `ownerLevel: 'central'`,
  `ownerPlantIds: []`, `status: 'Active'`
- [X] T040 [US2] Create `shared/platform/masterData.js` (data-model "Master data list", "Master
  data value", "Activation choice"): `LISTS` (ids `standards`, `hazards`, `bodyPartCategories`,
  `bodyParts`, `injuries`, `aspects`, `impacts`, `irCategories` with pillar, `fixedGlobal`,
  `hasCode`, `parentListId`), `listsForPillar(pillarId)` (Industrial Risk adds `standards` and
  `hazards` with `readOnly: true, ownedBy: 'pillar-hs'`; Industrial Hygiene → none),
  `availableValues`, `allowedValueActions(user, list, value)`, `validateValue(list, value,
  existingValues)` → `{ field: message }`; lifecycle "Active ⇄ Inactive (by owner) → Retired (by
  owner, final)"
- [X] T041 [US2] Add to `shared/platform/platformData.js`: seed `masterValues` from
  `catalogs.js`; `getMasterData(listId)` → `{ values, activations }`; `saveValue(user, value)`
  (validation + permission, audit `add`/`edit`); `setValueStatus(user, valueId, status)` (owner
  only; Retired final; audit); `setActivation(user, valueId, active)` (create or delete the
  choice at the user's level and plants; a Local cannot remove a Cluster's choice; audit
  `deactivate`/`reactivate`)
- [X] T042 [US2] Create `apps/control-panel/src/masterData/MasterDataTab.jsx` (routes
  `…/master-data` and `…/master-data/:listId`): list chips from `listsForPillar`, "Owned by
  Health & Safety" mark for read-only lists, Industrial Hygiene message "Master data comes later",
  plant picker "Availability for: <plant>"
- [X] T043 [US2] Create `apps/control-panel/src/masterData/ValueList.jsx`: table code, name,
  owner (Central / Cluster Lyon + Porto), status badge, "Available at <plant>" yes/no, only the
  actions `allowedValueActions` grants (Edit, Deactivate / Reactivate, Retire with confirm); Body
  Parts grouped by category; search by code or name
- [X] T044 [P] [US2] Create `apps/control-panel/src/masterData/ValueForm.jsx`: sheet with code
  (when the list has codes), name, description, category (Body Parts); messages from
  `validateValue`; "Add value" shown only when allowed
- [X] T045 [US2] Run quickstart scenario 5 with Ludovic, Lucas, Eva, Ed and Sergio; fix what
  fails

**Checkpoint**: Master data governed per level; availability per plant matches a manual count

---

## Phase 5: User Story 3 - Know who can do what in the Control Panel (Priority: P3)

**Goal**: Access rules visible everywhere and a complete audit trail per pillar

**Independent Test**: Quickstart scenario 6 (access part) and audit entries for every change of
scenarios 1–5

- [ ] T046 [US3] Add `getAudit(pillarId)` (newest first) to `shared/platform/platformData.js`
  and create `apps/control-panel/src/audit/AuditTab.jsx` (route `…/audit`): filters subject
  (Workflow or a list) and user; rows date, user, level and plants, subject, target, before →
  after
- [ ] T047 [US3] Check route guards in `apps/control-panel/src/App.jsx` against
  [contracts/routes.md](contracts/routes.md): no role → `NotAllowed` on every route except `#/`;
  pillar without role → `NotAllowed`; Compare plants for Local → `NotAllowed`; unknown pillar or
  user → "Not found"
- [ ] T048 [US3] Run quickstart scenario 6 (access) and confirm every change made in scenarios 1–5
  appears in the audit trail with author, date, before and after (SC-005)

**Checkpoint**: Access and audit complete

---

## Phase 6: User Story 4 - See users and their access (Priority: P4)

**Goal**: Read-only users list and user detail within the viewer's perimeter

**Independent Test**: Quickstart scenario 6 (users part)

- [X] T049 [US4] Create the User Management skeleton in `apps/user-management/` like the Control
  Panel's (T005–T006): `package.json` (`"name": "user-management"`, same scripts), `index.html`
  (`<title>User Management</title>`, script `./src/main.jsx`), `vite.config.js` (React plugin,
  `server.port` 5175, `server.fs.allow` app folder and `../../shared`), `.gitignore`,
  `src/main.jsx`, `src/app.css`; install the **same exact versions** as the Control Panel
  (`react@19.3.1 react-dom@19.3.1 react-router-dom@7.18.4 @fontsource/poppins@5.3.0`; dev
  `vite@8.3.5 @vitejs/plugin-react@6.1.2`); add `{ folder: 'user-management', name: 'User Management', port: 5183 }` to
  `launcher/apps.js` and a third card to `launcher/index.html` ("User
  Management — See users, their plants, pillars and Control Panel roles.", link
  `/apps/user-management/`)
- [X] T050 [US4] Build the User Management shell in `apps/user-management/src/`: copy `Icon.jsx`
  from the Control Panel's `shell/`; `App.jsx` with `createHashRouter` (`#/`, `#/users`,
  `#/users/:userId`), context (`users`, `organization`, `reference`, `workflowSettings`, `user`,
  `signIn`, `signOut`) loaded with `loadPlatform()` and `getWorkflowSettings()`; session key
  `user-management.userId`; `shell/StartScreen.jsx` (users without a Control Panel role disabled
  with "No Control Panel role"), `shell/Header.jsx` (app name link to `#/users`, avatar with
  switch user), `shell/NotAllowed.jsx`; access check `hasControlPanelAccess`
- [X] T051 [P] [US4] Create `apps/user-management/src/users/UsersList.jsx` (route `#/users`):
  users filtered with `canSeeUser`; search by name; filters plant, pillar, role; columns name,
  event role, plants, pillars, Control Panel roles as badges ("H&S · Cluster"); row opens the
  detail; `document.title` "Users — User Management"
- [X] T052 [P] [US4] Create `apps/user-management/src/users/UserDetail.jsx` (route
  `#/users/:userId`): event access per plant (pillars), Control Panel roles (pillar, level,
  plants), review groups (settings whose `reviewerIds` include the user: pillar, level code,
  scope); no edit action; out of perimeter → `NotAllowed`
- [X] T053 [US4] Run quickstart scenario 6 (users) through the launcher with Ludovic and Lucas

**Checkpoint**: All four stories work

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T054 [P] Create `apps/control-panel/README.md` and `apps/user-management/README.md`
  (what it does, how to run through the launcher, how to test) and update `apps/event-reporting/README.md` (run through the launcher
  for shared data)
- [ ] T055 [P] Update the root `README.md`: list the Control Panel and User Management, explain the launcher
  (`cd launcher && npm install && npm run dev`) and `shared/platform/`
- [ ] T056 Check every Control Panel and User Management screen at 320px and with the keyboard (switches, sheets,
  pickers, tabs), titles per screen, `alt`/labels on icons (constitution IV)
- [ ] T057 Run `npm test` in the Control Panel and Event Reporting and `npm run build` in all
  three apps; open all three through the launcher with no console errors
- [ ] T058 Run the whole [quickstart.md](quickstart.md) once more from **Reset demo data** and mark
  this file complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup — blocks all stories (T015–T016 change Event Reporting
  and must keep it working)
- **US1 (Phase 3)**: after Foundational
- **US2 (Phase 4)**: after Foundational; independent of US1 (shares only `platformData.js`, so
  edit it in sequence)
- **US3 (Phase 5)**: after US1 and US2 (audits their changes)
- **US4 (Phase 6)**: after Foundational (new app `apps/user-management/`); review groups need
  US1 settings to show content
- **Polish (Phase 7)**: after the stories wanted

### Within Each Story

- Tests and rule functions in `shared/platform/` first, then `platformData.js`, then screens
- `shared/platform/platformData.js` is touched by T014, T026, T033, T041, T046 — never in parallel

### Parallel Opportunities

- T007 with T005–T006; T011, T012, T013 together; T018, T019 together
- US1: T022 with T027; T030, T031, T032 together after T029; T035 with T034's screen work
- US2: T038 with T039; T044 alongside T043
- US4: T051 and T052 together

---

## Parallel Example: User Story 1

```text
Task: "Write shared/platform/workflow.test.js"            (T022)
Task: "Create apps/control-panel/src/workflow/ReviewersPicker.jsx" (T027)

# after WorkflowTab (T029):
Task: "ResultGrid.jsx + CellDetails.jsx"                   (T030)
Task: "EventPath.jsx"                                       (T031)
Task: "ComparePlants.jsx"                                   (T032)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup → Phase 2 Foundational (Event Reporting still works through the launcher)
2. Phase 3 US1 → **stop and validate** quickstart scenarios 1–4
3. Demo: workflow per level and events closing or opening accordingly

### Incremental Delivery

1. + US2 master data → scenario 5
2. + US3 audit and guards → scenario 6 (access)
3. + US4 users → scenario 6 (users)
4. Polish → full quickstart

---

## Notes

- Commit after each task or logical group with Conventional Commits (`feat:`, `refactor:`,
  `docs:`…)
- Never import from one app into another; only `shared/` is common
- Check the browser console before each commit (constitution III)
