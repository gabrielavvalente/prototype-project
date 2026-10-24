# Quickstart: Control Panel

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

How to run the apps together and prove the feature works. Screens are in
[contracts/routes.md](contracts/routes.md); rules and sample users in
[data-model.md](data-model.md).

## Run

```bash
cd apps/event-reporting && npm install     # first time only
cd ../control-panel && npm install         # first time only
cd ../../launcher && npm install           # first time only
npm run dev                                # http://localhost:5173 lists the apps

cd ../apps/control-panel && npm test       # platform rules + Control Panel logic
cd ../event-reporting && npm test          # Event Reporting rules
```

Expected: the launcher page shows both apps; each opens with no console errors; all tests pass.
Always open the apps **through the launcher** for shared data (R1).

## Validation scenarios

Start from fresh data: Control Panel start screen → **Reset demo data**.

### 1. Central sets Review with reviewers (Story 1, SC-001)

1. Control Panel as **Ludovic Costa** → Health & Safety → Workflow.
2. Turn Review on for TF1, TF2, TF3; pick reviewers (only Managers and Site Admins offered).
   Try Done with nobody selected → refused.

Expected: done in under 2 minutes; Audit shows three entries.

### 2. Cluster and Local add on top (Story 1, FR-007, FR-008)

1. As **Lucas Weber** (Cluster Lyon + Porto): Review TF1–TF3 are locked "Required by Central";
   turn Root cause analysis on for TF1, TF2.
2. As **Eva Novak** (Local Lyon): both are locked; turn Actions on for TF3.
3. Result per plant: Lyon TF3 = Review (Central) + Actions (Local); Porto TF3 = Review only;
   Curitiba TF1 = Review only. Open a cell → author and date shown. Choose TF4 → path shows every
   phase crossed out and "Closed after submission".
4. Compare plants (Lucas, TF1): Lyon and Porto side by side.

### 3. Same level change and notification (FR-009, FR-023)

1. As **Pascal Fischer** (Cluster Lyon + Curitiba, H&S): Lucas's Root cause setting is not theirs
   (different perimeter) → shown as "Required at Cluster (Lyon, Porto)", not editable.
2. As **Carla Mendes** (Local Lyon, H&S): Eva's Actions TF3 setting is editable; switch it off
   → confirm message "Eva Novak set this. They will be notified."; as Eva, the bell shows the
   notification.
3. As Eva (Local) try to switch off a Central cell → not possible (locked).

### 4. Event follows the workflow in force (FR-012, FR-026, SC-006)

1. Event Reporting (launcher) as **Ana Ribeiro** (Lyon): submit a TF4 → status **Closed** right
   away; submit a TF3 → status Open; its stored workflow has Review + Actions.
2. In the Control Panel turn Validation on for TF3 at Central; submit another TF3 → its workflow
   includes Validation; the first TF3 still does not.

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
- Users: Ludovic sees everyone; Lucas sees only users of Lyon or Porto; a user detail lists access,
  roles and review groups; no edit action anywhere.

### 7. Persistence and shared data

Close the browser, reopen through the launcher: settings, values, audit and events are still
there, and Event Reporting sees changes made in the Control Panel without reloading data by hand.

## Definition of done

All scenarios pass, both test suites pass, no console errors in either app, and the READMEs (root,
Control Panel, Event Reporting) explain running through the launcher.
