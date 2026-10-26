# Data model: Action plan

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Only what changes on the stored event.

## Action (`event.actions[]`, extended)

| Field | Type | Rule |
|---|---|---|
| `id`, `description`, `assigneeIds`, `dueDate`, `priority`, `createdBy`, `createdAt` | — | As in 004 |
| `whyId` | why id \| null | Optional now; only when the event has an analysis |
| `location` | `{ departmentId, workshopId }` | Required; starts from the event's location |
| `notifyMaintenance` | true \| false \| null | Required (null only for actions saved before) |
| `status` | `planned` \| `onGoing` \| `toComplete` \| `completed` \| `cancelled` | `planned` until deployed |
| `statusChangedBy`, `statusChangedAt` | user id, date-time | Last status change |
| `dueDateHistory` | `[{ from, to, by, at }]` | Appended when the due date changes |

Overdue is computed: deployed, not `completed` / `cancelled`, `dueDate` before today.

## Plan (`event.actionPlan`)

The plan's actions are `event.immediateActions` (always Completed, read-only here) and
`event.actions` (corrective).

| Field | Type | Rule |
|---|---|---|
| `deployedBy`, `deployedAt` | user id, date-time | Set by Deploy action plan (once) |
| `completedBy`, `completedAt` | user id, date-time \| null | Set automatically when the plan is finished (AP-12); cleared when a validation finds it not effective |

## Validations (`event.validations[]`)

| Field | Type | Rule |
|---|---|---|
| `effective` | true \| false | "Is the action plan effective?" |
| `reason` | text | Required when not effective |
| `by`, `at` | user id, date-time | |

Validation is done when the last validation is effective.

## Transitions

```text
planned ──deploy──► onGoing ──assignee──► toComplete ──assignee──► completed
                       │                      │
                       ├──assignee──► completed
                       └──owner──► cancelled ◄──owner──┘
```

## Alerts (extended)

- "Action assigned to you" — each distinct assignee who can see the event, at deployment or when an
  action is added after it.
- "Action plan ready for validation" — the validators, when the plan completes and Validation is next.
- "Action plan not effective" — the plan's owners, when a validation sends it back.
- "Event closed" — the reporter, when a validation closes the event.
