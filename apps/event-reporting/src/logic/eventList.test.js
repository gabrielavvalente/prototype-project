import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  applyQuickFilter,
  computeKpis,
  countActions,
  countActiveFilters,
  countArchivedByReason,
  countByFamilyAndLevel,
  EMPTY_FILTERS,
  paginate,
  searchEvents,
  sortEvents,
} from './eventList.js';

function makeEvent(id, changes = {}) {
  return {
    id,
    recordNumber: `TF-26-000${id}`,
    title: `Event ${id}`,
    status: 'Open',
    familyCode: 'TF',
    levelCode: 'TF4',
    reporterId: 'user-1',
    createdBy: 'user-1',
    reportDate: '2026-10-01',
    eventTime: '10:00',
    riskQuestion: { type: 'SIP', answer: false },
    location: { departmentId: 'dep-1', workshopId: 'ws-1', jobId: 'job-1', workstationId: 'st-1', taskId: 'task-1' },
    ...changes,
  };
}

const events = [
  makeEvent('1', { title: 'Forklift near miss', reportDate: '2026-09-01', riskQuestion: { type: 'SIP', answer: true } }),
  makeEvent('2', { title: 'Oil leak', familyCode: 'EVE', levelCode: 'EvE4', reporterId: 'user-2', createdBy: 'user-2', reportDate: '2026-09-15' }),
  makeEvent('3', { title: 'Fire in cabinet', familyCode: 'SRE', levelCode: 'SRE3', riskQuestion: { type: 'SRP', answer: true }, reportDate: '2026-10-05', location: { departmentId: 'dep-2', workshopId: 'ws-9', jobId: '', workstationId: '', taskId: '' } }),
  makeEvent('4', { title: 'Draft forklift', status: 'Draft', recordNumber: null, reportDate: '2026-10-20', riskQuestion: { type: 'SIP', answer: true } }),
];

const ids = (list) => list.map((event) => event.id);
const names = { 'user-1': 'Zoe', 'user-2': 'Adam' };

describe('searchEvents (FR-029)', () => {
  it('matches words of the title, ignoring case', () => {
    expect(ids(searchEvents(events, 'FORKLIFT'))).toEqual(['1', '4']);
  });

  it('matches an exact record number, ignoring case', () => {
    expect(ids(searchEvents(events, 'tf-26-0002'))).toEqual(['2']);
    expect(ids(searchEvents(events, 'TF-26'))).toEqual([]);
  });

  it('returns everything for an empty search', () => {
    expect(searchEvents(events, '  ')).toHaveLength(4);
  });
});

describe('applyFilters (FR-030)', () => {
  const filter = (changes) => ids(applyFilters(events, { ...EMPTY_FILTERS, ...changes }, 'user-1'));

  it('filters by type and level', () => {
    expect(filter({ familyCode: 'EVE' })).toEqual(['2']);
    expect(filter({ familyCode: 'TF', levelCode: 'TF4' })).toEqual(['1', '4']);
  });

  it('filters by time range on the report date', () => {
    expect(filter({ from: '2026-09-10', to: '2026-10-05' })).toEqual(['2', '3']);
  });

  it('filters by organization levels', () => {
    expect(filter({ location: { departmentId: 'dep-2' } })).toEqual(['3']);
    expect(filter({ location: { departmentId: 'dep-1', workshopId: 'ws-1' } })).toEqual(['1', '2', '4']);
  });

  it('hides Archived events unless the status filter asks for them', () => {
    const archived = [...events, makeEvent('5', { status: 'Archived' })];
    expect(ids(applyFilters(archived, EMPTY_FILTERS, 'user-1'))).toEqual(['1', '2', '3', '4']);
    expect(ids(applyFilters(archived, { ...EMPTY_FILTERS, status: 'Archived' }, 'user-1'))).toEqual(['5']);
  });

  it('filters by reporter, SIP and status', () => {
    expect(filter({ reporterId: 'user-2' })).toEqual(['2']);
    expect(filter({ sip: 'yes' })).toEqual(['1', '4']);
    expect(filter({ sip: 'no' })).toEqual(['2', '3']);
    expect(filter({ status: 'Draft' })).toEqual(['4']);
  });

  it('shows only my events when My Events is on', () => {
    expect(filter({ myEvents: true })).toEqual(['1', '3', '4']);
  });

  it('combines filters with search', () => {
    const filtered = applyFilters(searchEvents(events, 'forklift'), { ...EMPTY_FILTERS, status: 'Open' }, 'user-1');
    expect(ids(filtered)).toEqual(['1']);
  });
});

describe('sortEvents', () => {
  it('sorts by date both ways', () => {
    expect(ids(sortEvents(events, 'date', 'asc', names))).toEqual(['1', '2', '3', '4']);
    expect(ids(sortEvents(events, 'date', 'desc', names))).toEqual(['4', '3', '2', '1']);
  });

  it('sorts by type, level, status and reporter name', () => {
    expect(ids(sortEvents(events, 'type', 'asc', names))).toEqual(['2', '3', '1', '4']);
    expect(ids(sortEvents(events, 'level', 'asc', names))).toEqual(['2', '3', '1', '4']);
    expect(ids(sortEvents(events, 'status', 'asc', names))).toEqual(['4', '1', '2', '3']);
    expect(ids(sortEvents(events, 'reporter', 'asc', names))).toEqual(['2', '1', '3', '4']);
  });

  it('does not change the original list', () => {
    sortEvents(events, 'date', 'desc', names);
    expect(ids(events)).toEqual(['1', '2', '3', '4']);
  });
});

