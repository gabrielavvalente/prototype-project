# Contract: review field, Root cause analysis step, Groups tab

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

## Event Reporting

### Review form (003, extended)

After **Complete review**, a reviewer who is one of the designated people opens
`#/events/:id/steps/rootCause`; others stay on the review summary.

In the **Next step** part, when the analysis will happen (workflow requires it, or "Do you want to
further analyze?" is Yes): **Who will perform the root cause analysis?** — required, searchable
multiple choice with two option groups, *Users* ("Name — role") and *Groups* ("Group name").
A done review shows "Root cause analysis by: …".

### Root cause analysis step — `#/events/:id/steps/rootCause`

| Part | Content |
|---|---|
| Overview | "Assigned to: …"; status chips for 5W1H (optional), 6M, 5 Why, Learnings; Event statement (full width, pre-filled); Immediate actions as compact lines (description, priority, who did it) with edit / delete icons; **Add immediate action**; add and edit open a popup with the submission's card (**Create**, or Save when editing; only when complete) |
| 5W1H (optional guide) | Collapsed title (expand to use; open when answered). Section list on the left (Who was injured? — not for Environment events —, What happened?, When?, Where?, Why did the event occur?, How did the event occur?); on the right "Is this section applicable to your event?" Yes/No and, when Yes, numbered questions with a text field each |
| 6M | Intro text; theme list on the left (with the number of ticked causes) and the theme's guidance below it; on the right the theme's contributory causes as checkboxes (Other → name field), disabled at 6; then "Explain the reason why the contributory cause(s) happened": a C1, C2… card per ticked cause of the theme, "How did "…" contribute to the event occurrence?" + answer |
| 5 Why | Collapsed and disabled with "Available once 6M is done…" until 6M is done, then open. One column per ticked 6M cause: the cause on top ("C1 · Lack of Resources", its 6M explanation in a disabled field), then a tree of why cards, numbered by depth (X icon to delete it with the whys below, confirmation when actions are lost; "N actions" badge; answer; "Root cause" toggle that highlights the card); per card **Add why** (no next why yet, depth < 5), **Branch** (alternative beside it), **Add action** (disabled until answered) |
| Actions summary | Under 5 Why, compact lines like the immediate actions: the why's answer on one line; the action, priority, assignees and due date on the next; edit / delete icons. Modal "New action": the why's answer on top, then description, assignees 1–5, due date, priority; **Create** (Save when editing) |
| Learnings | Required text |
| Actions | **Save** and **Complete analysis** on the right (designated people only) |

- Not designated: everything read-only, "Assigned to: …" shown.
- Completed: read-only, "Completed by <name> on <date>".
- Complete with something missing: nothing saved, each missing part flagged next to it.

History (Submission step): "Immediate actions updated in the root cause analysis" and "Root cause
analysis completed".

## User Management

| Route | Screen | Access |
|---|---|---|
| `#/users` | Users (existing), with tabs **Users · Groups** | Control Panel role |
| `#/groups` | Groups: name, pillar tags, plants, members with their event role; read only | Control Panel role; groups covering one of the viewer's plants (all for Central) |

Title: "Groups — User Management".
