import { useState } from 'react';
import { Button } from '@mantine/core';
import { useApp } from '../AppContext.js';
import { investigationGroups } from '../../../../shared/platform/sampleData.js';
import { scrollToFirstProblemSoon } from '../../../../shared/ui/scrollToProblem.js';
import { saveWorkflowStep } from '../data/db.js';
import { analysisStartedCandidates } from '../logic/notifications.js';
import { startAnalysis, startedAnalystIds, validateStart } from '../logic/optionalAnalysis.js';
import { AssigneesField } from './ReviewStep.jsx';

// The Optional Root cause analysis step: its reviewer and the plant's Managers and Site Admins
// designate who performs it and start it, any time — a Closed event reopens (RCA-18).
export default function OptionalAnalysisStart({ event, onSaved }) {
  const { user } = useApp();
  const [draft, setDraft] = useState({ rcaAssignees: { userIds: [], groupIds: [] } });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function start() {
    const found = validateStart(draft.rcaAssignees);
    setError(found);
    if (found) {
      scrollToFirstProblemSoon();
      return;
    }
    setSaving(true);
    try {
      const started = startAnalysis(event, draft.rcaAssignees, user, new Date().toISOString());
      onSaved(await saveWorkflowStep(started, analysisStartedCandidates(startedAnalystIds(started, investigationGroups))));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="optional-analysis">
      <p>This analysis is not required. You can still start it for this event.</p>
      <AssigneesField
        event={event}
        review={draft}
        set={(changes) => {
          setError('');
          setDraft((current) => ({ ...current, ...changes }));
        }}
        errorsFor={(field) => (field === 'rcaAssignees' && error ? [{ field, message: error }] : [])}
      />
      <Button type="button" disabled={saving} onClick={start}>
        Start root cause analysis
      </Button>
    </div>
  );
}
