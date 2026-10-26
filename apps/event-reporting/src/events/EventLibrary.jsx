import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Group, Modal, Text, TextInput, Title } from '@mantine/core';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getAll } from '../data/db.js';
import { getMenuItems, isEventVisible } from '../logic/access.js';
import {
  applyFilters,
  applyQuickFilter,
  computeKpis,
  countActiveFilters,
  EMPTY_FILTERS,
  PAGE_SIZE,
  paginate,
  searchEvents,
  sortEvents,
} from '../logic/eventList.js';
import Icon from '../shell/Icon.jsx';
import EventTable, { ALL_COLUMN_KEYS, ColumnsMenu } from './EventTable.jsx';
import ActiveFilters, { FilterBadge } from './ActiveFilters.jsx';
import FilterSheet from './FilterSheet.jsx';
import FiltersMenu from './FiltersMenu.jsx';
import KanbanBoard from './KanbanBoard.jsx';
import KpiOverview from './KpiOverview.jsx';
import KpiTiles from './KpiTiles.jsx';

// Quick filters opened from the KPIs page (005 EL-12).
const ACTION_FILTER_LABELS = { openActions: 'Events with open actions', overdueActions: 'Events with overdue actions' };

const TABS = [
  { key: 'events', label: 'Events' },
  { key: 'kpis', label: 'KPIs' },
  { key: 'reports', label: 'Reports' },
];

const VIEWS = [
  { key: 'kanban', label: 'Kanban', icon: 'kanban' },
  { key: 'list', label: 'List', icon: 'list' },
];

// Kanban on phones, List on wider screens, until the user picks one (FR-041).
function defaultView() {
  return window.matchMedia('(min-width: 768px)').matches ? 'list' : 'kanban';
}

