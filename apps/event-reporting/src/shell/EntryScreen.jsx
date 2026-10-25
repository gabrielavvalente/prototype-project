import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { getPillarColorClass } from '../logic/display.js';
import { getLabel, getReferenceList } from '../logic/lookups.js';
import Icon from './Icon.jsx';

// The pillar is an optional entry point (FR-037, Clarification 2026-10-24).
export default function EntryScreen() {
  const { user, context, reference, organization, enter } = useApp();
  const navigate = useNavigate();
  const allowedPillarIds = getPillarIdsForPlant(user, context.plantId);
  const pillars = getReferenceList(reference, 'pillar').filter((pillar) => allowedPillarIds.includes(pillar.id));

  useEffect(() => {
    document.title = 'Choose where to start — Event Reporting';
  }, []);

  async function choose(pillarId) {
    await enter(pillarId);
    navigate('/events');
  }

  return (
    <main className="page page--with-nav entry-page">
      <Stack className="entry-content" gap="xl">
        <Stack gap="xs" className="entry-heading">
          <Text className="entry-eyebrow" size="sm" fw={600}>
            EVENT REPORTING
          </Text>
          <Title order={1}>Where would you like to start, {user.name.split(' ')[0]}?</Title>
          <Text c="dimmed" size="lg">
            Choose a pillar to see events for {getLabel(organization, context.plantId)}.
          </Text>
        </Stack>

        <Stack component="section" gap="md" aria-labelledby="pillars-title">
          <Title id="pillars-title" order={2} size="h3" mb={0}>
            Your pillars
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {pillars.map((pillar) => (
              <Card
                key={pillar.id}
                component="button"
                type="button"
                withBorder
                radius="md"
                padding="md"
                className="entry-pillar-card"
                aria-pressed={context.pillarId === pillar.id}
                onClick={() => choose(pillar.id)}
              >
                <Stack justify="space-between" gap="lg" className="entry-pillar-content">
                  <Group justify="space-between" wrap="nowrap">
                    <span
                      className={`pillar-dot pillar-dot--large ${getPillarColorClass(pillar.code)}`}
                      aria-hidden="true"
                    />
                    <Icon name="chevronRight" />
                  </Group>
                  <Text fw={600} ta="left" size="lg">
                    {pillar.label}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>

        <Group className="entry-all-option" justify="space-between" align="center" wrap="wrap">
          <Stack gap={2}>
            <Text fw={600}>Need to see everything?</Text>
            <Text size="sm" c="dimmed">
              Browse events across all pillars you can access.
            </Text>
          </Stack>
          <Button type="button" variant="default" onClick={() => choose(null)}>
            Browse all pillars
          </Button>
        </Group>
      </Stack>
    </main>
  );
}
