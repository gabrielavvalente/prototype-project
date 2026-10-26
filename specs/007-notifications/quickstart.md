# Quickstart: Notifications

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

```bash
cd launcher && npm run dev                                   # http://localhost:5173/
cd apps/event-reporting && npm test && npm run build
cd apps/control-panel && npm test && npm run build           # runs shared/platform tests too
```

1. Open Event Reporting through the launcher and press **Reset demo data** (the platform database
   upgrades to version 2 on first open; nothing else is lost).
2. Run the spec's acceptance scenarios in order ([spec.md](spec.md#acceptance-scenarios)):
   1–8 in Event Reporting switching people from the avatar; 9 in My notifications; 10–12 with Eva
   Novak and Carla Mendes in the Control Panel; 13–14 back in Event Reporting.
3. Check both new pages at 320px and with the keyboard, with a clean browser console.
