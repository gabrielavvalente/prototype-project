import { useApp } from '../AppContext.js';
import { getShareableUsers } from '../logic/access.js';
import { getReferenceList } from '../logic/lookups.js';
import { EMPLOYEE_TYPE_EMPLOYEE, isFirstAidRequired } from '../logic/validation.js';
import ChipGroup from './ChipGroup.jsx';
import { SelectField, TextField, YesNoField } from './fields.jsx';
import PeoplePicker from './PeoplePicker.jsx';

// Event details: who was involved, first aid for TF1–TF3, recurrence, comments, who it is shared
// with, diseases for OH (FR-010, FR-047).
export default function DetailsSection({ event, update, errors }) {
  const { reference, users, user } = useApp();
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === event.plantId));
  const isEmployee = event.employeeType === EMPLOYEE_TYPE_EMPLOYEE;

  // A new employee type asks for the person again (a user, or a name and activity).
  function chooseEmployeeType(employeeType) {
    update({ employeeType, involvedPersonId: '', involvedPersonName: '', involvedActivity: '' });
  }
  const diseases = getReferenceList(reference, 'disease');
  // People of this plant who can see the event's pillar, except the person reporting it.
  const shareable = event.pillarId ? getShareableUsers(users, event).filter((person) => person.id !== user.id) : [];

  return (
    <>
      <ChipGroup
        id="employeeType"
        label="Employee type"
        required
        value={event.employeeType}
        options={getReferenceList(reference, 'employeeType').map((item) => ({ value: item.id, label: item.label }))}
        onChange={chooseEmployeeType}
        errors={errors}
      />
      {event.employeeType && isEmployee && (
        <SelectField
          id="involvedPersonId"
          label="Person involved"
          required
          value={event.involvedPersonId}
          options={plantUsers.map((person) => ({ id: person.id, label: person.name }))}
          onChange={(value) => update({ involvedPersonId: value })}
          errors={errors}
        />
      )}
      {event.employeeType && !isEmployee && (
        <>
          <TextField
            id="involvedPersonName"
            label="Name of the person involved"
            required
            value={event.involvedPersonName}
            onChange={(value) => update({ involvedPersonName: value })}
            errors={errors}
          />
          <TextField
            id="involvedActivity"
            label="What was the person doing? (optional)"
            value={event.involvedActivity}
            onChange={(value) => update({ involvedActivity: value })}
          />
        </>
      )}
      {isFirstAidRequired(event.levelCode) && (
        <SelectField
          id="firstAidTreatmentId"
          label="What was the first aid treatment?"
          required
          value={event.firstAidTreatmentId}
          options={getReferenceList(reference, 'firstAidTreatment')}
          onChange={(value) => update({ firstAidTreatmentId: value })}
          errors={errors}
        />
      )}
      <YesNoField
        id="recurrence"
        label="Has this happened before?"
        value={event.recurrence}
        onChange={(value) => update({ recurrence: value })}
        errors={errors}
      />
      <div className="field">
        <label htmlFor="comments">Comments (optional)</label>
        <textarea id="comments" value={event.comments} onChange={(e) => update({ comments: e.target.value })} />
      </div>
      {shareable.length > 0 ? (
        <PeoplePicker
          id="sharedWithIds"
          label="Shared with (optional)"
          hint="They get an alert when the event is submitted."
          people={shareable}
          value={event.sharedWithIds}
          onChange={(sharedWithIds) => update({ sharedWithIds })}
        />
      ) : (
        <div className="field">
          <span className="field-label">Shared with (optional)</span>
          <span className="field-hint">
            {event.pillarId ? 'Nobody else in this plant can see this pillar.' : 'Choose a pillar first.'}
          </span>
        </div>
      )}
      {event.familyCode === 'OH' && (
        <ChipGroup
          id="diseaseIds"
          label="Disease(s)"
          required
          multiple
          value={event.diseaseIds}
          options={diseases.map((disease) => ({ value: disease.id, label: disease.label }))}
          onChange={(diseaseIds) => update({ diseaseIds })}
          errors={errors}
        />
      )}
    </>
  );
}
