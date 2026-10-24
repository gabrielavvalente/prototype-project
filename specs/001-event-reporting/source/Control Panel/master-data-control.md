# Feature 030: Master Data Control Panel

## Goal

Give authorized business users one centralized, pillar-based control panel to configure, govern, and maintain the master data consumed by all enterprise operations platform modules, instead of configuring the same data separately inside each module.

## Why

Module-by-module configuration forces the same data to be set up multiple times, drifts inconsistent between modules of the same operational excellence framework pillar, leaves no clear governance model for central, business, country, and plant teams, drags product and development teams into routine configuration changes, breaks consolidated reporting when modules use different values for the same concept, and gives local teams no controlled flexibility. A shared, governed, reusable master data model removes all of this.

## Platform context

- Modules involved: Master Data Control Panel (one panel per pillar — Health & Safety, Environment, Industrial Risks; future pillars such as Reliability or Quality follow the same model) and the consuming enterprise operations platform modules: Event Reporting (Safety, Health, Environment, Industrial Risk events), Risk Assessment tool, behavior observation program, PTW.
- Platform contracts reused:
  - Organizational structure (business, country, cluster, plant) and user accounts are mastered upstream in the platform master data service and are consumed, not replicated. Role assignments attach to user identities from that source; the control panel maintains no duplicate plant hierarchy or user store.
  - Platform translation mechanism for multilingual labels and descriptions.
  - Stable reporting codes for enterprise dashboards and external/group reporting systems (for example External Reporting Platform for safety event reporting, when activated).
- Design principles: configure once, reuse across modules; configuration is **by pillar, not by module** (the same job sites do today per module, moved to the pillar); each pillar holds the master data related to it; if a module needs that master data, it consumes it from that pillar and does not keep a second copy; split between **ownership** and **access**; global consistency with local flexibility; clear ownership (every value shows its owner level and scope); no development dependency for standard configuration changes; reporting and analytics readiness (parent-child links between global and local values preserved).
- Alignment (workshop contributor): one control panel per pillar; related master data lives in that panel; modules that need a catalog use it from the owning pillar.

### Event types by pillar

Each Event type belongs to exactly one Event pillar. The reporter and reviewer work in that pillar's event; the lists they pick from come from the catalogs attached below.

| Event pillar | Event types in Event Reporting | Families / levels |
|---|---|---|
| Health & Safety (H&S) | Safety Event; Health Event | TF1–TF5; Occupational Illness (OH) |
| Environment | Environment Event | EvE1–EvE5 |
| Industrial Risks | Industrial Risk Event (IR) | SRE1–SRE5 |

### Which master data is attached to which pillar

The **owning pillar** holds and configures the catalog. Any **module or Event type** that needs the values consumes them from that pillar. Consumption is not a second catalog and does not grant configuration rights.

| Owning pillar | Master data | Event types that consume it | Other modules that consume it |
|---|---|---|---|
| H&S | Standards | Safety Event; Industrial Risk Event (IR) | Risk Assessment tool; PTW |
| H&S | Hazards | Safety Event; Industrial Risk Event (IR) | Risk Assessment tool; PTW |
| H&S | Body Parts | Safety Event; Health Event | — |
| H&S | Injuries | Safety Event | — |
| H&S | Risks, Diseases, PPEs, Means of Control, Observation Categories | Health Event (Diseases); others to be confirmed | Risk Assessment tool; PTW; behavior observation program |
| Environment | Environmental Aspects and Impacts | Environment Event | Risk Assessment tool |
| Industrial Risks | Industrial Risk Categories | Industrial Risk Event (IR) | — |
| Platform-level (outside pillar panels) | Shared Contractor Directory | Safety, Health, Environment, and Industrial Risk Events | Other enterprise operations platform modules that reference an external person |

H&S catalogs used by IR (Standards, Hazards) stay in the H&S panel. The Industrial Risks Event module consumes them; the Industrial Risks administrator does not configure them.

### Ownership versus access

Configuration rights stay with the owning pillar. Access is the right of an Event pillar to see the category in its control panel (read-only when it does not own it) and of that pillar's Event module — and any other declared consuming module — to pick the values at reporting time. Access never grants create, edit, deactivate, retire, import, or governance-model changes on another pillar's catalog.

| Concept | Meaning |
|---|---|
| Owning pillar | Holds the catalog in its control panel and configures it (create, edit, activate/deactivate, retire, import/export, governance model). Exactly one owner per category; platform-level for shared directories. |
| Accessing pillars / consuming modules | See the category (read-only if they do not own it) and consume its active in-scope values. One, several, or every Event pillar; plus other enterprise operations platform modules named in the mapping. |

