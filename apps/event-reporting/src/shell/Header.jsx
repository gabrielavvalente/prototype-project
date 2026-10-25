import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionIcon, Avatar, Badge, Button, TextInput } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getAll, getByIndex, markAlertsRead } from '../data/db.js';
import { getMenuItems, isEventVisible } from '../logic/access.js';
import { findById, getLabel } from '../logic/lookups.js';
import AccountSheet from './AccountSheet.jsx';
import AlertsPanel from './AlertsPanel.jsx';
import Icon from './Icon.jsx';
import ModuleHeader from './ModuleHeader.jsx';

// The user's alerts whose event is in the current scope, newest first.
async function loadAlerts(user, context) {
  const [alerts, events] = await Promise.all([getByIndex('alerts', 'recipientId', user.id), getAll('events')]);
  return alerts
    .map((alert) => ({ alert, event: events.find((event) => event.id === alert.eventId) }))
    .filter((item) => item.event && isEventVisible(user, context, item.event))
    .sort((a, b) => b.alert.createdAt.localeCompare(a.alert.createdAt));
}

// Persistent module navigation with event search, alerts and account controls.
export default function Header() {
  const { user, context, organization, reference, entered } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [alertItems, setAlertItems] = useState([]);
  const [openSheet, setOpenSheet] = useState(null); // null | 'alerts' | 'account'
  const [query, setQuery] = useState('');
  const menu = user ? getMenuItems(user.role) : [];
  const showAlerts = menu.includes('my-alerts');
  const plant = user && context ? findById(organization, context.plantId) : null;

  const reloadAlerts = useCallback(() => {
    if (user && context && showAlerts) {
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

  function handleSearch(event) {
    event.preventDefault();
    if (user && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <>
      <ModuleHeader
        moduleName="Event Reporting"
        moduleHref={`${import.meta.env.BASE_URL}#/events`}
        search={
          <form role="search" onSubmit={handleSearch}>
            <TextInput
              type="search"
              aria-label="Search events"
              placeholder="Search events by title or record number"
              leftSection={<Icon name="search" size={18} />}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              disabled={!user || !entered}
            />
          </form>
        }
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          title={showAlerts ? 'Notifications' : 'Notifications unavailable'}
          disabled={!showAlerts}
          onClick={() => setOpenSheet('alerts')}
        >
          <Icon name="bell" size={22} />
          {unreadCount > 0 && <Badge className="header-alert-count" size="xs" circle>{unreadCount}</Badge>}
        </ActionIcon>
        <Button
          type="button"
          variant="subtle"
          color="gray"
          className="module-header-user"
          aria-label={user ? `Account: ${user.name}` : 'Not signed in'}
          title={user ? `Account: ${user.name}` : 'Not signed in'}
          disabled={!user}
          onClick={() => setOpenSheet('account')}
        >
          <Avatar radius="xl" color="blue" size={38}>{user?.avatar || '?'}</Avatar>
          {user && <span>{user.name}</span>}
        </Button>
      </ModuleHeader>

      {plant && (
        <div className="context-bar">
          <Button type="button" variant="default" size="sm" className="context-button" onClick={() => setOpenSheet('account')}>
            <span aria-hidden="true">{plant.plantTypeIcon}</span>
            {getLabel(organization, context.businessId)} · {plant.name} ·{' '}
            {context.pillarId ? getLabel(reference, context.pillarId) : 'All pillars'}
            <Icon name="chevronDown" size={16} />
          </Button>
        </div>
      )}

      {openSheet === 'alerts' && showAlerts && <AlertsPanel items={alertItems} onMarkRead={markRead} onClose={closeSheet} />}
      {openSheet === 'account' && user && <AccountSheet onClose={closeSheet} />}
    </>
  );
}
