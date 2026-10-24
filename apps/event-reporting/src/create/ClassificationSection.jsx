import { useState } from 'react';
import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { getPillarColorClass } from '../logic/display.js';
import { getReferenceList } from '../logic/lookups.js';
import { applySipLevelRule, getRiskQuestionType, isFirstAidRequired } from '../logic/validation.js';
import ChipGroup from './ChipGroup.jsx';
import { YesNoField } from './fields.jsx';

const RISK_QUESTIONS = {
  SIP: {
    label: 'Could this be a SIP?',
    hint: 'Serious Incident Potential: under slightly different circumstances, could this have caused a serious injury or serious harm?',
  },
  CRP: {
    label: 'Could this be a CRP? (Critical Risk Potential)',
    hint: 'Could this have led to a major fire, explosion or loss of the site?',
  },
  SRP: {
    label: 'Could this be a SRP? (Serious Risk Potential)',
    hint: 'Could this have led to serious damage or a long stop of operations?',
  },
};

// Classification: pillar → (family) → level, then the SIP / CRP / SRP question (FR-003, FR-004, FR-039).
export default function ClassificationSection({ event, update, errors, pillarLocked }) {
  const { reference, user } = useApp();
  const allowedPillarIds = getPillarIdsForPlant(user, event.plantId);
  const pillars = getReferenceList(reference, 'pillar').filter((pillar) => allowedPillarIds.includes(pillar.id));
  const families = getReferenceList(reference, 'family').filter((family) => family.pillarId === event.pillarId);
  const family = families.find((item) => item.code === event.familyCode);
  const levels = family ? getReferenceList(reference, 'level').filter((level) => level.familyId === family.id) : [];
  const chosenLevel = levels.find((level) => level.code === event.levelCode);
  const questionType = getRiskQuestionType(event.familyCode, event.levelCode);
  const [levelNotice, setLevelNotice] = useState('');

  function choosePillar(pillarId) {
    const pillarFamilies = getReferenceList(reference, 'family').filter((item) => item.pillarId === pillarId);
    // Each pillar has one family today: it is chosen straight away and its selector stays hidden.
    const onlyFamily = pillarFamilies.length === 1 ? pillarFamilies[0].code : '';
    // People shared with may not see the new pillar, so the list starts again.
    update({ pillarId, familyCode: onlyFamily, levelCode: '', riskQuestion: null, diseaseIds: [], sharedWithIds: [] });
  }

  // Saves a level and risk answer, applying the TF5 + SIP = Yes → TF4 rule (FR-048).
  function saveClassification(levelCode, riskQuestion) {
    const rule = applySipLevelRule(levelCode, riskQuestion);
    setLevelNotice(
      rule.changed
        ? 'A hazardous situation with serious incident potential is reported as a Near Miss: the level was changed from TF5 to TF4.'
        : '',
    );
    update({
      levelCode: rule.levelCode,
      riskQuestion,
      // The first aid treatment only belongs to TF1–TF3 (FR-047).
      ...(isFirstAidRequired(rule.levelCode) ? {} : { firstAidTreatmentId: '' }),
    });
  }

  function chooseLevel(levelCode) {
    const type = getRiskQuestionType(event.familyCode, levelCode);
    // Changing the level clears an answer that belonged to another question (spec Edge Cases).
    const keepAnswer = event.riskQuestion && event.riskQuestion.type === type;
    saveClassification(levelCode, type ? { type, answer: keepAnswer ? event.riskQuestion.answer : null } : null);
  }

  return (
    <>
      {!pillarLocked && (
        <ChipGroup
          id="pillarId"
          label="Pillar"
          required
          value={event.pillarId}
          onChange={choosePillar}
          options={pillars.map((pillar) => ({ value: pillar.id, label: pillar.label, dotClass: getPillarColorClass(pillar.code) }))}
          errors={errors}
        />
      )}
      {event.pillarId && families.length > 1 && (
        <ChipGroup
          id="familyCode"
          label="Family"
          required
          value={event.familyCode}
          onChange={(familyCode) => update({ familyCode, levelCode: '', riskQuestion: null, diseaseIds: [] })}
          options={families.map((item) => ({ value: item.code, label: `${item.code} — ${item.label}` }))}
          errors={errors}
        />
      )}
      {family && (
        <>
          <ChipGroup
            id="levelCode"
            label={event.familyCode === 'OH' ? 'Disease type' : 'Level'}
            required
            value={event.levelCode}
            onChange={chooseLevel}
            options={levels.map((level) => ({
              value: level.code,
              label: event.familyCode === 'OH' ? level.label : level.code,
            }))}
            errors={errors}
          />
          {levelNotice && (
            <p className="message message--warning" role="alert">
              {levelNotice}
            </p>
          )}
          {chosenLevel && (
            <p className="level-description" aria-live="polite">
              <strong>
                {chosenLevel.code} — {chosenLevel.label}
              </strong>
              <span>{chosenLevel.description}</span>
            </p>
          )}
        </>
      )}
      {questionType && (
        <YesNoField
          id="riskQuestion"
          label={RISK_QUESTIONS[questionType].label}
          hint={RISK_QUESTIONS[questionType].hint}
          value={event.riskQuestion ? event.riskQuestion.answer : null}
          onChange={(answer) => saveClassification(event.levelCode, { type: questionType, answer })}
          errors={errors}
        />
      )}
    </>
  );
}
