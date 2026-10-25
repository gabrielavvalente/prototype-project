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
| `immediateActions` | text | Pre-filled from the submission's immediate actions |
| `fiveW1H` | `{ who, what, when, where, why, how }` each `{ applies: true \| false \| null, answer }` | Optional |
| `causes` | `[{ id, theme, cause, why }]` | 0–6; theme ∈ Man, Machine, Method, Materials, Mother Nature, Management; Done needs ≥1 with cause and why |
| `legs` | `[{ id, whys: [{ id, answer, rootCause }] }]` | ≥1 leg, 1–5 whys each; `rootCause` ∈ null, `unclassified`, `behavioral`, `conditional`; Done needs ≥1 root cause classified with an answer |
| `learnings` | text | Required to complete |
| `savedBy`, `savedAt` | user id, date-time | Last save |
| `completedBy`, `completedAt` | user id, date-time \| null | Set by Complete analysis |

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
