# Feature 012: Integrations

## Goal

Connect Event Reporting to the systems that already own plant structure, users, translations, actions, maintenance work and email delivery, so that data is consumed — not replicated — and no user performs double entry.

## Why

Event Reporting is a consolidation product, so integration is the premise, not an add-on. External systems involved: the platform master data service supplies plant structure, users and translations; **Action Management Platform** owns every event action and is the application where actions are monitored; maintenance management system carries maintenance work bidirectionally; the Risk Assessment tool receives risk-gap signals; External Reporting Platform is designed-for but feature-flagged off; email delivers every notification. The convergence driver is explicit: plant structure, user rights, translations and actions managed in existing platforms must be consumed, not replicated.

## Platform context

- Source: Event Reporting BRD v1.0.0 — §3.1(12), §6.2, §7, §9.1, §9.3
- Modules involved: Integrations menu (Super Admin only), Action Plan (Action Management Platform integration, maintenance management system sync), Notifications (email channel), Global Shell, External Reporting Platform Integration (Feature 008), Risk Assessment Integration (Feature 014), Configuration and Administration (consumed plant structure and users).
- Platform contracts reused: plant structure, user accounts and translations from the platform master data service; the notification engine as the single email channel; feature flags for dormant integrations (External Reporting Platform). User authentication, SSO, MFA and session management are not specified in Event Reporting.

### Reference data — plant hierarchy

| Source                       | Hierarchy                                                |
| ---------------------------- | -------------------------------------------------------- |
| Platform master data service | Plant → Department → Workshop → Job → Workstation → Task |

## User stories

1. US-INT-01: As a Site Admin, I want Event Reporting to read my plant hierarchy and users straight from the platform master data service, so that I maintain that data in one place instead of two. (BRD §7.1)
2. US-INT-03: As an Event Owner, I want maintenance-flagged corrective actions to raise maintenance system Work Notifications automatically, so that maintenance is requested through the system that actually schedules it. (BRD §7.3)
3. US-INT-04: As an Event Owner, I want maintenance system to tell Event Reporting when the work is done, so that I can close the corrective action on evidence rather than by asking around. (BRD §7.3)
4. US-INT-05: As a Super Admin, I want the External Reporting Platform integration built but inert until I enable it, so that we are ready to report to External Reporting Platform without shipping an untested sync. (BRD §7.4)
5. US-INT-06: As a notification recipient, I want email sent through one governed channel, so that messages look official and honour my preferences. (BRD §7.5)
6. US-INT-07: As a Super Admin, I want one dashboard showing the state of every integration, so that I find out a sync is broken before users report bad data. (BRD §13, §7.3)
7. US-INT-08: As a platform security owner, I want all outbound and inbound integration traffic hardened, so that an integration cannot become the weakest link. (BRD §9.1, §9.3)
8. US-INT-09: As an EHS Manager or Safety Specialist, I want events identified as risk gaps to become part of the Risk Assessment tool Potential Risk Queue, so that we transform real operational events into risk signals for preventive assessment.
9. US-INT-10: As an Event Owner or action assignee, I want every event action created and monitored in Action Management Platform, so that Event Reporting does not keep a second action list and I can follow all actions in one application.

## Scope

- IN (BRD §13): maintenance management system integration — push of Work Notifications (US-INT-03) and receipt of Work Order completion (US-INT-04); notification email delivery (US-INT-06); Integrations Status Dashboard (US-INT-07); secured integration points (US-INT-08); underlying data consumption of plant structure, user accounts and translations from the platform master data service (US-INT-01 — MVP depends on this data flowing in); Action Management Platform as the source of every event action, with monitoring in the Action Management Platform application (US-INT-10).
- OUT (BRD §13): sync management pages for the platform master data service (the data consumption itself remains IN — only the admin sync pages are deferred); External Reporting Platform activation — designed-in but feature-flagged off (US-INT-05); Risk Assessment tool Potential Risk Queue sync (US-INT-09). Event Reporting SHALL NOT own a standalone action catalogue that replaces Action Management Platform. Authentication, SSO, MFA, password storage and session management are not specified in Event Reporting.

