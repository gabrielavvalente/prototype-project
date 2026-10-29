# Change: Align the prototype with the business requirements (rules and roles)

**Feature Branch**: `014-requirements-alignment`

**Created**: 2026-10-29

**Input**: User description: "take into consideration the comments I made on the requirements and
review the app behaviour" — the remarks made on `specs/requirements/` (2026-10-29), split with the
user into this change (rules and roles) and a later one (Health & Safety holding the TF and OH
event types). Not changed in the prototype, by the user's choice: the attachment limits (they
protect the prototype's browser storage), the language selector, the User Management app.

**Capabilities**: changed: `specs/domain.md` (risk question, event roles, visibility),
`specs/capabilities/event-reporting.md` (ER-1, ER-5, ER-6, ER-8, ER-11, ER-13, ER-16, ER-20,
ER-21), `specs/capabilities/event-reporting-shell.md` (menus), `specs/capabilities/event-review.md`
(RV-2, RV-3), `specs/capabilities/root-cause-analysis.md` (RCA-7, RCA-10, RCA-18),
`specs/capabilities/action-plan.md` (AP-2, AP-10), `specs/capabilities/validation.md` (VAL-1,
VAL-2, VAL-6, VAL-7), `specs/capabilities/safety-communication.md` (SC-5 to SC-7, SC-10),
`specs/capabilities/notifications.md` (NT-3), `specs/capabilities/event-library.md` (EL-10,
EL-16), `specs/capabilities/platform-data.md` (demo events)

## Why

The requirements written for the development team changed some rules and made the Site Admin the
highest access on their plants; the prototype must show the same behavior to stay the reference.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Site Admin | The highest access on the events of their plants, every pillar: reports (also on behalf of someone else), corrects an event at any status, and acts on any step — review, root cause analysis, action plan and actions, validation, rework, Safety Warning — without being its reviewer, designated, owner, assignee or validator; never on a locked event (only a rework, which they may do) | Requirements 01 (RP-5, RP-8a) |
| Taking over a review | A Site Admin of the plant can assign themself even when another reviewer took the review; they become the reviewer | Default: follows "acts on any step" |
| Reporting on behalf, correcting Open events | Managers and Site Admins | Requirements 01 |
| Risk question | Only "Could this be a SIP?" (Safety, Environment); Industrial Risk events have none | Requirements 00, 02 |
| Location for EvE4, EvE5 | Department and workshop only, like TF4 and TF5 | Requirements 02 |
| Employee type and person involved | Required for TF1–TF3 only | Requirements 02 |
| Drafts | Their author can delete them | Requirements 02 |
| 5W1H | One "applicable?" question for the whole guide | Requirements 04 |
| Validation Yes | Closes at once, no extra confirmation | Requirements 06 |
| "Event submitted" | Also to the Site Admins who see the event | Requirements 10 |
| Not in this change | Health & Safety holding TF and OH (next change); attachment limits, language selector, User Management | User |

## Rules

### Changed — `domain.md`

- **Event roles** *(Site Admin)* "Site Admin — the highest access on the events of their plants,
  every pillar: as Manager, plus correct an event at any status and act on any step of any event
  (RP-8a of the requirements) — never on a locked event, which needs a rework first; manage the
  notifications of their plants." *(was: see, review, no reporting, no editing)* **Manager**:
  unchanged.
- **Visibility** *(submitted event)* People whose access includes the event's plant and pillar, and
  the Site Admins of its plant. *(was: plant and pillar only)*
- **Risk question** Only "Could this be a SIP?", for Health & Safety (Safety) and Environment.
  *(was: also CRP for SRE1–SRE2, SRP for SRE3–SRE5)*

### Changed — `event-reporting.md`

- **ER-1** *(who)* Users, Managers and Site Admins report. *(was: not Site Admins)*
- **ER-5** *(the question)* … the SIP question, for Health & Safety and Environment only; Industrial
  Risk and Industrial Hygiene events have none. *(was: CRP, SRP for Industrial Risk)*