describe('paginate (FR-026)', () => {
  const many = Array.from({ length: 120 }, (_, i) => makeEvent(String(i)));

  it('splits into pages of 20, 50 or 100', () => {
    expect(paginate(many, 20, 1).rows).toHaveLength(20);
    expect(paginate(many, 50, 3).rows).toHaveLength(20);
    expect(paginate(many, 100, 1).pageCount).toBe(2);
  });

  it('keeps the page inside the range', () => {
    expect(paginate(many, 100, 9).page).toBe(2);
    expect(paginate([], 20, 3)).toEqual({ rows: [], page: 1, pageCount: 1 });
  });
});

describe('KPI chips (FR-031)', () => {
  it('counts own drafts in All, My events and Drafts only', () => {
    expect(computeKpis(events, 'user-1')).toEqual({ all: 4, mine: 3, open: 3, sip: 1, drafts: 1 });
  });

  it('narrows the list to the chosen chip', () => {
    expect(ids(applyQuickFilter(events, 'all', 'user-1'))).toEqual(['1', '2', '3', '4']);
    expect(ids(applyQuickFilter(events, 'mine', 'user-2'))).toEqual(['2']);
    expect(ids(applyQuickFilter(events, 'sip', 'user-1'))).toEqual(['1']);
    expect(ids(applyQuickFilter(events, 'drafts', 'user-1'))).toEqual(['4']);
  });
});

describe('countActiveFilters (FR-042)', () => {
  it('counts each filter in use once', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(countActiveFilters({ ...EMPTY_FILTERS, familyCode: 'TF', from: '2026-01-01' })).toBe(2);
    expect(countActiveFilters({ ...EMPTY_FILTERS, location: { departmentId: 'd', workshopId: 'w' } })).toBe(1);
  });
});

describe('countByFamilyAndLevel (review 2026-10-25)', () => {
  const families = [
    { id: 'family-tf', code: 'TF' },
    { id: 'family-eve', code: 'EVE' },
    { id: 'family-oh', code: 'OH' },
  ];
  const levels = [
    { familyId: 'family-tf', code: 'TF3' },
    { familyId: 'family-tf', code: 'TF4' },
    { familyId: 'family-eve', code: 'EvE4' },
  ];

  it('counts submitted events per family and level, leaving drafts out', () => {
    const result = countByFamilyAndLevel(events, families, levels);
    expect(result.map((item) => [item.family.code, item.total])).toEqual([['TF', 1], ['EVE', 1], ['OH', 0]]);
    expect(result[0].levels.map((item) => [item.level.code, item.count])).toEqual([['TF3', 0], ['TF4', 1]]);
  });
});

describe('countArchivedByReason (third review)', () => {
  it('counts archived events per reason and type', () => {
    const families = [{ id: 'family-tf', code: 'TF' }, { id: 'family-eve', code: 'EVE' }];
    const archived = [
      makeEvent('a', { status: 'Archived', review: { invalidReason: 'Duplicated' } }),
      makeEvent('b', { status: 'Archived', familyCode: 'EVE', review: { invalidReason: 'Duplicated' } }),
      makeEvent('c', { status: 'Archived', review: { invalidReason: 'Useless' } }),
      makeEvent('d', { status: 'Open' }),
    ];
    const result = countArchivedByReason(archived, ['Duplicated', 'Useless', 'Bad quality'], families);
    expect(result.map((item) => [item.reason, item.total])).toEqual([['Duplicated', 2], ['Useless', 1], ['Bad quality', 0]]);
    expect(result[0].families.map((item) => item.count)).toEqual([1, 1]);
  });
});

describe('action counts for the KPIs (005 EL-12)', () => {
  const withActions = [
    { id: 'e1', actions: [{ status: 'onGoing', dueDate: '2026-10-25' }, { status: 'planned', dueDate: '2026-10-01' }] },
    { id: 'e2', actions: [{ status: 'toComplete', dueDate: '2026-11-30' }, { status: 'completed', dueDate: '2026-10-01' }] },
    { id: 'e3' },
  ];

  it('counts deployed open actions and the overdue ones', () => {
    expect(countActions(withActions, '2026-10-26')).toEqual({ open: 2, overdue: 1 });
  });

  it('narrows the events to those with open or overdue actions', () => {
    expect(applyQuickFilter(withActions, 'openActions', 'u', '2026-10-26').map((event) => event.id)).toEqual(['e1', 'e2']);
    expect(applyQuickFilter(withActions, 'overdueActions', 'u', '2026-10-26').map((event) => event.id)).toEqual(['e1']);
  });
});
