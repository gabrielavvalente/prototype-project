# Capability: Workflow settings

**Product**: Control Panel (Workflow tab); used by Event Reporting at submission
**Builds on**: [domain](../domain.md) (Workflow, Control Panel roles),
[platform data](platform-data.md), [Control Panel workspace](control-panel-workspace.md)
**Status**: built

Per pillar and level, each Control Panel level says which phases its plants require; Event
Reporting gives every new event the resulting workflow.

## Rules

### Settings view

- **WF-1** The Workflow tab's **Settings** view shows one row per level of the pillar (code and
  name) and one column per phase. Submission is shown "Required" and cannot be changed. The hint
  reads "Make a phase Required for your plants. Optional phases are skipped. Changes apply to new
  events only."
- **WF-2** Each other cell is, for the person:
  - **Locked** when a higher level requires it for one of the person's plants: a lock, "Required
    by <Level>", the author and the date. It cannot be changed.
  - Otherwise a **switch** Required / Optional for the person's level and plants. On when a
    setting of the person's level covering one of their plants exists (made by them or by a
    colleague at the same level, then "Set by <name>" is shown).
  - Settings of lower levels are not shown here (see Result per plant).
- **WF-3** Switching on stores a Required setting for the person's level and plants (all plants for
  Central). Switching off removes the settings of the person's level in that cell. A message
  confirms: "Saved — <level> <phase> is now Required / Optional. Applies to new events."
- **WF-4** When the cell holds a setting made by a colleague of the same level, switching (or
  changing reviewers) first asks "<names> set this. They will be notified of your change.". The
  setting then has the person as author, and each previous author gets a notification:
  "<person> changed your <phase> setting for <level> (<pillar>, <Level> <plants>): <before> →
  <after>."
- **WF-5** A setting never changes another level's settings: a higher level only adds Required on
  top. A lower level's Required setting stays stored while a higher level requires the same cell
  and applies again when the higher one is switched off.

### Reviewers

- **WF-6** Making **Review** Required opens "Reviewers for <level>": the Managers and Site Admins
  who can see the pillar at one of the person's plants (name, role, plants), as checkboxes. The
  button reads "Choose at least one reviewer" (disabled) until one is chosen, then "Done — N
  selected". A Required Review cell shows "N reviewers", which reopens the list to change them.
- **WF-7** When saved reviewers can no longer see the pillar at any of the plants, the list warns
  "N saved reviewer(s) no longer have access and will be removed." and saving drops them.

### Result per plant

- **WF-8** The **Result per plant** view lets the person choose one of their plants (all plants
  for Central) and shows each level × phase as **Required** with a badge of the highest level
  requiring it (Central > Cluster > Local, "+N" when several), or **Optional**.
- **WF-9** Opening a cell lists every setting requiring it there: level and plants, "Set by <name>
  on <date>", and for Review its reviewers, with "Cannot see <plant>" next to a reviewer who cannot
  see that plant. An Optional cell says "Optional: no level requires this phase here, so it is
  skipped."
- **WF-10** Choosing a level row shows "Path of a <level> event at <plant>": the phases in order,
  skipped ones crossed out, ending with "Closed", or "Closed after submission" when only
  Submission is required.

### Effect on events

- **WF-11** Each submitted event keeps the workflow in force at its submission (domain Workflow):
  the required phases and the reviewers — the reviewers of every setting requiring Review there,
  limited to Managers and Site Admins who can see the event's plant and pillar. Changing a
  setting never changes existing events.
- **WF-12** Every change writes an audit entry ([workspace](control-panel-workspace.md) CPW-6):
  "Made Required" (Optional → Required, or "Required (reviewers: …)" for Review), "Made Optional"
  or "Changed" (reviewers).

## Acceptance scenarios

From freshly reset [demo data](platform-data.md) (H&S starts with Review TF1–TF4 and Actions
TF1–TF2 at Central by Ludovic Costa, Validation TF1 at Lyon by Eva Novak).

1. **Grid** — Ludovic opens Health & Safety › Workflow: rows TF1–TF5, Submission Required and
   fixed, Review on for TF1–TF4, Actions on for TF1–TF2. (WF-1, WF-2)
2. **Locked for lower levels** — Lucas Weber (Cluster Lyon, Porto) sees Review TF1–TF4 locked
   "Required by Central, Ludovic Costa, 20 Oct 2026"; he cannot switch them. (WF-2)
3. **Cluster requires** — Lucas switches TF2 Root cause analysis on: "Saved — TF2 Root cause
   analysis is now Required. Applies to new events." In Result per plant, Lyon and Porto show TF2
   Root cause analysis Required with a Cluster badge; for Pascal Fischer (Cluster Lyon,
   Curitiba), Curitiba shows it Optional. (WF-3, WF-8)
4. **Reviewers required** — Lucas switches TF5 Review on: the reviewers list offers Carla Mendes,
   Diego Laurent, Eva Novak and Lucas Weber (not Felix Tanaka, who is at Curitiba); Done stays
   disabled until one is chosen. After choosing Carla, the cell shows "1 reviewer". (WF-6)
5. **A colleague's setting** — Carla Mendes (Local Lyon) sees TF1 Validation on, "Set by Eva
   Novak". Switching it off asks "Eva Novak set this. They will be notified of your change."; after
   confirming, Eva's bell shows 1 unread: "Carla Mendes changed your Validation setting for TF1
   (Health & Safety, Local Lyon): Required → Optional." (WF-4)
6. **Higher level on top** — Carla switches TF3 Actions on; Ludovic then switches TF3 Actions on.
   *Then* Carla sees it locked by Central. Ludovic switches it off: Carla's switch is on again and
   Lyon's result shows TF3 Actions Required (Local). (WF-2, WF-5)
7. **Path** — Ludovic, Result per plant, Lyon, TF1: "Submission → Review → Actions → Validation →
   Closed" with Root cause analysis crossed out; Curitiba TF1: Validation crossed out too; TF5
   anywhere: "Closed after submission". (WF-10)
8. **Existing events keep their workflow** — After scenario 3, Ana Ribeiro submits a TF2 at Lyon:
   its steps include Root cause analysis; `TF-26-0003` (submitted before) does not. (WF-11)
9. **Cell details** — Ludovic opens Lyon TF1 Review: "Central", "Set by Ludovic Costa on 20 Oct
   2026", reviewers Carla Mendes, Eva Novak, Felix Tanaka ("Cannot see Lyon"), Diego
   Laurent. (WF-9)

## Decisions

| Topic | Decision |
|---|---|
| Who may change a setting | Only people at the same level with an overlapping perimeter (a higher level only adds Required on top). |
| What is stored | Only Required settings; Optional is the absence of a setting. |
| Existing events | Keep the workflow of their submission. |
