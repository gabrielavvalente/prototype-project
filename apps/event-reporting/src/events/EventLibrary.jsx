import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext.js';
import { getAll } from '../data/db.js';
import { isEventVisible } from '../logic/access.js';
import {
  applyFilters,
  applyQuickFilter,
  computeKpis,
  countActiveFilters,
  EMPTY_FILTERS,
  paginate,
  searchEvents,
  sortEvents,
} from '../logic/eventList.js';
import Icon from '../shell/Icon.jsx';
import EventCard from './EventCard.jsx';
import EventTable, { ALL_COLUMN_KEYS } from './EventTable.jsx';
import FilterSheet from './FilterSheet.jsx';
import KpiTiles from './KpiTiles.jsx';
import QuickView from './QuickView.jsx';

const CARD_PAGE_SIZE = 20;

// Cards on phones, a table on wider screens, until the user picks one (FR-041).
function defaultView() {
  return window.matchMedia('(min-width: 768px)').matches ? 'table' : 'cards';
}

function Pagination({ page, pageCount, onPage }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pages">
      <button type="button" className="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span>
        Page {page} of {pageCount}
      </span>
      <button type="button" className="button" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </nav>
  );
}

// The Events page: KPI chips, search and filters, and the events in scope as cards or a table (User Story 3).
export default function EventLibrary() {
  const { user, users, context, settings, updateSettings } = useApp();
  const [events, setEvents] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [quickFilter, setQuickFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'date', direction: 'desc' });
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewEvent, setQuickViewEvent] = useState(null);
  const view = settings.listView || defaultView();

  useEffect(() => {
    document.title = 'Events — Event Reporting';
  }, []);

  useEffect(() => {
    getAll('events').then((all) => setEvents(all.filter((event) => isEventVisible(user, context, event))));
  }, [user, context]);

  const reporterNames = useMemo(() => Object.fromEntries(users.map((person) => [person.id, person.name])), [users]);

  // Search and sheet filters first; the chip counts come from that, then the chosen chip narrows it.
  const filtered = useMemo(
    () => (events ? applyFilters(searchEvents(events, search), filters, user.id) : []),
    [events, search, filters, user.id],
  );
  const kpis = computeKpis(filtered, user.id);
  const shown = useMemo(() => applyQuickFilter(filtered, quickFilter, user.id), [filtered, quickFilter, user.id]);
  const sorted = useMemo(() => sortEvents(shown, sort.key, sort.direction, reporterNames), [shown, sort, reporterNames]);
  const paging = paginate(sorted, view === 'table' ? pageSize : CARD_PAGE_SIZE, page);
  const activeFilters = countActiveFilters(filters);
  const visibleColumns = settings.visibleColumns || ALL_COLUMN_KEYS;

  const closeQuickView = useCallback(() => setQuickViewEvent(null), []);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  // Any change to what is shown starts again from page 1.
  function changeSearch(text) {
    setSearch(text);
    setPage(1);
  }

  function changeFilters(next) {
    setFilters(next);
    setPage(1);
  }

  function changeQuickFilter(key) {
    setQuickFilter(key);
    setPage(1);
  }

  function clearAll() {
    changeSearch('');
    changeFilters(EMPTY_FILTERS);
    changeQuickFilter('all');
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
    <main className="page page--wide page--with-nav">
      <h1>Events</h1>
      <KpiTiles kpis={kpis} selected={quickFilter} onSelect={changeQuickFilter} />

      <div className="list-toolbar">
        <label className="search-field search-field--small">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Search in this list</span>
          <input
            type="search"
            placeholder="Title or record number"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
          />
        </label>
        <button type="button" className="button" onClick={() => setFiltersOpen(true)}>
          <Icon name="filter" size={18} /> Filters
          {activeFilters > 0 && <span className="count-badge count-badge--neutral">{activeFilters}</span>}
        </button>
        <div className="view-toggle" role="group" aria-label="View">
          <button
            type="button"
            className="icon-button"
            aria-pressed={view === 'cards'}
            onClick={() => updateSettings({ listView: 'cards' })}
          >
            <Icon name="grid" label="Cards" />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-pressed={view === 'table'}
            onClick={() => updateSettings({ listView: 'table' })}
          >
            <Icon name="list" label="Table" />
          </button>
        </div>
      </div>

      <p className="field-hint" role="status">
        {shown.length} {shown.length === 1 ? 'event' : 'events'}
      </p>

      {events.length === 0 && <p className="message message--warning">No events yet.</p>}
      {events.length > 0 && shown.length === 0 && (
        <div className="message message--warning">
          <p>No event matches your search.</p>
          <button type="button" className="button" onClick={clearAll}>
            Clear search and filters
          </button>
        </div>
      )}

      {shown.length > 0 && view === 'cards' && (
        <>
          <ul className="event-cards">
            {paging.rows.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
          <Pagination page={paging.page} pageCount={paging.pageCount} onPage={setPage} />
        </>
      )}

      {shown.length > 0 && view === 'table' && (
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
      )}

      {filtersOpen && <FilterSheet filters={filters} onApply={changeFilters} onClose={closeFilters} />}
      {quickViewEvent && <QuickView event={quickViewEvent} onClose={closeQuickView} />}
    </main>
  );
}
