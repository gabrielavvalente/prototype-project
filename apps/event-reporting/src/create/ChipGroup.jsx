import { FieldError } from './fields.jsx';

// A group of pill-shaped choices (FR-039). Single choice by default; "multiple" lets several
// be chosen; "allowEmpty" lets the chosen chip be tapped again to clear it (used by filters).
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
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={selected.includes(option.value)}
            onClick={() => choose(option.value)}
          >
            {option.dotClass !== undefined && <span className={`pillar-dot ${option.dotClass}`} aria-hidden="true" />}
            {option.label}
          </button>
        ))}
      </div>
      <FieldError errors={errors} field={id} />
    </fieldset>
  );
}
