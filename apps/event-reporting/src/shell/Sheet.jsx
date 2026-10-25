import { useEffect, useRef } from 'react';
import { ActionIcon, Group, Paper, Title } from '@mantine/core';
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
      <Paper
        component="section"
        withBorder
        shadow="xl"
        radius="lg"
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <Group className="sheet-header" wrap="nowrap">
          <ActionIcon type="button" variant="subtle" color="gray" size="lg" aria-label="Close" onClick={onClose}>
            <Icon name="close" label="Close" />
          </ActionIcon>
          <Title id="sheet-title" order={2} size="h3" tabIndex={-1} ref={headingRef}>
            {title} {titleExtra}
          </Title>
          {headerAction}
        </Group>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </Paper>
    </div>
  );
}
