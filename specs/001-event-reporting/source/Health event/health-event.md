# Feature 022: Health Event

## Goal

Enable plants to report and manage health-related cases (work-related and not) through one consistent lifecycle, with configurable investigation depth and validated closure.

## Why

Health events vary in severity and context, yet plants need one operating model. Without it, case data quality is inconsistent, investigation effort is under- or over-applied, actions get closed without effectiveness validation, and governance teams lose traceability of key decisions.

## Platform context

- Modules involved: Event Module (Health Event type), Action Plan, Notifications, Historian.
- Platform contracts reused: core event lifecycle, stages and statuses (Feature 000); configurable RCA model from the core platform; role-based notifications; read-only Historian audit trail.

### Reference data

- Location hierarchy (each parent selection filters child options): Plant → Department → Workshop → Job → Workstation → Task.
- Controlled value lists: Health Context (Work related / Not work-related), Health Impact Type (MSD / Other impacts — e.g. fatal, lost time, non-lost time, chronic exposure conditions), Employee Type (organization employee / Temp / Contractor).
- Certificate metadata for chronic/recognized cases (issuer authority: doctor, court, or legal authority) is governed configuration, driven by local policy.

## User stories

1. US-HLT-01: As an EHS On-Site Reporter, I want to create a health event with mandatory baseline data so that reviewers receive a complete case for triage.
2. US-HLT-02: As an EHS On-Site Reporter, I want to classify the event by health context and impact so that workflow and analytics reflect the case type correctly.
3. US-HLT-03: As an EHS On-Site Reporter, I want optional attachments and optional detailed location so that supporting context is available when needed.
4. US-HLT-04: As a Reviewer (Plant Manager / Shift Leader / Local EHS), I want health events routed to the reviewer group so that governance ownership is clear after submission.
5. US-HLT-05: As a Reviewer, I want certificate and chronic-case notes available as governance context so that legal/medical evidence expectations are considered during processing.
6. US-HLT-06: As the Workflow Engine, I want cases routed to RCA only when configured or needed so that investigation effort matches case complexity.
7. US-HLT-07: As the Workflow Engine, I want cases routed directly to actions when RCA is not required so that straightforward cases resolve faster.
8. US-HLT-08: As a Reviewer or Action Owner, I want at least one action with owner and due date so that corrective execution is explicit and trackable.
9. US-HLT-09: As an Action Assignee, I want to update action deployment progress so that reviewers can monitor real execution status.
10. US-HLT-10: As a Validator, I want to approve or reject action-plan effectiveness so that closure only happens when outcomes are satisfactory.
11. US-HLT-11: As the System, I want to notify stakeholders at submission, action milestones, and closure so that participants stay informed throughout the lifecycle.
12. US-HLT-12: As an Auditor, I want full lifecycle traceability so that all decisions and updates are reviewable.

## Scope

- IN:
  - Health event submission by EHS on-site users with health classification (context, impact type, employee type), optional location precision and attachments (US-HLT-01..03).
  - Review governance by the reviewer group: Plant Manager, Shift Leader, Local EHS (US-HLT-04, US-HLT-05).
  - Optional RCA routing before action planning (US-HLT-06, US-HLT-07).
  - Action plan execution with mandatory minimum of one action, ownership, due-date tracking, assignee updates (US-HLT-08, US-HLT-09).
  - Validation gate before closure with rework loop (US-HLT-10).
  - Notifications and Historian baseline (US-HLT-11, US-HLT-12).
  - Certificate governance metadata capture — partial: details depend on country/business policy.
- OUT:
  - Medical/legal decision policies beyond referenced workshop notes.
  - Finalized advanced health taxonomy and all subcategories.
  - External report template formats beyond core communication triggers.
  - Advanced medical/legal branching beyond the current workflow model.

## Functional requirements (EARS)

