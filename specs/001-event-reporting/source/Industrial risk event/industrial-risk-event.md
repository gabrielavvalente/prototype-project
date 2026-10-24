# Feature 023: Industrial Risk Event

## Goal

Enable plants to report, triage, investigate, and resolve industrial site-risk accidents and hazardous conditions (SRE1 to SRE5) through the common event lifecycle, with consistent classification and validated closure.

## Why

Without a shared IR product model, classification is inconsistent across sites, high-risk cases may miss required containment actions, investigation and action workflows diverge, and closure decisions are hard to audit. This feature enforces proportionate investigation depth, action ownership with due-date accountability, and full auditability.

## Platform context

- Modules involved: Event Module (Industrial Risk / IR event type), Action Plan, Notifications, Historian, Master Data (location hierarchy and reference lists).
- Platform contracts reused: core event lifecycle, stages, and statuses from Feature 000 (../core.md); location hierarchy and controlled reference lists from the platform master data service (Event Reporting plants); workflow/section mandatoriness configuration (behavior per level must remain configurable, not hardcoded in UI).
- Level illustration assets for SRE1–SRE5 are hosted in the platform master data service asset library.

### Reference data — IR levels

| IR Code | Level | Name |
|---|---|---|
| SRE1 | Level 1 | Major site risk accident |
| SRE2 | Level 2 | Significant site risk accident |
| SRE3 | Level 3 | Moderate site risk accident |
| SRE4 | Level 4 | Site risk near accident |
| SRE5 | Level 5 | Site risk hazardous acts or conditions |

### Reference data — location hierarchy

Department → Workshop → Process Step → Workstation → Equipment (plus Job and Task lists). Each selection filters child values. Controlled reference lists are required for: Standard Associated, Hazard Associated (both consume the H&S-owned catalogs under Feature 030 access grants — no separate Industrial Risk taxonomy), severity matrices, invalidation reasons.

## User stories

1. US-IR-01 — As a Reporter, I want to create an IR event and select the correct level (SRE1–SRE5), so that the workflow reflects site-risk severity.
2. US-IR-02 — As a Reporter, I want to provide event location and attachments, so that downstream analysis has adequate context.
3. US-IR-03 — As the System, I want immediate actions enforced for SRE1 to SRE3 per configuration, so that severe cases have immediate containment.
4. US-IR-04 — As a Reviewer, I want to mark events valid or invalid, so that poor-quality events are removed from the active workflow.
5. US-IR-05 — As a Reviewer, I want to add configured risk metadata (hazard and standard from the H&S catalogs, Industrial Risk Category, severity), so that investigation and reporting are consistent.
6. US-IR-06 — As the Workflow Engine, I want events routed to RCA based on settings, so that investigation depth matches event risk.
7. US-IR-07 — As the Workflow Engine, I want events routed directly to Action Plan when RCA is not required, so that resolution is not delayed unnecessarily.
8. US-IR-08 — As a Reviewer or Action Owner, I want at least one action with owner and due date, so that corrective work is accountable.
9. US-IR-09 — As an Action Owner, I want to deploy, track, and close action plans, so that completion can be validated.
10. US-IR-10 — As a Validator, I want to approve or reject action-plan effectiveness, so that events only close when outcomes are sufficient.
11. US-IR-11 — As the System, I want to notify stakeholders at submission, archive, action milestones, and closure, so that participants remain aligned.
12. US-IR-12 — As an Auditor, I want a complete history of event changes, so that governance decisions are verifiable.

Other roles involved: Investigator (performs RCA when required), Site Admin / EHS Admin (maintains master data and workflow settings).

## Scope

- IN:
  - IR submission and SRE1–SRE5 classification (US-IR-01, 02, 03).
  - Review and invalidation handling (US-IR-04, 05).
  - Configurable RCA investigation routing (US-IR-06, 07).
  - Action execution with ownership and due dates (US-IR-08, 09).
  - Validation gate and closure with rework loop (US-IR-10).
  - Notifications and Historian baseline (US-IR-11, 12).
  - Partial: advanced IR review taxonomy fields, as configured per business.
