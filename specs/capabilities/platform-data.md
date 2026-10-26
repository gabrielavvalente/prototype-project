# Capability: Platform data and demo data

**Product**: all three (Event Reporting, Control Panel, User Management)
**Builds on**: [domain](../domain.md)
**Status**: built

The organization, people and reference data every product shares, how the demo data is loaded and
reset, and the demo data itself, which every capability's acceptance scenarios start from.

## Rules

- **PD-1** The organization, the people, the investigation groups and the pillars, families and
  levels are shared by the three products; a product never keeps its own copy.
- **PD-2** On every start, the organization, the people, the investigation groups and the
  pillars, families and levels are **rewritten** from the demo data below (they cannot be edited in
  the products).
- **PD-3** Workflow settings, master data, activation choices, the audit trail, Control Panel
  notifications and the notification settings (submission rules, people's information settings and
  their Changes) are loaded from the demo data **once**, then changed only through the products.
- **PD-4** Events, attachments, alerts and record-number counters are loaded from the demo data
  **once**, when there are none; the Event Reporting form lists are refreshed on every start.
- **PD-5** **Reset demo data** on the Event Reporting start screen (after a confirmation) deletes
  everything of PD-3 and PD-4 and loads the demo data again. The Control Panel's reset does the
  same for PD-3 only.
- **PD-6** The data is kept on the device, per browser origin: the products share it only when
  opened from the same address.
- **PD-7** Signing in means choosing a person on the start screen (no password). Event Reporting
  lists only people with an event role; the Control Panel lists everyone but only people with a
  Control Panel role can be chosen (the others are shown disabled). Closing the tab signs out.

## Demo data

### Organization

| Business | Plant | Type | Country |
|---|---|---|---|
| Automotive Parts | Lyon | 🏭 Factory | 🇫🇷 France |
| Automotive Parts | Curitiba | 🔧 Assembly plant | 🇧🇷 Brazil |
| Packaging | Porto | 🏬 Distribution center | 🇵🇹 Portugal |

Every plant has the same location tree, two nodes per level (2 departments × 2 workshops × 2 jobs
× 2 workstations × 2 tasks):

| Level | Names |
|---|---|
| Department | Assembly, Logistics |
| Workshop | Workshop North, Workshop South |
| Job | Line operator, Forklift driver |
| Workstation | Station 10, Station 20 |
| Task | Loading parts, Quality check |

### People

"All" = the four pillars. Site Admins also get the Local roles of the domain rule (shown in
italics).

| Person | Event role | Event access | Control Panel roles |
|---|---|---|---|
| Ana Ribeiro | User | Lyon: all | — |
| Ben Okafor | User | Curitiba: H&S, Environment | — |
| Carla Mendes | Manager | Lyon: all | Local H&S (Lyon) |
| Diego Laurent | Manager | Lyon: H&S, Industrial Risk · Porto: all | — |
| Eva Novak | Site Admin | Lyon: all | *Local on all four pillars (Lyon)* |
| Felix Tanaka | Manager | Curitiba: all | Local H&S, Local Environment (Curitiba) |
| Gina Rossi | User | Porto: all | — |
| Lucas Weber | Manager | Lyon: H&S, Environment · Porto: H&S, Environment | Cluster H&S, Cluster Environment (Lyon, Porto) |
| Ludovic Costa | — | — | Central H&S, Central Industrial Hygiene |
| Ed Petrov | — | — | Central Environment |
| Sergio Martins | — | — | Central Industrial Risk |
| Pascal Fischer | — | — | Cluster H&S (Lyon, Curitiba) |

Each person shows their initials as avatar.

### Investigation groups

| Group | Pillars | Plants | Members |
|---|---|---|---|
| Lyon H&S investigation team | H&S | Lyon | Carla Mendes, Eva Novak, Ana Ribeiro |
| Cluster electrical safety team | H&S, Industrial Risk | Lyon, Porto | Diego Laurent, Lucas Weber, Gina Rossi |
| Curitiba EHS team | all | Curitiba | Felix Tanaka, Ben Okafor |
| Porto environment team | Environment | Porto | Gina Rossi, Diego Laurent |

