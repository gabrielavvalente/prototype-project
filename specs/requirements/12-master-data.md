# 12 — Master data

Each pillar governs the reference lists that classify its events: Central keeps the global values,
Clusters add their own, and every layer can switch values off for its plants.

Builds on: [00 Overview](00-overview.md) (master data, availability), [01 Roles and permissions](01-roles-and-permissions.md);
the starting values are in [14 Reference catalogs](14-reference-catalogs.md).

## Rules

### Lists

- **MD-1** The lists of each pillar:

  | Pillar | Lists | Code |
  |---|---|---|
  | Health & Safety | Standards, Hazards | required |
  | Health & Safety | Diseases | — |
  | Health & Safety | Body Part Categories, Body Parts (each in one category), Injuries (each applying to some body parts) — *fixed global lists* | — |
  | Environment | Aspects, Impacts | — |
  | Industrial Risk | Categories; plus the Health & Safety Standards and Hazards, read-only ("Owned by Health & Safety — read-only here.") | Categories: required |

- **MD-2** The lists start with the catalogs of [14](14-reference-catalogs.md), all owned by Central and
  Active.
- **MD-3** Each list says who maintains it: "Fixed global list, maintained by Central only." or
  "Central maintains global values; Clusters add their own; everyone can switch values off for their
  plants."

### Values

- **MD-4** A value has a code (when the list has codes), a name, an optional description, a category
  (Body Parts only), the body parts it applies to (Injuries only, at least one), an owner (Central, or
  a Cluster with its plants; Local never owns values) and a status: Active, Inactive or Retired
  (final).
- **MD-5** Saving a value is refused when: the name is empty ("Enter a name."); the code is empty in a
  list with codes ("Enter a code."); the code — or the name in a list without codes — already exists
  in the list for the same owner ("A value with code <code> already exists." / ""<name>" already
  exists in this list."); a Body Part has no category ("Choose a category.") or is Active while its
  category is not ("The category is not active, so this value cannot be active."); an Injury has no
  body part ("Choose at least one body part.").
- **MD-6** A person sees the Central values and the values of Clusters sharing a plant with their role
  (Central sees all). Values are ordered by code (natural order: A2 before A10) or by name; Body
  Parts by category.

### Who may do what

- **MD-7** For Standards, Hazards, Diseases, Aspects, Impacts and Industrial Risk Categories:

  | Layer | Own values | Other values |
  |---|---|---|
  | Central | Create, edit, deactivate / reactivate (everywhere), retire | — |
  | Cluster | Create (owned by its plants), edit, deactivate / reactivate, retire | Deactivate / reactivate for its plants |
  | Local | — (cannot create) | Deactivate / reactivate for its plant |

  Fixed global lists: only Central acts. Read-only lists (Industrial Risk's view of Standards and
  Hazards): nobody acts there. A Retired value allows no action.
- **MD-8** Retiring asks "Retire <name>? It will no longer be offered anywhere, and this cannot be
  undone."; each action is confirmed (e.g. "<name> is deactivated for <plant>.").
- **MD-9** Deactivating for some plants records a deactivation for the person's layer and plants;
  reactivating removes only the deactivation made at the person's layer. A lower layer cannot undo a
  higher layer's deactivation.

### Availability

- **MD-10** A value is available at a plant as OV-12 defines. Retired values stay listed but are never
  available. For each value, a person can see whether it is available at a chosen plant of theirs.
- **MD-11** A list can be searched; its number of values is shown; Injuries show how many body parts
  each applies to ("<N> body parts", "1 body part").

### Export and import

- **MD-12** **Export** gives a CSV file of the values shown — Code (when the list has codes), Name,
  Description, Category (Body Parts), Body parts (Injuries, names separated by " | "), Owner, Status,
  "Available at <plant>" — that opens with its accents in Excel.
- **MD-13** **Import** (for those who can create) reads Code, Name, Description, plus Category for Body
  Parts and Body parts for Injuries (names separated by "|", ignoring case; an unknown one: "Unknown
  body part: <names>."). A row with the code (or name) of one of the person's own values changes it; a
  row matching another layer's value is left unchanged; other rows add values owned by the person's
  layer. A code repeated in the file is an error. If any row is invalid nothing is saved: "Nothing
  was imported. Fix these lines and import the file again:" with "Line N: …" for each; otherwise
  "Import done: N values added, N updated, N left unchanged (owned by another level)."
- **MD-14** Every add, edit, status change, deactivation, reactivation and imported change is audited
  (WF-12); an Injury's entry shows its body parts' count (e.g. "Hearing Loss · 2 body parts").

### Search

- **MD-15** In the Control Panel, a search across the person's pillars finds pillars, master data lists
  and values (at most 60 results); a result opens the pillar or the list, narrowed to the search.

## Decisions

| Topic | Decision |
|---|---|
| Health & Safety lists | From the business's master data workbook; Risk Families, Circumstances and Type of Immediate actions not taken (Q-20) |
| Codes | Standards STD-01…, Hazards HZ-01…, in the workbook's order (the workbook has none) |
| Injuries | Each applies to one or more body parts; the review offers only those (RV-6a) |
| Diseases | A Health & Safety list, not yet asked on events (Q-18) |
| Occupational Health | No list of its own: it is part of the Health & Safety pillar |

## Examples

1. **Given** a Central Health & Safety administrator, **then** the Health & Safety lists are Standards,
   Hazards, Diseases, Body Part Categories, Body Parts and Injuries; Industrial Risk shows Standards and
   Hazards read-only, not Diseases. (MD-1)
2. **Given** a Cluster administrator of plants A and B creating Hazard "Z1 — Forklift traffic", **then**
   it is owned by "Cluster A, B", available at A and B, not at C; a second "Z1" by them is refused.
   (MD-5, MD-7, MD-10)
3. **Given** a Local administrator of plant A, **then** they cannot create values, but can deactivate a
   Central value for plant A; they cannot reactivate a value a Cluster deactivated. (MD-7, MD-9)
4. **Given** Central deactivating the Body Part Category "Head", **then** its body parts are no longer
   available, and saving one of them Active is refused. (MD-5, MD-10)
5. **Given** Central creating the Injury "Frostbite" without a body part, **then** it is refused with
   "Choose at least one body part."; with Fingers and Toe(s) it is added. (MD-4, MD-5)
6. **Given** an import file where one row repeats a code, **then** nothing is imported and the line is
   listed. (MD-13)
