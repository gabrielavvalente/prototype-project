# Implementation Plan: Safety communication

**Branch**: `008-safety-communication` | **Date**: 2026-10-26 | **Spec**: [spec.md](spec.md)

**Input**: Change specification from `/specs/008-safety-communication/spec.md`

## Summary

The Safety Alert and the Warning draft are **computed** from the event by one pure function that
copies only allowed fields (SC-2); nothing is stored for them. Publishing stores a frozen copy of
the Warning's content on the event, with the chosen photo ids. A new workspace page lists the
plant's documents, and two document pages show them with a print style. Decisions in
[research.md](research.md).

## Technical Context

**Stack**: As in the constitution.

**New dependencies**: None (printing uses the browser's print).

**Storage**: A new field `event.safetyWarning` on the stored event (`event-reporting` database,
version unchanged); see [data-model.md](data-model.md). Photos stay in the `attachments` store and
are referred to by id.

**Testing**: Vitest on the pure rules — new `apps/event-reporting/src/logic/safetyCommunication.test.js`
(which events have documents, the content and its anonymity, next steps, who reads, who publishes,
publishing); the rating text moves to `severity.js` with its test; the spec's scenarios through
the launcher.

**Apps and shared code touched**: `apps/event-reporting/` only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Result**: PASS — no exception, before research and after design.

## Project Structure

### Documentation (this feature)

```text
specs/008-safety-communication/
├── spec.md              # The change
├── plan.md              # This file
├── research.md          # R1–R5
├── data-model.md        # event.safetyWarning
├── quickstart.md        # How to run the checks
├── contracts/routes.md  # The three new pages
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
apps/event-reporting/src/
├── logic/safetyCommunication.js       # NEW hasAlert, alertContent, warningState, warningContent,
│                                      #   nextSteps, canReadCommunication, canPublish, publishWarning
├── logic/safetyCommunication.test.js  # NEW
├── logic/severity.js                  # ratingText (moved from ReviewStep's describeRating)
├── logic/access.js                    # route names of the new pages
├── communications/CommunicationsList.jsx  # NEW the workspace page (SC-8)
├── communications/CommunicationPage.jsx   # NEW Alert / Warning page, draft, photos, publish, print
├── communications/CommunicationDocument.jsx # NEW the document itself (shared by both)
├── events/EventLibrary.jsx            # the fourth workspace page (EL-1)
├── events/EventSteps.jsx              # header card links (EL-17)
├── events/ReviewStep.jsx              # uses ratingText
├── App.jsx                            # routes
└── app.css                            # cards, document, @media print
```

**Structure Decision**: Communications get their own folder; the content rules are one pure module
so the anonymity rule is tested in one place.

## Complexity Tracking

None.
