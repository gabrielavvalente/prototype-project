# Event Reporting

Report environmental, safety, industrial risk and industrial hygiene events from the shop floor,
then review them in the Events, KPIs and Reports pages. The workspace includes Kanban and List
views, personal saved filters, and a scoped event register. Prototype: demo users, data kept in
the browser. The interface uses Mantine components with a desktop-first workspace and responsive
phone layouts.

## How to run

Needs [Node.js](https://nodejs.org) (LTS). Users, plants and the workflow come from the shared
platform data, so open it through the launcher together with the Control Panel:

```bash
cd apps/event-reporting && npm install   # first time only
cd ../../launcher && npm install         # first time only
npm run dev                              # opens http://localhost:5173 → Event Reporting
```

Running `npm run dev` here instead starts the app alone, with its own copy of the demo data.

Pick a demo user on the start screen. **Reset demo data** on that screen restores the sample data.

## How to test

```bash
npm test         # business rules (validation, access, record numbers, lists, locations, status, review)
npm run build    # production build in dist/
```

Then check by hand, at phone width and on desktop, with the browser console open (no errors):

1. As a User, report a TF4 event (no photo, no action) → its view page opens with a record number
   like `TF-26-0013`.
2. Submit empty → missing fields are flagged; TF2 asks the first aid treatment; TF5 + SIP = Yes
   becomes TF4; TF4 can stop the location at the workshop.
3. As a Manager of the same plant → the bell shows the new alert; "Mark all read" clears it.
4. Events: workspace tabs, Create Event action (User and Manager), aligned KPI chips, filters,
   search, personal saved filters, Kanban columns (‹ ›), List view and the Reports event register;
   clicking a row or card expands it.
5. As a user of another plant → the event is "not found"; as Site Admin → no "New event".
6. Submit a TF5 (SIP No) → "closed right away" when the Control Panel requires nothing else for
   TF5; turn Review on for TF5 in the Control Panel → the next TF5 stays Open.
7. Review: as a reviewer configured in the Control Panel (e.g. Carla Mendes at Lyon), expand an
   Open TF4 → **Review** → **Assign myself as reviewer** (In Progress) → valid with an event
   statement → Closed; answer No with a reason → Archived, hidden unless Filters → Status =
   Archived. Another reviewer sees who is reviewing; reviewed events have no Edit.

Full scenarios: [specs/001-event-reporting/quickstart.md](../../specs/001-event-reporting/quickstart.md)
and, for the review, [specs/003-event-review/quickstart.md](../../specs/003-event-review/quickstart.md).
