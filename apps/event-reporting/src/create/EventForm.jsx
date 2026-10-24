import { useEffect, useState } from 'react';
import { Link, useBlocker, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { findEvent, getByIndex, saveChanges, saveDraft, StorageFullError, submitEvent } from '../data/db.js';
import { canEditEvent, isEventVisible } from '../logic/access.js';
import { SECTION_TITLES } from '../logic/eventSummary.js';
import { getReferenceList, toDateString } from '../logic/lookups.js';
import { SECTIONS, validateEventForSubmit, validateSection } from '../logic/validation.js';
import NotAllowed from '../shell/NotAllowed.jsx';
import ClassificationSection from './ClassificationSection.jsx';
import DetailsSection from './DetailsSection.jsx';
import GeneralInfoSection from './GeneralInfoSection.jsx';
import ImmediateActionsSection from './ImmediateActionsSection.jsx';
import LocationSection from './LocationSection.jsx';
import SummarySection from './SummarySection.jsx';

const STEPS = [...SECTIONS, 'summary'];
const STEP_TITLES = { ...SECTION_TITLES, summary: 'Summary' };

const SECTION_COMPONENTS = {
  classification: ClassificationSection,
  location: LocationSection,
  general: GeneralInfoSection,
  details: DetailsSection,
  actions: ImmediateActionsSection,
};

// A new, empty event in the user's current business, plant and (optional) pillar.
function newEvent(user, context, reference) {
  const families = getReferenceList(reference, 'family').filter((family) => family.pillarId === context.pillarId);
  return {
    id: null,
    recordNumber: null,
    status: 'Draft',
    businessId: context.businessId,
    plantId: context.plantId,
    pillarId: context.pillarId || '',
    familyCode: families.length === 1 ? families[0].code : '',
    levelCode: '',
    riskQuestion: null,
    location: { departmentId: '', workshopId: '', jobId: '', workstationId: '', taskId: '' },
    taskTypeId: '',
    title: '',
    reporterId: user.id,
    reportDate: toDateString(new Date()),
    eventTime: '',
    shiftMoment: '',
    description: '',
    employeeType: '',
    recurrence: null,
    comments: '',
    feedbackEmails: [],
    diseaseIds: [],
    immediateActions: [],
    attachmentIds: [],
    createdBy: null,
    createdAt: null,
    updatedBy: null,
    updatedAt: null,
    submittedAt: null,
  };
}

function Confirmation({ result }) {
  const { kind, event } = result;
  const eventPath = `/events/${event.recordNumber || event.id}`;
  const titles = { submit: 'Event submitted', draft: 'Draft saved', changes: 'Changes saved' };
  return (
    <main className="page">
      <h1>{titles[kind]}</h1>
      {kind === 'submit' && (
        <p className="message message--success" role="status">
          Event <strong>{event.recordNumber}</strong> was submitted. The Managers of this plant have been alerted.
        </p>
      )}
      {kind === 'draft' && (
        <p className="message message--success" role="status">
          Your draft was saved on this device. Only you can see it.
        </p>
      )}
      {kind === 'changes' && (
        <p className="message message--success" role="status">
          Event <strong>{event.recordNumber}</strong> was updated.
        </p>
      )}
      <div className="button-row">
        {kind === 'draft' ? (
          <Link className="button button--primary" to={`/events/${event.id}/edit`}>
            Continue draft
          </Link>
        ) : (
          <Link className="button button--primary" to={eventPath}>
            View event
          </Link>
        )}
        <Link className="button button--secondary" to="/events/new">
          Report another event
        </Link>
        <Link className="button" to="/events">
          Events
        </Link>
      </div>
    </main>
  );
}

function UnsavedChangesDialog({ canSaveDraft, onSaveDraft, onDiscard, onStay }) {
  return (
    <div className="dialog-backdrop">
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="unsaved-title">
        <h2 id="unsaved-title">Leave this form?</h2>
        <p>You have changes that are not saved.</p>
        <div className="button-row">
          {canSaveDraft && (
            <button type="button" className="button button--primary" onClick={onSaveDraft}>
              Save as draft
            </button>
          )}
          <button type="button" className="button" onClick={onDiscard}>
            Discard changes
          </button>
          <button type="button" className="button button--secondary" onClick={onStay} autoFocus>
            Stay
          </button>
        </div>
      </div>
    </div>
  );
}

function EventForm() {
  const { id } = useParams();
  const { user, context, users, reference } = useApp();
  const [loadState, setLoadState] = useState(id ? 'loading' : 'ready');
  const [event, setEvent] = useState(() => (id ? null : newEvent(user, context, reference)));
  const [attachments, setAttachments] = useState([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [result, setResult] = useState(null);

  // Ask before leaving with unsaved changes, inside the app (blocker) and when closing the tab.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const found = await findEvent(id);
      if (!found || !isEventVisible(user, context, found)) {
        setLoadState('notFound');
        return;
      }
      if (!canEditEvent(user, found)) {
        setLoadState('notAllowed');
        return;
      }
      const stored = await getByIndex('attachments', 'eventId', found.id);
      setAttachments(stored.map((item) => ({ ...item, isNew: false })));
      setEvent(found);
      setLoadState('ready');
    }
    load();
  }, [id, user, context]);

  const isSubmitted = event && event.status === 'Open';

  useEffect(() => {
    document.title = `${isSubmitted ? 'Edit event' : 'Create Event'} — Event Reporting`;
  }, [isSubmitted]);

  if (loadState === 'loading') return <p className="page">Loading…</p>;
  if (loadState === 'notFound') return <NotAllowed reason="notFound" />;
  if (loadState === 'notAllowed') return <NotAllowed reason="permission" />;
  if (result) return <Confirmation result={result} />;

  const step = STEPS[stepIndex];
  const options = {
    now: new Date(),
    attachmentCount: attachments.length,
    subcategories: getReferenceList(reference, 'actionSubcategory'),
  };
  const sectionErrors = showErrors && step !== 'summary' ? validateSection(step, event, options) : [];
  const missing = step === 'summary' ? validateEventForSubmit(event, options) : [];

  function update(changes) {
    setEvent((previous) => ({ ...previous, ...changes }));
    setDirty(true);
  }

  function changeAttachments(list) {
    const removed = attachments.filter((item) => !item.isNew && !list.some((kept) => kept.id === item.id));
    setRemovedAttachmentIds((previous) => [...previous, ...removed.map((item) => item.id)]);
    setAttachments(list);
    setDirty(true);
  }

  function showStep(index) {
    setStepIndex(index);
    window.scrollTo(0, 0);
  }

  function next() {
    if (validateSection(step, event, options).length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    showStep(stepIndex + 1);
  }

  function back() {
    setShowErrors(false);
    showStep(stepIndex - 1);
  }

  function goToSection(sectionName) {
    setShowErrors(true);
    showStep(STEPS.indexOf(sectionName));
  }

  // kind: 'draft' | 'submit' | 'changes'. Returns true when saved.
  async function save(kind) {
    setSaving(true);
    setSaveError('');
    const args = { event, attachments, removedAttachmentIds, userId: user.id };
    try {
      let saved;
      if (kind === 'draft') saved = await saveDraft(args);
      else if (kind === 'submit') saved = await submitEvent({ ...args, users });
      else saved = await saveChanges(args);
      setDirty(false);
      setResult({ kind, event: saved });
      return true;
    } catch (error) {
      // Nothing typed is lost: the form keeps its state so the user can fix and retry.
      setSaveError(error instanceof StorageFullError ? error.message : 'The event could not be saved. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveDraftAndLeave() {
    if (await save('draft')) blocker.proceed();
    else blocker.reset();
  }

  const Section = SECTION_COMPONENTS[step];

  return (
    <main className="page">
      <h1>{isSubmitted ? `Edit event ${event.recordNumber}` : 'Create Event'}</h1>
      <div className="progress">
        <p>
          Section {stepIndex + 1} of {STEPS.length}: <strong>{STEP_TITLES[step]}</strong>
        </p>
        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {saveError && (
        <p className="message message--error" role="alert">
          {saveError}
        </p>
      )}

      <section className="card" aria-label={STEP_TITLES[step]}>
        {step === 'summary' ? (
          <SummarySection event={event} attachmentCount={attachments.length} missing={missing} goToSection={goToSection} />
        ) : (
          <Section
            event={event}
            update={update}
            errors={sectionErrors}
            showErrors={showErrors}
            pillarLocked={Boolean(context.pillarId)}
            attachments={attachments}
            setAttachments={changeAttachments}
          />
        )}
      </section>

      <div className="button-row">
        {stepIndex > 0 && (
          <button type="button" className="button" onClick={back}>
            Back
          </button>
        )}
        {step !== 'summary' && (
          <button type="button" className="button button--primary" onClick={next}>
            Next
          </button>
        )}
        {!isSubmitted && (
          <button type="button" className="button button--secondary" disabled={saving} onClick={() => save('draft')}>
            Save as Draft
          </button>
        )}
        {step === 'summary' && !isSubmitted && (
          <button type="button" className="button button--primary" disabled={saving || missing.length > 0} onClick={() => save('submit')}>
            Submit
          </button>
        )}
        {step === 'summary' && isSubmitted && (
          <button type="button" className="button button--primary" disabled={saving || missing.length > 0} onClick={() => save('changes')}>
            Save changes
          </button>
        )}
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog
          canSaveDraft={!isSubmitted}
          onSaveDraft={saveDraftAndLeave}
          onDiscard={() => blocker.proceed()}
          onStay={() => blocker.reset()}
        />
      )}
    </main>
  );
}

// A fresh form each time the page is opened, even from the same address ("Report another event").
export default function EventFormPage() {
  const location = useLocation();
  return <EventForm key={location.key} />;
}
