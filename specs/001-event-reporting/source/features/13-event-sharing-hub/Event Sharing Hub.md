# Feature 013: Event Sharing Hub

## Goal

Turn selected local incidents into organizational learning by letting sites broadcast, subscribe to, and act locally on high-value shared events across the organization's global network.

## Why

Lessons learned at one plant rarely reach the plants where the same event could happen next. The Event Sharing Hub establishes a structured exchange mechanism — nominate, filter, subscribe, verify locally — so plants and clusters benefit from incidents elsewhere and address similar risks before they materialise at home.

## Platform context

- Source: Event Reporting BRD v1.0.0 — §3.1(13), §5.13
- Modules involved: Event lifecycle (Closed events / completed investigations as sharing candidates), Action Plan (local preventive actions), Notifications (in-app alerts), Local Sharing Inbox.
- Platform contracts reused: event classification model (Pillar, Family, Hazards, Standards); event families and level thresholds (SAF, IR, ENV); anonymization gate for personal identifiers.

## User stories

1. US-SHARE-01: As an EHS Manager or Reviewer, I want to nominate and share selected local events across plants, clusters, regions, or business units, so that other organizations in the network can learn from the incident.
2. US-SHARE-02: As a Site Admin or Local EHS Specialist, I want to subscribe our plant to relevant shared events based on our operations and risk profile, so that we receive timely notifications of incidents that could happen here.
3. US-SHARE-03: As a Site EHS Admin or Manager, I want to create local actions directly from shared events, so that we can systenvironmental assessment toolically verify whether similar conditions, hazards, or control gaps exist on our site.

## Scope

- IN: sharing flow with perimeter selection (US-SHARE-01); subscription feeds and Local Sharing Inbox with in-app alerts (US-SHARE-02); local preventive action creation from shared events (US-SHARE-03).
- OUT: sharing of events that are neither Closed nor carry a completed investigation; distribution of local assignee details (excluded from the shared package); distribution of any event containing personal identifiers before the anonymization gate passes.

## Functional requirements (EARS)

- FR-1: WHEN an event is Closed or has a completed Investigation THEN the system SHALL offer the Reviewer a `[Share to Hub]` action. (from US-SHARE-01)
- FR-2: WHEN a Reviewer initiates the sharing flow THEN the system SHALL allow selection of the sharing perimeter: specific plants, clusters, regions, or business units. (from US-SHARE-01)
- FR-3: WHEN the sharing perimeter is selected THEN the system SHALL enrich the shared package with the anonymized Event Statement, classification context (Pillar, Family, Hazards, Standards), Key Learnings and Investigation Findings, and the deployed actions checklist without local assignee details. (from US-SHARE-01)
- FR-4: WHEN the event contains personal identifiers THEN the system SHALL block distribution until the automated anonymization gate is passed. (from US-SHARE-01)
- FR-5: WHEN a Site Admin or Local EHS Specialist configures a subscription THEN the system SHALL support feed filters by Operating Hazards (e.g. Working at Height, LOTO, Forklift Operations), by specific Event Families and level thresholds (e.g. TF1–TF3, SRE1–SRE2, EvE1–EvE2), and by standard criteria matched to the physical plant profile. (from US-SHARE-02)
- FR-6: WHEN a new shared event matches a plant's subscription profile THEN the system SHALL register it in that plant's Local Sharing Inbox and trigger an in-app alert for reviewers. (from US-SHARE-02)
- FR-7: WHEN a user triggers `[Verify Locally]` on a shared event in the Local Sharing Inbox THEN the system SHALL initialize a local preventive action plan pre-linked to the shared event as its source reference, copying the shared event's Key Learnings and Hazard context into the task description. (from US-SHARE-03)
- FR-8: WHEN a local action created from a shared event is closed THEN the system SHALL log the completion back to the local sharing history to track the site's proactive risk mitigation. (from US-SHARE-03)

## Non-functional requirements

- Privacy: personal identifiers never leave the originating site — the automated anonymization gate is a hard block on distribution.
- i18n: shared packages travel across regions and business units; content relies on the platform translation contract.
- Observability: local sharing history records inbox receipts and completions of derived local actions.

## Acceptance criteria (testable)

US-SHARE-01 — Share events across perimeters
- [ ] Given an event that is Closed or has a completed Investigation, when a Reviewer views it, then `[Share to Hub]` is available.
- [ ] Given the sharing flow is initiated, when the Reviewer selects the perimeter, then specific plants, clusters, regions and business units are all selectable.
- [ ] Given the perimeter is selected, when the shared package is built, then it contains the anonymized Event Statement, classification context (Pillar, Family, Hazards, Standards), Key Learnings and Investigation Findings, and the deployed actions checklist without local assignee details.
- [ ] Given the event contains personal identifiers, when sharing is attempted, then distribution is blocked until the automated anonymization gate passes.

US-SHARE-02 — Subscribe to shared feeds
- [ ] Given the Event Sharing Hub dashboard, when a Site Admin configures feeds, then filters by Operating Hazards, Event Families with level thresholds, and standard plant-profile criteria are available.
- [ ] Given a new event is shared matching the plant's subscription profile, when the match occurs, then the event is registered in the Local Sharing Inbox and an in-app alert is triggered for reviewers.

US-SHARE-03 — Direct local action plan creation
- [ ] Given a shared event in the Local Sharing Inbox, when the user triggers `[Verify Locally]`, then a local preventive action plan is initialized pre-linked to the shared event as its source reference.
- [ ] Given the local action is created, when the assignee opens it, then the shared event's Key Learnings and Hazard context appear in the task description.
- [ ] Given the local action is closed, when closure completes, then the completion is logged to the local sharing history.

## Dependencies

- Inherits event statuses (Closed) and investigation completion from Feature 000: Core Event Lifecycle (../../core.md).
- [Action Plan](../05-action-plan/Action%20Plan.md) — local preventive action plans created from shared events.
- [Notifications](../11-notifications/Notifications.md) — in-app alerts on subscription matches.
- Classification master data (Pillars, Families, Hazards, Standards) consumed from the Control Panel value sets.

## Open questions

- [OPEN]: The feature header states "MVP: Partially included", yet all three stories (US-SHARE-01..03) were flagged MVP In — confirm what, if anything, of the Hub is excluded from MVP.
- [OPEN]: The automated anonymization gate's detection rules (what counts as a personal identifier, and the manual override path if any) are not specified.
