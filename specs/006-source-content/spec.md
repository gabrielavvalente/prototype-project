# Change: Source content

**Feature Branch**: `006-source-content`

**Created**: 2026-10-26

**Input**: User description: "Support documents for the missing points" — four documents provided by
the user on 2026-10-26, kept outside the repository (it is public): *6M* (failure causes and
guidance), *Analysis Checklist* (5W1H questions), *Severity Level* (injury matrix, updated) and *HCL
& SPL* (definitions). They replace the draft and outdated content of the product. Review remarks
(2026-10-26): HCI is "High Consequence Injury"; the Environment SIP types; HCL and SPL are a Yes /
No answer (HCL for SRE1–SRE3, SPL for SRE4–SRE5), with no type.

**Capabilities**: changed: `specs/capabilities/root-cause-analysis.md` (RCA-10, RCA-11, Content:
5W1H sections and 6M themes, Decisions), `specs/capabilities/event-review.md` (RV-7, RV-8, RV-9,
RV-11, RV-15, Decisions), `specs/domain.md` (Glossary, Critical events, Open points)

## Why

The 5W1H questions and the 6M causes were drafts, the injury matrix had outdated durations and
band names, and the Industrial Risk loss matrix, the Environment SIP types and the SPL types were
placeholders; the business has now provided the official content.

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| 6M theme names | Management, Man Power, Methods, Machines/Tools/Equipment, Materials, Environment | 6M document (the UI/UX design used "Human Factors" and "Machine / Tools & Equip.") |
| Wording of the sources | The meaning is kept; obvious typos and cut-off sentences are fixed (list below) | Analysis Checklist, 6M |
| Severity scope | Unchanged: Potential TF1–TF4, Actual TF1–TF3 | Severity Level requires the level for LTA and NLTA (TF1, TF2) and recommends it for all |
| "Who was injured?" | Health & Safety events only | Analysis Checklist: "Who was injured (Safety only)" |
| HCL and SPL | A Yes / No answer of the reviewer: "Is this event an HCL?" for SRE1–SRE3, "Is this event an SPL?" for SRE4–SRE5; no loss matrix | User (review remarks); HCL & SPL definitions |
| HCL / SPL type | None (unlike SIP) | User |
| HCL / SPL answer when the review opens | Nothing selected; the answer is required | User (the report form asks no HCL / SPL question) |
| Industrial Risk Categories | Still asked in the review | User |
| Environment SIP types | The 17 types given by the user | User |

