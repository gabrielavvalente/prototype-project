# Feature 021: Safety Event

## Goal

Enable any person assigned to a plant to report a Safety Event (TF1–TF5) and drive it through review, severity assessment, conditional root cause analysis, action planning, and validated closure.

## Why

Safety accidents, near misses, and hazardous situations must be captured, triaged by severity, investigated when the risk warrants it, and closed only after corrective actions are validated — with rapid communication (Safety Alert) and detailed learning distribution (Safety Warning) along the way.

## Platform context

- Modules involved: enterprise operations platform Event Module (core lifecycle), Safety Event configuration, Master Data (Site Structure, EHS Structure, H&S reference data), Notifications, PDF generation, Record Historian.
- Platform contracts reused: core 5-stage lifecycle and 4-status model (Feature 000), Master Data controlled value lists, notification service.
- Technical note: actions can optionally raise maintenance system maintenance synchronization alerts (Notify Maintenance; maintenance management system work orders).

### Safety Event levels

| SAF Code | Level | Name |
|---|---|---|
| TF1 | Level 1 | Lost Time Accident |
| TF2 | Level 2 | Non-Lost Time Accident |
| TF3 | Level 3 | First Aid |
| TF4 | Level 4 | Near Miss |
| TF5 | Level 5 | Hazardous Situation |

Workflow requirements per level are not hardcoded; they are driven by Master Data configuration evaluated against the selected Event Level, HPR context, and review decisions.

### Reference data

- Site Structure Master Data (cascading hierarchy): Department → Workshop → Process Step → Workstation → Equipment.
- EHS Structure Master Data: Job, Task.
- H&S Master Data controlled value lists: Standard Associated, Hazard Associated, Body Parts, Injuries, HPR Type.
- Type of Employee Involved (static classification): organization employee; Temporary worker; Permanent contractor; Contractor other than permanent; Other.
- HPR Type (static classification): Entry to machine area without LOTO; Confined Space entry without permit; Any unsecured Confined Space; Unguarded access to the dangerous parts of equipment; Collision of vehicle or its load with another vehicle, a pedestrian or with a building; Roll over or tip-over of a vehicle; Loss of load or part of load from a vehicle; Collapse of a stacked material; Object falling or likely to fall from height; Failure of lifting equipment or falling load; Unsecured access point to permit required roof; Person working unsafely at height; Any unsafe electrical work or electrical equipment in poor conditions; Any Fire or Explosion; Any other incident that could cause a serious injury.

## User stories

1. As a person assigned to the plant (reporter), I want to submit a Safety Event with the core facts (type/level, HPR question, dates, description, locations, persons involved, immediate actions) so that safety occurrences are captured and routed to reviewers.
2. As a reviewer (Plant Manager, Shift Leader, or Local EHS), I want to self-assign to a submitted event and screen its validity so that duplicates, irrelevant, or low-quality reports are archived and only genuine events continue.
3. As a reviewer, I want to enrich a valid event with associated Standards, Hazards, Body Parts, Injuries, and Actual/Potential Severity ratings via the severity matrices so that routing reflects the real and credible worst-case risk.
4. As a reviewer, I want low-risk events (non-HPR, TF4/TF5, non-Red) to offer a "Do you want to further analyze?" decision so that minor events can go straight to an Actions List instead of a full RCA.
5. As an investigator, I want structured analysis tools (optional 5W1H guide, mandatory 6M + 5 Why) plus learnings and risk-assessment-gap capture so that root causes are identified rigorously.
6. As an investigator/reviewer, I want to generate a Safety Alert PDF once the Event Statement and Immediate Actions are completed so that the event and immediate response are communicated rapidly.
7. As an action owner/assignee, I want corrective and preventive actions with locations, owners, due dates, and optional maintenance notification so that remediation work is executed and tracked to closure.
8. As a validator, I want to verify completion logs and media proof before accepting the action plan so that events close only when actions are genuinely effective.
9. As a stakeholder, I want a detailed Safety Warning PDF compiled at closure so that investigation results, learnings, and action plans are shared for prevention.
10. As any lifecycle participant, I want a read-only Historian tab of every change so that the event record is fully auditable.

