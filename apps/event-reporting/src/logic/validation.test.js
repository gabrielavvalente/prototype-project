import { describe, expect, it } from 'vitest';
import {
  applySipLevelRule,
  getRequiredLocationLevels,
  getRiskQuestionType,
  validateEventForSubmit,
  validateFile,
  validateImmediateAction,
  validateSection,
} from './validation.js';

const now = new Date(2026, 9, 24, 15, 0); // 24 Oct 2026, 15:00 local time

function makeAction(changes = {}) {
  return {
    id: 'a1',
    description: 'Area closed',
    priority: 'actionPriority-1',
    pillarId: 'pillar-hs',
    completionDate: '2026-10-24',
    comments: '',
    performedByIds: ['user-1'],
    status: 'Completed',
    ...changes,
  };
}

// A complete, valid TF4 event; tests change one thing at a time.
function makeEvent(changes = {}) {
  return {
    pillarId: 'pillar-hs',
    familyCode: 'TF',
    levelCode: 'TF4',
    riskQuestion: { type: 'SIP', answer: false },
    location: {
      departmentId: 'd',
      workshopId: 'w',
      jobId: 'j',
      workstationId: 's',
      taskId: 't',
    },
    taskTypeId: 'taskType-1',
    title: 'Forklift near miss',
    reportDate: '2026-10-24',
    eventTime: '14:00',
    shiftMoment: 'shiftMoment-1',
    description: 'A forklift almost hit a pedestrian.',
    employeeType: 'employeeType-1',
    involvedPersonId: 'user-1',
    involvedPersonName: '',
    involvedActivity: '',
    firstAidTreatmentIds: [],
    firstAidOther: '',
    recurrence: false,
    sharedWithIds: [],
    diseaseIds: [],
    immediateActions: [],
    attachmentIds: [],
    ...changes,
  };
}

function fields(errors) {
  return errors.map((error) => error.field);
}

describe('getRiskQuestionType (FR-004)', () => {
  it('asks SIP for Safety and Environment', () => {
    expect(getRiskQuestionType('TF', 'TF2')).toBe('SIP');
    expect(getRiskQuestionType('EVE', 'EvE5')).toBe('SIP');
  });

  it('asks CRP for SRE1-SRE2 and SRP for SRE3-SRE5', () => {
    expect(getRiskQuestionType('SRE', 'SRE1')).toBe('CRP');
    expect(getRiskQuestionType('SRE', 'SRE2')).toBe('CRP');
    expect(getRiskQuestionType('SRE', 'SRE3')).toBe('SRP');
    expect(getRiskQuestionType('SRE', 'SRE5')).toBe('SRP');
  });

  it('asks nothing for Occupational Health or before a level is chosen', () => {
    expect(getRiskQuestionType('OH', 'OH-SKIN')).toBeNull();
    expect(getRiskQuestionType('SRE', '')).toBeNull();
  });
});

describe('applySipLevelRule (FR-048)', () => {
  it('turns a TF5 with SIP = Yes into a TF4', () => {
    expect(applySipLevelRule('TF5', { type: 'SIP', answer: true })).toEqual({ levelCode: 'TF4', changed: true });
  });

  it('leaves other combinations alone', () => {
    expect(applySipLevelRule('TF5', { type: 'SIP', answer: false })).toEqual({ levelCode: 'TF5', changed: false });
    expect(applySipLevelRule('TF5', { type: 'SIP', answer: null })).toEqual({ levelCode: 'TF5', changed: false });
    expect(applySipLevelRule('TF4', { type: 'SIP', answer: true })).toEqual({ levelCode: 'TF4', changed: false });
  });
});

