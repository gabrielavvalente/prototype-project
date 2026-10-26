# Quickstart: Event Sharing Hub

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

```bash
cd launcher && npm run dev                                 # http://localhost:5173/
cd apps/event-reporting && npm test && npm run build
cd apps/control-panel && npm test                          # runs shared/platform tests too
```

1. Press **Reset demo data**, then publish the Safety Warning of `TF-26-0002` as in safety
   communication scenarios 5–7.
2. Run the spec's acceptance scenarios in order ([spec.md](spec.md#acceptance-scenarios)), switching
   people (Diego Laurent, Eva Novak, Carla Mendes, Ana Ribeiro, Lucas Weber, Gina Rossi, Felix
   Tanaka) and plants from the avatar.
3. Check the pages at 320px and with the keyboard, with a clean browser console.
