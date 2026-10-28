# Implementation Plan: Optional analysis and guided corrections

**Branch**: `010-optional-analysis` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Change specification from `/specs/010-optional-analysis/spec.md`

## Summary

Starting an optional analysis stores `event.optionalAnalysis` (who, when, the designated people);
the step rules read it as "Root cause analysis required" and the designation rules read its people.
One plain DOM helper in `shared/` scrolls to the first field with a message and focuses it; every
refusal calls it after its messages render.

## Technical Context

**Stack**: As in the constitution.

**New dependencies**: None.

**Storage**: New field `event.optionalAnalysis = { startedBy, startedAt, rcaAssignees }`
(`event-reporting` database, version unchanged).

**Testing**: Vitest — steps and designation in `review.test.js` and `rootCause.test.js`, the start in
a new `optionalAnalysis.test.js`; the scroll helper is checked through the launcher (it needs a
page).

**Apps and shared code touched**: `apps/event-reporting/`, `apps/control-panel/`, `shared/ui/`.

## Constitution Check

**Result**: PASS — no exception. `shared/ui/scrollToProblem.js` imports no package and nothing from
`apps/`.

## Project Structure

```text
shared/ui/scrollToProblem.js                 # NEW scrollToFirstProblem(root)
apps/event-reporting/src/
├── logic/review.js                          # optional Root cause analysis step; required once started
├── logic/rootCause.js                       # designatedIds also reads optionalAnalysis
├── logic/optionalAnalysis.js                # NEW canStartAnalysis, startAnalysis (+ test)
├── logic/notifications.js                   # the start's alert candidates
├── events/OptionalAnalysisStart.jsx         # NEW the optional step's start (RCA-18)
├── events/EventSteps.jsx                    # opens the optional step for those who can start it
├── events/EventDetail.jsx                   # "Root cause analysis started by <name>" in the history
└── events/ReviewStep.jsx, RootCauseStep.jsx, ActionModal.jsx, ValidationStep.jsx,
    communications/ShareToHub.jsx, hub/HubItemPage.jsx   # scroll to the first problem
apps/control-panel/src/notifications/RuleForm.jsx, masterData/ValueForm.jsx  # the same
```

## Complexity Tracking

None.
