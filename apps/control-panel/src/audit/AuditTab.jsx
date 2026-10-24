import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getList, listsForPillar } from '../../../../shared/platform/masterData.js';
import { getAudit } from '../../../../shared/platform/platformData.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';

const ACTION_LABELS = {
  required: 'Made Required',
  optional: 'Made Optional',
  reviewers: 'Changed',
  add: 'Added',
  edit: 'Edited',
  deactivate: 'Deactivated',
  reactivate: 'Reactivated',
  retire: 'Retired',
};

// Every workflow and master data change of the pillar, newest first (FR-022, SC-005).
export default function AuditTab() {
  const { pillar } = useOutletContext();
  const { users, organization } = useApp();
  const [entries, setEntries] = useState(null);
  const [subject, setSubject] = useState('');
  const [userId, setUserId] = useState('');
  const subjects = [{ id: 'workflow', label: 'Workflow' }, ...listsForPillar(pillar.id).filter((list) => !list.readOnly)];

  useEffect(() => {
    document.title = `Audit — ${pillar.label} — Control Panel`;
    getAudit(pillar.id).then(setEntries);
  }, [pillar.id, pillar.label]);

  if (!entries) {
    return <p className="page">Loading…</p>;
  }

  const authors = users.filter((user) => entries.some((entry) => entry.userId === user.id));
  const shown = entries.filter((entry) => (!subject || entry.subject === subject) && (!userId || entry.userId === userId));

  function scope(entry) {
    if (entry.scopeLevel === 'central') {
      return 'Central';
    }
    return `${LEVEL_LABELS[entry.scopeLevel]} ${entry.plantIds.map((id) => getPlantName(organization, id)).join(', ')}`;
  }

  return (
    <main className="page">
      <h1>Audit</h1>
      <div className="filter-row">
        <div className="field">
          <label className="field-label" htmlFor="audit-subject">
            What
          </label>
          <select id="audit-subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Everything</option>
            {subjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="audit-user">
            Who
          </label>
          <select id="audit-user" value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="">Everyone</option>
            {authors.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="result-count">
        {shown.length} change{shown.length === 1 ? '' : 's'}
      </p>
      {shown.length === 0 ? (
        <p className="field-hint">No change recorded yet.</p>
      ) : (
        <div className="grid-card">
          <table className="values-table audit-table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Who</th>
                <th scope="col">Level and plants</th>
                <th scope="col">What</th>
                <th scope="col">Change</th>
                <th scope="col">Before → after</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td>{users.find((user) => user.id === entry.userId)?.name ?? entry.userId}</td>
                  <td>{scope(entry)}</td>
                  <th scope="row">
                    {entry.subject === 'workflow' ? 'Workflow' : getList(entry.subject).label}
                    <small>{entry.targetId}</small>
                  </th>
                  <td>{ACTION_LABELS[entry.action]}</td>
                  <td>
                    {entry.before} → <strong>{entry.after}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
