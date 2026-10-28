import { useState } from 'react';
import { Button, MultiSelect, Stack } from '@mantine/core';
import { useApp } from '../AppContext.js';
import {
  departmentsOf,
  levelsOfPillar,
  ruleRecipientOptions,
  validateRule,
} from '../../../../shared/platform/notifications.js';
import { saveNotificationRule } from '../../../../shared/platform/platformData.js';
import Sheet from '../shell/Sheet.jsx';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';

// Adds or edits a submission rule of a pillar; mistakes are shown next to each field (NT-7, NT-8).
export default function RuleForm({ plantId, pillar, rule, onSaved, onClose }) {
  const { user, users, organization, reference } = useApp();
  const [draft, setDraft] = useState({
    id: rule?.id ?? '',
    plantId,
    pillarId: pillar.id,
    levelCodes: rule?.levelCodes ?? [],
    departmentIds: rule?.departmentIds ?? [],
    userIds: rule?.userIds ?? [],
  });
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const set = (changes) => setDraft((current) => ({ ...current, ...changes }));

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validateRule(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) scrollToFirstProblemSoon();
    if (Object.keys(found).length > 0) return;
    try {
      await saveNotificationRule(user, draft);
      onSaved(rule ? 'The rule was saved.' : 'The rule was added.');
    } catch (error) {
      setSaveError(error.message);
    }
  }

  const footer = (
    <Button type="submit" form="rule-form" className="button button--primary button--block">
      {rule ? 'Save changes' : 'Add rule'}
    </Button>
  );

  return (
    <Sheet title={`${rule ? 'Edit' : 'Add'} a ${pillar.label} rule`} onClose={onClose} footer={footer}>
      <form id="rule-form" onSubmit={handleSubmit} noValidate>
        {saveError && (
          <p className="message message--error" role="alert">
            {saveError}
          </p>
        )}
        <Stack gap="md">
          <MultiSelect
            label="Levels"
            required
            data={levelsOfPillar(reference, pillar.id).map((level) => ({ value: level.code, label: `${level.code} — ${level.label}` }))}
            value={draft.levelCodes}
            onChange={(levelCodes) => set({ levelCodes })}
            error={errors.levelCodes}
            comboboxProps={{ withinPortal: true }}
          />
          <MultiSelect
            label="Departments"
            description="None chosen: all departments."
            placeholder={draft.departmentIds.length ? '' : 'All departments'}
            data={departmentsOf(organization, plantId).map((department) => ({ value: department.id, label: department.name }))}
            value={draft.departmentIds}
            onChange={(departmentIds) => set({ departmentIds })}
            comboboxProps={{ withinPortal: true }}
          />
          <MultiSelect
            label="People"
            required
            searchable
            data={ruleRecipientOptions(users, plantId, pillar.id).map((person) => ({ value: person.id, label: `${person.name} — ${person.role}` }))}
            value={draft.userIds}
            onChange={(userIds) => set({ userIds })}
            error={errors.userIds}
            comboboxProps={{ withinPortal: true }}
          />
        </Stack>
      </form>
    </Sheet>
  );
}
