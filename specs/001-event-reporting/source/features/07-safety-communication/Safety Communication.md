# Feature 007: Safety Communication

## Goal
Turn every reviewed and closed event into a shared, anonymised lesson through two auto-generated artefacts: the early Safety Alert (right after Initial Review) and the final Safety Warning (once investigation is complete and an action is deployed).

## Why
This delivers the vision statement's closing line — every closed event is a shared lesson. Workers learn about a hazard on their site within hours, not after the investigation finishes; other plants can act on the findings before the same thing happens to them. Auto-generation removes the burden of writing a separate communication, and enforced anonymisation keeps personal identifiers out of everything that is distributed.

## Platform context
- Source: Event Reporting BRD v1.0.0 — §3.1(7), §5.7, §6.1, §9.4, §10.1 · story prefix `US-COMM-`
- Modules involved: Safety Alert, Safety Warning (draft + publish), secure document service (image storage), Notifications, regional governance office cross-site distribution.
- Platform contracts reused: secure document service for file storage with upload validation and malware scanning (§9.4); email notification channel; common artefact template across the SAF, ENV and IR pillars.
- Roles: Owner (reviews and publishes the Safety Warning), Manager (triggers the Safety Alert by saving Initial Review), Regional User / regional governance office (distributes published Warnings across sites), User / Reporter (reads Alerts and Warnings from other plants).
- Publishing distributes the anonymised artefact, not the underlying record — the event itself remains scope-restricted.

Reference data — content sources:

| Safety Alert Section | Source |
|---|---|
| Classification (family + level) | `Event.event_family`, `Event.event_level` |
| Anonymized event statement | Initial Review — Event Statement |
| Immediate actions taken | Immediate Actions from Event Creation |
| Expected resolution timeline | Initial Review — Next Step |

| Safety Warning Section | Source |
|---|---|
| Classification + anonymized statement | Event Reporting Initial Review |
| Investigation summary | 5W1H key findings, 6M highlights |
| AP summary | Corrective Actions and status |
| Key Learnings | US-AP-01 |
| Images | secure document service |

## User stories
1. US-COMM-01: As a plant worker, I want a short alert as soon as an event has been reviewed, so that I learn about a hazard on my site within hours, not after the investigation finishes.
2. US-COMM-02: As an Event Owner, I want to publish a full warning once the investigation and corrective work are done, so that other plants can act on what we learned before the same thing happens to them.
3. US-COMM-03: As a Site Admin at another plant, I want a shareable card generated from a published Warning, so that I can prompt my own teams to check whether the same risk exists here.
4. US-COMM-04: As an EHS Manager, I want to print or export these communications, so that I can post them on a noticeboard for workers without app access.
5. US-COMM-05: As an Event Owner, I want to drop images into the Warning from secure document service, so that the lesson is visual without me handling file storage myself.

## Scope
- IN (MVP): US-COMM-01 Early Safety Alert; US-COMM-02 Publish Safety Warning; US-COMM-05 Attach Evidence Images. Pages (§13): Safety Alert, Safety Warning Draft, Safety Warning Publish.
- OUT: US-COMM-03 "Could It Happen Here?" card; US-COMM-04 PDF export. Pages deferred (§13): Safety Alert PDF, Safety Warning PDF, Could It Happen Here.

## Functional requirements (EARS)
- FR-1: WHEN a Manager saves Initial Review THEN the system SHALL auto-generate a Safety Alert containing the event classification (family + level), the anonymized event statement, the immediate actions taken, and the expected resolution timeline. (from US-COMM-01 / FR-COMM-01, FR-GOV-02)
- FR-2: WHEN a Safety Alert source field is edited afterwards THEN the system SHALL refresh the Alert automatically. (from US-COMM-01)
- FR-3: WHEN a Safety Alert is generated THEN the system SHALL render it as an in-app card using the common template shared across all pillars. (from US-COMM-01)
- FR-4: WHEN a Safety Alert or Safety Warning is rendered — in-app or exported — THEN the system SHALL include no personal identifiers: no reporter name, no employee name. (from US-COMM-01, US-COMM-02, US-COMM-04)
- FR-5: WHEN the investigation is complete AND at least one corrective action is deployed THEN the system SHALL auto-generate a Safety Warning; WHEN either precondition is unmet THEN the system SHALL NOT generate one. (from US-COMM-02 / FR-COMM-02)
- FR-6: WHEN a Safety Warning is generated THEN the system SHALL include: the event classification and anonymized event statement, an investigation summary (key findings from 5W1H, 6M highlights), an AP summary (actions and their status), Key Learnings, and a drag-and-drop image area sourced from secure document service — using the common template across the SAF, ENV and IR pillars. (from US-COMM-02 / FR-COMM-02)
- FR-7: WHEN the Owner publishes a Safety Warning THEN the system SHALL route it to regional governance office for cross-site distribution and notify regional governance office recipients by email; the Publish action SHALL be controlled by the Owner. (from US-COMM-02)
- FR-8: WHEN a Safety Warning is published THEN the system SHALL allow generating a shareable card/slide carrying a "Could it happen here?" prompt, linking back to the source Warning, and suitable for plant-wide sharing. (from US-COMM-03 / FR-COMM-03)
- FR-9: WHEN a PDF export of a Safety Alert or Safety Warning is requested THEN the system SHALL produce a printable PDF carrying the same anonymisation guarantees as the in-app view. (from US-COMM-04 / FR-COMM-01, FR-COMM-02)
- FR-10: WHEN an image is dragged and dropped into a Warning draft THEN the system SHALL store it via secure document service with no public URL reachability. (from US-COMM-05 / §9.4)
- FR-11: WHEN an image is uploaded THEN the system SHALL validate its MIME type, extension and size and malware-scan it before persistence. (from US-COMM-05 / §9.4)

