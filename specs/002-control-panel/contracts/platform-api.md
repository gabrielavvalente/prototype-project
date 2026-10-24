# Contract: shared/platform functions

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

What apps may import from `shared/platform/`. Plain JavaScript, no packages. Storage functions
return promises; rule functions are pure (no storage, easy to test).

## Storage — `platformData.js`

| Function | Returns / does |
|---|---|
| `openPlatform()` | Opens database `platform` (creating stores and seeding from `sampleData.js` and `catalogs.js` when empty) |
| `loadPlatform()` | `{ users, organization, reference }` — what every app needs at start |
| `getWorkflowSettings(pillarId?)` | settings, all or of one pillar |
| `saveWorkflowSetting(user, change)` | Creates, updates or deletes a setting (`change = { pillarId, levelCode, phase, required, reviewerIds }`); checks permission; writes audit entry and, when the author changes, a notification — one transaction |
| `getMasterData(listId)` | `{ values, activations }` |
| `saveValue(user, value)` | Add or edit; runs `validateValue` and permission; audit |
| `setValueStatus(user, valueId, status)` | Deactivate (owner) / reactivate / retire; audit |
| `setActivation(user, valueId, active)` | Deactivate / reactivate for the user's scope; audit |
| `getAudit(pillarId)` | entries newest first |
| `getNotifications(userId)` / `markNotificationsRead(userId)` | Control Panel notifications |
| `resetPlatformData()` | Clears and reseeds (demo) |

Errors: thrown `Error` with a readable `message` ("Choose at least one reviewer.", "You cannot
change a setting made at another level.", "A value with code H-12 already exists.").

## Rules — `workflow.js`

| Function | Purpose |
|---|---|
| `PHASES`, `PHASE_LABELS` | phase ids and labels |
| `resultingWorkflow(settings, { pillarId, levelCode, plantId })` | per phase `{ required, sources }` (FR-007) |
| `workflowForEvent(settings, users, event)` | snapshot `{ computedAt, phases }` with reviewers filtered to the event's plant and pillar (FR-012) |
| `isOnlySubmission(snapshot)` | `true` → event is Closed at submission (FR-026) |
| `cellStateFor(user, settings, { pillarId, levelCode, phase })` | `'mine' \| 'optional' \| 'locked' \| 'otherPerimeter'` with sources (FR-008) |
| `validReviewers(users, { pillarId, plantIds })` | Managers and Site Admins with access (FR-010) |

## Rules — `permissions.js`

| Function | Purpose |
|---|---|
| `LEVEL_ORDER` | `{ central: 3, cluster: 2, local: 1 }` |
| `getRole(user, pillarId)` | the user's Control Panel role on a pillar or `null` |
| `hasControlPanelAccess(user)` | at least one role (FR-002) |
| `coveredPlantIds(role, organization)` | all plants for Central, role plants otherwise |
| `canEditSetting(user, setting)` | same level and overlapping plants (FR-009, option A) |
| `canSeeUser(viewer, user, organization)` | perimeter rule of FR-027 |

## Rules — `masterData.js`

| Function | Purpose |
|---|---|
| `LISTS`, `listsForPillar(pillarId)` | list definitions incl. read-only lists of another pillar (FR-013, FR-021) |
| `availableValues(values, activations, { listId, plantId })` | FR-018, FR-020 |
| `allowedValueActions(user, list, value)` | `{ add, edit, deactivate, reactivate, retire }` booleans (FR-015, FR-016) |
| `validateValue(list, value, existingValues)` | `{ field: message }` (FR-019, FR-020) |

## Organization — `organization.js`

Moved from Event Reporting's `logic/locations.js`: `getPlants`, `getAncestry`, `getPlantOf`,
`getPillarIdsForPlant`. Event Reporting keeps its picker-specific helpers and imports these.
