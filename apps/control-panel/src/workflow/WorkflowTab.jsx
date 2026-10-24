import { useCallback, useEffect, useState } from 'react';
import { NavLink, useOutletContext, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getWorkflowSettings } from '../../../../shared/platform/platformData.js';
import NotAllowed from '../shell/NotAllowed.jsx';
import ComparePlants from './ComparePlants.jsx';
import ResultGrid from './ResultGrid.jsx';
import SettingsGrid from './SettingsGrid.jsx';
import { getPillarLevels } from './workflowText.js';

const VIEWS = {
  '': { title: 'Workflow', label: 'Settings' },
  result: { title: 'Result per plant', label: 'Result per plant' },
  compare: { title: 'Compare plants', label: 'Compare plants' },
};

// Workflow tab: Settings, Result per plant and, for Central and Cluster, Compare plants (FR-011,
// FR-025). Settings are read from the shared platform data and read again after each save.
export default function WorkflowTab() {
  const { pillar, role } = useOutletContext();
  const { reference } = useApp();
  const view = useParams()['*'] || '';
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState('');
  const levels = getPillarLevels(reference, pillar.id);
  const canCompare = role.level !== 'local';
  // Absolute links: relative ones would resolve below the current view.
  const base = `/pillars/${pillar.id}/workflow`;

  const reload = useCallback(() => getWorkflowSettings(pillar.id).then(setSettings), [pillar.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const allowed = Boolean(VIEWS[view]) && (view !== 'compare' || canCompare);

  useEffect(() => {
    if (allowed) {
      document.title = `${VIEWS[view].title} — ${pillar.label} — Control Panel`;
    }
  }, [allowed, view, pillar.label]);

  if (!VIEWS[view]) {
    return <NotAllowed reason="notFound" />;
  }
  if (view === 'compare' && !canCompare) {
    return <NotAllowed />;
  }

  async function handleSaved(message) {
    await reload();
    setSaved(message);
  }

  const viewProps = { pillar, role, levels, settings };

  return (
    <main className="page">
      <h1>{VIEWS[view].title}</h1>
      <nav className="segmented" aria-label="Workflow views">
        <NavLink to={base} end className="segmented-item">
          Settings
        </NavLink>
        <NavLink to={`${base}/result`} className="segmented-item">
          Result per plant
        </NavLink>
        {canCompare && (
          <NavLink to={`${base}/compare`} className="segmented-item">
            Compare plants
          </NavLink>
        )}
      </nav>
      {view === '' && (
        <p className="field-hint">
          Make a phase Required for your plants. Optional phases are skipped. Changes apply to new events
          only.
        </p>
      )}
      {saved && view === '' && (
        <p className="message message--success" role="status">
          {saved}
        </p>
      )}
      {!settings && <p>Loading…</p>}
      {settings && view === '' && <SettingsGrid {...viewProps} onSaved={handleSaved} />}
      {settings && view === 'result' && <ResultGrid {...viewProps} />}
      {settings && view === 'compare' && <ComparePlants {...viewProps} />}
    </main>
  );
}
