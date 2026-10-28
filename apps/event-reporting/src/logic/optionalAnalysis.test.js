import { describe, expect, it } from 'vitest';
import { investigationGroups, users } from '../../../../shared/platform/sampleData.js';
import { events } from '../data/sampleData.js';
import { canStartAnalysis, startAnalysis, startedAnalystIds, validateStart } from './optionalAnalysis.js';
import { designatedIds } from './rootCause.js';
import { currentStep, stepStates } from './review.js';

const NOW = '2026-10-28T10:00:00.000Z';
const byId = (id) => users.find((user) => user.id === id);
const sample = (record) => events.find((event) => event.recordNumber === record);
const state = (event) => stepStates(event).find((item) => item.step === 'rootCause').state;
const valid = { decision: 'valid', reviewerId: 'user-carla', furtherAnalysis: null, rcaAssignees: null };

describe('optional analysis (RCA-18)', () => {
  it('is optional after a valid review nobody asked analysis for, In Progress or Closed', () => {
    expect(state({ ...sample('TF-26-0006'), status: 'Closed', review: valid })).toBe('optional');
    expect(state({ ...sample('TF-26-0003'), status: 'In Progress', review: valid })).toBe('optional');
    expect(state(sample('TF-26-0006'))).toBe('skipped');
    expect(state({ ...sample('TF-26-0001'), status: 'Archived', review: { ...valid, decision: 'invalid' } })).toBe('skipped');
  });

  it('is started by the reviewer and the plant Managers and Site Admins who see the event', () => {
    const closed = { ...sample('TF-26-0006'), status: 'Closed', review: valid };
    expect(['user-carla', 'user-eva', 'user-diego', 'user-ana', 'user-felix'].map((id) => canStartAnalysis(byId(id), closed))).toEqual([true, true, true, false, false]);
  });

  it('needs someone, reopens a Closed event and makes the analysis the current step', () => {
    expect(validateStart({ userIds: [], groupIds: [] })).toBe('Choose who will perform the root cause analysis.');
    const closed = { ...sample('TF-26-0006'), status: 'Closed', closedAt: NOW, review: valid };
    const started = startAnalysis(closed, { userIds: ['user-diego', 'user-carla'], groupIds: [] }, byId('user-carla'), NOW);
    expect(started).toMatchObject({ status: 'In Progress', closedAt: null });
    expect(currentStep(started)).toBe('rootCause');
    expect(state(started)).toBe('current');
    expect(designatedIds(started, investigationGroups)).toEqual(['user-diego', 'user-carla']);
    expect(startedAnalystIds(started, investigationGroups)).toEqual(['user-diego']);
    expect(canStartAnalysis(byId('user-carla'), started)).toBe(false);
  });

  it('comes before Actions when the event is at Actions', () => {
    const atActions = { ...sample('TF-26-0003'), status: 'In Progress', review: valid };
    expect(currentStep(atActions)).toBe('actions');
    expect(currentStep(startAnalysis(atActions, { userIds: ['user-eva'], groupIds: [] }, byId('user-eva'), NOW))).toBe('rootCause');
  });
});
