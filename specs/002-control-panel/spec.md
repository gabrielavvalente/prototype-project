# Feature Specification: Control Panel — workflow and master data per pillar

**Feature Branch**: `002-control-panel`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "One control panel per pillar (Health & Safety, Environment, Industrial
Risk, Industrial Hygiene) that holds the event workflow and the master data, applying control
according to the user's configuration level: Central, Cluster, Local. Workflow phases Submission,
Review, Root cause analysis, Actions, Validation, per pillar and per level, each Optional or Required
(Optional = skipped automatically; Submission always Required). A level can only add Required; what
a higher level made Required is locked below and shows who set it. Changes apply to new events
only. Users with access to the same plant can change a setting someone else made (shown, original
user notified, no blocking in the MVP). When Review is Required, a group of reviewers must be
defined. Master data: Safety = Standards, Hazards, Body Parts, Injuries; Environment = Aspects,
Impacts; Industrial Risk = Categories (Industrial Hygiene master data later)."

**App folders**: `apps/control-panel/` (new, separate app), `apps/user-management/` (new,
separate app, read-only users) and `apps/event-reporting/` (reads the configuration; small changes
at submission)

**Sources** (in [../001-event-reporting/source/Control Panel/](../001-event-reporting/source/Control%20Panel/)):
[master-data-control.md](../001-event-reporting/source/Control%20Panel/master-data-control.md)
(governance model, ownership vs access),
[standard.md](../001-event-reporting/source/Control%20Panel/standard.md),
[hazard.md](../001-event-reporting/source/Control%20Panel/hazard.md),
[body-part.md](../001-event-reporting/source/Control%20Panel/body-part.md),
[injury.md](../001-event-reporting/source/Control%20Panel/injury.md),
[aspect-impact.md](../001-event-reporting/source/Control%20Panel/aspect-impact.md),
[industrial-risk-category.md](../001-event-reporting/source/Control%20Panel/industrial-risk-category.md);
lifecycle phases from [core.md](../001-event-reporting/source/core.md).

## Clarifications

### Session 2026-10-24

- Q: May a higher level change or remove a setting made at a lower level? → A: No. Settings are
  changed only by people at the same level; a higher level only adds Required on top (option A).
- Q: Is the Control Panel part of the Event Reporting app? → A: No. It is a **separate app**,
  because the other apps of the monorepo will use the same configuration and content. Users,
  plants, roles, master data and workflow settings are shared platform data that every app reads;
  all apps are opened from one address so they see the same data on the device.
