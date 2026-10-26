import { describe, expect, it } from 'vitest';
import { investigationGroups, organization, reference, users } from '../../../../shared/platform/sampleData.js';
import { events, reference as formLists } from '../data/sampleData.js';
import {
  alertContent,
  canPublish,
  canReadCommunication,
  canSeeWarning,
  communicationStates,
  hasAlert,
  nextSteps,
  publishWarning,
  setWarningPhotos,
  warningContent,
  warningState,
  warningToShow,
} from './safetyCommunication.js';

const NOW = '2026-10-26T10:00:00.000Z';
const TODAY = '2026-10-26';
const lookups = { organization, reference: [...reference, ...formLists] };
const byId = (id) => users.find((user) => user.id === id);
const sample = (record) => events.find((event) => event.recordNumber === record);

const review = (changes = {}) => ({
  decision: 'valid',
  reviewerId: 'user-carla',
  statement: 'A worker cut a finger on a sharp sheet edge.',
  classification: {},
  potential: { impact: 'severe', duration: 'medium', score: 50, band: 'high' },
  actual: { impact: 'minor', duration: 'short', score: 5, band: 'low' },
  criticalFlags: ['SIP'],
  reviewedAt: NOW,
  ...changes,
});

// TF-26-0002 (TF3, Lyon, reporter Ana) reviewed by Carla, analysed and planned by Diego.
function workedEvent() {
  const event = sample('TF-26-0002');
  return {
    ...event,
    status: 'In Progress',
    review: review({ furtherAnalysis: true, rcaAssignees: { userIds: ['user-diego'], groupIds: [] } }),
    rca: {
      statement: 'A worker cut a finger on a sharp sheet edge.',
      causes: [{ id: 'c1', theme: 'methods', option: 'Inadequate procedure', other: '', why: 'No step to deburr the edges.' }],
      whys: [{ id: 'w1', parentId: 'c1', answer: 'Deburring is not in the work instruction.', rootCause: true }],
      learnings: 'Sharp edges must be deburred before handling.',
      completedBy: 'user-diego',
      completedAt: NOW,
    },
    actions: [{ id: 'a1', description: 'Deburr the sheet edges', assigneeIds: ['user-ana'], dueDate: '2026-11-09', priority: 'High', status: 'onGoing', notifyMaintenance: false }],
    actionPlan: { deployedBy: 'user-diego', deployedAt: NOW },
  };
}

describe('which events have documents (SC-1, SC-4, SC-5)', () => {
  it('gives an Alert to valid reviews of H&S, Environment and Industrial Risk only', () => {
    expect(hasAlert(sample('TF-26-0003'))).toBe(false);
    expect(hasAlert({ ...sample('TF-26-0003'), review: review() })).toBe(true);
    expect(hasAlert({ ...sample('TF-26-0003'), status: 'Archived', review: review({ decision: 'invalid' }) })).toBe(false);
    expect(hasAlert({ ...sample('OH-26-0001'), review: review() })).toBe(false);
  });

  it('has a Warning draft once the analysis is completed and the plan deployed', () => {
    const event = workedEvent();
    expect(warningState(event)).toBe('draft');
    expect(warningState({ ...event, rca: { ...event.rca, completedAt: null } })).toBe('none');
    expect(warningState({ ...event, actionPlan: null })).toBe('none');
    expect(warningState({ ...sample('TF-26-0003'), review: review(), actionPlan: { deployedAt: NOW } })).toBe('none');
  });
});

describe('content (SC-2, SC-4, SC-5)', () => {
  it('builds the Alert from the event', () => {
    const event = { ...sample('TF-26-0003'), status: 'In Progress', review: review({ furtherAnalysis: false }) };
    const alert = alertContent(event, lookups);
    expect(alert).toMatchObject({
      record: 'TF-26-0003',
      plant: 'Lyon',
      pillar: 'Health & Safety',
      level: 'TF2 — Non-Lost Time Accident',
      critical: 'SIP',
      severity: [
        { label: 'Potential severity', value: '50 — Very Critical (Severe × Medium term)' },
        { label: 'Actual severity', value: '5 — Moderate (Minor × Short term)' },
      ],
      immediateActions: [{ description: 'Area made safe and people informed', priority: 'High' }],
      nextSteps: 'Actions',
    });
  });

  it('says when nothing is left', () => {
    expect(nextSteps({ ...sample('TF-26-0006'), status: 'Closed', review: review() })).toBe('None — the event is closed.');
  });

  it('adds the analysis and the plan to the Warning', () => {
    const warning = warningContent(workedEvent(), lookups, TODAY);
    expect(warning.causes).toEqual([{ cause: 'Methods › Inadequate procedure', how: 'No step to deburr the edges.' }]);
    expect(warning.rootCauses).toEqual(['Deburring is not in the work instruction.']);
    expect(warning.learnings).toBe('Sharp edges must be deburred before handling.');
    expect(warning.actions).toEqual([{ description: 'Deburr the sheet edges', status: 'On Going', dueDate: '9 Nov 2026' }]);
    expect(warning.summary).toBe('2 actions · 1 completed · 0 overdue');
  });

  it('names nobody, and never shows the title (SC-2)', () => {
    const event = workedEvent();
    const text = JSON.stringify([alertContent(event, lookups), warningContent(event, lookups, TODAY)]);
    for (const person of users) expect(text).not.toContain(person.name);
    expect(text).not.toContain(event.title);
    expect(text).not.toContain('user-');
  });
});

