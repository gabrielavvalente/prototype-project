# Specs

- **[domain.md](domain.md)** — the shared vocabulary, entities and rules, and the map of
  capabilities in build order.
- **[capabilities/](capabilities/)** — one file per business capability, describing the product as
  it behaves now. Together with the domain, they are what a new project reuses to rebuild the
  product. Template: [`.specify/templates/capability-template.md`](../.specify/templates/capability-template.md).
- **`NNN-name/`** — one Spec Kit folder per change (spec, plan, tasks…). The spec describes the
  change to the capabilities; its last task applies it to them. The folders are history and are
  not updated afterwards. 001–004 predate this format: their specs describe whole features and are
  superseded by the capability files.

Rules: [constitution, Development Workflow](../.specify/memory/constitution.md).
