# Data model: Safety communication

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

One new field on the stored event (`event-reporting` database, `events` store; version unchanged).
Events without it have no photo choice and no published Warning.

## event.safetyWarning

| Field | Value |
|---|---|
| photoIds | ids of the event's image attachments ticked in the draft (SC-6); `[]` at first |
| publishedAt | ISO date of publication, or null for a draft (SC-7) |
| publishedBy | the plan owner who published (kept for the event history, never shown on the document) |
| content | the Warning content at publication (the object `warningContent` returns), null for a draft |

The Safety Alert and the Warning draft are not stored (research R1).
