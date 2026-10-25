import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActionIcon, Avatar, Button, TextInput } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getNotifications, markNotificationsRead } from '../../../../shared/platform/platformData.js';
import Icon from './Icon.jsx';
import NotificationsPanel from './NotificationsPanel.jsx';
import ModuleHeader from './ModuleHeader.jsx';

// Compact top bar: app name (back to the pillars), notifications and the avatar to switch user.
export default function Header() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Read again on every page change, so a change made in another tab shows up.
  useEffect(() => {
    if (user) {
      getNotifications(user.id).then(setNotifications);
    } else {
      setNotifications([]);
    }
  }, [user?.id, location.pathname]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    if (user) {
      markNotificationsRead(user.id).then(() => getNotifications(user.id).then(setNotifications));
    }
  }, [user]);

  function switchUser() {
    if (!user) return;
    signOut();
    navigate('/');
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  function handleSearch(event) {
    event.preventDefault();
    if (user && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <>
      <ModuleHeader
        moduleName="Control Panel"
        moduleHref={`${import.meta.env.BASE_URL}#/pillars`}
        search={
          <form role="search" onSubmit={handleSearch}>
            <TextInput
              type="search"
              aria-label="Search Control Panel"
              placeholder="Search pillars and master data"
              leftSection={<Icon name="search" size={18} />}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              disabled={!user}
            />
          </form>
        }
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          title={user ? 'Notifications' : 'Notifications unavailable'}
          disabled={!user}
          onClick={() => setPanelOpen(true)}
        >
          <Icon name="bell" size={22} />
          {unreadCount > 0 && <span className="bell-dot" aria-hidden="true" />}
        </ActionIcon>
        <Button
          type="button"
          variant="subtle"
          color="gray"
          className="module-header-user"
          onClick={switchUser}
          title={user ? `Switch user: ${user.name}` : 'Not signed in'}
          aria-label={user ? `Signed in as ${user.name}. Switch user` : 'Not signed in'}
          disabled={!user}
        >
          <Avatar radius="xl" color="blue" size={38}>{user?.avatar || '?'}</Avatar>
          {user && <span>{user.name}</span>}
        </Button>
      </ModuleHeader>
      {panelOpen && <NotificationsPanel items={notifications} onClose={closePanel} />}
    </>
  );
}
