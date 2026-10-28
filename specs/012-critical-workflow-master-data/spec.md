# Change: Workflow for critical events, and the master data workbook

**Feature Branch**: `012-critical-workflow-master-data`

**Created**: 2026-10-28

**Input**: User description: "on the control panel, in the workflow area: for safety, keep current
levels TF1–TF5 and add SIP/HCI; for environment, keep current levels and add SIP; for industrial
risk, keep current levels and add SPL/HCL; in event reporting, instead of asking whether analysis
is needed, remove the question. And for the master data content: see the Excel file and update the
master data content." — with the open points decided with the user on 2026-10-28. Review
remark (2026-10-28): creating or editing an injury requires its link to body parts.

**Capabilities**: changed: `specs/capabilities/workflow-settings.md` (WF-1, WF-5a, WF-10, WF-11,
WF-13 added, scenarios 1 and 7), `specs/capabilities/event-review.md` (RV-6, RV-10, RV-11, RV-14,
RV-15, scenarios 4, 5 and 8), `specs/capabilities/root-cause-analysis.md` (RCA-1),
`specs/capabilities/master-data.md` (MD-1, MD-2, MD-4, MD-5, MD-7, MD-11, MD-12, MD-13, MD-14, Initial catalogs,
scenarios 1, 3, 4, 6 and 9), `specs/capabilities/platform-data.md` (workflow settings),
the scenarios of `action-plan.md`, `notifications.md` and `safety-communication.md` that answered
"further analyze",
`specs/domain.md` (Critical events)

## Why

Whether a critical event is analysed depended on each reviewer's answer; the plants want it set
once, like the rest of the workflow. And the classification lists must follow the business's own
master data workbook, with injuries that make sense for the injured body part.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Critical rows | One more row after the levels: Health & Safety "SIP/HCI", Environment "SIP", Industrial Risk "SPL/HCL"; none for Industrial Hygiene | User |
| What the row does | Its Required phases (Root cause analysis, Actions, Validation) are added to an event's workflow when its review flags it; Submission and Review are not set there (the flag comes from the review) | User |
| "Do you want to further analyze?" | Removed: the workflow decides | User |
| Demo settings | The three rows start with Root cause analysis Required at Central (by Ludovic Costa, Ed Petrov, Sergio Martins), so critical events keep being analysed | Default: today a critical event proposes Yes |
| Standards, Hazards | Replaced by the workbook's 12 and 16 values, in its order; codes STD-01… and HZ-01… are given since both lists require codes | Workbook (no codes) |
| Body Parts, Injuries | Values unchanged; the workbook's typos ("Torse", "Back and spin", "Pain (back,lumbago)") and its broken degree signs are not taken | Workbook |
| Injuries by body part | The workbook's pairing applies: the review offers only the injuries of the chosen body parts | User |
| Injury configuration | Creating or editing an injury requires at least one body part; import reads them too | User (review remark) |
| Diseases | A new Health & Safety list with the workbook's 17 values, fixed: "or lower/upper limbs" → "of lower/upper limbs", "Psycological" → "Psychological"; the Health & Safety form uses it later | User |
| Not taken | Risk Families, Circumstances, Type of Immediate actions; the empty sheets Aspects, Related Aspects, Risk Category change nothing | User |

## Rules

### Added — `workflow-settings.md`

- **WF-13** **Critical row**: after the levels, Health & Safety shows a row **SIP/HCI** ("Flagged
  SIP or HCI by the review"), Environment **SIP** ("Flagged SIP by the review") and Industrial
  Risk **SPL/HCL** ("Flagged SPL or HCL by the review"); Industrial Hygiene has none. Its Root
  cause analysis, Actions and Validation cells work as the level rows' (WF-2 to WF-5, WF-8, WF-9,
  WF-12); its Submission and Review cells read "From the level" and cannot be changed. A phase
  Required there is added to an event's workflow, whatever its level, as soon as its review flags
  it (domain Critical events); otherwise the row changes nothing.

### Changed — `workflow-settings.md`

- **WF-1** *(the rows)* … one row per level of the pillar (code and name), then its critical row
  (WF-13), and one column per phase. *(was: the levels only)*
- **WF-5a** *(not on the critical row)* … A critical row's Root cause analysis never needs Review
  to be Required: a flagged event has been reviewed. *(was: every row)*
- **WF-10** *(the critical row)* Choosing the critical row shows "Added at <plant> when the review
  flags <SIP or HCI | SIP | SPL or HCL>": Root cause analysis, Actions and Validation, the ones not
  required crossed out, or "Nothing is added." when none is. *(was: level rows only)*
