# 11 — Workflow settings

In the Control Panel, each layer (Central, Cluster, Local) says, for its plants, which phases each
level of a pillar requires and who reviews; every event takes the resulting workflow at submission.
Every Control Panel change is audited.

Builds on: [00 Overview](00-overview.md) (workflow, critical events), [01 Roles and permissions](01-roles-and-permissions.md).

## Rules

### Settings

- **WF-1** For each pillar, a setting is made per **row** — each level of the pillar (Health &
  Safety: TF1–TF5 and the Occupational Health disease types; Environment: EvE1–EvE5; Industrial
  Risk: SRE1–SRE5), then the pillar's **critical row** (WF-13) — and per **phase**: Review, Root
  cause analysis, Actions, Validation. Submission is always required and cannot be changed. Only
  Required settings exist: a phase nobody requires is Optional and skipped. Changes apply to new
  events only.
- **WF-2** For a person, each phase of each row is:
  - **locked** when a higher layer requires it for one of the person's plants — they see which
    layer, who and when, and cannot change it;
  - otherwise **Required or Optional** for their layer and plants: Required when a setting of their
    layer covering one of their plants exists (theirs, or a colleague's at the same layer, shown as
    "Set by <name>").
  Settings of lower layers do not show here (they show in the result, WF-8).
- **WF-3** Making a phase Required stores a setting for the person's layer and plants (all plants for
  Central); making it Optional removes the settings of the person's layer for it: "Saved — <row>
  <phase> is now Required / Optional. Applies to new events."
- **WF-4** Changing a setting a colleague of the same layer made (Required / Optional, or reviewers)
  first asks "<names> set this. They will be notified of your change."; the person becomes its
  author and each previous author is notified: "<person> changed your <phase> setting for <row>
  (<pillar>, <layer> <plants>): <before> → <after>." (NT-12).
- **WF-5** A setting never changes another layer's settings: a higher layer only adds Required on top.
  A lower layer's Required setting stays while a higher layer requires the same phase, and applies
  again when the higher one is removed.
- **WF-5a** **Root cause analysis needs Review**: a change that would leave Root cause analysis
  required at a plant where Review is not required for the same row is refused, whichever layers are
  involved — "Make Review Required for <row> first: Root cause analysis needs a review (missing at
  <plants>)." / "Review stays Required for <row>: Root cause analysis is required at <plants> and
  needs a review.". Actions and Validation do not need Review, nor does the critical row's Root
  cause analysis (a flagged event has been reviewed).

### Reviewers

- **WF-6** Making Review Required needs no reviewer: a higher layer may leave them to the plants.
- **WF-6a** On a row where Review is Required at one of the person's plants — by their layer or a
  higher one — the person chooses the **reviewers for their plants**: Managers and Site Admins who can
  see the pillar at one of those plants. "They are added to the reviewers chosen by the other
  levels." Saving keeps the choice for the person's layer and plants ("Saved — <row> reviewers for
  your plants: <names | none>. Applies to new events."); none is allowed. Where Review is Optional
  for all the person's plants, no reviewers are chosen.
