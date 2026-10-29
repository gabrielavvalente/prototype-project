# 09 — Sharing Hub

A published Safety Warning can be shared with other plants. Each receiving plant finds it in its
Sharing Hub, checks whether the same could happen there, and takes local actions.

Builds on: [00 Overview](00-overview.md) (organization: business, country, region),
[01 Roles and permissions](01-roles-and-permissions.md), [08 Safety communication](08-safety-communication.md).

## Rules

### Sharing

- **SH-1** A published Safety Warning can be shared to other plants by the event's action plan owners,
  its reviewer and the Site Admins of its plant — nobody else.
- **SH-2** "Who should receive it?" offers **Regions**, **Countries**, **Businesses** and **Plants**,
  each a multiple choice (the event's own plant is not offered). A plant is reached when it matches
  every region, country and business chosen (any value within one list); the plants chosen are
  added; the event's plant never is. The person sees, while choosing, "Reaches <n> plant(s):
  <names>" — or "Choose a reach that includes at least one plant other than <plant>.", and then
  sharing is refused with that message. Plants already reached are skipped.
- **SH-3** **Anonymisation gate**: sharing is refused when the Warning's content contains the full name
  (ignoring case) of a person of the platform or of the event's person involved: "This Safety Warning
  names someone (<parts>) and cannot be shared." (the parts concerned, e.g. "Key learnings").
- **SH-4** Sharing keeps a **shared package** as it is then: the Warning's content (SC-5) and the
  review's classification values (Safety: Standards, Hazards, Body Parts, Injuries — "<body part>:
  <injury>"; Environment: Aspects, Impacts; Industrial Risk: Categories), never a name. The Warning
  then shows "Shared with <plants> on <date>", one line per share. A Warning can be shared again to
  reach more plants; it is never unshared (Q-15).

### Receiving

- **SH-5** The **Sharing Hub** of a plant lists the packages shared with it, newest first, in two
  parts: **Open** — "Not checked", "Being checked", "Could happen here" — and **History** — closed
  cases ("Could happen here — closed on <date>", "Could not happen here — closed on <date>"). Each
  shows "Safety Warning" from <plant>, the pillar, the level, the date shared, the first line of the
  statement and the state. Everyone with an event role at the plant reads it. Empty: "Nothing has
  been shared with <plant> yet." · "No closed case yet.". A package shows the Warning's document
  with its classification, and the local check.
- **SH-6** The receiving plant's **Site Admins and Managers** get "Shared event received"
  ([10](10-alerts-and-notifications.md)), which opens the package.

### The local check

- **SH-7** The receiving plant's Site Admins and Managers (the **checkers**) start the **local check**
  while the package is "Not checked": it becomes "Being checked", with no action yet. A **local
  action** has a description, 1 to 5 assignees among the plant's people with an event role, a due
  date and a status (On Going, Completed, Cancelled). The checkers add, edit and cancel local
  actions; an assignee completes their own. Missing information is refused: "Describe the action."
  · "Choose 1 to 5 assignees." · "Choose a due date.".
- **SH-8** The checkers answer **"Could it happen here?"** while "Being checked". **Yes** makes it
  "Could happen here": the case stays open, actions can be added for as long as needed, and the
  checkers close it ("Could happen here — closed"). **No** closes it at once ("Could not happen
  here"). Closing — by No or by closing the case — is refused while an action is On Going: "Finish or
  cancel every action first.". A closed case is read-only and goes to the History.
- **SH-9** Each package keeps its history at the receiving plant, oldest first: "Received on <date>",
  "Check started by <name>", "<action> completed by <name>", "Could happen here — answered by
  <name>", "Case closed by <name>" or "Check completed by <name>: could not happen here". Names appear
  only there, at the receiving plant, for its own people.

## Decisions

| Topic | Decision |
|---|---|
| What is shared | The published Safety Warning with the review's classification values, frozen when shared; the Safety Alert stays at its plant |
| Who shares | The action plan owners, the reviewer and the Site Admins of the event's plant |
| Reach | Regions, countries, businesses and specific plants; a plant must match every chosen region, country and business; the chosen plants are added; never the event's own plant |
| Subscriptions | None: everything shared to a plant reaches its Sharing Hub, and its Site Admins and Managers are alerted (Q-15) |
| Local check | No new event: "Could it happen here?" and local actions, logged in the plant's history |
| Anonymisation gate | Refused when the Warning contains the full name of a person of the platform or of the person involved |
| Who checks | The receiving plant's Site Admins and Managers; everyone with an event role there reads |
| Local actions | No alerts about them (Q-15) |
| Answering | "Could happen here" keeps the case open until the plant closes it; "Could not happen here" closes it |

## Examples

1. **Given** a published Warning of plant A, **when** its owner shares it with region R (plants A, B)
   and business X (plants B, C), **then** it reaches plant B only; choosing just plant A reads "Choose a
   reach that includes at least one plant other than A." and sharing is refused. (SH-2)
2. **Given** a Warning whose key learnings contain a colleague's full name, **then** sharing is refused
   with "This Safety Warning names someone (Key learnings) and cannot be shared.". (SH-3)
3. **Given** a package shared with plant B, **then** plant B's Site Admins and Managers get "Shared
   event received"; everyone with an event role at plant B sees it "Not checked". (SH-5, SH-6)
4. **Given** a Manager of plant B starting the local check and adding an action for a colleague,
   **when** they answer No while the action is On Going, **then** it is refused with "Finish or cancel
   every action first."; once the action is completed, No closes the case into the History. (SH-7, SH-8)
5. **Given** "Could happen here", **then** the case stays open for more actions until a checker closes
   it. (SH-8)
