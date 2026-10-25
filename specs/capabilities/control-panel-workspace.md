# Capability: Control Panel workspace

**Product**: Control Panel
**Builds on**: [domain](../domain.md) (Control Panel roles), [platform data](platform-data.md)
**Status**: built

The frame every Control Panel page lives in: who may enter, choosing a pillar, the tabs, the
notifications, the audit trail and the search.

## Rules

- **CPW-1 Access**: only people with a Control Panel role can use the Control Panel; for anyone
  else every page shows a permission message. A role on one pillar gives no right on another
  pillar.
- **CPW-2 Pillars**: after signing in, "Hello, <first name>" lists only the pillars the person holds
  a role on, each with their level and plants ("Central · All plants", "Cluster · Lyon, Porto",
  "Local · Lyon"). Choosing one opens its Workflow tab.
- **CPW-3 Context and tabs**: every pillar page shows a context bar (pillar with its color, level
  badge, plants) and three tabs: **Workflow**, **Master data**, **Audit**.
- **CPW-4 Header**: "Control Panel" (back to the pillars), a search box ("Search pillars and master
  data"), the notifications bell with the number of unread ones, and the avatar to switch person.
- **CPW-5 Notifications**: the bell opens the person's notifications, newest first, each with its
  text and date; unread ones are marked; closing the panel marks them all read. They are read
  again on every page change. (Notifications are raised by
  [workflow settings](workflow-settings.md).)
- **CPW-6 Audit**: the Audit tab lists every workflow and master data change of the pillar, newest
  first: when, who, level and plants ("Central", "Cluster Lyon, Porto"), what (e.g. "TF2 · Review"
  or the value), the change (Made Required, Made Optional, Changed, Added, Edited, Deactivated,
  Reactivated, Retired) and "before → after". Filters **What** (Everything, Workflow, each
  editable list of the pillar) and **Who** (Everyone, each author), with the number of changes
  shown. Every change and its audit entry are saved together: one is never saved without the
  other.
- **CPW-7 Search**: searching shows, across the person's pillars only, matching pillars (open the
  Workflow tab), master data lists and values (open the list, filtered by the search); at most 60
  results.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md).

1. **No role** — Ana Ribeiro is shown disabled on the Control Panel start screen and cannot be
   chosen. (CPW-1, platform data PD-7)
2. **Pillars** — Lucas Weber sees Health & Safety and Environment, each "Cluster · Lyon, Porto";
   Eva Novak sees the four pillars as "Local · Lyon". (CPW-2)
3. **Tabs** — Ludovic Costa opens Health & Safety: context bar "Health & Safety", "Central", "All
   plants"; tabs Workflow, Master data, Audit. (CPW-3)
4. **Audit** — After Lucas makes TF2 Root cause analysis Required, Ludovic's H&S Audit shows "Made
   Required", "Cluster Lyon, Porto", "TF2 · Root cause analysis", "Optional → Required"; filtering
   Who = Lucas Weber keeps only his changes. (CPW-6)
5. **Search** — Lucas searches "hazard": the Health & Safety Hazards list (and any matching
   values); nothing from Industrial Risk, where he has no role. (CPW-7)
