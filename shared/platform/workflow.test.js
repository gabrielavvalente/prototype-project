import { describe, expect, it } from 'vitest';
import { users } from './sampleData.js';
import {
  analysisWithoutReview,
  canEditSetting,
  cellStateFor,
  isOnlySubmission,
  resultingWorkflow,
  validReviewers,
  workflowForEvent,
} from './workflow.js';

const byId = (id) => users.find((user) => user.id === id);
const ALL = ['plant-lyon', 'plant-curitiba', 'plant-porto'];

function setting(id, levelCode, phase, scopeLevel, plantIds, authorId, reviewerIds = []) {
  return { id, pillarId: 'pillar-hs', levelCode, phase, scopeLevel, plantIds, authorId, reviewerIds, updatedAt: '2026-10-24' };
}

// The example of spec User Story 1.
const settings = [
  ...['TF1', 'TF2', 'TF3'].map((code) =>
    setting(`c-${code}`, code, 'review', 'central', ALL, 'user-ludovic', ['user-carla', 'user-felix']),
  ),
  ...['TF1', 'TF2'].map((code) =>
    setting(`k-${code}`, code, 'rootCause', 'cluster', ['plant-lyon', 'plant-porto'], 'user-lucas'),
  ),
  setting('l-TF3', 'TF3', 'actions', 'local', ['plant-lyon'], 'user-eva'),
];

const required = (result) => Object.keys(result).filter((phase) => result[phase].required);

describe('resultingWorkflow (FR-007)', () => {
  it('adds what each level requires for the plant', () => {
    const at = (levelCode, plantId) => required(resultingWorkflow(settings, { pillarId: 'pillar-hs', levelCode, plantId }));
    expect(at('TF3', 'plant-lyon')).toEqual(['submission', 'review', 'actions']);
    expect(at('TF3', 'plant-porto')).toEqual(['submission', 'review']);
    expect(at('TF1', 'plant-curitiba')).toEqual(['submission', 'review']);
    expect(at('TF1', 'plant-lyon')).toEqual(['submission', 'review', 'rootCause']);
    expect(at('TF4', 'plant-lyon')).toEqual(['submission']);
  });

  it('applies the settings of two clusters covering the same plant', () => {
    const both = [
      ...settings,
      setting('p-TF4', 'TF4', 'validation', 'cluster', ['plant-lyon', 'plant-curitiba'], 'user-pascal'),
      setting('k-TF4', 'TF4', 'actions', 'cluster', ['plant-lyon', 'plant-porto'], 'user-lucas'),
    ];
    const lyon = resultingWorkflow(both, { pillarId: 'pillar-hs', levelCode: 'TF4', plantId: 'plant-lyon' });
    expect(required(lyon)).toEqual(['submission', 'actions', 'validation']);
  });
});

describe('who may change what (FR-008, FR-009)', () => {
  it('locks a Central cell for Local and Cluster', () => {
    const cell = { pillarId: 'pillar-hs', levelCode: 'TF2', phase: 'review' };
    expect(cellStateFor(byId('user-eva'), settings, cell).state).toBe('locked');
    expect(cellStateFor(byId('user-lucas'), settings, cell).state).toBe('locked');
    expect(cellStateFor(byId('user-ludovic'), settings, cell).state).toBe('mine');
  });

  it('locks a Cluster cell for the Local of a covered plant only', () => {
    const cell = { pillarId: 'pillar-hs', levelCode: 'TF1', phase: 'rootCause' };
    expect(cellStateFor(byId('user-eva'), settings, cell).state).toBe('locked');
    expect(cellStateFor(byId('user-felix'), settings, cell).state).toBe('optional');
  });

  it('lets people at the same level with a plant in common change a setting', () => {
    const evaSetting = settings.find((item) => item.id === 'l-TF3');
    const lucasSetting = settings.find((item) => item.id === 'k-TF1');
    expect(canEditSetting(byId('user-carla'), evaSetting)).toBe(true);
    expect(canEditSetting(byId('user-pascal'), lucasSetting)).toBe(true);
    expect(canEditSetting(byId('user-eva'), lucasSetting)).toBe(false);
    expect(canEditSetting(byId('user-felix'), evaSetting)).toBe(false);
  });
});

describe('reviewers and the workflow kept on events (FR-010, FR-012, FR-026)', () => {
  it('offers Managers and Site Admins who can see the pillar', () => {
    const names = validReviewers(users, { pillarId: 'pillar-hs', plantIds: ['plant-lyon'] }).map((user) => user.id);
    expect(names).toEqual(['user-carla', 'user-diego', 'user-eva', 'user-lucas']);
  });

  it('keeps the reviewers who can see the event only', () => {
    const event = { pillarId: 'pillar-hs', levelCode: 'TF2', plantId: 'plant-curitiba' };
    const workflow = workflowForEvent(settings, users, event);
    expect(workflow.phases.review.required).toBe(true);
    expect(workflow.phases.review.reviewerIds).toEqual(['user-felix']);
    expect(isOnlySubmission(workflow)).toBe(false);
  });

  it('closes an event when only Submission is required', () => {
    const event = { pillarId: 'pillar-hs', levelCode: 'TF5', plantId: 'plant-lyon' };
    expect(isOnlySubmission(workflowForEvent(settings, users, event))).toBe(true);
  });

  it('finds Root cause analysis required where Review is not (review 2026-10-25)', () => {
    expect(analysisWithoutReview(settings, ALL)).toEqual([]);
    const withoutReview = settings.filter((item) => item.id !== 'c-TF2');
    expect(analysisWithoutReview(withoutReview, ALL)).toEqual([
      { levelCode: 'TF2', plantId: 'plant-lyon' },
      { levelCode: 'TF2', plantId: 'plant-porto' },
    ]);
    const centralAnalysis = [...settings, setting('c-TF4', 'TF4', 'rootCause', 'central', ALL, 'user-ludovic')];
    expect(analysisWithoutReview(centralAnalysis, ALL).map((item) => item.plantId)).toEqual(ALL);
  });
});
