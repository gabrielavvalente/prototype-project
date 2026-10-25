import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/users', label: 'Users' },
  { to: '/groups', label: 'Groups' },
];

// Users · Groups (feature 004): the two read-only directories.
export default function PageTabs() {
  return (
    <nav className="page-tabs" aria-label="Directory">
      {TABS.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `page-tab${isActive ? ' page-tab--active' : ''}`}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
