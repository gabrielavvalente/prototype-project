# Proposals Log

Ideas raised in workshops that are **not yet in the BRD**. This file is an index only: each entry records the proposal, its source, its status, and where its full write-up lives. The feature file is the single home of each proposed story's full text and acceptance criteria.

Nothing here is committed scope. Proposed stories carry a 🟡 marker in the feature files and are excluded from all MVP counts in the [README](README.md).

---

## 2026-07-30 — Roles, Master Data Governance, Mobile Patterns

**Participants:** workshop contributor, workshop contributor. Input referenced from workshop contributor and workshop contributor.

---

### P-01 — Three-Tier Master Data Governance

- **Summary:** Replace the BRD's single administrative tier with three (Central/Corporate, Business/Regional/Country/Cluster, Plant), each self-declaring its perimeter — and make most master data non-configurable at plant level, since standards, hazards and body parts are EHS-defined concepts a plant should not redefine.
- **Source:** Workshop [date generalized] (Danklou, workshop contributor; input from workshop contributor and workshop contributor).
- **Status:** 🟡 Proposed, candidate for BRD v1.1.0. ⚠️ Contains two direct conflicts with BRD v1.0.0 (Related Hazards plant scope; Body Part custom sub-parts) and open questions on precedence, self-declaration control, role-model impact and migration — all detailed in the feature file, which must be resolved before build.
- **Written up in:** [Configuration and Administration](10-configuration-and-administration/Configuration%20and%20Administration.md) — stories `US-CFG-07` … `US-CFG-10`, plus the conflicts table and open questions.
- **Also touches:** [Global Shell](01-global-shell/Global%20Shell.md) (US-SHELL-02 role matrix).

Proposal-level context (recorded nowhere else):

| Tier | Who | Perimeter |
|---|---|---|
| **Central / Corporate** | Corporate EHS | Self-declared: businesses, regions, countries, clusters or plants |
| **Business / Regional / Country / Cluster** | Business or regional EHS | Self-assigned plants within their dimension |
| **Plant (Site Admin)** | Local plant admin | Their own plant — but only the entities that genuinely vary locally |

The workshop decided four classifications (Standards, Hazards, Body Parts → fixed; PPE, Job Function → plant-editable, per workshop contributor's counterpoint that some entities genuinely are local). The remaining seven §11.2 entities were classified speculatively in US-CFG-10 and need confirmation.

---

### P-02 — Mobile Interaction Patterns from the internal prototype Prototype

- **Summary:** Adopt three patterns from workshop contributor's internal prototype mobile prototype for one-handed phone submission — sectioned submission, bottom-sheet lookups dismissed by tapping outside, and a conditional skip of action steps — as a concrete answer to US-CREATE-10's three-minute target.
- **Source:** Workshop [date generalized] (workshop contributor's internal prototype prototype demo).
- **Status:** 🟡 Proposed. ⚠️ One inference needs confirming: the internal prototype skip is unconditional, but Event Reporting's mandatory-action rules (TF1–TF3, SRE1–SRE3) are assumed to override it (US-CREATE-14 AC-4) — not a workshop decision. Also to confirm: that the patterns transfer to Event Reporting rather than staying internal prototype-specific. workshop contributor to review the countermeasures and actions screens with workshop contributor — agreed in the workshop for the week of [date generalized].
- **Written up in:** [Event Creation](03-event-creation/Event%20Creation.md) — stories `US-CREATE-12` … `US-CREATE-14`.

---

### Status of workshop contributor's internal prototype Work

Reported as in-flight, not proposals — recorded here for tracking only:

| Item | Status as of [date generalized] |
|---|---|
| Sectioned submission screen | Done |
| Submit internal prototype | Done |
| Review screen (incl. corrective-action question) | Done |
| Countermeasures | In progress — building on workshop contributor's actions work |
| Validation screen | Not started |
| Mobile pop-ups (filters, notifications, lookups) | Not started — last item before mobile is complete |

---

## Conventions

| Marker | Meaning |
|---|---|
| 🟡 | Proposed — in a feature file but not ratified, excluded from MVP counts |
| ⚠️ | Conflict with the BRD, or an inference made while writing up that needs confirming |
| ✅ / ❌ in "Decided?" columns | Whether the workshop actually decided it, or it was inferred |

When a proposal is ratified: remove its 🟡 markers, fold it into the feature's main story list and scope, update the README counts, and strike the entry here with its BRD version.
