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

export function SelectField({ id, label, value, options, onChange, errors = [], disabled = false, hint }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      <select
        id={id}
        value={value || ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={errors.some((item) => item.field === id)}
      >
        <option value="">Choose…</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label || option.name}
          </option>
        ))}
      </select>
      <FieldError errors={errors} field={id} />
    </div>
  );
}

export function TextField({ id, label, value, onChange, errors = [], type = 'text', hint, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <span className="field-hint">{hint}</span>}
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={errors.some((item) => item.field === id)}
        {...rest}
      />
      <FieldError errors={errors} field={id} />
    </div>
  );
}

export function YesNoField({ id, label, value, onChange, errors = [], hint }) {
  return (
    <fieldset className="field">
      <legend className="field-label">{label}</legend>
      {hint && <span className="field-hint">{hint}</span>}
      <div className="yes-no">
        <button type="button" className="button" aria-pressed={value === true} onClick={() => onChange(true)}>
          Yes
        </button>
        <button type="button" className="button" aria-pressed={value === false} onClick={() => onChange(false)}>
          No
        </button>
      </div>
      <FieldError errors={errors} field={id} />
    </fieldset>
  );
}
