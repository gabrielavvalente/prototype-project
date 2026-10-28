# Specification Quality Checklist: Locked closure, rework and the Record Historian

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

- Checked against the demo data: TF-26-0005 (TF1, Lyon) requires Review, Actions and Validation; with
  no analysis its plan owner and validator are its reviewer, Carla Mendes; Diego Laurent is not a
  validator; TF-26-0001 is Open, not reviewed.
- Defaults not asked of the user (in Decisions): a locked event's Safety Warning can still be
  published and shared; the Record Historian is readable by everyone who can see the event.
