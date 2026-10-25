# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Change specification from `/specs/[###-feature-name]/spec.md`

<!--
  The plan is project-specific (stack, files, storage) and is NOT reused by a new project; the
  spec and the capability files are. Keep it short and say only what this change adds or departs
  from: the stack, rules and structure of the constitution and CLAUDE.md are not repeated.
  - research.md: only technical decisions that are not obvious (decision, why, alternatives).
  - data-model.md: only the data shapes this change adds or changes.
  - quickstart.md: how to run the checks; the scenarios themselves are the spec's acceptance
    scenarios — refer to them, do not copy them.
  - contracts/: only when screens or routes are added or changed.
-->

## Summary

[2–4 sentences: what changes and the technical approach.]

## Technical Context

**Stack**: As in the constitution. [Or: the departure and its justification.]

**New dependencies**: None. [Or: package, exact version, justification.]

**Storage**: [What is stored where; database version change: none / why.]

**Testing**: [Pure rules and their test files; the spec's scenarios checked through the launcher.]

**Apps and shared code touched**: [e.g. `apps/event-reporting/`, `shared/platform/`]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result**: PASS — no exception. [Or: a table of the exceptions only, each justified in
Complexity Tracking.]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── spec.md              # The change (/speckit-specify)
├── plan.md              # This file
├── research.md          # Only when there are non-obvious decisions
├── data-model.md        # Only the data shapes that change
├── quickstart.md        # How to run the checks
├── contracts/           # Only when screens or routes change
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
[Only the files created or changed, each with one line on why.]
```

**Structure Decision**: [One or two sentences.]

## Complexity Tracking

> Fill only if the Constitution Check has exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
