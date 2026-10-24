import { useApp } from '../AppContext.js';
import { getShareableUsers } from '../logic/access.js';
import { getReferenceList } from '../logic/lookups.js';
import ChipGroup from './ChipGroup.jsx';
import { YesNoField } from './fields.jsx';

// Event details: who was involved, recurrence, comments, who it is shared with, diseases for OH (FR-010).
export default function DetailsSection({ event, update, errors }) {
  const { reference, users, user } = useApp();
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
        onChange={(value) => update({ employeeType: value })}
        errors={errors}
      />
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
        <ChipGroup
          id="sharedWithIds"
          label="Shared with (optional)"
          hint="They get an alert when the event is submitted."
          multiple
          value={event.sharedWithIds}
          options={shareable.map((person) => ({ value: person.id, label: person.name }))}
          onChange={(sharedWithIds) => update({ sharedWithIds })}
          errors={errors}
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