- **WF-7** Saved reviewers who can no longer see the pillar at any of the plants are announced ("N
  saved reviewer(s) no longer have access and will be removed.") and dropped when saving.

### Result per plant

- **WF-8** For one of the person's plants (any plant for Central), the result shows each row × phase
  as **Required** — with the highest layer requiring it (Central > Cluster > Local) and how many
  others — or **Optional**. A Required Review with no reviewer who can see that plant is flagged "No
  reviewer".
- **WF-9** For one row and phase at a plant: every setting requiring it (layer and plants, "Set by
  <name> on <date>"); for Review, the reviewers by the layer that chose them, with "Cannot see
  <plant>" for a reviewer who cannot see it, or "No reviewer chosen for <plant> yet."; for an
  Optional phase, "Optional: no level requires this phase here, so it is skipped."
- **WF-10** The **path** of a row at a plant: "Path of a <level> event at <plant>" — the phases in
  order, the skipped ones marked, ending with "Closed", or "Closed after submission" when only
  Submission is required. For the critical row: "Added at <plant> when the review flags <SIP or HCI
  | SIP | SPL or HCL>" with Root cause analysis, Actions and Validation, the ones not required marked,
  or "Nothing is added.".

### Effect on events

- **WF-11** Each submitted event keeps the workflow in force at its submission (OV-10): the required
  phases; the reviewers chosen at every layer covering its plant, added together, limited to Managers
  and Site Admins who can see its plant and pillar; and the critical row's required phases, applied
  if its review flags it. Changing a setting never changes existing events.

### Critical row

- **WF-13** After the levels, **Health & Safety** has a row **SIP/HCI** ("Flagged SIP or HCI by the
  review"), **Environment** **SIP** ("Flagged SIP by the review") and **Industrial Risk** **SPL/HCL**
  ("Flagged SPL or HCL by the review"). Its Root cause analysis, Actions and Validation work as the
  level rows' (WF-2 to WF-5, WF-8 to WF-10); its Submission and Review are "From the level" and
  cannot be set. A phase Required there is added to an event's workflow, whatever its level, as soon
  as its review flags it (OV-11); otherwise the row changes nothing.

### Control Panel audit

- **WF-12** Every workflow and master data change of a pillar writes an **audit entry**, saved together
  with the change: when, who, layer and plants ("Central", "Cluster <plants>"), what (e.g. "TF2 ·
  Review", "TF2 · Reviewers", or the master data value), the change (Made Required, Made Optional,
  Changed, Added, Edited, Deactivated, Reactivated, Retired) and before → after (for reviewers, the
  names; "No reviewers" when empty). The pillar's audit is listed newest first and can be narrowed by
  **What** (everything, workflow, each editable list) and **Who** (everyone, each author), with the
  number of changes shown. People with a Control Panel role on the pillar read it.

## Decisions

| Topic | Decision |
|---|---|
| Who may change a setting | Only people at the same layer with an overlapping perimeter; a higher layer only adds Required on top |
| What is stored | Only Required settings; Optional is the absence of a setting |
| Existing events | Keep the workflow of their submission |
| Reviewers | Every layer chooses reviewers for its plants, even where a higher layer requires Review; they are added together; making Review Required needs none |
| Critical events | One more row per pillar (SIP/HCI, SIP, SPL/HCL) adds Root cause analysis, Actions or Validation when the review flags the event |
| Health & Safety | One grid holds the Safety levels and the Occupational Health disease types |

## Examples

1. **Given** Central requiring Review on TF1–TF4, **then** a Cluster administrator sees those cells
   locked "Required by Central", with who and when, and cannot make them Optional. (WF-2)
2. **Given** a Cluster administrator of plants A and B making TF2 Root cause analysis Required, **then**
   plants A and B show it Required (Cluster) and plant C Optional. (WF-3, WF-8)
3. **Given** a Local administrator of plant A making a TF1 Validation Optional that a colleague of the
   same layer set, **then** they are asked first and the colleague is notified with before → after.
   (WF-4)
4. **Given** EvE5 without Review, **when** someone makes EvE5 Root cause analysis Required, **then** it
   is refused with "Make Review Required for EvE5 first: …". (WF-5a)
5. **Given** Review Required by Central on TF2, **when** a Local administrator of plant A adds a reviewer
   for plant A, **then** a TF2 submitted at plant A has Central's reviewers who can see plant A plus the
   Local one. (WF-6a, WF-11)
6. **Given** Review made Required on TF5 by a Cluster without reviewers, **then** the result flags "No
   reviewer" at its plants until a reviewer is chosen. (WF-6, WF-8)
7. **Given** Root cause analysis Required on the SIP/HCI row, **then** a TF4 (Review only) reviewed as
   SIP goes to Root cause analysis; one reviewed as Moderate closes. (WF-13)
8. **Given** a setting changed after an event's submission, **then** that event keeps its workflow.
   (WF-11)