Specific master data with **all-pillar consumption** (H&S, Environment, and Industrial Risks all use it): the Shared Contractor Directory. Specific master data with **cross-pillar consumption**: Standards and Hazards (owned by H&S; consumed by Safety Events and by Industrial Risk Events). Pillar-specific catalogs remain single-owner (Body Parts and Injuries for H&S; Aspects and Impacts for Environment; Industrial Risk Categories for Industrial Risks).

### Reference data model

Each master data item carries at least: Name; Description; Master data category; Owning pillar; Accessing Event pillar(s); Applicable module(s); Scope level (Group, Business, Country, Cluster, or Plant); Scope value (for example business name, country, region, cluster, or plant); Status (Active, Inactive, Retired — see [OPEN] on Draft); Owner level; Created by / date; Last updated by / date; Effective start/end date, if relevant; Parent or source value, if inherited or extended; Reporting code or global identifier, if required; Translations, if required.

### Governance model (owned by this feature)

Three governance levels, applied per pillar:

1. **Central / Group** — owns the global standard values; defines per category whether values are mandatory across all scopes, may be deactivated by lower levels, or may be extended by lower levels; reviews local/country requests.
2. **Business / Country / Cluster** — intermediate governance for a defined perimeter (country regulatory values, business operational categories, regional terminology, cluster standards); extensions stay linked to their source, scope, and parent category so global reporting consistency is preserved.
3. **Plant / Local** — operational flexibility per site: use inherited values only, activate/deactivate inherited values, or add local values, depending on the category's governance model.

The control panel is **per pillar**, not per module. Inside a pillar, the same three-level hierarchy applies as today, and roles are assigned on that pillar only.

Configuration assignments follow **Owning Pillar → Role Type → Plant(s) → Permissions**: an assignment in one pillar grants no configuration rights in any other pillar (administering two pillars requires two assignments). Consumption is independent of that chain: it follows the pillar-to-catalog mapping and FR-24. Role types are Corporate (global governance), Business/Region/Cluster (scope-limited extension and activation), and Local Plant (site-level activation/inactivation); the plant set is all plants for Corporate, the perimeter's plants for Business/Region/Cluster, or one or more named plants for Local. Governance owners per pillar:

| Pillar | Corporate role | Business/Country/Cluster role | Local role |
|---|---|---|---|
| H&S | H&S / EHS Central Team | EHS Business (e.g. Glass, Business Unit B) and EHS Head per country | Local/Plant EHS |
| Environment | H&S, Env, Ind Risk Central Team | EHS Business / EHS Head per country | Local/Plant EHS |
| Industrial Risks | Ind Risk Central Team | Business Ind Risk (to be confirmed) | Local Ind Risk (to be confirmed) |

Per-category governance models (set by the Product/Platform administrator): global fixed list; global list with local activation/deactivation; global list with business/country extensions; global list with plant extensions; fully local configuration.

Example governance by data type (indicative, to be validated with business owners — see Open questions):

| Master Data Type | Suggested Governance | Local Flexibility |
|---|---|---|
| Safety Standards | Managed by Central / Group | Local teams may select or deactivate where allowed |
| Hazards | Centrally managed list with controlled exceptions | Country or local additions may require approval |
| Body parts | Fixed global list | No local creation |
| Injuries | Fixed global list | No local creation |
| PPE categories | Global list with possible business/country extensions | Local extension only if explicitly allowed |
| Means of control | Global list with controlled local extensions | Business/country or plant additions may be allowed |
| Workflow types and levels | Defined by governance level according to process need | Local additions may be restricted depending on reporting impact |

## User stories

1. As a Central / Group Master Data Administrator, I want to create, update, deactivate, and retire global values and define per category what lower levels may deactivate or extend, so that the platform keeps one consistent global standard.
2. As a Business / Country / Cluster Master Data Administrator, I want to view central data and add or activate/deactivate values for my perimeter where allowed, so that business, country, or cluster legal and operational needs are covered without breaking global consistency.
3. As a Plant / Local Administrator, I want to activate/deactivate inherited values and add plant-specific values only where local creation is permitted (and request new values where it is not), so that my site's operational needs are met under control.
4. As a Module User, I want module forms, workflows, filters, and reports to offer only the active values applicable to my site, pillar, and module context, so that I never pick an invalid or out-of-scope value.
5. As a Product / Platform Administrator, I want to define which modules connect to each pillar, which categories each pillar/module requires, each category's owning pillar, which Event pillars have access, and each category's governance model, so that governance rules are enforced without me maintaining the data itself.
6. As a pillar administrator in the Event module, I want my pillar control panel to show both the catalogs my pillar owns and the specific shared master data my Event module is granted access to, so that I can use those values without duplicating another pillar's catalog.

