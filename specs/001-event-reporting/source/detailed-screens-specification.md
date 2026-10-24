# Feature 015: Detailed Screens Specification

## Goal
Define every screen of the Event Reporting (Event Reporting) module across mobile and desktop so that each user role can perform their event-lifecycle tasks on the platform best suited to their working context.

## Why
Frontline workers need fast, touch-optimized capture in the field, while office-based roles need comprehensive analytical, administrative, and long-form tools. Splitting the UI into mobile-focused flows and desktop-focused dashboards closes the operational gap between the plant floor and management, and drives adoption, usability, and data-gathering speed (mobile reporting target: under 3 minutes for simple, low-severity events).

## Platform context
- Modules involved: Event Reporting (Event Reporting) — Global Shell, Event Library, Event Creation, Investigation, Action Plan, Review and Governance, Configuration and Administration, Event Sharing Hub.
- Platform contracts reused: the organization global directory (people search), EHS Employee Directory and enterprise operations platform Core Groups, maintenance system maintenance integration (equipment tags, priority codes), Risk Assessment tool Potential Risk Queue, the platform master data service (Event Reporting plants), native mobile device capabilities (camera, GPS/WiFi positioning, QR scanning, speech-to-text).
- Naming rule: a screen keeps the same name on mobile and desktop — only the ID prefix (`SCR-MOB` / `SCR-DSK`) changes per platform. Screen names match the feature names in [features/README.md](features/README.md).

### Screen inventory (Screen ↔ Feature mapping)

| Screen Name | Feature | Mobile | Desktop |
| :--- | :--- | :---: | :---: |
| Personal Dashboard | [01 – Global Shell](features/01-global-shell/Global%20Shell.md) | SCR-MOB-04 | — |
| Event Library | [02 – Event Library](features/02-event-library/Event%20Library.md) | — | SCR-DSK-02 |
| Event Creation | [03 – Event Creation](features/03-event-creation/Event%20Creation.md) | SCR-MOB-01 | SCR-DSK-01 |
| Investigation | [04 – Investigation](features/04-investigation/Investigation.md) | — | SCR-DSK-04 |
| Action Plan | [05 – Action Plan](features/05-action-plan/Action%20Plan.md) | SCR-MOB-02 | SCR-DSK-05 |
| Review and Governance | [06 – Review and Governance](features/06-review-and-governance/Review%20and%20Governance.md) | SCR-MOB-03 | SCR-DSK-03 |
| Configuration and Administration | [10 – Configuration and Administration](features/10-configuration-and-administration/Configuration%20and%20Administration.md) | — | SCR-DSK-06 |
| Event Sharing Hub | [13 – Event Sharing Hub](features/13-event-sharing-hub/Event%20Sharing%20Hub.md) | SCR-MOB-05 | SCR-DSK-07 |

### Platform routing matrix by step and capability

| Event Stage / Category | Capability | Mobile | Desktop | Rationale |
| :--- | :--- | :---: | :---: | :--- |
| Phase 1: Submission | Under-3-min guided form | Yes (Primary) | Yes | Mobile captures field evidence first-hand; desktop supports retroactive / on-behalf submissions. |
| | Media attachment and mark-up | Yes (Exclusive) | No | Mobile uses the device camera on site; desktop only needs a standard upload input. |
| | Physical plant structure locating | Yes (GPS/QR) | Yes (Manual) | Mobile uses geolocation and QR codes; desktop uses searchable drop-down trees. |
| Phase 2: Review | Self-assignment (pull/push) | Yes | Yes | "Tap to claim event" from notifications. |
| | Side-by-side duplicate finder | No | Yes (Exclusive) | Multi-window comparison is too wide for mobile viewports. |
| | Detailed event classification | No | Yes (Exclusive) | High cognitive workload; SAF / ENV / IR indexing belongs in an office. |
| Phase 3: Root Cause | Root cause authoring (Fishbone / 5Why / 6M) | No | Yes (Exclusive) | Branching models cannot be built on small touch screens. |
| | RCA read-only summary | Yes | Yes | Reference during shift huddles. |
| | Team recruitment | No | Yes (Exclusive) | Assigning multiple investigators from directory trees needs large displays. |
| Phase 4: Action Plans | My tasks tracker (assignees) | Yes (Primary) | Yes | Keeps assignees connected to items while working. |
| | Fast resolution upload (proof photo) | Yes (Exclusive) | No | Assignees capture resolved issues on site to close actions. |
| | Gantt and multi-task sequencing | No | Yes (Exclusive) | Multi-dependency organization needs desktop-scale precision. |
| | maintenance system maintenance integration setup | No | Yes (Exclusive) | High-complexity PM notification setup requires multiple input columns. |
| Phase 5: Validation | Two-tap validator checklist | Yes | Yes | Quick validation by reviewers on daily walks. |
| | Auditing and safety warnings | No | Yes (Exclusive) | Requires deep document scrutiny and official sign-off logs. |
| Supporting | Event Library global grid filter | No | Yes (Exclusive) | Advanced search filters do not fit a phone viewport. |
| | Personal to-do feed | Yes (Primary) | Yes | Individual lists, active tasks, notifications. |
| | Configuration and admin panel | No | Yes (Exclusive) | Security and governance settings remain desktop-only. |

