# Quickstart: Workflow for critical events, and the master data workbook

1. `cd launcher && npm run dev` (or reuse a running launcher), open http://localhost:5173/.
2. Event Reporting start screen › **Reset demo data** — required: the master data and workflow
   settings are seeded lists, so an older browser copy keeps the previous catalogs.
3. Run the spec's acceptance scenarios 1–11 in order (3 and 6 after 2), Control Panel for 1–3 and
   8–10, Event Reporting for 4–7.
4. `npm test` and `npm run build` in `apps/event-reporting/` and `apps/control-panel/` (the shared
   tests run from the Control Panel); clean browser console.
