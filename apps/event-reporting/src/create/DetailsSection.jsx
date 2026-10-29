import { useApp } from '../AppContext.js';
import { getShareableUsers } from '../logic/access.js';
import { getReferenceList } from '../logic/lookups.js';
import ChipGroup from './ChipGroup.jsx';
import { SelectField, TextField, YesNoField } from './fields.jsx';
import PeoplePicker from './PeoplePicker.jsx';

// Event details: who reports it and when, recurrence, who it is shared with, diseases for OH
// (FR-006, FR-010; review 2026-10-25).
export default function DetailsSection({ event, update, errors }) {
  const { reference, users, user } = useApp();
  const onBehalf = ['Manager', 'Site Admin'].includes(user.role);
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === event.plantId));
  const diseases = getReferenceList(reference, 'disease');
  // People of this plant who can see the event's pillar, except the person reporting it.
  const shareable = event.pillarId ? getShareableUsers(users, event).filter((person) => person.id !== user.id) : [];

  return (
    <>
      <SelectField
        id="reporterId"
        label="Reporter"
        value={event.reporterId}
        options={plantUsers.map((person) => ({ id: person.id, label: person.name }))}
        // Managers and Site Admins report on behalf of someone else (014 ER-13).
        disabled={!onBehalf}
        hint={onBehalf ? 'As a Manager or Site Admin you can report on behalf of someone else.' : undefined}
        onChange={(value) => update({ reporterId: value })}
        errors={errors}
      />
      <TextField id="reportDate" label="Report date" type="date" value={event.reportDate} readOnly onChange={() => {}} />
      <TextField
        id="eventTime"
        label="Event time (optional)"
        type="time"
        value={event.eventTime}
        onChange={(value) => update({ eventTime: value })}
        errors={errors}
      />
      <ChipGroup
        id="shiftMoment"
        label="Shift moment"
        required
        value={event.shiftMoment}
        options={getReferenceList(reference, 'shiftMoment').map((item) => ({ value: item.id, label: item.label }))}
        onChange={(value) => update({ shiftMoment: value })}
        errors={errors}
      />
      <YesNoField
        id="recurrence"
        label="Has this happened before?"
        value={event.recurrence}
        onChange={(value) => update({ recurrence: value })}
        errors={errors}
      />
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
