# Feature 011: Notifications

## Goal
Move every event through its lifecycle by telling the right people at the right moment, through a rule-based engine spanning system triggers, Site Admin-configured submission rules and per-user preferences.

## Why
Without automatic notifications, events stall until someone chases them manually. Three layers keep the flow moving while keeping inboxes usable: system-defined lifecycle triggers, submission rules a Site Admin targets per pillar, and personal preferences. Every notification lands in email, the in-app My Alerts / My Actions panels, or both.

## Platform context
- Source: Event Reporting BRD v1.0.0 - §3.1(10), §7.5, §10; story prefix `US-NOT-`.
- Modules involved: notification engine, My Alerts, My Actions, Notification Settings, My Notifications preferences.
- Platform contracts reused: platform notification engine for all dispatch (never direct SMTP from the UI layer); approved the organization email template; role/scope model for payload filtering and deep-link authorisation; Action Management Platform for action-assignment and action-overdue work (actions are monitored in the Action Management Platform application).
- Clearing semantics worth building carefully: Initial Review notifications use a claim-and-release pattern (fan-out to all pillar managers, cleared for all once any one acts - not per-user dismissal); Owner notifications clear after investigation and action plan are closed.

## User stories
1. US-NOT-01 - As a participant in the event workflow, I want to be told when something needs me, so that the event keeps moving without anyone chasing it manually.
2. US-NOT-02 - As a Site Admin, I want to decide which teams hear about which events, so that a night-shift near-miss reaches the night-shift supervisor and not everyone on site.
3. US-NOT-03 - As an EHS Manager on a shift with several managers, I want the review request to clear for everyone once one of us takes it, so that two managers never review the same event.
4. US-NOT-04 - As any user, I want control over what reaches me and how often, so that I stay informed without my inbox becoming unusable.
5. US-NOT-05 - As a Site Admin, I want rules to open read-only and require an explicit switch to edit, so that I cannot change a rule by accidentally touching a dropdown.
6. US-NOT-06 - As a recipient, I want the email to look official and take me straight to the record, so that I can act in one click rather than searching for the event.

## Scope
- IN (MVP, §13): US-NOT-01 Lifecycle Notifications; US-NOT-03 Claim an Initial Review; US-NOT-04 My Notification Preferences; US-NOT-05 View / Update Modes (Notification Rules Update); US-NOT-06 Usable Email.
- OUT (MVP, §13): US-NOT-02 Configure Submission Rules; all rule configuration pages except Update and My Preferences; the Notification Settings entry point in the Global Shell (deferred).

## Functional requirements (EARS)
- FR-1: WHEN a lifecycle trigger fires THEN the system SHALL notify the recipients on the stated channel per the table below. (from US-NOT-01)

| Trigger | Recipients | Channel |
|---|---|---|
| Event submitted | Configured recipients (Department/Team/Level/HPR threshold) | Email + My Alerts |
| Initial Review completed | Event Owner | Email + My Alerts |
| Owner assigned | Owner | Email + My Alerts |
| Action assigned | Each assignee | Email + My Actions |
| Action overdue | Assignee + Manager + Owner | Email |
| All actions completed | Owner | Email + My Alerts |
| Final Review ready | Final Reviewer | Email + My Alerts |
| Safety Warning published | regional governance office recipients | Email |
| Record reworked | Owner | Email + My Alerts |

- FR-2: WHEN any notification is generated THEN the system SHALL dispatch it through the platform's notification engine, never via direct SMTP from the UI layer. (from US-NOT-01 / US-NOT-06)
- FR-3: WHEN an event is saved as a draft THEN the system SHALL fire no notification. (from US-NOT-01)
- FR-4: WHEN a Site Admin configures submission notification rules THEN the system SHALL scope each rule per pillar and SHALL allow targeting by Department & Team/Shift, by specific Event Levels, and by a High-Risk threshold such that notification fires when the event level is at or below the configured threshold (e.g. all TF1-TF3). (from US-NOT-02; out of MVP)
- FR-5: WHEN an event is submitted THEN the system SHALL resolve all matching submission rules into a single deduplicated recipient list. (from US-NOT-02)
- FR-6: WHEN an event is submitted THEN the system SHALL notify all Manager-role users in that pillar of the pending Initial Review. (from US-NOT-03)
- FR-7: WHEN any one manager completes the Initial Review THEN the system SHALL clear the review notification from every pillar manager's My Alerts, not only the acting manager's. (from US-NOT-03)
- FR-8: WHEN an event's investigation and action plan are both closed THEN the system SHALL clear the Owner's related notifications. (from clearing semantics, §10.3)
- FR-9: WHEN a user opens My Notifications THEN the system SHALL allow selecting which event categories they receive, choosing a delivery type of immediate, daily digest or weekly digest, and opting in or out of each optional notification type. (from US-NOT-04)
- FR-10: WHEN a user has opted out of a notification type THEN the system SHALL suppress that notification on every send, including email. (from US-NOT-04 / US-NOT-06)
- FR-11: WHEN Notification Settings is opened THEN the system SHALL present View mode with a read-only summary and all dropdowns disabled, and WHEN the user switches to Update mode THEN the system SHALL grant full edit access. (from US-NOT-05)
- FR-12: WHEN changes are made in Update mode THEN the system SHALL persist them only on an explicit Save, and WHEN the user leaves without saving THEN the system SHALL apply no change. (from US-NOT-05)
- FR-13: WHEN a notification email is sent THEN the system SHALL use an approved the organization email template and SHALL include a direct deep-link to the relevant event record. (from US-NOT-06)
- FR-14: WHEN a notification deep link is opened THEN the system SHALL run an authorisation check so that a link forwarded outside the recipient's scope fails at open. (from US-NOT-06)
- FR-15: WHEN notification content is composed THEN the system SHALL include no event data outside the recipient's business/plant/pillar scope, and WHEN a Safety Warning notification is sent to regional governance office recipients THEN the system SHALL carry anonymised content only - see [Safety Communication](../07-safety-communication/Safety%20Communication.md). (from Security notes)

