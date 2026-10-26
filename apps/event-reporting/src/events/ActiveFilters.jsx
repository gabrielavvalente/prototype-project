import { useApp } from '../AppContext.js';
import { EMPTY_FILTERS } from '../logic/eventList.js';
import { findById } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';

const LOCATION_ORDER = ['taskId', 'workstationId', 'jobId', 'workshopId', 'departmentId'];

function formatDate(text) {
  return new Date(`${text}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// One { key, label } per filter in use; key is the field cleared by the badge's remove button.
function describeFilters(filters, { users, organization }) {
  const badges = [];
  if (filters.familyCode) badges.push({ key: 'familyCode', label: `Type: ${filters.familyCode}` });
  if (filters.levelCode) badges.push({ key: 'levelCode', label: `Level: ${filters.levelCode}` });
  if (filters.from) badges.push({ key: 'from', label: `From ${formatDate(filters.from)}` });
  if (filters.to) badges.push({ key: 'to', label: `To ${formatDate(filters.to)}` });
  // The deepest location chosen says the most.
  const locationField = LOCATION_ORDER.find((field) => filters.location[field]);
  if (locationField) {
    badges.push({ key: 'location', label: `Location: ${findById(organization, filters.location[locationField])?.name ?? '—'}` });
  }
  if (filters.reporterId) {
    badges.push({ key: 'reporterId', label: `Reporter: ${findById(users, filters.reporterId)?.name ?? '—'}` });
  }
  if (filters.sip) badges.push({ key: 'sip', label: `SIP: ${filters.sip === 'yes' ? 'Yes' : 'No'}` });
  if (filters.status) badges.push({ key: 'status', label: `Status: ${filters.status}` });
  if (filters.myEvents) badges.push({ key: 'myEvents', label: 'My events' });
  return badges;
}

export function FilterBadge({ label, onRemove }) {
  return (
    <span className="filter-badge">
      {label}
      <button type="button" className="filter-badge-remove" onClick={onRemove}>
        <Icon name="close" size={14} label={`Remove ${label}`} />
      </button>
    </span>
  );
}

// The filters in use, shown as badges under the toolbar (review 2026-10-25). A saved filter shows
// as one badge with its name; removing it clears everything it set.
export default function ActiveFilters({ filters, savedFilter, onChange, onClearAll }) {
  const lists = useApp();
  const badges = describeFilters(filters, lists);
  if (!savedFilter && badges.length === 0) {
    return null;
  }

  return (
    <div className="active-filters" aria-label="Active filters" role="group">
      {savedFilter ? (
        <FilterBadge label={`Saved filter: ${savedFilter.name}`} onRemove={onClearAll} />
      ) : (
        badges.map((badge) => (
          <FilterBadge
            key={badge.key}
            label={badge.label}
            onRemove={() =>
              onChange({
                ...filters,
                [badge.key]: EMPTY_FILTERS[badge.key],
                // The level belongs to the type, so it goes with it.
                ...(badge.key === 'familyCode' ? { levelCode: '' } : {}),
              })
            }
          />
        ))
      )}
      {badges.length > 1 && !savedFilter && (
        <button type="button" className="link-button" onClick={onClearAll}>
          Clear all
        </button>
      )}
    </div>
  );
}
