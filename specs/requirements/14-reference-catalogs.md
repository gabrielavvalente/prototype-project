# 14 — Reference catalogs

The business content the rules refer to. The lists are the business's; the starting values of the
master data are then maintained in the Control Panel ([12](12-master-data.md)).

## Level descriptions (OV-5)

| Code | Name | Description |
|---|---|---|
| TF1 | Lost Time Accident | Someone was hurt and could not work their next shift. |
| TF2 | Non-Lost Time Accident | Someone was hurt and needed medical care, but kept working. |
| TF3 | First Aid | Someone was slightly hurt and only needed first aid. |
| TF4 | Near Miss | Something occurred but nobody was hurt. |
| TF5 | Hazardous Situation | Nothing happened yet, but something could hurt someone. |
| Respiratory disease (OH) | | Breathing problems linked to dust, fumes or chemicals at work. |
| Skin disease (OH) | | Skin irritation or allergy linked to contact with substances. |
| Musculoskeletal disorder (OH) | | Pain in muscles or joints linked to movements or loads. |
| Hearing loss (OH) | | Hearing damage linked to noise at work. |
| EvE1 | Major environmental accident | Serious harm to the environment outside the site. |
| EvE2 | Environmental accident | Harm to the environment that needed outside help to contain. |
| EvE3 | Minor environmental accident | A release contained on site by the team. |
| EvE4 | Near-accident | A release almost happened but was stopped in time. |
| EvE5 | Poor environmental situation | A condition that could lead to a release or waste. |
| SRE1 | Major site risk accident | Fire, explosion or failure with major damage to the site. |
| SRE2 | Significant site risk accident | Fire or failure with significant damage, contained on site. |
| SRE3 | Moderate site risk accident | A small fire or failure with limited damage. |
| SRE4 | Site risk near accident | A fire or failure almost happened but was stopped in time. |
| SRE5 | Site risk hazardous acts or conditions | An unsafe act or condition that could cause a fire or failure. |

## First aid treatments (ER-11)

A starting list, to be replaced by the official one: Wound cleaning and dressing · Plaster or bandage
· Cold compress · Eye wash · Burn care · Splint or immobilisation · Removal of a splinter or foreign
body · Rest and observation · Other.

## Occupational Health diseases (ER-13)

Occupational asthma · Contact dermatitis · Carpal tunnel syndrome · Lower back pain · Noise-induced
hearing loss. Whether the Health & Safety Diseases master data list replaces it is Q-18.

## SIP types (RV-9)

**Safety**: Entry to machine area without LOTO · Confined Space entry without permit · Any unsecured Confined Space · Unguarded access to the dangerous parts of equipment · Collision of vehicle or its load with another vehicle, a pedestrian or with a building · Roll over or tip-over of a vehicle · Loss of load or part of load from a vehicle · Collapse of a stacked material · Object falling or likely to fall from height · Failure of lifting equipment or falling load · Unsecured access point to permit required roof · Person working unsafely at height · Any unsafe electrical work or electrical equipment in poor conditions · Any Fire or Explosion · Any other incident that could cause a serious injury.

**Environment** (provisional, Q-21): Significant or major spill/leak due to a failure of chemical or fuel tanks · Significant or major impact due to overfilling/delivery failure or tanker cleaning · Significant or major spill/leak due to the release of very toxic, toxic or hazardous substances · Significant or major spill or leak from underground tank · Significant or major release to air of very toxic, toxic or hazardous substances · Significant or major release to air (odour, noise etc.) that is likely to cause nuisance · Illegal waste disposal due to contamination of waste/incorrect segregation · Contamination of waste received as a raw material (e.g. asbestos) · Significant land contamination · Impact to Protected species/habitats or other sensitive receptors · Potential to create or exacerbate critical environmental risk(s) · Damaging impact that would be permanent · Impact that needs specific remediation · Impact where the environment needs a long time to recover · Enforcement action by the Regulatory Authority · Significant financial penalty or cost · Reputational damage with stakeholders.

## Master data starting values ([12](12-master-data.md) MD-2)

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

### Industrial Risk Categories (11)

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
