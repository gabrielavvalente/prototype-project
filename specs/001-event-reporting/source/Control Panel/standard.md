# Feature 034: Standard Master Data

## Goal

Provide a governed, centrally-owned catalog of EHS Standards — extendable at Business/Country/Cluster level and activatable per site — so Safety Events, Industrial Risk (IR) Events, and related EHS processes reference a consistent set of documented methodologies and mandatory practices.

## Why

Standards (documented methodologies, minimum requirements, operating principles, or mandatory practices for managing EHS risks across the organization) must be referenced consistently during event reporting, investigations, and governance, while intermediate levels retain controlled room for scope-specific additions.

## Platform context

- Modules involved: Master Data Control Panel (H&S pillar owns the catalog; Industrial Risks Event module has access), Event Reporting (Safety Event and Industrial Risk Event modules); baseline consumers per Feature 030 mapping also include the Risk Assessment tool and PTW.
- Platform contracts reused: governed multi-level model, ownership-versus-access rules, audit trail, import/export, reporting identifiers, and the master data consumption interface defined in Feature 030 (FR-19, FR-24, FR-25).

## User stories

1. As a Global Central Team administrator, I want to provide and maintain the global Standard catalog (create, edit, activate, inactivate, retire, import/export) so that reporting consistency and the Standard taxonomy are governed centrally.
2. As a Business/Country/Cluster administrator, I want to create and maintain Standards within my own scope, and activate or inactivate Standards for my scope, so that scope-specific requirements are covered without touching global values.
3. As a Plant/Local administrator, I want to activate or inactivate the Standards applicable to my site so that users only see locally relevant Standards.
4. As a module user, I want to select one or more active Standards applicable to my scope within Safety Event or Industrial Risk Event workflows so that events are linked to the relevant EHS Standards.

## Scope

- IN: global Standard catalog; Business/Country/Cluster extensions; site-level activation/inactivation; Standard lifecycle (Active/Inactive/Retired); scope-based visibility; consumption within Safety Event and Industrial Risk Event workflows; reporting and analytics support; audit trail; import/export.
- OUT: the shared multi-level governance and access-assignment model (owned by Feature 030); plant-level creation, editing, deletion, or retirement of Standard values; the content of the Standard documents themselves (only the classification catalog is managed here); configuration of this catalog from the Industrial Risks pillar panel (Industrial Risks has access, not ownership).

## Functional requirements (EARS)

- FR-1 (was FR-STD-01): WHEN the H&S pillar control panel is provisioned THEN the system SHALL provide the global Standard catalog below, maintained by the Global Central Team.
- FR-2 (was FR-STD-02): WHEN a Business, Country, or Cluster administrator creates or edits a Standard THEN the system SHALL restrict the action to Standards owned by that administrator's organizational scope.
- FR-3 (was FR-STD-03): WHEN a Plant/Local administrator attempts to create, edit, delete, or retire a Standard THEN the system SHALL reject the action.
- FR-4 (was FR-STD-04, FR-STD-17): WHEN a Plant/Local administrator activates or inactivates an applicable Standard THEN the system SHALL apply the change to local usage at that site only.
- FR-5 (was FR-STD-10): WHEN any user attempts to modify a Standard owned by a higher governance level THEN the system SHALL reject the action.
- FR-6 (was FR-STD-05): WHEN a user views Standards THEN the system SHALL display only Standards available to the user's permissions, organizational scope, site, owner level, status, effective dates, site activation status, module context, and the requesting Event pillar's access grant.
- FR-7 (was FR-STD-07): WHEN a new record is created THEN the system SHALL offer only active Standards available to the user's scope.
- FR-8 (was FR-STD-06): WHEN a module user links Standards to a Safety Event or an Industrial Risk Event THEN the system SHALL allow one or more Standards to be associated with the event.
- FR-9 (was FR-STD-08): WHEN a Standard is inactivated or retired THEN the system SHALL keep it available for historical records, reporting, and analytics while excluding it from new records.
- FR-10 (was FR-STD-09): WHEN a Standard is created or imported with a code already existing in the same scope THEN the system SHALL reject the duplicate.
- FR-11 (was FR-STD-11): WHEN a Standard configuration change is saved THEN the system SHALL record an audit entry with what changed, previous value, new value, user, date and time, scope affected, and owner level affected.
- FR-12 (was FR-STD-12): WHEN a user initiates inactivation or retirement of a Standard THEN the system SHALL display where the Standard is currently used.
- FR-13 (was FR-STD-13): WHEN an authorized user imports or exports Standard master data THEN the system SHALL apply the user's governance level and scope to the operation.
- FR-14 (was FR-STD-16): WHEN a Standard is used for reporting across organizational levels THEN the system SHALL provide a stable identifier to ensure reporting consistency.
- FR-15 (was Validation Rules): WHEN a Standard is saved without a name, an owner level, or a valid scope THEN the system SHALL reject the save.
- FR-16 (was Data Lifecycle): WHEN a Standard status changes THEN the system SHALL manage the value through the statuses Active (available per scope and activation settings), Inactive, and Retired, with inactive and retired values excluded from new records but retained for historical records and analytics.
- FR-17: WHEN an Industrial Risks Event user or administrator views Standards THEN the system SHALL offer the same H&S-owned catalog for consumption and SHALL reject any configuration action from the Industrial Risks pillar.

