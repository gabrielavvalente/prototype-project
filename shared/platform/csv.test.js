import { describe, expect, it } from 'vitest';
import { parseCsv, toCsv } from './csv.js';

describe('CSV files (review 2026-10-25)', () => {
  it('quotes cells holding a comma, a quote or a line break', () => {
    expect(toCsv([['Code', 'Name'], ['A1', 'Falls, slips'], ['A2', 'Say "stop"']])).toBe(
      'Code,Name\r\nA1,"Falls, slips"\r\nA2,"Say ""stop"""',
    );
  });

  it('reads back what it writes, keyed by header in lower case', () => {
    const text = toCsv([['Code', 'Name', 'Description'], ['A1', 'Falls, slips', 'Line one\nline two']]);
    expect(parseCsv(`﻿${text}\r\n\r\n`)).toEqual([
      { code: 'A1', name: 'Falls, slips', description: 'Line one\nline two' },
    ]);
  });
});
