# Contract: the Actions step and the changed screens

**Spec**: [spec.md](../spec.md) | **Data model**: [data-model.md](../data-model.md)

## Actions step — `#/events/:id/steps/actions`

| Part | Content |
|---|---|
| Header | "N actions · N completed · N overdue" (immediate actions included), "· Not deployed" before deployment; "Completed on <date>" once completed |
| Lines | One compact line per action (shared with the analysis): why's answer (when linked) · description · status badge (+ Overdue) · priority · assignees · due date · "Maintenance" tag; due date history under it; View in Action Management |
| Groups | **Immediate actions** (read-only, Completed), then **Corrective actions** |
| Owner controls | Add action; edit and delete (Planned) / Cancel (deployed); **Deploy action plan** (once, also without corrective actions); the plan completes by itself |
| Assignee controls | On their own On Going / To Complete action: **To Complete**, **Completed** |
| Popup | The action popup of the analysis, plus Location (department, workshop) and Notify maintenance (Yes / No), and "Why" (optional select of the analysis's answered whys); **Create** / Save |

Steps menu: Actions shows **Optional** when not required (opens for owners only). Others opening it
see "This step is not required for this event.".

## Validation step — `#/events/:id/steps/validation`

| Part | Content |
|---|---|
| Actions | The plan's groups, read-only |
| Validators (current step) | "Is the action plan effective?" Yes / No; No → "Why is it not effective?"; **Complete validation** |
| Done | "Validated as effective by <name> on <date>"; earlier "not effective" validations listed with their reason |

## Changed screens

- **Root cause analysis step**: Add action opens the popup above with its why; the actions list
  uses the same compact lines.
- **KPIs page**: Open actions and Overdue actions open the Events page narrowed to their events.
- **Submission step history**: "Action plan deployed by …", "Action plan completed by …".
