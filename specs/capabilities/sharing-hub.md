# Capability: Sharing Hub

**Product**: Event Reporting (Share to Hub on a published Safety Warning, the Sharing Hub page, the local check)
**Builds on**: [domain](../domain.md) (Organization, roles), [safety communication](safety-communication.md), [notifications](notifications.md), [event library](event-library.md)
**Status**: built

A plant shares a published Safety Warning with the plants its owners choose; each receiving plant
checks whether it could happen there and acts on it.

## Scope

- **In**: sharing a published Safety Warning by region, country, business and plant, the
  anonymisation gate, the frozen package, the Sharing Hub page, the "Shared event received" alert,
  the local check with its actions, answer and history.
- **Out**: subscriptions (by hazards, families and levels, standards); clusters as a reach; sharing
  the Safety Alert, unsharing, editing a shared package; creating a local event from a shared one;
  alerts about local actions; translation of shared packages.

## Rules

### Sharing

- **SH-1** A published Safety Warning ([safety communication](safety-communication.md) SC-7) can be
  shared to other plants with **Share to Hub**, next to the Warning's **Print** button, shown to the
  event's plan owners and to the Site Admins of the event's plant — nobody else.
- **SH-2** **Share to Hub** opens "Who should receive it?": **Regions**, **Countries**,
  **Businesses** and **Plants**, each a multiple choice (the event's own plant is not offered).
  A plant is reached when it matches every region, country and business chosen (any value within
  one list); the plants chosen are added; the event's plant never is. A live line reads "Reaches <n>
  plant(s): <names>" — or "Choose a reach that includes at least one plant other than <plant>.",
  and then **Share** is refused with that message. Plants already reached are skipped.
- **SH-3** **Anonymisation gate**: Share is refused when the Warning's content contains the full
  name (ignoring case) of a person of the platform or of the event's person involved: "This Safety
  Warning names someone (<parts>) and cannot be shared." (the parts, e.g. "Key learnings").
- **SH-4** Sharing keeps the **shared package** as it is then: the Warning's content (SC-5) and the
  review's classification values (Health & Safety: Standards, Hazards, Body Parts, Injuries;
  Environment: Aspects, Impacts; Industrial Risk: Categories), never a name. The Warning then shows
  "Shared with <plants> on <date>" (one line per share).

### Receiving

- **SH-5** **Sharing Hub**, a page of the event workspace (EL-1), lists the packages shared to the
  context's plant in two sections (each a framed panel with its title), newest first: **Open** — "Not checked", "Being checked" and "Could
  happen here" cases — and **History** — closed cases ("Could happen here — closed on <date>",
  "Could not happen here — closed on <date>"). Each card: "Safety Warning" from <plant>, the pillar,
  the level, the date shared, the first line of the statement and the state. Everyone with an event
  role at the plant reads it; empty: "Nothing has been shared with <plant> yet." (and "No closed
  case yet." for an empty History). Opening one shows the package (document of SC-5 with a
  **Classification** part) and the local check.
- **SH-6** Each receiving plant's **Site Admins and Managers** get the information alert "Shared
  event received" ([notifications](notifications.md)); opening it opens the package.

### The local check

- **SH-7** **Verify locally**, at the top right of the shared Warning (the receiving plant's Site
  Admins and Managers, while "Not checked"), starts the **local check**: "Being checked", with no
  action yet and **Add action**. Once started, the local check (actions, answer, history) is a
  column on the right of the shared Warning (below it on phones). A local action has a description, 1 to 5 assignees among the
  plant's people with an event role, a due date and a status (On Going, Completed, Cancelled); the
  checkers add, edit and cancel actions; an assignee completes their own. Saving with something
  missing is refused next to the field: "Describe the action.", "Choose 1 to 5 assignees.",
  "Choose a due date.".
- **SH-8** The checkers answer **"Could it happen here?"** while "Being checked". **Yes** makes the
  state "Could happen here": the case stays open, actions can be added for as long as needed, and
  **Close case** closes it ("Could happen here — closed"). **No** closes it at once ("Could not
  happen here"). Closing — by No or Close case — is refused while an action is On Going: "Finish or
  cancel every action first.". A closed case is read-only and moves to the History.
- **SH-9** The **history** of the package at the plant: "Received on <date>", "Check started by
  <name>", "<action> completed by <name>", "Could happen here — answered by <name>", "Case closed by
  <name>" or "Check completed by <name>: could not happen here" — oldest first. Names appear only
  here, at the receiving plant, for its own people.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), after [safety communication](safety-communication.md)
scenarios 5–7: Diego Laurent published the
Safety Warning of `TF-26-0002` (Lyon, TF3), whose plan owner he is.

