import { useEffect, useState } from 'react';

// Object URLs of the chosen photos, released when the document goes away.
function usePhotoUrls(attachments, photoIds) {
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    const chosen = attachments.filter((attachment) => photoIds.includes(attachment.id) && attachment.blob);
    const made = chosen.map((attachment) => ({ id: attachment.id, name: attachment.fileName, url: URL.createObjectURL(attachment.blob) }));
    setUrls(made);
    return () => made.forEach((item) => URL.revokeObjectURL(item.url));
  }, [attachments, photoIds.join(',')]);
  return urls;
}

function Part({ title, children }) {
  return (
    <section className="communication-part">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

// A rating as a badge in its band's color (as in the review's matrix), then impact × duration.
function SeverityValue({ row }) {
  if (!row.band) return row.value;
  return (
    <>
      <span className={`severity-band severity-band--${row.band}`}>{row.badge}</span> <span className="communication-detail">{row.detail}</span>
    </>
  );
}

// A Safety Alert or Safety Warning as content (logic/safetyCommunication.js): no names (SC-2). The
// Warning puts its photos next to the header, has no Next steps and ends with the key learnings
// (SC-4, SC-5). A shared package adds its Classification part (009 SH-4).
export default function CommunicationDocument({ kind, content, attachments = [], classification = null }) {
  const photos = usePhotoUrls(attachments, kind === 'warning' ? content.photoIds || [] : []);
  return (
    <article className={`communication-document communication-document--${kind}`} aria-labelledby="communication-title">
      <div className={`communication-head${photos.length > 0 ? ' communication-head--with-photos' : ''}`}>
        <header className="communication-header">
          <p className="communication-kind" id="communication-title">
            {kind === 'alert' ? 'Safety Alert' : 'Safety Warning'}
          </p>
          <p className="communication-record">{content.record}</p>
          <dl className="communication-facts">
            <div>
              <dt>Plant</dt>
              <dd>{content.plant}</dd>
            </div>
            <div>
              <dt>Pillar</dt>
              <dd>{content.pillar}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{content.level}</dd>
            </div>
            <div>
              <dt>Event date</dt>
              <dd>{content.eventDate}</dd>
            </div>
            <div>
              <dt>Critical</dt>
              <dd>{content.critical}</dd>
            </div>
            {content.severity.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  <SeverityValue row={row} />
                </dd>
              </div>
            ))}
          </dl>
        </header>
        {photos.length > 0 && (
          <div className="communication-photos" aria-label="Photos">
            {photos.map((photo) => (
              <img key={photo.id} src={photo.url} alt={`Photo of the event (${photo.name})`} />
            ))}
          </div>
        )}
      </div>
      {classification && classification.length > 0 && (
        <Part title="Classification">
          <dl className="communication-classification">
            {classification.map((item) => (
              <div key={item.list}>
                <dt>{item.list}</dt>
                <dd>{item.values.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Part>
      )}
      <Part title="What happened">
        <p className="communication-text">{content.statement}</p>
      </Part>
      <Part title="What was done">
        {content.immediateActions.length === 0 ? (
          <p>No immediate action.</p>
        ) : (
          <ul>
            {content.immediateActions.map((action, index) => (
              <li key={index}>
                {action.description} · {action.priority}
              </li>
            ))}
          </ul>
        )}
      </Part>
      {kind === 'alert' && (
        <Part title="Next steps">
          <p>{content.nextSteps}</p>
        </Part>
      )}
      {kind === 'warning' && (
        <>
          <Part title="Contributory causes">
            <ul>
              {content.causes.map((cause, index) => (
                <li key={index}>
                  <strong>{cause.cause}</strong>
                  {cause.how && <span className="communication-how"> — {cause.how}</span>}
                </li>
              ))}
            </ul>
          </Part>
          <Part title="Root causes">
            <ul>
              {content.rootCauses.map((answer, index) => (
                <li key={index}>{answer}</li>
              ))}
            </ul>
          </Part>
          <Part title="Corrective actions">
            {content.actions.length === 0 ? (
              <p>No corrective action.</p>
            ) : (
              <ul>
                {content.actions.map((action, index) => (
                  <li key={index}>
                    {action.description} · {action.status}
                    {action.dueDate && ` · Due ${action.dueDate}`}
                  </li>
                ))}
              </ul>
            )}
            <p className="communication-summary">{content.summary}</p>
          </Part>
          <Part title="Key learnings">
            <p className="communication-text">{content.learnings}</p>
          </Part>
        </>
      )}
    </article>
  );
}
