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
- **Out**: risk-assessment gap question, related hazards, attachments, Safety Alert / Warning,
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
  Otherwise the question is not shown.
- **RCA-2** Saving the review keeps the designated users and groups on the event and sends
  "Root cause analysis assigned to you" to each designated user and each member of a designated
  group who can see the event — once per person, never to the reviewer.
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
  answer. Environment events have no "Who was injured?" section. Done when every offered section
  is No, or Yes with every answer. Never required.
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

## Content

### 5W1H sections

Only "What happened?" comes from the design; the other questions are **drafts until the business
provides them**.

| Section | Questions |
|---|---|
| Who was injured? *(not for Environment)* | Who was injured or involved? (job title and company: employee, contractor or visitor) · How long has the person been in this job and at this site? · What training and qualifications did the person have for the task? · Who witnessed the event? · Who was in charge of the work? |
| What happened? | 1 What are the details of the event? (brief description) · 2 What were working environment conditions? (lighting, inside/outside work, temperature, climate) · 3 Summary of injury and how sustained · 4 Details of work activity carried out · 5 What was being done immediately before and also 10 minutes before the incident? · 6 Who was the direct supervisor at the time of the incident? · 7 What was the victim's supervisor doing at the time of the event and 10 minutes beforehand? · 8 What other events or persons were in the area at the time of the incident? Anything unusual about the working condition? · 9 What applicable standard procedures and/or instructions were in place for the operations being undertaken around the incident? (risk assessments, method statements) · 10 What communications had been given by the victim's supervisor that were relevant to work being carried out? · 11 What is the process for approval of method statements or SOPs in this particular work? · 12 What qualifications or experience did the author have who prepared Permits to work or method statements? · 13 What other hazards contributed to the event? |
| When? | On which date and at what time did the event happen? · How many hours into the shift did it happen? · During which phase of the task or of production did it happen? · When was the event reported, and to whom? |
| Where? | Where exactly did the event happen? (building, line, equipment) · What were the conditions of the area? (access, layout, housekeeping) · Was the area restricted or marked? · Is this the usual place for this task? |
| Why did the event occur? | What were the direct causes of the event? · Were there earlier signs or similar events? · Why were the existing controls not effective? · Were the people doing the work under pressure? (time, production, cost) |
| How did the event occur? | How did the event unfold, step by step? · How was the injury or damage caused? (contact, energy, movement) · How was the situation made safe afterwards? · How could the event have been prevented? |

### 6M themes

Only Management comes from the design; the other themes are **drafts to be reviewed**. Every theme
also offers **Other**.

| Theme | Contributory causes | Guidance |
|---|---|---|
| Management | Communication Problem · Information Problem · Lack of Resources · Lack of Supervision · Non-Application of Standards/Procedures · Organization of Work · Training · Working Long Hours | Is the work organized? · Are the resources adequate? · Are rules and procedures communicated and maintained? · Have the staff been trained and informed? · Are the staff supervised effectively? |
| Human Factors | Distraction / Inattention · Fatigue · Inadequate Risk Perception · Lack of Knowledge or Skill · Non-Use of PPE · Physical Capability · Rushing / Shortcut · Stress / Workload | Was the person fit for the task? · Did they know the task and its risks? · Were they under time pressure or distracted? · Was the right PPE worn? |
| Methods | Inadequate Change Management · Inadequate Risk Assessment · Permit to Work Not Applied · Poor Work Sequence · Procedure Missing · Procedure Not Adapted to the Task · Procedure Unclear or Outdated | Is there a procedure for this task? · Is it up to date and adapted to the task? · Was the risk assessed before the work? · Were changes to the task managed? |
| Machine / Tools & Equip. | Defective Tool · Design / Ergonomics Problem · Equipment Failure · Inadequate Guarding · Inadequate Maintenance · Missing Safety Device · Wrong Tool for the Task | Was the equipment suitable for the task? · Was it maintained and inspected? · Were guards and safety devices in place and working? |
| Materials | Defective Material · Hazardous Substance · Inadequate Labelling · Inadequate Packaging · Inadequate Storage · Supplier Quality Problem · Wrong Material | Were the materials the right ones and in good condition? · Were hazardous substances identified and labelled? · Were they stored and handled correctly? |
| Environment | Noise · Poor Housekeeping · Poor Lighting · Poor Ventilation · Restricted Space / Access · Slippery or Uneven Surface · Temperature / Weather | Was the work area clean and tidy? · Were lighting, noise and temperature suitable? · Was there enough space to work safely? · Did the weather play a part? |

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

## Decisions

Choices made where the sources disagree or say nothing; each is reflected in the rules above.

| Topic | Decision | Sources |
|---|---|---|
| Who performs the analysis | The people designated in the review | Event Owner (Investigation) vs investigators in the RCA vs assigned by the reviewer |
| 6M themes | Management, Human Factors, Methods, Machine / Tools & Equip., Materials, Environment | UI/UX design; Investigation lists Man, Machine, Method, Materials, Mother Nature, Management |
| 5W1H | Optional | Investigation makes it required; event-type sources optional |
| Root cause classification | None; a root cause is only highlighted | Investigation requires Behavioral / Conditional |
| Risk-assessment gap question | Not asked | No risk assessment register yet |
