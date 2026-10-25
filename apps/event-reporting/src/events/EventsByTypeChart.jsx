import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { getPillarColor, getPillarTagClass } from '../logic/display.js';
import { countByFamilyAndLevel } from '../logic/eventList.js';
import { findById, getReferenceList } from '../logic/lookups.js';

// How much of the pillar color each level keeps: the first (most serious) level is the darkest.
const LEVEL_SHADES = [100, 80, 64, 50, 38];

function levelColor(pillarCode, index) {
  return `color-mix(in srgb, ${getPillarColor(pillarCode)} ${LEVEL_SHADES[index] ?? 38}%, var(--color-surface))`;
}

// A round top for the axis: 4 gridlines at whole numbers.
function axisMax(largest) {
  return Math.max(4, Math.ceil(largest / 4) * 4);
}

// Reported events by type: one column per family, split by level (review 2026-10-25). Columns
// wear their pillar color, as everywhere else; levels are shades of it, darker = more serious.
export default function EventsByTypeChart({ events }) {
  const { reference, context } = useApp();
  const [hovered, setHovered] = useState(null); // { familyCode, levelCode }
  const families = getReferenceList(reference, 'family').filter(
    (family) => !context.pillarId || family.pillarId === context.pillarId,
  );
  const rows = countByFamilyAndLevel(events, families, getReferenceList(reference, 'level'));
  const top = axisMax(Math.max(0, ...rows.map((row) => row.total)));
  const ticks = [4, 3, 2, 1, 0].map((step) => (top / 4) * step);

  return (
    <figure className="chart-card">
      <figcaption>
        <h2 className="chart-title">Reported events by type</h2>
        <p className="chart-subtitle">Submitted events in your scope, split by level. Darker shades are more serious levels.</p>
      </figcaption>

      <div className="bar-chart" style={{ '--bar-count': rows.length }}>
        <div className="bar-chart-grid" aria-hidden="true">
          {ticks.map((tick) => (
            <div key={tick} className="bar-chart-gridline">
              <span>{tick}</span>
            </div>
          ))}
        </div>
        <div className="bar-chart-columns">
          {rows.map(({ family, total, levels }) => {
            const pillarCode = findById(reference, family.pillarId)?.code;
            return (
              <div key={family.id} className="bar-chart-column">
                <div className="bar-chart-track">
                  <div className="bar-chart-stack" style={{ height: `${(total / top) * 100}%` }}>
                    <span className="bar-chart-total">{total}</span>
                    {levels.map(({ level, count }, index) => {
                      if (count === 0) return null;
                      const isHovered = hovered && hovered.levelCode === level.code;
                      return (
                        <div
                          key={level.code}
                          className="bar-chart-segment"
                          tabIndex={0}
                          aria-label={`${family.code} ${level.code} — ${level.label}: ${count}`}
                          style={{ flexGrow: count, background: levelColor(pillarCode, index) }}
                          onMouseEnter={() => setHovered({ familyCode: family.code, levelCode: level.code })}
                          onMouseLeave={() => setHovered(null)}
                          onFocus={() => setHovered({ familyCode: family.code, levelCode: level.code })}
                          onBlur={() => setHovered(null)}
                        >
                          {isHovered && (
                            <span className="bar-chart-tooltip" role="tooltip">
                              <strong>{count}</strong> {level.code} — {level.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <span className={getPillarTagClass(pillarCode)}>{family.code}</span>
                <span className="bar-chart-label">{family.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <details className="chart-table">
        <summary>Show as table</summary>
        <table className="kpi-table">
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Level</th>
              <th scope="col">Events</th>
            </tr>
          </thead>
          <tbody>
            {rows.flatMap(({ family, levels }) =>
              levels.map(({ level, count }) => (
                <tr key={level.code}>
                  <td>{family.code} — {family.label}</td>
                  <td>{level.code} — {level.label}</td>
                  <td>{count}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
