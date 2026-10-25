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
   Complete review: current step Root cause analysis; the review shows the designation.
2. **Alerts** — Eva Novak and Ana Ribeiro (team members) and Diego have "Root cause analysis assigned
   to you"; Carla (the reviewer, also a member) has none.
3. **Not asked** — Review `TF-26-0006` (TF4) with "further analyze" No: the field is not shown.
4. **Perform** — As Diego, open `TF-26-0003` → Root cause analysis: statement and immediate actions
   pre-filled; all parts Not started. Add a 6M cause (Method, "No wet floor signage", why); in 5
   Why answer 3 whys, mark the third as root cause → Behavioral / Conditional required; choose
   Conditional; Branch a second leg; write Learnings; **Save**, leave and come back: unchanged.
5. **Limits** — Add 6 causes: Add cause is disabled; a leg stops at 5 whys.
6. **Complete** — Remove the learnings and Complete → refused, Learnings flagged; write them and
   Complete → Actions current (TF2 requires Actions), step read-only with "Completed by Diego
   Laurent"; history shows "Root cause analysis completed".
7. **Read only** — As a Lyon user who was not designated (e.g. Lucas Weber, who belongs only to the
   electrical group), the step is read-only.
8. **Groups tab** — User Management as Ludovic Costa → Groups: 4 groups with pillars, plants and
   members; as Lucas Weber (Lyon + Porto): the groups of Lyon and Porto only; no edit action.
9. **Phone and keyboard** — At 320px the 5 Why legs scroll sideways; every control works with Tab,
   Space and Enter.
