# Capability: Event Reporting shell

**Product**: Event Reporting
**Builds on**: [domain](../domain.md) (roles, visibility, context), [platform data](platform-data.md)
**Status**: built

The frame of Event Reporting: choosing where to work, the header and navigation, alerts and search.

## Rules

### Context

- **ES-1** After signing in, **Where would you like to start, <first name>?** shows "Choose a pillar
  to see events for <plant>.", one card per pillar the person can see at the current plant, and
  "Need to see everything? Browse events across all pillars you can access." with **Browse all
  pillars**. Choosing opens the event list in that context (domain Visibility: one pillar, or all).
- **ES-2** The first context is the person's first plant of access; afterwards the last context is
  remembered for each person on the device.
- **ES-3** With a pillar, new events are created in it (its pillar step is skipped); with all
  pillars, creation starts with the pillar.
- **ES-4** Every list, count, search result and event is limited to the context; an event outside
  it, opened by link, shows "Event not found.".

### Header and navigation

- **ES-5** The header: a Home icon to all applications, **Event Reporting** (opens the event
  list), a search field "Search events by title or record number" (an icon on phones), the
  notifications bell with the number of unread alerts, and the avatar.
- **ES-6** The avatar opens **Account**: name and role, **Business** (only with access to several),
  **Plant** (each with its type icon and country flag), the pillar with **Change pillar** (back to
  the start screen) and **Switch user**. Changing business or plant with unsaved changes in the
  form asks "You have unsaved changes in the form. Change anyway? Your changes will be lost.".
- **ES-7** On phones a bottom bar offers **Home** (start screen), **Events** and a floating **New**
  (only for those who can report).
- **ES-8** The navigation follows the role; a page outside the role, opened by link, says "You do
  not have permission to open this page.":

  | Item | User | Manager | Site Admin |
  |---|:---:|:---:|:---:|
  | Events | ✓ | ✓ | ✓ |
  | Create event | ✓ | ✓ | — |
  | Alerts (bell) | ✓ | ✓ | — |

### Alerts

- **ES-9** The bell opens **Notifications**: the person's alerts about events of the current
  context (the others show when the person switches to their plant or pillar), newest first, each with its event
  and type and a relative time ("just now", "5 min ago", "2h ago", "3d ago", then the date);
  unread ones are marked "Unread". Opening one opens its event and marks it read; **Mark all read**
  marks them all. Empty: "No notifications yet.".

### Search

- **ES-10** Searching opens **Search events**: live results within the context — titles containing
  the text, or the event whose record number is exactly the text (ignoring case) ("No event matches your search"), each with its record number (or "Draft") and pillar;
  pressing Enter on an exact record number opens that event. Without a search it shows the
  person's last 5 searches, kept on the device ("Your last searches will appear here."). **Cancel**
  goes back.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md).

1. **Start** — Carla Mendes signs in: "Where would you like to start, Carla?", four pillar cards
   for Lyon and Browse all pillars. She chooses Environment: the list shows only Lyon
   Environment events; Create event opens with Environment and its only family already chosen,
   starting at the level. (ES-1, ES-3)
2. **Remembered context** — Carla switches user and signs in again: the start screen is for Lyon
   with Environment marked as her current pillar. (ES-1, ES-2)
3. **Account** — Diego Laurent's Account offers Business (Automotive Parts, Packaging); choosing
   Packaging switches to Porto. Ana Ribeiro's Account shows no Business choice. (ES-6)
4. **Role navigation** — Eva Novak (Site Admin) has no Create event, no New and a disabled bell;
   opening the new event address says "You do not have permission to open this page.". (ES-7,
   ES-8)
5. **Scope** — In Curitiba, Felix Tanaka opens the address of a Lyon event: "Event not found.".
   (ES-4)
6. **Alerts** — Carla's bell shows her unread "Event submitted" alerts; opening one opens the event
   and marks it read; Mark all read clears the count. (ES-9)
7. **Search** — Carla searches "TF-26-0003" and presses Enter: the event opens. Searching "spill"
   lists "Coolant spill reached rain drain". Back on Search, her last searches are listed. (ES-10)
8. **Phone and keyboard** — At 320px the search is an icon and the bottom bar shows; every header
   control works with the keyboard. (Domain)
