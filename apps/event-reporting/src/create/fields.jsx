import { Button, Select, TextInput } from '@mantine/core';

// Small form building blocks shared by the form sections.

export function FieldError({ errors, field }) {
  const found = errors.find((item) => item.field === field);
  if (!found) {
    return null;
  }
  return (
    <span className="field-error" id={`${field}-error`} role="alert">
      {found.message}
    </span>
  );
}

export function SelectField({ id, label, value, options, onChange, errors = [], disabled = false, hint, required = false, searchable = false }) {
  const error = errors.find((item) => item.field === id)?.message;
  return (
    <div className="field">
      <Select
        id={id}
        label={label}
        description={hint}
        required={required}
        value={value || null}
        data={options.map((option) => ({ value: option.id, label: option.label || option.name }))}
        disabled={disabled}
        searchable={searchable}
        placeholder="Choose…"
        error={error}
        onChange={(next) => onChange(next || '')}
        comboboxProps={{ withinPortal: true }}
      />
    </div>
  );
}

export function TextField({ id, label, value, onChange, errors = [], type = 'text', hint, required = false, ...rest }) {
  const error = errors.find((item) => item.field === id)?.message;
  return (
    <div className="field">
      <TextInput
        id={id}
        label={label}
        description={hint}
        type={type}
        value={value || ''}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        {...rest}
      />
    </div>
  );
}

export function YesNoField({ id, label, value, onChange, errors = [], hint, required = true }) {
  return (
    <fieldset className="field" id={id}>
      <legend className={`field-label${required ? ' required' : ''}`}>{label}</legend>
      {hint && <span className="field-hint">{hint}</span>}
      <div className="chip-group">
        <Button type="button" variant={value === true ? 'light' : 'default'} aria-pressed={value === true} onClick={() => onChange(true)}>
          Yes
        </Button>
        <Button type="button" variant={value === false ? 'light' : 'default'} aria-pressed={value === false} onClick={() => onChange(false)}>
          No
        </Button>
      </div>
      <FieldError errors={errors} field={id} />
    </fieldset>
  );
}
