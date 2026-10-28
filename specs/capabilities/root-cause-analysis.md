# Capability: Root cause analysis

**Product**: Event Reporting (the step and the designation)
**Builds on**: [domain](../domain.md) (roles, visibility, workflow and steps),
[platform data](platform-data.md) (people, groups, demo events), Event reporting (immediate
actions), Event review (the review form and its decision), [action plan](action-plan.md) (the
actions created from whys)
**Status**: built

The reviewer designates who analyzes a valid event; the designated people find the root causes
with 5W1H, 6M and 5 Why, create actions from the whys, record the learnings and complete the step.

## Scope

- **In**: designation in the review, investigation groups (fixed demo data), the
  Root cause analysis step (overview, immediate actions, 5W1H, 6M, 5 Why, actions, learnings),
  saving, completing, alerts, history.
- **Out**: risk-assessment gap question, related hazards, attachments, the Safety Alert and
  Warning ([safety communication](safety-communication.md)),
  field-level audit trail, export or print of the 5 Why diagram, editing groups, Behavioral /
  Conditional classification of root causes, following the actions ([action plan](action-plan.md)).

## Rules

### Designation (in the review)

- **RCA-1** When a valid review leads to Root cause analysis (the event's workflow requires it, or
  the reviewer answered Yes to "Do you want to further analyze?", asked for critical events), the
  review asks **Who will
  perform the root cause analysis?**: a required, searchable multiple choice in two groups —
  *Users* (people of any event role whose access includes the event's plant and pillar, the
  reviewer included) and *Groups* (investigation groups covering the event's plant and pillar).
  Otherwise the question is not shown, and the analysis can still be started later (RCA-18).
- **RCA-2** Saving the review keeps the designated users and groups on the event and alerts them
  ([notifications](notifications.md) NT-3).
- **RCA-3** A completed review shows who was designated.
- **RCA-4** After completing the review, a reviewer who is one of the designated people (directly
  or through a group) is taken to the Root cause analysis step; any other reviewer stays on the
  review summary.

### Investigation groups

- **RCA-5** A group has a name, pillars, plants and members. The groups are fixed demo data
  ([platform data](platform-data.md)); nobody edits them.
- **RCA-6** User Management lists the groups read-only in its Groups tab
  ([user management](user-management.md) UM-6).

### Who performs the analysis

- **RCA-7** Only the designated users and the members of the designated groups can edit and save
  the analysis, and only while Root cause analysis is the event's current step — not the reviewer,
  a Manager or a Control Panel administrator unless designated. Everyone else who can see the
  event reads it (they can still open parts and switch sections). Once completed it is read-only
  for everyone.

### The step

- **RCA-8 Overview**: "Assigned to: …", the status of each part (5W1H — optional, 6M, 5 Why,
  Learnings): **Not started** while nothing is entered in it, **Done** as defined for each part,
  **In progress** otherwise. Then the **event statement** (full width, editable), copied from the
  review's statement when the analysis is first opened (the event's description if the review has
  none), not kept in sync afterwards.
- **RCA-9 Immediate actions**: the event's own immediate actions (the same list as the
  submission), one compact line each — description, priority, who did it — with edit and delete
  icons, and **Add immediate action**. Adding and editing open a popup with the submission's
  immediate action card (same fields and rules); its button is **Create** (Save when editing) and
  refuses an incomplete action (with the card's messages). Deleting asks for confirmation. Changes
  are stored with the step's **Save** (RCA-15); then the submission shows the same immediate
  actions and the event history shows "Immediate actions updated in the root cause analysis by
  <name>" (one entry, kept for the last save that changed them).
- **RCA-10 5W1H** (optional guide): collapsed until the person expands it (open when it already
  has answers). Sections listed on the left, the chosen one on the right with "Is this section
  applicable to your event?" (Yes / No) and, when Yes, its numbered questions, each with a text
  answer. The "Who was injured?" section is offered for Health & Safety events only. Done when
  every offered section is No, or Yes with every answer. Never required.
- **RCA-11 6M**: an introduction ("avoid selecting the max of six by default…"), the six themes
  listed on the left (with the number of causes ticked) and the chosen theme's guidance below
  them; on the right the theme's contributory causes as checkboxes, plus one **Other** per theme
  (which asks for a required name). Each ticked cause gets a card **C1, C2…** — numbered in the
  order the causes were ticked, renumbered when one is unticked — "How did "<cause>" contribute
  to the event occurrence?" with a required answer. At most **6 causes in total** across themes
  (Other included); then the other checkboxes are disabled with a hint. Done when at least one
  cause is ticked and every ticked cause is explained (and every Other named).
- **RCA-12 5 Why**: collapsed and disabled ("Available once 6M is done…") whenever 6M is not Done
  (what was entered is kept), open otherwise. One column per ticked cause, headed by the cause's name and its 6M explanation (shown, not
  editable), with whys below it as a tree:
  - Ticking a cause adds its first why; unticking a cause removes its whys and their actions
    (after confirmation when answers or actions would be lost).
  - A why card shows "Why N" (its depth), the number of its actions, an **X** to delete it, its
    answer, a **Root cause** switch, and buttons **Add why** (only when it has no next why and
    N < 5), **Branch** (adds an alternative answer to the same question beside it; on a Why 1, a
    second first why under the same cause) and **Add action** (disabled until it has an answer),
    which opens the action popup of the [action plan](action-plan.md) (AP-4) with that why fixed.
  - A root cause only highlights its card: no classification is asked and every button stays
    available. Any why can be a root cause, with or without whys below it.
  - Deleting a why deletes the whys below it (after confirmation when actions would be lost); a
    cause's only first why cannot be deleted.
  - Several next whys sit side by side; the area scrolls sideways on narrow screens.
  - Done when at least one why (anywhere, not one per cause) is a root cause and every root cause
    has an answer.