- FR-1 (was HLT-001 / HN-001): WHEN a health event submission is successfully saved THEN the system SHALL create the event record, set Event Status = Open, and notify the reviewer group (Plant Manager, Shift Leader, Local EHS).
- FR-2: WHEN a user attempts to submit with required submission fields missing THEN the system SHALL block the submission and highlight the missing fields.
- FR-3: WHEN a new health event form is opened THEN the system SHALL auto-fill Reporter and Report Date.
- FR-4: WHEN a location hierarchy level is selected THEN the system SHALL filter child-level options by the parent selection.
- FR-5 (was HLT-002): WHEN review starts THEN the system SHALL set Event Status = In Progress.
- FR-6 (was HLT-003): WHEN RCA is required by workflow setting or reviewer decision THEN the system SHALL route the event to the RCA stage before the Action Plan.
- FR-7 (was HLT-004): WHEN RCA is not required THEN the system SHALL route the event directly to the Action Plan stage.
- FR-8 (was HLT-005): WHEN a user attempts to deploy an Action Plan containing no actions THEN the system SHALL block deployment (at least one action is required).
- FR-9: WHEN an action is saved THEN the system SHALL require Action Description, Assigned To, and Due Date.
- FR-10: WHEN an action Due Date is changed THEN the system SHALL track the date change history.
- FR-11: WHEN an Action Plan is deployed THEN the system SHALL allow assignees to update action deployment progress.
- FR-12 (was HN-002): WHEN the Action Plan is deployed or closed THEN the system SHALL notify the reviewer(s).
- FR-13 (was HLT-006 / HN-003): WHEN validation is completed with Action Plan Validated? = Yes THEN the system SHALL set Event Status = Closed and notify the reporter and reviewer(s).
- FR-14 (was HLT-007): WHEN validation is completed with Action Plan Validated? = No THEN the system SHALL return the event to the Action Plan stage and keep Event Status = In Progress.
- FR-15: WHEN local policy requires supporting evidence for chronic/recognized cases THEN the system SHALL allow certificate metadata to be captured as governed configuration.
- FR-16: WHEN any field change, stage or status transition, action lifecycle event, or system-generated event (including notifications) occurs THEN the system SHALL record it in the Historian with timestamp and acting user/role.

### Submission fields

Creation is performed by EHS on-site users.

| Field | Type | Required | Notes |
|---|---|---|---|
| Reporter | Dropdown | Yes | Auto-filled |
| Report Date | Date | Yes | Auto-filled |
| Location (Plant → Department → Workshop → Job → Workstation → Task) | Hierarchical Selection | No | Optional location precision |
| Description | Long Text | Yes | Describe what happened and how |
| Attachments (photo/video) | Attachments | No | Optional for health events |
| Employee Type | Dropdown | Yes | organization employee / Temp / Contractor |
| Health Context | Dropdown | Yes | Work related / Not work-related |
| Health Impact Type | Dropdown | Yes | MSD / Other impacts |

### Action fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Actions List Creation | Repeating List | Yes | At least one action |
| Action Description | Long Text | Yes | |
| Assigned To | Multi Select | Yes | |
| Due Date | Date | Yes | Due-date changes must be tracked |

### Validation field

| Field | Type | Required |
|---|---|---|
| Action Plan Validated? | Yes/No | Yes |

## Non-functional requirements

- Observability / audit: Historian is read-only for audit integrity; it displays field changes, stage/status transitions, action lifecycle events, and system-generated events with timestamp and actor.
- Security: review and progression restricted to the designated reviewer group; RCA detail follows the configurable core RCA model unless health-specific mandatory methods are later defined.
- Usability: submission remains possible with only required fields (attachments and location optional).

## Acceptance criteria (testable)

US-HLT-01 — Submit a health event record
- [ ] Given I open health-event submission, when I create a new case, then Reporter and Report Date are auto-filled.
- [ ] Given required fields are missing, when I submit, then submission is blocked and missing fields are highlighted.
- [ ] Given submission succeeds, when record creation completes, then event status becomes Open.

US-HLT-02 — Capture health context and impact type
- [ ] Given the submission form, when I classify the event, then health context offers work-related and not work-related values.
- [ ] Given health impact selection, when I complete classification, then impact type captures MSD and other impact families.
- [ ] Given form completion, when I submit, then Employee Type is mandatory.

