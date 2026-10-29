---

description: "Task list for Align the prototype with the business requirements (rules and roles)"
---

# Tasks: Align the prototype with the business requirements (rules and roles)

## Phase 1: Rules

- [ ] T001 [P] `logic/validation.js`: SIP question only, EvE4/EvE5 area location, employee type and
  person involved TF1–TF3; `data/sampleData.js` without CRP / SRP; tests (ER-5, ER-6, ER-8, ER-11)
- [ ] T002 [P] `logic/access.js`: `isPlantSiteAdmin`, visibility, `canEditEvent` (Site Admins after
  the review, never locked), menus and routes; tests (ER-1, ER-21, domain)
- [ ] T003 [P] Site Admin in `review.js`, `rootCause.js`, `actionPlan.js`, `planValidation.js`,
  `safetyCommunication.js`, `optionalAnalysis.js`; the 5W1H single question; validation without
  confirmation; "Event submitted" to Site Admins in `notifications.js`; tests (RV-2, RV-3, RCA-7,
  RCA-10, AP-2, AP-10, VAL-1, VAL-2, VAL-7, SC-5 to SC-7, NT-3)

## Phase 2: Screens and data

**Scenarios**: 1–10

- [ ] T004 `create/ClassificationSection.jsx`, `GeneralInfoSection.jsx`, `DetailsSection.jsx`,
  `EventFormPage`, `events/EventDetail.jsx` (risk answer), `events/ReviewStep.jsx`,
  `RootCauseStep` (5W1H), `ActionPlanStep.jsx`, `ValidationStep.jsx`, `communications/*` (ER-11 to
  VAL-7)
- [ ] T005 Delete draft: `data/db.js` `deleteDraft`, the draft page and the form (ER-16, EL-16);
  Record Historian for Site Admin corrections after the review (ER-21)

## Phase 3: Apply the change to the capabilities

- [ ] T006 Apply to `specs/domain.md` and the capabilities listed in the spec. No "was".
- [ ] T007 Check the counts and names of every changed scenario against the demo data

## Phase 4: Checks

- [ ] T008 `npm test` and `npm run build` in `apps/event-reporting/` and `apps/control-panel/`, then
  the scenarios from **Reset demo data** through the launcher, at 320px, clean console
