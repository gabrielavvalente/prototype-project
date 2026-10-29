import { describe, expect, it } from 'vitest';
import { masterValues } from '../../../../shared/platform/catalogs.js';
import { availableValues, classificationValueName, withChosenValues } from '../../../../shared/platform/masterData.js';
import { users, workflowSettings } from '../../../../shared/platform/sampleData.js';
import { workflowForEvent } from '../../../../shared/platform/workflow.js';
import { canEditEvent } from './access.js';
import { countByFamilyAndLevel } from './eventList.js';
import { currentStep, stepStates } from './review.js';

// Rules that keep the past as it was (014 remarks).
describe('deactivated master data (014 remarks)', () => {
  const hazard = masterValues.find((value) => value.id === 'hazards-1');
  const deactivated = masterValues.map((value) => (value.id === hazard.id ? { ...value, status: 'Inactive' } : value));

  it('is no longer offered, but stays on the event that chose it', () => {
    const options = availableValues(deactivated, [], { listId: 'hazards', plantId: 'plant-lyon' }).map((value) => ({ value: value.id, label: value.name }));
    expect(options.map((option) => option.value)).not.toContain(hazard.id);
    // Not chosen: not offered again.
    expect(withChosenValues(options, [], deactivated)).toBe(options);
    // Chosen before: kept, marked.
    const kept = withChosenValues(options, [hazard.id], deactivated);
    expect(kept.at(-1)).toEqual({ value: hazard.id, label: `${hazard.name} (no longer available)` });
    // Past events still read its name.
    expect(classificationValueName(deactivated, hazard.id)).toBe(hazard.name);
  });
});

describe('correcting during the review (014 remarks)', () => {
  const carla = users.find((user) => user.id === 'user-carla');
  const ana = users.find((user) => user.id === 'user-ana');
  const event = { plantId: 'plant-lyon', pillarId: 'pillar-hs', status: 'In Progress', review: { reviewerId: 'user-carla', decision: null } };

  it('lets the assigned reviewer correct the report until the review is completed', () => {
    expect(canEditEvent(carla, event)).toBe(true);
    expect(canEditEvent(ana, event)).toBe(false);
    expect(canEditEvent(carla, { ...event, review: { ...event.review, decision: 'valid' } })).toBe(false);
  });
});

describe('archived events are not reported events (014 remarks)', () => {
  it('leaves them out of the events by type, even when the Status filter shows them', () => {
    const families = [{ id: 'family-tf', code: 'TF' }];
    const levels = [{ familyId: 'family-tf', code: 'TF2' }];
    const events = [
      { status: 'Open', familyCode: 'TF', levelCode: 'TF2' },
      { status: 'Archived', familyCode: 'TF', levelCode: 'TF2' },
      { status: 'Draft', familyCode: 'TF', levelCode: 'TF2' },
    ];
    expect(countByFamilyAndLevel(events, families, levels)[0].total).toBe(1);
  });
});

describe('workflow changes affect new events only (014 remarks)', () => {
  it('keeps an existing event on the workflow of its submission', () => {
    const plant = { pillarId: 'pillar-hs', levelCode: 'TF5', plantId: 'plant-lyon' };
    const existing = { ...plant, id: 'e1', status: 'Open', workflow: workflowForEvent(workflowSettings, users, plant) };
    expect(currentStep(existing)).toBeNull();
    // Later, Central makes TF5 Review Required.
    const later = [...workflowSettings, { id: 's', pillarId: 'pillar-hs', levelCode: 'TF5', phase: 'review', scopeLevel: 'central', plantIds: [], reviewerIds: ['user-carla'], authorId: 'user-ludovic', updatedAt: '2026-10-29' }];
    const fresh = { ...plant, id: 'e2', status: 'Open', workflow: workflowForEvent(later, users, plant) };
    expect(currentStep(fresh)).toBe('review');
    expect(currentStep(existing)).toBeNull();
    expect(stepStates(existing).find((item) => item.step === 'review').state).toBe('skipped');
  });
});
