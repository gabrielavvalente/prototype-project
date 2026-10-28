# Change: Optional analysis and guided corrections

**Feature Branch**: `010-optional-analysis`

**Created**: 2026-10-28

**Input**: User remarks (2026-10-28): "Root cause analysis, even when not required, can be available
to be done by the plant; as it is, I am blocked from doing it." · "When a field is not filled in and
I cannot go on, guide me: scroll to where the missing information is."

**Capabilities**: changed: `specs/capabilities/root-cause-analysis.md` (RCA-1, RCA-18 added),
`specs/capabilities/event-library.md` (EL-18), `specs/capabilities/notifications.md` (NT-3),
`specs/domain.md` (Steps, Product-wide rules)

## Why

The analysis is only possible when the workflow requires it or a critical event's reviewer asked
for it, so a plant that wants to learn from any other event cannot. And a refused save shows its
messages without leading the person to them, often out of sight.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Optional analysis | The Root cause analysis step shows "Optional" after a valid review when nobody required it; the reviewer and the plant's Managers and Site Admins who see the event can start it any time | User (remark): an Optional step started any time |
| Closed events | Starting the analysis of a Closed event reopens it (In Progress, current step Root cause analysis); an Archived event never | Follows from "any time": a Review-only event is Closed right after its review |
| "Do you want to further analyze?" | Unchanged (asked for critical events only) | Action plan remarks of feature 005 |
| Guided corrections | Everywhere a save or a completion is refused, the page scrolls to the first field with a message and moves the focus to it | User (remark) |

## Rules

### Added

- **RCA-18** **Optional analysis**: after a valid review, when neither the workflow nor the review
  made Root cause analysis required, the step shows **Optional** while the event is In Progress or
  Closed (never Archived). Its reviewer and the Managers and Site Admins who can see the event open
  it and see "This analysis is not required. You can still start it for this event." with **Who
  will perform the root cause analysis?** (as RCA-1) and **Start root cause analysis**, refused
  without anyone ("Choose who will perform the root cause analysis."). Starting it makes Root cause
  analysis a required step of the event, keeps the designated people (RCA-2 alerts them, RCA-4
  takes a designated starter to the analysis), records "Root cause analysis started by <name>" in
  the history and — for a Closed event — reopens it: In Progress, current step Root cause analysis.
  Everyone else sees "This step is not required for this event.".

### Changed

- **RCA-1** *(the first sentence)* When a valid review leads to Root cause analysis (the event's
  workflow requires it, or the reviewer answered Yes to "Do you want to further analyze?", asked
  for critical events) … ; otherwise the analysis can still be started later (RCA-18).
  *(was: no other way)*
- **EL-18** *(the states)* An optional Root cause analysis step (RCA-18) opens for the people who
  can start it; for the others it says "This step is not required for this event.".
  *(was: optional only for Actions)*
- **NT-3** *(a row)* Root cause analysis | Started on an optional step (RCA-18) | "Root cause
  analysis assigned to you" (work) | Each designated user and member of a designated group, never
  the person who started it. *(was: only at the review)*
- **Domain, Steps**: Root cause analysis is also required once someone started it on its optional
  step; optional also covers a Root cause analysis step nobody required after a valid review, on an
  In Progress or Closed event, opened by the people of RCA-18.
- **Domain, Product-wide rules**: adds "When a save or a completion is refused, the page scrolls to
  the first field with a message and focuses it."

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`), in order.

1. **Optional after closing** — Carla Mendes reviews `TF-26-0006` (TF4, Review only) as valid,
   Potential Minor × Minimal: it is Closed. *Then* its steps menu shows Root cause analysis
   "Optional"; Carla opens it and reads "This analysis is not required. You can still start it for
   this event.". Ana Ribeiro (User) opens it and reads "This step is not required for this event.".
   (RCA-18, EL-18)
2. **Start it** — Carla presses Start root cause analysis without choosing anyone: refused with
   "Choose who will perform the root cause analysis.", and the page scrolls to that field. She
   designates Diego Laurent and starts it. *Then* `TF-26-0006` is In Progress, current step Root
   cause analysis; Diego gets "Root cause analysis assigned to you"; the history shows "Root cause
   analysis started by Carla Mendes". (RCA-18, NT-3, Domain)
3. **Before Actions** — Carla reviews `TF-26-0003` (TF2, Review and Actions) as valid, Potential
   Minor × Short term (not critical): current step Actions, Root cause analysis "Optional". Eva
   Novak (Site Admin) starts it, designating herself. *Then* the current step is Root cause
   analysis, before Actions, and Eva is taken to it. (RCA-18)
4. **Not for archived events** — After Carla archives `TF-26-0001` (Duplicated), its Root cause
   analysis step is not Optional ("This step has not been reached yet."). (RCA-18)
5. **Guided review** — Carla completes the review of `TF-26-0005` as valid without Standards. *Then*
   the review is refused, the page scrolls to Standards with "Choose a value." and the focus is in
   that field. (Domain)
6. **Guided analysis** — Diego completes the analysis of `TF-26-0006` with 6M not done. *Then* the
   page scrolls to the 6M part with its message. (Domain)
7. **Phone and keyboard** — At 320px the optional step and its start are usable; the scrolled-to
   field is visible below the header. (Domain)

## Out of scope

- Asking "Do you want to further analyze?" for non-critical events.
- Stopping or removing an optional analysis once started.
