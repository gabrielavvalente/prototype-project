# Feature 036: Industrial Risk Category

## Goal

Provide a governed Industrial Risk Category catalog so that plants classify Industrial Risk (IR) events consistently during reporting and review, while allowing controlled customization at Business, Country, and Cluster level.

## Why

Industrial Risk Categories classify accidental, undesired occurrences that can significantly damage site assets or disrupt business continuity, with possible consequences for people, environment, production, logistics, and customer supply. Without a central catalog, plants would classify IR events inconsistently, breaking consolidated reporting and analytics.

## Platform context

- Modules involved: Industrial Risk (IR) Event module (consumer); Industrial Risk pillar control panel (configuration).
- Platform contracts reused: governed multi-level master data model, ownership-versus-access rules of Feature 030 (this category is **owned by the Industrial Risk pillar**; H&S and Environment roles have no configuration access), audit trail, translation management, and consumption interface. IR review also consumes H&S-owned Standards and Hazards through Feature 030 access grants — those catalogs are not duplicated here.

### Reference data — category attributes

Category code, category name, description, pillar (Industrial Risk), consuming module, scope level (Group / Business / Country / Cluster / Plant usage), scope value, status, owner level, created by/date, last updated by/date, effective start/end date (if applicable), parent or source category (if inherited or extended).

### Reference data — initial global catalog (proposed baseline, to be validated by the Industrial Risk Central Team before go-live)

- IRC1 - Fire
- IRC2 - Explosion
- IRC3 - Machinery breakdown / critical equipment failure
- IRC4 - Structural failure or collapse
- IRC5 - Loss of utilities (power, gas, water, steam, compressed air, IT/OT)
- IRC6 - Hazardous material release / uncontrolled reaction
- IRC7 - Natural hazard (flood, storm, earthquake, lightning, snow load, extreme temperature)
- IRC8 - Business interruption / supply chain disruption
- IRC9 - Logistics and internal/external transport incident
- IRC10 - Security event (intrusion, theft, sabotage, malicious act)
- IRC11 - Other industrial risk

Inheritance flow:

```text
Global Industrial Risk Category Catalog
    -> Business / Country / Cluster Category Extensions
        -> Plant / Site Activation or Inactivation
            -> Industrial Risk Event Module Consumption
```

## User stories

1. As an Industrial Risk Central Team member (Corporate role), I want to provide and maintain the global Industrial Risk Category catalog (create, edit, activate, inactivate, retire, import/export, review impact before changes) so that consolidated reporting stays consistent across the group.
2. As a Business / Country / Cluster administrator of the Industrial Risk pillar, I want to create and maintain additional categories within my own scope, where allowed, so that scope-specific regulatory, insurance, or operational needs are covered without touching the global catalog.
3. As a Plant / Local administrator, I want to activate or inactivate the categories available to my site so that reporters only see the categories relevant to my plant.
4. As a module user, I want to select one or more active categories when reporting or reviewing an IR event, and use them in filters and reports, so that the nature of the industrial risk is captured consistently.

## Scope

- IN:
  - Global Industrial Risk Category catalog provided by the Industrial Risk Central Team.
  - Business, Country, or Cluster-level category extensions (where allowed by governance configuration).
  - Site-level activation or inactivation of available categories.
  - Category lifecycle management (Active / Inactive / Retired), scope-based visibility, audit trail, import/export, and consumption by the Industrial Risk Event module.
- OUT:
  - The IR workflow, severity assessment (SRP/CRP), and corrective action process — this master data only defines classification values used during IR event reporting and review.
  - Plant-level creation, editing, deletion, or retirement of categories (plants only activate/inactivate).
  - Any access via H&S or Environment pillar roles.

## Functional requirements (EARS)

Permissions per level are stated once below; the generic multi-level mechanics (inheritance, edit restrictions on higher-level values, status management, effective dates) are inherited from Feature 030.

