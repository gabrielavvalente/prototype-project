# 01 — Roles and permissions

Who a person is on the platform, what they see, and who may do what. People, roles, layers and
groups are maintained in a **user management tool** that the development team builds separately;
this file states what Event Reporting and the Control Panel need from it (RP-1 to RP-4). The rule
ids in the last column of the tables point to where each permission is detailed.

## Rules

### What the user management tool must provide

- **RP-1** For each person, independently:
  1. **An event role** — User, Manager or Site Admin — or none, with an **access list**: for each
     plant, the pillars they may see (a Site Admin sees every pillar of their plants, RP-5).
  2. **Control Panel roles**: at most one per pillar, each on a **layer** — **Central** (all
     plants), **Cluster** (two or more plants) or **Local** (one plant) — with its plants.
  3. **Membership** of any number of investigation groups.
- **RP-2** A Site Admin automatically holds a Local role on every pillar at their plant, unless
  they already hold a role on that pillar (with several plants, the first plant counts).
- **RP-3** An **investigation group** has a name, the pillars and plants it covers, and its members.
- **RP-4** A person with no event role does not appear in Event Reporting and receives no alert. A
  person with no Control Panel role cannot use the Control Panel, except a Site Admin managing their
  plants' alert settings (RP-11). A role on one pillar gives no right on another pillar. A change of
  role, access or membership applies at once; events keep the reviewers they took at submission
  (OV-10).

### Event roles

- **RP-5**

  | Event role | Can |
  |---|---|
  | User | Report events, see the events of their access, receive alerts. |
  | Manager | As User, plus: report on behalf of someone else, correct Open events of their plants and pillars, receive "Event submitted" alerts, be a reviewer. |
  | Site Admin | **The highest access, on the events of their plants (every pillar)**: as Manager, plus correct an event at any status and act on any step of any event — review, root cause analysis, action plan, actions, validation, rework — without being its reviewer, designated or owner (RP-8a); manage the alert settings of their plants. |

### Visibility

- **RP-6**

  | What | Who sees it |
  |---|---|
  | A submitted event | People whose access includes the event's plant **and** pillar; the Site Admins of its plant. |
  | A draft | Only its author. |
  | A Safety Alert, a published Safety Warning | Everyone with an event role whose access includes the event's plant, whatever their pillars. |
  | A Safety Warning before publication | The event's action plan owners and the Site Admins of its plant. |
  | The Sharing Hub of a plant | Everyone with an event role at that plant. |
  | A pillar's workflow settings, master data, audit | People holding a Control Panel role on that pillar. |

### Roles an event gives

- **RP-7** These roles are not assigned to a person once and for all: each event gives them.

  | Role on an event | Who | Detailed in |
  |---|---|---|
  | **Reporter** | The person the event is reported for (the author, or the person a Manager or Site Admin reported on behalf of) | ER |
  | **Reviewers** | Those its workflow kept at submission (OV-10); one of them takes the review and becomes **the reviewer** | RV-1, RV-2 |
  | **Designated people** | The users and the members of the groups the review (or an optional start) designated | RCA-1, RCA-4 |
  | **Action plan owners** | The designated people; with no analysis, the reviewer; with no review, the Managers who see its plant and pillar | AP-2 |
  | **Assignees** | The people of each corrective action | AP-10 |
  | **Validators** | Its reviewer; with no review in its workflow, the Managers who see its plant and pillar | VAL-1 |
  | **Checkers** (receiving plant) | The Site Admins and Managers of a plant a Safety Warning was shared with | SH-7 |

### Who may do what — Event Reporting