Generation triggers:

| Artefact | Generated When | Refresh |
|---|---|---|
| Safety Alert | Immediately on Initial Review save | Auto-refreshes when a source field changes |
| Safety Warning | Investigation complete AND ≥1 action deployed | — |

## Non-functional requirements
- Privacy: both artefacts contain no personal identifiers; enforced upstream too — US-GOV-01 validates the Event Statement is free of the reporter's name before Initial Review can save.
- Performance: a requested PDF generates in under 10 seconds.
- Security: uploaded images are MIME/extension/size validated and malware-scanned before persistence; stored images are not reachable by public URL (§9.4).
- Access: publishing distributes the anonymised artefact only; the underlying event record remains scope-restricted.

## Acceptance criteria (testable)
US-COMM-01 — Receive an Early Safety Alert
- [ ] Given a Manager saves Initial Review, when generation runs, then a Safety Alert is auto-generated.
- [ ] Given the Alert is generated, when I read it, then it contains: event classification (family + level), the anonymized event statement, immediate actions taken, and the expected resolution timeline.
- [ ] Given the Alert is generated, when compared across pillars, then it uses a common template across all pillars.
- [ ] Given I view the Alert, when it renders, then it is available as an in-app card.
- [ ] Given a source field is edited afterwards, when I reopen the Alert, then it has refreshed automatically.
- [ ] Given the Alert is rendered, when inspected, then it contains no reporter name and no employee name.

US-COMM-02 — Publish a Safety Warning
- [ ] Given the investigation is complete and at least one corrective action is deployed, when generation runs, then a Safety Warning is auto-generated.
- [ ] Given either precondition is unmet, when generation is checked, then no Warning is generated.
- [ ] Given the Warning is generated, when I read it, then it contains: classification and anonymized event statement, investigation summary (5W1H key findings, 6M highlights), AP summary (actions and status), Key Learnings, and a drag-and-drop image area sourced from secure document service.
- [ ] Given the Warning is generated, when compared across SAF, ENV and IR, then it uses a common template.
- [ ] Given I am the Owner, when I view the Warning draft, then I control the Publish action.
- [ ] Given I publish, when routing runs, then the Warning is routed to regional governance office for cross-site distribution and regional governance office recipients are notified by email.
- [ ] Given the Warning is rendered, when inspected, then it contains no personal identifiers.

US-COMM-03 — Share "Could It Happen Here?"
- [ ] Given a Safety Warning is published, when I request it, then a shareable card/slide can be generated from it.
- [ ] Given the card is generated, when I read it, then it carries a "Could it happen here?" prompt.
- [ ] Given the card is generated, when I follow it, then it links back to the source Warning.
- [ ] Given the card is distributed, when shared, then it is suitable for plant-wide sharing.

US-COMM-04 — Export an Alert or Warning as PDF
- [ ] Given a Safety Alert, when I export, then it is printable and exportable as PDF.
- [ ] Given a Safety Warning, when I export, then it is printable and exportable as PDF.
- [ ] Given a PDF is requested, when timed, then it generates in under 10 seconds.
- [ ] Given a PDF is produced, when inspected, then it carries the same anonymisation guarantees as the in-app view.

US-COMM-05 — Attach Evidence Images Safely
- [ ] Given I am editing a Warning draft, when I drag and drop images, then they land in its image area.
- [ ] Given an image is added, when stored, then it is held via secure document service and is not reachable by public URL.
- [ ] Given an image is uploaded, when it is processed, then its MIME type, extension and size are validated and it is malware-scanned before persistence.

## Dependencies
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) — Initial Review save triggers the Safety Alert (FR-GOV-02); the Event Statement anonymisation gate is enforced there.
- [Investigation](../04-investigation/Investigation.md) — 5W1H / 6M outputs feed the Warning's investigation summary; completeness co-gates Warning generation.
- [Action Plan](../05-action-plan/Action%20Plan.md) — ≥1 deployed action co-gates Warning generation; Key Learnings (US-AP-01) feed the Warning.
- [Notifications](../11-notifications/Notifications.md) — email delivery to regional governance office recipients on publish.
- secure document service — image storage, validation and malware scanning.

## Open questions
- [OPEN]: FR-COMM-01 states the Alert is "printable / PDF export" as part of its definition, while §13 defers PDF to backlog (US-COMM-04 isolates the deferred part). Confirm the PDF deferral is accepted against the FR wording.
- [OPEN]: Key Learnings feed the Safety Warning content, but US-AP-01 (Capture Key Learnings) is out of MVP. Confirm what the MVP Warning shows in the Key Learnings section.
