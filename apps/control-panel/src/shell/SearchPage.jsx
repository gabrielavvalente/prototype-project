import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { listsForPillar, visibleValues } from '../../../../shared/platform/masterData.js';
import { getMasterData } from '../../../../shared/platform/platformData.js';
import { getRole } from '../../../../shared/platform/permissions.js';
import { getPillars } from './roleText.js';
import Icon from './Icon.jsx';

const MAX_RESULTS = 60;

export default function SearchPage() {
  const { user, reference } = useApp();
  const [searchParams] = useSearchParams();
  const [masterData, setMasterData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const query = (searchParams.get('q') || '').trim();
  const normalizedQuery = query.toLocaleLowerCase();

  useEffect(() => {
    document.title = 'Search — Control Panel';
    getMasterData()
      .then(setMasterData)
      .catch((error) => setLoadError(error.message));
  }, []);

  const matches = [];
  if (normalizedQuery) {
    const pillars = getPillars(reference).filter((pillar) => getRole(user, pillar.id));

    pillars.forEach((pillar) => {
      if (pillar.label.toLocaleLowerCase().includes(normalizedQuery)) {
        matches.push({
          id: `pillar-${pillar.id}`,
          label: pillar.label,
          detail: 'Pillar',
          href: `/pillars/${pillar.id}/workflow`,
        });
      }

      listsForPillar(pillar.id).forEach((list) => {
        const listHref = `/pillars/${pillar.id}/master-data/${list.id}`;
        if (list.label.toLocaleLowerCase().includes(normalizedQuery)) {
          matches.push({
            id: `list-${pillar.id}-${list.id}`,
            label: list.label,
            detail: `${pillar.label} · Master data list`,
            href: listHref,
          });
        }

        if (masterData) {
          visibleValues(user, list, masterData.values)
            .filter((value) => `${value.code || ''} ${value.name}`.toLocaleLowerCase().includes(normalizedQuery))
            .forEach((value) => {
              matches.push({
                id: `value-${pillar.id}-${list.id}-${value.id}`,
                label: value.name,
                detail: `${pillar.label} · ${list.label}${value.code ? ` · ${value.code}` : ''}`,
                href: `${listHref}?q=${encodeURIComponent(query)}`,
              });
            });
        }
      });
    });
  }
  const shown = matches.slice(0, MAX_RESULTS);

  return (
    <main className="page page--wide">
      <Stack gap="lg">
        <div>
          <Text className="section-label">CONTROL PANEL</Text>
          <Title order={1}>Search</Title>
          <Text c="dimmed" mt="xs">
            {query ? `Results for “${query}”` : 'Search pillars, master data lists and values.'}
          </Text>
        </div>
        {!query && (
          <Text c="dimmed">
            Enter a term in the search field above to find settings and master data you can access.
          </Text>
        )}
        {loadError && (
          <Alert color="red" title="Search could not load all master data">
            {loadError}
          </Alert>
        )}
        {query && (
          <section aria-live="polite">
            <Text fw={600} mb="sm">
              {shown.length === 0
                ? masterData
                  ? 'No matching Control Panel items'
                  : 'Loading master data…'
                : `${shown.length}${matches.length > MAX_RESULTS ? '+' : ''} matching ${shown.length === 1 ? 'item' : 'items'}`}
            </Text>
            <Stack gap="xs">
              {shown.map((item) => (
                <Card
                  key={item.id}
                  component={Link}
                  to={item.href}
                  withBorder
                  padding="md"
                  radius="md"
                  className="module-search-result"
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2}>
                      <Text fw={600}>{item.label}</Text>
                      <Text size="sm" c="dimmed">{item.detail}</Text>
                    </Stack>
                    <Icon name="chevronRight" size={18} />
                  </Group>
                </Card>
              ))}
            </Stack>
          </section>
        )}
      </Stack>
    </main>
  );
}
