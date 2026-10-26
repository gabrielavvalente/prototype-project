import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getNotificationChanges } from '../../../../shared/platform/platformData.js';

// Every change made on the plant's notifications page, newest first (NT-11).
export default function ChangesTab() {
  const { plantId, plantName } = useOutletContext();
  const { users } = useApp();
  const [changes, setChanges] = useState(null);

  useEffect(() => {
    document.title = `Changes — Notifications · ${plantName} — Control Panel`;
    getNotificationChanges(plantId).then(setChanges);
  }, [plantId, plantName]);

  if (!changes) {
    return <p className="page">Loading…</p>;
  }

  return (
    <main className="page">
      <h1>Changes</h1>
      <p className="result-count">
        {changes.length} change{changes.length === 1 ? '' : 's'}
      </p>
      {changes.length === 0 ? (
        <p className="field-hint">No change recorded yet.</p>
      ) : (
        <div className="grid-card">
          <table className="values-table audit-table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Who</th>
                <th scope="col">What</th>
                <th scope="col">Change</th>
                <th scope="col">Before → after</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td>{users.find((user) => user.id === entry.userId)?.name ?? entry.userId}</td>
                  <th scope="row">{entry.what}</th>
                  <td>{entry.action}</td>
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
