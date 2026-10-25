import { useState } from 'react';
import { Button, Group, Select, TextInput, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import ChipGroup from '../create/ChipGroup.jsx';
import { getPillarColorKey } from '../logic/display.js';
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
        <Group className="sheet-actions" grow>
          <Button type="button" variant="default" onClick={() => setDraft(EMPTY_FILTERS)}>
            Clear all
          </Button>
          <Button type="button" onClick={apply}>
            Apply filters
          </Button>
        </Group>
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
          colorKey: getPillarColorKey(findById(reference, item.pillarId)?.code),
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
      <fieldset className="field filter-date-range">
        <legend className="field-label">Report date</legend>
        <TextInput type="date" label="From" value={draft.from} onChange={(e) => set({ from: e.target.value })} />
        <TextInput type="date" label="To" value={draft.to} onChange={(e) => set({ to: e.target.value })} />
      </fieldset>
      <Title order={3} size="h4" mt="md" mb="xs">Location</Title>
      {LOCATION_LEVELS.map((level, index) => {
        const parentId = index === 0 ? context.plantId : draft.location[LOCATION_LEVELS[index - 1].field];
        if (!parentId) return null;
        return (
          <div className="field" key={level.field}>
            <Select
              id={`filter-${level.field}`}
              label={level.label}
              value={draft.location[level.field] || null}
              placeholder={`Any ${level.label.toLowerCase()}`}
              data={getChildren(organization, parentId).map((node) => ({ value: node.id, label: node.name }))}
              onChange={(value) => setLocation(index, value || '')}
            />
          </div>
        );
      })}
      <div className="field">
        <Select id="filter-reporter" label="Reporter" value={draft.reporterId || null} placeholder="Any reporter" data={plantUsers.map((person) => ({ value: person.id, label: person.name }))} onChange={(value) => set({ reporterId: value || '' })} />
      </div>
    </Sheet>
  );
}
