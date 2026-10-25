import { useEffect } from 'react';
import { Badge, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { groupsVisibleTo } from '../../../../shared/platform/groups.js';
import { getPlantName } from '../../../../shared/platform/organization.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import PageTabs from '../shell/PageTabs.jsx';
import PillarTag from '../shell/PillarTag.jsx';
import { pillarCode } from '../shell/text.js';

// The investigation groups a reviewer can designate for a root cause analysis (feature 004):
// read only, within the viewer's perimeter like the users.
export default function GroupsList() {
  const { user: viewer, users, organization, reference } = useApp();
  const groups = groupsVisibleTo(viewer, investigationGroups);
  const personOf = (id) => users.find((person) => person.id === id);

  useEffect(() => {
    document.title = 'Groups — User Management';
  }, []);

  return (
    <main className="page">
      <Stack gap="xl">
        <Group justify="space-between" align="end" className="page-heading">
          <div>
            <Text className="eyebrow">ACCESS DIRECTORY</Text>
            <Title order={1}>Groups</Title>
            <Text c="dimmed" mt={6}>
              Investigation groups a reviewer can assign to a root cause analysis.
            </Text>
          </div>
          <Badge size="lg" variant="light" color="blue" radius="sm">
            Read only
          </Badge>
        </Group>
        <PageTabs />

        <Paper radius="md" withBorder>
          <Group justify="space-between" p="lg">
            <Text fw={600}>Investigation groups</Text>
            <Text className="result-count" role="status">
              <strong>{groups.length}</strong> {groups.length === 1 ? 'group' : 'groups'}
            </Text>
          </Group>
          <Table.ScrollContainer minWidth={620}>
            <Table verticalSpacing="md" horizontalSpacing="md" className="users-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Pillars</Table.Th>
                  <Table.Th>Plants</Table.Th>
                  <Table.Th>Members</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {groups.map((group) => (
                  <Table.Tr key={group.id}>
                    <Table.Td>
                      <Text fw={600}>{group.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        {group.pillarIds.map((id) => (
                          <PillarTag key={id} pillarId={id}>
                            {pillarCode(reference, id)}
                          </PillarTag>
                        ))}
                      </Group>
                    </Table.Td>
                    <Table.Td>{group.plantIds.map((id) => getPlantName(organization, id)).join(', ')}</Table.Td>
                    <Table.Td>
                      <ul className="member-list">
                        {group.memberIds.map((id) => (
                          <li key={id}>
                            {personOf(id)?.name ?? id}
                            {personOf(id)?.role && <span className="member-role"> · {personOf(id).role}</span>}
                          </li>
                        ))}
                      </ul>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {groups.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed">No group covers your plants.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Stack>
    </main>
  );
}