- **ER-6** *(answer kept)* Changing the pillar clears the SIP answer; changing the level keeps it.
  *(was: depended on the question type)*
- **ER-8** *(location)* TF4, TF5, EvE4 and EvE5 need only department and workshop (task type
  optional). *(was: TF4 and TF5)*
- **ER-11** *(required)* The employee type and the person involved (the person, or their name) are
  required for TF1–TF3, optional for the other levels ("Choose the employee type." and the person's
  messages for TF1–TF3 only). *(was: every level)*
- **ER-13** *(reporter)* A Manager or a Site Admin can choose another reporter ("As a Manager or Site
  Admin you can report on behalf of someone else."). *(was: Managers)*
- **ER-16** *(delete)* The author can **Delete draft**, after "Delete this draft? It cannot be
  recovered.": the draft disappears ("Draft deleted."), nobody is alerted. A submitted event is never
  deleted. *(was: no deletion)*
- **ER-21** *(who and when)* A Manager or a Site Admin who can see the event corrects an **Open**
  event; a **Site Admin** of the event's plant also corrects it once reviewed (In Progress, Archived,
  Closed), unless it is locked (validation VAL-6); a correction after the review is recorded in the
  Record Historian. *(was: Managers, Open events only)*

### Changed — `event-reporting-shell.md`

- *(menus)* Site Admins have **Create event** like Users and Managers. *(was: not offered)*

### Changed — `event-review.md`

- **RV-2**, **RV-3** *(Site Admin)* A Site Admin of the event's plant can **Assign myself as reviewer**
  while Review is the current step, even when not among its reviewers and even when another reviewer
  took it — they then become the event's reviewer (the previous one is told nothing). *(was:
  configured reviewers, not taken by someone else)*

### Changed — `root-cause-analysis.md`

- **RCA-7** *(who)* … the designated users, the members of the designated groups **and the Site
  Admins of the event's plant**. *(was: designated people only)*
- **RCA-10** *(5W1H)* One question for the whole guide: "Is this section applicable to your event?"
  Yes / No. Yes shows the sections and their numbered questions (Who was injured? for Health &
  Safety only); Done when No, or Yes with every shown question answered. *(was: one question per
  section)*

### Changed — `action-plan.md`

- **AP-2** *(Site Admin)* The plant's Site Admins act as plan owners (prepare, deploy, cancel).
  *(was: owners only)*
- **AP-10** *(Site Admin)* A Site Admin of the plant can also change any deployed action as its
  assignee would. *(was: the assignee only)*

### Changed — `validation.md`

- **VAL-1** *(Site Admin)* The plant's Site Admins can validate too. *(was: the validators only)*
- **VAL-2** *(Yes)* Yes needs nothing more; "Confirm that no additional actions are needed." is no
  longer asked. *(was: a confirmation to tick)*
- **VAL-6** *(locked)* … nothing of it can be changed, by anyone — a Site Admin included. *(was:
  unchanged wording)*
- **VAL-7** *(rework)* The validators and the plant's Site Admins rework. *(was: validators)*

### Changed — `safety-communication.md`

- **SC-5**, **SC-6**, **SC-7**, **SC-10** *(Site Admin)* The plant's Site Admins see the Safety Warning
  draft, choose its photos and publish it, like the plan owners. *(was: plan owners only)*

### Changed — `notifications.md`

- **NT-3** *(Event submitted)* To the Managers **and Site Admins** who see the event and are not its
  reviewers. *(was: Managers)*

### Changed — `event-library.md`

- **EL-10** *(expanded card)* … the SIP answer (Health & Safety and Environment). *(was: the risk
  answer, SIP / CRP / SRP)*
- **EL-16** *(draft page)* Its author also has **Delete draft** (ER-16). *(was: Continue draft only)*

### Review remarks (2026-10-29)

