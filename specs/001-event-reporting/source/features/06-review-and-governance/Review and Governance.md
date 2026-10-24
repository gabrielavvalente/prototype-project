# Feature 006: Review and Governance

## Goal
Give managers and final reviewers the control points over the event lifecycle — Initial Review (ownership and risk scoring), Final Review (closure and locking), Rework (controlled reopening) — with a Record Historian that makes every post-review change traceable.

## Why
This feature carries the BRD's data-trust objective: 100% traceability of post-review field changes. Initial Review gets the right person investigating with a shared sense of urgency; Final Review ensures closure is never a rubber stamp; immutability plus the Record Historian make a closed event trustworthy evidence for audits.

## Platform context
- Source: Event Reporting BRD v1.0.0 — §3.1(6), §5.6, §6.6, §8.4, §9.2, §10.3 · story prefix `US-GOV-`
- Modules involved: Initial Review, Final Review, Record Historian, Notifications, Safety Communication (Alert generation), Event Library.
- Platform contracts reused: server-side role enforcement; email + My Alerts notification channels; immutable audit store.
- Roles: Manager (performs Initial Review, assigns Owner and Final Reviewer), Final Reviewer (closes or reworks), Owner (receives assignment and rework), EHS auditor (reads the Record Historian).
- Data owned here: Record Historian Entry (§8.4: `event_id`, `field_name`, `old_value`, `new_value`, `changed_by`, `changed_at`, optional `reason`); Event fields `HPR`, `sip_category`, `status`, `locked` (§8.1).
- Attackability Score: `Risk / (Cost × Ease)`, each input scored 1–10 at Initial Review; the result places the event in the Risk Prioritization Matrix. Per §14, the cost input is an estimate only — Event Reporting is not a financial system and does no financial cost tracking.

Reference data — Event status lifecycle:

```
Draft → Submitted → In Review → Under Investigation → AP Open → Final Review → Closed
                          ↑                                            │
                          └───────────────── Rework ───────────────────┘
```

| Status | Set By |
|---|---|
| Draft | Event Creation — Save as Draft |
| Submitted | Event Creation — Submit |
| In Review | Initial Review opened |
| Under Investigation | Owner assigned, investigation running |
| AP Open | Corrective actions being built and deployed |
| Final Review | Investigation complete + ≥1 action deployed |
| Closed | Final Review — Close (sets `locked = true`) |
| Rework | Final Review — Rework (unlocks Action Plan) |

## User stories
1. US-GOV-01: As an EHS Manager, I want to review a newly submitted event, assign ownership and score its risk, so that the right person starts investigating and the site knows how urgently to act.
2. US-GOV-02: As an EHS Manager, I want to be notified when any event in my pillar is submitted, and for that notice to clear once a colleague handles it, so that nothing waits unreviewed and no two managers duplicate the work.
3. US-GOV-03: As an EHS Manager, I want the Safety Alert produced the moment I save Initial Review, so that the site is warned without me writing a separate communication.
4. US-GOV-04: As the assigned Final Reviewer, I want to confirm the response was sufficient and close the record, so that the event is formally resolved and becomes immutable evidence.
5. US-GOV-05: As the Final Reviewer, I want to return an inadequate record to its Owner, so that closure is never a rubber stamp on incomplete work.
6. US-GOV-06: As an EHS auditor, I want a complete, filterable log of every post-review change, so that I can demonstrate the record was not quietly altered.
7. US-GOV-07: As a compliance owner, I want closed records to reject every write, so that a closed event is trustworthy evidence.
8. US-GOV-08: As an EHS Manager, I want a serious-potential event escalated to a full investigation automatically, so that a low-severity outcome with high potential is not under-investigated.

## Scope
- IN (MVP): US-GOV-01 Perform Initial Review (Attackability inputs deferred); US-GOV-02 Review Notification; US-GOV-03 Auto-Generate Safety Alert; US-GOV-04 Final Review and Close; US-GOV-06 Record Historian; US-GOV-07 Record Immutability; US-GOV-08 Auto-Convert High-Potential Events. Pages (§13): Initial Review, Record Historian, Final Review, Closure.
- OUT: US-GOV-05 Send Back for Rework. Pages deferred (§13): Attackability Inputs, Rework Decision. Financial cost tracking (§14 — the Attackability cost input is an estimate only). Safety Alert PDF export (deferred with Feature 007).

