import { useEffect, useState } from 'react';
import { Alert, Button, MultiSelect, Textarea } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { availableValues, listsForPillar } from '../../../../shared/platform/masterData.js';
import { getMasterData } from '../../../../shared/platform/platformData.js';
import { saveReviewStep } from '../data/db.js';
import ChipGroup from '../create/ChipGroup.jsx';
import { YesNoField } from '../create/fields.jsx';
import { getLabel } from '../logic/lookups.js';
import { canStartReview, claimReview, completeReview, INVALID_REASONS, isReviewer, validateReview } from '../logic/review.js';
import SummaryList from './SummaryList.jsx';

const EMPTY_REVIEW = { decision: null, invalidReason: '', statement: '', comments: '', classification: {} };

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

function ReviewSummary({ event, masterData }) {
  const { users } = useApp();
  const review = event.review;
  const valueName = (id) => masterData?.values.find((value) => value.id === id)?.name ?? id;
  const rows = [
    { label: 'Reviewer', value: getLabel(users, review.reviewerId) },
    { label: 'Reviewed on', value: new Date(review.reviewedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) },
    { label: 'Valid event', value: review.decision === 'valid' ? 'Yes' : 'No' },
  ];
  if (review.decision === 'invalid') {
    rows.push({ label: 'Reason', value: review.invalidReason });
  } else {
    rows.push({ label: 'Event statement', value: review.statement });
    for (const list of reviewLists(event.pillarId)) {
      rows.push({ label: list.label, value: (review.classification[list.id] || []).map(valueName).join(', ') });
    }
  }
  rows.push({ label: 'Comments', value: review.comments });
  return <SummaryList rows={rows} />;
}

// The Review step (review 2026-10-25): a configured reviewer takes the event, then says whether it
// is valid. Invalid → Archived with a reason; valid → statement and classification, then the next
// required step, or Closed when there is none.
export default function ReviewStep({ event, onSaved }) {
  const { user, users } = useApp();
  const [masterData, setMasterData] = useState(null);
  const [review, setReview] = useState(EMPTY_REVIEW);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const lists = reviewLists(event.pillarId);
  const reviewerId = event.review?.reviewerId;
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
    const found = validateReview(review, getLabel(users, event.reporterId));
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const now = new Date().toISOString();
    const reviewed = completeReview(event, review, now);
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
    <form
      className="review-form"
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
        errors={errors.decision ? [{ field: 'decision', message: errors.decision }] : []}
      />
      {review.decision === 'invalid' && (
        <ChipGroup
          id="invalidReason"
          label="Why is it not valid?"
          required
          value={review.invalidReason}
          options={INVALID_REASONS.map((reason) => ({ value: reason, label: reason }))}
          onChange={(invalidReason) => set({ invalidReason })}
          errors={errors.invalidReason ? [{ field: 'invalidReason', message: errors.invalidReason }] : []}
        />
      )}
      {review.decision === 'valid' && (
        <>
          <div className="field">
            <Textarea
              id="statement"
              label="Event statement"
              description="What happened, written to be shared. Do not name the reporter."
              required
              minRows={4}
              autosize
              value={review.statement}
              error={errors.statement}
              onChange={(e) => set({ statement: e.target.value })}
            />
          </div>
          {!masterData && <p>Loading the lists…</p>}
          {masterData &&
            lists.map((list) => (
              <div className="field" key={list.id}>
                <MultiSelect
                  id={`classification-${list.id}`}
                  label={`${list.label} (optional)`}
                  searchable
                  clearable
                  data={listOptions(list, masterData.values, masterData.activations, event.plantId)}
                  value={review.classification[list.id] || []}
                  onChange={(ids) => set({ classification: { ...review.classification, [list.id]: ids } })}
                />
              </div>
            ))}
        </>
      )}
      <div className="field">
        <Textarea
          id="reviewComments"
          label="Comments (optional)"
          minRows={2}
          autosize
          value={review.comments}
          onChange={(e) => set({ comments: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={saving}>
        {review.decision === 'invalid' ? 'Archive event' : 'Complete review'}
      </Button>
    </form>
  );
}
