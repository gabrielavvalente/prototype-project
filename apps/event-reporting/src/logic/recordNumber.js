// Record numbers look like SAF-2026-0042: family, year, then a sequence that
// restarts at 0001 for each family and year (FR-016).

export function getCounterId(familyCode, year) {
  return `${familyCode}-${year}`;
}

export function formatRecordNumber(familyCode, year, sequence) {
  return `${getCounterId(familyCode, year)}-${String(sequence).padStart(4, '0')}`;
}
