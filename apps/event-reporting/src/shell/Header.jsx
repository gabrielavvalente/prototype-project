import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getMenuItems } from '../logic/access.js';
import { getLabel } from '../logic/lookups.js';

export default function Header() {
  const { user, context, organization, signOut } = useApp();
  const navigate = useNavigate();
  const menu = getMenuItems(user.role);

  function handleSwitchUser() {
    signOut();
    navigate('/');
  }

  return (
    <header className="header">
      <div className="header-user">
        <span className="avatar" aria-hidden="true">
          {user.avatar}
        </span>
        <div>
          <strong>{user.name}</strong> · {user.role}
          <div className="header-context">{getLabel(organization, context.plantId)}</div>
        </div>
      </div>
      <nav className="header-links" aria-label="Main">
        {menu.includes('events') && (
          <Link className="button" to="/events">
            Events
          </Link>
        )}
        {menu.includes('create-event') && (
          <Link className="button button--primary" to="/events/new">
            Create Event
          </Link>
        )}
        <button type="button" className="button button--link" onClick={handleSwitchUser}>
          Switch user
        </button>
      </nav>
    </header>
  );
}