- **RP-8**

  | Action | Who | Rule |
  |---|---|---|
  | Create an event | Users, Managers and Site Admins | ER-1 |
  | Report on behalf of someone else | Managers and Site Admins | ER-12 |
  | Continue or delete a draft | Its author | ER-20 |
  | Correct an Open event | Managers and Site Admins who see it | ER-21 |
  | Take and complete the review | One of its reviewers | RV-2 |
  | Start an optional root cause analysis | Its reviewer, and the Managers and Site Admins who see it | RCA-15 |
  | Edit and complete the root cause analysis | The designated people, while it is the current step | RCA-4 |
  | Prepare, deploy and cancel the action plan | The action plan owners | AP-2 |
  | Update a deployed corrective action | Its assignees, each for their own | AP-10 |
  | Validate, send back to Actions | The validators | VAL-1 |
  | Rework a locked event | The validators | VAL-7 |
  | Publish the Safety Warning | The action plan owners | SC-7 |
  | Share a published Safety Warning to other plants | The action plan owners, the reviewer, the Site Admins of the event's plant | SH-1 |
  | Check a shared Safety Warning locally | The receiving plant's Site Admins and Managers | SH-7 |
  | Read the Record Historian | Everyone who sees the event | RH-2 |

- **RP-8a** **Site Admins** of an event's plant may do every action of RP-8 on that event — whoever
  the table names — and correct its report at any status, as long as the event is not locked: a
  locked event first needs a rework (VAL-7), which they may also do. They act under their own
  name: the history and the Record Historian show them, and the alerts of each step are raised as
  if the named person had acted. Drafts stay their author's.

### Who may do what — Control Panel

- **RP-9** **Workflow settings**: a person changes the settings of their own layer for their own
  plants; a higher layer requiring a phase locks it for the lower layers, and a person never
  changes another layer's settings. Every layer chooses reviewers for its plants, even where a
  higher layer requires Review (WF-2 to WF-6a).
- **RP-10** **Master data**:

  | Layer | Own values | Other values |
  |---|---|---|
  | Central | Create, edit, deactivate / reactivate everywhere, retire | — |
  | Cluster | Create (owned by its plants), edit, deactivate / reactivate, retire | Deactivate / reactivate for its plants |
  | Local | — (cannot create) | Deactivate / reactivate for its plant |

  Fixed global lists (Body Part Categories, Body Parts, Injuries) are maintained by Central only. A
  layer never undoes a higher layer's deactivation (MD-7, MD-9).
- **RP-11** **Alert settings of a plant** (submission rules, people's settings): the Site Admins of
  that plant (NT-6).
- **RP-12** When a person changes a setting made by a colleague of the same layer, they are asked
  first and the colleague is notified (WF-4).

## Decisions

| Topic | Decision |
|---|---|
| People, roles, layers, groups | Maintained in a user management tool built by the development team; this specification lists only what it must provide |
| Site Admin | The highest access on the events of their plants, every pillar: they report (also on behalf of someone else), correct events at any status and act on any step, except changing a locked event before a rework *(the prototype restricted Site Admins to reading, reviewing and the alert settings)* |
| Reporting on behalf, correcting Open events | Managers and Site Admins *(the prototype: Managers only)* |

## Examples

1. **Given** a User with access to plant A, Health & Safety only, **when** they open the event list
   of plant A, **then** they see the submitted Health & Safety events of plant A (Safety and
   Occupational Health) and their own drafts, no Environment event and nobody else's draft. (RP-6)
2. **Given** a Site Admin of plant A, **then** they see every event of plant A, whatever its pillar,
   and hold a Local Control Panel role on each pillar at plant A. (RP-2, RP-5, RP-6)
3. **Given** a TF2 event of plant A at Root cause analysis, designated to someone else, **when** a
   Site Admin of plant A completes the analysis, **then** it is saved under the Site Admin's name
   and the event moves to its next step. **Given** the same event closed by its validation,
   **when** the Site Admin tries to change it, **then** they first have to rework it. (RP-8a)
4. **Given** a Manager or a Site Admin of plant A, **when** they report an event on behalf of a User
   of plant A, **then** that User is the reporter. (RP-8)
5. **Given** a Central Health & Safety administrator with no event role, **then** they use the
   Control Panel but do not appear in Event Reporting. (RP-4)
6. **Given** a Cluster administrator of plants A and B, **when** Central requires Review on TF2,
   **then** they cannot make it Optional for their plants, but they can choose reviewers for plants
   A and B. (RP-9)
