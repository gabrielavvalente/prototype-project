import { useEffect, useState } from 'react';
import { ActionIcon, Button } from '@mantine/core';
import { useOutletContext } from 'react-router-dom';
import { useApp } from '../AppContext.js';
import { describeRule } from '../../../../shared/platform/notifications.js';
import { getPillarIdsForPlant } from '../../../../shared/platform/organization.js';
import { deleteNotificationRule, getNotificationRules } from '../../../../shared/platform/platformData.js';
import Icon from '../shell/Icon.jsx';
import { getPillars, pillarDotClass } from '../shell/roleText.js';
import RuleForm from './RuleForm.jsx';

// Who else gets "Event submitted": the rules of each pillar the Site Admin sees at the plant (NT-7).
export default function RulesTab() {
  const { plantId, plantName } = useOutletContext();
  const { user, users, organization, reference } = useApp();
  const [rules, setRules] = useState(null);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const pillars = getPillars(reference).filter((pillar) => getPillarIdsForPlant(user, plantId).includes(pillar.id));

  async function load() {
    setRules(await getNotificationRules(plantId));
  }

  useEffect(() => {
    document.title = `Submission rules — Notifications · ${plantName} — Control Panel`;
    load();
  }, [plantId, plantName]);

  async function remove(rule) {
    if (!window.confirm('Delete this rule?')) return;
    await deleteNotificationRule(user, plantId, rule.id);
    setMessage('The rule was deleted.');
    await load();
  }

  async function saved(text) {
    setEditing(null);
    setMessage(text);
    await load();
  }

  if (!rules) {
    return <p className="page">Loading…</p>;
  }

  return (
    <main className="page">
      <h1>Submission rules</h1>
      <p className="field-hint">Who else is told when an event is submitted at {plantName}.</p>
      {message && (
        <p className="message message--success" role="status">
          {message}
        </p>
      )}
      {pillars.map((pillar) => {
        const ofPillar = rules.filter((rule) => rule.pillarId === pillar.id);
        return (
          <section key={pillar.id} className="rules-section" aria-labelledby={`rules-${pillar.id}`}>
            <div className="rules-section-header">
              <h2 id={`rules-${pillar.id}`}>
                <span className={pillarDotClass(pillar.id)} aria-hidden="true" /> {pillar.label}
              </h2>
              <Button
                type="button"
                variant="default"
                leftSection={<Icon name="plus" size={18} />}
                onClick={() => setEditing({ rule: null, pillar })}
              >
                Add rule
              </Button>
            </div>
            {ofPillar.length === 0 ? (
              <p className="field-hint">No rule yet.</p>
            ) : (
              <ul className="rules-list">
                {ofPillar.map((rule) => (
                  <li key={rule.id} className="rules-row">
                    <span>{describeRule(rule, { organization, users })}</span>
                    <span className="rules-actions">
                      <ActionIcon variant="subtle" aria-label="Edit rule" onClick={() => setEditing({ rule, pillar })}>
                        <Icon name="edit" size={18} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" aria-label="Delete rule" onClick={() => remove(rule)}>
                        <Icon name="close" size={18} />
                      </ActionIcon>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
      {editing && (
        <RuleForm plantId={plantId} pillar={editing.pillar} rule={editing.rule} onSaved={saved} onClose={() => setEditing(null)} />
      )}
    </main>
  );
}
