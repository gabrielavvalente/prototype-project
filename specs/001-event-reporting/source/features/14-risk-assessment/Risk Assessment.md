# Feature 014: Risk Assessment Integration

## Goal

Channel every event that reveals a gap in an existing risk assessment into the Risk Assessment tool's Potential Risk Queue, so that site risk documents are updated from real shop-floor incidents instead of drifting from reality.

## Why

Incident reporting and risk assessment are today isolated processes. Routing risk-gap events into a centralized review queue shifts EHS workflows from reactive incident management to preventive, continuous risk profiling: it connects real operational events with formal risk registers, keeps risk ratings, hazard evaluations and SOPs calibrated against actual anomalies, and helps site leadership prioritise which workshops, activities, hazards or equipment need mitigation or investment first.

## Platform context

- Source: Proposal / Risk Assessment Alignment
- Modules involved: Root Cause Analysis / Investigation (risk-gap flag), Event Validation and Closure (trigger points), Risk Assessment tool (Potential Risk Queue, dashboard, creation wizard), Notifications (owner notification on signal completion).
- Platform contracts reused: plant hierarchy context (Department, Workshop, Workstation or Equipment hierarchy); hazard and environmental classification model (Pillar, Hazards, Aspects, Impacts); anonymization of the event statement.

## User stories

1. US-RA-01: As an EHS Manager or Safety Specialist, I want events identified as risk gaps to become part of the Risk Assessment tool's Potential Risk Queue, so that we automatically capture real-world incidents as trigger signals for updating site risk documents.
2. US-RA-02: As a Risk Assessor or Site Administrator, I want to use the Potential Risk Queue to directly update our active risk assessments, so that our safety documentation remains accurate and reflects current shop floor realities.

## Scope

- IN: risk-gap flagging at RCA/investigation, automatic risk-signal generation on validated Closure or approved Final Review, and push to the Potential Risk Queue (US-RA-01); queue review with Link & Re-score, Create New Risk Assessment, and Dismiss/No Gap actions (US-RA-02).
- OUT: automated re-scoring of risk assessments — re-scoring is triggered by an assessor from the queue, never applied automatically.

## Functional requirements (EARS)

- FR-1: WHEN an event's Root Cause Analysis or investigation stage flags "Does this event reveal a gap in an existing risk assessment? = Yes" THEN the system SHALL mark the event as a Risk Gap. (from US-RA-01)
- FR-2: WHEN a Risk Gap event reaches validated Closure or approved Final Review THEN the system SHALL automatically translate the record into a structured risk signal. (from US-RA-01)
- FR-3: WHEN a risk signal is generated THEN the system SHALL push it to the Potential Risk Queue in the Risk Assessment tool, populated with plant context (Department, Workshop, Workstation, or Equipment hierarchy), hazard and environmental classifications (Pillar, Hazards, Aspects, Impacts), and the anonymized Event Statement and Key Learnings. (from US-RA-01)
- FR-4: WHEN a queue entry is created THEN the system SHALL display a dynamic back-link opening the originating Event Reporting record for auditing. (from US-RA-01)
- FR-5: WHEN a user opens the Risk Assessment dashboard THEN the system SHALL display the pending items in the active Potential Risk Queue. (from US-RA-02)
- FR-6: WHEN the assessor selects an item from the queue THEN the system SHALL offer three actions: `[Link & Re-score]` (attach the signal to an existing Risk Assessment ID, flag it as revised, trigger an assessment review workflow); `[Create New Risk Assessment]` (open the creation wizard pre-populated with department, workstation, hazard and aspect data from the signal); `[Dismiss/No Gap]` (log a dismissal reason and archive the signal for tracing non-critical anomalies). (from US-RA-02)
- FR-7: WHEN a risk assessment is updated or created from a signal THEN the system SHALL mark the risk signal status as `Completed` and notify the originating event's owner. (from US-RA-02)

## Non-functional requirements

- Privacy: the event statement travels anonymized in every risk signal.
- Auditability: every queue entry keeps a traceable back-link to its originating event; dismissals are logged with a reason.
- Observability: risk-signal statuses (pending, Completed, dismissed/archived) are visible in the queue.

## Acceptance criteria (testable)

US-RA-01 — Route event gaps to the Potential Risk Queue
- [ ] Given an event's RCA or investigation stage, when "Does this event reveal a gap in an existing risk assessment?" is answered Yes, then the event is marked as a Risk Gap.
- [ ] Given a Risk Gap event, when it reaches validated Closure or approved Final Review, then a structured risk signal is generated automatically.
- [ ] Given a risk signal is generated, when it is pushed, then it lands in the Potential Risk Queue populated with plant context, hazard and environmental classifications, and the anonymized Event Statement and Key Learnings.
- [ ] Given a queue entry is created, when a reviewer opens it, then a dynamic back-link opens the originating Event Reporting record.

US-RA-02 — Continuous risk assessment updates from risk signals
- [ ] Given the Risk Assessment dashboard, when the user opens it, then pending items in the active Potential Risk Queue are visible.
- [ ] Given the assessor selects a queue item, when the action menu opens, then `[Link & Re-score]`, `[Create New Risk Assessment]` and `[Dismiss/No Gap]` are offered.
- [ ] Given `[Link & Re-score]` is chosen, when it completes, then the signal is attached to an existing Risk Assessment ID, the assessment is flagged as revised, and a review workflow is triggered.
- [ ] Given `[Create New Risk Assessment]` is chosen, when the wizard opens, then department, workstation, hazard and aspect data are pre-populated from the event signal.
- [ ] Given `[Dismiss/No Gap]` is chosen, when the user confirms, then a dismissal reason is logged and the signal is archived.
- [ ] Given a risk assessment is updated or created from a signal, when the operation completes, then the signal status becomes `Completed` and the originating event's owner is notified.

## Dependencies

- Inherits lifecycle stages (Root Cause Analysis, Validation, Closure) and statuses from Feature 000: Core Event Lifecycle (../../core.md).
- [Feature 012: Integrations](../12-integrations/Integrations.md) — the Risk Assessment tool integration endpoint that carries the risk signal (US-INT-09), including its queue-and-retry delivery commitment.
- [Notifications](../11-notifications/Notifications.md) — owner notification on signal completion.
- Risk Assessment tool availability: Potential Risk Queue, dashboard and creation wizard are hosted there, not in Event Reporting.

## Open questions

- [OPEN]: The feature header stated "MVP: Partially included (Queue integration in, automated re-scoring out)" while both stories carried MVP In flags — confirm whether all of US-RA-02's queue actions are MVP, or only queue population (US-RA-01) is.
- [OPEN]: This proposal is not yet in the BRD — confirm ratification status and target BRD version.