US-HLT-03 — Optional evidence and location precision
- [ ] Given the submission form, when needed, then I can attach photo or video evidence.
- [ ] Given location is provided, when I select hierarchy levels, then child values are filtered by parent selection.
- [ ] Given no attachment or location is provided, when I submit with required fields complete, then submission is still allowed.

US-HLT-04 — Start review with assigned reviewer group
- [ ] Given event submission succeeds, when workflow advances, then the reviewer group receives a notification.
- [ ] Given review starts, when the first reviewer action is recorded, then event status becomes In Progress.
- [ ] Given review in progress, when the case proceeds, then workflow moves to optional RCA or action planning.

US-HLT-05 — Health governance notes
- [ ] Given chronic or recognized cases, when policy requires it, then the official certificate requirement can be referenced.
- [ ] Given certificate governance is configured, when the case is processed, then required evidence metadata can be captured.

US-HLT-06 — Route to optional RCA when required
- [ ] Given review is complete, when RCA is required by setting/decision, then workflow routes to the RCA stage.
- [ ] Given the RCA route is selected, when the stage starts, then the event remains In Progress.

US-HLT-07 — Skip RCA when not required
- [ ] Given review is complete, when RCA is not required, then workflow routes directly to the Action Plan.
- [ ] Given the direct action route, when the stage starts, then the event remains In Progress.

US-HLT-08 — Create and assign mandatory actions
- [ ] Given the Action Plan stage, when I submit the action list, then at least one action is required.
- [ ] Given each action, when saved, then Description, Assigned To, and Due Date are mandatory.
- [ ] Given due date changes, when updates occur, then date change history is tracked.

US-HLT-09 — Deploy and close action plan with assignee updates
- [ ] Given the Action Plan is deployed, when assignee updates are permitted, then assignees can update action progress.
- [ ] Given the Action Plan is closed, when closure completes, then a reviewer notification is triggered.

US-HLT-10 — Validate action effectiveness
- [ ] Given the validation stage, when the decision is submitted, then Action Plan Validated is mandatory.
- [ ] Given decision = Yes, when validation completes, then event status becomes Closed.
- [ ] Given decision = No, when validation completes, then the event returns to the Action Plan and stays In Progress.

US-HLT-11 — Notify stakeholders at lifecycle milestones
- [ ] Given event submission, when the case is created, then the reviewer group is notified.
- [ ] Given action milestones (deployment/closure), when they occur, then the reviewer group is notified.
- [ ] Given event closure, when validation is approved, then reporter and reviewers are notified.

US-HLT-12 — Maintain Historian audit trace
- [ ] Given any field/stage/status change, when saved, then the Historian captures timestamp, actor, and new value.
- [ ] Given system-generated events, when automation runs, then the Historian logs the automation event.
- [ ] Given users view the Historian, when opened, then it is read-only.

End-to-end
- [ ] Given a work-related health event where RCA is required, when review, RCA, action creation/deployment/closure complete and validation = Yes, then the event closes.
- [ ] Given a not work-related event where RCA is not required, when at least one action is completed and validation = Yes, then the workflow skips RCA and the event closes.
- [ ] Given completed actions sent to validation, when the validator sets Action Plan Validated = No, then the event returns to the Action Plan and remains In Progress until re-validated.

## Dependencies

- Inherits lifecycle, stages and statuses from Feature 000: Core Event Lifecycle (../core.md) — including the 5 stages, 4 statuses, and generic workflow behavior. Only health-specific deltas are specified here.
- Configurable RCA model from the core platform.
- Health reference lists (health context, health impact type, employee type) and location hierarchy master data.

## Open questions

- [OPEN]: The health workflow node does not explicitly define an archive branch. Should an archive/invalidation branch be explicitly added to Health, or should it inherit the default review rejection (Archived) behavior from core?
- [OPEN]: What exact health impact taxonomy should be standardized globally?
- [OPEN]: For certificate-required cases, which fields are mandatory (issuer, date, reference, document type)?
- [OPEN]: Who is authorized to override the optional RCA decision, and is that override auditable by policy?
