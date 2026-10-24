import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getAll, getByIndex } from '../data/db.js';
import { getMenuItems, getPillarIdsForPlant, isEventVisible } from '../logic/access.js';
import { findById, getLabel } from '../logic/lookups.js';
import AlertsPanel from './AlertsPanel.jsx';
import Navigation from './Navigation.jsx';

const UNSAVED_WARNING = 'You have unsaved changes in the form. Change anyway? Your changes will be lost.';

// The user's alerts whose event is in the current scope, newest first.
async function loadAlerts(user, context) {
  const [alerts, events] = await Promise.all([getByIndex('alerts', 'recipientId', user.id), getAll('events')]);
  return alerts
    .map((alert) => ({ alert, event: events.find((event) => event.id === alert.eventId) }))
    .filter((item) => item.event && isEventVisible(user, context, item.event))
    .sort((a, b) => b.alert.createdAt.localeCompare(a.alert.createdAt));
}

function plantOptionLabel(plant) {
  return `${plant.plantTypeIcon} ${plant.name} — ${plant.plantTypeLabel} · ${plant.countryFlag} ${plant.countryName}`;
}

// Persistent header: who I am, where I am working, My Alerts and the menu (FR-018 to FR-020).
export default function Header() {
  const { user, settings, context, organization, reference, updateSettings, signOut, formDirty, reloadPage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [alertItems, setAlertItems] = useState([]);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsButtonRef = useRef(null);
  const showAlerts = getMenuItems(user.role).includes('my-alerts');

  const businessIds = [...new Set(user.access.map((entry) => entry.businessId))];
  const plantsInBusiness = user.access
    .filter((entry) => entry.businessId === context.businessId)
    .map((entry) => findById(organization, entry.plantId));
  const currentPlant = findById(organization, context.plantId);

  // Reload alerts when the page or the context changes (e.g. after submitting an event).
  useEffect(() => {
    if (showAlerts) {
      loadAlerts(user, context).then(setAlertItems);
    }
  }, [user, context, location.pathname, showAlerts]);

  const seenAt = settings.alertsSeenAt || '';
  const unreadCount = alertItems.filter((item) => item.alert.createdAt > seenAt).length;

  function confirmLeavingForm() {
    return !formDirty || window.confirm(UNSAVED_WARNING);
  }

  async function changeBusiness(businessId) {
    if (!confirmLeavingForm()) return;
    const firstPlant = user.access.find((entry) => entry.businessId === businessId);
    await updateSettings({ businessId, plantId: firstPlant.plantId, pillarId: null });
    reloadPage();
  }

  async function changePlant(plantId) {
    if (!confirmLeavingForm()) return;
    // Keep the selected pillar only if the user also has it in the new plant.
    const keepPillar = context.pillarId && getPillarIdsForPlant(user, plantId).includes(context.pillarId);
    await updateSettings({ plantId, pillarId: keepPillar ? context.pillarId : null });
  }

  function openAlerts() {
    setAlertsOpen(true);
    updateSettings({ alertsSeenAt: new Date().toISOString() });
  }

  const closeAlerts = useCallback(() => {
    setAlertsOpen(false);
    alertsButtonRef.current?.focus();
  }, []);

  function switchUser() {
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
          <div className="header-context">
            {getLabel(organization, context.businessId)} · {currentPlant.name} ·{' '}
            {context.pillarId ? getLabel(reference, context.pillarId) : 'All pillars'}{' '}
            <Link to="/entry">Change pillar</Link>
          </div>
        </div>
      </div>

      <div className="header-selectors">
        {businessIds.length > 1 && (
          <div className="field">
            <label htmlFor="business-select">Business</label>
            <select id="business-select" value={context.businessId} onChange={(e) => changeBusiness(e.target.value)}>
              {businessIds.map((id) => (
                <option key={id} value={id}>
                  {getLabel(organization, id)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="plant-select">Plant</label>
          <select id="plant-select" value={context.plantId} onChange={(e) => changePlant(e.target.value)}>
            {plantsInBusiness.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plantOptionLabel(plant)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="header-links">
        <Navigation role={user.role} />
        {showAlerts && (
          <button type="button" className="button" ref={alertsButtonRef} onClick={openAlerts}>
            My Alerts
            {unreadCount > 0 && (
              <span className="count-badge">
                {unreadCount}
                <span className="visually-hidden"> new</span>
              </span>
            )}
          </button>
        )}
        <button type="button" className="button button--link" onClick={switchUser}>
          Switch user
        </button>
      </div>

      {alertsOpen && <AlertsPanel items={alertItems} onClose={closeAlerts} />}
    </header>
  );
}