- **WF-11** *(the critical row)* Each submitted event also keeps the critical row's Required phases
  in force at its submission, applied if its review flags it. *(was: its level's only)*

### Changed — `event-review.md`

- **RV-6** *(the parts and the injuries)* 3. **Next step** — the root cause analysis designation
  ([root cause analysis](root-cause-analysis.md) RCA-1), shown only when the event goes to Root
  cause analysis. In part 1, **Injuries** offers only the injuries of the chosen Body Parts
  (master data MD-4), available at the plant; before a body part is chosen it reads "Choose the
  body parts first." and offers nothing; removing a body part drops the chosen injuries no longer
  offered. *(was: "Do you want to further analyze?" in part 3; every injury offered)*
- **RV-10** A valid review sends the event to Root cause analysis when its workflow requires it —
  its level, or, once the answers make it critical (RV-9), its critical row (workflow settings
  WF-13) — following the answers live: the designation appears or disappears as the event becomes
  critical or not. Nobody is asked whether to analyse further. Actions and Validation required by
  the critical row follow in the same way. *(was: "Do you want to further analyze?" for critical
  events whose workflow did not require the analysis)*
- **RV-11** *(the messages)* "Say whether the event should be analyzed further." is no longer
  shown. *(was: shown when unanswered)*
- **RV-14** Valid → the next required step (RV-10) with the event In Progress, or **Closed** when
  nothing else is required. *(was: "required or asked for")*
- **RV-15** *(the summary)* "Further analysis" shows only on events reviewed with that answer.
  *(was: on every critical event)*

### Changed — `root-cause-analysis.md`

- **RCA-1** *(when)* When a valid review leads to Root cause analysis (event review RV-10), the
  review asks **Who will perform the root cause analysis?** … *(was: or when the reviewer answered
  Yes to "Do you want to further analyze?")*

### Changed — `master-data.md`

- **MD-1** *(Health & Safety)* Standards, Hazards (code required); **Diseases** (no code); Body
  Part Categories, Body Parts (each in one category), Injuries (each offered for some body parts)
  — *fixed global lists*. Industrial Risk shows Standards and Hazards read-only, not Diseases.
  *(was: no Diseases)*
- **MD-2** *(the catalogs)* The lists start with the catalogs of the business's master data
  workbook (Initial catalogs), all owned by Central and Active. *(was: the earlier sources)*
- **MD-4** *(injuries)* An Injury also has the body parts it is offered for. Creating or editing an
  Injury asks **Body parts** ("The body parts this injury is offered for in the review."): a
  required, searchable multiple choice of the Body Parts, grouped by category. *(was: none)*
- **MD-5** *(injuries)* Saving an Injury without a body part is refused next to the field: "Choose
  at least one body part.". *(was: no such check)*
- **MD-7** *(Diseases)* Diseases follows the rules of Standards, Hazards, Aspects, Impacts and
  Industrial Risk Categories. *(was: not listed)*
- **MD-11** *(injuries)* The Injuries table also shows **Body parts**: "<N> body parts" ("1 body
  part").
  *(was: no such column)*
- **MD-12** *(injuries)* Export CSV of Injuries adds the column Body parts, their names separated
  by " | ". *(was: no such column)*
- **MD-13** *(injuries)* Import CSV of Injuries also reads Body parts (names separated by "|",
  ignoring case); a row without one is refused ("Choose at least one body part."), a name that is
  not a body part too ("Unknown body part: <names>."). The import hint names the column. *(was:
  Category only)*
- **MD-14** *(injuries)* An Injury's audit entry shows its body parts' count ("Hearing Loss · 2 body
  parts"). *(was: code, name, description)*

### Changed — `domain.md`

- **Critical events**: "Critical events show red badges wherever the event appears; their
  workflow's critical row can require more phases (workflow settings WF-13)." *(was: "… and are the
  only ones asked 'Do you want to further analyze?'")*

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`, with the Demo data changes
below).

1. **Grid** — Ludovic Costa opens Health & Safety › Workflow: rows TF1–TF5 then "SIP/HCI —
   Flagged SIP or HCI by the review", with Submission and Review "From the level" and Root cause
   analysis on. Environment ends with "SIP", Industrial Risk with "SPL/HCL", Industrial Hygiene
   with its four disease types only. (WF-1, WF-13)
2. **Locked, colleague, audit** — Lucas Weber (Cluster H&S Lyon, Porto) sees SIP/HCI Root cause
   analysis locked "Required by Central, Ludovic Costa, …" and switches SIP/HCI Validation on:
   "Saved — SIP/HCI Validation is now Required. Applies to new events.", with no refusal although
   SIP/HCI has no Review; the H&S Audit shows "Made Required". (WF-2, WF-3, WF-5a, WF-12, WF-13)
3. **Path** — After scenario 2, Ludovic, Result per plant, Curitiba, SIP/HCI: "Added at Curitiba
   when the review flags SIP or HCI": Root cause analysis, with Actions and Validation crossed out;
   Lyon shows Validation too, with a Cluster badge. (WF-8, WF-10)
4. **Critical goes to the analysis** — Carla Mendes reviews `TF-26-0006` (TF4, Review only) as
   valid: with Potential Minor × Minimal (Moderate) there is no Next step and Complete review closes
   it. On `TF-26-0004` (TF4), Potential Severe × Long term makes it SIP: the Next step part appears
   with "Who will perform the root cause analysis?", and no "Do you want to further analyze?".
   Choosing Diego Laurent and completing: the event is In Progress at Root cause analysis.
   (RV-6, RV-10, RV-14, RCA-1, WF-11)
5. **Industrial Risk** — Carla reviews `SRE-26-0001` (SRE4) as valid: answering Yes to "Is this
   event an SPL?" shows the designation; answering No hides it, and completing closes the event.
   (RV-10)
6. **Settings kept** — After scenario 2, Ana Ribeiro submits a TF3 at Lyon and Carla reviews it
   with Potential Severe × Long term (SIP): its steps show Root cause analysis and Validation.
   `TF-26-0002` (TF3, submitted before scenario 2), reviewed the same way, shows Root cause
   analysis but no Validation. (WF-11, WF-13)
7. **Injuries by body part** — On `TF-26-0003` (TF2) review, Injuries reads "Choose the body parts
   first."; choosing Ear offers 12 injuries, including "Burn (1°/2° degree)",
   "Tinnitus (buzzing)" and "Other", not "Fracture"; adding Fingers offers 17; choosing "Tinnitus (buzzing)"
   then removing Ear drops it. (RV-6, MD-4)
8. **Catalogs** — Ludovic opens Master data: chips Standards, Hazards, Diseases, Body Part
   Categories, Body Parts, Injuries. Standards shows "12 values", from "STD-01 Confined Spaces" to
   "STD-12 Control of contractors"; Hazards "16 values", "HZ-01 Acts of violence" to "HZ-16 Trapped
   by something collapsing / overturning"; Diseases "17 values", including "Psychological pathology"
   and "Other"; Injuries shows "Tinnitus (buzzing)" with "1 body part" and "Other" with "36 body
   parts". Sergio Martins's Industrial Risk shows Standards and Hazards read-only, no
   Diseases. (MD-1, MD-2, MD-11)
9. **Diseases governed** — Lucas creates the Disease "Hand-arm vibration syndrome": owner "Cluster
   Lyon, Porto"; Carla deactivates "Pathology of hearing" for Lyon: available at Lyon No. (MD-7)
10. **Export** — Ludovic exports Injuries: the Body parts column of "Hearing Loss" reads "Ear".
    (MD-12)
11. **Phone and keyboard** — At 320px the workflow grid with its critical row and the review's
    Injuries are usable without sideways page scrolling, and with the keyboard. (Domain)
12. **Injury needs body parts** — Ludovic creates the Injury "Frostbite" without body parts:
    refused with "Choose at least one body part."; with Fingers and Toe(s) it is added, "2 body
    parts". Editing "Hearing Loss" shows Ear; adding Eyes saves "2 body parts", the audit shows
    "Hearing Loss · 1 body part" → "Hearing Loss · 2 body parts", and Eyes now offers Hearing Loss
    in the review; removing every body part is refused. Importing a row "Chilblain" with no body
    part, or "Tail" as one, is refused with its line. (MD-4, MD-5, MD-13, MD-14)

## Demo data changes

- **Workflow settings**: Root cause analysis Required at Central on the critical rows — H&S
  SIP/HCI by Ludovic Costa, Environment SIP by Ed Petrov, Industrial Risk SPL/HCL by Sergio
  Martins. The demo events keep them in their workflow (WF-11).
- **Master data**: the Initial catalogs below replace Standards and Hazards and add Diseases and
  the injuries' body parts.

### Standards (12)

| Code | Name |
|---|---|
| STD-01 | Confined Spaces |
| STD-02 | Fork Lift Trucks |
| STD-03 | LockOut / TagOut (LO/TO) |
| STD-04 | Machinery safety |
| STD-05 | Mobile phones and smartphones |
| STD-06 | Not related to a Group standard |
| STD-07 | Road Risk Management |
| STD-08 | Vehicles and Pedestrians |
| STD-09 | Warehousing and Loading |
| STD-10 | Working at height |
| STD-11 | Assessment of Health & Safety risks |
| STD-12 | Control of contractors |

### Hazards (16)

| Code | Name |
|---|---|
| HZ-01 | Acts of violence |
| HZ-02 | Contact with electricity or electrical discharge |
| HZ-03 | Contact with moving machinery |
| HZ-04 | Drowning or asphyxiation |
| HZ-05 | Exposure to an explosion |
| HZ-06 | Exposure to fire |
| HZ-07 | Exposure to, or contact with, a harmful substance |
| HZ-08 | Falls from a height |
| HZ-09 | Injured by an animal |
| HZ-10 | Injured while handling, lifting or carrying |
| HZ-11 | Other kind of accident |
| HZ-12 | Slips, trips or falls on same level |
| HZ-13 | Strike against something fixed or stationary |
| HZ-14 | Struck by moving vehicle |
| HZ-15 | Struck by moving, including flying / falling, object |
| HZ-16 | Trapped by something collapsing / overturning |

### Diseases (17)

Bone, articular and peri-articular pathology of lower limbs · Bone, articular and peri-articular
pathology of upper limbs · Broncho-pulmonary and pleural pathology · Cardiac and vascular pathology
· Cutaneous and mucosal pathology · Digestive and liver pathology · Lumbar pathology · Neurological
pathology · Parasitic and infectious pathology, non dermal · Pathology of blood and bloodforming
organs · Pathology of head and neck · Pathology of hearing · Pathology of oral and upper
respiratory tract (other than lung) · Pathology of the eye · Psychological pathology · Renal and
vesical pathology · Other

### Injuries by body part (423 pairs)

| Body part | Injuries offered |
|---|---|
| Cranium (8) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Fracture · Bruise · Cephalalgia · Other |
| Ear (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Sting, bite · Bruise · Foreign matters presence · Bleeding · Tinnitus (buzzing) · Hearing Loss · Other |
| Eyes (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Pain, sensory trouble · Sting, bite · Bruise · Damage to the cornea · Foreign matters presence · Conjunctival irritation · Temporary loss of sight · Permanent loss of sight · Other |
| Nose (11) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Foreign matters presence · Bleeding · Other |
| Teeth, Gingiva (6) | Pain, sensory trouble · Fracture · Bruise · Bleeding · Other · Amputation |
| Face (Other) (8) | Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Bruise · Bleeding · Paralysis · Other |
| Cervical spine (7) | Contusion, ecchymosis · Fracture · Sting, bite · Bruise · Fracture with paralysis · Pain (cervicalgia) · Other |
| Neck (11) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Other |
| Back and spine (7) | Contusion, ecchymosis · Fracture · Sting, bite · Bruise · Pain (back, lumbago) · Fracture with paralysis · Other |
| Abdomen (11) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Sting, bite · Bruise · Hernia · Internal Injuries (liver, spleen, kidney) · Other |
| Pelvis (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Inguinal hernia · Internal Injuries (urinary, genital) · Other |
| Thorax (11) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Inhalation, foreign body · Sting, bite · Bruise · Other |
| Whole upper limb (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Amputation · Other |
| Shoulder (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Dislocation · Other |
| Arm (Left) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Amputation · Other |
| Arm (Right) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Amputation · Other |
| Elbow (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Muscular tear or sprain · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Dislocation · Other |
| Forearm (Left) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Other |
| Forearm (Right) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Other |
| Wrist (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Dislocation · Other |
| Hand, Palmar and dorsal side (Left) (14) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Paralysis · Avulsion · Other |
| Hand, Palmar and dorsal side (Right) (14) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Paralysis · Avulsion · Other |
| Fingers (14) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Paralysis · Avulsion · Other |
| Whole lower limb (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Other |
| Hip (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Dislocation · Other |
| Thigh (Left) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Other |
| Thigh (Right) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Other |
| Knee (Left) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Dislocation · Other |
| Knee (Right) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Dislocation · Other |
| Leg (Left) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Other |
| Leg (Right) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Other |
| Ankle (Left) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Dislocation · Other |
| Ankle (Right) (12) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Dislocation · Other |
| Foot (Left) (14) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Paralysis · Avulsion · Other |
| Foot (Right) (14) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Paralysis · Avulsion · Other |
| Toe(s) (14) | Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Pain, sensory trouble · Fracture · Sting, bite · Bruise · Bleeding · Muscular tear or sprain · Amputation · Paralysis · Avulsion · Other |
| General (7) | Drowning · Malaise, dizziness, loss of consciousness · Asphyxia, breathing difficulty · Intoxication · Heat stroke · Electrical shock · Allergic shock |

## Out of scope

- Using Diseases in the Health & Safety form (a later change).
- Risk Families, Circumstances and Type of Immediate actions.
- Reviewers on the critical row (Review is set by the levels only).
