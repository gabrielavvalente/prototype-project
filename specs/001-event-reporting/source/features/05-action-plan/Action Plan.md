# Feature 005: Action Plan

## Goal
Enable the Event Owner to build, deploy and track corrective actions tied to the root causes found during investigation — actions created through Action Management Platform, monitored in the Action Management Platform application, including maintenance work raised in maintenance management system without double entry — so the event's response is executed and never stalls.

## Why
An investigation without a tracked action plan changes nothing. Linking every action to an identified root cause proves the plan addresses what was actually found. Actions are not a second catalogue inside Event Reporting: they are created through Action Management Platform and every action can be monitored in the Action Management Platform application. Auto-generating maintenance system Work Notifications removes duplicate typing for maintenance work; overdue escalation stops corrective work quietly stalling past its due date. Key Learnings turn the closed record into reusable knowledge.

## Platform context
- Source: Event Reporting BRD v1.0.0 — §3.1(5), §5.5, §6.1, §6.3, §7.3 · story prefix `US-AP-`
- Modules involved: Action Plan (event record), Action Management Platform (system of record and monitoring application for every event action), My Actions (Event shell view of Action Management Platform assignments), Event Library (Overdue Actions KPI tile), Notifications, maintenance management system integration.
- Platform contracts reused: Action Management Platform for create, assign, update, complete and monitor of event actions (US-INT-10); email + My Alerts / My Actions notification channels; mobile parity with desktop (FR-SHELL-04); parent Event status is `AP Open` during this phase (§8.1).
- Roles: Owner (builds and deploys the plan, closes the AP), Action assignee (completes assigned actions), Manager (monitors overdue actions in Action Management Platform and from Event), Maintenance technician (works the maintenance system Work Order, outside Event Reporting).

Reference data — Corrective Action fields (§8.3):

| Field | Type | Notes |
|---|---|---|
| action_id | UUID | Identifier from Action Management Platform |
| event_id | FK → Event | Link held in Event Reporting |
| description | Text | US-AP-02 |
| assignees | FK[] → User | US-AP-02 (max 5) |
| due_date | Date | US-AP-02 |
| priority | Enum | Emergency / High / Medium / Low |
| category / subcategory | FK | US-AP-02 |
| linked_root_cause | String / FK | US-AP-02 |
| maintenance_required | Boolean | US-AP-03 |
| maintenance system_work_notification_id | String | US-AP-03 |
| maintenance system_work_order_id | String | US-AP-03 |
| maintenance system_sync_status | Enum | Pending / Synced / Error |
| status | Enum | On Going / To Complete / Completed / Cancelled |

## User stories
1. US-AP-01: As an Event Owner, I want to record what the organisation should take away from this event, so that the value of the investigation outlives the individual record.
2. US-AP-02: As an Event Owner, I want each corrective action tied to a specific root cause with an owner and a date, so that the plan demonstrably addresses what the investigation actually found.
3. US-AP-03: As an Event Owner, I want a maintenance-flagged action to create the maintenance system Work Notification automatically, so that nobody has to type the same request into two systems.
4. US-AP-04: As an Event Owner, I want deploying an action to notify its assignees and make the action available in Action Management Platform, so that the people who must act find out immediately and every action can be monitored in one application.
5. US-AP-05: As an action assignee, I want to update my action's status from my phone, so that I can close out work at the point it is done rather than back at a desk.
6. US-AP-06: As a Manager, I want overdue actions escalated automatically, so that corrective work does not quietly stall past its due date.
7. US-AP-07: As an Event Owner, assignee or Manager, I want every event action available to monitor in the Action Management Platform application, so that I do not need a second plant action list inside Event Reporting.

## Scope
- IN (MVP): US-AP-02 Define Corrective Actions; US-AP-03 maintenance system Work Notification; US-AP-05 Complete My Assigned Action; US-AP-06 Chase Overdue Actions; US-AP-07 Monitor every event action in Action Management Platform. Pages (§13): Corrective Actions List, Corrective Action Detail, maintenance management system Work Notification.
- OUT: US-AP-01 Capture Key Learnings; US-AP-04 Deploy Actions to Their Owners. Pages deferred (§13): Key Learning Entry, Action Deployment and Tracking. Execution of the maintenance work itself happens in maintenance system, outside Event Reporting. Event Reporting SHALL NOT maintain a standalone Plant Action Library that replaces Action Management Platform.

