# Research: Source content

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## R1. Band keys stay; labels and ranges change

- **Decision**: Keep the internal band keys `low`, `medium`, `high` (stored in every rated cell and
  used to raise the flags); change their labels to Moderate, Critical, Very Critical and their
  ranges to 2–19, 20–49, 50–100. The rating text reads the label instead of the key.
- **Rationale**: Saved reviews keep their meaning without a migration. No possible score (2, 5, 6,
  10, 15, 20, 25, 30, 50, 60, 100) falls between the old and new ranges, so every cell keeps its
  band.
- **Alternatives considered**: renaming the keys (needs converting saved reviews for no gain).

## R2. 6M theme keys stay; saved analyses keep their answers

- **Decision**: Keep the theme keys (`management`, `humanFactors`, `methods`, `machine`,
  `materials`, `environment`) with the new labels and causes. A cause saved under an option that no
  longer exists keeps its name and explanation (it is shown on its C card, its checkbox is gone).
  5W1H answers are kept by question position, as before.
- **Rationale**: The demo data has no saved analysis; analyses made during testing stay readable.
- **Alternatives considered**: converting old options to new ones (no reliable mapping).

## R3. One Yes / No flag question for Environment and Industrial Risk

- **Decision**: The assessment of an Environment or Industrial Risk event is one `flagQuestion`
  (`{ flag, label, hint, article }`: SIP for Environment, HCL for SRE1–SRE3, SPL for SRE4–SRE5); the
  review stores its answer as `flagConfirmed` (was `sipConfirmed`). Only SIP has a type list
  (`typedFlag` returns `SIP` for Health & Safety and Environment, null for Industrial Risk). The loss
  matrix and the `splType` list are deleted.
- **Rationale**: The Environment SIP question already had the required shape (Yes / No, a hint,
  live badge, required); one code path serves the three flags.
- **Consequence**: reviews completed during testing before this change show "No" for the
  Environment SIP question in their summary (their Critical flags are kept); **Reset demo data**
  clears them. The demo data has no completed review.
- **Alternatives considered**: keeping `sipConfirmed` as the field name for HCL and SPL (misleading);
  keeping the loss matrix next to the question (the user removed it).