### Workflow settings (all Central unless said otherwise)

Reviewers of every Review setting: Carla Mendes, Eva Novak, Felix Tanaka, Diego Laurent (each
event keeps only those who can see its plant and pillar).

| Pillar | Review | Root cause analysis | Actions | Validation | Author |
|---|---|---|---|---|---|
| H&S | TF1–TF4 | — | TF1, TF2 | TF1 at Lyon (Local, by Eva Novak) | Ludovic Costa |
| Environment | EvE1–EvE4 | — | EvE1, EvE2 | — | Ed Petrov |
| Industrial Risk | SRE1–SRE4 | SRE1, SRE2 | — | — | Sergio Martins |
| Industrial Hygiene | all four disease types | — | — | — | Ludovic Costa |

TF5, EvE5 and SRE5 require nothing, so their events are Closed at submission.

### Events

All in 2026. The workflow of each submitted event comes from the settings above; "Closed" ones
required nothing besides Submission. "IA" = has one immediate action ("Area made safe and people
informed", High priority, done by the reporter). Risk answer: the SIP / CRP / SRP answer of the
domain (— for Industrial Hygiene).

| Record | Title | Level | Plant | Reporter | Risk | Status | Reported | IA |
|---|---|---|---|---|---|---|---|---|
| TF-26-0001 | Forklift almost hit a pedestrian at dock 3 | TF4 | Lyon | Ana Ribeiro | Yes | Open | 02 Sep 08:15 | |
| TF-26-0002 | Operator cut finger on sheet metal edge | TF3 | Lyon | Ana Ribeiro | No | Open | 05 Sep 10:40 | IA |
| EVE-26-0001 | Oil leak under press 4 | EvE4 | Lyon | Carla Mendes | No | Open | 08 Sep 14:05 | |
| TF-26-0003 | Worker slipped on wet floor and twisted ankle | TF2 | Lyon | Ana Ribeiro | Yes | Open | 10 Sep 06:50 | IA |
| SRE-26-0001 | Sparks from grinder near cardboard boxes | SRE4 | Lyon | Diego Laurent | Yes | Open | 12 Sep 15:30 | |
| TF-26-0004 | Missing guard on conveyor | TF4 | Lyon | Carla Mendes | Yes | Open | 15 Sep 09:00 | |
| EVE-26-0002 | Chemical drum stored outside bunded area | EvE5 | Lyon | Ana Ribeiro | No | Closed | 18 Sep 11:20 | |
| SRE-26-0002 | Small fire in electrical cabinet | SRE3 | Lyon | Carla Mendes | No | Open | 20 Sep 22:10 | IA |
| OH-26-0001 | Operator reports wrist pain after long shifts | Musculoskeletal disorder | Lyon | Ana Ribeiro | — | Open | 22 Sep 13:00 | |
| TF-26-0005 | Fall from ladder during maintenance | TF1 | Lyon | Carla Mendes | Yes | Open | 24 Sep 07:45 | IA |
| EVE-26-0003 | Coolant spill reached rain drain | EvE2 | Lyon | Carla Mendes | Yes | Open | 26 Sep 16:35 | |
| SRE-26-0003 | Compressed air hose whipped loose | SRE5 | Lyon | Diego Laurent | No | Closed | 29 Sep 10:10 | |
| TF-26-0006 | Pallet fell from racking, nobody nearby | TF4 | Lyon | Ana Ribeiro | Yes | Open | 01 Oct 12:25 | |
| OH-26-0002 | Skin rash after handling new degreaser | Skin disease | Lyon | Ana Ribeiro | — | Open | 03 Oct 09:40 | |
| SRE-26-0004 | Gas cylinder valve found damaged | SRE2 | Lyon | Carla Mendes | Yes | Open | 06 Oct 08:00 | IA |
| TF-26-0007 | Blocked emergency exit in warehouse | TF5 | Lyon | Ana Ribeiro | No | Closed | 09 Oct 17:15 | |
| *(draft)* | Hand caught in press, glove torn | TF4 | Lyon | Ana Ribeiro | Yes | Draft | 20 Oct 11:00 | |
| *(draft)* | Hydraulic oil drip from forklift | EvE4 | Lyon | Carla Mendes | No | Draft | 21 Oct 14:30 | |
| TF-26-0008 | Worker hit head on low beam | TF3 | Curitiba | Ben Okafor | No | Open | 04 Sep 09:30 | IA |
| EVE-26-0004 | Paint fumes in booth 2 | EvE5 | Curitiba | Ben Okafor | No | Closed | 11 Sep 15:00 | |
| SRE-26-0005 | Overheated motor smoking | SRE3 | Curitiba | Felix Tanaka | No | Open | 19 Sep 20:45 | IA |
| OH-26-0003 | Noise above limit near stamping line | Hearing loss | Curitiba | Felix Tanaka | — | Open | 27 Sep 10:00 | |
| TF-26-0009 | Trolley wheel broke while loaded | TF4 | Curitiba | Ben Okafor | Yes | Open | 04 Oct 13:50 | |
| TF-26-0010 | Burn from hot part out of oven | TF2 | Curitiba | Ben Okafor | Yes | Open | 12 Oct 07:20 | IA |
| *(draft)* | Unlabelled waste container | EvE5 | Curitiba | Ben Okafor | No | Draft | 22 Oct 16:00 | |
| TF-26-0011 | Stack of pallets leaning in aisle 7 | TF4 | Porto | Gina Rossi | Yes | Open | 07 Sep 06:30 | |
| TF-26-0012 | Truck reversed into loading dock door | TF4 | Porto | Gina Rossi | Yes | Open | 17 Sep 05:55 | |
| SRE-26-0006 | Shrink-wrap machine heater fire | SRE3 | Porto | Diego Laurent | No | Open | 25 Sep 23:10 | IA |
| OH-26-0004 | Dust from cardboard cutting | Respiratory disease | Porto | Gina Rossi | — | Open | 02 Oct 11:45 | |
| EVE-26-0005 | Plastic film waste in open skip | EvE5 | Porto | Gina Rossi | No | Closed | 10 Oct 14:20 | |

- Each event's description is its title followed by ". Reported from the shop floor during the
  shift." Its other report fields (location, task type, shift, person involved, first aid,
  diseases, recurrence) hold any valid values; no scenario depends on them. Nothing is shared with
  anyone and no event has attachments.
