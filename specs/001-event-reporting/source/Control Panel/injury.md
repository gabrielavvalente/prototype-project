# Feature 032: Injury Master Data

## Goal

Provide a fixed, globally-owned list of Injury types, linked to Body Parts through a relationship matrix, so the type of harm in a Safety Event is classified consistently worldwide.

## Why

Injury classification feeds event review, investigation, and consolidated analytics; any local variation would fragment reporting, so the list is a fixed global catalog with no extension at any lower level.

## Platform context

- Modules involved: Master Data Control Panel (H&S pillar), Event Reporting (Safety events).
- Platform contracts reused: governed multi-level model (this value set uses its "fixed global list" variant), audit trail, import/export, translation management, reporting codes, and the master data consumption interface defined in Feature 030 (FR-19).
- The full Body Part to Injury relationship matrix is a separate global configuration dataset maintained by the Global Central Team.

## User stories

1. As a Global Central Team administrator, I want to maintain the global Injury list and the Body Part to Injury relationship matrix (create, edit, deactivate, retire, import/export, review impact) so that injury terminology and reporting stay consistent worldwide.
2. As a Business/Country/Cluster or Plant/Local administrator, I want read-only visibility of the Injury values and their Body Part relationships so that I understand what my modules consume.
3. As a module user, I want to select an active Injury from the values linked to the Body Part I selected so that the event's harm is classified correctly.

## Scope

- IN: global Injury value list and attributes; Injury lifecycle (Active/Inactive/Retired); relationship principles between Body Parts and Injuries; consumption by the Safety Event module; audit trail; import/export of the list and the relationship matrix.
- OUT: any Business, Country, Cluster, or Plant creation, editing, deactivation, retirement, override, or extension of Injury values (fixed global list — lower levels do not even request additional values); the shared governance and access-assignment model (owned by Feature 030); Body Part values themselves (Feature 033).

## Functional requirements (EARS)

- FR-1 (was FR-INJ-01, FR-INJ-03): WHEN the H&S pillar control panel is provisioned THEN the system SHALL provide the Injury master data as a fixed global list (initial values below) maintained exclusively by authorized Global Central Team users.
- FR-2 (was FR-INJ-02): WHEN a Business, Country, Cluster, or Plant user attempts to create, edit, deactivate, retire, override, or extend an Injury value THEN the system SHALL reject the action; these roles SHALL have read-only access to the configuration.
- FR-3 (was FR-INJ-04): WHEN Body Part to Injury relationships are configured THEN the system SHALL support a many-to-many relationship (a Body Part linked to multiple Injuries; an Injury linked to multiple Body Parts), maintained by the Global Central Team as global configuration data.
- FR-4 (was FR-INJ-05): WHEN a user selects a Body Part in the Safety Event module THEN the system SHALL display only the Injuries linked to that Body Part in the relationship matrix.
- FR-5 (was FR-INJ-06): WHEN a user attempts to select an Injury not configured for the selected Body Part THEN the system SHALL prevent the selection.
- FR-6 (was FR-INJ-07): WHEN a new Safety Event record is created THEN the system SHALL offer only active Injury values through active Body Part to Injury relationships.
- FR-7 (was FR-INJ-08): WHEN an Injury value is deactivated or retired THEN the system SHALL keep it available for historical Safety Event records and reporting while excluding it from new records.
- FR-8 (was FR-INJ-09): WHEN an Injury is created or imported with a name already existing in the global list THEN the system SHALL reject the duplicate.
- FR-9 (was FR-INJ-10): WHEN an Injury value or a Body Part to Injury relationship changes THEN the system SHALL record an audit entry with what changed, previous value, new value, user, date and time, and scope affected.
- FR-10 (was FR-INJ-11): WHEN a Global Central Team user initiates deactivation or retirement of an Injury value THEN the system SHALL show where the value is used (for example, Body Part relationship mappings).
- FR-11 (was FR-INJ-12): WHEN an authorized Global Central Team user imports the Injury list or the relationship matrix THEN the system SHALL validate duplicates, mandatory fields, status values, and relationship consistency before saving; export SHALL be available to the same role.
- FR-12 (was FR-INJ-13): WHEN the platform serves Injury values in a user's language THEN the system SHALL provide multilingual labels and descriptions where required.
- FR-13 (was FR-INJ-14): WHEN an Injury value is used for analytics, integrations, or historical consistency THEN the system SHALL provide a stable reporting code or global identifier.
- FR-14 (was Validation Rules): WHEN an Injury is saved without a name THEN the system SHALL reject the save; WHEN a Body Part to Injury relationship is created with a retired Body Part or a retired Injury THEN the system SHALL reject the relationship.
- FR-15 (was Data Lifecycle): WHEN an Injury status changes THEN the system SHALL manage the value through the statuses Active, Inactive, and Retired, with retired values excluded from new records but retained for historical records and reporting.

