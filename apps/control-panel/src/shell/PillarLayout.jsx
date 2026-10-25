import { Tabs } from '@mantine/core';
import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getRole, LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import NotAllowed from './NotAllowed.jsx';
import { describePlants, getPillars, pillarDotClass } from './roleText.js';

const TABS = [
  { path: 'workflow', label: 'Workflow' },
  { path: 'master-data', label: 'Master data' },
  { path: 'audit', label: 'Audit' },
];

// Every pillar page: which pillar, level and plants the user acts for, then the tabs (FR-002).
// Pages below get the pillar and the user's role through the outlet context.
export default function PillarLayout() {
  const { pillarId } = useParams();
  const location = useLocation();
  const { user, organization, reference } = useApp();
  const pillar = getPillars(reference).find((item) => item.id === pillarId);
  if (!pillar) {
    return <NotAllowed reason="notFound" />;
  }
  const role = getRole(user, pillarId);
  if (!role) {
    return <NotAllowed />;
  }
  const activeTab = location.pathname.includes('/master-data')
    ? 'master-data'
    : location.pathname.endsWith('/audit')
      ? 'audit'
      : 'workflow';

  return (
    <div className="pillar-workspace">
      <div className="context-bar">
        <span className="context-chip">
          <span className={pillarDotClass(pillar.id)} aria-hidden="true" />
          <strong>{pillar.label}</strong>
          <span className={`level-badge level-badge--${role.level}`}>{LEVEL_LABELS[role.level]}</span>
          <span className="context-plants">{describePlants(role, organization)}</span>
        </span>
      </div>
      <Tabs value={activeTab} className="workspace-tabs">
        <Tabs.List aria-label={`${pillar.label} sections`}>
          {TABS.map((tab) => (
            <Tabs.Tab key={tab.path} value={tab.path} component={NavLink} to={tab.path}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Outlet context={{ pillar, role }} />
    </div>
  );
}
