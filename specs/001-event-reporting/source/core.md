# Feature 000: Core Event Lifecycle

## Goal

Provide one generic, configurable event lifecycle so that any event type at the organization can be reported, reviewed, investigated, acted upon, validated, and closed through the same common workflow.

## Why

Today each event category risks getting its own tool or disconnected workflow. A single core lifecycle gives frontline teams one simple way to report, gives reviewers and experts the structure to classify, enrich, and investigate, and gives the organization trusted, traceable data for visibility and prevention. Type-specific needs (fields, classifications, roles, rules) are handled by configuration on top of this foundation — never by forking the lifecycle. An event is only closed when its actions are completed AND validated as effective, not merely because it was reported or reviewed.

## Platform context

- Modules involved: Event Hub (enterprise operations platform Frontline Coordination) — core event module.
- Platform contracts reused: platform roles, notification service, Action Management Platform (event actions created and monitored there), attachments/evidence storage, audit trail.
- An event is any situation, occurrence, observation, deviation, issue, incident, near miss, alert, or relevant operational information the organization wants to capture. The core supports current and future scopes (EHS, Industrial Risks, Operational, Quality, others) through configuration.

## User stories

1. As a frontline user, I want to report an event through a simple submission form so that I can capture what happened without understanding the downstream workflow.
2. As a reviewer, I want to validate, classify, and enrich a submitted event so that only relevant, well-qualified events continue in the workflow.
3. As a reviewer, I want to archive invalid events with a stated reason so that duplicates and low-quality submissions do not pollute the active workflow while remaining traceable.
4. As an investigator/expert, I want to perform a structured root cause analysis when the configuration requires it so that we understand why the event happened.
5. As an action owner, I want actions assigned to me with due dates and evidence so that the event leads to concrete corrective or preventive measures.
6. As a validator, I want to confirm whether the completed action plan was effective so that events are only closed when the problem is truly addressed.
7. As any stakeholder, I want every important change traced so that the event history is reliable for reporting and prevention.

## Scope

- IN: the generic event concept; the five-stage lifecycle (Submission, Review, Root Cause Analysis, Action Plan, Validation); the four-status model (Open, In Progress, Archived, Closed); the stage/status distinction and mapping; the generic workflow including archiving with reason and notification, the validation loop back to Action Plan, and closure recording; lifecycle traceability.
- OUT: detailed configuration of each event type or level — specific forms, classifications, type-specific workflows, roles, and business rules (delivered by the type-specific and configuration specs built on this core); detailed screen designs; reporting/analytics beyond making archived and closed events available for traceability; authentication, SSO, MFA, session management, password storage, and account-lock propagation.

## Lifecycle model

All events follow the same five stages. **Stage** = where the event is in the workflow. **Status** = the overall lifecycle condition. They are distinct concepts:

| Stage | Typical Status |
|---|---|
| Submission completed, waiting for review | Open |
| Review started or reviewer assigned | In Progress |
| Review rejected as invalid (duplicated, useless, or bad quality) | Archived |
| Root Cause Analysis | In Progress |
| Action Plan | In Progress |
| Validation | In Progress |
| Validation effective | Closed |
| Validation not effective | In Progress, returned to Action Plan |

```text
Submission
    ↓
Status: Open
    ↓
Reviewer assigned or review started
    ↓
Status: In Progress
    ↓
Review
    ├─ Invalid / duplicated, useless, or bad quality (Notify all related persons)
    │      ↓
    │   Status: Archived
    │
    └─ Valid event
           ↓
       Root Cause Analysis
           ↓
       Action Plan
           ↓
       Validation
           ├─ Effective
           │      ↓
           │   Status: Closed
           │
           └─ Not effective
                  ↓
              Return to Action Plan
                  ↓
              Status remains: In Progress
```

## Functional requirements (EARS)

Submission

- FR-1: WHEN a user submits an event THEN the system SHALL create the event record at the Submission stage with status **Open**, waiting for review.
- FR-2: WHEN a user opens the submission form THEN the system SHALL present the form as configured for the event type, level, site, business, country, or local rules.

Review

- FR-3: WHEN a reviewer is assigned or starts the review THEN the system SHALL set the event status to **In Progress**.
- FR-4: WHEN an authorized reviewer or responsible group reviews an event THEN the system SHALL allow them to validate submission quality, identify duplicates or invalid events, confirm or correct the event type and classification, add procedural information required for the event type and level, and decide whether the event continues or is archived.
- FR-5: WHEN a reviewer rejects an event as invalid (Confirmed = No) THEN the system SHALL require the reviewer to select exactly one invalidation reason: `Duplicated`, `Useless`, or `Bad quality`.
- FR-6: WHEN the archive decision is saved THEN the system SHALL set the event status to **Archived** and SHALL automatically notify all persons related to the event (Reporter, Local EHS, reviewers, and any other stakeholders) with the selected reason.
- FR-7: WHEN an event is Archived THEN the system SHALL keep it available for traceability and reporting and SHALL exclude it from the active workflow.
- FR-8: WHEN a reviewer confirms an event as valid (Confirmed = Yes) THEN the system SHALL keep the status **In Progress** and move the event to the Root Cause Analysis stage.

