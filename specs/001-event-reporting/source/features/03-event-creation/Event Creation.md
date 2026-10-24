# Feature 003: Event Creation

## Goal
Take a frontline worker from "something happened" to a submitted event record through a guided form, completable in under 3 minutes on mobile for a TF4/TF5 event.

## Why
Event creation is the highest-traffic and most mobile-critical flow in the product. If reporting a near-miss takes too long on a phone, frontline workers skip it — and every downstream feature (investigation, actions, analytics) starves.

## Platform context
- Modules involved: guided creation form (classification, location, general information, event details, immediate actions, first causes, External Reporting Platform health detail, review/submit), draft persistence, file upload.
- Platform contracts reused: shell landing entry point and 3-tap start from [Feature 001: Global Shell](../01-global-shell/Global%20Shell.md); secure document service for attachment storage; notification service for submission fan-out.
- Data created: the **Event** record (§8.1) with status `Draft` or `Submitted`, plus initial **Corrective Action** rows (§8.3) for immediate actions. Key fields: `record_id`, `pillar`, `event_family`, `event_level`, `title`, `description`, the `plant → task` chain, `task_type`, `reporter`, `report_date`, `event_time`, `shift_moment`, `employee_type`, `status`, `created_at`, `updated_at`.
- Configuration consumed: **Section Mandatoriness Configuration** (§11.3) governs which of Actions, First Cause and Root Cause are mandatory per event family (SAF / ENV / IR / OH) × level (1–5); changes apply immediately to new creation flows. Master data consumed: Diseases / Potential Diseases, Immediate Actions, Body Parts, PPE.
- Source: Event Reporting BRD v1.0.0 — §3.1(3), §5.3, §6.1, §6.3, §9.4, §11.3 (story prefix `US-CREATE-`).

**Reference data — pillars and families** (used by FR-1)

| Pillar | Family | Severity |
|---|---|---|
| Health & Safety | TF | TF1 (Lost-time) → TF5 (Hazardous situation) |
| Environment | ENV | EvE1 (Major) → EvE5 (Poor acts/conditions) |
| Site Risk | IR | SRE1 (Major) → SRE5 (Hazardous acts/conditions) |
| Industrial Hygiene | OH | Classification per disease type |

## User stories
1. **US-CREATE-01** — As a frontline worker, I want to pick the pillar, family and severity level with plain-language help, so that I classify the event correctly without memorising the SAF/ENV/IR scales.
2. **US-CREATE-02** — As a reporter, I want to drill down to the exact workstation or piece of equipment, so that the event can later be analysed by location and hot zones identified.
3. **US-CREATE-03** — As a reporter, I want to capture the core facts and attach photos from my phone, so that whoever investigates has evidence rather than a second-hand description.
4. **US-CREATE-04** — As a reporter, I want to record who was involved, whether this has happened before, and who should be told, so that recurring problems are visible and the right people are notified on submission.
5. **US-CREATE-05** — As a reporter, I want to log what was done straight away to make the situation safe, so that the containment is on record before any formal investigation starts.
6. **US-CREATE-06** — As a reporter, I want to assign each immediate action to the people responsible, so that the work is owned from the moment I submit.
7. **US-CREATE-07** — As a reporter, I want to note the causes that were obvious at the scene, so that the investigator starts from what the people present already knew.
8. **US-CREATE-08** — As a reporter logging an injury or illness, I want to record the External Reporting Platform-required medical detail, so that the event can be reported to External Reporting Platform when that integration is switched on. (Full specification in [External Reporting Platform Integration](../08-external-reporting-integration/External%20Reporting%20Integration.md).)
9. **US-CREATE-09** — As a reporter, I want to check everything before I commit, so that I do not submit an incomplete report and I can step away and finish later.
10. **US-CREATE-10** — As a worker on the shop floor with a phone, I want the whole creation flow fast enough to finish before I get back to work, so that reporting a near-miss is never something I skip because it takes too long.
11. **US-CREATE-11** — As a platform owner, I want every uploaded photo and video validated and scanned, so that the media library cannot become a malware distribution channel.
12. **US-CREATE-12** *(proposed, not in BRD — workshop [date generalized], internal prototype mobile prototype)* — As a reporter on a phone, I want the submission form broken into discrete sections rather than one long scroll, so that I always know how much is left and never lose my place.
13. **US-CREATE-13** *(proposed, not in BRD — workshop [date generalized], internal prototype mobile prototype)* — As a reporter selecting from a long list, I want choices to open as a sheet over a dimmed page that I can dismiss by tapping outside, so that selecting a value never feels like navigating away from my form.
14. **US-CREATE-14** *(proposed, not in BRD — workshop [date generalized], internal prototype mobile prototype)* — As a reporter logging an event needing no corrective action, I want the form to skip the action steps once I say none are required, so that I am not walked through screens irrelevant to what I am reporting.