## Scope

- IN:
  - Safety Event submission (TF1–TF5) with HPR identification, by any person assigned to the plant.
  - Review with validity screening, enrichment (Standards, Hazards, Body Parts, Injuries), and dual severity matrices (Actual / Potential).
  - Severity-driven and level-driven routing to RCA, "further analyze?" decision, or direct Actions List.
  - Structured RCA (5W1H optional, 6M + 5 Why mandatory), investigator assignment, learnings, risk-assessment gap check.
  - Action Plan (full setting) and Actions List (simplified tracker), action lifecycle with deadline tracking and maintenance notification.
  - Final validation and closure; Safety Alert and Safety Warning PDFs; automated notifications; read-only Historian.
- OUT:
  - Core lifecycle, stages, statuses, and generic workflow behavior — owned by Feature 000 (not redefined here).
  - Hardcoded workflow behavior per Event Level — workflow requirements come from Master Data configuration only.
  - Governance and maintenance of Master Data value sets (Standards, Hazards, Injuries, Body Parts) — owned by the Control Panel features.
  - The PDFs as system of record — Safety Alert and Safety Warning are communication documents and do not replace the event record.

## Functional requirements (EARS)

### Submission

- FR-1: WHEN a person assigned to the plant submits a Safety Event with all required submission fields THEN the system SHALL create the event, set its status to Open, and notify the reviewer group (was N-001).
- FR-2 (was SFT-001): WHEN Event Level is not TF5 THEN the system SHALL show the Job, Task, and Task Type fields.
- FR-3 (was SFT-002): WHEN Could this be an HPR? = Yes THEN the system SHALL require Job, Task, and Task Type at submission and HPR Type at the Review stage.
- FR-4 (was SFT-003): WHEN Event Level is TF1, TF2, or TF3 THEN the system SHALL show the Type of Employee Involved field.
- FR-5 (was SFT-004): WHEN Type of Employee Involved is not the organization THEN the system SHALL show Name and What Was the Person Doing? and hide Job, Task, and Task Type.
- FR-6 (was SFT-005): WHEN Event Level is TF3 (First Aid) THEN the system SHALL show the First Aid Treatment field.
- FR-7 (was SFT-006): WHEN First Aid Treatment = Other THEN the system SHALL show the First Aid Comment field.
- FR-8: WHEN a Site Structure field value is selected THEN the system SHALL filter the available values of its child level (Department → Workshop → Process Step → Workstation → Equipment).

#### Submission fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Type | Dropdown | Yes | Safety / SAF (Primary Event Choice) |
| Event Level | Dropdown | Yes | TF1 to TF5 (Primary Event Choice) |
| Could this be an HPR? | Yes/No | Yes | Asked immediately after the event choice |
| Reporter | Dropdown | Yes | Auto-filled |
| Shift | Dropdown | Yes | Auto-filled |
| Report Date | Date | Yes | Auto-filled |
| Event Date | Date | Yes | Auto-filled, editable |
| Event Time | Time | No | |
| Event Description | Long Text | Yes | Narrative description |
| Department | Dropdown | Yes | Physical Structure |
| Workshop | Dropdown | Yes | Physical Structure |
| Process Step | Dropdown | No | Physical Structure |
| Workstation | Dropdown | No | Physical Structure |
| Equipment | Dropdown | No | Physical Structure |
| Job | Dropdown | No | EHS Structure |
| Task | Dropdown | No | EHS Structure |
| Task Type | Dropdown | No | EHS Structure |
| Type of Employee Involved | Dropdown | Yes | Static classification (see Reference data) |
| Name | Short Text | No | Required for contractors/visitors |
| What Was the Person Doing? | Short Text | Yes | Required if person involved |
| First Aid Treatment | Dropdown | Yes | Required for TF3 |
| First Aid Comment | Long Text | Yes | Required for TF3 |
| Any Actions Taken? | Yes/No | Yes | |
| Immediate Actions | Long Text | No | |
| Proposed Additional Actions | Long Text | No | |
| Attachments | Attachments | No | |

