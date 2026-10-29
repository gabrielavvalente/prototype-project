# 04 — Root cause analysis

The people designated by the review analyse the event: its statement and immediate actions, an
optional 5W1H guide, the contributory causes (6M), the chain of whys down to the root causes (5
Why), the actions those whys call for, and what was learned.

Builds on: [00 Overview](00-overview.md), [01 Roles and permissions](01-roles-and-permissions.md),
[03 Event review](03-event-review.md), [05 Action plan](05-action-plan.md).

## Rules

### Designation

- **RCA-1** When a valid review leads to Root cause analysis (RV-10), the review asks **Who will
  perform the root cause analysis?** (required, one or more): **users** — people of any event role
  whose access includes the event's plant and pillar, the reviewer included — and **investigation
  groups** covering the event's plant and pillar (RP-3). Otherwise it is not asked, and an analysis
  can still be started later (RCA-18).
- **RCA-2** Completing the review keeps the designated users and groups on the event and alerts them
  ([10](10-alerts-and-notifications.md)). The completed review shows who was designated.
- **RCA-3** A reviewer who is among the designated people (directly or through a group) goes on to
  the analysis right after completing the review.

### Who performs the analysis

- **RCA-4** Only the designated users, the members of the designated groups and the plant's Site
  Admins (RP-8a) edit and save the analysis, and only while Root cause analysis is the event's
  current step — not the reviewer, a Manager or a Control Panel administrator unless designated.
  Everyone else who can see the event reads it. Once completed it is read-only.

### What the analysis holds

- **RCA-5 Overview**: who it is assigned to, and the state of each part — 5W1H (optional), 6M, 5
  Why, Learnings: **Not started** while nothing is entered, **Done** as each part defines it, **In
  progress** otherwise.
- **RCA-6 Event statement**: editable; copied from the review's statement when the analysis is
  first opened (from the description if the review has none), not kept in sync afterwards.
- **RCA-7 Immediate actions**: the event's immediate actions — the same list as in the report. The
  analysts add, edit and delete them with the rules of ER-14 (deleting asks for confirmation). Once
  saved, the report shows the same immediate actions and the history records "Immediate actions
  updated in the root cause analysis by <name>" (one entry, for the last save that changed them).
- **RCA-8 5W1H** (optional guide): one question for the whole guide, "Is this section applicable to
  your event?" Yes / No. Yes offers its six sections (content below), each with its numbered
  questions and a text answer per question; "Who was injured?" is offered for Safety (TF) events
  only. Done when answered No, or Yes with every offered question answered. Never required.
- **RCA-9 6M**: six themes (content below), each with its contributory causes and guidance
  questions, and one **Other** per theme (with a required name). Each chosen cause gets a number —
  **C1, C2…** in the order the causes were chosen, renumbered when one is removed — and asks "How
  did "<cause>" contribute to the event occurrence?" (required). At most **6 causes in total**
  across themes, Other included; the reasoning given: "avoid selecting the max of six by default".
  Done when at least one cause is chosen and every chosen cause is explained (and every Other
  named).
- **RCA-10 5 Why**: available only while 6M is Done (what was entered is kept otherwise). For each
  chosen cause, a tree of whys starting from the cause and its 6M explanation:
  - choosing a cause adds its first why; removing a cause removes its whys and their actions
    (after confirmation when answers or actions would be lost);
  - each why has a depth (Why 1 … Why 5), an answer and a **Root cause** mark; a why can have a
    next why (until Why 5), **alternative answers** to the same question (a branch, including a
    second first why under the same cause), and actions (once it has an answer, created with the
    rules of the action plan, AP-4, linked to that why);
  - marking a root cause asks nothing more; any why can be a root cause, with or without whys
    below it;
  - deleting a why deletes the whys below it (after confirmation when actions would be lost); a
    cause's only first why cannot be deleted;
  - Done when at least one why — anywhere — is a root cause and every root cause has an answer.
- **RCA-11 Actions**: the actions created from the whys belong to the event's action plan (AP-1),
  Planned until the plan is deployed; the analysts edit and delete them (with confirmation). They
  are not required to complete the analysis.
