// Search, filters, sorting, pages and KPI counts for the event library (FR-026 to FR-031).

import { criticalLabels } from './severity.js';

// Rows per page in the List view, fixed for now (Clarification 2026-10-24, header/list/form review).
export const PAGE_SIZE = 20;

export const EMPTY_FILTERS = {
  familyCode: '',
  levelCode: '',
  from: '',
  to: '',
  location: {},
  reporterId: '',
  sip: '', // '' | 'yes' | 'no'
  status: '', // '' | a status; Archived events show only when asked for
  myEvents: false,
};

// The submission's answer until the event is reviewed; then the review's classification.
export function isSip(event) {
  return criticalLabels(event).includes('SIP');
}

// Title contains the text, or the record number is exactly the text (ignoring case).
export function searchEvents(events, text) {
  const query = text.trim().toLowerCase();
  if (!query) {
    return events;
  }
  return events.filter(
    (event) =>
      event.title.toLowerCase().includes(query) ||
      (event.recordNumber && event.recordNumber.toLowerCase() === query),
  );
}

function matchesLocation(event, location) {
  return Object.entries(location).every(([level, id]) => !id || event.location[level] === id);
}

export function applyFilters(events, filters, currentUserId) {
  return events.filter((event) => {
    if (filters.familyCode && event.familyCode !== filters.familyCode) return false;
    if (filters.levelCode && event.levelCode !== filters.levelCode) return false;
    if (filters.from && event.reportDate < filters.from) return false;
    if (filters.to && event.reportDate > filters.to) return false;
    if (!matchesLocation(event, filters.location)) return false;
    if (filters.reporterId && event.reporterId !== filters.reporterId) return false;
    if (filters.sip === 'yes' && !isSip(event)) return false;
    if (filters.sip === 'no' && isSip(event)) return false;
    if (filters.status && event.status !== filters.status) return false;
    // Archived events leave the active workflow but stay findable (core FR-7).
    if (!filters.status && event.status === 'Archived') return false;
    if (filters.myEvents && event.reporterId !== currentUserId && event.createdBy !== currentUserId) return false;
    return true;
  });
}

// reporterNames: { userId: name }, so "reporter" sorts by name rather than by id.
function sortValue(event, key, reporterNames) {
  switch (key) {
    case 'date':
      return `${event.reportDate} ${event.eventTime}`;
    case 'type':
      return event.familyCode;
    case 'level':
      return event.levelCode;
    case 'status':
      return event.status;
    case 'reporter':
      return reporterNames[event.reporterId] || '';
    default:
      return '';
  }
}

export function sortEvents(events, key, direction, reporterNames) {
  const factor = direction === 'desc' ? -1 : 1;
  // Copy first so the original list is never reordered.
  return [...events].sort(
    (a, b) => factor * sortValue(a, key, reporterNames).localeCompare(sortValue(b, key, reporterNames)),
  );
}

export function paginate(events, pageSize, page) {
  const pageCount = Math.max(1, Math.ceil(events.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return { rows: events.slice(start, start + pageSize), page: safePage, pageCount };
}

function isMine(event, userId) {
  return event.reporterId === userId || event.createdBy === userId;
}

// The KPI chip row (FR-031). "All" and "My events" include the user's own drafts, so the Kanban
// Draft column is filled; "Open" and "With SIP" show submitted events only.
const QUICK_FILTERS = {
  all: () => true,
  mine: (event, userId) => isMine(event, userId),
  open: (event) => event.status === 'Open' || event.status === 'In Progress',
  sip: (event) => event.status !== 'Draft' && isSip(event),
  drafts: (event) => event.status === 'Draft',
};

export const QUICK_FILTER_KEYS = Object.keys(QUICK_FILTERS);

export function applyQuickFilter(events, key, userId) {
  return events.filter((event) => QUICK_FILTERS[key](event, userId));
}

export function computeKpis(events, userId) {
  return Object.fromEntries(QUICK_FILTER_KEYS.map((key) => [key, applyQuickFilter(events, key, userId).length]));
}

// How many filters of the filter sheet are in use (shown on the Filters button, FR-042).
export function countActiveFilters(filters) {
  const simple = ['familyCode', 'levelCode', 'from', 'to', 'reporterId', 'sip', 'status'].filter((key) => filters[key]);
  const location = Object.values(filters.location).some(Boolean) ? 1 : 0;
  return simple.length + location + (filters.myEvents ? 1 : 0);
}

// Submitted events per type (family) and level, for the KPIs chart (review 2026-10-25). Every
// family and level in the reference data is listed, even with no event, in reference order.
// Returns [{ family, total, levels: [{ level, count }] }].
export function countByFamilyAndLevel(events, families, levels) {
  const submitted = events.filter((event) => event.status !== 'Draft');
  return families.map((family) => {
    const familyLevels = levels
      .filter((level) => level.familyId === family.id)
      .map((level) => ({
        level,
        count: submitted.filter((event) => event.familyCode === family.code && event.levelCode === level.code).length,
      }));
    return { family, total: familyLevels.reduce((sum, item) => sum + item.count, 0), levels: familyLevels };
  });
}

// Archived events per invalidation reason, split by type (family), for the KPIs page (003, third
// review). reasons: the invalidation reasons in order. Returns [{ reason, total, families: [{ family, count }] }].
export function countArchivedByReason(events, reasons, families) {
  const archived = events.filter((event) => event.status === 'Archived');
  return reasons.map((reason) => {
    const byFamily = families.map((family) => ({
      family,
      count: archived.filter((event) => event.review?.invalidReason === reason && event.familyCode === family.code).length,
    }));
    return { reason, total: byFamily.reduce((sum, item) => sum + item.count, 0), families: byFamily };
  });
}
