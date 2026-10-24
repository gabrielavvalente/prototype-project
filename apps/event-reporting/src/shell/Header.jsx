import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getAll, getByIndex, markAlertsRead } from '../data/db.js';
import { getMenuItems, isEventVisible } from '../logic/access.js';
import { findById, getLabel } from '../logic/lookups.js';
import AccountSheet from './AccountSheet.jsx';
import AlertsPanel from './AlertsPanel.jsx';
import Icon from './Icon.jsx';

// The user's alerts whose event is in the current scope, newest first.
async function loadAlerts(user, context) {
  const [alerts, events] = await Promise.all([getByIndex('alerts', 'recipientId', user.id), getAll('events')]);
  return alerts
    .map((alert) => ({ alert, event: events.find((event) => event.id === alert.eventId) }))
    .filter((item) => item.event && isEventVisible(user, context, item.event))
    .sort((a, b) => b.alert.createdAt.localeCompare(a.alert.createdAt));
}

// Compact top bar: app name, search, notifications, avatar; the current context just below
// (FR-018, FR-040). Business, plant and pillar are changed in the account sheet.
export default function Header() {
  const { user, context, organization, reference } = useApp();
  const location = useLocation();
  const [alertItems, setAlertItems] = useState([]);
  const [openSheet, setOpenSheet] = useState(null); // null | 'alerts' | 'account'
  const menu = getMenuItems(user.role);
  const showAlerts = menu.includes('my-alerts');
  const plant = findById(organization, context.plantId);

  const reloadAlerts = useCallback(() => {
    if (showAlerts) {
      loadAlerts(user, context).then(setAlertItems);
    }
  }, [user, context, showAlerts]);

  // Reload alerts when the page or the context changes (e.g. after submitting an event).
  useEffect(() => {
    reloadAlerts();
  }, [reloadAlerts, location.pathname]);

  const closeSheet = useCallback(() => setOpenSheet(null), []);

  async function markRead(alerts) {
    await markAlertsRead(alerts);
    reloadAlerts();
  }

  const unreadCount = alertItems.filter((item) => !item.alert.readAt).length;

  return (
    <>
      <header className="topbar">
        <Link to="/events" className="app-mark" title="Event list">
          <span className="app-mark-logo" aria-hidden="true">
            ER
          </span>
          <span className="app-mark-name">Event Reporting</span>
        </Link>
        <Link to="/search" className="search-pill">
          <Icon name="search" size={18} />
          <span className="search-pill-text">Search</span>
        </Link>
        <nav className="top-nav" aria-label="Main">
          <NavLink to="/events" end className="top-nav-link">
            Events
          </NavLink>
          {menu.includes('create-event') && (
            <NavLink to="/events/new" className="button button--primary">
              <Icon name="plus" size={18} /> New event
            </NavLink>
          )}
        </nav>
        <Link to="/entry" className="icon-button" title="Home">
          <Icon name="home" size={22} label="Home — choose a pillar" />
        </Link>
        {showAlerts && (
          <button type="button" className="icon-button" onClick={() => setOpenSheet('alerts')}>
            <Icon name="bell" size={22} label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} />
            {unreadCount > 0 && <span className="bell-dot" aria-hidden="true" />}
          </button>
        )}
        <button type="button" className="avatar avatar-button" onClick={() => setOpenSheet('account')}>
          <span aria-hidden="true">{user.avatar}</span>
          <span className="visually-hidden">Account: {user.name}</span>
        </button>
      </header>

      <div className="context-bar">
        <button type="button" className="context-button" onClick={() => setOpenSheet('account')}>
          <span aria-hidden="true">{plant.plantTypeIcon}</span>
          <span>
            {getLabel(organization, context.businessId)} · {plant.name} ·{' '}
            {context.pillarId ? getLabel(reference, context.pillarId) : 'All pillars'}
          </span>
          <Icon name="chevronDown" size={16} />
        </button>
      </div>

      {openSheet === 'alerts' && <AlertsPanel items={alertItems} onMarkRead={markRead} onClose={closeSheet} />}
      {openSheet === 'account' && <AccountSheet onClose={closeSheet} />}
    </>
  );
}
