# UI Contract: Screens, Routes and Access

**Feature**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md)

The app's external interface is its screens. Each screen has a hash URL so it can be opened by
direct link (research R3). This contract fixes the URLs, who may open them and what happens when
someone may not. Access rules are implemented once in `src/logic/access.js` (research R11).

## Routes

| URL | Screen | User | Manager | Site Admin | Spec |
|---|---|:---:|:---:|:---:|---|
| `#/` | Start: pick a demo user, Reset demo data | any (not signed in) | | | R12 |
| `#/entry` | Entry: choose a pillar or enter without one | ✓ | ✓ | ✓ | FR-037 |
| `#/events` | Event library (KPI chips, filters, Kanban / List, quick view) | ✓ | ✓ | ✓ | FR-026–FR-031 |
| `#/events/new` | Event creation form | ✓ | ✓ | — | FR-001–FR-017 |
| `#/search` | Full-screen search: recent searches and live results | ✓ | ✓ | ✓ | FR-044 |
| `#/events/:id` | Event detail (`:id` = record number, or internal id for drafts) | ✓ ¹ | ✓ ¹ | ✓ ¹ | FR-033 |
| `#/events/:id/edit` | Event edit (same form as creation) | own drafts | ✓ ¹ | — | FR-032, FR-034 |

¹ Only if the event is in the user's scope (business, plant, accessible pillars, narrowed by the
selected pillar) and, for drafts, only its reporter.

Notifications (My Alerts) and the account menu are sheets opened from the top bar on any screen,
not routes. Notifications are available to User and Manager (FR-022, FR-043). On phones a bottom
navigation offers Home (`#/entry`), Events (`#/events`) and a floating New button
(`#/events/new`, User and Manager only) (FR-040).

## Navigation menu (FR-022)

| Menu item | User | Manager | Site Admin |
|---|:---:|:---:|:---:|
| Events | ✓ | ✓ | ✓ |
| Create Event | ✓ | ✓ | — |
| My Alerts (header control) | ✓ | ✓ | — |

## Refusals

| Situation | Result |
|---|---|
| Not signed in, any route except `#/` | Redirect to `#/` |
| Signed in, no context chosen yet | Redirect to `#/entry` |
| Route not allowed for the role (e.g., Site Admin opens `#/events/new`) | "You do not have permission to open this page." with a link back to Events; no content of the page is shown |
| Event outside the user's scope, another user's draft, or unknown id | "Event not found." — the same message for all three, so the app never reveals that an out-of-scope event exists (FR-021, SC-007) |
| Edit not allowed for this event | Permission message as above; View remains available |

## Header (every signed-in screen, FR-018)

Shows: avatar, name, role; business selector (only if the user has more than one business;
switching saves the new context and reloads the page, FR-019); plant selector with plant-type icon
and country flag (FR-020); current pillar or "All pillars"; My Alerts control with unread count
(User and Manager); Switch user (returns to `#/`).

Changing business, plant or pillar while the creation form has unsaved changes asks for
confirmation first (spec Edge Cases).
