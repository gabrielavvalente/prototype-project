import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Avatar, Badge, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { canSeeUser, LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import { PHASE_LABELS } from '../../../../shared/platform/workflow.js';
import Icon from '../shell/Icon.jsx';
import PillarTag from '../shell/PillarTag.jsx';
import { describePlants, pillarLabel } from '../shell/text.js';

function DetailSection({ title, description, children, className = '' }) {
  return (
    <Paper className={`detail-section ${className}`} p="lg" radius="md" withBorder>
      <Stack gap="md">
        <div>
          <Text fw={600} size="lg">
            {title}
          </Text>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        {children}
      </Stack>
    </Paper>
  );
}

function EmptyMessage({ children }) {
  return (
    <Text className="detail-empty" size="sm" c="dimmed">
      {children}
    </Text>
  );
}

export default function UserDetail({ userId: selectedUserId, backTo = '/users' }) {
  const routeParams = useParams();
  const userId = selectedUserId ?? routeParams.userId;
  const { user: viewer, users, organization, reference, workflowSettings } = useApp();
  const person = users.find((item) => item.id === userId);
  const allowed = person && canSeeUser(viewer, person);

  useEffect(() => {
    document.title = allowed
      ? `${person.name} — User Management`
      : userId
        ? `${person ? 'Not allowed' : 'Not found'} — User Management`
        : 'Users — User Management';
  }, [allowed, person, userId]);

  const reviewGroups = allowed
    ? workflowSettings.filter((setting) => setting.reviewerIds.includes(person.id))
    : [];

  return (
    <Paper className="user-detail-pane" radius="md" withBorder>
      <Group justify="space-between" className="detail-pane-heading" p="md">
        <Text fw={600}>User details</Text>
        <Button
          component={Link}
          to={backTo}
          variant="subtle"
          color="dark"
          leftSection={<Icon name="back" size={17} />}
          className="detail-back-link"
        >
          All users
        </Button>
      </Group>

      {!userId ? (
        <Stack className="detail-placeholder" align="center" justify="center" gap="xs" p="xl">
          <Text fw={600}>Select a user</Text>
          <Text size="sm" c="dimmed" ta="center">
            Choose someone from the directory to review their access details.
          </Text>
        </Stack>
      ) : !person || !allowed ? (
        <Stack gap="md" p="lg">
          <Alert color={!person ? 'blue' : 'yellow'} variant="light">
            {!person ? 'This user does not exist.' : "You don't have access to this user."}
          </Alert>
        </Stack>
      ) : (
        <Stack className="user-detail-content" gap="lg" p="lg">
        <Paper className="person-banner" p="xl" radius="md" withBorder>
          <Group align="center" gap="lg" wrap="nowrap">
            <Avatar color="blue" radius="xl" size={76}>
              {person.avatar}
            </Avatar>
            <div>
              <Text className="eyebrow">USER ACCESS PROFILE</Text>
              <Title order={1}>{person.name}</Title>
              <Text c="dimmed" mt={4}>
                {person.role ? `Event role: ${person.role}` : 'No event role · Control Panel only'}
              </Text>
            </div>
            <Badge className="read-only-badge" variant="light" color="blue" size="lg" ml="auto">
              Read only
            </Badge>
          </Group>
        </Paper>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" className="detail-grid">
          <DetailSection title="Event access" description="Plants and pillars available in event reporting">
            {person.access.length === 0 ? (
              <EmptyMessage>Cannot report or see events.</EmptyMessage>
            ) : (
              <Stack gap="xs">
                {person.access.map((entry) => (
                  <Paper key={entry.plantId} className="detail-row" p="md" radius="sm">
                    <Group justify="space-between" align="start" gap="md">
                      <Text fw={600}>{getPlantName(organization, entry.plantId)}</Text>
                      <Group gap={6} justify="end">
                        {entry.pillarIds.map((id) => (
                          <PillarTag key={id} pillarId={id}>
                            {pillarLabel(reference, id)}
                          </PillarTag>
                        ))}
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </DetailSection>

          <DetailSection title="Control Panel roles" description="Administrative scope by pillar">
            {person.controlPanelRoles.length === 0 ? (
              <EmptyMessage>No Control Panel role.</EmptyMessage>
            ) : (
              <Stack gap="xs">
                {person.controlPanelRoles.map((role) => (
                  <Paper key={role.pillarId} className="detail-row" p="md" radius="sm">
                    <Group justify="space-between" align="start" gap="md">
                      <PillarTag pillarId={role.pillarId}>{pillarLabel(reference, role.pillarId)}</PillarTag>
                      <Stack gap={6} align="flex-end">
                        <Badge
                          color={role.level === 'central' ? 'dark' : role.level === 'cluster' ? 'teal' : 'gray'}
                          variant={role.level === 'central' ? 'filled' : 'light'}
                          tt="none"
                        >
                          {LEVEL_LABELS[role.level]}
                        </Badge>
                        <Text size="sm" c="dimmed" ta="right">
                          {describePlants(role.plantIds, organization, role.level)}
                        </Text>
                        {role.fromSiteAdmin && (
                          <Text size="xs" c="dimmed" ta="right">
                            From the event role Site Admin
                          </Text>
                        )}
                      </Stack>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </DetailSection>

          <DetailSection
            title="Review groups"
            description="Workflow stages where this person is listed as a reviewer"
            className="review-groups-section"
          >
            {reviewGroups.length === 0 ? (
              <EmptyMessage>Not a reviewer in any workflow setting.</EmptyMessage>
            ) : (
              <Stack gap="xs">
                {reviewGroups.map((setting) => (
                  <Paper key={setting.id} className="detail-row" p="md" radius="sm">
                    <Group justify="space-between" align="start" gap="md">
                      <div>
                        <Group gap={8}>
                          <PillarTag pillarId={setting.pillarId}>{pillarLabel(reference, setting.pillarId)}</PillarTag>
                          <Text fw={600}>{setting.levelCode}</Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                          {/* A reviewers choice is for the Review phase (013 WF-6a). */}{PHASE_LABELS.review}
                        </Text>
                      </div>
                      <Text size="sm" c="dimmed" ta="right">
                        Set at {LEVEL_LABELS[setting.scopeLevel]} for{' '}
                        {setting.scopeLevel === 'central'
                          ? 'all plants'
                          : describePlants(setting.plantIds, organization, setting.scopeLevel)}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </DetailSection>
        </SimpleGrid>
        </Stack>
      )}
    </Paper>
  );
}
