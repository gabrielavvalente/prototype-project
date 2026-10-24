# Feature 008: External Reporting Platform Integration

## Goal
Collect External Reporting Platform-shaped health data from day one and keep Event Reporting structurally ready for bidirectional sync with External Reporting Platform (the organization's external EHS reporting platform), while the user-facing sync entry point stays disabled behind a Super Admin feature flag.

## Why
Re-keying injury and illness data into External Reporting Platform wastes time and creates divergent records. Capturing the data in External Reporting Platform's own categories and terminology from the start means it is submittable later without re-mapping, and the explicit design constraint is that the form must accommodate future bidirectional sync without requiring a form redesign. The flag keeps data out of External Reporting Platform until deduplication and conflict handling are proven.

## Platform context
- Source: Event Reporting BRD v1.0.0 — §5.3 (FR-CREATE-08), §5.8, §7.4, §9.3 · story prefix `US-External Reporting Platform-`
- Modules involved: Event Creation (External Reporting Platform section of the injury/illness form), Integrations (sync, feature flag), Configuration and Administration (body sub-parts master data).
- Platform contracts reused: feature-flag administration behind the Integrations menu, visible to Super Admin only (§4.3); platform security baseline for external channels (§9.3).
- Roles: User / Reporter (enters the medical detail on an injury or illness event), Super Admin (owns the feature flag), Regional / Group EHS (consumes the resulting External Reporting Platform submissions).
- Design constraint (kept as a product note): the data model and form design must not foreclose the integration — no form redesign may be needed when sync is activated.

Reference data — the 7 mandatory body-part categories (plant-custom sub-parts may extend each; managed as master data, see [Configuration and Administration](../10-configuration-and-administration/Configuration%20and%20Administration.md)):

1. Head
2. Torso, Organs & Back
3. Thoracic Cavity
4. Upper Limbs
5. Hands & Fingers
6. Lower Limbs
7. Feet & Toes

Integration contract:

| Data Flow | Direction | Trigger |
|---|---|---|
| Event health data submission | Event Reporting → External Reporting Platform | Manual: Report to External Reporting Platform button (feature-flagged) |
| External Reporting Platform data pull to Event Reporting | External Reporting Platform → Event Reporting | Post-activation: on form open |

Feature flag states:

| State | Behaviour |
|---|---|
| Disabled (launch default) | Section renders and captures data. Button visible but disabled. No outbound calls. |
| Enabled (Super Admin) | Button active. Bidirectional sync engages. Deduplication must already be in place. |

## User stories
1. US-External Reporting Platform-01: As a reporter logging an injury or occupational illness, I want to describe the condition using External Reporting Platform's own categories and terminology, so that the data is submittable to External Reporting Platform without anyone re-keying or re-mapping it later.
2. US-External Reporting Platform-02: As a Super Admin, I want External Reporting Platform reporting disabled at launch and enabled by a flag I control, so that no data reaches External Reporting Platform before deduplication and conflict handling are proven.
3. US-External Reporting Platform-03: As a Group EHS data owner, I want Event Reporting and External Reporting Platform to stay in step in both directions, so that the same injury never exists twice and neither system holds a stale version.
4. US-External Reporting Platform-04: As a platform security owner, I want the External Reporting Platform channel hardened, so that injury and medical data cannot leak or be redirected.

## Scope
- IN: the architectural obligation only — the data model and form design accommodate the future integration without redesign, even though nothing ships functionally in MVP.
- OUT (all stories excluded from MVP): US-External Reporting Platform-01 Record External Reporting Platform-Shaped Health Data; US-External Reporting Platform-02 Feature Flag Control; US-External Reporting Platform-03 Bidirectional Duplicate-Safe Sync; US-External Reporting Platform-04 Protect Medical Data in Transit. §13 defers the External Reporting Platform Details Form (Event Creation) and the External Reporting Platform sync pages (Integrations).

## Functional requirements (EARS)
- FR-1: WHEN a reporter opens the External Reporting Platform section of an injury or illness event THEN the system SHALL offer a condition/illness selection from External Reporting Platform's hierarchical category tree. (from US-External Reporting Platform-01 / FR-External Reporting Platform-01, FR-CREATE-08)
- FR-2: WHEN an injury is recorded THEN the system SHALL offer a body-part selector with the 7 mandatory categories and their sub-parts. (from US-External Reporting Platform-01)
- FR-3: WHEN the reporter describes the injury or illness THEN the system SHALL provide a medical terminology list for precise wording, and on section completion every field External Reporting Platform requires SHALL have been collected. (from US-External Reporting Platform-01)
- FR-4: WHEN the product launches THEN the system SHALL show the Report to External Reporting Platform button present but disabled, and while the flag is off the External Reporting Platform section SHALL still capture and store data with no outbound call made. (from US-External Reporting Platform-02 / FR-External Reporting Platform-02)
- FR-5: WHEN a Super Admin enables the feature flag THEN the system SHALL activate the Report to External Reporting Platform button; WHEN any other role attempts to change the flag THEN the system SHALL reject it. (from US-External Reporting Platform-02)
- FR-6: WHEN the flag is enabled and the Report to External Reporting Platform button is pressed THEN the system SHALL submit the event's health data to External Reporting Platform, and WHEN the record already exists in External Reporting Platform THEN deduplication logic SHALL prevent a second record being created. (from US-External Reporting Platform-03 / FR-External Reporting Platform-02, §7.4)
- FR-7: WHEN data changes in External Reporting Platform after activation THEN the system SHALL reflect those changes back into Event Reporting when the form is opened. (from US-External Reporting Platform-03)
- FR-8: WHEN both systems have changed the same field THEN the system SHALL resolve the conflict deterministically via conflict resolution logic, with no manual double entry required of any user. (from US-External Reporting Platform-03)
- FR-9: WHEN the feature flag is enabled THEN deduplication logic SHALL already be in place — enabling it beforehand is a release-gate failure. (from US-External Reporting Platform-02)

## Non-functional requirements
- Security (§9.3, from US-External Reporting Platform-04): all External Reporting Platform calls travel over TLS 1.2 or higher; credentials are held in a vault and never in source code; outbound destinations are allowlisted with no user-controlled URL fetch (OWASP A10 SSRF); the integration passes a threat-modeling design review gate (A04).
- Data integrity: bidirectional sync must never create duplicate records or leave either system with a stale version.
- Extensibility: the form accommodates future bidirectional sync without a form redesign.

## Acceptance criteria (testable)
US-External Reporting Platform-01 — Record External Reporting Platform-Shaped Health Data
- [ ] Given I open the External Reporting Platform section, when I classify the condition, then I select a condition/illness category from External Reporting Platform's hierarchical category tree.
- [ ] Given an injury is recorded, when I locate it, then a body-part selector offers the 7 mandatory categories and their sub-parts.
- [ ] Given I describe the injury or illness, when I choose wording, then a medical terminology list is available for precise wording.
- [ ] Given I complete the section, when it is validated, then every field External Reporting Platform requires has been collected.

US-External Reporting Platform-02 — Keep the Integration Switched Off Until Ready
- [ ] Given the product launches, when I view an injury/illness event, then the Report to External Reporting Platform button is present but disabled.
- [ ] Given the flag is off, when the External Reporting Platform section is used, then it still captures and stores data and no outbound call is made.
- [ ] Given I am a Super Admin and I enable the feature flag, when I return to the event, then the Report to External Reporting Platform button becomes active.
- [ ] Given a user without the Super Admin role, when they attempt to activate the flag, then activation is refused.
- [ ] Given deduplication logic does not yet exist, when flag enablement is proposed, then it is treated as a release-gate failure — the logic must be built first.

US-External Reporting Platform-03 — Sync Bidirectionally Without Duplicates
- [ ] Given the flag is enabled and I press Report to External Reporting Platform, when the call completes, then the event's health data is submitted to External Reporting Platform.
- [ ] Given the record already exists in External Reporting Platform, when submission runs, then deduplication logic prevents a second record being created.
- [ ] Given data changes in External Reporting Platform, when the form is opened in Event Reporting, then those changes are reflected back.
- [ ] Given both systems changed the same field, when sync runs, then conflict resolution logic determines the outcome deterministically.
- [ ] Given any sync occurs, when observed end to end, then no manual double entry is required of any user.

US-External Reporting Platform-04 — Protect Medical Data in Transit
- [ ] Given any External Reporting Platform call, when it is made, then it travels over TLS 1.2 or higher.
- [ ] Given credentials are needed, when they are inspected, then they are held in a vault and never in source code.
- [ ] Given outbound calls are made, when destinations are checked, then they are allowlisted with no user-controlled URL fetch (A10 SSRF).
- [ ] Given the integration is designed, when it is reviewed, then it passes a threat-modeling design review gate (A04).

## Dependencies
- [Event Creation](../03-event-creation/Event%20Creation.md) — hosts the External Reporting Platform section of the injury/illness form (FR-CREATE-08).
- [Integrations](../12-integrations/Integrations.md) — hosts the sync pages and the feature flag (Integrations menu, Super Admin only, §4.3).
- [Configuration and Administration](../10-configuration-and-administration/Configuration%20and%20Administration.md) — plant-custom body-part sub-parts managed as master data.
- Assumption A-04: the External Reporting Platform API schema is stable enough for field mapping at design time; activation via feature flag is a product decision.

## Open questions
- [OPEN]: Risk R-05 (Low/Medium) — External Reporting Platform schema changes before activation invalidate the field mapping. Proposed mitigation: keep the integration behind the feature flag and maintain a schema validation test suite; confirm ownership.
- [OPEN]: The purpose states External Reporting Platform-shaped health data is collected "from day one" and US-External Reporting Platform-02 assumes the section captures data even with the flag off, yet US-External Reporting Platform-01 and the External Reporting Platform Details Form are deferred by §13. Confirm whether any External Reporting Platform data capture surface ships in MVP or the obligation is purely a data-model/form-design constraint.
