import { useEffect, useRef, useState } from 'react';
import { Navigate, useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Paper, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getWorkflowSettings } from '../../../../shared/platform/platformData.js';
import { workflowForEvent } from '../../../../shared/platform/workflow.js';
import { findEvent, getByIndex, saveChanges, saveDraft, StorageFullError, submitEvent } from '../data/db.js';
import { canEditEvent, isEventVisible } from '../logic/access.js';
import { SECTION_TITLES } from '../logic/eventSummary.js';
import { getReferenceList, toDateString } from '../logic/lookups.js';
import { validateEventForSubmit, validateSection } from '../logic/validation.js';
import Icon from '../shell/Icon.jsx';
import NotAllowed from '../shell/NotAllowed.jsx';
import ClassificationSection from './ClassificationSection.jsx';
import DetailsSection from './DetailsSection.jsx';
import GeneralInfoSection from './GeneralInfoSection.jsx';
import ImmediateActionsSection from './ImmediateActionsSection.jsx';
import LocationSection from './LocationSection.jsx';

// Left column: what happened and where; right column: who and what was done (review 2026-10-25).
const COLUMNS = [
  ['classification', 'location', 'details'],
  ['general', 'actions'],
];

// A draft saves itself this long after the last change (review 2026-10-25).
const AUTO_SAVE_DELAY = 2000;

