import { useState } from 'react';
import { Button, MultiSelect } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getList, validateValue } from '../../../../shared/platform/masterData.js';
import { saveValue } from '../../../../shared/platform/platformData.js';
import { getRole } from '../../../../shared/platform/permissions.js';
import Sheet from '../shell/Sheet.jsx';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';

// Adds a value or edits one (FR-015, FR-019, FR-020). New values belong to the user's level and
// plants; mistakes are shown next to each field before anything is saved. An injury is linked to the
// body parts it is offered for (012 MD-4, MD-5).
export default function ValueForm({ list, value, values, onSaved, onClose }) {
  const { user } = useApp();
  const role = getRole(user, list.pillarId);
  const [draft, setDraft] = useState({
    id: value?.id ?? '',
    code: value?.code ?? '',
    name: value?.name ?? '',
    description: value?.description ?? '',
    parentId: value?.parentId ?? '',
    ...(list.linkedListId ? { bodyPartIds: value?.bodyPartIds ?? [] } : {}),
  });
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const categories = values.filter((item) => item.listId === list.parentListId && item.status !== 'Retired');
  // The linked list's values (Body Parts), grouped by their category.
  const linkedOptions = list.linkedListId
    ? values
        .filter((item) => item.listId === getList(list.linkedListId).parentListId)
        .map((category) => ({
          group: category.name,
          items: values
            .filter((item) => item.listId === list.linkedListId && item.parentId === category.id && item.status !== 'Retired')
            .map((item) => ({ value: item.id, label: item.name })),
        }))
        .filter((group) => group.items.length > 0)
    : [];

  function update(field, text) {
    setDraft((current) => ({ ...current, [field]: text }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const owner = value ?? {
      listId: list.id,
      status: 'Active',
      ownerLevel: role.level,
      ownerPlantIds: role.level === 'central' ? [] : role.plantIds,
    };
    const found = validateValue(list, { ...owner, ...draft }, values);
    setErrors(found);
    if (Object.keys(found).length > 0) scrollToFirstProblemSoon();
    if (Object.keys(found).length > 0) {
      return;
    }
    try {
      const saved = await saveValue(user, list.id, draft);
      onSaved(`${saved.name} was ${value ? 'saved' : 'added'}.`);
    } catch (error) {
      setSaveError(error.message);
    }
  }

  const footer = (
    <Button type="submit" form="value-form" className="button button--primary button--block">
      {value ? 'Save changes' : 'Add value'}
    </Button>
  );

  return (
    <Sheet title={value ? `Edit ${value.name}` : `Add to ${list.label}`} onClose={onClose} footer={footer}>
      <form id="value-form" onSubmit={handleSubmit} noValidate>
        {saveError && (
          <p className="message message--error" role="alert">
            {saveError}
          </p>
        )}
        {list.hasCode && (
          <div className="field">
            <label className="field-label required" htmlFor="value-code">
              Code
            </label>
            <input
              id="value-code"
              value={draft.code}
              onChange={(e) => update('code', e.target.value)}
              aria-invalid={Boolean(errors.code)}
              aria-describedby={errors.code ? 'value-code-error' : undefined}
            />
            {errors.code && (
              <span id="value-code-error" className="field-error">
                {errors.code}
              </span>
            )}
          </div>
        )}
        <div className="field">
          <label className="field-label required" htmlFor="value-name">
            Name
          </label>
          <input
            id="value-name"
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'value-name-error' : undefined}
          />
          {errors.name && (
            <span id="value-name-error" className="field-error">
              {errors.name}
            </span>
          )}
        </div>
        {list.parentListId && (
          <div className="field">
            <label className="field-label required" htmlFor="value-parent">
              Category
            </label>
            <select
              id="value-parent"
              value={draft.parentId}
              onChange={(e) => update('parentId', e.target.value)}
              aria-invalid={Boolean(errors.parentId)}
              aria-describedby={errors.parentId ? 'value-parent-error' : undefined}
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.status === 'Active' ? '' : ` (${category.status})`}
                </option>
              ))}
            </select>
            {errors.parentId && (
              <span id="value-parent-error" className="field-error">
                {errors.parentId}
              </span>
            )}
          </div>
        )}
        {list.linkedListId && (
          <div className="field">
            <MultiSelect
              id="value-body-parts"
              label="Body parts"
              description="The body parts this injury is offered for in the review."
              required
              searchable
              hidePickedOptions
              data={linkedOptions}
              value={draft.bodyPartIds}
              onChange={(ids) => setDraft((current) => ({ ...current, bodyPartIds: ids }))}
              error={errors.bodyPartIds}
            />
          </div>
        )}
        <div className="field">
          <label className="field-label" htmlFor="value-description">
            Description
          </label>
          <textarea
            id="value-description"
            rows={3}
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>
      </form>
    </Sheet>
  );
}
