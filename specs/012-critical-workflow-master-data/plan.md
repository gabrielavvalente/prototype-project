# Implementation Plan: Workflow for critical events, and the master data workbook

**Branch**: `012-critical-workflow-master-data` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Change specification from `/specs/012-critical-workflow-master-data/spec.md`

## Summary

The critical row is stored like any level row, with the reserved level code `critical`, and shown
under the pillar's own label (SIP/HCI, SIP, SPL/HCL). At submission the event keeps that row's
result next to its phases (`workflow.critical`); Event Reporting treats a phase as required when
its level requires it, or when the review's critical flags are set and the critical row requires
it — so the review's designation follows the answers live and "further analyze" goes away. The
master data catalogs are replaced from the workbook; each injury carries the body parts it applies
to, and the review filters Injuries by the chosen Body Parts.

## Technical Context

**Stack**: As in the constitution. **New dependencies**: None.

**Storage**: `platform` database — workflow settings with `levelCode: 'critical'`; master values
replaced, a `diseases` list, `bodyPartIds` on injuries (seeded lists: the demo data must be reset,
as the quickstart says). `event-reporting` database — `event.workflow.critical` (version
unchanged).

**Testing**: Vitest — `shared/platform/workflow.test.js` (critical row in `workflowForEvent`,
`analysisWithoutReview` skips it, labels), `shared/platform/masterData.test.js` (catalog counts,
`injuriesFor`, Diseases list), `apps/event-reporting/src/logic/review.test.js` (required phases
from the critical row, no further-analysis question); the scenarios through the launcher.

**Apps and shared code touched**: `shared/platform/`, `apps/control-panel/`,
`apps/event-reporting/`.

## Constitution Check

**Result**: PASS — no exception.

## Project Structure

```text
specs/012-critical-workflow-master-data/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md
```

```text
shared/platform/
├── workflow.js          # CRITICAL_ROWS, levelLabel, critical row in workflowForEvent; analysisWithoutReview skips it (+ tests)
├── platformData.js      # messages, audit and notifications name the row by its label
├── masterData.js        # Diseases list; injuriesFor(values, bodyPartIds) (+ tests)
├── catalogs.js          # the workbook's Standards, Hazards, Diseases; injuries' bodyPartIds
└── sampleData.js        # Root cause analysis Required on the three critical rows
apps/control-panel/src/
├── workflow/workflowText.js   # getPillarLevels appends the critical row
├── workflow/SettingsGrid.jsx  # "From the level" cells; label in the saved message
├── workflow/ResultGrid.jsx, EventPath.jsx  # the critical row's path ("Added at …")
└── masterData/ValueList.jsx   # Injuries' Body parts column; export column
apps/event-reporting/src/
├── logic/review.js            # requiredByWorkflow; leadsToAnalysis from the critical row; no asksFurtherAnalysis (+ tests)
├── logic/safetyCommunication.js  # analysis possible from the critical row
└── events/ReviewStep.jsx      # no question; Injuries by body part
```

**Structure Decision**: The critical row reuses the settings store and every level-row rule; only
its display label and the two fixed cells are special.

## Complexity Tracking

None.
