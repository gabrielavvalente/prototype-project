# Implementation Plan: Align the prototype with the business requirements (rules and roles)

**Branch**: `014-requirements-alignment` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

## Summary

One helper, `isPlantSiteAdmin(user, event)` (a Site Admin whose access includes the event's plant),
added to each permission check of Event Reporting — visibility, correcting, reviewing, analysing,
owning the plan, updating actions, validating, reworking, the Safety Warning draft — and never
overriding the lock (`isLocked`). The other items are small rule changes in the existing logic.

## Technical Context

**Stack**: As in the constitution. **New dependencies**: None.

**Storage**: unchanged; the Industrial Risk demo events lose their risk answer (seeded once: reset
the demo data). A deleted draft is removed from the `events` store with its attachments.

**Testing**: Vitest — `logic/access.test.js` (visibility, correcting), `review.test.js`,
`rootCause.test.js`, `actionPlan.test.js`, `planValidation.test.js`, `safetyCommunication.test.js`,
`notifications.test.js`, `validation.test.js` (risk question, location, employee type); the
scenarios through the launcher.

**Apps and shared code touched**: `apps/event-reporting/`.

## Constitution Check

**Result**: PASS — no exception.

## Project Structure

```text
apps/event-reporting/src/
├── logic/access.js             # isPlantSiteAdmin; visibility, canEditEvent, menus and routes
├── logic/validation.js         # SIP only; EvE4/EvE5 area; employee type TF1–TF3
├── logic/review.js             # canStartReview / claim for Site Admins
├── logic/rootCause.js          # canPerformAnalysis; one 5W1H question
├── logic/actionPlan.js         # canEditPlan, allowedStatuses for Site Admins
├── logic/planValidation.js     # no confirmation; validators + Site Admins
├── logic/safetyCommunication.js # canSeeWarning, canPublish
├── logic/notifications.js      # "Event submitted" to Site Admins
├── data/db.js                  # deleteDraft; historian for post-review corrections
├── data/sampleData.js          # no CRP / SRP
├── create/*.jsx, events/*.jsx  # the screens using them
```

## Complexity Tracking

None.