### Reference data

Standard attributes: Standard code, Standard name, Description, Scope level, Scope value, Status, Owner level, Created by/date, Last updated by/date, Effective start/end date.

Inheritance model: Global Standard Catalog → Business / Country / Cluster Standard Extensions → Plant / Site Activation or Inactivation → enterprise operations platform Module Consumption.

Initial global Standard catalog:

- Confined Space Entry
- Construction Project Safety
- Control of Hazardous Energy (LOTO)
- Health & Safety Risk Assessment & Control
- Lifting Operations
- Machinery Safety
- Management of Contractors
- Management of Work Related Road Risks
- Permit to Work
- Rules for the Classification & Reporting of Safety Events
- Warehousing, Loading & Unloading
- Work at Height
- Workplace Vehicles
- Others

## Non-functional requirements

- Consistency/analytics: stable identifiers (FR-14) keep reporting consistent across organizational levels; scope-owned extensions stay linked to their owner level.
- Auditability: every configuration change is traceable (FR-11).

## Acceptance criteria (testable)

- [ ] Given a Plant/Local administrator, when they attempt to create, edit, delete, or retire a Standard, then the system rejects the action; when they toggle activation of an applicable Standard, then the change applies only to their site.
- [ ] Given a Business/Country/Cluster administrator, when they create a Standard, then it is visible only within their organizational scope; when they attempt to modify a global Standard, then the action is rejected.
- [ ] Given a module user in a Safety Event or Industrial Risk Event workflow, when the Standard list is displayed, then it contains only active Standards available to their scope and site, and the user can associate more than one Standard with the event.
- [ ] Given an Industrial Risks administrator, when they open Standards from the Industrial Risks panel, then the catalog is read-only and owned by H&S.
- [ ] Given a Standard that is inactivated or retired, when a user opens a historical record that referenced it, then the originally selected Standard is still shown, and the value is absent from the pick list of new records.
- [ ] Given an existing Standard code in a scope, when a user creates or imports another Standard with the same code in that scope, then the save is rejected.
- [ ] Given any Standard configuration change, when it is saved, then an audit entry records what changed, previous and new value, user, date/time, scope, and owner level.
- [ ] Given a Standard in use, when an administrator initiates its inactivation or retirement, then the system displays where it is currently used before confirmation.

## Dependencies

- Follows the governed multi-level model defined in Feature 030: Master Data Control Panel ([master-data-control.md](master-data-control.md)) — governance levels, ownership versus access (H&S owns; H&S and Industrial Risks Event modules access), inheritance, and the consumption interface.
- Consumed by Feature 021: Safety Event ([../safety%20event/safety-event.md](../safety%20event/safety-event.md)) and Feature 023: Industrial Risk Event ([../Industrial%20risk%20event/industrial-risk-event.md](../Industrial%20risk%20event/industrial-risk-event.md)) for linking events to Standards.

## Open questions

- [OPEN]: The condition under which Business/Country/Cluster administrators may retire Standards of their own scope ("if permitted by governance" / "when authorized") is undefined.
- [OPEN]: Source FR numbering skips FR-STD-14 and FR-STD-15; no translation-management requirement exists for Standards (unlike Hazards, Injuries, Body Parts) — confirm whether multilingual labels are required.
