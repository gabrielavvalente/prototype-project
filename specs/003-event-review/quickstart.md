# Quickstart: Event review

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Screens in [contracts/routes.md](contracts/routes.md); rules in [data-model.md](data-model.md).

## Run

```bash
cd launcher && npm run dev                 # opens http://localhost:5173/
cd apps/event-reporting && npm test        # includes the review rules
```

Expected: all tests pass; Event Reporting opens through the launcher with no console errors.
Start each run from **Reset demo data** (Event Reporting start screen).

Sample facts used below: Central requires Review on TF1–TF4 with reviewers Carla Mendes, Eva
Novak, Felix Tanaka, Diego Laurent (each only where they can see the event); Actions on TF1–TF2;
nothing on TF5. Lyon events are reviewed by Carla, Eva and Diego.

## Scenarios

1. **Review button** — Sign in as Carla Mendes (Lyon, all pillars), List view, expand
   `TF-26-0006` (TF4, Open): a **Review** button is shown. Sign in as Ana Ribeiro (User) and expand
   the same row: no Review button, a **Workflow steps** link instead. Same in the Kanban view.
2. **Steps** — As Carla, click Review: the steps page shows Submission done, Review current, the
   three other steps "Not required" and disabled. Open Submission: the reported event is shown.
3. **Take the review** — The Review step says "This event is waiting for a reviewer."; click
   **Assign myself as reviewer**: the status badge becomes In Progress and the form opens.
4. **One reviewer** — Sign in as Eva Novak, open `#/events/TF-26-0006/steps/review`: "Carla Mendes
   is reviewing this event.", no form; the expanded row shows no Review button.
5. **Valid → Closed** — Back as Carla: answer Yes, leave the statement empty → refused; write
   "Ana Ribeiro saw a pallet fall" (reporter is Ana Ribeiro) → refused (do not name the reporter);
   write "An operator saw a pallet fall from the racking; nobody was nearby.", pick one Standard
   and one Hazard, **Complete review**: status **Closed**, Review shows the summary.
6. **Valid → In Progress** — Review a Lyon TF1 or TF2 event (Actions required) as valid: status
   stays **In Progress**; the steps show Review done and Actions current ("comes in a later
   version").
7. **Not valid → Archived** — As Carla, take `TF-26-0003`, answer No and click **Archive event**
   without a reason → refused; choose Duplicated → status **Archived**. The event is gone from the
   list and the Kanban; Filters → Status = Archived shows it. Sign in as its reporter: My Alerts
   has "Event archived (Duplicated)"; Carla has no such alert.
8. **Edit lock** — As Diego Laurent (Manager): an Open Lyon event shows Edit; the Closed, In
   Progress and Archived events of scenarios 5–7 do not, and their `/edit` address says not
   allowed.
9. **Other pillars** — Review an Environment event: lists Aspects and Impacts; an Industrial Risk
   event: Categories, Standards, Hazards; an Industrial Hygiene event: no list.
10. **Phone and keyboard** — At 320px the steps menu is a horizontal strip; every step link, the
    Yes/No and reason chips and the buttons work with Tab and Enter.

## Second review scenarios (severity and critical events)

11. **Critical safety event** — As Carla, review `TF-26-0003` (TF2) as valid: the statement starts
    with the description; pick a Standard, Hazard, Body Part and Injury; Potential = Severe ×
    Medium term (50, High), Actual = Minor × Short term (5, Low) → "Critical event: SIP", choose a
    SIP type; "Do you want to further analyze?" shows Yes → **Complete review**: In Progress, Root
    cause analysis current, red "SIP" badge in the list and on the steps page.
12. **Not critical, no analysis** — Review `TF-26-0006` (TF4): only the Potential matrix; Significant
    × Short term (15, Low); "further analyze" must be answered; No → **Closed**.
13. **Bad quality** — Answer No on `TF-26-0001`, choose Bad quality, archive without a comment →
    "Explain what makes the report of bad quality."; with a comment → Archived; its steps after
    Review are not Done.
14. **Environment** — Review `EVE-26-0001`: "Is this event a SIP?" Yes → SIP type required, critical,
    "further analyze" proposed Yes.
15. **Industrial Risk** — Review `SRE-26-0004` (SRE2, Root cause analysis required by Central): no
    "further analyze" question; Potential Loss Major × Long term and Actual Loss Significant × Long
    term → "SPL · HCL", choose an SPL type → In Progress at Root cause analysis.
