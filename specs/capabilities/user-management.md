# Capability: User Management

**Product**: User Management
**Builds on**: [domain](../domain.md) (roles, visibility), [platform data](platform-data.md),
[workflow settings](workflow-settings.md) (reviewers)
**Status**: built

A read-only directory of the people and investigation groups within an administrator's perimeter:
who can report and see what, and who administers what.

## Rules

- **UM-1** Only people with a Control Panel role can use User Management (others: "You don't have
  access to this page."). The header is the platform's (Home to all applications, search, the
  Control Panel notifications, the avatar to switch person). Nothing can be edited anywhere.
- **UM-2** Two tabs: **Users** and **Groups**.

### Users

- **UM-3** The users the person may see (domain Visibility), in a table: Name, Event role, Plants,
  Pillars (in their colors), Control Panel roles (a badge per role: pillar color and level; roles
  coming from Site Admin marked "From the event role Site Admin"), with the number of users shown.
- **UM-4** **Find users**: Search by name ("e.g. Felix Tanaka"), Plant (All plants), Pillar (All
  pillars) and Role (All roles; event roles User, Manager, Site Admin, or Control Panel levels
  Central, Cluster, Local); "No users match these filters" when empty. A plant or pillar matches
  through event access or a Control Panel role.
- **UM-5** Opening a user shows, beside the list, their **Event access** ("Plants and pillars
  available in event reporting"), their **Control Panel roles** ("Administrative scope by pillar":
  pillar, level, plants) and their **Review groups** ("Workflow stages where this person is listed
  as a reviewer": pillar, level code, phase, "Set at <Level> for <plants>"). Empty sections say
  "Cannot report or see events.", "No Control Panel role." and "Not a reviewer in any workflow
  setting.". An unknown user shows "This user does not exist."; a user outside the perimeter "You
  don't have access to this user.". On narrow screens the detail replaces the list, with a link
  back.

### Groups

- **UM-6** **Investigation groups**: the groups the person may see (domain Visibility), with Name,
  Pillars (tags), Plants and Members (each with their event role), and the number shown; "No group
  covers your plants." when none. The groups are the demo data's ([platform data](platform-data.md)).

## Acceptance scenarios

From freshly reset [demo data](platform-data.md).

1. **Central** — Ludovic Costa sees all 12 users and the 4 groups. (UM-3, UM-6)
2. **Local perimeter** — Carla Mendes (Local Lyon) sees 9 users: everyone linked to Lyon,
   including the Central administrators and Pascal Fischer (Cluster Lyon, Curitiba), but not Ben
   Okafor, Felix Tanaka or Gina Rossi. (UM-3)
3. **Groups perimeter** — Lucas Weber (Cluster Lyon, Porto) sees the groups of Lyon and Porto (Lyon
   H&S investigation team, Cluster electrical safety team, Porto environment team), not the
   Curitiba EHS team. (UM-6)
4. **Filters** — Ludovic filters Role = Site Admin: Eva Novak only; Role = Cluster: Lucas Weber and
   Pascal Fischer; Plant = Curitiba: Ben Okafor, Felix Tanaka, Pascal Fischer and the Central
   administrators. (UM-4)
5. **Site Admin roles** — Eva Novak's row shows four Local role badges marked "From the event role
   Site Admin". (UM-3)
6. **Detail** — Opening Carla shows Event access Lyon (all pillars), Control Panel role Local Health
   & Safety (Lyon) and 16 review groups (Review of TF1–TF4, EvE1–EvE4, SRE1–SRE4 and the four
   disease types, all "Set at Central for all plants"). Opening Ludovic shows "Cannot report or see
   events." and no review group. (UM-5)
7. **Read only** — No screen offers an edit action. (UM-1)
8. **Phone and keyboard** — At 320px opening a user replaces the list with the detail and a link
   back; filters and rows work with the keyboard. (UM-5, Domain)