- Q: How is the resulting workflow shown? → A: The Workflow tab has a **Settings** view (what my
  level sets) and a **Result per plant** view (what applies, with who requires each phase, cell
  details and a preview of an event's path).
- Q: Is user management included? → A: Yes, **read-only** for now: a users list and a user detail
  with their access and Control Panel roles. Editing access is a later feature.
- Q: Should user management be inside the Control Panel? → A: No. It is a **third app**, User
  Management, opened from the launcher like the others; it reads the same shared users, plants
  and roles. Same read-only scope and access rules as before.
- Q: What happens to an event when only Submission is Required? → A: It is **Closed** right after
  submission.

### Session 2026-10-25 (review)

- Q: Does a Site Admin of Event Reporting hold a Control Panel role? → A: Yes. A Site Admin is
  automatically a **Local** administrator for each pillar they see at their plant; a role already
  held on a pillar wins. User Management shows these roles as coming from the event role.
- Q: Are pillars shown in color? → A: Yes, with the same pillar colors in every app (User
  Management tags and role badges included).
- Q: How is the master data toolbar laid out? → A: Search, "Availability for", Export CSV, Import
  CSV and Create on one line.
- Q: Can master data be exported and imported? → A: Yes. Everyone can export the values shown as
  CSV; those who can add values to the list can import a CSV with the same columns.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set which workflow phases are required (Priority: P1)

A Central administrator of the Health & Safety pillar opens the Control Panel and sees a grid:
one row per level (TF1 … TF5) and one column per phase (Submission, Review, Root cause analysis,
Actions, Validation). Submission is always Required. They make Review Required for TF1–TF3 and,
because Review is now Required, choose the group of reviewers. A Cluster administrator responsible
for Lyon and Porto then opens the same pillar: Review for TF1–TF3 appears locked ("Required by
Central — set by …"), and they make Root cause analysis Required for TF1–TF2 for their plants. A
Local administrator in Lyon sees both as locked and makes Actions Required for TF3 at Lyon only.
Each of them can see, for any plant they cover, the resulting workflow.

**Why this priority**: The workflow decides which lifecycle phases every new event goes through;
all following features (Review, Root cause analysis, Actions, Validation) read it.

**Independent Test**: With the demo Central, Cluster and Local administrators, set the example
above and check that each plant's resulting workflow matches the combination rule, that locked
cells cannot be switched off, and that a new event stores the workflow in force when it was
submitted.

**Acceptance Scenarios**:

1. **Given** I hold a Control Panel role on a pillar, **When** I open its Workflow tab, **Then** I
   see one row per level of that pillar and one column per phase, with Submission shown as
   Required and not changeable.
2. **Given** I am Central, **When** I make a phase Required for a level, **Then** it becomes
   Required at every plant for that pillar and level, and lower levels see it locked with my name
   and the date.
3. **Given** I am a Cluster administrator, **When** I make a phase Required, **Then** it applies to
   the plants of my perimeter only; cells already Required by Central are locked for me.
4. **Given** I am a Local administrator, **When** I make a phase Required, **Then** it applies to my
   plant only; cells Required by Central or by a Cluster covering my plant are locked for me.
5. **Given** I made a phase Required, **When** I switch it back to Optional and no higher level
   requires it, **Then** it becomes Optional again for the plants concerned.
6. **Given** I make Review Required, **When** I try to save without choosing reviewers, **Then**
   saving is refused until at least one reviewer is chosen.
7. **Given** a setting was made by another person at my level for a plant I also cover, **When** I
   change it, **Then** the change is saved, the setting now shows me as the author, and the
   original person gets a notification describing the change.
8. **Given** a plant's workflow changed, **When** events are submitted afterwards, **Then** they
   follow the new workflow, while events submitted before keep the workflow they were submitted
   with.
9. **Given** I open **Result per plant** and choose a plant, **When** the grid shows, **Then** each
   cell says Required or Optional, and each Required cell says which level requires it; opening a
   cell shows every level requiring it, who set it and when, and the reviewers for Review.
10. **Given** I chose a level row in Result per plant, **When** I look under the grid, **Then** I see
    the path an event of that level takes at that plant, with skipped phases crossed out.
11. **Given** only Submission is Required for a plant and level, **When** an event of that level is
    submitted there, **Then** it is Closed right away.

---

### User Story 2 - Maintain the master data lists of a pillar (Priority: P2)

A Central administrator of Health & Safety maintains the global Standards and Hazards (add, edit,
deactivate, retire) and the fixed global Body Parts (by category) and Injuries. A Cluster
administrator adds a Hazard needed only by their plants and deactivates a Standard for their
perimeter. A Local administrator in Lyon deactivates two Hazards that do not exist on their site.
An Environment Central administrator does the same with Aspects and Impacts, and an Industrial
Risk Central administrator with Categories. Every list shows, for each value, who owns it (Central,
Cluster, Local), its status and whether it is active for the plant being viewed.

**Why this priority**: The review of events (next feature) classifies them with these lists, so
they must be governed before review is built; the workflow (Story 1) is needed first because it
decides whether review happens at all.

**Independent Test**: Load the initial catalogs, then check with each demo administrator which
actions are offered and refused for each list, and that the values a plant would offer to its
users are exactly the active, in-scope ones.

**Acceptance Scenarios**:

1. **Given** I am Central on Health & Safety, **When** I open Master data, **Then** I see Standards,
   Hazards, Body Parts and Injuries loaded with the initial global catalogs from the sources.
2. **Given** I am Central, **When** I add, edit, deactivate or retire a Standard, Hazard, Body Part
   or Injury, **Then** the change is saved and recorded in the audit trail.
3. **Given** I am a Cluster administrator, **When** I open Standards or Hazards, **Then** I can add
   values for my perimeter and edit, deactivate or retire the values my perimeter owns, but Central
   values are read-only for me except for deactivating them for my perimeter.
4. **Given** I am a Local administrator, **When** I open Standards, Hazards, Aspects, Impacts or
   Categories, **Then** I can only activate or deactivate values for my plant; adding, editing and
   retiring are not offered.
5. **Given** I am Cluster or Local, **When** I open Body Parts or Injuries, **Then** they are
   read-only (fixed global lists).
6. **Given** a Body Part, **When** it is saved, **Then** it must belong to exactly one Body Part
   Category, and it cannot be active while its category is inactive or retired.
7. **Given** a code (or a name, for lists without codes) already exists in the same list and
   scope, **When** I add a value with it, **Then** the save is refused.
8. **Given** I am an Industrial Risk administrator, **When** I open my panel, **Then** I see my
   Categories and, read-only, the Health & Safety Standards and Hazards that Industrial Risk events
   use, with "Owned by Health & Safety".
9. **Given** a value is retired, **When** a plant's list of selectable values is computed, **Then**
   the value is excluded everywhere but remains visible in the list with status Retired.

---

### User Story 3 - Know who can do what in the Control Panel (Priority: P3)

Only people who hold a Control Panel role see the Control Panel. Each role is held per pillar, at
one level, for a set of plants (all plants for Central, a chosen set for Cluster, one plant for
Local). Holding a role on Health & Safety gives no right on Environment. Every screen of the panel
says which level the user acts at and for which plants, and the audit trail shows every change.

**Why this priority**: Needed for Stories 1 and 2 to be safe, but its rules are simple once the
roles exist in the sample data.

**Independent Test**: Sign in as each demo user and check menu visibility, pillars offered, the
level and plants shown, and that the audit trail lists every change made in Stories 1 and 2.

**Acceptance Scenarios**:

1. **Given** I hold no Control Panel role, **When** I use the app, **Then** the Control Panel is
   not in the menu and opening its address shows the permission message.
2. **Given** I hold roles on some pillars only, **When** I open the Control Panel, **Then** only
   those pillars are offered, each with my level and plants shown.
3. **Given** I hold a role on two pillars, **When** I change settings in one, **Then** nothing in
   the other pillar is changeable through that role.
4. **Given** any workflow or master data change, **When** it is saved, **Then** the pillar's audit
   trail shows what changed, the previous and new value, who, when, and the level and plants
   concerned.

---

### User Story 4 - See users and their access (Priority: P4)

A Central administrator opens the **User Management** app and searches for a person. The list
shows each user's event role, plants, pillars and Control Panel roles. Opening a user shows all
their access in one place — which plants and pillars they can report and see, their Control Panel
roles with level and plants, and the review groups they belong to. A Cluster administrator sees
only the users of their plants.

**Why this priority**: Helps administrators understand who can do what (for example, before
choosing reviewers), but nothing else depends on it; editing access comes later.

**Independent Test**: With the sample data, check that the list, search, filters and user details
match each demo user's access, and that a Cluster administrator only sees users of their plants.

**Acceptance Scenarios**:

1. **Given** I open User Management, **When** the list loads, **Then** I see name, event role, plants, pillars
   and Control Panel roles of every user within my perimeter, with search by name and filters by
   plant, pillar and role.
2. **Given** I open a user, **When** the detail shows, **Then** I see their event access (plants and
   pillars), their Control Panel roles (pillar, level, plants) and the review groups they belong
   to.
3. **Given** I am a Cluster or Local administrator, **When** I open User Management, **Then** I only see users
   who have access to at least one of my plants.
4. **Given** any user screen, **When** I look for edit actions, **Then** there are none (read-only).

---

### Edge Cases

- **Higher level adds Required later**: a Local or Cluster setting that becomes Required at a
  higher level shows as locked by the higher level; the lower setting stays recorded and applies
  again if the higher one is switched back to Optional.
- **No phase Required**: if nothing besides Submission is Required for a plant and level, new
  events of that level complete after Submission (all other phases are skipped).
- **Review Required by several levels**: the reviewers available for an event are the reviewers
  of every setting that makes Review Required for that plant and level, limited to people who can
  see the event's plant and pillar.
- **Reviewer loses access**: a reviewer who no longer has access to a plant is simply not offered
  for that plant's events; the setting shows a warning so it can be updated.
- **Overlapping clusters**: when two Cluster administrators cover the same plant, the Required
  settings of both apply to that plant.
- **Cluster perimeter vs. one plant**: a Cluster setting applies to all plants of the perimeter;
  it cannot be limited to part of it (that is what Local is for).
- **Deactivated at Cluster, active at Local**: a value deactivated for a Cluster perimeter cannot
  be reactivated by a Local administrator of a plant in that perimeter.
- **Inactive parent**: deactivating or retiring a Body Part Category makes its Body Parts
  unavailable for new records too.

## Requirements *(mandatory)*

### Functional Requirements

**Separate app and shared configuration**

- **FR-024**: The Control Panel MUST be a separate app from Event Reporting; users, plants,
  location hierarchy, roles, workflow settings and master data MUST be shared platform data that
  Event Reporting (and future apps) read, so a change made in the Control Panel is seen by the
  other apps on the same device without copying anything.

**Access and levels**

- **FR-001**: The system MUST support Control Panel roles held per pillar (Health & Safety,
  Environment, Industrial Risk, Industrial Hygiene), at one level — Central (all plants), Cluster (a
  chosen set of plants) or Local (one plant) — independent of the event roles (User, Manager, Site
  Admin), except that a **Site Admin** is automatically Local for each pillar they see at their
  plant (a role already held on that pillar wins). *(Clarification 2026-10-25, review)*
- **FR-002**: Only users holding at least one Control Panel role MUST see the Control Panel; each
  user MUST see only the pillars they hold a role on, with their level and plants displayed.
- **FR-003**: A role on one pillar MUST grant no right on another pillar's workflow or master
  data.

**Workflow**

- **FR-004**: For each pillar, the Workflow tab MUST show one row per level of the pillar (TF1–TF5;
  EvE1–EvE5; SRE1–SRE5; the Industrial Hygiene disease types) and one column per phase:
  Submission, Review, Root cause analysis, Actions, Validation.
- **FR-005**: Each phase MUST be Optional or Required per pillar and level; Submission MUST always
  be Required and cannot be changed. Optional means the phase is skipped automatically.
- **FR-006**: A user MUST be able to make a phase Required, or switch their own level's Required
  back to Optional, for the plants their level covers.
- **FR-007**: For a given plant, pillar and level, a phase MUST be Required when Central, any
  Cluster covering the plant, or that plant's Local made it Required; otherwise it is Optional.
- **FR-008**: A phase made Required by a higher level MUST appear locked to lower levels, showing
  the level, the person and the date; lower levels MUST NOT be able to switch it to Optional.
- **FR-009**: When a setting at a user's level was made by another person and covers a plant the
  user also covers, the user MUST be able to change it; the setting then records the new author,
  and the original author MUST receive a notification with what changed and who changed it.
  Users MUST NOT change or remove settings made at another level, higher or lower: a higher level
  can only add Required on top of a lower level's settings.
- **FR-010**: Making Review Required MUST require choosing a group of at least one reviewer among
  the Managers and Site Admins who can see the plants concerned and the pillar.
- **FR-011**: The Workflow tab MUST offer a **Settings** view (cells of the user's level, editable
  per FR-006/FR-008) and a **Result per plant** view: for a chosen plant the user covers, each
  level × phase cell shows Required or Optional and, when Required, the level(s) requiring it;
  opening a cell shows every requiring setting with author, date and reviewers; choosing a level
  shows the path of an event of that level, with skipped phases crossed out.
- **FR-012**: Workflow changes MUST apply only to events submitted after the change; each event
  MUST keep the workflow (required phases and reviewers) in force at its submission.
- **FR-026**: When only Submission is Required for the event's plant and level, the event MUST be
  Closed right after submission (instead of Open); otherwise it is Open as today. *(changes
  001 FR-016 for this case)*

**Master data**

- **FR-013**: Each pillar MUST hold its own lists: Health & Safety — Standards, Hazards, Body Parts
  (each in a Body Part Category) and Injuries; Environment — Aspects and Impacts; Industrial Risk —
  Categories. Industrial Hygiene has no list in this feature.
- **FR-014**: The lists MUST start with the initial global catalogs from the sources (14
  Standards, 36 Hazards, 8 Body Part Categories with their Body Parts, 38 Injuries, 15 Aspects, 13
  Impacts, 11 Industrial Risk Categories).
- **FR-015**: Standards, Hazards, Aspects, Impacts and Industrial Risk Categories MUST follow this
  governance: Central adds, edits, activates/deactivates and retires global values; Cluster adds
  values for its perimeter, edits/retires the values its perimeter owns, and activates/deactivates
  any available value for its perimeter; Local only activates/deactivates available values for its
  plant.
- **FR-016**: Body Parts, Body Part Categories and Injuries MUST be fixed global lists maintained
  only by Central; Cluster and Local MUST see them read-only.
- **FR-017**: Every value MUST show its owner level (and owner perimeter or plant), its status
  (Active, Inactive, Retired) and whether it is available for the plant being viewed.
- **FR-018**: A value MUST be available to a plant only when it is Active, owned at a level that
  covers the plant, and not deactivated for that plant by Central, a covering Cluster, or the
  plant's Local; Retired values MUST be unavailable everywhere.
- **FR-019**: The system MUST refuse a value whose code (or name, for lists without codes) already
  exists in the same list and owner scope, and MUST refuse a value without a name; Standards,
  Hazards and Categories also require a code.
- **FR-020**: A Body Part MUST belong to exactly one Body Part Category, and MUST NOT be active
  while its category is inactive or retired.
- **FR-021**: The Industrial Risk panel MUST show the Health & Safety Standards and Hazards
  read-only, marked as owned by Health & Safety; no configuration of another pillar's list is
  possible from it.
- **FR-029**: The list screen MUST show search, the "Availability for" plant, Export CSV, Import
  CSV and Create on one line (wrapping on narrow screens). *(Clarification 2026-10-25, review)*
- **FR-030**: Anyone who sees a list MUST be able to export the values shown as a CSV file (code,
  name, description, category, owner, status, availability at the chosen plant). Those allowed to
  add values to the list MUST be able to import a CSV with the columns Code, Name, Description
  (and Category for Body Parts): a row with the code (or name) of one of their own values changes
  it, other rows add values, rows matching another level's value are skipped, and nothing is saved
  when any row is invalid (each problem listed with its line). Imported changes are audited.
  *(Clarification 2026-10-25, review)*

**User management (read-only)**

- **FR-027**: A separate **User Management** app MUST offer a read-only users list with name, event role,
  plants, pillars and Control Panel roles, searchable by name and filterable by plant, pillar and
  role; Central sees every user, Cluster and Local only users with access to at least one of their
  plants. Only users holding a Control Panel role can open it (as in FR-002). Pillars and roles
  are shown in their pillar's color; roles coming from the Site Admin event role are marked as
  such. *(Clarification 2026-10-25, review)*
- **FR-028**: Opening a user MUST show their event access (plants and pillars), their Control
  Panel roles (pillar, level, plants) and the review groups they belong to; no edit action is
  offered.

**Audit and notifications**

- **FR-022**: Every workflow and master data change MUST be recorded in the pillar's audit trail:
  what changed, previous and new value, who, when, level and plants concerned.
- **FR-023**: Notifications of changed settings (FR-009) MUST appear in the original author's
  notifications in the app.

### Key Entities

- **Control Panel role**: a user, a pillar, a level (Central / Cluster / Local) and the plants it
  covers (all, a set, or one).
- **Workflow setting**: pillar, level code (e.g., TF2), phase, scope (level and plants), Required
  flag, reviewer group (when the phase is Review), author and date.
- **Resulting workflow**: for a plant, pillar and level code, each phase's Required/Optional state
  with its origin; stored on each event at submission.
- **Master data list**: a list of a pillar (e.g., Hazards), whether it is fixed global, and
  whether it has codes.
- **Master data value**: list, code (where used), name, description, parent (Body Part Category
  for a Body Part), owner level and scope, status, author and dates.
- **Activation choice**: a value, a level and scope (Central, a Cluster perimeter or a plant) and
  whether the value is deactivated there.
- **Audit entry**: pillar, what changed, previous and new value, user, date and time, level and
  plants.
- **Notification**: a message to a user about a setting someone else changed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Central administrator makes a phase Required for three levels and chooses its
  reviewers in under 2 minutes.
- **SC-002**: For every plant, pillar and level in the sample data, the resulting workflow shown
  matches a manual application of the combination rule (100%).
- **SC-003**: In testing, a lower level never manages to switch off a phase Required by a higher
  level, and never manages to edit a value or list it is not allowed to.
- **SC-004**: The values available to each plant match a manual count from owners, statuses and
  activation choices (100%).
- **SC-005**: Every change made during testing appears in the audit trail with author, date,
  previous and new value.
- **SC-006**: An event submitted before a workflow change keeps its original workflow; one
  submitted after follows the new one (verified for each phase).

## Assumptions

- **Prototype simplifications (as in 001)**: demo users instead of real accounts; data kept on the
  demonstration device (now shared between the apps opened from the same address); English
  interface. Control Panel roles are given to demo users in the
  sample data (assigning roles from a screen is out of scope).
- **Sample data**: a Central administrator per pillar; a Cluster administrator for Health &
  Safety and Environment covering Lyon and Porto; Local administrators for Lyon and Curitiba; a
  starting workflow that demonstrates every case of the combination rule.
- **Levels of Industrial Hygiene**: its "levels" are its disease types (as in event creation).
- **Notifications**: shown in the existing notifications panel; no email.
- **Impact on event creation**: the form does not change. At submission the event stores its
  workflow (FR-012) and is Closed when only Submission is Required (FR-026); users, plants and the
  location hierarchy come from the shared platform data instead of the app's own sample data.
- **Constitution**: sharing data between apps opened from one address needs a small amendment
  (the constitution currently forbids anything with its own setup at the repository root); it is
  handled in the plan of this feature.
- **Consumption by events**: this feature stores the resulting workflow on each new event (FR-012)
  and computes the available values per plant (FR-018); using the lists in event screens
  (classification during review) and acting on the phases are part of the next features (Review
  and Governance, Root cause analysis, Action Plan, Validation).
- **Out of scope** (from the sources, kept for later): the Body Part → Injury relationship matrix
  and the Aspect → Impact association matrix (content not specified in the sources); import and
  export; translations; effective start/end dates; editing users and their access; "where used" before deactivating (no event uses
  these lists yet); value requests from lower levels; Industrial Hygiene master data (Diseases,
  Risks, PPEs, Means of control); Shared Contractor Directory; approval of Cluster additions by
  Central.
- **Governance of Aspects and Impacts**: the source does not define it; the common model of FR-015
  is used, as for Standards and Hazards.
