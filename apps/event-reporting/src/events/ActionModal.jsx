import { useState } from 'react';
import { Button, Modal, MultiSelect, NativeSelect, Textarea, TextInput } from '@mantine/core';
import ChipGroup from '../create/ChipGroup.jsx';
import { YesNoField } from '../create/fields.jsx';
import { ACTION_PRIORITIES, MAX_ASSIGNEES, validateAction } from '../logic/actions.js';
import DueDateHistory from './DueDateHistory.jsx';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';

const PRIORITY_OPTIONS = ACTION_PRIORITIES.map((priority) => ({ value: priority, label: priority }));

// Creates or edits an action of the event's action plan (005 AP-4, AP-8; its location is the
// event's, not asked), from a why of the analysis
// (the why is then fixed) or from the Actions step (an optional why of the analysis). Nothing is
// kept until Create (Save when editing).
export default function ActionModal({ action, isNew, event, whys, whyFixed, candidates, onSave, onClose }) {
  const [draft, setDraft] = useState(action);
  const [errors, setErrors] = useState({});
  const set = (changes) => setDraft((current) => ({ ...current, ...changes }));
  const why = whys?.find((item) => item.id === draft.whyId);

  function save() {
    const found = validateAction(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) scrollToFirstProblemSoon();
    if (Object.keys(found).length === 0) onSave(draft);
  }

  return (
    <Modal opened onClose={onClose} title={isNew ? 'New action' : 'Edit action'} size="lg">
      {whyFixed ? (
        <div className="action-modal-why">
          <span className="field-label">Why</span>
          <p>{why?.answer.trim() || 'No answer written yet.'}</p>
        </div>
      ) : (
        whys && (
          <NativeSelect
            label="Why (optional)"
            description="The why of the 5 Why this action addresses."
            data={[{ value: '', label: 'None' }, ...whys.map((item) => ({ value: item.id, label: item.answer }))]}
            value={draft.whyId ?? ''}
            onChange={(e) => set({ whyId: e.target.value || null })}
          />
        )
      )}
      <Textarea
        mt="sm"
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
      <DueDateHistory history={draft.dueDateHistory} />
      <ChipGroup
        id="action-priority"
        label="Priority"
        required
        options={PRIORITY_OPTIONS}
        value={draft.priority}
        errors={errors.priority ? [{ field: 'action-priority', message: errors.priority }] : []}
        onChange={(priority) => set({ priority })}
      />
      <YesNoField
        id="action-maintenance"
        label="Notify maintenance"
        value={draft.notifyMaintenance}
        errors={errors.notifyMaintenance ? [{ field: 'action-maintenance', message: errors.notifyMaintenance }] : []}
        onChange={(notifyMaintenance) => set({ notifyMaintenance })}
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