### Review

- FR-9: WHEN a reviewer self-assigns to an Open event THEN the system SHALL set the event status to In Progress.
- FR-10 (was SFT-007): WHEN Is This Event Valid? = No THEN the system SHALL show and require Reason of Invalidation (Duplicate, Not relevant, Low quality), set the event status to Archived, notify the Reporter (was N-002), and end the workflow.
- FR-11 (was SFT-008): WHEN Is This Event Valid? = Yes THEN the system SHALL require Standard Associated, Hazard Associated, Body Parts, Injuries, Actual Severity (if Event Level is TF1, TF2, or TF3), and Potential Severity (if Event Level is TF1, TF2, TF3, or TF4), hide Reason of Invalidation, and keep the event In Progress in the workflow.
- FR-12: WHEN Is This Event Valid? = Yes and Standard Associated and Hazard Associated have been selected THEN the system SHALL display the severity matrices applicable to the Event Level (Actual Severity for TF1–TF3; Potential Severity for TF1–TF4; neither for TF5) and hide any matrix not required for the selected level.
- FR-13: WHEN the reviewer clicks a single cell of a displayed matrix THEN the system SHALL highlight the cell, derive the Severity Score (Impact weight × Duration weight), and populate the corresponding read-only Severity Level field with the calculated score and band; the field SHALL NOT be typed manually.
- FR-14: WHEN any matrix required for the selected Event Level has no selection THEN the system SHALL block submission of the review.
- FR-15: WHEN Actual and Potential Severity are both assessed THEN the system SHALL evaluate them independently (a Minor/Minimal actual injury may still carry a Red Potential Severity) and store both scores and bands on the record, on communication outputs, and in the Historian.

#### Review fields

Standard reviewer group: Plant Manager, Shift Leader, Local EHS.

| Field | Type | Required | Notes |
|---|---|---|---|
| Reviewer's Name | Dropdown | Yes | Auto-filled |
| Review Date | Date | Yes | Auto-filled |
| Is This Event Valid? | Yes/No | Yes | Quality-screening decision field |
| Reason of Invalidation | Dropdown | Conditional | Required when Is This Event Valid? = No |
| Standard Associated | Dropdown | Yes | Required if valid |
| Hazard Associated | Dropdown | Yes | Required if valid |
| Actual Severity | Matrix | Conditional | Required for TF1–TF3; clickable dual-axis matrix shown after Standard and Hazard selection |
| Potential Severity | Matrix | Conditional | Required for TF1–TF4; clickable dual-axis matrix shown after Standard and Hazard selection |
| Body Parts | Multi Select | Yes | Required if valid |
| Injuries | Multi Select | Yes | Required if valid |
| HPR Type | Dropdown | Conditional | Required if valid and Could this be an HPR? = Yes |

#### Severity matrices

Two identical dual-axis matrices, in this order: 1. Severity Level Calculation (Actual — rates the injury that actually occurred); 2. Potential Severity Level Calculation (Potential — rates the credible worst-case injury under slightly different circumstances). TF4 has no actual injury but still has a credible worst-case outcome; TF5 requires neither.

Axis 1 — Impact of the Injury (rows):

| Impact | Definition | Weight |
|---|---|---|
| Severe | The injury will prevent the person from pursuing most or all of their private and recreational activities | 5 |
| Significant | The injury will significantly reduce the person's private and recreational activities | 3 |
| Minor | The impact on the person's life is minimal | 1 |

Axis 2 — Duration of the Impact / Recovery Time (columns):

| Duration | Definition | Weight |
|---|---|---|
| Minimal | Recovery will take 1 week or less | 2 |
| Short term | More than 1 week but less than 1 month | 5 |
| Medium term | More than 1 month but less than 6 months | 10 |
| Long term / Permanent | 6 months or more, or the person may never fully recover | 20 |

Severity Score = Impact weight × Duration weight:

