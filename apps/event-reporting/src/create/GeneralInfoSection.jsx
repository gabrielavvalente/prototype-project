import { useApp } from '../AppContext.js';
import { Textarea } from '@mantine/core';
import { getReferenceList } from '../logic/lookups.js';
import { EMPLOYEE_TYPE_EMPLOYEE, FIRST_AID_OTHER, isFirstAidRequired, isPersonInvolvedRequired, MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from '../logic/validation.js';
import AttachmentInput from './AttachmentInput.jsx';
import ChipGroup from './ChipGroup.jsx';
import DictationButton from './DictationButton.jsx';
import { FieldError, SelectField, TextField } from './fields.jsx';

// General information: what happened, with optional photos or videos, and who was involved
// (FR-006 to FR-008, FR-010, FR-047). When and who reported it are in Event details (review
// 2026-10-25).
export default function GeneralInfoSection({ event, update, errors, attachments, setAttachments }) {
  const { reference, users } = useApp();
  const plantUsers = users.filter((person) => person.access.some((entry) => entry.plantId === event.plantId));
  const description = event.description || '';
  const isEmployee = event.employeeType === EMPLOYEE_TYPE_EMPLOYEE;
  // Required for TF1–TF3 only (014 ER-11).
  const personRequired = isPersonInvolvedRequired(event.levelCode);
  const firstAidIds = event.firstAidTreatmentIds || [];

  // A new employee type asks for the person again (a user, or a name and activity).
  function chooseEmployeeType(employeeType) {
    update({ employeeType, involvedPersonId: '', involvedPersonName: '', involvedActivity: '' });
  }

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
      <div className="field">
        <div className="composer">
          <Textarea
            id="description"
            label="Description"
            required
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="What happened? Describe it clearly and briefly."
            aria-describedby="description-count"
            onChange={(e) => update({ description: e.target.value })}
            minRows={6}
            autosize
          />
          <AttachmentInput
            attachments={attachments}
            onChange={setAttachments}
            errors={errors}
            extraAction={
              <DictationButton
                onText={(text) =>
                  update((current) => ({
                    description: [current.description.trim(), text].filter(Boolean).join(' ').slice(0, MAX_DESCRIPTION_LENGTH),
                  }))
                }
              />
            }
          />
        </div>
        <span className="field-hint" id="description-count">
          {description.length} / {MAX_DESCRIPTION_LENGTH}
        </span>
        <FieldError errors={errors} field="description" />
      </div>
      <ChipGroup
        id="employeeType"
        label={personRequired ? 'Employee type' : 'Employee type (optional)'}
        required={personRequired}
        allowEmpty={!personRequired}
        value={event.employeeType}
        options={getReferenceList(reference, 'employeeType').map((item) => ({ value: item.id, label: item.label }))}
        onChange={chooseEmployeeType}
        errors={errors}
      />
      {event.employeeType && isEmployee && (
        <SelectField
          id="involvedPersonId"
          label="Person involved"
          required={personRequired}
          value={event.involvedPersonId}
          options={plantUsers.map((person) => ({ id: person.id, label: person.name }))}
          searchable
          onChange={(value) => update({ involvedPersonId: value })}
          errors={errors}
        />
      )}
      {event.employeeType && !isEmployee && (
        <>
          <TextField
            id="involvedPersonName"
            label="Name of the person involved"
            required={personRequired}
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
        <ChipGroup
          id="firstAidTreatmentIds"
          label="What was the first aid treatment?"
          hint="Choose all that apply."
          required
          multiple
          value={firstAidIds}
          options={getReferenceList(reference, 'firstAidTreatment').map((item) => ({ value: item.id, label: item.label }))}
          // The description of "Other" goes with it.
          onChange={(ids) => update({ firstAidTreatmentIds: ids, ...(ids.includes(FIRST_AID_OTHER) ? {} : { firstAidOther: '' }) })}
          errors={errors}
        />
      )}
      {isFirstAidRequired(event.levelCode) && firstAidIds.includes(FIRST_AID_OTHER) && (
        <TextField
          id="firstAidOther"
          label="Describe the other first aid treatment"
          required
          value={event.firstAidOther}
          maxLength={200}
          onChange={(value) => update({ firstAidOther: value })}
          errors={errors}
        />
      )}
    </>
  );
}