describe('who reads and publishes (SC-3, SC-5, SC-7)', () => {
  it('lets everyone of the plant read, whatever their pillars', () => {
    const env = { ...sample('EVE-26-0001'), review: review() };
    expect(canReadCommunication(byId('user-diego'), env)).toBe(true);
    expect(canReadCommunication(byId('user-felix'), env)).toBe(false);
    expect(canReadCommunication(byId('user-ludovic'), env)).toBe(false);
  });

  it('shows the draft to the plan owners only, then to the plant once published', () => {
    const event = workedEvent();
    expect(canSeeWarning(byId('user-diego'), event, investigationGroups, users)).toBe(true);
    expect(canSeeWarning(byId('user-ana'), event, investigationGroups, users)).toBe(false);
    expect(canPublish(byId('user-carla'), event, investigationGroups, users)).toBe(false);
    const content = warningContent(setWarningPhotos(event, ['p1']), lookups, TODAY);
    const published = publishWarning(event, content, 'user-diego', NOW);
    expect(warningState(published)).toBe('published');
    expect(canSeeWarning(byId('user-ana'), published, investigationGroups, users)).toBe(true);
    expect(canPublish(byId('user-diego'), published, investigationGroups, users)).toBe(false);
    expect(published.safetyWarning.photoIds).toEqual(['p1']);
  });

  it('keeps the published content frozen', () => {
    const event = workedEvent();
    const published = publishWarning(event, warningContent(event, lookups, TODAY), 'user-diego', NOW);
    const moved = { ...published, actions: [{ ...published.actions[0], dueDate: '2026-11-16' }] };
    expect(warningToShow(moved, lookups, TODAY).actions[0].dueDate).toBe('9 Nov 2026');
    expect(warningToShow(moved, lookups, TODAY).publishedOn).toBe('26 Oct 2026');
  });
});

describe('the Communications section of the steps menu (SC-10)', () => {
  const states = (user, event) =>
    communicationStates(byId(user), event, investigationGroups, users).map((item) => `${item.label}: ${item.hint}${item.open ? ' (opens)' : ''}`);

  it('says when each document will be available', () => {
    expect(states('user-ana', sample('TF-26-0003'))).toEqual(['Safety Alert: After the review', 'Safety Warning: After the analysis and the action plan']);
    const reviewed = { ...sample('TF-26-0003'), status: 'In Progress', review: review({ furtherAnalysis: false }) };
    expect(states('user-ana', reviewed)).toEqual(['Safety Alert: Available (opens)', 'Safety Warning: Only after a root cause analysis']);
    expect(states('user-ana', { ...sample('OH-26-0001'), review: review() })).toEqual(['Safety Alert: Not for Industrial Hygiene', 'Safety Warning: Not for Industrial Hygiene']);
    expect(states('user-ana', { ...sample('TF-26-0001'), status: 'Archived', review: review({ decision: 'invalid' }) })).toEqual([
      'Safety Alert: Not for an archived event',
      'Safety Warning: Not for an archived event',
    ]);
  });

  it('opens the draft for the plan owners only, then the published Warning for everyone', () => {
    const event = workedEvent();
    expect(states('user-diego', event)[1]).toBe('Safety Warning: Draft — ready to publish (opens)');
    expect(states('user-ana', event)[1]).toBe('Safety Warning: Being prepared by the plan owners');
    const published = publishWarning(event, warningContent(event, lookups, TODAY), 'user-diego', NOW);
    expect(states('user-ana', published)[1]).toBe('Safety Warning: Published (opens)');
  });
});
