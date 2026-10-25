import { Badge } from '@mantine/core';

// The lifecycle statuses in order (core lifecycle plus Draft), each with its own badge color.
export const STATUSES = ['Draft', 'Open', 'In Progress', 'Closed', 'Archived'];

export function statusClass(status) {
  return `status-badge--${status.toLowerCase().replace(' ', '-')}`;
}

// A colored badge for an event status (FR-041).
export default function StatusBadge({ status }) {
  return <Badge variant="light" className={`status-badge ${statusClass(status)}`}>{status}</Badge>;
}
