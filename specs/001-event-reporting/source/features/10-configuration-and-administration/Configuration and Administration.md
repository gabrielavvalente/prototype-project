# Feature 010: Configuration and Administration

## Goal
Provide the plant-scoped master data and the user-rights administration that drive every dropdown, checklist and mandatory-field rule in the product, while keeping configuration constrained enough to preserve group-wide standardization.

## Why
The governing principle is standardization first: configuration is intentionally constrained. Sites cannot add ad-hoc fields to event forms - any new field goes through product approval (§14). Sites maintain only the lists that genuinely reflect local operations, and user identity and roles are consumed from the upstream platforms rather than re-created in a duplicate directory.

## Platform context
- Source: Event Reporting BRD v1.0.0 - §3.1(9), §3.1(11), §4.1, §11, §14; story prefix `US-CFG-`.
- Modules involved: master data configuration screens, Section Mandatoriness, User Rights Management, Role Assignment.
- Platform contracts reused: user accounts, roles and scopes consumed from the platform master data service - never re-entered. Authentication, SSO, MFA, session management and account-lock propagation are not specified in Event Reporting.
- Technical note (§9.3 / A05): infrastructure is provisioned as code with security baselines and automated configuration scanning.
- Plant hierarchy consumed — Event Reporting consumes it; it does not replicate it:

| Source | Hierarchy |
|---|---|
| platform master data service | Plant > Department > Workshop > Job > Workstation > Task |

## User stories
1. US-CFG-01 - As a Site Admin, I want every configuration list to behave the same way, so that I learn one screen pattern instead of ten.
2. US-CFG-02 - As a Site Admin, I want to maintain the lists my plant's event forms draw from, so that reporters pick from options that match how this site actually operates.
3. US-CFG-03 - As a Site Admin, I want to control which analysis sections are compulsory per event family and level, so that a minor near-miss is not held to the same evidence burden as a lost-time injury.
4. US-CFG-04 - As a Site Admin, I want to consume roles from the upstream platforms and fine-tune them locally, so that I do not re-create the whole user directory but can still fix local assignments.
5. US-CFG-05 - As a Site Admin, I want to assign a user a role bounded by business, plant and pillar, so that access is granted no wider than the person's actual responsibility.
6. US-CFG-06 - As a platform owner, I want configuration locked to administrators and every destructive change confirmed, so that a misconfiguration cannot silently suppress event reporting.
7. US-CFG-07 (proposed, not in BRD) - As a corporate EHS lead, I want a Central role where I declare which businesses, regions and plants I am taking over, so that I govern master data across exactly my perimeter without a Site Admin granting me access plant by plant.
8. US-CFG-08 (proposed, not in BRD) - As a business, regional, country or cluster EHS manager, I want a second-layer role where I assign myself the plants in my perimeter, so that I can govern master data for my group of plants without being either corporate or a local admin.
9. US-CFG-09 (proposed, not in BRD) - As a Site Admin, I want to configure only the lists that actually differ between plants, so that I cannot accidentally redefine an EHS concept that must stay comparable across the group.
10. US-CFG-10 (proposed, not in BRD) - As a product owner, I want each master data entity explicitly assigned to a governance tier, so that "who can change this" is a data attribute rather than a per-screen decision.

Proposed stories US-CFG-07..10 originate from the workshop of [date generalized] (Danklou, workshop contributor, plus workshop contributor / workshop contributor input). They are candidates for BRD v1.1.0, not ratified requirements. Their rationale: governance is three-tier (central/corporate, business-region-country-cluster, plant), each tier declaring its own perimeter; and most master data should not be plant-configurable at all - standards, hazards and body parts are EHS-defined concepts a plant has no business redefining.

## Scope
- IN (MVP, §13): US-CFG-04 User Rights Management; US-CFG-05 Role Assignment; US-CFG-06 Protect Configuration.
- OUT (MVP, §13): US-CFG-01 uniform master data list pattern; US-CFG-02 plant master data screens; US-CFG-03 Section Mandatoriness; all configuration pages; Plant Structure Mapping; Translation Management.
- OUT (proposal stage): US-CFG-07 Central role; US-CFG-08 secondary business/regional role; US-CFG-09 plant-editable-only configuration; US-CFG-10 governance tier classification.
- OUT (product principle, §14): ad-hoc plant-specific fields on event forms - any new field goes through product approval.
- OUT: authentication, SSO, MFA, session management, password storage, and account-lock propagation.