## Scope
- IN: US-CREATE-01 Classify the Event; US-CREATE-02 Pinpoint Where It Happened; US-CREATE-03 Describe What Happened; US-CREATE-04 Add Event Detail; US-CREATE-05 Record Immediate Actions; US-CREATE-06 Assign Immediate Actions; US-CREATE-09 Review and Submit; US-CREATE-10 Under Three Minutes; US-CREATE-11 Safe File Upload.
- OUT: US-CREATE-07 Capture First Causes; US-CREATE-08 Complete External Reporting Platform Health Detail (External Reporting Platform sync itself is a separate feature); proposed stories US-CREATE-12/13/14 (mobile interaction pattern — not in BRD v1.0.0, pending decision).

## Functional requirements (EARS)
- FR-1: WHEN a user starts a new event THEN the system SHALL require selection of pillar (Health & Safety / Environment / Site Risk / Industrial Hygiene), then event family (SAF / ENV / IR / OH), then specific type and level, presenting a short plain-language description alongside each level. (from US-CREATE-01 / FR-CREATE-01)
- FR-2: WHEN the user reaches the location step THEN the system SHALL offer drill-down selection through Plant → Department → Workshop → Job → Workstation → Task, filtering each child dropdown to the selected parent's children, and SHALL require Task Type before continuing. (from US-CREATE-02 / FR-CREATE-02)
- FR-3: WHEN the user reaches General Information THEN the system SHALL capture Title (free text), Reporter (auto-filled from the current user, editable only by a Manager), Report Date (auto-filled to today, read-only), Event Time (time picker), Shift Moment (Day / Night / Afternoon) and Description (rich text). (from US-CREATE-03 / FR-CREATE-03)
- FR-4: WHEN the event is TF1, TF2 or TF3 THEN the system SHALL require at least one photo or video attachment before submission. (from US-CREATE-03 / FR-CREATE-03)
- FR-5: WHEN the user is on mobile THEN the system SHALL allow capturing a photo or video directly from the device camera. (from US-CREATE-03 / FR-CREATE-03)
- FR-6: WHEN the user reaches Event Details THEN the system SHALL capture Employee type (the organization Employee / Temporary Worker / Permanent Contractor / Non-Permanent Contractor / Other), a Recurrence Yes/No toggle, free-text Comments and Feedback email recipients — and WHEN the event family is OH THEN the system SHALL additionally display a Disease(s) multi-select from the configured disease list. (from US-CREATE-04 / FR-CREATE-04)
- FR-7: WHEN the event is TF1–TF3 or SRE1–SRE3 THEN the system SHALL require at least one immediate action before submission, subject to Section Mandatoriness Configuration. (from US-CREATE-05 / FR-CREATE-05)
- FR-8: WHEN the user adds an immediate action THEN the system SHALL capture Description, Priority, Category, Subcategory, Action plan detail, Due date, KPI ID (optional) and Comments, set the creation date automatically, and allow further actions as repeatable cards. (from US-CREATE-05 / FR-CREATE-05)
- FR-9: WHEN the user assigns an immediate action THEN the system SHALL allow up to 5 assignees per action. (from US-CREATE-06 / FR-CREATE-06)
- FR-10: WHEN the event is submitted THEN the system SHALL send each action assignee a notification email and create a My Actions entry for each; WHEN the event is saved as draft THEN the system SHALL send no assignment notification. (from US-CREATE-06 / FR-CREATE-06)
- FR-11: WHEN the user reaches First Causes THEN the system SHALL allow repeatable cause cards capturing Cause text, Participants (multi-select users), Immediate-action flag (Yes/No) and Comments — and WHEN Section Mandatoriness marks First Cause mandatory for the family and level THEN the system SHALL require at least one cause before submission. (from US-CREATE-07 / FR-CREATE-07 — out of MVP scope)
- FR-12: WHEN the user reaches the External Reporting Platform section THEN the system SHALL offer a hierarchical condition/illness category tree, a body-part selector using the 7 mandatory categories and their sub-parts for injuries, and a medical terminology list for injury description — and WHEN the External Reporting Platform feature flag is off THEN the system SHALL show the Report to External Reporting Platform button disabled. (from US-CREATE-08 / FR-CREATE-08 — out of MVP scope)
- FR-13: WHEN the user reaches the summary page THEN the system SHALL show every completed section with its values, flag missing mandatory fields, and offer an edit link back to each section. (from US-CREATE-09 / FR-CREATE-09)
- FR-14: WHEN the user chooses Save as Draft THEN the system SHALL persist the event with status `Draft` and trigger no notifications; WHEN the user chooses Submit THEN the system SHALL set status `Submitted` and fire all submission workflows. (from US-CREATE-09 / FR-CREATE-09)
- FR-15: WHEN a file is uploaded THEN the system SHALL validate MIME type, file extension and size server-side against admin-configured limits, virus/malware scan it before persistence, and store it via secure document service without a public URL; WHEN a file fails any check THEN the system SHALL reject it with a clear message and not persist it. (from US-CREATE-11 / §9.4)
- FR-16: WHEN an event is submitted THEN the system SHALL notify the recipients per the table below. (from US-CREATE-04, US-CREATE-06 / §11)

