import { useState } from 'react';
import { Button, Modal, MultiSelect, Textarea, TextInput } from '@mantine/core';
import ChipGroup from '../create/ChipGroup.jsx';
import { ACTION_PRIORITIES, MAX_ASSIGNEES, validateAction } from '../logic/actions.js';

const PRIORITY_OPTIONS = ACTION_PRIORITIES.map((priority) => ({ value: priority, label: priority }));

// Creates or edits an action linked to a why (004 FR-011a). Nothing is kept until Create (Save when
// editing); the analysis itself is stored with the step's Save.
export default function ActionModal({ action, whyText, candidates, onSave, onClose }) {
  const isNew = !action.description;
  const [draft, setDraft] = useState(action);
  const [errors, setErrors] = useState({});
  const set = (changes) => setDraft((current) => ({ ...current, ...changes }));

  function save() {
    const found = validateAction(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(draft);
  }

  return (
    <Modal opened onClose={onClose} title={isNew ? 'New action' : 'Edit action'} size="lg">
      <div className="action-modal-why">
        <span className="field-label">Why</span>
        <p>{whyText.trim() || 'No answer written yet.'}</p>
      </div>
      <Textarea
        label="Description"
        required
        data-autofocus
        minRows={3}
        autosize
        value={draft.description}
        error={errors.description}
        onChange={(e) => set({ description: e.target.value })}
      />
      <MultiSelect
        mt="sm"
        label="Assignees"
        description={`1 to ${MAX_ASSIGNEES} people of the plant.`}
        required
        searchable
        selectFirstOptionOnChange
        maxValues={MAX_ASSIGNEES}
        data={candidates.map((person) => ({ value: person.id, label: person.name }))}
        value={draft.assigneeIds}
        error={errors.assigneeIds}
        onChange={(assigneeIds) => set({ assigneeIds })}
      />
      <TextInput
        mt="sm"
        type="date"
        label="Due date"
        required
        value={draft.dueDate}
        error={errors.dueDate}
        onChange={(e) => set({ dueDate: e.target.value })}
      />
      <ChipGroup
        id="action-priority"
        label="Priority"
        required
        options={PRIORITY_OPTIONS}
        value={draft.priority}
        errors={errors.priority ? [{ field: 'action-priority', message: errors.priority }] : []}
        onChange={(priority) => set({ priority })}
      />
      <div className="form-actions">
        <Button type="button" variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={save}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </div>
    </Modal>
  );
}
