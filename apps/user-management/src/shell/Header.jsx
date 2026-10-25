import { useEffect, useState } from 'react';
import { ActionIcon, Avatar, Badge, Box, Button, Group, Popover, Stack, Text, TextInput } from '@mantine/core';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { getNotifications, markNotificationsRead } from '../../../../shared/platform/platformData.js';
import Icon from './Icon.jsx';
import ModuleHeader from './ModuleHeader.jsx';

export default function Header() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      getNotifications(user.id).then(setNotifications);
    } else {
      setNotifications([]);
    }
  }, [user?.id, location.pathname]);

  function switchUser() {
    if (!user) return;
    signOut();
    navigate('/');
  }

  function handleSearch(event) {
    event.preventDefault();
    if (user && query.trim()) {
      navigate(`/users?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function closeNotifications() {
    setNotificationsOpen(false);
    if (user) {
      markNotificationsRead(user.id).then(() => getNotifications(user.id).then(setNotifications));
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <ModuleHeader
        moduleName="User Management"
        moduleHref={`${import.meta.env.BASE_URL}#/users`}
        search={
          <form role="search" onSubmit={handleSearch}>
            <TextInput
              type="search"
              aria-label="Search users"
              placeholder="Search users by name"
              leftSection={<Icon name="search" size={18} />}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              disabled={!user}
            />
          </form>
        }
      >
        <Popover
          opened={notificationsOpen}
          onChange={(opened) => {
            if (!opened && notificationsOpen) closeNotifications();
            else setNotificationsOpen(opened);
          }}
          position="bottom-end"
          width={360}
          shadow="md"
        >
          <Popover.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              disabled={!user}
              onClick={() => setNotificationsOpen((opened) => !opened)}
            >
              <Icon name="bell" size={22} />
              {unreadCount > 0 && <Badge className="header-alert-count" size="xs" circle>{unreadCount}</Badge>}
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Notifications</Text>
              <Button variant="subtle" size="compact-xs" onClick={closeNotifications}>Close</Button>
            </Group>
            {notifications.length === 0 ? (
              <Text size="sm" c="dimmed">No notifications.</Text>
            ) : (
              <Stack gap="xs" mah={360} style={{ overflowY: 'auto' }}>
                {notifications.map((item) => (
                  <Box key={item.id} className={`directory-notification${item.read ? '' : ' directory-notification--unread'}`}>
                    <Text size="sm">{item.text}</Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {new Date(item.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </Text>
                  </Box>
                ))}
              </Stack>
            )}
          </Popover.Dropdown>
        </Popover>
        <Group gap="xs" wrap="nowrap" className="module-header-user">
          <Avatar color={user ? 'blue' : 'gray'} radius="xl" size={38} aria-hidden="true">
            {user?.avatar || '?'}
          </Avatar>
          {user && (
            <>
              <Box className="signed-in-user">
                <Text size="sm" fw={600} lh={1.3}>{user.name}</Text>
                <Text size="xs" c="dimmed">Signed in</Text>
              </Box>
              <Button variant="default" onClick={switchUser}>Switch user</Button>
            </>
          )}
        </Group>
    </ModuleHeader>
  );
}