## Functional requirements (EARS)
- FR-1: WHEN the Owner adds a key learning while building the Action Plan THEN the system SHALL store it as free text with a timestamp, allowing one or more entries. (from US-AP-01 / FR-AP-01)
- FR-2: WHEN the Action Plan is submitted with no key learning recorded THEN the system SHALL block the submission. (from US-AP-01 / FR-AP-01)
- FR-3: WHEN a corrective action is created THEN the system SHALL create it through Action Management Platform, link it to the event, and capture a free-text description, up to 5 assigned users, a due date, and a Linked Root Cause referencing a cause identified in 5 Why or 6M. (from US-AP-02 / FR-AP-02 / US-INT-10)
- FR-4: WHEN a corrective action exists THEN the system SHALL consume its status from Action Management Platform as one of On Going / To Complete / Completed / Cancelled and provide a repeatable comment thread on it. (from US-AP-02 / FR-AP-02)
- FR-5: WHEN Maintenance Required is set to Yes on an action THEN the system SHALL auto-generate a maintenance system Work Notification. (from US-AP-03 / FR-AP-03)
- FR-6: WHEN a maintenance system Priority is selected THEN the system SHALL derive the Requested Date per the priority table below. (from US-AP-03 / FR-AP-03)

  | maintenance system Priority | Requested Date |
  |---|---|
  | Emergency | within 24 hours |
  | High | within 1 week |
  | Medium | within 4 weeks |
  | Low | within 6 weeks |

- FR-7: WHEN the linked maintenance system Work Order is completed THEN the system SHALL sync back status, completion date/time, assigned technician and technician notes automatically. (from US-AP-03 / §7.3)
- FR-8: WHEN an action is maintenance system-linked THEN the system SHALL display its sync status on the action card. (from US-AP-03; see [OPEN] on the status label set)
- FR-9: WHEN a maintenance system sync fails THEN the system SHALL show a visible error badge on the action card and trigger a retry. (from US-AP-03)
- FR-10: WHEN an action's status is set to On Going THEN the system SHALL treat the action as deployed, send an email notification to all its assignees, make the action available for monitoring in Action Management Platform, and surface it in each assignee's My Actions panel as a view of the Action Management Platform action. (from US-AP-04 / FR-AP-04 / US-AP-07)
- FR-11: WHEN an action is assigned to a user THEN the system SHALL surface it in that user's My Actions with inline status change, and the change SHALL be written to Action Management Platform. (from US-AP-05 / FR-AP-02, §6.3)
- FR-12: WHEN all actions on an event are completed THEN the system SHALL notify the Owner by email and My Alerts. (from US-AP-05 / §10.1)
- FR-13: WHEN an action passes its due date without completion THEN the system SHALL mark its status as Overdue (from Action Management Platform) and notify the assignee, the Manager and the Owner by email. (from US-AP-06 / §10.1)
- FR-14: WHEN the Event Library is filtered THEN the system SHALL surface overdue actions through the Overdue Actions KPI tile. (from US-AP-06)
- FR-15: WHEN the investigation is complete and at least one action is deployed (Final Review ready) THEN the system SHALL notify the Final Reviewer by email and My Alerts. (from Notifications table / FR-GOV-03)
- FR-16: WHEN a user monitors an event action THEN the system SHALL allow that monitoring in the Action Management Platform application for every action linked to the event. (from US-AP-07 / US-INT-10)
- FR-17: WHEN Action Management Platform updates an action's status, assignee, due date, or completion THEN Event Reporting SHALL reflect the change on the linked event without re-entry, and SHALL use that status for workflow gates. (from US-AP-07 / US-INT-10)

Completion gate: at least one corrective action deployed is a precondition for Safety Warning generation (FR-COMM-02) and Final Review availability (FR-GOV-03).

## Non-functional requirements
- Performance: the maintenance system Work Notification round trip completes in under 30 seconds.
- Mobility: completing an action on mobile behaves identically to desktop (FR-SHELL-04).
- Observability: maintenance system sync state is visible per action, and failures are surfaced with a retry; Action Management Platform is the monitoring application for every event action.

## Acceptance criteria (testable)
US-AP-01 — Capture Key Learnings
- [ ] Given I am building the Action Plan, when I add key learnings, then I can add one or more free-text entries.
- [ ] Given I add a key learning, when it is saved, then it is stored with a timestamp.
- [ ] Given no key learning exists, when I try to submit the Action Plan, then submission is blocked.

