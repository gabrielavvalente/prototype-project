import { useState } from 'react';
import { Alert, Button, Checkbox, Textarea } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { YesNoField } from '../create/fields.jsx';
import { saveWorkflowStep } from '../data/db.js';
import { planOwners } from '../logic/actionPlan.js';
import { localToday } from '../logic/actions.js';
import { getLabel } from '../logic/lookups.js';
import { completeValidation, isLocked, lastValidation, rework, validateRework, validateValidation, validatorIds } from '../logic/planValidation.js';
import { currentStep } from '../logic/review.js';
import { analysisWhys, withPlanDefaults } from './ActionPlanStep.jsx';
import PlanActions from './PlanActions.jsx';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';

function formatDateTime(isoText) {
  return new Date(isoText).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// The Validation step (005 VAL-1 to VAL-5): the validators review every action of the plan, then
// close the event or send the plan back to Actions; everyone else reads it.
export default function ValidationStep({ event, onSaved }) {
  const { user, users } = useApp();
  const [answer, setAnswer] = useState({ effective: null, reason: '', noMoreActions: false });
  const [reworking, setReworking] = useState(null); // null, or the reason being written
  const [reworkError, setReworkError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const current = withPlanDefaults(event);
  const whys = analysisWhys(current);
  const canValidate = currentStep(current) === 'validation' && validatorIds(current, users).includes(user.id);
  const last = lastValidation(current);
  const earlier = (current.validations ?? []).filter((validation) => !validation.effective);
  const locked = isLocked(current);
  const canRework = locked && validatorIds(current, users).includes(user.id);
  const errorsFor = (field) => (errors[field] ? [{ field, message: errors[field] }] : []);

  async function submit() {
    const found = validateValidation(answer);
    setErrors(found);
    if (Object.keys(found).length > 0) scrollToFirstProblemSoon();
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const owners = planOwners(current, investigationGroups, users);
      const result = completeValidation(current, answer, user.id, now, owners);
      onSaved(await saveWorkflowStep({ ...result.event, updatedBy: user.id, updatedAt: now }, result.alerts));
    } finally {
      setSaving(false);
    }
  }

  // Rework: a validator reopens the locked event, with a reason (011 VAL-7).
  async function sendBack() {
    const found = validateRework(reworking);
    setReworkError(found);
    if (found) {
      scrollToFirstProblemSoon();
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const result = rework(current, reworking, user.id, now, planOwners(current, investigationGroups, users));
      onSaved(await saveWorkflowStep({ ...result.event, updatedBy: user.id, updatedAt: now }, result.alerts));
      setReworking(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="validation-step">
      {last?.effective && (
        <Alert color="green" variant="light" mb="md">
          Validated as effective by {getLabel(users, last.by)} on {formatDateTime(last.at)}.
        </Alert>
      )}
      {earlier.length > 0 && (
        <ul className="validation-history">
          {earlier.map((validation) => (
            <li key={validation.at}>
              {validation.rework ? 'Rework' : 'Not effective'} — {validation.reason} ({getLabel(users, validation.by)}, {formatDateTime(validation.at)})
            </li>
          ))}
        </ul>
      )}
      <p className="field-hint">Validators: {validatorIds(current, users).map((id) => getLabel(users, id)).join(', ') || '—'}</p>
      <PlanActions event={current} whyText={(whyId) => whys?.find((why) => why.id === whyId)?.answer.trim() ?? ''} today={localToday()} canEdit={false} />
      {canValidate && (
        <form
          className="validation-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <YesNoField
            id="effective"
            label="Is the action plan effective?"
            value={answer.effective}
            errors={errorsFor('effective')}
            onChange={(effective) => setAnswer((currentAnswer) => ({ ...currentAnswer, effective }))}
          />
          {answer.effective === true && (
            <Checkbox
              id="noMoreActions"
              label="No additional actions are needed."
              checked={answer.noMoreActions}
              error={errors.noMoreActions}
              onChange={(e) => setAnswer((currentAnswer) => ({ ...currentAnswer, noMoreActions: e.currentTarget.checked }))}
            />
          )}
          {answer.effective === false && (
            <Textarea
              id="reason"
              label="Why is it not effective?"
              required
              minRows={2}
              autosize
              value={answer.reason}
              error={errors.reason}
              onChange={(e) => setAnswer((currentAnswer) => ({ ...currentAnswer, reason: e.target.value }))}
            />
          )}
          <div className="form-actions">
            <Button type="submit" disabled={saving}>
              Complete validation
            </Button>
          </div>
        </form>
      )}
      {canRework && reworking === null && (
        <div className="form-actions">
          <Button type="button" variant="default" onClick={() => setReworking('')}>
            Rework
          </Button>
        </div>
      )}
      {canRework && reworking !== null && (
        <div className="validation-form">
          <Textarea
            id="reworkReason"
            label="Why does it need rework?"
            required
            minRows={2}
            autosize
            value={reworking}
            error={reworkError}
            onChange={(e) => setReworking(e.target.value)}
          />
          <div className="form-actions">
            <Button type="button" disabled={saving} onClick={sendBack}>
              Send back for rework
            </Button>
            <Button type="button" variant="default" onClick={() => setReworking(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