## User stories
1. As a frontline worker, I want to report an event on mobile in under 3 minutes, with photo mark-up and QR/GPS location, so that field evidence is captured immediately and accurately.
2. As an EHS manager or shift leader, I want a full desktop event creation form (including reporting on behalf of others) so that retroactive and long-form submissions are complete.
3. As an action assignee, I want to track my assigned actions on mobile and close them with a completion photo so that resolutions are proven, not "ghost completions".
4. As a reviewer or shift leader, I want to claim an event and submit validation decisions from mobile during floor walks so that governance keeps pace with operations.
5. As any user, I want a mobile personal dashboard summarizing my open events, open actions, sharing inbox, and drafts so that I know what needs my attention.
6. As a reviewer or regional coordinator, I want a desktop event library with KPIs, advanced filters, and bulk actions so that I can manage large event volumes efficiently.
7. As a reviewer, I want a desktop triage workspace (validity assessment, classification, severity matrix, investigator assignment) so that valid events are routed correctly.
8. As an investigator, I want desktop 5Why and 6M Fishbone tools with a risk-assessment gap check so that root causes are documented and risk signals reach the Risk Assessment tool.
9. As an action manager, I want a desktop action planner with a Gantt scheduler and maintenance system asset links so that multi-task plans are sequenced and connected to maintenance.
10. As a super admin, I want a desktop configuration panel for workflows, form fields, and roles so that governance is administered centrally.
11. As a site admin or EHS manager, I want a sharing hub (mobile inbox and desktop browse/subscription tools) so that my site can learn from other plants' events and verify similar risks locally.

## Scope
- IN: the 5 mobile screens (SCR-MOB-01 to 05) and 7 desktop screens (SCR-DSK-01 to 07) listed in the screen inventory; platform routing rules per capability; per-screen fields and observable behavior.
- OUT: mobile access to duplicate finding, detailed SAF/ENV/IR classification, root cause authoring, investigator team recruitment, Gantt sequencing, maintenance system integration setup, audit sign-off, Event Library grid filters, and configuration/administration (all desktop-exclusive per the routing matrix); desktop media mark-up capture and proof-photo capture (desktop uses standard upload only); the business rules of each feature (owned by the feature specs 001–014); visual design system details (colors, typography, component styling); authentication, SSO, MFA, session management, password storage, and account-lock propagation.

## Functional requirements (EARS)

