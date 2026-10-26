import { describe, expect, it } from 'vitest';
import { investigationGroups, organization, reference, users } from '../../../../shared/platform/sampleData.js';
import { events, reference as formLists } from '../data/sampleData.js';
import { publishWarning, warningContent } from './safetyCommunication.js';
import {
  allowedLocalStatuses,
  buildPackage,
  canCheck,
  canShare,
  checkOf,
  completeCheck,
  completionProblem,
  firstActionText,
  historyOf,
  namedParts,
  namesToHide,
  reachPlants,
  receivedPackages,
  saveLocalAction,
  setLocalActionStatus,
  sharedLines,
  shareWarning,
  startCheck,
  validateLocalAction,
} from './sharingHub.js';

const NOW = '2026-10-26T10:00:00.000Z';
const lookups = { organization, reference: [...reference, ...formLists] };
const byId = (id) => users.find((user) => user.id === id);
const names = (plants) => plants.map((plant) => plant.name);

// TF-26-0002 analysed and planned by Diego, its Warning published.
function published(learnings = 'Sharp edges must be deburred before handling.') {
  const event = events.find((item) => item.recordNumber === 'TF-26-0002');
  const worked = {
    ...event,
    status: 'In Progress',
    review: { decision: 'valid', reviewerId: 'user-carla', statement: 'A finger was cut on a sharp sheet edge.', classification: { hazards: ['h1'] }, criticalFlags: ['SIP'], furtherAnalysis: true, rcaAssignees: { userIds: ['user-diego'], groupIds: [] } },
    rca: { causes: [], whys: [], learnings, completedBy: 'user-diego', completedAt: NOW },
    actions: [],
    actionPlan: { deployedBy: 'user-diego', deployedAt: NOW },
  };
  return publishWarning(worked, warningContent(worked, lookups, '2026-10-26'), 'user-diego', NOW);
}
const pkg = (event) => buildPackage(event, [{ list: 'Hazards', values: ['Sharp edges'] }]);

describe('sharing (SH-1 to SH-4)', () => {
  it('lets the plan owners and the Site Admins of the plant share a published Warning', () => {
    const event = published();
    expect(canShare(byId('user-diego'), event, investigationGroups, users)).toBe(true);
    expect(canShare(byId('user-eva'), event, investigationGroups, users)).toBe(true);
    expect(canShare(byId('user-carla'), event, investigationGroups, users)).toBe(false);
    expect(canShare(byId('user-ana'), event, investigationGroups, users)).toBe(false);
  });

  it('reaches the plants matching every criterion, plus the chosen ones, never the own plant', () => {
    expect(names(reachPlants(organization, { regions: ['Europe'] }, 'plant-lyon'))).toEqual(['Porto']);
    expect(names(reachPlants(organization, { regions: ['Europe'], businesses: ['biz-auto'] }, 'plant-lyon'))).toEqual([]);
    expect(names(reachPlants(organization, { regions: ['Latin America'], businesses: ['biz-auto'] }, 'plant-lyon'))).toEqual(['Curitiba']);
    expect(names(reachPlants(organization, { countries: ['France'], plantIds: ['plant-porto'] }, 'plant-lyon'))).toEqual(['Porto']);
    expect(names(reachPlants(organization, { plantIds: ['plant-lyon', 'plant-curitiba'] }, 'plant-lyon'))).toEqual(['Curitiba']);
  });

  it('refuses a Warning naming someone, with the parts', () => {
    const event = published('Ana Ribeiro must deburr the edges.');
    expect(namedParts(event.safetyWarning.content, namesToHide(event, users))).toEqual(['Key learnings']);
    expect(namedParts(published().safetyWarning.content, namesToHide(published(), users))).toEqual([]);
  });

  it('keeps the first package and skips plants already reached', () => {
    const event = published();
    const first = shareWarning(event, { plantIds: ['plant-porto'], pkg: pkg(event), userId: 'user-diego', now: NOW });
    expect(first.plantIds).toEqual(['plant-porto']);
    const second = shareWarning(first.event, { plantIds: ['plant-porto', 'plant-curitiba'], pkg: { other: true }, userId: 'user-eva', now: NOW });
    expect(second.plantIds).toEqual(['plant-curitiba']);
    expect(second.event.hubShares[1].package).toEqual(first.event.hubShares[0].package);
    expect(sharedLines(second.event, organization)).toEqual(['Shared with Porto on 26 Oct 2026', 'Shared with Curitiba on 26 Oct 2026']);
    expect(JSON.stringify(second.event.hubShares.map((share) => share.package))).not.toContain('Ana Ribeiro');
  });
});

describe('receiving and checking (SH-5 to SH-9)', () => {
  const shared = () => {
    const event = published();
    return shareWarning(event, { plantIds: ['plant-porto'], pkg: pkg(event), userId: 'user-diego', now: NOW }).event;
  };

  it('lists what a plant received', () => {
    expect(receivedPackages([shared()], 'plant-porto').map((item) => item.state)).toEqual(['notChecked']);
    expect(receivedPackages([shared()], 'plant-lyon')).toEqual([]);
  });

  it('lets the plant Site Admins and Managers check', () => {
    expect(canCheck(byId('user-lucas'), 'plant-porto')).toBe(true);
    expect(canCheck(byId('user-gina'), 'plant-porto')).toBe(false);
    expect(canCheck(byId('user-felix'), 'plant-porto')).toBe(false);
  });

  it('runs a check with local actions to completion', () => {
    const event = startCheck(shared(), 'plant-porto', byId('user-lucas'), NOW);
    const text = firstActionText(event.hubShares[0].package);
    expect(text).toBe('Check whether this could happen here: Sharp edges must be deburred before handling. (Hazards: Sharp edges)');
    expect(validateLocalAction({ description: text, assigneeIds: [], dueDate: '' })).toEqual({
      assigneeIds: 'Choose 1 to 5 assignees.',
      dueDate: 'Choose a due date.',
    });
    let checked = saveLocalAction(event, 'plant-porto', { description: text, assigneeIds: ['user-gina'], dueDate: '2026-11-02' });
    const action = checkOf(checked, 'plant-porto').actions[0];
    expect(action.status).toBe('onGoing');
    expect(completionProblem(checkOf(checked, 'plant-porto'), false)).toBe('Finish or cancel every action first.');
    expect(allowedLocalStatuses(byId('user-gina'), action, 'plant-porto')).toEqual(['completed']);
    expect(allowedLocalStatuses(byId('user-lucas'), action, 'plant-porto')).toEqual(['cancelled']);
    checked = setLocalActionStatus(checked, 'plant-porto', action.id, 'completed', byId('user-gina'), NOW);
    expect(completionProblem(checkOf(checked, 'plant-porto'), null)).toBe('Say whether it could happen here.');
    expect(completionProblem(checkOf(checked, 'plant-porto'), false)).toBeNull();
    checked = completeCheck(checked, 'plant-porto', false, byId('user-lucas'), NOW);
    expect(checkOf(checked, 'plant-porto').state).toBe('no');
    expect(historyOf(checked, 'plant-porto').map((item) => item.text)).toEqual([
      'Received on 26 Oct 2026',
      'Check started by Lucas Weber',
      `${text} completed by Gina Rossi`,
      'Check completed by Lucas Weber: could not happen here',
    ]);
  });
});