## Functional requirements (EARS)
- FR-1: WHEN a Site Admin opens any configuration screen THEN the system SHALL provide a search bar, an active/inactive filter toggle, import and export template buttons, a Create button opening a form dialog, per-row edit, and activate/inactivate guarded by a confirmation popup. (from US-CFG-01)
- FR-2: WHEN a Site Admin selects multiple rows in a configuration list THEN the system SHALL allow bulk activate and bulk inactivate. (from US-CFG-01)
- FR-3: WHEN a Site Admin attempts to delete a configuration item THEN the system SHALL permit deletion only for plant-owned items and SHALL refuse deletion of global items. (from US-CFG-01)
- FR-4: WHEN a Site Admin maintains plant master data THEN the system SHALL support the following entities at the stated scope. (from US-CFG-02)

| Entity | Scope | Mandatory items |
| --- | --- | --- |
| Injury Risks | Plant | - |
| Related Standards | Business sub-group (regional governance office) | 14 Global Standards (mandatory, not deletable) |
| Body Parts | Global + plant custom sub-parts | 7 main categories (mandatory) |
| Risk Families | Plant | - |
| Immediate Actions | Plant | - |
| Aspects + Related Aspects | Plant | - |
| Related Hazards | Plant | - |
| Diseases / Potential Diseases | Plant | - |
| PPE | Plant | - |
| Section Mandatoriness | Per event family x level | - |

- FR-5: WHEN deletion is attempted on one of the 14 Global Standards or one of the 7 Body Part main categories THEN the system SHALL refuse the action; WHEN a plant adds a custom Body Part sub-part THEN the system SHALL permit it. (from US-CFG-02)
- FR-6: WHEN an item already used on existing events is deactivated THEN the system SHALL retain it on historical records and SHALL stop offering it on new forms. (from US-CFG-02)
- FR-7: WHEN Section Mandatoriness is opened THEN the system SHALL present a matrix across event family (SAF / ENV / IR / OH) x level (1-5), where each cell sets which of Actions, First Cause and Root Cause are mandatory. (from US-CFG-03)
- FR-8: WHEN a Section Mandatoriness change is saved THEN the system SHALL require a confirmation dialog, apply the change immediately to new event creation flows, and SHALL NOT retroactively invalidate in-flight events. (from US-CFG-03)
- FR-9: WHEN the Section Mandatoriness matrix is initialised THEN the system SHALL default TF1-TF3 and SRE1-SRE3 to mandatory. (from US-CFG-03 / R-07 mitigation)
- FR-10: WHEN users exist in the platform master data service THEN the system SHALL source their roles and scopes from there and SHALL NOT require re-entry. (from US-CFG-04)
- FR-11: WHEN a Site Admin needs a local role adjustment THEN the system SHALL allow fine-tuning via an Excel template import, and WHEN a role is changed THEN the system SHALL show a confirmation dialog carrying an effective-date note. (from US-CFG-04)
- FR-12: WHEN a role is assigned THEN the system SHALL offer the roles User / Reporter, Manager / EHS Manager, Owner, Site Admin, Regional User / regional governance office, and Super Admin, and SHALL bound the assignment by a business > plant > pillar scope. (from US-CFG-05)

| Role | Key capabilities |
|---|---|
| User / Reporter / Contributor | Create events, complete forms, close own actions, view assigned alerts |
| Manager / EHS Manager | Initial Review, assign owners, validate event quality, access reports |
| Owner | Lead 5W1H / 6M / 5 Why, build and close action plan, publish Safety Warning |
| Site Admin | Configure master data, manage user notification rules, manage plant structure |
| Regional User / regional governance office | Cross-site data, global/business standards, publish Warnings regionally |
| Super Admin | Multi-plant access, global configuration, integration oversight |

- FR-13: WHEN a role assignment takes effect THEN the system SHALL enforce it across menu rendering and server-side authorisation, and WHEN a user acts THEN the system SHALL prevent seeing or acting on data outside the assigned scope at every API and UI layer. (from US-CFG-04 / US-CFG-05)
- FR-14: WHEN a user who is not Site Admin or Super Admin accesses configuration THEN the system SHALL hide the Configuration menu and SHALL reject its endpoints server-side (A01). (from US-CFG-06)
- FR-16: WHEN any activate, inactivate or delete is triggered anywhere in configuration THEN the system SHALL require a confirmation popup before executing it. (from US-CFG-06)

Proposed stories US-CFG-07..10 are not ratified; their behaviors are captured as acceptance criteria below and MUST NOT be built until the BRD conflicts and open questions are resolved.

Reference - proposed governance tier classification (US-CFG-10). Only the rows marked "Workshop" were decided; the rest are inferred and need confirmation:

| Entity | BRD v1.0.0 scope | Proposed tier | Decided? |
|---|---|---|---|
| Related Standards | Business sub-group (regional governance office) | Global-fixed / Central | Workshop |
| Related Hazards | Plant | Central | Workshop |
| Body Parts | Global + plant custom sub-parts | Global-fixed | Workshop |
| PPE | Plant | Plant | Workshop (workshop contributor) |
| Job Function | not in BRD §11.2 | Plant | Workshop (workshop contributor) |
| Injury Risks | Plant | Central? | Inferred |
| Risk Families | Plant | Central? | Inferred |
| Immediate Actions | Plant | Plant? | Inferred |
| Aspects + Related Aspects | Plant | Business/Regional? | Inferred |
| Diseases / Potential Diseases | Plant | Global-fixed? | Inferred |
| Section Mandatoriness | Per family x level | Central? | Inferred |

## Non-functional requirements
- Security: every configuration endpoint enforces role checks server-side, not only in the UI (§9.2); perimeter and role changes audit-logged with who, what and when.
- Data integrity: deactivation never destroys historical event data; global mandatory items are undeletable at every layer.
- i18n: translation strings for mandatory UI elements are provided through the platform master data service per language wave (A-08).

## Acceptance criteria (testable)

US-CFG-01 - Manage a Master Data List
- [ ] Given any configuration screen, when it opens, then it offers a search bar and an active/inactive filter toggle.
- [ ] Given a configuration list, when I need bulk data entry, then import and export template buttons are available.
- [ ] Given a configuration list, when I create an item, then a Create button opens a form dialog.
- [ ] Given any row, when I act on it, then I can edit it and activate/inactivate it with a confirmation popup.
- [ ] Given a plant-owned item, when I delete it, then deletion succeeds; given a global item, when I attempt deletion, then it is refused.
- [ ] Given multiple selected rows, when I bulk activate or inactivate, then all selected rows change state.

US-CFG-02 - Configure the Plant's Master Data
- [ ] Given I hold Site Admin rights, when I open configuration, then I can maintain each entity in the FR-4 table at its stated scope.
- [ ] Given one of the 14 Global Standards, when I attempt to delete it, then the action is refused.
- [ ] Given one of the 7 Body Part main categories, when I attempt to delete it, then the action is refused; given a custom sub-part, when I add it, then it is permitted.
- [ ] Given an item already used on existing events, when I deactivate it, then historical records retain it while new forms no longer offer it.

US-CFG-03 - Set Which Sections Are Mandatory
- [ ] Given I open Section Mandatoriness, when the screen renders, then a matrix is presented across event family (SAF / ENV / IR / OH) x level (1-5).
- [ ] Given a matrix cell, when I edit it, then I can set which of Actions, First Cause and Root Cause are mandatory.
- [ ] Given I save a change, when the save completes, then it applies immediately to new event creation flows and in-flight events are not retroactively invalidated.
- [ ] Given a freshly initialised matrix, when I view defaults, then TF1-TF3 and SRE1-SRE3 are mandatory.
- [ ] Given I change a mandatoriness setting, when I confirm, then a confirmation dialog preceded the change.

US-CFG-04 - Manage User Rights
- [ ] Given users exist in the platform master data service, when they appear in Event Reporting, then their roles and scopes are sourced from there and not re-entered.
- [ ] Given I need a local adjustment, when I import the Excel template, then roles are fine-tuned accordingly.
- [ ] Given I change a role, when the change is submitted, then a confirmation dialog is shown carrying an effective-date note.
- [ ] Given a role is assigned, when the user next uses the product, then it takes effect across menu rendering and server-side authorisation.

US-CFG-05 - Assign a Role Within Scope
- [ ] Given I assign a role, when I choose it, then the choices are User / Reporter, Manager / EHS Manager, Owner, Site Admin, Regional User / regional governance office, Super Admin.
- [ ] Given a role is assigned, when scope is set, then it is bounded by a business > plant > pillar scope.
- [ ] Given a user acts, when the request touches data outside that scope, then it is blocked at every API and UI layer.

US-CFG-06 - Protect Configuration Behind Role and Confirmation
- [ ] Given I am not Site Admin or Super Admin, when I use the product, then the Configuration menu is absent and its endpoints reject me server-side.
- [ ] Given any activate/inactivate or delete, when I trigger it, then a confirmation popup precedes it.

US-CFG-07 (proposed, not in BRD) - Central / Corporate Role with Self-Declared Perimeter
- [ ] Given I hold the Central role, when I declare my perimeter, then I can select one or many businesses, regions, countries, clusters or plants.
- [ ] Given I have declared a perimeter, when I manage master data, then my rights apply across every plant inside it without any per-plant Site Admin grant.
- [ ] Given I hold the Central role, when I open the master data control panel, then I have a distinct level of access, separate from Site Admin.
- [ ] Given two Central users declare overlapping perimeters, when the overlap occurs, then it is permitted and resolved by an explicit precedence rule (rule undefined - see open questions).
- [ ] Given I change my declared perimeter, when the change saves, then it is audit-logged with who, what and when.

