import { NavLink, Outlet, useParams } from 'react-router-dom';
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
  const { user, organization, reference } = useApp();
  const pillar = getPillars(reference).find((item) => item.id === pillarId);
  if (!pillar) {
    return <NotAllowed reason="notFound" />;
  }
  const role = getRole(user, pillarId);
  if (!role) {
    return <NotAllowed />;
  }

  return (
    <>
      <div className="context-bar">
        <span className="context-chip">
          <span className={pillarDotClass(pillar.id)} aria-hidden="true" />
          <strong>{pillar.label}</strong>
          <span className={`level-badge level-badge--${role.level}`}>{LEVEL_LABELS[role.level]}</span>
          <span className="context-plants">{describePlants(role, organization)}</span>
        </span>
      </div>
      <nav className="tabs" aria-label={`${pillar.label} sections`}>
        {TABS.map((tab) => (
          <NavLink key={tab.path} to={tab.path} className="tab">
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet context={{ pillar, role }} />
    </>
  );
}
