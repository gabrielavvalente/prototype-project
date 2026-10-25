# Change: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Input**: User description: "$ARGUMENTS"

**Capabilities**: [capability files this change touches, e.g. `specs/capabilities/event-review.md`;
"new: `specs/capabilities/<name>.md`" for a new capability]

<!--
  This spec describes a CHANGE to the product (constitution, Development Workflow). The product as
  it behaves now is in specs/domain.md and specs/capabilities/; read the capabilities concerned
  first and refer to their rules by id instead of repeating them.
  - Write each rule once, with its full new text.
  - No technology, no file paths, no history.
  - Review remarks edit this file in place; they never add a new clarification session.
-->

## Why

[1–3 sentences: the need, for whom.]

## Decisions

<!-- Points the sources leave open or contradict, and the user's answers. Each also appears in the
     rules below. Remove this section if there is none. -->

| Topic | Decision | Sources |
|---|---|---|
| [topic] | [what was decided] | [what the sources say] |

## Rules

### Added

- **[ID-N]** [Full text of the rule: who, what, when — and when not. Exact UI texts in quotes.]

### Changed

- **[ID-N]** [Full new text.] *(was: one line summarizing the old rule)*

### Removed

- **[ID-N]** [Why it goes.]

<!-- Delete the subsections that stay empty. -->

## Acceptance scenarios

<!-- From freshly reset demo data (specs/capabilities/platform-data.md), with concrete people,
     events and counts; each cites the rule ids it checks. Check names and counts against the
     demo data. Mark scenarios that replace an existing one: (replaces <capability> scenario N). -->

1. **[Short title]** — [Who does what, on which demo event.] *Then* [what they see, with exact
   texts and numbers]. ([ID-N])

## Demo data changes

<!-- New or changed demo data needed by the scenarios (people, events, settings). Remove if none. -->

## Out of scope

- [What this change deliberately leaves out, and which later capability or change takes it.]