## Functional requirements (EARS)

- FR-1: WHEN a sync runs (on-demand or scheduled) THEN the system SHALL consume plant structure (Department → Workstation), user accounts with base roles, and translation strings from the platform master data service. (from US-INT-01)
- FR-2: WHEN plant structure is consumed from the platform master data service THEN the system SHALL NOT maintain its own duplicate hierarchy. (from US-INT-01)
- FR-3: WHEN upstream master data changes THEN the system SHALL reflect the change in Event Reporting after the next sync. (from US-INT-01)
- FR-7: WHEN a corrective action is saved with Maintenance Required THEN the system SHALL create a Work Notification in maintenance management system immediately, with no manual double entry anywhere in the flow. (from US-INT-03)
- FR-8: WHEN a maintenance management system sync fails THEN the system SHALL show a visible error badge on the action card and trigger a retry mechanism. (from US-INT-03)
- FR-9: WHEN a Work Order is completed in maintenance management system THEN the system SHALL receive the status update (by polling or webhook) together with technician, completion date/time and technician notes, and SHALL update the linked corrective action without manual entry. (from US-INT-04)
- FR-10: WHEN the sync state of an action changes THEN the system SHALL display the state on the action card as Active / Synced / Error. (from US-INT-04)
- FR-11: WHEN the product launches THEN the system SHALL expose no active user-facing External Reporting Platform entry point. (from US-INT-05)
- FR-12: WHEN the Super Admin enables the External Reporting Platform feature flag THEN the system SHALL make available manual submission (Event Reporting → External Reporting Platform) and pull on form open (External Reporting Platform → Event Reporting), with deduplication and conflict-resolution logic already in place. (from US-INT-05 — full specification in [External Reporting Platform Integration](../08-external-reporting-integration/External%20Reporting%20Integration.md))
- FR-13: WHEN a notification email is sent THEN the system SHALL send it through the notification engine (no direct SMTP from the UI layer), using an approved the organization template and including a direct deep-link to the event record. (from US-INT-06)
- FR-14: WHEN a recipient has opted out THEN the system SHALL NOT send them notification email. (from US-INT-06)
- FR-15: WHEN a user opens the Integrations menu THEN the system SHALL grant access to Super Admin only. (from US-INT-07)
- FR-16: WHEN the Integrations Status Dashboard renders THEN the system SHALL show, per integration (platform master data service, Action Management Platform, maintenance management system, External Reporting Platform, Email, Risk Assessment tool), the current state, any error state, and the timestamp of the last sync. (from US-INT-07)
- FR-18: WHEN an event whose Root Cause Analysis flags "Does this event reveal a gap in an existing risk assessment? = Yes" reaches Event Validation or Closure THEN the system SHALL transform the incident into a risk signal and push it to the Risk Assessment tool integration endpoint, populating the Potential Risk Queue with the associated department, workshop, workstation/machine, hazard classification and the anonymised event statement. (from US-INT-09 — detailed in [Feature 014: Risk Assessment Integration](../14-risk-assessment/Risk%20Assessment.md))
- FR-19: WHEN the Risk Assessment tool queue receives an item THEN the system SHALL create a traceability link back to the originating Event Reporting record for EHS reviewers. (from US-INT-09)
- FR-20: WHEN a corrective action is created, assigned, updated, or completed on an event THEN the system SHALL do so through Action Management Platform; Event Reporting SHALL NOT keep an independent copy of the action as the system of record. (from US-INT-10 — detailed in [Action Plan](../05-action-plan/Action%20Plan.md))
- FR-21: WHEN an action exists for an event THEN the user SHALL be able to monitor that action in the Action Management Platform application, and Event Reporting SHALL keep the event linked to the Action Management Platform action so workflow gates (deployment, overdue, completion, validation) use Action Management Platform status. (from US-INT-10)
- FR-22: WHEN Action Management Platform changes an action's status, assignee, due date, or completion THEN Event Reporting SHALL reflect the change on the linked event without the user re-entering it. (from US-INT-10)