## Scope

- IN: pillar-level master data configuration with a common entry point and a separate control panel per pillar; the Event-type-to-pillar and master-data-to-pillar mapping; reuse of configured data by multiple modules (a module consumes from the owning pillar, it does not reconfigure); ownership versus access (one owning pillar, declared accessing Event pillars, including all-pillar consumption for specific shared catalogs); the three governance levels; role- and scope-based access management per pillar; creation, update, activation, deactivation, and retirement of values; inheritance from higher to lower levels; controlled local extensions; audit trail; visibility of data origin and scope; duplicate/validity checks; effective date management; impact visibility before changes; import/export; translations; consumption interface for modules.
- OUT: detailed technical architecture; database schema design; API contract specification; migration strategy from legacy tools; final list of all operational excellence framework pillars; final list of all master data objects by pillar; detailed UI mockups; detailed permission matrix per named user; configuration rights on another pillar's owned catalog; authentication, SSO, MFA, session management, password storage, and account-lock propagation. The Shared Contractor Directory is governed outside the pillar control panels (platform-level reference data) though every Event pillar has access to it and it follows the same single-sourcing, scope-visibility, and audit principles.

## Functional requirements (EARS)

Navigation and structure

- FR-1: WHEN a user opens the master data entry point THEN the system SHALL present a separate control panel per pillar (H&S, Environment, Industrial Risks, and future pillars) and SHALL assign each master data category to exactly one owning pillar (or to platform-level for shared directories). (was FR-01/FR-17)
- FR-2: WHEN a user selects a pillar they have access to THEN the system SHALL display every master data category that pillar owns and every category that pillar is granted access to, together with the owning pillar, the enterprise operations platform modules consuming each category, and the governance model of each category. (was FR-02/FR-03)

Access and governance

- FR-3: WHEN an administrator assignment is created THEN the system SHALL derive configuration permissions from Owning Pillar → Role Type (Corporate / Business-Region-Cluster / Local Plant) → Plant(s), and an assignment in one pillar SHALL grant no configuration rights in any other pillar. (was FR-18)
- FR-4: WHEN a user performs a configuration action (create, edit, deactivate, reactivate, retire, approve, reject, export, import) THEN the system SHALL authorize it against the user's role type and organizational scope within the owning pillar; WHEN a user views a category THEN the system SHALL allow it if the user's Event pillar owns the category or is granted access to it. (was 12.1/12.2)
- FR-5: WHEN a Central / Group administrator configures a category THEN the system SHALL let them define whether its values are mandatory across all scopes, deactivatable by lower levels, and extendable by lower levels. (was 8.1)
- FR-6: WHEN a lower level attempts to create a value THEN the system SHALL allow it only if the category's governance model permits extension at that level. (was FR-06)
- FR-7: WHEN a user attempts to edit a value owned by a higher governance level THEN the system SHALL reject the edit unless explicitly authorized. (was FR-08)
- FR-8: WHEN a Product / Platform administrator configures the platform THEN the system SHALL let them define module-to-pillar connections, the categories required per pillar and module, each category's owning pillar, the Event pillars that have access to the category (including an all-pillar access setting), and each category's governance model (global fixed / global with local activation / global with business-country extensions / global with plant extensions / fully local). (was 7.5/12.3)

Value lifecycle

- FR-9: WHEN a value is active at a higher level THEN lower levels SHALL inherit it according to scope and applicability rules. (was FR-05)
- FR-10: WHEN an authorized user activates or deactivates a value for their scope THEN the system SHALL apply the change only where the category's governance model allows it. (was FR-07)
- FR-11: WHEN a value is created or edited THEN the system SHALL prevent, or warn against, duplicate values within the same pillar, category, and scope, and SHALL validate the value against the category's rules. (was FR-10)
- FR-12: WHEN a value changes status THEN the system SHALL manage it through the lifecycle Active → Inactive → Retired. (was FR-11)
- FR-13: WHEN a value is retired THEN the system SHALL exclude it from selection in new records while keeping it available for historical records and reporting. (was Section 15)
- FR-14: WHEN effective start or end dates are set on a value THEN the system SHALL apply them when determining the value's availability. (was FR-12)
- FR-15: WHEN a user initiates a change, deactivation, or retirement THEN the system SHALL show where the value is used (consuming modules, active workflows, existing records, reports/dashboards, sites or scopes). (was FR-15)

Audit, import/export, translations