US-CFG-08 (proposed, not in BRD) - Secondary Role Scoped to Self-Assigned Plants
- [ ] Given I hold the secondary role, when its dimension is set, then it is one of business / region / country / cluster.
- [ ] Given I hold the secondary role, when I assign myself plants, then my rights apply to those plants only.
- [ ] Given a Central user's perimeter contains my plants, when governance conflicts, then the Central user's governance takes precedence over mine.
- [ ] Given an entity governed at Central tier, when I attempt to edit it, then the edit is refused.
- [ ] Given I change my plant assignment, when the change saves, then it is audit-logged.

US-CFG-09 (proposed, not in BRD) - Configure Only What Genuinely Varies by Plant
- [ ] Given an entity governed above my tier, when I view it, then it is read-only and the UI states which tier owns it and who to contact.
- [ ] Given a plant-editable entity, when I manage it, then I retain full create / edit / activate / inactivate / delete rights.
- [ ] Given a higher-tier entity, when I attempt to edit it via the API, then the request is refused server-side.

US-CFG-10 (proposed, not in BRD) - Classify Every Master Data Entity by Governance Tier
- [ ] Given any master data entity, when its governance is inspected, then it carries exactly one tier: Global-fixed, Central, Business/Regional, or Plant.
- [ ] Given the tier is set, when menus render and API calls authorise, then both are driven by the tier attribute with no per-screen hard-coding.
- [ ] Given an entity is Global-fixed, when any tier (including Central) attempts deletion, then it is refused.

## Dependencies
- A-01: APIs of the platform master data service for plant structure and user accounts are available and stable.
- A-06: plants onboarding to Event Reporting have completed plant structure entry in the platform master data service before go-live.
- A-08: translation strings for mandatory UI elements are provided through the platform master data service per language wave.
- [Event Creation](../03-event-creation/Event%20Creation.md) - consumes configured lists and Section Mandatoriness rules.
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) - role capabilities exercised in review.
- [External Reporting Platform Integration](../08-external-reporting-integration/External%20Reporting%20Integration.md) - Body Part custom sub-parts (US-External Reporting Platform-01).
- [Integrations](../12-integrations/Integrations.md) - upstream platform connectivity.
- [Notifications](../11-notifications/Notifications.md) - Site Admin notification rule management.

## Open questions
- [OPEN]: MVP seeding - all master-data configuration screens are deferred, yet MVP event creation depends on configured lists (Diseases, Immediate Actions, Related Hazards, Related Standards) and on Section Mandatoriness rules. Confirm the intended seeding mechanism: data migration, fixture load, or direct DB seeding.
- [OPEN]: R-07 - Section Mandatoriness misconfiguration could lead to under-reporting (likelihood Low / impact High). Mitigations in spec: mandatory defaults for TF1-TF3 and SRE1-SRE3, Site Admin restriction, confirmation dialogs. Confirm these are deemed sufficient.
- [OPEN]: BRD conflict - Related Hazards are plant-scoped master data per §11.2, but the workshop position is that hazards are fixed and not plant-configurable (affects US-CFG-02, US-INV-05).
- [OPEN]: BRD conflict - Body Parts allow plant custom sub-parts per §11.2 / US-External Reporting Platform-01, but the workshop position is that body parts are fixed (affects US-CFG-02, US-External Reporting Platform-01).
- [OPEN]: The workshop extends the §14 "standardization first" principle from form fields to master data itself - a larger change than §14 currently sanctions; needs ratification.
- [OPEN]: Precedence - when Central, Business/Regional and Plant perimeters overlap on the same entity, which wins? US-CFG-07 assumes an explicit rule exists; none is defined.
- [OPEN]: Self-declaration control - if Central and secondary-role users declare their own perimeters, what stops over-claiming? Approval step, or audit logging as the only control?
- [OPEN]: Role model impact - do the two proposed tiers replace Regional User / regional governance office and Super Admin (§4.1) or sit alongside them? The BRD's six roles would become eight, with visible overlap between Central and Super Admin.
- [OPEN]: Migration - existing Event Reporting plants have configured everything locally; retiering makes some of that data centrally owned. What happens to plant-local values that diverge from the central list?
- [OPEN]: Sub-part exception - if Body Parts become Global-fixed, is the External Reporting Platform custom sub-part capability (US-External Reporting Platform-01) dropped, or preserved as the one sanctioned exception?
- [OPEN]: Confirm approved neutral labels for the upstream master data service.