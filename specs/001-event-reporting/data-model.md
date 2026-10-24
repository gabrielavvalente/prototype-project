# Data Model: Event Reporting MVP

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-24

All data lives in one IndexedDB database named `event-reporting` (see
[research.md](research.md) R2). Each heading below is one **store** (a table). Dates are stored as
ISO strings (`2026-10-24`, `2026-10-24T14:30:00`).

## Stores at a glance

| Store | Key | Holds |
|---|---|---|
| `events` | `id` | Events (drafts and submitted) |
| `attachments` | `id` | Photo and video files of events |
| `alerts` | `id` | My Alerts entries |
| `users` | `id` | Demo users |
| `organization` | `id` | Businesses, plants and location nodes |
| `reference` | `id` | Pillars, families, levels and other fixed lists |
| `counters` | `id` | Last record-number sequence per family and year |
| `settings` | `id` | Per-user choices (current context, visible columns) |

## events

One event, from draft to submitted.

| Field | Type | Rules |
|---|---|---|
| `id` | text | Generated when the draft is first saved; never shown to users |
| `recordNumber` | text or null | `null` while `Draft`; set on submit as `<FAMILY>-<YY>-<NNNN>`, e.g. `EVE-26-0001` (FR-016) |
| `status` | `Draft` \| `Open` | Only these two in this MVP (see State transitions) |
| `businessId`, `plantId` | text | Plant must belong to business and to the user's access (FR-021) |
| `pillarId` | text | Pre-set when the user entered through a pillar (FR-037) |
| `familyCode` | `TF` \| `EVE` \| `SRE` \| `OH` | Must belong to the pillar |
| `levelCode` | text | e.g., `TF4`, `EvE2`, `SRE1`; for OH, the disease classification |
| `riskQuestion` | object or null | `{ type: 'SIP' \| 'CRP' \| 'SRP', answer: true \| false }`; type follows FR-004; cleared when pillar or level changes |
| `location` | object | `{ departmentId, workshopId, jobId, workstationId, taskId }`; each child must belong to its parent (FR-005) |
| `taskTypeId` | text | Required before leaving the Location section |
| `title` | text | Required, 1–120 characters |
| `reporterId` | text | Defaults to the current user; only a Manager may change it (FR-006) |
| `reportDate` | date | Set to today when the draft is created; read-only |
| `eventTime` | time | Required; not later than now when `reportDate` is today |
| `shiftMoment` | `Day` \| `Night` \| `Afternoon` | Required |
| `description` | text | Required, multi-line plain text, up to 2,000 characters |
| `employeeType` | text | One of: Employee, Temporary Worker, Permanent Contractor, Non-Permanent Contractor, Other |
| `recurrence` | true \| false | Required |
| `comments` | text | Optional |
| `feedbackEmails` | list of text | Optional; each must look like an email address; stored, never sent |
| `diseaseIds` | list of text | Shown and required only when `familyCode` is `OH` |
| `immediateActions` | list of ImmediateAction | See below; optional (FR-012) |
| `attachmentIds` | list of text | 0–5 items; optional (FR-008) |
| `createdBy`, `createdAt`, `updatedBy`, `updatedAt` | text / date-time | Set automatically (FR-035) |
| `submittedAt` | date-time or null | Set on submit |

Indexes: `plantId`, `status`, `reporterId`, `recordNumber` (unique when not null).

### ImmediateAction (stored inside its event)

| Field | Type | Rules |
|---|---|---|
| `id` | text | Generated |
| `description` | text | Required |
| `priority` | text | Required, from reference list |
| `categoryId` | text | Required |
| `completionDate` | date | Required; not after today, not before the event's report date |
| `kpiId` | text | Optional |
| `comments` | text | Optional |
| `performedByIds` | list of text | 1–5 user ids (FR-013) |
| `status` | `Completed` | Always `Completed` (Clarification 2026-10-24) |
| `createdAt` | date-time | Set automatically |

Immediate actions live inside the event because they have no life of their own in this MVP. When
the Action Plan feature arrives they can move to their own store.

## attachments

| Field | Type | Rules |
|---|---|---|
| `id` | text | Generated |
| `eventId` | text | The owning event |
| `fileName` | text | Original name |
| `mimeType` | text | Must start with `image/` or `video/`, extension must match an allowed list (FR-009) |
| `size` | number (bytes) | ≤ 5 MB (5,242,880 bytes) |
| `blob` | file data | The photo or video itself |
| `addedBy`, `addedAt` | text / date-time | Set automatically |