- OUT:
  - A dedicated Industrial Risk Standard or Hazard catalog — IR review consumes the H&S-owned catalogs (Features 034 and 031).
  - Advanced IR-specific communication template design.
  - Country-specific governance exceptions and exception branches.

## Functional requirements (EARS)

Workflow and routing:

- FR-1 (was IR-001, SN-001): WHEN an IR event is successfully submitted THEN the system SHALL create the event record, set Event Status = Open, and notify the reviewer group that a new Industrial Risk event requires review.
- FR-2 (was IR-002): WHEN review starts THEN the system SHALL set Event Status = In Progress.
- FR-3 (was IR-003, SN-002): WHEN the reviewer sets Is Event Valid? = No THEN the system SHALL require a Reason of Invalidation, set Event Status = Archived, end the workflow, and notify the Reporter that the event is archived.
- FR-4 (was IR-004): WHEN the reviewer sets Is Event Valid? = Yes THEN the system SHALL continue the event lifecycle with Event Status = In Progress.
- FR-5 (was IR-006): WHEN review is valid and RCA is configured as required THEN the system SHALL route the event to the RCA stage before Action Plan; WHEN RCA is not required THEN the system SHALL route the event directly to the Action Plan stage.
- FR-6 (was IR-007, SN-004): WHEN Action Plan Validated? = Yes THEN the system SHALL set Event Status = Closed and notify the Reporter and reviewer(s).
- FR-7 (was IR-008): WHEN Action Plan Validated? = No THEN the system SHALL return the event to the Action Plan stage and keep Event Status = In Progress.

Field visibility and mandatoriness:

- FR-8 (was IR-005): WHEN the event level is SRE1, SRE2, or SRE3 THEN the system SHALL make Immediate Actions mandatory according to the section mandatoriness configuration; WHEN the level is SRE4 or SRE5 and the policy does not require them THEN the system SHALL keep Immediate Actions optional.
- FR-9 (was IR-009): WHEN the IR Level is SRE1 or SRE2 THEN the system SHALL show and require "Could this be an CRP? (Critical Risk Potential)" and hide "Could this be a SRP? (Serious Risk Potential)".
- FR-10 (was IR-010): WHEN the IR Level is SRE3, SRE4, or SRE5 THEN the system SHALL show and require "Could this be a SRP? (Serious Risk Potential)" and hide "Could this be an CRP? (Critical Risk Potential)".
- FR-11: WHEN a parent location value (e.g. Department, Workshop) is selected THEN the system SHALL filter the child location dropdowns to values under that parent.
- FR-12: WHEN required submission fields are incomplete and submit is attempted THEN the system SHALL block submission.

Action plan:

- FR-13: WHEN an action plan is submitted THEN the system SHALL require at least one action, and for each action SHALL require Action Description, Assigned To, and Due Date.
- FR-14: WHEN an action's Due Date is changed THEN the system SHALL record the change in the event history.
- FR-15 (was SN-003): WHEN the action plan is deployed and WHEN the action plan is closed THEN the system SHALL notify the reviewer(s) of the milestone.
- FR-16: WHEN maintenance notification is enabled for the IR workflow and an action sets Notify Maintenance = Yes THEN the system SHALL notify the maintenance team.

Traceability:

- FR-17: WHEN any field change, stage or status transition, action lifecycle milestone, or system-generated event (notification, automated update) occurs THEN the system SHALL record it in the read-only Historian tab with actor, role, timestamp, and new value.
- FR-18: WHEN a reviewer selects Standard Associated or Hazard Associated on an IR event THEN the system SHALL offer the H&S-owned Standard and Hazard catalogs (Features 034 and 031) under the Industrial Risks access grant, and SHALL NOT require a second Industrial Risk-specific catalog for those fields.

### Stage field tables

