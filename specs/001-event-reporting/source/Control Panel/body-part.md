# Feature 033: Body Part Master Data

## Goal

Provide a fixed, globally-owned two-level catalog (Body Part Category → Body Part) so the affected anatomical area of a Safety Event is classified in a standardized way worldwide.

## Why

Anatomical classification underpins event review, investigation, analytics, and global consolidation; a single fixed global hierarchy prevents divergent local terminology from fragmenting reporting.

## Platform context

- Modules involved: Master Data Control Panel (H&S pillar), Event Reporting (Safety events; per the Feature 030 mapping, Body Parts are also consumed by Health events).
- Platform contracts reused: governed multi-level model (this value set uses its "fixed global list" variant), audit trail, import/export, translation management, reporting codes, and the master data consumption interface defined in Feature 030 (FR-19).

## User stories

1. As a Global Central Team administrator, I want to maintain the global Body Part Categories, Body Parts, and their hierarchy (create, edit, deactivate, retire, import/export, review impact) so that anatomical classification stays consistent and historical records remain interpretable.
2. As a Business/Country/Cluster or Plant/Local administrator, I want read-only visibility of Body Part Categories and Body Parts so that I understand what my modules consume.
3. As a module user, I want to select an active Body Part Category and then an active Body Part within it when reporting or reviewing a Safety Event so that the affected area is classified in the standard structure.

## Scope

- IN: global Body Part Category list; global Body Part list; the Category → Body Part hierarchy; lifecycle (Active/Inactive/Retired); consumption by the Safety Event module including cascading selection; audit trail; import/export.
- OUT: any Business, Country, Cluster, or Plant creation, editing, deactivation, retirement, override, or extension of Categories or Body Parts (fixed global list — lower levels do not even request additional values); the shared governance and access-assignment model (owned by Feature 030); the Body Part to Injury relationship matrix content (maintained with Feature 032).

## Functional requirements (EARS)

- FR-1 (was FR-BP-01): WHEN the H&S pillar control panel is provisioned THEN the system SHALL provide the Body Part master data as a fixed global list (initial values below) maintained exclusively by authorized Global Central Team users.
- FR-2 (was FR-BP-02): WHEN a Business, Country, Cluster, or Plant user attempts to create, edit, deactivate, retire, override, or extend a Body Part Category or Body Part THEN the system SHALL reject the action; these roles SHALL have read-only access to the configuration.
- FR-3 (was FR-BP-03, FR-BP-04): WHEN a Body Part is created or edited THEN the system SHALL require it to belong to exactly one parent Body Part Category.
- FR-4 (was FR-BP-05): WHEN a user selects a Body Part Category in the Safety Event module THEN the system SHALL display only the Body Parts linked to that category.
- FR-5 (was FR-BP-06): WHEN a new Safety Event record is created THEN the system SHALL offer only active Body Part Categories and active Body Parts.
- FR-6 (was FR-BP-07): WHEN a Body Part Category or Body Part is deactivated or retired THEN the system SHALL keep it available for historical Safety Event records and reporting while excluding it from new records.
- FR-7 (was FR-BP-08): WHEN a Body Part Category is created or imported with a name already existing in the global scope, or a Body Part with a name already existing within the same Category, THEN the system SHALL reject the duplicate.
- FR-8 (was FR-BP-09): WHEN a Body Part Category or Body Part changes THEN the system SHALL record an audit entry with what changed, previous value, new value, user, and date and time.
- FR-9 (was FR-BP-10): WHEN a Global Central Team user initiates deactivation or retirement of a Category or Body Part THEN the system SHALL show where the value is used (for example, relationship mappings with Injury values).
- FR-10 (was FR-BP-11): WHEN an authorized Global Central Team user imports Body Part master data THEN the system SHALL validate the hierarchy, duplicates, mandatory fields, and status values before saving; export SHALL be available to the same role.
- FR-11 (was FR-BP-12): WHEN the platform serves Body Part values in a user's language THEN the system SHALL provide multilingual labels and descriptions where required.
- FR-12 (was FR-BP-13): WHEN a Category or Body Part is used for analytics, integrations, or historical consistency THEN the system SHALL provide a stable reporting code or global identifier.
- FR-13 (was Validation Rules): WHEN a Category or Body Part is saved without a name, or a Body Part without a parent Category, THEN the system SHALL reject the save; WHEN a Body Part is active THEN the system SHALL require its parent Category to be active.
- FR-14 (was FR-BP-05 downstream, Module Consumption Rules): WHEN a Body Part is selected THEN the system SHALL filter the Injury list to the Injuries configured for that Body Part in the relationship matrix (see Feature 032).
- FR-15 (was Data Lifecycle): WHEN a Category or Body Part status changes THEN the system SHALL manage the value through the statuses Active, Inactive, and Retired, with retired values excluded from new records but retained for historical records and reporting.

