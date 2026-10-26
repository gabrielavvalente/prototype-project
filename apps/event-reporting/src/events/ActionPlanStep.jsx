import { useState } from 'react';
import { Alert, Button } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { saveWorkflowStep } from '../data/db.js';
import {
  addAction,
  allowedStatuses,
  canEditPlan,
  deleteAction,
  deployPlan,
  planOwners,
  planSummary,
  setActionStatus,
  updateAction,
} from '../logic/actionPlan.js';
import { actionCandidates, emptyAction, localToday, normalizeAction, validateAction } from '../logic/actions.js';
import { getLabel } from '../logic/lookups.js';
import { normalizeAnalysis } from '../logic/rootCause.js';
import ActionModal from './ActionModal.jsx';
import PlanActions from './PlanActions.jsx';

function formatDateTime(isoText) {
  return new Date(isoText).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// The answered whys of the event's analysis an action may address (AP-4), or null without analysis.
export function analysisWhys(event) {
  return event.rca ? normalizeAnalysis(event.rca).whys.filter((why) => why.answer.trim()) : null;
}

// The event with its corrective actions read with the 005 defaults.
export function withPlanDefaults(event) {
  return { ...event, actions: (event.actions ?? []).map((action) => normalizeAction(action, event)) };
}

// The Actions step (005): the plan's owners prepare and deploy it; assignees move their own actions
// forward; the plan completes by itself once finished (AP-12); everyone else who can see the event
// reads it. Every change is saved at once.
export default function ActionPlanStep({ event, onSaved }) {
  const { user, users } = useApp();
  const [editing, setEditing] = useState(null); // { action, isNew }
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = localToday();
  const current = withPlanDefaults(event);
  const owners = planOwners(current, investigationGroups, users);
  const canEdit = canEditPlan(user, current, investigationGroups, users);
  const completed = Boolean(current.actionPlan?.completedAt);
  const deployed = Boolean(current.actionPlan?.deployedAt);
  const summary = planSummary(current, today);
  const whys = analysisWhys(current);
  const whyText = (whyId) => whys?.find((why) => why.id === whyId)?.answer.trim() ?? '';

  // result = { event, alerts }
  async function save({ event: updated, alerts = [] }) {
    setSaving(true);
    setError('');
    try {
      onSaved(await saveWorkflowStep({ ...updated, updatedBy: user.id, updatedAt: new Date().toISOString() }, alerts));
    } finally {
      setSaving(false);
    }
  }

  async function keep(action) {
    const now = new Date().toISOString();
    const isNew = editing.isNew;
    setEditing(null);
    await save(isNew ? addAction(current, action, user.id, now, users) : { event: updateAction(current, action, user.id, now) });
  }

  async function remove(action) {
    if (window.confirm(`Delete the action "${action.description}"?`)) await save({ event: deleteAction(current, action.id) });
  }

  async function changeStatus(action, status) {
    if (status === 'cancelled' && !window.confirm(`Cancel the action "${action.description}"? It cannot be reopened.`)) return;
    await save(setActionStatus(current, action.id, status, user.id, new Date().toISOString(), users));
  }

  async function deploy() {
    const incomplete = current.actions.filter((action) => action.status === 'planned' && Object.keys(validateAction(action)).length > 0);
    if (incomplete.length > 0) {
      setError(`Complete these actions before deploying: ${incomplete.map((action) => action.description || 'an action without description').join('; ')}.`);
      return;
    }
    await save(deployPlan(current, user.id, new Date().toISOString(), users));
  }

  return (
    <div className="action-plan">
      {completed && (
        <Alert color="green" variant="light" mb="md">
          Completed on {formatDateTime(current.actionPlan.completedAt)}.
        </Alert>
      )}
      <p className="action-plan-summary" role="status">
        {summary.count} action{summary.count === 1 ? '' : 's'} · {summary.completed} completed · {summary.overdue} overdue
        {!deployed && ' · Not deployed'}
      </p>
      <p className="field-hint">Owners: {owners.map((id) => getLabel(users, id)).join(', ') || '—'}</p>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <PlanActions
        event={current}
        whyText={whyText}
        today={today}
        canEdit={canEdit}
        statusesFor={completed ? null : (action) => allowedStatuses(user, action, canEdit)}
        onEdit={(action) => setEditing({ action, isNew: false })}
        onDelete={remove}
        onStatus={changeStatus}
      />
      {canEdit && (
        <div className="form-actions">
          <Button type="button" variant="default" disabled={saving} onClick={() => setEditing({ action: emptyAction(null, current), isNew: true })}>
            Add action
          </Button>
          {!deployed && (
            <Button type="button" disabled={saving} onClick={deploy}>
              Deploy action plan
            </Button>
          )}
        </div>
      )}
      {canEdit && deployed && !completed && (
        <p className="field-hint">The plan completes by itself once every action is Completed or Cancelled.</p>
      )}
      {editing && (
        <ActionModal
          action={editing.action}
          isNew={editing.isNew}
          event={current}
          whys={whys}
          whyFixed={false}
          candidates={actionCandidates(current, users)}
          onSave={keep}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
