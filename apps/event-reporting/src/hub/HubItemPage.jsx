import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, MultiSelect, Stack, Textarea, TextInput } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { findEvent, getByIndex, saveWorkflowStep } from '../data/db.js';
import { ACTION_STATUS_LABELS } from '../logic/actions.js';
import {
  allowedLocalStatuses,
  answerNo,
  answerYes,
  canCheck,
  CHECK_STATE_LABELS,
  checkOf,
  closeCase,
  closingProblem,
  historyOf,
  isClosed,
  receivedPackages,
  saveLocalAction,
  setLocalActionStatus,
  startCheck,
  validateLocalAction,
} from '../logic/sharingHub.js';
import CommunicationDocument from '../communications/CommunicationDocument.jsx';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';

const NOT_AVAILABLE = 'This shared event is not available.';
const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// A local action being written: description, assignees among the plant's people, due date (SH-7).
function LocalActionForm({ initial, people, onSave, onCancel }) {
  const [action, setAction] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (changes) => setAction((current) => ({ ...current, ...changes }));

  function save() {
    const found = validateLocalAction(action);
    setErrors(found);
    if (Object.keys(found).length > 0) scrollToFirstProblemSoon();
    if (Object.keys(found).length === 0) onSave(action);
  }

  return (
    <div className="hub-action-form">
      <Stack gap="sm">
        <Textarea label="Description" required autosize minRows={2} value={action.description} onChange={(e) => set({ description: e.currentTarget.value })} error={errors.description} />
        <MultiSelect
          label="Assignees"
          required
          searchable
          data={people.map((person) => ({ value: person.id, label: person.name }))}
          value={action.assigneeIds}
          onChange={(assigneeIds) => set({ assigneeIds })}
          error={errors.assigneeIds}
          comboboxProps={{ withinPortal: true }}
        />
        <TextInput label="Due date" type="date" required value={action.dueDate} onChange={(e) => set({ dueDate: e.currentTarget.value })} error={errors.dueDate} />
        <div className="hub-buttons">
          <Button type="button" onClick={save}>
            Save action
          </Button>
          <Button type="button" variant="default" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Stack>
    </div>
  );
}

