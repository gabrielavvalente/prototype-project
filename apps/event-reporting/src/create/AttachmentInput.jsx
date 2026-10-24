import { useEffect, useState } from 'react';
import { newId } from '../data/db.js';
import { MAX_FILES, validateFile } from '../logic/validation.js';
import Icon from '../shell/Icon.jsx';
import { FieldError } from './fields.jsx';

// Shows a stored or new file; the preview address is freed when it disappears.
export function AttachmentPreview({ attachment, controls = false }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment.blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [attachment.blob]);

  if (!url) {
    return null;
  }
  if (attachment.mimeType.startsWith('video/')) {
    return <video src={url} controls={controls} aria-label={`Video: ${attachment.fileName}`} />;
  }
  return <img src={url} alt={`Photo: ${attachment.fileName}`} />;
}

// Photos and videos of the event, from files or the device camera (FR-007, FR-009).
// extraAction: another button shown on the same line (the Dictate button of the description).
export default function AttachmentInput({ attachments, onChange, errors, extraAction }) {
  const [rejections, setRejections] = useState([]);

  function addFiles(fileList) {
    const added = [];
    const problems = [];
    for (const file of fileList) {
      const problem = validateFile(file, attachments.length + added.length);
      if (problem) {
        problems.push(problem);
      } else {
        added.push({
          id: newId(),
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          blob: file,
          isNew: true,
        });
      }
    }
    setRejections(problems);
    if (added.length > 0) {
      onChange([...attachments, ...added]);
    }
  }

  function handleInput(e) {
    addFiles(e.target.files);
    // Clear the input so the same file can be picked again after removing it.
    e.target.value = '';
  }

  function remove(id) {
    onChange(attachments.filter((item) => item.id !== id));
  }

  const full = attachments.length >= MAX_FILES;

  return (
    <fieldset className="attachments">
      <legend className="visually-hidden">Photos and videos</legend>
      {attachments.length > 0 && (
        <ul className="attachment-list">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="attachment-item">
              <AttachmentPreview attachment={attachment} />
              <button type="button" className="attachment-remove" onClick={() => remove(attachment.id)}>
                <Icon name="close" size={14} label={`Remove ${attachment.fileName}`} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="attachment-actions">
        {extraAction}
        <label className={`attachment-button${full ? ' button--disabled' : ''}`}>
          <Icon name="camera" size={18} /> Take photo
          <input type="file" accept="image/*,video/*" capture="environment" className="visually-hidden" disabled={full} onChange={handleInput} />
        </label>
        <label className={`attachment-button${full ? ' button--disabled' : ''}`}>
          <Icon name="image" size={18} /> Attach photo or video
          <input type="file" accept="image/*,video/*" multiple className="visually-hidden" disabled={full} onChange={handleInput} />
        </label>
        <span className="field-hint attachment-count">
          Optional · {attachments.length}/{MAX_FILES} files · 5 MB max
        </span>
      </div>
      {rejections.map((problem) => (
        <p key={problem} className="field-error" role="alert">
          {problem}
        </p>
      ))}
      <FieldError errors={errors} field="attachments" />
    </fieldset>
  );
}