Submission:

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Family | Dropdown | Yes | IR |
| IR Level | Dropdown | Yes | SRE1 to SRE5 |
| Could this be an CRP? | Yes/No | Conditional | Required if IR Level is SRE1 or SRE2 (FR-9) |
| Could this be a SRP? | Yes/No | Conditional | Required if IR Level is SRE3, SRE4, or SRE5 (FR-10) |
| Reporter | Dropdown | Yes | Auto-filled |
| Shift | Dropdown | Yes | Auto-filled or selectable per policy |
| Report Date | Date | Yes | Auto-filled |
| Event Date | Date | Yes | |
| Event Time | Time | No | |
| Event Description | Long Text | Yes | |
| Department | Dropdown | Yes | Hierarchical |
| Workshop | Dropdown | Yes | Hierarchical |
| Process Step | Dropdown | No | Hierarchical |
| Workstation | Dropdown | No | Hierarchical |
| Equipment | Dropdown | No | Hierarchical |
| Job | Dropdown | No | Hierarchical |
| Task | Dropdown | No | Hierarchical |
| Task Type | Dropdown | Conditional | Required where configured |
| Any Immediate Actions Taken? | Yes/No | Yes | |
| Immediate Actions | Long Text | Conditional | Required for SRE1 to SRE3 by configuration (FR-8) |
| Proposed Additional Actions | Long Text | No | |
| Attachments | Attachments | No | |

Review:

| Field | Type | Required | Notes |
|---|---|---|---|
| Reviewer Name | Dropdown | Yes | Auto-filled |
| Review Date | Date | Yes | Auto-filled |
| Is Event Valid? | Yes/No | Yes | |
| Reason of Invalidation | Dropdown | Conditional | Required when invalid (FR-3) |
| Standard Associated | Dropdown | Conditional | Consumes the H&S Standard catalog (Feature 034); required according to IR taxonomy configuration |
| Hazard Associated | Dropdown | Conditional | Consumes the H&S Hazard catalog (Feature 031); required according to IR taxonomy configuration |
| Actual Severity | Matrix | Conditional | Optional if level drives severity automatically |
| Potential Severity | Matrix | Conditional | Optional if level drives severity automatically |

Root Cause Analysis (baseline; configurable, may be mandatory for high-severity levels per business settings):

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Statement | Long Text | Yes | |
| Immediate Actions Summary | Long Text | Yes | |
| Investigator | Multi Select | Yes | |
| 5W1H | Structured UI | Optional | |
| 6M and 5 Why | Structured UI | Yes | |
| Learnings | Long Text | Yes | |
| Risk Assessment Gap? | Yes/No | Yes | |
| Existing Risk? | Yes/No | Conditional | When gap = Yes |
| Select Risk Assessment | Multi Select | Conditional | When existing risk = Yes |

Action Plan:

| Field | Type | Required | Notes |
|---|---|---|---|
| At Least One Action | Rule | Yes | Mandatory gate (FR-13) |
| Action Description | Long Text | Yes | |
| Assigned To | Multi Select | Yes | |
| Due Date | Date | Yes | Due-date changes tracked (FR-14) |
| Completion Date | Date | No | |
| Notify Maintenance | Yes/No | Conditional | If enabled for IR workflow (FR-16) |

Validation:

| Field | Type | Required |
|---|---|---|
| Action Plan Validated? | Yes/No | Yes |

## Non-functional requirements

- Observability / auditability: full traceability of the event record via the read-only Historian (FR-17); due-date change history retained.
- Configurability: workflow behavior by level (RCA requirement, section mandatoriness, maintenance notification) is driven by master data and workflow settings, never hardcoded in the UI.

## Acceptance criteria (testable)

US-IR-01 — Create and classify:
- [ ] Given event creation starts, when the reporter selects the IR family, then levels SRE1 to SRE5 are available.
- [ ] Given required submission fields are incomplete, when submit is attempted, then submission is blocked.
- [ ] Given successful submission, when the event is created, then its status becomes Open.

US-IR-02 — Location and evidence:
- [ ] Given location input, when a parent location is selected, then child dropdowns are filtered.
- [ ] Given attachments are provided, when uploaded, then they are linked to the event record.

US-IR-03 — Immediate actions:
- [ ] Given the event is SRE1/SRE2/SRE3 and section mandatoriness requires it, when submission proceeds, then immediate actions are mandatory.
- [ ] Given the event is SRE4/SRE5, when policy does not require immediate actions, then immediate actions remain optional.

