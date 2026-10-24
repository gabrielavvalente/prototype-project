import { describe, expect, it } from 'vitest';
import {
  getRiskQuestionType,
  isAttachmentRequired,
  isImmediateActionRequired,
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
    categoryId: 'category-1',
    subcategoryId: 'subcategory-1',
    planDetail: '',
    completionDate: '2026-10-24',
    kpiId: '',
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
    riskQuestion: { type: 'HPR', answer: false },
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
    recurrence: false,
    feedbackEmails: [],
    diseaseIds: [],
    immediateActions: [],
    attachmentIds: [],
    ...changes,
  };
}

const subcategories = [
  { id: 'subcategory-1', categoryId: 'category-1' },
  { id: 'subcategory-3', categoryId: 'category-2' },
];

function fields(errors) {
  return errors.map((error) => error.field);
}

describe('getRiskQuestionType (FR-004)', () => {
  it('asks HPR for Safety and Environment', () => {
    expect(getRiskQuestionType('TF', 'TF2')).toBe('HPR');
    expect(getRiskQuestionType('EVE', 'EvE5')).toBe('HPR');
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

describe('mandatory evidence and actions by level (FR-008, FR-012)', () => {
  it('requires an attachment for TF1-TF3 only', () => {
    expect(['TF1', 'TF2', 'TF3'].every(isAttachmentRequired)).toBe(true);
    expect(['TF4', 'TF5', 'SRE1', 'EvE1'].some(isAttachmentRequired)).toBe(false);
  });

  it('requires an immediate action for TF1-TF3 and SRE1-SRE3 only', () => {
    expect(['TF1', 'TF3', 'SRE1', 'SRE3'].every(isImmediateActionRequired)).toBe(true);
    expect(['TF4', 'SRE4', 'EvE1', 'OH-SKIN'].some(isImmediateActionRequired)).toBe(false);
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
    expect(validateImmediateAction(makeAction(), '2026-10-20', '2026-10-24', subcategories)).toEqual([]);
  });

  it('requires description, priority, category and subcategory', () => {
    const errors = validateImmediateAction(
      makeAction({ description: ' ', priority: '', categoryId: '', subcategoryId: '' }),
      '2026-10-20',
      '2026-10-24',
      subcategories,
    );
    expect(fields(errors)).toEqual(['description', 'priority', 'categoryId', 'subcategoryId']);
  });

  it('requires the subcategory to belong to the category', () => {
    const errors = validateImmediateAction(makeAction({ subcategoryId: 'subcategory-3' }), '2026-10-20', '2026-10-24', subcategories);
    expect(fields(errors)).toEqual(['subcategoryId']);
  });

  it('keeps the completion date between the report date and today', () => {
    const future = validateImmediateAction(makeAction({ completionDate: '2026-10-25' }), '2026-10-20', '2026-10-24', subcategories);
    const early = validateImmediateAction(makeAction({ completionDate: '2026-10-19' }), '2026-10-20', '2026-10-24', subcategories);
    expect(fields(future)).toEqual(['completionDate']);
    expect(fields(early)).toEqual(['completionDate']);
  });

  it('needs 1 to 5 people who performed it', () => {
    const none = validateImmediateAction(makeAction({ performedByIds: [] }), '2026-10-20', '2026-10-24', subcategories);
    const six = validateImmediateAction(makeAction({ performedByIds: ['1', '2', '3', '4', '5', '6'] }), '2026-10-20', '2026-10-24', subcategories);
    expect(fields(none)).toEqual(['performedByIds']);
    expect(fields(six)).toEqual(['performedByIds']);
  });
});

describe('validateSection', () => {
  const options = { now, subcategories };

  it('passes a complete event in every section', () => {
    for (const section of ['classification', 'location', 'general', 'details', 'actions']) {
      expect(validateSection(section, makeEvent(), options)).toEqual([]);
    }
  });

  it('requires the risk question answer when it applies (FR-004)', () => {
    const errors = validateSection('classification', makeEvent({ riskQuestion: { type: 'HPR', answer: null } }), options);
    expect(fields(errors)).toEqual(['riskQuestion']);
  });

  it('does not ask a risk question for Occupational Health', () => {
    const event = makeEvent({ pillarId: 'pillar-ih', familyCode: 'OH', levelCode: 'OH-SKIN', riskQuestion: null });
    expect(validateSection('classification', event, options)).toEqual([]);
  });

  it('requires every location level and the task type (FR-005)', () => {
    const event = makeEvent({ location: { departmentId: 'd' }, taskTypeId: '' });
    expect(fields(validateSection('location', event, options))).toEqual([
      'workshopId',
      'jobId',
      'workstationId',
      'taskId',
      'taskTypeId',
    ]);
  });

  it('checks title length, description length and future time (FR-006)', () => {
    const event = makeEvent({ title: 'x'.repeat(121), description: 'y'.repeat(2001), eventTime: '15:30' });
    expect(fields(validateSection('general', event, options))).toEqual(['title', 'eventTime', 'description']);
  });

  it('allows any time on an earlier report date', () => {
    const event = makeEvent({ reportDate: '2026-10-23', eventTime: '23:00' });
    expect(validateSection('general', event, options)).toEqual([]);
  });

  it('requires a photo or video for TF1-TF3 (FR-008)', () => {
    const event = makeEvent({ levelCode: 'TF2' });
    expect(fields(validateSection('general', event, options))).toEqual(['attachments']);
    expect(validateSection('general', event, { ...options, attachmentCount: 1 })).toEqual([]);
  });

  it('checks event details, emails and OH diseases (FR-010)', () => {
    const event = makeEvent({ employeeType: '', recurrence: null, feedbackEmails: ['not-an-email'] });
    expect(fields(validateSection('details', event, options))).toEqual(['employeeType', 'recurrence', 'feedbackEmails']);
    const oh = makeEvent({ familyCode: 'OH', levelCode: 'OH-SKIN', diseaseIds: [] });
    expect(fields(validateSection('details', oh, options))).toEqual(['diseaseIds']);
  });

  it('requires an immediate action for TF1-TF3 and SRE1-SRE3 (FR-012)', () => {
    const event = makeEvent({ familyCode: 'SRE', levelCode: 'SRE2', riskQuestion: { type: 'CRP', answer: true } });
    expect(fields(validateSection('actions', event, options))).toEqual(['immediateActions']);
    const withAction = { ...event, immediateActions: [makeAction()] };
    expect(validateSection('actions', withAction, options)).toEqual([]);
  });
});

describe('validateEventForSubmit (FR-014, FR-015)', () => {
  it('returns nothing for a complete event', () => {
    expect(validateEventForSubmit(makeEvent(), { now, subcategories })).toEqual([]);
  });

  it('lists missing items with their section', () => {
    const errors = validateEventForSubmit(makeEvent({ levelCode: 'TF2', title: '' }), { now, subcategories });
    expect(errors.map((error) => `${error.section}:${error.field}`)).toEqual([
      'general:title',
      'general:attachments',
      'actions:immediateActions',
    ]);
  });
});
