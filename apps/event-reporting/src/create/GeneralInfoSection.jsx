import { useApp } from '../AppContext.js';
import { getReferenceList } from '../logic/lookups.js';
import { MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from '../logic/validation.js';
import AttachmentInput from './AttachmentInput.jsx';
import ChipGroup from './ChipGroup.jsx';
import { FieldError, SelectField, TextField } from './fields.jsx';

// General information: the core facts and optional photos or videos (FR-006 to FR-008).
export default function GeneralInfoSection({ event, update, errors, attachments, setAttachments }) {
  const { reference, users, user } = useApp();
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === event.plantId));
  const description = event.description || '';

  return (
    <>
      <TextField
        id="title"
        label="Title"
        required
        value={event.title}
        maxLength={MAX_TITLE_LENGTH}
        onChange={(value) => update({ title: value })}
        errors={errors}
      />
      <SelectField
        id="reporterId"
        label="Reporter"
        value={event.reporterId}
        options={plantUsers.map((person) => ({ id: person.id, label: person.name }))}
        disabled={user.role !== 'Manager'}
        hint={user.role === 'Manager' ? 'As a Manager you can report on behalf of someone else.' : undefined}
        onChange={(value) => update({ reporterId: value })}
        errors={errors}
      />
      <TextField id="reportDate" label="Report date" type="date" value={event.reportDate} readOnly onChange={() => {}} />
      <TextField
        id="eventTime"
        label="Event time"
        required
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
      <div className="field">
        <label htmlFor="description" className="required">
          Description
        </label>
        <div className="composer">
          <textarea
            id="description"
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="What happened? Describe it clearly and briefly."
            aria-describedby="description-count"
            onChange={(e) => update({ description: e.target.value })}
          />
          <AttachmentInput attachments={attachments} onChange={setAttachments} errors={errors} />
        </div>
        <span className="field-hint" id="description-count">
          {description.length} / {MAX_DESCRIPTION_LENGTH}
        </span>
        <FieldError errors={errors} field="description" />
      </div>
    </>
  );
}
