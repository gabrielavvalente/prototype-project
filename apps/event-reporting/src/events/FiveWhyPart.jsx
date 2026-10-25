import { Button, Switch, Textarea } from '@mantine/core';
import ChipGroup from '../create/ChipGroup.jsx';
import { MAX_WHYS, newLeg, newWhy, ROOT_CAUSE_TYPES } from '../logic/rootCause.js';
import Icon from '../shell/Icon.jsx';

// One why of a leg: the answer, and whether it is a root cause (then Behavioral or Conditional).
function WhyCard({ why, number, onChange }) {
  const isRoot = Boolean(why.rootCause);
  return (
    <li className={`rca-card why-card${isRoot ? ' why-card--root' : ''}`}>
      <Textarea label={`Why ${number}`} minRows={2} autosize value={why.answer} onChange={(e) => onChange({ answer: e.target.value })} />
      <Switch
        mt="xs"
        label="Root cause"
        checked={isRoot}
        onChange={(e) => onChange({ rootCause: e.currentTarget.checked ? 'unclassified' : null })}
      />
      {isRoot && (
        <ChipGroup
          id={`why-${why.id}-type`}
          label="Root cause type"
          required
          value={why.rootCause === 'unclassified' ? '' : why.rootCause}
          options={ROOT_CAUSE_TYPES}
          onChange={(rootCause) => onChange({ rootCause })}
        />
      )}
    </li>
  );
}

// 3-legged 5 Why: legs side by side, up to 5 whys each, branching into a new parallel leg (004
// FR-010, FR-011).
export default function FiveWhyPart({ legs, onChange, readOnly }) {
  const setLeg = (legId, whys) => onChange(legs.map((leg) => (leg.id === legId ? { ...leg, whys } : leg)));
  const setWhy = (leg, whyId, changes) => setLeg(leg.id, leg.whys.map((why) => (why.id === whyId ? { ...why, ...changes } : why)));
  const branch = (index) => onChange([...legs.slice(0, index + 1), newLeg(), ...legs.slice(index + 1)]);

  return (
    <div className="five-why">
      {legs.map((leg, index) => (
        <section key={leg.id} className="five-why-leg" aria-label={`Leg ${index + 1}`}>
          <h4>Leg {index + 1}</h4>
          <ol className="rca-list">
            {leg.whys.map((why, whyIndex) => (
              <WhyCard key={why.id} why={why} number={whyIndex + 1} onChange={(changes) => setWhy(leg, why.id, changes)} />
            ))}
          </ol>
          {!readOnly && (
            <div className="rca-part-actions rca-part-actions--column">
              <Button type="button" variant="default" size="xs" leftSection={<Icon name="plus" size={14} />} disabled={leg.whys.length >= MAX_WHYS} onClick={() => setLeg(leg.id, [...leg.whys, newWhy()])}>
                Add why
              </Button>
              {leg.whys.length > 1 && (
                <Button type="button" variant="subtle" size="xs" onClick={() => setLeg(leg.id, leg.whys.slice(0, -1))}>
                  Remove last why
                </Button>
              )}
              <Button type="button" variant="default" size="xs" onClick={() => branch(index)}>
                Branch
              </Button>
              {legs.length > 1 && (
                <Button type="button" variant="subtle" color="red" size="xs" onClick={() => onChange(legs.filter((item) => item.id !== leg.id))}>
                  Remove leg
                </Button>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