- Record-number counters continue after the last number of each family (TF 12, EVE 5, SRE 6,
  OH 4).

### Alerts

The submission alerts ([notifications](notifications.md) NT-3) of the two latest submitted events
of each plant: at Lyon, "Event to review" for `SRE-26-0004` to Carla Mendes, Eva Novak and Diego
Laurent, and "Event submitted" for `TF-26-0007` to Carla, Diego and Lucas Weber. No submission
rule; every information alert is on, set by nobody.

## Acceptance scenarios

1. **Shared data** — Sign in to the Control Panel as Ludovic Costa and to Event Reporting as Carla
   Mendes from the same address: both list the same plants and people. (PD-1, PD-6)
2. **Start screens** — Event Reporting offers the 8 people with an event role; the Control Panel
   lists all 12 people, and only the 8 with a Control Panel role can be chosen (Eva Novak through
   her Site Admin roles). (PD-7)
3. **Demo events** — As Carla at Lyon, all pillars: the list shows the 16 submitted Lyon events,
   3 of them Closed, and her draft "Hydraulic oil drip from forklift"; Ana's drafts are not shown.
   (Demo data, domain Visibility)
4. **Reset** — Change a workflow setting in the Control Panel and submit an event; Reset demo data
   in Event Reporting. *Then* the setting and the events are back to the demo data. (PD-5)

## Decisions

| Topic | Decision |
|---|---|
| Sign-in | A person picker, no password: this is a prototype with fictional people. |
| Where the data lives | On the device only, no server; sharing needs the same address (PD-6). |
