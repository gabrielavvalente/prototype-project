# Change: Event Sharing Hub

**Feature Branch**: `009-sharing-hub`

**Created**: 2026-10-26

**Input**: User description: "Event Sharing Hub" — the Event Sharing Hub of the sources (feature 13:
Share to Hub with a perimeter, an anonymised package, subscriptions, a Local Sharing Inbox, Verify
Locally), with the open points decided with the user on 2026-10-26.

**Capabilities**: new: `specs/capabilities/sharing-hub.md` (prefix SH); changed:
`specs/capabilities/event-library.md` (EL-1), `specs/capabilities/notifications.md` (NT-1, NT-3,
NT-4, scenario 9), `specs/capabilities/platform-data.md` (Organization), `specs/domain.md`
(Organization, Glossary, Capabilities)

## Why

A lesson learned at one plant rarely reaches the plants where the same event could happen next. The
Sharing Hub sends a published Safety Warning to the plants its owners choose, and lets each of them
check whether it could happen there and act on it.

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

## Rules

### Added — `sharing-hub.md`

- **SH-1** A published Safety Warning ([safety communication](safety-communication.md) SC-7) can be
  shared to other plants with **Share to Hub**, shown on the Warning to the event's plan owners and
  to the Site Admins of the event's plant — nobody else.
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
- **SH-5** **Sharing Hub**, a page of the event workspace (EL-1), lists the packages shared to the
  context's plant, newest first: "Safety Warning" from <plant>, the pillar, the level, the date
  shared, the first line of the statement and the local check's state ("Not checked", "Being
  checked", "Could happen here", "Could not happen here"). Everyone with an event role at the plant
  reads it; empty: "Nothing has been shared with <plant> yet.". Opening one shows the package
  (document of SC-5 with a **Classification** part) and the local check.
- **SH-6** Each receiving plant's **Site Admins and Managers** get the information alert "Shared
  event received" ([notifications](notifications.md)); opening it opens the package.
- **SH-7** **Verify locally** (the receiving plant's Site Admins and Managers, while "Not checked")
  starts the **local check**: "Being checked", and a first local action pre-filled "Check whether
  this could happen here: <key learnings> (Hazards: <hazards>)" (without Hazards when the package
  has none). A local action has a description, 1 to 5 assignees among the plant's people with an
  event role, a due date and a status (On Going, Completed, Cancelled); the checkers add, edit and
  cancel actions; an assignee completes their own. Saving with something missing is refused next to
  the field: "Describe the action.", "Choose 1 to 5 assignees.", "Choose a due date.".
- **SH-8** The checkers answer **"Could it happen here?"** Yes / No; **Complete check** is possible
  once it is answered and every action is Completed or Cancelled ("Finish or cancel every action
  first." otherwise) and makes the state "Could happen here" or "Could not happen here"; the check
  is then read-only.
- **SH-9** The **history** of the package at the plant: "Received on <date>", "Check started by
  <name>", "<action> completed by <name>", "Check completed by <name>: could (not) happen here" —
  oldest first. Names appear only here, at the receiving plant, for its own people.

### Changed

- **EL-1** "EVENT WORKSPACE" offers five pages — **Events**, **KPIs**, **Reports**, **Safety
  communications**, **Sharing Hub** ([sharing hub](sharing-hub.md) SH-5) — and **Create event**
  for those who can report. … *(was: four pages)*
- **NT-1** *(an exception)* "Shared event received" goes to the receiving plant's Site Admins and
  Managers, who cannot see the event itself (SH-6). *(was: only people who can see the event)*
- **NT-3** *(a row)* Sharing | A Warning is shared | "Shared event received" | The Site Admins and
  Managers of each plant reached. *(was: no sharing)*
- **NT-4** *(a switch)* Information adds "Shared event received" — "A safety lesson was shared with
  your plant." (11 switches). *(was: 10)*
- **Platform data, Organization**: each plant has a **region** — Lyon and Porto Europe, Curitiba
  Latin America.
- **Domain**: Organization says that plants belong to a business, a country and a region; the
  Glossary adds **Sharing Hub** ("where a plant receives the Safety Warnings other plants shared
  with it, and checks whether they could happen there"); the Capabilities table lists it.

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`), after [safety
communication](../capabilities/safety-communication.md) scenarios 5–7: Diego Laurent published the
Safety Warning of `TF-26-0002` (Lyon, TF3), whose plan owner he is.

1. **Who shares** — Diego and Eva Novak (Site Admin, Lyon) see **Share to Hub** on the Warning;
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
5. **Verify locally** — Lucas opens it and presses Verify locally. *Then* the state is "Being
   checked" and a first action reads "Check whether this could happen here: Sharp edges must be
   deburred before handling (Hazards: …)"; saving it without assignee is refused with "Choose 1 to
   5 assignees."; he assigns Gina with a due date next week. Complete check is refused with
   "Finish or cancel every action first.". (SH-7, SH-8)
6. **Complete the check** — Gina completes her action; Lucas answers No and completes the check.
   *Then* the list shows "Could not happen here", the check is read-only, and the history reads
   "Received on <today>", "Check started by Lucas Weber", "Check whether this could happen here…
   completed by Gina Rossi", "Check completed by Lucas Weber: could not happen here". Nobody got
   an alert about the action. (SH-8, SH-9)
7. **Anonymisation gate** — A Warning whose key learnings read "Ana Ribeiro must deburr the edges"
   (published by its owners as in safety communication scenarios 5–7) cannot be shared: "This
   Safety Warning names someone (Key learnings) and cannot be shared.". (SH-3)
8. **My notifications** — Felix's My notifications lists 11 information switches, with "Shared
   event received". (NT-4)
9. **Phone and keyboard** — At 320px the Sharing Hub, the package and Share to Hub are usable
   without sideways scrolling, and every choice works with the keyboard. (Domain)

## Demo data changes

- Plants get a region: Lyon and Porto in Europe, Curitiba in Latin America.

## Out of scope

- Subscriptions (by hazards, families and levels, standards); clusters as a reach.
- Sharing the Safety Alert, unsharing, editing a shared package.
- Creating a local event from a shared one; alerts about local actions; translation of shared
  packages.
