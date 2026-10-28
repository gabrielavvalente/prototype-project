import { LEVEL_LABELS } from '../../../../shared/platform/permissions.js';

// One read-only cell of the resulting workflow: Required with the level requiring it (highest
// first, "+1" when several), or a muted Optional; a Review nobody can do there warns "No reviewer"
// (013 WF-8). Clicking opens the details.
export default function ResultCell({ cell, label, noReviewer = false, onOpen }) {
  const [first, ...more] = cell.sources;
  return (
    <button type="button" className={`result-cell ${cell.required ? '' : 'result-cell--optional'}`} onClick={onOpen}>
      {cell.required ? (
        <>
          <span className="result-required">Required</span>
          {first && (
            <span className={`level-badge level-badge--${first.scopeLevel}`}>
              {LEVEL_LABELS[first.scopeLevel]}
              {more.length > 0 && ` +${more.length}`}
            </span>
          )}
          {noReviewer && <span className="tag tag--warning">No reviewer</span>}
        </>
      ) : (
        <span>Optional</span>
      )}
      <span className="visually-hidden">{label}. Show details</span>
    </button>
  );
}
