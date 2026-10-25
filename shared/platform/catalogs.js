// Initial global master data catalogs (spec FR-014), from the source specs in
// specs/001-event-reporting/source/Control Panel/. Every value is owned by Central and Active.
// Standards have no code in the source; STD-01… are given here because the spec requires codes.
// Shared code: imports no packages and nothing from apps/ (constitution v2.3.0).

const CREATED_AT = '2026-10-01T09:00:00.000Z';

function value(listId, index, fields) {
  return {
    id: `${listId}-${index + 1}`,
    listId,
    code: '',
    description: '',
    parentId: '',
    ownerLevel: 'central',
    ownerPlantIds: [],
    status: 'Active',
    createdBy: 'system',
    createdAt: CREATED_AT,
    updatedBy: 'system',
    updatedAt: CREATED_AT,
    ...fields,
  };
}

const standards = [
  'Confined Space Entry',
  'Construction Project Safety',
  'Control of Hazardous Energy (LOTO)',
  'Health & Safety Risk Assessment & Control',
  'Lifting Operations',
  'Machinery Safety',
  'Management of Contractors',
  'Management of Work Related Road Risks',
  'Permit to Work',
  'Rules for the Classification & Reporting of Safety Events',
  'Warehousing, Loading & Unloading',
  'Work at Height',
  'Workplace Vehicles',
  'Others',
].map((name, index) => value('standards', index, { code: `STD-${String(index + 1).padStart(2, '0')}`, name }));

// "A1 - Manual handling of loads" → code A1, name "Manual handling of loads".
function coded(listId, lines) {
  return lines.map((line, index) => {
    const [code, ...rest] = line.split(' - ');
    return value(listId, index, { code, name: rest.join(' - ') });
  });
}

const hazards = coded('hazards', [
  'A1 - Manual handling of loads',
  'A2 - Awkward position',
  'A3 - Repetitive work',
  'A4 - Night work',
  'A5 - Successive team shifts',
  'A6 - Isolated work',
  'A7 - Stress related to work',
  'B1 - Toxic agents (Safety aspects)',
  'B2 - Biological and bacteriological agents',
  'C1 - Vibrations',
  'C2 - Noise',
  'C3 - Temperature',
  'C4 - Light',
  'C5 - Radiation',
  'C6 - Working environment',
  'C7 - Atmospheric pressure',
  'D1 - Falls on the same level',
  'D2 - Falls from a height',
  'D3 - Falling objects',
  'E1 - Electricity',
  'E2 - Fire, explosion (Material or substance which can generate...)',
  'F1 - Shearing, cutting (Equipment or product which can generate...)',
  'F2 - Pinched, crushed by (Equipment or product which can generate...)',
  'F3 - Lifting by, rolling by, moving by (Equipment which can generate...)',
  'F4 - Struck (Moving area, equipment or product which can generate...)',
  'F5 - Perforation or shot/sting (Equipment or product which can generate...)',
  'F6 - Rubbing or abrasion (Equipment or product which can generate...)',
  'F7 - Ejection, objects shatter (Equipment or product which can generate...)',
  'F8 - Burn, heating (Equipment or product which can generate...)',
  'G1 - Internal transportation - on-site',
  'G2 - External transportation - off organization site',
  'H1 - Physical attack',
  'H2 - Natural risks',
  'H3 - Animals',
  'H4 - Technological risks',
  'I1 - Other hazards',
]);

const bodyPartsByCategory = {
  Head: ['Cranium', 'Ear', 'Eyes', 'Nose', 'Teeth, Gingiva', 'Face (Other)', 'Cervical spine', 'Neck'],
  'Torso, organs and back': ['Back and spine', 'Abdomen', 'Pelvis'],
  'Thoracic cavity': ['Thorax'],
  'Upper limbs': [
    'Whole upper limb',
    'Shoulder',
    'Arm (Left)',
    'Arm (Right)',
    'Elbow',
    'Forearm (Left)',
    'Forearm (Right)',
    'Wrist',
  ],
  'Hands and Fingers': [
    'Hand, Palmar and dorsal side (Left)',
    'Hand, Palmar and dorsal side (Right)',
    'Fingers',
  ],
  'Lower limbs': [
    'Whole lower limb',
    'Hip',
    'Thigh (Left)',
    'Thigh (Right)',
    'Knee (Left)',
    'Knee (Right)',
    'Leg (Left)',
    'Leg (Right)',
    'Ankle (Left)',
    'Ankle (Right)',
  ],
  'Foot(s) and toe(s)': ['Foot (Left)', 'Foot (Right)', 'Toe(s)'],
  General: ['General'],
};

