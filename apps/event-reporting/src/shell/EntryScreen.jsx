import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { getLabel, getReferenceList } from '../logic/lookups.js';

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
    <main className="page">
      <h1>Choose where to start</h1>
      <p>
        Pick the pillar you are reporting for in {getLabel(organization, context.plantId)}, or enter without one to see
        every pillar you can access.
      </p>
      <ul className="card-list">
        {pillars.map((pillar) => (
          <li key={pillar.id}>
            <button
              type="button"
              className="button choice-card"
              aria-pressed={context.pillarId === pillar.id}
              onClick={() => choose(pillar.id)}
            >
              <strong>{pillar.label}</strong>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="button button--secondary" onClick={() => choose(null)}>
        Enter without a pillar
      </button>
    </main>
  );
}