### Reference data

Attributes (Body Part Category and Body Part): name, Description (if required), Parent Body Part Category (Body Part only), Pillar, Consuming module, Scope level, Status, Created by/date, Last updated by/date, Effective start/end date (if applicable), Reporting code or global identifier (if required), Translations (if required).

Initial Body Part Category and Body Part list:

| Category | Body Parts |
|---|---|
| Head | Cranium; Ear; Eyes; Nose; Teeth, Gingiva; Face (Other); Cervical spine; Neck |
| Torso, organs and back | Back and spine; Abdomen; Pelvis |
| Thoracic cavity | Thorax |
| Upper limbs | Whole upper limb; Shoulder; Arm (Left); Arm (Right); Elbow; Forearm (Left); Forearm (Right); Wrist |
| Hands and Fingers | Hand, Palmar and dorsal side (Left); Hand, Palmar and dorsal side (Right); Fingers |
| Lower limbs | Whole lower limb; Hip; Thigh (Left); Thigh (Right); Knee (Left); Knee (Right); Leg (Left); Leg (Right); Ankle (Left); Ankle (Right) |
| Foot(s) and toe(s) | Foot (Left); Foot (Right); Toe(s) |
| General | General |

## Non-functional requirements

- Consistency/analytics: one fixed global hierarchy with stable reporting codes guarantees consolidated classification across countries, businesses, clusters, and plants; historical records remain interpretable after values are retired.
- Auditability: all changes to Categories and Body Parts are traceable (FR-8).
- i18n: multilingual labels/descriptions per platform translation mechanism (FR-11).

## Acceptance criteria (testable)

- [ ] Given a Business/Country/Cluster or Plant administrator, when they open the Body Part configuration, then Categories and Body Parts are visible read-only and every create/edit/deactivate/retire/extend action is rejected.
- [ ] Given a reporter who selected a Body Part Category, when the Body Part list is displayed, then it contains only active Body Parts belonging to that Category; after selecting a Body Part, the Injury list is filtered per the relationship matrix.
- [ ] Given a Body Part created without a parent Category, when it is saved, then the system rejects the save; a Body Part cannot be active while its parent Category is inactive or retired.
- [ ] Given an existing Category name in the global scope, or an existing Body Part name within the same Category, when a duplicate is created or imported, then the save is rejected.
- [ ] Given a deactivated or retired Category or Body Part, when a historical Safety Event referencing it is opened, then the value is still shown, and it does not appear in the pick lists for new events.
- [ ] Given any change to a Category or Body Part, when it is saved, then an audit entry records what changed, previous and new value, user, and date/time.

## Dependencies

- Follows the governed multi-level model defined in Feature 030: Master Data Control Panel ([master-data-control.md](master-data-control.md)); this value set applies the "fixed global list, no local creation" variant.
- Feature 032: Injury Master Data ([injury.md](injury.md)) depends on this catalog — the shared Body Part to Injury relationship matrix drives Injury filtering.
- Consumed by Feature 021: Safety Event ([../safety%20event/safety-event.md](../safety%20event/safety-event.md)).

## Open questions

- [OPEN]: The source states Body Part selection applies "depending on [the event] level" — which Safety Event levels require Body Part selection is not defined here.
- [OPEN]: The Feature 030 mapping lists Body Parts as consumed by both Safety and Health events, while this specification covers only the Safety Event module — Health event consumption rules need alignment.