const bodyPartCategories = Object.keys(bodyPartsByCategory).map((name, index) =>
  value('bodyPartCategories', index, { name }),
);

const bodyParts = bodyPartCategories
  .flatMap((category) => bodyPartsByCategory[category.name].map((name) => ({ name, parentId: category.id })))
  .map((fields, index) => value('bodyParts', index, fields));

const injuries = [
  'Burn (1°/2° degree)',
  'Burn (3°/4° degree)',
  'Contusion, ecchymosis',
  'Dermatosis (skin infection)',
  'Fracture',
  'Bruise',
  'Cephalalgia',
  'Pain, sensory trouble',
  'Sting, bite',
  'Foreign matters presence',
  'Bleeding',
  'Tinnitus (buzzing)',
  'Hearing Loss',
  'Damage to the cornea',
  'Conjunctival irritation',
  'Temporary loss of sight',
  'Permanent loss of sight',
  'Amputation',
  'Paralysis',
  'Fracture with paralysis',
  'Pain (cervicalgia)',
  'Muscular tear or sprain',
  'Pain (back, lumbago)',
  'Hernia',
  'Internal Injuries (liver, spleen, kidney)',
  'Inguinal hernia',
  'Internal Injuries (urinary, genital)',
  'Inhalation, foreign body',
  'Dislocation',
  'Avulsion',
  'Drowning',
  'Malaise, dizziness, loss of consciousness',
  'Asphyxia, breathing difficulty',
  'Intoxication',
  'Heat stroke',
  'Electrical shock',
  'Allergic shock',
  'Other',
].map((name, index) => value('injuries', index, { name }));

const aspects = [
  ['Water withdrawal/consumption', 'Process water, cooling water, domestic water, and leaks.'],
  ['Energy consumption', 'Use of electricity, natural gas, diesel, steam, coal, etc.'],
  ['Water discharge', 'Release of trade effluents, sanitary wastewater, rainwater runoff.'],
  ['Raw material consumption', 'Sand, gypsum, paper, chemicals, packaging, additives.'],
  ['Waste / Other Production Residue generation', 'Scrap materials, chemical wastes, office sorting, packaging residues.'],
  ['Spill, leak', 'Accidental releases of oils, chemicals, solvents, wastewater on ground or into water.'],
  ['Land use & visual integration', 'Site footprint, landscape integration, biodiversity zoning.'],
  ['Air emissions', 'Channelled or diffuse emissions of dust, SOx, NOx, CO, VOCs.'],
  ['Biodiversity', 'Impact on local plant/animal habitats.'],
  ['Noise', 'Sound emissions from fans, chimneys, shipping, grinding, production lines.'],
  ['Smell / odour', 'Sensory nuisances from processing or biological waste digestion.'],
  ['Vibrations', 'Secondary mechanical impacts on surrounding soils or properties.'],
  ['Light', 'Nighttime operation lighting affecting neighbors or fauna.'],
  ['Related to transport', 'Deliveries, shipping of goods, employee commuting.'],
  ['Related to the end of life', 'Reusability or final disposal of products.'],
].map(([name, description], index) => value('aspects', index, { name, description }));

const impacts = [
  'Non hazardous waste',
  'Hazardous waste',
  'Water pollution',
  'Depletion of water resources',
  'Depletion of Energy resources',
  'Nuisance (visual, odour, noise, etc.)',
  'Air pollution / climate change',
  'Impact of transport',
  'Impact of the end of life of the product',
  'Resource depletion (raw material)',
  'Resource / utility inefficiency',
  'Biodiversity',
  'Soil / land pollution',
].map((name, index) => value('impacts', index, { name }));

const irCategories = coded('irCategories', [
  'IRC1 - Fire',
  'IRC2 - Explosion',
  'IRC3 - Machinery breakdown / critical equipment failure',
  'IRC4 - Structural failure or collapse',
  'IRC5 - Loss of utilities (power, gas, water, steam, compressed air, IT/OT)',
  'IRC6 - Hazardous material release / uncontrolled reaction',
  'IRC7 - Natural hazard (flood, storm, earthquake, lightning, snow load, extreme temperature)',
  'IRC8 - Business interruption / supply chain disruption',
  'IRC9 - Logistics and internal/external transport incident',
  'IRC10 - Security event (intrusion, theft, sabotage, malicious act)',
  'IRC11 - Other industrial risk',
]);

export const masterValues = [
  ...standards,
  ...hazards,
  ...bodyPartCategories,
  ...bodyParts,
  ...injuries,
  ...aspects,
  ...impacts,
  ...irCategories,
];
