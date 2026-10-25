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
  | Health & Safety | Body Part Categories, Body Parts (each in one category), Injuries — *fixed global lists* | — |
  | Environment | Aspects, Impacts | — |
  | Industrial Risk | Categories; plus Health & Safety Standards and Hazards shown read-only, "Owned by Health & Safety — read-only here." | Categories: required |
  | Industrial Hygiene | none ("Master data for Industrial Hygiene comes later.") | |

- **MD-2** The lists start with the catalogs below, all owned by Central and Active.
- **MD-3** The Master data tab shows the pillar's lists as chips (read-only ones with a lock), then
  the chosen list with a note: "Fixed global list, maintained by Central only." or "Central
  maintains global values; Clusters add their own; everyone can switch values off for their
  plants."

### Values

- **MD-4** A value has a code (when the list has codes), a name, an optional description, a
  category (Body Parts only), an owner (Central, or a Cluster with its plants; Local never owns
  values) and a status: Active, Inactive or Retired (final).
- **MD-5** Saving a value is refused, with the message next to the field, when: the name is empty
  ("Enter a name."); the code is empty in a list with codes ("Enter a code."); the code — or the
  name in a list without codes — already exists in the same list for the same owner ("A value with
  code <code> already exists." / "<name>" already exists in this list."); a Body Part has no
  category ("Choose a category.") or is Active while its category is not ("The category is not
  active, so this value cannot be active.").
- **MD-6** A person sees the Central values and the values of Clusters sharing a plant with their
  role (Central sees all). Values are sorted by code (natural order: A2 before A10), or by name;
  Body Parts are grouped under their category (with its status when not Active).

### Who may do what

- **MD-7** For Standards, Hazards, Aspects, Impacts and Industrial Risk Categories:

  | Level | Own values (owner) | Other values |
  |---|---|---|
  | Central | Create, Edit, Deactivate / Reactivate (status, everywhere), Retire | — |
  | Cluster | Create (owned by its perimeter), Edit, Deactivate / Reactivate, Retire | "Deactivate for <plants>" / "Reactivate for <plants>" |
  | Local | — (cannot create) | "Deactivate for <plant>" / "Reactivate for <plant>" |

  Fixed global lists: only Central acts; others see them read-only. Read-only lists (Industrial
  Risk's view of Standards and Hazards): nobody acts. A Retired value offers no action.
- **MD-8** Retiring asks "Retire <name>? It will no longer be offered anywhere, and this cannot be
  undone." Each action confirms with a message (e.g. "<name> is deactivated for Lyon.").
- **MD-9** "Deactivate for …" records a deactivation for the person's level and plants; "Reactivate
  for …" removes only the deactivation made at the person's level. A Local person cannot undo a
  Cluster's or Central's deactivation.

### Availability

- **MD-10** A value is available at a plant as defined in the domain (Active, owned by Central or by
  a Cluster covering the plant, not deactivated there by Central, a covering Cluster or the
  plant's Local; a Body Part also needs its category available). Retired values stay listed but
  are never available.
- **MD-11** The list screen shows, on one line (wrapping on narrow screens): **Search <list>**,
  **Availability for** (one of the person's plants; all plants for Central), **Export CSV**,
  **Import CSV** and **Create <list>** (the last two only for those who can create). Then "N
  values" and a table: Code (when the list has codes), Name (with the description below), Owner
  ("Central" or "Cluster <plants>"), Status, "Available at <plant>" (Yes / No) and the actions.

### Export and import

- **MD-12** **Export CSV** downloads the values shown, with columns Code (when the list has codes),
  Name, Description, Category (Body Parts), Owner, Status, "Available at <plant>"; the file opens
  with accents in Excel.
- **MD-13** **Import CSV** reads Code, Name, Description (and Category for Body Parts). A row with
  the code (or name) of one of the person's own values changes it; a row matching another level's
  value is left unchanged; other rows add values owned by the person's level. A code repeated in
  the file is an error. If any row is invalid nothing is saved: "Nothing was imported. Fix these
  lines and import the file again:" with "Line N: …" for each. Otherwise: "Import done: N values
  added, N updated, N left unchanged (owned by another level)."
- **MD-14** Every add, edit, status change, deactivation, reactivation and import change writes an
  audit entry ([workspace](control-panel-workspace.md) CPW-6).

## Acceptance scenarios

From freshly reset [demo data](platform-data.md).

1. **Catalogs** — Ludovic Costa (Central H&S) opens Master data: chips Standards, Hazards, Body Part
   Categories, Body Parts, Injuries; Standards shows "14 values", all Central, Active, available.
   (MD-1, MD-2, MD-11)
2. **Cluster adds** — Lucas Weber (Cluster H&S Lyon, Porto) creates Hazard "Z1 — Forklift traffic":
   owner "Cluster Lyon, Porto". Pascal Fischer (Cluster Lyon, Curitiba) sees it, available at Lyon
   but not at Curitiba. Creating another "Z1" as Lucas is refused: "A value with code Z1 already
   exists." (MD-5, MD-6, MD-7, MD-10)
3. **Local switches off** — Carla Mendes (Local H&S Lyon) cannot create; on Hazard A1 she uses
   "Deactivate for Lyon": available at Lyon No. Lucas, with "Availability for" Porto, still sees
   it available. (MD-7, MD-9)
4. **Lower level cannot undo** — Lucas uses "Deactivate for Lyon, Porto" on A2. Carla sees A2 not
   available at Lyon and is offered "Deactivate for Lyon", not "Reactivate". (MD-9)
5. **Fixed global** — Lucas opens Body Parts: grouped by category, no action, no Create. (MD-7)
6. **Retire** — Ludovic retires Standard STD-14 after confirming: status Retired, available No
   everywhere, no more actions. (MD-8, MD-10)
7. **Body part category** — Ludovic deactivates the Body Part Category "Head": Cranium, Eyes and
   the other Head parts become unavailable; editing "Eyes" and saving it Active is refused: "The
   category is not active, so this value cannot be active." (MD-5, MD-10)
8. **Industrial Risk view** — Sergio Martins opens Industrial Risk: Categories (IRC1–IRC11) plus
   Standards and Hazards with a lock and "Owned by Health & Safety — read-only here.". (MD-1)
9. **Export and import** — Lucas exports Hazards, adds a row "Z2,Dust from cutting," and imports:
   "Import done: 1 value added, 0 updated, 36 left unchanged (owned by another level)." A file
   with two rows "Z3" imports nothing and lists the line. (MD-12, MD-13)
10. **Audit** — The H&S Audit shows each change above with its level and plants. (MD-14)

## Initial catalogs

All owned by Central and Active. Standards have no code in the sources; STD-01… were given because
the list requires codes.

### Standards (14)

| Code | Name |
|---|---|
| STD-01 | Confined Space Entry |
| STD-02 | Construction Project Safety |
| STD-03 | Control of Hazardous Energy (LOTO) |
| STD-04 | Health & Safety Risk Assessment & Control |
| STD-05 | Lifting Operations |
| STD-06 | Machinery Safety |
| STD-07 | Management of Contractors |
| STD-08 | Management of Work Related Road Risks |
| STD-09 | Permit to Work |
| STD-10 | Rules for the Classification & Reporting of Safety Events |
| STD-11 | Warehousing, Loading & Unloading |
| STD-12 | Work at Height |
| STD-13 | Workplace Vehicles |
| STD-14 | Others |

### Hazards (36)

| Code | Name |
|---|---|
| A1 | Manual handling of loads |
| A2 | Awkward position |
| A3 | Repetitive work |
| A4 | Night work |
| A5 | Successive team shifts |
| A6 | Isolated work |
| A7 | Stress related to work |
| B1 | Toxic agents (Safety aspects) |
| B2 | Biological and bacteriological agents |
| C1 | Vibrations |
| C2 | Noise |
| C3 | Temperature |
| C4 | Light |
| C5 | Radiation |
| C6 | Working environment |
| C7 | Atmospheric pressure |
| D1 | Falls on the same level |
| D2 | Falls from a height |
| D3 | Falling objects |
| E1 | Electricity |
| E2 | Fire, explosion (Material or substance which can generate...) |
| F1 | Shearing, cutting (Equipment or product which can generate...) |
| F2 | Pinched, crushed by (Equipment or product which can generate...) |
| F3 | Lifting by, rolling by, moving by (Equipment which can generate...) |
| F4 | Struck (Moving area, equipment or product which can generate...) |
| F5 | Perforation or shot/sting (Equipment or product which can generate...) |
| F6 | Rubbing or abrasion (Equipment or product which can generate...) |
| F7 | Ejection, objects shatter (Equipment or product which can generate...) |
| F8 | Burn, heating (Equipment or product which can generate...) |
| G1 | Internal transportation - on-site |
| G2 | External transportation - off organization site |
| H1 | Physical attack |
| H2 | Natural risks |
| H3 | Animals |
| H4 | Technological risks |
| I1 | Other hazards |

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

