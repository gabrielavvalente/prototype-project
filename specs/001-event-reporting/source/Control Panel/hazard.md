# Feature 031: Hazard Master Data

## Goal

Provide a governed, centrally-owned Hazard catalog — extendable at Business/Country/Cluster level and activatable per site — so Safety Events and Industrial Risk (IR) Events are classified against a consistent list of potential sources of harm.

## Why

Hazards (anything with the potential to cause injury, illness, environmental damage, property damage, process disruption, or unsafe conditions) must be classified consistently to support event review and consolidated reporting, while Businesses, Countries, and Clusters still need controlled room for regulatory or operational additions.

## Platform context

- Modules involved: Master Data Control Panel (H&S pillar owns the catalog; Industrial Risks Event module has access), Event Reporting (Safety Event and Industrial Risk Event modules); baseline consumers per Feature 030 mapping also include the Risk Assessment tool and PTW.
- Platform contracts reused: governed multi-level model, ownership-versus-access rules, audit trail, import/export, translation management, reporting codes, and the master data consumption interface defined in Feature 030 (FR-19, FR-24, FR-25).

## User stories

1. As a Global Central Team administrator, I want to provide and maintain the global Hazard catalog (create, edit, activate, inactivate, retire, import/export, review impact) so that consolidated reporting stays consistent.
2. As a Business/Country/Cluster administrator, I want to create and maintain Hazards within my own scope, and activate or inactivate Hazards for my scope, so that local regulatory, business, or operational needs are covered without touching global values.
3. As a Plant/Local administrator, I want to activate or inactivate the Hazards available to my site so that reporters only see locally relevant values.
4. As a module user, I want to select one or more active Hazards applicable to my site when reporting or reviewing a Safety Event or an Industrial Risk Event so that the event is correctly classified.

## Scope

- IN: global Hazard catalog; Business/Country/Cluster extensions; site-level activation/inactivation; Hazard lifecycle (Active/Inactive/Retired); scope-based visibility; consumption by the Safety Event and Industrial Risk Event modules; audit trail; import/export.
- OUT: investigation workflow and corrective action process (Hazards are classification values only); the shared multi-level governance and access-assignment model (owned by Feature 030); plant-level creation, editing, deletion, or retirement of Hazard values; local (plant) extensions; configuration of this catalog from the Industrial Risks pillar panel (Industrial Risks has access, not ownership).

## Functional requirements (EARS)

- FR-1 (was FR-HAZ-01): WHEN the H&S pillar control panel is provisioned THEN the system SHALL provide the global Hazard catalog below, created and maintained by the Global Central Team.
- FR-2 (was FR-HAZ-02): WHEN a Business, Country, or Cluster administrator creates or edits a Hazard THEN the system SHALL restrict the action to Hazards owned by that administrator's organizational scope.
- FR-3 (was FR-HAZ-03): WHEN a Plant/Local administrator attempts to create, edit, delete, or retire a Hazard value THEN the system SHALL reject the action.
- FR-4 (was FR-HAZ-04, FR-HAZ-16): WHEN a Plant/Local administrator activates or inactivates an available Hazard THEN the system SHALL apply the change to that site only.
- FR-5 (was FR-HAZ-10): WHEN any user attempts to edit, delete, or retire a Hazard owned by a higher governance level THEN the system SHALL reject the action unless explicitly authorized.
- FR-6 (was FR-HAZ-05): WHEN a user views Hazards THEN the system SHALL display only Hazards applicable to the user's permissions, site, organizational scope, status, owner level, effective dates, site activation, module context, and the requesting Event pillar's access grant.
- FR-7 (was FR-HAZ-07): WHEN a module user creates a new Safety Event or Industrial Risk Event record THEN the system SHALL offer only active Hazards available to the user's site and organizational scope.
- FR-8 (was FR-HAZ-06): WHEN a module user classifies a Safety Event or an Industrial Risk Event THEN the system SHALL allow one or more Hazards to be associated with the event.
- FR-9 (was FR-HAZ-08): WHEN a Hazard is inactivated or retired THEN the system SHALL keep it available for historical Safety Event and Industrial Risk Event records and reporting, preserving the value selected at reporting time.
- FR-10 (was FR-HAZ-09): WHEN a Hazard is created or imported with a code already existing in the same scope THEN the system SHALL reject the duplicate; WHEN a duplicate or similar Hazard name exists in the same scope THEN the system SHALL warn the user.
- FR-11 (was FR-HAZ-11): WHEN a Hazard configuration change is saved THEN the system SHALL record an audit entry with what changed, previous value, new value, user, date and time, scope affected, and owner level affected.
- FR-12 (was FR-HAZ-12): WHEN a user initiates inactivation or retirement of a Hazard THEN the system SHALL show where the Hazard is used (for example, sites using it).
- FR-13 (was FR-HAZ-13): WHEN an authorized user imports Hazard data THEN the system SHALL validate codes, names, owner level, scope, status, duplicates, and mandatory fields before saving; WHEN an authorized user requests export THEN the system SHALL export according to the user's access rights and scope.
- FR-14 (was FR-HAZ-14): WHEN the platform serves Hazard values in a user's language THEN the system SHALL provide multilingual labels and descriptions where required.
- FR-15 (was FR-HAZ-15): WHEN a Hazard value is used for consolidated reporting, analytics, or integrations THEN the system SHALL provide a stable reporting code or global identifier.
- FR-16 (was Validation Rules): WHEN a Hazard is saved without a code, name, owner level, or scope level, or a Business/Country/Cluster Hazard is saved without a valid scope value, THEN the system SHALL reject the save.
- FR-17 (was Data Lifecycle): WHEN a Hazard status changes THEN the system SHALL manage the value through the statuses Active (usable per scope and site activation), Inactive (unavailable for new records in the relevant scope or site), and Retired (unavailable for new records everywhere), all remaining available for historical records.
- FR-18: WHEN an Industrial Risks Event user or administrator views Hazards THEN the system SHALL offer the same H&S-owned catalog for consumption and SHALL reject any configuration action from the Industrial Risks pillar.

