import { describe, expect, it } from 'vitest';
import {
  canEditEvent,
  canOpenRoute,
  getShareableUsers,
  getManagersToAlert,
  getMenuItems,
  isEventVisible,
} from './access.js';

const lyonAllPillars = {
  businessId: 'biz-auto',
  plantId: 'plant-lyon',
  pillarIds: ['pillar-hs', 'pillar-env'],
};

const reporter = { id: 'user-1', role: 'User', access: [lyonAllPillars] };
const otherReporter = { id: 'user-2', role: 'User', access: [lyonAllPillars] };
const manager = { id: 'user-3', role: 'Manager', access: [lyonAllPillars] };
const siteAdmin = { id: 'user-4', role: 'Site Admin', access: [lyonAllPillars] };
const otherPlantManager = {
  id: 'user-5',
  role: 'Manager',
  access: [{ businessId: 'biz-auto', plantId: 'plant-curitiba', pillarIds: ['pillar-hs'] }],
};

const lyonContext = { businessId: 'biz-auto', plantId: 'plant-lyon', pillarId: null };

function makeEvent(changes = {}) {
  return {
    businessId: 'biz-auto',
    plantId: 'plant-lyon',
    pillarId: 'pillar-hs',
    status: 'Open',
    createdBy: 'user-1',
    ...changes,
  };
}

describe('getMenuItems', () => {
  it('gives User and Manager events, create event and alerts', () => {
    expect(getMenuItems('User')).toEqual(['events', 'create-event', 'my-alerts']);
    expect(getMenuItems('Manager')).toEqual(['events', 'create-event', 'my-alerts']);
  });

  it('gives Site Admin events and alerts, no creation', () => {
    expect(getMenuItems('Site Admin')).toEqual(['events', 'my-alerts']);
  });
});

describe('canOpenRoute', () => {
  it('refuses event creation and editing to Site Admin', () => {
    expect(canOpenRoute('Site Admin', 'events-new')).toBe(false);
    expect(canOpenRoute('Site Admin', 'event-edit')).toBe(false);
    expect(canOpenRoute('Site Admin', 'events')).toBe(true);
    expect(canOpenRoute('Site Admin', 'search')).toBe(true);
  });

  it('allows event creation to User and Manager', () => {
    expect(canOpenRoute('User', 'events-new')).toBe(true);
    expect(canOpenRoute('Manager', 'events-new')).toBe(true);
  });
});

describe('isEventVisible', () => {
  it('shows a submitted event of the same plant and an accessible pillar', () => {
    expect(isEventVisible(otherReporter, lyonContext, makeEvent())).toBe(true);
  });

  it('hides events of another plant or business', () => {
    expect(isEventVisible(reporter, lyonContext, makeEvent({ plantId: 'plant-curitiba' }))).toBe(false);
    expect(isEventVisible(reporter, lyonContext, makeEvent({ businessId: 'biz-pack' }))).toBe(false);
  });

  it('hides events of a pillar the user cannot access', () => {
    expect(isEventVisible(reporter, lyonContext, makeEvent({ pillarId: 'pillar-ih' }))).toBe(false);
  });

  it('narrows to the selected pillar when the user entered through one', () => {
    const envContext = { ...lyonContext, pillarId: 'pillar-env' };
    expect(isEventVisible(reporter, envContext, makeEvent())).toBe(false);
    expect(isEventVisible(reporter, envContext, makeEvent({ pillarId: 'pillar-env' }))).toBe(true);
  });

  it('shows drafts only to the person who created them', () => {
    const draft = makeEvent({ status: 'Draft' });
    expect(isEventVisible(reporter, lyonContext, draft)).toBe(true);
    expect(isEventVisible(otherReporter, lyonContext, draft)).toBe(false);
    expect(isEventVisible(manager, lyonContext, draft)).toBe(false);
  });
});

describe('canEditEvent', () => {
  it('lets the creator edit their own draft only', () => {
    expect(canEditEvent(reporter, makeEvent({ status: 'Draft' }))).toBe(true);
    expect(canEditEvent(otherReporter, makeEvent({ status: 'Draft' }))).toBe(false);
  });

  it('lets a Manager edit submitted events in their scope, not a User', () => {
    expect(canEditEvent(manager, makeEvent())).toBe(true);
    expect(canEditEvent(reporter, makeEvent())).toBe(false);
    expect(canEditEvent(otherPlantManager, makeEvent())).toBe(false);
  });

  it('never lets a Site Admin edit', () => {
    expect(canEditEvent(siteAdmin, makeEvent())).toBe(false);
  });
});

describe('getShareableUsers', () => {
  it('offers people of the plant who can see the pillar, whatever their role', () => {
    const users = [reporter, manager, siteAdmin, otherPlantManager];
    expect(getShareableUsers(users, makeEvent())).toEqual([reporter, manager, siteAdmin]);
    expect(getShareableUsers(users, makeEvent({ pillarId: 'pillar-ih' }))).toEqual([]);
  });
});

describe('getManagersToAlert', () => {
  it('returns Managers of the event plant and pillar only', () => {
    const users = [reporter, manager, siteAdmin, otherPlantManager];
    expect(getManagersToAlert(users, makeEvent())).toEqual([manager]);
    expect(getManagersToAlert(users, makeEvent({ pillarId: 'pillar-ih' }))).toEqual([]);
  });
});