- **RCA-13 Actions**: the actions created from the whys are the event's action plan's
  ([action plan](action-plan.md) AP-1), Planned until the plan is deployed. Under 5 Why, **Actions
  (n)** lists them in the plan's compact lines (AP-6), with edit and delete icons for the analysts;
  deleting asks for confirmation. They are not required to complete the analysis.
- **RCA-14 Learnings**: "What did we learn?", required text.

### Saving and completing

- **RCA-15** **Save** keeps everything (statement, immediate actions, parts, actions, learnings)
  without completing and shows "Saved at HH:MM".
- **RCA-16** **Complete analysis** requires 6M Done, 5 Why Done and the learnings; otherwise
  nothing at all is saved (not even the other parts) and each missing part shows its message.
  Completing records who and when and moves the event to its next required step (In Progress) —
  Actions when the workflow requires it or the plan has actions (AP-3) — or closes it when none is
  left; when it is Actions, the analyst is taken to the Actions step.
- **RCA-17** A completed analysis shows "Completed by <name> on <date>"; the event history shows
  "Root cause analysis completed by <name>".

### Optional analysis

- **RCA-18** **Optional analysis**: after a valid review, when neither the workflow nor the review
  made Root cause analysis required, the step shows **Optional** while the event is In Progress or
  Closed (never Archived, nor locked by its [validation](validation.md) VAL-6). Its reviewer and the Managers and Site Admins who can see the event open
  it and see "This analysis is not required. You can still start it for this event." with **Who
  will perform the root cause analysis?** (as RCA-1) and **Start root cause analysis**, refused
  without anyone ("Choose who will perform the root cause analysis."). Starting it makes Root cause
  analysis a required step of the event, keeps the designated people (RCA-2 alerts them, RCA-4
  takes a designated starter to the analysis), records "Root cause analysis started by <name>" in
  the history and — for a Closed event — reopens it: In Progress, current step Root cause analysis.
  Everyone else sees "This step is not required for this event.".

## Content

### 5W1H sections

| Section | Questions |
|---|---|
| Who was injured? *(Health & Safety only)* | Name · Age · Length of service · Experience/training · Occupation · Who else was involved? (other victims, witnesses, contractors, colleagues, public) · Obtain statements from witnesses/other victims (list document references) |
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

## Acceptance scenarios

From freshly reset [demo data](platform-data.md). Carla Mendes is a reviewer of the Lyon events;
`TF-26-0003` (TF2) requires Review and Actions; `TF-26-0002` (TF3), `TF-26-0006` (TF4) and
`EVE-26-0001` (EvE4) require Review only.

1. **Designation required** — Carla reviews `TF-26-0003` as valid with Potential Severe × Medium
   term (SIP, type chosen), "further analyze" Yes. *Then* "Who will perform the root cause
   analysis?" is required: Complete review with it empty is refused next to the field. She picks
   the Lyon H&S investigation team and Diego Laurent → current step Root cause analysis, and
   Carla, a member of that team, is taken to it; the review step shows the designation.
   (RCA-1, RCA-3, RCA-4)
2. **Alerts** — Eva Novak, Ana Ribeiro and Diego Laurent have one "Root cause analysis assigned to
   you" each; Carla has none. (RCA-2)
3. **Reviewer stays on the summary** — Carla reviews `TF-26-0002` as valid with Potential Severe ×
   Medium term (SIP, type chosen), "further analyze" Yes, and designates only Diego Laurent. *Then* she stays on the review summary.
   (RCA-4)
4. **Not asked** — Carla reviews `TF-26-0006` as valid with Potential Minor × Minimal (not critical,
   workflow not requiring the analysis): neither "further analyze" nor the designation is asked.
   (RCA-1)
