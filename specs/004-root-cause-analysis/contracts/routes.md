# Contract: review field, Root cause analysis step, Groups tab

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

## Event Reporting

### Review form (003, extended)

In the **Next step** part, when the analysis will happen (workflow requires it, or "Do you want to
further analyze?" is Yes): **Who will perform the root cause analysis?** — required, searchable
multiple choice with two option groups, *Users* ("Name — role") and *Groups* ("Group name").
A done review shows "Root cause analysis by: …".

### Root cause analysis step — `#/events/:id/steps/rootCause`

| Part | Content |
|---|---|
| Overview | "Assigned to: …"; Event statement and Immediate actions (text areas, pre-filled); status chips for 5W1H (optional), 6M, 5 Why, Learnings |
| 5W1H (optional guide) | Who, What, When, Where, Why, How: Applies? Yes/No; Yes → answer |
| 6M | Causes as cards (theme select, cause, "Why was … a possible cause?", remove); **Add cause** (disabled at 6, "At most 6 causes") |
| 5 Why | Legs as columns: whys numbered 1–5 (answer, "Root cause" toggle, Behavioral / Conditional when on); **Add why** (up to 5), **Remove last why**, **Branch** (new leg), **Remove leg** |
| Learnings | Required text |
| Actions | **Save** and **Complete analysis** on the right (designated people only) |

- Not designated: everything read-only, "Assigned to: …" shown.
- Completed: read-only, "Completed by <name> on <date>".
- Complete with something missing: nothing saved, each missing part flagged next to it.

History (Submission step): "Root cause analysis completed".

## User Management

| Route | Screen | Access |
|---|---|---|
| `#/users` | Users (existing), with tabs **Users · Groups** | Control Panel role |
| `#/groups` | Groups: name, pillar tags, plants, members with their event role; read only | Control Panel role; groups covering one of the viewer's plants (all for Central) |

Title: "Groups — User Management".
