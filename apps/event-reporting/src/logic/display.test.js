import { describe, expect, it } from 'vitest';
import { formatRelativeTime, getPillarColorClass, getSeverityDots } from './display.js';

describe('getSeverityDots', () => {
  it('gives 4 dots to level 1 down to 1 dot for levels 4 and 5', () => {
    expect(getSeverityDots('TF1')).toBe(4);
    expect(getSeverityDots('SRE2')).toBe(3);
    expect(getSeverityDots('EvE3')).toBe(2);
    expect(getSeverityDots('TF4')).toBe(1);
    expect(getSeverityDots('EvE5')).toBe(1);
  });

  it('gives no dots to disease types or an empty level', () => {
    expect(getSeverityDots('OH-SKIN')).toBe(0);
    expect(getSeverityDots('')).toBe(0);
  });
});

describe('getPillarColorClass', () => {
  it('maps each pillar code to its color', () => {
    expect(getPillarColorClass('H&S')).toBe('pillar-dot--hs');
    expect(getPillarColorClass('IR')).toBe('pillar-dot--ir');
    expect(getPillarColorClass('unknown')).toBe('');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-10-24T12:00:00');

  it('says how long ago something happened', () => {
    expect(formatRelativeTime('2026-10-24T11:59:40', now)).toBe('just now');
    expect(formatRelativeTime('2026-10-24T11:55:00', now)).toBe('5 min ago');
    expect(formatRelativeTime('2026-10-24T10:00:00', now)).toBe('2h ago');
    expect(formatRelativeTime('2026-10-21T12:00:00', now)).toBe('3d ago');
  });

  it('shows the date for anything older than a month', () => {
    expect(formatRelativeTime('2026-08-02T12:00:00', now)).toBe('2 Aug 2026');
  });
});
