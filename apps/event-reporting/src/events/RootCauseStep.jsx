import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Textarea } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { saveWorkflowStep } from '../data/db.js';
import { actionCandidates, actionsOfWhys, emptyAction } from '../logic/actions.js';
import { getLabel } from '../logic/lookups.js';
import {
  canDoFiveWhy,
  canPerformAnalysis,
  completeAnalysis,
  emptyAnalysis,
  normalizeAnalysis,
  partStatus,
  removeWhy,
  subtreeIds,
  syncWhysWithCauses,
  validateAnalysis,
} from '../logic/rootCause.js';
import { completeImmediateActions } from '../logic/submission.js';
import { validateImmediateAction } from '../logic/validation.js';
import Icon from '../shell/Icon.jsx';
import ActionModal from './ActionModal.jsx';
import ActionsSummary from './ActionsSummary.jsx';
import FiveW1HPart from './FiveW1HPart.jsx';
import FiveWhyPart from './FiveWhyPart.jsx';
import ImmediateActionsList from './ImmediateActionsList.jsx';
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

// A titled part of the analysis, with its error when saving or completing is refused.
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

// A part that opens on demand (5W1H) or once it can be done (5 Why, after 6M).
function CollapsiblePart({ id, title, opened, onToggle, disabled, note, error, children }) {
  return (
    <section className="review-section">
      <h3>
        <button type="button" className="part-toggle" aria-expanded={opened} aria-controls={id} disabled={disabled} onClick={onToggle}>
          <Icon name={opened ? 'chevronDown' : 'chevronRight'} size={18} />
          {title}
        </button>
      </h3>
      {note && <p className="field-hint">{note}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {opened && <div id={id}>{children}</div>}
    </section>
  );
}

// The overview: who analyzes and where each part stands (004 FR-007).
function Overview({ event, analysis }) {
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
    </>
  );
}