## Functional requirements (EARS)
- FR-1: WHEN a user without the Manager role attempts Initial Review THEN the system SHALL reject the request server-side. (from US-GOV-01 / FR-GOV-01)
- FR-2: WHEN a Manager completes Initial Review THEN the system SHALL capture: Event Statement (free text), Owner (searchable user list), Final Reviewer (searchable user list), Standard(s) Associated (multi-select from Related Standards), Hazard(s) Associated (multi-select from Related Hazards), HPR (Yes/No, with HPR Category dropdown if Yes), Immediate Action Restated (free text), Next Step (free text), and Projected Risk / Cost / Ease (three 1–10 scored inputs). (from US-GOV-01 / FR-GOV-01)
- FR-3: WHEN an Event Statement containing the reporter's name is saved THEN the system SHALL block the save. (from US-GOV-01)
- FR-4: WHEN Risk, Cost and Ease are scored THEN the system SHALL auto-calculate the Attackability Score as `Risk / (Cost × Ease)` for the Risk Prioritization Matrix. (from US-GOV-01)
- FR-5: WHEN Initial Review is saved THEN the system SHALL log every subsequent field change on the record in the Record Historian with field name, old value, new value, changed-by, timestamp and reason comment. (from US-GOV-01 / FR-GOV-04)
- FR-6: WHEN an event is submitted THEN the system SHALL notify all Manager-role users in that pillar by email and My Alerts. (from US-GOV-02 / §10.3)
- FR-7: WHEN any one manager completes the Initial Review THEN the system SHALL clear the review notification for all managers. (from US-GOV-02)
- FR-8: WHEN a manager opens the review notification THEN the system SHALL deep-link to the event's Initial Review screen. (from US-GOV-02)
- FR-9: WHEN Initial Review is saved THEN the system SHALL auto-generate a Safety Alert from the event statement, classification, immediate actions and next steps — content, template, anonymisation, refresh and export rules are specified in [Feature 007: Safety Communication](../07-safety-communication/Safety%20Communication.md). (from US-GOV-03 / FR-GOV-02)
- FR-10: WHEN the investigation is complete AND at least one corrective action is deployed THEN the system SHALL make Final Review available to the assigned Final Reviewer; WHEN either precondition is unmet THEN the system SHALL keep Final Review unavailable. (from US-GOV-04 / FR-GOV-03)
- FR-11: WHEN Final Review is performed THEN the system SHALL capture a Final Risk Score and SHALL require a mandatory "No additional actions" confirmation checkbox before Close. (from US-GOV-04 / FR-GOV-03)
- FR-12: WHEN the Final Reviewer chooses Close THEN the system SHALL set `locked = true` and prevent all further edits except via Rework. (from US-GOV-04, US-GOV-07 / FR-GOV-05)
- FR-13: WHEN a locked record receives an edit request outside the Rework flow — including requests that bypass the client UI — THEN the system SHALL return a permission error, enforced server-side. (from US-GOV-07 / FR-GOV-05)
- FR-14: WHEN the Final Reviewer chooses Rework THEN the system SHALL return the record to the Owner, unlock the Action Plan, and notify the Owner by email and My Alerts; repetitions are unlimited, and Rework is the only authorised unlock mechanism. (from US-GOV-05 / FR-GOV-03, FR-GOV-05)
- FR-15: WHEN a user opens the Record Historian from any event THEN the system SHALL present a read-only list of all field-level changes made after Initial Review — field name, old value, new value, changed-by user, timestamp — filterable by date range, user and field name. (from US-GOV-06 / FR-GOV-04, §8.4, §6.6)
- FR-16: WHEN any user action occurs — create, update, delete, publish, close, rework — THEN the system SHALL log it with user identity and timestamp to an immutable store. (from US-GOV-06 / §6.6)
- FR-17: WHEN an event is level 3, 4 or 5 AND is flagged as HPR during Initial Review THEN the system SHALL auto-convert it to a full investigation record and notify the Owner with the updated requirements; WHEN the event is not HPR-flagged or is level 1 or 2 THEN the system SHALL NOT convert it. (from US-GOV-08 / FR-GOV-06)
- FR-18: WHEN a trigger in the notification table below occurs THEN the system SHALL notify the listed recipients via the listed channels. (from §10.3)

  | Trigger | Recipients | Channel |
  |---|---|---|
  | Event submitted | All Manager-role users in the pillar | Email + My Alerts |
  | Initial Review completed | Event Owner | Email + My Alerts |
  | Owner assigned | Owner | Email + My Alerts |
  | Final Review ready | Final Reviewer | Email + My Alerts |
  | Record reworked | Owner | Email + My Alerts |

## Non-functional requirements
- Security: role checks and record locking are enforced server-side; bypassing the client UI never circumvents the lock (§9.2).
- Auditability: 100% traceability of post-review field changes; audit entries are written to an immutable store.
- Privacy: the Event Statement is validated free of the reporter's name before Initial Review can save.

## Acceptance criteria (testable)
US-GOV-01 — Perform Initial Review
- [ ] Given I hold the Manager role, when I open a submitted event, then Initial Review is available to me.
- [ ] Given I do not hold the Manager role, when I attempt Initial Review, then it is rejected server-side.
- [ ] Given I complete Initial Review, when I save, then Event Statement, Owner, Final Reviewer, Standard(s) Associated, Hazard(s) Associated, HPR (+ HPR Category if Yes), Immediate Action Restated, Next Step, and Projected Risk / Cost / Ease (1–10 each) are captured.
- [ ] Given I enter an Event Statement containing the reporter's name, when I save, then validation blocks the save.
- [ ] Given Risk, Cost and Ease are scored, when the review is saved, then the Attackability Score is auto-calculated as Risk / (Cost × Ease) for the Risk Prioritization Matrix.
- [ ] Given Initial Review is saved, when any subsequent field change is made on this record, then it is logged in the Record Historian with field name, old value, new value, changed-by, timestamp and reason comment.