| | Minimal (2) | Short term (5) | Medium term (10) | Long term/Permanent (20) |
|---|---|---|---|---|
| **Severe (5)** | 10 | 25 | 50 | 100 |
| **Significant (3)** | 6 | 15 | 30 | 60 |
| **Minor (1)** | 2 | 5 | 10 | 20 |

Severity bands (drive downstream workflow; Potential band also supports HPR determination):

| Band | Score range | Meaning |
|---|---|---|
| Yellow — Low | 2 to 15 | Low severity |
| Orange — Medium | 20 to 30 | Medium severity |
| Red — High | 50 to 100 | High severity |

Note: in the legacy Event Reporting tool these matrices appear at submission; in enterprise operations platform they are completed by the reviewer at the Review stage, since severity assessment is a triage responsibility.

### Routing

- FR-16 (was SFT-009): WHEN the event is HPR, TF1, TF2, or TF3, or Actual or Potential Severity is High (Red, score 50 or above) THEN the system SHALL route the event to the RCA path; WHEN the Red severity condition is met THEN the RCA stage SHALL NOT be skippable by configuration or reviewer decision.
- FR-17 (was SFT-010): WHEN the event is not HPR/TF1/TF2/TF3 and neither Actual nor Potential Severity is Red THEN the system SHALL display the decision "Do you want to further analyze?" and route to the RCA path if Yes, or to the Actions List path if No.

### Root Cause Analysis

- FR-18: WHEN the event enters the RCA stage THEN the system SHALL auto-fill Event Statement and Immediate Actions from the submission context and require Investigator assignment, the 6M & 5 Why analytical module (5W1H remains an optional guide), Learnings, and the risk-assessment gap question.
- FR-19 (was SFT-011): WHEN Does this Event Reveal a Gap in an Existing Risk Assessment? = Yes THEN the system SHALL show Is this an Existing Risk?.
- FR-20 (was SFT-012): WHEN Is this an Existing Risk? = Yes THEN the system SHALL require Select Risk Assessment.
- FR-21: WHEN Event Statement and Immediate Actions are completed THEN the system SHALL make the Safety Alert PDF available for generation.

#### RCA fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Statement | Long Text | Yes | Auto-filled from submission context |
| Immediate Actions | Long Text | Yes | Auto-filled from submission context |
| Investigator | Multi Select | Yes | Investigator profile assignment |
| 5W1H | Structured UI | Optional | Guide helper tab |
| 6M & 5 Why | Structured UI | Yes | Core required analytical tabs |
| Learnings | Long Text | Yes | Lessons learned summaries |
| Does this Event Reveal a Gap in an Existing Risk Assessment? | Yes/No | Yes | |
| Is this an Existing Risk? | Yes/No | Conditional | Required when Gap = Yes |
| Select Risk Assessment | Multi Select | Conditional | Required when Existing Risk = Yes |

### Action Plan

The workspace supports Action Plans (full setting) and Actions List (simplified tracker list).

- FR-22: WHEN an action is created THEN the system SHALL require Action Description, Notify Maintenance (Yes/No), Assigned To, Due Date, and location fields (Department, Workshop auto-filled/adjustable), track the deadline, and auto-fill Pillar = Safety/SAF.
- FR-23: WHEN Notify Maintenance = Yes on an action THEN the system SHALL raise a maintenance synchronization alert.
- FR-24: WHEN the Action Plan is deployed and WHEN it is closed THEN the system SHALL notify the reviewer(s) at each milestone; assignees SHALL be able to update deployed actions, and the action lifecycle (e.g. deadline adjustments) SHALL be tracked.
- FR-25 (was N-003): WHEN the Action Plan is completed THEN the system SHALL notify the reviewer(s) that it is ready for validation.

#### Action fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Department | Dropdown | Yes | Auto-filled/Adjustable |
| Workshop | Dropdown | Yes | Auto-filled/Adjustable |
| Process Step | Dropdown | No | |
| Workstation | Dropdown | No | |
| Equipment | Dropdown | No | |
| Job | Dropdown | No | |
| Task | Dropdown | No | |
| Action Description | Long Text | Yes | |
| Notify Maintenance | Yes/No | Yes | |
| Assigned To | Multi Select | Yes | |
| Due Date | Date | Yes | Deadline tracking active |
| Completion/Cancellation Date | Date | No | |
| Pillar | Auto-filled | Yes | Safety/SAF |

