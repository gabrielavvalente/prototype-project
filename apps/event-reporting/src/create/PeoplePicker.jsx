import { useEffect, useRef, useState } from 'react';
import Icon from '../shell/Icon.jsx';

// A multi-select dropdown of people (FR-010): it stays open while people are ticked, marks the
// chosen ones in the list, and closes with Done, Escape or a click outside. The chosen people are
// also shown as removable badges below it.
export default function PeoplePicker({ id, label, hint, people, value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = `${id}-panel`;

  useEffect(() => {
    if (!open) return undefined;
    function closeOnOutside(e) {
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function closeOnEscape(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current.focus();
      }
    }
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  function toggle(personId) {
    onChange(value.includes(personId) ? value.filter((item) => item !== personId) : [...value, personId]);
  }

  function close() {
    setOpen(false);
    buttonRef.current.focus();
  }

  const chosen = people.filter((person) => value.includes(person.id));

  return (
    <div className="field" ref={rootRef}>
      <span className="field-label" id={`${id}-label`}>
        {label}
      </span>
      {hint && <span className="field-hint">{hint}</span>}
      <div className="dropdown">
        <button
          type="button"
          id={id}
          ref={buttonRef}
          className="dropdown-button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-labelledby={`${id}-label ${id}`}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{chosen.length === 0 ? 'Add people…' : `${chosen.length} selected`}</span>
          <Icon name="chevronDown" size={18} />
        </button>
        {open && (
          <div className="dropdown-panel" id={panelId}>
            <ul className="dropdown-options">
              {people.map((person) => {
                const selected = value.includes(person.id);
                return (
                  <li key={person.id}>
                    <label className={`dropdown-option${selected ? ' dropdown-option--selected' : ''}`}>
                      <input type="checkbox" checked={selected} onChange={() => toggle(person.id)} />
                      <span className="avatar avatar--small" aria-hidden="true">
                        {person.avatar}
                      </span>
                      <span className="dropdown-option-name">{person.name}</span>
                      {selected && <Icon name="check" size={18} />}
                    </label>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="button button--primary button--block" onClick={close}>
              Done
            </button>
          </div>
        )}
      </div>
      {chosen.length > 0 && (
        <ul className="person-badges" aria-label={label}>
          {chosen.map((person) => (
            <li key={person.id} className="person-badge">
              <span className="avatar avatar--small" aria-hidden="true">
                {person.avatar}
              </span>
              {person.name}
              <button type="button" className="person-badge-remove" onClick={() => toggle(person.id)}>
                <Icon name="close" size={14} label={`Remove ${person.name}`} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
