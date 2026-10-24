# Data Model: Control Panel

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

All platform entities live in the IndexedDB database `platform` (R4). Ids are strings. Dates are
ISO strings. Event Reporting's own entities are in
[../001-event-reporting/data-model.md](../001-event-reporting/data-model.md); only their changes
are listed at the end.

## Stores of the `platform` database

| Store | Key | Content |
|---|---|---|
| `users` | `id` | User (event access + Control Panel roles) |
| `organization` | `id` | Businesses, plants and location nodes (moved from Event Reporting) |
| `reference` | `id` | Pillars, families, levels (moved from Event Reporting) |
| `workflowSettings` | `id` | Workflow setting (Required only) — index `byPillar` |
| `masterValues` | `id` | Master data value — index `byList` |
| `activations` | `id` | Activation choice (a deactivation) — index `byValue` |
| `audit` | `id` | Audit entry — index `byPillar` |
| `notifications` | `id` | Control Panel notification — index `byUser` |
| `meta` | `key` | `seededAt`, `version` |

## User

| Field | Type | Rule |
|---|---|---|
| `id`, `name`, `email` | string | as in 001 |
| `role` | `User` \| `Manager` \| `Site Admin` \| `null` | event role; `null` = no event access (Control Panel only) |
| `plantIds` | string[] | plants for events |
| `pillarIdsByPlant` | `{ [plantId]: string[] }` | as in 001 |
| `controlPanelRoles` | ControlPanelRole[] | may be empty |

**ControlPanelRole**: `{ pillarId, level: 'central' | 'cluster' | 'local', plantIds }`.
`central` → `plantIds` = all plants; `cluster` → 2+ plants; `local` → exactly one plant. At most
one role per pillar per user.

Sample users (R8) — existing seven unchanged plus:

| User | Event role | Control Panel roles |
|---|---|---|
| Ludovic Costa | none | Central — Health & Safety, Industrial Hygiene |
| Ed Petrov | none | Central — Environment |
| Sergio Martins | none | Central — Industrial Risk |
| Lucas Weber | Manager (Lyon, Porto) | Cluster — Health & Safety and Environment (Lyon, Porto) |
| Eva Novak *(existing)* | Site Admin (Lyon) | Local — all four pillars (Lyon) |
| Felix Tanaka *(existing)* | Manager (Curitiba) | Local — Health & Safety, Environment (Curitiba) |
| Carla Mendes *(existing)* | Manager (Lyon) | Local — Health & Safety (Lyon) |

A second Cluster administrator covering Lyon and Curitiba on Health & Safety (Pascal Fischer)
demonstrates overlapping clusters; Carla and Eva (both Local Lyon on Health & Safety) demonstrate
option A (changing a setting made by someone else at the same level).

## Phases

`PHASES = ['submission', 'review', 'rootCause', 'actions', 'validation']` with labels
Submission, Review, Root cause analysis, Actions, Validation. `submission` is always Required and
is never stored.

## Workflow setting (only Required is stored — R5)

| Field | Type | Rule |
|---|---|---|
| `id` | string | |
| `pillarId` | string | |
| `levelCode` | string | a level of the pillar (TF1…, EVE1…, SRE1…, OH-…) |
| `phase` | phase except `submission` | |
| `scopeLevel` | `central` \| `cluster` \| `local` | level of the author's role |
| `plantIds` | string[] | the author's role plants at save time |
| `reviewerIds` | string[] | required, ≥ 1, when `phase = 'review'`; empty otherwise |
| `authorId`, `updatedAt` | string | last person who changed it |

**Uniqueness**: one setting per `pillarId + levelCode + phase + scopeLevel + plantIds` (sorted).
Two Clusters with different perimeters keep separate settings.

**Who may change a setting** (`canEditSetting(user, setting)`): the user holds a role on the
setting's pillar at the same `scopeLevel`, and their plants overlap the setting's plants (Central
always overlaps). Changing someone else's setting (new author) creates a notification for the
previous author (FR-009). Settings of other levels are read-only (locked) — FR-008.

**Valid reviewers** for a scope: users with event role Manager or Site Admin who have access to
the pillar at every plant of the scope (Central: listed per plant; a reviewer is offered for the
plants they can see). A saved reviewer who lost access shows a warning (Edge Cases).

## Resulting workflow (computed, never stored on the platform)

`resultingWorkflow(settings, { pillarId, levelCode, plantId })` →

```text
{ submission: { required: true, sources: [] },
  review:     { required, sources: [setting…] },   // sources = settings that apply
  rootCause:  …, actions: …, validation: … }
```

