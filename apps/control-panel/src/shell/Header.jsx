import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getNotifications, markNotificationsRead } from '../../../../shared/platform/platformData.js';
import Icon from './Icon.jsx';
import NotificationsPanel from './NotificationsPanel.jsx';

// Compact top bar: app name (back to the pillars), notifications and the avatar to switch user.
export default function Header() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Read again on every page change, so a change made in another tab shows up.
  useEffect(() => {
    getNotifications(user.id).then(setNotifications);
  }, [user.id, location.pathname]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    markNotificationsRead(user.id).then(() => getNotifications(user.id).then(setNotifications));
  }, [user.id]);

  function switchUser() {
    signOut();
    navigate('/');
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <>
      <header className="topbar">
        <Link to="/pillars" className="app-mark" title="Pillars">
          <span className="app-mark-logo" aria-hidden="true">
            CP
          </span>
          <span className="app-mark-name">Control Panel</span>
        </Link>
        <span className="topbar-spacer" />
        <button type="button" className="icon-button" onClick={() => setPanelOpen(true)}>
          <Icon name="bell" size={22} label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} />
          {unreadCount > 0 && <span className="bell-dot" aria-hidden="true" />}
        </button>
        <button type="button" className="avatar avatar-button" onClick={switchUser} title="Switch user">
          <span aria-hidden="true">{user.avatar}</span>
          <span className="visually-hidden">Signed in as {user.name}. Switch user</span>
        </button>
      </header>
      {panelOpen && <NotificationsPanel items={notifications} onClose={closePanel} />}
    </>
  );
}
