import { useEffect, useState } from 'react';
import { createHashRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { AppContext, SIGNED_IN_USER_KEY, useApp } from './AppContext.js';
import { loadPlatform } from '../../../shared/platform/platformData.js';
import { hasControlPanelAccess } from '../../../shared/platform/permissions.js';
import AuditTab from './audit/AuditTab.jsx';
import Header from './shell/Header.jsx';
import NotAllowed from './shell/NotAllowed.jsx';
import PillarLayout from './shell/PillarLayout.jsx';
import PillarPicker from './shell/PillarPicker.jsx';
import StartScreen from './shell/StartScreen.jsx';
import MasterDataTab from './masterData/MasterDataTab.jsx';
import WorkflowTab from './workflow/WorkflowTab.jsx';
import SearchPage from './shell/SearchPage.jsx';

// Every signed-in page: header on top, the page below. Only people holding a Control Panel role
// get past it (FR-002).
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
      { path: 'pillars', element: <PillarPicker /> },
      { path: 'search', element: <SearchPage /> },
      {
        path: 'pillars/:pillarId',
        element: <PillarLayout />,
        children: [
          { index: true, element: <Navigate to="workflow" replace /> },
          { path: 'workflow/*', element: <WorkflowTab /> },
          { path: 'master-data/*', element: <MasterDataTab /> },
          { path: 'audit', element: <AuditTab /> },
        ],
      },
      { path: '*', element: <NotAllowed reason="notFound" /> },
    ],
  },
]);

export default function App() {
  const [platform, setPlatform] = useState(null);
  const [userId, setUserId] = useState(sessionStorage.getItem(SIGNED_IN_USER_KEY));

  // Reads the shared platform data again, e.g. after a change was saved.
  async function reloadPlatform() {
    setPlatform(await loadPlatform());
  }

  useEffect(() => {
    reloadPlatform();
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
  const appState = { ...platform, user, signIn, signOut, reloadPlatform };

  return (
    <AppContext.Provider value={appState}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}
