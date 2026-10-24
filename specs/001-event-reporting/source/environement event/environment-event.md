# Feature 024: Environment Event

## Goal

Give plants one structured way to report, review, investigate, act on, validate, and close environment-related events (EvE1 to EvE5), with analysis depth proportional to severity and context.

## Why

Without a configurable, role-based environment workflow, reporting quality is inconsistent, review outcomes are not traceable, investigation effort is not proportional to risk, and actions are not systenvironmental assessment toolically tracked to validated closure.

## Platform context

- Modules involved: Event Module (Environment Event type), Master Data (Physical Structure, EHS Structure, Environment reference data), Notifications, PDF communication output, Historian audit trail, External Reporting Platform / extra-data integration (conditional, per integration setup).
- Platform contracts reused: core event lifecycle, stages, and statuses from Feature 000: Core Event Lifecycle (../core.md); workflow behavior is not hardcoded by Event Level — routing is controlled through Master Data and workflow settings.

### Reference data

Environment Event levels (working descriptions; used for categorization and workflow routing):

| ENV Code | Level | Working Description |
|---|---|---|
| EvE1 | Level 1 | Major environmental accident |
| EvE2 | Level 2 | Environmental accident |
| EvE3 | Level 3 | Environmental accident |
| EvE4 | Level 4 | Near-accident |
| EvE5 | Level 5 | Poor environmental situation / condition |

Master data sources:

- Physical Structure: Department → Workshop → Process Step → Workstation → Equipment (each selection filters its child level).
- EHS Structure: Job, Task, Task Type.
- Environment reference data (controlled value lists): Aspect Associated, Impact Associated, HPR Type (Environment). Aspect and Impact lists remain aligned with the shared taxonomy used by risk assessments and environmental assessment tool.

## User stories

1. US-ENV-01 — As a Reporter, I want to submit an Environment Event with the minimum required facts, so that review can start with complete baseline information.
2. US-ENV-02 — As a Reporter, I want to classify the event and pinpoint location, so that downstream triage and analytics are accurate.
3. US-ENV-03 — As a Reporter, I want to state whether immediate actions were taken, so that early containment is documented before formal analysis.
4. US-ENV-04 — As a Reviewer (Plant Manager / Shift Leader / Local EHS), I want to confirm whether the event is valid, so that duplicate or low-quality records are removed early.
5. US-ENV-05 — As a Reviewer, I want to assign Aspect and Impact, so that event categorization aligns with environment standards.
6. US-ENV-06 — As the Workflow Engine, I want HPR, EvE1, and EvE2 events routed to investigation, so that higher-risk events receive deeper analysis.
7. US-ENV-07 — As a Reviewer, I want a configurable decision for further analysis, so that lower-severity events can skip full RCA when appropriate.
8. US-ENV-08 — As an Investigator, I want structured RCA inputs, so that causes and learnings are captured consistently.
9. US-ENV-09 — As an Investigator, I want to specify whether a risk-assessment gap exists, so that follow-up risk governance is linked correctly.
10. US-ENV-10 — As a Reviewer or Action Owner, I want to create at least one action with ownership and due date, so that corrective work is explicit and trackable.
11. US-ENV-11 — As a Reviewer, I want lifecycle tracking for action deployment and closure, so that execution progress is visible and auditable.
12. US-ENV-12 — As a Validator, I want to approve or reject action effectiveness, so that only effective resolutions are closed.
13. US-ENV-13 — As the System, I want notifications triggered at submission, archive, action milestones, and closure, so that all stakeholders are informed at the right time.
14. US-ENV-14 — As a Reviewer, I want a communication-ready PDF output, so that key environment learnings can be shared quickly.
15. US-ENV-15 — As a Site Admin, I want field options sourced from controlled master data, so that event data remains consistent across plants.
16. US-ENV-16 — As an Auditor, I want full history of event changes, so that lifecycle decisions and edits are traceable.

## Scope