**Fixes made to the sources**: "Summary of inquiry" → "Summary of injury"; "inured person" → "injured
person"; "occured" → "occurred"; "Expérience" → "Experience"; "at the same time of the event" → "at the
time of the event"; "Use a flow diagram may be useful" → "A flow diagram may be useful"; "EPI non
suitable" → "PPE not suitable"; "Lack aware of hazard/consequences" → "Not aware of
hazard/consequences"; "Communication information problem" → "Communication / information problem";
"anormal" → "abnormal"; "Is medical HR adviced required" → "Is medical or HR advice required?"; three
cut-off checklist items completed ("…relevant to the work being carried out?", "…Permits to work or
method statements?", "…(details of emergency procedures/actions)"); the guidance paragraphs are split
into one question each; "High consequece injury" → "High Consequence Injury"; "Reputational damage
with stakeholder" → "Reputational damage with stakeholders". "CHEAR" and "SHEAR" are kept as written
(program names).

## Rules

### Changed

- **RCA-10** *(one sentence)* The "Who was injured?" section is offered for Health & Safety events
  only. *(was: every event but Environment)*
- **RCA-11** *(the theme names)* The six themes are Management, Man Power, Methods,
  Machines/Tools/Equipment, Materials, Environment, with the causes and guidance of the Content
  below. *(was: Human Factors, Machine / Tools & Equip., and draft causes)*
- **Content — 5W1H sections** (the complete list replaces the previous one; none is a draft any
  more):

  | Section | Questions |
  |---|---|
  | Who was injured? *(Health & Safety only)* | Name · Age · Length of service · Experience/training · Occupation · Who else was involved? (other victims, witnesses, contractors, colleagues, public) · Obtain statements from witnesses/other victims (list document references) |
  | What happened? | What are the details of the event? (brief description) · What were working environment conditions? (lighting, inside/outside work, temperature, climate conditions: wind, snow, rain) · Summary of injury and how sustained · Details of work activity carried out · What was being done immediately before and also 10 minutes before the event? · Who was the direct supervisor at the time of the incident? · What was the victim's supervisor doing at the time of the event and 10 minutes beforehand? · What other events or people were in the area at the time of the incident? Anything unusual about the working condition? · What applicable standard procedures and/or instructions were in place for the operations being undertaken around the event? (risk assessments, method statements, etc.) · What communications had been given by the victim's supervisor that were relevant to the work being carried out? · What is the process for approval of method statements or SOPs in this particular work? · What qualifications or experience did the author have who prepared Permits to work or method statements? · What other hazards contributed to the event? |
  | When? | When did the event occur? (date and time) · When was the victim asked to perform the job/task/activity undertaken? · When was the last review of the risk assessment or SOP? · When was the last record of any site/work/plant inspection? · When and to whom was the event reported? (refer to witness reports) · When were emergency procedures/actions implemented? (refer to witness reports and official reports) |
  | Where? | Did the event occur within the site boundaries? If not, give details of the incident origin · Where did the event occur? What other parts of the site were affected by the event? · Where was the victim positioned/located at the time of the event? · Where were the witnesses/other victims located at the time of the event? |
  | Why did the event occur? | Comment · Has this event occurred or almost occurred previously on the site or in the company? (review all site records for near misses, event reports and SHEAR warnings to determine any trends) · Were there any previously identified hazards omitted from the risk assessments or SOPs? · Is there any reason why the hazards now identified were not part of the risk assessment? · Why was the injured person close to the hazard? · Did the victim carry out any unsafe or poor CHEAR behaviours? Why? · Any other relevant information (e.g. breakdown in communication, lack of signage, fatigue, ill health, production pressures) |
  | How did the event occur? | Review the documentation · A flow diagram may be useful to identify key gaps or critical points · Have you received the witness reports? · Were work activity procedures followed? · How did any new hazards get updated into the assessment of SOPs? · How was the emergency response for the event managed? (details of emergency procedures/actions) · Have the witness statements and/or other reports highlighted any contributing factors? If yes, explain |

- **Content — 6M themes** (every theme also offers **Other**; none is a draft any more):

  | Theme | Contributory causes | Guidance |
  |---|---|---|
  | Management | Organization of Work · Lack of Supervision · Non-application of standards/procedures · Communication / information problem · Working long hours · Lack of Resources · Training | Is the work organized? · Are the resources adequate? · Are rules and procedures communicated and maintained? · Has the staff been trained or informed? · Are the staff supervised effectively? |
  | Man Power | Short cut · Fatigue · Mind/eye not on the task · Bad habit/over-confidence · Distraction · In the line of fire · Loss of balance, traction or grip · Not applying standards or procedures · Lack of skills or knowledge · Negligence · Manual handling/ergonomics · Not aware of hazard/consequences · Mistake/error | Is communication (information, training, warning) available and sufficient? · Is competence tested and validated? · Is behaviour monitored? · Are operators coached (skill, behaviour, attitude)? · Is there evidence of praise or discipline used? · Is medical or HR advice required? · Is specialist health and safety advice required? |
  | Methods | No written procedure · Inadequate procedure · Contractor control · Work permit · Inadequate emergency procedure · Procedure not applied · LOTO · Management of change · Seconds to think | Is the procedure suitable and sufficient? · Did the risk assessment identify the hazard? · Was a pre-start risk assessment done? · Were all requirements of legal and company standards in place? · Were procedures followed? |
  | Machines/Tools/Equipment | Unsafe equipment · Poor maintenance · Operating ergonomics · Machine condition · Building condition · PPE not suitable · Unsuitable tools · Tools not available · PPE not available | Consider the condition of materials, equipment, facilities, buildings, tools, PPE and storage. · What system is in place for checking? |
  | Materials | Hazardous substances · Explosive dust/vapours · Contact with energy source · Shape, size, weight · Raw materials · Materials containment | Are controls in place to prevent exposure to hazardous materials or energy sources? · Are materials and products stored in a safe condition? · Are the materials or products in an abnormal condition? |
  | Environment | Confined space · Storage conditions · Warning devices · Lighting · Noise · Excessive heat or cold · Fumes, smoke, dust · Climatic conditions · Humidity · Work at height | Did the climatic or workplace conditions cause or contribute to the cause of the incident? |

- **RV-7** *(the Industrial Risk row)* Industrial Risk: required list Categories; assessment "Is this
  event an HCL?" ("High Consequence Loss: a real event with actual consequences — a major loss for
  the Group.") for SRE1–SRE3, "Is this event an SPL?" ("Serious Potential Loss: a near miss or
  moderate event whose potential severity is a weak signal before a major loss.") for SRE4–SRE5.
  Yes / No, nothing selected when the review opens. There is no loss matrix. *(was: Potential loss
  for all levels and Actual loss for SRE1–SRE3 on a provisional loss matrix)*
- **RV-8** *(the injury matrix and the bands)* The matrix is the injury matrix only (Health &
  Safety). Its durations are Minimal 2 ("Recovery will take 1 week or less"), Short term 5
  ("Recovery will take between 1 week and 3 months"), Medium term 10 ("Recovery will take more than
  3 but less than 6 months") and Long term / Permanent 20 ("Recovery will take 6 months or more, or
  the person may never fully recover"); its impacts are unchanged. The bands are **Moderate** 2–19,
  **Critical** 20–49 and **Very Critical** 50–100; Very Critical potential makes SIP, Very Critical
  actual makes HCI. A note under the matrix: "Recovery time is the period from the time of injury
  until the employee returns close to their original health and normal work ability." *(was: two
  matrices; Short term up to 1 month, Medium term 1 to 6 months; bands Low 2–15, Medium 20–30, High
  50–100)*
- **RV-9** *(the types)* Only a SIP asks its type; Yes to HCL or SPL raises the flag and the
  "Critical event" badge without a type. The Environment SIP types are: Significant or major
  spill/leak due to a failure of chemical or fuel tanks · Significant or major impact due to
  overfilling/delivery failure or tanker cleaning · Significant or major spill/leak due to the
  release of very toxic, toxic or hazardous substances · Significant or major spill or leak from
  underground tank · Significant or major release to air of very toxic, toxic or hazardous
  substances · Significant or major release to air (odour, noise etc.) that is likely to cause
  nuisance · Illegal waste disposal due to contamination of waste/incorrect segregation ·
  Contamination of waste received as a raw material (e.g. asbestos) · Significant land
  contamination · Impact to Protected species/habitats or other sensitive receptors · Potential to
  create or exacerbate critical environmental risk(s) · Damaging impact that would be permanent ·
  Impact that needs specific remediation · Impact where the environment needs a long time to
  recover · Enforcement action by the Regulatory Authority · Significant financial penalty or cost ·
  Reputational damage with stakeholders. *(was: SPL types and five provisional Environment types)*
- **RV-11** *(the messages)* "Say whether the event is an HCL." · "Say whether the event is an
  SPL." join "Say whether the event is a SIP."; "Rate the potential loss." and "Rate the actual
  loss." are removed, and so is "Choose the SPL type.".
- **RV-15** *(the rating format and the Industrial Risk rows)* Ratings read "<score> — <Moderate |
  Critical | Very Critical> (<impact> × <duration>)". An Industrial Risk review shows "Is this event
  an HCL?" or "Is this event an SPL?" (Yes / No) instead of ratings, and no type. *(was: Low,
  Medium, High; Potential / Actual loss ratings and the SPL type)*