A setting applies to a plant when `scopeLevel = central`, or its `plantIds` include the plant.
`required = sources.length > 0`. Badge shown in grids = highest level among sources (Central >
Cluster > Local) plus "+n" when several.

**Locked cell** for a user at level L: some source has a level above L.

## Event workflow snapshot (stored on each submitted event — R6)

```text
event.workflow = {
  computedAt,
  phases: { review: { required, sources: [{ scopeLevel, authorId }], reviewerIds }, … }
}
```

`reviewerIds` = union of reviewer groups of the sources of `review`, filtered to users who can see
the event's plant and pillar. If no phase besides Submission is required → `event.status =
'Closed'`, `closedAt = submittedAt`.

## Master data list (constant `LISTS` in `masterData.js`)

| List id | Pillar | Fixed global | Code | Parent |
|---|---|---|---|---|
| `standards` | H&S | no | required | — |
| `hazards` | H&S | no | required | — |
| `bodyPartCategories` | H&S | yes | — | — |
| `bodyParts` | H&S | yes | — | `bodyPartCategories` |
| `injuries` | H&S | yes | — | — |
| `aspects` | Environment | no | — | — |
| `impacts` | Environment | no | — | — |
| `irCategories` | Industrial Risk | no | required | — |

Industrial Risk additionally shows `standards` and `hazards` read-only ("Owned by Health &
Safety") — FR-021.

## Master data value

| Field | Type | Rule |
|---|---|---|
| `id`, `listId` | string | |
| `code` | string | required for lists with code; unique in list + owner scope |
| `name` | string | required; unique in list + owner scope for lists without code |
| `description` | string | optional |
| `parentId` | string | Body Parts only: required, one category |
| `ownerLevel` | `central` \| `cluster` | Local never owns values |
| `ownerPlantIds` | string[] | empty for Central; the cluster perimeter otherwise |
| `status` | `Active` \| `Inactive` \| `Retired` | Retired is final |
| `createdBy`, `createdAt`, `updatedBy`, `updatedAt` | string | |

**Lifecycle**: Active ⇄ Inactive (by owner) → Retired (by owner, final). A Body Part cannot be
Active while its category is not Active (FR-020).

**Initial catalogs** (`catalogs.js`, FR-014): 14 Standards, 36 Hazards (A1…I1), 8 Body Part
Categories with their Body Parts, 38 Injuries, 15 Aspects, 13 Impacts, 11 Categories
(IRC1–IRC11), all owned by Central and Active.

## Activation choice (a deactivation for a scope)

| Field | Type | Rule |
|---|---|---|
| `id`, `valueId` | string | |
| `scopeLevel` | `central` \| `cluster` \| `local` | |
| `plantIds` | string[] | the author's role plants |
| `authorId`, `createdAt` | string | |

Reactivating deletes the choice made at the user's level. A Local user cannot remove a Cluster's
choice (Edge Cases).

**Available values** — `availableValues(values, activations, { listId, plantId })`: status
Active; owned by Central or by a Cluster whose perimeter includes the plant; no activation choice
applying to the plant (Central, covering Cluster or the plant's Local); for Body Parts, the parent
category is available too.

**Who may do what** (`allowedValueActions(user, list, value)`): see FR-015/FR-016 — Central: add,
edit, deactivate, retire; Cluster: add (own perimeter), edit/retire own values,
deactivate/reactivate any available value for its perimeter; Local: deactivate/reactivate only;
fixed global lists: Central only.

## Audit entry

`{ id, pillarId, at, userId, scopeLevel, plantIds, subject: 'workflow' | listId, targetId, action
('required' | 'optional' | 'reviewers' | 'add' | 'edit' | 'deactivate' | 'reactivate' |
'retire'), before, after }` — `before` / `after` are short readable texts (e.g., "Optional" →
"Required (reviewers: Carla Mendes)").

## Notification

`{ id, userId, at, read, text, pillarId, settingId }` — e.g., "Lucas Weber changed your Review
setting for TF2 (Health & Safety, Cluster Lyon + Porto): reviewers Carla Mendes → Diego Laurent."

## Changes to Event Reporting data

- Database `event-reporting` version 6: stores `users`, `organization` and the platform part of
  `reference` are removed; form lists stay in `reference`.
- Event: new fields `workflow` (snapshot above) and `closedAt`; status may be `Closed` at
  submission.
- Sample events: get a `workflow` computed from the starting settings at seed time.
- Users without an event role are not shown on Event Reporting's start screen.
