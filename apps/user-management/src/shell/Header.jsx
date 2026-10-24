import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';

// Compact top bar: app name (back to the users list) and the avatar to switch user.
export default function Header() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();

  function switchUser() {
    signOut();
    navigate('/');
  }

  return (
    <header className="topbar">
      <Link to="/users" className="app-mark" title="Users">
        <span className="app-mark-logo" aria-hidden="true">
          UM
        </span>
        <span className="app-mark-name">User Management</span>
      </Link>
      <span className="topbar-spacer" />
      <button type="button" className="avatar avatar-button" onClick={switchUser} title="Switch user">
        <span aria-hidden="true">{user.avatar}</span>
        <span className="visually-hidden">Signed in as {user.name}. Switch user</span>
      </button>
    </header>
  );
}