### Screen: Event Creation — mobile (SCR-MOB-01)
- FR-1: WHEN a user starts mobile event creation THEN the system SHALL present a guided 3-step form with cancel control and progress indicator, offering one-tap selection of a pillar (Health & Safety, Environment, Industrial Risks (IR), Occupational Illness) and of a level (Level 1 to 5) described in user-friendly language (e.g. "Level 4: Near Miss - Something occurred but nobody was hurt").
- FR-2: WHEN pillar Industrial Risks (IR) and level SRE1 or SRE2 are selected THEN the system SHALL require a Yes/No answer to "Could this be an CRP? (Critical Risk Potential)" with a brief definition, immediately after the level choice.
- FR-3: WHEN pillar Industrial Risks (IR) and level SRE3, SRE4, or SRE5 are selected THEN the system SHALL require a Yes/No answer to "Could this be a SRP? (Serious Risk Potential)" with a brief definition, immediately after the level choice.
- FR-4: WHEN pillar Health & Safety or Environment is selected with a level THEN the system SHALL require a Yes/No answer to "Could this be an HPR?" immediately after the level choice.
- FR-5: WHEN the user scans a station QR code THEN the system SHALL auto-fill Plant, Department, Workshop, and Workstation.
- FR-6: WHEN the user requests a location recommendation THEN the system SHALL use device GPS/WiFi positioning to suggest the closest sectors, keeping manual dropdown selection available as override.
- FR-7: WHEN the user captures a photo THEN the system SHALL open it full-screen for finger mark-up (e.g. circling hazard spots in red/yellow) before attaching it to the event.
- FR-8: WHEN the user enters the event description THEN the system SHALL offer speech-to-text input alongside the text area.
- FR-9: WHEN the user taps [Report Event] with all required inputs complete THEN the system SHALL submit the event.

### Screen: Action Plan — mobile (SCR-MOB-02)
- FR-10: WHEN an assignee opens the mobile action list THEN the system SHALL display their action cards with urgency color (red = high-priority/overdue, yellow = approaching), short title, origin event type, location (Department / Workshop / Machine), and target completion date, filterable by `Overdue`, `Pending`, `Completed` and searchable.
- FR-11: WHEN an assignee expands an action card THEN the system SHALL display the full action description, the linked maintenance system equipment code and maintenance system priority code when present, and the chat-style comment thread between Reviewer and Assignee.
- FR-12: WHEN an assignee completes a high-priority action THEN the system SHALL require a completion photo captured with the device camera before the action can be marked completed.
- FR-13: WHEN an assignee taps [Mark Completed] THEN the system SHALL record the action as completed.

### Screen: Review and Governance — mobile (SCR-MOB-03)
- FR-14: WHEN a user opens an event that has no assigned reviewer THEN the system SHALL display a [Claim Reviewer Role] control.
- FR-15: WHEN a user claims the reviewer role THEN the system SHALL assign them as the exclusive Event Reviewer, move the event from `Open` to `In Progress`, grant them validation and investigator-assignment privileges, and display "You are the assigned Reviewer/Validator for this event".
- FR-16: WHEN the reviewer opens the event reference THEN the system SHALL display the event description, category, CRP/SRP potential risk context, and the photos/videos captured at submission.
- FR-17: WHEN the reviewer opens the actions checklist THEN the system SHALL list all actions registered under the event, and tapping an action SHALL show its details and the proof-of-accomplishment photo taken by the assignee.
- FR-18: WHEN the reviewer submits a validation decision THEN the system SHALL record the choice ([Approved] or [Reject & Reopen]) together with validation comments / rework instructions.

### Screen: Personal Dashboard — mobile (SCR-MOB-04)
- FR-19: WHEN a user opens the personal dashboard THEN the system SHALL display their profile name, a plant selector, a real-time alert notifications icon, and summary counters for `My Open Events` (reported by the user, in review), `My Open Actions` (assigned to the user), `Sharing Inbox` (unreviewed subscribed risk events from other plants), and `Drafts` (unsubmitted offline cache).
- FR-20: WHEN site-wide Safety Alerts or local safety news are published THEN the system SHALL display them in a scrollable broadcast feed on the dashboard.
- FR-21: WHEN a user navigates the mobile app THEN the system SHALL provide a persistent 4-tab navigation: Home, Report New, My Actions, Notifications.

### Screen: Event Sharing Hub — mobile (SCR-MOB-05)
- FR-22: WHEN a site admin opens the shared events inbox THEN the system SHALL display shared event cards — origin plant and BU code, pillar and category (e.g. TF1 - Lost Time, SRE1 with CRP confirmation), anonymized event statement, and core hazard description — filterable by `Unread`, `Verification Active`, `Archived`.
- FR-23: WHEN the user taps [Mute Shared Event] THEN the system SHALL archive the item from the local inbox.
- FR-24: WHEN the user taps [Verify Locally] THEN the system SHALL create a local preventative action, pre-filling the hazard parameters so the site can inspect its own workstations.

