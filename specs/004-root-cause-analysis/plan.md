# Implementation Plan: Root cause analysis

**Branch**: `004-root-cause-analysis` | **Date**: 2026-10-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-root-cause-analysis/spec.md`

## Summary

The review designates who performs the root cause analysis (users of the plant and sample
investigation groups) whenever the analysis will happen; they get an alert. The Root cause
analysis step of the event's page becomes real: an overview (statement, immediate actions, status
of each part), an optional 5W1H, 6M (up to 6 causes in six themes), a 3-legged 5 Why with root
causes classified Behavioral / Conditional, and Learnings; designated people save and complete it,
everyone else reads it. Completing moves the event to its next required step or closes it. The
sample groups live in `shared/platform/` and are listed read-only in a new Groups tab of User
Management. No new package, no database version change. Details in [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES2022, `.js` / `.jsx`), Node.js LTS for tooling

**Primary Dependencies**: The existing pinned stacks of Event Reporting and User Management
(React 19.3.1, react-router-dom 7.18.4, Mantine 9.7.3, `@fontsource/poppins` 5.3.0; Event
Reporting also `idb` 8.0.4; dev Vite 8.3.5, Vitest 5.0.5). No new package.

**Storage**: The analysis and the designation are fields of the stored event (`event-reporting`
database, version 6, unchanged); alerts in the existing `alerts` store. Groups are fixed sample
data exported by `shared/platform/` (no database) (R1, R2).

**Testing**: Vitest on the pure rules — `apps/event-reporting/src/logic/rootCause.test.js`, the
steps rules in `review.test.js`, and `shared/platform/groups.test.js` (run by the Control Panel);
screens checked with [quickstart.md](quickstart.md).

**Target Platform**: Modern desktop and mobile browsers, opened through the launcher

**Project Type**: Front-end web apps inside the monorepo

**Performance Goals**: The step and its parts open instantly on the sample data

**Constraints**: No server (one editor at a time assumed); English UI; 320px wide; keyboard
usable; apps import only `shared/`

**Scale/Scope**: One review field, one step with four parts, one User Management tab, 4 sample
groups

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule (v2.3.0) | Status | How this plan complies |
|---|---|---|
| I. Simple, readable code | ✅ | Rules in one plain module (`logic/rootCause.js`: themes, part status, validation, completion, who may edit); each part is its own small component. |
| I. No unjustified libraries | ✅ | No new package; the 5 Why legs are plain cards in columns, no diagram library. |
| II. Isolated apps | ✅ | Event Reporting and User Management read the groups from `shared/platform/` only; no app imports another. |
| II. `shared/` independent | ✅ | `shared/platform/groups.js` imports no package and nothing from apps. |
| III. Minimal tests | ✅ | Vitest on the analysis rules, the steps rules and the groups helpers; quickstart manual flow. |
| IV. Consistent interface | ✅ | Existing fields, chips, sections and blocks of the review form; pillar tags for groups in User Management; titles per screen; 320px layouts. |
| V. Short documentation | ✅ | Event Reporting and User Management READMEs gain the new checks. |
| Monorepo, stack, pinned versions, UTF-8, English, no secrets | ✅ | Same stacks; fictional sample groups. |

**Result**: PASS before research and after design. No exceptions — Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-root-cause-analysis/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R8
├── data-model.md        # Phase 1: groups, designation, analysis
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   └── routes.md        # Review field, RCA step, Groups tab
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
shared/platform/
├── sampleData.js            # + investigationGroups (4 fictional groups)
├── groups.js                # NEW: groupsCovering, groupsVisibleTo, membersOf (R1)
└── groups.test.js           # NEW

apps/event-reporting/src/
├── logic/
│   ├── rootCause.js         # NEW: themes, 5W1H sections, emptyAnalysis, partStatus,
│   │                        #   validateAnalysis, completeAnalysis, canPerformAnalysis,
│   │                        #   assigneeIds (R3–R6)
│   ├── rootCause.test.js    # NEW
│   ├── review.js            # step done = review decision / analysis completed; designation
│   │                        #   required when the analysis will happen (R4)
│   └── review.test.js
├── data/db.js               # saveReviewStep renamed saveWorkflowStep (any step + alerts)
├── events/
│   ├── ReviewStep.jsx       # "Who will perform the root cause analysis?" (R4)
│   ├── RootCauseStep.jsx    # NEW: overview, parts, Save / Complete, read-only view
│   ├── FiveW1HPart.jsx      # NEW
│   ├── SixMPart.jsx         # NEW
│   ├── FiveWhyPart.jsx      # NEW
│   ├── EventSteps.jsx       # shows RootCauseStep
│   └── EventDetail.jsx      # history: "Root cause analysis completed"
└── app.css

apps/user-management/src/
├── App.jsx                  # route #/groups
├── shell/PageTabs.jsx       # NEW: Users · Groups
└── groups/GroupsList.jsx    # NEW (R7)
```

**Structure Decision**: Rules stay in plain modules next to the other business rules; each RCA
part is its own component so the step stays readable; the groups are shared sample data like the
users.

## Complexity Tracking

No violations.
