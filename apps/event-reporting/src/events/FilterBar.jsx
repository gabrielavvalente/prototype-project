import { useApp } from '../AppContext.js';
import { getChildren, getReferenceList } from '../logic/lookups.js';

const LOCATION_LEVELS = [
  { field: 'departmentId', label: 'Department' },
  { field: 'workshopId', label: 'Workshop' },
  { field: 'jobId', label: 'Job' },
  { field: 'workstationId', label: 'Workstation' },
  { field: 'taskId', label: 'Task' },
];

function Select({ id, label, value, onChange, options, disabled = false, anyLabel = 'Any' }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Search box and filters for the event list (FR-029, FR-030).
export default function FilterBar({ search, onSearch, filters, onChange, onClear }) {
  const { reference, organization, users, context } = useApp();
  const set = (changes) => onChange({ ...filters, ...changes });

  const families = getReferenceList(reference, 'family').filter(
    (family) => !context.pillarId || family.pillarId === context.pillarId,
  );
  const family = families.find((item) => item.code === filters.familyCode);
  const levels = family ? getReferenceList(reference, 'level').filter((level) => level.familyId === family.id) : [];
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === context.plantId));

  function setLocation(index, value) {
    const location = { ...filters.location, [LOCATION_LEVELS[index].field]: value };
    for (const lower of LOCATION_LEVELS.slice(index + 1)) {
      delete location[lower.field];
    }
    set({ location });
  }

  return (
    <section className="card filter-bar" aria-label="Search and filters">
      <div className="field">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="search"
          placeholder="Title or record number (e.g. SAF-2026-0042)"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <details>
        <summary className="button button--link">Filters</summary>
        <div className="filter-grid">
          <Select
            id="filter-family"
            label="Type"
            value={filters.familyCode}
            onChange={(value) => set({ familyCode: value, levelCode: '' })}
            options={families.map((item) => ({ value: item.code, label: `${item.code} — ${item.label}` }))}
          />
          <Select
            id="filter-level"
            label="Level"
            value={filters.levelCode}
            disabled={!family}
            onChange={(value) => set({ levelCode: value })}
            options={levels.map((level) => ({ value: level.code, label: `${level.code} — ${level.label}` }))}
          />
          <div className="field">
            <label htmlFor="filter-from">From</label>
            <input id="filter-from" type="date" value={filters.from} onChange={(e) => set({ from: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="filter-to">To</label>
            <input id="filter-to" type="date" value={filters.to} onChange={(e) => set({ to: e.target.value })} />
          </div>
          {LOCATION_LEVELS.map((level, index) => {
            const parentId = index === 0 ? context.plantId : filters.location[LOCATION_LEVELS[index - 1].field];
            return (
              <Select
                key={level.field}
                id={`filter-${level.field}`}
                label={level.label}
                value={filters.location[level.field] || ''}
                disabled={!parentId}
                onChange={(value) => setLocation(index, value)}
                options={(parentId ? getChildren(organization, parentId) : []).map((node) => ({
                  value: node.id,
                  label: node.name,
                }))}
              />
            );
          })}
          <Select
            id="filter-reporter"
            label="Reporter"
            value={filters.reporterId}
            onChange={(value) => set({ reporterId: value })}
            options={plantUsers.map((person) => ({ value: person.id, label: person.name }))}
          />
          <Select
            id="filter-hpr"
            label="HPR"
            value={filters.hpr}
            onChange={(value) => set({ hpr: value })}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
          <Select
            id="filter-status"
            label="Status"
            value={filters.status}
            onChange={(value) => set({ status: value })}
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Open', label: 'Open' },
            ]}
          />
        </div>
      </details>
      <div className="button-row">
        <label className="field-hint">
          <input type="checkbox" checked={filters.myEvents} onChange={(e) => set({ myEvents: e.target.checked })} /> My
          Events
        </label>
        <button type="button" className="button button--link" onClick={onClear}>
          Clear all
        </button>
      </div>
    </section>
  );
}
