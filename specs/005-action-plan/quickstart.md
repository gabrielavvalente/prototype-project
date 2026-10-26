# Quickstart: Action plan

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

```bash
cd launcher && npm run dev                  # http://localhost:5173/
cd apps/event-reporting && npm test && npm run build
```

1. Open Event Reporting through the launcher and press **Reset demo data** (demo data is per
   browser; old analyses and actions are converted when opened).
2. Run the spec's acceptance scenarios 1–12 in order ([spec.md](spec.md#acceptance-scenarios)):
   1–7 on `TF-26-0005`, 8 on `TF-26-0002`, 9 after the root cause analysis scenarios on
   `TF-26-0003`, 10 right after scenario 3.
3. Check at 320px wide and with the keyboard, with a clean browser console.
