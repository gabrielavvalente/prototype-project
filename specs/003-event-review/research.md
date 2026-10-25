# Research: Event review

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-25

No open technical question remained after the clarifications; these are the decisions the design
follows.

## R1. The review is stored on the event

- **Decision**: The event object gets a `review` field (and `archivedAt`); no new store, no index,
  so the `event-reporting` database stays at version 6.
- **Rationale**: One review per event in this version; reading the event gives everything the
  list, the steps page and the detail need. Old events simply have no review.
- **Alternatives considered**: a separate `reviews` store (needed only when reviews can be redone,
  i.e. with Rework — out of scope); a database version bump (would wipe the demo data for
  nothing).

## R2. Steps and their states are computed, not stored

- **Decision**: `currentStep(event)` = the first step after Submission that the event's workflow
  requires and that is not done (Review is done when the review has a decision); none when the
  status is Draft, Archived or Closed. `stepStates(event)` gives done / current / upcoming /
  skipped for the five steps.
- **Rationale**: The workflow kept at submission (002 FR-012) and the review already say
  everything; storing a "stage" would be a second source of truth to keep in sync.
- **Alternatives considered**: a stored `stage` field (rejected: duplicates the workflow).

## R3. A steps page per event

- **Decision**: Route `#/events/:id/steps/:step` (`:id` = record number, `:step` one of
  `submission`, `review`, `rootCause`, `actions`, `validation`). The Review button opens
  `…/steps/review`; "Workflow steps" opens the current step (or Submission when there is none).
  Unknown step, Draft, out-of-scope event → "Not found".
- **Rationale**: The user asked for a page with a submenu recapping the steps, where later steps
  will live; one route per step keeps the browser's back button and links meaningful.
- **Alternatives considered**: a side sheet over the list (rejected by the user); a single page
  with tabs and no address per step (no link to a step).

## R4. Taking the review is an explicit action

- **Decision**: The Review step first offers **Assign myself as reviewer** (only to the event's
  reviewers). It stores `review.reviewerId` and `claimedAt` and sets **In Progress**. Afterwards
  only that reviewer sees the form; the others see who is reviewing. The Review button is shown
  only when the user can start or continue the review (`canStartReview`).
