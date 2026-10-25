import { Modal } from '@mantine/core';

// Mantine's accessible modal presents app dialogs as a right-side workspace panel.
export default function Sheet({ title, titleExtra, headerAction, onClose, footer, children }) {
  return (
    <Modal
      opened
      onClose={onClose}
      title={<>{title} {titleExtra}</>}
      size="lg"
      radius="lg"
      centered={false}
      closeOnClickOutside
      closeOnEscape
      overlayProps={{ backgroundOpacity: 0.48, blur: 2 }}
      classNames={{ root: 'sheet-modal', content: 'sheet', header: 'sheet-header', body: 'sheet-body' }}
      closeButtonProps={{ 'aria-label': 'Close dialog' }}
    >
      {headerAction}
      {children}
      {footer && <div className="sheet-footer">{footer}</div>}
    </Modal>
  );
}
