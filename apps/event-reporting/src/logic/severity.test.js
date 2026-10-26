import { describe, expect, it } from 'vitest';
import { assessmentFor, bandLabel, bandOf, criticalFlagsOf, criticalLabels, INJURY_MATRIX, rate, typedFlag } from './severity.js';

const high = { band: 'high' };
const low = { band: 'low' };

describe('severity matrix (safety source)', () => {
  it('scores Impact × Duration and places the score in its band', () => {
    expect(rate(INJURY_MATRIX, { impact: 'severe', duration: 'medium' })).toMatchObject({ score: 50, band: 'high' });
    expect(rate(INJURY_MATRIX, { impact: 'significant', duration: 'medium' })).toMatchObject({ score: 30, band: 'medium' });
    expect(rate(INJURY_MATRIX, { impact: 'minor', duration: 'minimal' })).toMatchObject({ score: 2, band: 'low' });
    expect(bandOf(15).key).toBe('low');
    expect(bandOf(20).key).toBe('medium');
  });
});

describe('what the reviewer assesses', () => {
  it('asks Potential for TF1–TF4 and Actual for TF1–TF3, nothing for TF5', () => {
    expect(assessmentFor({ familyCode: 'TF', levelCode: 'TF2' })).toMatchObject({ potential: true, actual: true });
    expect(assessmentFor({ familyCode: 'TF', levelCode: 'TF4' })).toMatchObject({ potential: true, actual: false });
    expect(assessmentFor({ familyCode: 'TF', levelCode: 'TF5' })).toMatchObject({ potential: false, actual: false });
  });

  it('requires Body Parts and Injuries for TF1–TF3 only', () => {
    expect(assessmentFor({ familyCode: 'TF', levelCode: 'TF3' }).requiredListIds).toContain('injuries');
    expect(assessmentFor({ familyCode: 'TF', levelCode: 'TF4' }).requiredListIds).toEqual(['standards', 'hazards']);
  });

  it('requires Aspects and Impacts for environment and the Category for industrial risk (third review)', () => {
    expect(assessmentFor({ familyCode: 'EVE', levelCode: 'EvE4' }).requiredListIds).toEqual(['aspects', 'impacts']);
    expect(assessmentFor({ familyCode: 'SRE', levelCode: 'SRE4' }).requiredListIds).toEqual(['irCategories']);
  });

  it('asks HCL for SRE1–SRE3 and SPL for SRE4–SRE5, without a matrix (006 review remarks)', () => {
    expect(['SRE1', 'SRE2', 'SRE3', 'SRE4', 'SRE5'].map((levelCode) => assessmentFor({ familyCode: 'SRE', levelCode }).flagQuestion.label)).toEqual([
      'Is this event an HCL?',
      'Is this event an HCL?',
      'Is this event an HCL?',
      'Is this event an SPL?',
      'Is this event an SPL?',
    ]);
    expect(assessmentFor({ familyCode: 'SRE', levelCode: 'SRE3' })).not.toHaveProperty('matrix');
  });
});

describe('critical classification', () => {
  it('gives SIP / HCI for safety, SIP for environment and HCL or SPL for industrial risk', () => {
    expect(criticalFlagsOf({ familyCode: 'TF', levelCode: 'TF1' }, { potential: high, actual: high })).toEqual(['SIP', 'HCI']);
    expect(criticalFlagsOf({ familyCode: 'TF', levelCode: 'TF4' }, { potential: low, actual: high })).toEqual([]);
    expect(criticalFlagsOf({ familyCode: 'EVE', levelCode: 'EvE3' }, { flagConfirmed: true })).toEqual(['SIP']);
    expect(criticalFlagsOf({ familyCode: 'SRE', levelCode: 'SRE2' }, { flagConfirmed: true })).toEqual(['HCL']);
    expect(criticalFlagsOf({ familyCode: 'SRE', levelCode: 'SRE4' }, { flagConfirmed: true })).toEqual(['SPL']);
    expect(criticalFlagsOf({ familyCode: 'SRE', levelCode: 'SRE4' }, { flagConfirmed: false })).toEqual([]);
  });

  it('asks a type for SIP only', () => {
    expect(typedFlag({ familyCode: 'TF', levelCode: 'TF2' })).toBe('SIP');
    expect(typedFlag({ familyCode: 'EVE', levelCode: 'EvE3' })).toBe('SIP');
    expect(typedFlag({ familyCode: 'SRE', levelCode: 'SRE2' })).toBeNull();
  });

  it('is critical only from a valid review, never from the submission answer', () => {
    const answeredSip = { riskQuestion: { type: 'SIP', answer: true } };
    expect(criticalLabels(answeredSip)).toEqual([]);
    expect(criticalLabels({ ...answeredSip, review: { decision: 'valid', criticalFlags: ['SIP'] } })).toEqual(['SIP']);
    expect(criticalLabels({ ...answeredSip, review: { decision: 'valid', criticalFlags: [] } })).toEqual([]);
    expect(criticalLabels({ ...answeredSip, review: { decision: 'invalid' } })).toEqual([]);
  });

  it('names the bands Moderate, Critical and Very Critical (006)', () => {
    expect([2, 19, 20, 30, 49, 50, 100].map((score) => bandLabel(bandOf(score).key))).toEqual([
      'Moderate',
      'Moderate',
      'Critical',
      'Critical',
      'Critical',
      'Very Critical',
      'Very Critical',
    ]);
    expect(INJURY_MATRIX.durations.find((item) => item.key === 'short').hint).toBe('Recovery will take between 1 week and 3 months');
  });
});
