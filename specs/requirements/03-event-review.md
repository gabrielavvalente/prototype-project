# 03 — Event review

One of the event's reviewers takes a submitted event, decides whether it is valid, rewrites its
statement for sharing, classifies it, assesses its severity, and sends it to its next step or
archives it. The review is the only place an event becomes critical.

Builds on: [00 Overview](00-overview.md) (lifecycle, steps, critical events, master data),
[01 Roles and permissions](01-roles-and-permissions.md), [11 Workflow settings](11-workflow-settings.md)
(reviewers, critical row), [12 Master data](12-master-data.md).

## Rules

### Taking the review

- **RV-1** The reviewers of an event are those its workflow kept at submission (OV-10). The plant's
  Site Admins may also review it (RP-8a).
- **RV-2** While nobody has taken it, the event is "waiting for a reviewer"; a reviewer can **assign
  themself** ("Assign yourself to review it. The other reviewers will no longer be able to."); others
  see who the reviewers are. Looking at the review changes nothing.
- **RV-3** Assigning oneself sets the event **In Progress**. From then on only that reviewer (and the
  plant's Site Admins) completes the review; the others are told "<name> is reviewing this event."
  (reviewers: "Only the assigned reviewer can complete the review.").

### The decision

- **RV-4** "Is this a valid event?" Yes / No.
- **RV-5** **No** ("Not valid: a duplicate, not useful, or of bad quality. It will be archived."):
  "Why is it not valid?" — Duplicated, Useless, Bad quality; Bad quality also asks "What makes the
  report of bad quality?" (required). The event is **Archived** (final), with the archiving alerts
  ([10](10-alerts-and-notifications.md)); its steps after Review stay "Not reached yet".
- **RV-6** **Yes** asks, in this order:
  1. **Event statement and classification** — the event statement, starting from the reported
     description ("Starts from the reported description: rewrite it to be shared. Do not name the
     reporter."), and the classification lists the event's level requires (RV-7), all required,
     each offering only the values available at the event's plant (OV-12). Standards and Hazards
     take one value each; the other lists one or more.
  2. **The severity assessment** of the event's type (RV-7 to RV-9).
  3. **Next step** — who will perform the root cause analysis, asked only when the event goes to
     Root cause analysis (RV-10, RCA-1).
- **RV-6a** **Injuries** offer, for each chosen Body Part, the injuries that apply to it
  ([12](12-master-data.md) MD-4) and are available at the plant. An injury is chosen **for a body
  part**: "Ear: Bruise" and "Fingers: Bruise" are two answers, and are named so wherever the review
  is shown or shared. Before a body part is chosen no injury can be chosen ("Choose the body parts
  first."); removing a body part removes the injuries chosen for it.

### What each event type assesses

- **RV-7**

  | Event type | Required lists | Assessment |
  |---|---|---|
  | Safety (TF) | TF1–TF3: Standards, Hazards, Body Parts, Injuries · TF4–TF5: Standards, Hazards | **Potential severity** (TF1–TF4) and **Actual severity** (TF1–TF3) on the injury matrix (RV-8) |
  | Occupational Health (OH) | — | — |
  | Environment (EVE) | Aspects, Impacts | "Is this event a SIP?" ("Serious Incident Potential: could it have caused serious harm under slightly different circumstances?"), starting from the reporter's answer |
  | Industrial Risk (SRE) | Categories | SRE1–SRE3: "Is this event an HCL?" ("High Consequence Loss: a real event with actual consequences — a major loss for the Group.") · SRE4–SRE5: "Is this event an SPL?" ("Serious Potential Loss: a near miss or moderate event whose potential severity is a weak signal before a major loss.") — Yes / No, nothing chosen at first |

- **RV-8** **Injury matrix**. Potential severity is "The credible worst case, had the circumstances
  been slightly different."; actual severity is "What actually happened.". Each is rated by
  choosing an impact and a duration; score = impact weight × duration weight; bands **Moderate**
  2–19, **Critical** 20–49, **Very Critical** 50–100. "Recovery time is the period from the time of
  injury until the employee returns close to their original health and normal work ability."

  | "Impact of the injury" (weight) | |
  |---|---|
  | Severe (5) | Prevents most or all private and recreational activities |
  | Significant (3) | Significantly reduces them |
  | Minor (1) | Minimal impact on the person's life |

  | "Duration of the impact (recovery time)" (weight) | |
  |---|---|
  | Minimal (2) | "Recovery will take 1 week or less" |
  | Short term (5) | "Recovery will take between 1 week and 3 months" |
  | Medium term (10) | "Recovery will take more than 3 but less than 6 months" |
  | Long term / Permanent (20) | "Recovery will take 6 months or more, or the person may never fully recover" |

- **RV-9** The critical flags of OV-11 follow the answers as they are given, and the event is shown
  as critical as soon as one applies. A **SIP** needs its **type** (required): the Safety SIP types
  or the Environment SIP types ([14](14-reference-catalogs.md)). An HCI, HCL or SPL has no type.

### Where the event goes

- **RV-10** A valid review sends the event to Root cause analysis when its workflow requires it —
  its level, or, once the answers make it critical, its critical row
  ([11](11-workflow-settings.md) WF-13). This follows the answers: the designation is asked as soon
  as the event becomes critical, and no longer once it is not. Nobody is asked whether to analyse
  further. Actions and Validation required by the critical row follow the same way.
- **RV-11** Completing with something missing saves nothing and reports each problem: "Say whether
  the event is valid." · "Choose why the event is not valid." · "Explain what makes the report of
  bad quality." · "Write the event statement." · "Do not name the reporter in the event statement."
  (the reporter's full name, ignoring case) · "Choose a value." (Standards, Hazards) · "Choose at
  least one value." (the other lists) · "Rate the potential severity." / "Rate the actual
  severity." · "Say whether the event is a SIP." / "… an HCL." / "… an SPL." · "Choose the SIP
  type." · "Choose who will perform the root cause analysis.".
- **RV-12** Only the answers of the decision taken are kept: switching No → Yes drops the reason;
  changing a rating drops a SIP type no longer needed.
- **RV-13** Valid → the next required step, the event In Progress; or **Closed** when nothing else is
  required.

### After the review

- **RV-14** A completed review shows: reviewer, reviewed on, valid event; then either the reason
  (and comment), or the event statement, each list's values, the ratings ("<score> — <band>
  (<impact> × <duration>)", e.g. "50 — Very Critical (Severe × Medium term)"), the Yes / No answer
  ("Is this event a SIP?" / "an HCL?" / "an SPL?"), Critical (the flags, or No), the SIP type and who
  performs the root cause analysis.
- **RV-15** Once reviewed, the report is corrected only as ER-22 says; the history shows "Review taken
  by <name>" and "Review completed — valid" or "Review completed — archived (<reason>)".

## Decisions

| Topic | Decision |
|---|---|
| Who reviews | The reviewers chosen in the Control Panel and kept on the event; the plant's Site Admins too |
| Not valid | Reason Duplicated / Useless / Bad quality; a comment only for Bad quality |
| HCL and SPL | A Yes / No answer of the reviewer (HCL for SRE1–SRE3, SPL for SRE4–SRE5), nothing chosen at first, no type; no loss matrix |
| Further analysis | Not asked: the workflow (the level, or the critical row for a critical event) decides whether a root cause analysis follows |
| Lists by level | Body Parts and Injuries for TF1–TF3 only |
| Injuries | Chosen per body part, among the injuries that apply to it |

## Examples

1. **Given** a TF2 event whose reviewers are R1 and R2, **when** R1 assigns themself, **then** the
   event is In Progress and R2 can no longer complete the review. (RV-2, RV-3)
2. **Given** a reviewer answering Not valid, Bad quality, without a comment, **then** completing is
   refused with "Explain what makes the report of bad quality."; with a comment the event is
   Archived. (RV-5, RV-11)
3. **Given** a statement containing the reporter's full name, **then** completing is refused with "Do
   not name the reporter in the event statement.". (RV-11)
4. **Given** a TF2 event, **when** the potential is Severe × Medium term (50) and the actual Minor ×
   Short term (5), **then** the potential reads "50 — Very Critical (Severe × Medium term)", the
   event is SIP, a SIP type is required, and the actual is "5 — Moderate". (RV-8, RV-9)
5. **Given** a TF4 event, **then** only Standards and Hazards are asked, and only the potential
   severity. (RV-7)
6. **Given** a TF3 review where Ear is chosen, **then** the injuries offered are those of Ear; adding
   Fingers adds Fingers' injuries; choosing Bruise for both gives "Ear: Bruise" and "Fingers:
   Bruise"; removing Ear keeps "Fingers: Bruise" only. (RV-6a)
7. **Given** an SRE4 event, **then** "Is this event an SPL?" is asked with nothing chosen; completing
   without an answer is refused with "Say whether the event is an SPL."; Yes makes it critical (SPL)
   with no type. (RV-7, RV-9, RV-11)
8. **Given** a TF4 workflow requiring Review only, and a Safety critical row requiring Root cause
   analysis, **when** the review rates the potential Moderate, **then** the review closes the event;
   **when** it rates it Very Critical, **then** "Who will perform the root cause analysis?" is
   required and completing moves the event to Root cause analysis. (RV-10, RV-13)
9. **Given** a value deactivated for plant A, **then** it is not offered in the review of a plant A
   event. (RV-6)
