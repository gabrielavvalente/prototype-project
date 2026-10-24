# Feature 001: Global Shell

## Goal
Give every Event Reporting user a persistent application frame — header, context bar, role-based navigation and the My Alerts / My Actions panels — that establishes which business, plant and pillar they are working in.

## Why
The selected business → plant → pillar context governs every query the product makes on the user's behalf. Without a single trusted shell, users report against the wrong plant, see screens their role cannot use, and hunt through the event library for work already assigned to them.

## Platform context
- Modules involved: app header and context bar, role-based navigation menu, My Alerts panel, My Actions panel, translation (i18n) layer.
- Platform contracts reused: plant structure and user accounts from the platform master data service; Action Management Platform for assigned event actions shown in My Actions; the platform translation pipeline with AI fallback.
- Source: Event Reporting BRD v1.0.0 — §3.1(1), §4.2, §4.3, §5.1, §6.3–6.5, §9.1–9.2 (story prefix `US-SHELL-`).

## User stories
1. **US-SHELL-01** — As a plant user working across more than one site, I want a persistent header showing who I am and which business, plant and pillar I am currently in, so that I never report an event against the wrong plant.
2. **US-SHELL-02** — As a frontline operator, I want a navigation menu that only shows what my role can actually do, so that I am not presented with administration screens I cannot use.
3. **US-SHELL-03** — As an Event Owner, I want a single panel listing every alert assigned to me, so that I can pick up newly assigned investigations without hunting through the event library.
4. **US-SHELL-04** — As an action assignee, I want to see and update my corrective actions from anywhere in the app, so that I can close out work without opening each event record, while every action remains monitorable in Action Management Platform.
5. **US-SHELL-05** — As a non-English-speaking plant worker, I want every label and message in my own language, so that I can report an event accurately without guessing at terminology.
6. **US-SHELL-06** — As an EHS data owner, I want every user confined to their assigned business, plant and pillar, so that no site can see another site's event data.
7. **US-SHELL-08** — As a worker using a phone on the shop floor, or a screen-reader user, I want the shell to work on my device and with my assistive technology, so that I can report events under the same conditions as everyone else.

## Scope
- IN: US-SHELL-01 App Header and Context Bar; US-SHELL-02 Role-Based Navigation Menu; US-SHELL-03 My Alerts Panel; US-SHELL-04 My Actions Panel; US-SHELL-05 Translated Interface; US-SHELL-06 Scope-Restricted Data Access; US-SHELL-08 Accessible, Touch-Ready Shell.
- OUT: Footer links (backlog, §13); Notification Settings entry point (backlog, §13); native mobile app (device-browser PWA / responsive web only); authentication, SSO, session management, MFA, password storage, and account-lock propagation.

## Functional requirements (EARS)
- FR-1: WHEN any screen renders THEN the system SHALL display a persistent header with the user's avatar, name and role, a language selector, and quick-access controls for My Actions and My Alerts. (from US-SHELL-01 / FR-SHELL-01)
- FR-2: WHEN a user with access to more than one business selects a different business THEN the system SHALL reload the page in the new business scope. (from US-SHELL-01 / FR-SHELL-01)
- FR-3: WHEN the plant selector is opened THEN the system SHALL display each plant with its plant-type icon and country flag, and SHALL indicate the currently selected pillar in the context bar. (from US-SHELL-01 / FR-SHELL-01)
- FR-4: WHEN the navigation menu renders THEN the system SHALL build it dynamically from the user's assigned role and pillar, matching the visibility matrix below. (from US-SHELL-02 / FR-SHELL-02)
- FR-5: WHEN a user requests a route outside their role — including by direct URL — THEN the system SHALL reject the request server-side with a permission error. (from US-SHELL-02, US-SHELL-06)
- FR-6: WHEN a user opens My Alerts from the header THEN the system SHALL display a sliding panel listing all alerts assigned to the user, sorted by date descending, each showing its source event, type and creation date. (from US-SHELL-03 / FR-SHELL-03)
- FR-7: WHEN a user clicks an alert THEN the system SHALL navigate to the source event record. (from US-SHELL-03 / FR-SHELL-03)
- FR-8: WHEN a user opens My Actions from the header THEN the system SHALL display a sliding panel listing all corrective actions assigned to the user from Action Management Platform, each with a status of On Going / To Complete / Completed / Overdue. (from US-SHELL-04 / FR-SHELL-04)
- FR-9: WHEN a user changes an action's status in the My Actions panel THEN the system SHALL persist the change in Action Management Platform without navigation and SHALL reflect the new status on the corresponding event record. (from US-SHELL-04 / FR-SHELL-04)
- FR-10: WHEN any user-facing string is rendered THEN the system SHALL resolve it through the platform translation pipeline. (from US-SHELL-05 / FR-SHELL-05)
- FR-11: WHEN a translation is missing for the user's language THEN the system SHALL serve an AI fallback translation rather than an English string or a raw key. (from US-SHELL-05 / FR-SHELL-05)
- FR-12: WHEN a user selects a language THEN the system SHALL render dates, times and numbers in that locale's format. (from US-SHELL-05)
- FR-13: WHEN any API request is processed THEN the system SHALL filter results server-side by the user's `business → plant → pillar → role` scope and SHALL never return out-of-scope records to the client, even hidden. (from US-SHELL-06 / §4.2, §9.2)
- FR-17: WHEN one of the notification triggers below fires THEN the system SHALL surface it in the listed shell panel. (from US-SHELL-03, US-SHELL-04)

**Navigation visibility matrix** (FR-4)

