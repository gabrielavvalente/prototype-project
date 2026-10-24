---

description: "Task list for the Event Reporting MVP (Global Shell, Event Creation, Event Library)"
---

# Tasks: Event Reporting — MVP (Global Shell, Event Creation, Event Library)

**Input**: Design documents from `specs/001-event-reporting/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/routes.md](contracts/routes.md),
[quickstart.md](quickstart.md)

**Tests**: Small Vitest tests for business-rule functions only (plan, research R4, constitution
principle III). Screens are checked manually with [quickstart.md](quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be built and checked on its
own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: User story the task belongs to (US1, US2, US3)
- All paths are relative to the repository root; the app lives in `apps/event-reporting/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the app folder, install the pinned dependencies and the shared theme

- [X] T001 Create the Vite + React app skeleton by hand in `apps/event-reporting/`:
  `package.json` (`"name": "event-reporting"`, `"private": true`, `"type": "module"`, scripts
  `dev: vite`, `build: vite build`, `preview: vite preview`, `test: vitest run`), `index.html`
  (`<html lang="en">`, `<title>Event Reporting</title>`, `<div id="root">`, script
  `/src/main.jsx`), `vite.config.js` (React plugin; `server.fs.allow` set to the app folder and
  `../../shared`), `src/main.jsx` (renders `<App />` inside `React.StrictMode`) and a placeholder
  `src/App.jsx`
- [X] T002 Install dependencies with exact versions (research R7) from `apps/event-reporting/`:
  `npm install --save-exact react react-dom react-router-dom idb` and
  `npm install --save-exact --save-dev vite @vitejs/plugin-react vitest`; confirm
  `apps/event-reporting/package.json` has no `^` or `~` and commit `package-lock.json`
- [X] T003 [P] Create `apps/event-reporting/.gitignore` ignoring `node_modules/` and `dist/`
- [X] T004 [P] Create `shared/theme.css` (research R5): CSS custom properties on `:root` for
  colors (primary, text, muted, background, surface, border, error, success, warning, focus),
  font family and sizes, spacing scale, radius; base styles for `body`, headings, `.button`,
  `.button--primary`, `.button--secondary`, form fields (`input`, `select`, `textarea`, labels),
  `.field-error` messages, a visible `:focus-visible` outline, and touch targets of at least 44px
- [X] T005 [P] Create `apps/event-reporting/src/app.css` with app layout only (page container,
  header bar, side panels, cards, table wrapper with horizontal scroll at narrow widths), using
  only variables from `shared/theme.css`; import `../../../shared/theme.css` and `./app.css` in
  `apps/event-reporting/src/main.jsx`
- [X] T006 Run `npm run dev` in `apps/event-reporting/` and confirm the placeholder page opens with
  no console errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data storage, sample data, access rules and the signed-in app frame that every story
needs

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create `apps/event-reporting/src/data/sampleData.js` exporting plain arrays that match
  [data-model.md](data-model.md):
  - `reference`: pillars (Health & Safety `H&S`, Environment `ENV`, Site Risk `SITE_RISK`,
    Industrial Hygiene `IH`); families (`SAF`, `ENV`, `IR`, `OH`) linked to pillars; levels with
    plain-language descriptions — TF1 Lost Time Accident, TF2 Non-Lost Time Accident, TF3 First
    Aid, TF4 Near Miss ("Something occurred but nobody was hurt"), TF5 Hazardous Situation; EvE1
    Major environmental accident, EvE2 Environmental accident, EvE3 Environmental accident (minor),
    EvE4 Near-accident, EvE5 Poor environmental situation / condition; SRE1 Major site risk
    accident, SRE2 Significant site risk accident, SRE3 Moderate site risk accident, SRE4 Site risk
    near accident, SRE5 Site risk hazardous acts or conditions; OH disease classifications (at least
    3) and the Disease(s) list; task types; employee types (Employee, Temporary Worker, Permanent
    Contractor, Non-Permanent Contractor, Other); shift moments (Day, Night, Afternoon); action
    priorities; action categories with subcategories
  - `organization`: 2 businesses; 3 plants (different plant types and countries, each with
    `plantTypeIcon`, `plantTypeLabel`, `countryFlag`, `countryName`); for each plant a hierarchy of
    at least 2 departments → 2 workshops → 2 jobs → 2 workstations → 2 tasks
  - `users`: at least 2 User, 2 Manager and 1 Site Admin across plants and pillars, one user with
    access to both businesses, one user only in a third plant; fictional names
  - `events`: about 30 events across all pillars and plants — drafts, `Open` events with HPR Yes,
    TF1–TF3 events with immediate actions, OH events with diseases — with record numbers in the
    format `<FAMILY>-<YEAR>-<NNNN>`, and matching `counters`
  - `alerts`: a few "Event submitted" alerts for the Managers
