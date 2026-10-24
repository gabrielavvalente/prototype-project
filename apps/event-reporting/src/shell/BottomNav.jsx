import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getMenuItems } from '../logic/access.js';
import Icon from './Icon.jsx';

// Phone navigation at the bottom of the screen (FR-040). Hidden on the form and the event
// detail, which have their own bar of actions there.
export default function BottomNav() {
  const { user } = useApp();
  const location = useLocation();
  const menu = getMenuItems(user.role);

  if (location.pathname.startsWith('/events/')) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Main">
      <div className="bottom-nav-items">
        <NavLink to="/entry" className="bottom-nav-item">
          <Icon name="home" size={22} />
          Home
        </NavLink>
        <NavLink to="/events" end className="bottom-nav-item">
          <Icon name="list" size={22} />
          Events
        </NavLink>
        {menu.includes('create-event') && (
          <NavLink to="/events/new" className="bottom-nav-new">
            <Icon name="plus" size={26} />
            New
          </NavLink>
        )}
      </div>
    </nav>
  );
}
