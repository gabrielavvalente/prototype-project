import { useEffect, useState } from 'react';
import { Switch } from '@mantine/core';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import {
  INFORMATION_ALERTS,
  peopleOfPlant,
  setByLine,
  settingFor,
  WORK_ALERTS,
} from '../../../../shared/platform/notifications.js';
import { getNotificationSettings, setNotificationSetting } from '../../../../shared/platform/platformData.js';
import NotAllowed from '../shell/NotAllowed.jsx';

// One person's notifications, changed by the Site Admin like the person would (NT-5, NT-10).
export default function PersonSettings() {
  const { plantId, plantName } = useOutletContext();
  const { userId } = useParams();
  const { user, users } = useApp();
  const person = peopleOfPlant(users, plantId).find((item) => item.id === userId);
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!person) return;
    document.title = `${person.name} — Notifications · ${plantName} — Control Panel`;
    getNotificationSettings([person.id]).then(setSettings);
  }, [person?.id, plantName]);

  if (!person) {
    return <NotAllowed reason="notFound" />;
  }

  async function change(key, on) {
    setMessage('');
    await setNotificationSetting(user, person.id, key, on, plantId);
    setSettings(await getNotificationSettings([person.id]));
    setMessage('Saved.');
  }

  return (
    <main className="page">
      <Link className="back-link" to={`/notifications/${plantId}/people`}>
        ← People
      </Link>
      <h1>{person.name}</h1>
      <p className="field-hint">{person.role}</p>
      <section className="notifications-section" aria-labelledby="always-on-title">
        <h2 id="always-on-title">Always on</h2>
        <p className="field-hint">These alerts hand work and cannot be turned off.</p>
        <ul className="notifications-always">
          {WORK_ALERTS.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </section>
      <section className="notifications-section" aria-labelledby="information-title">
        <h2 id="information-title">Information</h2>
        {settings &&
          INFORMATION_ALERTS.map((alert) => {
            const setting = settingFor(settings, person.id, alert.key);
            const line = setByLine(setting, person.id, users);
            return (
              <div key={alert.key} className="notifications-switch">
                <Switch
                  label={alert.key}
                  description={alert.hint}
                  checked={setting.on}
                  onChange={(event) => change(alert.key, event.currentTarget.checked)}
                />
                {line && <p className="field-hint notifications-set-by">{line}</p>}
              </div>
            );
          })}
        {message && (
          <p className="message message--success" role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
