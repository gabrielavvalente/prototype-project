# Data model: Workflow for critical events, and the master data workbook

## Workflow setting (`platform`, `workflowSettings`)

Unchanged shape; `levelCode` may be `'critical'` (the pillar's critical row), with `phase` one of
`rootCause`, `actions`, `validation` only.

## Event workflow (`event-reporting`, `events[].workflow`)

```js
workflow: {
  computedAt, phases: { submission, review, rootCause, actions, validation }, // as before
  critical: { rootCause: { required, sources }, actions: { … }, validation: { … } }, // NEW
}
```

Missing on events submitted before this change: they behave as if nothing were required there.

## Master values (`platform`, `masterValues`)

- New list `diseases` (Health & Safety, no code, not fixed): ids `diseases-1…17`.
- Injuries (`injuries-1…38`, names unchanged) gain `bodyPartIds: string[]` (ids `bodyParts-N`).
- Standards `standards-1…12` (STD-01…STD-12) and Hazards `hazards-1…16` (HZ-01…HZ-16) replace the
  earlier values.