US-IR-04 — Validate event quality:
- [ ] Given review starts, when the reviewer opens the event, then the status becomes In Progress.
- [ ] Given the reviewer marks the event invalid, when the decision is saved, then an invalidation reason is required.
- [ ] Given an invalid decision is confirmed, when the workflow updates, then the status becomes Archived, the workflow ends, and the reporter is notified.

US-IR-05 — Enrich review data:
- [ ] Given the review stage, when configured fields are enabled (hazard, standard, severity), then the reviewer can complete them.
- [ ] Given Standard Associated or Hazard Associated is enabled, when the reviewer opens the list, then the values come from the H&S-owned catalogs (not a second Industrial Risk catalog).
- [ ] Given a valid decision, when the review is submitted, then the event continues in the workflow.

US-IR-06 — Route to RCA:
- [ ] Given the review is valid and RCA is required by configuration, when routing executes, then the event enters the RCA stage.
- [ ] Given the RCA stage starts, when the stage transition completes, then the status remains In Progress.

US-IR-07 — Skip RCA:
- [ ] Given the review is valid and RCA is not required, when routing executes, then the event enters the Action Plan stage.

US-IR-08 — Create and assign actions:
- [ ] Given the action planning stage, when the user submits the plan, then at least one action is required.
- [ ] Given each action, when saved, then description, assignee, and due date are mandatory.
- [ ] Given due-date updates, when changes occur, then change history is recorded.

US-IR-09 — Action lifecycle:
- [ ] Given action plan deployment, when the state changes, then the reviewer receives milestone notifications.
- [ ] Given action plan closure, when completed, then the event moves to the validation stage.

US-IR-10 — Validation and closure:
- [ ] Given the validation stage, when the decision is submitted, then Action Plan Validated is mandatory.
- [ ] Given the decision is Yes, when saved, then the event status becomes Closed.
- [ ] Given the decision is No, when saved, then the event returns to Action Plan and the status remains In Progress.

US-IR-11 — Notifications:
- [ ] Given submission succeeds, when the event is created, then reviewers are notified.
- [ ] Given an invalid review, when the status becomes Archived, then the reporter is notified.
- [ ] Given validation approval, when the event closes, then the reporter and reviewers are notified.

US-IR-12 — Historian:
- [ ] Given any field/stage/status change, when saved, then the Historian records actor, timestamp, and new value.
- [ ] Given automation events (notifications, automated updates), when triggered, then the Historian records them.
- [ ] Given the Historian view, when opened, then it is read-only.

## Dependencies

- Inherits lifecycle, stages and statuses from Feature 000: Core Event Lifecycle (../core.md); this spec only defines the IR deltas.
- Platform master data service (Event Reporting plants): location hierarchy (Department → Workshop → Process Step → Workstation → Equipment, Job, Task), IR level catalog and illustration assets.
- Configuration-controlled reference lists: Standard Associated and Hazard Associated consume the H&S-owned catalogs ([Feature 034](../Control%20Panel/standard.md), [Feature 031](../Control%20Panel/hazard.md)) via Feature 030 access grants; Industrial Risk Categories from [Feature 036](../Control%20Panel/industrial-risk-category.md); severity matrices; invalidation reasons.
- Workflow/section mandatoriness settings (RCA requirement, immediate-action mandatoriness, maintenance notification toggle).

## Open questions

- [OPEN]: Should RCA be mandatory for SRE1 and SRE2, or remain fully configurable? (RCA mandatoriness by IR level requires business confirmation.)
- [OPEN]: Confirm whether IR review requires additional Industrial Risk-specific fields beyond Standard Associated, Hazard Associated (H&S catalogs), Industrial Risk Category, and the severity matrices.
- [OPEN]: Should maintenance-notification rules be mandatory for specific IR levels? Maintenance-notification behavior for IR actions requires governance confirmation.
- [OPEN]: Are there specific closure evidence requirements for SRE1 and SRE2?
- [OPEN]: IR-specific communication output templates are not yet defined.
- [OPEN]: Confirm approved neutral labels for the upstream master data service.
