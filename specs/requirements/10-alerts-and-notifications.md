# 10 — Alerts and notifications

People are told about the events that concern them (**alerts**, in Event Reporting) and about the
changes others made to their Control Panel settings (**notifications**). Each person chooses which
information alerts they receive; Site Admins set rules and settings for their plants.

Builds on: [00 Overview](00-overview.md), [01 Roles and permissions](01-roles-and-permissions.md),
and the steps of [02](02-event-reporting.md) to [09](09-sharing-hub.md).

## Rules

### Alerts

- **NT-1** An alert goes only to people with an event role who can see the event; a draft never raises
  one. When one action would raise several alerts for the same person on the same event, they get
  one: the one that hands them work first, otherwise the one of the latest stage in NT-3 (e.g. a
  review that closes the event gives the reporter "Event closed", not "Your event was reviewed");
  when the person turned that one off, they get none. "Shared event received" is the exception: it
  goes to people of other plants, who cannot see the event (SH-6).
- **NT-2** **Work** alerts hand the person something to do and are always raised: "Event to review",
  "Root cause analysis assigned to you", "Action plan ready for validation", "Event sent back for
  rework". **Information** alerts are all the others: they skip the person who did the action ("Event
  submitted" excepted: it also reaches the Manager or Site Admin who reported the event) and are
  raised only when the person has them on (NT-5).
- **NT-3** The alerts:

  | Stage | When | Alert | To |
  |---|---|---|---|
  | Submission | Submitted, Review required | "Event to review" (work) | The event's reviewers |
  | Submission | Submitted | "Event submitted" | The Managers and Site Admins who see the event and are not its reviewers; the people of the matching submission rules (NT-9) |
  | Submission | Submitted by someone else than its reporter | "Event reported on your behalf" | The reporter |
  | Submission | Submitted with Shared with people | "Event shared with you" | Each Shared with person |
  | Review | A reviewer takes the review | The other reviewers' "Event to review" for this event disappear; the taker's is marked read | — |
  | Review | Valid | "Your event was reviewed" | The reporter |
  | Review | Not valid | "Event archived (<reason>)" | The reporter, the Shared with people, the other reviewers |
  | Review | Root cause analysis next | "Root cause analysis assigned to you" (work) | Each designated user and member of a designated group, never the reviewer |
  | Root cause analysis | Optional analysis started (RCA-15) | "Root cause analysis assigned to you" (work) | Each designated user and group member, never the person who started it |
  | Root cause analysis | Completed | "Root cause analysis completed" | The reporter and the reviewer |
  | Actions | Plan deployed | "Action plan deployed" | The reporter and the reviewer |
  | Actions | Plan completed, Validation next | "Action plan ready for validation" (work) | The validators |
  | Actions | Plan completed | "Action plan completed" | The reporter |
  | Validation | Not effective (VAL-4) | "Event sent back for rework" (work) · "Action plan not effective" | The action plan owners, never the validator who answered · the reporter |
  | Validation | Rework of a locked event (VAL-6) | "Event sent back for rework" (work) | The action plan owners, never the person who sent it |
  | Closure | Closed at Review, Root cause analysis, Actions or Validation | "Event closed" | The reporter and the Shared with people |
  | Sharing | A published Safety Warning is shared | "Shared event received" | The Site Admins and Managers of each plant reached, never the person who shared |

  An event closed at submission raises no "Event closed" (its reporter is told on submitting).
  Nothing is raised about single actions — assigned, changed, cancelled, overdue (Q-11).
- **NT-3a** A person's alerts list the alerts about events of their current context (OV-2), newest
  first, each with its event, its type, how long ago it came, and whether it is read. Opening one
  opens its event and marks it read; all can be marked read at once. Empty: "No notifications yet.".

### Each person's settings