- **RCA-12 Learnings**: "What did we learn?", required.

### Saving and completing

- **RCA-13** **Save** keeps everything (statement, immediate actions, parts, actions, learnings)
  without completing.
- **RCA-14** **Complete analysis** requires 6M Done, 5 Why Done and the learnings; otherwise nothing
  at all is saved and each missing part is reported. Completing records who and when ("Completed by
  <name> on <date>"; history: "Root cause analysis completed by <name>") and moves the event to its
  next required step — Actions when the workflow requires it or the plan has actions (AP-3) — or
  closes it when none is left.

### Optional analysis

- **RCA-15** After a valid review, when neither the workflow nor the review made Root cause analysis
  required, the step is **Optional** while the event is In Progress or Closed (never Archived, nor
  locked, VAL-6). Its reviewer and the Managers and Site Admins who can see the event can start it:
  "This analysis is not required. You can still start it for this event." — choosing who performs
  it (as RCA-1; refused without anyone: "Choose who will perform the root cause analysis.").
  Starting it makes Root cause analysis a required step, keeps and alerts the designated people
  (RCA-2), records "Root cause analysis started by <name>" and — for a Closed event — reopens it: In
  Progress, current step Root cause analysis. Everyone else is told "This step is not required for
  this event.".

## Content

### 5W1H sections

| Section | Questions |
|---|---|
| Who was injured? *(Safety events only)* | Name · Age · Length of service · Experience/training · Occupation · Who else was involved? (other victims, witnesses, contractors, colleagues, public) · Obtain statements from witnesses/other victims (list document references) |
| What happened? | What are the details of the event? (brief description) · What were working environment conditions? (lighting, inside/outside work, temperature, climate conditions: wind, snow, rain) · Summary of injury and how sustained · Details of work activity carried out · What was being done immediately before and also 10 minutes before the event? · Who was the direct supervisor at the time of the incident? · What was the victim's supervisor doing at the time of the event and 10 minutes beforehand? · What other events or people were in the area at the time of the incident? Anything unusual about the working condition? · What applicable standard procedures and/or instructions were in place for the operations being undertaken around the event? (risk assessments, method statements, etc.) · What communications had been given by the victim's supervisor that were relevant to the work being carried out? · What is the process for approval of method statements or SOPs in this particular work? · What qualifications or experience did the author have who prepared Permits to work or method statements? · What other hazards contributed to the event? |
| When? | When did the event occur? (date and time) · When was the victim asked to perform the job/task/activity undertaken? · When was the last review of the risk assessment or SOP? · When was the last record of any site/work/plant inspection? · When and to whom was the event reported? (refer to witness reports) · When were emergency procedures/actions implemented? (refer to witness reports and official reports) |
| Where? | Did the event occur within the site boundaries? If not, give details of the incident origin · Where did the event occur? What other parts of the site were affected by the event? · Where was the victim positioned/located at the time of the event? · Where were the witnesses/other victims located at the time of the event? |
| Why did the event occur? | Comment · Has this event occurred or almost occurred previously on the site or in the company? (review all site records for near misses, event reports and SHEAR warnings to determine any trends) · Were there any previously identified hazards omitted from the risk assessments or SOPs? · Is there any reason why the hazards now identified were not part of the risk assessment? · Why was the injured person close to the hazard? · Did the victim carry out any unsafe or poor CHEAR behaviours? Why? · Any other relevant information (e.g. breakdown in communication, lack of signage, fatigue, ill health, production pressures) |
| How did the event occur? | Review the documentation · A flow diagram may be useful to identify key gaps or critical points · Have you received the witness reports? · Were work activity procedures followed? · How did any new hazards get updated into the assessment of SOPs? · How was the emergency response for the event managed? (details of emergency procedures/actions) · Have the witness statements and/or other reports highlighted any contributing factors? If yes, explain |

### 6M themes

Every theme also offers **Other**.

| Theme | Contributory causes | Guidance |
|---|---|---|
| Management | Organization of Work · Lack of Supervision · Non-application of standards/procedures · Communication / information problem · Working long hours · Lack of Resources · Training | Is the work organized? · Are the resources adequate? · Are rules and procedures communicated and maintained? · Has the staff been trained or informed? · Are the staff supervised effectively? |
| Man Power | Short cut · Fatigue · Mind/eye not on the task · Bad habit/over-confidence · Distraction · In the line of fire · Loss of balance, traction or grip · Not applying standards or procedures · Lack of skills or knowledge · Negligence · Manual handling/ergonomics · Not aware of hazard/consequences · Mistake/error | Is communication (information, training, warning) available and sufficient? · Is competence tested and validated? · Is behaviour monitored? · Are operators coached (skill, behaviour, attitude)? · Is there evidence of praise or discipline used? · Is medical or HR advice required? · Is specialist health and safety advice required? |
| Methods | No written procedure · Inadequate procedure · Contractor control · Work permit · Inadequate emergency procedure · Procedure not applied · LOTO · Management of change · Seconds to think | Is the procedure suitable and sufficient? · Did the risk assessment identify the hazard? · Was a pre-start risk assessment done? · Were all requirements of legal and company standards in place? · Were procedures followed? |
| Machines/Tools/Equipment | Unsafe equipment · Poor maintenance · Operating ergonomics · Machine condition · Building condition · PPE not suitable · Unsuitable tools · Tools not available · PPE not available | Consider the condition of materials, equipment, facilities, buildings, tools, PPE and storage. · What system is in place for checking? |
| Materials | Hazardous substances · Explosive dust/vapours · Contact with energy source · Shape, size, weight · Raw materials · Materials containment | Are controls in place to prevent exposure to hazardous materials or energy sources? · Are materials and products stored in a safe condition? · Are the materials or products in an abnormal condition? |
| Environment | Confined space · Storage conditions · Warning devices · Lighting · Noise · Excessive heat or cold · Fumes, smoke, dust · Climatic conditions · Humidity · Work at height | Did the climatic or workplace conditions cause or contribute to the cause of the incident? |

## Decisions

| Topic | Decision |
|---|---|
| Who analyses | The designated users and group members, and the plant's Site Admins; nobody else, even the reviewer, unless designated |
| 6M | At most six contributory causes in total |
| Root causes | Any why can be one; no further classification (Behavioral / Conditional is left out, Q-13) |
| Optional analysis | Can be started after any valid review, even on a Closed event (which it reopens), never on an Archived or locked one |
| 5W1H | One "applicable?" question for the whole guide, not one per section *(the prototype: one per section)* |
| "Who was injured?" | Safety (TF) events only *(the prototype: Health & Safety events, with Occupational Health a separate pillar)* |

## Examples

1. **Given** a TF2 event requiring Root cause analysis, **when** the reviewer designates a person P
   and group G, **then** P and G's members are alerted and only they (and the plant's Site Admins)
   can edit the analysis; the reviewer can only read it. (RCA-1, RCA-2, RCA-4)
2. **Given** an analysis, **when** 6M is not Done, **then** 5 Why cannot be filled; once a cause is
   chosen and explained, 5 Why starts with that cause's first why. (RCA-9, RCA-10)
3. **Given** six causes chosen, **then** no seventh can be chosen. (RCA-9)
4. **Given** a why with an answer, **when** an action is added to it, **then** it joins the action
   plan as Planned, linked to that why. (RCA-10, RCA-11)
5. **Given** Complete analysis with no root cause marked, **then** nothing is saved and 5 Why is
   reported as missing. (RCA-14)
6. **Given** a completed analysis on a TF2 whose workflow requires Actions, **then** the event moves
   to Actions; on a TF3 requiring nothing after it and with no action, it closes. (RCA-14)
7. **Given** a Closed TF4 reviewed as valid with no analysis, **when** a Manager of its plant starts
   an optional analysis designating P, **then** the event is In Progress at Root cause analysis and
   P is alerted. (RCA-15)
8. **Given** an Environment event, **when** the analyst answers Yes to "Is this section applicable to
   your event?", **then** the 5W1H sections are offered, without "Who was injured?"; answering No
   makes the 5W1H Done with nothing else to fill. (RCA-8)
