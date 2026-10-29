# Capability: Master data

**Product**: Control Panel (Master data tab); used by Event review to classify events
**Builds on**: [domain](../domain.md) (Master data, Control Panel roles),
[platform data](platform-data.md), [Control Panel workspace](control-panel-workspace.md)
**Status**: built

Each pillar governs its classification lists: Central keeps the global values, Clusters add their
own, and every level can switch values off for its plants.

## Rules

### Lists

- **MD-1** The lists of each pillar:

  | Pillar | Lists | Code |
  |---|---|---|
  | Health & Safety | Standards, Hazards | required |
  | Health & Safety | Diseases | — |
  | Health & Safety | Body Part Categories, Body Parts (each in one category), Injuries (each offered for some body parts) — *fixed global lists* | — |
  | Environment | Aspects, Impacts | — |
  | Industrial Risk | Categories; plus Health & Safety Standards and Hazards (not Diseases) shown read-only, "Owned by Health & Safety — read-only here." | Categories: required |
  | Industrial Hygiene | none ("Master data for Industrial Hygiene comes later.") | |

- **MD-2** The lists start with the catalogs below (Health & Safety from the business's master
  data workbook), all owned by Central and Active.
- **MD-3** The Master data tab shows the pillar's lists as chips (read-only ones with a lock), then
  the chosen list with a note: "Fixed global list, maintained by Central only." or "Central
  maintains global values; Clusters add their own; everyone can switch values off for their
  plants."

### Values

- **MD-4** A value has a code (when the list has codes), a name, an optional description, a
  category (Body Parts only), the body parts it is offered for (Injuries only), an owner (Central, or a Cluster with its plants; Local never owns
  values) and a status: Active or Inactive. Nothing is ever deleted: a value deactivated keeps showing on the events
  that used it, but is no longer offered for new choices. Creating or editing an Injury asks
  **Body parts** ("The body parts this injury is offered for in the review."): a required,
  searchable multiple choice of the Body Parts, grouped by category.
