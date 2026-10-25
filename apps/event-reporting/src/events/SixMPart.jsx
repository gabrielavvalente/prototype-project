import { useState } from 'react';
import { Checkbox, Textarea, TextInput } from '@mantine/core';
import { causeName, MAX_CAUSES, OTHER_CAUSE, SIX_M_THEMES } from '../logic/rootCause.js';
import RcaNav from './RcaNav.jsx';

// 6M (ui-ux/6m.png, 004 FR-009): pick a theme, tick its contributory causes, explain how each one
// contributed; at most 6 causes in total across themes.
export default function SixMPart({ causes, onChange, readOnly }) {
  const [themeKey, setThemeKey] = useState(SIX_M_THEMES[0].key);
  const theme = SIX_M_THEMES.find((item) => item.key === themeKey);
  const full = causes.length >= MAX_CAUSES;
  const ticked = (option) => causes.find((cause) => cause.theme === themeKey && cause.option === option);
  const update = (id, changes) => onChange(causes.map((cause) => (cause.id === id ? { ...cause, ...changes } : cause)));

  function toggle(option) {
    const found = ticked(option);
    if (found) onChange(causes.filter((cause) => cause.id !== found.id));
    else onChange([...causes, { id: crypto.randomUUID(), theme: themeKey, option, other: '', why: '' }]);
  }

  const count = (key) => causes.filter((cause) => cause.theme === key).length;
  const other = ticked(OTHER_CAUSE);

  return (
    <>
      <p className="field-hint">
        Most incidents may involve multiple contributory causes, but avoid selecting the max of six by default.
        Instead, identify the most significant cause first and run it through the 5-Why analysis. This approach helps
        prevent duplication and ensures a focused investigation. Check only the relevant boxes for causes that truly
        apply after.
      </p>
      <div className="rca-split">
        <RcaNav
          title="Themes"
          items={SIX_M_THEMES.map((item) => ({ key: item.key, label: item.label, note: count(item.key) ? `${count(item.key)} ticked` : '' }))}
          current={themeKey}
          onSelect={setThemeKey}
        >
          <p className="rca-nav-title">Guidance</p>
          <ul className="rca-guidance">
            {theme.guidance.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </RcaNav>
        <fieldset className="rca-panel section-fieldset" disabled={readOnly}>
          <h4>{theme.label}</h4>
          <fieldset className="field">
            <legend className="field-label">
              Contributory causes <span className="field-hint">(select any that apply)</span>
            </legend>
            <div className="sixm-options">
              {[...theme.causes, OTHER_CAUSE].map((option) => {
                const checked = Boolean(ticked(option));
                return (
                  <Checkbox
                    key={option}
                    label={option}
                    checked={checked}
                    disabled={!checked && full}
                    onChange={() => toggle(option)}
                  />
                );
              })}
            </div>
            {full && <span className="field-hint">At most {MAX_CAUSES} causes in total; untick one to choose another.</span>}
          </fieldset>
          {other && (
            <TextInput label="Name the other cause" required value={other.other} onChange={(e) => update(other.id, { other: e.target.value })} />
          )}
          {causes.some((cause) => cause.theme === themeKey) && (
            <>
              <hr className="rca-divider" />
              <p className="field-label">Explain the reason why the contributory cause(s) happened</p>
              <ol className="rca-list">
                {causes.map((cause, index) =>
                  cause.theme !== themeKey ? null : (
                    <li key={cause.id} className="qa-card">
                      <span className="qa-card-number">C{index + 1}</span>
                      <div className="qa-card-body">
                        <Textarea
                          label={`How did "${causeName(cause)}" contribute to the event occurrence?`}
                          required
                          minRows={2}
                          autosize
                          value={cause.why}
                          onChange={(e) => update(cause.id, { why: e.target.value })}
                        />
                      </div>
                    </li>
                  ),
                )}
              </ol>
            </>
          )}
        </fieldset>
      </div>
    </>
  );
}