- IN:
  - Event submission for EvE1 to EvE5 by any person assigned to the plant (US-ENV-01, 02, 03).
  - Review and triage with confirmation, Aspect/Impact enrichment, and archive path (US-ENV-04, 05).
  - Dynamic routing between RCA and direct Actions List paths (US-ENV-06, 07).
  - RCA with mandatory 6M & 5 Why, optional 5W1H, learnings, and risk-assessment gap logic (US-ENV-08, 09).
  - Action creation, assignment, lifecycle tracking, and maintenance notification (US-ENV-10, 11).
  - Final validation with closure or rework loop (US-ENV-12).
  - Notifications at submission, archive, action milestones, and closure (US-ENV-13).
  - Baseline PDF communication generation once Event Statement and Immediate Actions are complete (US-ENV-14).
  - Master-data-driven selections and Historian audit trail (US-ENV-15, 16).
- OUT:
  - Detailed business rules and governance for the "Environment Comm?" branch (pending environment governance workshops).
  - Global severity taxonomy text beyond the current working labels for EvE1–EvE5.
  - Advanced RCA templates beyond 6M & 5 Why / 5W1H.
  - Advanced PDF template design and external report templates beyond the minimum PDF trigger requirement.

## Functional requirements (EARS)

### Submission

- FR-1: WHEN a user assigned to the plant submits an Environment Event with all required submission fields THEN the system SHALL create the event record, set its status to Open, and auto-fill Reporter, Shift, and Report Date (Event Date auto-filled but editable).
- FR-2: WHEN a submission is attempted with required fields missing THEN the system SHALL block the submission and highlight the missing fields.
- FR-3 (was ENV-004): WHEN "Could this be an HPR?" = Yes THEN the system SHALL require HPR Type.
- FR-4: WHEN a Physical Structure parent field (Department, Workshop, Process Step, Workstation) is selected THEN the system SHALL filter the available values of its child level by hierarchy.

Submission fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Type and Level | Dropdown | Yes | EvE1 to EvE5 (Primary Event Choice) |
| Could this be an HPR? | Yes/No | Yes | Asked immediately after the event choice |
| HPR Type | Dropdown | Conditional | Required when HPR = Yes |
| Reporter | Dropdown | Yes | Auto-filled |
| Shift | Dropdown | Yes | Auto-filled |
| Report Date | Date | Yes | Auto-filled |
| Event Date | Date | Yes | Auto-filled, editable |
| Event Time | Time | No | |
| Event Description | Long Text | Yes | |
| Department | Dropdown | Yes | Physical Structure |
| Workshop | Dropdown | Yes | Physical Structure |
| Process Step | Dropdown | No | Physical Structure |
| Workstation | Dropdown | No | Physical Structure |
| Equipment | Dropdown | No | Physical Structure |
| Job | Dropdown | Conditional | EHS Structure; used for some level paths |
| Task | Dropdown | Conditional | EHS Structure; used for some level paths |
| Task Type | Dropdown | Conditional | EHS Structure; used for some level paths |
| Any Actions Taken? | Yes/No | Yes | |
| Immediate Actions | Long Text | No | Completed actions |
| Proposed Additional Actions | Long Text | No | |

### Review and triage

Reviewer group: Plant Manager, Shift Leader, Local EHS.

- FR-5: WHEN the review screen opens THEN the system SHALL auto-fill Reviewer Name and Review Date.
- FR-6 (was ENV-001): WHEN the reviewer sets Confirmed? = No THEN the system SHALL require an Invalidation Category (Duplicated / Useless / Bad Quality), set the event status to Archived, and end the workflow.
- FR-7 (was ENV-002): WHEN the reviewer sets Confirmed? = Yes THEN the system SHALL require the reviewer to choose the Aspect Associated immediately after confirmation and then the Impact Associated, and SHALL keep the event In Progress in the workflow.
- FR-8 (was ENV-003): WHEN an Aspect Associated is selected THEN the system SHALL filter Impact Associated options by the selected Aspect.

Review fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Reviewer Name | Dropdown | Yes | Auto-filled |
| Review Date | Date | Yes | Auto-filled |
| Confirmed? | Yes/No | Yes | Decision field |
| Invalidation Category | Dropdown | Conditional | Duplicated / Useless / Bad Quality |
| Aspect Associated | Dropdown | Yes (if confirmed) | Single selection |
| Impact Associated | Dropdown | Yes (if confirmed) | Single selection, linked to Aspect |
| HPR Type | Dropdown | Conditional | Environment HPR classification |
| External Reporting Platform / Extra Data | Structured UI | Conditional | Based on integration setup |