- FR-16: WHEN any master data change is made THEN the system SHALL record in the audit trail what changed, the previous and new value, the user, the date and time, and the scope affected. (was FR-09)
- FR-17: WHEN an authorized administrator imports master data THEN the system SHALL validate the file before saving any change; WHEN an authorized administrator requests an export THEN the system SHALL export the values within their scope. (was FR-14)
- FR-18: WHEN a value has translated labels or descriptions THEN the system SHALL serve them to modules in the user's language through the platform translation mechanism. (was FR-13/16.3)

Consumption by modules

- FR-19: WHEN a module requests master data THEN the system SHALL serve it through a consumption interface that applies user permissions, organizational scope, module context, the requesting Event pillar's access grant on the category, status, effective dates, and applicability rules (site, country, business, user role) at read time, so that modules maintain no local copies and never expose inactive, out-of-scope, or non-applicable values. (was FR-16/FR-19, Section 11)
- FR-20: WHEN master data changes after a module record was created THEN the record SHALL preserve the value as selected at reporting time. (was 16.2)
- FR-21: WHEN a scope value or user identity is needed THEN the system SHALL reference the organizational structure and user identities synced from the platform master data service rather than a local copy. (was 16.1)
- FR-22: WHEN a value participates in reporting THEN it SHALL carry a stable reporting code so that consolidation across plants, countries, businesses, and pillars — and mapping to external reporting systems — survives renames, inactivations, and retirements. (was 16.4)
- FR-23: WHEN the Risk Assessment tool references Hazards, Risks, Standards, or Environmental Aspects/Impacts THEN it SHALL consume the same values configured in the pillar control panels, so that events flagged as risk-assessment gaps carry consistent classification. (was 16.5)
- FR-24: WHEN a master data category is defined THEN the system SHALL record exactly one owning pillar (or platform-level) and a declared set of accessing Event pillars; WHEN the category is set to all-pillar access THEN the system SHALL grant access to every Event pillar (H&S, Environment, Industrial Risks, and future Event pillars).
- FR-25: WHEN a user opens a pillar control panel THEN the system SHALL offer configuration actions only on categories that pillar owns, and SHALL present accessed-but-not-owned categories as read-only with their owning pillar visible; access SHALL NOT grant create, edit, deactivate, retire, import, or governance changes on another pillar's catalog.

## Non-functional requirements

- Security: role- and scope-based access control per pillar; no duplicate user store or plant hierarchy. Authentication, SSO and session management are not specified in Event Reporting.
- i18n: multilingual labels and descriptions served from the same translation source as the rest of the platform.
- Observability / auditability: complete audit trail of all configuration changes (FR-16).
- Data quality / reporting: no uncontrolled duplication; parent-child relationships between global and local values preserved; stable reporting codes for historical trend analysis.

## Acceptance criteria (testable)

- [ ] Given a user with an H&S pillar assignment only, when they open the control panel, then they can manage H&S-owned categories and have no configuration access to Environment-owned or Industrial Risks-owned catalogs.
- [ ] Given the Event-type-to-pillar mapping, when a Safety or Health Event is opened, then it is an H&S event; when an Environment Event is opened, then it is an Environment event; when an Industrial Risk (IR) Event is opened, then it is an Industrial Risks event.
- [ ] Given a catalog in the mapping table, when an Event type listed as a consumer needs a value, then the list comes from the owning pillar and no second catalog is created for that Event type.
- [ ] Given a category owned by two consuming modules of one pillar, when a value is configured once for that pillar, then both modules offer the value without any second setup.
- [ ] Given the Shared Contractor Directory (all-pillar access), when an H&S, Environment, or Industrial Risks Event user needs an external person, then each pillar can search and select the same directory without a second catalog.
- [ ] Given Standards and Hazards owned by H&S, when an Industrial Risks Event reviewer opens Standard Associated or Hazard Associated, then the lists are the H&S catalogs (active, in-scope values only) and the Industrial Risks administrator cannot edit those catalogs from the Industrial Risks panel.
- [ ] Given a category the selected pillar can access but does not own, when the administrator opens that category in their panel, then it is read-only and the owning pillar is visible.
- [ ] Given a global value created by the Central / Group administrator, when a plant in scope opens its panel, then the value appears as inherited with its origin (Group) and scope visible.
- [ ] Given a category that does not allow plant extension, when a Plant / Local administrator tries to create a value, then the creation is refused and they can instead request a new value.
- [ ] Given a value owned by Group level, when a country administrator tries to edit it without explicit authorization, then the edit is rejected.
- [ ] Given an existing value in a pillar/category/scope, when an administrator creates a value with the same name in that pillar/category/scope, then the system prevents or warns about the duplicate.
- [ ] Given an Active value used by existing event records, when it is retired, then it no longer appears in new-record forms but remains on historical records and in reports.
- [ ] Given a value about to be deactivated, when the administrator initiates the deactivation, then the system first shows the consuming modules, records, and scopes using it.
- [ ] Given any create/edit/status change, when it is saved, then the audit trail shows what changed, previous and new value, user, date/time, and scope.
- [ ] Given an import file containing an invalid value, when an administrator imports it, then validation rejects the invalid rows before anything is saved.
- [ ] Given a module user at a given plant, when they open a module form, then the list offers only values that are Active, in scope for their site, within effective dates, and applicable to a category their Event pillar has access to.
- [ ] Given an event recorded with value X, when X is later renamed or retired, then the historical record still shows the value as selected at reporting time.