- **MD-5** Saving a value is refused, with the message next to the field, when: the name is empty
  ("Enter a name."); the code is empty in a list with codes ("Enter a code."); the code — or the
  name in a list without codes — already exists in the same list for the same owner ("A value with
  code <code> already exists." / "<name>" already exists in this list."); a Body Part has no
  category ("Choose a category.") or is Active while its category is not ("The category is not
  active, so this value cannot be active."); an Injury has no body part ("Choose at least one body
  part.").
- **MD-6** A person sees the Central values and the values of Clusters sharing a plant with their
  role (Central sees all). Values are sorted by code (natural order: A2 before A10), or by name;
  Body Parts are grouped under their category (with its status when not Active).

### Who may do what

- **MD-7** For Standards, Hazards, Diseases, Aspects, Impacts and Industrial Risk Categories:

  | Level | Own values (owner) | Other values |
  |---|---|---|
  | Central | Create, Edit, Deactivate / Reactivate for all plants | — |
  | Cluster | Create (owned by its perimeter), Edit, Deactivate / Reactivate for its plants | "Deactivate for <plants>" / "Reactivate for <plants>" |
  | Local | — (cannot create) | "Deactivate for <plant>" / "Reactivate for <plant>" |

  Fixed global lists: only Central acts; others see them read-only. Read-only lists (Industrial
  Risk's view of Standards and Hazards): nobody acts.
- **MD-8** The owner's actions read **Deactivate for <all plants | its plants>** and **Reactivate for
  …**; deactivating confirms "<name> is deactivated for <plants>: no longer offered for new events;
  past events keep it."; the other actions confirm with a message (e.g. "<name> is deactivated for
  Lyon.").
- **MD-9** "Deactivate for …" records a deactivation for the person's level and plants; "Reactivate
  for …" removes only the deactivation made at the person's level. A Local person cannot undo a
  Cluster's or Central's deactivation.

### Availability

- **MD-10** A value is available at a plant as defined in the domain (Active, owned by Central or by
  a Cluster covering the plant, not deactivated there by Central, a covering Cluster or the
  plant's Local; a Body Part also needs its category available). An event keeps the values chosen
  before they were deactivated: its review shows them, and an unfinished review still lists them as
  "<name> (no longer available)" without offering them for new choices.
- **MD-11** The list screen shows, on one line (wrapping on narrow screens): **Search <list>**,
  **Availability for** (one of the person's plants; all plants for Central), **Export CSV**,
  **Import CSV** and **Create <list>** (the last two only for those who can create). Then "N
  values" and a table: Code (when the list has codes), Name (with the description below), Owner
  ("Central" or "Cluster <plants>"), Status, "Available at <plant>" (Yes / No) and the actions;
  Injuries also show **Body parts**: "<N> body parts" ("1 body part").

### Export and import

- **MD-12** **Export CSV** downloads the values shown, with columns Code (when the list has codes),
  Name, Description, Category (Body Parts), Body parts (Injuries: their names separated by " | "),
  Owner, Status, "Available at <plant>"; the file opens
  with accents in Excel.
- **MD-13** **Import CSV** reads Code, Name, Description (and Category for Body Parts; Body parts
  for Injuries, names separated by "|", ignoring case — a name that is not a body part is refused:
  "Unknown body part: <names>."), as the hint under the buttons says. A row with
  the code (or name) of one of the person's own values changes it; a row matching another level's
  value is left unchanged; other rows add values owned by the person's level. A code repeated in
  the file is an error. If any row is invalid nothing is saved: "Nothing was imported. Fix these
  lines and import the file again:" with "Line N: …" for each. Otherwise: "Import done: N values
  added, N updated, N left unchanged (owned by another level)."
- **MD-14** Every add, edit, status change, deactivation, reactivation and import change writes an
  audit entry ([workspace](control-panel-workspace.md) CPW-6); an Injury's shows its body parts'
  count (e.g. "Hearing Loss · 2 body parts").

## Acceptance scenarios

From freshly reset [demo data](platform-data.md).

1. **Catalogs** — Ludovic Costa (Central H&S) opens Master data: chips Standards, Hazards, Diseases,
   Body Part Categories, Body Parts, Injuries; Standards shows "12 values", from "STD-01 Confined
   Spaces" to "STD-12 Control of contractors", all Central, Active, available; Hazards "16
   values"; Diseases "17 values"; Injuries shows "Tinnitus (buzzing)" with "1 body part" and
   "Other" with "36 body parts". (MD-1, MD-2, MD-4, MD-11)
2. **Cluster adds** — Lucas Weber (Cluster H&S Lyon, Porto) creates Hazard "Z1 — Forklift traffic":
   owner "Cluster Lyon, Porto". Pascal Fischer (Cluster Lyon, Curitiba) sees it, available at Lyon
   but not at Curitiba. Creating another "Z1" as Lucas is refused: "A value with code Z1 already
   exists." (MD-5, MD-6, MD-7, MD-10)
3. **Local switches off** — Carla Mendes (Local H&S Lyon) cannot create; on Hazard HZ-01 she uses
   "Deactivate for Lyon": available at Lyon No. Lucas, with "Availability for" Porto, still sees
   it available. (MD-7, MD-9)
4. **Lower level cannot undo** — Lucas uses "Deactivate for Lyon, Porto" on HZ-02. Carla sees HZ-02 not
   available at Lyon and is offered "Deactivate for Lyon", not "Reactivate". (MD-9)
5. **Fixed global** — Lucas opens Body Parts: grouped by category, no action, no Create. (MD-7)
6. **Deactivate, never delete** — Ludovic uses "Deactivate for all plants" on Hazard HZ-02: "… is
   deactivated for all plants: no longer offered for new events; past events keep it.", status
   Inactive, still listed, with "Reactivate for all plants"; a review started afterwards does not
   offer HZ-02, while an event reviewed earlier with HZ-02 still shows it. There is no Retire.
   (MD-4, MD-8, MD-10)
7. **Body part category** — Ludovic deactivates the Body Part Category "Head": Cranium, Eyes and
   the other Head parts become unavailable; editing "Eyes" and saving it Active is refused: "The
   category is not active, so this value cannot be active." (MD-5, MD-10)
8. **Industrial Risk view** — Sergio Martins opens Industrial Risk: Categories (IRC1–IRC11) plus
   Standards and Hazards with a lock and "Owned by Health & Safety — read-only here.". (MD-1)
9. **Export and import** — Lucas exports Hazards, adds a row "Z2,Dust from cutting," and imports:
   "Import done: 1 value added, 0 updated, 16 left unchanged (owned by another level)." A file
   with two rows "Z3" imports nothing and lists the line. Ludovic exports Injuries: the Body parts
   of "Hearing Loss" read "Ear". (MD-12, MD-13)
11. **Diseases** — Lucas creates the Disease "Hand-arm vibration syndrome": owner "Cluster Lyon,
    Porto"; Carla uses "Deactivate for Lyon" on "Pathology of hearing": available at Lyon No.
    (MD-7)
12. **Injury needs body parts** — Ludovic creates the Injury "Frostbite" without body parts:
    refused with "Choose at least one body part."; with Fingers and Toe(s) it is added, "2 body
    parts". Editing "Hearing Loss" shows Ear; adding Eyes saves "2 body parts", the audit shows
    "Hearing Loss · 1 body part" → "Hearing Loss · 2 body parts", and Eyes now offers Hearing Loss
    in the review; removing every body part is refused. Importing a row "Chilblain" with no body
    part, or "Tail" as one, is refused with its line. (MD-4, MD-5, MD-13, MD-14)
10. **Audit** — The H&S Audit shows each change above with its level and plants. (MD-14)

## Initial catalogs

All owned by Central and Active. The business's workbook gives Standards and Hazards no code;
STD-01… and HZ-01… were given, in its order, because both lists require codes.

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

### Body Parts (37)

| Category | Body Parts |
|---|---|
| Head | Cranium · Ear · Eyes · Nose · Teeth, Gingiva · Face (Other) · Cervical spine · Neck |
| Torso, organs and back | Back and spine · Abdomen · Pelvis |
| Thoracic cavity | Thorax |
| Upper limbs | Whole upper limb · Shoulder · Arm (Left) · Arm (Right) · Elbow · Forearm (Left) · Forearm (Right) · Wrist |
| Hands and Fingers | Hand, Palmar and dorsal side (Left) · Hand, Palmar and dorsal side (Right) · Fingers |
| Lower limbs | Whole lower limb · Hip · Thigh (Left) · Thigh (Right) · Knee (Left) · Knee (Right) · Leg (Left) · Leg (Right) · Ankle (Left) · Ankle (Right) |
| Foot(s) and toe(s) | Foot (Left) · Foot (Right) · Toe(s) |
| General | General |

### Injuries (38)

Burn (1°/2° degree) · Burn (3°/4° degree) · Contusion, ecchymosis · Dermatosis (skin infection) · Fracture · Bruise · Cephalalgia · Pain, sensory trouble · Sting, bite · Foreign matters presence · Bleeding · Tinnitus (buzzing) · Hearing Loss · Damage to the cornea · Conjunctival irritation · Temporary loss of sight · Permanent loss of sight · Amputation · Paralysis · Fracture with paralysis · Pain (cervicalgia) · Muscular tear or sprain · Pain (back, lumbago) · Hernia · Internal Injuries (liver, spleen, kidney) · Inguinal hernia · Internal Injuries (urinary, genital) · Inhalation, foreign body · Dislocation · Avulsion · Drowning · Malaise, dizziness, loss of consciousness · Asphyxia, breathing difficulty · Intoxication · Heat stroke · Electrical shock · Allergic shock · Other

### Aspects (15)

Water withdrawal/consumption · Energy consumption · Water discharge · Raw material consumption · Waste / Other Production Residue generation · Spill, leak · Land use & visual integration · Air emissions · Biodiversity · Noise · Smell / odour · Vibrations · Light · Related to transport · Related to the end of life

### Impacts (13)

Non hazardous waste · Hazardous waste · Water pollution · Depletion of water resources · Depletion of Energy resources · Nuisance (visual, odour, noise, etc.) · Air pollution / climate change · Impact of transport · Impact of the end of life of the product · Resource depletion (raw material) · Resource / utility inefficiency · Biodiversity · Soil / land pollution

### Categories (11)

| Code | Name |
|---|---|
| IRC1 | Fire |
| IRC2 | Explosion |
| IRC3 | Machinery breakdown / critical equipment failure |
| IRC4 | Structural failure or collapse |
| IRC5 | Loss of utilities (power, gas, water, steam, compressed air, IT/OT) |
| IRC6 | Hazardous material release / uncontrolled reaction |
| IRC7 | Natural hazard (flood, storm, earthquake, lightning, snow load, extreme temperature) |
| IRC8 | Business interruption / supply chain disruption |
| IRC9 | Logistics and internal/external transport incident |
| IRC10 | Security event (intrusion, theft, sabotage, malicious act) |
| IRC11 | Other industrial risk |

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