### Routing

- FR-9: WHEN workflow routing is evaluated THEN the system SHALL apply the path defined by Master Data and workflow settings for the selected Event Level, HPR context, and review decisions, and SHALL NOT hardcode workflow behavior by Event Level.
- FR-10 (was ENV-005): WHEN a confirmed event is HPR, EvE1, or EvE2 THEN the system SHALL route the event to the RCA path (subject to the RCA workflow setting).
- FR-11 (was ENV-006): WHEN a confirmed event is not HPR/EvE1/EvE2 THEN the system SHALL evaluate the "Do you want to further analyze?" decision and route to the RCA path if Yes, or to the Actions List path if No.

### Root Cause Analysis

- FR-12: WHEN the RCA stage opens THEN the system SHALL prefill Event Statement and Immediate Actions from the submission context.
- FR-13: WHEN the RCA is submitted THEN the system SHALL require Investigator(s), Validator(s), 6M & 5 Why, Learnings, and the answer to "Does this event reveal a gap in an existing risk assessment?" (5W1H remains optional), and SHALL block submission while any of these are missing.
- FR-14 (was ENV-007): WHEN the risk-assessment gap answer is Yes THEN the system SHALL show and require Risk Classification (Existing Risk / New Risk (Site Level)).
- FR-15 (was ENV-008): WHEN Risk Classification = Existing Risk THEN the system SHALL require Select Risk Assessment (selector hidden otherwise).

RCA fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Event Statement | Long Text | Yes | Auto-filled from submission context |
| Immediate Actions | Long Text | Yes | Auto-filled from submission context |
| Investigator (RCA) | Multi Select | Yes | |
| Validator (RCA) | Multi Select | Yes | |
| 5W1H | Structured UI | No | |
| 6M & 5 Why | Structured UI | Yes | |
| Learnings | Long Text | Yes | |
| Does this event reveal a gap in an existing risk assessment? | Yes/No | Yes | |
| Risk Classification | Dropdown | Conditional | Existing Risk / New Risk (Site Level) |
| Select Risk Assessment | Multi Select | Conditional | Required for Existing Risk |

### Action Plan

The workflow supports both Action Plans and Actions List (settings).

- FR-16: WHEN the Action Plan stage is submitted THEN the system SHALL require at least one action, each with Action Description, Assigned To, and Due Date.
- FR-17: WHEN Notify Maintenance = Yes on an action THEN the system SHALL require Priority and Equipment (maintenance system).
- FR-18: WHEN an action due date is changed THEN the system SHALL retain the due-date change history.
- FR-19: WHEN an action plan is deployed THEN the system SHALL allow assignees to update deployment progress where policy allows, and SHALL track the actions lifecycle through to Action Plan closure.

Action fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Actions List Creation | Repeating List | Yes | At least one action |
| Action Description | Long Text | Yes | |
| Assigned To | Multi Select | Yes | |
| Applicable To | Structured Selection | No | |
| Due Date | Date | Yes | Due date changes must be tracked |
| Completion Date | Date | No | |
| Notify Maintenance | Yes/No | Yes | |
| Priority | Dropdown | Conditional | Required when Notify Maintenance = Yes |
| Equipment (maintenance system) | Dropdown | Conditional | Required when Notify Maintenance = Yes |

### Validation

- FR-20: WHEN the validation decision is submitted THEN the system SHALL require Action Plan Validated? (Yes/No).
- FR-21: WHEN Action Plan Validated? = Yes THEN the system SHALL set the event status to Closed.
- FR-22 (was ENV-009): WHEN Action Plan Validated? = No THEN the system SHALL return the event to the Action Plan stage for additional actions and keep the event status In Progress.

### Notifications

- FR-23 (was EN-001): WHEN an Environment Event is successfully submitted THEN the system SHALL notify the reviewer group (Plant Manager, Shift Leader, Local EHS) that a new event requires review.
- FR-24 (was EN-002): WHEN a review is completed with Confirmed? = No THEN the system SHALL notify the Reporter, Local EHS, and all persons related to the event (such as witnesses, managers, team members) of the archiving and the chosen reason (Duplicated, Useless, or Bad Quality).
- FR-25 (was EN-003): WHEN Action Plan deployment or closure milestones occur THEN the system SHALL notify the reviewer(s).
- FR-26 (was EN-004): WHEN validation is completed with Action Plan Validated? = Yes THEN the system SHALL notify the Reporter and reviewer(s) that the event has been closed.

