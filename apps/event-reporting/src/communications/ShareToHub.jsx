import { useState } from 'react';
import { Button, Checkbox, Group, Stack } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getMasterData } from '../../../../shared/platform/platformData.js';
import { getPlantName, getPlants, plantFacets } from '../../../../shared/platform/organization.js';
import { saveWorkflowStep } from '../data/db.js';
import { buildPackage, classificationNames, namedParts, namesToHide, reachPlants, sharedPlantIds, shareWarning } from '../logic/sharingHub.js';
import Sheet from '../shell/Sheet.jsx';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';

function Choices({ label, options, value, onChange }) {
  return (
    <Checkbox.Group label={label} value={value} onChange={onChange}>
      <Group gap="md" mt={6}>
        {options.map((option) => (
          <Checkbox key={option.value} value={option.value} label={option.label} />
        ))}
      </Group>
    </Checkbox.Group>
  );
}

// "Who should receive it?": regions, countries, businesses and plants; a live line says which
// plants are reached; the anonymisation gate refuses a Warning naming someone (SH-2 to SH-4).
export default function ShareToHub({ event, onShared, onClose }) {
  const { user, users, organization } = useApp();
  const [criteria, setCriteria] = useState({ regions: [], countries: [], businesses: [], plantIds: [] });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const facets = plantFacets(organization);
  const plantName = getPlantName(organization, event.plantId);
  const reached = reachPlants(organization, criteria, event.plantId);
  const already = sharedPlantIds(event);
  const named = namedParts(event.safetyWarning.content, namesToHide(event, users));
  const set = (key) => (value) => {
    setError('');
    setCriteria((current) => ({ ...current, [key]: value }));
  };
  const noReach = `Choose a reach that includes at least one plant other than ${plantName}.`;

  async function share() {
    if (named.length > 0) {
      setError(`This Safety Warning names someone (${named.join(', ')}) and cannot be shared.`);
      scrollToFirstProblemSoon();
      return;
    }
    if (reached.length === 0) {
      setError(noReach);
      scrollToFirstProblemSoon();
      return;
    }
    setSaving(true);
    try {
      const { values } = await getMasterData();
      const pkg = buildPackage(event, classificationNames(event, values));
      const result = shareWarning(event, { plantIds: reached.map((plant) => plant.id), pkg, userId: user.id, now: new Date().toISOString() });
      const saved = result.plantIds.length ? await saveWorkflowStep(result.event, [], { sharedPlantIds: result.plantIds, actorId: user.id }) : event;
      onShared(saved);
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <Button type="button" className="button button--primary button--block" disabled={saving} onClick={share}>
      Share
    </Button>
  );

  return (
    <Sheet title="Share to Hub" onClose={onClose} footer={footer}>
      <Stack gap="md">
        <p className="field-hint">Who should receive it? A plant must match every region, country and business chosen; the plants chosen are added.</p>
        <Choices label="Regions" options={facets.regions.map((region) => ({ value: region, label: region }))} value={criteria.regions} onChange={set('regions')} />
        <Choices label="Countries" options={facets.countries.map((country) => ({ value: country, label: country }))} value={criteria.countries} onChange={set('countries')} />
        <Choices label="Businesses" options={facets.businesses.map((business) => ({ value: business.id, label: business.name }))} value={criteria.businesses} onChange={set('businesses')} />
        <Choices
          label="Plants"
          options={getPlants(organization)
            .filter((plant) => plant.id !== event.plantId)
            .map((plant) => ({ value: plant.id, label: plant.name }))}
          value={criteria.plantIds}
          onChange={set('plantIds')}
        />
        <p className="share-reach" role="status">
          {reached.length > 0
            ? `Reaches ${reached.length} plant${reached.length === 1 ? '' : 's'}: ${reached.map((plant) => plant.name).join(', ')}`
            : noReach}
          {reached.some((plant) => already.includes(plant.id)) && ' (plants already reached are skipped)'}
        </p>
        {error && (
          <p className="message message--error" role="alert">
            {error}
          </p>
        )}
      </Stack>
    </Sheet>
  );
}
