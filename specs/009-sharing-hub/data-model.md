# Data model: Event Sharing Hub

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## event.hubShares (array, `events` store)

| Field | Value |
|---|---|
| id, at, by | the share and who made it (never shown to the receiving plants) |
| plantIds | the plants this share reached |
| package | `{ content, classification: [{ list, values: [names] }] }`, frozen (research R2) |

## event.hubChecks (object keyed by receiving plant id)

| Field | Value |
|---|---|
| state | `beingChecked` · `yes` · `no` (no record = "Not checked") |
| answer | true / false / null ("Could it happen here?") |
| actions | `[{ id, description, assigneeIds, dueDate, status: onGoing / completed / cancelled, statusBy, statusAt }]` |
| history | `[{ at, text }]` — "Check started by …", "… completed by …", "Check completed by …" |

"Received on <date>" comes from the share that reached the plant.

## alerts

Optional `plantId`: an alert about a package received by that plant (research R5).

## platform organization

Plants gain `region` ("Europe", "Latin America").
