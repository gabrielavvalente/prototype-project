# Quickstart: Event Reporting MVP

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to run the app and prove the MVP works end to end. Screens and access rules are in
[contracts/routes.md](contracts/routes.md); fields and rules in [data-model.md](data-model.md).

## Prerequisites

- **Node.js LTS** (includes `npm`). Install from <https://nodejs.org> and check in a terminal:
  `node --version` and `npm --version`.
- A recent Chrome, Edge, Firefox or Safari. For phone checks, use the browser's device mode at
  320px wide, or open the dev server from a phone on the same network.

## Run

```bash
cd apps/event-reporting
npm install        # first time only
npm run dev        # opens the app at http://localhost:5173
npm test           # runs the business-rule tests once
npm run build      # production build into apps/event-reporting/dist
```

Expected: the dev server starts without errors, the browser console shows no errors, and all
tests pass.

## Validation scenarios

Run them in order on a fresh start (start screen → **Reset demo data**). The demo user names below
are placeholders for the ones defined in the sample data.

### 1. Report a TF4 event on a phone (User Story 1, SC-001, SC-002)

1. Device mode 320px. Sign in as a **User** demo user, enter **without a pillar**.
2. Start Create Event; count taps from the landing screen: ≤ 3.
3. Choose Health & Safety → TF → TF4; answer the SIP question **No**.
4. Fill Location down to Task and a Task Type; fill General Information and Event Details; add no
   attachment and no immediate action.
5. Summary shows every section with no missing fields → **Submit**.

Expected: confirmation with a record number like `TF-26-0001`; status `Open`; done in under
3 minutes.

### 2. Required fields, optional photos and actions (FR-008, FR-012, FR-014, SC-006)

1. Start a new event, choose TF2 and tap **Submit** at once: nothing is saved, the missing fields
   are flagged in place and the page scrolls to the first one.
2. Fill the required fields without any photo or immediate action → Submit is accepted.
3. Report another TF2 with a photo (≤ 5 MB) and an immediate action with 1 performer → Submit.

Expected: both submitted; the second shows the action as **Completed**. Try a 6 MB file and a
`.exe` file: both rejected with a clear message.

### 3. Risk questions and dependent fields (FR-004, FR-005, Edge Cases)

- Industrial Risk → SRE2 asks **CRP**; change to SRE4 → the CRP answer is cleared and **SRP** is asked.
- Environment → any level asks **SIP**. Industrial Hygiene asks no risk question but shows
  Disease(s).
- Location picker: type "station 10" → full paths are listed; browse Department → … → Task;
  "Scan QR code" opens the camera where supported (Chrome on Android) or explains it is
  unavailable.

### 4. Drafts (FR-015, FR-017)

1. Start an event, fill a few fields, **Save as Draft**.
2. Switch to a Manager of the same plant: the draft is not in their list and they have no new alert.
3. Switch back: the draft is in your list (no record number); open, complete and submit it.

### 5. Alerts and pillar entry (FR-016, FR-023, FR-037)

1. Sign in as a **Manager** of the plant and pillar used above. The My Alerts count shows the
   submitted events; open one → the event detail opens.
2. Return to Entry, choose the **Environment** pillar: the list shows only Environment events and
   Create Event skips the pillar step.

### 6. Scope and roles (FR-021, FR-022, SC-007)

- Sign in as a user of another plant: none of the events above appear, by list, search or by
  pasting their `#/events/<record number>` URL ("Event not found.").
- Sign in as **Site Admin**: no Create Event or My Alerts; opening `#/events/new` shows the
  permission message.

### 7. Event library (User Story 3, SC-004, SC-008)

- Search, Filters, Columns and the Kanban / List buttons sit on one line (desktop width).
- **List**: columns are record number, status, level, report date, title, department, reporter;
  statuses are colored badges; set page size to 100; sort by each sortable column; search a record
  number (e.g., `TF-26-0003`) and a word of a title.
- **Kanban**: one column per status (Draft, Open, In Progress, Closed, Archived) with a count; your
  drafts are in the Draft column.
- Apply each filter; the KPI chips (All, My events, Open, With SIP, Drafts) change with them and
  match a manual count.
- Tap **With SIP** → only SIP events are shown.
- Hide a column, reload the page → it stays hidden; the chosen view (Kanban or List) is kept too.
- Click a row or a card → it expands in place with the description and immediate actions;
  click again to close it. In Kanban, the ‹ › buttons reach every column.

### 8. Persistence (FR-036)

Close the browser and reopen the app: all events, drafts, attachments and alerts are still there.

## Definition of done for this feature

All scenarios above pass, `npm test` passes, the browser console shows no errors, and the app's
README "How to test" section lists these checks in short form (constitution principle V).