### Supporting table — integration flows

| Data | Direction | Trigger |
|---|---|---|
| Plant structure (Department → Workstation) | Platform master data service → Event Reporting | On-demand / scheduled |
| User accounts and base roles | Platform master data service → Event Reporting | On-demand |
| Translation strings | Platform master data service → Event Reporting | On-demand |
| Work Notification creation | Event Reporting → maintenance management system | On action save with Maintenance Required |
| Work Order completion data | maintenance management system → Event Reporting | Polling / webhook |
| Event action create / assign / update | Event Reporting → Action Management Platform | On action create, deploy, or Event-side update |
| Action status, assignee, due date, completion | Action Management Platform → Event Reporting | When the action changes in Action Management Platform |
| Action monitoring | User in the Action Management Platform application | Anytime, for every event action |
| Event submission / pull | Event Reporting ↔ External Reporting Platform | Feature-flagged (manual button / on form open) |
| Notification email | Event Reporting → Email | On notification trigger |

### Supporting table — maintenance system priority mapping

| maintenance system Priority | Requested Date |
|---|---|
| Emergency | within 24 hours |
| High | within 1 week |
| Medium | within 4 weeks |
| Low | within 6 weeks |

## Non-functional requirements

- Availability: 99.5% uptime during core business hours across all time zones; maintenance windows in off-peak hours, communicated 48 hours in advance.
- Performance: maintenance management system sync round trip completes in under 30 seconds.
- Security (BRD §9.1, §9.3 / US-INT-08): all integration calls use TLS 1.2 or higher; secrets live in a vault, never in source (A02); every integration point passes threat modeling at a design review gate (A04); build pipeline signed, no untrusted deserialization (A08); outbound destinations allowlisted — no user-controlled URL fetch (A10).
- Observability: integration health, errors and last-sync timestamps surfaced on the Integrations Status Dashboard.

## Acceptance criteria (testable)

US-INT-01 — Consume plant structure and users (platform master data service)
- [ ] Given a sync runs for a plant, when it completes, then plant structure, user accounts with base roles, and translation strings flow into Event Reporting per the integration-flows table.
- [ ] Given plant structure is consumed, when Event Reporting stores it, then no duplicate local hierarchy is maintained.
- [ ] Given upstream master data changes, when a subsequent sync runs, then the change is reflected in Event Reporting.

US-INT-03 — Push maintenance work to maintenance management system
- [ ] Given an action is saved with Maintenance Required, when the save completes, then a Work Notification is created in maintenance management system immediately.
- [ ] Given the integration is live, when maintenance work flows through, then no manual double entry is required anywhere.
- [ ] Given a sync fails, when the failure is detected, then a visible error badge appears on the action card and a retry mechanism triggers.
- [ ] Given the round trip runs, when measured, then it completes in under 30 seconds.

US-INT-04 — Receive maintenance system Work Order completion
- [ ] Given a Work Order is completed in maintenance management system, when the update flows back (polling or webhook), then technician, date/time and technician notes sync to Event Reporting.
- [ ] Given the completion data arrives, when the linked corrective action is displayed, then it reflects the data without manual entry.
- [ ] Given sync state changes, when the action card renders, then it shows Active / Synced / Error.

US-INT-05 — External Reporting Platform designed-in but switched off
- [ ] Given the product launches, when any user navigates the product, then no user-facing External Reporting Platform entry point is active.
- [ ] Given the Super Admin enables the feature flag, when the flag takes effect, then submission (manual button) and pull (on form open) become available, and deduplication and conflict-resolution logic already exist.

US-INT-06 — Deliver notification email reliably
- [ ] Given an email is sent, when it is delivered, then it uses an approved the organization template and includes a direct deep-link to the event record.
- [ ] Given an email is sent, when it is dispatched, then it goes through the notification engine — no direct SMTP from the UI layer.
- [ ] Given a recipient has opted out, when a notification triggers, then no email is sent to that recipient.

