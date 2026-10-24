import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { validReviewers } from '../../../../shared/platform/workflow.js';
import Sheet from '../shell/Sheet.jsx';

// Chooses the reviewers of a Review setting: Managers and Site Admins who can see the pillar at
// the plants concerned (FR-010). Done stays disabled until one person is chosen.
export default function ReviewersPicker({ pillarId, plantIds, levelCode, initialIds, onDone, onClose }) {
  const { users, organization } = useApp();
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const candidates = validReviewers(users, { pillarId, plantIds });
  // Saved reviewers who can no longer see any of the plants (Edge Cases).
  const lostAccess = initialIds.filter((id) => !candidates.some((user) => user.id === id));

  function toggle(userId) {
    setSelectedIds((ids) => (ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId]));
  }

  const footer = (
    <button
      type="button"
      className="button button--primary button--block"
      disabled={selectedIds.length === 0}
      onClick={() => onDone(selectedIds.filter((id) => candidates.some((user) => user.id === id)))}
    >
      {selectedIds.length === 0 ? 'Choose at least one reviewer' : `Done — ${selectedIds.length} selected`}
    </button>
  );

  return (
    <Sheet title={`Reviewers for ${levelCode}`} onClose={onClose} footer={footer}>
      <p className="field-hint">Managers and Site Admins who can see this pillar at your plants.</p>
      {lostAccess.length > 0 && (
        <p className="message message--warning">
          {lostAccess.length} saved reviewer(s) no longer have access and will be removed.
        </p>
      )}
      <ul className="check-list">
        {candidates.map((user) => (
          <li key={user.id}>
            <label className="check-row">
              <input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggle(user.id)} />
              <span className="avatar avatar--small" aria-hidden="true">
                {user.avatar}
              </span>
              <span className="list-row-text">
                <strong>{user.name}</strong>
                <small>
                  {user.role} · {user.access.map((entry) => getPlantName(organization, entry.plantId)).join(', ')}
                </small>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
