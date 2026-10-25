import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getPlantName, getPlants } from '../../../../shared/platform/organization.js';
import { canSeeUser, LEVEL_LABELS } from '../../../../shared/platform/permissions.js';
import { eventPillarIds, eventPlantIds, getPillars, pillarCode, pillarColorKey, roleBadge } from '../shell/text.js';
import Icon from '../shell/Icon.jsx';
import PillarTag from '../shell/PillarTag.jsx';
import UserDetail from './UserDetail.jsx';

const EVENT_ROLES = ['User', 'Manager', 'Site Admin'];

function linkedPlantIds(user, allPlantIds) {
  const rolePlants = user.controlPanelRoles.flatMap((role) =>
    role.level === 'central' ? allPlantIds : role.plantIds,
  );
  return new Set([...eventPlantIds(user), ...rolePlants]);
}

function linkedPillarIds(user) {
  return new Set([...eventPillarIds(user), ...user.controlPanelRoles.map((role) => role.pillarId)]);
}

function hasRole(user, role) {
  if (role.startsWith('cp-')) {
    return user.controlPanelRoles.some((item) => item.level === role.slice(3));
  }
  return user.role === role;
}

function roleBadgeColor(level) {
  return level === 'central' ? 'dark' : level === 'cluster' ? 'teal' : 'gray';
}