- [X] T008 Create `apps/event-reporting/src/data/db.js` using `idb`: open database
  `event-reporting` version 1 with stores `events`, `attachments`, `alerts`, `users`,
  `organization`, `reference`, `counters`, `settings` (key `id`) and indexes `events.plantId`,
  `events.status`, `events.reporterId`, `events.recordNumber` (unique), `attachments.eventId`,
  `alerts.recipientId`, `organization.parentId`; export small helpers (`getAll(store)`,
  `getById(store, id)`, `getByIndex(store, index, value)`, `put(store, item)`), `seedIfEmpty()`
  (loads `sampleData.js` when `users` is empty), `resetDemoData()` (clears every store and seeds
  again) and a `StorageFullError` thrown when the browser reports `QuotaExceededError`
- [X] T009 [P] Create `apps/event-reporting/src/logic/access.js` (research R11) with plain
  functions: `getMenuItems(role)` (User: Events, Create Event, My Alerts; Manager: same; Site Admin:
  Events only — contracts/routes.md), `canOpenRoute(role, routeName)`, `isEventVisible(user,
  context, event)` (event business and plant equal the context, pillar in the user's access for
  that plant, equal to `context.pillarId` when it is not null, and drafts only for their
  reporter), `canEditEvent(user, event)` (reporter on own `Draft`; Manager on any visible event;
  never Site Admin), `getManagersToAlert(users, event)` (role `Manager` whose access includes the
  event's plant and pillar)
- [X] T010 [P] Create `apps/event-reporting/src/logic/access.test.js` covering each role's menu,
  route refusals (Site Admin on `events/new`), visibility across plant, pillar context, other
  users' drafts, edit rights and alert recipients
- [X] T011 [P] Create `apps/event-reporting/src/shell/NotAllowed.jsx` with two variants:
  "You do not have permission to open this page." and "Event not found.", each with a link back to
  Events (contracts/routes.md → Refusals)
- [X] T012 Create `apps/event-reporting/src/shell/StartScreen.jsx`: page title "Event Reporting",
  list of demo users (avatar, name, role, plants) as buttons; signing in stores the user id in
  `sessionStorage` and, if the user has no `settings` record, saves one with their first business
  and plant and `pillarId: null`; a **Reset demo data** button that asks for confirmation and calls
  `resetDemoData()`
- [X] T013 Create `apps/event-reporting/src/shell/Header.jsx` (basic version): avatar, name, role,
  current plant name and a **Switch user** button that clears `sessionStorage` and goes to `#/`;
  links to Events and Create Event
- [X] T014 Replace `apps/event-reporting/src/App.jsx` with a `HashRouter` app: calls
  `seedIfEmpty()` on start (shows "Loading…" until done); loads the signed-in user and their
  `settings` (context) and provides them through a React context (`AppContext`) with a
  `setContext` function; routes from contracts/routes.md (`/`, `/entry`, `/events`,
  `/events/new`, `/events/:id`, `/events/:id/edit`) with placeholder pages; redirects to `#/` when
  not signed in; a `RequireRoute` wrapper that uses `canOpenRoute` and renders `NotAllowed`;
  renders `Header` on every signed-in page

**Checkpoint**: Sign in as each demo user, see the header, open placeholder pages; Site Admin gets
the permission message on `#/events/new`; `npm test` passes

---

## Phase 3: User Story 1 - Report an event from the shop floor (Priority: P1) 🎯 MVP

**Goal**: A worker reports an event through the guided form, saves a draft or submits it and gets a
record number; Managers of the plant and pillar get an alert (spec User Story 1)

**Independent Test**: As a User, report a TF4 event at 320px width and a TF2 event with a photo and
an immediate action; both get record numbers, the TF2 detail shows the action as Completed, and a
Manager of that plant and pillar has two new alerts in the `alerts` store (quickstart scenarios
1–4)

### Tests for User Story 1

- [X] T015 [P] [US1] Create `apps/event-reporting/src/logic/validation.test.js` covering every rule
  in the table "Validation rules summary" of [data-model.md](data-model.md)
- [X] T016 [P] [US1] Create `apps/event-reporting/src/logic/recordNumber.test.js`: `SAF`, 2026, 42
  → `SAF-2026-0042`; sequence 1 → `0001`; counter id `SAF-2026`

### Implementation for User Story 1

- [X] T017 [P] [US1] Create `apps/event-reporting/src/logic/validation.js` with plain functions:
  `getRiskQuestionType(pillarCode, levelCode)` → `'HPR'` for `H&S` and `ENV`, `'CRP'` for SRE1–SRE2,
  `'SRP'` for SRE3–SRE5, `null` for OH (FR-004); `isAttachmentRequired(levelCode)` → TF1, TF2, TF3
  (FR-008); `isImmediateActionRequired(levelCode)` → TF1–TF3 and SRE1–SRE3 (FR-012);
  `validateFile(file, currentCount)` → type must start with `image/` or `video/`, extension in an
  allowed list (jpg, jpeg, png, gif, webp, heic, mp4, mov, webm), "≤ 5 MB (5,242,880 bytes)", at
  most 5 files per event (FR-009); `validateImmediateAction(action, reportDate, today)` →
  description, priority, category and subcategory required, subcategory belongs to category,
  completion date "not after today, not before the event's report date", "1–5 user ids" performers
  (FR-013); `validateSection(sectionName, event, now)` returning a list of `{ field, message }` for
  Classification (pillar, family, level, risk question when required), Location (all levels and
  task type, FR-005), General Information (title "Required, 1–120 characters", event time "not
  later than now when reportDate is today", shift moment, description "Required … up to 2,000
  characters", attachments when required), Event Details (employee type, recurrence, each feedback
  email "must look like an email address", diseases when family is OH, FR-010) and Immediate
  Actions (at least one when required, each valid); `validateEventForSubmit(event, now)` combining
  all sections
- [X] T018 [P] [US1] Create `apps/event-reporting/src/logic/recordNumber.js` with
  `getCounterId(familyCode, year)` and `formatRecordNumber(familyCode, year, sequence)` (4-digit,
  zero-padded, FR-016)
- [X] T019 [US1] Add to `apps/event-reporting/src/data/db.js`: `saveDraft(event, newFiles)` (status
  `Draft`, no record number, sets `createdBy/createdAt/updatedBy/updatedAt`, stores new files in
  `attachments`) and `submitEvent(event, newFiles, users)` doing everything in **one** readwrite
  transaction over `events`, `attachments`, `counters`, `alerts` (research R10): read and increment
  `counters[<FAMILY>-<YEAR>]`, set `recordNumber`, `status: 'Open'`, `submittedAt`, save files, and
  add one "Event submitted" alert per user from `getManagersToAlert`; both throw `StorageFullError`
  when storage is full
- [X] T020 [P] [US1] Create `apps/event-reporting/src/create/ClassificationSection.jsx`: pillar
  choice as large cards (hidden when `context.pillarId` is set, FR-037), then family, then level
  cards each showing its code, name and plain-language description (FR-003); the risk question from
  `getRiskQuestionType` as a Yes/No choice with a one-line definition (HPR, "Critical Risk
  Potential", "Serious Risk Potential"); changing pillar, family or level clears answers that no
  longer apply (spec Edge Cases)
- [X] T021 [P] [US1] Create `apps/event-reporting/src/create/LocationSection.jsx`: plant shown from
  the context (read-only); dependent selects Department → Workshop → Job → Workstation → Task, each
  filled with children of the selected parent via `organization.parentId`; changing a parent
  clears all levels below it; Task Type select (FR-005)
- [X] T022 [P] [US1] Create `apps/event-reporting/src/create/AttachmentInput.jsx`: "Add photo or
  video" file input (`accept="image/*,video/*"`, multiple) and "Use camera" input with `capture`
  (FR-007); each file checked with `validateFile` and rejected with a clear message; thumbnails
  (images) or file name (videos) with a Remove button and `alt` text; shows "n of 5 files"
- [X] T023 [US1] Create `apps/event-reporting/src/create/GeneralInfoSection.jsx`: Title (max 120),
  Reporter (select of users in the plant, enabled only when the signed-in user is a Manager,
  default the signed-in user), Report Date (today, read-only), Event Time, Shift Moment (Day / Night
  / Afternoon), Description (multi-line plain text, counter "x / 2000", research R8) and
  `AttachmentInput` with a "required for TF1–TF3" hint (FR-006–FR-008)
- [X] T024 [P] [US1] Create `apps/event-reporting/src/create/DetailsSection.jsx`: Employee type,
  Recurrence Yes/No, Comments, Feedback email recipients (add/remove list) and, only for family OH,
  Disease(s) multi-select (FR-010)
- [X] T025 [P] [US1] Create `apps/event-reporting/src/create/ImmediateActionsSection.jsx`:
  repeatable action cards (Add action / Remove) with Description, Priority, Category, Subcategory
  (filtered by category), Action plan detail, Completion date, KPI ID (optional), Comments and
  "Performed by" multi-select limited to 5 people with the limit explained; each card shows status
  "Completed" (FR-011, FR-013); a "required for TF1–TF3 and SRE1–SRE3" hint
- [X] T026 [US1] Create `apps/event-reporting/src/create/SummarySection.jsx`: one block per section
  with its values, an **Edit** link back to that section, and the missing fields from
  `validateEventForSubmit` flagged next to their section; **Submit** disabled while anything is
  missing; **Save as Draft** always available (FR-014, FR-015)
- [X] T027 [US1] Create `apps/event-reporting/src/create/EventForm.jsx`: holds the event being
  edited in state (new event pre-filled with context business, plant, pillar, reporter = signed-in
  user, report date = today); sections Classification → Location → General Information → Event
  Details → Immediate Actions → Summary with a progress indicator "Section X of 6" and section
  names (FR-002); **Next** runs `validateSection` and shows field errors, **Back** keeps values;
  **Save as Draft** calls `saveDraft` and **Submit** calls `submitEvent`; on success shows a
  confirmation screen ("Event SAF-2026-0042 submitted" with a link to the event, or "Draft saved"
  with a Continue link); on `StorageFullError` shows "Device storage is full. Remove attachments and
  try again." and keeps everything typed; marks the form as dirty and asks "Save as draft, discard
  or stay?" before leaving with unsaved changes (spec Edge Cases); when opened with an `:id`, loads
  that event for editing if `canEditEvent` allows it (FR-017, FR-034)
- [X] T028 [US1] Create `apps/event-reporting/src/events/EventDetail.jsx`: loads the event by
  record number or draft id; shows `NotAllowed` "Event not found." when missing or not
  `isEventVisible`; shows every field entered at creation grouped like the form, attachments
  (images displayed from their stored files with `alt` text, videos playable) and immediate actions
  with status Completed; **Edit** button only when `canEditEvent` (FR-033)
- [X] T029 [US1] Wire `/events/new`, `/events/:id` and `/events/:id/edit` in
  `apps/event-reporting/src/App.jsx` to `EventForm` and `EventDetail`; the Create Event link in the
  header opens the form in one tap (FR-001)

**Checkpoint**: Quickstart scenarios 1–4 pass; `npm test` passes

---

## Phase 4: User Story 2 - Work inside a trusted application frame (Priority: P2)

**Goal**: Full header with business, plant and optional pillar context, role-based navigation,
My Alerts panel, and scope applied everywhere (spec User Story 2)

**Independent Test**: Sign in as demo users with different roles and plants; header, navigation,
visible events and My Alerts match each user's role and scope; entering through a pillar filters
events and skips the pillar step (quickstart scenarios 5–6)

### Implementation for User Story 2

- [X] T030 [P] [US2] Create `apps/event-reporting/src/shell/EntryScreen.jsx`: title "Choose where to
  start"; one card per pillar the user can access in the current plant and an **Enter without a
  pillar** button; saves `pillarId` (or `null`) to `settings` through `setContext` and opens
  `#/events` (FR-037)
- [X] T031 [P] [US2] Create `apps/event-reporting/src/shell/Navigation.jsx` rendering only the items
  from `getMenuItems(user.role)` (FR-022), as a horizontal bar that wraps on narrow screens
- [X] T032 [P] [US2] Create `apps/event-reporting/src/shell/AlertsPanel.jsx`: sliding panel from the
  right listing the signed-in user's alerts newest first, each with source event record number and
  title, type and creation date; selecting one opens `#/events/<record number>` and closes the
  panel; Escape and a Close button close it; focus moves into the panel when opened and back to the
  header control when closed; empty state "No alerts yet." (FR-023)
- [X] T033 [US2] Expand `apps/event-reporting/src/shell/Header.jsx` (FR-018–FR-020): avatar, name,
  role; business selector only when the user has more than one business (saves the new context and
  calls `window.location.reload()`); plant selector listing each accessible plant with plant-type
  icon, country flag and their text labels; current pillar or "All pillars" with a **Change**
  link to `#/entry`; My Alerts button with unread count for User and Manager opening
  `AlertsPanel`; `Navigation`; Switch user; asks for confirmation before changing business, plant
  or pillar while the creation form is dirty (spec Edge Cases)
- [X] T034 [US2] Update `apps/event-reporting/src/shell/StartScreen.jsx` and
  `apps/event-reporting/src/App.jsx` so that after sign-in the user lands on `#/entry`, and every
  signed-in route except `#/entry` redirects there until a context exists for the session
- [X] T035 [US2] Make `apps/event-reporting/src/events/EventDetail.jsx` and
  `apps/event-reporting/src/create/EventForm.jsx` read the current context from `AppContext` so
  plant and pillar changes apply immediately (pillar step skipped when a pillar is selected; event
  hidden with "Event not found." when it falls outside the new context) (FR-021)

**Checkpoint**: Quickstart scenarios 5–6 pass; User Story 1 still passes

---

## Phase 5: User Story 3 - Find and act on existing events (Priority: P3)

**Goal**: Event library with KPI tiles, search, filters, sorting, pagination, column choices,
quick view and View/Edit actions (spec User Story 3)

**Independent Test**: With the sample data, list, search, every filter, every KPI tile, quick
view, View and Edit behave as described for a Manager and for a User (quickstart scenario 7)

### Tests for User Story 3

- [X] T036 [P] [US3] Create `apps/event-reporting/src/logic/eventList.test.js` covering search by
  title and by record number (case-insensitive), each filter alone and combined with search,
  My Events, sorting by each column in both directions, page sizes 20/50/100 and KPI counts
  (drafts excluded)

### Implementation for User Story 3

- [X] T037 [P] [US3] Create `apps/event-reporting/src/logic/eventList.js` with plain functions:
  `searchEvents(events, text)` (title contains text, or record number equals text, ignoring case,
  FR-029); `applyFilters(events, filters, currentUserId)` for type and level, time range on
  `reportDate`, organization (Department → Task), reporter, HPR flag, status (`Draft` / `Open`) and
  My Events (FR-030); `sortEvents(events, key, direction)` for date, type, level, status, reporter;
  `paginate(events, pageSize, page)`; `computeKpis(events)` → `{ total, open, withHpr }` counting
  only non-draft events (FR-031)
- [X] T038 [P] [US3] Create `apps/event-reporting/src/events/KpiTiles.jsx`: three clickable tiles
  (Total Events, Open Events, Events With HPR) showing counts of the filtered list; clicking a tile
  sets its filter (Total clears status and HPR filters) (FR-031)
- [X] T039 [P] [US3] Create `apps/event-reporting/src/events/FilterBar.jsx`: search box and filters
  for Type (and level), Time range (from / to), Organization (Department → Task dependent selects),
  Reporter, HPR (Any / Yes / No), Status (Any / Draft / Open), My Events toggle, and **Clear all**
  (FR-029, FR-030)
- [X] T040 [P] [US3] Create `apps/event-reporting/src/events/EventTable.jsx`: columns Record number,
  Title, Pillar / Family, Level, Status, Reporter, Report date, Department, HPR; sortable headers
  with `aria-sort`; **Columns** menu to show or hide columns, saved to `settings.visibleColumns`
  (FR-028); page size select 20 / 50 / 100 and previous / next page (FR-026); per-row actions
  **Quick view**, **View** and **Edit** (Edit only when `canEditEvent`, FR-032)
- [X] T041 [P] [US3] Create `apps/event-reporting/src/events/QuickView.jsx`: side panel over the
  list showing title, record number, classification, location, status, reporter, first photo and
  immediate actions count, with **Open event** and Close; Escape closes; the list keeps its scroll
  position, filters and page (FR-027)
- [X] T042 [US3] Create `apps/event-reporting/src/events/EventLibrary.jsx`: page title "Events";
  loads events and keeps only those passing `isEventVisible`; holds search, filters, sort, page
  size and page in state; computes the list with `eventList.js`; renders `KpiTiles`, `FilterBar`,
  `EventTable` and `QuickView`; empty states "No events yet." and "No event matches your search."
  with a **Clear search and filters** button (spec Edge Cases)
- [X] T043 [US3] Wire `/events` in `apps/event-reporting/src/App.jsx` to `EventLibrary`, replacing
  the placeholder

**Checkpoint**: Quickstart scenario 7 passes; User Stories 1 and 2 still pass

---

## Phase 5b: UI/UX iteration from the design guideline

**Goal**: Apply the look and interaction patterns of the references in [design/](design/)
(FR-038 to FR-045, research R14) across the three stories, without changing the business rules

**Independent Test**: Quickstart scenarios 1–7 still pass, and every screen at 390px and at
desktop width follows the guideline: top bar, bottom navigation, chips, cards, sheets, stepper

- [X] T049 Install `@fontsource/poppins` with an exact version in `apps/event-reporting/` and import
  weights 400, 500 and 600 in `apps/event-reporting/src/main.jsx`
- [X] T050 Rewrite `shared/theme.css` from the guideline (research R14): color tokens (primary
  blue, teal accent, red/orange/blue severity, one color per pillar, light gray background,
  borders), Poppins font stack, radius (12px cards, pill chips), and shared components: `.chip`
  (+ selected state), `.tag`, `.card`, `.severity-dots`, `.pillar-dot`, `.sheet` (bottom sheet on
  phones, side sheet on wide screens), `.bottom-bar` (fixed action bar), `.icon-button`; text
  contrast at WCAG AA
- [X] T051 [P] Create `apps/event-reporting/src/shell/Icon.jsx` with inline SVG icons (search, bell,
  back, close, plus, filter, grid, list, camera, image, check, chevron, home, calendar) and
  `apps/event-reporting/src/shell/Sheet.jsx` (title, close button, Escape, backdrop, focus moved
  in and restored on close)
- [X] T052 [P] Create `apps/event-reporting/src/logic/display.js` with `getSeverityDots(levelCode)`
  (level 1 → 4, 2 → 3, 3 → 2, 4–5 → 1, OH → 0), `getPillarColor(pillarCode)` and
  `formatRelativeTime(isoText, now)` ("just now", "5 min ago", "2h ago", "3d ago"), with tests in
  `apps/event-reporting/src/logic/display.test.js`
- [X] T053 Replace the header with a compact top bar in `apps/event-reporting/src/shell/Header.jsx`:
  app name, search field opening `#/search`, bell with unread dot, avatar; create
  `apps/event-reporting/src/shell/AccountSheet.jsx` (name, role, business and plant selectors,
  pillar with Change, Switch user) and `apps/event-reporting/src/shell/BottomNav.jsx` (Home,
  Events, floating New for User/Manager; phones only) (FR-040)
- [X] T054 Turn `apps/event-reporting/src/shell/AlertsPanel.jsx` into a notifications sheet:
  relative time, unread highlight, **Mark all read**, opening an alert sets `readAt`; unread count
  from `readAt` instead of `alertsSeenAt` (FR-043)
- [X] T055 Create `apps/event-reporting/src/shell/SearchPage.jsx` and route `#/search`: autofocused
  field, Cancel, last 5 searches from `settings.recentSearches`, live results by title or record
  number among visible events, exact record number opens the event (FR-044)
- [X] T056 Update `apps/event-reporting/src/logic/eventList.js` (and its tests): `computeKpis`
  returns `{ all, mine, open, withHpr, drafts }` (drafts only under Drafts) and a `applyQuickFilter`
  for the chip row (FR-031)
- [X] T057 Rework the library: `KpiTiles.jsx` → chip row; create
  `apps/event-reporting/src/events/FilterSheet.jsx` (chip groups for family and level, dates,
  organization selects, reporter; Apply / Clear; active count on the Filters button) and
  `apps/event-reporting/src/events/EventCard.jsx` (tags, record number, title, location chip,
  reporter avatar, date, severity dots, red left border for HPR or level 1–2); cards / table
  toggle saved in `settings.listView` in `EventLibrary.jsx` (FR-041, FR-042)
- [X] T058 Rework `apps/event-reporting/src/events/EventDetail.jsx`: top bar with back and record
  number, header card with tags and title, key-facts grid, collapsible sections, history timeline,
  fixed bottom bar with Edit / Continue draft (FR-045)
- [X] T059 Rework the form: create `apps/event-reporting/src/create/Stepper.jsx` (6 visible steps,
  done / current / upcoming, jump back to reached steps) and
  `apps/event-reporting/src/create/ChipGroup.jsx`; use chips for pillar, family, shift moment,
  employee type, recurrence, task type and priority; severity dots on level cards; photo buttons
  inside the description card; Back / Next / Submit in a fixed bottom bar; close (✕) in the title
  row (FR-038, FR-039)
- [X] T060 Restyle `StartScreen.jsx` and `EntryScreen.jsx` (pillar cards with color dots) and run
  quickstart scenarios 1–7 again at 390px and desktop width with no console errors

**Checkpoint**: All stories still pass and the UI follows the design guideline

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, accessibility, performance and the final end-to-end check

- [ ] T044 [P] Create `apps/event-reporting/README.md` with only: what the app does (1–3
  sentences), how to run it (`npm install`, `npm run dev`), and how to test it (`npm test` plus a
  short list of the quickstart checks) — constitution principle V
- [ ] T045 [P] Create root `README.md` listing the apps with a link to `apps/event-reporting/`
- [ ] T046 Set a clear page title (`document.title` and a visible `<h1>`) on every screen in
  `apps/event-reporting/src/` and check at 320px width that no screen scrolls sideways (except the
  event table's own scroll area), every control is reachable with Tab and has a visible focus
  outline, and every image has `alt` text (FR-025)
- [ ] T047 Check performance in the browser: creation form appears in under 2 seconds and the event
  list with 100 rows per page and all filters applied shows in under 3 seconds (SC-003, SC-004);
  if the sample data has fewer than 100 events, temporarily generate extra events to test
- [ ] T048 Run every scenario in [quickstart.md](quickstart.md), `npm test` and `npm run build` in
  `apps/event-reporting/`, and confirm the browser console shows no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — blocks all user stories
- **User Stories (Phases 3–5)**: Depend on Foundational; done in priority order P1 → P2 → P3
- **UI/UX iteration (Phase 5b)**: Depends on User Stories 1–3
- **Polish (Phase 6)**: Depends on the user stories that are in the release (and Phase 5b)

### User Story Dependencies

- **US1 (P1)**: Only Foundational. Uses the default context set at sign-in (first plant, no
  pillar).
- **US2 (P2)**: Only Foundational to build; T035 updates two US1 files, so do it after US1.
  Alerts it shows are created by US1's submit, and sample alerts let it be tested on its own.
- **US3 (P3)**: Only Foundational to build; reuses `EventDetail` (US1) for View and `EventForm`
  (US1) for Edit.

### Within Each User Story

- Logic functions and their tests before the screens that use them
- Section components before `EventForm`; `EventForm` and `EventDetail` before wiring routes
- Story checkpoint passes before moving to the next priority

### Parallel Opportunities

- Setup: T003, T004, T005 together after T001–T002
- Foundational: T009, T010, T011 together after T008
- US1: T015–T018 together; then T020, T021, T022, T024, T025 together
- US2: T030, T031, T032 together
- US3: T036–T041 together
- Polish: T044, T045 together

---

## Parallel Example: User Story 1

```bash
# Business rules and their tests together:
Task: "Create validation.js in apps/event-reporting/src/logic/validation.js"
Task: "Create validation.test.js in apps/event-reporting/src/logic/validation.test.js"
Task: "Create recordNumber.js in apps/event-reporting/src/logic/recordNumber.js"
Task: "Create recordNumber.test.js in apps/event-reporting/src/logic/recordNumber.test.js"

# Independent form sections together:
Task: "Create ClassificationSection.jsx"
Task: "Create LocationSection.jsx"
Task: "Create AttachmentInput.jsx"
Task: "Create DetailsSection.jsx"
Task: "Create ImmediateActionsSection.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. **Stop and validate**: quickstart scenarios 1–4
5. Demo reporting on a phone-sized screen

### Incremental Delivery

1. Setup + Foundational → app opens, demo users sign in
2. + User Story 1 → events can be reported (MVP demo)
3. + User Story 2 → full context, navigation and alerts
4. + User Story 3 → event library
5. Polish → README, accessibility, performance, final check

---

## Notes

- [P] tasks touch different files and do not depend on unfinished tasks
- Commit after each task or small group with Conventional Commit prefixes (`feat:`, `fix:`,
  `docs:`, `chore:`)
- Before each commit: check the main flow of the changed screens and that the console shows no
  errors (constitution principle III)
- Keep functions short and named for what they do (constitution principle I)
