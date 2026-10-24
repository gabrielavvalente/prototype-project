import { useCallback, useState } from 'react';
import { useApp } from '../AppContext.js';
import { coveredPlantIds } from '../../../../shared/platform/permissions.js';
import { CONFIGURABLE_PHASES, PHASE_LABELS, resultingWorkflow } from '../../../../shared/platform/workflow.js';
import CellDetails from './CellDetails.jsx';
import ResultCell from './ResultCell.jsx';

// Compare plants (FR-025): for one level, the user's plants side by side.
export default function ComparePlants({ pillar, role, levels, settings }) {
  const { organization } = useApp();
  const plants = coveredPlantIds(role, organization).map((id) => organization.find((node) => node.id === id));
  const [levelCode, setLevelCode] = useState(levels[0].code);
  const [openCell, setOpenCell] = useState(null); // { plant, phase }
  const closeCell = useCallback(() => setOpenCell(null), []);

  const results = Object.fromEntries(
    plants.map((plant) => [plant.id, resultingWorkflow(settings, { pillarId: pillar.id, levelCode, plantId: plant.id })]),
  );

  return (
    <>
      <div className="field field--inline">
        <label className="field-label" htmlFor="compare-level">
          Level
        </label>
        <select id="compare-level" value={levelCode} onChange={(e) => setLevelCode(e.target.value)}>
          {levels.map((level) => (
            <option key={level.code} value={level.code}>
              {level.code} — {level.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid-card">
        <table className="workflow-grid">
          <thead>
            <tr>
              <th scope="col">Phase</th>
              {plants.map((plant) => (
                <th key={plant.id} scope="col">
                  {plant.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{PHASE_LABELS.submission}</th>
              {plants.map((plant) => (
                <td key={plant.id}>
                  <span className="result-required">Required</span>
                </td>
              ))}
            </tr>
            {CONFIGURABLE_PHASES.map((phase) => (
              <tr key={phase}>
                <th scope="row">{PHASE_LABELS[phase]}</th>
                {plants.map((plant) => (
                  <td key={plant.id}>
                    <ResultCell
                      cell={results[plant.id][phase]}
                      label={`${plant.name} ${PHASE_LABELS[phase]}`}
                      onOpen={() => setOpenCell({ plant, phase })}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openCell && (
        <CellDetails
          pillarId={pillar.id}
          levelCode={levelCode}
          phase={openCell.phase}
          plant={openCell.plant}
          cell={results[openCell.plant.id][openCell.phase]}
          onClose={closeCell}
        />
      )}
    </>
  );
}
