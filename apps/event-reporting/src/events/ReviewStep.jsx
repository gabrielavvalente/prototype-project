import { useEffect, useState } from 'react';
import { Alert, Button, MultiSelect, Textarea } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { availableValues, listsForPillar } from '../../../../shared/platform/masterData.js';
import { getMasterData } from '../../../../shared/platform/platformData.js';
import { saveReviewStep } from '../data/db.js';
import ChipGroup from '../create/ChipGroup.jsx';
import { SelectField, YesNoField } from '../create/fields.jsx';
import { getLabel, getReferenceList } from '../logic/lookups.js';
import {
  asksFurtherAnalysis,
  canStartReview,
  claimReview,
  completeReview,
  INVALID_REASONS,
  isReviewer,
  REASON_NEEDING_COMMENT,
  validateReview,
} from '../logic/review.js';
import { assessmentFor, criticalFlagsOf, typedFlag } from '../logic/severity.js';
import SeverityMatrix from './SeverityMatrix.jsx';
import SummaryList from './SummaryList.jsx';

// The pillar's lists, without lists that only group another one (Body Part Categories group Body
// Parts, which are shown by category).
function reviewLists(pillarId) {
  const lists = listsForPillar(pillarId);
  return lists.filter((list) => !lists.some((other) => other.parentListId === list.id));
}

// Options of one master data list at the event's plant; Body Parts grouped by category.
function listOptions(list, values, activations, plantId) {
  const items = availableValues(values, activations, { listId: list.id, plantId }).map((value) => ({
    value: value.id,
    label: value.code ? `${value.code} — ${value.name}` : value.name,
    parentId: value.parentId,
  }));
  if (!list.parentListId) {
    return items.map(({ value, label }) => ({ value, label }));
  }
  const categories = values.filter((value) => value.listId === list.parentListId);
  return categories
    .map((category) => ({
      group: category.name,
      items: items.filter((item) => item.parentId === category.id).map(({ value, label }) => ({ value, label })),
    }))
    .filter((group) => group.items.length > 0);
}

// Everyone told when an event is archived: the reporter, people it was shared with and the other
// reviewers (core FR-6).
function archiveRecipients(event, reviewerId) {
  const ids = [event.reporterId, ...event.sharedWithIds, ...(event.workflow.phases.review.reviewerIds || [])];
  return [...new Set(ids)].filter((id) => id && id !== reviewerId);
}

// The form starts from the event: the statement from its description, the Environment SIP answer
// from the submission (003 FR-013, FR-025).
function startingReview(event) {
  const submittedSip = event.riskQuestion?.type === 'SIP' ? event.riskQuestion.answer : null;
  return {
    decision: null,
    invalidReason: '',
    invalidComment: '',
    statement: event.description || '',
    classification: {},
    potential: null,
    actual: null,
    sipConfirmed: assessmentFor(event).sipQuestion ? submittedSip : null,
    criticalTypeId: '',
    furtherAnalysis: null,
  };
}

function describeRating(matrix, rating) {
  if (!rating) return '';
  const impact = matrix.impacts.find((item) => item.key === rating.impact).label;
  const duration = matrix.durations.find((item) => item.key === rating.duration).label;
  return `${rating.score} — ${rating.band[0].toUpperCase()}${rating.band.slice(1)} (${impact} × ${duration})`;
}