### Screen: Event Creation — desktop (SCR-DSK-01)
- FR-25: WHEN a user opens desktop event creation THEN the system SHALL present the full form organized by domains (Categorization, Basic Data, Target Location, Job Context, Witness/Employee Statement, Action Checklist) with a progress overview of the sections.
- FR-26: WHEN a pillar (Health & Safety, Environment, Industrial Risks (IR), OH) and a level (TF1–TF5, EvE1–EvE4, SRE1–SRE5) are selected on desktop THEN the system SHALL apply the same conditional required questions as FR-2, FR-3, and FR-4 (CRP for SRE1–SRE2, SRP for SRE3–SRE5, HPR for Health & Safety and Environment).
- FR-27: WHEN the user enables "Report on behalf of others" THEN the system SHALL reveal an autocomplete person search connected to the organization's global directory.
- FR-28: WHEN the user sets the event location THEN the system SHALL provide pickers for Plant, Area, Workshop, physical Equipment hierarchy, and Process step.
- FR-29: WHEN the user records witness information THEN the system SHALL provide file upload plus separate rich-text blocks so each witness testimony is captured separately.

### Screen: Event Library — desktop (SCR-DSK-02)
- FR-30: WHEN a user opens the Event Library THEN the system SHALL display KPI summary cards of outstanding event volumes per category (SAF, ENV, IR, OH), with active CRP and SRP counts highlighted separately.
- FR-31: WHEN a user filters the library THEN the system SHALL support multi-select filters (Plant, Family, Severity Level, date ranges, Status: Open / In Progress / Archived / Closed), a "Verify Only My Events" toggle, advanced filters (CRP Yes/No, SRP Yes/No, Integration Sync State covering the platform master data service, maintenance system, and Risk Assessment tool statuses), and a keyword query field.
- FR-32: WHEN a user triggers a library action THEN the system SHALL provide [Export Excel/PDF], [Bulk Assign Reviewer], and [Go to Event Sharing Hub].
- FR-33: WHEN a user selects a row in the paginated event grid THEN the system SHALL open a quick-view side panel with the event files, summaries, checklist milestones, and direct navigation links, without leaving the list view.

### Screen: Review and Governance — desktop (SCR-DSK-03)
- FR-34: WHEN an event is unclaimed THEN the system SHALL display the banner "This event is waiting for a reviewer." with an [Assign Myself as Reviewer & Validator] button.
- FR-35: WHEN a user assigns themself as reviewer THEN the system SHALL restrict review, validation, and investigator-assignment actions to that user (global super admins excepted) and move the event status to `In Progress`.
- FR-36: WHEN the reviewer opens the event THEN the system SHALL display the original submission (summary, report date, reporter metadata, description, CRP/SRP potential risk evaluations, photos/videos) alongside the triage form.
- FR-37: WHEN the reviewer assesses validity as `No (Invalid)` THEN the system SHALL require an invalidation reason (`Duplicated`, `Useless`, or `Bad Quality`), and on save SHALL set the event status to `Archived` and notify all persons related to the event (Reporter, Local EHS, reviewers, other stakeholders) by email/system notification.
- FR-38: WHEN the reviewer assesses validity as `Yes (Valid)` THEN the system SHALL expose the classification blocks: Standard, Hazards, Body Parts, Injuries, and the Risk Severity Matrix selectors.
- FR-39: WHEN the reviewer rates severity THEN the system SHALL provide a clickable dual-axis matrix mapping Actual vs. Potential severity.
- FR-40: WHEN the event is a High Potential Red Event (or TF1–TF3 / SRE1–SRE2) THEN the system SHALL indicate that RCA assignment is required as the next step.
- FR-41: WHEN the event is Low Potential (or SRE3–SRE5 / EvE3–EvE5 / TF4–TF5) THEN the system SHALL offer the choice "Do you wish to organize a full Root Cause Analysis? Yes/No".
- FR-42: WHEN the reviewer assigns investigators THEN the system SHALL provide multi-select search over the EHS Employee Directory, drawing from individual plant accounts and pre-configured enterprise operations platform Core Groups (e.g. the cluster electrical safety team).
- FR-43: WHEN the final validator field is shown THEN the system SHALL pre-populate it with the self-assigned reviewer, adjustable if delegating authority is allowed.

