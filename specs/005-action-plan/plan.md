# Implementation Plan: Action plan

**Branch**: `005-action-plan` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Change specification from `/specs/005-action-plan/spec.md`

## Summary

The Actions step becomes real: the plan's owners prepare actions (the analysis's and new ones),
deploy them, assignees complete theirs, owners complete the plan and the event moves on. Actions
stay in `event.actions` (created by 004) with new fields and a status; the plan's own dates live
in `event.actionPlan`. Steps learn that Actions is required when the plan has actions and show it
Optional otherwise. Decisions in [research.md](research.md).

## Technical Context

**Stack**: As in the constitution.

**New dependencies**: None.

**Storage**: Fields of the stored event (`event-reporting` database, version 6, unchanged);
deployment alerts in the existing `alerts` store, saved with the event in one transaction
(`saveWorkflowStep`). Actions saved before this change are read with defaults (R2).

**Testing**: Vitest on the pure rules — new `apps/event-reporting/src/logic/actionPlan.test.js`,
the action fields in `actions.test.js`, the steps in `review.test.js`, the KPI counts in
`eventList.test.js`; the spec's acceptance scenarios through the launcher.

**Apps and shared code touched**: `apps/event-reporting/` only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result**: PASS — no exception, before research and after design (pure rules in `logic/`, no new
package, no database version change, English UI, 320px and keyboard, the closing task applies the
change to the capability files as v2.4.0 requires).

## Project Structure

### Documentation (this feature)

```text
specs/005-action-plan/
├── spec.md              # The change
├── plan.md              # This file
├── research.md          # R1–R6
├── data-model.md        # Action and plan fields that change
├── quickstart.md        # How to run the checks
├── contracts/routes.md  # The Actions step and the changed screens
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
apps/event-reporting/src/
├── logic/
│   ├── actions.js           # + location, notifyMaintenance, status, due date history, Overdue (AP-4, AP-5, AP-8)
│   ├── actionPlan.js        # NEW: owners, deploy, assignee updates, cancel, complete (AP-2, AP-9 to AP-13)
│   ├── review.js            # steps: Actions required when the plan has actions, done when completed, Optional (AP-3)
│   └── eventList.js         # action counts for the KPIs, quick filters to their events (EL-12)
├── events/
│   ├── ActionModal.jsx      # + location, Notify maintenance, why (optional), due date history (AP-4, AP-8)
│   ├── ActionLines.jsx      # NEW: compact lines shared by the analysis and the step (AP-6)
│   ├── ActionPlanStep.jsx   # NEW: the Actions step (AP-1 to AP-13)
│   ├── ActionsSummary.jsx   # replaced by ActionLines in RootCauseStep
│   ├── RootCauseStep.jsx    # new actions are Planned with the event's location (RCA-12, RCA-13)
│   ├── EventSteps.jsx       # Optional state, ActionPlanStep, owners may open an Optional step
│   ├── EventDetail.jsx      # history: plan deployed / completed (EL-19)
│   └── KpiOverview.jsx      # Open actions, Overdue actions (EL-12)
└── app.css                  # status badges, Overdue, plan header (appended)
```

**Structure Decision**: The plan's rules sit in one new module next to `actions.js`; the compact
lines become one component used by both the analysis and the step, so they look the same.

## Complexity Tracking

> Fill only if the Constitution Check has exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