If the browser refuses to save because storage is full, the save fails with a clear message and
the form keeps everything already typed (spec Edge Cases).

## alerts

| Field | Type | Rules |
|---|---|---|
| `id` | text | Generated |
| `recipientId` | text | A user |
| `type` | `Event submitted` | Only type in this MVP |
| `eventId` | text | Source event; opening the alert opens it (FR-023) |
| `createdAt` | date-time | Sorted newest first |
| `readAt` | date-time or null | Set when the alert is opened or on "Mark all read" (FR-043) |

Created on submit, one per user whose role is `Manager` and whose access includes the event's plant
and pillar (FR-016). Index: `recipientId`.

## users

| Field | Type | Rules |
|---|---|---|
| `id` | text | |
| `name` | text | |
| `avatar` | text | Initials or emoji |
| `role` | `User` \| `Manager` \| `Site Admin` | Drives navigation (FR-022) |
| `access` | list of `{ businessId, plantId, pillarIds }` | What the user may see and report in |

## organization

Every node has `id`, `type`, `name`, `parentId` (null for businesses).

| `type` | Parent | Extra fields |
|---|---|---|
| `business` | — | |
| `plant` | business | `plantTypeIcon`, `plantTypeLabel`, `countryFlag`, `countryName` (FR-020) |
| `department` | plant | |
| `workshop` | department | |
| `job` | workshop | |
| `workstation` | job | |
| `task` | workstation | |

Index: `parentId` (to fill each child list from its parent, FR-005).

## reference

Every item has `id`, `list` and `label`; some have extra fields.

| `list` | Extra fields |
|---|---|
| `pillar` | `code` (H&S, ENV, IR, IH) |
| `family` | `code` (TF, EVE, SRE, OH), `pillarId` |
| `level` | `code` (TF1…TF5, EvE1…EvE5, SRE1…SRE5), `familyId`, `description` (plain-language text, FR-003) |
| `disease` | `familyId` (OH classifications and the Disease(s) list) |
| `taskType`, `employeeType`, `shiftMoment`, `actionPriority` | — |
| `actionCategory` | — |

## counters

| Field | Type | Rules |
|---|---|---|
| `id` | text | `<FAMILY>-<YY>`, e.g., `EVE-26` |
| `lastSequence` | number | Incremented in the same transaction that submits the event (research R10) |

## settings

| Field | Type | Rules |
|---|---|---|
| `id` | text | The user id |
| `businessId`, `plantId` | text | Current context |
| `pillarId` | text or null | `null` = entered without a pillar ("All pillars") |
| `visibleColumns` | list of text | Event list columns the user chose to show (FR-028) |
| `listView` | `kanban` \| `list` \| null | Remembered view; null = Kanban on phones, List on wide screens (FR-041) |
| `recentSearches` | list of text | The user's last 5 searches, newest first (FR-044) |

The id of the "signed-in" demo user is kept in `sessionStorage` so closing the tab returns to the
start screen; everything else lives in IndexedDB.

## State transitions

```text
(new) ──Save as Draft──▶ Draft ──Submit (all mandatory rules pass)──▶ Open
                           ▲  │
                           └──┘ Save as Draft again (edits)
(new) ──Submit (all mandatory rules pass)──────────────────────────▶ Open
```

- `Draft`: visible only to its reporter, no record number, no alerts, excluded from KPI counts.
- `Open`: has a record number; Managers of the plant and pillar get an alert. A Manager may still
  edit it (same validation as creation, FR-034); status stays `Open`.
- Later statuses (In Progress, Archived, Closed) belong to the Review and Governance spec.

## Validation rules summary (implemented as tested functions)

| Rule | Applies when | Source |
|---|---|---|
| Risk question answered | Pillar H&S or ENV (SIP); SRE1–SRE2 (CRP); SRE3–SRE5 (SRP) | FR-004 |
| Task Type chosen | Always, before leaving Location | FR-005 |
| File type, extension, size ≤ 5 MB, ≤ 5 files | Every upload | FR-009 |
| 1–5 performers per immediate action | Every immediate action | FR-013 |
| Diseases chosen | Family OH | FR-010 |
| Event time not in the future; completion date within report date…today | Always | Edge Cases |
