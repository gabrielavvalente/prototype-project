# Data model: Event review

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Changes to the Event Reporting data ([001 data model](../001-event-reporting/data-model.md)); the
workflow kept on each event comes from [002](../002-control-panel/data-model.md).

## Event (extended)

| Field | Type | Rule |
|---|---|---|
| `status` | `'Draft' \| 'Open' \| 'In Progress' \| 'Archived' \| 'Closed'` | See transitions below |
| `review` | Review \| null | Absent or null until someone takes the review |
| `archivedAt` | ISO date-time \| null | Set when Archived |
| `closedAt` | ISO date-time \| null | Existing; also set when a valid review closes the event |
| `workflow.phases.review.reviewerIds` | user ids | Existing (002): who may review |

## Review

| Field | Type | Rule |
|---|---|---|
| `reviewerId` | user id | The reviewer who assigned themself; one of `workflow.phases.review.reviewerIds` |
| `claimedAt` | ISO date-time | When they assigned themself |
| `decision` | `null \| 'valid' \| 'invalid'` | Null while the review is in progress |
| `invalidReason` | `'Duplicated' \| 'Useless' \| 'Bad quality'` | Required when `decision = 'invalid'` |
| `statement` | text | Required when `decision = 'valid'`; must not contain the reporter's full name (case ignored) |
| `classification` | `{ [listId]: valueId[] }` | Optional; lists of the event's pillar, values available at its plant |
| `comments` | text | Optional |
| `reviewedAt` | ISO date-time | When the decision was saved |

## Status transitions

```text
Draft ──submit──► Open ──assign myself──► In Progress ──valid, more steps──► In Progress (next step)
          │                                     ├──valid, nothing else──► Closed
          │                                     └──not valid + reason──► Archived
          └──submit, only Submission required──► Closed   (002 FR-026)
```

- Editing from the form: Draft (author) and Open (Managers of the plant and pillar) only.
- Archived and Closed are final in this version (no Rework).

## Workflow step (computed)

Steps in order: `submission`, `review`, `rootCause`, `actions`, `validation`.

- **Required**: `submission` always; the others when `workflow.phases[step].required`.
- **Current step**: none when the status is Draft, Archived or Closed; otherwise the first
  required step after Submission that is not done (Review is done once `review.decision` is set).
- **State shown**: `done` (reached and passed), `current`, `upcoming` (required, not reached),
  `skipped` ("Not required"). Done and current open; upcoming and skipped are disabled.

## Who may do what

| Action | Who | When |
|---|---|---|
| See the Review button / start the review | A user in `reviewerIds` | Current step is Review and `review.reviewerId` is empty or is the user |
| Assign myself | Same | `review.reviewerId` empty |
| Record the decision | `review.reviewerId` | Decision not saved yet |
| Open the steps page | Anyone who can see the event | Event submitted |

## Alert (extended)

New type `Event archived (<reason>)`, for the reporter, the people shared with and the other
reviewers (never the reviewer who archived), linked to the event like the existing alerts.
