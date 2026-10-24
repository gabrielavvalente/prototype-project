// Search, filters, sorting, pages and KPI counts for the event library (FR-026 to FR-031).

export const PAGE_SIZES = [20, 50, 100];

export const EMPTY_FILTERS = {
  familyCode: '',
  levelCode: '',
  from: '',
  to: '',
  location: {},
  reporterId: '',
  hpr: '', // '' | 'yes' | 'no'
  status: '', // '' | 'Draft' | 'Open'
  myEvents: false,
};

export function isHpr(event) {
  return Boolean(event.riskQuestion && event.riskQuestion.type === 'HPR' && event.riskQuestion.answer === true);
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
    if (filters.hpr === 'yes' && !isHpr(event)) return false;
    if (filters.hpr === 'no' && isHpr(event)) return false;
    if (filters.status && event.status !== filters.status) return false;
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
// Draft column is filled; "Open" and "With HPR" show submitted events only.
const QUICK_FILTERS = {
  all: () => true,
  mine: (event, userId) => isMine(event, userId),
  open: (event) => event.status === 'Open',
  hpr: (event) => event.status !== 'Draft' && isHpr(event),
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
  const simple = ['familyCode', 'levelCode', 'from', 'to', 'reporterId', 'hpr', 'status'].filter((key) => filters[key]);
  const location = Object.values(filters.location).some(Boolean) ? 1 : 0;
  return simple.length + location + (filters.myEvents ? 1 : 0);
}
