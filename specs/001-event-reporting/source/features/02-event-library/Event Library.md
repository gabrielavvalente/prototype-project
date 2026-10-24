# Feature 002: Event Library

## Goal
Give every user a browsable, filterable list of all events in their scope — with per-record actions, bulk operations and KPI tiles — as the primary way to find an existing event.

## Why
The Events home is where Managers triage incoming events, Owners locate their assignments, Reporters find what they submitted, and Regional Users scan cross-site volume. Without fast search, filters and headline counts, finding a record means knowing its number in advance.

## Platform context
- Modules involved: Events home (list view), search and filter bar, KPI tiles, per-row and bulk record actions.
- Platform contracts reused: scope-restricted data access and role-based navigation from [Feature 001: Global Shell](../01-global-shell/Global%20Shell.md); server-side permission enforcement for Manager-only operations.
- Source: Event Reporting BRD v1.0.0 — §3.1(2), §5.2, §6.1, §6.3, §9.2 (story prefix `US-LIB-`).

**Reference data — fields surfaced.** Read surface over the **Event** entity (§8.1), joined to **Corrective Action** (§8.3) for action-status filtering and the Overdue Actions tile.

| Field | Used for |
|---|---|
| record_id | Search by record number |
| title | Search by title |
| event_family / event_level | Type filter |
| plant → task | Organization filter |
| reporter | Reporter filter, My Events |
| report_date | Time range filter, sort |
| HPR | HPR filter, KPI tile |
| status | Status column, Open Events KPI |
| locked | Drives the Unlock action |

## User stories
1. **US-LIB-01** — As a plant user, I want to see all events in my scope in one sortable, paginated list, so that I can find a specific record without knowing its number.
2. **US-LIB-02** — As a Manager following up on a report, I want to search by event title or record number, so that I can jump straight to a record someone referenced in a meeting.
3. **US-LIB-03** — As an EHS Manager, I want to narrow the list by type, time, location, action status, reporter and HPR, so that I can focus on the events that need my attention this week.
4. **US-LIB-04** — As a Manager, I want per-row actions on each event, so that I can view, correct or administratively manage a record without opening it first.
5. **US-LIB-05** — As a Site Admin, I want to select multiple events and act on them together, so that I can bulk-manage records without repeating the same action dozens of times.
6. **US-LIB-06** — As a Manager arriving at the start of a shift, I want headline counts above the event list, so that I immediately know what is open, overdue or high-potential.
7. **US-LIB-07** — As a Manager on a large site, I want the list to stay responsive at full page size with all filters applied, so that filtering does not become slower than scrolling.

## Scope
- IN: US-LIB-01 Browse the Event List; US-LIB-02 Search for an Event; US-LIB-03 Filter the Event List; US-LIB-04 Act on a Single Record (View / Edit and Manager admin operations only); US-LIB-06 KPI Tiles; US-LIB-07 Fast List Rendering. Screens included per §13: Events Home, List View, Detail View, Edit View.
- OUT: PDF Export (per-row action and export generation — backlog, §13); US-LIB-05 Bulk Actions (multi-select, Activate/Inactivate, Export template/CSV, Import — backlog, §13).

## Functional requirements (EARS)
- FR-1: WHEN a user opens Events THEN the system SHALL display a list of events within the user's scope, sortable by date, type, level, status and reporter, paginated at 20, 50 or 100 records per page. (from US-LIB-01 / FR-LIB-01)
- FR-2: WHEN a user hovers a row THEN the system SHALL expand it into a quick detail preview without navigating away. (from US-LIB-01 / FR-LIB-01)
- FR-3: WHEN a user shows/hides columns or adjusts column widths THEN the system SHALL apply the change and persist the user's column choices. (from US-LIB-01 / FR-LIB-01)
- FR-4: WHEN a user enters text or a record number in the search bar THEN the system SHALL filter the list to events whose title matches or return the event with that record number, combined with any active filters. (from US-LIB-02 / FR-LIB-01)
- FR-5: WHEN the filter bar is open THEN the system SHALL offer filters for Type (and level), Time range, Organization (Department → Task), Action status (On Going / To Complete / Completed / Cancelled / No Action), Reporter, HPR flag, and a My Events toggle. (from US-LIB-03 / FR-LIB-01)
- FR-6: WHEN a filter is applied THEN the system SHALL update the list and all counts accordingly, and WHEN My Events is enabled THEN the system SHALL list only events reported by the current user. (from US-LIB-03 / FR-LIB-01)
- FR-7: WHEN any row is displayed THEN the system SHALL offer a View action, and WHEN the user's role permits editing THEN the system SHALL also offer an Edit action on that row. (from US-LIB-04 / FR-LIB-02)
- FR-8: WHEN a Manager opens a row's ellipsis menu THEN the system SHALL expose Unarchive, Unlock and Delete, and WHEN Unlock is chosen THEN the system SHALL show a confirmation dialog before unlocking. (from US-LIB-04 / FR-LIB-02)
- FR-9: WHEN a non-Manager attempts an ellipsis-menu operation THEN the system SHALL hide the menu and reject the operation server-side. (from US-LIB-04 / FR-LIB-02)
- FR-10: WHEN rows are multi-selected THEN the system SHALL offer Activate, Inactivate, Export (template/CSV) and Import, and WHEN a bulk action changes record state THEN the system SHALL show a confirmation dialog before executing. (from US-LIB-05 / FR-LIB-03 — out of MVP scope)
- FR-11: WHEN a user opens Events THEN the system SHALL display clickable KPI tiles for Total Events, Open Events, Overdue Actions and Events With HPR, with counts reflecting any active filters. (from US-LIB-06 / FR-LIB-04)
- FR-12: WHEN a KPI tile is clicked THEN the system SHALL apply the corresponding filter to the list below. (from US-LIB-06 / FR-LIB-04)

