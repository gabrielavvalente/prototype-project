import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getRole } from '../../../../shared/platform/permissions.js';
import Icon from './Icon.jsx';
import { describeRole, getPillars, pillarDotClass } from './roleText.js';

// The pillars the user holds a Control Panel role on, with their level and plants (FR-002).
export default function PillarPicker() {
  const { user, organization, reference } = useApp();
  const pillars = getPillars(reference).filter((pillar) => getRole(user, pillar.id));

  useEffect(() => {
    document.title = 'Pillars — Control Panel';
  }, []);

  return (
    <main className="page">
      <h1>Hello, {user.name.split(' ')[0]}</h1>
      <p className="field-hint">Choose the pillar whose workflow and master data you want to manage.</p>
      <ul className="card-list">
        {pillars.map((pillar) => (
          <li key={pillar.id}>
            <Link className="button choice-card choice-card--row" to={`/pillars/${pillar.id}/workflow`}>
              <span className={`${pillarDotClass(pillar.id)} pillar-dot--large`} aria-hidden="true" />
              <span className="list-row-text">
                <strong>{pillar.label}</strong>
                <small>{describeRole(getRole(user, pillar.id), organization)}</small>
              </span>
              <Icon name="chevronRight" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
