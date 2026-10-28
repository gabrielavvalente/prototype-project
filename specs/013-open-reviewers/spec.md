# Change: Reviewers chosen at every level

**Feature Branch**: `013-open-reviewers`

**Created**: 2026-10-28

**Input**: User description: "There is one remark about the reviewers assignment. I need to keep
this list open to all levels in the control panel. Specially because this will probably be
configured by the local admins and not the central or cluster teams." — with the open points
decided with the user on 2026-10-28.

**Capabilities**: changed: `specs/capabilities/workflow-settings.md` (WF-6, WF-8, WF-9, WF-11,
WF-12, WF-6a added, scenarios 4 and 9), `specs/capabilities/platform-data.md` (workflow settings),
`specs/domain.md` (Workflow)

## Why

Review is usually made Required by Central, but the plants know who should review their events;
today a Local admin cannot touch the reviewers of a Review that a higher level requires.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Who chooses reviewers | Every level (Central, Cluster, Local), for its own plants, on any level where Review is Required at one of them — even when a higher level requires it | User |
| Combining | The event's reviewers are everyone chosen at every level covering its plant, added together | User |
| Making Review Required | No longer needs reviewers: a higher level may leave them to the plants; a plant left with none is warned | User |

## Rules

### Added — `workflow-settings.md`

- **WF-6a** **Reviewers for your plants**: on a Review cell Required at one of the person's plants —
  by their level or a higher one (locked) — the person sees "Reviewers for your plants: N" (N, the
  reviewers their level chose there), which opens "Reviewers for <level>": the Managers and Site
  Admins who can see the pillar at one of the person's plants, as checkboxes, with the hint "They
  are added to the reviewers chosen by the other levels." **Save — N selected** (or **Save — no
  reviewers**) keeps the choice for the person's level and plants: "Saved — <level> reviewers for
  your plants: <names | none>. Applies to new events.". A choice made by a colleague of the same
  level asks first and notifies them (WF-4, the setting named "Reviewers"). Where Review is
  Optional for all the person's plants, no reviewers are offered.

### Changed — `workflow-settings.md`

- **WF-6** Making **Review** Required saves it at once, like the other phases (WF-3), without
  choosing reviewers (WF-6a). *(was: it opened the reviewers list, at least one required)*
- **WF-8** *(the warning)* A Required Review cell with no reviewer who can see that plant shows "No
  reviewer". *(was: no warning)*
- **WF-9** *(reviewers)* For Review, the cell lists the reviewers by the level that chose them:
  "<Level> <plants> — <names>", with "Set by <name> on <date>", and "Cannot see <plant>" next to a
  reviewer who cannot see that plant; "No reviewer chosen for <plant> yet." when none. *(was: the
  reviewers of each Required setting)*
- **WF-11** *(the reviewers)* … the reviewers chosen at every level covering the event's plant
  (WF-6a), limited to Managers and Site Admins who can see its plant and pillar. *(was: the
  reviewers of each setting requiring Review)*
- **WF-12** *(reviewers)* A reviewers choice writes "<level> · Reviewers", "Changed": "<names>" →
  "<names>" ("No reviewers" when empty). *(was: "Required (reviewers: …)" on the Review setting)*

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`): H&S Review TF1–TF4 Required
at Central by Ludovic Costa, who chose the reviewers Carla Mendes, Eva Novak, Felix Tanaka and
Diego Laurent.

1. **Local chooses** — Eva Novak (Local Lyon) opens Health & Safety › Workflow: TF2 Review reads
   "Required by Central" and "Reviewers for your plants: 0". She opens it: Carla Mendes, Diego
   Laurent, Eva Novak and Lucas Weber are offered (not Felix Tanaka, at Curitiba); she ticks Lucas
   Weber and saves: "Saved — TF2 reviewers for your plants: Lucas Weber. Applies to new events.";
   the cell reads "Reviewers for your plants: 1". (WF-6a)
2. **Added together** — Ludovic, Result per plant, Lyon, opens TF2 Review: "Central — Carla
   Mendes, Eva Novak, Felix Tanaka, Diego Laurent" (Felix "Cannot see Lyon") and "Local Lyon —
   Lucas Weber", set by Eva Novak. Ana Ribeiro submits a TF2 at Lyon: its reviewers are Carla
   Mendes, Diego Laurent, Eva Novak and Lucas Weber; `TF-26-0003` (submitted before) keeps Carla,
   Diego and Eva. (WF-9, WF-11)
3. **Required without reviewers** — Lucas Weber (Cluster Lyon, Porto) switches TF5 Review on: no
   list opens, "Saved — TF5 Review is now Required. Applies to new events."; in Result per plant,
   TF5 Review shows "No reviewer" at Lyon and Porto. Carla (Local Lyon) chooses herself for TF5:
   Lyon no longer warns, Porto still does. (WF-6, WF-8, WF-6a)
4. **A colleague's choice** — After scenario 1, Carla (Local Lyon, like Eva) opens TF2's reviewers:
   "Eva Novak set this. They will be notified of your change."; she adds Diego Laurent. Eva's bell:
   "Carla Mendes changed your Reviewers setting for TF2 (Health & Safety, Local Lyon): Lucas Weber
   → Lucas Weber, Diego Laurent."; the H&S Audit shows "TF2 · Reviewers", "Changed", "Lucas
   Weber → Lucas Weber, Diego Laurent". (WF-6a, WF-12)
5. **Only where Review is Required** — At the start, Eva's TF5 Review is Optional: no reviewers
   are offered there. (WF-6a)
6. **Phone and keyboard** — At 320px the Review cells and the reviewers list are usable, and with
   the keyboard. (Domain)

## Demo data changes

- Central's reviewers (Carla Mendes, Eva Novak, Felix Tanaka, Diego Laurent) are kept as Central's
  reviewers choice on every level where Central requires Review; no other level has chosen any.

## Out of scope

- Reviewers for a level where Review is Optional (they would never apply).