- **NT-4** **My notifications**: the work alerts are always on ("These alerts hand you work and cannot
  be turned off."); each information alert can be turned on or off, with what it tells:

  | Alert | Tells |
  |---|---|
  | Event submitted | "An event is submitted in your plant and pillars." |
  | Event reported on your behalf | "Someone reported an event in your name." |
  | Event shared with you | "Someone shared an event with you." |
  | Your event was reviewed | "An event you reported was reviewed as valid." |
  | Event archived | "An event you reported, that was shared with you or that you could review was archived." |
  | Root cause analysis completed | "The analysis of an event you reported or reviewed was completed." |
  | Action plan deployed | "The action plan of an event you reported or reviewed was deployed." |
  | Action plan completed | "The action plan of an event you reported was completed." |
  | Action plan not effective | "On an event you reported." |
  | Event closed | "An event you reported or that was shared with you was closed." |
  | Shared event received | "A safety lesson was shared with your plant." |

  Every information alert is on until someone turns it off. A change applies at once to the alerts
  raised afterwards; alerts already received stay.
- **NT-5** Each information setting of a person has one value, set by whoever changed it last: the
  person or a Site Admin of one of their plants. When it was a Site Admin, the person sees "Set by
  <name> on <date>" until they change it again.

### Site Admins

- **NT-6** In the Control Panel, a **Site Admin** manages, for each plant of their access, its
  **submission rules**, its **people's settings** and the **changes** made to them. Nobody else can
  ("You don't have access to this page.").
- **NT-7** **Submission rules**, per pillar the Site Admin sees at the plant. A rule has **Levels** (one
  or more of the pillar's levels and disease types), **Departments** (one or more of the plant's
  departments, or none for all departments) and **People** (one or more people with an event role who
  can see the plant and pillar). Missing information is refused: "Choose at least one level." ·
  "Choose at least one person.". Deleting asks "Delete this rule?".
- **NT-8** Adding a person to a rule turns their "Event submitted" on (a Site Admin change, NT-5).
- **NT-9** When an event is submitted, every rule of its plant and pillar whose levels include its
  level and whose departments include its location's department (or all) sends "Event submitted" to
  its people (one alert per person, NT-1). Rules act on events submitted after they are saved.
- **NT-10** **People**: the people with an event role whose access includes the plant, with their role;
  for each, their information settings (NT-4) and any "Set by" line, which the Site Admin changes as
  the person would. Their work alerts are shown, not changeable.
- **NT-11** **Changes**: every change made there, newest first: when, who, what ("Health & Safety
  rule", "<person> · Event closed"), the change (Added, Edited, Deleted, Turned off, Turned on) and
  before → after. Each change and its entry are saved together.

### Control Panel notifications

- **NT-12** A person is notified when a colleague of the same layer changes a setting they made (WF-4,
  MD); notifications are listed newest first, each with its text and date, unread ones marked, and
  are marked read once seen.

## Decisions

| Topic | Decision |
|---|---|
| Reporter feedback | The reporter is told at every stage: reviewed, archived, analysis completed, plan deployed, plan completed, plan not effective, closed |
| Critical events | No alert of their own; they reach the people of the event through the other alerts |
| Action-level alerts | None from these requirements (Q-11) |
| Who acted | Information alerts skip the person who acted; work alerts and "Event submitted" do not |
| Several reviewers | Once one takes the review, the others' "Event to review" disappears |
| What can be turned off | Information alerts only |
| Site Admin settings | Submission rules per pillar, and the information settings of the people of their plant; the latest change wins |
| Event submitted | Managers and Site Admins *(the prototype: Managers only)* |
| Channel | Inside the product only (email or Teams is Q-10) |

## Examples

1. **Given** a TF2 submitted at plant A whose reviewers are R1 and R2, **then** R1 and R2 get "Event to
   review" and plant A's other Managers and Site Admins get "Event submitted"; when R1 takes the
   review, R2's alert disappears. (NT-3)
2. **Given** a Manager reporting on behalf of a User, **then** the User gets "Event reported on your
   behalf" and the Manager still gets "Event submitted". (NT-2, NT-3)
3. **Given** a review that closes the event, **then** the reporter gets "Event closed" only. (NT-1)
4. **Given** a person who turned "Event closed" off, **then** they get no alert when their events close;
   they still get "Event to review". (NT-2, NT-4)
5. **Given** a Site Admin of plant A adding a rule TF1–TF2, department D, person P, **then** P's "Event
   submitted" turns on ("Set by <Site Admin> on <date>") and P is alerted for every TF1 or TF2
   submitted in D from then on. (NT-7 to NT-9)
6. **Given** a validator answering Not effective, **then** the action plan owners get "Event sent back for
   rework" (the validator does not, even if an owner) and the reporter "Action plan not effective".
   (NT-3)
