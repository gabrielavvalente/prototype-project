# Feature 004: Investigation

## Goal
Give the Event Owner a operational excellence framework-compliant root cause analysis layer over a submitted event — 5W1H, 6M and 3-Legged 5 Why, plus hazard linkage and risk assessment tracking — whose identified root causes anchor the Action Plan.

## Why
Every corrective action must link back to a root cause identified here; structured, comparable analysis (the same facts, themes and why-chains at every site) is what makes cross-site root cause patterns visible and audits defensible.

## Platform context
- Modules involved: Investigation tab (progress overview), 5W1H component, 6M component, 3-Legged 5 Why diagram, Related Hazards and risk assessment step, audit trail (Record Historian).
- Platform contracts reused: Record Historian for field-level audit logging; plant-scoped hazard master data (§11.2); Section Mandatoriness Configuration (§11.3) controls whether Root Cause analysis is mandatory per event family × level.
- Data created: one **Investigation** record (§8.2) per Event — `event_id` (FK → Event), `five_w1h` (JSON), `six_m` (JSON), `five_why_legs` (JSON), `related_hazards` (FK[] → Hazard), `risk_assessment_updated` (Boolean). Root causes marked in `five_why_legs` are referenced by **Corrective Action.linked_root_cause** (§8.3). The parent Event's status is `Under Investigation` during this phase.
- Convention note: in the 6M themes, **Management** deliberately replaces the classic *Measurement* theme — a the organization operational excellence framework convention, not an error in the BRD.
- Source: Event Reporting BRD v1.0.0 — §3.1(4), §5.4, §6.1, §6.6 (story prefix `US-INV-`).

## User stories
1. **US-INV-01** — As an Event Owner picking up a new assignment, I want one screen showing what the event was and which analyses remain, so that I know where to start without reading the whole record.
2. **US-INV-02** — As an Event Owner, I want a structured Who/What/When/Where/Why/How checklist, so that I gather the same facts every investigator would, in the same order.
3. **US-INV-03** — As an Event Owner, I want to sort contributory causes into the six standard themes and explain each one, so that the analysis is comparable with every other the organization investigation.
4. **US-INV-04** — As an Event Owner, I want a branching 5-Why diagram where I can mark and classify each root cause, so that multi-path causation is captured rather than forced into a single chain.
5. **US-INV-05** — As an Event Owner, I want to connect the event to known hazards and confirm the risk assessment was revised, so that the site's risk register stays current after the event.
6. **US-INV-06** — As an EHS auditor, I want every change made during investigation recorded, so that I can prove no findings were altered after the fact.

## Scope
- IN: US-INV-01 Investigation Progress Overview; US-INV-02 5W1H; US-INV-03 6M; US-INV-04 3-Legged 5 Why; US-INV-06 Audit Trail.
- OUT: US-INV-05 Related Hazards and Risk Assessment Update; Related Hazards page and Investigation Attachments page (excluded per §13).

## Functional requirements (EARS)
- FR-1: WHEN an event is submitted THEN the system SHALL expose an Investigation tab on the record, showing an event recap card, per-component completion status (5W1H, 6M, 3-Legged 5 Why) with progress indicators, and direct navigation into each component. (from US-INV-01 / FR-INV-01)
- FR-2: WHEN the Owner opens 5W1H THEN the system SHALL present six sections — Who, What, When, Where, Why, How — each with a Yes/No applicability toggle. (from US-INV-02 / FR-INV-02)
- FR-3: WHEN a 5W1H section is marked applicable (Yes) THEN the system SHALL display its mandatory sub-questions with text response fields and SHALL require all of them before the component counts as complete; WHEN a section is marked No THEN the system SHALL hide its questions and not require them. (from US-INV-02 / FR-INV-02)
- FR-4: WHEN the Owner opens 6M THEN the system SHALL present six expandable theme sections — Man, Machine, Method, Materials, Mother Nature, Management — allowing any theme to remain empty. (from US-INV-03 / FR-INV-03)
- FR-5: WHEN the Owner adds a 6M cause THEN the system SHALL capture the cause text and an explanation answering "Why was [cause] a possible cause?", and SHALL permit no more than 6 causes in total across all themes. (from US-INV-03 / FR-INV-03)
- FR-6: WHEN the Owner opens 5 Why THEN the system SHALL present an interactive visual diagram with vertical legs of up to 5 sequential Why questions each, with a branch-right action that spawns a new parallel leg. (from US-INV-04 / FR-INV-04)
- FR-7: WHEN the Owner marks a Why answer as a root cause (R icon) THEN the system SHALL require classifying it as Behavioral or Conditional. (from US-INV-04 / FR-INV-04)
- FR-8: WHEN the investigation record is exported or printed THEN the system SHALL include the 5 Why diagram. (from US-INV-04 / FR-INV-04)
- FR-9: WHEN the Owner reaches Related Hazards THEN the system SHALL offer a multi-select from the configured hazard list. (from US-INV-05 / FR-INV-05 — out of MVP scope)
- FR-10: WHEN the risk assessment checkbox "Risk assessment has been updated as a result of this event" is ticked THEN the system SHALL capture what was updated and when in a text field; WHEN it is unticked THEN the system SHALL hide the text field and not require it. (from US-INV-05 / FR-INV-05 — out of MVP scope)
- FR-11: WHEN any field changes after Initial Review has been saved THEN the system SHALL write the change to the Record Historian with field name, old value, new value, changed-by user and timestamp — so all investigation edits are audit-logged by definition. (from US-INV-06 / §6.6)
- FR-12: WHEN Safety Warning generation (FR-COMM-02) or Final Review availability (FR-GOV-03) is evaluated THEN the system SHALL require investigation completeness AND at least one corrective action deployed before permitting either. (completion gate, §5.4)

