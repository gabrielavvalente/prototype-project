import { describe, expect, it } from 'vitest';
import { formatRecordNumber, getCounterId } from './recordNumber.js';

describe('record numbers (FR-016)', () => {
  it('formats family acronym, 2-digit year and a 4-digit sequence', () => {
    expect(formatRecordNumber('EVE', 2026, 1)).toBe('EVE-26-0001');
    expect(formatRecordNumber('TF', 2026, 42)).toBe('TF-26-0042');
    expect(formatRecordNumber('SRE', 2030, 1234)).toBe('SRE-30-1234');
  });

  it('uses one counter per family and year', () => {
    expect(getCounterId('TF', 2026)).toBe('TF-26');
    expect(getCounterId('OH', 2027)).toBe('OH-27');
  });
});