US-GOV-02 — Be Told an Event Needs Review
- [ ] Given an event is submitted, when notifications fire, then all Manager-role users in that pillar are notified by email and My Alerts.
- [ ] Given any one manager completes the Initial Review, when other managers check, then the notification is cleared for all managers.
- [ ] Given I open the notification, when it resolves, then I am deep-linked to the event's Initial Review screen.

US-GOV-03 — Generate the Safety Alert Automatically
- [ ] Given I save Initial Review, when generation runs, then a Safety Alert is auto-generated from the event statement, classification, immediate actions and next steps (content, anonymisation, refresh and PDF rules verified under Feature 007).

US-GOV-04 — Perform Final Review and Close
- [ ] Given the investigation is complete and at least one corrective action is deployed, when I am the Final Reviewer, then Final Review becomes available to me.
- [ ] Given either precondition is unmet, when I look for it, then Final Review is not available.
- [ ] Given I perform Final Review, when I complete it, then I enter a Final Risk Score.
- [ ] Given I intend to close, when I confirm, then a "No additional actions" confirmation checkbox is mandatory.
- [ ] Given I choose Close, when the record saves, then it is locked and no further edits are possible except via Rework.

US-GOV-05 — Send a Record Back for Rework
- [ ] Given I am reviewing, when I view the decision actions, then a Rework action is available alongside Close.
- [ ] Given I choose Rework, when it executes, then the record returns to the Owner and the Action Plan is unlocked.
- [ ] Given Rework occurs, when notifications fire, then the Owner is notified by email and My Alerts.
- [ ] Given a record has been reworked before, when Rework is chosen again, then it succeeds — there is no limit on repetitions.

US-GOV-06 — Read the Record Historian
- [ ] Given any event, when I look for its audit trail, then a Record Historian view is reachable from it.
- [ ] Given I open the Record Historian, when it renders, then it is read-only and lists all field-level changes made after Initial Review.
- [ ] Given an entry is shown, when I inspect it, then it displays field name, old value, new value, changed-by user and timestamp.
- [ ] Given the log is long, when I filter, then I can filter by date range, by user and by field name.
- [ ] Given any user action occurs — create, update, delete, publish, close, rework — when it completes, then it is logged with user identity and timestamp to an immutable store.

US-GOV-07 — Keep Closed Records Immutable
- [ ] Given Final Review has closed a record, when I inspect the Event, then `locked = true` on it.
- [ ] Given a locked record receives an edit request outside the Rework flow, when the API processes it, then it returns a permission error.
- [ ] Given the client UI is bypassed, when a write is attempted, then the lock still holds — enforcement is server-side.
- [ ] Given a record must be reopened, when unlock options are considered, then Rework is the only authorised unlock mechanism.

US-GOV-08 — Auto-Convert High-Potential Events
- [ ] Given an event is level 3, 4 or 5 and I flag it as HPR during Initial Review, when I save, then it auto-converts to a full investigation record.
- [ ] Given conversion occurs, when notifications fire, then the Owner is notified with the updated requirements.
- [ ] Given the event is not HPR-flagged, or is level 1 or 2, when I save Initial Review, then no auto-conversion occurs.

## Dependencies
- [Event Creation](../03-event-creation/Event%20Creation.md) — supplies the submitted event and Draft/Submitted statuses.
- [Investigation](../04-investigation/Investigation.md) — investigation completeness co-gates Final Review.
- [Action Plan](../05-action-plan/Action%20Plan.md) — ≥1 deployed action co-gates Final Review; Rework unlocks the Action Plan.
- [Safety Communication](../07-safety-communication/Safety%20Communication.md) — owns the Safety Alert content, anonymisation and refresh rules triggered by FR-9.
- [Event Library](../02-event-library/Event%20Library.md) — surfaces statuses and review KPIs.
- Configuration: Related Standards — business sub-group (regional governance office) scoped; 14 Global Standards mandatory and not deletable. Related Hazards — plant-scoped master data.

## Open questions
- [OPEN]: US-GOV-07 names Rework as the only authorised unlock mechanism, yet US-GOV-05 (Rework) is deferred to backlog. As specified, MVP closure is terminal — a closed record cannot be reopened. Confirm this is intended.
- [OPEN]: US-GOV-01 is in MVP but the Attackability Inputs page is deferred (§13). Confirm whether the Risk/Cost/Ease inputs and the Attackability Score calculation (FR-4) are captured at all in MVP, and if so where.
