# 16 — Open questions

What the prototype did not have to decide, and what was deliberately left for later. Each needs an
answer (or an explicit "not in this version") before the matching part is built.

## The platform

- **Q-1 Sign-in**: the prototype had no login. Which identity provider (company single sign-on?),
  and what happens to a person who signs in with no event role and no Control Panel role?
- **Q-2 Organization source**: people, roles and groups come from the user management tool the
  development team builds ([01](01-roles-and-permissions.md)). Where does the organization tree
  (business to task, plant type, country, region) come from, and who maintains it?
- **Q-3 Server-side enforcement**: every permission of [01](01-roles-and-permissions.md) must also
  be enforced by the back end, not only hidden in the interface.
- **Q-4 Data retention and archiving**: how long are events, attachments, the audit trail and the
  Record Historian kept; can anything be deleted, by whom?
- **Q-5 Personal data**: events hold names (reporter, people involved, assignees) and may hold
  health information (injuries, diseases). Who may see what, what is anonymised beyond the Safety
  Alert and Warning, and which privacy rules apply per country?
- **Q-6 Attachments**: allowed types, maximum size and number, virus scanning, storage.
- **Q-7 Migration**: are events from the current tools (e.g. GAIA, mentioned in the immediate
  action types) imported, and how are their statuses and levels mapped?
- **Q-8 Non-functional targets**: number of users and events, response times, availability,
  supported browsers and devices (the prototype required phone width from 320px and keyboard use),
  accessibility level.
- **Q-9 Languages**: the language selector (OV-3) offers which languages? Are master data values,
  level descriptions and the questions of the analysis translated too, and how are event texts
  written in one language read in another (e.g. a shared Safety Warning)?

## Alerts and integrations

- **Q-10 Email and other channels**: alerts exist only inside the product. Are they also sent by
  email or Teams, with immediate, daily or weekly digests, and with which template?
- **Q-11 Action management tool**: alerts about individual actions (assigned, changed, cancelled,
  overdue) were expected from an action management tool. Is there one to integrate with, or does
  this product send them?

## Features left out of the prototype

- **Q-12 Deleting a draft**: a draft can only be continued; should its author be able to delete it?
- **Q-13 Root cause analysis**: the risk-assessment gap question, related hazards, attachments in
  the analysis, export or print of the 5 Why diagram, the Behavioral / Conditional classification
  of root causes.
- **Q-14 Safety communication**: a PDF export other than printing, sending to a regional
  governance office or by email, documents for Occupational Health events, unpublishing or republishing a
  Warning, alerts about communications.
- **Q-15 Sharing Hub**: subscriptions (by hazard, family, level, standard), clusters as a reach,
  sharing the Safety Alert, unsharing or editing a shared package, creating a local event from a
  shared one, alerts about local actions, translation of packages.
- **Q-16 Validation and governance**: a separate Final Review step, effectiveness checks some time
  after closing, the Attackability score and risk prioritisation, a Final Risk Score.
- **Q-17 Record Historian**: export of the log.
- **Q-18 Diseases**: the Health & Safety Diseases list exists but is not yet asked on any event;
  is it the list Occupational Health events use (instead of their own fixed diseases)?
- **Q-19 Investigation groups**: they come from the user management tool; who in the business
  maintains them?
- **Q-20 Not taken from the master data workbook**: Risk Families, Circumstances and Type of
  Immediate actions — confirm they are not needed.

## Open definitions

- **Q-21** The Environment SIP types were marked provisional by the business; confirm the list in
  [Reference catalogs](14-reference-catalogs.md). (HCL and SPL are a Yes / No answer of the
  reviewer, with no type and no loss matrix.)