// The Root cause analysis step (004): designated people fill it in, save it and complete it;
// everyone else reads it. The immediate actions are the submission's own and the actions belong to
// the event; both are stored with the analysis on Save.
export default function RootCauseStep({ event, onSaved }) {
  const { user, users } = useApp();
  const [analysis, setAnalysis] = useState(() => (event.rca ? normalizeAnalysis(event.rca) : emptyAnalysis(event)));
  const [immediateActions, setImmediateActions] = useState(event.immediateActions);
  const [actions, setActions] = useState(event.actions ?? []);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [fiveW1HOpened, setFiveW1HOpened] = useState(() => partStatus(analysis).fiveW1H !== 'notStarted');
  const fiveWhyAvailable = canDoFiveWhy(analysis);
  const [fiveWhyOpened, setFiveWhyOpened] = useState(fiveWhyAvailable);
  // 5 Why opens by itself as soon as 6M is done.
  useEffect(() => {
    setFiveWhyOpened(fiveWhyAvailable);
  }, [fiveWhyAvailable]);
  const canEdit = canPerformAnalysis(user, event, investigationGroups);
  const readOnly = !canEdit;
  const touched = () => setMessage('');
  const set = (changes) => {
    setAnalysis((current) => ({ ...current, ...changes }));
    touched();
  };

  // The answer of the why an action comes from.
  const whyText = (whyId) => analysis.whys.find((item) => item.id === whyId)?.answer.trim() ?? '';

  // Ticking a 6M cause adds its first why; unticking drops its whys and their actions.
  function changeCauses(causes) {
    const whys = syncWhysWithCauses(analysis.whys, causes);
    const dropped = analysis.whys.filter((why) => !whys.some((item) => item.id === why.id));
    const lost = actionsOfWhys(actions, dropped.map((why) => why.id));
    const answered = dropped.some((why) => why.answer.trim());
    if ((lost.length > 0 || answered) && !window.confirm('Untick this cause? Its whys in 5 Why and the actions created from them will be deleted.')) return;
    set({ causes, whys });
    if (lost.length > 0) setActions((current) => current.filter((action) => !lost.includes(action)));
  }

  function removeWhyAndActions(whyId) {
    const lost = actionsOfWhys(actions, subtreeIds(analysis.whys, whyId));
    const question = `Remove this why and the whys below it? ${lost.length} action${lost.length > 1 ? 's' : ''} created from them will be deleted too.`;
    if (lost.length > 0 && !window.confirm(question)) return;
    set({ whys: removeWhy(analysis.whys, whyId) });
    setActions((current) => current.filter((action) => !lost.includes(action)));
  }

  function keepAction(action) {
    setActions((current) =>
      current.some((item) => item.id === action.id)
        ? current.map((item) => (item.id === action.id ? action : item))
        : [...current, { ...action, createdBy: user.id, createdAt: new Date().toISOString() }],
    );
    setEditing(null);
    touched();
  }

  function deleteAction(action) {
    if (!window.confirm(`Delete the action "${action.description}"?`)) return;
    setActions((current) => current.filter((item) => item.id !== action.id));
    touched();
  }

  // The event with the work of the step, or null when an immediate action is incomplete.
  function withWork(now) {
    const incomplete = immediateActions.some((action) => validateImmediateAction(action).length > 0);
    if (incomplete) return null;
    const changed = JSON.stringify(immediateActions) !== JSON.stringify(event.immediateActions);
    const rca = { ...analysis, savedBy: user.id, savedAt: now };
    if (changed) Object.assign(rca, { immediateActionsChangedBy: user.id, immediateActionsChangedAt: now });
    return { ...event, immediateActions: completeImmediateActions({ ...event, immediateActions }), actions, rca, updatedBy: user.id, updatedAt: now };
  }

  async function save(updated) {
    setSaving(true);
    try {
      const saved = await saveWorkflowStep(updated);
      // The step keeps showing what was stored (e.g. who completed it and when).
      setAnalysis(saved.rca);
      setImmediateActions(saved.immediateActions);
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  }

  const immediateActionsError = 'Complete or remove the incomplete immediate actions.';

  async function saveWork() {
    const now = new Date().toISOString();
    const work = withWork(now);
    setErrors(work ? {} : { immediateActions: immediateActionsError });
    if (!work) return;
    await save(work);
    setMessage(`Saved at ${new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.`);
  }

  async function complete() {
    const now = new Date().toISOString();
    const work = withWork(now);
    const found = validateAnalysis(analysis);
    if (!work) found.immediateActions = immediateActionsError;
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await save(completeAnalysis(work, work.rca, user.id, now));
  }

  return (
    <div className="rca-step">
      {analysis.completedAt && (
        <Alert color="green" variant="light" mb="md">
          Completed by {getLabel(users, analysis.completedBy)} on {formatDateTime(analysis.completedAt)}.
        </Alert>
      )}
      {readOnly && !analysis.completedAt && (
        <Alert color="gray" variant="light" mb="md">
          Only the people assigned can fill in the analysis.
        </Alert>
      )}
      <Overview event={event} analysis={analysis} />
      {/* Only the fields are disabled for readers, so they can still open parts and switch sections. */}
      <div className="section-fieldset">
        <Textarea
          label="Event statement"
          minRows={3}
          autosize
          disabled={readOnly}
          value={analysis.statement}
          onChange={(e) => set({ statement: e.target.value })}
        />
        <Part title="Immediate actions" error={errors.immediateActions}>
          <ImmediateActionsList
            event={event}
            actions={immediateActions}
            onChange={(changed) => {
              setImmediateActions(changed);
              touched();
            }}
            readOnly={readOnly}
          />
        </Part>
        <CollapsiblePart
          id="rca-5w1h"
          title="5W1H — optional guide"
          opened={fiveW1HOpened}
          onToggle={() => setFiveW1HOpened((opened) => !opened)}
        >
          <FiveW1HPart value={analysis.fiveW1H} onChange={(fiveW1H) => set({ fiveW1H })} readOnly={readOnly} />
        </CollapsiblePart>
        <Part title="6M — contributory causes" error={errors.sixM}>
          <SixMPart causes={analysis.causes} onChange={changeCauses} readOnly={readOnly} />
        </Part>
        <CollapsiblePart
          id="rca-5why"
          title="5 Why"
          opened={fiveWhyAvailable && fiveWhyOpened}
          onToggle={() => setFiveWhyOpened((opened) => !opened)}
          disabled={!fiveWhyAvailable}
          note={fiveWhyAvailable ? '' : 'Available once 6M is done: tick at least one cause and explain each one.'}
          error={errors.fiveWhy}
        >
          <fieldset className="section-fieldset" disabled={readOnly}>
            <FiveWhyPart
              causes={analysis.causes}
              whys={analysis.whys}
              onChange={(whys) => set({ whys })}
              actions={actions}
              readOnly={readOnly}
              onAddAction={(whyId) => setEditing(emptyAction(whyId))}
              onRemoveWhy={removeWhyAndActions}
            />
          </fieldset>
          <h4 className="rca-subheading">Actions ({actions.length})</h4>
          <ActionsSummary actions={actions} whyText={whyText} readOnly={readOnly} onEdit={setEditing} onDelete={deleteAction} />
        </CollapsiblePart>
        <Part title="Learnings" error={errors.learnings}>
          <Textarea
            label="What did we learn?"
            disabled={readOnly}
            required
            minRows={3}
            autosize
            value={analysis.learnings}
            onChange={(e) => set({ learnings: e.target.value })}
          />
        </Part>
      </div>
      {editing && (
        <ActionModal
          action={editing}
          whyText={whyText(editing.whyId)}
          candidates={actionCandidates(event, users)}
          onSave={keepAction}
          onClose={() => setEditing(null)}
        />
      )}
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
