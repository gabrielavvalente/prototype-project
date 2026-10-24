import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { findById, getLabel } from '../logic/lookups.js';
import Sheet from './Sheet.jsx';

const UNSAVED_WARNING = 'You have unsaved changes in the form. Change anyway? Your changes will be lost.';

function plantOptionLabel(plant) {
  return `${plant.plantTypeIcon} ${plant.name} — ${plant.plantTypeLabel} · ${plant.countryFlag} ${plant.countryName}`;
}

// Who I am and where I am working: business, plant, pillar, switch user (FR-018 to FR-020, FR-040).
export default function AccountSheet({ onClose }) {
  const { user, context, organization, reference, updateSettings, signOut, formDirty, reloadPage } = useApp();
  const navigate = useNavigate();
  const businessIds = [...new Set(user.access.map((entry) => entry.businessId))];
  const plantsInBusiness = user.access
    .filter((entry) => entry.businessId === context.businessId)
    .map((entry) => findById(organization, entry.plantId));

  function confirmLeavingForm() {
    return !formDirty || window.confirm(UNSAVED_WARNING);
  }

  async function changeBusiness(businessId) {
    if (!confirmLeavingForm()) return;
    const firstPlant = user.access.find((entry) => entry.businessId === businessId);
    await updateSettings({ businessId, plantId: firstPlant.plantId, pillarId: null });
    reloadPage();
  }

  async function changePlant(plantId) {
    if (!confirmLeavingForm()) return;
    // Keep the selected pillar only if the user also has it in the new plant.
    const keepPillar = context.pillarId && getPillarIdsForPlant(user, plantId).includes(context.pillarId);
    await updateSettings({ plantId, pillarId: keepPillar ? context.pillarId : null });
  }

  function changePillar() {
    onClose();
    navigate('/entry');
  }

  function switchUser() {
    onClose();
    signOut();
    navigate('/');
  }

  return (
    <Sheet title="Account" onClose={onClose}>
      <div className="account-person">
        <span className="avatar" aria-hidden="true">
          {user.avatar}
        </span>
        <div>
          <strong>{user.name}</strong>
          <div className="field-hint">{user.role}</div>
        </div>
      </div>
      {businessIds.length > 1 && (
        <div className="field">
          <label htmlFor="business-select">Business</label>
          <select id="business-select" value={context.businessId} onChange={(e) => changeBusiness(e.target.value)}>
            {businessIds.map((id) => (
              <option key={id} value={id}>
                {getLabel(organization, id)}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="field">
        <label htmlFor="plant-select">Plant</label>
        <select id="plant-select" value={context.plantId} onChange={(e) => changePlant(e.target.value)}>
          {plantsInBusiness.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plantOptionLabel(plant)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <span className="field-label">Pillar</span>
        <div className="account-row">
          <span>{context.pillarId ? getLabel(reference, context.pillarId) : 'All pillars'}</span>
          <button type="button" className="button" onClick={changePillar}>
            Change pillar
          </button>
        </div>
      </div>
      <button type="button" className="button button--block" onClick={switchUser}>
        Switch user
      </button>
    </Sheet>
  );
}
