// Severity at review and the critical classification (feature 003, second review 2026-10-25).
// The injury matrix comes from the Severity Level document (006); Environment and Industrial Risk
// answer one Yes / No flag question instead (006 review remarks).

// Score bands of the injury matrix (Severity Level document, 006). The keys stay low / medium / high so
// saved ratings keep their meaning; "high" (Very Critical, 50 or more) raises the critical flags.
export const BANDS = [
  { key: 'low', label: 'Moderate', min: 2, max: 19 },
  { key: 'medium', label: 'Critical', min: 20, max: 49 },
  { key: 'high', label: 'Very Critical', min: 50, max: 100 },
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
    { key: 'minimal', label: 'Minimal', weight: 2, hint: 'Recovery will take 1 week or less' },
    { key: 'short', label: 'Short term', weight: 5, hint: 'Recovery will take between 1 week and 3 months' },
    { key: 'medium', label: 'Medium term', weight: 10, hint: 'Recovery will take more than 3 but less than 6 months' },
    { key: 'long', label: 'Long term / Permanent', weight: 20, hint: 'Recovery will take 6 months or more, or the person may never fully recover' },
  ],
  note: 'Recovery time is the period from the time of injury until the employee returns close to their original health and normal work ability.',
};

// The label of a band key ("Very Critical").
export function bandLabel(key) {
  return BANDS.find((band) => band.key === key)?.label ?? key;
}

// The Yes / No question that flags an Environment or Industrial Risk event (006 review remarks).
const SIP_QUESTION = {
  flag: 'SIP',
  article: 'a',
  title: 'Serious incident potential',
  label: 'Is this event a SIP?',
  hint: 'Serious Incident Potential: could it have caused serious harm under slightly different circumstances?',
};
const HCL_QUESTION = {
  flag: 'HCL',
  article: 'an',
  title: 'High consequence loss',
  label: 'Is this event an HCL?',
  hint: 'High Consequence Loss: a real event with actual consequences — a major loss for the Group.',
};
const SPL_QUESTION = {
  flag: 'SPL',
  article: 'an',
  title: 'Serious potential loss',
  label: 'Is this event an SPL?',
  hint: 'Serious Potential Loss: a near miss or moderate event whose potential severity is a weak signal before a major loss.',
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
    return { flagQuestion: SIP_QUESTION, typeList: 'sipTypeEnv', requiredListIds: ['aspects', 'impacts'] };
  }
  if (event.familyCode === 'SRE') {
    // HCL for SRE1–SRE3, SPL for SRE4–SRE5; neither has a type.
    return { flagQuestion: level !== null && level <= 3 ? HCL_QUESTION : SPL_QUESTION, requiredListIds: ['irCategories'] };
  }
  return { requiredListIds: [] };
}

// SIP / HCI (safety), SIP (environment), HCL or SPL (industrial risk) from the review's answers.
// review = { potential, actual, flagConfirmed } where potential / actual are rated cells.
export function criticalFlagsOf(event, review) {
  const assessment = assessmentFor(event);
  const flags = [];
  if (assessment.flagQuestion && review.flagConfirmed === true) flags.push(assessment.flagQuestion.flag);
  if (assessment.potential && review.potential?.band === 'high') flags.push(assessment.highPotential);
  if (assessment.actual && review.actual?.band === 'high') flags.push(assessment.highActual);
  return flags;
}

// The flag that needs a type (SIP), or null.
export function typedFlag(event) {
  return assessmentFor(event).typeList ? 'SIP' : null;
}

// Only a valid review makes an event critical (red); the reporter's "Could this be a SIP?" answer
// is the reporter's view, shown as information (005 remarks).
export function criticalLabels(event) {
  return event.review?.decision === 'valid' ? event.review.criticalFlags || [] : [];
}
