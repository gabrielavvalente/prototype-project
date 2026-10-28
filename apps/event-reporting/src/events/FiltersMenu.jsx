import { useRef, useState } from 'react';
import { Button, Popover } from '@mantine/core';
import Icon from '../shell/Icon.jsx';
import FilterPanel from './FilterPanel.jsx';

// The Filters button opens a popup with the filter criteria directly, then the saved filters to
// apply, and saving or deleting one (EL-3, EL-4).
export default function FiltersMenu({ filters, onApply, activeCount, savedFilters, selectedId, canSave, onApplySaved, onSave, onDelete }) {
  const [opened, setOpened] = useState(false);
  const buttonRef = useRef(null);
  const selected = savedFilters.find((item) => item.id === selectedId);
  const close = () => setOpened(false);
  // With little room under the button (a phone), the toolbar first scrolls up under the top bar.
  function toggle() {
    const button = buttonRef.current;
    if (!opened && window.innerHeight - button.getBoundingClientRect().bottom < 420) {
      const topBar = document.querySelector('.module-header')?.getBoundingClientRect().bottom ?? 0;
      window.scrollBy(0, button.getBoundingClientRect().top - topBar - 8);
    }
    setOpened(!opened);
  }
  // The popup never runs past the screen: it takes the room left below (or above) the button.
  const fit = { flip: true, shift: true, size: { padding: 16 } };
  const then = (action) => () => {
    close();
    action();
  };

  return (
    <Popover opened={opened} onChange={setOpened} onDismiss={close} position="bottom-start" middlewares={fit} width={400} shadow="md" trapFocus>
      <Popover.Target>
        <Button
          type="button"
          variant="default"
          aria-expanded={opened}
          leftSection={<Icon name="filter" size={18} />}
          rightSection={<Icon name="chevronDown" size={16} />}
          ref={buttonRef}
          onClick={toggle}
        >
          Filters
          {activeCount > 0 && <span className="count-badge count-badge--neutral">{activeCount}</span>}
        </Button>
      </Popover.Target>
      <Popover.Dropdown className="filters-popup" aria-label="Filters">
        <FilterPanel filters={filters} onApply={onApply} onClose={close}>
          <section className="filters-popup-saved" aria-labelledby="saved-filters-title">
            <h3 id="saved-filters-title" className="field-label">Saved filters</h3>
            {savedFilters.length === 0 && <p className="field-hint">No saved filters yet</p>}
            {savedFilters.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="subtle"
                justify="space-between"
                fullWidth
                onClick={then(() => onApplySaved(item))}
                rightSection={item.id === selectedId ? <Icon name="check" size={16} label="Applied" /> : null}
              >
                {item.name}
              </Button>
            ))}
            <Button type="button" variant="subtle" justify="flex-start" fullWidth leftSection={<Icon name="plus" size={16} />} disabled={!canSave} onClick={then(onSave)}>
              Save current filters…
            </Button>
            {selected && (
              <Button type="button" variant="subtle" color="red" justify="flex-start" fullWidth leftSection={<Icon name="close" size={16} />} onClick={then(onDelete)}>
                Delete “{selected.name}”
              </Button>
            )}
          </section>
        </FilterPanel>
      </Popover.Dropdown>
    </Popover>
  );
}