// A Safety Warning shared with the context's plant: the package and the plant's local check
// (SH-5, SH-7 to SH-9). Names appear only in the check, for the plant's own people.
export default function HubItemPage() {
  const { record } = useParams();
  const { user, users, context, organization } = useApp();
  const [event, setEvent] = useState(undefined);
  const [attachments, setAttachments] = useState([]);
  const [draft, setDraft] = useState(null);
  const [problem, setProblem] = useState('');
  const plantId = context.plantId;

  useEffect(() => {
    async function load() {
      const found = await findEvent(record);
      setEvent(found || null);
      if (found) setAttachments(await getByIndex('attachments', 'eventId', found.id));
    }
    load();
  }, [record]);

  useEffect(() => {
    document.title = `Shared Safety Warning — ${record} — Event Reporting`;
  }, [record]);

  if (event === undefined) return <p className="page">Loading…</p>;
  const item = event ? receivedPackages([event], plantId)[0] : null;
  if (!item || !(user.access || []).some((entry) => entry.plantId === plantId)) {
    return (
      <main className="page">
        <p className="message message--warning">{NOT_AVAILABLE}</p>
      </main>
    );
  }

  const check = checkOf(event, plantId);
  const checker = canCheck(user, plantId);
  const people = users.filter((person) => person.role && (person.access || []).some((entry) => entry.plantId === plantId));
  const name = (id) => users.find((person) => person.id === id)?.name ?? id;
  const now = () => new Date().toISOString();

  async function save(updated) {
    setEvent(updated);
    setEvent(await saveWorkflowStep(updated));
  }

  // Closing — by No or Close case — needs every action finished (SH-8).
  function close(closing) {
    const found = closingProblem(check);
    setProblem(found || '');
    if (found) scrollToFirstProblemSoon();
    if (!found) save(closing(event, plantId, user, now()));
  }

  const open = !isClosed(check) && check.state !== 'notChecked';
  const canVerify = check.state === 'notChecked' && checker;

  return (
    <main className="page hub-page">
      <div className="communication-toolbar">
        <Link to="/events?tab=hub">← Sharing Hub</Link>
      </div>
      <div className="hub-title">
        <h1>Shared Safety Warning</h1>
        {canVerify && (
          <Button type="button" onClick={() => save(startCheck(event, plantId, user, now()))}>
            Verify locally
          </Button>
        )}
      </div>
      <p className="communication-published">
        From {getPlantName(organization, event.plantId)} · shared on {formatDate(item.receivedAt)} ·{' '}
        <span className={`hub-state hub-state--${check.state}`}>{CHECK_STATE_LABELS[check.state]}</span>
      </p>
      {/* Once the check has started, it is a column on the right of the Warning (SH-7). */}
      <div className={`hub-layout${check.state === 'notChecked' ? '' : ' hub-layout--checking'}`}>
      <CommunicationDocument kind="warning" content={item.pkg.content} attachments={attachments} classification={item.pkg.classification} />

      <div className="hub-side">
      <section className="hub-check" aria-labelledby="check-title">
        <h2 id="check-title">Local check</h2>
        {check.state === 'notChecked' && <p className="field-hint">Not checked yet.</p>}
        {check.state !== 'notChecked' && (
          <>
            <h3>Local actions</h3>
            {check.actions.length === 0 && <p className="field-hint">No local action yet.</p>}
            {check.actions.length > 0 && (
              <ul className="hub-actions">
                {check.actions.map((action) => (
                  <li key={action.id} className="hub-action">
                    <span>
                      {action.description} · {action.assigneeIds.map(name).join(', ')} · Due {formatDate(`${action.dueDate}T00:00:00`)} ·{' '}
                      <strong>{ACTION_STATUS_LABELS[action.status]}</strong>
                    </span>
                    <span className="hub-buttons">
                      {open &&
                        allowedLocalStatuses(user, action, plantId).map((status) => (
                          <Button key={status} type="button" size="xs" variant="default" onClick={() => save(setLocalActionStatus(event, plantId, action.id, status, user, now()))}>
                            {status === 'completed' ? 'Completed' : 'Cancel'}
                          </Button>
                        ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {open && checker && (
              <>
                {draft ? (
                  <LocalActionForm
                    initial={draft}
                    people={people}
                    onCancel={() => setDraft(null)}
                    onSave={(action) => {
                      setDraft(null);
                      save(saveLocalAction(event, plantId, action));
                    }}
                  />
                ) : (
                  <Button type="button" variant="default" onClick={() => setDraft({ description: '', assigneeIds: [], dueDate: '' })}>
                    Add action
                  </Button>
                )}
                {check.state === 'beingChecked' && (
                  <div className="hub-answer" role="group" aria-labelledby="answer-title">
                    <h3 id="answer-title">Could it happen here?</h3>
                    <div className="hub-buttons">
                      <Button type="button" variant="default" onClick={() => save(answerYes(event, plantId, user, now()))}>
                        Yes
                      </Button>
                      <Button type="button" variant="default" onClick={() => close(answerNo)}>
                        No
                      </Button>
                    </div>
                  </div>
                )}
                {check.state === 'yes' && (
                  <Button type="button" onClick={() => close(closeCase)}>
                    Close case
                  </Button>
                )}
                {problem && (
                  <p className="message message--error" role="alert">
                    {problem}
                  </p>
                )}
              </>
            )}
            {isClosed(check) && (
              <p>
                Could it happen here? <strong>{check.state === 'closedYes' ? 'Yes' : 'No'}</strong> · closed on {formatDate(check.closedAt)}
              </p>
            )}
          </>
        )}
      </section>
      {/* The history is a section of its own, in grey (SH-9). */}
      <section className="hub-history-section" aria-labelledby="history-title">
        <h2 id="history-title">History</h2>
        <ol className="hub-history">
          {historyOf(event, plantId).map((entry, index) => (
            <li key={index}>{entry.text}</li>
          ))}
        </ol>
      </section>
      </div>
      </div>
    </main>
  );
}
