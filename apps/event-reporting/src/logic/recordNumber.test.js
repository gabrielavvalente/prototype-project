import { describe, expect, it } from 'vitest';
import { formatRecordNumber, getCounterId } from './recordNumber.js';

describe('record numbers (FR-016)', () => {
  it('formats family, year and a 4-digit sequence', () => {
    expect(formatRecordNumber('SAF', 2026, 42)).toBe('SAF-2026-0042');
    expect(formatRecordNumber('OH', 2026, 1)).toBe('OH-2026-0001');
  });

  it('uses one counter per family and year', () => {
    expect(getCounterId('SAF', 2026)).toBe('SAF-2026');
    expect(getCounterId('ENV', 2027)).toBe('ENV-2027');
  });
});
