# Specification Quality Checklist: Workflow for critical events, and the master data workbook

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-28
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs, file paths)
- [x] No history: rules state the behavior they set (the "was:" notes of Changed excepted)
- [x] Written for non-technical stakeholders
- [x] All sections of the change template completed (empty ones removed)

## Rules

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Every rule has an id and says who, what, when — and when not
- [x] Each rule is written once; existing rules are referred to by id
- [x] Exact UI texts are quoted
- [x] Every decision taken with the user is in Decisions and reflected in a rule
- [x] The capabilities touched are listed; changed rules exist in those capabilities

## Acceptance Scenarios

- [x] Every added or changed rule is checked by at least one scenario
- [x] Scenarios start from the demo data, with concrete people, events, texts and counts
- [x] Names and counts match the demo data (and earlier scenarios when they run in order)
- [x] Edge cases (refusals, limits, empty states) are covered
- [x] Scope is clearly bounded (Out of scope)

## Notes

- Counts checked against the workbook: 12 standards, 16 hazards, 17 diseases, 423 distinct
  body part–injury pairs over the 37 body parts (Ear 12 injuries, Ear + Fingers 17).
- RV-11 and RV-15 are checked indirectly by scenario 4 (no question, so no message nor summary row).
- Scenario order: 3 and 6 run after 2.
