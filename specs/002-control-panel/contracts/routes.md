# Contract: Control Panel screens and access

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

Hash routes (`createHashRouter`, as in Event Reporting), so the app works under any path. Address
through the launcher: `http://localhost:5173/apps/control-panel/`.

## Launcher

| Address | Screen |
|---|---|
| `/launcher/` | "Prototype apps" page (opened automatically; the server root is the repository): one card per app (name, one-line description, Open button) |
| `/apps/event-reporting/` | Event Reporting |
| `/apps/control-panel/` | Control Panel |

## Control Panel routes

| Route | Screen | Access |
|---|---|---|
| `#/` | Start: choose a demo user (all users; those without a Control Panel role are shown disabled with "No Control Panel role") | everyone |
| `#/pillars` | Pillar cards the user holds a role on, each with level and plants | any Control Panel role |
| `#/pillars/:pillarId/workflow` | Workflow tab — Settings view (default) | role on the pillar |
| `#/pillars/:pillarId/workflow/result` | Result per plant (plant picker limited to the role's plants) | role on the pillar |
| `#/pillars/:pillarId/workflow/compare` | Compare plants for one level | Central or Cluster on the pillar |
| `#/pillars/:pillarId/master-data` | Lists of the pillar (first list selected) | role on the pillar, except Industrial Hygiene ("Master data comes later") |
| `#/pillars/:pillarId/master-data/:listId` | One list | role on the pillar; IR may open `standards` and `hazards` read-only |
| `#/pillars/:pillarId/audit` | Audit trail of the pillar, newest first | role on the pillar |
| `#/users` | Users list (read-only) | any Control Panel role; perimeter per FR-027 |
| `#/users/:userId` | User detail (read-only) | user within the perimeter |

Not allowed → the "You don't have access to this page." message with a link to `#/pillars`
(same pattern as Event Reporting's `NotAllowed`). Unknown user or pillar → "Not found".

## Shell

- Header: app name "Control Panel" (link to `#/pillars`), bell with unread count
  (Control Panel notifications), avatar (switch user / sign out).
- Context bar under the header on pillar screens: pillar name · level badge (Central / Cluster /
  Local) · plants ("All plants", "Lyon, Porto", "Lyon").
- Tabs on pillar screens: Workflow · Master data · Audit. Users is in the header menu.
- Every screen sets `document.title` (e.g., "Workflow — Health & Safety — Control Panel").

## Workflow — Settings view

- Grid: rows = levels of the pillar (with their description), columns = 5 phases.
- Submission column: "Required" badge, disabled, tooltip "Always required".
- Cell states for the current user:
  - **Mine — Required**: switch on; shows author when someone else at my level set it.
  - **Optional**: switch off.
  - **Locked**: lock icon + "Required by Central — Ludovic Costa, 24 Oct 2026"; no switch.
- Switching Review on opens the reviewers picker (multi-select of valid reviewers, Done
  disabled until ≥ 1). Review cells show the reviewer count and open the picker to edit.
- Saving is immediate per cell; a toast confirms "Saved — applies to new events".
- Changing a setting authored by someone else asks to confirm: "Ludovic Costa set this. They will
  be notified."

## Workflow — Result per plant

- Plant picker (role's plants). Grid as above, read-only; Required cells show the origin badge
  (Central / Cluster / Local, "+1" when several); Optional cells are muted.
- Clicking a cell opens a sheet: every source setting (level, perimeter, author, date) and, for
  Review, the reviewers (with a warning for reviewers who lost access).
- Clicking a level row shows the **event path** below: Submission → Review → … with Optional
  phases crossed out, ending in "Closed after submission" when only Submission is Required.

## Workflow — Compare plants

- Level picker. Table: rows = phases, columns = the role's plants; each cell Required (with
  origin badge) or Optional.

## Master data

- List selector (chips) — H&S: Standards, Hazards, Body Parts, Injuries; Environment: Aspects,
  Impacts; Industrial Risk: Categories, plus Standards and Hazards marked "Owned by Health &
  Safety".
- Plant picker "Availability for: <plant>" (role's plants).
- Table: code, name, owner (Central / Cluster Lyon + Porto), status badge, "Available at <plant>"
  yes/no, actions (only those allowed: Edit, Deactivate / Reactivate for my scope, Retire).
- "Add value" button only when allowed; form sheet with code, name, description, category (Body
  Parts); validation messages from `validateValue`.
- Body Parts are grouped by category.

## Audit

- Filters: subject (Workflow or a list), user. Each row: date, user, level and plants, subject,
  target, before → after.

## Users

- List: search by name; filters plant, pillar, role; columns name, event role, plants, pillars,
  Control Panel roles (badges like "H&S · Cluster").
- Detail: event access per plant (pillars), Control Panel roles (pillar, level, plants), review
  groups (pillar, level code, scope) the user belongs to. No edit action.

## Event Reporting (changed behavior)

- Start screen lists only users with an event role.
- After Submit, the saved banner says "Event TF-26-0031 submitted" and, when closed, "— closed
  right away (no other phase required)". Status badge `Closed`.
