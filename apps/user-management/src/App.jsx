import { useEffect, useState } from 'react';
import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { AppContext, SIGNED_IN_USER_KEY, useApp } from './AppContext.js';
import { getWorkflowSettings, loadPlatform } from '../../../shared/platform/platformData.js';
import { hasControlPanelAccess } from '../../../shared/platform/permissions.js';
import Header from './shell/Header.jsx';
import NotAllowed from './shell/NotAllowed.jsx';
import StartScreen from './shell/StartScreen.jsx';
import UserDetail from './users/UserDetail.jsx';
import UsersList from './users/UsersList.jsx';

// Every signed-in page: header on top, the page below. Only people holding a Control Panel role
// may see users (FR-027).
function SignedInLayout() {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <Header />
      {hasControlPanelAccess(user) ? <Outlet /> : <NotAllowed />}
    </>
  );
}

const router = createHashRouter([
  { path: '/', element: <StartScreen /> },
  {
    element: <SignedInLayout />,
    children: [
      { path: 'users', element: <UsersList /> },
      { path: 'users/:userId', element: <UserDetail /> },
      { path: '*', element: <NotAllowed reason="notFound" /> },
    ],
  },
]);

export default function App() {
  const [platform, setPlatform] = useState(null);
  const [userId, setUserId] = useState(sessionStorage.getItem(SIGNED_IN_USER_KEY));

  // Users, plants and roles, plus the workflow settings for the review groups.
  useEffect(() => {
    Promise.all([loadPlatform(), getWorkflowSettings()]).then(([lists, workflowSettings]) =>
      setPlatform({ ...lists, workflowSettings }),
    );
  }, []);

  function signIn(id) {
    sessionStorage.setItem(SIGNED_IN_USER_KEY, id);
    setUserId(id);
  }

  function signOut() {
    sessionStorage.removeItem(SIGNED_IN_USER_KEY);
    setUserId(null);
  }

  if (!platform) {
    return <p className="page">Loading…</p>;
  }

  const user = platform.users.find((item) => item.id === userId) || null;

  return (
    <AppContext.Provider value={{ ...platform, user, signIn, signOut }}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}
