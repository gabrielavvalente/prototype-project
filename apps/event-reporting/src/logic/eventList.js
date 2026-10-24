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

// Drafts are not counted (spec Edge Cases).
export function computeKpis(events) {
  const submitted = events.filter((event) => event.status !== 'Draft');
  return {
    total: submitted.length,
    open: submitted.filter((event) => event.status === 'Open').length,
    withHpr: submitted.filter(isHpr).length,
  };
}
