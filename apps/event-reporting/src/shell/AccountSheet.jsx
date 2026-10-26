import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Select, Stack, Text } from '@mantine/core';
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

  function openNotifications() {
    onClose();
    navigate('/notifications');
  }

  function switchUser() {
    onClose();
    signOut();
    navigate('/');
  }

  return (
    <Sheet title="Account" onClose={onClose}>
      <div className="account-person">
        <Avatar radius="xl" color="blue">{user.avatar}</Avatar>
        <Stack gap={2}>
          <Text fw={600}>{user.name}</Text>
          <Text size="sm" c="dimmed">{user.role}</Text>
        </Stack>
      </div>
      {businessIds.length > 1 && (
        <div className="field">
          <Select label="Business" id="business-select" value={context.businessId} data={businessIds.map((id) => ({ value: id, label: getLabel(organization, id) }))} onChange={(value) => value && changeBusiness(value)} />
        </div>
      )}
      <div className="field">
        <Select label="Plant" id="plant-select" value={context.plantId} data={plantsInBusiness.map((plant) => ({ value: plant.id, label: plantOptionLabel(plant) }))} onChange={(value) => value && changePlant(value)} />
      </div>
      <div className="field">
        <span className="field-label">Pillar</span>
        <div className="account-row">
          <Text>{context.pillarId ? getLabel(reference, context.pillarId) : 'All pillars'}</Text>
          <Button type="button" variant="default" onClick={changePillar}>
            Change pillar
          </Button>
        </div>
      </div>
      <Button type="button" variant="default" fullWidth onClick={openNotifications}>
        My notifications
      </Button>
      <Button type="button" variant="light" fullWidth onClick={switchUser}>
        Switch user
      </Button>
    </Sheet>
  );
}