### Reference data

Hazard attributes: Hazard code, Hazard name, Owning pillar (H&S), Accessing Event pillars (H&S, Industrial Risks), Consuming module, Scope level (Group / Business / Country / Cluster / Plant usage), Scope value, Status, Owner level, Created by/date, Last updated by/date, Effective start/end date (if applicable), Parent or source Hazard (if inherited or extended).

Inheritance model: Global Hazard Catalog → Business / Country / Cluster Hazard Extensions → Plant / Site Activation or Inactivation → Safety Event Module Consumption.

Initial global Hazard catalog:

- A1 - Manual handling of loads
- A2 - Awkward position
- A3 - Repetitive work
- A4 - Night work
- A5 - Successive team shifts
- A6 - Isolated work
- A7 - Stress related to work
- B1 - Toxic agents (Safety aspects)
- B2 - Biological and bacteriological agents
- C1 - Vibrations
- C2 - Noise
- C3 - Temperature
- C4 - Light
- C5 - Radiation
- C6 - Working environment
- C7 - Atmospheric pressure
- D1 - Falls on the same level
- D2 - Falls from a height
- D3 - Falling objects
- E1 - Electricity
- E2 - Fire, explosion (Material or substance which can generate...)
- F1 - Shearing, cutting (Equipment or product which can generate...)
- F2 - Pinched, crushed by (Equipment or product which can generate...)
- F3 - Lifting by, rolling by, moving by (Equipment which can generate...)
- F4 - Struck (Moving area, equipment or product which can generate...)
- F5 - Perforation or shot/sting (Equipment or product which can generate...)
- F6 - Rubbing or abrasion (Equipment or product which can generate...)
- F7 - Ejection, objects shatter (Equipment or product which can generate...)
- F8 - Burn, heating (Equipment or product which can generate...)
- G1 - Internal transportation - on-site
- G2 - External transportation - off organization site
- H1 - Physical attack
- H2 - Natural risks
- H3 - Animals
- H4 - Technological risks
- I1 - Other hazards

## Non-functional requirements

- Consistency/analytics: global Hazards keep stable codes; scope-specific Hazards stay linked to their scope and owner level to avoid reporting fragmentation across sites, countries, businesses, clusters, and global levels.
- Auditability: every configuration change is traceable (FR-11).
- i18n: multilingual labels/descriptions per platform translation mechanism (FR-14).

## Acceptance criteria (testable)

- [ ] Given a Plant/Local administrator, when they attempt to create, edit, delete, or retire a Hazard, then the system rejects the action; when they toggle activation of an available Hazard, then the change applies only to their site.
- [ ] Given a Business/Country/Cluster administrator, when they create a Hazard, then it is visible only within their organizational scope; when they attempt to edit a global Hazard, then the action is rejected.
- [ ] Given a module user reporting a Safety Event or an Industrial Risk Event, when the Hazard list is displayed, then it contains only active Hazards applicable to the user's site and scope, and the user can associate more than one Hazard with the event.
- [ ] Given an Industrial Risks administrator, when they open Hazards from the Industrial Risks panel, then the catalog is read-only and owned by H&S.
- [ ] Given a Hazard that is inactivated or retired, when a user opens a historical Safety Event that referenced it, then the originally selected Hazard value is still shown, and the value is absent from the pick list of new events.
- [ ] Given an existing Hazard code in a scope, when a user creates or imports another Hazard with the same code in that scope, then the save is rejected; a similar name in the same scope produces a warning.
- [ ] Given any Hazard configuration change, when it is saved, then an audit entry records what changed, previous and new value, user, date/time, scope, and owner level.
- [ ] Given a Hazard in use by sites, when an administrator initiates its inactivation or retirement, then the system shows where the Hazard is used before confirmation.

## Dependencies

- Follows the governed multi-level model defined in Feature 030: Master Data Control Panel ([master-data-control.md](master-data-control.md)) — governance levels, ownership versus access (H&S owns; H&S and Industrial Risks Event modules access), inheritance, and the consumption interface.
- Consumed by Feature 021: Safety Event ([../safety%20event/safety-event.md](../safety%20event/safety-event.md)) and Feature 023: Industrial Risk Event ([../Industrial%20risk%20event/industrial-risk-event.md](../Industrial%20risk%20event/industrial-risk-event.md)) for event classification.

## Open questions

- [OPEN]: Whether Business/Country/Cluster Hazard additions require Central approval (Feature 030 example governance table says additions "may require approval") is not confirmed.
- [OPEN]: The condition under which Business/Country/Cluster administrators may retire Hazards of their own scope ("if allowed by governance rules") is undefined.
