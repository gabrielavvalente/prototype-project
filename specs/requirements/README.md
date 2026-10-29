# EHS event management — business requirements

The business requirements of the EHS event management platform, for the development team that
builds it. They come from a validated prototype; what the prototype only simulated (demo people and
plants, demo sign-in, data kept in the browser) is left out, and what a real product still needs
to decide is listed in [Open questions](15-open-questions.md). People, roles and groups are
maintained in a user management tool the development team builds separately; only what the
products need from it is specified ([01](01-roles-and-permissions.md)).

## What is in, what is out

- **In**: the business rules, the data each rule needs, who may do what, the lifecycle of an event,
  and the exact wording users read when it carries business meaning (questions, messages, alert
  names, document titles).
- **Out**: the user-interface design (layout, screens, placement, colors, components), the
  technology, and any demo data. Where a rule names a button or a field, it names the action or
  the information, not where it is shown.

## How to read a requirement

- Each requirement has an id (e.g. **RV-10**). The prefix names its capability, as in the
  prototype; the numbers are this specification's own (rules about screen design were left out),
  so an id here may differ from the prototype's.
- Each capability file ends with **Examples**: Given / When / Then cases written with roles and
  generic data (a Manager of plant A, a TF2 event), to be turned into acceptance tests.
- **Decisions** tables record choices made with the business and why; they are part of the
  requirements.
- "Must", "can" and "never" are meant literally.

## Files

| # | File | Status |
|---|---|---|
| 00 | [Overview and glossary](00-overview.md) | Reviewed |
| 01 | [Roles and permissions](01-roles-and-permissions.md) | Reviewed |
| 02 | [Event reporting](02-event-reporting.md) | Reviewed |
| 03 | [Event review](03-event-review.md) (severity, critical events) | Reviewed |
| 04 | [Root cause analysis](04-root-cause-analysis.md) | Reviewed |
| 05 | [Action plan](05-action-plan.md) | Reviewed |
| 06 | [Validation](06-validation.md) | Reviewed |
| 07 | [Record Historian](07-record-historian.md) | Reviewed |
| 08 | [Safety communication](08-safety-communication.md) (Safety Alert, Safety Warning) | Reviewed |
| 09 | [Sharing Hub](09-sharing-hub.md) | Reviewed |
| 10 | [Alerts and notifications](10-alerts-and-notifications.md) | Reviewed |
| 11 | [Workflow settings](11-workflow-settings.md) (and the Control Panel audit) | Draft for review |
| 12 | [Master data](12-master-data.md) | Draft for review |
| 13 | [Event library](13-event-library.md) (lists, filters, indicators, register, event page) | Draft for review |
| 14 | [Reference catalogs](14-reference-catalogs.md) | Draft for review |
| 15 | [Open questions](15-open-questions.md) | Draft for review |
