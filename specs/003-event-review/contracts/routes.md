# Contract: steps page, Review button and access

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

Adds to the Event Reporting routes of [001](../../001-event-reporting/contracts/routes.md).
Address through the launcher: `http://localhost:5173/apps/event-reporting/`.

## Route

| Route | Screen | Access |
|---|---|---|
| `#/events/:id/steps/:step` | Workflow steps of a submitted event; `:id` = record number, `:step` = `submission`, `review`, `rootCause`, `actions` or `validation` | Every role (User, Manager, Site Admin) for an event they can see; Draft, unknown event, event out of scope or unknown step → "Not found" |

Title: `<Step> — <record number> — Event Reporting` (e.g., "Review — TF-26-0006 — Event
Reporting").

## Steps page

- Top bar: back to events, record number (link to the event), status badge; the event title.
- Steps menu (left; a horizontal strip under 768px): one entry per step with its number or a
  check, its name and its state ("Done", "Current step", "Not reached yet", "Not required").
  Done and current steps are links; the others are shown disabled (`aria-disabled`), names of
  "Not required" steps struck through.
- Content of the chosen step:
  - Submission: the reported event, section by section.
  - Review: see below.
  - Root cause analysis, Actions, Validation: "<Step> comes in a later version of the prototype."
  - A disabled step opened by its address: "This step has not been reached yet." or "This step is
    not required for this event."

## Review step

| Situation | Shown |
|---|---|
| Nobody took the review, user is a reviewer | "This event is waiting for a reviewer." + **Assign myself as reviewer** |
| Nobody took the review, user is not a reviewer | Same message + the list of reviewers |
| Taken by someone else | "<name> is reviewing this event." (+ "Only the assigned reviewer can complete the review." for a reviewer) |
| Taken by the user | "You are the assigned reviewer for this event." + form: Is this a valid event? (Yes/No); No → reason chips Duplicated / Useless / Bad quality; Yes → Event statement (required) and one optional multi-select per list of the pillar; Comments (optional); button **Archive event** (No) or **Complete review** |
| Decision saved | Read-only summary: reviewer, date, valid, reason or statement and lists, comments |

Errors are shown next to the field; nothing is saved while one remains.

## Entry points

| Where | Shown to | Leads to |
|---|---|---|
| Expanded List row / Kanban card | A user who can start or continue the review | **Review** → `…/steps/review` (primary button) |
| Expanded List row / Kanban card | Anyone else, submitted event | **Workflow steps** → current step, or Submission |
| Event detail bottom bar | Anyone, submitted event | **Review** or **Workflow steps**, same rule |

## List and filters

- Status filter in the filter sheet: Draft, Open, In Progress, Closed, Archived (tap again to
  clear).
- Without a status filter, Archived events are not listed, not on the Kanban and not counted.
- Kanban columns: Draft, Open, In Progress, Closed (+ Archived when the Archived filter is on).
- Edit button and `#/events/:id/edit`: only for Draft (author) and Open (Managers) events;
  otherwise "not allowed".
