# Capability: Event reporting

**Product**: Event Reporting
**Builds on**: [domain](../domain.md) (pillars, levels, risk question, roles, event lifecycle,
workflow), [platform data](platform-data.md), [workflow settings](workflow-settings.md) (the
workflow an event takes at submission), Event Reporting shell (context, alerts)
**Status**: built

Anyone with the User or Manager role reports an event in a few minutes, as a draft first if
needed; submitting gives it a record number, its workflow and alerts the plant's Managers.

## Rules

### The form

- **ER-1** "Create event" opens **New event** in at most 3 taps from the landing screen. Site
  Admins cannot report.
- **ER-2** The form is one page with the sections **Classification**, **Location**, **General
  information**, **Event details** and **Immediate actions**, and a bar fixed at the bottom. On
  wide screens: Classification, Location and Event details on the left; General information and
  Immediate actions on the right.
- **ER-3** Until pillar, family and level are chosen, every other section is disabled with "Choose
  the classification first.".
- **ER-4** Few-option choices (pillar, family, level, shift moment, employee type, recurrence,
  priority) are chips; pillar chips use the pillar's color.

### Classification

- **ER-5** Pillar (pre-set and skipped when the person works in one pillar), then family (filled
  in and hidden when the pillar has only one), then level, each level with its description (domain). Right after the level, the risk question of the
  domain with its definition, required:
  - "Could this be a SIP?" — "Serious Incident Potential: under slightly different
    circumstances, could this have caused a serious injury or serious harm?"
  - "Could this be a CRP? (Critical Risk Potential)" — "Could this have led to a major fire,
    explosion or loss of the site?"
  - "Could this be a SRP? (Serious Risk Potential)" — "Could this have led to serious damage or a
    long stop of operations?"
- **ER-6** A TF5 answered SIP = Yes becomes TF4, with a warning explaining it — whether the answer
  or the level comes last. Changing the pillar clears the risk answer; changing the level keeps it
  when the question stays the same (e.g. TF4 → TF5 keeps the SIP answer) and clears it otherwise.

### Location

- **ER-7** The location picker offers three ways: typing part of any level's name ("Type a
  department, workshop, station…", results with the full path; "No location matches — try
  browsing below"), browsing one level at a time, and **Scan QR code** where the browser can. A
  station's QR code holds the identifier of a location node: a node deep enough for the level
  fills the location; a higher node opens browsing there ("QR code read. Choose a deeper level
  below."); otherwise "This QR code is not a known location." or "This QR code belongs to another
  plant.". Without scanning support: "QR code scanning is not available in this browser. Search or
  browse the location instead."; camera refused: "The camera could not be opened. Allow camera
  access, or search or browse instead."
- **ER-8** Required: the full path down to the task and a task type (Routine, Non-routine) —
  except TF4 and TF5, which need only department and workshop (task type optional).

### General information

- **ER-9** Title (required, under 120 characters) and description (required, large text, under
  2,000 characters). Under the description, on one line: **Dictate** (speech to text where the
  browser can), and the photo and video buttons (camera on phones).
- **ER-10** Photos and videos are optional: at most 5 files, each at most 5 MB, images or videos
  only (jpg, jpeg, png, gif, webp, heic, mp4, mov, webm). A refused file is not attached and says
  why: "You can attach at most 5 files." / "<name>" is not allowed. Only photos and videos can be
  attached." / "<name>" is larger than 5 MB.".
- **ER-11** For every pillar and level: employee type (Employee, Temporary Worker, Permanent
  Contractor, Non-Permanent Contractor, Other) and the person involved: for Employee, a searchable user of the plant;
  otherwise their name (required) and "What was the person doing?" (optional).
- **ER-12** For TF1–TF3: "What was the first aid treatment?", one or more of: Wound cleaning and
  dressing, Plaster or bandage, Cold compress, Eye wash, Burn care, Splint or immobilisation,
  Removal of a splinter or foreign body, Rest and observation, Other (then a required
  description).

### Event details

- **ER-13** Reporter (the current person; only a Manager can change it), report date (today,
  read-only), event time (optional, not in the future), shift moment (Day, Night, Afternoon),
  recurrence ("Has this happened before?" Yes / No), **Shared with** (people of the event's plant
  who can see its pillar, a multi-select that stays open, each choice also a removable badge) and,
  for Industrial Hygiene, diseases (Occupational asthma, Contact dermatitis, Carpal tunnel
  syndrome, Lower back pain, Noise-induced hearing loss; at least one). There is no comments field.

### Immediate actions

- **ER-14** Optional, any number, as cards: description, priority (Low, Medium, High, Urgent, shown
  with 1–4 severity dots), comments (optional) and "Performed by" (1 to 5 people of the plant; no
  task or alert for them); an X removes a card. Each is saved as Completed, with the event's report
  date as completion date and the event's pillar as category.

### Saving

- **ER-15** Once classified, a draft saves itself about 2 seconds after the last change; the title
  bar shows "Saves automatically once classified", "Saving…", "Draft saved at HH:MM" or "Could not
  save automatically — use Save as draft". Submitted events never save automatically.
- **ER-16** **Save as draft** keeps the event as Draft (visible only to its author, no record
  number, nothing sent). Leaving with unsaved changes asks "Leave this form? You have changes that
  are not saved." with Save as draft, Discard changes, Stay.
- **ER-17** **Submit** with something missing saves nothing, flags each missing field next to it
  with its message, says "N required fields are missing." and scrolls to the first one. The
  messages: "Choose a pillar." · "Choose a family." · "Choose a level." · "Answer "Could this be a
  <SIP|CRP|SRP>?"." · "Choose the location down to the task." / "Choose at least the department and
  workshop." · "Choose a task type." · "Enter a title." · "Describe what happened." · "Choose the
  employee type." · "Choose the person involved." / "Enter the name of the person involved." ·
  "Choose at least one first aid treatment." · "Describe the other first aid treatment." · "The
  event time cannot be in the future." · "Choose the shift moment." · "Say whether this has
  happened before." · "Choose at least one disease." · "Complete immediate action N." (with, on the
  card: "Describe the action.", "Choose a priority.", "Choose 1 to 5 people who did it.").
