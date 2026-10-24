import { useApp } from '../AppContext.js';
import { getPillarIdsForPlant } from '../logic/access.js';
import { getPillarColorClass } from '../logic/display.js';
import { getReferenceList } from '../logic/lookups.js';
import { SeverityDots } from '../events/EventCard.jsx';
import ChipGroup from './ChipGroup.jsx';
import { getRiskQuestionType } from '../logic/validation.js';
import { FieldError, YesNoField } from './fields.jsx';

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

function ChoiceCards({ legend, items, selectedId, onSelect, errors, field }) {
  return (
    <fieldset className="field">
      <legend className="field-label required">{legend}</legend>
      <ul className="card-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="button choice-card"
              aria-pressed={item.id === selectedId}
              onClick={() => onSelect(item)}
            >
              <span className="choice-card-title">
                <strong>{item.title}</strong>
                <SeverityDots levelCode={item.id} />
              </span>
              {item.description && <small>{item.description}</small>}
            </button>
          </li>
        ))}
      </ul>
      <FieldError errors={errors} field={field} />
    </fieldset>
  );
}

// Classification: pillar → family → level, then the SIP / CRP / SRP question (FR-003, FR-004).
export default function ClassificationSection({ event, update, errors, pillarLocked }) {
  const { reference, user } = useApp();
  const allowedPillarIds = getPillarIdsForPlant(user, event.plantId);
  const pillars = getReferenceList(reference, 'pillar').filter((pillar) => allowedPillarIds.includes(pillar.id));
  const families = getReferenceList(reference, 'family').filter((family) => family.pillarId === event.pillarId);
  const family = families.find((item) => item.code === event.familyCode);
  const levels = family ? getReferenceList(reference, 'level').filter((level) => level.familyId === family.id) : [];
  const questionType = getRiskQuestionType(event.familyCode, event.levelCode);

  function choosePillar(pillar) {
    const pillarFamilies = getReferenceList(reference, 'family').filter((item) => item.pillarId === pillar.id);
    // Each pillar has one family today, so choose it straight away to save a tap.
    const onlyFamily = pillarFamilies.length === 1 ? pillarFamilies[0].code : '';
    update({ pillarId: pillar.id, familyCode: onlyFamily, levelCode: '', riskQuestion: null, diseaseIds: [] });
  }

  function chooseFamily(item) {
    update({ familyCode: item.code, levelCode: '', riskQuestion: null, diseaseIds: [] });
  }

  function chooseLevel(level) {
    const type = getRiskQuestionType(event.familyCode, level.code);
    // Changing the level clears an answer that belonged to another question (spec Edge Cases).
    const keepAnswer = event.riskQuestion && event.riskQuestion.type === type;
    update({
      levelCode: level.code,
      riskQuestion: type ? { type, answer: keepAnswer ? event.riskQuestion.answer : null } : null,
    });
  }

  return (
    <>
      {!pillarLocked && (
        <ChipGroup
          id="pillarId"
          label="Pillar"
          required
          value={event.pillarId}
          onChange={(pillarId) => choosePillar(pillars.find((pillar) => pillar.id === pillarId))}
          options={pillars.map((pillar) => ({ value: pillar.id, label: pillar.label, dotClass: getPillarColorClass(pillar.code) }))}
          errors={errors}
        />
      )}
      {event.pillarId && (
        <ChipGroup
          id="familyCode"
          label="Family"
          required
          value={event.familyCode}
          onChange={(code) => chooseFamily(families.find((item) => item.code === code))}
          options={families.map((item) => ({ value: item.code, label: `${item.code} — ${item.label}` }))}
          errors={errors}
        />
      )}
      {family && (
        <ChoiceCards
          legend={event.familyCode === 'OH' ? 'Disease type' : 'Level'}
          items={levels.map((level) => ({
            id: level.code,
            title: `${level.code} — ${level.label}`,
            description: level.description,
            item: level,
          }))}
          selectedId={event.levelCode}
          onSelect={(card) => chooseLevel(card.item)}
          errors={errors}
          field="levelCode"
        />
      )}
      {questionType && (
        <YesNoField
          id="riskQuestion"
          label={RISK_QUESTIONS[questionType].label}
          hint={RISK_QUESTIONS[questionType].hint}
          value={event.riskQuestion ? event.riskQuestion.answer : null}
          onChange={(answer) => update({ riskQuestion: { type: questionType, answer } })}
          errors={errors}
        />
      )}
    </>
  );
}
