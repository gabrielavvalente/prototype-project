import { useState } from 'react';
import { useApp } from '../AppContext.js';
import ChipGroup from '../create/ChipGroup.jsx';
import { getPillarColorClass } from '../logic/display.js';
import { EMPTY_FILTERS } from '../logic/eventList.js';
import { findById, getChildren, getReferenceList } from '../logic/lookups.js';
import Sheet from '../shell/Sheet.jsx';

const LOCATION_LEVELS = [
  { field: 'departmentId', label: 'Department' },
  { field: 'workshopId', label: 'Workshop' },
  { field: 'jobId', label: 'Job' },
  { field: 'workstationId', label: 'Workstation' },
  { field: 'taskId', label: 'Task' },
];

// Filters in a sheet; nothing changes until Apply (FR-030, FR-042).
export default function FilterSheet({ filters, onApply, onClose }) {
  const { reference, organization, users, context } = useApp();
  const [draft, setDraft] = useState(filters);
  const set = (changes) => setDraft((previous) => ({ ...previous, ...changes }));

  const families = getReferenceList(reference, 'family').filter(
    (family) => !context.pillarId || family.pillarId === context.pillarId,
  );
  const family = families.find((item) => item.code === draft.familyCode);
  const levels = family ? getReferenceList(reference, 'level').filter((level) => level.familyId === family.id) : [];
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === context.plantId));

  function setLocation(index, value) {
    const location = { ...draft.location, [LOCATION_LEVELS[index].field]: value };
    for (const lower of LOCATION_LEVELS.slice(index + 1)) {
      delete location[lower.field];
    }
    set({ location });
  }

  function apply() {
    onApply(draft);
    onClose();
  }

  return (
    <Sheet
      title="Filters"
      onClose={onClose}
      footer={
        <div className="sheet-actions">
          <button type="button" className="button" onClick={() => setDraft(EMPTY_FILTERS)}>
            Clear all
          </button>
          <button type="button" className="button button--primary" onClick={apply}>
            Apply filters
          </button>
        </div>
      }
    >
      <ChipGroup
        id="filter-family"
        label="Type"
        allowEmpty
        value={draft.familyCode}
        onChange={(value) => set({ familyCode: value, levelCode: '' })}
        options={families.map((item) => ({
          value: item.code,
          label: `${item.code} — ${item.label}`,
          dotClass: getPillarColorClass(findById(reference, item.pillarId)?.code),
        }))}
      />
      {family && (
        <ChipGroup
          id="filter-level"
          label="Level"
          allowEmpty
          value={draft.levelCode}
          onChange={(value) => set({ levelCode: value })}
          options={levels.map((level) => ({ value: level.code, label: level.code }))}
        />
      )}
      <fieldset className="field">
        <legend className="field-label">Report date</legend>
        <div className="date-range">
          <label>
            <span className="visually-hidden">From</span>
            <input type="date" value={draft.from} onChange={(e) => set({ from: e.target.value })} />
          </label>
          <span className="field-hint">to</span>
          <label>
            <span className="visually-hidden">To</span>
            <input type="date" value={draft.to} onChange={(e) => set({ to: e.target.value })} />
          </label>
        </div>
      </fieldset>
      <p className="section-label">Location</p>
      {LOCATION_LEVELS.map((level, index) => {
        const parentId = index === 0 ? context.plantId : draft.location[LOCATION_LEVELS[index - 1].field];
        if (!parentId) return null;
        return (
          <div className="field" key={level.field}>
            <label htmlFor={`filter-${level.field}`}>{level.label}</label>
            <select
              id={`filter-${level.field}`}
              value={draft.location[level.field] || ''}
              onChange={(e) => setLocation(index, e.target.value)}
            >
              <option value="">Any {level.label.toLowerCase()}</option>
              {getChildren(organization, parentId).map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}
      <div className="field">
        <label htmlFor="filter-reporter">Reporter</label>
        <select id="filter-reporter" value={draft.reporterId} onChange={(e) => set({ reporterId: e.target.value })}>
          <option value="">Any reporter</option>
          {plantUsers.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>
    </Sheet>
  );
}
