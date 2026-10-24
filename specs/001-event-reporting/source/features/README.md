# Event Reporting — Feature Specs

Per-feature specs derived from **Event Reporting BRD v1.0.0** (`../Event Reporting BRD.md`), one folder per feature, one spec per folder.

Every spec follows the Spec-Driven Development PO template: Goal, Why, Platform context, User stories (`US-XXX-nn` IDs kept for BRD traceability), Scope IN/OUT (MVP is expressed here), Functional requirements in EARS syntax, Non-functional requirements, testable Given/When/Then acceptance criteria, Dependencies, and Open questions (`[OPEN]` items). Proposed stories not yet in the BRD are marked "(proposed, not in BRD)" and indexed in [PROPOSALS.md](PROPOSALS.md).

---

## Index

| Feature | Spec | Story Prefix | BRD Source |
|---|---|---|---|
| 001 | [Global Shell](01-global-shell/Global%20Shell.md) | `US-SHELL-` | §5.1 |
| 002 | [Event Library](02-event-library/Event%20Library.md) | `US-LIB-` | §5.2 |
| 003 | [Event Creation](03-event-creation/Event%20Creation.md) | `US-CREATE-` | §5.3 |
| 004 | [Investigation](04-investigation/Investigation.md) | `US-INV-` | §5.4 |
| 005 | [Action Plan](05-action-plan/Action%20Plan.md) | `US-AP-` | §5.5 |
| 006 | [Review and Governance](06-review-and-governance/Review%20and%20Governance.md) | `US-GOV-` | §5.6 |
| 007 | [Safety Communication](07-safety-communication/Safety%20Communication.md) | `US-COMM-` | §5.7 |
| 008 | [External Reporting Platform Integration](08-external-reporting-integration/External%20Reporting%20Integration.md) | `US-External Reporting Platform-` | §5.8, §7.4 |
| 009 | [Reporting and Analytics](09-reporting-and-analytics/Reporting%20and%20Analytics.md) | `US-REP-` | §12 |
| 010 | [Configuration and Administration](10-configuration-and-administration/Configuration%20and%20Administration.md) | `US-CFG-` | §11 |
| 011 | [Notifications](11-notifications/Notifications.md) | `US-NOT-` | §10 |
| 012 | [Integrations](Integrations.md) | `US-INT-` | §7 |
| 013 | [Event Sharing Hub](13-event-sharing-hub/Event%20Sharing%20Hub.md) | `US-SHARE-` | §5.13 |
| 014 | [Risk Assessment Integration](14-risk-assessment/Risk%20Assessment.md) | `US-RA-` | Proposal / Risk Assessment Alignment |

MVP inclusion, per-story acceptance criteria, and open points live inside each spec (Scope, Acceptance criteria, and Open questions sections) — they are not duplicated here.

---

## Event Lifecycle Across Features

```
Event Creation ──► Review & Governance ──► Investigation ──► Action Plan ──► Review & Governance
   (F-003)            (Initial Review)        (F-004)            (F-005)            (Final Review)
                            │                                                              │
                            ▼                                                              ▼
                      Safety Alert                                                   Record locked
                        (F-007)                                                            │
                                                                                    Safety Warning
                                                                                        (F-007)
```

Cross-cutting throughout: [Global Shell](01-global-shell/Global%20Shell.md), [Notifications](11-notifications/Notifications.md), [Integrations](Integrations.md), [Reporting and Analytics](09-reporting-and-analytics/Reporting%20and%20Analytics.md).

---

## Coverage Against BRD §3.1

The BRD's In Scope list names 13 modules. Mapping to the feature folders:

| BRD §3.1 Module | Feature |
|---|---|
| 1. Global shell | 001 |
| 2. Event Library | 002 |
| 3. Event Creation | 003 |
| 4. Investigation | 004 |
| 5. Action Plan | 005 |
| 6. Review and Governance | 006 |
| 7. Safety Communication | 007 |
| 8. Reporting and Analytics | 009 |
| 9. Configuration | 010 |
| 10. Notifications | 011 |
| 11. Administration | 010 (merged with Configuration, per §11) |
| 12. Integrations | 012 (+ 008 for External Reporting Platform) |
| 13. Support | **Not covered** — no requirements defined in the BRD |

> **Support** appears in the In Scope list and in the MVP exclusions ("All support pages") but has no functional requirements anywhere in the BRD. No folder was created. If help center, onboarding guides and feedback are genuinely in scope, they need requirements written first.

---

## Related Specs

- [Core Event Lifecycle (Feature 000)](../core.md) — owns the 5-stage lifecycle and 4-status model.
- Event type specs: [Safety (021)](../safety%20event/safety-event.md) · [Health (022)](../Health%20event/health-event.md) · [Industrial Risk (023)](../Industrial%20risk%20event/industrial-risk-event.md) · [Environment (024)](../environement%20event/environment-event.md)
- [Master Data Control Panel (030)](../Control%20Panel/master-data-control.md) and its value-set specs (031–037).
- [Detailed Screens (015)](../detailed-screens-specification.md) · [Role Management (040)](../role-management/role-management.md)

---

## Source

- `../Event Reporting BRD.md` — Business Requirements Document, Event Reporting v1.0.0, [date generalized], Draft.
- Replaces: Event Reporting BRD v2.0.0 ([date generalized]).
