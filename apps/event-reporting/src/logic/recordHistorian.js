// The Record Historian (feature 011): one entry per field changed after the review, computed by
// comparing the stored event with the one being saved (RH-1).

import { ACTION_STATUS_LABELS } from './actions.js';
import { causeName, SIX_M_THEMES } from './rootCause.js';

const nameOf = (users, id) => users.find((user) => user.id === id)?.name ?? id;
const formatDay = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const themeLabel = (key) => SIX_M_THEMES.find((theme) => theme.key === key)?.label ?? key;

function validationText(event) {
  const last = event.validations?.at(-1);
  if (!last) return '';
  if (last.rework) return 'Rework';
  return last.effective ? 'Effective' : 'Not effective';
}

// The event's tracked fields as texts, by field name.
function fieldsOf(event) {
  const rca = event.rca || {};
  return {
    Status: event.status || '',
    'Event statement': rca.statement?.trim() || event.review?.statement || '',
    'Immediate actions': (event.immediateActions || []).map((action) => action.description).join('; '),
    'Contributory causes': (rca.causes || []).map((cause) => `${themeLabel(cause.theme)} › ${causeName(cause)}`).join('; '),
    'Root causes': (rca.whys || []).filter((why) => why.rootCause && why.answer?.trim()).map((why) => why.answer.trim()).join('; '),
    Learnings: rca.learnings || '',
    'Root cause analysis': rca.completedAt ? 'Completed' : event.optionalAnalysis?.startedAt ? 'Started' : '',
    'Action plan': event.actionPlan?.completedAt ? 'Completed' : event.actionPlan?.deployedAt ? 'Deployed' : '',
    Validation: validationText(event),
    'Safety Warning': event.safetyWarning?.publishedAt ? 'Published' : '',
  };
}

function actionFields(action, users) {
  return {
    Description: action.description || '',
    Assignees: (action.assigneeIds || []).map((id) => nameOf(users, id)).join(', '),
    'Due date': formatDay(action.dueDate),
    Priority: action.priority || '',
    Status: ACTION_STATUS_LABELS[action.status] ?? action.status ?? '',
  };
}

// The entries of a save: [{ at, by, what, before, after, reason? }]; none while the review is not
// complete in the stored event (RH-1).
export function historianEntries(before, after, { userId, now, users }) {
  if (!before?.review?.decision) return [];
  const entries = [];
  const add = (what, from, to, extra = {}) => entries.push({ at: now, by: userId, what, before: from || '—', after: to || '—', ...extra });

  const oldFields = fieldsOf(before);
  const newFields = fieldsOf(after);
  for (const what of Object.keys(newFields)) {
    if (oldFields[what] === newFields[what]) continue;
    const last = after.validations?.at(-1);
    const reason = what === 'Validation' && last && !last.effective ? { reason: last.reason } : {};
    add(what, oldFields[what], newFields[what], reason);
  }

  const oldActions = new Map((before.actions || []).map((action) => [action.id, action]));
  for (const action of after.actions || []) {
    const previous = oldActions.get(action.id);
    const label = `Corrective action › ${action.description || previous?.description || 'an action'}`;
    if (!previous) {
      const fields = actionFields(action, users);
      add(label, '', `Added — ${fields.Status} · ${fields.Assignees} · due ${fields['Due date']}`);
      continue;
    }
    const from = actionFields(previous, users);
    const to = actionFields(action, users);
    for (const field of Object.keys(to)) {
      if (from[field] !== to[field]) add(`${label} › ${field}`, from[field], to[field]);
    }
  }
  const kept = new Set((after.actions || []).map((action) => action.id));
  for (const [id, action] of oldActions) {
    if (!kept.has(id)) add(`Corrective action › ${action.description}`, 'Planned', 'Deleted');
  }
  return entries;
}

// filters = { from, to (YYYY-MM-DD, inclusive), userId, what }; newest first (RH-2).
export function filterEntries(entries, { from = '', to = '', userId = '', what = '' } = {}) {
  return entries
    .filter((entry) => (!from || entry.at.slice(0, 10) >= from) && (!to || entry.at.slice(0, 10) <= to))
    .filter((entry) => (!userId || entry.by === userId) && (!what || entry.what === what))
    .sort((a, b) => b.at.localeCompare(a.at));
}
