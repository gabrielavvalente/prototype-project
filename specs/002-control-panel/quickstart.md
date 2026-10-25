# Quickstart: Control Panel

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to run the apps together and prove the feature works. Screens are in
[contracts/routes.md](contracts/routes.md); rules and sample users in
[data-model.md](data-model.md).

## Run

```bash
cd apps/event-reporting && npm install     # first time only
cd ../control-panel && npm install         # first time only
cd ../user-management && npm install       # first time only
cd ../../launcher && npm install           # first time only
npm run dev                                # starts every app and opens http://localhost:5173/

cd ../apps/control-panel && npm test       # platform rules + Control Panel logic
cd ../event-reporting && npm test          # Event Reporting rules
```

Expected: the launcher page shows the three apps; each opens with no console errors; all tests pass.
Always open the apps **through the launcher** for shared data (R1).

## Validation scenarios

Start from fresh data: Control Panel start screen → **Reset demo data**.

Starting settings (sample data): Central requires Review on TF1–TF4, EvE1–EvE4, SRE1–SRE4 and
every Industrial Hygiene level, Actions on TF1–TF2 and EvE1–EvE2, Root cause analysis on
SRE1–SRE2; Eva Novak requires Validation for TF1 at Lyon. TF5, EvE5 and SRE5 require nothing.

### 1. Central sets Review with reviewers (Story 1, SC-001)

1. Control Panel as **Ludovic Costa** → Health & Safety → Workflow: Review TF1–TF4 show
   "4 reviewers".
2. Turn Review on for TF5: the reviewers sheet offers only Managers and Site Admins; Done is
   disabled until someone is chosen. Pick Carla Mendes → Done.

Expected: "Saved — TF5 Review is now Required. Applies to new events."; done in under 2 minutes.

### 2. Cluster and Local add on top (Story 1, FR-007, FR-008)

1. As **Lucas Weber** (Cluster Lyon + Porto): Review cells are locked "Required by Central —
   Ludovic Costa, <date>"; turn Root cause analysis on for TF1 and TF2.
2. As **Eva Novak** (Local Lyon): Review and Root cause TF1–TF2 are locked; turn Actions on for
   TF3.
3. Result per plant: Lyon TF3 = Review (Central) + Actions (Local); Porto TF3 = Review only;
   Lyon TF1 = Review + Root cause (Cluster) + Actions (Central) + Validation (Local). Open a cell
   → author, date and reviewers shown. In Lucas's Environment pillar, choose EvE5 → every phase
   is crossed out and the path ends with "Closed after submission".

### 3. Same level change and notification (FR-009, FR-023)

1. As **Pascal Fischer** (Cluster Lyon + Curitiba, H&S): Lucas's Root cause setting is editable
   (same level, Lyon in common) and shows "Set by Lucas Weber"; leave it unchanged.
2. As **Carla Mendes** (Local Lyon, H&S): Eva's Actions TF3 setting shows "Set by Eva Novak";
   switch it off → confirm message "Eva Novak set this. They will be notified of your change.";
   as Eva, the bell shows "Carla Mendes changed your Actions setting for TF3 … Required →
   Optional."
3. As Eva (Local) a Central cell has no switch (locked).

### 4. Event follows the workflow in force (FR-012, FR-026, SC-006)

1. Event Reporting (launcher) as **Ana Ribeiro** (Lyon): submit a TF5 (SIP No) → banner "…
   submitted and closed right away (no other phase required)", status **Closed**.
2. In the Control Panel, Ludovic turns Review on for TF5 (scenario 1). Submit another TF5 →
   status Open; its stored workflow requires Review with Carla Mendes as reviewer; the first TF5
   is still Closed with Submission only.

### 5. Master data governance (Story 2, SC-003, SC-004)

1. As Ludovic: Standards 14, Hazards 36, Body Parts by 8 categories, Injuries 38. Add a Standard
   with an existing code → refused. Retire a Hazard → shown Retired, not available anywhere.
2. As Lucas: add a Hazard for Lyon + Porto; deactivate a Central Standard for the perimeter; Body
   Parts and Injuries read-only.
3. As Eva: only Deactivate / Reactivate; deactivate two Hazards for Lyon; cannot reactivate the
   Standard Lucas deactivated.
4. "Availability for Lyon" vs "Porto" vs "Curitiba" matches a manual count.
5. As **Ed Petrov**: Aspects 15, Impacts 13. As **Sergio Martins**: Categories 11, plus Standards
   and Hazards read-only "Owned by Health & Safety".

### 6. Access and users (Stories 3 and 4)

- As **Ana Ribeiro** (no Control Panel role): start screen shows her disabled; `#/pillars` →
  permission message.
- As Felix (Local Curitiba, H&S + Environment): only those two pillars offered.
- User Management (launcher): Ludovic sees everyone; Lucas sees only users of Lyon or Porto; a user detail lists access,
  roles and review groups; no edit action anywhere.

### 7. Persistence and shared data

Close the browser, reopen through the launcher: settings, values, audit and events are still
there, and Event Reporting sees changes made in the Control Panel without reloading data by hand.

## Definition of done

All scenarios pass, both test suites pass, no console errors in either app, and the READMEs (root,
Control Panel, Event Reporting) explain running through the launcher.