### Communication output

- FR-27: WHEN the RCA fields Event Statement and Immediate Actions are both completed THEN the system SHALL make the PDF communication output available for generation; WHEN either field is missing THEN the system SHALL keep the PDF output unavailable.

### Master data and traceability

- FR-28: WHEN reference fields (Aspect Associated, Impact Associated, HPR Type; Job, Task, Task Type; Physical Structure fields) are used in forms THEN the system SHALL source their options from the managed Master Data value lists.
- FR-29: WHEN any field, stage, status, or attachment change occurs (including system-generated changes such as automatic status updates and notifications sent) THEN the system SHALL record in the Historian tab the timestamp, the user/role who made the change, the field(s) modified, and the new value.

## Non-functional requirements

- Traceability/observability: the Historian tab is accessible throughout the entire event lifecycle and read-only, to preserve the integrity of the audit trail.
- Data quality: mandatory-field enforcement at each stage prevents progression with incomplete data.
- Consistency: reference data (Aspect/Impact taxonomy) stays aligned with risk assessments and environmental assessment tool across plants.

## Acceptance criteria (testable)

US-ENV-01 — Create an Environment Event
- [ ] Given I open event submission, when I create a new ENV event, then Reporter, Shift, and Report Date are auto-filled.
- [ ] Given I submit, when required fields are missing, then submission is blocked and missing fields are highlighted.
- [ ] Given I submit successfully, when record creation completes, then event status is Open.

US-ENV-02 — Capture Environment Classification and Location
- [ ] Given submission, when I select type and level, then EvE1 to EvE5 are available.
- [ ] Given location entry, when I select Department or Workshop, then child values are filtered by hierarchy.
- [ ] Given HPR is marked Yes, when I continue, then HPR Type is mandatory.

US-ENV-03 — Record Immediate Containment Information
- [ ] Given submission, when I complete the form, then Any Actions Taken is required.
- [ ] Given immediate actions exist, when I enter details, then Immediate Actions and Proposed Additional Actions can be stored.
- [ ] Given successful submission, when workflow advances, then reviewers are notified.

US-ENV-04 — Confirm Event Validity
- [ ] Given I start review, when the review screen opens, then Reviewer Name and Review Date are auto-filled.
- [ ] Given I select Confirmed = No, when I save, then Invalidation Category is required, with the reviewer choosing from: Duplicated, Useless, or Bad Quality.
- [ ] Given I select Confirmed = No, when review is completed, then event status becomes Archived, all persons related to this event (including Reporter, Local EHS, and other stakeholders) receive a notification about the archiving and the reason, and the workflow ends.

US-ENV-05 — Enrich Environmental Classification
- [ ] Given I select Confirmed = Yes, when confirmation is recorded, then I must immediately choose the Aspect Associated before continuing the review.
- [ ] Given Aspect is selected, when I open Impact, then Impact values are filtered by the selected Aspect and I must choose the Impact Associated.
- [ ] Given Confirmed = Yes, when review is submitted, then both Aspect Associated and Impact Associated are required.
- [ ] Given Confirmed = Yes, when review is submitted, then the event remains In Progress.

US-ENV-06 — Route High-Risk Events to RCA
- [ ] Given Confirmed = Yes and event is HPR, EvE1, or EvE2, when review is completed, then workflow routes to the RCA path.
- [ ] Given the RCA route is selected, when the stage transitions, then event status remains In Progress.

US-ENV-07 — Route Other Events by Further Analysis Decision
- [ ] Given event is not HPR/EvE1/EvE2, when routing is evaluated, then the further analysis decision is applied.
- [ ] Given decision = Yes, when routing completes, then the event goes to RCA.
- [ ] Given decision = No, when routing completes, then the event goes to the Actions List path.

US-ENV-08 — Execute Structured Investigation
- [ ] Given RCA is required, when the stage opens, then Event Statement and Immediate Actions are prefilled from submission context.
- [ ] Given the RCA stage, when I complete analysis, then 6M and 5 Why is mandatory and 5W1H is optional.
- [ ] Given RCA submission, when Learnings is missing, then submission is blocked.

