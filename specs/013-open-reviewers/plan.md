# Implementation Plan: Reviewers chosen at every level

**Branch**: `013-open-reviewers` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

## Summary

A level's reviewers become their own workflow setting, `phase: 'reviewers'` (not a phase of the
event), stored per pillar, level row, scope level and plants like the Required settings, so every
level can keep one even where a higher level locks Review. The event's reviewers are the union of
every reviewers choice applying to its plant (plus the reviewers still held by Review settings
saved before this change). Making Review Required no longer asks for reviewers.

## Technical Context

**Stack**: As in the constitution. **New dependencies**: None.

**Storage**: `platform` database, `workflowSettings` — reviewers choices `{ phase: 'reviewers',
reviewerIds }`; Review settings keep `reviewerIds: []` (version unchanged; the seeded settings
need **Reset demo data**).

**Testing**: Vitest — `shared/platform/workflow.test.js` (union, own choice, "No reviewer" gap,
choices ignored by `resultingWorkflow`); the scenarios through the launcher.

**Apps and shared code touched**: `shared/platform/`, `apps/control-panel/`.

## Constitution Check

**Result**: PASS — no exception.

## Project Structure

```text
shared/platform/
├── workflow.js       # reviewerChoices, reviewersAt, hasNoReviewer, ownReviewers; workflowForEvent unions them (+ tests)
├── platformData.js   # saveReviewers (audit "Reviewers changed", colleague notification); Review Required without reviewers
└── sampleData.js     # Central's reviewers as a reviewers choice
apps/control-panel/src/workflow/
├── SettingsGrid.jsx     # "Reviewers for your plants: N" on Required Review cells, locked or not
├── ReviewersPicker.jsx  # Save — N selected / no reviewers; the hint
├── ResultCell.jsx, ResultGrid.jsx  # "No reviewer"
└── CellDetails.jsx      # reviewers by level
```

## Complexity Tracking

None.