describe('validateFile (FR-009)', () => {
  it('accepts a small photo or video', () => {
    expect(validateFile({ name: 'spill.JPG', type: 'image/jpeg', size: 1000 }, 0)).toBeNull();
    expect(validateFile({ name: 'clip.mp4', type: 'video/mp4', size: 5 * 1024 * 1024 }, 4)).toBeNull();
  });

  it('rejects other file types and mismatched extensions', () => {
    expect(validateFile({ name: 'setup.exe', type: 'application/x-msdownload', size: 10 }, 0)).toMatch(/photos and videos/);
    expect(validateFile({ name: 'photo.exe', type: 'image/jpeg', size: 10 }, 0)).toMatch(/photos and videos/);
  });

  it('rejects files over 5 MB and a sixth file', () => {
    expect(validateFile({ name: 'big.mp4', type: 'video/mp4', size: 5 * 1024 * 1024 + 1 }, 0)).toMatch(/5 MB/);
    expect(validateFile({ name: 'a.png', type: 'image/png', size: 10 }, 5)).toMatch(/5 files/);
  });
});

describe('validateImmediateAction (FR-011, FR-013)', () => {
  it('accepts a complete action', () => {
    expect(validateImmediateAction(makeAction())).toEqual([]);
  });

  it('requires description and priority, not a category or date (review 2026-10-25)', () => {
    const errors = validateImmediateAction(makeAction({ description: ' ', priority: '', categoryId: '', completionDate: '' }));
    expect(fields(errors)).toEqual(['description', 'priority']);
  });

  it('needs 1 to 5 people who performed it', () => {
    const none = validateImmediateAction(makeAction({ performedByIds: [] }));
    const six = validateImmediateAction(makeAction({ performedByIds: ['1', '2', '3', '4', '5', '6'] }));
    expect(fields(none)).toEqual(['performedByIds']);
    expect(fields(six)).toEqual(['performedByIds']);
  });
});

