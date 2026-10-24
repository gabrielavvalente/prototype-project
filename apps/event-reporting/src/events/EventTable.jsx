import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { canEditEvent } from '../logic/access.js';
import { isHpr, PAGE_SIZES } from '../logic/eventList.js';
import { getLabel } from '../logic/lookups.js';

// "always" columns cannot be hidden; "sortKey" columns can be sorted.
const COLUMNS = [
  { key: 'recordNumber', label: 'Record number', always: true },
  { key: 'title', label: 'Title', always: true },
  { key: 'type', label: 'Pillar / Family', sortKey: 'type' },
  { key: 'level', label: 'Level', sortKey: 'level' },
  { key: 'status', label: 'Status', sortKey: 'status' },
  { key: 'reporter', label: 'Reporter', sortKey: 'reporter' },
  { key: 'date', label: 'Report date', sortKey: 'date' },
  { key: 'department', label: 'Department' },
  { key: 'hpr', label: 'HPR' },
];

export const ALL_COLUMN_KEYS = COLUMNS.map((column) => column.key);

function cellValue(column, event, lists) {
  switch (column.key) {
    case 'recordNumber':
      return event.recordNumber || 'Draft';
    case 'title':
      return event.title || '(no title yet)';
    case 'type':
      return `${getLabel(lists.reference, event.pillarId)} / ${event.familyCode}`;
    case 'level':
      return event.levelCode;
    case 'status':
      return event.status;
    case 'reporter':
      return getLabel(lists.users, event.reporterId);
    case 'date':
      return event.reportDate;
    case 'department':
      return getLabel(lists.organization, event.location.departmentId);
    case 'hpr':
      return isHpr(event) ? 'Yes' : '—';
    default:
      return '';
  }
}

function SortableHeader({ column, sort, onSort }) {
  const active = sort.key === column.sortKey;
  const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <th scope="col" aria-sort={ariaSort}>
      <button type="button" className="button button--link" onClick={() => onSort(column.sortKey)}>
        {column.label}
        <span aria-hidden="true">{active ? (sort.direction === 'asc' ? ' ▲' : ' ▼') : ''}</span>
      </button>
    </th>
  );
}

// The paginated, sortable event grid with column choices and row actions (FR-026 to FR-028, FR-032).
export default function EventTable({ rows, sort, onSort, visibleColumns, onChangeColumns, paging, onQuickView }) {
  const lists = useApp();
  const columns = COLUMNS.filter((column) => column.always || visibleColumns.includes(column.key));

  function toggleColumn(key) {
    const next = visibleColumns.includes(key) ? visibleColumns.filter((item) => item !== key) : [...visibleColumns, key];
    onChangeColumns(next);
  }

  return (
    <section aria-label="Event list">
      <div className="table-toolbar">
        <details className="columns-menu">
          <summary className="button">Columns</summary>
          <fieldset className="card">
            <legend className="field-label">Show columns</legend>
            {COLUMNS.filter((column) => !column.always).map((column) => (
              <label key={column.key} className="field-hint">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(column.key)}
                  onChange={() => toggleColumn(column.key)}
                />{' '}
                {column.label}
              </label>
            ))}
          </fieldset>
        </details>
        <div className="field">
          <label htmlFor="page-size">Rows per page</label>
          <select id="page-size" value={paging.pageSize} onChange={(e) => paging.onPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="event-table">
          <thead>
            <tr>
              {columns.map((column) =>
                column.sortKey ? (
                  <SortableHeader key={column.key} column={column} sort={sort} onSort={onSort} />
                ) : (
                  <th key={column.key} scope="col">
                    {column.label}
                  </th>
                ),
              )}
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((event) => {
              const path = `/events/${event.recordNumber || event.id}`;
              return (
                <tr key={event.id}>
                  {columns.map((column) => (
                    <td key={column.key}>{cellValue(column, event, lists)}</td>
                  ))}
                  <td className="row-actions">
                    <button type="button" className="button button--link" onClick={() => onQuickView(event)}>
                      Quick view<span className="visually-hidden"> of {event.title}</span>
                    </button>
                    <Link to={path}>
                      View<span className="visually-hidden"> {event.title}</span>
                    </Link>
                    {canEditEvent(lists.user, event) && (
                      <Link to={`${path}/edit`}>
                        Edit<span className="visually-hidden"> {event.title}</span>
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <nav className="pagination" aria-label="Pages">
        <button type="button" className="button" disabled={paging.page <= 1} onClick={() => paging.onPage(paging.page - 1)}>
          Previous
        </button>
        <span>
          Page {paging.page} of {paging.pageCount}
        </span>
        <button
          type="button"
          className="button"
          disabled={paging.page >= paging.pageCount}
          onClick={() => paging.onPage(paging.page + 1)}
        >
          Next
        </button>
      </nav>
    </section>
  );
}