// The other sections depend on the pillar, type and level, so they open once those are chosen.
function isClassified(event) {
  return Boolean(event.pillarId && event.familyCode && event.levelCode);
}

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

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
    firstAidTreatmentIds: [],
    firstAidOther: '',
    recurrence: null,
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
// embedded: shown inside the Submission step of a submitted event's page (003, third review), with
// no title bar; the standalone page is only for new events and drafts.
export function EventForm({ embedded = false }) {
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
  const [autoSave, setAutoSave] = useState({ state: 'idle', at: null }); // idle | saving | saved | error
  // Counts changes, so an automatic save only clears "unsaved" when nothing changed meanwhile.
  const changeCount = useRef(0);

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
      // A submitted event is edited on its own page, not on a separate form page.
      if (!embedded && found.status !== 'Draft') {
        setEvent(found);
        setLoadState('eventPage');
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

  // Drafts save themselves a moment after the last change, once classified, and the form stays
  // open. The event gets its id from the first save, so later saves update the same draft.
  useEffect(() => {
    if (!event || !dirty || saving || event.status !== 'Draft' || !isClassified(event)) return undefined;
    const timer = setTimeout(async () => {
      const changesSaved = changeCount.current;
      setAutoSave({ state: 'saving', at: null });
      try {
        const saved = await saveDraft({ event, attachments, removedAttachmentIds, userId: user.id });
        const { id: savedId, createdBy, createdAt, updatedBy, updatedAt } = saved;
        setEvent((current) => ({ ...current, id: savedId, createdBy, createdAt, updatedBy, updatedAt }));
        const savedAttachmentIds = attachments.map((item) => item.id);
        setAttachments((current) => current.map((item) => (savedAttachmentIds.includes(item.id) ? { ...item, isNew: false } : item)));
        setRemovedAttachmentIds((current) => current.filter((removedId) => !removedAttachmentIds.includes(removedId)));
        if (changeCount.current === changesSaved) setDirty(false);
        setAutoSave({ state: 'saved', at: new Date(updatedAt) });
      } catch {
        setAutoSave({ state: 'error', at: null });
      }
    }, AUTO_SAVE_DELAY);
    return () => clearTimeout(timer);
  }, [event, attachments, removedAttachmentIds, dirty, saving, user.id]);

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
      state: { saved: result.kind, recordNumber: result.event.recordNumber, status: result.event.status },
    });
  }, [result, navigate]);

  // Open or Closed: already submitted, so it is edited instead of submitted again.
  const isSubmitted = event && event.status !== 'Draft';

  useEffect(() => {
    // Embedded, the event's page sets the title.
    if (!embedded) document.title = `${isSubmitted ? 'Edit event' : 'New event'} — Event Reporting`;
  }, [isSubmitted, embedded]);

  if (loadState === 'loading') return <p className="page">Loading…</p>;
  if (loadState === 'notFound') return <NotAllowed reason="notFound" />;
  if (loadState === 'eventPage') return <Navigate to={`/events/${event.recordNumber}/steps/submission`} replace />;
  if (loadState === 'notAllowed') return <NotAllowed reason="permission" />;
  if (result) return <p className="page">Saving…</p>;

  const options = { now: new Date() };
  const missing = showErrors ? validateEventForSubmit(event, options) : [];

  // changes: the fields to change, or a function of the current event that returns them
  // (used by dictation, which adds to the latest description).
  function update(changes) {
    setEvent((previous) => ({ ...previous, ...(typeof changes === 'function' ? changes(previous) : changes) }));
    changeCount.current += 1;
    setDirty(true);
  }

  function changeAttachments(list) {
    const removed = attachments.filter((item) => !item.isNew && !list.some((kept) => kept.id === item.id));
    setRemovedAttachmentIds((previous) => [...previous, ...removed.map((item) => item.id)]);
    setAttachments(list);
    changeCount.current += 1;
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
      else if (kind === 'submit') {
        // The workflow in force now, from the Control Panel settings (002 FR-012).
        const workflow = workflowForEvent(await getWorkflowSettings(event.pillarId), users, event);
        saved = await submitEvent({ ...args, users, workflow });
      }
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
    <FormWrapper embedded={embedded}>
      {!embedded && (
      <div className="form-titlebar">
        <button type="button" className="icon-button" onClick={() => navigate('/events')}>
          <Icon name="close" label="Close the form" />
        </button>
        <Title order={1}>{isSubmitted ? `Edit ${event.recordNumber}` : 'New event'}</Title>
        {!isSubmitted && (
          <span className="autosave-status" role="status">
            {!isClassified(event) && 'Saves automatically once classified'}
            {isClassified(event) && autoSave.state === 'saving' && 'Saving…'}
            {isClassified(event) && autoSave.state === 'saved' && !dirty && `Draft saved at ${formatTime(autoSave.at)}`}
            {isClassified(event) && autoSave.state === 'error' && 'Could not save automatically — use Save as draft'}
          </span>
        )}
      </div>
      )}

      {saveError && (
        <Alert color="red" variant="light" role="alert" mb="md">{saveError}</Alert>
      )}
      {missing.length > 0 && (
        <Alert color="red" variant="light" role="alert" mb="md">
          {missing.length === 1 ? '1 required field is' : `${missing.length} required fields are`} missing. They are
          marked below.
        </Alert>
      )}

      {COLUMNS.map((column) => (
        <div key={column[0]} className="form-column">
          {column.map((sectionName) => {
            const Section = SECTION_COMPONENTS[sectionName];
            const locked = sectionName !== 'classification' && !isClassified(event);
            return (
              <Paper key={sectionName} component="section" withBorder shadow="xs" radius="md" p="xl" className={`card form-card${locked ? ' form-card--locked' : ''}`} aria-labelledby={`section-${sectionName}`}>
                <Title order={2} size="h3" id={`section-${sectionName}`}>{SECTION_TITLES[sectionName]}</Title>
                {locked && <p className="field-hint">Choose the classification first.</p>}
                <fieldset className="section-fieldset" disabled={locked}>
                  <Section
                    event={event}
                    update={update}
                    errors={showErrors ? validateSection(sectionName, event, options) : []}
                    showErrors={showErrors}
                    pillarLocked={Boolean(context.pillarId)}
                    attachments={attachments}
                    setAttachments={changeAttachments}
                  />
                </fieldset>
              </Paper>
            );
          })}
        </div>
      ))}

      <div className="bottom-bar">
        {!isSubmitted && (
          <Button type="button" variant="default" disabled={saving || autoSave.state === 'saving'} onClick={() => save('draft')}>
            Save as draft
          </Button>
        )}
        {isSubmitted ? (
          <Button type="button" disabled={saving} onClick={() => save('changes')}>
            <Icon name="check" size={18} /> Save changes
          </Button>
        ) : (
          <Button type="button" disabled={saving || autoSave.state === 'saving'} onClick={() => save('submit')}>
            <Icon name="check" size={18} /> Submit
          </Button>
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
    </FormWrapper>
  );
}

// The form is a page of its own, or a part of the event's page.
function FormWrapper({ embedded, children }) {
  return embedded ? (
    <div className="event-form-page event-form-embedded">{children}</div>
  ) : (
    <main className="page page--with-bar event-form-page">{children}</main>
  );
}

// A fresh form each time the page is opened, even from the same address ("Report another event").
export default function EventFormPage() {
  const location = useLocation();
  return <EventForm key={location.key} />;
}
