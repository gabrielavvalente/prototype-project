// Severity at review and the critical classification (feature 003, second review 2026-10-25).
// The injury matrix comes from the safety event source; the loss matrix (Industrial Risk) is a
// PROVISIONAL placeholder of the same structure until the business provides the real one.

// Score bands of both matrices (safety source).
export const BANDS = [
  { key: 'low', label: 'Low', min: 2, max: 15 },
  { key: 'medium', label: 'Medium', min: 20, max: 30 },
  { key: 'high', label: 'High', min: 50, max: 100 },
];

export const INJURY_MATRIX = {
  impactTitle: 'Impact of the injury',
  durationTitle: 'Duration of the impact (recovery time)',
  impacts: [
    { key: 'severe', label: 'Severe', weight: 5, hint: 'Prevents the person from pursuing most or all of their private and recreational activities' },
    { key: 'significant', label: 'Significant', weight: 3, hint: "Significantly reduces the person's private and recreational activities" },
    { key: 'minor', label: 'Minor', weight: 1, hint: "The impact on the person's life is minimal" },
  ],
  durations: [
    { key: 'minimal', label: 'Minimal', weight: 2, hint: '1 week or less' },
    { key: 'short', label: 'Short term', weight: 5, hint: 'More than 1 week, less than 1 month' },
    { key: 'medium', label: 'Medium term', weight: 10, hint: 'More than 1 month, less than 6 months' },
    { key: 'long', label: 'Long term / Permanent', weight: 20, hint: '6 months or more, or may never fully recover' },
  ],
};

// PROVISIONAL: labels and definitions to be replaced by the Industrial Risk loss matrix.
export const LOSS_MATRIX = {
  impactTitle: 'Impact of the loss',
  durationTitle: 'Duration of the disruption',
  impacts: [
    { key: 'severe', label: 'Major', weight: 5, hint: 'Loss of a production line or major equipment, or harm beyond the site' },
    { key: 'significant', label: 'Significant', weight: 3, hint: 'Equipment damaged and the production of a workshop stopped' },
    { key: 'minor', label: 'Minor', weight: 1, hint: 'Limited damage; production barely affected' },
  ],
  durations: [
    { key: 'minimal', label: 'Minimal', weight: 2, hint: 'Back to normal within a day' },
    { key: 'short', label: 'Short term', weight: 5, hint: 'More than a day, less than a week' },
    { key: 'medium', label: 'Medium term', weight: 10, hint: 'More than a week, less than a month' },
    { key: 'long', label: 'Long term', weight: 20, hint: 'A month or more' },
  ],
};

export function bandOf(score) {
  return BANDS.find((band) => score >= band.min && score <= band.max) ?? null;
}

// cell = { impact, duration } (keys of the matrix); null when not rated yet.
export function rate(matrix, cell) {
  if (!cell) return null;
  const impact = matrix.impacts.find((item) => item.key === cell.impact);
  const duration = matrix.durations.find((item) => item.key === cell.duration);
  const score = impact.weight * duration.weight;
  return { ...cell, score, band: bandOf(score).key };
}

function levelNumber(levelCode) {
  const match = /([1-5])$/.exec(levelCode || '');
  return match ? Number(match[1]) : null;
}

// What the reviewer of a valid event assesses, by pillar (family) and level.
export function assessmentFor(event) {
  const level = levelNumber(event.levelCode);
  if (event.familyCode === 'TF') {
    return {
      matrix: INJURY_MATRIX,
      potential: level !== null && level <= 4,
      actual: level !== null && level <= 3,
      potentialTitle: 'Potential severity',
      actualTitle: 'Actual severity',
      highPotential: 'SIP',
      highActual: 'HCI',
      typeList: 'sipTypeHs',
      requiredListIds: level !== null && level <= 3 ? ['standards', 'hazards', 'bodyParts', 'injuries'] : ['standards', 'hazards'],
    };
  }
  if (event.familyCode === 'EVE') {
    return { sipQuestion: true, typeList: 'sipTypeEnv', requiredListIds: ['aspects', 'impacts'] };
  }
  if (event.familyCode === 'SRE') {
    return {
      matrix: LOSS_MATRIX,
      potential: true,
      actual: level !== null && level <= 3,
      potentialTitle: 'Potential loss',
      actualTitle: 'Actual loss',
      highPotential: 'SPL',
      highActual: 'HCL',
      typeList: 'splType',
      requiredListIds: ['irCategories'],
    };
  }
  return { requiredListIds: [] };
}

// SIP / HCI (safety), SIP (environment), SPL / HCL (industrial risk) from the review's answers.
// review = { potential, actual, sipConfirmed } where potential / actual are rated cells.
export function criticalFlagsOf(event, review) {
  const assessment = assessmentFor(event);
  const flags = [];
  if (assessment.sipQuestion && review.sipConfirmed === true) flags.push('SIP');
  if (assessment.potential && review.potential?.band === 'high') flags.push(assessment.highPotential);
  if (assessment.actual && review.actual?.band === 'high') flags.push(assessment.highActual);
  return flags;
}

// The flag that needs a type (SIP or SPL), or null.
export function typedFlag(event) {
  const assessment = assessmentFor(event);
  return assessment.sipQuestion ? 'SIP' : assessment.highPotential ?? null;
}

// Before review the submission's answer gives a first idea; once reviewed the review decides.
export function criticalLabels(event) {
  if (event.review?.decision === 'valid') return event.review.criticalFlags || [];
  if (event.review?.decision === 'invalid') return [];
  return event.riskQuestion?.type === 'SIP' && event.riskQuestion.answer === true ? ['SIP'] : [];
}
