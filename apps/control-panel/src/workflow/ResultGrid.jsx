import { useCallback, useState } from 'react';
import { useApp } from '../AppContext.js';
import { coveredPlantIds } from '../../../../shared/platform/permissions.js';
import { CONFIGURABLE_PHASES, CRITICAL_PHASES, levelLabel, PHASE_LABELS, PHASES, resultingWorkflow } from '../../../../shared/platform/workflow.js';
import CellDetails from './CellDetails.jsx';
import EventPath from './EventPath.jsx';
import ResultCell from './ResultCell.jsx';

// Result per plant (FR-011): what applies at one plant, who requires each phase, and the path of
// an event of the chosen level.
export default function ResultGrid({ pillar, role, levels, settings }) {
  const { organization } = useApp();
  const plants = coveredPlantIds(role, organization).map((id) => organization.find((node) => node.id === id));
  const [plantId, setPlantId] = useState(plants[0].id);
  const [levelCode, setLevelCode] = useState(levels[0].code);
  const [openCell, setOpenCell] = useState(null); // { levelCode, phase }
  const closeCell = useCallback(() => setOpenCell(null), []);
  const plant = plants.find((item) => item.id === plantId);

  const results = Object.fromEntries(
    levels.map((level) => [level.code, resultingWorkflow(settings, { pillarId: pillar.id, levelCode: level.code, plantId })]),
  );
  const chosenLevel = levels.find((level) => level.code === levelCode);

  return (
    <>
      <div className="field field--inline">
        <label className="field-label" htmlFor="result-plant">
          Plant
        </label>
        <select id="result-plant" value={plantId} onChange={(e) => setPlantId(e.target.value)}>
          {plants.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid-card">
        <table className="workflow-grid">
          <thead>
            <tr>
              <th scope="col">Level</th>
              {PHASES.map((phase) => (
                <th key={phase} scope="col">
                  {PHASE_LABELS[phase]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.code} className={[level.code === levelCode && 'row--selected', level.critical && 'row--critical'].filter(Boolean).join(' ') || undefined}>
                <th scope="row">
                  <button
                    type="button"
                    className="level-button"
                    aria-pressed={level.code === levelCode}
                    onClick={() => setLevelCode(level.code)}
                  >
                    <strong>{level.shownCode}</strong>
                    <small>{level.label}</small>
                  </button>
                </th>
                <td>
                  {level.critical ? <span className="cell-from-level">From the level</span> : <span className="result-required">Required</span>}
                </td>
                {CONFIGURABLE_PHASES.map((phase) => (
                  <td key={phase}>
                    {level.critical && !CRITICAL_PHASES.includes(phase) ? (
                      <span className="cell-from-level">From the level</span>
                    ) : (
                      <ResultCell
                        cell={results[level.code][phase]}
                        label={`${level.shownCode} ${PHASE_LABELS[phase]}`}
                        onOpen={() => setOpenCell({ levelCode: level.code, phase })}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="field-hint">Choose a level to see the path of its events below.</p>
      <EventPath level={chosenLevel} plantName={plant.name} result={results[levelCode]} />
      {openCell && (
        <CellDetails
          pillarId={pillar.id}
          levelCode={levelLabel(pillar.id, openCell.levelCode)}
          phase={openCell.phase}
          plant={plant}
          cell={results[openCell.levelCode][openCell.phase]}
          onClose={closeCell}
        />
      )}
    </>
  );
}
