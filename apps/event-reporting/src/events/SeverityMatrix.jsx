import { FieldError } from '../create/fields.jsx';
import { BANDS, rate } from '../logic/severity.js';

const BAND_LABELS = Object.fromEntries(BANDS.map((band) => [band.key, band.label]));

// A clickable severity (or loss) matrix: impact rows × duration columns; the cell clicked gives the
// score and its band, never typed (003 FR-022, FR-026). value = a rated cell or null.
export default function SeverityMatrix({ id, title, description, matrix, value, onChange, errors = [] }) {
  return (
    <fieldset className="field severity-matrix" id={id}>
      <legend className="field-label required">{title}</legend>
      {description && <span className="field-hint">{description}</span>}
      <div className="severity-matrix-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">{matrix.impactTitle}</span>
                <span aria-hidden="true">{matrix.impactTitle} ↓ · {matrix.durationTitle} →</span>
              </th>
              {matrix.durations.map((duration) => (
                <th key={duration.key} scope="col">
                  {duration.label}
                  <small>{duration.hint}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.impacts.map((impact) => (
              <tr key={impact.key}>
                <th scope="row">
                  {impact.label}
                  <small>{impact.hint}</small>
                </th>
                {matrix.durations.map((duration) => {
                  const cell = rate(matrix, { impact: impact.key, duration: duration.key });
                  const chosen = value?.impact === impact.key && value?.duration === duration.key;
                  return (
                    <td key={duration.key}>
                      <button
                        type="button"
                        className={`severity-cell severity-cell--${cell.band}`}
                        aria-pressed={chosen}
                        aria-label={`${impact.label} × ${duration.label}: ${cell.score}, ${BAND_LABELS[cell.band]}`}
                        onClick={() => onChange(cell)}
                      >
                        {cell.score}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="severity-result" aria-live="polite">
        {value ? (
          <>
            Score <strong>{value.score}</strong> —{' '}
            <span className={`severity-band severity-band--${value.band}`}>{BAND_LABELS[value.band]}</span>
          </>
        ) : (
          'Click the cell that fits.'
        )}
      </p>
      {matrix.note && <p className="field-hint">{matrix.note}</p>}
      <FieldError errors={errors} field={id} />
    </fieldset>
  );
}
