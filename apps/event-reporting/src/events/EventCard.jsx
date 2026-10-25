import { useApp } from '../AppContext.js';
import { Badge, Card, Group, Text, Title } from '@mantine/core';
import { getPillarTagClass, getSeverityDots, isCritical } from '../logic/display.js';
import CriticalBadges from './CriticalBadges.jsx';
import { findById, getLabel } from '../logic/lookups.js';
import Icon from '../shell/Icon.jsx';
import EventExpanded from './EventExpanded.jsx';

export function SeverityDots({ levelCode }) {
  const dots = getSeverityDots(levelCode);
  if (dots === 0) return null;
  return (
    <span className={`severity-dots severity-dots--${dots}`} role="img" aria-label={`Severity ${dots} of 4`}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function PillarTag({ pillar }) {
  return (
    <span className={getPillarTagClass(pillar?.code)}>{pillar?.label}</span>
  );
}

// One Kanban card (FR-041): tags, record number, title, location, reporter, date.
// Clicking it expands it in place with the description and immediate actions (FR-027).
export default function EventCard({ event, expanded, onToggle }) {
  const { reference, organization, users } = useApp();
  const pillar = findById(reference, event.pillarId);
  const reporter = findById(users, event.reporterId);
  const critical = isCritical(event);
  const department = getLabel(organization, event.location.departmentId);
  const detailsId = `card-details-${event.id}`;

  return (
    <Card component="article" withBorder shadow="xs" radius="md" padding="md" className={`card event-card${critical ? ' card--critical' : ''}${expanded ? ' event-card--expanded' : ''}`}>
      <div className="tag-row">
        <PillarTag pillar={pillar} />
        <Badge variant="light" color="blue">{event.levelCode}</Badge>
        <CriticalBadges event={event} />
      </div>
      <Text className="event-card-number" size="sm" c="dimmed">{event.recordNumber || 'Draft — no record number yet'}</Text>
      <Title order={2} size="h4" className="event-card-title">
        <button
          type="button"
          className="event-card-toggle"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          {event.title || '(no title yet)'}
        </button>
      </Title>
      {department && (
        <div className="tag-row">
          <span className="tag tag--outline">
            <Icon name="location" size={12} /> {department}
          </span>
        </div>
      )}
      <Group className="event-card-bottom" justify="space-between" wrap="wrap">
        <span className="person">
          <span className="avatar avatar--small" aria-hidden="true">
            {reporter?.avatar}
          </span>
          {reporter?.name}
        </span>
        <Text size="sm" c="dimmed" className="field-hint">
          <Icon name="clock" size={14} /> {event.reportDate}
          <Icon name="chevronDown" size={16} />
        </Text>
      </Group>
      {expanded && (
        <div id={detailsId} className="event-card-details">
          <EventExpanded event={event} />
        </div>
      )}
    </Card>
  );
}
