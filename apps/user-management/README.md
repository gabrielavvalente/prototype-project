# User Management

See the users of the platform, read-only: their event role, plants and pillars, their Control
Panel roles and the review groups they belong to. Prototype: demo users, data shared with the
other apps in the browser.

The interface uses Mantine components with the shared product colors and Poppins typography.

## How to run

Needs [Node.js](https://nodejs.org) (LTS). Open it through the launcher so it shows the same data
as the Control Panel:

```bash
cd apps/user-management && npm install   # first time only
cd ../../launcher && npm install         # first time only
npm run dev                              # opens http://localhost:5173 → User Management
```

Only people holding a Control Panel role can sign in. Select a person in the directory to show
their read-only access profile alongside the list; user links remain addressable as `/users/:userId`
and work with browser back/forward navigation. On narrow screens, selecting a person opens the
profile in place, with an **All users** control to return to the directory.

## How to test

```bash
npm run build    # production build in dist/
```

Then check by hand, through the launcher, with the browser console open (no errors):

1. As Ludovic Costa (Central) → all 12 users; search "fel" → Felix Tanaka; filter Role → Cluster
   → Lucas Weber and Pascal Fischer.
2. Open Carla Mendes → event access (Lyon), Control Panel role (Local Lyon) and review groups; no
   edit action anywhere.
3. As Lucas Weber (Cluster Lyon, Porto) → Ben Okafor (Curitiba) is not listed and his page says
   "Not allowed".

Full scenarios: [specs/002-control-panel/quickstart.md](../../specs/002-control-panel/quickstart.md)
(scenario 6).
