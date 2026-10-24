import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { canEditEvent } from '../logic/access.js';
import { isSip, PAGE_SIZES } from '../logic/eventList.js';
import { getLabel } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';
import { SeverityDots } from './EventCard.jsx';
import StatusBadge from './StatusBadge.jsx';

// List view columns, in the order agreed in the review (FR-041).
// "always" columns cannot be hidden; "sortKey" columns can be sorted.
const COLUMNS = [
  { key: 'recordNumber', label: 'Record number', always: true },
  { key: 'status', label: 'Status', sortKey: 'status' },
  { key: 'level', label: 'Level', sortKey: 'level' },
  { key: 'date', label: 'Report date', sortKey: 'date' },
  { key: 'title', label: 'Title', always: true },
  { key: 'department', label: 'Department' },
  { key: 'reporter', label: 'Reporter', sortKey: 'reporter' },
];

export const ALL_COLUMN_KEYS = COLUMNS.map((column) => column.key);

function Cell({ column, event, lists }) {
  switch (column.key) {
    case 'recordNumber':
      return <span className="cell-strong">{event.recordNumber || 'Draft'}</span>;
    case 'status':
      return <StatusBadge status={event.status} />;
    case 'level':
      return (
        <span className="cell-level">
          <SeverityDots levelCode={event.levelCode} /> {event.levelCode}
          {isSip(event) && <span className="tag tag--red">SIP</span>}
        </span>
      );
    case 'date':
      return event.reportDate;
    case 'title':
      return event.title || '(no title yet)';
    case 'department':
      return getLabel(lists.organization, event.location.departmentId);
    case 'reporter':
      return getLabel(lists.users, event.reporterId);
    default:
      return null;
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

// Show or hide the optional columns; the choice is remembered (FR-028).
export function ColumnsMenu({ visibleColumns, onChange }) {
  function toggle(key) {
    onChange(visibleColumns.includes(key) ? visibleColumns.filter((item) => item !== key) : [...visibleColumns, key]);
  }

  return (
    <details className="columns-menu">
      <summary className="button">
        <Icon name="columns" size={18} /> Columns
      </summary>
      <fieldset className="card columns-menu-panel">
        <legend className="section-label">Show columns</legend>
        {COLUMNS.filter((column) => !column.always).map((column) => (
          <label key={column.key} className="columns-menu-option">
            <input type="checkbox" checked={visibleColumns.includes(column.key)} onChange={() => toggle(column.key)} />
            {column.label}
          </label>
        ))}
      </fieldset>
    </details>
  );
}

// The List view: a paginated, sortable table with one eye icon per row (FR-026, FR-027, FR-041).
export default function EventTable({ rows, sort, onSort, visibleColumns, paging, onQuickView }) {
  const lists = useApp();
  const columns = COLUMNS.filter((column) => column.always || visibleColumns.includes(column.key));

  return (
    <section aria-label="Event list">
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
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((event) => (
              <tr key={event.id}>
                {columns.map((column) => (
                  <td key={column.key}>
                    <Cell column={column} event={event} lists={lists} />
                  </td>
                ))}
                <td className="row-actions">
                  <div className="row-actions-inner">
                    <button type="button" className="icon-button" onClick={() => onQuickView(event)}>
                      <Icon name="eye" label={`Preview ${event.title || 'draft'}`} />
                    </button>
                    {canEditEvent(lists.user, event) && (
                      <Link className="icon-button" to={`/events/${event.recordNumber || event.id}/edit`}>
                        <Icon name="edit" label={`Edit ${event.title || 'draft'}`} />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <label className="pagination-size">
          Rows per page
          <select value={paging.pageSize} onChange={(e) => paging.onPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <nav className="pagination-pages" aria-label="Pages">
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
      </div>
    </section>
  );
}
