# 01 — Roles and permissions

Who a person is on the platform, what they see, and who may do what. The capability files refer
to these roles; the rule ids in the last column point to where each permission is detailed.

## Rules

### What a person holds

- **RP-1** A person holds, independently:
  1. **An event role** — User, Manager or Site Admin — or none, with an **access list**: for each
     plant, the pillars they may see.
  2. **Control Panel roles**: at most one per pillar, each **Central** (all plants), **Cluster**
     (two or more plants) or **Local** (one plant).
  3. **Membership** of any number of investigation groups.
- **RP-2** A Site Admin automatically holds a Local role on every pillar they see at their plant,
  unless they already hold a role on that pillar (with several plants, the first plant counts).
- **RP-3** A person with no event role does not appear in Event Reporting and receives no alert. A
  person with no Control Panel role cannot use the Control Panel or the User Directory (except a
  Site Admin managing their plants' alerts, RP-11); a role on one pillar gives no right on another.
- **RP-4** An investigation group has a name, the pillars and plants it covers, and its members.

### Event roles

- **RP-5**

  | Event role | Can |
  |---|---|
  | User | Report events, see the events of their access, receive alerts. |
  | Manager | As User, plus: correct Open events of their plants and pillars, report on behalf of someone else, receive "Event submitted" alerts, be a reviewer. |
  | Site Admin | See the events of their access (no reporting, no correcting), receive alerts, be a reviewer, manage the alert settings of their plants. |

### Visibility

- **RP-6**

  | What | Who sees it |
  |---|---|
  | A submitted event | People whose access includes the event's plant **and** pillar. |
  | A draft | Only its author. |
  | A Safety Alert, a published Safety Warning | Everyone with an event role whose access includes the event's plant, whatever their pillars. |
  | A Safety Warning before publication | Only the event's plan owners. |
  | The Sharing Hub of a plant | Everyone with an event role at that plant. |
  | A person (User Directory) | Central (any pillar): everyone. Others: the people linked — by event access or by a Control Panel role — to a plant of one of the viewer's Control Panel roles. |
  | An investigation group | Central: all. Others: the groups covering a plant of one of the viewer's Control Panel roles. |
  | A pillar's workflow settings, master data, audit | People holding a Control Panel role on that pillar. |

### Roles an event gives

- **RP-7** These roles are not assigned to a person once and for all: each event gives them.

  | Role on an event | Who | Detailed in |
  |---|---|---|
  | **Reporter** | The person the event is reported for (the author, or the person a Manager reported on behalf of) | ER |
  | **Reviewers** | Those its workflow kept at submission (OV-10); one of them takes the review and becomes **the reviewer** | RV-1, RV-2 |
  | **Designated people** | The users and the members of the groups the review (or an optional start) designated | RCA-1, RCA-7 |
  | **Plan owners** | The designated people; with no analysis, the reviewer; with no review, the Managers who see its plant and pillar | AP-2 |
  | **Assignees** | The people of each corrective action | AP-10 |
  | **Validators** | Its reviewer; with no review in its workflow, the Managers who see its plant and pillar | VAL-1 |
  | **Checkers** (receiving plant) | The Site Admins and Managers of a plant a Safety Warning was shared with | SH-7 |

### Who may do what — Event Reporting

- **RP-8**

  | Action | Who | Rule |
  |---|---|---|
  | Create an event | Users and Managers (not Site Admins) | ER-1 |
  | Report on behalf of someone else | Managers | ER-13 |
  | Continue a draft (drafts cannot be deleted, see Q-12) | Its author | ER |
  | Correct an Open event | Managers who see it | ER-21 |
  | Take and complete the review | One of its reviewers | RV-2 |
  | Start an optional root cause analysis | Its reviewer, and the Managers and Site Admins who see it | RCA-18 |
  | Edit and complete the root cause analysis | The designated people, while it is the current step | RCA-7 |
  | Prepare, deploy and cancel the action plan | The plan owners | AP-2 |
  | Update a deployed corrective action | Its assignees, each for their own | AP-10 |
  | Validate, send back to Actions | The validators | VAL-1 |
  | Rework a locked event | The validators | VAL-7 |
  | Publish the Safety Warning | The plan owners | SC-7 |
  | Share a published Safety Warning to other plants | The plan owners, the reviewer, the Site Admins of the event's plant | SH-1 |
  | Check a shared Safety Warning locally | The receiving plant's Site Admins and Managers | SH-7 |
  | Read the Record Historian | Everyone who sees the event | RH-2 |

### Who may do what — Control Panel

- **RP-9** **Workflow settings**: a person changes the settings of their own level for their own
  plants; a higher level requiring a phase locks it for the lower levels, and a person never
  changes another level's settings. Every level chooses reviewers for its plants, even where a
  higher level requires Review (WF-2 to WF-6a).
- **RP-10** **Master data**:

  | Level | Own values | Other values |
  |---|---|---|
  | Central | Create, edit, deactivate / reactivate everywhere, retire | — |
  | Cluster | Create (owned by its plants), edit, deactivate / reactivate, retire | Deactivate / reactivate for its plants |
  | Local | — (cannot create) | Deactivate / reactivate for its plant |

  Fixed global lists (Body Part Categories, Body Parts, Injuries) are maintained by Central only. A
  level never undoes a higher level's deactivation (MD-7, MD-9).
- **RP-11** **Alert settings of a plant** (submission rules, people's settings): the Site Admins of
  that plant (NT-6).
- **RP-12** When a person changes a setting made by a colleague of the same level, they are asked
  first and the colleague is notified (WF-4).

## Examples

1. **Given** a User with access to plant A (Health & Safety only), **when** they open the event
   list of plant A, **then** they see the submitted Health & Safety events of plant A and their own
   drafts, no Environment event and nobody else's draft. (RP-6)
2. **Given** a Site Admin of plant A, **when** they try to create an event, **then** they cannot;
   **and** they hold a Local Control Panel role on each pillar they see at plant A. (RP-2, RP-8)
3. **Given** a Central Health & Safety administrator with no event role, **then** they use the
   Control Panel and the User Directory but do not appear in Event Reporting. (RP-3)
4. **Given** a Cluster administrator of plants A and B, **when** Central requires Review on TF2,
   **then** they cannot make it Optional for their plants, but they can choose reviewers for plants
   A and B. (RP-9)
