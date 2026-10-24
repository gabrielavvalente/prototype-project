import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext.js';
import { getAll } from '../data/db.js';
import { isEventVisible } from '../logic/access.js';
import { applyFilters, computeKpis, EMPTY_FILTERS, paginate, searchEvents, sortEvents } from '../logic/eventList.js';
import EventTable, { ALL_COLUMN_KEYS } from './EventTable.jsx';
import FilterBar from './FilterBar.jsx';
import KpiTiles from './KpiTiles.jsx';
import QuickView from './QuickView.jsx';

// The Events page: KPI tiles, search and filters, and the list of events in scope (User Story 3).
export default function EventLibrary() {
  const { user, users, context, settings, updateSettings } = useApp();
  const [events, setEvents] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState({ key: 'date', direction: 'desc' });
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [quickViewEvent, setQuickViewEvent] = useState(null);

  useEffect(() => {
    document.title = 'Events — Event Reporting';
  }, []);

  useEffect(() => {
    getAll('events').then((all) => setEvents(all.filter((event) => isEventVisible(user, context, event))));
  }, [user, context]);

  const reporterNames = useMemo(() => Object.fromEntries(users.map((person) => [person.id, person.name])), [users]);

  const filtered = useMemo(
    () => (events ? applyFilters(searchEvents(events, search), filters, user.id) : []),
    [events, search, filters, user.id],
  );
  const sorted = useMemo(() => sortEvents(filtered, sort.key, sort.direction, reporterNames), [filtered, sort, reporterNames]);
  const paging = paginate(sorted, pageSize, page);
  const kpis = computeKpis(filtered);
  const visibleColumns = settings.visibleColumns || ALL_COLUMN_KEYS;

  const closeQuickView = useCallback(() => setQuickViewEvent(null), []);

  // Any change to what is shown starts again from page 1.
  function changeSearch(text) {
    setSearch(text);
    setPage(1);
  }

  function changeFilters(next) {
    setFilters(next);
    setPage(1);
  }

  function clearAll() {
    changeSearch('');
    changeFilters(EMPTY_FILTERS);
  }

  function selectKpi(key) {
    if (key === 'total') changeFilters({ ...filters, status: '', hpr: '' });
    if (key === 'open') changeFilters({ ...filters, status: 'Open' });
    if (key === 'hpr') changeFilters({ ...filters, hpr: 'yes' });
  }

  function changeSort(key) {
    setSort((previous) =>
      previous.key === key ? { key, direction: previous.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  }

  if (!events) {
    return <p className="page">Loading…</p>;
  }

  return (
    <main className="page page--wide">
      <h1>Events</h1>
      <KpiTiles kpis={kpis} filters={filters} onSelect={selectKpi} />
      <FilterBar search={search} onSearch={changeSearch} filters={filters} onChange={changeFilters} onClear={clearAll} />

      {events.length === 0 && <p className="message message--warning">No events yet.</p>}
      {events.length > 0 && filtered.length === 0 && (
        <div className="message message--warning">
          <p>No event matches your search.</p>
          <button type="button" className="button" onClick={clearAll}>
            Clear search and filters
          </button>
        </div>
      )}
      {filtered.length > 0 && (
        <>
          <p className="field-hint" role="status">
            {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
          </p>
          <EventTable
            rows={paging.rows}
            sort={sort}
            onSort={changeSort}
            visibleColumns={visibleColumns}
            onChangeColumns={(columns) => updateSettings({ visibleColumns: columns })}
            paging={{
              page: paging.page,
              pageCount: paging.pageCount,
              pageSize,
              onPage: setPage,
              onPageSize: (size) => {
                setPageSize(size);
                setPage(1);
              },
            }}
            onQuickView={setQuickViewEvent}
          />
        </>
      )}

      {quickViewEvent && <QuickView event={quickViewEvent} onClose={closeQuickView} />}
    </main>
  );
}
