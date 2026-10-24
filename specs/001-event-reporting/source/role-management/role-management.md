# Feature 040: Role Management

## Goal

Control who can do what across the event lifecycle through five clearly bounded roles (User, Reviewer, Investigator, Validator, Admin) with a self-assignment accountability model.

## Why

Access to actions and data must be controlled by role so that anyone can report, but only the reviewer who takes ownership of an event can drive it through investigation assignment and validation — keeping accountability clear while reducing role complexity (no separate Validator role).

## Platform context

- Modules involved: Event Reporting module (all event types); enterprise operations platform core structure (groups usable as investigators).
- Platform contracts reused: user accounts and roles consumed from the platform master data service. Authentication, SSO and session management are not specified in Event Reporting.

## User stories

1. As a User, I want to create and submit events so that I can report situations I observe.
2. As a Reviewer, I want to view all events and self-assign as reviewer on an event so that I can take ownership of its triage.
3. As an assigned Reviewer, I want to be the only non-admin user with access to validation actions and investigator assignment on my event so that accountability for driving the event is unambiguous.
4. As an assigned Reviewer, I want to assign one or multiple investigators from the full user base of the event module (and optionally enterprise operations platform core groups) so that the right people conduct the investigation.
5. As an Investigator, I want to conduct the investigation on events I am assigned to so that root causes are analyzed.
6. As an Admin, I want full access to all events and all actions at every stage, without the self-assignment restriction, so that I can administer and unblock the process.

## Scope

- IN:
  - Five event lifecycle roles: User, Reviewer, Investigator, Validator (merged into Reviewer), Admin.
  - Reviewer self-assignment model and the resulting exclusive access to validation actions and investigator assignment.
  - Investigator assignment from individual users and, optionally, enterprise operations platform core structure groups.
  - Role-based control of actions and data across the event lifecycle (permission matrix below).
- OUT:
  - A separate Validator role — intentionally merged with Reviewer; reviewer permissions cover validation actions.
  - Master data administration roles of the pillar control panels (H&S, Environment, Industrial Risks) — these follow the Pillar → Role → Scope → Permissions model of the [Master Data Control Panel specification](../Control%20Panel/master-data-control.md); holding a role in one system grants no rights in the other.
  - Authentication, SSO, MFA, session management, password storage, and account-lock propagation.

## Functional requirements (EARS)

- FR-1: WHEN a person holds the User role THEN the system SHALL allow them to create and submit events.
- FR-2: WHEN a person holds the Reviewer role THEN the system SHALL allow them to view all events and to self-assign as reviewer on an event.
- FR-3: WHEN a reviewer has self-assigned to an event THEN the system SHALL grant validation actions and investigator assignment on that event to that reviewer only, among non-admin users.
- FR-4: WHEN an assigned reviewer performs investigator assignment THEN the system SHALL allow selecting one or multiple investigators from the full user base of the event module and, optionally, groups from the enterprise operations platform core structure.
- FR-5: WHEN a person is assigned as Investigator on an event THEN the system SHALL allow them to conduct the investigation on that event.
- FR-6: WHEN validation actions are required THEN the system SHALL use Reviewer permissions (no separate Validator role exists).
- FR-7: WHEN a person holds the Admin role THEN the system SHALL grant full access to all events and all actions at every stage of the process, without the reviewer self-assignment restriction.

### Permission matrix

| Action | User | Reviewer (assigned) | Investigator | Admin |
|---|:---:|:---:|:---:|:---:|
| Create & submit event | ✓ | | | ✓ |
| View all events | | ✓ | | ✓ |
| Self-assign as reviewer | | ✓ | | ✓ |
| Validate event | | ✓ (once assigned) | | ✓ |
| Assign investigator | | ✓ (once assigned) | | ✓ |
| Conduct investigation | | | ✓ | ✓ |
| Full access / any action | | | | ✓ |

## Non-functional requirements

- [OPEN]: No performance, security, accessibility, i18n, or observability requirements are stated in the source for role management (e.g. auditing of permission changes).

## Acceptance criteria (testable)

- [ ] Given a person with the User role, when they open the event module, then they can create and submit an event but cannot view events they did not report, self-assign, validate, or assign investigators.
- [ ] Given a person with the Reviewer role, when they open the event list, then all events are visible and they can self-assign as reviewer on any event.
- [ ] Given a reviewer who has self-assigned to an event, when another non-admin reviewer opens that event, then validation actions and investigator assignment are not available to that other reviewer.
- [ ] Given an assigned reviewer on an event, when they assign investigators, then they can pick one or multiple people from the full event-module user base and optionally enterprise operations platform core structure groups.
- [ ] Given a person assigned as Investigator on an event, when they open that event, then they can conduct the investigation.
- [ ] Given a person with the Admin role, when they open any event at any stage, then every action (including validation and investigator assignment) is available without prior self-assignment.

## Dependencies

- Applies to all event lifecycle features, including Feature 000: Core Event Lifecycle ([../core.md](../core.md)) and the event-type specs (e.g. Feature 021: Safety Event).
- enterprise operations platform core structure: source of the groups optionally assignable as investigators (integration to be confirmed).
- Distinct from the master data administration roles of Feature 030: Master Data Control Panel ([../Control%20Panel/master-data-control.md](../Control%20Panel/master-data-control.md)).

## Open questions

- [OPEN]: Integration requirements for assigning enterprise operations platform core structure groups as investigators are subject to future confirmation.
- [OPEN]: How roles are granted, by whom, and at what scope (plant, module, global) is not defined.
- [OPEN]: Whether an Investigator can view event data beyond conducting the investigation (the permission matrix leaves "View all events" blank for Investigator) is not specified.
- [OPEN]: Whether a User can view or track the events they themselves reported after submission is not specified.
