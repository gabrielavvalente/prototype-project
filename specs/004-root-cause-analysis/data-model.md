# Data model: Root cause analysis

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Builds on [003 Event review](../003-event-review/data-model.md).

## Investigation group (shared sample data)

| Field | Type | Rule |
|---|---|---|
| `id` | text | e.g. `group-lyon-hs` |
| `name` | text | |
| `pillarIds` | pillar ids | Pillars the group investigates |
| `plantIds` | plant ids | Plants it covers |
| `memberIds` | user ids | Members |

Sample groups (fictional):

| Group | Pillars | Plants | Members |
|---|---|---|---|
| Lyon H&S investigation team | H&S | Lyon | Carla Mendes, Eva Novak, Ana Ribeiro |
| Cluster electrical safety team | H&S, Industrial Risk | Lyon, Porto | Diego Laurent, Lucas Weber, Gina Rossi |
| Curitiba EHS team | all four | Curitiba | Felix Tanaka, Ben Okafor |
| Porto environment team | Environment | Porto | Gina Rossi, Diego Laurent |

A group is offered for an event when it covers the event's plant and pillar.

## Review (extended)

| Field | Type | Rule |
|---|---|---|
| `rcaAssignees` | `{ userIds: [], groupIds: [] }` \| null | Required (≥1 entry) when the analysis will happen: workflow requires Root cause analysis or `furtherAnalysis = true`; null otherwise |

## Root cause analysis (`event.rca`)

| Field | Type | Rule |
|---|---|---|
| `statement` | text | Pre-filled from `review.statement` |
| `fiveW1H` | `{ who, what, when, where, why, how }` each `{ applies: true \| false \| null, answers: { <question id>: text } }` | Optional; questions in `logic/rootCause.js` (`FIVE_W1H`); sections offered by pillar (`fiveW1HSections`: no `who` for Environment), and only those count for its status |
| `causes` | `[{ id, theme, option, other, why }]` | 0–6; `theme` ∈ management, humanFactors, methods, machine, materials, environment; `option` is one of the theme's causes or `Other` (then `other` names it); Done needs ≥1, each with its why (and name for Other) |
| `whys` | `[{ id, parentId, answer, rootCause }]` | A tree under the 6M causes: a first why's `parentId` is its cause's id, the others' the why above; each cause has ≥1 first why (added when ticked, removed when unticked); depth ≤ 5; siblings in array order; `rootCause` true / false; Done needs ≥1 root cause and every root cause answered |
| `learnings` | text | Required to complete |
| `immediateActionsChangedBy`, `immediateActionsChangedAt` | user id, date-time \| null | Last save that changed the immediate actions (history) |
| `savedBy`, `savedAt` | user id, date-time | Last save |
| `completedBy`, `completedAt` | user id, date-time \| null | Set by Complete analysis |

Analyses saved before the remarks of 2026-10-25 (`legs`, a single 5W1H `answer`, free-text causes,
whys without a cause, Behavioral / Conditional root causes) are converted when opened
(`normalizeAnalysis`; loose whys go under the first cause; a classified root cause becomes
`true`).

5 Why can be filled in once 6M is done (`canDoFiveWhy`).

## Immediate actions (submission, shared)

The step edits `event.immediateActions` itself (same fields and validation as the submission);
there is no copy in `event.rca`.

## Action (`event.actions`)

| Field | Type | Rule |
|---|---|---|
| `id` | text | |
| `whyId` | why id | The why it was created from |
| `description` | text | Required |
| `assigneeIds` | user ids | 1–5; users of the event's plant who can see its pillar |
| `dueDate` | date | Required |
| `priority` | `Emergency` \| `High` \| `Medium` \| `Low` | Required |
| `createdBy`, `createdAt` | user id, date-time | |

Removing a why deletes the actions of that why and of the whys below it.

## Part status (computed)

`notStarted` (nothing filled) · `inProgress` · `done` — for 5W1H (optional; done when every section
is No or Yes with an answer), 6M, 5 Why and Learnings.

## Steps (003, extended)

- Review is done when `review.decision` is set; Root cause analysis is done when `rca.completedAt`
  is set; the current step is the first required step not done.
- Completing the analysis: next required step with status In Progress, or Closed (`closedAt`).

## Who may edit the analysis

| Who | When |
|---|---|
| A designated user, or a member of a designated group | Current step is Root cause analysis |
| The reviewer | Same, and nobody was designated |

## Alerts (extended)

`Root cause analysis assigned to you` — designated users and members of designated groups who can
see the event, once each, never the reviewer.
