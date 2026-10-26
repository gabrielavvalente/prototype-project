import { useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { peopleOfPlant } from '../../../../shared/platform/notifications.js';
import Icon from '../shell/Icon.jsx';

// The people of the plant, whose information alerts the Site Admin can change (NT-10).
export default function PeopleTab() {
  const { plantId, plantName } = useOutletContext();
  const { users } = useApp();

  useEffect(() => {
    document.title = `People — Notifications · ${plantName} — Control Panel`;
  }, [plantName]);

  return (
    <main className="page">
      <h1>People</h1>
      <p className="field-hint">Choose a person to see and change their information alerts.</p>
      <ul className="card-list">
        {peopleOfPlant(users, plantId).map((person) => (
          <li key={person.id}>
            <Link className="button choice-card choice-card--row" to={person.id}>
              <span className="list-row-text">
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </span>
              <Icon name="chevronRight" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
