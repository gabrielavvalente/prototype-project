import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { getPillarColorClass } from '../logic/display.js';
import { getLabel, getReferenceList } from '../logic/lookups.js';
import Icon from './Icon.jsx';

// The pillar is an optional entry point (FR-037, Clarification 2026-10-24).
export default function EntryScreen() {
  const { user, context, reference, organization, enter } = useApp();
  const navigate = useNavigate();
  const allowedPillarIds = getPillarIdsForPlant(user, context.plantId);
  const pillars = getReferenceList(reference, 'pillar').filter((pillar) => allowedPillarIds.includes(pillar.id));

  useEffect(() => {
    document.title = 'Choose where to start — Event Reporting';
  }, []);

  async function choose(pillarId) {
    await enter(pillarId);
    navigate('/events');
  }

  return (
    <main className="page page--with-nav">
      <h1>Hello, {user.name.split(' ')[0]}</h1>
      <p className="field-hint">
        Choose the pillar you are reporting for in {getLabel(organization, context.plantId)}, or see every pillar you
        can access.
      </p>
      <p className="section-label">Pillars</p>
      <ul className="card-list">
        {pillars.map((pillar) => (
          <li key={pillar.id}>
            <button
              type="button"
              className="button choice-card choice-card--row"
              aria-pressed={context.pillarId === pillar.id}
              onClick={() => choose(pillar.id)}
            >
              <span className={`pillar-dot pillar-dot--large ${getPillarColorClass(pillar.code)}`} aria-hidden="true" />
              <strong>{pillar.label}</strong>
              <Icon name="chevronRight" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="button button--secondary button--block" onClick={() => choose(null)}>
        Enter without a pillar
      </button>
    </main>
  );
}