function ReviewSummary({ event, masterData }) {
  const { users, reference } = useApp();
  const review = event.review;
  const assessment = assessmentFor(event);
  const valueName = (id) => masterData?.values.find((value) => value.id === id)?.name ?? id;
  const rows = [
    { label: 'Reviewer', value: getLabel(users, review.reviewerId) },
    { label: 'Reviewed on', value: new Date(review.reviewedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
    { label: 'Valid event', value: review.decision === 'valid' ? 'Yes' : 'No' },
  ];
  if (review.decision === 'invalid') {
    rows.push({ label: 'Reason', value: review.invalidReason });
    if (review.invalidComment) rows.push({ label: 'Comment', value: review.invalidComment });
    return <SummaryList rows={rows} />;
  }
  rows.push({ label: 'Event statement', value: review.statement });
  for (const list of reviewLists(event.pillarId)) {
    rows.push({ label: list.label, value: (review.classification[list.id] || []).map(valueName).join(', ') });
  }
  if (assessment.potential) rows.push({ label: assessment.potentialTitle, value: describeRating(assessment.matrix, review.potential) });
  if (assessment.actual) rows.push({ label: assessment.actualTitle, value: describeRating(assessment.matrix, review.actual) });
  if (assessment.sipQuestion) rows.push({ label: 'Is this event a SIP?', value: review.sipConfirmed ? 'Yes' : 'No' });
  rows.push({ label: 'Critical', value: review.criticalFlags?.join(' · ') || 'No' });
  if (review.criticalTypeId) rows.push({ label: `${typedFlag(event)} type`, value: getLabel(reference, review.criticalTypeId) });
  if (review.furtherAnalysis !== null && review.furtherAnalysis !== undefined) {
    rows.push({ label: 'Further analysis', value: review.furtherAnalysis ? 'Yes' : 'No' });
  }
  return <SummaryList rows={rows} />;
}

// Reason chips, and the comment Bad quality needs (003 FR-012).
function InvalidFields({ review, set, errorsFor }) {
  return (
    <>
      <ChipGroup
        id="invalidReason"
        label="Why is it not valid?"
        required
        value={review.invalidReason}
        options={INVALID_REASONS.map((reason) => ({ value: reason, label: reason }))}
        onChange={(invalidReason) => set({ invalidReason })}
        errors={errorsFor('invalidReason')}
      />
      {review.invalidReason === REASON_NEEDING_COMMENT && (
        <div className="field">
          <Textarea
            id="invalidComment"
            label="What makes the report of bad quality?"
            required
            minRows={3}
            autosize
            value={review.invalidComment}
            error={errorsFor('invalidComment')[0]?.message}
            onChange={(e) => set({ invalidComment: e.target.value })}
          />
        </div>
      )}
    </>
  );
}

// Severity or loss matrices, the Environment SIP question and the SIP / SPL type (003 FR-022 to
// FR-027).
function SeverityFields({ event, review, set, errorsFor }) {
  const { reference } = useApp();
  const assessment = assessmentFor(event);
  const flags = criticalFlagsOf(event, review);
  const flag = typedFlag(event);
  return (
    <>
      {assessment.potential && (
        <SeverityMatrix id="potential" title={assessment.potentialTitle} matrix={assessment.matrix} value={review.potential} onChange={(potential) => set({ potential })} errors={errorsFor('potential')} />
      )}
      {assessment.actual && (
        <SeverityMatrix id="actual" title={assessment.actualTitle} matrix={assessment.matrix} value={review.actual} onChange={(actual) => set({ actual })} errors={errorsFor('actual')} />
      )}
      {assessment.sipQuestion && (
        <YesNoField
          id="sipConfirmed"
          label="Is this event a SIP?"
          hint="Serious Incident Potential: could it have caused serious harm under slightly different circumstances?"
          value={review.sipConfirmed}
          onChange={(sipConfirmed) => set({ sipConfirmed })}
          errors={errorsFor('sipConfirmed')}
        />
      )}
      {flags.length > 0 && (
        <p className="message message--error critical-notice" role="status">
          Critical event: {flags.join(' · ')}
        </p>
      )}
      {flag && flags.includes(flag) && (
        <SelectField
          id="criticalTypeId"
          label={`${flag} type`}
          required
          searchable
          value={review.criticalTypeId}
          options={getReferenceList(reference, assessment.typeList)}
          onChange={(criticalTypeId) => set({ criticalTypeId })}
          errors={errorsFor('criticalTypeId')}
        />
      )}
    </>
  );
}

// Statement, the pillar's lists, severity and "further analyze" of a valid event.
function ValidFields({ event, review, set, errorsFor, masterData }) {
  const assessment = assessmentFor(event);
  const critical = criticalFlagsOf(event, review).length > 0;
  return (
    <>
      <div className="field">
        <Textarea
          id="statement"
          label="Event statement"
          description="Starts from the reported description: rewrite it to be shared. Do not name the reporter."
          required
          minRows={4}
          autosize
          value={review.statement}
          error={errorsFor('statement')[0]?.message}
          onChange={(e) => set({ statement: e.target.value })}
        />
      </div>
      {!masterData && <p>Loading the lists…</p>}
      {masterData &&
        reviewLists(event.pillarId).map((list) => {
          const required = assessment.requiredListIds.includes(list.id);
          return (
            <div className="field" key={list.id}>
              <MultiSelect
                id={`list-${list.id}`}
                label={required ? list.label : `${list.label} (optional)`}
                required={required}
                searchable
                clearable
                data={listOptions(list, masterData.values, masterData.activations, event.plantId)}
                value={review.classification[list.id] || []}
                error={errorsFor(`list-${list.id}`)[0]?.message}
                onChange={(ids) => set({ classification: { ...review.classification, [list.id]: ids } })}
              />
            </div>
          );
        })}
      <SeverityFields event={event} review={review} set={set} errorsFor={errorsFor} />
      {asksFurtherAnalysis(event) && (
        <YesNoField
          id="furtherAnalysis"
          label="Do you want to further analyze?"
          hint={
            critical
              ? 'Proposed for a critical event: Yes opens a root cause analysis.'
              : 'Yes opens a root cause analysis; No goes on to the next required step.'
          }
          value={review.furtherAnalysis}
          onChange={(furtherAnalysis) => set({ furtherAnalysis })}
          errors={errorsFor('furtherAnalysis')}
        />
      )}
    </>
  );
}

// The Review step (003): a configured reviewer takes the event, then says whether it is valid.
// Invalid → Archived with a reason; valid → statement, classification and severity, then Root cause
// analysis (required or asked for), the next required step, or Closed.
export default function ReviewStep({ event, onSaved }) {
  const { user, users } = useApp();
  const [masterData, setMasterData] = useState(null);
  const [review, setReview] = useState(() => startingReview(event));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const reviewerId = event.review?.reviewerId;
  const errorsFor = (field) => (errors[field] ? [{ field, message: errors[field] }] : []);
  // A critical event proposes "further analyze" = Yes until the reviewer answers (FR-028).
  const proposed = criticalFlagsOf(event, review).length > 0 ? true : null;
  const effective = { ...review, furtherAnalysis: review.furtherAnalysis ?? proposed };
  const set = (changes) => setReview((current) => ({ ...current, ...changes }));

  useEffect(() => {
    getMasterData().then(setMasterData);
  }, []);

  async function save(updated, alerts) {
    setSaving(true);
    try {
      onSaved(await saveReviewStep({ ...updated, updatedBy: user.id, updatedAt: new Date().toISOString() }, alerts));
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    const found = validateReview(effective, event, getLabel(users, event.reporterId));
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const reviewed = completeReview(event, effective, new Date().toISOString());
    const alerts =
      reviewed.status === 'Archived'
        ? archiveRecipients(event, user.id).map((recipientId) => ({ recipientId, type: `Event archived (${review.invalidReason})` }))
        : [];
    await save(reviewed, alerts);
  }

  if (event.review?.decision) {
    return <ReviewSummary event={event} masterData={masterData} />;
  }
  if (!reviewerId) {
    return (
      <Alert color="yellow" variant="light" title="This event is waiting for a reviewer.">
        {canStartReview(user, event) ? (
          <>
            <p>Assign yourself to review it. The other reviewers will no longer be able to.</p>
            <Button type="button" disabled={saving} onClick={() => save(claimReview(event, user.id, new Date().toISOString()), [])}>
              Assign myself as reviewer
            </Button>
          </>
        ) : (
          <p>
            Reviewers: {(event.workflow.phases.review.reviewerIds || []).map((id) => getLabel(users, id)).join(', ') || '—'}
          </p>
        )}
      </Alert>
    );
  }
  if (reviewerId !== user.id) {
    return (
      <Alert color="blue" variant="light">
        {getLabel(users, reviewerId)} is reviewing this event.
        {isReviewer(user, event) && ' Only the assigned reviewer can complete the review.'}
      </Alert>
    );
  }

  return (
    // noValidate: the app's own checks show their messages next to the fields (not the browser's).
    <form
      className="review-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Alert color="blue" variant="light" mb="md">
        You are the assigned reviewer for this event.
      </Alert>
      <YesNoField
        id="decision"
        label="Is this a valid event?"
        hint="Not valid: a duplicate, not useful, or of bad quality. It will be archived."
        value={review.decision === null ? null : review.decision === 'valid'}
        onChange={(valid) => set({ decision: valid ? 'valid' : 'invalid' })}
        errors={errorsFor('decision')}
      />
      {review.decision === 'invalid' && <InvalidFields review={review} set={set} errorsFor={errorsFor} />}
      {review.decision === 'valid' && (
        <ValidFields event={event} review={effective} set={set} errorsFor={errorsFor} masterData={masterData} />
      )}
      <Button type="submit" disabled={saving}>
        {review.decision === 'invalid' ? 'Archive event' : 'Complete review'}
      </Button>
    </form>
  );
}