## Non-functional requirements
- Performance: list renders in under 3 seconds with 100 rows and full filters applied; PDF export (when delivered) generates in under 10 seconds. (§6.1)
- Mobile: browsing and filtering behave identically on mobile and desktop. (§6.3)
- Security: all list data filtered server-side by user scope; Manager-only operations enforced server-side, never by UI hiding alone. (§9.2)

## Acceptance criteria (testable)

**US-LIB-01**
- [ ] Given I open Events, when the list loads, then it displays events within my scope.
- [ ] Given the list is displayed, when I sort, then date, type, level, status and reporter are all sortable.
- [ ] Given the list is displayed, when I change page size, then 20, 50 and 100 records per page are available.
- [ ] Given I hover a row, when the preview opens, then it shows quick detail without navigating away.
- [ ] Given I show or hide columns, when I return later, then my column choices persist.
- [ ] Given the list is displayed, when I drag a column edge, then the column width adjusts.

**US-LIB-02**
- [ ] Given I enter text in the search bar, when the list refreshes, then it shows only events whose title matches.
- [ ] Given I enter a record number, when the search runs, then the matching event is returned.
- [ ] Given filters are active, when I search, then search and filters are applied together.

**US-LIB-03**
- [ ] Given the filter bar is open, when I inspect it, then Type (and level), Time range, Organization (Department → Task), Action status (On Going / To Complete / Completed / Cancelled / No Action), Reporter, HPR flag and My Events are all available.
- [ ] Given I apply a filter, when the list refreshes, then the list and all counts update accordingly.
- [ ] Given I enable My Events, when the list refreshes, then only events I reported are listed.

**US-LIB-04**
- [ ] Given any row, when I open its actions, then a View action is available.
- [ ] Given my role permits editing, when I open a row's actions, then an Edit action is available.
- [ ] Given I hold the Manager role, when I open the ellipsis menu, then Unarchive, Unlock and Delete are exposed.
- [ ] Given I choose Unlock, when the action starts, then a confirmation dialog is shown before the record is unlocked.
- [ ] Given I am not a Manager, when I view a row or call the operations directly, then the ellipsis menu is absent and the operations are rejected server-side.

**US-LIB-05** (out of MVP)
- [ ] Given the list is displayed, when bulk mode is available, then each row carries a multi-select checkbox.
- [ ] Given I have selected rows, when I open bulk actions, then Activate, Inactivate, Export (template/CSV) and Import are offered.
- [ ] Given a bulk action changes record state, when I trigger it, then a confirmation dialog is shown before it executes.

**US-LIB-06**
- [ ] Given I open Events, when the page loads, then clickable KPI tiles show counts for Total Events, Open Events, Overdue Actions and Events With HPR.
- [ ] Given I click a KPI tile, when the list refreshes, then the corresponding filter is applied.
- [ ] Given filters are already active, when the tiles render, then their counts reflect the filtered set.

**US-LIB-07**
- [ ] Given 100 rows with full filters applied, when the list renders, then it completes in under 3 seconds.
- [ ] Given a PDF export is requested, when it runs, then it generates in under 10 seconds.
- [ ] Given I browse and filter on mobile, when compared to desktop, then behaviour is identical.

## Dependencies
- [Feature 001: Global Shell](../01-global-shell/Global%20Shell.md) — scope-restricted access, navigation entry point.
- [Feature 003: Event Creation](../03-event-creation/Event%20Creation.md) — creates the Event records surfaced here.
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) — lock/unlock and archive states acted on from the list.
- [Reporting and Analytics](../09-reporting-and-analytics/Reporting%20and%20Analytics.md) — downstream consumer of the same event data.

## Open questions
- [OPEN]: FR-LIB-02 lists PDF Export as a standard per-row action, but §13 defers PDF Export to backlog — US-LIB-04 is split across MVP and backlog. Confirm whether the row action ships disabled or is omitted entirely.