US-AP-02 — Define Corrective Actions
- [ ] Given I create a corrective action, when it is saved, then it is created in Action Management Platform and linked to the event.
- [ ] Given I create a corrective action, when I fill it in, then I capture a free-text Description.
- [ ] Given a corrective action, when I assign users, then I can assign up to 5 users.
- [ ] Given a corrective action, when I set its schedule, then I set a Due date.
- [ ] Given a corrective action, when I link it, then I select a Linked Root Cause referencing a cause identified in 5 Why or 6M.
- [ ] Given a corrective action, when I view its status, then it is one of: On Going / To Complete / Completed / Cancelled.
- [ ] Given a corrective action, when I open it, then a repeatable comment thread is available on it.

US-AP-03 — Raise Maintenance Work in maintenance system Without Re-Keying
- [ ] Given I set Maintenance Required = Yes on an action, when I save, then a maintenance system Work Notification is auto-generated.
- [ ] Given I select a maintenance system Priority, when the notification is created, then the Requested Date is derived per the priority table (Emergency 24h / High 1 week / Medium 4 weeks / Low 6 weeks).
- [ ] Given the maintenance system Work Order is completed, when the sync runs, then status, completion date/time, assigned technician and technician notes sync back automatically.
- [ ] Given an action is maintenance system-linked, when I view its card, then its sync status is visible.
- [ ] Given a sync fails, when I view the action card, then a visible error badge appears and a retry is triggered.
- [ ] Given the round trip runs, when timed, then it completes in under 30 seconds.

US-AP-04 — Deploy Actions to Their Owners
- [ ] Given I set an action's status to On Going, when it saves, then the action is considered deployed.
- [ ] Given an action is deployed, when notifications fire, then an email is sent to all its assignees.
- [ ] Given an action is deployed, when I open Action Management Platform, then the action can be monitored there.
- [ ] Given an action is deployed, when each assignee opens My Actions, then a My Actions entry exists for them as a view of the Action Management Platform action.

US-AP-05 — Complete My Assigned Action
- [ ] Given an action is assigned to me, when I open My Actions, then it appears there.
- [ ] Given I open My Actions, when I update an action, then I can change its status inline.
- [ ] Given I complete the action on mobile, when compared with desktop, then the behaviour is identical.
- [ ] Given all actions on an event are completed, when the last one closes, then the Owner is notified.

US-AP-06 — Chase Overdue Actions
- [ ] Given an action passes its due date without completion, when I view it, then its status shows as Overdue.
- [ ] Given an action is overdue, when escalation fires, then the assignee, the Manager and the Owner are notified by email.
- [ ] Given the Event Library is filtered, when I view KPIs, then overdue actions are surfaced by the Overdue Actions KPI tile.

US-AP-07 — Monitor every event action in Action Management Platform
- [ ] Given an action is linked to an event, when I open the Action Management Platform application, then I can monitor that action there.
- [ ] Given Action Management Platform changes the action's status, assignee, due date or completion, when I open the event, then the linked action reflects that change without re-entry.

## Dependencies
- [Investigation](../04-investigation/Investigation.md) — root causes marked in 5 Why / 6M feed `linked_root_cause`; investigation completeness co-gates Final Review and Safety Warning.
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) — Final Review availability requires ≥1 action deployed (FR-GOV-03).
- [Safety Communication](../07-safety-communication/Safety%20Communication.md) — Safety Warning generation requires ≥1 action deployed (FR-COMM-02).
- [Integrations](../12-integrations/Integrations.md) — Action Management Platform (US-INT-10) is the source of event actions; maintenance management system connectivity for maintenance-flagged actions. Assumption A-03: maintenance management system instances at each plant accept Work Notification creation via API.

## Open questions
- [OPEN]: US-AP-01 makes at least one Key Learning a hard gate on AP submission, yet the Key Learning Entry page is deferred to backlog. Confirm whether the gate is also deferred or a minimal entry surface is needed in MVP.
- [OPEN]: US-AP-04 (deployment) is deferred, but "at least one action deployed" gates both Safety Warning and Final Review. Confirm how deployment happens in MVP.
- [OPEN]: Risk R-02 (High/High) — maintenance management system instance variation across plants causes integration inconsistency. Mitigation proposed: minimum maintenance management system API version requirement and a plant readiness checklist; confirm ownership.
- [OPEN]: The action card sync status is specified as Active / Synced / Error, while the data model enum is Pending / Synced / Error. Confirm the label set.
- [OPEN]: Confirm whether maintenance system Work Notifications for maintenance-flagged actions are raised by Event Reporting or by Action Management Platform.
- [OPEN]: Confirm whether My Actions in the Event shell remains a live view of Action Management Platform assignments, or whether assignees are sent to the Action Management Platform application instead.