**Notifications fired on submit** (FR-16)

| Trigger | Recipients | Channel |
|---|---|---|
| Event submitted | Configured recipients (Department/Team/Level/HPR threshold) | Email + My Alerts |
| Event submitted | All Manager-role users in the pillar | Email + My Alerts |
| Action assigned | Each immediate-action assignee | Email + My Actions |
| Event submitted | Feedback email recipients chosen in US-CREATE-04 | Email |

## Non-functional requirements
- Performance: creation form loads in under 2 seconds; full TF4/TF5 flow completable in under 3 minutes on mobile. (§2.3, §6.1)
- Mobile: every creation step behaves identically on mobile and desktop; starting a new event takes no more than 3 taps from the shell landing screen. (§6.3)
- Security: server-side file validation and malware scanning; attachments never reachable by public URL. (§9.4)
- Extensibility: the External Reporting Platform section is designed so that enabling bidirectional sync later requires no form redesign.

## Acceptance criteria (testable)

**US-CREATE-01**
- [ ] Given I start a new event, when the form opens, then I first select a pillar: Health & Safety / Environment / Site Risk / Industrial Hygiene.
- [ ] Given a pillar is selected, when I continue, then I select the event family: SAF / ENV / IR / OH.
- [ ] Given a family is selected, when I continue, then I select the specific type and level.
- [ ] Given levels are presented, when I read them, then each carries a short description explaining what it means.

**US-CREATE-02**
- [ ] Given I reach the location step, when I select, then the hierarchy Plant → Department → Workshop → Job → Workstation → Task is offered.
- [ ] Given a location is chosen, when I try to continue, then Task Type is required first.
- [ ] Given I select a parent level, when child dropdowns render, then they are filtered to that parent's children only.

**US-CREATE-03**
- [ ] Given I reach General Information, when the section renders, then Title, Reporter (auto-filled, Manager-editable only), Report Date (auto-filled, read-only), Event Time, Shift Moment (Day / Night / Afternoon) and rich-text Description are captured.
- [ ] Given the event is TF1, TF2 or TF3, when I attempt submission without a photo or video, then submission is blocked.
- [ ] Given I attach a file, when the server receives it, then MIME type and size are validated before acceptance.
- [ ] Given I am on mobile, when I add media, then I can capture a photo or video directly from the device camera.

**US-CREATE-04**
- [ ] Given I reach Event Details, when the section renders, then I select an Employee type: the organization Employee / Temporary Worker / Permanent Contractor / Non-Permanent Contractor / Other.
- [ ] Given the event family is OH, when the section renders, then a Disease(s) multi-select from the configured disease list is displayed.
- [ ] Given I reach Event Details, when the section renders, then a Recurrence Yes/No toggle and free-text Comments are available.
- [ ] Given I select Feedback email recipients, when I submit, then those addresses are notified.

**US-CREATE-05**
- [ ] Given the event is TF1–TF3 or SRE1–SRE3, when I attempt submission without an immediate action, then submission is blocked (subject to Section Mandatoriness Configuration).
- [ ] Given I add an immediate action, when the card renders, then I capture Description, Priority, Category, Subcategory, Action plan detail, Due date, KPI ID (optional) and Comments.
- [ ] Given an action is created, when it saves, then its creation date is set automatically.
- [ ] Given I need more than one action, when I add another, then further actions appear as repeatable cards.

**US-CREATE-06**
- [ ] Given an immediate action, when I assign it, then up to 5 users can be assigned.
- [ ] Given I submit the event, when notifications fire, then each assignee receives a notification email and a My Actions entry.
- [ ] Given I save the event as a draft instead, when it persists, then no assignment notification is sent.

**US-CREATE-07** (out of MVP)
- [ ] Given I reach First Causes, when the section renders, then I can add repeatable cause cards.
- [ ] Given a cause card, when I fill it, then I capture Cause text, Participants (multi-select users), Immediate-action flag (Yes/No) and Comments.
- [ ] Given Section Mandatoriness marks First Cause mandatory for this family and level, when I attempt submission without a cause, then submission is blocked.

