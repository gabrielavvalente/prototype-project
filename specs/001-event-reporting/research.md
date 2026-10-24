# Research: Event Reporting MVP

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-24

Each decision below resolves an open point from the plan's Technical Context.

## R1. Stack

- **Decision**: React + Vite, written in plain JavaScript (`.jsx` / `.js`), no TypeScript.
- **Rationale**: Chosen by the user on 2026-10-24. The MVP has highly interactive screens (a
  6-section form whose rules change with the level, dependent location lists, a list with search,
  filters, sorting, pagination and KPI tiles). React re-renders the screen from data, which keeps
  this code much shorter and easier to follow than updating the page by hand. Vite gives a
  one-command dev server and build with almost no configuration. Plain JavaScript avoids adding a
  type system to learn at the same time.
- **Alternatives considered**: Plain HTML/CSS/JS (no tooling, but much more manual DOM code for
  these screens); Vue + Vite (gentler syntax, smaller ecosystem); Svelte + Vite (least code,
  smallest community); Next.js / Nuxt (server frameworks, unnecessary without a server).

## R2. Where the data lives

- **Decision**: IndexedDB (the browser's built-in database), accessed through the tiny `idb`
  library.
- **Rationale**: The spec keeps all data on the demonstration device (FR-036) and accepts photos
  and videos up to 5 MB each, 5 per event (FR-009). `localStorage` holds only about 5 MB in total
  and only text, so a single video could fill it. IndexedDB stores files (Blobs) directly and
  typically allows hundreds of MB. The raw IndexedDB API is callback-based and hard to read; `idb`
  wraps it in promises (`await db.get(...)`) and adds about 1 KB.
- **Alternatives considered**: `localStorage` (too small, text only); raw IndexedDB API (verbose
  and error-prone for a beginner); Dexie (more features than needed, larger).

## R3. Screens and direct links

- **Decision**: `react-router-dom` with hash URLs (e.g., `#/events/TF-26-0042`).
- **Rationale**: The spec requires direct links to be checked against role and scope (FR-021,
  FR-022) and alerts that open the source event (FR-023), so each screen needs its own address.
  React Router is the standard, well-documented way to do this in React. Hash URLs work when the
  built app is opened from any static host or folder without server configuration.
- **Alternatives considered**: A hand-written router (fewer dependencies, but reinvents a solved
  problem and is less familiar to learners); a single screen switched by state (no direct links,
  so FR-021/FR-022 could not be tested).

## R4. Tests

- **Decision**: Vitest for small automated tests of business-rule functions only (validation
  rules, record numbers, scope filtering, list filters and KPI counts). Screens are checked with
  the manual steps in the app's README "How to test" section and [quickstart.md](quickstart.md).
- **Rationale**: Constitution principle III asks for focused tests of business rules and a main
  flow check, with no coverage target. Vitest reuses the Vite setup, so it needs no extra
  configuration. Keeping rules in plain functions (outside components) makes them easy to test.
- **Alternatives considered**: Jest (needs separate configuration for Vite projects); component
  or browser tests with Testing Library or Playwright (more tooling than principle III allows
  without need).

## R5. Shared visual theme

- **Decision**: One file, `shared/theme.css`, defining CSS custom properties (colors, fonts,
  spacing, radius) and base styles for buttons, fields, titles and error messages. The app imports
  it; `vite.config.js` allows Vite to read the `shared/` folder (`server.fs.allow`).
- **Rationale**: Constitution principle IV requires the common look to come from `shared/`.
  Plain CSS variables need no library and work with any future app.
- **Alternatives considered**: A UI component library (Material UI, Chakra; large and opinionated);
  Tailwind (another tool and syntax to learn); a shared React component package (would need a
  workspace setup and couple apps to React).

## R6. Monorepo setup

- **Decision**: No root `package.json` and no workspaces. Each app has its own `package.json`
  and `node_modules` inside `apps/<app-name>/`.
- **Rationale**: Constitution principle II: each app works on its own and deleting one must not
  break the others. Independent apps are the simplest way to guarantee that.
- **Alternatives considered**: npm workspaces (shared install, but adds root tooling and hidden
  coupling between apps).

## R7. Dependency versions

- **Decision**: Install the latest stable version of each dependency when the project is created
  (`/speckit-implement`) using `npm install --save-exact`, so `package.json` records exact versions
  (no `^`), and commit `package-lock.json`.
- **Rationale**: The constitution requires exact pinned versions. Choosing the version at install
  time avoids pinning to an outdated release written down today.
- **Alternatives considered**: Version ranges (`^x.y.z`), which the constitution forbids.

## R8. Description field ("basic formatting", FR-006)

- **Decision**: A multi-line plain-text area that keeps line breaks; no rich-text editor.
- **Rationale**: Line breaks cover the practical need (several sentences, a short list typed
  with dashes) without a rich-text editor library, which would be the heaviest dependency in the
  app and store HTML that then has to be sanitized.
- **Alternatives considered**: A rich-text editor such as TipTap or Quill (large, adds HTML
  sanitizing concerns). Can be revisited if bold/italic turn out to be required.

## R9. Photos and videos from the camera (FR-007)

- **Decision**: A standard file input with `accept="image/*,video/*"` and the `capture` attribute
  for the camera button; files are checked (type, extension, size ≤ 5 MB, max 5 per event) in a
  plain validation function before being stored as Blobs in IndexedDB.
- **Rationale**: Phones open the camera from a file input natively; no camera library is needed.
- **Alternatives considered**: `getUserMedia` camera preview (more code, permission handling,
  no benefit for this MVP).

## R10. Record numbers (FR-016)

- **Decision**: A `counters` store in IndexedDB keyed by `<FAMILY>-<YY>` (e.g., `TF-26`)
  holding the last sequence used. On submit the counter is read, incremented and saved in the same
  database transaction as the event, producing `TF-26-0042`.
- **Rationale**: One transaction guarantees no two events get the same number, even with a
  double-click on Submit. Formatting lives in a small tested function.
- **Alternatives considered**: Counting existing events (breaks if counting logic and data
  disagree); random IDs (not human-readable).

## R11. Scope and permissions

- **Decision**: All role and scope rules live in one module (`logic/access.js`): which menu items
  a role sees, which routes it can open, which events a user can see (business, plant, accessible
  pillars, optional selected pillar, own drafts only) and who can edit an event. Every screen and
  every data read goes through it.
- **Rationale**: With no server, "server-side" enforcement becomes "every read is filtered by one
  shared function"; putting the rules in one tested place prevents a screen from forgetting them
  (SC-007).
- **Alternatives considered**: Checks spread across components (easy to miss one, hard to test).

## R12. Demo users and sample data

- **Decision**: On first launch the app loads sample data (businesses, plants, location
  hierarchy, reference lists, demo users, sample events) from `src/data/sampleData.js` into
  IndexedDB. A start screen lists the demo users to "sign in" as, and offers a **Reset demo data**
  button that clears and reloads the sample data.
- **Rationale**: The spec has no real login and demonstrates multi-user flows by switching users on
  one device (FR-036). A reset button is friendlier than asking people to clear browser site data.
- **Alternatives considered**: Loading sample data on every launch (would wipe what was reported).

## R13. Plant-type icons and country flags (FR-020)

- **Decision**: Emoji (e.g., 🏭 factory, 🏬 warehouse, 🇫🇷 / 🇧🇷 flags) stored in the sample data,
  each with a text label for screen readers.
- **Rationale**: No image assets or icon library needed. Note: Windows does not draw flag emoji
  (it shows the two letters, e.g., "FR"); the text label keeps the meaning clear.
- **Alternatives considered**: An icon or flag library (extra dependency for decoration).

## R14. Design guideline and font

- **Decision**: Follow the PNG references in [design/](design/) as a guideline (look and
  interaction patterns), not pixel copies. Colors are sampled from them and adjusted where needed
  to keep text contrast at WCAG AA (e.g., teal text darkened). The font is Poppins, bundled with
  the app through `@fontsource/poppins` (weights 400, 500, 600), with system fonts as fallback.
- **Rationale**: Product team references give the prototypes a familiar look. Bundling the font
  keeps the app working offline and avoids loading from another site.
- **Alternatives considered**: Google Fonts link (needs internet); system fonts only (do not match
  the reference); an icon library for the icons (a dozen inline SVGs are enough).
