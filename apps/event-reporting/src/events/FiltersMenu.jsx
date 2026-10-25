import { Button, Menu } from '@mantine/core';
import Icon from '../shell/Icon.jsx';

// The Filters button opens a menu with the filter sheet, the saved filters to apply, and saving or
// deleting one (review 2026-10-25).
export default function FiltersMenu({ activeCount, savedFilters, selectedId, canSave, onOpenFilters, onApplySaved, onSave, onDelete }) {
  const selected = savedFilters.find((item) => item.id === selectedId);

  return (
    <Menu position="bottom-start" width={280} shadow="md" returnFocus={false}>
      <Menu.Target>
        <Button
          type="button"
          variant="default"
          leftSection={<Icon name="filter" size={18} />}
          rightSection={<Icon name="chevronDown" size={16} />}
        >
          Filters
          {activeCount > 0 && <span className="count-badge count-badge--neutral">{activeCount}</span>}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Icon name="filter" size={16} />} onClick={onOpenFilters}>
          Choose filters…
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>Saved filters</Menu.Label>
        {savedFilters.length === 0 && <Menu.Item disabled>No saved filters yet</Menu.Item>}
        {savedFilters.map((item) => (
          <Menu.Item
            key={item.id}
            onClick={() => onApplySaved(item)}
            rightSection={item.id === selectedId ? <Icon name="check" size={16} label="Applied" /> : null}
          >
            {item.name}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item leftSection={<Icon name="plus" size={16} />} disabled={!canSave} onClick={onSave}>
          Save current filters…
        </Menu.Item>
        {selected && (
          <Menu.Item color="red" leftSection={<Icon name="close" size={16} />} onClick={onDelete}>
            Delete “{selected.name}”
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
