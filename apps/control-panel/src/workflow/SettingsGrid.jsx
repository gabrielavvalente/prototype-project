import { useCallback, useState } from 'react';
import { useApp } from '../AppContext.js';
import { saveWorkflowSetting } from '../../../../shared/platform/platformData.js';
import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import { cellStateFor, CONFIGURABLE_PHASES, CRITICAL_PHASES, levelLabel, PHASE_LABELS } from '../../../../shared/platform/workflow.js';
import Icon from '../shell/Icon.jsx';
import ReviewersPicker from './ReviewersPicker.jsx';
import { formatDate, userName } from './workflowText.js';

// Settings view (FR-006, FR-008, FR-009, FR-010): one row per level, one column per phase.
// The user switches phases of their own level; what a higher level requires is locked. The
// critical row sets only the phases after the review (012 WF-13).
export default function SettingsGrid({ pillar, role, levels, settings, onSaved }) {
  const { user, users } = useApp();
  const [picker, setPicker] = useState(null); // { levelCode, initialIds } while choosing reviewers
  const [error, setError] = useState('');
  // Kept stable so the sheet does not move the focus again on every render.
  const closePicker = useCallback(() => setPicker(null), []);

  // Changing a colleague's setting asks first, since they will be notified (FR-009).
  function confirmOthers(mine) {
    const others = [...new Set(mine.filter((setting) => setting.authorId !== user.id).map((s) => s.authorId))];
    if (others.length === 0) {
      return true;
    }
    const names = others.map((id) => userName(users, id)).join(' and ');
    return window.confirm(`${names} set this. They will be notified of your change.`);
  }

  async function save(levelCode, phase, required, reviewerIds = []) {
    setError('');
    try {
      await saveWorkflowSetting(user, { pillarId: pillar.id, levelCode, phase, required, reviewerIds });
      onSaved(`Saved — ${levelLabel(pillar.id, levelCode)} ${PHASE_LABELS[phase]} is now ${required ? 'Required' : 'Optional'}. Applies to new events.`);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  function handleSwitch(levelCode, phase, cell) {
    if (!confirmOthers(cell.mine)) {
      return;
    }
    const turningOn = cell.state === 'optional';
    if (turningOn && phase === 'review') {
      setPicker({ levelCode, initialIds: [] });
    } else {
      save(levelCode, phase, turningOn);
    }
  }

  function editReviewers(levelCode, cell) {
    if (confirmOthers(cell.mine)) {
      setPicker({ levelCode, initialIds: cell.mine.flatMap((setting) => setting.reviewerIds) });
    }
  }

  function renderCell(level, phase) {
    if (level.critical && !CRITICAL_PHASES.includes(phase)) {
      return <span className="cell-from-level">From the level</span>;
    }
    const cell = cellStateFor(user, settings, { pillarId: pillar.id, levelCode: level.code, phase });
    if (cell.state === 'locked') {
      const source = cell.lockedBy[0];
      return (
        <div className="cell-locked">
          <Icon name="lock" size={16} />
          <span>
            Required by {LEVEL_LABELS[source.scopeLevel]}
            <small>
              {userName(users, source.authorId)}, {formatDate(source.updatedAt)}
            </small>
          </span>
        </div>
      );
    }
    const on = cell.state === 'mine';
    const othersAuthor = cell.mine.find((setting) => setting.authorId !== user.id);
    const reviewerCount = new Set(cell.mine.flatMap((setting) => setting.reviewerIds)).size;
    return (
      <div className="cell-switch">
        <button
          type="button"
          role="switch"
          aria-checked={on}
          className="switch"
          onClick={() => handleSwitch(level.code, phase, cell)}
        >
          <span className="switch-track" aria-hidden="true" />
          <span className="switch-label">{on ? 'Required' : 'Optional'}</span>
          <span className="visually-hidden">
            {PHASE_LABELS[phase]} for {level.shownCode}
          </span>
        </button>
        {on && phase === 'review' && (
          <button type="button" className="button--link cell-link" onClick={() => editReviewers(level.code, cell)}>
            {reviewerCount} reviewer{reviewerCount === 1 ? '' : 's'}
          </button>
        )}
        {othersAuthor && <small>Set by {userName(users, othersAuthor.authorId)}</small>}
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="message message--error" role="alert">
          {error}
        </p>
      )}
      <div className="grid-card">
        <table className="workflow-grid">
          <thead>
            <tr>
              <th scope="col">Level</th>
              <th scope="col">{PHASE_LABELS.submission}</th>
              {CONFIGURABLE_PHASES.map((phase) => (
                <th key={phase} scope="col">
                  {PHASE_LABELS[phase]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.code} className={level.critical ? 'row--critical' : undefined}>
                <th scope="row">
                  <strong>{level.shownCode}</strong>
                  <small>{level.label}</small>
                </th>
                <td>
                  {level.critical ? (
                    <span className="cell-from-level">From the level</span>
                  ) : (
                    <span className="tag tag--dark" title="Always required">
                      Required
                    </span>
                  )}
                </td>
                {CONFIGURABLE_PHASES.map((phase) => (
                  <td key={phase}>{renderCell(level, phase)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {picker && (
        <ReviewersPicker
          pillarId={pillar.id}
          plantIds={role.plantIds}
          levelCode={picker.levelCode}
          initialIds={picker.initialIds}
          onClose={closePicker}
          onDone={(reviewerIds) => {
            setPicker(null);
            save(picker.levelCode, 'review', true, reviewerIds);
          }}
        />
      )}
    </>
  );
}