## Non-functional requirements
- Security: payloads scope-filtered so a recipient cannot learn of out-of-scope events; deep links re-authorised at open; Safety Warning content anonymised for regional governance office.
- Reliability: all delivery through the platform notification engine; opt-outs honoured on every send.
- Branding/usability: approved the organization email template; one-click deep link to the record.

## Acceptance criteria (testable)

US-NOT-01 - Be Notified at Each Lifecycle Step
- [ ] Given a lifecycle trigger in the FR-1 table fires, when dispatch runs, then the stated recipients are notified on the stated channel.
- [ ] Given a notification is generated, when it is sent, then it goes through the platform's notification engine.
- [ ] Given an event is saved as a draft, when the save completes, then no notification fires.

US-NOT-02 - Configure Who Gets Told on Submission (out of MVP)
- [ ] Given I configure submission rules, when I create one, then it is scoped per pillar.
- [ ] Given I build a rule, when I set targeting, then Department & Team/Shift targeting is available.
- [ ] Given I build a rule, when I set a High-Risk threshold, then notification fires when the event level is at or below the configured threshold (e.g. all TF1-TF3).
- [ ] Given I build a rule, when I set targeting, then specific Event Levels can be targeted.
- [ ] Given an event is submitted, when multiple rules match, then they resolve into a single deduplicated recipient list.

US-NOT-03 - Claim an Initial Review Without Duplicating Work
- [ ] Given an event is submitted, when notifications fan out, then all Manager-role users in that pillar are notified.
- [ ] Given any one manager completes the Initial Review, when the review is saved, then the notification clears for all managers.
- [ ] Given the notification clears, when the other managers open My Alerts, then it has dimaintenance systempeared for every manager, not just the one who acted.

US-NOT-04 - Manage My Own Notification Preferences
- [ ] Given I open My Notifications, when I edit preferences, then I can select which event categories I receive notifications for.
- [ ] Given I set a delivery type, when I choose, then immediate, daily digest and weekly digest are offered.
- [ ] Given an optional notification type, when I toggle it, then I can opt in or out.
- [ ] Given I have opted out, when the engine sends that type, then it is suppressed for me on every send.

US-NOT-05 - View and Update Notification Rules Safely
- [ ] Given I open Notification Settings, when it renders, then it is in View mode with a read-only summary and all dropdowns disabled.
- [ ] Given I switch to Update mode, when the switch completes, then full edit access is granted.
- [ ] Given changes in Update mode, when I press Save, then they persist; given I leave without saving, then no change is applied.

US-NOT-06 - Receive a Usable Email
- [ ] Given any notification email, when it renders, then it uses an approved the organization email template and contains a direct deep-link to the relevant event record.
- [ ] Given any notification email, when it is dispatched, then it is sent via the platform's notification engine, never direct SMTP from the UI layer.
- [ ] Given I have opted out of that notification type, when the trigger fires, then no email is sent to me.
- [ ] Given a deep link is followed, when the record opens, then an authorisation check runs and a link forwarded outside my scope fails at open.

## Dependencies
- A-07: email infrastructure (SMTP relay or Microsoft Exchange) available for notification delivery.
- [Global Shell](../01-global-shell/Global%20Shell.md) - My Alerts / My Actions panels and the (deferred) Notification Settings entry point.
- [Event Creation](../03-event-creation/Event%20Creation.md) - submission trigger and draft semantics.
- [Review and Governance](../06-review-and-governance/Review%20and%20Governance.md) - Initial Review, Final Review and rework triggers.
- [Action Plan](../05-action-plan/Action%20Plan.md) - action assignment, overdue and completion triggers; actions are created through Action Management Platform.
- [Integrations](../12-integrations/Integrations.md) - Action Management Platform (US-INT-10).
- [Safety Communication](../07-safety-communication/Safety%20Communication.md) - Safety Warning publication trigger and anonymisation rule.
- [Configuration and Administration](../10-configuration-and-administration/Configuration%20and%20Administration.md) - Site Admin rights for rule management.

## Open questions
- [OPEN]: The BRD does not say which notification triggers are mandatory versus optional, so the scope of US-NOT-04's opt-out is undefined - an operator who opts out of "Action assigned" would silently stop receiving work. Define the mandatory list before build.