1. **Who shares** — Diego and Eva Novak (Site Admin, Lyon) see **Share to Hub** on the Warning
   (next to Print);
   Carla Mendes (its reviewer) and Ana Ribeiro do not. (SH-1)
2. **Reach** — Diego opens Share to Hub: Plants offers Curitiba and Porto, not Lyon. Choosing
   region Europe reads "Reaches 1 plant: Porto"; adding business Automotive Parts reads "Choose a
   reach that includes at least one plant other than Lyon." and Share is refused; removing the
   business and sharing to Europe works. *Then* the Warning shows "Shared with Porto on <today>",
   Lucas Weber gets "Shared event received" and Diego (who shared it) does not. (SH-2, SH-4, SH-6,
   NT-1, NT-3)
3. **Combined reach** — Eva shares again with business Automotive Parts and region Latin America:
   "Reaches 1 plant: Curitiba". *Then* a second line "Shared with Curitiba on <today>", and Felix
   Tanaka gets "Shared event received". (SH-2, SH-4, SH-6)
4. **Inbox** — Gina Rossi (User, Porto) opens Sharing Hub at Porto: one "Safety Warning" from
   Lyon, Health & Safety, "TF3 — First Aid", "Not checked"; it shows the Warning, a Classification
   part with the review's Standards and Hazards, and no name; she has no Verify locally. At Lyon,
   Carla's Sharing Hub reads "Nothing has been shared with Lyon yet.". (SH-4, SH-5)
5. **Verify locally** — Lucas opens it: Verify locally is at the top right. He presses it. *Then*
   the state is "Being checked", no action is listed and Add action is offered; an action "Check
   the sheet edges at the cutting station" saved without assignee is refused with "Choose 1 to 5
   assignees."; he assigns Gina with a due date next week. Answering No is refused with "Finish or
   cancel every action first.". (SH-7, SH-8)
6. **Could happen here** — Lucas answers Yes: the state is "Could happen here" and the case stays
   in Open; he adds a second action for Gina. Gina completes both. Lucas presses Close case. *Then*
   the case is read-only and moves to the History as "Could happen here — closed on <today>", and
   its history reads "Received on <today>", "Check started by Lucas Weber", "Could happen here —
   answered by Lucas Weber", the two "… completed by Gina Rossi", "Case closed by Lucas Weber".
   Nobody got an alert about the actions. (SH-5, SH-8, SH-9)
6b. **Could not happen here** — At Curitiba, Felix Tanaka verifies locally and answers No at once
   (no action): the case is closed, in the History as "Could not happen here — closed on <today>".
   (SH-8)
7. **Anonymisation gate** — A Warning whose key learnings read "Ana Ribeiro must deburr the edges"
   (published by its owners as in safety communication scenarios 5–7) cannot be shared: "This
   Safety Warning names someone (Key learnings) and cannot be shared.". (SH-3)
8. **My notifications** — Felix's My notifications lists 11 information switches, with "Shared
   event received". (NT-4)
9. **Phone and keyboard** — At 320px the Sharing Hub, the package and Share to Hub are usable
   without sideways scrolling, and every choice works with the keyboard. (Domain)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| What is shared | The published Safety Warning, with the review's classification values, frozen when shared; the Safety Alert stays at its plant | Sharing Hub FR-3 (statement, classification, learnings, findings, actions without assignees) |
| Who shares | The event's plan owners and the Site Admins of its plant | Sharing Hub FR-1 (the Reviewer) |
| Reach | Regions, countries, businesses and specific plants; a plant must match every chosen region, country and business, and the chosen plants are added; never the event's own plant | Sharing Hub FR-2 (plants, clusters, regions, business units) |
| Subscriptions | None: everything shared to a plant reaches its Sharing Hub, and its Site Admins and Managers are alerted | Sharing Hub FR-5, FR-6 (subscription filters) |
| Verify locally | A local check (no new event): "Could it happen here?" and local actions, the first one pre-filled; logged in the plant's history | Sharing Hub FR-7, FR-8 (a local preventive action plan) |
| Regions | Europe (Lyon, Porto), Latin America (Curitiba) | Not in the demo data |
| Anonymisation gate | Sharing is refused when the Warning contains the full name of a person of the platform or of the event's person involved | Sharing Hub FR-4 (rules not specified) |
| Sharing again | A Warning can be shared again to reach more plants; never unshared | — |
| Who checks | The Site Admins and Managers of the receiving plant; everyone with an event role there reads | — |
| Local actions | No alerts about them | Notifications decision: the action management tool notifies actions |
| Answering | "Could happen here" keeps the case open for as many actions as needed until the plant closes it; "Could not happen here" closes it | User (review remarks) |
| Closed cases | In a History part of the Sharing Hub page | User (review remarks) |
