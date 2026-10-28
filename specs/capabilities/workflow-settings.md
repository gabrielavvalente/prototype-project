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
  name), then its critical row (WF-13), and one column per phase. Submission is shown "Required" and cannot be changed. The hint
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

- **WF-5a** Root cause analysis needs a review: a change that would leave Root cause analysis
  required at a plant where Review is not required for the same level is refused — making Root
  cause analysis Required first ("Make Review Required for <level> first: Root cause analysis
  needs a review (missing at <plants>).") or making Review Optional while it is needed ("Review
  stays Required for <level>: Root cause analysis is required at <plants> and needs a review."),
  whatever the levels involved. Actions and Validation do not need Review, nor does the critical
  row's Root cause analysis: a flagged event has been reviewed.

### Reviewers

- **WF-6** Making **Review** Required saves it at once, like the other phases (WF-3), without
  choosing reviewers: a higher level may leave them to the plants (WF-6a).
- **WF-6a** **Reviewers for your plants**: on a Review cell Required at one of the person's plants —
  by their level or a higher one (locked) — the person sees "Reviewers for your plants: N" (N, the
  reviewers their level chose there), which opens "Reviewers for <level>": the Managers and Site
  Admins who can see the pillar at one of the person's plants, as checkboxes, with the hint "They
  are added to the reviewers chosen by the other levels." **Save — N selected** (or **Save — no
  reviewers**) keeps the choice for the person's level and plants: "Saved — <level> reviewers for
  your plants: <names | none>. Applies to new events.". A choice made by a colleague of the same
  level asks first and notifies them (WF-4, the setting named "Reviewers"). Where Review is
  Optional for all the person's plants, no reviewers are offered.
- **WF-7** When saved reviewers can no longer see the pillar at any of the plants, the list warns
  "N saved reviewer(s) no longer have access and will be removed." and saving drops them.

### Result per plant

- **WF-8** The **Result per plant** view lets the person choose one of their plants (all plants
  for Central) and shows each level × phase as **Required** with a badge of the highest level
  requiring it (Central > Cluster > Local, "+N" when several), or **Optional**. A Required Review
  with no reviewer who can see that plant shows "No reviewer".
- **WF-9** Opening a cell lists every setting requiring it there: level and plants, "Set by <name>
  on <date>"; for Review, then **Reviewers** by the level that chose them ("<Level> <plants>",
  "Set by <name> on <date>", the names, with "Cannot see <plant>" next to a reviewer who cannot see
  that plant), or "No reviewer chosen for <plant> yet.". An Optional cell says "Optional: no level requires this phase here, so it is
  skipped."
- **WF-10** Choosing a level row shows "Path of a <level> event at <plant>": the phases in order,
  skipped ones crossed out, ending with "Closed", or "Closed after submission" when only
  Submission is required. Choosing the critical row shows "Added at <plant> when the review flags
  <SIP or HCI | SIP | SPL or HCL>": Root cause analysis, Actions and Validation, the ones not
  required crossed out, or "Nothing is added." when none is.

### Effect on events

- **WF-11** Each submitted event keeps the workflow in force at its submission (domain Workflow):
  the required phases and the reviewers — the reviewers chosen at every level covering its plant,
  added together (WF-6a), limited to Managers and Site Admins who can see the event's plant and
  pillar — and the critical
  row's required phases, applied if its review flags it (WF-13). Changing a setting never changes
  existing events.
- **WF-12** Every change writes an audit entry ([workspace](control-panel-workspace.md) CPW-6):
  "Made Required" (Optional → Required), "Made Optional", or for a reviewers choice "<level> ·
  Reviewers", "Changed": "<names>" → "<names>" ("No reviewers" when empty).

### Critical row

- **WF-13** **Critical row**: after the levels, Health & Safety shows a row **SIP/HCI** ("Flagged
  SIP or HCI by the review"), Environment **SIP** ("Flagged SIP by the review") and Industrial
  Risk **SPL/HCL** ("Flagged SPL or HCL by the review"); Industrial Hygiene has none. Its Root
  cause analysis, Actions and Validation cells work as the level rows' (WF-2 to WF-5, WF-8, WF-9,
  WF-12); its Submission and Review cells read "From the level" and cannot be changed. A phase
  Required there is added to an event's workflow, whatever its level, as soon as its review flags
  it (domain Critical events); otherwise the row changes nothing.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md) (H&S starts with Review TF1–TF4 and Actions
TF1–TF2 at Central by Ludovic Costa, Validation TF1 at Lyon by Eva Novak).

