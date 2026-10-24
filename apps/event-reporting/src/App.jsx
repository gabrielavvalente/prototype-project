import { useEffect, useMemo, useState } from 'react';
import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { AppContext, SIGNED_IN_USER_KEY, useApp } from './AppContext.js';
import { getAll, getById, put, seedIfEmpty } from './data/db.js';
import EventFormPage from './create/EventForm.jsx';
import EventDetail from './events/EventDetail.jsx';
import { canOpenRoute } from './logic/access.js';
import Header from './shell/Header.jsx';
import NotAllowed from './shell/NotAllowed.jsx';
import StartScreen from './shell/StartScreen.jsx';

function Placeholder({ title }) {
  return (
    <main className="page">
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </main>
  );
}

// Every signed-in page: header on top, the page below. Sends signed-out visitors to the start screen.
function SignedInLayout() {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <Header />
      <Outlet />
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
      { path: 'entry', element: <RequireRoute name="entry"><Placeholder title="Choose where to start" /></RequireRoute> },
      { path: 'events', element: <RequireRoute name="events"><Placeholder title="Events" /></RequireRoute> },
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

  async function loadSignedInUser(userId) {
    const signedInUser = await getById('users', userId);
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
      const [users, organization, reference] = await Promise.all([
        getAll('users'),
        getAll('organization'),
        getAll('reference'),
      ]);
      setLists({ users, organization, reference });
      const savedUserId = sessionStorage.getItem(SIGNED_IN_USER_KEY);
      if (savedUserId) {
        await loadSignedInUser(savedUserId);
      }
      setLoading(false);
    }
    start();
  }, []);

  async function signIn(userId) {
    sessionStorage.setItem(SIGNED_IN_USER_KEY, userId);
    await loadSignedInUser(userId);
  }

  function signOut() {
    sessionStorage.removeItem(SIGNED_IN_USER_KEY);
    setUser(null);
    setSettings(null);
  }

  // Saves a new business / plant / pillar (or column choices) for the signed-in user.
  async function updateSettings(changes) {
    const updated = { ...settings, ...changes };
    await put('settings', updated);
    setSettings(updated);
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
    setContext: updateSettings,
    updateSettings,
    signIn,
    signOut,
  };

  return (
    <AppContext.Provider value={appState}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}