- **Domain, Glossary and Critical events**: HCI is "High Consequence Injury", HCL "High
  Consequence Loss" (real events, actual consequences: major losses for the Group) and SPL "Serious
  Potential Loss" (near misses or moderate events, potential severity: weak signals before a major
  loss). SIP and HCI (Health & Safety) are raised by a **Very Critical** score (50 or more); HCL
  (SRE1–SRE3) and SPL (SRE4–SRE5) when the reviewer answers Yes; only a SIP needs a type. No
  expansion is an open point any more.

## Acceptance scenarios

From freshly reset demo data (`specs/capabilities/platform-data.md`).

1. **5W1H content** — In the analysis of `TF-26-0003`, 5W1H lists six sections; "When?" set to Yes
   shows 6 questions, "Where?" 4, "Who was injured?" 7 (starting "Name", "Age"), "Why did the event
   occur?" 7, "How did the event occur?" 7, "What happened?" 13 with "Summary of injury and how
   sustained". (Content — 5W1H)
2. **Safety only** — The 5W1H of an analysed `EVE-26-0001` (Environment) or `SRE-26-0004` (Industrial
   Risk, SRE2) has five sections, without "Who was injured?". (RCA-10)
3. **6M content** — The 6M themes read Management, Man Power, Methods, Machines/Tools/Equipment,
   Materials, Environment; Man Power offers 13 causes plus Other, starting "Short cut"; Machines/Tools/
   Equipment includes "PPE not suitable"; Management's guidance starts "Is the work organized?".
   (RCA-11, Content — 6M)
4. **Durations** — In the review of `TF-26-0003`, the injury matrix shows Short term "Recovery will
   take between 1 week and 3 months" and Medium term "Recovery will take more than 3 but less than
   6 months", with the recovery note under it. (RV-8)
5. **Bands** — Potential Severe × Medium term reads "50, Very Critical" and makes the event SIP;
   Significant × Medium term "30, Critical"; Actual Minor × Short term "5, Moderate"; the completed
   review shows "50 — Very Critical (Severe × Medium term)". (RV-8, RV-15)
6. **SPL** — Carla Mendes reviewing `SRE-26-0001` (SRE4) as valid is asked Categories and "Is this event an SPL?" with
   neither Yes nor No selected, and no matrix. Completing without answering shows "Say whether the
   event is an SPL.". Yes shows the "Critical event" badge (SPL) and asks no type; the completed
   review shows "Is this event an SPL?" Yes and Critical SPL, without a type row. (RV-7, RV-9,
   RV-11, RV-15)
7. **HCL** — Carla reviewing `SRE-26-0002` (SRE3) is asked "Is this event an HCL?" and no SPL question; No
   leaves the event not critical. (RV-7)
8. **Environment SIP types** — Reviewing `EVE-26-0001`, Yes to "Is this event a SIP?" asks the SIP
   type, which offers 17 types starting "Significant or major spill/leak due to a failure of
   chemical or fuel tanks" and ending "Reputational damage with stakeholders". (RV-9)

## Out of scope

- Changing the severity scope (Potential TF1–TF4, Actual TF1–TF3) and the TG / severity rate
  formula of the Severity Level document (not used by the product).
- An HCL / SPL question on the report form (it keeps its SRP question).
