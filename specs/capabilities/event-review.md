# Capability: Event review

**Product**: Event Reporting (Review step)
**Builds on**: [domain](../domain.md) (lifecycle, steps, critical events, master data availability),
[platform data](platform-data.md), [workflow settings](workflow-settings.md) (reviewers),
[master data](master-data.md), [event library](event-library.md) (event page)
**Status**: built

A configured reviewer takes a submitted event, decides whether it is valid, rewrites its statement,
classifies it, assesses its severity, and sends it to its next step or archives it.

## Rules

### Taking the review

- **RV-1** The reviewers of an event are those its workflow kept at submission
  ([workflow settings](workflow-settings.md) WF-11).
- **RV-2** While nobody has taken it, the Review step says "This event is waiting for a reviewer.";
  a reviewer sees "Assign yourself to review it. The other reviewers will no longer be able to." and
  **Assign myself as reviewer**; others see the list of reviewers. Opening the step changes nothing.
- **RV-3** Assigning oneself sets the event **In Progress**. Then only that reviewer reviews it;
  others see "<name> is reviewing this event." (reviewers add "Only the assigned reviewer can
  complete the review."). The assigned reviewer sees "You are the assigned reviewer for this
  event." and the form.
- **RV-4** The **Review** button (on the expanded card, [event library](event-library.md) EL-10)
  shows for a reviewer while Review is the current step and nobody else took it.

### The decision

- **RV-5** "Is this a valid event?" Yes / No. **No** ("Not valid: a duplicate, not useful, or of bad
  quality. It will be archived."): "Why is it not valid?" — Duplicated, Useless, Bad quality; Bad
  quality also asks "What makes the report of bad quality?" (required). The button reads **Archive
  event**.
- **RV-6** **Yes**: the form in three titled parts and **Complete review** on the far right:
  1. **Event statement and classification** — the event statement, starting from the reported
     description ("Starts from the reported description: rewrite it to be shared. Do not name the
     reporter."), and the classification lists of the event's pillar with the values available at
     its plant ([master data](master-data.md) MD-10; Body Parts grouped by category, coded values
     as "<code> — <name>"). Standards and Hazards take one value each; the other lists several.
  2. **Severity** / **Loss** / **Serious incident potential** (by pillar, below).
  3. **Next step** — "Do you want to further analyze?" and the root cause analysis designation
     ([root cause analysis](root-cause-analysis.md) RCA-1).
- **RV-7** What each pillar assesses:

  | Pillar | Required lists | Assessment |
  |---|---|---|
  | Health & Safety | Standards, Hazards; also Body Parts and Injuries for TF1–TF3 | **Potential severity** (TF1–TF4) and **Actual severity** (TF1–TF3) on the injury matrix |
  | Environment | Aspects, Impacts | "Is this event a SIP?" ("Serious Incident Potential: could it have caused serious harm under slightly different circumstances?"), starting from the submission's answer |
  | Industrial Risk | Categories | **Potential loss** (all levels) and **Actual loss** (SRE1–SRE3) on the loss matrix |
  | Industrial Hygiene | — | — |

- **RV-8** Potential and actual are separate framed blocks ("The credible worst case, had the
  circumstances been slightly different." / "What actually happened."); the reviewer clicks the
  matrix cell that fits ("Click the cell that fits."). Score = impact weight × duration weight;
  bands Low 2–15, Medium 20–30, High 50–100.

  | Matrix | Impacts (weight) | Durations (weight) |
  |---|---|---|
  | Injury — "Impact of the injury" × "Duration of the impact (recovery time)" | Severe 5 (prevents most or all private and recreational activities) · Significant 3 (significantly reduces them) · Minor 1 (minimal impact on the person's life) | Minimal 2 (1 week or less) · Short term 5 (more than 1 week, less than 1 month) · Medium term 10 (more than 1 month, less than 6 months) · Long term / Permanent 20 (6 months or more, or may never fully recover) |
  | Loss — "Impact of the loss" × "Duration of the disruption" *(provisional)* | Major 5 (loss of a production line or major equipment, or harm beyond the site) · Significant 3 (equipment damaged, a workshop's production stopped) · Minor 1 (limited damage) | Minimal 2 (back to normal within a day) · Short term 5 (more than a day, less than a week) · Medium term 10 (more than a week, less than a month) · Long term 20 (a month or more) |

- **RV-9** The critical flags (domain Critical events) follow the answers live, with a "Critical
  event" badge. A SIP or SPL asks its type inside the potential block (Environment: under the SIP
  question), required:
  - SIP types (Health & Safety): Entry to machine area without LOTO · Confined Space entry without
    permit · Any unsecured Confined Space · Unguarded access to the dangerous parts of equipment ·
    Collision of vehicle or its load with another vehicle, a pedestrian or with a building · Roll
    over or tip-over of a vehicle · Loss of load or part of load from a vehicle · Collapse of a
    stacked material · Object falling or likely to fall from height · Failure of lifting equipment
    or falling load · Unsecured access point to permit required roof · Person working unsafely at
    height · Any unsafe electrical work or electrical equipment in poor conditions · Any Fire or
    Explosion · Any other incident that could cause a serious injury.
  - SIP types (Environment) *(provisional)*: Uncontrolled release to soil or water · Release to air
    above permitted limits · Spill of a hazardous substance outside its containment · Fire or
    explosion with environmental impact · Other event with serious environmental potential.
  - SPL types *(provisional)*: Fire or explosion · Loss of containment of a hazardous substance ·
    Structural or major equipment failure · Loss of a critical utility (power, gas, water, IT) ·
    Natural hazard (flood, storm, earthquake) · Other serious potential loss.
- **RV-10** "Do you want to further analyze?" is asked only for a critical (red) event (RV-9) whose
  workflow does not already require Root cause analysis, with Yes proposed ("Proposed for a
  critical event: Yes opens a root cause analysis."); Yes makes Root cause analysis a required
  step. Otherwise it is not asked, and the event goes to the analysis only when its workflow
  requires it.
- **RV-11** Completing with something missing saves nothing and shows each message next to its
  field: "Say whether the event is valid." · "Choose why the event is not valid." · "Explain what
  makes the report of bad quality." · "Write the event statement." · "Do not name the reporter in
  the event statement." (the reporter's full name, ignoring case) · "Choose a value." (Standards, Hazards) · "Choose at least one value." (the other lists) ·
  "Rate the potential severity." (or actual severity / potential loss / actual loss) · "Say
  whether the event is a SIP." · "Choose the SIP type." / "Choose the SPL type." · "Say whether the
  event should be analyzed further." · "Choose who will perform the root cause analysis.".
- **RV-12** Only the answers of the decision taken are kept (switching No → Yes drops the reason,
  changing a matrix drops a type no longer needed).

### After the decision

- **RV-13** Not valid → **Archived** (final); "Event archived (<reason>)" goes to the reporter, the
  people it was shared with and the other reviewers, never the reviewer who archived. The steps
  after Review stay "Not reached yet".
- **RV-14** Valid → the next required step (Root cause analysis when required or asked for) with
  the event In Progress, or **Closed** when nothing else is required.
- **RV-15** A completed review shows its summary: Reviewer, Reviewed on, Valid event; then either
  Reason (and Comment), or Event statement, each list's values, the ratings ("<score> — <Band>
  (<impact> × <duration>)"), "Is this event a SIP?", Critical (flags or No), the type, Further
  analysis, Root cause analysis by.
- **RV-16** Once reviewed, the submission can no longer be edited ([event reporting](event-reporting.md)
  ER-21); the history shows "Review taken by …" and "Review completed — valid" or "— archived
  (<reason>)".

## Acceptance scenarios

From freshly reset [demo data](platform-data.md). `TF-26-0003` (TF2, Lyon) has the reviewers Carla
Mendes, Eva Novak and Diego Laurent.

1. **Take the review** — Diego opens `TF-26-0003` › Review: "This event is waiting for a
   reviewer." and Assign myself as reviewer; Ana Ribeiro sees the reviewers' names. Diego assigns
   himself: In Progress; Carla now sees "Diego Laurent is reviewing this event. Only the assigned
   reviewer can complete the review." (RV-2, RV-3)
2. **Archive** — Carla takes `TF-26-0001` and answers No, Bad quality without comment: refused
   with "Explain what makes the report of bad quality."; with a comment, Archive event: Archived;
   Ana, Eva and Diego get "Event archived (Bad quality)", Carla does not. (RV-5, RV-11, RV-13)
3. **Statement** — On `TF-26-0003`, Diego writing "Ana Ribeiro slipped" is refused with "Do not name the
   reporter in the event statement.". (RV-11)
4. **Safety assessment** — Standards and Hazards (one value each), Body Parts and Injuries are
   required (TF2). Potential
   Severe × Medium term = 50 High → SIP, the "Critical event" badge and a required SIP type; Actual
   Minor × Short term = 5 Low. "Do you want to further analyze?" proposes Yes. (RV-7 to RV-10)
5. **Only available values** — After Carla deactivates Hazard A1 for Lyon in the Control Panel, A1
   is not offered in the review of a Lyon event. (RV-6)
6. **Environment** — Reviewing `EVE-26-0001` asks Aspects and Impacts and "Is this event a SIP?"
   (starting from No, the submission's answer); Yes asks the SIP type. (RV-7, RV-9)
7. **Industrial Risk** — Reviewing `SRE-26-0001` (SRE4) asks Categories and Potential loss only;
   Major × Long term makes it SPL with a type. (RV-7, RV-9)
8. **Valid, nothing else required** — `TF-26-0006` (TF4, Review only) reviewed valid with Potential
   Minor × Minimal (Low): "Do you want to further analyze?" is not asked → Closed. With Severe ×
   Long term instead, the event is SIP and the question appears, proposing Yes. (RV-10, RV-14)
9. **Summary and history** — The completed review of `TF-26-0003` shows its summary rows; the
   Submission step's history shows "Review taken by Diego Laurent" and "Review completed — valid";
   the submission is read-only. (RV-15, RV-16)
10. **Phone and keyboard** — At 320px the matrix stays usable (cells reachable and readable); every
    choice works with the keyboard. (Domain)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Who reviews | The reviewers configured in the Control Panel, kept on the event | Sources disagree (owner, final reviewer…) |
| Statuses | Draft, Open, In Progress, Archived, Closed; no Rework | Status models differ between sources |
| Not valid | Reason Duplicated / Useless / Bad quality; comment only for Bad quality | — |
| Loss matrix, Environment SIP types, SPL types | Provisional until the business provides them | Not defined in the sources |
| Out of this version | Owner, Final Reviewer, HPR, Risk / Cost / Ease, Attackability score, Safety Alert, Record Historian, Rework, Final Review | Later capabilities |
