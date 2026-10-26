import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Checkbox, Stack } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { findEvent, getByIndex, saveWorkflowStep } from '../data/db.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { localToday } from '../logic/actions.js';
import {
  alertContent,
  canPublish,
  canReadCommunication,
  canSeeWarning,
  hasAlert,
  publishWarning,
  setWarningPhotos,
  warningToShow,
} from '../logic/safetyCommunication.js';
import CommunicationDocument from './CommunicationDocument.jsx';

const NOT_AVAILABLE = 'This safety communication is not available.';

// The Safety Alert or the Safety Warning of an event (SC-3 to SC-9): readable by the plant; the
// plan owners choose the Warning's photos and publish it.
export default function CommunicationPage() {
  const { record, kind } = useParams();
  const { user, users, organization, reference } = useApp();
  const [event, setEvent] = useState(undefined);
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);
  const lookups = { organization, reference };

  useEffect(() => {
    async function load() {
      const found = await findEvent(record);
      setEvent(found || null);
      if (found) setAttachments(await getByIndex('attachments', 'eventId', found.id));
    }
    load();
  }, [record]);

  useEffect(() => {
    document.title = `${kind === 'warning' ? 'Safety Warning' : 'Safety Alert'} — ${record} — Event Reporting`;
  }, [kind, record]);

  if (event === undefined) return <p className="page">Loading…</p>;

  const readable =
    event &&
    ['alert', 'warning'].includes(kind) &&
    hasAlert(event) &&
    canReadCommunication(user, event) &&
    (kind === 'alert' || canSeeWarning(user, event, investigationGroups, users));
  if (!readable) {
    return (
      <main className="page">
        <p className="message message--warning">{NOT_AVAILABLE}</p>
      </main>
    );
  }

  const isDraft = kind === 'warning' && !event.safetyWarning?.publishedAt;
  const owner = isDraft && canPublish(user, event, investigationGroups, users);
  const content = kind === 'alert' ? alertContent(event, lookups) : warningToShow(event, lookups, localToday());
  const photos = attachments.filter((attachment) => attachment.mimeType?.startsWith('image/'));
  const chosen = event.safetyWarning?.photoIds || [];
  const canOpenEvent = getPillarIdsForPlant(user, event.plantId).includes(event.pillarId);

  async function save(updated) {
    setSaving(true);
    try {
      setEvent(await saveWorkflowStep(updated));
    } finally {
      setSaving(false);
    }
  }

  function togglePhoto(id, on) {
    save(setWarningPhotos(event, on ? [...chosen, id] : chosen.filter((item) => item !== id)));
  }

  function publish() {
    const plant = content.plant;
    if (!window.confirm(`Publish this Safety Warning? Everyone at ${plant} will be able to read it, and it will no longer change.`)) return;
    const now = new Date().toISOString();
    save(publishWarning(event, content, user.id, now));
  }

  return (
    <main className="page communication-page">
      <div className="communication-toolbar no-print">
        {canOpenEvent && <Link to={`/events/${event.recordNumber}`}>← Event {event.recordNumber}</Link>}
        <Button type="button" variant="default" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      {isDraft && <p className="message message--warning no-print">Draft — only the plan owners see it until it is published.</p>}
      {kind === 'warning' && !isDraft && <p className="communication-published">Published on {content.publishedOn}</p>}
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
          <Button type="button" disabled={saving} onClick={publish}>
            Publish Safety Warning
          </Button>
        </section>
      )}
    </main>
  );
}