## Dependencies

- Upstream: the platform master data service for organizational structure and user identities.
- Downstream consumers: Event Reporting ([Feature 021](../safety%20event/safety-event.md), [Feature 022](../Health%20event/health-event.md), [Feature 023](../Industrial%20risk%20event/industrial-risk-event.md), [Feature 024](../environement%20event/environment-event.md)), Risk Assessment tool, behavior observation program, PTW; external reporting (External Reporting Platform) via reporting codes.
- [Feature 040: Role Management](../role-management/role-management.md) — the administrator roles here are distinct from the event lifecycle roles (User, Reviewer, Investigator, Admin); a user may hold roles in both systems, neither implies the other.
- Value set specifications governed under this model (they inherit the governance, lifecycle, inheritance, audit, import/export, and translation rules defined here and spec only their deltas):

| Owning pillar | Category | Accessing Event pillars | Spec | Baseline consuming modules |
|---|---|---|---|---|
| H&S | Standards | H&S, Industrial Risks | [standard.md](standard.md) | Event Reporting (Safety and IR events), Risk Assessment tool, PTW |
| H&S | Hazards | H&S, Industrial Risks | [hazard.md](hazard.md) | Event Reporting (Safety and IR events), Risk Assessment tool, PTW |
| H&S | Body Parts | H&S | [body-part.md](body-part.md) | Event Reporting (Safety and Health events) |
| H&S | Injuries | H&S | [injury.md](injury.md) | Event Reporting (Safety events) |
| H&S | Risks, Diseases, PPEs, Means of Control, Observation Categories | H&S | To be specified | Risk Assessment tool, PTW, Event Reporting (Health), behavior observation program |
| Environment | Environmental Aspects and Impacts | Environment | [aspect-impact.md](aspect-impact.md) | Event Reporting (Environmental events), Risk Assessment tool |
| Industrial Risks | Industrial Risk Categories | Industrial Risks | [industrial-risk-category.md](industrial-risk-category.md) | Event Reporting (IR events) |
| Platform-level (outside pillar panels) | Shared Contractor Directory | All Event pillars (H&S, Environment, Industrial Risks) | [contractors-directory.md](contractors-directory.md) | Event Reporting (every pillar) and other enterprise operations platform modules |

## Open questions

- [OPEN]: Confirm approved neutral labels for the upstream master data service.
- [OPEN]: Industrial Risk governance ownership — the Business/Country/Cluster and Local administrator roles for the Industrial Risks pillar are not confirmed; until then, extension rights below Corporate for this pillar default to disabled.
- [OPEN]: Risks, PPEs, Means of Control, Observation Categories, and Diseases are confirmed in scope but have no detailed specification document yet.
- [OPEN]: The Aspects & Impacts document is a catalog; it does not yet define governance, access control, FRs, and lifecycle at the depth of the Hazard/Standard/Body Part/Injury specs and should be extended to the common template.
- [OPEN]: The Hazard and Standard specs are titled as "Safety Event Module" master data; under the pillar model they are H&S-owned catalogs accessed by Safety and IR Event modules — titles to align in a future revision.
- [OPEN]: Confirm whether the Environment Event module also needs access to Standards and Hazards (today those fields are specified for Safety and IR only).
- [OPEN]: Confirm the full list of all-pillar-access categories beyond the Shared Contractor Directory (for example invalidation reasons, immediate-action lists, HPR types).
- [OPEN]: Workflow configuration values are managed per pillar alongside master data, but no detailed workflow configuration specification (stage mandatoriness per event level, per governance level) exists yet.
- [OPEN]: The reference data model lists a Draft status while the lifecycle defines Active/Inactive/Retired — confirm whether Draft is part of the value lifecycle.
- [OPEN]: The example governance-by-data-type table is indicative only and must be validated with business owners.
