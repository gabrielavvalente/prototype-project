// Record numbers look like EVE-26-0001: family acronym, last two digits of the year, then a
// sequence that restarts at 0001 for each family and year (FR-016).

export function getCounterId(familyCode, year) {
  return `${familyCode}-${String(year).slice(-2)}`;
}

export function formatRecordNumber(familyCode, year, sequence) {
  return `${getCounterId(familyCode, year)}-${String(sequence).padStart(4, '0')}`;
}
