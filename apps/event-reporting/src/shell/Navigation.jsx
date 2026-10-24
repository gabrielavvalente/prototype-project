import { NavLink } from 'react-router-dom';
import { getMenuItems } from '../logic/access.js';

// Menu built from the user's role (FR-022). My Alerts is a header button, not a page.
export default function Navigation({ role }) {
  const menu = getMenuItems(role);
  return (
    <nav className="header-links" aria-label="Main">
      {menu.includes('events') && (
        <NavLink className="button" to="/events" end>
          Events
        </NavLink>
      )}
      {menu.includes('create-event') && (
        <NavLink className="button button--primary" to="/events/new">
          Create Event
        </NavLink>
      )}
    </nav>
  );
}
