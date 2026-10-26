# Implementation Plan: Notifications

**Branch**: `007-notifications` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Change specification from `/specs/007-notifications/spec.md`

## Summary

Every alert of Event Reporting goes through one pure function that applies NT-1/NT-2 (visibility,
work vs information, the person who acted, the person's settings, one alert per person); each step
only lists its candidate alerts in stage order. The alert catalogue, the settings and the
submission rules live in the shared platform data, because Event Reporting (My notifications,
raising alerts) and the Control Panel (Site Admin page) both use them. Decisions in
[research.md](research.md).

## Technical Context

**Stack**: As in the constitution.

**New dependencies**: None.

**Storage**: `platform` database version 1 → 2, adding three stores (`notificationSettings`,
`notificationRules`, `notificationChanges`) without touching the others (R1). The `event-reporting`
database keeps its version: alerts stay in its `alerts` store with the same shape; clearing
"Event to review" filters that store (R5).

**Testing**: Vitest on the pure rules — new `shared/platform/notifications.test.js` (catalogue,
rule validation and matching, setting values, who may change what; run by the Control Panel) and
`apps/event-reporting/src/logic/notifications.test.js` (candidates per stage, delivery); existing
tests of `actionPlan.test.js` and `planValidation.test.js` follow the new alerts; the spec's
acceptance scenarios through the launcher.

**Apps and shared code touched**: `shared/platform/`, `apps/event-reporting/`, `apps/control-panel/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result**: PASS — no exception, before research and after design. Shared code imports no package
and nothing from `apps/`; every write checks permissions and saves its change entry in the same
transaction.

## Project Structure

### Documentation (this feature)

```text
specs/007-notifications/
├── spec.md              # The change
├── plan.md              # This file
├── research.md          # R1–R7
├── data-model.md        # The three new stores
├── quickstart.md        # How to run the checks
├── contracts/routes.md  # The two new pages
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
shared/platform/
├── notifications.js         # NEW catalogue (work / information, stage order, hints), settingValue,
│                            #   canManagePlant, validateRule, matchingRules (pure)
├── notifications.test.js    # NEW
└── platformData.js          # version 2, the three stores; get/set settings, rules, changes
apps/event-reporting/src/
├── logic/notifications.js   # NEW candidates per stage (NT-3) and deliverAlerts (NT-1, NT-2)
├── logic/notifications.test.js
├── logic/actionPlan.js      # no "Action assigned to you"; plan deployed / completed candidates
├── logic/planValidation.js  # candidates of VAL-3 / VAL-4
├── data/db.js               # submit and saveWorkflowStep deliver candidates; take-review clearing
├── data/sampleData.js       # demo alerts from the submission candidates
├── events/ReviewStep.jsx    # review, archive and analysis candidates; taking the review clears
├── events/RootCauseStep.jsx, ActionPlanStep.jsx, ValidationStep.jsx  # their stage's candidates
├── events/EventDetail.jsx   # banner text (ER-19)
├── shell/AccountSheet.jsx   # "My notifications" entry (ES-6)
├── shell/MyNotifications.jsx     # NEW page (NT-4, NT-5)
└── App.jsx                  # route #/notifications
apps/control-panel/src/
├── shell/PillarPicker.jsx   # the Notifications cards for Site Admins (CPW-2, NT-6)
├── notifications/*.jsx      # NEW page: Submission rules, People, Changes tabs (NT-7 to NT-11)
└── App.jsx                  # routes #/notifications/:plantId/…
```

**Structure Decision**: The catalogue and the switch list are shared so both apps show the same
alerts and hints; raising alerts stays in Event Reporting, the only app that has events.

## Complexity Tracking

None.
