import { useEffect, useRef, useState } from 'react';
import { useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { findEvent, getByIndex, saveChanges, saveDraft, StorageFullError, submitEvent } from '../data/db.js';
import { canEditEvent, isEventVisible } from '../logic/access.js';
import { SECTION_TITLES } from '../logic/eventSummary.js';
import { getReferenceList, toDateString } from '../logic/lookups.js';
import { SECTIONS, validateEventForSubmit, validateSection } from '../logic/validation.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import ClassificationSection from './ClassificationSection.jsx';
import DetailsSection from './DetailsSection.jsx';
import GeneralInfoSection from './GeneralInfoSection.jsx';
import ImmediateActionsSection from './ImmediateActionsSection.jsx';
import LocationSection from './LocationSection.jsx';

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
    involvedPersonId: '',
    involvedPersonName: '',
    involvedActivity: '',
    firstAidTreatmentId: '',
    recurrence: null,
    comments: '',
    sharedWithIds: [],
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

// The page element of a field reported by validation (immediate actions are flagged per card).
function elementIdFor(field) {
  const actionMatch = /^immediateActions\.(\d+)$/.exec(field);
  return actionMatch ? `immediate-action-${actionMatch[1]}` : field;
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

// The event form: one continuous page with every section (FR-002), used to create and to edit.
function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, context, users, reference, setFormDirty } = useApp();
  const [loadState, setLoadState] = useState(id ? 'loading' : 'ready');
  const [event, setEvent] = useState(() => (id ? null : newEvent(user, context, reference)));
  const [attachments, setAttachments] = useState([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  // Missing fields are flagged only after the first Submit (FR-014).
  const [showErrors, setShowErrors] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [result, setResult] = useState(null);
  const [scrollToField, setScrollToField] = useState(null);

  // Ask before leaving with unsaved changes (closing the tab is handled by the app).
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname,
  );

  // Lets the header (and closing the tab) know the form has unsaved changes.
  useEffect(() => {
    setFormDirty(dirty);
    return () => setFormDirty(false);
  }, [dirty, setFormDirty]);

  // A new event follows the header: changing plant or pillar starts it again in the new context.
  const firstContext = useRef(context);
  useEffect(() => {
    if (id || context === firstContext.current) return;
    firstContext.current = context;
    setEvent(newEvent(user, context, reference));
    setAttachments([]);
    setRemovedAttachmentIds([]);
    setShowErrors(false);
    setDirty(false);
  }, [id, context, user, reference]);

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

  // After a refused Submit, bring the first missing field into view.
  useEffect(() => {
    if (!scrollToField) return;
    const element = document.getElementById(elementIdFor(scrollToField));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setScrollToField(null);
  }, [scrollToField]);

  // After a save, show the event's view page with a confirmation banner (FR-015). This runs after
  // the re-render that cleared the unsaved-changes flag, so leaving is not blocked.
  useEffect(() => {
    if (!result) return;
    navigate(`/events/${result.event.recordNumber || result.event.id}`, {
      replace: true,
      state: { saved: result.kind, recordNumber: result.event.recordNumber },
    });
  }, [result, navigate]);

  const isSubmitted = event && event.status === 'Open';

  useEffect(() => {
    document.title = `${isSubmitted ? 'Edit event' : 'New event'} — Event Reporting`;
  }, [isSubmitted]);

  if (loadState === 'loading') return <p className="page">Loading…</p>;
  if (loadState === 'notFound') return <NotAllowed reason="notFound" />;
  if (loadState === 'notAllowed') return <NotAllowed reason="permission" />;
  if (result) return <p className="page">Saving…</p>;

  const options = { now: new Date() };
  const missing = showErrors ? validateEventForSubmit(event, options) : [];

  // changes: the fields to change, or a function of the current event that returns them
  // (used by dictation, which adds to the latest description).
  function update(changes) {
    setEvent((previous) => ({ ...previous, ...(typeof changes === 'function' ? changes(previous) : changes) }));
    setDirty(true);
  }

  function changeAttachments(list) {
    const removed = attachments.filter((item) => !item.isNew && !list.some((kept) => kept.id === item.id));
    setRemovedAttachmentIds((previous) => [...previous, ...removed.map((item) => item.id)]);
    setAttachments(list);
    setDirty(true);
  }

  // kind: 'draft' | 'submit' | 'changes'. Returns true when saved.
  // leaving: saving a draft on the way out (the unsaved-changes dialog), so no view page is opened.
  async function save(kind, { leaving = false } = {}) {
    if (kind !== 'draft') {
      const problems = validateEventForSubmit(event, options);
      if (problems.length > 0) {
        setShowErrors(true);
        setScrollToField(problems[0].field);
        return false;
      }
    }
    setSaving(true);
    setSaveError('');
    const args = { event, attachments, removedAttachmentIds, userId: user.id };
    try {
      let saved;
      if (kind === 'draft') saved = await saveDraft(args);
      else if (kind === 'submit') saved = await submitEvent({ ...args, users });
      else saved = await saveChanges(args);
      setDirty(false);
      if (!leaving) {
        setResult({ kind, event: saved });
      }
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
    if (await save('draft', { leaving: true })) blocker.proceed();
    else blocker.reset();
  }

  return (
    <main className="page page--with-bar">
      <div className="form-titlebar">
        <button type="button" className="icon-button" onClick={() => navigate('/events')}>
          <Icon name="close" label="Close the form" />
        </button>
        <h1>{isSubmitted ? `Edit ${event.recordNumber}` : 'New event'}</h1>
        <span className="form-titlebar-spacer" />
      </div>

      {saveError && (
        <p className="message message--error" role="alert">
          {saveError}
        </p>
      )}
      {missing.length > 0 && (
        <p className="message message--error" role="alert">
          {missing.length === 1 ? '1 required field is' : `${missing.length} required fields are`} missing. They are
          marked below.
        </p>
      )}

      {SECTIONS.map((sectionName) => {
        const Section = SECTION_COMPONENTS[sectionName];
        return (
          <section key={sectionName} className="card form-card" aria-labelledby={`section-${sectionName}`}>
            <h2 id={`section-${sectionName}`}>{SECTION_TITLES[sectionName]}</h2>
            <Section
              event={event}
              update={update}
              errors={showErrors ? validateSection(sectionName, event, options) : []}
              showErrors={showErrors}
              pillarLocked={Boolean(context.pillarId)}
              attachments={attachments}
              setAttachments={changeAttachments}
            />
          </section>
        );
      })}

      <div className="bottom-bar">
        {!isSubmitted && (
          <button type="button" className="button" disabled={saving} onClick={() => save('draft')}>
            Save as draft
          </button>
        )}
        {isSubmitted ? (
          <button type="button" className="button button--primary" disabled={saving} onClick={() => save('changes')}>
            <Icon name="check" size={18} /> Save changes
          </button>
        ) : (
          <button type="button" className="button button--primary" disabled={saving} onClick={() => save('submit')}>
            <Icon name="check" size={18} /> Submit
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