1. **Grid** — Ludovic opens Health & Safety › Workflow: rows TF1–TF5, Submission Required and
   fixed, Review on for TF1–TF4, Actions on for TF1–TF2; then "SIP/HCI — Flagged SIP or HCI by the
   review", Submission and Review "From the level", Root cause analysis on. Environment ends with
   "SIP", Industrial Risk with "SPL/HCL", Industrial Hygiene with its four disease types only.
   (WF-1, WF-2, WF-13)
2. **Locked for lower levels** — Lucas Weber (Cluster Lyon, Porto) sees Review TF1–TF4 locked
   "Required by Central, Ludovic Costa, 20 Oct 2026"; he cannot switch them. (WF-2)
3. **Cluster requires** — Lucas switches TF2 Root cause analysis on: "Saved — TF2 Root cause
   analysis is now Required. Applies to new events." In Result per plant, Lyon and Porto show TF2
   Root cause analysis Required with a Cluster badge; for Pascal Fischer (Cluster Lyon,
   Curitiba), Curitiba shows it Optional. (WF-3, WF-8)
4. **Reviewers at every level** — Eva Novak (Local Lyon) sees TF2 Review "Required by Central"
   and "Reviewers for your plants: 0"; the list offers Carla Mendes, Diego Laurent, Eva Novak and
   Lucas Weber (not Felix Tanaka, at Curitiba); she saves Lucas Weber: "Saved — TF2 reviewers for
   your plants: Lucas Weber. Applies to new events.". A TF2 submitted at Lyon then has Carla,
   Diego, Eva and Lucas as reviewers. Lucas (Cluster) switches TF5 Review on: no list opens, and
   Result per plant shows "No reviewer" at Lyon and Porto until Carla (Local Lyon) chooses herself
   for TF5 — Porto still warns. Carla then adds Diego to TF2's: "Eva Novak set this. They will be
   notified of your change.", and Eva gets "Carla Mendes changed your Reviewers setting for TF2
   (Health & Safety, Local Lyon): Lucas Weber → Lucas Weber, Diego Laurent.". (WF-6, WF-6a, WF-8,
   WF-11, WF-12)
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
   2026", then Reviewers: Central — Carla Mendes, Eva Novak, Felix Tanaka ("Cannot see Lyon"),
   Diego Laurent. After scenario 4, Lyon TF2 Review also lists "Local Lyon — Lucas Weber", set by
   Eva Novak. (WF-9)
10. **Analysis needs Review** — In Environment, Lucas switches EvE5 Root cause analysis on (EvE5
    has no Review): refused with "Make Review Required for EvE5 first: Root cause analysis needs a
    review (missing at Lyon, Porto).". Sergio Martins switches SRE1 Review off: refused, "Review stays Required
    for SRE1: Root cause analysis is required at Lyon, Curitiba, Porto and needs a review.".
    (WF-5a)
11. **Critical row** — Lucas sees SIP/HCI Root cause analysis locked "Required by Central, Ludovic
    Costa, …" and switches SIP/HCI Validation on: "Saved — SIP/HCI Validation is now Required.
    Applies to new events.", with no refusal although SIP/HCI has no Review; the H&S Audit shows
    "SIP/HCI · Validation", "Made Required". Ludovic, Result per plant, Curitiba, SIP/HCI: "Added
    at Curitiba when the review flags SIP or HCI", Root cause analysis, with Actions and Validation
    crossed out; Lyon shows Validation too. (WF-5a, WF-10, WF-12, WF-13)
12. **Critical events keep their settings** — After scenario 11, a TF3 Ana Ribeiro submits at Lyon
    and Carla reviews with Potential Severe × Long term (SIP) has Root cause analysis and
    Validation; `TF-26-0002` (submitted before) reviewed the same way has Root cause analysis but
    no Validation. (WF-11, WF-13)

## Decisions

| Topic | Decision |
|---|---|
| Who may change a setting | Only people at the same level with an overlapping perimeter (a higher level only adds Required on top). |
| What is stored | Only Required settings; Optional is the absence of a setting. |
| Existing events | Keep the workflow of their submission. |
| Reviewers | Every level chooses reviewers for its plants, even where a higher level requires Review; they are added together; making Review Required needs none. |
| Critical events | One more row per pillar (SIP/HCI, SIP, SPL/HCL; none for Industrial Hygiene) adds Root cause analysis, Actions or Validation when the review flags the event; nobody is asked whether to analyse further. |