US-ENV-09 — Capture Risk Assessment Gap Logic
- [ ] Given the RCA stage, when I answer the gap question, then a response is mandatory.
- [ ] Given gap = Yes, when I continue, then Risk Classification is required.
- [ ] Given Risk Classification = Existing Risk, when I submit RCA, then Select Risk Assessment is required.

US-ENV-10 — Create and Assign Actions
- [ ] Given the Action Plan stage, when I submit actions, then at least one action is required.
- [ ] Given each action, when saved, then Description, Assigned To, and Due Date are mandatory.
- [ ] Given Notify Maintenance = Yes, when the action is saved, then Priority and Equipment (maintenance system) are required.

US-ENV-11 — Track Action Lifecycle and Revisions
- [ ] Given an action due date changes, when the change is saved, then due-date history is retained.
- [ ] Given actions are deployed and closed, when milestones occur, then reviewer notifications are triggered.
- [ ] Given assignees execute work, when policy allows, then assignees can update deployment progress.

US-ENV-12 — Validate Action Effectiveness
- [ ] Given the validation stage, when I submit the decision, then Action Plan Validated is mandatory.
- [ ] Given decision = Yes, when validation completes, then event status becomes Closed.
- [ ] Given decision = No, when validation completes, then the event returns to Action Plan and remains In Progress.

US-ENV-13 — Notify Stakeholders at Critical Milestones
- [ ] Given submission completes, when the event is created, then the reviewer group is notified.
- [ ] Given review rejects the event, when status changes to Archived, then all persons related to this event (including Reporter, Local EHS, and other stakeholders) receive a notification about the archiving and the reason (Duplicated, Useless, or Bad Quality).
- [ ] Given the event closes, when validation is approved, then reporter and reviewers are notified.

US-ENV-14 — Generate Investigation Communication Output
- [ ] Given RCA data is incomplete, when Event Statement or Immediate Actions is missing, then PDF output is unavailable.
- [ ] Given both mandatory fields are complete, when a user requests the communication output, then PDF generation is available.

US-ENV-15 — Enforce Master Data-Driven Selections
- [ ] Given location fields, when users select parent nodes, then child nodes are filtered by hierarchy.
- [ ] Given reference fields (Aspect, Impact, HPR Type), when used in forms, then options come from managed value lists.

US-ENV-16 — Maintain Full Historian Audit Trail
- [ ] Given any field, stage, or status change, when the change is saved, then Historian records timestamp, actor, field, and new value.
- [ ] Given system automation occurs (status updates and notifications), when executed, then Historian records those events.
- [ ] Given users view the Historian, when the page loads, then history is read-only.

End-to-end
- [ ] Given a Reporter submits an EvE2 with HPR = Yes and the Reviewer confirms it with Aspect/Impact, when RCA (investigation, learnings, risk gap) and actions are completed and validation = Yes, then the event is Closed.
- [ ] Given a Reporter submits an EvE5 with HPR = No and the Reviewer confirms it with further analysis = No, when the event follows the Actions List path and actions are completed and validated, then the event is Closed.

## Dependencies

- Inherits lifecycle, stages, and statuses from Feature 000: Core Event Lifecycle (../core.md); this spec covers only the Environment deltas (levels, fields, routing, reviewer group, notifications).
- Physical Structure and EHS Structure Master Data (location hierarchy; Job/Task/Task Type).
- Environment reference data: Aspect and Impact value lists (see Feature 037: Aspect and Impact Master Data), HPR Type (Environment); alignment with risk assessments and environmental assessment tool taxonomy.
- Risk assessment repository (Select Risk Assessment lookup for Existing Risk classification).
- maintenance system equipment reference for maintenance-notified actions.
- External Reporting Platform / extra-data integration setup (conditional review data).

## Open questions

- [OPEN]: What are the final official textual definitions for EvE1 to EvE5?
- [OPEN]: Is the "further analyze" decision always manual, or partly automated by configuration?
- [OPEN]: What are the exact eligibility rules and template content for the "Environment Comm?" branch? Detailed business rules are to be finalized during environment governance workshops.
- [OPEN]: Should External Reporting Platform and extra data be mandatory for specific levels or plants?