- **Rationale**: Sources SCR-DSK-03 / SCR-MOB-03 ("Assign myself as Reviewer & Validator", "Claim
  Reviewer Role") and the notifications rule that two managers never review the same event.
  Opening the page by curiosity must not lock the event (user's choice).
- **Limit**: no server — two devices do not see each other's claim; on one device the last save
  wins. Documented as an assumption.

## R5. Classification uses the Control Panel lists of the pillar

- **Decision**: Lists from `listsForPillar(event.pillarId)`, minus lists that only group another
  list (Body Part Categories); values from `availableValues(values, activations, { listId,
  plantId })` so only values available at the event's plant are offered; Body Parts grouped by
  category in a searchable multi-select. The review stores value ids per list
  (`classification[listId] = [valueIds]`).
- **Rationale**: Same governance as the Control Panel (Central / Cluster / Local availability);
  no list is copied into Event Reporting.
- **Alternatives considered**: only Health & Safety lists (rejected by the user); free text.

## R6. Archive alerts reuse the existing alerts

- **Decision**: Archiving writes, in the same transaction as the event, one alert per person in
  {reporter, people shared with, other reviewers} minus the reviewer, with type
  `Event archived (<reason>)`. They show in My Alerts like the other alerts.
- **Rationale**: Core FR-6 asks to notify all related persons with the reason; the alerts store
  and panel already exist.

## R7. Archived events are filtered out by default

- **Decision**: `applyFilters` drops Archived events unless `filters.status === 'Archived'`; the
  filter sheet offers Status (Draft, Open, In Progress, Closed, Archived); the Kanban shows an
  Archived column only when the list contains Archived events. The "open" quick filter (and the
  KPI "Events in progress") counts Open and In Progress.
- **Rationale**: Core FR-7 (out of the active workflow but retrievable); user's choice.

## R8. Editing stops once the event is reviewed

- **Decision**: `canEditEvent` allows editing a submitted event only while it is **Open** (Managers
  of its plant and pillar, as before); Drafts stay with their author.
- **Rationale**: User's choice: what the reviewer decided must not change behind them; the Record
  Historian, which would make later edits traceable, is out of scope. Events Closed right at
  submission are therefore final too.

## R9. Event statement without the reporter's name

- **Decision**: The statement is refused when it contains the reporter's full name, ignoring case.
- **Rationale**: Review and Governance FR-3; the full name is what the prototype knows. First or
  last name alone is not checked (could match ordinary words); noted as a limit.

## R10. Severity and loss matrices (second review)

- **Decision**: One clickable matrix component for both: Impact rows × Duration columns, each cell
  showing its score (Impact weight × Duration weight) and colored by band — Low 2–15, Medium
  20–30, High 50–100 — with the chosen cell outlined and the result written under it. Safety uses
  the injury matrix of the safety source (Severe 5 / Significant 3 / Minor 1 × Minimal 2 / Short
  term 5 / Medium term 10 / Long term 20). Industrial Risk uses a **provisional** loss matrix with
  the same weights and bands and placeholder labels. Both live in `logic/severity.js`.
- **Rationale**: The source asks for clickable matrices with a read-only score; one structure keeps
  the Industrial Risk placeholder easy to replace. Writing the score in each cell means the band
  is never told by color alone (constitution IV).
- **Which matrices**: safety Potential TF1–TF4 and Actual TF1–TF3 (source; TF5 none, user's
  choice); Industrial Risk Potential SRE1–SRE5 and Actual SRE1–SRE3 (user).

## R11. Critical classification and types

- **Decision**: Derived, never typed: safety Potential High → SIP, Actual High → HCI; Environment
  "Is this event a SIP?" Yes → SIP (starting from the submission's answer); Industrial Risk
  Potential High → SPL, Actual High → HCL. SIP and SPL need a type from a reference list:
  `sipTypeHs` (the 15 "HPR Type" values of the safety source), `sipTypeEnv` and `splType`
  (**provisional**). The flags are stored on the review (`criticalFlags`) so lists show them
  without recomputing.
- **Rationale**: User's rules (Red band = SIP / HCI); the types follow the source where it has
  values. The review's assessment replaces the submission's SIP answer once reviewed.
- **Alternatives considered**: SIP also from the submission's answer (rejected by the user).

## R12. "Do you want to further analyze?"

- **Decision**: Asked only when the workflow kept on the event does not require Root cause
  analysis. It starts at Yes for a critical event (proposed) and must be answered otherwise. Yes
  stores `furtherAnalysis = true`, which makes Root cause analysis a required step of that event;
  No goes to the next required step, or Closed when none.
- **Rationale**: User's choice (proposed, can be refused); the safety source makes Red mandatory,
  the user preferred a proposal. Required steps stay computed (R2).

## R13. Red display follows the review

- **Decision**: `isCritical(event)` = the review's flags once reviewed; before review, the previous
  rule (submission SIP answer or a serious level). `isSip` (filters, KPIs) uses the same source.
- **Rationale**: Keeps the 001 behavior for events not yet reviewed, and lets the review decide.

## R14. Form details

- **Decision**: The statement starts from the description; Bad quality shows a required comment;
  no review Comments; the form uses `noValidate` so the app's own messages show next to the
  fields (browser validation of `required` fields hid them); the review form is recreated per
  event (`key={event.id}`), so moving from one event's steps to another's never keeps answers.

## R15. One page per submitted event (third review)

- **Decision**: `#/events/:id` redirects a submitted event to its steps page (current step, or
  Submission right after a submit, keeping the confirmation banner); Open event links there
  directly. The header card, sections, photos, immediate actions and history of the former view
  page are shared components (`EventHeadCard`, `EventSections` in `EventDetail.jsx`) shown above
  the steps and in the Submission step. Drafts keep `EventDetail`. The history adds "Review taken
  by" and "Review completed".
- **Rationale**: The user wants no distinction between opening an event and its workflow; one
  page also makes Back always return to the list.
- **Alternatives considered**: only changing the Open event button (rejected: search, alerts and
  the after-submit page would still show a second page).

## R16. Editing in place, compact header, archived KPIs (fourth review)

- **Decision**: `EventForm` gets an `embedded` mode (no title bar, full width of the step) shown in
  the Submission step to those `canEditEvent` allows (Open events only, R8); its standalone page
  stays for new events and drafts and sends a submitted event to its page. The header card has a
  `compact` variant on the steps page. The KPIs page counts the Archived events of the current
  search and filters (status forced to Archived) and draws them with the same stacked column
  component as the events-by-type chart (`StackedColumnChart`).
- **Rationale**: One place to read and edit an event; less vertical space; one chart component
  for both charts.
