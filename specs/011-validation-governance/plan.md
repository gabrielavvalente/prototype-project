# Implementation Plan: Locked closure, rework and the Record Historian

**Branch**: `011-validation-governance` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

## Summary

"Locked" is derived, not stored: Closed with an effective last validation. A rework is kept as a
validation entry (`rework: true`, not effective), so the existing step rules send the event back to
Actions and then to Validation. The Record Historian's entries are computed when a step is saved,
by diffing the stored event with the new one (only once the review is complete), and kept on the
event.

## Technical Context

**Stack**: As in the constitution. **New dependencies**: None.

**Storage**: `event.historian` (entries) and rework entries in `event.validations`
(`event-reporting` database, version unchanged).

**Testing**: Vitest — `planValidation.test.js` (confirmation, lock, rework), new
`recordHistorian.test.js` (the diff, filters), the work alert in `notifications.test.js`; the
scenarios through the launcher.

**Apps and shared code touched**: `apps/event-reporting/`, `shared/platform/notifications.js`.

## Constitution Check

**Result**: PASS — no exception.

## Project Structure

```text
shared/platform/notifications.js           # "Event sent back for rework" (work)
apps/event-reporting/src/
├── logic/planValidation.js                # confirmation, isLocked, rework (+ tests)
├── logic/recordHistorian.js               # NEW historianEntries, filterEntries (+ tests)
├── logic/optionalAnalysis.js              # never on a locked event
├── logic/notifications.js                 # rework candidates
├── data/db.js                             # saveWorkflowStep appends historian entries
├── events/ValidationStep.jsx              # confirmation, Rework
├── events/EventSteps.jsx                  # locked notice, Record Historian link
├── events/RecordHistorianPage.jsx         # NEW the log and its filters
├── events/EventDetail.jsx                 # "Rework: …" in the history
└── App.jsx, logic/access.js, app.css      # route #/events/:id/historian, styles
```

## Complexity Tracking

None.
