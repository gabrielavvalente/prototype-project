# Routes: Notifications

**Spec**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

| App | Route | Who | Content |
|---|---|---|---|
| Event Reporting | `#/notifications` | every event role | My notifications: Always on, Information switches (NT-4, NT-5); opened from Account |
| Control Panel | `#/notifications/:plantId` → `#/notifications/:plantId/rules` | Site Admins of the plant | Tabs Submission rules (NT-7), People (NT-10), Changes (NT-11) |
| Control Panel | `#/notifications/:plantId/people/:userId` | Site Admins of the plant | One person's switches (NT-10) |

Anyone else opening a Control Panel notifications route sees "You do not have permission to open
this page." (NT-6). Every page sets `document.title` ("My notifications", "Notifications · Lyon").