### Validation and closure

- FR-26 (was SFT-013): WHEN Action Plan Validated? = No THEN the system SHALL return the event to the Action Plan stage and keep the event status In Progress.
- FR-27 (was N-004): WHEN Action Plan Validated? = Yes THEN the system SHALL set the event status to Closed, notify the Reporter and Reviewer, and make the Safety Warning PDF available for compilation and publication.
- FR-28: WHEN Root Cause Analysis is completed and an Action Plan exists (after Action Plan deployment) THEN the system SHALL make the Safety Warning PDF available; WHEN either condition is unmet THEN the document SHALL NOT be available.

### Communication PDFs

Both documents serve communication and learning distribution; event photos are included when available.

| Document | Purpose | Available when | Contents |
|---|---|---|---|
| Safety Alert | Rapid communication of the event and immediate response | Event Statement and Immediate Actions completed (RCA) | Event Date, Event Type, Event Level, HPR Identification, Investigator(s), Severity Level, Incident Description, Event Statement, Immediate Actions, Next Steps, Event Photos (if available) |
| Safety Warning | Detailed communication of investigation results, learnings, action plans | RCA completed and Action Plan exists (after deployment) | Event Date, Event Type, Event Level, HPR Identification, Investigator(s), Actual Severity, Potential Severity, Incident Description, Event Statement, Immediate Actions, Key Learnings, Contributory Causes, Corrective Actions, Preventive Actions, Action Plan Summary, Event Photos (if available) |

### Record Historian

- FR-29: WHEN any field modification, stage transition, status change, attachment addition/removal, or system-generated change (e.g. automatic status update, notification sent) occurs THEN the system SHALL record it in the event's Historian tab with timestamp, user/role, modified field(s), and new value(s).
- FR-30: WHEN a user opens the Historian tab at any point in the event lifecycle THEN the system SHALL display the complete change history as read-only, preserving the integrity of the audit trail.

## Non-functional requirements

- Observability / auditability: full traceability of all changes throughout the event lifecycle via the read-only Historian (FR-29/FR-30); both severity scores and bands are persisted and tracked.
- Usability: severity is assessed by clicking a matrix cell (no manual typing); dependent fields appear/hide dynamically to keep forms simple for frontline reporters.
- [OPEN]: Performance, security, accessibility, and i18n requirements are not defined in the source.

## Acceptance criteria (testable)

