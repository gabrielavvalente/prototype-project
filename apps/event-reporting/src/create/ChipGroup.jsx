import { FieldError } from './fields.jsx';
import { Button } from '@mantine/core';

// A group of pill-shaped choices (FR-039). Single choice by default; "multiple" lets several
// be chosen; "allowEmpty" lets the chosen chip be tapped again to clear it (used by filters).
// An option with a colorKey ("hs", "env"…) is shown in its pillar's color.
export default function ChipGroup({
  id,
  label,
  options,
  value,
  onChange,
  multiple = false,
  allowEmpty = false,
  required = false,
  hint,
  errors = [],
}) {
  const selected = multiple ? value : [value];

  function choose(optionValue) {
    if (multiple) {
      onChange(value.includes(optionValue) ? value.filter((item) => item !== optionValue) : [...value, optionValue]);
    } else if (allowEmpty && value === optionValue) {
      onChange('');
    } else {
      onChange(optionValue);
    }
  }

  return (
    <fieldset className="field" id={id}>
      <legend className={`field-label${required ? ' required' : ''}`}>{label}</legend>
      {hint && <span className="field-hint">{hint}</span>}
      <div className="chip-group">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={selected.includes(option.value) ? 'light' : 'default'}
            className={option.colorKey ? `pillar-chip pillar-chip--${option.colorKey}` : undefined}
            aria-pressed={selected.includes(option.value)}
            onClick={() => choose(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <FieldError errors={errors} field={id} />
    </fieldset>
  );
}
