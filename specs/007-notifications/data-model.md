# Data model: Notifications

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Three new stores of the `platform` database (version 2). The `alerts` store of `event-reporting`
keeps its shape `{ id, recipientId, type, eventId, createdAt, read }`; "Action assigned to you" is
no longer written.

## notificationSettings (key `id`, index `userId`)

| Field | Value |
|---|---|
| id | `<userId>|<type>` |
| userId | the person |
| type | an information alert type of the catalogue (never a work alert) |
| on | true / false |
| setById | who changed it last (the person or a Site Admin) |
| setAt | when (ISO) |

No record = on, set by nobody (research R3).

## notificationRules (key `id`, index `plantId`)

| Field | Value |
|---|---|
| id | generated |
| plantId, pillarId | the plant of the Site Admin's page and the rule's pillar |
| levelCodes | one or more level codes of the pillar (disease types for Industrial Hygiene) — "Choose at least one level." |
| departmentIds | department location ids of the plant; empty = all departments |
| userIds | one or more people with an event role who see the plant and pillar — "Choose at least one person." |
| authorId, updatedAt | last change |

## notificationChanges (key `id`, index `plantId`)

| Field | Value |
|---|---|
| id, plantId, at, userId | the change: where, when, who |
| what | "Health & Safety rule" or "<person> · <alert type>" |
| action | Added, Edited, Deleted, Turned off, Turned on |
| before, after | texts ("On", "Off", or the rule as listed in NT-7; "—" when absent) |
