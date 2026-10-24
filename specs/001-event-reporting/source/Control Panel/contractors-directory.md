# Feature 035: Contractors Directory

## Goal

Provide a single, shared directory of external individuals (contractors, temporary workers and other external personnel) so that every enterprise operations platform module references the same person record instead of re-creating it.

## Why

When each module manages external people independently, the same person is created several times with different names, companies, or classifications — causing duplication, inconsistent reporting, and extra maintenance effort for local teams. A centralized directory acts as the single source of truth for reusable external-person master data.

## Platform context

- Modules involved: Shared Contractor Directory (platform-level reference data); initial consumers are Event Reporting (events involving an external individual) and Reports (aggregation, filtering, and analysis of contractor-related data). Additional enterprise operations platform modules may consume it in the future.
- Platform contracts reused: platform role-based access control; single-sourcing, scope-based visibility, and audit-trail principles of the Master Data Control Panel (Feature 030). Unlike pillar-owned master data, the directory is governed **outside** the pillar control panels — it is platform-level reference data with **all-pillar access**: every Event pillar (H&S, Environment, Industrial Risks) may search and select the same records.

### Reference data — minimum record structure

| Field | Notes |
|---|---|
| First name | |
| Last name | |
| Email address | |
| External person type | Temporary worker / Permanent contractor / Contractor other than permanent / Other |
| Company, agency, or organization name | Captured consistently |
| Attachment or supporting document | |
| Additional comments or notes | |
| Status | Active / Inactive |
| Unique system identifier | |

## User stories

1. As an authorized directory user, I want to create and update external person records in one central place so that the same person is maintained once and reused across modules.
2. As an authorized directory user, I want to deactivate an external person record so that it can no longer be selected while remaining referenced in existing records.
3. As a consuming module user in any Event pillar (H&S, Environment, or Industrial Risks), I want to search and select an existing external person when my business process requires it, without needing permission to manage the directory itself.
4. As a report consumer, I want events and reports to reference the same external person record so that aggregation, filtering, and analysis on contractors are consistent and free of duplicates.

## Scope

- IN:
  - One central directory of external individuals: temporary workers, permanent contractors, contractors other than permanent, and other external personnel.
  - Create, update, search, deactivate, and reference external person records.
  - Minimum data set per record (table above).
  - Reuse of the same record by all consuming enterprise operations platform modules.
  - Role-restricted management; search-and-select access for consuming module users.
- OUT:
  - A full contractor management solution for sites (onboarding, qualification, induction, time tracking, etc.) — the directory stays simple and focused on reusable identification master data.
  - Governance of this directory inside the pillar control panels (it is platform-level, cross-pillar reference data).

## Functional requirements (EARS)

- FR-1: WHEN an authorized user creates an external person record THEN the system SHALL capture at minimum the fields of the minimum record structure (first name, last name, email address, external person type, company/agency/organization name, attachment, comments, status, unique system identifier).
- FR-2: WHEN a user is about to create a new external person record THEN the system SHALL allow searching existing records first and SHALL avoid duplicate entries where possible.
- FR-3: WHEN a consuming module in any Event pillar (initially Event Reporting for H&S, Environment, and Industrial Risks) requires an external individual THEN the system SHALL let the module user search and select a person from the shared directory so that the same record is referenced across pillars and modules.
- FR-4: WHEN an authorized user deactivates an external person record THEN the system SHALL exclude it from selection for new references while keeping it linked to existing records and reports.
- FR-5: WHEN a user without directory management rights accesses the directory THEN the system SHALL limit that user to searching and selecting records, and SHALL prevent create, update, and deactivate actions.
- FR-6: WHEN a record contains sensitive or optional personal information THEN the system SHALL restrict its visibility to users authorized to view it.
- FR-7: WHEN reports aggregate, filter, or analyze data related to external personnel THEN the system SHALL resolve those references through the shared directory records.

## Non-functional requirements

- Data quality: duplicate avoidance, clear active/inactive status, consistent capture of company/agency information, and structure that supports future reuse by additional enterprise operations platform modules.
- Security: management actions (create, update, deactivate) restricted to authorized users; visibility of sensitive personal information restricted.

## Acceptance criteria (testable)

- [ ] Given an authorized directory user, when they create an external person record with the minimum data set, then the record receives a unique system identifier and becomes searchable by consuming modules.
- [ ] Given an existing external person record, when an Event Reporting user in any Event pillar (H&S, Environment, or Industrial Risks) reports an event involving that person, then the user can search and select the record instead of typing the person's details again.
- [ ] Given a consuming module user without directory management rights, when they open the directory from their module, then they can search and select records but cannot create, update, or deactivate them.
- [ ] Given an active external person record referenced by past events, when an authorized user deactivates it, then it is no longer selectable for new references and the past events still display it.
- [ ] Given two modules referencing the same external person, when a report filters on that person, then both references resolve to the single directory record.

## Dependencies

- Follows the single-sourcing, scope-based visibility, and audit-trail principles of the governed model defined in Feature 030: Master Data Control Panel ([master-data-control.md](master-data-control.md)). The directory is platform-level with all-pillar access: every Event pillar (H&S, Environment, Industrial Risks) consumes the same records; governance stays outside the pillar control panels.
- Downstream consumers: Event Reporting (every Event pillar) and Reports; future enterprise operations platform modules that need to reference a single external person.

## Open questions

- [OPEN]: The concrete roles for creating, updating, deactivating, and viewing sensitive information are required by the source but not yet defined (no role matrix exists for the directory).
- [OPEN]: The business context mentions visitors, agency workers, and consultants, but the external person type list only contains Temporary worker / Permanent contractor / Contractor other than permanent / Other — confirm whether additional types are needed or "Other" covers them.
- [OPEN]: Personal data (name, email, documents) is stored for external individuals; data-protection/retention rules for these records are not specified in the source.