- [ ] Given a person assigned to the plant, when they submit a complete Safety Event, then the event is created with status Open and the reviewer group receives a notification.
- [ ] Given a submission with Event Level TF5, when the form is displayed, then Job, Task, and Task Type are hidden.
- [ ] Given Could this be an HPR? = Yes, when submitting, then Job, Task, and Task Type are mandatory, and HPR Type is mandatory at Review.
- [ ] Given Event Level TF3 and First Aid Treatment = Other, when completing submission, then First Aid Comment is shown.
- [ ] Given Type of Employee Involved is not the organization, when completing submission, then Name and What Was the Person Doing? are shown and Job, Task, Task Type are hidden.
- [ ] Given a Department is selected, when opening the Workshop dropdown, then only Workshops belonging to that Department are listed (and so on down the Site Structure hierarchy).
- [ ] Given an Open event, when a reviewer self-assigns, then the event status becomes In Progress.
- [ ] Given a TF4 near miss submitted on behalf of a contractor that duplicates an existing ticket, when the reviewer sets Is This Event Valid? = No with reason Duplicate, then the event status becomes Archived, the reporter receives a notification, and the workflow ends (Scenario C).
- [ ] Given a valid TF1–TF3 event with Standard and Hazard selected, when the review form renders, then both severity matrices are displayed; given a valid TF4 event, only the Potential Severity matrix; given TF5, neither.
- [ ] Given a displayed matrix, when the reviewer clicks the Severe (5) × Medium term (10) cell, then the read-only Severity Level field shows score 50 and band Red — High.
- [ ] Given a required matrix without a selection, when the reviewer submits the review, then submission is blocked.
- [ ] Given a valid TF1 event, when review is completed, then the system routes it to RCA automatically without offering a skip (Scenario A).
- [ ] Given a valid non-HPR TF4/TF5 event with an Actual or Potential Severity score of 50 or above, when review is completed, then RCA is mandatory and cannot be bypassed by configuration or reviewer decision.
- [ ] Given a valid non-HPR TF5 event with no Red severity, when the reviewer answers "Do you want to further analyze?" = No, then the event bypasses RCA and goes directly to the Actions List path (Scenario B).
- [ ] Given an event in RCA, when Event Statement and Immediate Actions are completed, then the Safety Alert PDF can be generated.
- [ ] Given RCA with Gap = Yes and Is this an Existing Risk? = Yes, when saving, then Select Risk Assessment is mandatory.
- [ ] Given a completed Action Plan, when it is marked complete, then the reviewer(s) receive a notification that it is ready for validation.
- [ ] Given a validated action plan (Action Plan Validated? = Yes), when validation is saved, then the event status becomes Closed, the Reporter and Reviewer are notified, and the Safety Warning PDF can be compiled (Scenario A).
- [ ] Given Action Plan Validated? = No, when validation is saved, then the event returns to the Action Plan stage and its status remains In Progress.
- [ ] Given any change to the event (field edit, status change, attachment, system action), when the Historian tab is opened, then the change appears with timestamp, user/role, field, and new value, and the tab is read-only.

## Dependencies

- Inherits lifecycle, stages and statuses from Feature 000: Core Event Lifecycle ([../core.md](../core.md)) — this spec defines only the Safety deltas (fields, matrices, routing, reviewer group, notifications, PDFs).
- Master Data: Site Structure and EHS Structure hierarchies; H&S controlled value lists from Feature 034: Standard ([../Control%20Panel/standard.md](../Control%20Panel/standard.md)), Feature 031: Hazard ([../Control%20Panel/hazard.md](../Control%20Panel/hazard.md)), Feature 033: Body Part ([../Control%20Panel/body-part.md](../Control%20Panel/body-part.md)), Feature 032: Injury ([../Control%20Panel/injury.md](../Control%20Panel/injury.md)), governed per Feature 030: Master Data Control Panel ([../Control%20Panel/master-data-control.md](../Control%20Panel/master-data-control.md)).
- Roles and permissions: Feature 040: Role Management ([../role-management/role-management.md](../role-management/role-management.md)).
- Downstream: maintenance system maintenance synchronization for actions flagged Notify Maintenance.

## Open questions

- [OPEN]: The submission field table marks Type of Employee Involved as always required, while rule SFT-003 shows it only for TF1–TF3 — confirm whether the field exists (and is required) for TF4/TF5.
- [OPEN]: The field table marks First Aid Comment as required for TF3, while rule SFT-006 shows it only when First Aid Treatment = Other — confirm the exact condition.
- [OPEN]: What Was the Person Doing? is marked required "if person involved" in the field table, but rule SFT-004 shows it only when Type of Employee Involved is not the organization — confirm when it applies to organization employees.
- [OPEN]: Invalidation reasons here (Duplicate, Not relevant, Low quality) differ in wording from the core specification (duplicated, useless, bad quality), and the archive notification recipients differ (Reporter only here vs all related persons incl. Local EHS in core) — align.
- [OPEN]: Scenario A has the reviewer assigning "Validators", but no validator-assignment field is defined and Role Management merges Validator into Reviewer — confirm who performs the Validation stage and how they are designated.
- [OPEN]: The behavior of the maintenance system maintenance synchronization alert (Notify Maintenance / maintenance management system work order sync) is not specified.
- [OPEN]: Whether the Actions List (simplified) path goes through the same formal Validation stage as the full Action Plan (Scenario B implies the reviewer validates and closes) — confirm.
