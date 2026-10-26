import { useEffect, useState } from 'react';
import { Stack, Switch, Text, Title } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { getNotificationSettings, setNotificationSetting } from '../../../../shared/platform/platformData.js';
import { INFORMATION_ALERTS, setByLine, settingFor, WORK_ALERTS } from '../../../../shared/platform/notifications.js';

// My notifications: the work alerts, always on, and a switch per information alert (NT-4, NT-5).
export default function MyNotifications() {
  const { user, users } = useApp();
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'My notifications — Event Reporting';
    getNotificationSettings([user.id]).then(setSettings);
  }, [user.id]);

  async function change(key, on) {
    setMessage('');
    await setNotificationSetting(user, user.id, key, on);
    setSettings(await getNotificationSettings([user.id]));
    setMessage('Saved.');
  }

  return (
    <main className="page page--with-nav notifications-page">
      <Stack gap="xl">
        <Title order={1}>My notifications</Title>
        <section className="notifications-section" aria-labelledby="always-on-title">
          <Title order={2} id="always-on-title">
            Always on
          </Title>
          <Text c="dimmed">These alerts hand you work and cannot be turned off.</Text>
          <ul className="notifications-always">
            {WORK_ALERTS.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        </section>
        <section className="notifications-section" aria-labelledby="information-title">
          <Title order={2} id="information-title">
            Information
          </Title>
          {settings && (
            <Stack gap="md">
              {INFORMATION_ALERTS.map((alert) => {
                const setting = settingFor(settings, user.id, alert.key);
                const line = setByLine(setting, user.id, users);
                return (
                  <div key={alert.key} className="notifications-switch">
                    <Switch
                      label={alert.key}
                      description={alert.hint}
                      checked={setting.on}
                      onChange={(event) => change(alert.key, event.currentTarget.checked)}
                    />
                    {line && (
                      <Text size="sm" c="dimmed" className="notifications-set-by">
                        {line}
                      </Text>
                    )}
                  </div>
                );
              })}
            </Stack>
          )}
          {message && (
            <p className="message message--success" role="status">
              {message}
            </p>
          )}
        </section>
      </Stack>
    </main>
  );
}
