import { Badge } from '@mantine/core';
import { criticalLabels } from '../logic/severity.js';

// The critical classification in red (SIP, HCI, SPL, HCL): the submission's SIP answer until the
// event is reviewed, then the review's classification (003 FR-027).
export default function CriticalBadges({ event }) {
  return criticalLabels(event).map((label) => (
    <Badge key={label} color="red" title="Critical event">
      {label}
    </Badge>
  ));
}
