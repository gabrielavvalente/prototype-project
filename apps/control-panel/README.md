# Control Panel

Set, per pillar, which event workflow phases are required at each level (Central, Cluster,
Local) and govern the master data lists (Standards, Hazards, Body Parts, Injuries, Aspects,
Impacts, Industrial Risk Categories). Prototype: demo users, data kept in the browser and shared
with the other apps.

## How to run

Needs [Node.js](https://nodejs.org) (LTS). Open it through the launcher so it shares its data
with Event Reporting and User Management:

```bash
cd apps/control-panel && npm install   # first time only
cd ../../launcher && npm install       # first time only
npm run dev                            # opens http://localhost:5173 → Control Panel
```

Running `npm run dev` here instead starts the app alone, with its own copy of the demo data.
Pick a demo user on the start screen. **Reset demo data** there restores the sample data.

## How to test

```bash
npm test         # workflow, permission and master data rules (shared/platform)
npm run build    # production build in dist/
```

Then check by hand, through the launcher, with the browser console open (no errors):

1. As Ludovic Costa (Central) → Health & Safety → Workflow: turn Review on for TF5 and pick a
   reviewer.
2. As Lucas Weber (Cluster) the Review cells are locked; turn Root cause on for TF2. Result per
   plant shows who requires each phase; Compare plants shows Lyon and Porto.
3. As Carla Mendes (Local Lyon) switch off a setting Eva Novak made → Eva gets a notification.
4. Master data: as Lucas add a Hazard and deactivate a Standard for his plants; as Eva only
   deactivate / reactivate. Audit lists every change.
5. In Event Reporting submit a TF5 → Closed right away when nothing else is required.

Full scenarios: [specs/002-control-panel/quickstart.md](../../specs/002-control-panel/quickstart.md).
