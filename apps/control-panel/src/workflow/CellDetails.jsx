import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { PHASE_LABELS, REVIEWER_ROLES } from '../../../../shared/platform/workflow.js';
import Sheet from '../shell/Sheet.jsx';
import { describeScope, formatDate, userName } from './workflowText.js';

// Every setting requiring one phase at one plant: level, perimeter, author, date and reviewers.
export default function CellDetails({ pillarId, levelCode, phase, plant, cell, onClose }) {
  const { users, organization } = useApp();

  function canReviewHere(userId) {
    const reviewer = users.find((user) => user.id === userId);
    return reviewer && REVIEWER_ROLES.includes(reviewer.role) && getPillarIdsForPlant(reviewer, plant.id).includes(pillarId);
  }

  return (
    <Sheet title={`${levelCode} · ${PHASE_LABELS[phase]} at ${plant.name}`} onClose={onClose}>
      {!cell.required && <p>Optional: no level requires this phase here, so it is skipped.</p>}
      <ul className="source-list">
        {cell.sources.map((setting) => (
          <li key={setting.id} className="source-item">
            <span className={`level-badge level-badge--${setting.scopeLevel}`}>{describeScope(setting, organization)}</span>
            <span>
              Set by <strong>{userName(users, setting.authorId)}</strong> on {formatDate(setting.updatedAt)}
            </span>
            {phase === 'review' && (
              <ul className="reviewer-list" aria-label="Reviewers">
                {setting.reviewerIds.map((id) => (
                  <li key={id}>
                    {userName(users, id)}
                    {!canReviewHere(id) && <span className="tag tag--outline">Cannot see {plant.name}</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