export default function UsersList() {
  const { user: viewer, users, organization, reference } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userId } = useParams();
  const location = useLocation();
  const query = searchParams.get('q') || '';
  const [plantId, setPlantId] = useState('');
  const [pillarId, setPillarId] = useState('');
  const [role, setRole] = useState('');
  const plants = getPlants(organization);
  const allPlantIds = plants.map((plant) => plant.id);

  useEffect(() => {
    document.title = 'Users — User Management';
  }, []);

  const visible = users
    .filter((person) => canSeeUser(viewer, person))
    .filter((person) => person.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter((person) => !plantId || linkedPlantIds(person, allPlantIds).has(plantId))
    .filter((person) => !pillarId || linkedPillarIds(person).has(pillarId))
    .filter((person) => !role || hasRole(person, role))
    .sort((a, b) => a.name.localeCompare(b.name));

  const roleOptions = [
    { group: 'Event role', items: EVENT_ROLES.map((item) => ({ value: item, label: item })) },
    {
      group: 'Control Panel',
      items: Object.entries(LEVEL_LABELS).map(([level, label]) => ({
        value: `cp-${level}`,
        label,
      })),
    },
  ];
  const hasFilters = Boolean(query || plantId || pillarId || role);

  return (
    <main className="page">
      <Stack gap="xl">
        <Group justify="space-between" align="end" className="page-heading">
          <div>
            <Text className="eyebrow">ACCESS DIRECTORY</Text>
            <Title order={1}>Users</Title>
            <Text c="dimmed" mt={6}>
              Review event access, plants, pillars and Control Panel roles.
            </Text>
          </div>
          <Badge size="lg" variant="light" color="blue" radius="sm">
            Read only
          </Badge>
        </Group>

        <Paper className="filter-panel" p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <div>
              <Text fw={600}>Find users</Text>
              <Text size="sm" c="dimmed">
                Narrow the directory using name or access details.
              </Text>
            </div>
            {hasFilters && (
              <Button
                variant="subtle"
                size="sm"
                onClick={() => {
                  setSearchParams({}, { replace: true });
                  setPlantId('');
                  setPillarId('');
                  setRole('');
                }}
              >
                Clear filters
              </Button>
            )}
          </Group>
          <div className="filter-row">
            <TextInput
              label="Search by name"
              placeholder="e.g. Felix Tanaka"
              leftSection={<Icon name="search" size={17} />}
              value={query}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setSearchParams(value ? { q: value } : {}, { replace: true });
              }}
            />
            <Select
              label="Plant"
              placeholder="All plants"
              data={plants.map((plant) => ({ value: plant.id, label: plant.name }))}
              value={plantId || null}
              onChange={(value) => setPlantId(value ?? '')}
              clearable
              searchable
            />
            <Select
              label="Pillar"
              placeholder="All pillars"
              data={getPillars(reference).map((pillar) => ({ value: pillar.id, label: pillar.label }))}
              value={pillarId || null}
              onChange={(value) => setPillarId(value ?? '')}
              clearable
            />
            <Select
              label="Role"
              placeholder="All roles"
              data={roleOptions}
              value={role || null}
              onChange={(value) => setRole(value ?? '')}
              clearable
            />
          </div>
        </Paper>

        <div className={`directory-layout${userId ? ' directory-layout--selected' : ''}`}>
          <Paper className="directory-panel" radius="md" withBorder>
            <Group justify="space-between" p="lg" className="directory-panel-heading">
              <div>
                <Text fw={600}>People</Text>
                <Text size="sm" c="dimmed">
                  Users within your Control Panel access perimeter
                </Text>
              </div>
              <Text className="result-count" role="status">
                <strong>{visible.length}</strong> {visible.length === 1 ? 'user' : 'users'}
              </Text>
            </Group>
            <Table.ScrollContainer minWidth={620}>
              <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md" className="users-table">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Event role</Table.Th>
                    <Table.Th>Plants</Table.Th>
                    <Table.Th>Pillars</Table.Th>
                    <Table.Th>Control Panel roles</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {visible.map((person) => (
                    <Table.Tr
                      key={person.id}
                      className={person.id === userId ? 'user-row user-row--selected' : 'user-row'}
                    >
                      <Table.Td>
                        <Link
                          to={`/users/${person.id}${location.search}`}
                          className="user-link"
                          aria-current={person.id === userId ? 'page' : undefined}
                        >
                          <Avatar color="blue" radius="xl" size={36} aria-hidden="true">
                            {person.avatar}
                          </Avatar>
                          <Text fw={600} inherit>
                            {person.name}
                          </Text>
                        </Link>
                      </Table.Td>
                      <Table.Td>
                        {person.role ? (
                          <Badge color="gray" variant="light" tt="none" fw={500}>
                            {person.role}
                          </Badge>
                        ) : (
                          <Text c="dimmed">—</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {eventPlantIds(person).map((id) => getPlantName(organization, id)).join(', ') || '—'}
                      </Table.Td>
                      <Table.Td>
                        {eventPillarIds(person).length === 0 ? (
                          <Text c="dimmed">—</Text>
                        ) : (
                          <Group gap={6} wrap="wrap">
                            {eventPillarIds(person).map((id) => (
                              <PillarTag key={id} pillarId={id}>
                                {pillarCode(reference, id)}
                              </PillarTag>
                            ))}
                          </Group>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={6} wrap="wrap">
                          {person.controlPanelRoles.length === 0 ? (
                            <Text c="dimmed">—</Text>
                          ) : (
                            person.controlPanelRoles.map((item) => (
                              <Badge
                                key={item.pillarId}
                                color={roleBadgeColor(item.level)}
                                variant={item.level === 'central' ? 'filled' : 'light'}
                                tt="none"
                                fw={600}
                                leftSection={
                                  <span className={`pillar-dot pillar-dot--${pillarColorKey(item.pillarId)}`} aria-hidden="true" />
                                }
                                title={item.fromSiteAdmin ? 'From the event role Site Admin' : undefined}
                              >
                                {roleBadge(item, reference)}
                              </Badge>
                            ))
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {visible.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <div className="empty-state">
                          <Text fw={600}>No users match these filters</Text>
                          <Text size="sm" c="dimmed">
                            Try a different name or clear one or more filters.
                          </Text>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
          <div className="user-detail-column">
            <UserDetail userId={userId} backTo={{ pathname: '/users', search: location.search }} />
          </div>
        </div>
      </Stack>
    </main>
  );
}
