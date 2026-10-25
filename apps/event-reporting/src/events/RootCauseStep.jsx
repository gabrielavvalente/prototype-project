import { useState } from 'react';
import { Alert, Badge, Button, Textarea } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { saveWorkflowStep } from '../data/db.js';
import { getLabel } from '../logic/lookups.js';
import { canPerformAnalysis, completeAnalysis, emptyAnalysis, partStatus, validateAnalysis } from '../logic/rootCause.js';
import FiveW1HPart from './FiveW1HPart.jsx';
import FiveWhyPart from './FiveWhyPart.jsx';
import { describeAssignees } from './ReviewStep.jsx';
import SixMPart from './SixMPart.jsx';

const STATUS = {
  notStarted: { label: 'Not started', color: 'gray' },
  inProgress: { label: 'In progress', color: 'yellow' },
  done: { label: 'Done', color: 'green' },
};

const PARTS = [
  { key: 'fiveW1H', label: '5W1H (optional)' },
  { key: 'sixM', label: '6M' },
  { key: 'fiveWhy', label: '5 Why' },
  { key: 'learnings', label: 'Learnings' },
];

function formatDateTime(isoText) {
  return new Date(isoText).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// A titled part of the analysis, with its error when completing is refused.
function Part({ title, error, children }) {
  return (
    <section className="review-section">
      <h3>{title}</h3>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {children}
    </section>
  );
}

// The overview: who analyzes, the event recap and where each part stands (004 FR-007).
function Overview({ event, analysis, set, readOnly }) {
  const { users } = useApp();
  const status = partStatus(analysis);
  const assignees = event.review?.rcaAssignees;
  return (
    <>
      <p className="rca-assigned">
        <strong>Assigned to:</strong>{' '}
        {assignees ? describeAssignees(assignees, users) : `${getLabel(users, event.review?.reviewerId)} (reviewer)`}
      </p>
      <ul className="rca-status" aria-label="Progress">
        {PARTS.map((part) => (
          <li key={part.key}>
            {part.label} <Badge color={STATUS[status[part.key]].color} variant="light">{STATUS[status[part.key]].label}</Badge>
          </li>
        ))}
      </ul>
      <fieldset className="section-fieldset" disabled={readOnly}>
        <div className="rca-grid">
          <Textarea label="Event statement" minRows={3} autosize value={analysis.statement} onChange={(e) => set({ statement: e.target.value })} />
          <Textarea label="Immediate actions" minRows={3} autosize value={analysis.immediateActions} onChange={(e) => set({ immediateActions: e.target.value })} />
        </div>
      </fieldset>
    </>
  );
}

// The Root cause analysis step (004): designated people fill it in, save it and complete it;
// everyone else reads it.
export default function RootCauseStep({ event, onSaved }) {
  const { user, users } = useApp();
  const [analysis, setAnalysis] = useState(() => event.rca ?? emptyAnalysis(event));
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const canEdit = canPerformAnalysis(user, event, investigationGroups);
  const set = (changes) => {
    setAnalysis((current) => ({ ...current, ...changes }));
    setMessage('');
  };

  async function save(updated) {
    setSaving(true);
    try {
      const saved = await saveWorkflowStep({ ...updated, updatedBy: user.id, updatedAt: new Date().toISOString() });
      // The step keeps showing what was stored (e.g. who completed it and when).
      setAnalysis(saved.rca);
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  }

  async function saveWork() {
    const now = new Date().toISOString();
    await save({ ...event, rca: { ...analysis, savedBy: user.id, savedAt: now } });
    setMessage(`Saved at ${new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`);
  }

  async function complete() {
    const found = validateAnalysis(analysis);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await save(completeAnalysis(event, analysis, user.id, new Date().toISOString()));
  }

  return (
    <div className="rca-step">
      {analysis.completedAt && (
        <Alert color="green" variant="light" mb="md">
          Completed by {getLabel(users, analysis.completedBy)} on {formatDateTime(analysis.completedAt)}.
        </Alert>
      )}
      {!canEdit && !analysis.completedAt && (
        <Alert color="gray" variant="light" mb="md">
          Only the people assigned can fill in the analysis.
        </Alert>
      )}
      <Overview event={event} analysis={analysis} set={set} readOnly={!canEdit} />
      <fieldset className="section-fieldset" disabled={!canEdit}>
        <Part title="5W1H — optional guide">
          <FiveW1HPart value={analysis.fiveW1H} onChange={(fiveW1H) => set({ fiveW1H })} />
        </Part>
        <Part title="6M — contributory causes" error={errors.sixM}>
          <SixMPart causes={analysis.causes} onChange={(causes) => set({ causes })} readOnly={!canEdit} />
        </Part>
        <Part title="5 Why" error={errors.fiveWhy}>
          <FiveWhyPart legs={analysis.legs} onChange={(legs) => set({ legs })} readOnly={!canEdit} />
        </Part>
        <Part title="Learnings" error={errors.learnings}>
          <Textarea
            label="What did we learn?"
            required
            minRows={3}
            autosize
            value={analysis.learnings}
            onChange={(e) => set({ learnings: e.target.value })}
          />
        </Part>
      </fieldset>
      {canEdit && (
        <div className="form-actions">
          {message && (
            <span className="field-hint" role="status">
              {message}
            </span>
          )}
          <Button type="button" variant="default" disabled={saving} onClick={saveWork}>
            Save
          </Button>
          <Button type="button" disabled={saving} onClick={complete}>
            Complete analysis
          </Button>
        </div>
      )}
    </div>
  );
}
