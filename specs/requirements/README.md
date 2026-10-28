# EHS event management — business requirements

The business requirements of the EHS event management platform, for the development team that
builds it. They come from a validated prototype; what the prototype only simulated (demo people and
plants, demo sign-in, data kept in the browser) is left out, and what a real product still needs
to decide is listed in [Open questions](16-open-questions.md).

## What is in, what is out

- **In**: the business rules, the data each rule needs, who may do what, the lifecycle of an event,
  and the exact wording users read when it carries business meaning (questions, messages, alert
  names, document titles).
- **Out**: the user-interface design (layout, screens, placement, colors, components), the
  technology, and any demo data. Where a rule names a button or a field, it names the action or
  the information, not where it is shown.

## How to read a requirement

- Each requirement has an id (e.g. **RV-10**): the prefix is its capability, kept from the
  prototype so a requirement can be traced to the behavior that was validated.
- Each capability file ends with **Examples**: Given / When / Then cases written with roles and
  generic data (a Manager of plant A, a TF2 event), to be turned into acceptance tests.
- **Decisions** tables record choices made with the business and why; they are part of the
  requirements.
- "Must", "can" and "never" are meant literally.

## Files

| # | File | Status |
|---|---|---|
| 00 | [Overview and glossary](00-overview.md) | Draft for review |
| 01 | [Roles and permissions](01-roles-and-permissions.md) | Draft for review |
| 02 | Event reporting | To write |
| 03 | Event review (severity, critical events) | To write |
| 04 | Root cause analysis | To write |
| 05 | Action plan | To write |
| 06 | Validation | To write |
| 07 | Record Historian | To write |
| 08 | Safety communication (Safety Alert, Safety Warning) | To write |
| 09 | Sharing Hub | To write |
| 10 | Alerts and notifications | To write |
| 11 | Workflow settings | To write |
| 12 | Master data | To write |
| 13 | Event library (lists, filters, KPIs, reports, event page) | To write |
| 14 | User directory (users, investigation groups) | To write |
| 15 | Reference catalogs | To write |
| 16 | [Open questions](16-open-questions.md) | Draft for review |