5. **Overview and immediate actions** — Diego opens `TF-26-0003`, Root cause analysis: statement
   pre-filled, immediate actions as compact lines, every part Not started, 5W1H collapsed, 5 Why
   disabled. Add immediate action → Create with an empty card is refused; complete it → Create;
   Save. *Then* the Submission step lists the new immediate action and the history shows
   "Immediate actions updated in the root cause analysis by Diego Laurent". (RCA-8, RCA-9)
6. **5W1H** — Expand 5W1H, open "What happened?", choose Yes. *Then* 13 numbered questions appear;
   No hides them. Carla reviews `EVE-26-0001` as valid, confirming it is a SIP (type chosen),
   "further analyze" Yes, designating
   herself: its 5W1H has no "Who was injured?". (RCA-10)
7. **6M and the 5 Why gate** — Tick Management › Lack of Resources. *Then* card C1 asks "How did
   "Lack of Resources" contribute to the event occurrence?" and 5 Why stays disabled; answer it.
   *Then* 5 Why opens with a column headed "C1 · Lack of Resources" and its answer (not editable)
   and a first why. Tick 5 more causes across themes: the remaining checkboxes are disabled.
   (RCA-11, RCA-12)
8. **5 Why tree** — Answer Why 1 to Why 3 below C1; switch Why 3 to Root cause: its card is
   highlighted and nothing else is asked. Branch Why 2: a second Why 2 appears beside it. A path
   offers no Add why after Why 5. Delete the branched Why 2 with its X. (RCA-12)
9. **Actions** — Add action is disabled on an empty why. On Why 3, Add action: the popup shows Why
   3's answer; fill description, Diego and Eva, a due date, High, Notify maintenance No → Create
   (department and workshop come from the event). *Then* Why 3 shows
   "1 action" and Actions (1) lists the why's answer and the action below it. Edit it, then
   delete it. Create one again, then delete Why 2: a confirmation warns that the action goes too.
   (RCA-12, RCA-13)
10. **Save and complete** — Save, leave and come back: unchanged. Empty the learnings → Complete
    analysis is refused with Learnings flagged. Write them → Complete. *Then* Actions is the
    current step and Diego is taken to it; back on the analysis, it is read-only with "Completed by
    Diego Laurent on …", and the history shows "Root cause analysis completed by Diego Laurent".
    (RCA-14 to RCA-17)
11. **Readers** — Lucas Weber (event access at Lyon and Porto; member only of the electrical
    team, which was not designated) opens the step while it is current: every
    field is read-only, but he can expand 5W1H and switch sections and themes. (RCA-7)
12. **Phone and keyboard** — At 320px wide the 5W1H and 6M lists stack above their content and the
    5 Why tree scrolls sideways; every control works with Tab, Space and Enter. (Domain)
13. **Optional after closing** — From freshly reset demo data, Carla reviews `TF-26-0006` (TF4,
    Review only) as valid, Potential Minor × Minimal: it is Closed and its Root cause analysis shows
    "Optional"; Carla reads "This analysis is not required. You can still start it for this
    event.", Ana Ribeiro "This step is not required for this event.". Start root cause analysis
    without anyone is refused with "Choose who will perform the root cause analysis."; with Diego
    Laurent the event is In Progress at Root cause analysis, Diego gets "Root cause analysis
    assigned to you" and the history shows "Root cause analysis started by Carla Mendes".
    (RCA-18)
14. **Before Actions** — On `TF-26-0003` reviewed as valid, not critical (current step Actions), Eva
    Novak starts the optional analysis for herself: it becomes the current step, before Actions, and
    she is taken to it. An archived event's analysis step shows "Not required". (RCA-18)

## Decisions

Choices made where the sources disagree or say nothing; each is reflected in the rules above.

| Topic | Decision | Sources |
|---|---|---|
| Who performs the analysis | The people designated in the review | Event Owner (Investigation) vs investigators in the RCA vs assigned by the reviewer |
| 6M themes | Management, Man Power, Methods, Machines/Tools/Equipment, Materials, Environment | 6M document; the UI/UX design names Human Factors and Machine / Tools & Equip.; Investigation lists Man, Machine, Method, Materials, Mother Nature, Management |
| "Who was injured?" | Health & Safety events only | Analysis Checklist ("Safety only") |
| Wording of the 5W1H and 6M content | The sources' meaning, with obvious typos and cut-off sentences fixed; "CHEAR" and "SHEAR" kept as written | Analysis Checklist, 6M document |
| 5W1H | Optional | Investigation makes it required; event-type sources optional |
| Root cause classification | None; a root cause is only highlighted | Investigation requires Behavioral / Conditional |
| Risk-assessment gap question | Not asked | No risk assessment register yet |
