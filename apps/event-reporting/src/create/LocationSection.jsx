import { useApp } from '../AppContext.js';
import { getChildren, getLabel, getReferenceList } from '../logic/lookups.js';
import ChipGroup from './ChipGroup.jsx';
import { SelectField } from './fields.jsx';

const LEVELS = [
  { field: 'departmentId', label: 'Department' },
  { field: 'workshopId', label: 'Workshop' },
  { field: 'jobId', label: 'Job' },
  { field: 'workstationId', label: 'Workstation' },
  { field: 'taskId', label: 'Task' },
];

// Section 2: drill down Plant → Department → Workshop → Job → Workstation → Task (FR-005).
export default function LocationSection({ event, update, errors }) {
  const { organization, reference } = useApp();

  function chooseLevel(index, value) {
    const location = { ...event.location, [LEVELS[index].field]: value };
    // Changing a parent clears every level below it (spec Edge Cases).
    for (const lower of LEVELS.slice(index + 1)) {
      location[lower.field] = '';
    }
    update({ location });
  }

  return (
    <>
      <div className="field">
        <label htmlFor="plant">Plant</label>
        <input id="plant" value={getLabel(organization, event.plantId)} readOnly />
      </div>
      {LEVELS.map((level, index) => {
        const parentId = index === 0 ? event.plantId : event.location[LEVELS[index - 1].field];
        return (
          <SelectField
            key={level.field}
            id={level.field}
            label={level.label}
            value={event.location[level.field]}
            options={parentId ? getChildren(organization, parentId) : []}
            disabled={!parentId}
            required
            onChange={(value) => chooseLevel(index, value)}
            errors={errors}
          />
        );
      })}
      <ChipGroup
        id="taskTypeId"
        label="Task type"
        required
        value={event.taskTypeId}
        options={getReferenceList(reference, 'taskType').map((item) => ({ value: item.id, label: item.label }))}
        onChange={(value) => update({ taskTypeId: value })}
        errors={errors}
      />
    </>
  );
}
