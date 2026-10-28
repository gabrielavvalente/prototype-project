import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Stack } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { saveWorkflowStep } from '../data/db.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { localToday } from '../logic/actions.js';
import { alertContent, canPublish, publishWarning, setWarningPhotos, warningToShow } from '../logic/safetyCommunication.js';
import { canShare, sharedLines } from '../logic/sharingHub.js';
import CommunicationDocument from './CommunicationDocument.jsx';
import ShareToHub from './ShareToHub.jsx';

// A readable Safety Alert or Safety Warning with Print and, for the plan owners of a draft, the
// photos and Publish (SC-5 to SC-9). Used by the standalone page and inside the event page (SC-10).
// onSaved(event) receives the event after a change; showEventLink adds the way back to the event.
export default function CommunicationView({ event, kind, attachments, onSaved, showEventLink = false }) {
  const { user, users, organization, reference } = useApp();
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const lookups = { organization, reference };
  const isDraft = kind === 'warning' && !event.safetyWarning?.publishedAt;
  const owner = isDraft && canPublish(user, event, investigationGroups, users);
  const content = kind === 'alert' ? alertContent(event, lookups) : warningToShow(event, lookups, localToday());
  const photos = attachments.filter((attachment) => attachment.mimeType?.startsWith('image/'));
  const chosen = event.safetyWarning?.photoIds || [];
  const canOpenEvent = showEventLink && getPillarIdsForPlant(user, event.plantId).includes(event.pillarId);

  // Shows the change at once (a ticked photo), then saves it.
  async function save(updated) {
    onSaved(updated);
    setSaving(true);
    try {
      onSaved(await saveWorkflowStep(updated));
    } finally {
      setSaving(false);
    }
  }

  function togglePhoto(id, on) {
    save(setWarningPhotos(event, on ? [...chosen, id] : chosen.filter((item) => item !== id)));
  }

  function publish() {
    if (!window.confirm(`Publish this Safety Warning? Everyone at ${content.plant} will be able to read it, and it will no longer change.`)) return;
    save(publishWarning(event, content, user.id, new Date().toISOString()));
  }

  return (
    <div className="communication-view">
      <div className="communication-toolbar no-print">
        {canOpenEvent ? <Link to={`/events/${event.recordNumber}`}>← Event {event.recordNumber}</Link> : <span />}
        <div className="communication-toolbar-buttons">
          {owner && (
            <Button type="button" disabled={saving} onClick={publish}>
              Publish Safety Warning
            </Button>
          )}
          {kind === 'warning' && !isDraft && canShare(user, event, investigationGroups, users) && (
            <Button type="button" variant="light" onClick={() => setSharing(true)}>
              Share to Hub
            </Button>
          )}
          <Button type="button" variant="default" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
      {isDraft && <p className="message message--warning no-print">Draft — only the plan owners see it until it is published.</p>}
      {kind === 'warning' && !isDraft && (
        <div className="communication-shared">
          <p className="communication-published">Published on {content.publishedOn}</p>
          {sharedLines(event, organization).map((line) => (
            <p key={line} className="communication-published">
              {line}
            </p>
          ))}
        </div>
      )}
      {sharing && (
        <ShareToHub
          event={event}
          onClose={() => setSharing(false)}
          onShared={(saved) => {
            setSharing(false);
            onSaved(saved);
          }}
        />
      )}
      <CommunicationDocument kind={kind} content={content} attachments={attachments} />
      {owner && (
        <section className="communication-draft no-print" aria-labelledby="photos-title">
          <h2 id="photos-title">Photos to include</h2>
          <p className="field-hint">Choose photos that show no one's face or name.</p>
          {photos.length === 0 ? (
            <p className="field-hint">The event has no photo.</p>
          ) : (
            <Stack gap="xs">
              {photos.map((photo) => (
                <Checkbox
                  key={photo.id}
                  label={photo.fileName}
                  checked={chosen.includes(photo.id)}
                  disabled={saving}
                  onChange={(e) => togglePhoto(photo.id, e.currentTarget.checked)}
                />
              ))}
            </Stack>
          )}
        </section>
      )}
    </div>
  );
}
