# Routes: Safety communication

**Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

| Route | Who | Content |
|---|---|---|
| `#/events?tab=communications` | every event role | Safety communications of the context's plant (SC-8), a page of the event workspace (EL-1) |
| `#/communications/:record/alert` | event role with access to the event's plant | The Safety Alert (SC-4, SC-9) |
| `#/communications/:record/warning` | the same, once published; the plan owners for the draft | The Safety Warning (SC-5 to SC-7, SC-9) |

A document someone may not read shows "This safety communication is not available." (SC-3).
Titles: "Safety communications — Event Reporting", "Safety Alert — <record> — Event Reporting",
"Safety Warning — <record> — Event Reporting".