### Screen: Investigation — desktop (SCR-DSK-04)
- FR-44: WHEN an investigator opens the investigation workspace THEN the system SHALL let them switch between a [5Why Analytical Panel] and a [6M Fishbone Visual Canvas].
- FR-45: WHEN using the 5Why panel THEN the system SHALL chain the question fields visually, allow adding further steps dynamically, and suggest guiding questions based on the previous answer.
- FR-46: WHEN using the 6M Fishbone canvas THEN the system SHALL present the six branches (Methods, Manpower, Milieu, Machinery, Materials, Measurement) and let the investigator attach contributing factors to a chosen branch.
- FR-47: WHEN the investigation progresses THEN the system SHALL maintain a summary panel of Systemic Learnings and gap-analysis checkpoints.
- FR-48: WHEN the investigator answers "Does this Event Reveal a Gap in an Existing Risk Assessment?" with Yes THEN the system SHALL require the choice `[Existing Risk]` (multi-select link to the site's live Risk Assessment IDs) or `[New Risk]` (text justification).
- FR-49: WHEN a risk-assessment gap is recorded and the event reaches validated Closure THEN the system SHALL translate the gap into a structured, anonymized risk signal (plant structure, hazard taxonomy, anonymized event statement) and transmit it to the Risk Assessment tool Potential Risk Queue, displaying the integration status progression `Pending Event Closure` → `Risk Signal Queued` → `Pushed to Risk Assessment tool Potential Risk Queue`.

### Screen: Action Plan — desktop (SCR-DSK-05)
- FR-50: WHEN a user creates an action THEN the system SHALL capture title, details, action owner, due date, and a deadline-lock option, with an optional maintenance system asset link (maintenance account, maintenance system equipment internal prototype, priority index).
- FR-51: WHEN a user schedules actions THEN the system SHALL plot them on an interactive Gantt view, supporting drag-based duration/date adjustments and drawing dependency connections between tasks.

### Screen: Configuration and Administration — desktop (SCR-DSK-06)
- FR-52: WHEN a non-admin user attempts to access Configuration and Administration THEN the system SHALL deny access; the screen is reserved for Super Admins and System Configurers.
- FR-53: WHEN an admin configures workflows THEN the system SHALL let them map states, approvals, and transition validations.
- FR-54: WHEN an admin configures forms THEN the system SHALL let them set fields as Active, Optional, or Mandatory conditioned on Pillar, Severity, or location.
- FR-55: WHEN an admin manages access THEN the system SHALL let them manage user roles and corporate team integration permissions, including importing investigator units originating from enterprise operations platform core groups.

### Screen: Event Sharing Hub — desktop (SCR-DSK-07)
- FR-56: WHEN a user opens the desktop hub THEN the system SHALL provide three areas: [Browse Hub] (corporation-wide shared events), [My Shared Contributions] (events shared by the host plant, with status and subscription telemetry), and [Subscription & Feeds Settings] (rule builder for incoming notifications).
- FR-57: WHEN a user browses shared events THEN the system SHALL show cards free of personal identifiers, filterable by BU, Region, Standard, and Hazard, and opening an item SHALL show the anonymized event statement, investigation summaries (5Why highlights, 6M takeaways), and corrective action lists in a peek view.
- FR-58: WHEN a user clicks [Adopt Actions Locally] / [Create Local Verification Tasks] THEN the system SHALL map the hazard characteristics and initiate a preventative action project locally.
- FR-59: WHEN a Site Admin defines subscription rules THEN the system SHALL support auto-pull rules based on operational profile (e.g. "pull events containing LOTO hazards or TF1 ratings into our local Sharing Inbox") and push alerts (e.g. "alert on any major SRE1/CRP incident within our BU").
- FR-60: WHEN a user opens the local inbox manager THEN the system SHALL list unread/unverified subscribed items with tools to assign supervisors for physical shop-floor verification walks.

## Non-functional requirements
- Performance: a simple, low-severity event is reportable on mobile in under 3 minutes end-to-end (hard KPI).
- Accessibility / usability: mobile screens use high contrast for outdoor/industrial visibility; selection cards use large touch targets (about 50px tap height); mobile layouts are optimized for one-handed thumb use on shop floors.
- Security: Configuration and Administration is locked behind admin authority controls; reviewer self-assignment locks review actions to the assigned user, super admins excepted.
- Availability / offline: mobile supports unsubmitted drafts (offline cache) surfaced on the Personal Dashboard.
- Privacy: all content in the Event Sharing Hub is anonymized (no personal identifiers in shared statements or cards).

## Acceptance criteria (testable)
- [ ] Given a frontline worker on mobile, when they report a simple low-severity event, then the full submission completes in under 3 minutes.
- [ ] Given the mobile creation form with pillar Industrial Risks and level SRE1 selected, when the level is chosen, then a required "Could this be an CRP?" Yes/No question appears immediately and submission is blocked until answered.
- [ ] Given a station QR sticker, when the reporter scans it in-app, then Plant, Department, Workshop, and Workstation are auto-filled.
- [ ] Given a captured photo on mobile, when the photo is taken, then a full-screen mark-up view opens and the annotated image is attached to the event.
- [ ] Given an event with no reviewer, when a user taps [Claim Reviewer Role], then the user becomes the exclusive reviewer, the event moves from `Open` to `In Progress`, and validation and investigator-assignment privileges are granted to them.
- [ ] Given a desktop reviewer marking an event `No (Invalid)` with reason `Duplicated`, when they save, then the event status becomes `Archived` and the Reporter, Local EHS, reviewers, and other stakeholders receive an email/system notification.
- [ ] Given a TF2 event, when triage completes, then the workflow router indicates RCA assignment is required; given a TF5 event, then an optional "organize a full Root Cause Analysis? Yes/No" choice is offered instead.
- [ ] Given an investigation with a confirmed risk-assessment gap, when the event reaches validated Closure, then an anonymized structured risk signal is pushed to the Risk Assessment tool Potential Risk Queue and the status shows `Pushed to Risk Assessment tool Potential Risk Queue`.
- [ ] Given a high-priority action on mobile, when the assignee tries to mark it completed without a completion photo, then completion is blocked until a photo is captured.
- [ ] Given the desktop Event Library, when a user filters by CRP = Yes and Status = In Progress, then only matching events are listed, and selecting a row opens the quick-view panel without leaving the list.
- [ ] Given desktop event creation with "Report on behalf of others" enabled, when the user types a colleague's name, then autocomplete results from the organization's global directory are offered.
- [ ] Given a shared event in the hub, when a site admin clicks [Adopt Actions Locally], then a local preventative action project is created with the hazard characteristics pre-filled.

## Dependencies
- Inherits lifecycle stages and statuses (Open / In Progress / Archived / Closed) from Feature 000: Core Event Lifecycle (core.md).
- The business rules behind each screen are owned by the feature specs: 001 Global Shell, 002 Event Library, 003 Event Creation, 004 Investigation, 005 Action Plan, 006 Review and Governance, 010 Configuration and Administration, 013 Event Sharing Hub (see the screen inventory links).
- External/platform services: the organization global directory, EHS Employee Directory and enterprise operations platform Core Groups, maintenance system maintenance integration, Risk Assessment tool Potential Risk Queue, the platform master data service.

## Open questions
- [OPEN]: This spec spans multiple features; propose splitting screen requirements into the owning feature specs (001–014).
- [OPEN]: Confirm approved neutral labels for the upstream master data service.
- [OPEN]: The Occupational Illness pillar has no conditional post-level question specified (CRP/SRP apply to IR; HPR applies to Health & Safety and Environment) — confirm whether OH requires one.
- [OPEN]: The source labels the mobile dashboard counters "Three simple summaries" but lists four (My Open Events, My Open Actions, Sharing Inbox, Drafts) — confirm the intended set.
- [OPEN]: "Final Validator adjustable if delegating authority is allowed" — the condition under which delegation is allowed is not defined.
- [OPEN]: The threshold defining a "high-priority" action that requires a completion photo is not specified.
- [OPEN]: Desktop level catalogs are stated as TF1–TF5, EvE1–EvE4, SRE1–SRE5, but routing rules elsewhere reference EvE5 — confirm the ENV level range.