- FR-1 (was FR-IRC-01): WHEN the Industrial Risk pillar control panel is used THEN the system SHALL provide a global Industrial Risk Category catalog created and maintained by the Industrial Risk Central Team (view all, create, edit, activate, inactivate, retire global categories, and import/export the global catalog).
- FR-2 (was FR-IRC-02): WHEN a Business, Country, or Cluster administrator of the Industrial Risk pillar works within their organizational scope and governance configuration allows extension THEN the system SHALL allow them to create, edit, activate/inactivate, retire (if allowed), and import/export (if allowed) categories of their own scope, while preventing edit, delete, or retire of Central Team categories and of categories outside their scope.
- FR-3 (was FR-IRC-03, FR-IRC-16): WHEN a Local administrator manages categories for their site THEN the system SHALL allow only activation and inactivation of available (global and applicable Business/Country/Cluster) categories, and SHALL prevent creating, editing, deleting, retiring, or creating local extensions.
- FR-4 (was FR-IRC-04): WHEN a Local administrator activates or inactivates a category for the site THEN the system SHALL apply that choice to site-level availability only.
- FR-5 (was FR-IRC-05): WHEN any user views categories THEN the system SHALL display only categories applicable to the user's organizational scope and site.
- FR-6 (was FR-IRC-06): WHEN a user reports or reviews an IR event THEN the system SHALL allow the event to be associated with one or more Industrial Risk Categories.
- FR-7 (was FR-IRC-07): WHEN a user selects categories for a new IR event record THEN the system SHALL offer only categories that are active and available for the user's site and organizational scope (based on permissions, site, scope, status, owner level, effective dates, site activation, module context, and Industrial Risk pillar context).
- FR-8 (was FR-IRC-08): WHEN a category is inactivated or retired THEN the system SHALL keep it available for historical IR event records and reporting, and historical records SHALL preserve the category value selected at reporting time.
- FR-9 (was FR-IRC-09): WHEN a category is created or imported THEN the system SHALL prevent duplicate category codes within the same scope and SHALL warn against duplicate or similar category names within the same scope.
- FR-10 (was FR-IRC-10): WHEN a user attempts to edit a category owned by a higher governance level THEN the system SHALL prevent the edit unless the user is explicitly authorized.
- FR-11 (was FR-IRC-11): WHEN any category configuration change is made THEN the system SHALL record an audit trail entry including what changed, previous value, new value, user, date and time, scope affected, and owner level affected.
- FR-12 (was FR-IRC-12): WHEN a user is about to inactivate or retire a category THEN the system SHALL show where the category is used (sites using it, existing IR event records referencing it).
- FR-13 (was FR-IRC-13): WHEN an authorized user imports Industrial Risk Category data THEN the system SHALL validate codes, names, owner level, scope, status, duplicates, and mandatory fields (code, name, owner level, scope level, and a valid scope value for Business/Country/Cluster categories) before saving changes, within the user's access rights and scope.
- FR-14 (was FR-IRC-14): WHEN the platform requires multilingual labels THEN the system SHALL support translated labels and descriptions for category values.
- FR-15 (was FR-IRC-15): WHEN a category is used in consolidated reporting, analytics, integrations, or historical analysis THEN the system SHALL support a stable reporting code or global identifier for the category, and scope-specific categories SHALL remain linked to their scope and owner level.
- FR-16 (was FR-IRC-17): WHEN access to Industrial Risk Category configuration is evaluated THEN the system SHALL grant it only through an Industrial Risk pillar role assignment; roles held in other pillars SHALL grant no access to this master data.

## Non-functional requirements

- Reporting consistency: consolidated reporting across sites, countries, businesses, clusters, and global levels; global categories preserve stable codes; scope-specific categories stay linked to scope and owner level to avoid reporting fragmentation.
- Auditability: full audit trail on all configuration changes (FR-11).
- i18n: multilingual labels and descriptions where required by the platform (FR-14).

## Acceptance criteria (testable)

- [ ] Given a Local administrator of the Industrial Risk pillar, when they open the category configuration for their site, then they can toggle activation of available categories but see no create, edit, delete, or retire actions.
- [ ] Given a Business administrator with extension rights, when they create a category in their scope, then the category is visible only within that scope and the global catalog is unchanged.
- [ ] Given a Business administrator, when they attempt to edit a global category owned by the Central Team, then the system prevents the edit.
- [ ] Given a category inactivated for a site, when a reporter creates a new IR event at that site, then the category is not selectable, while an existing IR event referencing it still displays it.
- [ ] Given a user creating a category with a code already used in the same scope, when they save, then the system rejects the duplicate code; given a similar name in the same scope, then the system warns.
- [ ] Given a Central Team user about to retire a category, when they trigger the retirement, then the system first shows the sites and IR event records using it.
- [ ] Given a user reporting an IR event, when they classify it, then they can associate one or more active in-scope categories with the event and later use them in filters and reports.
- [ ] Given a user whose only administrator role is in the H&S or Environment pillar, when they try to access Industrial Risk Category configuration, then access is denied.
- [ ] Given any configuration change, when it is saved, then an audit entry with what changed, old/new value, user, timestamp, scope, and owner level is recorded.

## Dependencies

- Follows the governed multi-level model defined in Feature 030: Master Data Control Panel ([master-data-control.md](master-data-control.md)) — governance levels, pillar-independent access assignment (Pillar → Role → Scope → Permissions), inheritance, statuses (Active/Inactive/Retired), and the module consumption interface. Deviation from the common model: **no plant-level creation or local extension** — plants may only activate/inactivate inherited categories.
- Downstream consumer: Industrial Risk (IR) Event module (Feature 023).

## Open questions

- [OPEN]: The initial global catalog (IRC1–IRC11) is a proposed baseline and must be validated by the Industrial Risk Central Team before go-live.
- [OPEN]: Ownership of the Business/Country/Cluster and Local Industrial Risk administrator roles is not confirmed at organizational level; until confirmed, extension rights at Business/Country/Cluster level should be configurable and default to disabled.
- [OPEN]: Alignment with insurance and loss-prevention reporting classifications (if any external reporting obligation exists) is to be confirmed.
