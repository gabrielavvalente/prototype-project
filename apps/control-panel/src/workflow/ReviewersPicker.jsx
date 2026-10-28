import { useState } from 'react';
import { Button } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { validReviewers } from '../../../../shared/platform/workflow.js';
import Sheet from '../shell/Sheet.jsx';

// Chooses the reviewers of the user's level for its plants: Managers and Site Admins who can see
// the pillar there (FR-010). They are added to the other levels' reviewers; none is allowed
// (013 WF-6a).
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
    <Button
      type="button"
      className="button button--primary button--block"
      onClick={() => onDone(selectedIds.filter((id) => candidates.some((user) => user.id === id)))}
    >
      {selectedIds.length === 0 ? 'Save — no reviewers' : `Save — ${selectedIds.length} selected`}
    </Button>
  );

  return (
    <Sheet title={`Reviewers for ${levelCode}`} onClose={onClose} footer={footer}>
      <p className="field-hint">
        Managers and Site Admins who can see this pillar at your plants. They are added to the reviewers
        chosen by the other levels.
      </p>
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
