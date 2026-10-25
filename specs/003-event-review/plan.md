# Implementation Plan: Event review

**Branch**: `003-event-review` | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-event-review/spec.md`

## Summary

Event Reporting gains the Review step of the core lifecycle. A configured reviewer (from the
workflow kept on each event at submission, feature 002) opens a Review button on the expanded
List row or Kanban card, lands on the event's **steps page** (Submission, Review, Root cause
analysis, Actions, Validation), assigns themself (status **In Progress**) and records the
decision: not valid → reason → **Archived** with alerts; valid → event statement without the
reporter's name and classification with the Control Panel master data of the pillar → next
required step or **Closed**. The review is stored on the event; the steps and their states are
computed from the event, never stored. Archived events leave the default list; reviewed events
can no longer be edited from the form. No new package and no database version change. Details in
[research.md](research.md).

**Second review (2026-10-25)**: the valid review also rates severity — Potential / Actual Severity
for safety (injury matrix of the source), Potential / Actual Loss for Industrial Risk (provisional
loss matrix), a SIP answer for Environment — and derives the critical classification (SIP, HCI,
SPL, HCL) shown in red; a SIP or SPL needs its type. "Do you want to further analyze?" (proposed
Yes for critical events) adds Root cause analysis when the workflow does not require it. The
statement starts from the description, Bad quality needs a comment, and the review's Comments field
is gone (R10–R14).

**Third review (2026-10-25)**: the review form in titled parts with framed Potential / Actual
blocks (type inside the Potential block) and the button on the right; Environment requires Aspects
and Impacts, Industrial Risk only its Categories; the steps page becomes the only page of a
submitted event (R15).

## Technical Context

**Language/Version**: JavaScript (ES2022, `.js` / `.jsx`), Node.js LTS for tooling

**Primary Dependencies**: Event Reporting's existing pinned stack — React 19.3.1, react-dom
19.3.1, react-router-dom 7.18.4, `idb` 8.0.4, `@mantine/core` / `@mantine/hooks` 9.7.3 (justified
in 002's plan), `@fontsource/poppins` 5.3.0; dev: Vite 8.3.5, `@vitejs/plugin-react` 6.1.2,
Vitest 5.0.5. No new package.

**Storage**: Browser IndexedDB, database `event-reporting` version 6 (unchanged): the review is a
field of the stored event; alerts in the existing `alerts` store. Master data read from the
`platform` database through `shared/platform/platformData.js` (R1, R5).

**Testing**: Vitest on the pure review rules (`logic/review.test.js`) and list filtering
(`logic/eventList.test.js`); screens checked with [quickstart.md](quickstart.md).

**Target Platform**: Modern desktop and mobile browsers, opened through the launcher

**Project Type**: Front-end web app inside the monorepo (`apps/event-reporting/`)

**Performance Goals**: Steps page and review form open instantly on the sample data (~20 events,
≤ 50 values per list)

**Constraints**: No server (the reviewer lock holds for the data of one browser, R4); no new
dependencies; Event Reporting imports only `shared/`; English UI; 320px wide; keyboard usable

**Scale/Scope**: One new route and page (steps), one review form, changes to the expanded
row/card, event detail, filters, Kanban, list counters and edit permission

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule (v2.3.0) | Status | How this plan complies |
|---|---|---|
| I. Simple, readable code | ✅ | Review rules are small pure functions in one file (`currentStep`, `stepStates`, `canStartReview`, `claimReview`, `validateReview`, `completeReview`); screens only call them. |
| I. No unjustified libraries | ✅ | No new package; the review form uses Mantine components already in the app (justified in 002). |
| II. Isolated apps | ✅ | All changes are in `apps/event-reporting/`; it reads master data and lists only through `shared/platform/`. |
| II. `shared/` independent | ✅ | `shared/` is not changed. |
| III. Minimal tests | ✅ | Vitest on the review rules and Archived filtering; quickstart manual flow; console checked before each commit. |
| IV. Consistent interface | ✅ | Existing badges, chips, Yes/No fields and theme variables; steps page titled per step; menu becomes a horizontal strip under 768px; disabled steps say why. |
| V. Short documentation | ✅ | Event Reporting README gains the review in "How to test". |
| Monorepo, stack, pinned versions, UTF-8, English, no secrets | ✅ | Same stack and exact versions; demo data only. |

**Result**: PASS before research and after design. No exceptions — Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-event-review/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R9
├── data-model.md        # Phase 1: review on the event, statuses, step states
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   └── routes.md        # Steps page, Review button and access
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
apps/event-reporting/src/
├── logic/
│   ├── review.js            # NEW: steps, current step, claim, validation, decision (R2, R3)
│   ├── review.test.js       # NEW
│   ├── severity.js          # NEW (second review): matrices, bands, assessment per pillar,
│   │                        #   critical classification (R10–R12)
│   ├── severity.test.js     # NEW
│   ├── display.js           # isCritical: red display decided by the review (R13)
│   ├── access.js            # route "event-steps" for every role; edit only while Open (R8)
│   ├── eventList.js         # Archived hidden unless asked for; "open" = Open + In Progress (R7)
│   └── eventList.test.js
├── events/
│   ├── EventSteps.jsx       # NEW: steps page #/events/:id/steps/:step (R3)
│   ├── ReviewStep.jsx       # NEW: take the review, decision form, done summary (R4, R5, R6)
│   ├── SeverityMatrix.jsx   # NEW (second review): clickable matrix, score and band
│   ├── CriticalBadges.jsx   # NEW (second review): SIP / HCI / SPL / HCL in red
│   ├── EventExpanded.jsx    # Review button or "Workflow steps" link
│   ├── EventDetail.jsx      # Review / Workflow steps button
│   ├── FilterSheet.jsx      # Status filter
│   └── KanbanBoard.jsx      # Archived column only when Archived events are shown
├── data/db.js               # saveReviewStep: event + alerts in one transaction
├── data/sampleData.js       # reference lists sipTypeHs, sipTypeEnv, splType (R11)
├── App.jsx                  # route
└── app.css                  # steps page styles
```

**Structure Decision**: Everything stays in the existing Event Reporting app; the review rules
are one plain module next to the other business rules (`logic/`), the screens next to the other
event screens (`events/`).

## Complexity Tracking

No violations.