US-INT-07 — Monitor integration health
- [ ] Given a non-Super-Admin user, when they look for the Integrations menu, then it is not visible to them.
- [ ] Given the status dashboard renders, when the Super Admin views it, then it shows the current state, any error state, and the last-sync timestamp per integration (platform master data service, Action Management Platform, maintenance management system, External Reporting Platform, Email, Risk Assessment tool).

US-INT-08 — Secure every integration point
- [ ] Given any integration call, when it is made, then it uses TLS 1.2+ and secrets are read from a vault, never from source.
- [ ] Given an integration point is designed, when it passes the design review gate, then threat modeling has been completed.
- [ ] Given outbound calls are made, when a destination is resolved, then it is on the allowlist — no user-controlled URL fetch.

US-INT-09 — Integrate with Risk Assessment tool (Potential Risk Queue)
- [ ] Given an event's RCA flags a risk-assessment gap, when the event reaches Validation or Closure, then a risk signal is generated and pushed to the Risk Assessment tool endpoint.
- [ ] Given the payload is sent, when the Risk Assessment tool receives it, then the Potential Risk Queue is populated with department, workshop, workstation/machine, hazard classification and the anonymised event statement.
- [ ] Given the queue item is created, when an EHS reviewer opens it, then a traceability link back to the originating Event Reporting record is available.

US-INT-10 — Integrate event actions with Action Management Platform
- [ ] Given an Event Owner creates a corrective action on an event, when it is saved, then the action exists in Action Management Platform and Event Reporting holds a link to it rather than a second master copy.
- [ ] Given an action exists for an event, when a user opens Action Management Platform, then that action can be monitored there.
- [ ] Given Action Management Platform changes the action's status, assignee, due date or completion, when Event Reporting next shows the event, then the linked action reflects that change without re-entry.

## Dependencies

- [Action Plan](../05-action-plan/Action%20Plan.md) — event actions are created through Action Management Platform; Event Reporting consumes Action Management Platform status for workflow gates; maintenance management system remains on maintenance-flagged actions.
- [External Reporting Platform Integration](../08-external-reporting-integration/External%20Reporting%20Integration.md) — full External Reporting Platform specification behind the feature flag.
- [Feature 014: Risk Assessment Integration](../14-risk-assessment/Risk%20Assessment.md) — full Risk Assessment tool / Potential Risk Queue specification.
- [Configuration and Administration](../10-configuration-and-administration/Configuration%20and%20Administration.md), [Notifications](../11-notifications/Notifications.md), [Global Shell](../01-global-shell/Global%20Shell.md).
- Upstream API availability (assumptions A-01 to A-08): platform master data service APIs for plant structure and users; Action Management Platform available to create, update and monitor event actions; maintenance management system instances at each plant accepting Work Notification creation via API; External Reporting Platform API schema stable enough for field mapping at design time; email infrastructure for notification delivery; Risk Assessment tool API endpoints accessible for publishing risk signals.
- Mitigations carried as commitments: version-pinned API contracts with integration tests in CI (upstream API drift); minimum maintenance management system API version plus plant readiness checklist (instance variation); feature flag plus schema validation suite (External Reporting Platform drift); queue-and-retry on the Event Reporting side (Risk Assessment tool or Action Management Platform unavailability).

## Open questions

- [OPEN]: Confirm approved neutral labels for the upstream master data service.
- [OPEN]: Plant migration requires a data-migration or clean-start decision per plant (A-05); the decision and the migration playbook (validation gates, parallel run) are not yet defined.
- [OPEN]: maintenance management system instance variation across plants is rated high likelihood / high impact — confirm the minimum maintenance management system API version and the plant readiness checklist before rollout.
- [OPEN]: Translation pipeline delays could block non-English rollouts — confirm the AI-fallback coverage and the translation sprint plan per language wave.
- [OPEN]: Confirm whether maintenance system Work Notifications for maintenance-flagged actions are raised by Event Reporting or by Action Management Platform.
- [OPEN]: Confirm whether assigned immediate actions at event submission (US-CREATE-06) also go through Action Management Platform, or only Action Plan corrective actions.