- **MD-4**, **MD-7**, **MD-8**, **MD-10** *(no Retire)* Values are Active or Inactive only; the owner
  deactivates and reactivates ("Deactivate for all plants" / "for <plants>", "… no longer offered for
  new events; past events keep it."); nothing is deleted; values saved as Retired are Inactive. An
  event keeps the values chosen before their deactivation; an unfinished review lists them as "<name>
  (no longer available)", never offered for new choices. *(was: Retire, final)*
- **ER-21** *(review)* The assigned reviewer also corrects the report while the review is not
  completed. *(was: Site Admins only after the review began)*
- **EL-13** *(counts)* Reported events by type never count archived events. *(was: archived counted
  when the Status filter showed them)*
- **WF-11** *(unchanged, now tested)* A workflow change after an event's submission never changes its
  steps.

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`). Eva Novak is the Site Admin
of Lyon; Carla Mendes, Diego Laurent and Lucas Weber are Managers at Lyon; Ana Ribeiro is a User.

1. **Site Admin reports** — Eva sees Create event; she reports a TF4 at Lyon on behalf of Ana
   ("As a Manager or Site Admin you can report on behalf of someone else."), with only department and
   workshop and no employee type: submitted, Open, Ana is its reporter and gets "Event reported on
   your behalf"; its reviewers Carla and Diego get "Event to review", Lucas "Event submitted".
   (ER-1, ER-8, ER-11, ER-13, NT-3)
2. **Event submitted to Site Admins** — Ana submits a TF5 at Lyon (no Review: Closed at once): Eva gets
   "Event submitted", like Carla, Diego and Lucas. Ana submits an EvE4 at Lyon with department and
   workshop only: accepted. (ER-8, NT-3)
3. **Site Admin takes over a review** — Diego assigns himself to `TF-26-0003`; Eva still sees Assign
   myself as reviewer, takes it over and completes it as valid: the review shows Reviewer Eva Novak.
   (RV-2, RV-3)
4. **Site Admin on every step** — On an event at Root cause analysis designated to Diego, Eva edits
   and completes the analysis; at Actions she adds an action for Ana, deploys the plan and completes
   Ana's action; at Validation she answers Yes: the event is Closed and locked with no confirmation
   asked. She then finds every step read-only ("This event is closed and locked. Only a rework can
   reopen it."), reworks it, and can change it again. (RCA-7, AP-2, AP-10, VAL-1, VAL-2, VAL-6,
   VAL-7)
5. **Site Admin corrects after the review** — On `TF-26-0003` In Progress, Eva changes the title in the
   Submission step: saved, and the Record Historian lists Title before → after; Carla (Manager) cannot
   change it. (ER-21)
6. **Safety Warning** — On an event whose analysis is completed and plan deployed, Eva sees the draft
   ("Draft — ready to publish"), chooses a photo and publishes it. (SC-5 to SC-7, SC-10)
7. **No CRP / SRP** — Carla creates an SRE2 event: no risk question; `SRE-26-0001`'s expanded card shows
   no risk answer. (ER-5, EL-10)
8. **Delete a draft** — Ana opens her draft "Hand caught in press, glove torn" and deletes it after
   confirming: "Draft deleted.", it is gone from her list; Carla's draft has no Delete for Ana (she
   cannot see it). (ER-16, EL-16)
9. **5W1H** — In an analysis, 5W1H asks once "Is this section applicable to your event?"; Yes shows
   the six sections (five for an Environment event); No makes it Done. (RCA-10)
10. **Phone and keyboard** — At 320px the new buttons and messages are usable, and with the keyboard.
    (Domain)
11. **Deactivate, never delete** — Ludovic deactivates HZ-02 for all plants: Inactive, still listed,
    "Reactivate for all plants", no Retire; Carla's new review of `TF-26-0003` does not offer HZ-02.
    (MD-4, MD-8, MD-10)
12. **Reviewer corrects** — Carla assigns herself to `TF-26-0003`: its Submission step offers Save
    changes to her, not to Ana. (ER-21)

## Demo data changes

- The Industrial Risk demo events have no risk answer (they had CRP / SRP answers).

## Out of scope

- Health & Safety holding the TF and OH event types (feature 015).
- Removing the attachment limits, a language selector, changes to User Management.