## Non-functional requirements
- Observability / auditability: complete field-level audit trail of all post-Initial-Review edits (§6.6).
- Performance: interactive components (5 Why diagram, progress overview) responsive within the product-wide targets of §6.1.
- Comparability: fixed component structures (5W1H sections, 6M themes) are not plant-configurable, keeping analyses comparable across sites.

## Acceptance criteria (testable)

**US-INV-01**
- [ ] Given an event is submitted, when I open the record, then it exposes an Investigation tab.
- [ ] Given I open the tab, when it renders, then an event recap card summarises the event.
- [ ] Given I open the tab, when it renders, then completion status is shown per component: 5W1H, 6M, 3-Legged 5 Why, with progress indicators for incomplete components.
- [ ] Given I select a component, when navigation completes, then I am in that sub-section.

**US-INV-02**
- [ ] Given I open 5W1H, when it renders, then six sections are presented: Who, What, When, Where, Why, How, each with a Yes/No applicability toggle.
- [ ] Given I set a section to Yes, when it expands, then its mandatory sub-questions are displayed, each with a text response field.
- [ ] Given a section is marked applicable, when completeness is evaluated, then all its questions must be answered before the component counts as complete.
- [ ] Given a section is marked No, when it renders, then its questions are hidden and not required.

**US-INV-03**
- [ ] Given I open 6M, when it renders, then six expandable theme sections are presented: Man, Machine, Method, Materials, Mother Nature, Management.
- [ ] Given I add causes, when the total across all themes reaches 6, then no further cause can be added.
- [ ] Given I add a cause, when the card renders, then I enter the cause text and an explanation answering "Why was [cause] a possible cause?".
- [ ] Given a theme has no causes, when completeness is evaluated, then the theme may be left empty.

**US-INV-04**
- [ ] Given I open 5 Why, when it renders, then an interactive visual diagram with vertical legs is presented.
- [ ] Given a leg, when I add Why questions, then it holds up to 5 in sequence.
- [ ] Given I need a parallel path, when I use branch-right, then a new leg is spawned.
- [ ] Given any Why answer, when I use the R icon, then it is marked as an identified root cause.
- [ ] Given I mark a root cause, when I save it, then I must classify it as Behavioral or Conditional.
- [ ] Given the investigation record is exported or printed, when the output renders, then the diagram is included.

**US-INV-05** (out of MVP)
- [ ] Given I reach Related Hazards, when it renders, then I select from the configured hazard list as a multi-select.
- [ ] Given I reach the risk assessment step, when it renders, then a checkbox states "Risk assessment has been updated as a result of this event."
- [ ] Given I tick that checkbox, when the field appears, then a text field captures what was updated and when.
- [ ] Given the checkbox is unticked, when the step renders, then the text field is hidden and not required.

**US-INV-06**
- [ ] Given Initial Review has been saved, when any subsequent field change occurs, then it is written to the Record Historian.
- [ ] Given a change is logged, when the log entry is inspected, then it captures field name, old value, new value, changed-by user and timestamp.

## Dependencies
- [Event Creation](../03-event-creation/Event%20Creation.md) — supplies the submitted event under investigation.
- [Action Plan](../05-action-plan/Action%20Plan.md) — every corrective action links back to a root cause marked here (`Corrective Action.linked_root_cause`).
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) — Owner is assigned at Initial Review; Final Review availability (FR-GOV-03) gated on investigation completeness plus ≥1 action deployed.
- [Safety Communication](../07-safety-communication/Safety%20Communication.md) — Safety Warning generation (FR-COMM-02) gated on the same completion condition.
- [Reporting and Analytics](../09-reporting-and-analytics/Reporting%20and%20Analytics.md) — consumes root cause classifications for cross-site pattern review.
- Configuration: plant-scoped hazard master data (§11.2) and Section Mandatoriness Configuration (§11.3).

## Open questions
- [OPEN]: None identified beyond scope exclusions; US-INV-05 (Related Hazards and risk assessment confirmation) is specified but deferred — confirm its target release so the risk register linkage does not lapse.
