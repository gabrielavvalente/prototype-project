import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Select, TextInput } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { findEvent } from '../data/db.js';
import { isEventVisible } from '../logic/access.js';
import { filterEntries } from '../logic/recordHistorian.js';
import NotAllowed from '../shell/NotAllowed.jsx';

const formatWhen = (iso) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

// The Record Historian of an event: every change since the review, read-only, filterable (RH-2).
export default function RecordHistorianPage() {
  const { id } = useParams();
  const { user, users, context } = useApp();
  const [event, setEvent] = useState(undefined);
  const [filters, setFilters] = useState({ from: '', to: '', userId: '', what: '' });

  useEffect(() => {
    findEvent(id).then((found) => setEvent(found && found.status !== 'Draft' && isEventVisible(user, context, found) ? found : null));
  }, [id, user, context]);

  useEffect(() => {
    document.title = `Record Historian — ${id} — Event Reporting`;
  }, [id]);

  if (event === undefined) return <p className="page">Loading…</p>;
  if (event === null) return <NotAllowed reason="notFound" />;

  const entries = event.historian ?? [];
  const shown = filterEntries(entries, filters);
  const people = users.filter((person) => entries.some((entry) => entry.by === person.id));
  const fields = [...new Set(entries.map((entry) => entry.what))].sort();
  const set = (key) => (value) => setFilters((current) => ({ ...current, [key]: value ?? '' }));
  const name = (personId) => users.find((person) => person.id === personId)?.name ?? personId;

  return (
    <main className="page page--wide historian-page">
      <div className="communication-toolbar">
        <Link to={`/events/${event.recordNumber}`}>← Event {event.recordNumber}</Link>
      </div>
      <h1>Record Historian</h1>
      <p className="field-hint">Every change made to {event.recordNumber} since its review.</p>
      {entries.length === 0 ? (
        <p className="empty-state">No change since the review.</p>
      ) : (
        <>
          <div className="filter-row historian-filters">
            <TextInput label="From" type="date" value={filters.from} onChange={(e) => set('from')(e.currentTarget.value)} />
            <TextInput label="To" type="date" value={filters.to} onChange={(e) => set('to')(e.currentTarget.value)} />
            <Select
              label="Who"
              value={filters.userId || '__all__'}
              onChange={(value) => set('userId')(value === '__all__' ? '' : value)}
              data={[{ value: '__all__', label: 'Everyone' }, ...people.map((person) => ({ value: person.id, label: person.name }))]}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
            <Select
              label="What"
              searchable
              value={filters.what || '__all__'}
              onChange={(value) => set('what')(value === '__all__' ? '' : value)}
              data={[{ value: '__all__', label: 'Everything' }, ...fields.map((field) => ({ value: field, label: field }))]}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
          </div>
          <p className="result-count">
            {shown.length} change{shown.length === 1 ? '' : 's'}
          </p>
          {shown.length === 0 ? (
            <p className="empty-state">No change matches these filters.</p>
          ) : (
            <ol className="historian-list">
              {shown.map((entry, index) => (
                <li key={`${entry.at}-${index}`} className="historian-entry">
                  <span className="historian-meta">
                    {formatWhen(entry.at)} · {name(entry.by)}
                  </span>
                  <strong>{entry.what}</strong>
                  <span>
                    {entry.before} → <strong>{entry.after}</strong>
                  </span>
                  {entry.reason && <span className="historian-reason">Reason: {entry.reason}</span>}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </main>
  );
}