describe('validateSection', () => {
  const options = { now };

  it('passes a complete event in every section', () => {
    for (const section of ['classification', 'location', 'general', 'details', 'actions']) {
      expect(validateSection(section, makeEvent(), options)).toEqual([]);
    }
  });

  it('requires the risk question answer when it applies (FR-004)', () => {
    const errors = validateSection('classification', makeEvent({ riskQuestion: { type: 'SIP', answer: null } }), options);
    expect(fields(errors)).toEqual(['riskQuestion']);
  });

  it('reports the classification one step at a time', () => {
    const empty = makeEvent({ pillarId: '', familyCode: '', levelCode: '', riskQuestion: null });
    expect(fields(validateSection('classification', empty, options))).toEqual(['pillarId']);
    const noLevel = makeEvent({ levelCode: '', riskQuestion: null });
    expect(fields(validateSection('classification', noLevel, options))).toEqual(['levelCode']);
  });

  it('does not ask a risk question for Occupational Health', () => {
    const event = makeEvent({ pillarId: 'pillar-ih', familyCode: 'OH', levelCode: 'OH-SKIN', riskQuestion: null });
    expect(validateSection('classification', event, options)).toEqual([]);
  });

  it('requires a full location and the task type for TF1-TF3 and other families (FR-005)', () => {
    const event = makeEvent({ levelCode: 'TF2', firstAidTreatmentIds: ['firstAidTreatment-1'], location: { departmentId: 'd', workshopId: 'w' }, taskTypeId: '' });
    expect(fields(validateSection('location', event, options))).toEqual(['location', 'taskTypeId']);
  });

  it('only needs department and workshop for TF4 and TF5, task type optional', () => {
    const areaOnly = makeEvent({ location: { departmentId: 'd', workshopId: 'w' }, taskTypeId: '' });
    expect(validateSection('location', areaOnly, options)).toEqual([]);
    const noWorkshop = makeEvent({ levelCode: 'TF5', location: { departmentId: 'd' }, taskTypeId: '' });
    expect(validateSection('location', noWorkshop, options)[0].message).toMatch(/department and workshop/);
    expect(getRequiredLocationLevels('SRE4')).toHaveLength(5);
  });

  it('checks title length, description length and future time (FR-006)', () => {
    const event = makeEvent({ title: 'x'.repeat(121), description: 'y'.repeat(2001), eventTime: '15:30' });
    expect(fields(validateSection('general', event, options))).toEqual(['title', 'description']);
    expect(fields(validateSection('details', event, options))).toEqual(['eventTime']);
  });

  it('accepts an empty event time (optional)', () => {
    expect(validateSection('details', makeEvent({ eventTime: '' }), options)).toEqual([]);
  });

  it('allows any time on an earlier report date', () => {
    const event = makeEvent({ reportDate: '2026-10-23', eventTime: '23:00' });
    expect(validateSection('details', event, options)).toEqual([]);
  });

  it('does not require a photo or video at any level (FR-008)', () => {
    expect(validateSection('general', makeEvent({ levelCode: 'TF1', firstAidTreatmentIds: ['firstAidTreatment-1'] }), options)).toEqual([]);
  });

  it('asks the person involved according to the employee type (FR-010)', () => {
    const employee = makeEvent({ involvedPersonId: '' });
    expect(fields(validateSection('general', employee, options))).toEqual(['involvedPersonId']);
    const contractor = makeEvent({ employeeType: 'employeeType-3', involvedPersonId: '', involvedPersonName: '' });
    expect(fields(validateSection('general', contractor, options))).toEqual(['involvedPersonName']);
    const named = { ...contractor, involvedPersonName: 'Sam Lee' };
    expect(validateSection('general', named, options)).toEqual([]);
  });

  it('asks the first aid treatment for TF1-TF3 only (FR-047)', () => {
    expect(fields(validateSection('general', makeEvent({ levelCode: 'TF3' }), options))).toEqual(['firstAidTreatmentIds']);
    const two = makeEvent({ levelCode: 'TF3', firstAidTreatmentIds: ['firstAidTreatment-2', 'firstAidTreatment-3'] });
    expect(validateSection('general', two, options)).toEqual([]);
    expect(validateSection('general', makeEvent({ levelCode: 'TF4' }), options)).toEqual([]);
  });

  it('asks to describe the Other first aid treatment (review 2026-10-25)', () => {
    const other = makeEvent({ levelCode: 'TF3', firstAidTreatmentIds: ['firstAidTreatment-9'], firstAidOther: ' ' });
    expect(fields(validateSection('general', other, options))).toEqual(['firstAidOther']);
    expect(validateSection('general', { ...other, firstAidOther: 'Ice pack' }, options)).toEqual([]);
  });

  it('checks event details and OH diseases (FR-010)', () => {
    const event = makeEvent({ employeeType: '', recurrence: null });
    expect(fields(validateSection('general', event, options))).toEqual(['employeeType']);
    expect(fields(validateSection('details', event, options))).toEqual(['recurrence']);
    const oh = makeEvent({ familyCode: 'OH', levelCode: 'OH-SKIN', diseaseIds: [] });
    expect(fields(validateSection('details', oh, options))).toEqual(['diseaseIds']);
  });

  it('does not require an immediate action at any level, but checks the ones added (FR-012)', () => {
    const event = makeEvent({ familyCode: 'SRE', levelCode: 'SRE1', riskQuestion: { type: 'CRP', answer: true } });
    expect(validateSection('actions', event, options)).toEqual([]);
    const incomplete = { ...event, immediateActions: [makeAction({ description: '' })] };
    expect(fields(validateSection('actions', incomplete, options))).toEqual(['immediateActions.0']);
  });
});

describe('validateEventForSubmit (FR-014, FR-015)', () => {
  it('returns nothing for a complete event', () => {
    expect(validateEventForSubmit(makeEvent(), { now })).toEqual([]);
  });

  it('lists missing items with their section, in page order', () => {
    const tf2 = { levelCode: 'TF2', firstAidTreatmentIds: ['firstAidTreatment-1'] };
    const errors = validateEventForSubmit(makeEvent({ ...tf2, taskTypeId: '', title: '' }), { now });
    expect(errors.map((error) => `${error.section}:${error.field}`)).toEqual(['location:taskTypeId', 'general:title']);
  });
});
