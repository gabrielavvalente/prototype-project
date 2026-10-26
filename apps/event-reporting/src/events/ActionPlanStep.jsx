import { useState } from 'react';
import { Alert, Button } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { saveWorkflowStep } from '../data/db.js';
import {
  addAction,
  allowedStatuses,
  canEditPlan,
  completeBlocker,
  completePlan,
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
import ActionLines from './ActionLines.jsx';
import ActionModal from './ActionModal.jsx';

const ALERT_TYPE = 'Action assigned to you';

function formatDateTime(isoText) {
  return new Date(isoText).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// The Actions step (005): the plan's owners prepare, deploy and complete it; assignees move their
// own actions forward; everyone else who can see the event reads it. Every change is saved at once.
export default function ActionPlanStep({ event, onSaved }) {
  const { user, users } = useApp();
  const [editing, setEditing] = useState(null); // { action, isNew }
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const today = localToday();
  const current = { ...event, actions: (event.actions ?? []).map((action) => normalizeAction(action, event)) };
  const owners = planOwners(current, investigationGroups, users);
  const canEdit = canEditPlan(user, current, investigationGroups, users);
  const completed = Boolean(current.actionPlan?.completedAt);
  const deployed = Boolean(current.actionPlan?.deployedAt);
  const summary = planSummary(current, today);
  const blocker = completeBlocker(current);
  // The analysis's answered whys an action may address (AP-4).
  const whys = current.rca ? normalizeAnalysis(current.rca).whys.filter((why) => why.answer.trim()) : null;
  const whyText = (whyId) => whys?.find((why) => why.id === whyId)?.answer.trim() ?? '';

  async function save(updated, recipientIds = []) {
    setSaving(true);
    setError('');
    try {
      const now = new Date().toISOString();
      const alerts = recipientIds.map((recipientId) => ({ recipientId, type: ALERT_TYPE }));
      onSaved(await saveWorkflowStep({ ...updated, updatedBy: user.id, updatedAt: now }, alerts));
    } finally {
      setSaving(false);
    }
  }

  async function keep(action) {
    const now = new Date().toISOString();
    setEditing(null);
    if (editing.isNew) {
      const result = addAction(current, action, user.id, now, users);
      await save(result.event, result.recipientIds);
    } else {
      await save(updateAction(current, action, user.id, now));
    }
  }

  async function remove(action) {
    if (window.confirm(`Delete the action "${action.description}"?`)) await save(deleteAction(current, action.id));
  }

  async function changeStatus(action, status) {
    if (status === 'cancelled' && !window.confirm(`Cancel the action "${action.description}"? It cannot be reopened.`)) return;
    await save(setActionStatus(current, action.id, status, user.id, new Date().toISOString()));
  }

  async function deploy() {
    const incomplete = current.actions.filter((action) => action.status === 'planned' && Object.keys(validateAction(action)).length > 0);
    if (incomplete.length > 0) {
      setError(`Complete these actions before deploying: ${incomplete.map((action) => action.description || 'an action without description').join('; ')}.`);
      return;
    }
    const result = deployPlan(current, user.id, new Date().toISOString(), users);
    await save(result.event, result.recipientIds);
  }

  async function complete() {
    await save(completePlan(current, user.id, new Date().toISOString()));
  }

  return (
    <div className="action-plan">
      {completed && (
        <Alert color="green" variant="light" mb="md">
          Completed by {getLabel(users, current.actionPlan.completedBy)} on {formatDateTime(current.actionPlan.completedAt)}.
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
      <ActionLines
        actions={current.actions}
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
          <Button
            type="button"
            variant="default"
            disabled={saving || !current.actions.some((action) => action.status === 'planned')}
            onClick={deploy}
          >
            Deploy action plan
          </Button>
          <Button type="button" disabled={saving || Boolean(blocker)} title={blocker ?? undefined} onClick={complete}>
            Complete action plan
          </Button>
          {deployed && blocker && <span className="field-hint">{blocker}</span>}
        </div>
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
