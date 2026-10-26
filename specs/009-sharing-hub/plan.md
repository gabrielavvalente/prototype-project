# Implementation Plan: Event Sharing Hub

**Branch**: `009-sharing-hub` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Change specification from `/specs/009-sharing-hub/spec.md`

## Summary

Sharing copies the published Warning's frozen content and the review's classification names into a
package stored on the event, with the plants it reached; each receiving plant's local check is
stored on the event too, keyed by plant. One pure module computes the reach, the anonymisation
gate, the package, the inbox, the check and its history. The hub alert is an alert marked with the
receiving plant, shown in that plant's context and opening the package. Decisions in
[research.md](research.md).

## Technical Context

**Stack**: As in the constitution.

**New dependencies**: None.

**Storage**: New fields `event.hubShares` and `event.hubChecks` (`event-reporting` database,
version unchanged); alerts gain an optional `plantId`; plants gain `region` in the shared sample data
(rewritten on every start). See [data-model.md](data-model.md).

**Testing**: Vitest — new `apps/event-reporting/src/logic/sharingHub.test.js` (reach, gate,
package, inbox, check, history), the hub alert in `notifications.test.js`, the regions in
`shared/platform/organization.test.js` (run by the Control Panel); the spec's scenarios through the
launcher.

**Apps and shared code touched**: `apps/event-reporting/`, `shared/platform/` (regions, the
notification catalogue).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result**: PASS — no exception, before research and after design.

## Project Structure

### Documentation (this feature)

```text
specs/009-sharing-hub/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md · contracts/routes.md · tasks.md
```

### Source Code (repository root)

```text
shared/platform/
├── sampleData.js              # plants get a region
├── organization.js            # the regions, countries and businesses of plants
└── notifications.js           # "Shared event received" in the catalogue
apps/event-reporting/src/
├── logic/sharingHub.js        # NEW reach, gate, package, inbox, check, history (+ test)
├── logic/notifications.js     # alerts of a share to the plants' Site Admins and Managers
├── data/db.js                 # saves plant alerts
├── communications/ShareToHub.jsx           # NEW the reach sheet (SH-2, SH-3)
├── communications/CommunicationView.jsx    # Share to Hub, "Shared with" lines
├── communications/CommunicationDocument.jsx # the Classification part
├── hub/HubList.jsx            # NEW the Sharing Hub page (SH-5)
├── hub/HubItemPage.jsx        # NEW the package and the local check (SH-7 to SH-9)
├── events/EventLibrary.jsx    # the fifth workspace page
├── shell/Header.jsx, shell/AlertsPanel.jsx # plant alerts in the context, opening the package
├── App.jsx, logic/access.js   # route #/hub/:record
└── app.css                    # appended styles
```

**Structure Decision**: The hub has its own folder; its rules are one pure module, like the safety
communication ones.

## Complexity Tracking

None.
