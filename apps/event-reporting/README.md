# Event Reporting

Report environmental, safety, industrial risk and industrial hygiene events from the shop floor,
and find them again in a Kanban board or a list. Prototype: demo users, data kept in the browser.

## How to run

Needs [Node.js](https://nodejs.org) (LTS).

```bash
cd apps/event-reporting
npm install      # first time only
npm run dev      # then open http://localhost:5173
```

Pick a demo user on the start screen. **Reset demo data** on that screen restores the sample data.

## How to test

```bash
npm test         # business rules (validation, access, record numbers, lists, locations)
npm run build    # production build in dist/
```

Then check by hand, at phone width and on desktop, with the browser console open (no errors):

1. As a User, report a TF4 event (no photo, no action) → its view page opens with a record number
   like `TF-26-0013`.
2. Submit empty → missing fields are flagged; TF2 asks the first aid treatment; TF5 + SIP = Yes
   becomes TF4; TF4 can stop the location at the workshop.
3. As a Manager of the same plant → the bell shows the new alert; "Mark all read" clears it.
4. Events: KPI chips, filters, search, Kanban columns (‹ ›), List view; clicking a row or card
   expands it.
5. As a user of another plant → the event is "not found"; as Site Admin → no "New event".

Full scenarios: [specs/001-event-reporting/quickstart.md](../../specs/001-event-reporting/quickstart.md).
