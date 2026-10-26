# Routes: Event Sharing Hub

**Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

| Route | Who | Content |
|---|---|---|
| `#/events?tab=hub` | every event role | The Sharing Hub of the context's plant (SH-5) |
| `#/hub/:record` | event role, when the event was shared with the context's plant | The package and the local check (SH-5, SH-7 to SH-9) |

Share to Hub is a sheet on the published Warning (SH-1 to SH-4). Titles: "Sharing Hub — Event
Reporting", "Shared Safety Warning — <record> — Event Reporting". A package not shared with the
context's plant shows "This shared event is not available.".