// The Events page: KPI chips, one toolbar line, and the events in scope as a Kanban board or a List (User Story 3).
export default function EventLibrary() {
  const { user, users, context, settings, updateSettings } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [quickFilter, setQuickFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [selectedSavedFilterId, setSelectedSavedFilterId] = useState('');
  // The one row or card shown expanded (FR-027).
  const [expandedId, setExpandedId] = useState(null);
  const view = ['kanban', 'list'].includes(settings.listView) ? settings.listView : defaultView();
  const mode = ['kpis', 'reports'].includes(searchParams.get('tab')) ? searchParams.get('tab') : 'events';
  const savedFilters = settings.savedFilters || [];

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
  // The KPIs page also counts the Archived events matching the search and the other filters.
  const archivedInScope = useMemo(
    () => (events ? applyFilters(searchEvents(events, search), { ...filters, status: 'Archived' }, user.id) : []),
    [events, search, filters, user.id],
  );
  const shown = useMemo(() => applyQuickFilter(filtered, quickFilter, user.id), [filtered, quickFilter, user.id]);
  const sorted = useMemo(() => sortEvents(shown, sort.key, sort.direction, reporterNames), [shown, sort, reporterNames]);
  const paging = paginate(sorted, PAGE_SIZE, page);
  const activeFilters = countActiveFilters(filters);
  const visibleColumns = settings.visibleColumns || ALL_COLUMN_KEYS;

  const toggleExpanded = useCallback((id) => setExpandedId((current) => (current === id ? null : id)), []);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  // Any change to what is shown starts again from page 1.
  function changeSearch(text) {
    setSearch(text);
    setPage(1);
    setSelectedSavedFilterId('');
  }

  function changeFilters(next) {
    setFilters(next);
    setPage(1);
    setSelectedSavedFilterId('');
  }

  function changeQuickFilter(key) {
    setQuickFilter(key);
    setPage(1);
    setSelectedSavedFilterId('');
  }

  function clearAll() {
    changeSearch('');
    changeFilters(EMPTY_FILTERS);
    changeQuickFilter('all');
  }

  function applySavedFilter(savedFilter) {
    const criteria = savedFilter.filters || EMPTY_FILTERS;
    setSearch(savedFilter.search || '');
    setFilters({ ...EMPTY_FILTERS, ...criteria, location: { ...criteria.location } });
    setQuickFilter(savedFilter.quickFilter || 'all');
    setPage(1);
    setSelectedSavedFilterId(savedFilter.id);
  }

  async function saveCurrentFilter() {
    const name = filterName.trim();
    if (!name) return;

    const savedFilter = {
      id: crypto.randomUUID(),
      name,
      search,
      filters: { ...filters, location: { ...filters.location } },
      quickFilter,
    };
    await updateSettings({ savedFilters: [...savedFilters, savedFilter] });
    setSelectedSavedFilterId(savedFilter.id);
    setFilterName('');
    setSaveModalOpen(false);
  }

  async function deleteSavedFilter() {
    if (!selectedSavedFilterId) return;
    await updateSettings({ savedFilters: savedFilters.filter((item) => item.id !== selectedSavedFilterId) });
    setSelectedSavedFilterId('');
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
      <div className="library-heading">
        <div>
          <Text className="entry-eyebrow" size="sm" fw={600}>EVENT WORKSPACE</Text>
          <Title order={1}>{mode === 'kpis' ? 'KPIs' : mode === 'reports' ? 'Reports' : 'Events'}</Title>
        </div>
        {getMenuItems(user.role).includes('create-event') && (
          <Button component={Link} to="/events/new" leftSection={<Icon name="plus" size={18} />}>
            Create Event
          </Button>
        )}
      </div>

      <nav className="event-page-tabs" aria-label="Event workspace pages">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            to={tab.key === 'events' ? '/events' : `/events?tab=${tab.key}`}
            className={`event-page-tab${mode === tab.key ? ' event-page-tab--active' : ''}`}
            aria-current={mode === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {mode === 'events' && <KpiTiles kpis={kpis} selected={quickFilter} onSelect={changeQuickFilter} />}
      {/* Opened from the KPIs page: not a chip, so it shows as a badge (005 EL-12). */}
      {mode === 'events' && ACTION_FILTER_LABELS[quickFilter] && (
        <div className="active-filters">
          <FilterBadge label={ACTION_FILTER_LABELS[quickFilter]} onRemove={() => changeQuickFilter('all')} />
        </div>
      )}

      {mode === 'reports' && (
        <section className="reports-intro">
          <Title order={2}>Event register</Title>
          <Text c="dimmed">
            A record-by-record view of events visible to you. Use search and filters to define the
            records shown; this page uses event data already captured in the system.
          </Text>
        </section>
      )}

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
        <FiltersMenu
          activeCount={activeFilters}
          savedFilters={savedFilters}
          selectedId={selectedSavedFilterId}
          canSave={activeFilters > 0 || Boolean(search) || quickFilter !== 'all'}
          onOpenFilters={() => setFiltersOpen(true)}
          onApplySaved={applySavedFilter}
          onSave={() => setSaveModalOpen(true)}
          onDelete={deleteSavedFilter}
        />
        {mode === 'events' && view === 'list' && (
          <ColumnsMenu visibleColumns={visibleColumns} onChange={(columns) => updateSettings({ visibleColumns: columns })} />
        )}
        {mode === 'events' && (
          <div className="view-toggle" role="group" aria-label="View">
            {VIEWS.map((option) => (
              <button
                key={option.key}
                type="button"
                className="view-toggle-button"
                aria-pressed={view === option.key}
                onClick={() => updateSettings({ listView: option.key })}
              >
                <Icon name={option.icon} size={18} /> {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ActiveFilters
        filters={filters}
        savedFilter={savedFilters.find((item) => item.id === selectedSavedFilterId)}
        onChange={changeFilters}
        onClearAll={clearAll}
      />

      {mode === 'kpis' ? (
        // The filters above the chart narrow it too.
        <KpiOverview
          events={filtered}
          archived={archivedInScope}
          kpis={kpis}
          onOpen={(key) => {
            // Archived events are found with the Status filter; the other numbers are quick filters.
            if (key === 'archived') {
              changeFilters({ ...filters, status: 'Archived' });
              changeQuickFilter('all');
            } else {
              changeQuickFilter(key);
            }
            navigate('/events');
          }}
        />
      ) : (
        <Text c="dimmed" size="sm" role="status" className="event-count">
          {shown.length} {shown.length === 1 ? 'event' : 'events'}
        </Text>
      )}

      {events.length === 0 && <Alert color="yellow" variant="light">No events yet.</Alert>}
      {events.length > 0 && shown.length === 0 && (
        <Alert color="yellow" variant="light" className="empty-events">
          <p>No event matches your search.</p>
          <Button type="button" variant="default" onClick={clearAll}>
            Clear search and filters
          </Button>
        </Alert>
      )}

      {shown.length > 0 && mode === 'events' && view === 'kanban' && <KanbanBoard events={sorted} expandedId={expandedId} onToggle={toggleExpanded} />}

      {shown.length > 0 && (mode === 'reports' || (mode === 'events' && view === 'list')) && (
        <EventTable
          rows={paging.rows}
          sort={sort}
          onSort={changeSort}
          visibleColumns={visibleColumns}
          paging={{
            page: paging.page,
            pageCount: paging.pageCount,
            onPage: setPage,
          }}
          expandedId={expandedId}
          onToggle={toggleExpanded}
        />
      )}

      {mode === 'kpis' && shown.length === 0 && events.length > 0 && (
        <Alert color="yellow" variant="light">No events match the current search and filters.</Alert>
      )}

      {filtersOpen && <FilterSheet filters={filters} onApply={changeFilters} onClose={closeFilters} />}
      <Modal
        opened={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save current filters"
        centered
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveCurrentFilter();
          }}
        >
          <TextInput
            data-autofocus
            label="Filter name"
            placeholder="e.g. Open safety events"
            value={filterName}
            onChange={(event) => setFilterName(event.currentTarget.value)}
            maxLength={60}
            required
          />
          <Group justify="flex-end" mt="md">
            <Button type="button" variant="default" onClick={() => setSaveModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save filter</Button>
          </Group>
        </form>
      </Modal>
    </main>
  );
}
