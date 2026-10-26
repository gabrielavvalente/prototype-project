import { Tabs } from '@mantine/core';
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { canManagePlant } from '../../../../shared/platform/notifications.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import NotAllowed from '../shell/NotAllowed.jsx';

const TABS = [
  { path: 'rules', label: 'Submission rules' },
  { path: 'people', label: 'People' },
  { path: 'changes', label: 'Changes' },
];

// A plant's notifications, for its Site Admins only (NT-6). Pages below get the plant through the
// outlet context.
export default function NotificationsPage() {
  const { plantId } = useParams();
  const location = useLocation();
  const { user, organization } = useApp();
  if (!canManagePlant(user, plantId)) {
    return <NotAllowed />;
  }
  const plantName = getPlantName(organization, plantId);
  const activeTab = TABS.find((tab) => location.pathname.includes(`/${tab.path}`))?.path ?? 'rules';

  return (
    <div className="pillar-workspace">
      <div className="context-bar">
        <span className="context-chip">
          <strong>Notifications · {plantName}</strong>
        </span>
      </div>
      <Tabs value={activeTab} className="workspace-tabs">
        <Tabs.List aria-label={`Notifications of ${plantName}`}>
          {TABS.map((tab) => (
            <Tabs.Tab key={tab.path} value={tab.path} component={NavLink} to={tab.path}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Outlet context={{ plantId, plantName }} />
    </div>
  );
}