### Reference data

Injury attributes: Injury name, Description (if required), Pillar, Consuming module, Scope level, Status, Created by/date, Last updated by/date, Effective start/end date (if applicable), Reporting code or global identifier (if required), Translations (if required).

Initial Injury list:

- Burn (1&deg;degree/2&deg;degree)
- Burn (3&deg;degree/4&deg;degree)
- Contusion, ecchymosis
- Dermatosis (skin infection)
- Fracture
- Bruise
- Cephalalgia
- Pain, sensory trouble
- Sting, bite
- Foreign matters presence
- Bleeding
- Tinnitus (buzzing)
- Hearing Loss
- Damage to the cornea
- Conjunctival irritation
- Temporary loss of sight
- Permanent loss of sight
- Amputation
- Paralysis
- Fracture with paralysis
- Pain (cervicalgia)
- Muscular tear or sprain
- Pain (back,lumbago)
- Hernia
- Internal Injuries (liver, spleen, kidney)
- Inguinal hernia
- Internal Injuries (urinary, genital)
- Inhalation, foreign body
- Dislocation
- Avulsion
- Drowning
- Malaise, dizziness, loss of consciousness
- Asphyxia, breathing difficulty
- Intoxication
- Heat stroke
- Electrical shock
- Allergic shock
- Other

## Non-functional requirements

- Consistency/analytics: one global list with stable reporting codes guarantees consolidated injury reporting across countries, businesses, clusters, and plants; historical records remain interpretable after values are retired.
- Auditability: all list and relationship changes are traceable (FR-9).
- i18n: multilingual labels/descriptions per platform translation mechanism (FR-12).

## Acceptance criteria (testable)

- [ ] Given a Business/Country/Cluster or Plant administrator, when they open the Injury configuration, then values and relationships are visible read-only and every create/edit/deactivate/retire/extend action is rejected.
- [ ] Given a reporter who selected a Body Part, when the Injury list is displayed, then it contains only active Injuries linked to that Body Part, and an Injury outside the matrix cannot be selected.
- [ ] Given a selected Body Part with no active Injury relationship configured, when the Injury list is displayed, then no unrelated Injury values are shown.
- [ ] Given a deactivated or retired Injury, when a historical Safety Event referencing it is opened, then the value is still shown, and it does not appear in the pick list for new events.
- [ ] Given an existing Injury name, when a Global Central Team user creates or imports a value with the same name, then the save is rejected.
- [ ] Given a retired Body Part or retired Injury, when a relationship between them is created, then the system rejects it.
- [ ] Given any change to an Injury value or relationship, when it is saved, then an audit entry records what changed, previous and new value, user, date/time, and scope.

## Dependencies

- Follows the governed multi-level model defined in Feature 030: Master Data Control Panel ([master-data-control.md](master-data-control.md)); this value set applies the "fixed global list, no local creation" variant.
- Depends on Feature 033: Body Part Master Data ([body-part.md](body-part.md)) — Injuries are filtered by the selected Body Part via the shared relationship matrix.
- Consumed by Feature 021: Safety Event ([../safety%20event/safety-event.md](../safety%20event/safety-event.md)).

## Open questions

- [OPEN]: Behavior when a selected Body Part has no active Injury relationship is only partially specified (no unrelated values shown) — whether the event can proceed without an Injury, or "Other" is always offered, is not defined.
- [OPEN]: The Body Part to Injury relationship matrix content (which Injuries map to which Body Parts) is referenced as a separate configuration dataset but is not specified in any document.
