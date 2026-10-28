import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, MultiSelect, Select, Textarea } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { availableValues, injuriesFor } from '../../../../shared/platform/masterData.js';
import { groupsCovering } from '../../../../shared/platform/groups.js';
import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { getMasterData } from '../../../../shared/platform/platformData.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { saveWorkflowStep } from '../data/db.js';
import ChipGroup from '../create/ChipGroup.jsx';
import { SelectField, YesNoField } from '../create/fields.jsx';
import { getLabel, getReferenceList } from '../logic/lookups.js';
import { reviewCandidates } from '../logic/notifications.js';
import {
  canStartReview,
  claimReview,
  completeReview,
  INVALID_REASONS,
  isReviewer,
  leadsToAnalysis,
  reviewLists,
  summaryLists,
  REASON_NEEDING_COMMENT,
  SINGLE_CHOICE_LISTS,
  validateReview,
} from '../logic/review.js';
import { assigneeIds, canPerformAnalysis } from '../logic/rootCause.js';
import { assessmentFor, criticalFlagsOf, ratingText, typedFlag } from '../logic/severity.js';
import SeverityMatrix from './SeverityMatrix.jsx';
import SummaryList from './SummaryList.jsx';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';

// Options of one master data list at the event's plant; Body Parts grouped by category; Injuries
// only those of the chosen body parts (012 RV-6).
function listOptions(list, values, activations, plantId, classification = {}) {
  let available = availableValues(values, activations, { listId: list.id, plantId });
  if (list.id === 'injuries') available = injuriesFor(available, classification.bodyParts || []);
  const items = available.map((value) => ({
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
// The form starts from the event: the statement from its description, the Environment SIP answer
// from the submission; HCL and SPL start unanswered (003 FR-013, FR-025; 006 review remarks).
function startingReview(event) {
  const submittedSip = event.riskQuestion?.type === 'SIP' ? event.riskQuestion.answer : null;
  const question = assessmentFor(event).flagQuestion;
  return {
    decision: null,
    invalidReason: '',
    invalidComment: '',
    statement: event.description || '',
    classification: {},
    potential: null,
    actual: null,
    flagConfirmed: question?.flag === 'SIP' ? submittedSip : null,
    criticalTypeId: '',
    rcaAssignees: { userIds: [], groupIds: [] },
  };
}

// "Ana Ribeiro, Lyon H&S investigation team" for a designation (004).
export function describeAssignees(assignees, users) {
  if (!assignees) return '';
  const names = assignees.userIds.map((id) => getLabel(users, id));
  const groups = assignees.groupIds.map((id) => investigationGroups.find((group) => group.id === id)?.name ?? id);
  return [...names, ...groups].join(', ');
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
  for (const list of summaryLists(event, review.classification || {})) {
    rows.push({ label: list.label, value: (review.classification[list.id] || []).map(valueName).join(', ') });
  }
  if (assessment.potential) rows.push({ label: assessment.potentialTitle, value: ratingText(assessment.matrix, review.potential) });
  if (assessment.actual) rows.push({ label: assessment.actualTitle, value: ratingText(assessment.matrix, review.actual) });
  if (assessment.flagQuestion) rows.push({ label: assessment.flagQuestion.label, value: review.flagConfirmed ? 'Yes' : 'No' });
  rows.push({ label: 'Critical', value: review.criticalFlags?.join(' · ') || 'No' });
  if (review.criticalTypeId) rows.push({ label: `${typedFlag(event)} type`, value: getLabel(reference, review.criticalTypeId) });
  if (review.furtherAnalysis !== null && review.furtherAnalysis !== undefined) {
    rows.push({ label: 'Further analysis', value: review.furtherAnalysis ? 'Yes' : 'No' });
  }
  if (review.rcaAssignees) {
    rows.push({ label: 'Root cause analysis by', value: describeAssignees(review.rcaAssignees, users) });
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

// The SIP type, asked inside the block that makes the event SIP (third review).
function CriticalType({ event, review, set, errorsFor }) {
  const { reference } = useApp();
  const flag = typedFlag(event);
  if (!flag || !criticalFlagsOf(event, review).includes(flag)) return null;
  return (
    <>
      <p className="message message--error critical-notice" role="status">
        Critical event: {flag}. Choose its type.
      </p>
      <SelectField
        id="criticalTypeId"
        label={`${flag} type`}
        required
        searchable
        value={review.criticalTypeId}
        options={getReferenceList(reference, assessmentFor(event).typeList)}
        onChange={(criticalTypeId) => set({ criticalTypeId })}
        errors={errorsFor('criticalTypeId')}
      />
    </>
  );
}

// Severity: one framed block for the potential (with the SIP type) and one for the actual outcome;
// for Environment and Industrial Risk, the SIP, HCL or SPL question (003 FR-022 to FR-027; 006).
// Only SIP asks a type.
function SeverityFields({ event, review, set, errorsFor }) {
  const assessment = assessmentFor(event);
  const actualHigh = assessment.actual && review.actual?.band === 'high';
  const question = assessment.flagQuestion;
  return (
    <>
      {assessment.potential && (
        <div className="assessment-block">
          <SeverityMatrix
            id="potential"
            title={assessment.potentialTitle}
            description="The credible worst case, had the circumstances been slightly different."
            matrix={assessment.matrix}
            value={review.potential}
            onChange={(potential) => set({ potential })}
            errors={errorsFor('potential')}
          />
          <CriticalType event={event} review={review} set={set} errorsFor={errorsFor} />
        </div>
      )}
      {assessment.actual && (
        <div className="assessment-block">
          <SeverityMatrix
            id="actual"
            title={assessment.actualTitle}
            description="What actually happened."
            matrix={assessment.matrix}
            value={review.actual}
            onChange={(actual) => set({ actual })}
            errors={errorsFor('actual')}
          />
          {actualHigh && (
            <p className="message message--error critical-notice" role="status">
              Critical event: {assessment.highActual}.
            </p>
          )}
        </div>
      )}
      {question && (
        <div className="assessment-block">
          <YesNoField
            id="flagConfirmed"
            label={question.label}
            hint={question.hint}
            value={review.flagConfirmed}
            onChange={(flagConfirmed) => set({ flagConfirmed })}
            errors={errorsFor('flagConfirmed')}
          />
          {question.flag === typedFlag(event) ? (
            <CriticalType event={event} review={review} set={set} errorsFor={errorsFor} />
          ) : (
            review.flagConfirmed === true && (
              <p className="message message--error critical-notice" role="status">
                Critical event: {question.flag}.
              </p>
            )
          )}
        </div>
      )}
    </>
  );
}

// Who will perform the root cause analysis: the plant's users who can see the pillar and the
// groups covering the plant and pillar, in one multiple choice (004 FR-001).
export function AssigneesField({ event, review, set, errorsFor }) {
  const { users } = useApp();
  const people = users.filter((person) => getPillarIdsForPlant(person, event.plantId).includes(event.pillarId));
  const groups = groupsCovering(investigationGroups, event);
  const data = [
    { group: 'Users', items: people.map((person) => ({ value: `user:${person.id}`, label: `${person.name} — ${person.role}` })) },
    { group: 'Groups', items: groups.map((group) => ({ value: `group:${group.id}`, label: group.name })) },
  ];
  const assignees = review.rcaAssignees;
  const value = [...assignees.userIds.map((id) => `user:${id}`), ...assignees.groupIds.map((id) => `group:${id}`)];

  function change(values) {
    const idsOf = (prefix) => values.filter((item) => item.startsWith(prefix)).map((item) => item.slice(prefix.length));
    set({ rcaAssignees: { userIds: idsOf('user:'), groupIds: idsOf('group:') } });
  }

  return (
    <div className="field">
      <MultiSelect
        id="rcaAssignees"
        label="Who will perform the root cause analysis?"
        description="They and the members of the chosen groups get an alert and fill in the analysis."
        required
        searchable
        // Typing highlights the first match, so Enter picks it with the keyboard.
        selectFirstOptionOnChange
        clearable
        data={data}
        value={value}
        error={errorsFor('rcaAssignees')[0]?.message}
        onChange={change}
      />
    </div>
  );
}

// A titled part of the review form.
function ReviewSection({ title, children }) {
  return (
    <section className="review-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

// The statement and the pillar's master data lists (required ones marked).
function ClassificationFields({ event, review, set, errorsFor, masterData }) {
  const assessment = assessmentFor(event);
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
        reviewLists(event).map((list) => {
          const required = assessment.requiredListIds.includes(list.id);
          const common = {
            id: `list-${list.id}`,
            label: required ? list.label : `${list.label} (optional)`,
            required,
            searchable: true,
            clearable: true,
            data: listOptions(list, masterData.values, masterData.activations, event.plantId, review.classification),
            error: errorsFor(`list-${list.id}`)[0]?.message,
          };
          // Injuries wait for the body parts; removing a body part drops the injuries it offered.
          if (list.id === 'injuries' && !(review.classification.bodyParts || []).length) {
            Object.assign(common, { placeholder: 'Choose the body parts first.', disabled: true });
          }
          const setIds = (ids) => {
            const classification = { ...review.classification, [list.id]: ids };
            if (list.id === 'bodyParts' && classification.injuries) {
              const offered = injuriesFor(masterData.values, ids).map((value) => value.id);
              classification.injuries = classification.injuries.filter((id) => offered.includes(id));
            }
            set({ classification });
          };
          return (
            <div className="field" key={list.id}>
              {/* Standards and Hazards take a single value, kept as a one-value list (005 remarks). */}
              {SINGLE_CHOICE_LISTS.includes(list.id) ? (
                <Select {...common} value={review.classification[list.id]?.[0] ?? null} onChange={(id) => setIds(id ? [id] : [])} />
              ) : (
                <MultiSelect {...common} value={review.classification[list.id] || []} onChange={setIds} />
              )}
            </div>
          );
        })}
    </>
  );
}

// Title of the severity part: injuries (safety) or the SIP, HCL or SPL question.
function severityTitle(assessment) {
  return assessment.flagQuestion?.title ?? 'Severity';
}

// A valid event, in titled parts: statement and lists, severity, and the next step.
function ValidFields({ event, review, set, errorsFor, masterData }) {
  const assessment = assessmentFor(event);
  const hasSeverity = assessment.potential || assessment.actual || assessment.flagQuestion;
  return (
    <>
      <ReviewSection title="Event statement and classification">
        <ClassificationFields event={event} review={review} set={set} errorsFor={errorsFor} masterData={masterData} />
      </ReviewSection>
      {hasSeverity && (
        <ReviewSection title={severityTitle(assessment)}>
          <SeverityFields event={event} review={review} set={set} errorsFor={errorsFor} />
        </ReviewSection>
      )}
      {/* The workflow decides: its level, or its critical row once the event is critical (012 RV-10). */}
      {leadsToAnalysis(event, review) && (
        <ReviewSection title="Next step">
          <AssigneesField event={event} review={review} set={set} errorsFor={errorsFor} />
        </ReviewSection>
      )}
    </>
  );
}

// The Review step (003): a configured reviewer takes the event, then says whether it is valid.
// Invalid → Archived with a reason; valid → statement, classification and severity, then Root cause
// analysis (required or asked for), the next required step, or Closed.
export default function ReviewStep({ event, onSaved }) {
  const { user, users } = useApp();
  const navigate = useNavigate();
  const [masterData, setMasterData] = useState(null);
  const [review, setReview] = useState(() => startingReview(event));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const reviewerId = event.review?.reviewerId;
  const errorsFor = (field) => (errors[field] ? [{ field, message: errors[field] }] : []);
  const set = (changes) => setReview((current) => ({ ...current, ...changes }));

  useEffect(() => {
    getMasterData().then(setMasterData);
  }, []);

  async function save(updated, alerts, options) {
    setSaving(true);
    try {
      onSaved(await saveWorkflowStep({ ...updated, updatedBy: user.id, updatedAt: new Date().toISOString() }, alerts, options));
    } finally {
      setSaving(false);
    }
  }

  async function submit() {
    const found = validateReview(review, event, getLabel(users, event.reporterId));
    setErrors(found);
    if (Object.keys(found).length > 0) scrollToFirstProblemSoon();
    if (Object.keys(found).length > 0) return;
    const reviewed = completeReview(event, review, new Date().toISOString());
    await save(reviewed, reviewCandidates(reviewed, assigneeIds(reviewed, investigationGroups, users)));
    // A reviewer who also performs the analysis goes straight to it; others see the review summary
    // (004 FR-003a).
    if (canPerformAnalysis(user, reviewed, investigationGroups)) {
      navigate(`/events/${event.recordNumber}/steps/rootCause`);
    }
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
            <Button type="button" disabled={saving} onClick={() => save(claimReview(event, user.id, new Date().toISOString()), [], { clearReviewAlerts: true })}>
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
        <ValidFields event={event} review={review} set={set} errorsFor={errorsFor} masterData={masterData} />
      )}
      <div className="form-actions">
        <Button type="submit" disabled={saving}>
          {review.decision === 'invalid' ? 'Archive event' : 'Complete review'}
        </Button>
      </div>
    </form>
  );
}
