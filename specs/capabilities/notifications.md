# Capability: Notifications

**Product**: Event Reporting (alerts, My notifications) and Control Panel (a plant's Notifications page)
**Builds on**: [domain](../domain.md) (roles, Visibility, Alerts and notifications), [event reporting](event-reporting.md), [event review](event-review.md), [root cause analysis](root-cause-analysis.md), [action plan](action-plan.md), [validation](validation.md), [Event Reporting shell](event-reporting-shell.md), [Control Panel workspace](control-panel-workspace.md)
**Status**: built

Who is alerted at each stage of an event's lifecycle; each person chooses the information alerts
they receive, and a Site Admin decides who else hears about submitted events and can change the
choices of the people of their plant.

## Scope

- **In**: the lifecycle alerts and who gets them, work and information alerts, My notifications,
  the Site Admin's submission rules, people's settings and changes.
- **Out**: email, digests (immediate, daily, weekly) and the email template; action-level alerts
  (assigned, changed, cancelled, overdue), which the action management tool sends; the Safety
  Warning, Final Review and Rework alerts (later capabilities); choosing pillars or event
  categories in My notifications; Site Admin rules for other alerts than "Event submitted";
  deep-link authorisation (alerts open only inside the product, which already checks visibility).

## Rules

### Alerts

- **NT-1** An **alert** goes only to people who can see the event (domain Visibility) and who have
  an event role; a draft never raises one. When one action would raise several alerts for the
  same person on the same event, they get one: an alert that hands them work first, otherwise the
  one of the latest stage in NT-3 (e.g. a review that closes the event gives the reporter "Event
  closed", not "Your event was reviewed"); when the person turned that one off, they get none.
  "Shared event received" is the exception: it goes to the Site Admins and Managers of each plant
  a Safety Warning was shared with, who cannot see the event itself
  ([sharing hub](sharing-hub.md) SH-6).
- **NT-2** Alerts are of two kinds. **Work** alerts hand the person something to do and are always
  raised: "Event to review", "Root cause analysis assigned to you", "Action plan ready for
  validation", "Action plan not effective" (to the plan owners). **Information** alerts are all the
  others; they skip the person who did the action ("Event submitted" excepted: it also goes to the
  Manager who reported the event) and are raised only when the person has them on (NT-5).
- **NT-3** The alerts:

  | Stage | When | Alert | To |
  |---|---|---|---|
  | Submission | Submitted, Review required | "Event to review" (work) | The event's reviewers |
  | Submission | Submitted | "Event submitted" | The Managers who see the event and are not its reviewers; the people of the matching submission rules (NT-9) |
  | Submission | Submitted by someone else than its reporter | "Event reported on your behalf" | The reporter |
  | Submission | Submitted with Shared with people | "Event shared with you" | Each Shared with person |
  | Review | A reviewer takes the review | — the other reviewers' "Event to review" for this event disappear; the taker's is marked read | — |
  | Review | Valid | "Your event was reviewed" | The reporter |
  | Review | Not valid | "Event archived (<reason>)" | The reporter, the Shared with people and the other reviewers |
  | Review | Root cause analysis next | "Root cause analysis assigned to you" (work) | Each designated user and member of a designated group, never the reviewer |
  | Root cause analysis | Started on its optional step ([root cause analysis](root-cause-analysis.md) RCA-18) | "Root cause analysis assigned to you" (work) | Each designated user and member of a designated group, never the person who started it |
  | Root cause analysis | Completed | "Root cause analysis completed" | The reporter and the reviewer |
  | Actions | Plan deployed | "Action plan deployed" | The reporter and the reviewer |
  | Actions | Plan completed, Validation next | "Action plan ready for validation" (work) | The validators |
  | Actions | Plan completed | "Action plan completed" | The reporter |
  | Validation | Not effective | "Action plan not effective" | The plan owners (work) and the reporter (information) |
  | Closure | Closed at Review, Root cause analysis, Actions or Validation | "Event closed" | The reporter and the Shared with people |
  | Sharing | A published Safety Warning is shared | "Shared event received" | The Site Admins and Managers of each plant reached, not the person who shared |

  An event closed at submission raises no "Event closed" (its reporter sees it closed on the
  screen). Nothing is raised about single actions (assigned, changed, cancelled, overdue): the
  action management tool notifies those.

### My notifications

- **NT-4** **My notifications** (from the avatar, Account) shows two parts. **Always on**: the work
  alerts, with "These alerts hand you work and cannot be turned off.". **Information**: one switch
  per information alert, with what it tells:

  | Alert | Hint |
  |---|---|
  | Event submitted | "An event is submitted in your plant and pillars." |
  | Event reported on your behalf | "Someone reported an event in your name." |
  | Event shared with you | "Someone shared an event with you." |
  | Your event was reviewed | "An event you reported was reviewed as valid." |
  | Event archived | "An event you reported, that was shared with you or that you could review was archived." |
  | Root cause analysis completed | "The analysis of an event you reported or reviewed was completed." |
  | Action plan deployed | "The action plan of an event you reported or reviewed was deployed." |
  | Action plan completed | "The action plan of an event you reported was completed." |
  | Action plan not effective | "On an event you reported. Plan owners always get it." |
  | Event closed | "An event you reported or that was shared with you was closed." |
  | Shared event received | "A safety lesson was shared with your plant." |

  Every switch is on until someone turns it off. A change applies at once ("Saved.") to the
  alerts raised afterwards; alerts already received stay.
- **NT-5** Each information setting of a person has one value, set by whoever changed it last: the
  person or a Site Admin of one of their plants. When the last change was a Site Admin's, the
  switch shows "Set by <name> on <date>"; when the person changes it again, the line goes.

### Site Admins

- **NT-6** A **Site Admin** (event role) manages the notifications of each plant of their access:
  on the Control Panel start screen, below the pillars, one card **Notifications** per plant
  ("Notifications · Lyon") opens the plant's **Notifications** page with three tabs: **Submission
  rules**, **People**, **Changes**. Nobody else sees the cards; the page opened by link says "You don't
  have access to this page." (CPW-1).
- **NT-7** **Submission rules**: one section per pillar the Site Admin sees at the plant, listing
  its rules ("Levels: TF1, TF2 · Departments: Logistics · People: Ana Ribeiro") with edit and
  delete icons, and **Add rule**. A rule has **Levels** (one or more of the pillar's levels; disease
  types for Industrial Hygiene), **Departments** (one or more of the plant's departments, or none
  for "All departments") and **People** (one or more people with an event role who can see the
  plant and pillar). Saving with something missing is refused next to the field: "Choose at least
  one level." · "Choose at least one person.". Deleting asks "Delete this rule?".
- **NT-8** Adding a person to a rule turns their "Event submitted" on (a Site Admin change, NT-5).
- **NT-9** When an event is submitted, every rule of its plant and pillar whose levels include its
  level and whose departments include its location's department (or are all) sends "Event
  submitted" to its people (one copy per person, NT-1). Rules act on events submitted after they
  are saved.
- **NT-10** **People**: the people with an event role whose access includes the plant, with their
  role; choosing one shows their Information switches (NT-4) with any "Set by" line, which the Site
  Admin changes like the person would ("Saved."). The Always on part is shown, read-only.
- **NT-11** **Changes**: every change of the page, newest first: when, who, what ("Health & Safety
  rule", "Ana Ribeiro · Event closed"), the change (Added, Edited, Deleted, Turned off, Turned on)
  and "before → after". Each change and its entry are saved together.

## Acceptance scenarios

From freshly reset [demo data](platform-data.md), in order.

1. **Demo alerts** — Carla Mendes at Lyon, all pillars: the bell shows 2 unread, "Event to review"
   for `SRE-26-0004` and "Event submitted" for `TF-26-0007`. Eva Novak's shows 1, "Event to review"
   for `SRE-26-0004`. (NT-3, Demo data changes)
2. **Submission** — Ana Ribeiro submits a TF3 at Lyon, department Logistics. *Then* Carla, Eva and
   Diego Laurent each get "Event to review" (Carla's bell 3 unread); Lucas Weber gets "Event
   submitted"; Ana gets nothing; the banner reads "Its reviewers and the Managers of this plant
   have been alerted.". (NT-1, NT-2, NT-3, ER-18, ER-19)
3. **Taking the review** — Carla takes the review of that event. *Then* Eva's and Diego's "Event
   to review" for it are gone; Carla's is read. (NT-3, ES-9)
4. **On behalf** — Carla reports a TF4 at Lyon with reporter Ana. *Then* Ana gets "Event reported
   on your behalf"; Carla gets "Event to review" (she is one of its reviewers). (NT-2, NT-3)
5. **Reviewed** — Carla reviews `TF-26-0003` as valid (next step Actions). *Then* Ana gets "Your
   event was reviewed". (NT-3)
6. **Closed at review** — Carla reviews `TF-26-0006` (TF4, Review only) as valid, below Very
   Critical. *Then* the event is Closed and Ana gets "Event closed" only. (NT-1, NT-3)
7. **Analysis and plan** — Carla reviews `TF-26-0002` as valid, Potential Severe × Medium term
   (SIP, type chosen), "further analyze" Yes, designating Diego. Diego completes the analysis. *Then* Ana and Carla get "Root cause analysis
   completed". Diego adds a corrective action for Ana and deploys the plan. *Then* Ana and Carla
   get "Action plan deployed", and nobody gets an alert about the action. Ana completes it: the plan
   completes and the event closes (no Validation for TF3). *Then* Ana gets nothing (she did it) and
   Carla gets nothing more. (NT-2, NT-3, AP-9, AP-12)
8. **Not effective** — Diego reviews `TF-26-0005` (TF1, Lyon: Actions and Validation required,
   reporter Carla) as valid, Potential Severe × Long term (SIP, type chosen), "further analyze"
   Yes, designating Ana. Ana completes the analysis, adds a corrective action for herself, deploys
   the plan and completes the action. *Then* Diego, its validator, gets "Action plan ready for
   validation" and Carla gets "Action plan completed". Diego answers No ("Rack still unstable").
   *Then* Ana gets "Action plan not effective" and Carla too. (NT-3, VAL-4)
9. **My notifications** — Ana opens Account › My notifications. *Then* Always on lists the four
   work alerts with "These alerts hand you work and cannot be turned off."; Information has 11
   switches, all on. She turns off "Event closed" ("Saved."). Carla reviews `TF-26-0001` (TF4,
   Review only) as valid: it closes. *Then* Ana gets no alert. (NT-1, NT-4)
10. **Site Admin sets, person overrules** — In the Control Panel, Eva opens "Notifications · Lyon"
    › People › Ana Ribeiro and turns off "Your event was reviewed". *Then* Ana's My notifications
    shows it off with "Set by Eva Novak on <today>"; Changes shows "Ana Ribeiro · Your event was
    reviewed", "Turned off", "On → Off". Ana turns it on again: the "Set by" line goes. (NT-5,
    NT-10, NT-11)
11. **Submission rule** — Eva adds a Health & Safety rule: Levels TF1, TF2; Departments Logistics;
    People Ana Ribeiro. Saving without people is refused with "Choose at least one person.". Then
    Carla submits a TF2 in Logistics: Ana gets "Event submitted"; a TF2 in Assembly or a TF4 in
    Logistics gives her nothing. (NT-7, NT-8, NT-9)
12. **Who can configure** — Carla (Local H&S Lyon, a Manager) has no Notifications card in the
    Control Panel; opening the Lyon notifications page by link says "You don't have access to this
    page.". (NT-6, CPW-2)
13. **Drafts** — Ana saves a draft: nobody gets an alert. (NT-1)
14. **Reset** — Reset demo data in Event Reporting. *Then* Eva's Lyon rule is gone, Ana's switches
    are all on without "Set by", and Changes is empty. (PD-3, PD-5)

## Decisions

| Topic | Decision | Sources |
|---|---|---|
| Reporter feedback | The reporter is told at every stage: reviewed, archived, analysis completed, plan deployed, plan completed, plan not effective, closed | Notifications FR-1 tells the Owner, not the reporter; Safety / Environment tell the reporter only at closure and archive |
| Critical events | No alert of their own; they reach only the people related to the event through the other alerts | Safety Warning to the governance office (Safety Communication, later) |
| Action-level alerts | None from Event Reporting: the action management tool has its own notifications | Notifications FR-1: Action assigned, Action overdue |
| Who acted | Information alerts skip the person who did the action; alerts that hand work and "Event submitted" do not | — |
| Review alert to several reviewers | Cleared for the others once one reviewer takes the review | Notifications US-NOT-03 (claim and release) |
| What a person can turn off | Information alerts only; alerts that hand work are always on | Notifications open question (mandatory vs optional) |
| Site Admin configuration | Submission rules per pillar, and the information settings of the people of their plant | Notifications US-NOT-02 (submission rules), US-NOT-04 (preferences) |
| Person vs Site Admin | The person sees what a Site Admin set and can overrule it; the latest change wins | — |
| Where | "My notifications" in Event Reporting; the Site Admin's settings in the Control Panel | Notification Settings entry point (Global Shell, deferred) |
| Channel | In-app alerts only | Email + My Alerts (needs a server) |
