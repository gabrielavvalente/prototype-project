import { useCallback, useState } from 'react';
import { useApp } from '../AppContext.js';
import { getLabel, getReferenceList } from '../logic/lookups.js';
import { getRequiredLocationLevels, isTaskTypeRequired, LOCATION_LEVELS } from '../logic/validation.js';
import Icon from '../shell/Icon.jsx';
import ChipGroup from './ChipGroup.jsx';
import { FieldError } from './fields.jsx';
import LocationPicker from './LocationPicker.jsx';

// Location: one field that opens the location picker, then the task type (FR-005).
export default function LocationSection({ event, update, errors }) {
  const { organization, reference } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const names = LOCATION_LEVELS.map((level) => getLabel(organization, event.location[level])).filter(Boolean);
  // TF4 and TF5 only need the department and workshop (FR-005, safety event rules).
  const requiredLevels = getRequiredLocationLevels(event.levelCode);
  const areaOnly = requiredLevels.length < LOCATION_LEVELS.length;
  const chosen = requiredLevels.every((level) => event.location[level]);
  const closePicker = useCallback(() => setPickerOpen(false), []);
  const hasError = errors.some((item) => item.field === 'location');

  return (
    <>
      <div className="field" id="location">
        <span className="field-label required" id="location-label">
          Location in {getLabel(organization, event.plantId)}
        </span>
        <div className={`location-field${chosen ? ' location-field--chosen' : ''}${hasError ? ' location-field--error' : ''}`}>
          <button
            type="button"
            className="location-field-button"
            aria-labelledby="location-label location-value"
            onClick={() => setPickerOpen(true)}
          >
            <Icon name="qr" size={20} />
            <span id="location-value">{names.length > 0 ? names.join(' › ') : 'Search, browse or scan a QR code'}</span>
            {!chosen && <Icon name="chevronRight" size={18} />}
          </button>
          {names.length > 0 && (
            <button
              type="button"
              className="icon-button"
              onClick={() => update({ location: Object.fromEntries(LOCATION_LEVELS.map((level) => [level, ''])) })}
            >
              <Icon name="close" size={18} label="Clear the location" />
            </button>
          )}
        </div>
        {areaOnly && <span className="field-hint">For TF4 and TF5 the department and workshop are enough.</span>}
        <FieldError errors={errors} field="location" />
      </div>
      <ChipGroup
        id="taskTypeId"
        label={isTaskTypeRequired(event.levelCode) ? 'Task type' : 'Task type (optional)'}
        required={isTaskTypeRequired(event.levelCode)}
        value={event.taskTypeId}
        options={getReferenceList(reference, 'taskType').map((item) => ({ value: item.id, label: item.label }))}
        onChange={(value) => update({ taskTypeId: value })}
        errors={errors}
      />
      {pickerOpen && (
        <LocationPicker
          plantId={event.plantId}
          minType={areaOnly ? 'workshop' : 'task'}
          onSelect={(location) => update({ location })}
          onClose={closePicker}
        />
      )}
    </>
  );
}
