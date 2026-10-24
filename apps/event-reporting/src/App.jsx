import { useEffect, useMemo, useRef, useState } from 'react';
import { createHashRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { AppContext, ENTERED_KEY, SIGNED_IN_USER_KEY, useApp } from './AppContext.js';
import { loadPlatform } from '../../../shared/platform/platformData.js';
import { getAll, getById, put, seedIfEmpty } from './data/db.js';
import EventFormPage from './create/EventForm.jsx';
import EventDetail from './events/EventDetail.jsx';
import EventLibrary from './events/EventLibrary.jsx';
import { canOpenRoute } from './logic/access.js';
import EntryScreen from './shell/EntryScreen.jsx';
import BottomNav from './shell/BottomNav.jsx';
import Header from './shell/Header.jsx';
import NotAllowed from './shell/NotAllowed.jsx';
import SearchPage from './shell/SearchPage.jsx';
import StartScreen from './shell/StartScreen.jsx';

// Every signed-in page: header on top, the page below. Sends signed-out visitors to the start
// screen, and signed-in users to the entry screen until they have chosen where to start.
function SignedInLayout() {
  const { user, entered } = useApp();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!entered && location.pathname !== '/entry') {
    return <Navigate to="/entry" replace />;
  }
  return (
    <>
      <Header />
      <Outlet />
      <BottomNav />
    </>
  );
}

// Shows the page only if the user's role may open it (contracts/routes.md).
function RequireRoute({ name, children }) {
  const { user } = useApp();
  return canOpenRoute(user.role, name) ? children : <NotAllowed reason="permission" />;
}

const router = createHashRouter([
  { path: '/', element: <StartScreen /> },
  {
    element: <SignedInLayout />,
    children: [
      { path: 'entry', element: <RequireRoute name="entry"><EntryScreen /></RequireRoute> },
      { path: 'events', element: <RequireRoute name="events"><EventLibrary /></RequireRoute> },
      { path: 'search', element: <RequireRoute name="search"><SearchPage /></RequireRoute> },
      { path: 'events/new', element: <RequireRoute name="events-new"><EventFormPage /></RequireRoute> },
      { path: 'events/:id', element: <RequireRoute name="event-detail"><EventDetail /></RequireRoute> },
      { path: 'events/:id/edit', element: <RequireRoute name="event-edit"><EventFormPage /></RequireRoute> },
      { path: '*', element: <NotAllowed reason="notFound" /> },
    ],
  },
]);

// The user's first plant, with no pillar selected ("All pillars").
function defaultContext(user) {
  const first = user.access[0];
  return { businessId: first.businessId, plantId: first.plantId, pillarId: null };
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState({ users: [], organization: [], reference: [] });
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [entered, setEntered] = useState(sessionStorage.getItem(ENTERED_KEY) === 'yes');
  const [formDirty, setFormDirty] = useState(false);
  const reloading = useRef(false);

  // Warn before closing the tab while the event form has unsaved changes.
  useEffect(() => {
    if (!formDirty) return undefined;
    const warn = (e) => {
      if (!reloading.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [formDirty]);

  async function loadSignedInUser(userId, users) {
    const signedInUser = users.find((item) => item.id === userId && item.role);
    if (!signedInUser) {
      return;
    }
    let userSettings = await getById('settings', userId);
    if (!userSettings) {
      userSettings = { id: userId, ...defaultContext(signedInUser), visibleColumns: null };
      await put('settings', userSettings);
    }
    setSettings(userSettings);
    setUser(signedInUser);
  }

  useEffect(() => {
    async function start() {
      await seedIfEmpty();
      // Users, plants, pillars and levels are shared platform data; the form lists are the app's.
      const [platform, formLists] = await Promise.all([loadPlatform(), getAll('reference')]);
      const loaded = {
        users: platform.users,
        organization: platform.organization,
        reference: [...platform.reference, ...formLists],
      };
      setLists(loaded);
      const savedUserId = sessionStorage.getItem(SIGNED_IN_USER_KEY);
      if (savedUserId) {
        await loadSignedInUser(savedUserId, loaded.users);
      }
      setLoading(false);
    }
    start();
  }, []);

  async function signIn(userId) {
    sessionStorage.setItem(SIGNED_IN_USER_KEY, userId);
    sessionStorage.removeItem(ENTERED_KEY);
    setEntered(false);
    await loadSignedInUser(userId, lists.users);
  }

  function signOut() {
    sessionStorage.removeItem(SIGNED_IN_USER_KEY);
    sessionStorage.removeItem(ENTERED_KEY);
    setEntered(false);
    setUser(null);
    setSettings(null);
  }

  // Saves a new business / plant / pillar (or column choices) for the signed-in user.
  async function updateSettings(changes) {
    const updated = { ...settings, ...changes };
    await put('settings', updated);
    setSettings(updated);
  }

  // Entry screen choice: a pillar id, or null for "All pillars" (FR-037).
  async function enter(pillarId) {
    await updateSettings({ pillarId });
    sessionStorage.setItem(ENTERED_KEY, 'yes');
    setEntered(true);
  }

  // Reloads the whole page (used when switching business) without the unsaved-changes warning,
  // because the user has already confirmed.
  function reloadPage() {
    reloading.current = true;
    window.location.reload();
  }

  // Kept as the same object until the context really changes, so pages do not reload their data.
  const context = useMemo(
    () =>
      settings
        ? { businessId: settings.businessId, plantId: settings.plantId, pillarId: settings.pillarId }
        : null,
    [settings?.businessId, settings?.plantId, settings?.pillarId],
  );

  if (loading) {
    return <p className="page">Loading…</p>;
  }

  const appState = {
    ...lists,
    user,
    settings,
    context,
    updateSettings,
    entered,
    enter,
    formDirty,
    setFormDirty,
    reloadPage,
    signIn,
    signOut,
  };

  return (
    <AppContext.Provider value={appState}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}
