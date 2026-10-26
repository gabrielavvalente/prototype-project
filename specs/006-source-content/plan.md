# Implementation Plan: Source content

**Branch**: `006-source-content` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Change specification from `/specs/006-source-content/spec.md`

## Summary

A content change: the 5W1H questions and 6M themes in the root cause analysis rules, the injury
matrix durations and the band names of both matrices in the severity rules, and the domain's
definitions. No screen, data shape or workflow rule changes besides "Who was injured?" being for
Health & Safety only. Decisions in [research.md](research.md).

## Technical Context

**Stack**: As in the constitution.

**New dependencies**: None.

**Storage**: Nothing new; `event-reporting` database version unchanged; saved analyses and reviews
keep working (research R1, R2).

**Testing**: Vitest on the content counts and the section rule (`rootCause.test.js`) and on the band
labels (`severity.test.js`); the spec's scenarios through the launcher.

**Apps and shared code touched**: `apps/event-reporting/` only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result**: PASS — no exception, before research and after design.

## Project Structure

### Documentation (this feature)

```text
specs/006-source-content/
├── spec.md              # The change
├── plan.md              # This file
├── research.md          # R1, R2
├── quickstart.md        # How to run the checks
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
apps/event-reporting/src/
├── logic/rootCause.js        # FIVE_W1H, SIX_M_THEMES content; "Who was injured?" for H&S only
├── logic/severity.js         # injury durations; band labels and ranges
├── events/ReviewStep.jsx     # the rating text uses the band label
└── events/SeverityMatrix.jsx # the recovery note under the injury matrix
```

**Structure Decision**: The content stays as constants in the two rule modules, where the drafts
were.

## Complexity Tracking

> Fill only if the Constitution Check has exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