| Menu Item | User | Manager | Owner | Site Admin | Regional | Super Admin |
|---|---|---|---|---|---|---|
| Events | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Event | ✓ | ✓ | ✓ | — | — | ✓ |
| My Actions | ✓ | ✓ | ✓ | — | — | ✓ |
| My Alerts | ✓ | ✓ | ✓ | — | — | ✓ |
| Reports | — | ✓ | ✓ | — | ✓ | ✓ |
| Configuration | — | — | — | ✓ | — | ✓ |
| Notification Settings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Administration | — | — | — | ✓ | — | ✓ |
| Integrations | — | — | — | — | — | ✓ |

**Notification surfaces hosted in the shell** (FR-17)

| Trigger | Panel |
|---|---|
| Event submitted | My Alerts |
| Initial Review completed | My Alerts |
| Owner assigned | My Alerts |
| Action assigned | My Actions |
| All actions completed | My Alerts |
| Final Review ready | My Alerts |
| Record reworked | My Alerts |

## Non-functional requirements
- Security: no client-side-only access restriction on any screen; role and scope checks are enforced server-side.
- Accessibility: core flows meet WCAG 2.1 AA; key forms navigable and correctly announced by screen readers.
- Mobile: shell behaviour (including My Actions updates) identical on mobile and desktop; starting a new event takes no more than 3 taps from the landing screen.
- i18n: no hard-coded user-facing strings in the codebase; layout accounts for RTL languages.

## Acceptance criteria (testable)

**US-SHELL-01**
- [ ] Given I open any screen, when it renders, then the header displays my avatar, name and role.
- [ ] Given the header is visible, when I inspect it, then it exposes a language selector.
- [ ] Given I have access to more than one business, when I switch business in the business selector, then the page reloads in the new scope.
- [ ] Given I open the plant selector, when the plant list renders, then each plant is shown with its plant-type icon and country flag.
- [ ] Given a plant is selected, when the context bar renders, then the current pillar is indicated.
- [ ] Given the header is visible, when any screen renders, then quick-access controls for My Actions and My Alerts are present.

**US-SHELL-02**
- [ ] Given I open the product, when the navigation renders, then it is built dynamically from my assigned role and pillar.
- [ ] Given a menu item is outside my role, when the navigation renders, then the item is neither visible nor reachable by direct URL.
- [ ] Given the menu renders, when compared to the visibility matrix, then item visibility matches it exactly.
- [ ] Given I attempt to reach a hidden route directly, when the request is processed, then the server returns a permission error.

**US-SHELL-03**
- [ ] Given I open My Alerts from the header, when the panel slides open, then it lists all alerts assigned to me sorted by date descending.
- [ ] Given an alert is listed, when I read its row, then it shows its source event, its type and its creation date.
- [ ] Given I click an alert, when navigation completes, then I am on the source event record.

**US-SHELL-04**
- [ ] Given I open My Actions from the header, when the panel slides open, then it lists all corrective actions assigned to me from Action Management Platform with status On Going / To Complete / Completed / Overdue.
- [ ] Given I change an action's status in the panel, when the change saves, then it persists in Action Management Platform without navigating away from my current screen.
- [ ] Given I update an action status, when the event record is viewed, then it reflects the new status.

**US-SHELL-05**
- [ ] Given any user-facing string is rendered, when it resolves, then it comes through the platform translation pipeline.
- [ ] Given a translation is missing for my language, when the string renders, then an AI fallback translation is served rather than an English string or a raw key.
- [ ] Given the codebase is reviewed, when user-facing strings are audited, then none are hard-coded.
- [ ] Given I select a language, when dates, times and numbers render, then they use my locale format.

**US-SHELL-06**
- [ ] Given any API request, when results are returned, then they are filtered server-side by my `business → plant → pillar → role` scope.
- [ ] Given a record outside my scope exists, when I query the API, then it is never returned to my client, even hidden.
- [ ] Given a screen relies only on a client-side restriction, when reviewed, then it fails review.

**US-SHELL-08**
- [ ] Given I use the shell on mobile, when I update a My Actions item, then it works identically to desktop.
- [ ] Given I am on the shell's landing screen, when I start a new event, then it takes no more than 3 taps.
- [ ] Given any core flow is audited, when tested against WCAG 2.1 AA, then it passes.
- [ ] Given I use a screen reader, when I traverse key forms, then they are navigable and correctly announced.

## Dependencies
- Platform master data service APIs for plant structure and user accounts are available and stable (A-01).
- Translation strings for mandatory UI elements provided through the platform master data service per language wave (A-08).
- Mobile usage relies on the device browser (PWA or responsive web); native app not in scope (A-09).
- Downstream: hosts entry points and panels consumed by [Event Library](../02-event-library/Event%20Library.md), [Notifications](../11-notifications/Notifications.md) and [Configuration and Administration](../10-configuration-and-administration/Configuration%20and%20Administration.md).
- [Action Plan](../05-action-plan/Action%20Plan.md) / [Integrations](../12-integrations/Integrations.md) — My Actions lists Action Management Platform assignments; every event action remains monitorable in the Action Management Platform application.

## Open questions
- [OPEN]: Proposed (workshop [date generalized]) — two governance tiers above Site Admin (a Central / Corporate role and a Business / Regional / Country / Cluster role, each declaring its own perimeter) would each need a row in the navigation matrix, with Configuration access scoped by governance tier rather than by plant. Not yet decided; see [Configuration and Administration → Tiered Master Data Governance](../10-configuration-and-administration/Configuration%20and%20Administration.md#-proposed--tiered-master-data-governance).