**US-CREATE-08** (out of MVP)
- [ ] Given I reach the External Reporting Platform section, when it renders, then I select a condition/illness category from a hierarchical tree.
- [ ] Given an injury is being recorded, when the section renders, then a body-part selector using the 7 mandatory categories and their sub-parts is available.
- [ ] Given I describe the injury, when I type, then a medical terminology list is offered for precision.
- [ ] Given the External Reporting Platform feature flag is off, when the section renders, then the Report to External Reporting Platform button is visible but disabled.

**US-CREATE-09**
- [ ] Given I reach the summary page, when it renders, then every completed section is shown with its values.
- [ ] Given a mandatory field is missing, when the summary renders, then it is flagged.
- [ ] Given I want to correct something, when I use a section's edit link, then I return to that section.
- [ ] Given I choose Save as Draft, when it persists, then the event has status `Draft` and no notifications are triggered.
- [ ] Given I choose Submit, when it persists, then the event status becomes `Submitted` and all submission workflows fire.

**US-CREATE-10**
- [ ] Given I open the creation form, when it loads, then it completes in under 2 seconds.
- [ ] Given I report a TF4 or TF5 event on mobile, when I complete the full flow, then it takes under 3 minutes.
- [ ] Given I am on the shell landing screen, when I start a new event, then it takes no more than 3 taps.
- [ ] Given I use mobile, when I complete any creation step, then it behaves identically to desktop.

**US-CREATE-11**
- [ ] Given a file is uploaded, when the server validates it, then MIME type, file extension and size are checked against admin-configured limits.
- [ ] Given a file passes validation, when it is stored, then it goes via secure document service and is not reachable by public URL.
- [ ] Given a file is uploaded, when it is processed, then it is virus/malware scanned before persistence.
- [ ] Given a file fails any check, when the result returns, then it is rejected with a clear message and not persisted.

**US-CREATE-12** (proposed, not in BRD)
- [ ] Given I open the creation form on mobile, when it renders, then it presents as sequential sections, not a single continuous field list.
- [ ] Given I complete a section, when I confirm it, then I advance to the next one.
- [ ] Given I am mid-form, when I look at the screen, then my position and progress are visible.

**US-CREATE-13** (proposed, not in BRD)
- [ ] Given I open any lookup — event type, location, equipment, assignee, filters — when it opens, then it appears as a sheet anchored to the bottom of the screen.
- [ ] Given the sheet is open, when I look at the page, then it is dimmed but still visible above the sheet.
- [ ] Given I tap outside the sheet, when it dismisses, then no change is applied.
- [ ] Given all lookups are built, when compared, then they use the same bottom-sheet pattern — one interaction model, not one per field.

**US-CREATE-14** (proposed, not in BRD)
- [ ] Given I reach the review step, when it renders, then I am asked whether any corrective action is required.
- [ ] Given I answer No, when I continue, then the action and countermeasure steps are skipped.
- [ ] Given I answer Yes, when I continue, then those steps are presented as normal.
- [ ] Given Section Mandatoriness makes actions compulsory for this family and level, when the review step renders, then the skip is not offered — configuration overrides the shortcut. *(inference, see Open questions)*

## Dependencies
- [Feature 001: Global Shell](../01-global-shell/Global%20Shell.md) — landing entry point, 3-tap start, My Actions surface for assignees.
- [Investigation](../04-investigation/Investigation.md) — consumes the submitted event; First Causes feed the investigator's starting point.
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) — submission triggers the review workflow.
- [External Reporting Platform Integration](../08-external-reporting-integration/External%20Reporting%20Integration.md) — owns the External Reporting Platform sync switched on behind US-CREATE-08.
- [Configuration and Administration](../10-configuration-and-administration/Configuration%20and%20Administration.md) — Section Mandatoriness Configuration and consumed master data (Diseases, Immediate Actions, Body Parts, PPE).

## Open questions
- [OPEN]: US-CREATE-14 AC-4 is an inference, not a workshop decision — the internal prototype prototype's skip is unconditional, while Event Reporting has mandatory-action rules (TF1–TF3, SRE1–SRE3) that a free skip would bypass. Confirm which wins.
- [OPEN]: Adoption of the proposed mobile interaction pattern (US-CREATE-12/13/14, workshop [date generalized], internal prototype mobile prototype) is not yet a BRD decision — confirm inclusion and target release.
- [OPEN]: Section Mandatoriness misconfiguration could cause under-reporting — confirm the guardrail that TF1–TF3 and SRE1–SRE3 default to mandatory actions and that changing the configuration requires Site Admin plus explicit confirmation.