Root Cause Analysis

- FR-9: WHEN the applicable workflow configuration defines root cause analysis as mandatory, optional, simplified, or not applicable THEN the system SHALL apply that rule to the event.
- FR-10: WHEN root cause analysis is performed THEN the system SHALL allow documenting investigation findings, contributing factors, and root causes, adding evidence or attachments, involving additional experts or groups, and completing the required investigation fields or methods, while the event status remains **In Progress**.

Action Plan

- FR-11: WHEN an event is at the Action Plan stage THEN the system SHALL allow users to create one or more actions linked to the event through Action Management Platform, each with a description, responsible person, due date, priority (if configured), evidence or attachments, and completion status; every such action SHALL be monitorable in the Action Management Platform application.
- FR-12: WHILE actions are open or awaiting validation THEN the system SHALL keep the event status **In Progress**.
- FR-13: WHEN the required actions are completed THEN the system SHALL allow the action plan to be closed or marked ready for validation and SHALL move the event to the Validation stage.

Validation and Closure

- FR-14: WHEN the validator accepts the action plan as effective THEN the system SHALL set the event status to **Closed** and record the closure date, the person who validated closure, the validation result, and closure comments if applicable.
- FR-15: WHEN the validator rejects the action plan as not effective THEN the system SHALL keep the event status **In Progress**, return the event to the Action Plan stage, and allow additional actions to be added.
- FR-16: WHEN any lifecycle change occurs (status change, stage progression, ownership change, classification change, decision, comment, attachment, action, validation decision, closure) THEN the system SHALL record it in the event's audit trail.

## Non-functional requirements

- Extensibility: the core lifecycle, status model, and action management remain identical across all event types; type-specific differences are delivered through configuration, never through separate tools or disconnected workflows.
- Usability: the submission experience is simple enough for frontline users with no knowledge of the downstream workflow; review, investigation, and validation provide the structure reviewers and experts need.
- Traceability/observability: the full event history (per FR-16) is retained and available for reporting, including archived events.
- Data trust: lifecycle and status data are reliable enough to feed operational visibility and prevention reporting.

## Acceptance criteria (testable)

- [ ] Given a user completes the submission form, when the event is submitted, then an event record exists at the Submission stage with status Open.
- [ ] Given an event with status Open, when a reviewer is assigned or starts the review, then the event status becomes In Progress.
- [ ] Given a reviewer sets Confirmed = No, when they attempt to save without an invalidation reason, then the system requires selecting one of Duplicated, Useless, or Bad quality.
- [ ] Given a reviewer archives an event with reason "Duplicated", when the decision is saved, then the event status is Archived and the Reporter, Local EHS, and all other related persons receive a notification stating the reason.
- [ ] Given an archived event, when users browse the active workflow, then the event does not appear there but remains retrievable for traceability and reporting.
- [ ] Given a reviewer sets Confirmed = Yes, when the review is saved, then the event moves to Root Cause Analysis with status In Progress.
- [ ] Given an event at the Action Plan stage, when a user creates an action, then the action is created in Action Management Platform, linked to the event, and carries a description, responsible person, due date, and completion status (plus priority if configured), and it can be monitored in the Action Management Platform application.
- [ ] Given open or unvalidated actions, when the event is viewed, then its status is In Progress.
- [ ] Given all required actions are completed and the plan is ready for validation, when the validator confirms the plan as effective, then the event status becomes Closed and the closure date, validator, validation result, and any comments are recorded.
- [ ] Given a completed action plan, when the validator rejects it as not effective, then the event returns to the Action Plan stage with status In Progress and new actions can be added.
- [ ] Given any status change, stage progression, classification change, decision, comment, attachment, action, or validation decision, when it is saved, then it appears in the event's audit trail.

## Dependencies

- Downstream: all type-specific event specs (Safety, Health, Industrial Risk, Environment — Features 021–024) inherit this lifecycle, stages, and statuses and spec only their deltas.
- Downstream: screens (Feature 015), master data control panel (Features 030–037), and role management (Feature 040) build on this core.
- Relies on platform notification, role, audit-trail, and Action Management Platform contracts (see Platform context). Event actions are created through Action Management Platform and monitored in the Action Management Platform application.

## Open questions

- [OPEN]: The product is named both "enterprise operations platform Event Module" and "Event Hub" in the source — confirm the single official product name.
- [OPEN]: When root cause analysis is configured as "not applicable", the source does not state whether the event moves directly from Review to Action Plan — confirm the skip behavior.
- [OPEN]: The source does not state whether an event can be closed with an empty action plan (no actions required) or whether the Action Plan stage can be skipped — confirm.
- [OPEN]: The source does not define who is authorized to validate the action plan (validator role) or whether the validator must differ from the action owners — confirm in role management.
- [OPEN]: The source does not state whether a Closed or Archived event can be reopened — confirm.
