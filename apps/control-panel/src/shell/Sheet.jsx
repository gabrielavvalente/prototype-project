import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

// A panel over the page: from the bottom on phones, from the right on wide screens.
// Escape, the close button or a tap outside closes it; focus goes back where it was.
export default function Sheet({ title, titleExtra, headerAction, onClose, footer, children }) {
  const headingRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    headingRef.current.focus();
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-header">
          <button type="button" className="icon-button" onClick={onClose}>
            <Icon name="close" label="Close" />
          </button>
          <h2 id="sheet-title" tabIndex={-1} ref={headingRef}>
            {title} {titleExtra}
          </h2>
          {headerAction}
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </section>
    </div>
  );
}
