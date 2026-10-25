# Quickstart: Root cause analysis

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Screens in [contracts/routes.md](contracts/routes.md); rules and sample groups in
[data-model.md](data-model.md).

## Run

```bash
cd launcher && npm run dev                  # http://localhost:5173/
cd apps/event-reporting && npm test         # includes the analysis rules
cd apps/control-panel && npm test           # includes shared/platform groups
```

Start from **Reset demo data** (Event Reporting start screen).

## Scenarios

1. **Designate** — As Carla Mendes, review `TF-26-0003` (TF2) as valid, Potential Severe × Medium
   term (SIP, type), keep "further analyze" Yes: "Who will perform the root cause analysis?" is
   required; leave it empty → refused; choose "Lyon H&S investigation team" and Diego Laurent →
   Complete review: current step Root cause analysis; the review shows the designation and Carla
   stays on it. Repeat on another event designating Carla herself: Complete review opens the Root
   cause analysis step.
2. **Alerts** — Eva Novak and Ana Ribeiro (team members) and Diego have "Root cause analysis assigned
   to you"; Carla (the reviewer, also a member) has none.
3. **Not asked** — Review `TF-26-0006` (TF4) with "further analyze" No: the field is not shown.
4. **Perform** — As Diego, open `TF-26-0003` → Root cause analysis: statement pre-filled across
   the full width, immediate actions as compact lines; all parts Not started. In 6M tick Management › Lack of Resources: card C1
   asks how it contributed; 5 Why was locked and now opens with a column "C1 · Lack of Resources"
   showing that explanation (not editable) and a first why. Answer 3 whys, mark the third as root
   cause → its card is highlighted, nothing else asked; **Branch** the second why: a new why 2
   appears beside it; write Learnings; **Save**, leave and come back: unchanged. 5W1H starts
   collapsed: expand it, open "What happened?", set Yes: 13 questions appear. On an Environment
   event, 5W1H has no "Who was injured?" section.
5. **Immediate actions** — **Add immediate action**: **Create** refuses an empty card; fill it and
   create it, then **Save** the analysis; open the Submission step: the new action is there
   and the history shows "Immediate actions updated in the root cause analysis".
6. **Actions** — Add action is disabled on an empty why. On the third why, **Add action**: the
   popup shows that why's answer; description, Diego and Eva, a due date, High → **Create**: the
   why card shows "1 action" and the action is listed under 5 Why (the why on one line, the
   action below); edit it, then delete it. Create one again, then delete the
   second why: a confirmation warns that its action goes too.
7. **Limits** — Tick 6 causes across themes: the other checkboxes are disabled; a path stops at 5
   whys (no Add why on the fifth).
8. **Complete** — Remove the learnings and Complete → refused, Learnings flagged; write them and
   Complete → Actions current (TF2 requires Actions), step read-only with "Completed by Diego
   Laurent"; history shows "Root cause analysis completed".
9. **Read only** — As a Lyon user who was not designated (e.g. Lucas Weber, who belongs only to the
   electrical group), the step is read-only, immediate actions and actions included.
10. **Groups tab** — User Management as Ludovic Costa → Groups: 4 groups with pillars, plants and
   members; as Lucas Weber (Lyon + Porto): the groups of Lyon and Porto only; no edit action.
11. **Phone and keyboard** — At 320px the 5 Why tree scrolls sideways and the 5W1H and 6M lists
   stack above their content; every control works with Tab, Space and Enter.
