# Prototype Project

A monorepo of small prototype apps built with React + Vite, sharing one visual theme
([shared/theme.css](shared/theme.css)) and one set of platform data
([shared/platform/](shared/platform/): users, plants, roles, workflow settings, master data).
The launcher and each app use a persistent header for returning to the app home, navigating to the
current module, searching within it, and accessing notifications and the signed-in account.

## Apps

| App | What it does |
|---|---|
| [Event Reporting](apps/event-reporting/) | Report shop-floor events and follow them in a Kanban board or a list |
| [Control Panel](apps/control-panel/) | Set the event workflow and govern the master data of each pillar |
| [User Management](apps/user-management/) | See users, their plants, pillars and Control Panel roles (read-only) |

## Run them together

The [launcher](launcher/) starts every app and opens them from one address, so they share the
data stored in the browser:

```bash
# first time only: npm install in apps/event-reporting, apps/control-panel,
# apps/user-management and launcher
cd launcher
npm run dev      # opens http://localhost:5173 with a card per app
```

Each app can also run alone (see its README), with its own copy of the demo data.

## Host it (static site)

`cd launcher && npm run build` builds the launcher page and every app into one static site,
`launcher/dist/` — the page at `/`, each app at `/apps/<app-name>/`, the same addresses as in
development, so the apps keep sharing the browser data. `npm run preview` serves it at
http://localhost:4173. [netlify.toml](netlify.toml) tells Netlify to run that build and publish
`launcher/dist`. Everything stays in each visitor's browser: every visitor has their own demo data.

Specifications live in [specs/](specs/); project rules in
[.specify/memory/constitution.md](.specify/memory/constitution.md).
