import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { PHASE_LABELS, REVIEWER_ROLES } from '../../../../shared/platform/workflow.js';
import Sheet from '../shell/Sheet.jsx';
import { describeScope, formatDate, userName } from './workflowText.js';

// Every setting requiring one phase at one plant: level, perimeter, author and date; for Review,
// the reviewers each level chose there, added together (013 WF-9).
export default function CellDetails({ pillarId, levelCode, phase, plant, cell, reviewerChoices = [], onClose }) {
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
          </li>
        ))}
      </ul>
      {phase === 'review' && cell.required && (
        <section aria-labelledby="reviewers-title">
          <h3 id="reviewers-title">Reviewers</h3>
          {reviewerChoices.length === 0 && <p className="message message--warning">No reviewer chosen for {plant.name} yet.</p>}
          <ul className="source-list">
            {reviewerChoices.map((choice) => (
              <li key={choice.id} className="source-item">
                <span className={`level-badge level-badge--${choice.scopeLevel}`}>{describeScope(choice, organization)}</span>
                <span>
                  Set by <strong>{userName(users, choice.authorId)}</strong> on {formatDate(choice.updatedAt)}
                </span>
                <ul className="reviewer-list" aria-label={`Reviewers chosen by ${describeScope(choice, organization)}`}>
                  {choice.reviewerIds.map((id) => (
                    <li key={id}>
                      {userName(users, id)}
                      {!canReviewHere(id) && <span className="tag tag--outline">Cannot see {plant.name}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Sheet>
  );
}