- **ER-18** A complete **Submit** gives the record number (domain), copies the workflow
  ([workflow settings](workflow-settings.md) WF-11), sets the status Open — or Closed when nothing
  besides Submission is required — and sends "Event submitted" to every Manager who can see the
  event (the reporting Manager included), and "Event shared with you" to each Shared with person
  not already alerted.
- **ER-19** After any save the event's page opens with a banner: "Event <record> was submitted. The
  Managers of this plant have been alerted." (with "and closed right away (no other phase
  required)" when Closed, and a **Report another event** link for those who can report) · "Your
  draft was saved on this device. Only you can see it." · "Event <record> was updated."

### Editing

- **ER-20** The author reopens their draft from the list, continues and submits it.
- **ER-21** A Manager who can see the event edits an **Open** event right in its Submission step,
  with the same form and rules and a **Save changes** button (no draft, no automatic save). The
  record number, the status and the workflow taken at submission do not change, even if the level
  does; nobody is alerted. Once
  reviewed (In Progress, Archived, Closed) nobody edits the submission; the review corrects it.
- **ER-22** Every event records who created it and when, and who last changed it and when.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), in the context Automotive Parts › Lyon.

1. **Quick report** — Ana Ribeiro (User) creates an event in 3 taps: H&S, TF4, SIP No,
   department and workshop only, title, description, Employee = herself, shift, recurrence No →
   Submit. *Then* it is Open as `TF-26-0013`, the banner says "Event TF-26-0013 was submitted. The
   Managers of this plant have been alerted.", and Carla Mendes, Diego Laurent and Lucas Weber
   each have "Event submitted". (ER-1, ER-8, ER-18, ER-19)
2. **Classification first** — On a new event, every section but Classification shows "Choose the
   classification first." until a level is chosen. (ER-3)
3. **TF5 with SIP** — Ana picks TF5 and answers SIP Yes: the level becomes TF4 with a warning.
   (ER-6)
4. **Missing fields** — Ana picks TF2 and presses Submit with only the classification: nothing is
   saved, "N required fields are missing.", the page scrolls to the location, and "Choose at
   least one first aid treatment." shows under the first aid question. (ER-12, ER-17)
5. **Files** — Attaching a 6 MB video says "<name>" is larger than 5 MB." and attaches nothing; a
   PDF is refused. (ER-10)
6. **Draft** — Ben Okafor (Curitiba) classifies an event and waits: "Draft saved at HH:MM"; he
   leaves; Felix Tanaka does not see the draft; Ben reopens and submits it. (ER-15, ER-16, ER-20)
7. **Closed at once** — Ana submits a TF5 (SIP No): the banner adds "and closed right away (no
   other phase required)". (ER-18, ER-19)
8. **Shared with** — Carla reports an EvE4 at Lyon: Shared with offers Lyon people who see
   Environment (Gina Rossi, at Porto, is not offered). She shares it with Ana Ribeiro: on submit
   Ana gets "Event shared with you". (ER-13, ER-18)
9. **Reporter** — Carla (Manager) can change the reporter; Ana cannot. (ER-13)
10. **Edit an Open event** — Carla opens `TF-26-0006`, Submission step: the form with **Save
    changes**; she edits the title and saves: "Event TF-26-0006 was updated." Ana sees the same
    step read-only. After the event is reviewed, Carla sees it read-only too. (ER-21)
11. **Site Admin** — Eva Novak has no Create event. (ER-1)
12. **Phone and keyboard** — At 320px the form is one column with the bar at the bottom; every
    field and chip works with the keyboard. (Domain)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Photos and videos | Optional for every level | US-CREATE-03 required them for TF1–TF3 |
| Immediate actions | Optional for every level, always Completed | US-CREATE-05 required them for TF1–TF3 / SRE1–SRE3 |
| Location for TF4 / TF5 | Department and workshop only | Safety event rules |
| First aid treatments | Starting list above, to be replaced by the official list | Safety event source names the field only |
